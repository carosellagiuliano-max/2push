export type Product = {
  id: string
  salon_id: string
  name: string
  slug: string
  description: string | null
  brand: string | null
  category: string
  price: number
  compare_at_price: number | null
  stock_quantity: number
  sku: string | null
  image_url: string | null
  is_active: boolean
  created_at: string
  updated_at: string
}

export type ProductCategory = {
  id: string
  name: string
  slug: string
}

export type CartItem = {
  id: string
  product: Product
  quantity: number
}

export type Cart = {
  id: string
  items: CartItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  voucher_code: string | null
}

export type ShippingMethod = {
  id: string
  name: string
  description: string | null
  price: number
  estimated_days: string
}

export type Voucher = {
  id: string
  code: string
  type: 'percentage' | 'fixed'
  value: number
  min_order_value: number | null
  max_uses: number | null
  uses_count: number
  valid_from: string
  valid_to: string | null
  is_active: boolean
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'

export type OrderItem = {
  id: string
  product_id: string
  product_name: string
  product_sku: string | null
  quantity: number
  unit_price: number
  total_price: number
}

export type Order = {
  id: string
  order_number: string
  customer_id: string
  status: OrderStatus
  subtotal: number
  shipping_cost: number
  discount: number
  total: number
  voucher_code: string | null
  shipping_method_id: string | null
  shipping_address: {
    name: string
    street: string
    city: string
    postal_code: string
    country: string
  }
  billing_address: {
    name: string
    street: string
    city: string
    postal_code: string
    country: string
  } | null
  payment_status: 'pending' | 'paid' | 'failed' | 'refunded'
  payment_method: string | null
  stripe_payment_intent_id: string | null
  notes: string | null
  items: OrderItem[]
  created_at: string
  updated_at: string
}

export type CheckoutFormData = {
  email: string
  firstName: string
  lastName: string
  phone: string
  shippingAddress: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  sameAsBilling: boolean
  billingAddress?: {
    street: string
    city: string
    postalCode: string
    country: string
  }
  shippingMethodId: string
  paymentMethod: 'card' | 'invoice'
  voucherCode?: string
}
