'use server'

import { startOfDay, endOfDay, startOfWeek, endOfWeek, subWeeks } from 'date-fns'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logging'
import type { DashboardStats, CalendarAppointment, StaffColumn } from '../types'

// ============================================
// AUTH HELPERS
// ============================================

/**
 * Get the current user's salon ID from their role
 */
export async function getCurrentUserSalonId(): Promise<string | null> {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get salon_id from user's role
  const { data: userRole } = await supabase
    .from('user_roles')
    .select('salon_id')
    .eq('profile_id', user.id)
    .single()

  return userRole?.salon_id || null
}

// ============================================
// TYPES
// ============================================

export interface DashboardData {
  stats: DashboardStats
  upcomingAppointments: CalendarAppointment[]
  staff: StaffColumn[]
  services: Array<{ id: string; name: string; duration_minutes: number }>
}

// ============================================
// FETCH DASHBOARD DATA
// ============================================

/**
 * Fetch all data needed for the dashboard overview.
 */
export async function getDashboardData(salonId: string): Promise<DashboardData> {
  const supabase = await createClient()
  const now = new Date()
  const todayStart = startOfDay(now)
  const todayEnd = endOfDay(now)
  const weekStart = startOfWeek(now, { weekStartsOn: 1 })
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 })
  const lastWeekStart = subWeeks(weekStart, 1)

  // Initialize default response
  const defaultStats: DashboardStats = {
    todayAppointments: 0,
    upcomingAppointments: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    newCustomers: 0,
    noShows: 0,
  }

  // Fetch staff for this salon
  const { data: staffData, error: staffError } = await supabase
    .from('staff')
    .select('id, display_name, color, avatar_url')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('display_name')

  if (staffError) {
    logger.error('Failed to fetch staff for dashboard', { error: staffError.message, salonId })
  }

  const staff: StaffColumn[] = (staffData || []).map((s) => ({
    id: s.id,
    name: s.display_name,
    color: s.color || '#6B7280',
    avatar: s.avatar_url || undefined,
  }))

  // Fetch services
  const { data: servicesData, error: servicesError } = await supabase
    .from('services')
    .select('id, name, duration_minutes')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .order('name')

  if (servicesError) {
    logger.error('Failed to fetch services for dashboard', { error: servicesError.message, salonId })
  }

  const services = (servicesData || []).map((s) => ({
    id: s.id,
    name: s.name,
    duration_minutes: s.duration_minutes,
  }))

  // Fetch today's appointments count
  const { count: todayAppointmentsCount } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .gte('starts_at', todayStart.toISOString())
    .lte('starts_at', todayEnd.toISOString())
    .not('status', 'eq', 'cancelled')

  // Fetch upcoming appointments (from now)
  const { data: upcomingData, count: upcomingCount } = await supabase
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
    `, { count: 'exact' })
    .eq('salon_id', salonId)
    .gte('starts_at', now.toISOString())
    .lte('starts_at', todayEnd.toISOString())
    .not('status', 'eq', 'cancelled')
    .order('starts_at')
    .limit(5)

  // Fetch today's completed appointments for revenue
  const { data: todayCompletedData } = await supabase
    .from('appointments')
    .select('total_price')
    .eq('salon_id', salonId)
    .gte('starts_at', todayStart.toISOString())
    .lte('starts_at', todayEnd.toISOString())
    .eq('status', 'completed')

  const todayRevenue = (todayCompletedData || []).reduce(
    (sum, apt) => sum + (apt.total_price || 0),
    0
  )

  // Fetch week's completed appointments for revenue
  const { data: weekCompletedData } = await supabase
    .from('appointments')
    .select('total_price')
    .eq('salon_id', salonId)
    .gte('starts_at', weekStart.toISOString())
    .lte('starts_at', weekEnd.toISOString())
    .eq('status', 'completed')

  const weekRevenue = (weekCompletedData || []).reduce(
    (sum, apt) => sum + (apt.total_price || 0),
    0
  )

  // Fetch new customers this week
  const { count: newCustomersCount } = await supabase
    .from('customers')
    .select('id', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .gte('created_at', weekStart.toISOString())

  // Fetch no-shows this week
  const { count: noShowsCount } = await supabase
    .from('appointments')
    .select('id', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .gte('starts_at', weekStart.toISOString())
    .lte('starts_at', weekEnd.toISOString())
    .eq('status', 'no_show')

  // Format upcoming appointments
  const upcomingAppointments: CalendarAppointment[] = (upcomingData || []).map((apt) => {
    const staffInfo = apt.staff as { id: string; display_name: string; color: string; avatar_url: string | null }
    const customerInfo = apt.customer as { id: string; first_name: string; last_name: string; phone: string; email: string }
    const aptServices = apt.appointment_services as Array<{
      id: string
      service_id: string
      service_name: string
      duration_minutes: number
      snapshot_price: number
    }>

    return {
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
      services: (aptServices || []).map((s) => ({
        id: s.service_id,
        name: s.service_name,
        duration_minutes: s.duration_minutes,
        price: s.snapshot_price,
      })),
    } as CalendarAppointment
  })

  return {
    stats: {
      todayAppointments: todayAppointmentsCount || 0,
      upcomingAppointments: upcomingCount || 0,
      todayRevenue,
      weekRevenue,
      newCustomers: newCustomersCount || 0,
      noShows: noShowsCount || 0,
    },
    upcomingAppointments,
    staff,
    services,
  }
}
