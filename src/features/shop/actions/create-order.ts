'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import { createPaymentIntent, toSmallestUnit, isStripeConfigured } from '@/lib/payments'
import { sendOrderConfirmation } from '@/lib/notifications'
import { logger } from '@/lib/logging'
import type { Order, CheckoutFormData, CartItem, ShippingMethod } from '../types'

// ============================================
// VALIDATION SCHEMAS
// ============================================

const addressSchema = z.object({
  street: z.string().min(3, 'Strasse erforderlich'),
  city: z.string().min(2, 'Stadt erforderlich'),
  postalCode: z.string().min(4, 'PLZ erforderlich'),
  country: z.string().min(2, 'Land erforderlich'),
})

const checkoutSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  firstName: z.string().min(2, 'Vorname erforderlich'),
  lastName: z.string().min(2, 'Nachname erforderlich'),
  phone: z.string().min(10, 'Telefonnummer erforderlich'),
  shippingAddress: addressSchema,
  sameAsBilling: z.boolean(),
  billingAddress: addressSchema.optional(),
  shippingMethodId: z.string(),
  paymentMethod: z.enum(['card', 'invoice']),
  voucherCode: z.string().optional(),
})

// ============================================
// TYPES
// ============================================

export type CreateOrderResult = {
  success: boolean
  order?: Order
  clientSecret?: string
  error?: string
  fieldErrors?: Record<string, string>
}

// ============================================
// SHIPPING METHODS
// ============================================

/**
 * Get available shipping methods from database.
 * Falls back to defaults if database is empty.
 */
export async function getShippingMethods(salonId?: string): Promise<ShippingMethod[]> {
  const supabase = await createClient()

  const { data: methods, error } = await supabase
    .from('shipping_methods')
    .select('*')
    .eq('is_active', true)
    .order('sort_order', { ascending: true })

  if (error || !methods || methods.length === 0) {
    // Fallback to defaults if database is empty
    return [
      {
        id: 'standard',
        name: 'Standardversand',
        description: 'Lieferung in 3-5 Werktagen',
        price: 8.9,
        estimated_days: '3-5',
      },
      {
        id: 'express',
        name: 'Expressversand',
        description: 'Lieferung in 1-2 Werktagen',
        price: 14.9,
        estimated_days: '1-2',
      },
      {
        id: 'pickup',
        name: 'Abholung im Salon',
        description: 'Kostenlos abholen im Salon',
        price: 0,
        estimated_days: '1',
      },
    ]
  }

  return methods.map((m) => ({
    id: m.id,
    name: m.name,
    description: m.description,
    price: m.price,
    estimated_days: m.estimated_days || '3-5',
  }))
}

// ============================================
// ORDER NUMBER GENERATION
// ============================================

/**
 * Generate a unique, sequential order number for the salon.
 * Format: SW-YYYY-NNNNN (e.g., SW-2024-00001)
 */
async function generateOrderNumber(
  salonId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<string> {
  const year = new Date().getFullYear()

  // Try to get and increment the counter atomically
  const { data: counter, error } = await supabase
    .from('invoice_counters')
    .select('current_value')
    .eq('salon_id', salonId)
    .eq('year', year)
    .single()

  let nextValue: number

  if (error || !counter) {
    // Initialize counter for this year
    const { data: newCounter } = await supabase
      .from('invoice_counters')
      .insert({ salon_id: salonId, year, current_value: 1 })
      .select('current_value')
      .single()

    nextValue = newCounter?.current_value || 1
  } else {
    // Increment counter
    const { data: updated } = await supabase
      .from('invoice_counters')
      .update({ current_value: counter.current_value + 1 })
      .eq('salon_id', salonId)
      .eq('year', year)
      .select('current_value')
      .single()

    nextValue = updated?.current_value || counter.current_value + 1
  }

  return `SW-${year}-${String(nextValue).padStart(5, '0')}`
}

/**
 * Fallback order number generation (non-sequential).
 * Used when database counter is not available.
 */
function generateFallbackOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SW-${timestamp}-${random}`
}

// ============================================
// STOCK VALIDATION
// ============================================

/**
 * Check if all items have sufficient stock.
 * Returns list of items with insufficient stock.
 */
async function validateStock(
  items: CartItem[],
  salonId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ valid: boolean; insufficientItems: string[] }> {
  const insufficientItems: string[] = []

  for (const item of items) {
    const { data: inventory } = await supabase
      .from('inventory_items')
      .select('current_stock')
      .eq('product_id', item.product.id)
      .eq('salon_id', salonId)
      .single()

    // If no inventory record, check product stock_quantity
    const availableStock = inventory?.current_stock ?? item.product.stock_quantity ?? 0

    if (availableStock < item.quantity) {
      insufficientItems.push(item.product.name)
    }
  }

  return {
    valid: insufficientItems.length === 0,
    insufficientItems,
  }
}

// ============================================
// VOUCHER VALIDATION
// ============================================

/**
 * Validate and calculate voucher discount.
 */
async function validateVoucher(
  code: string,
  subtotal: number,
  salonId: string,
  supabase: Awaited<ReturnType<typeof createClient>>
): Promise<{ valid: boolean; discount: number; error?: string }> {
  const { data: voucher, error } = await supabase
    .from('vouchers')
    .select('*')
    .eq('code', code.toUpperCase())
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .single()

  if (error || !voucher) {
    return { valid: false, discount: 0, error: 'Ungültiger Gutscheincode' }
  }

  // Check expiry
  if (voucher.expires_at && new Date(voucher.expires_at) < new Date()) {
    return { valid: false, discount: 0, error: 'Gutschein ist abgelaufen' }
  }

  // Check remaining value
  if (voucher.remaining_value <= 0) {
    return { valid: false, discount: 0, error: 'Gutschein wurde bereits eingelöst' }
  }

  // Check minimum order value
  if (voucher.min_order_value && subtotal < voucher.min_order_value) {
    return {
      valid: false,
      discount: 0,
      error: `Mindestbestellwert von CHF ${voucher.min_order_value} nicht erreicht`,
    }
  }

  // Calculate discount (cap at remaining value and order total)
  const discount = Math.min(voucher.remaining_value, subtotal)

  return { valid: true, discount }
}

// ============================================
// MAIN CREATE ORDER FUNCTION
// ============================================

/**
 * Create an order with payment processing.
 *
 * Business Rules:
 * - Validates all input fields
 * - Checks stock availability before accepting order
 * - Applies voucher discount if provided
 * - For card payments: Creates Stripe PaymentIntent, order stays pending
 * - For invoice payments: Order confirmed immediately, payment pending
 * - Stock is reduced only after successful payment (via webhook)
 * - Free shipping for orders over CHF 50
 */
export async function createOrder(
  formData: CheckoutFormData,
  items: CartItem[],
  subtotal: number,
  discount: number,
  salonId: string = 'default-salon'
): Promise<CreateOrderResult> {
  const supabase = await createClient()

  try {
    // 1. Validate input
    const validationResult = checkoutSchema.safeParse(formData)
    if (!validationResult.success) {
      const fieldErrors: Record<string, string> = {}
      validationResult.error.errors.forEach((err) => {
        const path = err.path.join('.')
        fieldErrors[path] = err.message
      })
      return {
        success: false,
        error: 'Bitte überprüfen Sie Ihre Eingaben',
        fieldErrors,
      }
    }

    const validated = validationResult.data

    // 2. Validate cart is not empty
    if (items.length === 0) {
      return { success: false, error: 'Warenkorb ist leer' }
    }

    // 3. Validate stock availability
    const stockResult = await validateStock(items, salonId, supabase)
    if (!stockResult.valid) {
      return {
        success: false,
        error: `Folgende Produkte sind nicht verfügbar: ${stockResult.insufficientItems.join(', ')}`,
      }
    }

    // 4. Get shipping method
    const shippingMethods = await getShippingMethods(salonId)
    const shippingMethod = shippingMethods.find((m) => m.id === validated.shippingMethodId)
    if (!shippingMethod) {
      return { success: false, error: 'Ungültige Versandart' }
    }

    // Free shipping over CHF 50
    const shippingCost = subtotal >= 50 ? 0 : shippingMethod.price

    // 5. Validate and apply voucher if provided
    let voucherDiscount = discount
    if (validated.voucherCode) {
      const voucherResult = await validateVoucher(
        validated.voucherCode,
        subtotal,
        salonId,
        supabase
      )
      if (!voucherResult.valid) {
        return { success: false, error: voucherResult.error }
      }
      voucherDiscount = voucherResult.discount
    }

    // 6. Calculate total
    const total = Math.max(0, subtotal + shippingCost - voucherDiscount)

    // 7. Generate order number
    let orderNumber: string
    try {
      orderNumber = await generateOrderNumber(salonId, supabase)
    } catch {
      orderNumber = generateFallbackOrderNumber()
    }

    // 8. Determine initial status
    const initialStatus = validated.paymentMethod === 'invoice' ? 'confirmed' : 'pending'
    const initialPaymentStatus = 'pending'

    // 9. Create order in database
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .insert({
        salon_id: salonId,
        order_number: orderNumber,
        customer_email: validated.email,
        customer_first_name: validated.firstName,
        customer_last_name: validated.lastName,
        customer_phone: validated.phone,
        status: initialStatus,
        payment_status: initialPaymentStatus,
        payment_method: validated.paymentMethod,
        subtotal,
        shipping_cost: shippingCost,
        discount: voucherDiscount,
        total,
        voucher_code: validated.voucherCode || null,
        shipping_method_id: validated.shippingMethodId,
        shipping_method_name: shippingMethod.name,
        shipping_address_name: `${validated.firstName} ${validated.lastName}`,
        shipping_address_street: validated.shippingAddress.street,
        shipping_address_city: validated.shippingAddress.city,
        shipping_address_postal_code: validated.shippingAddress.postalCode,
        shipping_address_country: validated.shippingAddress.country,
        billing_address_name: validated.sameAsBilling
          ? null
          : validated.billingAddress
            ? `${validated.firstName} ${validated.lastName}`
            : null,
        billing_address_street: validated.sameAsBilling ? null : validated.billingAddress?.street,
        billing_address_city: validated.sameAsBilling ? null : validated.billingAddress?.city,
        billing_address_postal_code: validated.sameAsBilling
          ? null
          : validated.billingAddress?.postalCode,
        billing_address_country: validated.sameAsBilling
          ? null
          : validated.billingAddress?.country,
      })
      .select('id')
      .single()

    if (orderError || !orderData) {
      logger.error('Failed to create order', { error: orderError?.message })
      return { success: false, error: 'Bestellung konnte nicht erstellt werden' }
    }

    const orderId = orderData.id

    // 10. Create order items
    const orderItems = items.map((item, index) => ({
      order_id: orderId,
      product_id: item.product.id,
      product_name: item.product.name,
      product_sku: item.product.sku,
      quantity: item.quantity,
      unit_price: item.product.price,
      tax_rate_percent: 8.1, // Swiss VAT
      tax_amount: item.product.price * item.quantity * 0.081,
      total_price: item.product.price * item.quantity,
      sort_order: index,
    }))

    const { error: itemsError } = await supabase.from('order_items').insert(orderItems)

    if (itemsError) {
      logger.error('Failed to create order items', { error: itemsError.message, orderId })
      // Clean up the order
      await supabase.from('orders').delete().eq('id', orderId)
      return { success: false, error: 'Bestellung konnte nicht erstellt werden' }
    }

    // Build order response object
    const order: Order = {
      id: orderId,
      order_number: orderNumber,
      customer_id: 'guest',
      status: initialStatus as Order['status'],
      subtotal,
      shipping_cost: shippingCost,
      discount: voucherDiscount,
      total,
      voucher_code: validated.voucherCode || null,
      shipping_method_id: validated.shippingMethodId,
      shipping_address: {
        name: `${validated.firstName} ${validated.lastName}`,
        street: validated.shippingAddress.street,
        city: validated.shippingAddress.city,
        postal_code: validated.shippingAddress.postalCode,
        country: validated.shippingAddress.country,
      },
      billing_address: validated.sameAsBilling
        ? null
        : validated.billingAddress
          ? {
              name: `${validated.firstName} ${validated.lastName}`,
              street: validated.billingAddress.street,
              city: validated.billingAddress.city,
              postal_code: validated.billingAddress.postalCode,
              country: validated.billingAddress.country,
            }
          : null,
      payment_status: initialPaymentStatus,
      payment_method: validated.paymentMethod,
      stripe_payment_intent_id: null,
      notes: null,
      items: items.map((item) => ({
        id: `item-${item.product.id}`,
        product_id: item.product.id,
        product_name: item.product.name,
        product_sku: item.product.sku,
        quantity: item.quantity,
        unit_price: item.product.price,
        total_price: item.product.price * item.quantity,
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    // 11. Handle payment based on method
    if (validated.paymentMethod === 'card') {
      // Check if Stripe is configured
      if (!isStripeConfigured()) {
        logger.warn('Stripe not configured, using mock payment')
        return {
          success: true,
          order,
          clientSecret: `mock_client_secret_${orderId}`,
        }
      }

      // Create Stripe PaymentIntent
      try {
        const paymentIntent = await createPaymentIntent({
          salonId,
          orderId,
          amount: toSmallestUnit(total, 'chf'),
          currency: 'chf',
          customerEmail: validated.email,
          metadata: {
            order_number: orderNumber,
            customer_name: `${validated.firstName} ${validated.lastName}`,
          },
          idempotencyKey: `order-${orderId}`,
        })

        // Update order with payment intent ID
        await supabase
          .from('orders')
          .update({ stripe_payment_intent_id: paymentIntent.paymentIntentId })
          .eq('id', orderId)

        order.stripe_payment_intent_id = paymentIntent.paymentIntentId

        logger.info('Order created with Stripe payment', {
          orderId,
          orderNumber,
          paymentIntentId: paymentIntent.paymentIntentId,
        })

        return {
          success: true,
          order,
          clientSecret: paymentIntent.clientSecret,
        }
      } catch (paymentError) {
        logger.error('Failed to create payment intent', {
          error: paymentError instanceof Error ? paymentError.message : 'Unknown error',
          orderId,
        })

        // Mark order as payment failed
        await supabase
          .from('orders')
          .update({ status: 'cancelled', payment_status: 'failed' })
          .eq('id', orderId)

        return {
          success: false,
          error: 'Zahlung konnte nicht initialisiert werden. Bitte versuchen Sie es erneut.',
        }
      }
    }

    // 12. For invoice payments - send confirmation
    try {
      await sendOrderConfirmation({
        customerName: `${validated.firstName} ${validated.lastName}`,
        customerEmail: validated.email,
        orderNumber: order.order_number,
        items: order.items.map((item) => ({
          name: item.product_name,
          quantity: item.quantity,
          price: item.unit_price,
        })),
        subtotal: order.subtotal,
        shipping: order.shipping_cost,
        discount: order.discount,
        total: order.total,
        shippingAddress: order.shipping_address,
        paymentMethod: validated.paymentMethod === 'invoice' ? 'Rechnung' : 'Kreditkarte',
      })
    } catch (emailError) {
      logger.error('Failed to send order confirmation', {
        error: emailError instanceof Error ? emailError.message : 'Unknown error',
        orderId,
      })
    }

    logger.info('Order created successfully', {
      orderId,
      orderNumber,
      paymentMethod: validated.paymentMethod,
      total,
    })

    return { success: true, order }
  } catch (error) {
    logger.error('Unexpected error creating order', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })

    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }

    return { success: false, error: 'Bestellung konnte nicht erstellt werden' }
  }
}

// ============================================
// GET ORDER
// ============================================

/**
 * Get order by ID.
 */
export async function getOrder(orderId: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data: order, error } = await supabase
    .from('orders')
    .select(
      `
      *,
      order_items (*)
    `
    )
    .eq('id', orderId)
    .single()

  if (error || !order) {
    return null
  }

  return {
    id: order.id,
    order_number: order.order_number,
    customer_id: order.customer_id || 'guest',
    status: order.status,
    subtotal: order.subtotal,
    shipping_cost: order.shipping_cost,
    discount: order.discount,
    total: order.total,
    voucher_code: order.voucher_code,
    shipping_method_id: order.shipping_method_id,
    shipping_address: {
      name: order.shipping_address_name,
      street: order.shipping_address_street,
      city: order.shipping_address_city,
      postal_code: order.shipping_address_postal_code,
      country: order.shipping_address_country,
    },
    billing_address: order.billing_address_street
      ? {
          name: order.billing_address_name,
          street: order.billing_address_street,
          city: order.billing_address_city,
          postal_code: order.billing_address_postal_code,
          country: order.billing_address_country,
        }
      : null,
    payment_status: order.payment_status,
    payment_method: order.payment_method,
    stripe_payment_intent_id: order.stripe_payment_intent_id,
    notes: order.notes,
    items: order.order_items.map((item: Record<string, unknown>) => ({
      id: item.id,
      product_id: item.product_id,
      product_name: item.product_name,
      product_sku: item.product_sku,
      quantity: item.quantity,
      unit_price: item.unit_price,
      total_price: item.total_price,
    })),
    created_at: order.created_at,
    updated_at: order.updated_at,
  }
}

/**
 * Get order by order number (for confirmation pages).
 */
export async function getOrderByNumber(orderNumber: string): Promise<Order | null> {
  const supabase = await createClient()

  const { data: order } = await supabase
    .from('orders')
    .select('id')
    .eq('order_number', orderNumber)
    .single()

  if (!order) return null

  return getOrder(order.id)
}
