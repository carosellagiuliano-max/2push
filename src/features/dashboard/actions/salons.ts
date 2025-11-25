'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logging'
import type { Salon } from '@/lib/database.types'

// ============================================
// TYPES
// ============================================

export interface SalonListItem {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  street: string | null
  postalCode: string | null
  city: string | null
  country: string
  logoUrl: string | null
  primaryColor: string
  isActive: boolean
  createdAt: string
  // Aggregated stats
  staffCount: number
  customerCount: number
  monthlyRevenue: number
}

export interface SalonDetail extends SalonListItem {
  website: string | null
  latitude: number | null
  longitude: number | null
  timezone: string
  currency: string
  defaultLanguage: string
}

export interface CreateSalonInput {
  name: string
  slug: string
  email?: string
  phone?: string
  website?: string
  street?: string
  postalCode?: string
  city?: string
  country?: string
  timezone?: string
  currency?: string
  defaultLanguage?: string
  primaryColor?: string
}

export interface UpdateSalonInput {
  name?: string
  slug?: string
  email?: string
  phone?: string
  website?: string
  street?: string
  postalCode?: string
  city?: string
  country?: string
  latitude?: number
  longitude?: number
  timezone?: string
  currency?: string
  defaultLanguage?: string
  logoUrl?: string
  primaryColor?: string
  isActive?: boolean
}

export interface SalonResult {
  success: boolean
  salonId?: string
  error?: string
}

// ============================================
// HQ SALON QUERIES
// ============================================

/**
 * Get all salons (HQ users only)
 */
export async function getSalons(): Promise<SalonListItem[]> {
  const supabase = await createClient()

  const { data: salons, error } = await supabase
    .from('salons')
    .select('*')
    .order('name')

  if (error) {
    logger.error('Failed to fetch salons', { error: error.message })
    return []
  }

  // Get stats for each salon
  const salonIds = salons.map((s) => s.id)

  // Staff counts
  const { data: staffCounts } = await supabase
    .from('staff')
    .select('salon_id')
    .in('salon_id', salonIds)
    .eq('is_active', true)

  // Customer counts
  const { data: customerCounts } = await supabase
    .from('customers')
    .select('salon_id')
    .in('salon_id', salonIds)
    .eq('is_active', true)

  // Monthly revenue (completed appointments this month)
  const monthStart = new Date()
  monthStart.setDate(1)
  monthStart.setHours(0, 0, 0, 0)

  const { data: revenue } = await supabase
    .from('appointments')
    .select('salon_id, total_price')
    .in('salon_id', salonIds)
    .eq('status', 'completed')
    .gte('starts_at', monthStart.toISOString())

  // Map to SalonListItem
  return salons.map((salon) => {
    const staffCount = staffCounts?.filter((s) => s.salon_id === salon.id).length || 0
    const customerCount = customerCounts?.filter((c) => c.salon_id === salon.id).length || 0
    const monthlyRevenue = revenue
      ?.filter((r) => r.salon_id === salon.id)
      .reduce((sum, r) => sum + (r.total_price || 0), 0) || 0

    return {
      id: salon.id,
      name: salon.name,
      slug: salon.slug,
      email: salon.email,
      phone: salon.phone,
      street: salon.street,
      postalCode: salon.postal_code,
      city: salon.city,
      country: salon.country,
      logoUrl: salon.logo_url,
      primaryColor: salon.primary_color,
      isActive: salon.is_active,
      createdAt: salon.created_at,
      staffCount,
      customerCount,
      monthlyRevenue,
    }
  })
}

/**
 * Get a single salon by ID
 */
export async function getSalon(salonId: string): Promise<SalonDetail | null> {
  const supabase = await createClient()

  const { data: salon, error } = await supabase
    .from('salons')
    .select('*')
    .eq('id', salonId)
    .single()

  if (error || !salon) {
    return null
  }

  // Get stats
  const [staffResult, customerResult, revenueResult] = await Promise.all([
    supabase
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_active', true),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('salon_id', salonId)
      .eq('is_active', true),
    (async () => {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('appointments')
        .select('total_price')
        .eq('salon_id', salonId)
        .eq('status', 'completed')
        .gte('starts_at', monthStart.toISOString())

      return data?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0
    })(),
  ])

  return {
    id: salon.id,
    name: salon.name,
    slug: salon.slug,
    email: salon.email,
    phone: salon.phone,
    website: salon.website,
    street: salon.street,
    postalCode: salon.postal_code,
    city: salon.city,
    country: salon.country,
    latitude: salon.latitude,
    longitude: salon.longitude,
    timezone: salon.timezone,
    currency: salon.currency,
    defaultLanguage: salon.default_language,
    logoUrl: salon.logo_url,
    primaryColor: salon.primary_color,
    isActive: salon.is_active,
    createdAt: salon.created_at,
    staffCount: staffResult.count || 0,
    customerCount: customerResult.count || 0,
    monthlyRevenue: revenueResult,
  }
}

// ============================================
// HQ SALON MUTATIONS
// ============================================

/**
 * Create a new salon
 */
export async function createSalon(input: CreateSalonInput): Promise<SalonResult> {
  const supabase = await createClient()

  try {
    // Check if slug is unique
    const { data: existing } = await supabase
      .from('salons')
      .select('id')
      .eq('slug', input.slug)
      .single()

    if (existing) {
      return { success: false, error: 'Ein Salon mit diesem Slug existiert bereits' }
    }

    const { data: salon, error } = await supabase
      .from('salons')
      .insert({
        name: input.name,
        slug: input.slug,
        email: input.email || null,
        phone: input.phone || null,
        website: input.website || null,
        street: input.street || null,
        postal_code: input.postalCode || null,
        city: input.city || null,
        country: input.country || 'CH',
        timezone: input.timezone || 'Europe/Zurich',
        currency: input.currency || 'CHF',
        default_language: input.defaultLanguage || 'de',
        primary_color: input.primaryColor || '#b87444',
        is_active: true,
      })
      .select('id')
      .single()

    if (error || !salon) {
      logger.error('Failed to create salon', { error: error?.message })
      return { success: false, error: 'Salon konnte nicht erstellt werden' }
    }

    logger.info('Salon created', { salonId: salon.id })
    revalidatePath('/dashboard/salons')

    return { success: true, salonId: salon.id }
  } catch (error) {
    logger.error('Error creating salon', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Update a salon
 */
export async function updateSalon(
  salonId: string,
  input: UpdateSalonInput
): Promise<SalonResult> {
  const supabase = await createClient()

  try {
    // If updating slug, check uniqueness
    if (input.slug) {
      const { data: existing } = await supabase
        .from('salons')
        .select('id')
        .eq('slug', input.slug)
        .neq('id', salonId)
        .single()

      if (existing) {
        return { success: false, error: 'Ein Salon mit diesem Slug existiert bereits' }
      }
    }

    const updates: Record<string, unknown> = {}
    if (input.name !== undefined) updates.name = input.name
    if (input.slug !== undefined) updates.slug = input.slug
    if (input.email !== undefined) updates.email = input.email || null
    if (input.phone !== undefined) updates.phone = input.phone || null
    if (input.website !== undefined) updates.website = input.website || null
    if (input.street !== undefined) updates.street = input.street || null
    if (input.postalCode !== undefined) updates.postal_code = input.postalCode || null
    if (input.city !== undefined) updates.city = input.city || null
    if (input.country !== undefined) updates.country = input.country
    if (input.latitude !== undefined) updates.latitude = input.latitude
    if (input.longitude !== undefined) updates.longitude = input.longitude
    if (input.timezone !== undefined) updates.timezone = input.timezone
    if (input.currency !== undefined) updates.currency = input.currency
    if (input.defaultLanguage !== undefined) updates.default_language = input.defaultLanguage
    if (input.logoUrl !== undefined) updates.logo_url = input.logoUrl || null
    if (input.primaryColor !== undefined) updates.primary_color = input.primaryColor
    if (input.isActive !== undefined) updates.is_active = input.isActive

    const { error } = await supabase.from('salons').update(updates).eq('id', salonId)

    if (error) {
      logger.error('Failed to update salon', { salonId, error: error.message })
      return { success: false, error: 'Salon konnte nicht aktualisiert werden' }
    }

    logger.info('Salon updated', { salonId })
    revalidatePath('/dashboard/salons')
    revalidatePath(`/dashboard/salons/${salonId}`)

    return { success: true, salonId }
  } catch (error) {
    logger.error('Error updating salon', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Deactivate a salon (soft delete)
 */
export async function deactivateSalon(salonId: string): Promise<SalonResult> {
  return updateSalon(salonId, { isActive: false })
}

/**
 * Reactivate a salon
 */
export async function reactivateSalon(salonId: string): Promise<SalonResult> {
  return updateSalon(salonId, { isActive: true })
}

/**
 * Delete a salon permanently (use with caution!)
 * This should only be used for salons with no data.
 */
export async function deleteSalon(salonId: string): Promise<SalonResult> {
  const supabase = await createClient()

  try {
    // Check if salon has data
    const [staffResult, customerResult, appointmentResult] = await Promise.all([
      supabase
        .from('staff')
        .select('id', { count: 'exact', head: true })
        .eq('salon_id', salonId),
      supabase
        .from('customers')
        .select('id', { count: 'exact', head: true })
        .eq('salon_id', salonId),
      supabase
        .from('appointments')
        .select('id', { count: 'exact', head: true })
        .eq('salon_id', salonId),
    ])

    const hasData =
      (staffResult.count || 0) > 0 ||
      (customerResult.count || 0) > 0 ||
      (appointmentResult.count || 0) > 0

    if (hasData) {
      return {
        success: false,
        error: 'Salon kann nicht gelöscht werden, da noch Daten vorhanden sind. Deaktivieren Sie den Salon stattdessen.',
      }
    }

    const { error } = await supabase.from('salons').delete().eq('id', salonId)

    if (error) {
      logger.error('Failed to delete salon', { salonId, error: error.message })
      return { success: false, error: 'Salon konnte nicht gelöscht werden' }
    }

    logger.info('Salon deleted', { salonId })
    revalidatePath('/dashboard/salons')

    return { success: true, salonId }
  } catch (error) {
    logger.error('Error deleting salon', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// SALON STATS FOR HQ OVERVIEW
// ============================================

export interface HQStats {
  totalSalons: number
  activeSalons: number
  totalStaff: number
  totalCustomers: number
  totalMonthlyRevenue: number
}

/**
 * Get aggregated stats across all salons (for HQ dashboard)
 */
export async function getHQStats(): Promise<HQStats> {
  const supabase = await createClient()

  const [salonsResult, staffResult, customersResult, revenueResult] = await Promise.all([
    supabase.from('salons').select('id, is_active'),
    supabase
      .from('staff')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    supabase
      .from('customers')
      .select('id', { count: 'exact', head: true })
      .eq('is_active', true),
    (async () => {
      const monthStart = new Date()
      monthStart.setDate(1)
      monthStart.setHours(0, 0, 0, 0)

      const { data } = await supabase
        .from('appointments')
        .select('total_price')
        .eq('status', 'completed')
        .gte('starts_at', monthStart.toISOString())

      return data?.reduce((sum, r) => sum + (r.total_price || 0), 0) || 0
    })(),
  ])

  const salons = salonsResult.data || []
  const activeSalons = salons.filter((s) => s.is_active).length

  return {
    totalSalons: salons.length,
    activeSalons,
    totalStaff: staffResult.count || 0,
    totalCustomers: customersResult.count || 0,
    totalMonthlyRevenue: revenueResult,
  }
}
