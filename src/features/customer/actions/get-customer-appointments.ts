'use server'

import { createClient } from '@/lib/supabase/server'

export type CustomerAppointment = {
  id: string
  starts_at: string
  ends_at: string
  status: string
  notes: string | null
  staff: {
    id: string
    display_name: string
  } | null
  services: {
    id: string
    name: string
    snapshot_price: number
  }[]
}

export async function getCustomerAppointments(): Promise<{
  upcoming: CustomerAppointment[]
  past: CustomerAppointment[]
}> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { upcoming: [], past: [] }
  }

  // Get customer record for current user
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('profile_id', user.id)
    .single()

  if (!customer) {
    return { upcoming: [], past: [] }
  }

  const now = new Date().toISOString()

  // Get upcoming appointments
  const { data: upcomingData } = await supabase
    .from('appointments')
    .select(`
      id,
      starts_at,
      ends_at,
      status,
      notes,
      staff:staff_id (
        id,
        display_name
      ),
      appointment_services (
        id,
        snapshot_price,
        service:service_id (
          id,
          name
        )
      )
    `)
    .eq('customer_id', customer.id)
    .in('status', ['confirmed', 'reserved'])
    .gte('starts_at', now)
    .order('starts_at', { ascending: true })

  // Get past appointments
  const { data: pastData } = await supabase
    .from('appointments')
    .select(`
      id,
      starts_at,
      ends_at,
      status,
      notes,
      staff:staff_id (
        id,
        display_name
      ),
      appointment_services (
        id,
        snapshot_price,
        service:service_id (
          id,
          name
        )
      )
    `)
    .eq('customer_id', customer.id)
    .or('starts_at.lt.' + now + ',status.in.(completed,cancelled,no_show)')
    .order('starts_at', { ascending: false })
    .limit(10)

  const mapAppointment = (apt: any): CustomerAppointment => ({
    id: apt.id,
    starts_at: apt.starts_at,
    ends_at: apt.ends_at,
    status: apt.status,
    notes: apt.notes,
    staff: apt.staff,
    services: (apt.appointment_services || []).map((as: any) => ({
      id: as.service?.id,
      name: as.service?.name,
      snapshot_price: as.snapshot_price,
    })),
  })

  return {
    upcoming: (upcomingData || []).map(mapAppointment),
    past: (pastData || []).map(mapAppointment),
  }
}
