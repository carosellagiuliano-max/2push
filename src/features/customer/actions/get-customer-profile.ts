'use server'

import { createClient } from '@/lib/supabase/server'

export type CustomerProfile = {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  phone: string | null
  birthday: string | null
}

export async function getCustomerProfile(): Promise<CustomerProfile | null> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    return null
  }

  // Get customer record for current user
  const { data: customer } = await supabase
    .from('customers')
    .select('id, first_name, last_name, phone, birthday, email')
    .eq('profile_id', user.id)
    .single()

  if (!customer) {
    // Return profile data from auth user if no customer record
    return {
      id: user.id,
      email: user.email || '',
      first_name: user.user_metadata?.first_name || null,
      last_name: user.user_metadata?.last_name || null,
      phone: null,
      birthday: null,
    }
  }

  return {
    id: customer.id,
    email: customer.email || user.email || '',
    first_name: customer.first_name,
    last_name: customer.last_name,
    phone: customer.phone,
    birthday: customer.birthday,
  }
}
