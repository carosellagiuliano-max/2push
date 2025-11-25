'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logging'
import type { Staff, UserRole, RoleName, DayOfWeek } from '@/lib/database.types'

// ============================================
// TYPES
// ============================================

export interface StaffMember {
  id: string
  profileId: string | null
  displayName: string
  email: string | null
  phone: string | null
  title: string | null
  bio: string | null
  avatarUrl: string | null
  color: string
  isBookable: boolean
  isActive: boolean
  sortOrder: number
  workingHours: WorkingHoursEntry[]
  skills: string[]
  role: RoleName | null
}

export interface WorkingHoursEntry {
  dayOfWeek: DayOfWeek
  startMinutes: number
  endMinutes: number
}

export interface CreateStaffInput {
  displayName: string
  email?: string
  phone?: string
  title?: string
  bio?: string
  color?: string
  isBookable?: boolean
  workingHours?: WorkingHoursEntry[]
  serviceIds?: string[]
  role?: RoleName
}

export interface UpdateStaffInput {
  displayName?: string
  email?: string
  phone?: string
  title?: string
  bio?: string
  color?: string
  isBookable?: boolean
  isActive?: boolean
  sortOrder?: number
}

export interface StaffResult {
  success: boolean
  staffId?: string
  error?: string
}

// ============================================
// STAFF QUERIES
// ============================================

/**
 * Get all staff members for a salon
 */
export async function getStaffMembers(salonId: string): Promise<StaffMember[]> {
  const supabase = await createClient()

  const { data: staffList, error } = await supabase
    .from('staff')
    .select(`
      id,
      display_name,
      email,
      phone,
      title,
      bio,
      avatar_url,
      color,
      is_bookable,
      is_active,
      sort_order,
      profile_id
    `)
    .eq('salon_id', salonId)
    .order('sort_order')

  if (error) {
    logger.error('Failed to fetch staff members', { salonId, error: error.message })
    return []
  }

  // Get working hours for all staff
  const staffIds = staffList.map((s) => s.id)
  const { data: workingHours } = await supabase
    .from('staff_working_hours')
    .select('staff_id, day_of_week, start_minutes, end_minutes')
    .in('staff_id', staffIds)

  // Get skills for all staff
  const { data: skills } = await supabase
    .from('staff_service_skills')
    .select('staff_id, service_id, services:service_id(name)')
    .in('staff_id', staffIds)

  // Get roles for staff with linked profiles
  const profileIds = staffList.filter((s) => s.profile_id).map((s) => s.profile_id)
  const { data: roles } = await supabase
    .from('user_roles')
    .select('profile_id, role_name')
    .eq('salon_id', salonId)
    .in('profile_id', profileIds)

  // Map to StaffMember
  return staffList.map((staff) => {
    const staffWorkingHours = (workingHours || [])
      .filter((wh) => wh.staff_id === staff.id)
      .map((wh) => ({
        dayOfWeek: wh.day_of_week as DayOfWeek,
        startMinutes: wh.start_minutes,
        endMinutes: wh.end_minutes,
      }))

    const staffSkills = (skills || [])
      .filter((s) => s.staff_id === staff.id)
      .map((s) => (s.services as { name: string })?.name || 'Unknown')

    const staffRole = roles?.find((r) => r.profile_id === staff.profile_id)

    return {
      id: staff.id,
      profileId: staff.profile_id,
      displayName: staff.display_name,
      email: staff.email,
      phone: staff.phone,
      title: staff.title,
      bio: staff.bio,
      avatarUrl: staff.avatar_url,
      color: staff.color,
      isBookable: staff.is_bookable,
      isActive: staff.is_active,
      sortOrder: staff.sort_order,
      workingHours: staffWorkingHours,
      skills: staffSkills,
      role: staffRole?.role_name as RoleName | null,
    }
  })
}

/**
 * Get a single staff member by ID
 */
export async function getStaffMember(staffId: string): Promise<StaffMember | null> {
  const supabase = await createClient()

  const { data: staff, error } = await supabase
    .from('staff')
    .select(`
      id,
      salon_id,
      display_name,
      email,
      phone,
      title,
      bio,
      avatar_url,
      color,
      is_bookable,
      is_active,
      sort_order,
      profile_id
    `)
    .eq('id', staffId)
    .single()

  if (error || !staff) {
    return null
  }

  // Get working hours
  const { data: workingHours } = await supabase
    .from('staff_working_hours')
    .select('day_of_week, start_minutes, end_minutes')
    .eq('staff_id', staffId)

  // Get skills
  const { data: skills } = await supabase
    .from('staff_service_skills')
    .select('service_id, services:service_id(name)')
    .eq('staff_id', staffId)

  // Get role
  let role: RoleName | null = null
  if (staff.profile_id) {
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role_name')
      .eq('profile_id', staff.profile_id)
      .eq('salon_id', staff.salon_id)
      .single()
    role = roleData?.role_name as RoleName | null
  }

  return {
    id: staff.id,
    profileId: staff.profile_id,
    displayName: staff.display_name,
    email: staff.email,
    phone: staff.phone,
    title: staff.title,
    bio: staff.bio,
    avatarUrl: staff.avatar_url,
    color: staff.color,
    isBookable: staff.is_bookable,
    isActive: staff.is_active,
    sortOrder: staff.sort_order,
    workingHours: (workingHours || []).map((wh) => ({
      dayOfWeek: wh.day_of_week as DayOfWeek,
      startMinutes: wh.start_minutes,
      endMinutes: wh.end_minutes,
    })),
    skills: (skills || []).map((s) => (s.services as { name: string })?.name || 'Unknown'),
    role,
  }
}

// ============================================
// STAFF MUTATIONS
// ============================================

/**
 * Create a new staff member
 */
export async function createStaffMember(
  salonId: string,
  input: CreateStaffInput
): Promise<StaffResult> {
  const supabase = await createClient()

  try {
    // Get max sort order
    const { data: maxOrder } = await supabase
      .from('staff')
      .select('sort_order')
      .eq('salon_id', salonId)
      .order('sort_order', { ascending: false })
      .limit(1)
      .single()

    const sortOrder = (maxOrder?.sort_order || 0) + 1

    // Generate a color if not provided
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4']
    const color = input.color || colors[sortOrder % colors.length]

    // Create staff record
    const { data: staff, error } = await supabase
      .from('staff')
      .insert({
        salon_id: salonId,
        display_name: input.displayName,
        email: input.email || null,
        phone: input.phone || null,
        title: input.title || null,
        bio: input.bio || null,
        color,
        is_bookable: input.isBookable ?? true,
        sort_order: sortOrder,
        is_active: true,
      })
      .select('id')
      .single()

    if (error || !staff) {
      logger.error('Failed to create staff member', { salonId, error: error?.message })
      return { success: false, error: 'Mitarbeiter konnte nicht erstellt werden' }
    }

    // Create working hours if provided
    if (input.workingHours && input.workingHours.length > 0) {
      const workingHoursRows = input.workingHours.map((wh) => ({
        staff_id: staff.id,
        day_of_week: wh.dayOfWeek,
        start_minutes: wh.startMinutes,
        end_minutes: wh.endMinutes,
      }))

      await supabase.from('staff_working_hours').insert(workingHoursRows)
    }

    // Create service skills if provided
    if (input.serviceIds && input.serviceIds.length > 0) {
      const skillRows = input.serviceIds.map((serviceId) => ({
        staff_id: staff.id,
        service_id: serviceId,
        proficiency_level: 5, // Default to full proficiency
      }))

      await supabase.from('staff_service_skills').insert(skillRows)
    }

    logger.info('Staff member created', { staffId: staff.id, salonId })
    revalidatePath('/dashboard/team')

    return { success: true, staffId: staff.id }
  } catch (error) {
    logger.error('Error creating staff member', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Update a staff member
 */
export async function updateStaffMember(
  staffId: string,
  input: UpdateStaffInput
): Promise<StaffResult> {
  const supabase = await createClient()

  try {
    const updates: Record<string, unknown> = {}
    if (input.displayName !== undefined) updates.display_name = input.displayName
    if (input.email !== undefined) updates.email = input.email || null
    if (input.phone !== undefined) updates.phone = input.phone || null
    if (input.title !== undefined) updates.title = input.title || null
    if (input.bio !== undefined) updates.bio = input.bio || null
    if (input.color !== undefined) updates.color = input.color
    if (input.isBookable !== undefined) updates.is_bookable = input.isBookable
    if (input.isActive !== undefined) updates.is_active = input.isActive
    if (input.sortOrder !== undefined) updates.sort_order = input.sortOrder

    const { error } = await supabase.from('staff').update(updates).eq('id', staffId)

    if (error) {
      logger.error('Failed to update staff member', { staffId, error: error.message })
      return { success: false, error: 'Mitarbeiter konnte nicht aktualisiert werden' }
    }

    logger.info('Staff member updated', { staffId })
    revalidatePath('/dashboard/team')

    return { success: true, staffId }
  } catch (error) {
    logger.error('Error updating staff member', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Update staff working hours
 */
export async function updateStaffWorkingHours(
  staffId: string,
  workingHours: WorkingHoursEntry[]
): Promise<StaffResult> {
  const supabase = await createClient()

  try {
    // Delete existing working hours
    await supabase.from('staff_working_hours').delete().eq('staff_id', staffId)

    // Insert new working hours
    if (workingHours.length > 0) {
      const rows = workingHours.map((wh) => ({
        staff_id: staffId,
        day_of_week: wh.dayOfWeek,
        start_minutes: wh.startMinutes,
        end_minutes: wh.endMinutes,
      }))

      const { error } = await supabase.from('staff_working_hours').insert(rows)

      if (error) {
        logger.error('Failed to update working hours', { staffId, error: error.message })
        return { success: false, error: 'Arbeitszeiten konnten nicht aktualisiert werden' }
      }
    }

    logger.info('Staff working hours updated', { staffId })
    revalidatePath('/dashboard/team')

    return { success: true, staffId }
  } catch (error) {
    logger.error('Error updating working hours', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Update staff service skills
 */
export async function updateStaffSkills(
  staffId: string,
  serviceIds: string[]
): Promise<StaffResult> {
  const supabase = await createClient()

  try {
    // Delete existing skills
    await supabase.from('staff_service_skills').delete().eq('staff_id', staffId)

    // Insert new skills
    if (serviceIds.length > 0) {
      const rows = serviceIds.map((serviceId) => ({
        staff_id: staffId,
        service_id: serviceId,
        proficiency_level: 5,
      }))

      const { error } = await supabase.from('staff_service_skills').insert(rows)

      if (error) {
        logger.error('Failed to update staff skills', { staffId, error: error.message })
        return { success: false, error: 'Fähigkeiten konnten nicht aktualisiert werden' }
      }
    }

    logger.info('Staff skills updated', { staffId })
    revalidatePath('/dashboard/team')

    return { success: true, staffId }
  } catch (error) {
    logger.error('Error updating staff skills', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Deactivate a staff member (soft delete)
 */
export async function deactivateStaffMember(staffId: string): Promise<StaffResult> {
  return updateStaffMember(staffId, { isActive: false })
}

/**
 * Reactivate a staff member
 */
export async function reactivateStaffMember(staffId: string): Promise<StaffResult> {
  return updateStaffMember(staffId, { isActive: true })
}

// ============================================
// ROLE MANAGEMENT
// ============================================

/**
 * Assign a role to a user for a salon
 */
export async function assignRole(
  profileId: string,
  salonId: string,
  roleName: RoleName,
  assignedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Check if role already exists
    const { data: existing } = await supabase
      .from('user_roles')
      .select('id, role_name')
      .eq('profile_id', profileId)
      .eq('salon_id', salonId)
      .single()

    if (existing) {
      // Update existing role
      const { error } = await supabase
        .from('user_roles')
        .update({ role_name: roleName, assigned_by: assignedBy })
        .eq('id', existing.id)

      if (error) {
        return { success: false, error: 'Rolle konnte nicht aktualisiert werden' }
      }
    } else {
      // Create new role
      const { error } = await supabase.from('user_roles').insert({
        profile_id: profileId,
        salon_id: salonId,
        role_name: roleName,
        assigned_by: assignedBy,
      })

      if (error) {
        return { success: false, error: 'Rolle konnte nicht zugewiesen werden' }
      }
    }

    logger.info('Role assigned', { profileId, salonId, roleName })
    revalidatePath('/dashboard/team')

    return { success: true }
  } catch (error) {
    logger.error('Error assigning role', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Remove a role from a user
 */
export async function removeRole(
  profileId: string,
  salonId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase
      .from('user_roles')
      .delete()
      .eq('profile_id', profileId)
      .eq('salon_id', salonId)

    if (error) {
      return { success: false, error: 'Rolle konnte nicht entfernt werden' }
    }

    logger.info('Role removed', { profileId, salonId })
    revalidatePath('/dashboard/team')

    return { success: true }
  } catch (error) {
    logger.error('Error removing role', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// GDPR COMPLIANCE
// ============================================

/**
 * Export all data for a customer (GDPR Article 20 - Right to data portability)
 */
export async function exportCustomerData(
  customerId: string,
  salonId: string
): Promise<{ success: boolean; data?: Record<string, unknown>; error?: string }> {
  const supabase = await createClient()

  try {
    // Get customer data
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('*')
      .eq('id', customerId)
      .eq('salon_id', salonId)
      .single()

    if (customerError || !customer) {
      return { success: false, error: 'Kunde nicht gefunden' }
    }

    // Get appointments
    const { data: appointments } = await supabase
      .from('appointments')
      .select(`
        id,
        starts_at,
        ends_at,
        status,
        total_price,
        customer_notes,
        created_at,
        appointment_services (
          service_name,
          duration_minutes,
          snapshot_price
        )
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    // Get orders
    const { data: orders } = await supabase
      .from('orders')
      .select(`
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
      `)
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })

    // Get consents
    const { data: consents } = await supabase
      .from('customer_consents')
      .select('*')
      .eq('customer_id', customerId)

    const exportData = {
      exportedAt: new Date().toISOString(),
      customer: {
        firstName: customer.first_name,
        lastName: customer.last_name,
        email: customer.email,
        phone: customer.phone,
        birthday: customer.birthday,
        notes: customer.notes,
        acceptsMarketing: customer.accepts_marketing,
        firstVisit: customer.first_visit_at,
        lastVisit: customer.last_visit_at,
        totalVisits: customer.total_visits,
        totalSpend: customer.total_spend,
        createdAt: customer.created_at,
      },
      appointments: appointments || [],
      orders: orders || [],
      consents: consents || [],
    }

    logger.info('Customer data exported', { customerId, salonId })

    return { success: true, data: exportData }
  } catch (error) {
    logger.error('Error exporting customer data', {
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Daten konnten nicht exportiert werden' }
  }
}

/**
 * Delete all customer data (GDPR Article 17 - Right to erasure)
 * This anonymizes the data rather than hard-deleting to maintain referential integrity
 */
export async function deleteCustomerData(
  customerId: string,
  salonId: string,
  deletedBy: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Verify customer exists and belongs to salon
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('id, email')
      .eq('id', customerId)
      .eq('salon_id', salonId)
      .single()

    if (customerError || !customer) {
      return { success: false, error: 'Kunde nicht gefunden' }
    }

    // Anonymize customer data
    const anonymizedEmail = `deleted_${customerId.slice(0, 8)}@deleted.local`
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
      })
      .eq('id', customerId)

    if (updateError) {
      logger.error('Failed to anonymize customer', { customerId, error: updateError.message })
      return { success: false, error: 'Kundendaten konnten nicht gelöscht werden' }
    }

    // Delete consents
    await supabase.from('customer_consents').delete().eq('customer_id', customerId)

    // Delete customer addresses
    await supabase.from('customer_addresses').delete().eq('customer_id', customerId)

    // Log the deletion for audit purposes
    await supabase.from('audit_log').insert({
      salon_id: salonId,
      action: 'customer_data_deleted',
      entity_type: 'customer',
      entity_id: customerId,
      performed_by: deletedBy,
      details: {
        originalEmail: customer.email,
        deletedAt: new Date().toISOString(),
      },
    })

    logger.info('Customer data deleted (anonymized)', { customerId, salonId, deletedBy })

    return { success: true }
  } catch (error) {
    logger.error('Error deleting customer data', {
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Record customer consent (GDPR Article 7)
 */
export async function recordConsent(
  customerId: string,
  category: 'marketing_email' | 'marketing_sms' | 'loyalty_program' | 'analytics' | 'partner_sharing',
  status: 'given' | 'withdrawn',
  ipAddress?: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const { error } = await supabase.from('customer_consents').upsert(
      {
        customer_id: customerId,
        category,
        status,
        ip_address: ipAddress,
        recorded_at: new Date().toISOString(),
      },
      {
        onConflict: 'customer_id,category',
      }
    )

    if (error) {
      logger.error('Failed to record consent', { customerId, category, error: error.message })
      return { success: false, error: 'Einwilligung konnte nicht gespeichert werden' }
    }

    // Update accepts_marketing flag on customer if relevant
    if (category === 'marketing_email' || category === 'marketing_sms') {
      const acceptsMarketing = status === 'given'
      await supabase
        .from('customers')
        .update({ accepts_marketing: acceptsMarketing })
        .eq('id', customerId)
    }

    logger.info('Consent recorded', { customerId, category, status })

    return { success: true }
  } catch (error) {
    logger.error('Error recording consent', {
      customerId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Get all consents for a customer
 */
export async function getCustomerConsents(customerId: string): Promise<
  Array<{
    category: string
    status: 'given' | 'withdrawn'
    recordedAt: string
  }>
> {
  const supabase = await createClient()

  const { data: consents } = await supabase
    .from('customer_consents')
    .select('category, status, recorded_at')
    .eq('customer_id', customerId)

  return (consents || []).map((c) => ({
    category: c.category,
    status: c.status as 'given' | 'withdrawn',
    recordedAt: c.recorded_at,
  }))
}
