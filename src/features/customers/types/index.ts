/**
 * Customer feature types
 */

import type { Customer, AppointmentStatus } from '@/lib/database.types'

// Customer with computed/related data
export interface CustomerWithStats extends Customer {
  upcoming_appointments_count?: number
  preferred_staff_name?: string
}

// Customer appointment history entry
export interface CustomerAppointmentHistory {
  id: string
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  total_price: number | null
  staff: {
    id: string
    display_name: string
    color: string
  }
  services: Array<{
    id: string
    name: string
    price: number
  }>
}

// Customer list filters
export interface CustomerFilterValues {
  search?: string
  status?: 'active' | 'inactive' | 'all'
  hasUpcoming?: boolean
  sortBy?: 'name' | 'last_visit' | 'total_visits' | 'total_spend' | 'created_at'
  sortOrder?: 'asc' | 'desc'
}

// Customer form data
export interface CustomerFormData {
  first_name: string
  last_name: string
  email?: string
  phone?: string
  birthday?: string
  preferred_staff_id?: string
  notes?: string
  accepts_marketing: boolean
}

// Customer statistics
export interface CustomerStats {
  totalCustomers: number
  activeCustomers: number
  newThisMonth: number
  averageSpend: number
  topCustomers: Array<{
    id: string
    name: string
    total_spend: number
  }>
}

// Paginated response
export interface PaginatedCustomers {
  customers: CustomerWithStats[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Customer detail view
export interface CustomerDetail extends Customer {
  preferred_staff?: {
    id: string
    display_name: string
    color: string
  } | null
  appointments: CustomerAppointmentHistory[]
  statistics: {
    totalAppointments: number
    completedAppointments: number
    cancelledAppointments: number
    noShowCount: number
    averageSpend: number
    favoriteServices: Array<{
      name: string
      count: number
    }>
  }
}
