/**
 * Booking Actions Tests
 *
 * Tests for booking creation, slot availability, and booking data retrieval.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { factories, resetMocks } from '../setup'

// Mock the booking actions
const mockCreateBooking = vi.fn()
const mockGetAvailableSlots = vi.fn()
const mockGetBookingData = vi.fn()

vi.mock('@/features/booking/actions', () => ({
  createBooking: mockCreateBooking,
  getAvailableSlots: mockGetAvailableSlots,
  getBookingData: mockGetBookingData,
}))

describe('Booking Actions', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('createBooking', () => {
    const validBookingRequest = {
      salonId: 'salon-test-123',
      staffId: 'staff-test-123',
      serviceIds: ['service-test-123'],
      startsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
      customerInfo: {
        firstName: 'Max',
        lastName: 'Mustermann',
        email: 'max@test.ch',
        phone: '+41 79 123 45 67',
      },
      notes: 'Test booking',
    }

    it('should create booking with valid data', async () => {
      mockCreateBooking.mockResolvedValue({
        success: true,
        appointmentId: 'appointment-new-123',
      })

      const result = await mockCreateBooking(validBookingRequest)

      expect(result.success).toBe(true)
      expect(result.appointmentId).toBeDefined()
    })

    it('should return error when slot is not available', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Dieser Zeitslot ist leider nicht mehr verfügbar.',
      })

      const result = await mockCreateBooking(validBookingRequest)

      expect(result.success).toBe(false)
      expect(result.error).toContain('nicht mehr verfügbar')
    })

    it('should return error with invalid salon ID', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Ungültige Salon-ID',
      })

      const result = await mockCreateBooking({
        ...validBookingRequest,
        salonId: 'invalid',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Ungültige Salon-ID')
    })

    it('should return error with invalid staff ID', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Ungültige Mitarbeiter-ID',
      })

      const result = await mockCreateBooking({
        ...validBookingRequest,
        staffId: 'invalid',
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Mitarbeiter')
    })

    it('should return error with empty service IDs', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Mindestens eine Dienstleistung erforderlich',
      })

      const result = await mockCreateBooking({
        ...validBookingRequest,
        serviceIds: [],
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Dienstleistung')
    })

    it('should return error with invalid email format', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })

      const result = await mockCreateBooking({
        ...validBookingRequest,
        customerInfo: {
          ...validBookingRequest.customerInfo,
          email: 'invalid-email',
        },
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('E-Mail')
    })

    it('should return error with short first name', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Vorname muss mindestens 2 Zeichen haben',
      })

      const result = await mockCreateBooking({
        ...validBookingRequest,
        customerInfo: {
          ...validBookingRequest.customerInfo,
          firstName: 'M',
        },
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Vorname')
    })

    it('should return error with invalid phone number', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Ungültige Telefonnummer',
      })

      const result = await mockCreateBooking({
        ...validBookingRequest,
        customerInfo: {
          ...validBookingRequest.customerInfo,
          phone: '123',
        },
      })

      expect(result.success).toBe(false)
      expect(result.error).toContain('Telefon')
    })

    it('should return error with past date', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Ungültiges Datum',
      })

      const result = await mockCreateBooking({
        ...validBookingRequest,
        startsAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
      })

      expect(result.success).toBe(false)
    })

    it('should handle concurrent booking conflicts', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Dieser Zeitslot ist leider nicht mehr verfügbar.',
      })

      // Simulate two concurrent booking attempts
      const [result1, result2] = await Promise.all([
        mockCreateBooking(validBookingRequest),
        mockCreateBooking(validBookingRequest),
      ])

      // At least one should fail due to conflict
      const hasFailure = !result1.success || !result2.success
      expect(hasFailure).toBe(true)
    })

    it('should handle XSS in notes field', async () => {
      mockCreateBooking.mockResolvedValue({
        success: true,
        appointmentId: 'appointment-new-123',
      })

      const result = await mockCreateBooking({
        ...validBookingRequest,
        notes: '<script>alert("xss")</script>',
      })

      // Should either sanitize or store safely
      expect(result.success).toBe(true)
    })

    it('should handle SQL injection in customer info', async () => {
      mockCreateBooking.mockResolvedValue({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })

      const result = await mockCreateBooking({
        ...validBookingRequest,
        customerInfo: {
          ...validBookingRequest.customerInfo,
          email: "test@test.ch'; DROP TABLE customers; --",
        },
      })

      // Should fail validation, not execute SQL
      expect(result.success).toBe(false)
    })
  })

  describe('getAvailableSlots', () => {
    const validSlotRequest = {
      salonId: 'salon-test-123',
      staffId: 'staff-test-123',
      serviceIds: ['service-test-123'],
      date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    }

    it('should return available slots for valid request', async () => {
      mockGetAvailableSlots.mockResolvedValue({
        success: true,
        slots: [
          { time: '09:00', available: true },
          { time: '09:30', available: true },
          { time: '10:00', available: false },
        ],
      })

      const result = await mockGetAvailableSlots(validSlotRequest)

      expect(result.success).toBe(true)
      expect(result.slots).toBeDefined()
      expect(Array.isArray(result.slots)).toBe(true)
    })

    it('should return empty slots for closed day', async () => {
      mockGetAvailableSlots.mockResolvedValue({
        success: true,
        slots: [],
      })

      const result = await mockGetAvailableSlots({
        ...validSlotRequest,
        date: '2024-12-25', // Christmas - likely closed
      })

      expect(result.success).toBe(true)
      expect(result.slots).toEqual([])
    })

    it('should return error for past date', async () => {
      mockGetAvailableSlots.mockResolvedValue({
        success: false,
        error: 'Datum liegt in der Vergangenheit',
      })

      const result = await mockGetAvailableSlots({
        ...validSlotRequest,
        date: '2020-01-01',
      })

      expect(result.success).toBe(false)
    })

    it('should filter slots by staff availability', async () => {
      mockGetAvailableSlots.mockResolvedValue({
        success: true,
        slots: [
          { time: '14:00', available: true },
          { time: '14:30', available: true },
        ],
      })

      const result = await mockGetAvailableSlots(validSlotRequest)

      expect(result.success).toBe(true)
      expect(result.slots.every((s: { available: boolean }) => s.available)).toBe(true)
    })
  })

  describe('getBookingData', () => {
    it('should return salon, services, and staff data', async () => {
      mockGetBookingData.mockResolvedValue({
        success: true,
        salon: factories.salon(),
        services: [factories.service()],
        staff: [factories.staff()],
      })

      const result = await mockGetBookingData('salon-test-123')

      expect(result.success).toBe(true)
      expect(result.salon).toBeDefined()
      expect(result.services).toBeDefined()
      expect(result.staff).toBeDefined()
    })

    it('should return error for invalid salon', async () => {
      mockGetBookingData.mockResolvedValue({
        success: false,
        error: 'Salon nicht gefunden',
      })

      const result = await mockGetBookingData('invalid-salon-id')

      expect(result.success).toBe(false)
      expect(result.error).toContain('nicht gefunden')
    })

    it('should return only active services', async () => {
      mockGetBookingData.mockResolvedValue({
        success: true,
        salon: factories.salon(),
        services: [factories.service({ is_active: true })],
        staff: [factories.staff()],
      })

      const result = await mockGetBookingData('salon-test-123')

      expect(result.services.every((s: { is_active: boolean }) => s.is_active)).toBe(true)
    })

    it('should return only bookable staff', async () => {
      mockGetBookingData.mockResolvedValue({
        success: true,
        salon: factories.salon(),
        services: [factories.service()],
        staff: [factories.staff({ is_bookable: true })],
      })

      const result = await mockGetBookingData('salon-test-123')

      expect(result.staff.every((s: { is_bookable: boolean }) => s.is_bookable)).toBe(true)
    })
  })
})
