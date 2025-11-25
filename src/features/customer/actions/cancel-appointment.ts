'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type CancelResult = {
  success: boolean
  error?: string
}

export async function cancelAppointment(appointmentId: string): Promise<CancelResult> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return { success: false, error: 'Nicht authentifiziert' }
  }

  // Get customer record for current user
  const { data: customer } = await supabase
    .from('customers')
    .select('id, salon_id')
    .eq('profile_id', user.id)
    .single()

  if (!customer) {
    return { success: false, error: 'Kunde nicht gefunden' }
  }

  // Get appointment and check ownership
  const { data: appointment } = await supabase
    .from('appointments')
    .select('id, customer_id, starts_at, status, salon_id')
    .eq('id', appointmentId)
    .single()

  if (!appointment) {
    return { success: false, error: 'Termin nicht gefunden' }
  }

  if (appointment.customer_id !== customer.id) {
    return { success: false, error: 'Keine Berechtigung für diesen Termin' }
  }

  if (appointment.status === 'cancelled') {
    return { success: false, error: 'Termin wurde bereits storniert' }
  }

  if (appointment.status !== 'confirmed' && appointment.status !== 'reserved') {
    return { success: false, error: 'Termin kann nicht storniert werden' }
  }

  // Get booking rules
  const { data: rules } = await supabase
    .from('booking_rules')
    .select('cancellation_cutoff_hours')
    .eq('salon_id', appointment.salon_id)
    .single()

  const cancellationCutoffHours = rules?.cancellation_cutoff_hours || 24

  // Check if cancellation is allowed (within cutoff)
  const appointmentStart = new Date(appointment.starts_at)
  const cutoffTime = new Date(appointmentStart.getTime() - cancellationCutoffHours * 60 * 60 * 1000)
  const now = new Date()

  if (now > cutoffTime) {
    return {
      success: false,
      error: `Termine können nur bis ${cancellationCutoffHours} Stunden vorher storniert werden.`,
    }
  }

  // Cancel the appointment
  const { error } = await supabase
    .from('appointments')
    .update({
      status: 'cancelled',
      cancelled_at: new Date().toISOString(),
      cancelled_by: 'customer',
    })
    .eq('id', appointmentId)

  if (error) {
    return { success: false, error: 'Fehler beim Stornieren des Termins' }
  }

  // Revalidate the appointments page
  revalidatePath('/konto/termine')
  revalidatePath('/konto')

  return { success: true }
}
