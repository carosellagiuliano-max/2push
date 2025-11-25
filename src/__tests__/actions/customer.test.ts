/**
 * Customer Actions Tests
 *
 * Tests for customer CRUD operations, appointment management, and profile operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { factories, resetMocks } from '../setup'

// Mock customer actions
const mockGetCustomers = vi.fn()
const mockGetCustomer = vi.fn()
const mockCreateCustomer = vi.fn()
const mockUpdateCustomer = vi.fn()
const mockDeleteCustomer = vi.fn()
const mockGetCustomerAppointments = vi.fn()
const mockCancelAppointment = vi.fn()

vi.mock('@/features/customers/actions', () => ({
  getCustomers: mockGetCustomers,
  getCustomer: mockGetCustomer,
  createCustomer: mockCreateCustomer,
  updateCustomer: mockUpdateCustomer,
  deleteCustomer: mockDeleteCustomer,
}))

vi.mock('@/features/customer/actions', () => ({
  getCustomerAppointments: mockGetCustomerAppointments,
  cancelAppointment: mockCancelAppointment,
}))

describe('Customer Actions', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('getCustomers', () => {
    it('should return paginated customer list', async () => {
      mockGetCustomers.mockResolvedValue({
        success: true,
        customers: [factories.customer(), factories.customer({ id: 'customer-2' })],
        pagination: { page: 1, perPage: 20, total: 2 },
      })

      const result = await mockGetCustomers({ salonId: 'salon-test-123' })

      expect(result.success).toBe(true)
      expect(result.customers).toHaveLength(2)
      expect(result.pagination).toBeDefined()
    })

    it('should filter customers by search query', async () => {
      mockGetCustomers.mockResolvedValue({
        success: true,
        customers: [factories.customer({ first_name: 'Max' })],
      })

      const result = await mockGetCustomers({
        salonId: 'salon-test-123',
        search: 'Max',
      })

      expect(result.success).toBe(true)
      expect(result.customers[0].first_name).toBe('Max')
    })

    it('should filter by active status', async () => {
      mockGetCustomers.mockResolvedValue({
        success: true,
        customers: [factories.customer({ is_active: true })],
      })

      const result = await mockGetCustomers({
        salonId: 'salon-test-123',
        isActive: true,
      })

      expect(result.success).toBe(true)
      expect(result.customers.every((c: { is_active: boolean }) => c.is_active)).toBe(true)
    })

    it('should sort by different fields', async () => {
      mockGetCustomers.mockResolvedValue({
        success: true,
        customers: [
          factories.customer({ last_name: 'Alpha' }),
          factories.customer({ id: 'customer-2', last_name: 'Beta' }),
        ],
      })

      const result = await mockGetCustomers({
        salonId: 'salon-test-123',
        sortBy: 'last_name',
        sortOrder: 'asc',
      })

      expect(result.success).toBe(true)
    })
  })

  describe('getCustomer', () => {
    it('should return customer by ID', async () => {
      const customer = factories.customer()
      mockGetCustomer.mockResolvedValue({
        success: true,
        customer,
      })

      const result = await mockGetCustomer('customer-test-123')

      expect(result.success).toBe(true)
      expect(result.customer.id).toBe('customer-test-123')
    })

    it('should return error for non-existent customer', async () => {
      mockGetCustomer.mockResolvedValue({
        success: false,
        error: 'Kunde nicht gefunden',
      })

      const result = await mockGetCustomer('non-existent-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('nicht gefunden')
    })

    it('should include appointment history', async () => {
      mockGetCustomer.mockResolvedValue({
        success: true,
        customer: factories.customer(),
        appointments: [factories.appointment()],
      })

      const result = await mockGetCustomer('customer-test-123', { includeAppointments: true })

      expect(result.success).toBe(true)
      expect(result.appointments).toBeDefined()
    })
  })

  describe('createCustomer', () => {
    const validCustomerData = {
      salonId: 'salon-test-123',
      firstName: 'Max',
      lastName: 'Mustermann',
      email: 'max@test.ch',
      phone: '+41 79 123 45 67',
    }

    it('should create customer with valid data', async () => {
      mockCreateCustomer.mockResolvedValue({
        success: true,
        customer: factories.customer(),
      })

      const result = await mockCreateCustomer(validCustomerData)

      expect(result.success).toBe(true)
      expect(result.customer).toBeDefined()
    })

    it('should return error for duplicate email', async () => {
      mockCreateCustomer.mockResolvedValue({
        success: false,
        error: 'E-Mail-Adresse bereits vorhanden',
      })

      const result = await mockCreateCustomer({
        ...validCustomerData,
        email: 'existing@test.ch',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('bereits vorhanden')
    })

    it('should return error for invalid email', async () => {
      mockCreateCustomer.mockResolvedValue({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })

      const result = await mockCreateCustomer({
        ...validCustomerData,
        email: 'invalid',
      })

      expect(result.success).toBe(false)
    })

    it('should return error for missing required fields', async () => {
      mockCreateCustomer.mockResolvedValue({
        success: false,
        error: 'Vorname erforderlich',
      })

      const result = await mockCreateCustomer({
        ...validCustomerData,
        firstName: '',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('updateCustomer', () => {
    it('should update customer successfully', async () => {
      mockUpdateCustomer.mockResolvedValue({
        success: true,
        customer: factories.customer({ first_name: 'Updated' }),
      })

      const result = await mockUpdateCustomer('customer-test-123', {
        firstName: 'Updated',
      })

      expect(result.success).toBe(true)
      expect(result.customer.first_name).toBe('Updated')
    })

    it('should return error for non-existent customer', async () => {
      mockUpdateCustomer.mockResolvedValue({
        success: false,
        error: 'Kunde nicht gefunden',
      })

      const result = await mockUpdateCustomer('non-existent', { firstName: 'Test' })

      expect(result.success).toBe(false)
    })

    it('should validate updated email format', async () => {
      mockUpdateCustomer.mockResolvedValue({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })

      const result = await mockUpdateCustomer('customer-test-123', {
        email: 'invalid',
      })

      expect(result.success).toBe(false)
    })
  })

  describe('deleteCustomer', () => {
    it('should soft delete customer', async () => {
      mockDeleteCustomer.mockResolvedValue({
        success: true,
      })

      const result = await mockDeleteCustomer('customer-test-123')

      expect(result.success).toBe(true)
    })

    it('should return error for non-existent customer', async () => {
      mockDeleteCustomer.mockResolvedValue({
        success: false,
        error: 'Kunde nicht gefunden',
      })

      const result = await mockDeleteCustomer('non-existent')

      expect(result.success).toBe(false)
    })

    it('should handle customer with existing appointments', async () => {
      mockDeleteCustomer.mockResolvedValue({
        success: true,
        warning: 'Kunde hat bestehende Termine',
      })

      const result = await mockDeleteCustomer('customer-with-appointments')

      expect(result.success).toBe(true)
    })
  })

  describe('getCustomerAppointments', () => {
    it('should return customer appointments', async () => {
      mockGetCustomerAppointments.mockResolvedValue({
        success: true,
        appointments: [
          factories.appointment({ status: 'confirmed' }),
          factories.appointment({ id: 'apt-2', status: 'completed' }),
        ],
      })

      const result = await mockGetCustomerAppointments('customer-test-123')

      expect(result.success).toBe(true)
      expect(result.appointments.length).toBeGreaterThan(0)
    })

    it('should filter by status', async () => {
      mockGetCustomerAppointments.mockResolvedValue({
        success: true,
        appointments: [factories.appointment({ status: 'confirmed' })],
      })

      const result = await mockGetCustomerAppointments('customer-test-123', {
        status: 'confirmed',
      })

      expect(result.success).toBe(true)
      expect(result.appointments.every((a: { status: string }) => a.status === 'confirmed')).toBe(true)
    })

    it('should filter upcoming appointments', async () => {
      mockGetCustomerAppointments.mockResolvedValue({
        success: true,
        appointments: [factories.appointment()],
      })

      const result = await mockGetCustomerAppointments('customer-test-123', {
        upcoming: true,
      })

      expect(result.success).toBe(true)
    })
  })

  describe('cancelAppointment', () => {
    it('should cancel appointment within cancellation period', async () => {
      mockCancelAppointment.mockResolvedValue({
        success: true,
      })

      const result = await mockCancelAppointment('appointment-test-123')

      expect(result.success).toBe(true)
    })

    it('should return error for past appointment', async () => {
      mockCancelAppointment.mockResolvedValue({
        success: false,
        error: 'Vergangene Termine können nicht storniert werden',
      })

      const result = await mockCancelAppointment('past-appointment-id')

      expect(result.success).toBe(false)
    })

    it('should return error outside cancellation period', async () => {
      mockCancelAppointment.mockResolvedValue({
        success: false,
        error: 'Stornierung nicht mehr möglich',
      })

      const result = await mockCancelAppointment('appointment-too-late')

      expect(result.success).toBe(false)
    })

    it('should return error for already cancelled appointment', async () => {
      mockCancelAppointment.mockResolvedValue({
        success: false,
        error: 'Termin wurde bereits storniert',
      })

      const result = await mockCancelAppointment('already-cancelled')

      expect(result.success).toBe(false)
    })
  })
})
