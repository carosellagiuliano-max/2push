'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { DashboardSidebar } from './dashboard-sidebar'
import { Toaster } from '@/components/ui/toaster'

interface DashboardLayoutProps {
  children: React.ReactNode
  user?: {
    name: string
    email: string
    avatar?: string
    role: string
  }
}

export function DashboardLayout({ children, user }: DashboardLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      <DashboardSidebar user={user} />

      {/* Main content */}
      <main className="lg:pl-72">
        <div className="min-h-screen">
          {children}
        </div>
      </main>

      <Toaster />
    </div>
  )
}
