/**
 * Booking Domain Logic
 *
 * Core business rules for appointment booking, validation, and slot management.
 */

import { addMinutes, isBefore, isAfter, startOfDay, addDays, differenceInMinutes } from 'date-fns'

export interface BookingRules {
  minLeadTimeMinutes: number
  maxHorizonDays: number
  cancellationCutoffHours: number
  slotGranularityMinutes: number
  bufferBetweenBookingsMinutes: number
}

export interface TimeSlot {
  staffId: string
  startsAt: Date
  endsAt: Date
  available: boolean
}

export interface Service {
  id: string
  name: string
  durationMinutes: number
  price: number
}

export interface Appointment {
  id: string
  staffId: string
  customerId: string
  startsAt: Date
  endsAt: Date
  status: 'reserved' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  services: Service[]
}

export interface OpeningHours {
  dayOfWeek: number // 0 = Sunday, 1 = Monday, etc.
  openMinutes: number // Minutes from midnight
  closeMinutes: number
}

export interface StaffWorkingHours {
  staffId: string
  dayOfWeek: number
  startMinutes: number
  endMinutes: number
}

/**
 * Default booking rules
 */
export const DEFAULT_BOOKING_RULES: BookingRules = {
  minLeadTimeMinutes: 120, // 2 hours
  maxHorizonDays: 30,
  cancellationCutoffHours: 24,
  slotGranularityMinutes: 15,
  bufferBetweenBookingsMinutes: 0,
}

/**
 * Calculate total duration for a list of services
 */
export function calculateTotalDuration(services: Service[]): number {
  return services.reduce((total, service) => total + service.durationMinutes, 0)
}

/**
 * Calculate total price for a list of services
 */
export function calculateTotalPrice(services: Service[]): number {
  return services.reduce((total, service) => total + service.price, 0)
}

/**
 * Check if a booking time respects the minimum lead time rule
 */
export function isWithinLeadTime(
  bookingTime: Date,
  now: Date,
  minLeadTimeMinutes: number
): boolean {
  const earliestBookingTime = addMinutes(now, minLeadTimeMinutes)
  return !isBefore(bookingTime, earliestBookingTime)
}

/**
 * Check if a booking time is within the booking horizon
 */
export function isWithinHorizon(
  bookingTime: Date,
  now: Date,
  maxHorizonDays: number
): boolean {
  const latestBookingDate = addDays(startOfDay(now), maxHorizonDays)
  return isBefore(bookingTime, latestBookingDate)
}

/**
 * Check if cancellation is allowed based on cutoff time
 */
export function canCancelAppointment(
  appointmentTime: Date,
  now: Date,
  cancellationCutoffHours: number
): boolean {
  const cutoffTime = addMinutes(now, cancellationCutoffHours * 60)
  return isAfter(appointmentTime, cutoffTime)
}

/**
 * Check if two time ranges overlap
 */
export function doTimesOverlap(
  start1: Date,
  end1: Date,
  start2: Date,
  end2: Date
): boolean {
  return isBefore(start1, end2) && isAfter(end1, start2)
}

/**
 * Check if a slot conflicts with existing appointments
 */
export function hasSlotConflict(
  slotStart: Date,
  slotEnd: Date,
  existingAppointments: Appointment[]
): boolean {
  return existingAppointments.some(
    (apt) =>
      apt.status !== 'cancelled' &&
      doTimesOverlap(slotStart, slotEnd, apt.startsAt, apt.endsAt)
  )
}

/**
 * Validate booking rules for a proposed appointment
 */
export function validateBookingRules(
  proposedTime: Date,
  duration: number,
  existingAppointments: Appointment[],
  rules: BookingRules,
  now: Date = new Date()
): { valid: boolean; error?: string } {
  // Check lead time
  if (!isWithinLeadTime(proposedTime, now, rules.minLeadTimeMinutes)) {
    return {
      valid: false,
      error: `Termine müssen mindestens ${rules.minLeadTimeMinutes / 60} Stunden im Voraus gebucht werden.`,
    }
  }

  // Check booking horizon
  if (!isWithinHorizon(proposedTime, now, rules.maxHorizonDays)) {
    return {
      valid: false,
      error: `Termine können maximal ${rules.maxHorizonDays} Tage im Voraus gebucht werden.`,
    }
  }

  // Check for conflicts
  const endTime = addMinutes(proposedTime, duration)
  if (hasSlotConflict(proposedTime, endTime, existingAppointments)) {
    return {
      valid: false,
      error: 'Dieser Termin ist leider nicht mehr verfügbar.',
    }
  }

  return { valid: true }
}

/**
 * Generate time slots for a given day
 */
export function generateTimeSlots(
  date: Date,
  staffId: string,
  duration: number,
  openingHours: OpeningHours,
  staffWorkingHours: StaffWorkingHours | null,
  existingAppointments: Appointment[],
  rules: BookingRules,
  now: Date = new Date()
): TimeSlot[] {
  const slots: TimeSlot[] = []
  const dayOfWeek = date.getDay()

  // Check if salon is open on this day
  if (openingHours.dayOfWeek !== dayOfWeek) {
    return slots
  }

  // Check if staff is working on this day
  if (!staffWorkingHours || staffWorkingHours.dayOfWeek !== dayOfWeek) {
    return slots
  }

  // Calculate effective working period (intersection of salon and staff hours)
  const effectiveStartMinutes = Math.max(openingHours.openMinutes, staffWorkingHours.startMinutes)
  const effectiveEndMinutes = Math.min(openingHours.closeMinutes, staffWorkingHours.endMinutes)

  // Generate slots
  const dayStart = startOfDay(date)
  let currentMinutes = effectiveStartMinutes

  while (currentMinutes + duration <= effectiveEndMinutes) {
    const slotStart = addMinutes(dayStart, currentMinutes)
    const slotEnd = addMinutes(slotStart, duration)

    // Check if slot is valid according to booking rules
    const validation = validateBookingRules(
      slotStart,
      duration,
      existingAppointments.filter((apt) => apt.staffId === staffId),
      rules,
      now
    )

    slots.push({
      staffId,
      startsAt: slotStart,
      endsAt: slotEnd,
      available: validation.valid,
    })

    currentMinutes += rules.slotGranularityMinutes
  }

  return slots
}

/**
 * Calculate minutes until appointment
 */
export function getMinutesUntilAppointment(appointmentTime: Date, now: Date = new Date()): number {
  return differenceInMinutes(appointmentTime, now)
}
