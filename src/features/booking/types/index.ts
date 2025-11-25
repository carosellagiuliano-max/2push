import type { Database } from '@/lib/database.types'

// Database row types
export type Service = Database['public']['Tables']['services']['Row']
export type ServiceCategory = Database['public']['Tables']['service_categories']['Row']
export type ServicePrice = Database['public']['Tables']['service_prices']['Row']
export type Staff = Database['public']['Tables']['staff']['Row']
export type StaffWorkingHours = Database['public']['Tables']['staff_working_hours']['Row']
export type Appointment = Database['public']['Tables']['appointments']['Row']
export type BookingRules = Database['public']['Tables']['booking_rules']['Row']
export type OpeningHours = Database['public']['Tables']['opening_hours']['Row']

// Extended types for booking flow
export interface ServiceWithPrice extends Service {
  current_price: number
  tax_rate: number
  category?: ServiceCategory
}

export interface StaffWithSchedule extends Staff {
  working_hours: StaffWorkingHours[]
  service_skills: string[] // service IDs
}

export interface TimeSlot {
  startsAt: Date
  endsAt: Date
  staffId: string
  isAvailable: boolean
}

export interface BookingState {
  step: BookingStep
  salonId: string | null
  selectedServices: ServiceWithPrice[]
  selectedStaff: StaffWithSchedule | null
  selectedSlot: TimeSlot | null
  customerInfo: CustomerInfo | null
  notes: string
}

export type BookingStep =
  | 'services'
  | 'staff'
  | 'datetime'
  | 'confirm'
  | 'success'

export interface CustomerInfo {
  firstName: string
  lastName: string
  email: string
  phone: string
}

export interface BookingRequest {
  salonId: string
  staffId: string
  serviceIds: string[]
  startsAt: string // ISO string
  customerInfo: CustomerInfo
  notes?: string
}

export interface BookingResponse {
  success: boolean
  appointmentId?: string
  error?: string
}

// Slot calculation types
export interface SlotCalculationParams {
  salonId: string
  staffId: string
  serviceIds: string[]
  date: Date
}

export interface AvailableSlots {
  date: string
  slots: TimeSlot[]
}
