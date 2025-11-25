'use client'

import * as React from 'react'
import type { Product, CartItem, Cart, Voucher } from '../types'

interface CartContextValue {
  cart: Cart
  items: CartItem[]
  itemCount: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  addItem: (product: Product, quantity?: number) => void
  removeItem: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  applyVoucher: (code: string) => Promise<{ success: boolean; error?: string }>
  removeVoucher: () => void
}

const CartContext = React.createContext<CartContextValue | null>(null)

const CART_STORAGE_KEY = 'schnittwerk-cart'

function calculateCart(items: CartItem[], voucher: Voucher | null): Cart {
  const subtotal = items.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  )

  // Free shipping over CHF 50
  const shipping = subtotal >= 50 ? 0 : 8.90

  let discount = 0
  if (voucher) {
    if (voucher.type === 'percentage') {
      discount = subtotal * (voucher.value / 100)
    } else {
      discount = voucher.value
    }
    // Don't allow discount to exceed subtotal
    discount = Math.min(discount, subtotal)
  }

  const total = subtotal + shipping - discount

  return {
    id: 'cart-1',
    items,
    subtotal,
    shipping,
    discount,
    total: Math.max(0, total),
    voucher_code: voucher?.code || null,
  }
}

// Mock voucher validation
async function validateVoucher(code: string): Promise<Voucher | null> {
  const mockVouchers: Voucher[] = [
    {
      id: 'v1',
      code: 'WELCOME10',
      type: 'percentage',
      value: 10,
      min_order_value: 30,
      max_uses: 1000,
      uses_count: 50,
      valid_from: '2024-01-01',
      valid_to: '2025-12-31',
      is_active: true,
    },
    {
      id: 'v2',
      code: 'NEUKUNDE15',
      type: 'percentage',
      value: 15,
      min_order_value: 50,
      max_uses: 500,
      uses_count: 100,
      valid_from: '2024-01-01',
      valid_to: '2025-12-31',
      is_active: true,
    },
    {
      id: 'v3',
      code: 'GRATIS5',
      type: 'fixed',
      value: 5,
      min_order_value: null,
      max_uses: null,
      uses_count: 0,
      valid_from: '2024-01-01',
      valid_to: null,
      is_active: true,
    },
  ]

  const voucher = mockVouchers.find(
    (v) => v.code.toLowerCase() === code.toLowerCase() && v.is_active
  )

  if (!voucher) return null

  // Check validity date
  const now = new Date()
  if (new Date(voucher.valid_from) > now) return null
  if (voucher.valid_to && new Date(voucher.valid_to) < now) return null

  // Check max uses
  if (voucher.max_uses && voucher.uses_count >= voucher.max_uses) return null

  return voucher
}

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = React.useState<CartItem[]>([])
  const [voucher, setVoucher] = React.useState<Voucher | null>(null)
  const [isOpen, setIsOpen] = React.useState(false)
  const [isInitialized, setIsInitialized] = React.useState(false)

  // Load cart from localStorage on mount
  React.useEffect(() => {
    const stored = localStorage.getItem(CART_STORAGE_KEY)
    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        setItems(parsed.items || [])
        setVoucher(parsed.voucher || null)
      } catch {
        // Invalid data, start fresh
      }
    }
    setIsInitialized(true)
  }, [])

  // Save cart to localStorage whenever it changes
  React.useEffect(() => {
    if (isInitialized) {
      localStorage.setItem(
        CART_STORAGE_KEY,
        JSON.stringify({ items, voucher })
      )
    }
  }, [items, voucher, isInitialized])

  const cart = React.useMemo(() => calculateCart(items, voucher), [items, voucher])

  const itemCount = React.useMemo(
    () => items.reduce((sum, item) => sum + item.quantity, 0),
    [items]
  )

  const addItem = React.useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id)
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )
      }
      return [...prev, { id: `cart-item-${product.id}`, product, quantity }]
    })
  }, [])

  const removeItem = React.useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.product.id !== productId))
  }, [])

  const updateQuantity = React.useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.product.id !== productId))
    } else {
      setItems((prev) =>
        prev.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }, [])

  const clearCart = React.useCallback(() => {
    setItems([])
    setVoucher(null)
  }, [])

  const applyVoucher = React.useCallback(
    async (code: string): Promise<{ success: boolean; error?: string }> => {
      const validVoucher = await validateVoucher(code)

      if (!validVoucher) {
        return { success: false, error: 'Ungültiger oder abgelaufener Gutscheincode.' }
      }

      // Check minimum order value
      const subtotal = items.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      )

      if (validVoucher.min_order_value && subtotal < validVoucher.min_order_value) {
        return {
          success: false,
          error: `Mindestbestellwert von CHF ${validVoucher.min_order_value.toFixed(2)} nicht erreicht.`,
        }
      }

      setVoucher(validVoucher)
      return { success: true }
    },
    [items]
  )

  const removeVoucher = React.useCallback(() => {
    setVoucher(null)
  }, [])

  const value: CartContextValue = {
    cart,
    items,
    itemCount,
    isOpen,
    setIsOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    applyVoucher,
    removeVoucher,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = React.useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
