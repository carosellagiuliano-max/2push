'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logging'
import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  subMonths,
  subWeeks,
  subQuarters,
  subYears,
  format,
  eachDayOfInterval,
  getDay,
} from 'date-fns'

// ============================================
// TYPES
// ============================================

export type AnalyticsPeriod = 'week' | 'month' | 'quarter' | 'year'

export interface KPIStats {
  revenue: { current: number; previous: number; change: number }
  appointments: { current: number; previous: number; change: number }
  newCustomers: { current: number; previous: number; change: number }
  avgTicket: { current: number; previous: number; change: number }
}

export interface RevenueByService {
  name: string
  revenue: number
  count: number
  percent: number
}

export interface RevenueByStaff {
  name: string
  revenue: number
  appointments: number
  avgTicket: number
}

export interface DailyRevenue {
  day: string
  dayName: string
  revenue: number
  appointments: number
}

export interface TopProduct {
  name: string
  brand: string | null
  sold: number
  revenue: number
}

export interface AnalyticsData {
  stats: KPIStats
  revenueByService: RevenueByService[]
  revenueByStaff: RevenueByStaff[]
  dailyRevenue: DailyRevenue[]
  topProducts: TopProduct[]
  insights: AnalyticsInsight[]
}

export interface AnalyticsInsight {
  type: 'positive' | 'neutral' | 'warning'
  title: string
  description: string
}

// ============================================
// HELPERS
// ============================================

function getDateRange(period: AnalyticsPeriod): { start: Date; end: Date } {
  const now = new Date()
  switch (period) {
    case 'week':
      return { start: startOfWeek(now, { weekStartsOn: 1 }), end: endOfWeek(now, { weekStartsOn: 1 }) }
    case 'month':
      return { start: startOfMonth(now), end: endOfMonth(now) }
    case 'quarter':
      return { start: startOfQuarter(now), end: endOfQuarter(now) }
    case 'year':
      return { start: startOfYear(now), end: endOfYear(now) }
  }
}

function getPreviousDateRange(period: AnalyticsPeriod): { start: Date; end: Date } {
  const now = new Date()
  switch (period) {
    case 'week':
      const prevWeek = subWeeks(now, 1)
      return { start: startOfWeek(prevWeek, { weekStartsOn: 1 }), end: endOfWeek(prevWeek, { weekStartsOn: 1 }) }
    case 'month':
      const prevMonth = subMonths(now, 1)
      return { start: startOfMonth(prevMonth), end: endOfMonth(prevMonth) }
    case 'quarter':
      const prevQuarter = subQuarters(now, 1)
      return { start: startOfQuarter(prevQuarter), end: endOfQuarter(prevQuarter) }
    case 'year':
      const prevYear = subYears(now, 1)
      return { start: startOfYear(prevYear), end: endOfYear(prevYear) }
  }
}

function calculateChange(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / previous) * 100
}

// ============================================
// ANALYTICS QUERIES
// ============================================

/**
 * Get complete analytics data for a salon
 */
export async function getAnalyticsData(
  salonId: string,
  period: AnalyticsPeriod = 'month'
): Promise<AnalyticsData> {
  const currentRange = getDateRange(period)
  const previousRange = getPreviousDateRange(period)

  const [stats, revenueByService, revenueByStaff, dailyRevenue, topProducts] = await Promise.all([
    getKPIStats(salonId, currentRange, previousRange),
    getRevenueByService(salonId, currentRange),
    getRevenueByStaff(salonId, currentRange),
    getDailyRevenue(salonId, currentRange),
    getTopProducts(salonId, currentRange),
  ])

  // Generate insights based on data
  const insights = generateInsights(stats, dailyRevenue, revenueByStaff)

  return {
    stats,
    revenueByService,
    revenueByStaff,
    dailyRevenue,
    topProducts,
    insights,
  }
}

/**
 * Get KPI statistics with comparison to previous period
 */
async function getKPIStats(
  salonId: string,
  currentRange: { start: Date; end: Date },
  previousRange: { start: Date; end: Date }
): Promise<KPIStats> {
  const supabase = await createClient()

  // Current period appointments and revenue
  const { data: currentAppointments } = await supabase
    .from('appointments')
    .select('id, total_price')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('starts_at', currentRange.start.toISOString())
    .lte('starts_at', currentRange.end.toISOString())

  // Previous period appointments and revenue
  const { data: previousAppointments } = await supabase
    .from('appointments')
    .select('id, total_price')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('starts_at', previousRange.start.toISOString())
    .lte('starts_at', previousRange.end.toISOString())

  // Current period new customers
  const { count: currentNewCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .gte('created_at', currentRange.start.toISOString())
    .lte('created_at', currentRange.end.toISOString())

  // Previous period new customers
  const { count: previousNewCustomers } = await supabase
    .from('customers')
    .select('*', { count: 'exact', head: true })
    .eq('salon_id', salonId)
    .gte('created_at', previousRange.start.toISOString())
    .lte('created_at', previousRange.end.toISOString())

  // Calculate totals
  const currentRevenue = (currentAppointments || []).reduce(
    (sum, a) => sum + (a.total_price || 0),
    0
  )
  const previousRevenue = (previousAppointments || []).reduce(
    (sum, a) => sum + (a.total_price || 0),
    0
  )

  const currentAppointmentCount = currentAppointments?.length || 0
  const previousAppointmentCount = previousAppointments?.length || 0

  const currentAvgTicket = currentAppointmentCount > 0
    ? currentRevenue / currentAppointmentCount
    : 0
  const previousAvgTicket = previousAppointmentCount > 0
    ? previousRevenue / previousAppointmentCount
    : 0

  return {
    revenue: {
      current: currentRevenue,
      previous: previousRevenue,
      change: calculateChange(currentRevenue, previousRevenue),
    },
    appointments: {
      current: currentAppointmentCount,
      previous: previousAppointmentCount,
      change: calculateChange(currentAppointmentCount, previousAppointmentCount),
    },
    newCustomers: {
      current: currentNewCustomers || 0,
      previous: previousNewCustomers || 0,
      change: calculateChange(currentNewCustomers || 0, previousNewCustomers || 0),
    },
    avgTicket: {
      current: currentAvgTicket,
      previous: previousAvgTicket,
      change: calculateChange(currentAvgTicket, previousAvgTicket),
    },
  }
}

/**
 * Get revenue breakdown by service
 */
async function getRevenueByService(
  salonId: string,
  range: { start: Date; end: Date }
): Promise<RevenueByService[]> {
  const supabase = await createClient()

  const { data: appointmentServices } = await supabase
    .from('appointment_services')
    .select(`
      service_name,
      snapshot_price,
      appointments!inner (
        salon_id,
        status,
        starts_at
      )
    `)
    .eq('appointments.salon_id', salonId)
    .eq('appointments.status', 'completed')
    .gte('appointments.starts_at', range.start.toISOString())
    .lte('appointments.starts_at', range.end.toISOString())

  // Group by service name
  const serviceMap = new Map<string, { revenue: number; count: number }>()

  for (const service of appointmentServices || []) {
    const existing = serviceMap.get(service.service_name) || { revenue: 0, count: 0 }
    serviceMap.set(service.service_name, {
      revenue: existing.revenue + service.snapshot_price,
      count: existing.count + 1,
    })
  }

  // Convert to array and calculate percentages
  const totalRevenue = Array.from(serviceMap.values()).reduce((sum, s) => sum + s.revenue, 0)

  const result = Array.from(serviceMap.entries())
    .map(([name, data]) => ({
      name,
      revenue: data.revenue,
      count: data.count,
      percent: totalRevenue > 0 ? Math.round((data.revenue / totalRevenue) * 100) : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 6)

  return result
}

/**
 * Get revenue breakdown by staff member
 */
async function getRevenueByStaff(
  salonId: string,
  range: { start: Date; end: Date }
): Promise<RevenueByStaff[]> {
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select(`
      id,
      total_price,
      staff_id,
      staff:staff_id (
        display_name
      )
    `)
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('starts_at', range.start.toISOString())
    .lte('starts_at', range.end.toISOString())

  // Group by staff
  const staffMap = new Map<string, { name: string; revenue: number; count: number }>()

  for (const appointment of appointments || []) {
    const staffData = appointment.staff as { display_name: string } | { display_name: string }[] | null
    const staffName = Array.isArray(staffData) ? staffData[0]?.display_name : staffData?.display_name || 'Unbekannt'
    const key = appointment.staff_id

    const existing = staffMap.get(key) || { name: staffName, revenue: 0, count: 0 }
    staffMap.set(key, {
      name: staffName,
      revenue: existing.revenue + (appointment.total_price || 0),
      count: existing.count + 1,
    })
  }

  return Array.from(staffMap.values())
    .map((data) => ({
      name: data.name,
      revenue: data.revenue,
      appointments: data.count,
      avgTicket: data.count > 0 ? data.revenue / data.count : 0,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
}

/**
 * Get daily revenue breakdown
 */
async function getDailyRevenue(
  salonId: string,
  range: { start: Date; end: Date }
): Promise<DailyRevenue[]> {
  const supabase = await createClient()

  const { data: appointments } = await supabase
    .from('appointments')
    .select('starts_at, total_price')
    .eq('salon_id', salonId)
    .eq('status', 'completed')
    .gte('starts_at', range.start.toISOString())
    .lte('starts_at', range.end.toISOString())

  // Group by day of week (1-7, Monday-Sunday)
  const dayNames = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa']
  const dayData = new Map<number, { revenue: number; count: number }>()

  // Initialize all days
  for (let i = 0; i < 7; i++) {
    dayData.set(i, { revenue: 0, count: 0 })
  }

  for (const appointment of appointments || []) {
    const dayOfWeek = getDay(new Date(appointment.starts_at))
    const existing = dayData.get(dayOfWeek) || { revenue: 0, count: 0 }
    dayData.set(dayOfWeek, {
      revenue: existing.revenue + (appointment.total_price || 0),
      count: existing.count + 1,
    })
  }

  // Convert to array, starting from Monday (1)
  const orderedDays = [1, 2, 3, 4, 5, 6, 0] // Mon-Sun
  return orderedDays.map((dayIndex) => {
    const data = dayData.get(dayIndex) || { revenue: 0, count: 0 }
    return {
      day: String(dayIndex === 0 ? 7 : dayIndex),
      dayName: dayNames[dayIndex],
      revenue: data.revenue,
      appointments: data.count,
    }
  })
}

/**
 * Get top selling products
 */
async function getTopProducts(
  salonId: string,
  range: { start: Date; end: Date }
): Promise<TopProduct[]> {
  const supabase = await createClient()

  const { data: orderItems } = await supabase
    .from('order_items')
    .select(`
      product_name,
      quantity,
      unit_price,
      total_price,
      products:product_id (
        brand
      ),
      orders!inner (
        salon_id,
        status,
        created_at
      )
    `)
    .eq('orders.salon_id', salonId)
    .in('orders.status', ['paid', 'processing', 'shipped', 'delivered', 'completed'])
    .gte('orders.created_at', range.start.toISOString())
    .lte('orders.created_at', range.end.toISOString())

  // Group by product
  const productMap = new Map<string, { brand: string | null; sold: number; revenue: number }>()

  for (const item of orderItems || []) {
    const key = item.product_name
    const existing = productMap.get(key) || { brand: null, sold: 0, revenue: 0 }
    const productData = item.products as { brand: string | null } | { brand: string | null }[] | null
    const brand = Array.isArray(productData) ? productData[0]?.brand : productData?.brand
    productMap.set(key, {
      brand: brand || existing.brand,
      sold: existing.sold + item.quantity,
      revenue: existing.revenue + item.total_price,
    })
  }

  return Array.from(productMap.entries())
    .map(([name, data]) => ({
      name,
      brand: data.brand,
      sold: data.sold,
      revenue: data.revenue,
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5)
}

/**
 * Generate insights based on analytics data
 */
function generateInsights(
  stats: KPIStats,
  dailyRevenue: DailyRevenue[],
  staffPerformance: RevenueByStaff[]
): AnalyticsInsight[] {
  const insights: AnalyticsInsight[] = []

  // Revenue insight
  if (stats.revenue.change > 10) {
    insights.push({
      type: 'positive',
      title: 'Umsatzwachstum',
      description: `Umsatz ist um ${stats.revenue.change.toFixed(1)}% gestiegen im Vergleich zur Vorperiode`,
    })
  } else if (stats.revenue.change < -10) {
    insights.push({
      type: 'warning',
      title: 'Umsatzrückgang',
      description: `Umsatz ist um ${Math.abs(stats.revenue.change).toFixed(1)}% gesunken - prüfen Sie mögliche Ursachen`,
    })
  }

  // New customers insight
  if (stats.newCustomers.change > 20) {
    insights.push({
      type: 'positive',
      title: 'Kundenakquise',
      description: `${stats.newCustomers.current} neue Kunden gewonnen - ${stats.newCustomers.change.toFixed(0)}% mehr als letzte Periode`,
    })
  }

  // Find lowest day
  const sortedDays = [...dailyRevenue].sort((a, b) => a.revenue - b.revenue)
  const lowestDay = sortedDays[0]
  const highestDay = sortedDays[sortedDays.length - 1]

  if (lowestDay && highestDay && lowestDay.revenue < highestDay.revenue * 0.5) {
    insights.push({
      type: 'warning',
      title: `Auslastung ${lowestDay.dayName}`,
      description: `${lowestDay.dayName} hat die niedrigste Auslastung - Potential für Aktionen`,
    })
  }

  // Top performer insight
  if (staffPerformance.length > 0) {
    const topPerformer = staffPerformance[0]
    insights.push({
      type: 'neutral',
      title: 'Top Performer',
      description: `${topPerformer.name} führt mit CHF ${topPerformer.revenue.toLocaleString('de-CH')} Umsatz`,
    })
  }

  // Average ticket insight
  if (stats.avgTicket.change > 5) {
    insights.push({
      type: 'positive',
      title: 'Durchschnittsbon',
      description: `Durchschnittlicher Bon um ${stats.avgTicket.change.toFixed(1)}% gestiegen auf CHF ${stats.avgTicket.current.toFixed(2)}`,
    })
  }

  return insights.slice(0, 3) // Return max 3 insights
}

/**
 * Export analytics data as CSV
 */
export async function exportAnalyticsCSV(
  salonId: string,
  period: AnalyticsPeriod = 'month'
): Promise<{ success: boolean; csv?: string; error?: string }> {
  try {
    const data = await getAnalyticsData(salonId, period)

    // Build CSV content
    const lines: string[] = []

    // KPI Summary
    lines.push('Kennzahlen,Aktuell,Vorperiode,Veränderung')
    lines.push(`Umsatz,${data.stats.revenue.current},${data.stats.revenue.previous},${data.stats.revenue.change.toFixed(1)}%`)
    lines.push(`Termine,${data.stats.appointments.current},${data.stats.appointments.previous},${data.stats.appointments.change.toFixed(1)}%`)
    lines.push(`Neue Kunden,${data.stats.newCustomers.current},${data.stats.newCustomers.previous},${data.stats.newCustomers.change.toFixed(1)}%`)
    lines.push(`Ø Bon,${data.stats.avgTicket.current.toFixed(2)},${data.stats.avgTicket.previous.toFixed(2)},${data.stats.avgTicket.change.toFixed(1)}%`)
    lines.push('')

    // Revenue by Service
    lines.push('Dienstleistung,Umsatz,Anzahl,Anteil')
    for (const service of data.revenueByService) {
      lines.push(`${service.name},${service.revenue},${service.count},${service.percent}%`)
    }
    lines.push('')

    // Revenue by Staff
    lines.push('Mitarbeiter,Umsatz,Termine,Ø Bon')
    for (const staff of data.revenueByStaff) {
      lines.push(`${staff.name},${staff.revenue},${staff.appointments},${staff.avgTicket.toFixed(2)}`)
    }
    lines.push('')

    // Daily Revenue
    lines.push('Tag,Umsatz,Termine')
    for (const day of data.dailyRevenue) {
      lines.push(`${day.dayName},${day.revenue},${day.appointments}`)
    }

    return { success: true, csv: lines.join('\n') }
  } catch (error) {
    logger.error('Failed to export analytics', {
      salonId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Export fehlgeschlagen' }
  }
}
