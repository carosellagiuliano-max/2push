'use server'

import type { Order } from '@/features/shop/types'

// Mock orders for demo - in production this would come from database
const mockOrders: Order[] = [
  {
    id: 'order-1',
    order_number: 'SW-ABC123-XYZ',
    customer_id: 'customer-1',
    status: 'delivered',
    subtotal: 75,
    shipping_cost: 0,
    discount: 7.5,
    total: 67.5,
    voucher_code: 'WELCOME10',
    shipping_method_id: 'standard',
    shipping_address: {
      name: 'Max Muster',
      street: 'Musterstrasse 1',
      city: 'St. Gallen',
      postal_code: '9000',
      country: 'Schweiz',
    },
    billing_address: null,
    payment_status: 'paid',
    payment_method: 'invoice',
    stripe_payment_intent_id: null,
    notes: null,
    items: [
      {
        id: 'item-1',
        product_id: '1',
        product_name: 'Repair Shampoo',
        product_sku: 'KER-REP-001',
        quantity: 1,
        unit_price: 32,
        total_price: 32,
      },
      {
        id: 'item-2',
        product_id: '2',
        product_name: 'Haaröl Luxe',
        product_sku: 'OLA-OIL-001',
        quantity: 1,
        unit_price: 45,
        total_price: 45,
      },
    ],
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updated_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
]

export async function getCustomerOrders(): Promise<Order[]> {
  // In production: Fetch from database with customer_id from session
  // For now, return mock data
  return mockOrders
}
