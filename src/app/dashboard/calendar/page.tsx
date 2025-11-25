'use client'

import * as React from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DashboardHeader,
  Calendar,
  QuickAppointmentModal,
} from '@/features/dashboard'
import type { CalendarEvent, StaffColumn } from '@/features/dashboard'

// Mock data
const mockStaff: StaffColumn[] = [
  { id: '1', name: 'Anna Müller', color: '#E11D48' },
  { id: '2', name: 'Marco Rossi', color: '#2563EB' },
  { id: '3', name: 'Julia Weber', color: '#059669' },
]

const mockServices = [
  { id: '1', name: 'Herrenschnitt', duration_minutes: 30 },
  { id: '2', name: 'Damenschnitt', duration_minutes: 45 },
  { id: '3', name: 'Färben', duration_minutes: 90 },
  { id: '4', name: 'Föhnen', duration_minutes: 20 },
]

// Generate mock events
function generateMockEvents(): CalendarEvent[] {
  const events: CalendarEvent[] = []
  const today = new Date()

  // Create some appointments for today
  const times = [9, 10, 11, 14, 15, 16]

  times.forEach((hour, idx) => {
    const staffIdx = idx % mockStaff.length
    const start = new Date(today)
    start.setHours(hour, 0, 0, 0)
    const end = new Date(start)
    end.setMinutes(end.getMinutes() + 45)

    events.push({
      id: `event-${idx}`,
      title: `Kunde ${idx + 1}`,
      start,
      end,
      staffId: mockStaff[staffIdx].id,
      staffColor: mockStaff[staffIdx].color,
      type: 'appointment',
      appointment: {
        id: `apt-${idx}`,
        salon_id: '1',
        customer_id: `cust-${idx}`,
        staff_id: mockStaff[staffIdx].id,
        starts_at: start.toISOString(),
        ends_at: end.toISOString(),
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
        customer_notes: idx === 2 ? 'Allergisch gegen bestimmte Produkte' : null,
        internal_notes: null,
        booked_online: idx % 2 === 0,
        created_by: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer: {
          id: `cust-${idx}`,
          first_name: ['Max', 'Laura', 'Thomas', 'Sarah', 'Michael', 'Emma'][idx],
          last_name: ['Mustermann', 'Schmidt', 'Meier', 'Weber', 'Fischer', 'Braun'][idx],
          phone: '+41 79 123 45 67',
          email: `kunde${idx}@example.ch`,
        },
        staff: {
          id: mockStaff[staffIdx].id,
          display_name: mockStaff[staffIdx].name,
          color: mockStaff[staffIdx].color,
          avatar_url: null,
        },
        services: [
          {
            id: mockServices[idx % mockServices.length].id,
            name: mockServices[idx % mockServices.length].name,
            duration_minutes: mockServices[idx % mockServices.length].duration_minutes,
            price: 45 + idx * 10,
          },
        ],
      },
    })
  })

  return events
}

export default function CalendarPage() {
  const [events] = React.useState<CalendarEvent[]>(generateMockEvents)
  const [isQuickModalOpen, setIsQuickModalOpen] = React.useState(false)
  const [selectedSlot, setSelectedSlot] = React.useState<{
    staffId: string
    time: Date
  } | null>(null)

  const handleSlotClick = (staffId: string, time: Date) => {
    setSelectedSlot({ staffId, time })
    setIsQuickModalOpen(true)
  }

  const handleQuickAppointment = async (_data: unknown) => {
    // TODO: Implement actual appointment creation
    await new Promise((resolve) => setTimeout(resolve, 1000))
    setSelectedSlot(null)
  }

  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader
        title="Kalender"
        description="Verwalten Sie Ihre Termine"
        actions={
          <Button onClick={() => setIsQuickModalOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Neuer Termin
          </Button>
        }
      />

      <div className="flex-1 overflow-hidden">
        <Calendar
          events={events}
          staff={mockStaff}
          onSlotClick={handleSlotClick}
          onEventEdit={() => { /* TODO: Implement edit */ }}
          onEventCancel={() => { /* TODO: Implement cancel */ }}
          onEventComplete={() => { /* TODO: Implement complete */ }}
          onEventNoShow={() => { /* TODO: Implement no-show */ }}
        />
      </div>

      <QuickAppointmentModal
        open={isQuickModalOpen}
        onOpenChange={(open) => {
          setIsQuickModalOpen(open)
          if (!open) setSelectedSlot(null)
        }}
        staff={mockStaff}
        services={mockServices}
        initialDate={selectedSlot?.time}
        initialStaffId={selectedSlot?.staffId}
        onSubmit={handleQuickAppointment}
      />
    </div>
  )
}
