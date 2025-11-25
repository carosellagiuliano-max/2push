import { describe, it, expect } from 'vitest'
import {
  calculateTotalDuration,
  calculateTotalPrice,
  isWithinLeadTime,
  isWithinHorizon,
  canCancelAppointment,
  doTimesOverlap,
  hasSlotConflict,
  validateBookingRules,
  generateTimeSlots,
  DEFAULT_BOOKING_RULES,
  type Service,
  type Appointment,
  type OpeningHours,
  type StaffWorkingHours,
} from './booking'
import { addMinutes, addDays, addHours, startOfDay, setHours, setMinutes } from 'date-fns'

// Test fixtures
const mockServices: Service[] = [
  { id: '1', name: 'Herrenhaarschnitt', durationMinutes: 30, price: 45 },
  { id: '2', name: 'Damenhaarschnitt', durationMinutes: 45, price: 65 },
  { id: '3', name: 'Coloration', durationMinutes: 90, price: 120 },
]

const baseDate = new Date('2025-01-20T10:00:00Z')

describe('Booking Domain Logic', () => {
  describe('calculateTotalDuration', () => {
    it('should return 0 for empty services array', () => {
      expect(calculateTotalDuration([])).toBe(0)
    })

    it('should calculate total duration for single service', () => {
      expect(calculateTotalDuration([mockServices[0]])).toBe(30)
    })

    it('should calculate total duration for multiple services', () => {
      expect(calculateTotalDuration(mockServices)).toBe(165) // 30 + 45 + 90
    })
  })

  describe('calculateTotalPrice', () => {
    it('should return 0 for empty services array', () => {
      expect(calculateTotalPrice([])).toBe(0)
    })

    it('should calculate total price for single service', () => {
      expect(calculateTotalPrice([mockServices[0]])).toBe(45)
    })

    it('should calculate total price for multiple services', () => {
      expect(calculateTotalPrice(mockServices)).toBe(230) // 45 + 65 + 120
    })
  })

  describe('isWithinLeadTime', () => {
    it('should return true when booking is after lead time', () => {
      const now = baseDate
      const bookingTime = addHours(now, 3) // 3 hours from now
      expect(isWithinLeadTime(bookingTime, now, 120)).toBe(true) // 2 hours lead time
    })

    it('should return false when booking is before lead time', () => {
      const now = baseDate
      const bookingTime = addHours(now, 1) // 1 hour from now
      expect(isWithinLeadTime(bookingTime, now, 120)).toBe(false) // 2 hours lead time
    })

    it('should return true when booking is exactly at lead time', () => {
      const now = baseDate
      const bookingTime = addMinutes(now, 120) // Exactly 2 hours
      expect(isWithinLeadTime(bookingTime, now, 120)).toBe(true)
    })
  })

  describe('isWithinHorizon', () => {
    it('should return true when booking is within horizon', () => {
      const now = baseDate
      const bookingTime = addDays(now, 15) // 15 days from now
      expect(isWithinHorizon(bookingTime, now, 30)).toBe(true) // 30 days horizon
    })

    it('should return false when booking is beyond horizon', () => {
      const now = baseDate
      const bookingTime = addDays(now, 45) // 45 days from now
      expect(isWithinHorizon(bookingTime, now, 30)).toBe(false) // 30 days horizon
    })

    it('should return true when booking is on the last day of horizon', () => {
      const now = baseDate
      const bookingTime = addDays(startOfDay(now), 29) // Day 29 (within 30 day horizon)
      expect(isWithinHorizon(bookingTime, now, 30)).toBe(true)
    })
  })

  describe('canCancelAppointment', () => {
    it('should allow cancellation when appointment is after cutoff', () => {
      const now = baseDate
      const appointmentTime = addHours(now, 48) // 48 hours from now
      expect(canCancelAppointment(appointmentTime, now, 24)).toBe(true) // 24 hour cutoff
    })

    it('should disallow cancellation when appointment is within cutoff', () => {
      const now = baseDate
      const appointmentTime = addHours(now, 12) // 12 hours from now
      expect(canCancelAppointment(appointmentTime, now, 24)).toBe(false) // 24 hour cutoff
    })

    it('should disallow cancellation when appointment is in the past', () => {
      const now = baseDate
      const appointmentTime = addHours(now, -1) // 1 hour ago
      expect(canCancelAppointment(appointmentTime, now, 24)).toBe(false)
    })
  })

  describe('doTimesOverlap', () => {
    it('should detect overlapping times', () => {
      const start1 = baseDate
      const end1 = addHours(baseDate, 2)
      const start2 = addHours(baseDate, 1)
      const end2 = addHours(baseDate, 3)
      expect(doTimesOverlap(start1, end1, start2, end2)).toBe(true)
    })

    it('should return false for non-overlapping times', () => {
      const start1 = baseDate
      const end1 = addHours(baseDate, 1)
      const start2 = addHours(baseDate, 2)
      const end2 = addHours(baseDate, 3)
      expect(doTimesOverlap(start1, end1, start2, end2)).toBe(false)
    })

    it('should return false for adjacent times (no overlap)', () => {
      const start1 = baseDate
      const end1 = addHours(baseDate, 1)
      const start2 = addHours(baseDate, 1) // Starts exactly when first ends
      const end2 = addHours(baseDate, 2)
      expect(doTimesOverlap(start1, end1, start2, end2)).toBe(false)
    })

    it('should detect when one time range contains another', () => {
      const start1 = baseDate
      const end1 = addHours(baseDate, 4)
      const start2 = addHours(baseDate, 1)
      const end2 = addHours(baseDate, 2)
      expect(doTimesOverlap(start1, end1, start2, end2)).toBe(true)
    })
  })

  describe('hasSlotConflict', () => {
    const existingAppointments: Appointment[] = [
      {
        id: '1',
        staffId: 'staff-1',
        customerId: 'customer-1',
        startsAt: setMinutes(setHours(baseDate, 14), 0),
        endsAt: setMinutes(setHours(baseDate, 15), 0),
        status: 'confirmed',
        services: [mockServices[0]],
      },
    ]

    it('should detect conflict with existing appointment', () => {
      const slotStart = setMinutes(setHours(baseDate, 14), 30)
      const slotEnd = setMinutes(setHours(baseDate, 15), 30)
      expect(hasSlotConflict(slotStart, slotEnd, existingAppointments)).toBe(true)
    })

    it('should not detect conflict when times do not overlap', () => {
      const slotStart = setMinutes(setHours(baseDate, 16), 0)
      const slotEnd = setMinutes(setHours(baseDate, 17), 0)
      expect(hasSlotConflict(slotStart, slotEnd, existingAppointments)).toBe(false)
    })

    it('should ignore cancelled appointments', () => {
      const cancelledAppointments: Appointment[] = [
        {
          id: '1',
          staffId: 'staff-1',
          customerId: 'customer-1',
          startsAt: setMinutes(setHours(baseDate, 14), 0),
          endsAt: setMinutes(setHours(baseDate, 15), 0),
          status: 'cancelled',
          services: [mockServices[0]],
        },
      ]
      const slotStart = setMinutes(setHours(baseDate, 14), 0)
      const slotEnd = setMinutes(setHours(baseDate, 15), 0)
      expect(hasSlotConflict(slotStart, slotEnd, cancelledAppointments)).toBe(false)
    })
  })

  describe('validateBookingRules', () => {
    it('should return valid for a valid booking', () => {
      const proposedTime = addHours(baseDate, 4)
      const result = validateBookingRules(proposedTime, 60, [], DEFAULT_BOOKING_RULES, baseDate)
      expect(result.valid).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error for booking before lead time', () => {
      const proposedTime = addMinutes(baseDate, 30)
      const result = validateBookingRules(proposedTime, 60, [], DEFAULT_BOOKING_RULES, baseDate)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Stunden im Voraus')
    })

    it('should return error for booking beyond horizon', () => {
      const proposedTime = addDays(baseDate, 60)
      const result = validateBookingRules(proposedTime, 60, [], DEFAULT_BOOKING_RULES, baseDate)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Tage im Voraus')
    })

    it('should return error for conflicting booking', () => {
      const proposedTime = setMinutes(setHours(baseDate, 14), 0)
      const existingAppointments: Appointment[] = [
        {
          id: '1',
          staffId: 'staff-1',
          customerId: 'customer-1',
          startsAt: setMinutes(setHours(baseDate, 14), 0),
          endsAt: setMinutes(setHours(baseDate, 15), 0),
          status: 'confirmed',
          services: [mockServices[0]],
        },
      ]
      const result = validateBookingRules(
        proposedTime,
        60,
        existingAppointments,
        DEFAULT_BOOKING_RULES,
        baseDate
      )
      expect(result.valid).toBe(false)
      expect(result.error).toContain('nicht mehr verfügbar')
    })
  })

  describe('generateTimeSlots', () => {
    const openingHours: OpeningHours = {
      dayOfWeek: 1, // Monday
      openMinutes: 540, // 9:00
      closeMinutes: 1080, // 18:00
    }

    const staffWorkingHours: StaffWorkingHours = {
      staffId: 'staff-1',
      dayOfWeek: 1, // Monday
      startMinutes: 540, // 9:00
      endMinutes: 1020, // 17:00
    }

    // Use a Monday for testing
    const monday = new Date('2025-01-27T08:00:00Z')

    it('should generate slots for a working day', () => {
      const slots = generateTimeSlots(
        monday,
        'staff-1',
        30,
        openingHours,
        staffWorkingHours,
        [],
        DEFAULT_BOOKING_RULES,
        monday
      )
      expect(slots.length).toBeGreaterThan(0)
    })

    it('should return empty array when salon is closed', () => {
      const sunday = new Date('2025-01-26T08:00:00Z')
      const slots = generateTimeSlots(
        sunday,
        'staff-1',
        30,
        openingHours,
        staffWorkingHours,
        [],
        DEFAULT_BOOKING_RULES,
        sunday
      )
      expect(slots.length).toBe(0)
    })

    it('should return empty array when staff is not working', () => {
      const slots = generateTimeSlots(
        monday,
        'staff-1',
        30,
        openingHours,
        null,
        [],
        DEFAULT_BOOKING_RULES,
        monday
      )
      expect(slots.length).toBe(0)
    })

    it('should mark conflicting slots as unavailable', () => {
      const existingAppointments: Appointment[] = [
        {
          id: '1',
          staffId: 'staff-1',
          customerId: 'customer-1',
          startsAt: setMinutes(setHours(monday, 14), 0),
          endsAt: setMinutes(setHours(monday, 15), 0),
          status: 'confirmed',
          services: [mockServices[0]],
        },
      ]

      const slots = generateTimeSlots(
        monday,
        'staff-1',
        30,
        openingHours,
        staffWorkingHours,
        existingAppointments,
        DEFAULT_BOOKING_RULES,
        monday
      )

      // Find the slot at 14:00
      const conflictingSlot = slots.find(
        (s) => s.startsAt.getHours() === 14 && s.startsAt.getMinutes() === 0
      )

      // It should exist but be marked as unavailable
      expect(conflictingSlot).toBeDefined()
      expect(conflictingSlot?.available).toBe(false)
    })
  })
})
