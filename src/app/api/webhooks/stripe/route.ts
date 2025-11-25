/**
 * Stripe Webhook Handler
 *
 * Processes Stripe webhook events for payments.
 * Handles: payment_intent.succeeded, payment_intent.payment_failed,
 * charge.refunded, charge.dispute.created
 *
 * CRITICAL: This endpoint must:
 * 1. Verify webhook signature
 * 2. Be idempotent (handle duplicate events)
 * 3. Process within 30 seconds (Stripe timeout)
 */

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@/lib/supabase/server'
import { verifyWebhookSignature, mapStripeStatusToPaymentStatus } from '@/lib/payments'
import { PaymentError } from '@/lib/errors/domain-errors'
import { logger } from '@/lib/logging'

// Disable body parsing - we need raw body for signature verification
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Get raw body for signature verification
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')

    if (!signature) {
      logger.warn('Stripe webhook received without signature')
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      )
    }

    // Verify webhook signature
    let event: Stripe.Event
    try {
      event = verifyWebhookSignature(body, signature)
    } catch (error) {
      if (error instanceof PaymentError) {
        logger.warn('Stripe webhook signature verification failed', {
          error: error.message,
        })
        return NextResponse.json({ error: error.message }, { status: 400 })
      }
      throw error
    }

    const supabase = await createClient()

    // Check if event was already processed (idempotency)
    const { data: existingEvent } = await supabase
      .from('stripe_event_log')
      .select('id')
      .eq('stripe_event_id', event.id)
      .single()

    if (existingEvent) {
      logger.info('Stripe webhook event already processed', {
        eventId: event.id,
        eventType: event.type,
      })
      return NextResponse.json({
        received: true,
        status: 'already_processed',
      })
    }

    // Log the event before processing
    const { error: logError } = await supabase.from('stripe_event_log').insert({
      stripe_event_id: event.id,
      event_type: event.type,
      payload: event as unknown as Record<string, unknown>,
    })

    if (logError) {
      logger.error('Failed to log Stripe event', {
        eventId: event.id,
        error: logError.message,
      })
      // Continue processing even if logging fails
    }

    // Process the event
    const result = await processStripeEvent(event, supabase)

    const duration = Date.now() - startTime
    logger.info('Stripe webhook processed', {
      eventId: event.id,
      eventType: event.type,
      duration,
      result,
    })

    return NextResponse.json({
      received: true,
      status: 'processed',
      eventId: event.id,
    })
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error('Stripe webhook error', {
      error: error instanceof Error ? error.message : 'Unknown error',
      duration,
    })

    // Return 200 to prevent Stripe from retrying for errors we can't fix
    // Log for manual investigation
    return NextResponse.json(
      {
        received: true,
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 200 }
    )
  }
}

/**
 * Process a Stripe event based on its type.
 */
async function processStripeEvent(
  event: Stripe.Event,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ processed: boolean; action?: string }> {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return handlePaymentIntentSucceeded(
        event.data.object as Stripe.PaymentIntent,
        supabase
      )

    case 'payment_intent.payment_failed':
      return handlePaymentIntentFailed(
        event.data.object as Stripe.PaymentIntent,
        supabase
      )

    case 'payment_intent.canceled':
      return handlePaymentIntentCanceled(
        event.data.object as Stripe.PaymentIntent,
        supabase
      )

    case 'charge.refunded':
      return handleChargeRefunded(event.data.object as Stripe.Charge, supabase)

    case 'charge.dispute.created':
      return handleDisputeCreated(event.data.object as Stripe.Dispute, supabase)

    case 'charge.dispute.closed':
      return handleDisputeClosed(event.data.object as Stripe.Dispute, supabase)

    default:
      logger.info('Unhandled Stripe event type', { eventType: event.type })
      return { processed: false, action: 'unhandled_event_type' }
  }
}

/**
 * Handle successful payment - mark order as paid
 */
async function handlePaymentIntentSucceeded(
  paymentIntent: Stripe.PaymentIntent,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ processed: boolean; action?: string }> {
  const orderId = paymentIntent.metadata.order_id
  const salonId = paymentIntent.metadata.salon_id

  if (!orderId || !salonId) {
    logger.warn('Payment intent missing order_id or salon_id in metadata', {
      paymentIntentId: paymentIntent.id,
    })
    return { processed: false, action: 'missing_metadata' }
  }

  // Start transaction - update order and create payment record
  // Note: Supabase doesn't support true transactions via JS client,
  // so we do this in a specific order with checks

  // 1. Get current order state
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .select('id, status, payment_status')
    .eq('id', orderId)
    .eq('salon_id', salonId)
    .single()

  if (orderError || !order) {
    logger.error('Order not found for payment', {
      orderId,
      salonId,
      paymentIntentId: paymentIntent.id,
    })
    return { processed: false, action: 'order_not_found' }
  }

  // Check if already processed
  if (order.payment_status === 'paid') {
    logger.info('Order already marked as paid', { orderId })
    return { processed: true, action: 'already_paid' }
  }

  // 2. Update order status
  const { error: updateError } = await supabase
    .from('orders')
    .update({
      status: 'paid',
      payment_status: 'paid',
      stripe_payment_intent_id: paymentIntent.id,
      paid_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('salon_id', salonId)

  if (updateError) {
    logger.error('Failed to update order payment status', {
      orderId,
      error: updateError.message,
    })
    return { processed: false, action: 'update_failed' }
  }

  // 3. Create payment record
  const { error: paymentError } = await supabase.from('payments').insert({
    salon_id: salonId,
    order_id: orderId,
    customer_id: paymentIntent.metadata.customer_id || null,
    amount: paymentIntent.amount / 100, // Convert from cents
    currency: paymentIntent.currency.toUpperCase(),
    method: 'stripe_card',
    status: 'captured',
    stripe_payment_intent_id: paymentIntent.id,
    stripe_charge_id: paymentIntent.latest_charge as string,
  })

  if (paymentError) {
    logger.error('Failed to create payment record', {
      orderId,
      error: paymentError.message,
    })
    // Order is already marked paid, log but don't fail
  }

  // 4. Create payment event
  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntent.id)
    .single()

  if (payment) {
    await supabase.from('payment_events').insert({
      payment_id: payment.id,
      event_type: 'captured',
      amount_delta: paymentIntent.amount / 100,
      external_reference: paymentIntent.id,
    })
  }

  // 5. Reduce stock for order items
  await reduceStockForOrder(orderId, salonId, supabase)

  logger.info('Payment succeeded - order marked as paid', {
    orderId,
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.amount / 100,
  })

  return { processed: true, action: 'order_paid' }
}

/**
 * Handle failed payment
 */
async function handlePaymentIntentFailed(
  paymentIntent: Stripe.PaymentIntent,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ processed: boolean; action?: string }> {
  const orderId = paymentIntent.metadata.order_id
  const salonId = paymentIntent.metadata.salon_id

  if (!orderId || !salonId) {
    return { processed: false, action: 'missing_metadata' }
  }

  // Update order with failure info
  const { error } = await supabase
    .from('orders')
    .update({
      payment_status: 'failed',
      payment_failure_reason:
        paymentIntent.last_payment_error?.message || 'Payment failed',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('salon_id', salonId)

  if (error) {
    logger.error('Failed to update order with payment failure', {
      orderId,
      error: error.message,
    })
  }

  logger.info('Payment failed for order', {
    orderId,
    paymentIntentId: paymentIntent.id,
    errorMessage: paymentIntent.last_payment_error?.message,
  })

  return { processed: true, action: 'payment_failed_recorded' }
}

/**
 * Handle canceled payment
 */
async function handlePaymentIntentCanceled(
  paymentIntent: Stripe.PaymentIntent,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ processed: boolean; action?: string }> {
  const orderId = paymentIntent.metadata.order_id
  const salonId = paymentIntent.metadata.salon_id

  if (!orderId || !salonId) {
    return { processed: false, action: 'missing_metadata' }
  }

  await supabase
    .from('orders')
    .update({
      payment_status: 'cancelled',
      updated_at: new Date().toISOString(),
    })
    .eq('id', orderId)
    .eq('salon_id', salonId)

  return { processed: true, action: 'payment_cancelled' }
}

/**
 * Handle refund
 */
async function handleChargeRefunded(
  charge: Stripe.Charge,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ processed: boolean; action?: string }> {
  const paymentIntentId = charge.payment_intent as string

  if (!paymentIntentId) {
    return { processed: false, action: 'no_payment_intent' }
  }

  // Find the payment record
  const { data: payment } = await supabase
    .from('payments')
    .select('id, order_id, salon_id, amount')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!payment) {
    logger.warn('Payment not found for refund', { paymentIntentId })
    return { processed: false, action: 'payment_not_found' }
  }

  const refundedAmount = charge.amount_refunded / 100
  const isFullRefund = refundedAmount >= payment.amount

  // Update payment status
  await supabase
    .from('payments')
    .update({
      status: isFullRefund ? 'refunded' : 'partially_refunded',
      updated_at: new Date().toISOString(),
    })
    .eq('id', payment.id)

  // Create payment event
  await supabase.from('payment_events').insert({
    payment_id: payment.id,
    event_type: isFullRefund ? 'refunded' : 'partially_refunded',
    amount_delta: -refundedAmount,
    external_reference: charge.id,
  })

  // Update order status if full refund
  if (isFullRefund && payment.order_id) {
    await supabase
      .from('orders')
      .update({
        status: 'refunded',
        payment_status: 'refunded',
        updated_at: new Date().toISOString(),
      })
      .eq('id', payment.order_id)

    // Restore stock
    await restoreStockForOrder(payment.order_id, payment.salon_id, supabase)
  }

  logger.info('Refund processed', {
    paymentId: payment.id,
    orderId: payment.order_id,
    refundedAmount,
    isFullRefund,
  })

  return { processed: true, action: isFullRefund ? 'full_refund' : 'partial_refund' }
}

/**
 * Handle dispute created (chargeback)
 */
async function handleDisputeCreated(
  dispute: Stripe.Dispute,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ processed: boolean; action?: string }> {
  const paymentIntentId = dispute.payment_intent as string

  const { data: payment } = await supabase
    .from('payments')
    .select('id, order_id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!payment) {
    return { processed: false, action: 'payment_not_found' }
  }

  await supabase.from('payment_events').insert({
    payment_id: payment.id,
    event_type: 'dispute_opened',
    amount_delta: -(dispute.amount / 100),
    external_reference: dispute.id,
    raw_payload: {
      reason: dispute.reason,
      status: dispute.status,
    },
  })

  logger.warn('Dispute/chargeback created', {
    paymentId: payment.id,
    disputeId: dispute.id,
    reason: dispute.reason,
    amount: dispute.amount / 100,
  })

  return { processed: true, action: 'dispute_recorded' }
}

/**
 * Handle dispute closed
 */
async function handleDisputeClosed(
  dispute: Stripe.Dispute,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ processed: boolean; action?: string }> {
  const paymentIntentId = dispute.payment_intent as string

  const { data: payment } = await supabase
    .from('payments')
    .select('id')
    .eq('stripe_payment_intent_id', paymentIntentId)
    .single()

  if (!payment) {
    return { processed: false, action: 'payment_not_found' }
  }

  const eventType = dispute.status === 'won' ? 'dispute_won' : 'dispute_lost'

  await supabase.from('payment_events').insert({
    payment_id: payment.id,
    event_type: eventType,
    amount_delta: dispute.status === 'won' ? dispute.amount / 100 : 0,
    external_reference: dispute.id,
  })

  logger.info('Dispute closed', {
    paymentId: payment.id,
    disputeId: dispute.id,
    status: dispute.status,
  })

  return { processed: true, action: `dispute_${dispute.status}` }
}

/**
 * Reduce stock for all items in an order
 */
async function reduceStockForOrder(
  orderId: string,
  salonId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
  // Get order items
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId)

  if (!orderItems || orderItems.length === 0) return

  for (const item of orderItems) {
    // Get inventory item
    const { data: inventory } = await supabase
      .from('inventory_items')
      .select('id, current_stock')
      .eq('product_id', item.product_id)
      .eq('salon_id', salonId)
      .single()

    if (!inventory) continue

    const newStock = Math.max(0, inventory.current_stock - item.quantity)

    // Update stock
    await supabase
      .from('inventory_items')
      .update({ current_stock: newStock, updated_at: new Date().toISOString() })
      .eq('id', inventory.id)

    // Create stock movement record
    await supabase.from('stock_movements').insert({
      inventory_item_id: inventory.id,
      movement_type: 'sale',
      quantity_delta: -item.quantity,
      reference_type: 'order',
      reference_id: orderId,
    })
  }
}

/**
 * Restore stock for all items in an order (on refund/cancel)
 */
async function restoreStockForOrder(
  orderId: string,
  salonId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<void> {
  const { data: orderItems } = await supabase
    .from('order_items')
    .select('product_id, quantity')
    .eq('order_id', orderId)

  if (!orderItems || orderItems.length === 0) return

  for (const item of orderItems) {
    const { data: inventory } = await supabase
      .from('inventory_items')
      .select('id, current_stock')
      .eq('product_id', item.product_id)
      .eq('salon_id', salonId)
      .single()

    if (!inventory) continue

    await supabase
      .from('inventory_items')
      .update({
        current_stock: inventory.current_stock + item.quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventory.id)

    await supabase.from('stock_movements').insert({
      inventory_item_id: inventory.id,
      movement_type: 'return',
      quantity_delta: item.quantity,
      reference_type: 'order_refund',
      reference_id: orderId,
    })
  }
}
