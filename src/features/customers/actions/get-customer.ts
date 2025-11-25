'use server'

import { createClient } from '@/lib/supabase/server'
import type { CustomerDetail, CustomerAppointmentHistory } from '../types'

export async function getCustomer(
  customerId: string,
  salonId: string
): Promise<CustomerDetail | null> {
  const supabase = await createClient()

  // Get customer with preferred staff
  const { data: customer, error: customerError } = await supabase
    .from('customers')
    .select('*, staff!preferred_staff_id(id, display_name, color)')
    .eq('id', customerId)
    .eq('salon_id', salonId)
    .single()

  if (customerError || !customer) {
    console.error('Error fetching customer:', customerError)
    return null
  }

  // Get appointments with services and staff
  const { data: appointments, error: appointmentsError } = await supabase
    .from('appointments')
    .select(`
      id,
      starts_at,
      ends_at,
      status,
      total_price,
      staff!inner(id, display_name, color),
      appointment_services(id, service_name, snapshot_price)
    `)
    .eq('customer_id', customerId)
    .eq('salon_id', salonId)
    .order('starts_at', { ascending: false })
    .limit(50)

  if (appointmentsError) {
    console.error('Error fetching appointments:', appointmentsError)
  }

  // Transform appointments
  const appointmentHistory: CustomerAppointmentHistory[] = (appointments || []).map((apt) => {
    // Handle staff as either single object or array
    const staffData = Array.isArray(apt.staff) ? apt.staff[0] : apt.staff
    return {
      id: apt.id,
      starts_at: apt.starts_at,
      ends_at: apt.ends_at,
      status: apt.status,
      total_price: apt.total_price,
      staff: {
        id: staffData?.id || '',
        display_name: staffData?.display_name || '',
        color: staffData?.color || '#666',
      },
      services: (apt.appointment_services || []).map((s) => ({
        id: s.id,
        name: s.service_name,
        price: s.snapshot_price,
      })),
    }
  })

  // Calculate statistics
  const completedAppointments = appointmentHistory.filter((a) => a.status === 'completed')
  const cancelledAppointments = appointmentHistory.filter((a) => a.status === 'cancelled')
  const noShows = appointmentHistory.filter((a) => a.status === 'no_show')

  const totalSpent = completedAppointments.reduce((sum, a) => sum + (a.total_price || 0), 0)
  const averageSpend = completedAppointments.length > 0 ? totalSpent / completedAppointments.length : 0

  // Calculate favorite services
  const serviceCount: Record<string, number> = {}
  appointmentHistory.forEach((apt) => {
    apt.services.forEach((s) => {
      serviceCount[s.name] = (serviceCount[s.name] || 0) + 1
    })
  })

  const favoriteServices = Object.entries(serviceCount)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 5)

  return {
    ...customer,
    preferred_staff: customer.staff || null,
    appointments: appointmentHistory,
    statistics: {
      totalAppointments: appointmentHistory.length,
      completedAppointments: completedAppointments.length,
      cancelledAppointments: cancelledAppointments.length,
      noShowCount: noShows.length,
      averageSpend,
      favoriteServices,
    },
  }
}
