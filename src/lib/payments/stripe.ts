/**
 * Stripe Payment Service
 *
 * Handles all Stripe API interactions including payment intents,
 * refunds, and webhook signature verification.
 *
 * This service is the single point of contact with Stripe and should
 * be used by all payment-related actions.
 */

import Stripe from 'stripe'
import { PaymentError } from '@/lib/errors/domain-errors'
import type {
  CreatePaymentIntentInput,
  PaymentIntentResult,
  RefundInput,
  RefundResult,
  CheckoutSessionInput,
  CheckoutSessionResult,
  toSmallestUnit,
} from './types'

// ============================================
// STRIPE CLIENT SINGLETON
// ============================================

let stripeClient: Stripe | null = null

function getStripeClient(): Stripe {
  if (!stripeClient) {
    const secretKey = process.env.STRIPE_SECRET_KEY
    if (!secretKey) {
      throw new PaymentError(
        'PAYMENT_CONFIGURATION_ERROR',
        'Stripe secret key is not configured',
        500
      )
    }
    stripeClient = new Stripe(secretKey, {
      apiVersion: '2024-06-20',
      typescript: true,
    })
  }
  return stripeClient
}

// ============================================
// PAYMENT INTENTS
// ============================================

/**
 * Creates a Stripe PaymentIntent for an order.
 * Returns client secret for frontend to complete payment.
 */
export async function createPaymentIntent(
  input: CreatePaymentIntentInput
): Promise<PaymentIntentResult> {
  const stripe = getStripeClient()

  try {
    const paymentIntent = await stripe.paymentIntents.create(
      {
        amount: input.amount, // Already in smallest unit (Rappen)
        currency: input.currency,
        receipt_email: input.customerEmail,
        metadata: {
          salon_id: input.salonId,
          order_id: input.orderId,
          customer_id: input.customerId || '',
          ...input.metadata,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      },
      {
        idempotencyKey: input.idempotencyKey,
      }
    )

    return {
      paymentIntentId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret!,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
      currency: paymentIntent.currency,
    }
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new PaymentError(
        'PAYMENT_INTENT_CREATION_FAILED',
        `Failed to create payment: ${error.message}`,
        400
      )
    }
    throw error
  }
}

/**
 * Retrieves a PaymentIntent by ID.
 */
export async function getPaymentIntent(paymentIntentId: string): Promise<Stripe.PaymentIntent> {
  const stripe = getStripeClient()

  try {
    return await stripe.paymentIntents.retrieve(paymentIntentId)
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new PaymentError(
        'PAYMENT_INTENT_NOT_FOUND',
        `Payment not found: ${error.message}`,
        404
      )
    }
    throw error
  }
}

/**
 * Cancels a PaymentIntent (only if not yet succeeded).
 */
export async function cancelPaymentIntent(paymentIntentId: string): Promise<void> {
  const stripe = getStripeClient()

  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    if (paymentIntent.status === 'succeeded') {
      throw new PaymentError(
        'PAYMENT_ALREADY_CAPTURED',
        'Cannot cancel a payment that has already succeeded. Use refund instead.',
        409
      )
    }

    if (paymentIntent.status === 'canceled') {
      return // Already canceled, no action needed
    }

    await stripe.paymentIntents.cancel(paymentIntentId)
  } catch (error: unknown) {
    if (error instanceof PaymentError) throw error
    if (error instanceof Stripe.errors.StripeError) {
      throw new PaymentError(
        'PAYMENT_CANCELLATION_FAILED',
        `Failed to cancel payment: ${error.message}`,
        400
      )
    }
    throw error
  }
}

// ============================================
// REFUNDS
// ============================================

/**
 * Creates a refund for a payment.
 * Can be full or partial refund.
 */
export async function createRefund(input: RefundInput): Promise<RefundResult> {
  const stripe = getStripeClient()

  try {
    // First, get the payment intent to find the charge
    const paymentIntent = await stripe.paymentIntents.retrieve(input.paymentId)

    if (paymentIntent.status !== 'succeeded') {
      return {
        success: false,
        error: 'Payment has not succeeded yet. Cannot refund.',
      }
    }

    const chargeId = paymentIntent.latest_charge as string
    if (!chargeId) {
      return {
        success: false,
        error: 'No charge found for this payment.',
      }
    }

    const refundParams: Stripe.RefundCreateParams = {
      charge: chargeId,
      reason: input.reason,
      metadata: {
        salon_id: input.salonId,
        original_payment_intent: input.paymentId,
      },
    }

    if (input.amount) {
      refundParams.amount = input.amount
    }

    const refund = await stripe.refunds.create(refundParams)

    return {
      success: true,
      refundId: refund.id,
      amount: refund.amount,
    }
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      return {
        success: false,
        error: `Refund failed: ${error.message}`,
      }
    }
    throw error
  }
}

// ============================================
// WEBHOOK VERIFICATION
// ============================================

/**
 * Verifies a Stripe webhook signature.
 * Returns the parsed event if valid.
 */
export function verifyWebhookSignature(
  payload: string | Buffer,
  signature: string
): Stripe.Event {
  const stripe = getStripeClient()
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET

  if (!webhookSecret) {
    throw new PaymentError(
      'PAYMENT_WEBHOOK_CONFIGURATION_ERROR',
      'Webhook secret is not configured',
      500
    )
  }

  try {
    return stripe.webhooks.constructEvent(payload, signature, webhookSecret)
  } catch (error) {
    if (error instanceof Stripe.errors.StripeSignatureVerificationError) {
      throw new PaymentError(
        'PAYMENT_WEBHOOK_INVALID',
        'Invalid webhook signature',
        400
      )
    }
    throw error
  }
}

// ============================================
// CHECKOUT SESSIONS (Alternative to PaymentIntents)
// ============================================

/**
 * Creates a Stripe Checkout Session for hosted checkout.
 * Use this for a simpler checkout flow where Stripe handles the UI.
 */
export async function createCheckoutSession(
  input: CheckoutSessionInput
): Promise<CheckoutSessionResult> {
  const stripe = getStripeClient()

  try {
    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      customer_email: input.customerEmail,
      line_items: input.lineItems.map((item) => ({
        price_data: {
          currency: 'chf',
          product_data: {
            name: item.name,
          },
          unit_amount: item.unitPrice, // Already in smallest unit
        },
        quantity: item.quantity,
      })),
      success_url: input.successUrl,
      cancel_url: input.cancelUrl,
      metadata: {
        salon_id: input.salonId,
        order_id: input.orderId,
        ...input.metadata,
      },
    })

    return {
      sessionId: session.id,
      url: session.url!,
    }
  } catch (error: unknown) {
    if (error instanceof Stripe.errors.StripeError) {
      throw new PaymentError(
        'CHECKOUT_SESSION_CREATION_FAILED',
        `Failed to create checkout session: ${error.message}`,
        400
      )
    }
    throw error
  }
}

// ============================================
// CUSTOMER MANAGEMENT (Optional)
// ============================================

/**
 * Creates or retrieves a Stripe Customer.
 * Useful for storing payment methods for returning customers.
 */
export async function getOrCreateStripeCustomer(
  email: string,
  name: string,
  metadata?: Record<string, string>
): Promise<string> {
  const stripe = getStripeClient()

  // Try to find existing customer
  const existingCustomers = await stripe.customers.list({
    email,
    limit: 1,
  })

  if (existingCustomers.data.length > 0) {
    return existingCustomers.data[0].id
  }

  // Create new customer
  const customer = await stripe.customers.create({
    email,
    name,
    metadata,
  })

  return customer.id
}

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Maps Stripe payment intent status to our internal PaymentStatus.
 */
export function mapStripeStatusToPaymentStatus(
  stripeStatus: Stripe.PaymentIntent.Status
): 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled' {
  const statusMap: Record<string, 'pending' | 'authorized' | 'captured' | 'failed' | 'cancelled'> =
    {
      requires_payment_method: 'pending',
      requires_confirmation: 'pending',
      requires_action: 'pending',
      processing: 'pending',
      requires_capture: 'authorized',
      succeeded: 'captured',
      canceled: 'cancelled',
    }

  return statusMap[stripeStatus] || 'pending'
}

/**
 * Checks if Stripe is properly configured.
 */
export function isStripeConfigured(): boolean {
  return !!(process.env.STRIPE_SECRET_KEY && process.env.STRIPE_WEBHOOK_SECRET)
}
