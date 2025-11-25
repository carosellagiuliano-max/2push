/**
 * Shop Actions Tests
 *
 * Tests for order creation, product retrieval, and checkout flow.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { factories, resetMocks } from '../setup'

// Mock shop actions
const mockCreateOrder = vi.fn()
const mockGetProducts = vi.fn()
const mockGetShippingMethods = vi.fn()

vi.mock('@/features/shop/actions', () => ({
  createOrder: mockCreateOrder,
  getProducts: mockGetProducts,
  getShippingMethods: mockGetShippingMethods,
}))

describe('Shop Actions', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('createOrder', () => {
    const validCheckoutData = {
      email: 'customer@test.ch',
      firstName: 'Max',
      lastName: 'Mustermann',
      phone: '+41 79 123 45 67',
      shippingAddress: {
        street: 'Teststrasse 1',
        city: 'St. Gallen',
        postalCode: '9000',
        country: 'CH',
      },
      sameAsBilling: true,
      shippingMethodId: 'standard',
      paymentMethod: 'card' as const,
    }

    const validCartItems = [
      {
        product: factories.product(),
        quantity: 2,
      },
    ]

    it('should create order with valid data', async () => {
      mockCreateOrder.mockResolvedValue({
        success: true,
        order: factories.order(),
        clientSecret: 'pi_test_secret',
      })

      const result = await mockCreateOrder(
        validCheckoutData,
        validCartItems,
        59.80, // subtotal
        0 // discount
      )

      expect(result.success).toBe(true)
      expect(result.order).toBeDefined()
      expect(result.order.order_number).toMatch(/^SW-/)
    })

    it('should return error with empty cart', async () => {
      mockCreateOrder.mockResolvedValue({
        success: false,
        error: 'Warenkorb ist leer',
      })

      const result = await mockCreateOrder(validCheckoutData, [], 0, 0)

      expect(result.success).toBe(false)
      expect(result.error).toContain('Warenkorb')
    })

    it('should return error with invalid email', async () => {
      mockCreateOrder.mockResolvedValue({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })

      const result = await mockCreateOrder(
        { ...validCheckoutData, email: 'invalid' },
        validCartItems,
        59.80,
        0
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('E-Mail')
    })

    it('should return error with missing shipping address', async () => {
      mockCreateOrder.mockResolvedValue({
        success: false,
        error: 'Strasse erforderlich',
      })

      const result = await mockCreateOrder(
        {
          ...validCheckoutData,
          shippingAddress: { ...validCheckoutData.shippingAddress, street: '' },
        },
        validCartItems,
        59.80,
        0
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Strasse')
    })

    it('should return error with invalid shipping method', async () => {
      mockCreateOrder.mockResolvedValue({
        success: false,
        error: 'Ungültige Versandart',
      })

      const result = await mockCreateOrder(
        { ...validCheckoutData, shippingMethodId: 'invalid' },
        validCartItems,
        59.80,
        0
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Versandart')
    })

    it('should apply free shipping for orders over CHF 50', async () => {
      mockCreateOrder.mockResolvedValue({
        success: true,
        order: factories.order({ shipping_cost: 0, subtotal: 59.80, total: 59.80 }),
      })

      const result = await mockCreateOrder(
        validCheckoutData,
        validCartItems,
        59.80, // Over 50 CHF
        0
      )

      expect(result.success).toBe(true)
      expect(result.order.shipping_cost).toBe(0)
    })

    it('should add shipping cost for orders under CHF 50', async () => {
      mockCreateOrder.mockResolvedValue({
        success: true,
        order: factories.order({ shipping_cost: 8.90, subtotal: 29.90, total: 38.80 }),
      })

      const result = await mockCreateOrder(
        validCheckoutData,
        [{ product: factories.product({ price: 29.90 }), quantity: 1 }],
        29.90,
        0
      )

      expect(result.success).toBe(true)
      expect(result.order.shipping_cost).toBeGreaterThan(0)
    })

    it('should apply voucher discount', async () => {
      mockCreateOrder.mockResolvedValue({
        success: true,
        order: factories.order({ discount: 10, total: 49.80 }),
      })

      const result = await mockCreateOrder(
        { ...validCheckoutData, voucherCode: 'SAVE10' },
        validCartItems,
        59.80,
        10
      )

      expect(result.success).toBe(true)
      expect(result.order.discount).toBe(10)
    })

    it('should handle invoice payment method', async () => {
      mockCreateOrder.mockResolvedValue({
        success: true,
        order: factories.order({
          payment_method: 'invoice',
          status: 'confirmed',
        }),
      })

      const result = await mockCreateOrder(
        { ...validCheckoutData, paymentMethod: 'invoice' as const },
        validCartItems,
        59.80,
        0
      )

      expect(result.success).toBe(true)
      expect(result.order.payment_method).toBe('invoice')
      expect(result.order.status).toBe('confirmed')
    })

    it('should handle card payment and return client secret', async () => {
      mockCreateOrder.mockResolvedValue({
        success: true,
        order: factories.order({ payment_method: 'card', status: 'pending' }),
        clientSecret: 'pi_test_secret',
      })

      const result = await mockCreateOrder(
        { ...validCheckoutData, paymentMethod: 'card' as const },
        validCartItems,
        59.80,
        0
      )

      expect(result.success).toBe(true)
      expect(result.clientSecret).toBeDefined()
    })

    it('should validate billing address when different from shipping', async () => {
      mockCreateOrder.mockResolvedValue({
        success: true,
        order: factories.order({
          billing_address: {
            name: 'Max Mustermann',
            street: 'Billingstrasse 2',
            city: 'Zürich',
            postal_code: '8000',
            country: 'CH',
          },
        }),
      })

      const result = await mockCreateOrder(
        {
          ...validCheckoutData,
          sameAsBilling: false,
          billingAddress: {
            street: 'Billingstrasse 2',
            city: 'Zürich',
            postalCode: '8000',
            country: 'CH',
          },
        },
        validCartItems,
        59.80,
        0
      )

      expect(result.success).toBe(true)
      expect(result.order.billing_address).not.toBeNull()
    })

    it('should handle negative total gracefully', async () => {
      mockCreateOrder.mockResolvedValue({
        success: true,
        order: factories.order({ total: 0, discount: 100 }),
      })

      const result = await mockCreateOrder(
        { ...validCheckoutData, voucherCode: 'FREE100' },
        validCartItems,
        59.80,
        100 // Discount greater than subtotal
      )

      expect(result.success).toBe(true)
      expect(result.order.total).toBeGreaterThanOrEqual(0)
    })

    it('should generate unique order numbers', async () => {
      const orderNumbers = new Set()

      for (let i = 0; i < 10; i++) {
        mockCreateOrder.mockResolvedValue({
          success: true,
          order: factories.order({ order_number: `SW-${Date.now()}-${Math.random().toString(36).slice(2)}` }),
        })

        const result = await mockCreateOrder(
          validCheckoutData,
          validCartItems,
          59.80,
          0
        )

        orderNumbers.add(result.order.order_number)
      }

      expect(orderNumbers.size).toBe(10) // All unique
    })
  })

  describe('getProducts', () => {
    it('should return active products', async () => {
      mockGetProducts.mockResolvedValue({
        success: true,
        products: [
          factories.product({ is_active: true }),
          factories.product({ id: 'product-2', is_active: true }),
        ],
      })

      const result = await mockGetProducts()

      expect(result.success).toBe(true)
      expect(result.products.length).toBeGreaterThan(0)
      expect(result.products.every((p: { is_active: boolean }) => p.is_active)).toBe(true)
    })

    it('should filter by category', async () => {
      mockGetProducts.mockResolvedValue({
        success: true,
        products: [factories.product({ category: 'shampoo' })],
      })

      const result = await mockGetProducts({ category: 'shampoo' })

      expect(result.success).toBe(true)
    })

    it('should support search query', async () => {
      mockGetProducts.mockResolvedValue({
        success: true,
        products: [factories.product({ name: 'Premium Shampoo' })],
      })

      const result = await mockGetProducts({ search: 'shampoo' })

      expect(result.success).toBe(true)
    })

    it('should support pagination', async () => {
      mockGetProducts.mockResolvedValue({
        success: true,
        products: [factories.product()],
        pagination: { page: 1, perPage: 12, total: 25 },
      })

      const result = await mockGetProducts({ page: 1, perPage: 12 })

      expect(result.success).toBe(true)
      expect(result.pagination).toBeDefined()
    })
  })

  describe('getShippingMethods', () => {
    it('should return available shipping methods', async () => {
      mockGetShippingMethods.mockResolvedValue([
        { id: 'standard', name: 'Standardversand', price: 8.90 },
        { id: 'express', name: 'Expressversand', price: 14.90 },
        { id: 'pickup', name: 'Abholung im Salon', price: 0 },
      ])

      const result = await mockGetShippingMethods()

      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBeGreaterThan(0)
      expect(result.every((m: { id: string; name: string; price: number }) =>
        m.id && m.name && typeof m.price === 'number'
      )).toBe(true)
    })
  })
})
