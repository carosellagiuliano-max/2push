'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DashboardHeader,
  StatsCards,
  UpcomingAppointments,
  QuickAppointmentModal,
} from '@/features/dashboard'
import type { DashboardStats, CalendarAppointment, StaffColumn } from '@/features/dashboard'

// Mock data for demo
const mockStats: DashboardStats = {
  todayAppointments: 8,
  upcomingAppointments: 3,
  todayRevenue: 850,
  weekRevenue: 4250,
  newCustomers: 5,
  noShows: 1,
}

const mockStaff: StaffColumn[] = [
  { id: '1', name: 'Anna Müller', color: '#E11D48' },
  { id: '2', name: 'Marco Rossi', color: '#2563EB' },
  { id: '3', name: 'Julia Weber', color: '#059669' },
]

const mockServices = [
  { id: '1', name: 'Herrenschnitt', duration_minutes: 30 },
  { id: '2', name: 'Damenschnitt', duration_minutes: 45 },
  { id: '3', name: 'Färben', duration_minutes: 90 },
]

const mockAppointments: CalendarAppointment[] = [
  {
    id: '1',
    salon_id: '1',
    customer_id: '1',
    staff_id: '1',
    starts_at: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    status: 'confirmed',
    reserved_until: null,
    deposit_required: false,
    deposit_amount: null,
    deposit_paid: false,
    deposit_paid_at: null,
    total_price: 85,
    total_tax: null,
    cancelled_at: null,
    cancelled_by: null,
    cancellation_reason: null,
    marked_no_show_at: null,
    marked_no_show_by: null,
    no_show_fee_charged: null,
    customer_notes: null,
    internal_notes: null,
    booked_online: true,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: '1',
      first_name: 'Max',
      last_name: 'Mustermann',
      phone: '+41 79 123 45 67',
      email: 'max@example.ch',
    },
    staff: {
      id: '1',
      display_name: 'Anna Müller',
      color: '#E11D48',
      avatar_url: null,
    },
    services: [
      { id: '1', name: 'Herrenschnitt', duration_minutes: 30, price: 45 },
      { id: '2', name: 'Bartpflege', duration_minutes: 15, price: 25 },
    ],
  },
  {
    id: '2',
    salon_id: '1',
    customer_id: '2',
    staff_id: '2',
    starts_at: new Date(Date.now() + 90 * 60 * 1000).toISOString(),
    ends_at: new Date(Date.now() + 150 * 60 * 1000).toISOString(),
    status: 'confirmed',
    reserved_until: null,
    deposit_required: false,
    deposit_amount: null,
    deposit_paid: false,
    deposit_paid_at: null,
    total_price: 120,
    total_tax: null,
    cancelled_at: null,
    cancelled_by: null,
    cancellation_reason: null,
    marked_no_show_at: null,
    marked_no_show_by: null,
    no_show_fee_charged: null,
    customer_notes: null,
    internal_notes: null,
    booked_online: false,
    created_by: null,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer: {
      id: '2',
      first_name: 'Laura',
      last_name: 'Schmidt',
      phone: '+41 79 234 56 78',
      email: 'laura@example.ch',
    },
    staff: {
      id: '2',
      display_name: 'Marco Rossi',
      color: '#2563EB',
      avatar_url: null,
    },
    services: [
      { id: '3', name: 'Damenschnitt', duration_minutes: 45, price: 65 },
      { id: '4', name: 'Föhnen', duration_minutes: 20, price: 35 },
    ],
  },
]

export default function DashboardPage() {
  const [isQuickModalOpen, setIsQuickModalOpen] = React.useState(false)

  const handleQuickAppointment = async (data: unknown) => {
    console.log('Quick appointment:', data)
    // TODO: Implement actual appointment creation
    await new Promise((resolve) => setTimeout(resolve, 1000))
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Dashboard"
        description="Willkommen zurück! Hier ist Ihr Tagesüberblick."
        actions={
          <Button onClick={() => setIsQuickModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Termin
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <StatsCards stats={mockStats} />

        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingAppointments appointments={mockAppointments} />

          {/* Quick actions card */}
          <div className="space-y-4">
            {/* Can add more widgets here */}
          </div>
        </div>
      </div>

      <QuickAppointmentModal
        open={isQuickModalOpen}
        onOpenChange={setIsQuickModalOpen}
        staff={mockStaff}
        services={mockServices}
        onSubmit={handleQuickAppointment}
      />
    </div>
  )
}
