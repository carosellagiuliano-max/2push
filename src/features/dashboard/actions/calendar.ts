'use server'

import { z } from 'zod'
import { startOfDay, endOfDay, addMinutes, isBefore, isAfter } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logging'
import type { AppointmentStatus } from '@/lib/database.types'
import type { CalendarEvent, CalendarAppointment, StaffColumn } from '../types'

// ============================================
// TYPES
// ============================================

export interface GetCalendarDataParams {
  salonId: string
  startDate: Date
  endDate: Date
}

export interface CalendarData {
  events: CalendarEvent[]
  staff: StaffColumn[]
}

export interface CreateAdminAppointmentInput {
  salonId: string
  staffId: string
  customerId: string
  serviceIds: string[]
  startsAt: string
  notes?: string
  internalNotes?: string
}

export interface UpdateAppointmentInput {
  appointmentId: string
  staffId?: string
  startsAt?: string
  endsAt?: string
  notes?: string
  internalNotes?: string
}

export interface AppointmentActionResult {
  success: boolean
  appointmentId?: string
  error?: string
}

// ============================================
// VALIDATION
// ============================================

const createAppointmentSchema = z.object({
  salonId: z.string().uuid(),
  staffId: z.string().uuid(),
  customerId: z.string().uuid(),
  serviceIds: z.array(z.string().uuid()).min(1, 'Mindestens eine Dienstleistung erforderlich'),
  startsAt: z.string().datetime(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
})

const updateAppointmentSchema = z.object({
  appointmentId: z.string().uuid(),
  staffId: z.string().uuid().optional(),
  startsAt: z.string().datetime().optional(),
  endsAt: z.string().datetime().optional(),
  notes: z.string().optional(),
  internalNotes: z.string().optional(),
})

// ============================================
// FETCH CALENDAR DATA
// ============================================

/**
 * Fetch appointments and staff for calendar display.
 * Returns events formatted for the calendar component.
 */
export async function getCalendarData(params: GetCalendarDataParams): Promise<CalendarData> {
  const supabase = await createClient()
  const { salonId, startDate, endDate } = params

  // Fetch staff for this salon
  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('id, display_name, color, avatar_url')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_name')

  if (staffError) {
    logger.error('Failed to fetch staff', { error: staffError.message, salonId })
    return { events: [], staff: [] }
  }

  const staff: StaffColumn[] = (staffData || []).map((s) => ({
    id: s.id,
    name: s.display_name,
    color: s.color || '#6B7280',
    avatar: s.avatar_url || undefined,
  }))

  // Fetch appointments with related data
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select(`
      *,
      customer:customers (id, first_name, last_name, phone, email),
      staff:staff (id, display_name, color, avatar_url),
      appointment_services (
        id,
        service_id,
        service_name,
        duration_minutes,
        snapshot_price
      )
    `)
    .eq('salon_id', salonId)
    .gte('starts_at', startOfDay(startDate).toISOString())
    .lte('starts_at', endOfDay(endDate).toISOString())
    .not('status', 'eq', 'cancelled')
    .order('starts_at')

  if (appointmentsError) {
    logger.error('Failed to fetch appointments', { error: appointmentsError.message, salonId })
    return { events: [], staff }
  }

  // Fetch blocked times
  const { data: blockedTimes } = await supabase
    .from('blocked_times')
    .select('id, staff_id, reason, starts_at, ends_at, block_type')
    .eq('salon_id', salonId)
    .gte('starts_at', startOfDay(startDate).toISOString())
    .lte('ends_at', endOfDay(endDate).toISOString())

  // Convert appointments to calendar events
  const events: CalendarEvent[] = []

  for (const apt of appointments || []) {
    const staffInfo = apt.staff as { id: string; display_name: string; color: string; avatar_url: string | null }
    const customerInfo = apt.customer as { id: string; first_name: string; last_name: string; phone: string; email: string }
    const services = apt.appointment_services as Array<{
      id: string
      service_id: string
      service_name: string
      duration_minutes: number
      snapshot_price: number
    }>

    const calendarAppointment: CalendarAppointment = {
      ...apt,
      customer: {
        id: customerInfo?.id || '',
        first_name: customerInfo?.first_name || '',
        last_name: customerInfo?.last_name || '',
        phone: customerInfo?.phone || '',
        email: customerInfo?.email || '',
      },
      staff: {
        id: staffInfo?.id || apt.staff_id,
        display_name: staffInfo?.display_name || 'Unbekannt',
        color: staffInfo?.color || '#6B7280',
        avatar_url: staffInfo?.avatar_url,
      },
      services: (services || []).map((s) => ({
        id: s.service_id,
        name: s.service_name,
        duration_minutes: s.duration_minutes,
        price: s.snapshot_price,
      })),
    }

    events.push({
      id: apt.id,
      title: customerInfo
        ? `${customerInfo.first_name} ${customerInfo.last_name}`
        : 'Termin',
      start: new Date(apt.starts_at),
      end: new Date(apt.ends_at),
      staffId: apt.staff_id,
      staffColor: staffInfo?.color || '#6B7280',
      type: 'appointment',
      appointment: calendarAppointment,
    })
  }

  // Add blocked times as events
  for (const blocked of blockedTimes || []) {
    const staffInfo = staff.find((s) => s.id === blocked.staff_id)

    // If staff_id is null, add blocked time for all staff
    const targetStaff = blocked.staff_id ? [blocked.staff_id] : staff.map((s) => s.id)

    for (const staffId of targetStaff) {
      const staffColor = staff.find((s) => s.id === staffId)?.color || '#9CA3AF'
      events.push({
        id: `blocked-${blocked.id}-${staffId}`,
        title: blocked.reason || blocked.block_type || 'Blockiert',
        start: new Date(blocked.starts_at),
        end: new Date(blocked.ends_at),
        staffId,
        staffColor,
        type: 'blocked',
      })
    }
  }

  return { events, staff }
}

/**
 * Get staff list for a salon.
 */
export async function getStaffForCalendar(salonId: string): Promise<StaffColumn[]> {
  const supabase = await createClient()

  const { data: staffData, error } = await supabase
    .from('staff')
    .select('id, display_name, color, avatar_url')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_name')

  if (error) {
    logger.error('Failed to fetch staff', { error: error.message, salonId })
    return []
  }

  return (staffData || []).map((s) => ({
    id: s.id,
    name: s.display_name,
    color: s.color || '#6B7280',
    avatar: s.avatar_url || undefined,
  }))
}

/**
 * Get services for appointment creation.
 */
export async function getServicesForCalendar(salonId: string) {
  const supabase = await createClient()

  const { data: services, error } = await supabase
    .from('services')
    .select(`
      id,
      name,
      duration_minutes,
      service_prices (price)
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('sort_order')

  if (error) {
    logger.error('Failed to fetch services', { error: error.message, salonId })
    return []
  }

  return (services || []).map((s) => ({
    id: s.id,
    name: s.name,
    duration_minutes: s.duration_minutes,
    price: (s.service_prices as Array<{ price: number }>)?.[0]?.price || 0,
  }))
}

// ============================================
// CREATE APPOINTMENT (Admin)
// ============================================

/**
 * Create an appointment from admin calendar.
 * Uses the same conflict detection as customer booking.
 *
 * Business Rules:
 * - Admin can create appointments without lead time restrictions
 * - Still must check for conflicts with existing appointments
 * - Still respects blocked times
 */
export async function createAdminAppointment(
  input: CreateAdminAppointmentInput
): Promise<AppointmentActionResult> {
  const supabase = await createClient()

  try {
    // Validate input
    const validated = createAppointmentSchema.parse(input)

    const startsAt = new Date(validated.startsAt)

    // Get service durations
    const { data: services } = await supabase
      .from('services')
      .select('duration_minutes, buffer_after_minutes')
      .in('id', validated.serviceIds)

    const totalDuration = (services || []).reduce(
      (sum, s) => sum + (s.duration_minutes || 0) + (s.buffer_after_minutes || 0),
      0
    )

    const endsAt = addMinutes(startsAt, totalDuration)

    // Check for conflicts
    const conflictCheck = await checkAppointmentConflict(
      validated.salonId,
      validated.staffId,
      startsAt,
      endsAt
    )

    if (!conflictCheck.available) {
      return {
        success: false,
        error: conflictCheck.reason || 'Zeitslot ist nicht verfügbar',
      }
    }

    // Get service prices for appointment
    const { data: servicePrices } = await supabase
      .from('service_prices')
      .select('service_id, price, tax_rate_id')
      .in('service_id', validated.serviceIds)
      .is('valid_to', null)

    // Get service names
    const { data: serviceDetails } = await supabase
      .from('services')
      .select('id, name, duration_minutes')
      .in('id', validated.serviceIds)

    const totalPrice = (servicePrices || []).reduce((sum, p) => sum + p.price, 0)

    // Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        salon_id: validated.salonId,
        customer_id: validated.customerId,
        staff_id: validated.staffId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'confirmed',
        total_price: totalPrice,
        customer_notes: validated.notes || null,
        internal_notes: validated.internalNotes || null,
        booked_online: false,
      })
      .select('id')
      .single()

    if (appointmentError || !appointment) {
      logger.error('Failed to create appointment', { error: appointmentError?.message })
      return {
        success: false,
        error: 'Termin konnte nicht erstellt werden',
      }
    }

    // Add services to appointment
    const appointmentServices = validated.serviceIds.map((serviceId, index) => {
      const priceRecord = servicePrices?.find((p) => p.service_id === serviceId)
      const serviceInfo = serviceDetails?.find((s) => s.id === serviceId)
      return {
        appointment_id: appointment.id,
        service_id: serviceId,
        service_name: serviceInfo?.name || 'Unbekannt',
        duration_minutes: serviceInfo?.duration_minutes || 30,
        snapshot_price: priceRecord?.price || 0,
        snapshot_tax_rate_percent: 8.1, // Swiss VAT
        sort_order: index,
      }
    })

    await supabase.from('appointment_services').insert(appointmentServices)

    logger.info('Admin created appointment', {
      appointmentId: appointment.id,
      staffId: validated.staffId,
      customerId: validated.customerId,
    })

    return {
      success: true,
      appointmentId: appointment.id,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    logger.error('Error creating admin appointment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// UPDATE APPOINTMENT
// ============================================

/**
 * Update an existing appointment.
 * Used for rescheduling or changing staff.
 */
export async function updateAppointment(
  input: UpdateAppointmentInput,
  salonId: string
): Promise<AppointmentActionResult> {
  const supabase = await createClient()

  try {
    const validated = updateAppointmentSchema.parse(input)

    // Get current appointment
    const { data: current, error: fetchError } = await supabase
      .from('appointments')
      .select('*')
      .eq('id', validated.appointmentId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !current) {
      return { success: false, error: 'Termin nicht gefunden' }
    }

    // Check if can be modified
    if (['completed', 'cancelled', 'no_show'].includes(current.status)) {
      return { success: false, error: 'Dieser Termin kann nicht mehr geändert werden' }
    }

    // If time or staff changed, check for conflicts
    if (validated.startsAt || validated.staffId) {
      const newStartsAt = validated.startsAt ? new Date(validated.startsAt) : new Date(current.starts_at)
      const newEndsAt = validated.endsAt
        ? new Date(validated.endsAt)
        : new Date(current.ends_at)
      const newStaffId = validated.staffId || current.staff_id

      const conflictCheck = await checkAppointmentConflict(
        salonId,
        newStaffId,
        newStartsAt,
        newEndsAt,
        validated.appointmentId // Exclude current appointment
      )

      if (!conflictCheck.available) {
        return {
          success: false,
          error: conflictCheck.reason || 'Neuer Zeitslot ist nicht verfügbar',
        }
      }
    }

    // Build update object
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    if (validated.staffId) updateData.staff_id = validated.staffId
    if (validated.startsAt) updateData.starts_at = validated.startsAt
    if (validated.endsAt) updateData.ends_at = validated.endsAt
    if (validated.notes !== undefined) updateData.customer_notes = validated.notes
    if (validated.internalNotes !== undefined) updateData.internal_notes = validated.internalNotes

    const { error: updateError } = await supabase
      .from('appointments')
      .update(updateData)
      .eq('id', validated.appointmentId)
      .eq('salon_id', salonId)

    if (updateError) {
      logger.error('Failed to update appointment', { error: updateError.message })
      return { success: false, error: 'Termin konnte nicht aktualisiert werden' }
    }

    logger.info('Appointment updated', { appointmentId: validated.appointmentId })

    return { success: true, appointmentId: validated.appointmentId }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return { success: false, error: error.errors[0].message }
    }
    logger.error('Error updating appointment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// CANCEL APPOINTMENT
// ============================================

/**
 * Cancel an appointment.
 * Admin cancellation doesn't require cutoff time check.
 */
export async function cancelAppointment(
  appointmentId: string,
  salonId: string,
  reason: string,
  cancelledBy: string
): Promise<AppointmentActionResult> {
  const supabase = await createClient()

  try {
    // Get current appointment
    const { data: current, error: fetchError } = await supabase
      .from('appointments')
      .select('status')
      .eq('id', appointmentId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !current) {
      return { success: false, error: 'Termin nicht gefunden' }
    }

    if (['completed', 'cancelled', 'no_show'].includes(current.status)) {
      return { success: false, error: 'Termin kann nicht mehr storniert werden' }
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: cancelledBy,
        cancellation_reason: reason,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)
      .eq('salon_id', salonId)

    if (updateError) {
      logger.error('Failed to cancel appointment', { error: updateError.message })
      return { success: false, error: 'Termin konnte nicht storniert werden' }
    }

    logger.info('Appointment cancelled', { appointmentId, reason, cancelledBy })

    return { success: true, appointmentId }
  } catch (error) {
    logger.error('Error cancelling appointment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// COMPLETE APPOINTMENT
// ============================================

/**
 * Mark appointment as completed.
 */
export async function completeAppointment(
  appointmentId: string,
  salonId: string
): Promise<AppointmentActionResult> {
  const supabase = await createClient()

  try {
    const { data: current, error: fetchError } = await supabase
      .from('appointments')
      .select('status, customer_id')
      .eq('id', appointmentId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !current) {
      return { success: false, error: 'Termin nicht gefunden' }
    }

    if (current.status !== 'confirmed') {
      return { success: false, error: 'Nur bestätigte Termine können abgeschlossen werden' }
    }

    // Update appointment
    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'completed',
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)

    if (updateError) {
      return { success: false, error: 'Termin konnte nicht abgeschlossen werden' }
    }

    // Update customer stats
    if (current.customer_id) {
      await supabase.rpc('increment_customer_visits', {
        p_customer_id: current.customer_id,
      })
    }

    logger.info('Appointment completed', { appointmentId })

    return { success: true, appointmentId }
  } catch (error) {
    logger.error('Error completing appointment', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// MARK NO-SHOW
// ============================================

/**
 * Mark appointment as no-show.
 */
export async function markNoShow(
  appointmentId: string,
  salonId: string,
  markedBy: string,
  chargeFee: boolean = false
): Promise<AppointmentActionResult> {
  const supabase = await createClient()

  try {
    const { data: current, error: fetchError } = await supabase
      .from('appointments')
      .select('status, total_price')
      .eq('id', appointmentId)
      .eq('salon_id', salonId)
      .single()

    if (fetchError || !current) {
      return { success: false, error: 'Termin nicht gefunden' }
    }

    if (current.status !== 'confirmed') {
      return { success: false, error: 'Nur bestätigte Termine können als No-Show markiert werden' }
    }

    // Get no-show fee from booking rules
    let noShowFee: number | null = null
    if (chargeFee && current.total_price) {
      const { data: rules } = await supabase
        .from('booking_rules')
        .select('no_show_fee_percent')
        .eq('salon_id', salonId)
        .single()

      if (rules?.no_show_fee_percent) {
        noShowFee = current.total_price * (rules.no_show_fee_percent / 100)
      }
    }

    const { error: updateError } = await supabase
      .from('appointments')
      .update({
        status: 'no_show',
        marked_no_show_at: new Date().toISOString(),
        marked_no_show_by: markedBy,
        no_show_fee_charged: noShowFee,
        updated_at: new Date().toISOString(),
      })
      .eq('id', appointmentId)

    if (updateError) {
      return { success: false, error: 'No-Show konnte nicht markiert werden' }
    }

    logger.info('Appointment marked as no-show', { appointmentId, noShowFee })

    return { success: true, appointmentId }
  } catch (error) {
    logger.error('Error marking no-show', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// CONFLICT DETECTION
// ============================================

/**
 * Check if a time slot is available for an appointment.
 * Used by both customer booking and admin calendar.
 */
async function checkAppointmentConflict(
  salonId: string,
  staffId: string,
  startsAt: Date,
  endsAt: Date,
  excludeAppointmentId?: string
): Promise<{ available: boolean; reason?: string }> {
  const supabase = await createClient()

  // Check for conflicting appointments
  let conflictQuery = supabase
    .from('appointments')
    .select('id')
    .eq('staff_id', staffId)
    .in('status', ['confirmed', 'reserved'])
    .lt('starts_at', endsAt.toISOString())
    .gt('ends_at', startsAt.toISOString())

  if (excludeAppointmentId) {
    conflictQuery = conflictQuery.neq('id', excludeAppointmentId)
  }

  const { data: conflicts } = await conflictQuery

  if (conflicts && conflicts.length > 0) {
    return {
      available: false,
      reason: 'Es existiert bereits ein Termin zu dieser Zeit',
    }
  }

  // Check for blocked times
  const { data: blockedTimes } = await supabase
    .from('blocked_times')
    .select('id, reason')
    .eq('salon_id', salonId)
    .or(`staff_id.eq.${staffId},staff_id.is.null`)
    .lt('starts_at', endsAt.toISOString())
    .gt('ends_at', startsAt.toISOString())

  if (blockedTimes && blockedTimes.length > 0) {
    return {
      available: false,
      reason: blockedTimes[0].reason || 'Zeitraum ist blockiert',
    }
  }

  // Check staff working hours
  const dayOfWeek = startsAt.getDay() === 0 ? 7 : startsAt.getDay()

  const { data: workingHours } = await supabase
    .from('staff_working_hours')
    .select('start_minutes, end_minutes')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!workingHours) {
    return {
      available: false,
      reason: 'Mitarbeiter arbeitet an diesem Tag nicht',
    }
  }

  const startMinutes = startsAt.getHours() * 60 + startsAt.getMinutes()
  const endMinutes = endsAt.getHours() * 60 + endsAt.getMinutes()

  if (startMinutes < workingHours.start_minutes || endMinutes > workingHours.end_minutes) {
    return {
      available: false,
      reason: 'Termin liegt außerhalb der Arbeitszeiten',
    }
  }

  return { available: true }
}

// ============================================
// SEARCH CUSTOMERS (for quick appointment)
// ============================================

/**
 * Search customers by name, email, or phone.
 */
export async function searchCustomers(
  salonId: string,
  query: string,
  limit: number = 10
) {
  const supabase = await createClient()

  if (query.length < 2) return []

  const { data: customers } = await supabase
    .from('customers')
    .select('id, first_name, last_name, email, phone')
    .eq('salon_id', salonId)
    .or(`first_name.ilike.%${query}%,last_name.ilike.%${query}%,email.ilike.%${query}%,phone.ilike.%${query}%`)
    .limit(limit)

  return customers || []
}

/**
 * Create a walk-in customer quickly.
 */
export async function createWalkInCustomer(
  salonId: string,
  firstName: string,
  lastName: string,
  phone?: string,
  email?: string
): Promise<{ success: boolean; customerId?: string; error?: string }> {
  const supabase = await createClient()

  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .insert({
        salon_id: salonId,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        email: email || null,
      })
      .select('id')
      .single()

    if (error) {
      return { success: false, error: 'Kunde konnte nicht erstellt werden' }
    }

    return { success: true, customerId: customer.id }
  } catch (error) {
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}
