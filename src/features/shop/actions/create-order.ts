'use server'

import { z } from 'zod'
import type { Order, CheckoutFormData, CartItem, ShippingMethod } from '../types'
import { sendOrderConfirmation } from '@/lib/notifications'

const checkoutSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  firstName: z.string().min(2, 'Vorname erforderlich'),
  lastName: z.string().min(2, 'Nachname erforderlich'),
  phone: z.string().min(10, 'Telefonnummer erforderlich'),
  shippingAddress: z.object({
    street: z.string().min(3, 'Strasse erforderlich'),
    city: z.string().min(2, 'Stadt erforderlich'),
    postalCode: z.string().min(4, 'PLZ erforderlich'),
    country: z.string().min(2, 'Land erforderlich'),
  }),
  sameAsBilling: z.boolean(),
  billingAddress: z.object({
    street: z.string(),
    city: z.string(),
    postalCode: z.string(),
    country: z.string(),
  }).optional(),
  shippingMethodId: z.string(),
  paymentMethod: z.enum(['card', 'invoice']),
  voucherCode: z.string().optional(),
})

// Mock shipping methods
const shippingMethods: ShippingMethod[] = [
  {
    id: 'standard',
    name: 'Standardversand',
    description: 'Lieferung in 3-5 Werktagen',
    price: 8.90,
    estimated_days: '3-5',
  },
  {
    id: 'express',
    name: 'Expressversand',
    description: 'Lieferung in 1-2 Werktagen',
    price: 14.90,
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

export async function getShippingMethods(): Promise<ShippingMethod[]> {
  return shippingMethods
}

export type CreateOrderResult = {
  success: boolean
  order?: Order
  clientSecret?: string // For Stripe payment
  error?: string
}

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase()
  const random = Math.random().toString(36).substring(2, 6).toUpperCase()
  return `SW-${timestamp}-${random}`
}

export async function createOrder(
  formData: CheckoutFormData,
  items: CartItem[],
  subtotal: number,
  discount: number
): Promise<CreateOrderResult> {
  try {
    // Validate input
    const validated = checkoutSchema.parse(formData)

    if (items.length === 0) {
      return { success: false, error: 'Warenkorb ist leer' }
    }

    // Get shipping method
    const shippingMethod = shippingMethods.find(m => m.id === validated.shippingMethodId)
    if (!shippingMethod) {
      return { success: false, error: 'Ungültige Versandart' }
    }

    // Free shipping over CHF 50
    const shippingCost = subtotal >= 50 ? 0 : shippingMethod.price

    const total = subtotal + shippingCost - discount

    // Create order
    const order: Order = {
      id: `order-${Date.now()}`,
      order_number: generateOrderNumber(),
      customer_id: 'guest', // Would be actual customer ID if logged in
      status: 'pending',
      subtotal,
      shipping_cost: shippingCost,
      discount,
      total: Math.max(0, total),
      voucher_code: formData.voucherCode || null,
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
      payment_status: validated.paymentMethod === 'invoice' ? 'pending' : 'pending',
      payment_method: validated.paymentMethod,
      stripe_payment_intent_id: null,
      notes: null,
      items: items.map(item => ({
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

    // In production: Save order to database
    // In production: If card payment, create Stripe PaymentIntent

    if (validated.paymentMethod === 'card') {
      // Mock Stripe client secret for demo
      // In production: Create actual Stripe PaymentIntent
      return {
        success: true,
        order,
        clientSecret: 'mock_client_secret_' + order.id,
      }
    }

    // For invoice payment, order is confirmed immediately
    order.status = 'confirmed'

    // Send order confirmation email
    try {
      await sendOrderConfirmation({
        customerName: `${validated.firstName} ${validated.lastName}`,
        customerEmail: validated.email,
        orderNumber: order.order_number,
        items: order.items.map(item => ({
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
      console.error('Failed to send order confirmation:', emailError)
    }

    return { success: true, order }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    console.error('Order creation error:', error)
    return { success: false, error: 'Bestellung konnte nicht erstellt werden' }
  }
}

export async function getOrder(_orderId: string): Promise<Order | null> {
  // In production: Fetch from database
  // For now, return null (order not found)
  return null
}
