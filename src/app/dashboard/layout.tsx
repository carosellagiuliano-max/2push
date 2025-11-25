import { redirect } from 'next/navigation'

import { createClient } from '@/lib/supabase/server'
import { DashboardLayout } from '@/features/dashboard'

export default async function DashboardRootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Redirect to login if not authenticated
  if (!user) {
    redirect('/login')
  }

  // Get user profile and role
  const { data: profile } = await supabase
    .from('profiles')
    .select('first_name, last_name, avatar_url')
    .eq('id', user.id)
    .single()

  const { data: userRole } = await supabase
    .from('user_roles')
    .select('role_name')
    .eq('profile_id', user.id)
    .single()

  const roleNames: Record<string, string> = {
    admin: 'Administrator',
    manager: 'Manager',
    mitarbeiter: 'Mitarbeiter',
  }

  const userData = {
    name: profile
      ? `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Benutzer'
      : 'Benutzer',
    email: user.email || '',
    avatar: profile?.avatar_url || undefined,
    role: userRole ? roleNames[userRole.role_name] || userRole.role_name : 'Mitarbeiter',
  }

  return <DashboardLayout user={userData}>{children}</DashboardLayout>
}
