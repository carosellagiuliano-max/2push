/**
 * Payment Types
 *
 * Type definitions for the payment system including Stripe integration,
 * order payments, and payment events.
 */

import type { PaymentMethod, PaymentStatus, OrderStatus } from '@/lib/database.types'

// ============================================
// PAYMENT INTENT TYPES
// ============================================

export interface CreatePaymentIntentInput {
  salonId: string
  orderId: string
  amount: number // in smallest currency unit (Rappen for CHF)
  currency: string // e.g., 'chf'
  customerId?: string
  customerEmail: string
  metadata?: Record<string, string>
  idempotencyKey?: string
}

export interface PaymentIntentResult {
  paymentIntentId: string
  clientSecret: string
  status: string
  amount: number
  currency: string
}

// ============================================
// WEBHOOK TYPES
// ============================================

export type StripeWebhookEventType =
  | 'payment_intent.succeeded'
  | 'payment_intent.payment_failed'
  | 'payment_intent.canceled'
  | 'payment_intent.processing'
  | 'charge.refunded'
  | 'charge.dispute.created'
  | 'charge.dispute.closed'

export interface WebhookProcessingResult {
  success: boolean
  eventId: string
  eventType: string
  processed: boolean
  skipped?: boolean
  error?: string
}

// ============================================
// PAYMENT RECORD TYPES
// ============================================

export interface Payment {
  id: string
  salon_id: string
  order_id: string | null
  appointment_id: string | null
  customer_id: string | null
  amount: number
  currency: string
  method: PaymentMethod
  status: PaymentStatus
  stripe_payment_intent_id: string | null
  stripe_charge_id: string | null
  failure_code: string | null
  failure_message: string | null
  metadata: Record<string, unknown> | null
  created_at: string
  updated_at: string
}

export interface PaymentEvent {
  id: string
  payment_id: string
  event_type: PaymentEventType
  amount_delta: number
  external_reference: string | null
  raw_payload: Record<string, unknown> | null
  created_at: string
}

export type PaymentEventType =
  | 'created'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'
  | 'chargeback'
  | 'dispute_opened'
  | 'dispute_won'
  | 'dispute_lost'

// ============================================
// STRIPE EVENT LOG (Idempotency)
// ============================================

export interface StripeEventLog {
  id: string
  stripe_event_id: string
  event_type: string
  processed_at: string
  payload: Record<string, unknown>
}

// ============================================
// ORDER PAYMENT TYPES
// ============================================

export interface OrderPaymentInfo {
  orderId: string
  orderNumber: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  paymentMethod: 'card' | 'invoice'
  total: number
  currency: string
  paidAt: string | null
  stripePaymentIntentId: string | null
}

export interface ProcessPaymentInput {
  orderId: string
  paymentIntentId: string
  salonId: string
}

export interface RefundInput {
  paymentId: string
  amount?: number // Partial refund amount, if not provided = full refund
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
  salonId: string
}

export interface RefundResult {
  success: boolean
  refundId?: string
  amount?: number
  error?: string
}

// ============================================
// CHECKOUT SESSION TYPES
// ============================================

export interface CheckoutSessionInput {
  salonId: string
  orderId: string
  lineItems: Array<{
    name: string
    quantity: number
    unitPrice: number
  }>
  customerEmail: string
  successUrl: string
  cancelUrl: string
  metadata?: Record<string, string>
}

export interface CheckoutSessionResult {
  sessionId: string
  url: string
}

// ============================================
// VALIDATION HELPERS
// ============================================

/**
 * Converts CHF amount to Rappen (smallest unit)
 * Stripe expects amounts in smallest currency unit
 */
export function toSmallestUnit(amount: number, currency: string = 'chf'): number {
  // CHF and EUR use cents/rappen (factor 100)
  const currencyFactors: Record<string, number> = {
    chf: 100,
    eur: 100,
    usd: 100,
  }
  const factor = currencyFactors[currency.toLowerCase()] || 100
  return Math.round(amount * factor)
}

/**
 * Converts from smallest unit back to display amount
 */
export function fromSmallestUnit(amount: number, currency: string = 'chf'): number {
  const currencyFactors: Record<string, number> = {
    chf: 100,
    eur: 100,
    usd: 100,
  }
  const factor = currencyFactors[currency.toLowerCase()] || 100
  return amount / factor
}

/**
 * Formats amount for display
 */
export function formatAmount(amount: number, currency: string = 'CHF'): string {
  return `${currency} ${amount.toFixed(2)}`
}
