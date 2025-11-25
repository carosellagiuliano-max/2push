'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logging'

// ============================================
// TYPES
// ============================================

export type ConsentCategory =
  | 'marketing_email'
  | 'marketing_sms'
  | 'loyalty_program'
  | 'analytics'
  | 'partner_sharing'

export interface CustomerConsent {
  category: ConsentCategory
  status: 'given' | 'withdrawn'
  recordedAt: string
}

export interface ExportedCustomerData {
  exportedAt: string
  customer: {
    firstName: string | null
    lastName: string | null
    email: string | null
    phone: string | null
    birthday: string | null
    createdAt: string
  }
  appointments: Array<{
    id: string
    startsAt: string
    endsAt: string
    status: string
    totalPrice: number | null
    services: Array<{
      name: string
      duration: number
      price: number
    }>
  }>
  orders: Array<{
    id: string
    orderNumber: string
    status: string
    total: number
    createdAt: string
    items: Array<{
      productName: string
      quantity: number
      unitPrice: number
    }>
  }>
  consents: CustomerConsent[]
}

// ============================================
// GDPR ACTIONS
// ============================================

/**
 * Export all data for the authenticated customer (GDPR Article 20)
 */
export async function exportMyData(): Promise<{
  success: boolean
  data?: ExportedCustomerData
  error?: string
}> {
  const supabase = await createClient()

  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Nicht angemeldet' }
    }

    // Get customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('profile_id', user.id)
      .single()

    if (customerError || !customer) {
      return { success: false, error: 'Kundendaten nicht gefunden' }
    }

    // Get appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select(
        `
        id,
        starts_at,
        ends_at,
        status,
        total_price,
        appointment_services (
          service_name,
          duration_minutes,
          snapshot_price
        )
      `
      )
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    // Get orders
    const { data: orders } = await supabase
      .from('orders')
      .select(
        `
        id,
        order_number,
        status,
        total,
        created_at,
        order_items (
          product_name,
          quantity,
          unit_price
        )
      `
      )
      .eq('customer_id', customer.id)
      .order('created_at', { ascending: false })

    // Get consents
    const { data: consents } = await supabase
      .from('customer_consents')
      .select('category, status, recorded_at')
      .eq('customer_id', customer.id)

    const exportData: ExportedCustomerData = {
      exportedAt: new Date().toISOString(),
      customer: {
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        birthday: customer.birthday,
        createdAt: customer.created_at,
      },
      appointments: (appointments || []).map((apt) => ({
        id: apt.id,
        startsAt: apt.starts_at,
        endsAt: apt.ends_at,
        status: apt.status,
        totalPrice: apt.total_price,
        services: ((apt.appointment_services as unknown[]) || []).map((s) => {
          const svc = s as { service_name: string; duration_minutes: number; snapshot_price: number }
          return {
            name: svc.service_name,
            duration: svc.duration_minutes,
            price: svc.snapshot_price,
          }
        }),
      })),
      orders: (orders || []).map((order) => ({
        id: order.id,
        orderNumber: order.order_number,
        status: order.status,
        total: order.total,
        createdAt: order.created_at,
        items: ((order.order_items as unknown[]) || []).map((item) => {
          const i = item as { product_name: string; quantity: number; unit_price: number }
          return {
            productName: i.product_name,
            quantity: i.quantity,
            unitPrice: i.unit_price,
          }
        }),
      })),
      consents: (consents || []).map((c) => ({
        category: c.category as ConsentCategory,
        status: c.status as 'given' | 'withdrawn',
        recordedAt: c.recorded_at,
      })),
    }

    logger.info('Customer data exported', { customerId: customer.id })

    return { success: true, data: exportData }
  } catch (error) {
    logger.error('Error exporting customer data', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Daten konnten nicht exportiert werden' }
  }
}

/**
 * Delete account for the authenticated customer (GDPR Article 17)
 * This anonymizes the data rather than hard-deleting to maintain referential integrity
 */
export async function deleteMyAccount(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Get authenticated user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Nicht angemeldet' }
    }

    // Get customer record
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, salon_id, email')
      .eq('profile_id', user.id)
      .single()

    if (customerError || !customer) {
      return { success: false, error: 'Kundendaten nicht gefunden' }
    }

    // Anonymize customer data
    const anonymizedEmail = `deleted_${customer.id.slice(0, 8)}@deleted.local`
    const { error: updateError } = await supabase
      .from('customers')
      .update({
        first_name: 'Gelöscht',
        last_name: 'Gelöscht',
        email: anonymizedEmail,
        phone: null,
        birthday: null,
        notes: null,
        accepts_marketing: false,
        is_active: false,
        profile_id: null, // Unlink from auth user
      })
      .eq('id', customer.id)

    if (updateError) {
      logger.error('Failed to anonymize customer', {
        customerId: customer.id,
        error: updateError.message,
      })
      return { success: false, error: 'Konto konnte nicht gelöscht werden' }
    }

    // Delete consents
    await supabase.from('customer_consents').delete().eq('customer_id', customer.id)

    // Delete customer addresses
    await supabase.from('customer_addresses').delete().eq('customer_id', customer.id)

    // Log the deletion for audit purposes
    await supabase.from('audit_log').insert({
      salon_id: customer.salon_id,
      action: 'customer_self_deleted',
      entity_type: 'customer',
      entity_id: customer.id,
      performed_by: user.id,
      details: {
        originalEmail: customer.email,
        deletedAt: new Date().toISOString(),
      },
    })

    // Sign out the user
    await supabase.auth.signOut()

    logger.info('Customer account deleted (self-service)', {
      customerId: customer.id,
      profileId: user.id,
    })

    return { success: true }
  } catch (error) {
    logger.error('Error deleting customer account', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Get consents for the authenticated customer
 */
export async function getMyConsents(): Promise<CustomerConsent[]> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    // Get customer record
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!customer) {
      return []
    }

    const { data: consents } = await supabase
      .from('customer_consents')
      .select('category, status, recorded_at')
      .eq('customer_id', customer.id)

    return (consents || []).map((c) => ({
      category: c.category as ConsentCategory,
      status: c.status as 'given' | 'withdrawn',
      recordedAt: c.recorded_at,
    }))
  } catch (error) {
    logger.error('Error getting consents', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return []
  }
}

/**
 * Update a consent for the authenticated customer
 */
export async function updateMyConsent(
  category: ConsentCategory,
  status: 'given' | 'withdrawn'
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Nicht angemeldet' }
    }

    // Get customer record
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!customer) {
      return { success: false, error: 'Kundendaten nicht gefunden' }
    }

    // Upsert consent
    const { error } = await supabase.from('customer_consents').upsert(
      {
        customer_id: customer.id,
        category,
        status,
        recorded_at: new Date().toISOString(),
      },
      {
        onConflict: 'customer_id,category',
      }
    )

    if (error) {
      logger.error('Failed to update consent', {
        customerId: customer.id,
        category,
        error: error.message,
      })
      return { success: false, error: 'Einwilligung konnte nicht gespeichert werden' }
    }

    // Update accepts_marketing flag on customer if relevant
    if (category === 'marketing_email' || category === 'marketing_sms') {
      const acceptsMarketing = status === 'given'
      await supabase.from('customers').update({ accepts_marketing: acceptsMarketing }).eq('id', customer.id)
    }

    logger.info('Consent updated (self-service)', { customerId: customer.id, category, status })
    revalidatePath('/konto/datenschutz')

    return { success: true }
  } catch (error) {
    logger.error('Error updating consent', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}
