/**
 * Test Setup and Utilities
 *
 * Global test configuration and helper functions.
 */

import { vi } from 'vitest'

// Mock Supabase client
export const mockSupabaseClient = {
  auth: {
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    signOut: vi.fn(),
    getUser: vi.fn(),
    getSession: vi.fn(),
  },
  from: vi.fn(() => ({
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    single: vi.fn(),
    maybeSingle: vi.fn(),
  })),
}

// Mock createClient
vi.mock('@/lib/supabase/server', () => ({
  createClient: vi.fn(() => Promise.resolve(mockSupabaseClient)),
}))

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => mockSupabaseClient),
}))

// Mock email notifications
vi.mock('@/lib/notifications', () => ({
  sendBookingConfirmation: vi.fn(() => Promise.resolve()),
  sendOrderConfirmation: vi.fn(() => Promise.resolve()),
  sendEmail: vi.fn(() => Promise.resolve()),
}))

// Test data factories
export const factories = {
  salon: (overrides = {}) => ({
    id: 'salon-test-123',
    name: 'Test Salon',
    slug: 'test-salon',
    email: 'test@salon.ch',
    phone: '+41 71 123 45 67',
    street: 'Teststrasse 1',
    city: 'St. Gallen',
    postal_code: '9000',
    country: 'CH',
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    primary_color: '#b87444',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  customer: (overrides = {}) => ({
    id: 'customer-test-123',
    salon_id: 'salon-test-123',
    first_name: 'Max',
    last_name: 'Mustermann',
    email: 'max@test.ch',
    phone: '+41 79 123 45 67',
    is_active: true,
    total_visits: 0,
    total_spend: 0,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  staff: (overrides = {}) => ({
    id: 'staff-test-123',
    salon_id: 'salon-test-123',
    display_name: 'Anna Stylist',
    email: 'anna@salon.ch',
    color: '#b87444',
    is_bookable: true,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  service: (overrides = {}) => ({
    id: 'service-test-123',
    salon_id: 'salon-test-123',
    name: 'Haarschnitt Herren',
    slug: 'haarschnitt-herren',
    duration_minutes: 30,
    buffer_after_minutes: 5,
    is_online_bookable: true,
    is_active: true,
    sort_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  appointment: (overrides = {}) => ({
    id: 'appointment-test-123',
    salon_id: 'salon-test-123',
    customer_id: 'customer-test-123',
    staff_id: 'staff-test-123',
    starts_at: new Date().toISOString(),
    ends_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    status: 'confirmed',
    booked_online: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  product: (overrides = {}) => ({
    id: 'product-test-123',
    salon_id: 'salon-test-123',
    name: 'Shampoo Premium',
    slug: 'shampoo-premium',
    sku: 'SHMP-001',
    price: 29.90,
    stock_quantity: 50,
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  order: (overrides = {}) => ({
    id: 'order-test-123',
    order_number: 'SW-TEST-001',
    customer_id: 'customer-test-123',
    status: 'pending',
    subtotal: 100,
    shipping_cost: 8.90,
    discount: 0,
    total: 108.90,
    payment_method: 'card',
    payment_status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  }),

  user: (overrides = {}) => ({
    id: 'user-test-123',
    email: 'user@test.ch',
    first_name: 'Test',
    last_name: 'User',
    is_active: true,
    created_at: new Date().toISOString(),
    ...overrides,
  }),
}

// Form data helper
export function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData()
  Object.entries(data).forEach(([key, value]) => {
    formData.set(key, value)
  })
  return formData
}

// Reset all mocks between tests
export function resetMocks() {
  vi.clearAllMocks()
}

// Setup mock responses
export function setupMockResponse(table: string, data: unknown, error: unknown = null) {
  const mockChain = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    delete: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    in: vi.fn().mockReturnThis(),
    is: vi.fn().mockReturnThis(),
    or: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data, error }),
    maybeSingle: vi.fn().mockResolvedValue({ data, error }),
  }

  // @ts-expect-error - mocking supabase client
  mockSupabaseClient.from.mockImplementation((t: string) => {
    if (t === table) return mockChain
    return mockChain
  })

  return mockChain
}
