/**
 * Database types for SCHNITTWERK
 *
 * These types should be regenerated from the database using:
 * pnpm db:generate
 *
 * This file contains manually defined types until Supabase is connected.
 */

// ============================================
// ENUMS
// ============================================

export type RoleName = 'admin' | 'manager' | 'mitarbeiter' | 'kunde' | 'hq'

export type AppointmentStatus =
  | 'reserved'
  | 'requested'
  | 'confirmed'
  | 'completed'
  | 'cancelled'
  | 'no_show'

export type OrderStatus =
  | 'pending'
  | 'paid'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'cancelled'
  | 'refunded'

export type PaymentStatus =
  | 'pending'
  | 'authorized'
  | 'captured'
  | 'failed'
  | 'cancelled'
  | 'refunded'
  | 'partially_refunded'

export type PaymentMethod =
  | 'stripe_card'
  | 'stripe_twint'
  | 'cash'
  | 'terminal'
  | 'voucher'
  | 'manual_adjustment'

export type NotificationChannel = 'email' | 'sms' | 'push'

export type ConsentCategory =
  | 'marketing_email'
  | 'marketing_sms'
  | 'loyalty_program'
  | 'analytics'
  | 'partner_sharing'

export type ConsentStatus = 'given' | 'withdrawn'

export type BlockedTimeType =
  | 'holiday'
  | 'vacation'
  | 'sick'
  | 'training'
  | 'maintenance'
  | 'other'

export type DayOfWeek = '1' | '2' | '3' | '4' | '5' | '6' | '7'

export type AddressType = 'billing' | 'shipping' | 'both'

// ============================================
// TABLE TYPES
// ============================================

export interface Salon {
  id: string
  name: string
  slug: string
  email: string | null
  phone: string | null
  website: string | null
  street: string | null
  postal_code: string | null
  city: string | null
  country: string
  latitude: number | null
  longitude: number | null
  timezone: string
  currency: string
  default_language: string
  logo_url: string | null
  primary_color: string
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Profile {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  email_verified_at: string | null
  created_at: string
  updated_at: string
}

export interface UserRole {
  id: string
  profile_id: string
  salon_id: string | null
  role_name: RoleName
  assigned_by: string | null
  assigned_at: string
}

export interface Customer {
  id: string
  salon_id: string
  profile_id: string | null
  first_name: string
  last_name: string
  email: string | null
  phone: string | null
  birthday: string | null
  preferred_staff_id: string | null
  notes: string | null
  accepts_marketing: boolean
  first_visit_at: string | null
  last_visit_at: string | null
  total_visits: number
  total_spend: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface Staff {
  id: string
  salon_id: string
  profile_id: string | null
  display_name: string
  title: string | null
  bio: string | null
  avatar_url: string | null
  email: string | null
  phone: string | null
  color: string
  is_bookable: boolean
  booking_buffer_minutes: number
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface StaffWorkingHours {
  id: string
  staff_id: string
  day_of_week: DayOfWeek
  start_minutes: number
  end_minutes: number
  created_at: string
}

export interface ServiceCategory {
  id: string
  salon_id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sort_order: number
  is_visible: boolean
  created_at: string
  updated_at: string
}

export interface Service {
  id: string
  salon_id: string
  category_id: string | null
  name: string
  slug: string
  description: string | null
  short_description: string | null
  duration_minutes: number
  buffer_before_minutes: number
  buffer_after_minutes: number
  is_online_bookable: boolean
  requires_deposit: boolean
  max_advance_days: number | null
  image_url: string | null
  sort_order: number
  is_active: boolean
  created_at: string
  updated_at: string
}

export interface ServicePrice {
  id: string
  service_id: string
  tax_rate_id: string
  price: number
  valid_from: string
  valid_to: string | null
  created_at: string
}

export interface TaxRate {
  id: string
  salon_id: string
  code: string
  description: string | null
  rate_percent: number
  valid_from: string
  valid_to: string | null
  is_default: boolean
  created_at: string
  updated_at: string
}

export interface BookingRules {
  id: string
  salon_id: string
  min_lead_time_minutes: number
  max_horizon_days: number
  cancellation_cutoff_hours: number
  slot_granularity_minutes: number
  default_buffer_minutes: number
  deposit_required_percent: number
  no_show_policy: string
  no_show_fee_percent: number
  reservation_timeout_minutes: number
  max_reservations_per_customer: number
  created_at: string
  updated_at: string
}

export interface OpeningHours {
  id: string
  salon_id: string
  day_of_week: DayOfWeek
  open_minutes: number
  close_minutes: number
  is_closed: boolean
  created_at: string
  updated_at: string
}

export interface Appointment {
  id: string
  salon_id: string
  customer_id: string
  staff_id: string
  starts_at: string
  ends_at: string
  status: AppointmentStatus
  reserved_until: string | null
  deposit_required: boolean
  deposit_amount: number | null
  deposit_paid: boolean
  deposit_paid_at: string | null
  total_price: number | null
  total_tax: number | null
  cancelled_at: string | null
  cancelled_by: string | null
  cancellation_reason: string | null
  marked_no_show_at: string | null
  marked_no_show_by: string | null
  no_show_fee_charged: number | null
  customer_notes: string | null
  internal_notes: string | null
  booked_online: boolean
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface AppointmentService {
  id: string
  appointment_id: string
  service_id: string
  service_name: string
  duration_minutes: number
  snapshot_price: number
  snapshot_tax_rate_percent: number
  sort_order: number
  created_at: string
}

// ============================================
// DATABASE INTERFACE
// ============================================

export interface StaffServiceSkill {
  id: string
  staff_id: string
  service_id: string
  proficiency_level: number
  created_at: string
}

export interface BlockedTime {
  id: string
  salon_id: string
  staff_id: string | null
  block_type: BlockedTimeType
  reason: string | null
  starts_at: string
  ends_at: string
  is_recurring: boolean
  recurrence_pattern: string | null
  created_by: string | null
  created_at: string
  updated_at: string
}

export interface Database {
  public: {
    Tables: {
      salons: {
        Row: Salon
        Insert: Omit<Salon, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Salon, 'id' | 'created_at' | 'updated_at'>>
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'created_at' | 'updated_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at' | 'updated_at'>>
      }
      user_roles: {
        Row: UserRole
        Insert: Omit<UserRole, 'id' | 'assigned_at'>
        Update: Partial<Omit<UserRole, 'id' | 'assigned_at'>>
      }
      customers: {
        Row: Customer
        Insert: Omit<Customer, 'id' | 'created_at' | 'updated_at' | 'total_visits' | 'total_spend'>
        Update: Partial<Omit<Customer, 'id' | 'created_at' | 'updated_at'>>
      }
      staff: {
        Row: Staff
        Insert: Omit<Staff, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Staff, 'id' | 'created_at' | 'updated_at'>>
      }
      staff_working_hours: {
        Row: StaffWorkingHours
        Insert: Omit<StaffWorkingHours, 'id' | 'created_at'>
        Update: Partial<Omit<StaffWorkingHours, 'id' | 'created_at'>>
      }
      staff_service_skills: {
        Row: StaffServiceSkill
        Insert: Omit<StaffServiceSkill, 'id' | 'created_at'>
        Update: Partial<Omit<StaffServiceSkill, 'id' | 'created_at'>>
      }
      services: {
        Row: Service
        Insert: Omit<Service, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Service, 'id' | 'created_at' | 'updated_at'>>
      }
      service_categories: {
        Row: ServiceCategory
        Insert: Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<ServiceCategory, 'id' | 'created_at' | 'updated_at'>>
      }
      service_prices: {
        Row: ServicePrice
        Insert: Omit<ServicePrice, 'id' | 'created_at'>
        Update: Partial<Omit<ServicePrice, 'id' | 'created_at'>>
      }
      tax_rates: {
        Row: TaxRate
        Insert: Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<TaxRate, 'id' | 'created_at' | 'updated_at'>>
      }
      appointments: {
        Row: Appointment
        Insert: Omit<Appointment, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<Appointment, 'id' | 'created_at' | 'updated_at'>>
      }
      appointment_services: {
        Row: AppointmentService
        Insert: Omit<AppointmentService, 'id' | 'created_at'>
        Update: Partial<Omit<AppointmentService, 'id' | 'created_at'>>
      }
      booking_rules: {
        Row: BookingRules
        Insert: Omit<BookingRules, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BookingRules, 'id' | 'created_at' | 'updated_at'>>
      }
      opening_hours: {
        Row: OpeningHours
        Insert: Omit<OpeningHours, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<OpeningHours, 'id' | 'created_at' | 'updated_at'>>
      }
      blocked_times: {
        Row: BlockedTime
        Insert: Omit<BlockedTime, 'id' | 'created_at' | 'updated_at'>
        Update: Partial<Omit<BlockedTime, 'id' | 'created_at' | 'updated_at'>>
      }
    }
    Enums: {
      role_name: RoleName
      appointment_status: AppointmentStatus
      order_status: OrderStatus
      payment_status: PaymentStatus
      payment_method: PaymentMethod
      notification_channel: NotificationChannel
      consent_category: ConsentCategory
      consent_status: ConsentStatus
      blocked_time_type: BlockedTimeType
      day_of_week: DayOfWeek
      address_type: AddressType
    }
  }
}
