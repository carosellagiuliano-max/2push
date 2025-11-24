'use server'

import { createClient } from '@/lib/supabase/server'
import type { ServiceWithPrice, ServiceCategory, StaffWithSchedule } from '../types'

export async function getServicesWithPrices(salonId: string): Promise<ServiceWithPrice[]> {
  const supabase = await createClient()

  const { data: services, error } = await supabase
    .from('services')
    .select(`
      *,
      category:service_categories(*),
      prices:service_prices(
        price,
        tax_rate:tax_rates(rate)
      )
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .eq('is_online_bookable', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to fetch services:', error)
    throw new Error('Dienstleistungen konnten nicht geladen werden')
  }

  // Transform to ServiceWithPrice
  return (services || []).map((service) => {
    // Get current price (latest with valid_to = null)
    const currentPriceRecord = service.prices?.find((p: { valid_to?: string }) => !p.valid_to)
    const currentPrice = currentPriceRecord?.price || 0
    const taxRate = currentPriceRecord?.tax_rate?.rate || 8.1

    return {
      ...service,
      current_price: currentPrice,
      tax_rate: taxRate,
      category: service.category,
    } as ServiceWithPrice
  })
}

export async function getServiceCategories(salonId: string): Promise<ServiceCategory[]> {
  const supabase = await createClient()

  const { data: categories, error } = await supabase
    .from('service_categories')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_visible', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to fetch categories:', error)
    throw new Error('Kategorien konnten nicht geladen werden')
  }

  return categories || []
}

export async function getBookableStaff(salonId: string): Promise<StaffWithSchedule[]> {
  const supabase = await createClient()

  const { data: staff, error } = await supabase
    .from('staff')
    .select(`
      *,
      working_hours:staff_working_hours(*),
      skills:staff_service_skills(service_id)
    `)
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .eq('is_bookable', true)
    .order('sort_order', { ascending: true })

  if (error) {
    console.error('Failed to fetch staff:', error)
    throw new Error('Mitarbeiter konnten nicht geladen werden')
  }

  return (staff || []).map((member) => ({
    ...member,
    working_hours: member.working_hours || [],
    service_skills: (member.skills || []).map((s: { service_id: string }) => s.service_id),
  })) as StaffWithSchedule[]
}

export async function getSalonBySlug(slug: string) {
  const supabase = await createClient()

  const { data: salon, error } = await supabase
    .from('salons')
    .select('*')
    .eq('slug', slug)
    .eq('is_active', true)
    .single()

  if (error) {
    console.error('Failed to fetch salon:', error)
    return null
  }

  return salon
}

export async function getDefaultSalon() {
  const supabase = await createClient()

  const { data: salon, error } = await supabase
    .from('salons')
    .select('*')
    .eq('is_active', true)
    .limit(1)
    .single()

  if (error) {
    console.error('Failed to fetch default salon:', error)
    return null
  }

  return salon
}
