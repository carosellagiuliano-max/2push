'use server'

import { createClient } from '@/lib/supabase/server'
import type { CustomerFilterValues, PaginatedCustomers, CustomerWithStats } from '../types'

const DEFAULT_PAGE_SIZE = 20

export async function getCustomers(
  salonId: string,
  filters: CustomerFilterValues = {},
  page: number = 1,
  pageSize: number = DEFAULT_PAGE_SIZE
): Promise<PaginatedCustomers> {
  const supabase = await createClient()

  const {
    search,
    status = 'all',
    sortBy = 'name',
    sortOrder = 'asc',
  } = filters

  // Build query
  let query = supabase
    .from('customers')
    .select('*, staff!preferred_staff_id(id, display_name, color)', { count: 'exact' })
    .eq('salon_id', salonId)

  // Apply status filter
  if (status === 'active') {
    query = query.eq('is_active', true)
  } else if (status === 'inactive') {
    query = query.eq('is_active', false)
  }

  // Apply search filter
  if (search && search.trim()) {
    const searchTerm = `%${search.trim()}%`
    query = query.or(
      `first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},email.ilike.${searchTerm},phone.ilike.${searchTerm}`
    )
  }

  // Apply sorting
  const sortColumn = sortBy === 'name' ? 'last_name' : sortBy
  query = query.order(sortColumn, { ascending: sortOrder === 'asc' })

  // Add secondary sort for name
  if (sortBy === 'name') {
    query = query.order('first_name', { ascending: sortOrder === 'asc' })
  }

  // Apply pagination
  const from = (page - 1) * pageSize
  const to = from + pageSize - 1
  query = query.range(from, to)

  const { data, error, count } = await query

  if (error) {
    console.error('Error fetching customers:', error)
    return {
      customers: [],
      total: 0,
      page,
      pageSize,
      totalPages: 0,
    }
  }

  const customers: CustomerWithStats[] = (data || []).map((c) => ({
    ...c,
    preferred_staff_name: c.staff?.display_name || undefined,
  }))

  const total = count || 0
  const totalPages = Math.ceil(total / pageSize)

  return {
    customers,
    total,
    page,
    pageSize,
    totalPages,
  }
}

export async function searchCustomers(
  salonId: string,
  searchTerm: string,
  limit: number = 10
): Promise<CustomerWithStats[]> {
  const supabase = await createClient()

  if (!searchTerm || searchTerm.trim().length < 2) {
    return []
  }

  const term = `%${searchTerm.trim()}%`

  const { data, error } = await supabase
    .from('customers')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_active', true)
    .or(`first_name.ilike.${term},last_name.ilike.${term},email.ilike.${term},phone.ilike.${term}`)
    .order('last_name')
    .limit(limit)

  if (error) {
    console.error('Error searching customers:', error)
    return []
  }

  return data || []
}
