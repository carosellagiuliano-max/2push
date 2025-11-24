'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'
import type { BookingRequest, BookingResponse } from '../types'

const bookingSchema = z.object({
  salonId: z.string().uuid('Ungültige Salon-ID'),
  staffId: z.string().uuid('Ungültige Mitarbeiter-ID'),
  serviceIds: z.array(z.string().uuid()).min(1, 'Mindestens eine Dienstleistung erforderlich'),
  startsAt: z.string().datetime('Ungültiges Datum'),
  customerInfo: z.object({
    firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
    lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
    email: z.string().email('Ungültige E-Mail-Adresse'),
    phone: z.string().min(10, 'Ungültige Telefonnummer'),
  }),
  notes: z.string().optional(),
})

export async function createBooking(request: BookingRequest): Promise<BookingResponse> {
  try {
    // Validate input
    const validated = bookingSchema.parse(request)

    const supabase = await createClient()

    // 1. Check if slot is still available
    const startsAt = new Date(validated.startsAt)

    // Calculate total duration from services
    const { data: services } = await supabase
      .from('services')
      .select('duration_minutes, buffer_after_minutes')
      .in('id', validated.serviceIds)

    const totalDuration = (services || []).reduce(
      (sum, s) => sum + (s.duration_minutes || 0) + (s.buffer_after_minutes || 0),
      0
    )

    const endsAt = new Date(startsAt.getTime() + totalDuration * 60 * 1000)

    // Check for conflicts
    const { data: conflicts } = await supabase
      .from('appointments')
      .select('id')
      .eq('staff_id', validated.staffId)
      .in('status', ['confirmed', 'reserved'])
      .or(`and(starts_at.lt.${endsAt.toISOString()},ends_at.gt.${startsAt.toISOString()})`)

    if (conflicts && conflicts.length > 0) {
      return {
        success: false,
        error: 'Dieser Zeitslot ist leider nicht mehr verfügbar. Bitte wählen Sie einen anderen Termin.',
      }
    }

    // 2. Find or create customer
    let customerId: string

    // Check if customer exists by email
    const { data: existingCustomer } = await supabase
      .from('customers')
      .select('id')
      .eq('salon_id', validated.salonId)
      .eq('email', validated.customerInfo.email)
      .single()

    if (existingCustomer) {
      customerId = existingCustomer.id

      // Update customer info
      await supabase
        .from('customers')
        .update({
          first_name: validated.customerInfo.firstName,
          last_name: validated.customerInfo.lastName,
          phone: validated.customerInfo.phone,
        })
        .eq('id', customerId)
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabase
        .from('customers')
        .insert({
          salon_id: validated.salonId,
          first_name: validated.customerInfo.firstName,
          last_name: validated.customerInfo.lastName,
          email: validated.customerInfo.email,
          phone: validated.customerInfo.phone,
        })
        .select('id')
        .single()

      if (customerError || !newCustomer) {
        console.error('Failed to create customer:', customerError)
        return {
          success: false,
          error: 'Kundendaten konnten nicht gespeichert werden.',
        }
      }

      customerId = newCustomer.id
    }

    // 3. Create appointment
    const { data: appointment, error: appointmentError } = await supabase
      .from('appointments')
      .insert({
        salon_id: validated.salonId,
        customer_id: customerId,
        staff_id: validated.staffId,
        starts_at: startsAt.toISOString(),
        ends_at: endsAt.toISOString(),
        status: 'confirmed',
        notes: validated.notes || null,
        booking_source: 'online',
      })
      .select('id')
      .single()

    if (appointmentError || !appointment) {
      console.error('Failed to create appointment:', appointmentError)
      return {
        success: false,
        error: 'Termin konnte nicht erstellt werden. Bitte versuchen Sie es erneut.',
      }
    }

    // 4. Add services to appointment
    const { data: servicePrices } = await supabase
      .from('service_prices')
      .select('service_id, price, tax_rate_id')
      .in('service_id', validated.serviceIds)
      .is('valid_to', null)

    const appointmentServices = validated.serviceIds.map((serviceId) => {
      const priceRecord = servicePrices?.find((p) => p.service_id === serviceId)
      return {
        appointment_id: appointment.id,
        service_id: serviceId,
        snapshot_price: priceRecord?.price || 0,
        snapshot_tax_rate_id: priceRecord?.tax_rate_id || null,
      }
    })

    const { error: servicesError } = await supabase
      .from('appointment_services')
      .insert(appointmentServices)

    if (servicesError) {
      console.error('Failed to add services to appointment:', servicesError)
      // Don't fail the booking, services can be fixed later
    }

    // 5. Send confirmation email (TODO: implement email service)
    // await sendBookingConfirmation(appointment.id)

    return {
      success: true,
      appointmentId: appointment.id,
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0]
      return {
        success: false,
        error: firstError.message,
      }
    }

    console.error('Booking error:', error)
    return {
      success: false,
      error: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
    }
  }
}
