import type { Appointment, Staff, Customer, Service } from '@/lib/database.types'

export type CalendarView = 'day' | 'week' | 'month'

export interface CalendarAppointment extends Appointment {
  customer: Pick<Customer, 'id' | 'first_name' | 'last_name' | 'phone' | 'email'>
  staff: Pick<Staff, 'id' | 'display_name' | 'color' | 'avatar_url'>
  services: Array<{
    id: string
    name: string
    duration_minutes: number
    price: number
  }>
}

export interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  staffId: string
  staffColor: string
  type: 'appointment' | 'blocked' | 'break'
  appointment?: CalendarAppointment
}

export interface StaffColumn {
  id: string
  name: string
  color: string
  avatar?: string
}

export interface DashboardStats {
  todayAppointments: number
  upcomingAppointments: number
  todayRevenue: number
  weekRevenue: number
  newCustomers: number
  noShows: number
}

export interface TimeRange {
  start: number // minutes from midnight
  end: number
}
