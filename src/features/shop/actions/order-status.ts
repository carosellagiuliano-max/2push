'use server'

import { createClient } from '@/lib/supabase/server'
import { createRefund } from '@/lib/payments'
import { logger } from '@/lib/logging'
import type { OrderStatus } from '@/lib/database.types'

// ============================================
// TYPES
// ============================================

export type OrderStatusResult = {
  success: boolean
  error?: string
}

/**
 * Valid order status transitions.
 * Prevents invalid state changes.
 */
const VALID_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ['paid', 'cancelled'],
  paid: ['processing', 'shipped', 'cancelled', 'refunded'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['completed', 'refunded'],
  completed: ['refunded'],
  cancelled: [], // Terminal state
  refunded: [], // Terminal state
}

// ============================================
// STATUS TRANSITIONS
// ============================================

/**
 * Check if a status transition is valid.
 */
function isValidTransition(currentStatus: string, newStatus: string): boolean {
  const validNextStates = VALID_STATUS_TRANSITIONS[currentStatus] || []
  return validNextStates.includes(newStatus)
}

/**
 * Update order status with validation.
 *
 * Business Rules:
 * - Only valid transitions are allowed
 * - Cancellation before payment: no refund needed
 * - Cancellation after payment: triggers refund
 * - Refund restores stock
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  salonId: string,
  reason?: string
): Promise<OrderStatusResult> {
  const supabase = await createClient()

  try {
    // Get current order
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, payment_status, stripe_payment_intent_id')
      .eq('id', orderId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: 'Bestellung nicht gefunden' }
    }

    // Validate transition
    if (!isValidTransition(order.status, newStatus)) {
      return {
        success: false,
        error: `Ungültiger Statuswechsel von "${order.status}" zu "${newStatus}"`,
      }
    }

    // Handle special cases
    if (newStatus === 'cancelled' && order.payment_status === 'paid') {
      // Need to refund first
      return {
        success: false,
        error: 'Bezahlte Bestellung muss zuerst erstattet werden',
      }
    }

    // Update status
    const updateData: Record<string, unknown> = {
      status: newStatus,
      updated_at: new Date().toISOString(),
    }

    if (reason) {
      updateData.status_reason = reason
    }

    if (newStatus === 'shipped') {
      updateData.shipped_at = new Date().toISOString()
    } else if (newStatus === 'delivered') {
      updateData.delivered_at = new Date().toISOString()
    } else if (newStatus === 'completed') {
      updateData.completed_at = new Date().toISOString()
    } else if (newStatus === 'cancelled') {
      updateData.cancelled_at = new Date().toISOString()
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update(updateData)
      .eq('id', orderId)
      .eq('salon_id', salonId)

    if (updateError) {
      logger.error('Failed to update order status', {
        orderId,
        newStatus,
        error: updateError.message,
      })
      return { success: false, error: 'Status konnte nicht aktualisiert werden' }
    }

    logger.info('Order status updated', { orderId, from: order.status, to: newStatus })

    return { success: true }
  } catch (error) {
    logger.error('Error updating order status', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// CANCELLATION
// ============================================

/**
 * Cancel an order.
 * If payment was made, initiates refund.
 */
export async function cancelOrder(
  orderId: string,
  salonId: string,
  reason: string
): Promise<OrderStatusResult> {
  const supabase = await createClient()

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, payment_status, stripe_payment_intent_id, total')
      .eq('id', orderId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: 'Bestellung nicht gefunden' }
    }

    // Check if cancellation is allowed
    if (['cancelled', 'refunded', 'delivered', 'completed'].includes(order.status)) {
      return { success: false, error: 'Bestellung kann nicht mehr storniert werden' }
    }

    // If payment was made, need to refund
    if (order.payment_status === 'paid' && order.stripe_payment_intent_id) {
      const refundResult = await createRefund({
        paymentId: order.stripe_payment_intent_id,
        reason: 'requested_by_customer',
        salonId,
      })

      if (!refundResult.success) {
        logger.error('Failed to refund order during cancellation', {
          orderId,
          error: refundResult.error,
        })
        return { success: false, error: 'Erstattung fehlgeschlagen: ' + refundResult.error }
      }

      // Update to refunded (stock will be restored via webhook)
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'refunded',
          payment_status: 'refunded',
          cancelled_at: new Date().toISOString(),
          cancellation_reason: reason,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)

      if (updateError) {
        return { success: false, error: 'Status konnte nicht aktualisiert werden' }
      }

      logger.info('Order cancelled with refund', { orderId })
      return { success: true }
    }

    // No payment - just cancel
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      return { success: false, error: 'Status konnte nicht aktualisiert werden' }
    }

    logger.info('Order cancelled', { orderId })
    return { success: true }
  } catch (error) {
    logger.error('Error cancelling order', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// REFUND
// ============================================

/**
 * Refund an order (full or partial).
 */
export async function refundOrder(
  orderId: string,
  salonId: string,
  amount?: number, // Optional: partial refund amount
  reason?: 'duplicate' | 'fraudulent' | 'requested_by_customer'
): Promise<OrderStatusResult> {
  const supabase = await createClient()

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status, payment_status, stripe_payment_intent_id, total')
      .eq('id', orderId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: 'Bestellung nicht gefunden' }
    }

    if (order.payment_status !== 'paid') {
      return { success: false, error: 'Bestellung wurde nicht bezahlt' }
    }

    if (!order.stripe_payment_intent_id) {
      return { success: false, error: 'Keine Stripe-Zahlung vorhanden' }
    }

    // Process refund
    const refundResult = await createRefund({
      paymentId: order.stripe_payment_intent_id,
      amount: amount ? Math.round(amount * 100) : undefined, // Convert to cents
      reason: reason || 'requested_by_customer',
      salonId,
    })

    if (!refundResult.success) {
      return { success: false, error: 'Erstattung fehlgeschlagen: ' + refundResult.error }
    }

    const isFullRefund = !amount || amount >= order.total

    // Update order status
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: isFullRefund ? 'refunded' : order.status,
        payment_status: isFullRefund ? 'refunded' : 'partially_refunded',
        refunded_amount: amount || order.total,
        refunded_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      logger.error('Failed to update order after refund', { orderId, error: updateError.message })
      // Refund was processed, but status update failed
      // This should be handled by webhook as backup
    }

    logger.info('Order refunded', {
      orderId,
      amount: amount || order.total,
      isFullRefund,
    })

    return { success: true }
  } catch (error) {
    logger.error('Error refunding order', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// MARK AS SHIPPED
// ============================================

/**
 * Mark order as shipped with optional tracking info.
 */
export async function markOrderShipped(
  orderId: string,
  salonId: string,
  trackingNumber?: string,
  carrier?: string
): Promise<OrderStatusResult> {
  const supabase = await createClient()

  try {
    const { data: order, error: fetchError } = await supabase
      .from('orders')
      .select('id, status')
      .eq('id', orderId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !order) {
      return { success: false, error: 'Bestellung nicht gefunden' }
    }

    if (!['paid', 'processing'].includes(order.status)) {
      return { success: false, error: 'Bestellung kann nicht als versendet markiert werden' }
    }

    const { error: updateError } = await supabase
      .from('orders')
      .update({
        status: 'shipped',
        shipped_at: new Date().toISOString(),
        tracking_number: trackingNumber || null,
        shipping_carrier: carrier || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (updateError) {
      return { success: false, error: 'Status konnte nicht aktualisiert werden' }
    }

    logger.info('Order marked as shipped', { orderId, trackingNumber, carrier })

    // TODO: Send shipping notification email

    return { success: true }
  } catch (error) {
    logger.error('Error marking order as shipped', {
      orderId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// GET ORDERS (Admin)
// ============================================

/**
 * Get orders for admin dashboard with filters.
 */
export async function getOrders(
  salonId: string,
  options: {
    status?: OrderStatus
    paymentStatus?: string
    search?: string
    limit?: number
    offset?: number
  } = {}
) {
  const supabase = await createClient()

  let query = supabase
    .from('orders')
    .select(
      `
      id,
      order_number,
      status,
      payment_status,
      total,
      customer_email,
      customer_first_name,
      customer_last_name,
      created_at
    `,
      { count: 'exact' }
    )
    .eq('salon_id', salonId)
    .order('created_at', { ascending: false })

  if (options.status) {
    query = query.eq('status', options.status)
  }

  if (options.paymentStatus) {
    query = query.eq('payment_status', options.paymentStatus)
  }

  if (options.search) {
    query = query.or(
      `order_number.ilike.%${options.search}%,customer_email.ilike.%${options.search}%,customer_last_name.ilike.%${options.search}%`
    )
  }

  if (options.limit) {
    query = query.limit(options.limit)
  }

  if (options.offset) {
    query = query.range(options.offset, options.offset + (options.limit || 20) - 1)
  }

  const { data: orders, count, error } = await query

  if (error) {
    logger.error('Failed to fetch orders', { error: error.message })
    return { orders: [], total: 0 }
  }

  return {
    orders: orders || [],
    total: count || 0,
  }
}
