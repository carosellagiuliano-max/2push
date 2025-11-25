'use server'

import {
  startOfDay,
  endOfDay,
  addMinutes,
  isAfter,
  isBefore,
  setHours,
  setMinutes,
} from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import type { TimeSlot, SlotCalculationParams, AvailableSlots } from '../types'

export async function getAvailableSlots(
  params: SlotCalculationParams
): Promise<AvailableSlots> {
  const { salonId, staffId, serviceIds, date } = params
  const supabase = await createClient()

  // 1. Get salon's booking rules
  const { data: bookingRules } = await supabase
    .from('booking_rules')
    .select('*')
    .eq('salon_id', salonId)
    .single()

  const slotGranularity = bookingRules?.slot_granularity_minutes || 30
  const minLeadTime = bookingRules?.min_lead_time_minutes || 60

  // 2. Get total duration for selected services
  const { data: services } = await supabase
    .from('services')
    .select('duration_minutes, buffer_before_minutes, buffer_after_minutes')
    .in('id', serviceIds)

  const totalDuration = (services || []).reduce(
    (sum, s) => sum + (s.duration_minutes || 0) + (s.buffer_after_minutes || 0),
    0
  )

  const bufferBefore = Math.max(
    ...(services || []).map((s) => s.buffer_before_minutes || 0)
  )

  // 3. Get staff working hours for the day
  const dayOfWeek = date.getDay() === 0 ? 7 : date.getDay() // Convert Sunday from 0 to 7

  const { data: workingHours } = await supabase
    .from('staff_working_hours')
    .select('start_minutes, end_minutes')
    .eq('staff_id', staffId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!workingHours) {
    // Staff doesn't work on this day
    return {
      date: date.toISOString().split('T')[0],
      slots: [],
    }
  }

  // 4. Get salon opening hours for the day
  const { data: openingHours } = await supabase
    .from('opening_hours')
    .select('open_minutes, close_minutes')
    .eq('salon_id', salonId)
    .eq('day_of_week', dayOfWeek)
    .single()

  if (!openingHours) {
    // Salon is closed on this day
    return {
      date: date.toISOString().split('T')[0],
      slots: [],
    }
  }

  // 5. Get blocked times for the day
  const dayStart = startOfDay(date)
  const dayEnd = endOfDay(date)

  const { data: blockedTimes } = await supabase
    .from('blocked_times')
    .select('starts_at, ends_at')
    .eq('salon_id', salonId)
    .or(`staff_id.eq.${staffId},staff_id.is.null`)
    .gte('starts_at', dayStart.toISOString())
    .lte('ends_at', dayEnd.toISOString())

  // 6. Get existing appointments
  const { data: appointments } = await supabase
    .from('appointments')
    .select('starts_at, ends_at')
    .eq('staff_id', staffId)
    .in('status', ['confirmed', 'reserved'])
    .gte('starts_at', dayStart.toISOString())
    .lte('ends_at', dayEnd.toISOString())

  // 7. Calculate available slots
  const slots: TimeSlot[] = []

  // Determine working window (intersection of staff hours and salon hours)
  const windowStart = Math.max(workingHours.start_minutes, openingHours.open_minutes)
  const windowEnd = Math.min(workingHours.end_minutes, openingHours.close_minutes)

  // Convert minutes to time
  const startTime = setMinutes(setHours(date, Math.floor(windowStart / 60)), windowStart % 60)
  const endTime = setMinutes(setHours(date, Math.floor(windowEnd / 60)), windowEnd % 60)

  // Minimum start time (now + lead time)
  const now = new Date()
  const minStartTime = addMinutes(now, minLeadTime)

  // Generate slots
  let currentSlotStart = startTime

  while (isBefore(addMinutes(currentSlotStart, totalDuration), endTime)) {
    const slotStart = currentSlotStart
    const slotEnd = addMinutes(slotStart, totalDuration)
    const slotWithBuffer = addMinutes(slotStart, -bufferBefore)

    // Check if slot is available
    let isAvailable = true

    // Check minimum lead time
    if (isBefore(slotStart, minStartTime)) {
      isAvailable = false
    }

    // Check against blocked times
    if (isAvailable && blockedTimes) {
      for (const blocked of blockedTimes) {
        const blockedStart = new Date(blocked.starts_at)
        const blockedEnd = new Date(blocked.ends_at)

        if (
          isBefore(slotStart, blockedEnd) &&
          isAfter(slotEnd, blockedStart)
        ) {
          isAvailable = false
          break
        }
      }
    }

    // Check against existing appointments
    if (isAvailable && appointments) {
      for (const apt of appointments) {
        const aptStart = new Date(apt.starts_at)
        const aptEnd = new Date(apt.ends_at)

        if (
          isBefore(slotWithBuffer, aptEnd) &&
          isAfter(slotEnd, aptStart)
        ) {
          isAvailable = false
          break
        }
      }
    }

    slots.push({
      startsAt: slotStart,
      endsAt: slotEnd,
      staffId,
      isAvailable,
    })

    currentSlotStart = addMinutes(currentSlotStart, slotGranularity)
  }

  return {
    date: date.toISOString().split('T')[0],
    slots,
  }
}
