'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import type { CustomerFormData } from '../types'

interface ActionResult {
  success: boolean
  error?: string
  customerId?: string
}

export async function createCustomer(
  salonId: string,
  data: CustomerFormData
): Promise<ActionResult> {
  const supabase = await createClient()

  // Check for duplicate email or phone
  if (data.email) {
    const { data: existingEmail } = await supabase
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('email', data.email)
      .single()

    if (existingEmail) {
      return {
        success: false,
        error: 'Ein Kunde mit dieser E-Mail existiert bereits.',
      }
    }
  }

  if (data.phone) {
    const { data: existingPhone } = await supabase
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('phone', data.phone)
      .single()

    if (existingPhone) {
      return {
        success: false,
        error: 'Ein Kunde mit dieser Telefonnummer existiert bereits.',
      }
    }
  }

  const { data: customer, error } = await supabase
    .from('customers')
    .insert({
      salon_id: salonId,
      first_name: data.first_name,
      last_name: data.last_name,
      email: data.email || null,
      phone: data.phone || null,
      birthday: data.birthday || null,
      preferred_staff_id: data.preferred_staff_id || null,
      notes: data.notes || null,
      accepts_marketing: data.accepts_marketing,
      is_active: true,
    })
    .select('id')
    .single()

  if (error) {
    console.error('Error creating customer:', error)
    return {
      success: false,
      error: 'Fehler beim Erstellen des Kunden.',
    }
  }

  revalidatePath('/dashboard/customers')

  return {
    success: true,
    customerId: customer.id,
  }
}

export async function updateCustomer(
  customerId: string,
  salonId: string,
  data: Partial<CustomerFormData>
): Promise<ActionResult> {
  const supabase = await createClient()

  // Check for duplicate email or phone (excluding current customer)
  if (data.email) {
    const { data: existingEmail } = await supabase
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('email', data.email)
      .neq('id', customerId)
      .single()

    if (existingEmail) {
      return {
        success: false,
        error: 'Ein anderer Kunde mit dieser E-Mail existiert bereits.',
      }
    }
  }

  if (data.phone) {
    const { data: existingPhone } = await supabase
      .from('customers')
      .select('id')
      .eq('salon_id', salonId)
      .eq('phone', data.phone)
      .neq('id', customerId)
      .single()

    if (existingPhone) {
      return {
        success: false,
        error: 'Ein anderer Kunde mit dieser Telefonnummer existiert bereits.',
      }
    }
  }

  const updateData: Record<string, unknown> = {}
  if (data.first_name !== undefined) updateData.first_name = data.first_name
  if (data.last_name !== undefined) updateData.last_name = data.last_name
  if (data.email !== undefined) updateData.email = data.email || null
  if (data.phone !== undefined) updateData.phone = data.phone || null
  if (data.birthday !== undefined) updateData.birthday = data.birthday || null
  if (data.preferred_staff_id !== undefined) updateData.preferred_staff_id = data.preferred_staff_id || null
  if (data.notes !== undefined) updateData.notes = data.notes || null
  if (data.accepts_marketing !== undefined) updateData.accepts_marketing = data.accepts_marketing

  const { error } = await supabase
    .from('customers')
    .update(updateData)
    .eq('id', customerId)
    .eq('salon_id', salonId)

  if (error) {
    console.error('Error updating customer:', error)
    return {
      success: false,
      error: 'Fehler beim Aktualisieren des Kunden.',
    }
  }

  revalidatePath('/dashboard/customers')
  revalidatePath(`/dashboard/customers/${customerId}`)

  return { success: true, customerId }
}

export async function deleteCustomer(
  customerId: string,
  salonId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  // Soft delete - set is_active to false
  const { error } = await supabase
    .from('customers')
    .update({ is_active: false })
    .eq('id', customerId)
    .eq('salon_id', salonId)

  if (error) {
    console.error('Error deleting customer:', error)
    return {
      success: false,
      error: 'Fehler beim Löschen des Kunden.',
    }
  }

  revalidatePath('/dashboard/customers')

  return { success: true }
}

export async function restoreCustomer(
  customerId: string,
  salonId: string
): Promise<ActionResult> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('customers')
    .update({ is_active: true })
    .eq('id', customerId)
    .eq('salon_id', salonId)

  if (error) {
    console.error('Error restoring customer:', error)
    return {
      success: false,
      error: 'Fehler beim Wiederherstellen des Kunden.',
    }
  }

  revalidatePath('/dashboard/customers')

  return { success: true }
}
