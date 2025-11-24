'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'
import { CalendarHeader } from './calendar-header'
import { CalendarDayView } from './calendar-day-view'
import { CalendarWeekView } from './calendar-week-view'
import { AppointmentDetailModal } from './appointment-detail-modal'
import type { CalendarView, CalendarEvent, StaffColumn } from '../../types'

interface CalendarProps {
  events: CalendarEvent[]
  staff: StaffColumn[]
  initialDate?: Date
  initialView?: CalendarView
  startHour?: number
  endHour?: number
  className?: string
  onEventClick?: (event: CalendarEvent) => void
  onSlotClick?: (staffId: string, time: Date) => void
  onEventEdit?: (event: CalendarEvent) => void
  onEventCancel?: (event: CalendarEvent) => void
  onEventComplete?: (event: CalendarEvent) => void
  onEventNoShow?: (event: CalendarEvent) => void
}

export function Calendar({
  events,
  staff,
  initialDate = new Date(),
  initialView = 'day',
  startHour = 8,
  endHour = 20,
  className,
  onEventClick,
  onSlotClick,
  onEventEdit,
  onEventCancel,
  onEventComplete,
  onEventNoShow,
}: CalendarProps) {
  const [currentDate, setCurrentDate] = React.useState(initialDate)
  const [view, setView] = React.useState<CalendarView>(initialView)
  const [selectedStaffIds, setSelectedStaffIds] = React.useState<string[]>(
    staff.map((s) => s.id)
  )
  const [selectedEvent, setSelectedEvent] = React.useState<CalendarEvent | null>(null)
  const [isModalOpen, setIsModalOpen] = React.useState(false)

  // Update selected staff when staff changes
  React.useEffect(() => {
    setSelectedStaffIds(staff.map((s) => s.id))
  }, [staff])

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setIsModalOpen(true)
    onEventClick?.(event)
  }

  const handleDayClick = (date: Date) => {
    setCurrentDate(date)
    setView('day')
  }

  return (
    <div className={cn('flex flex-col h-full', className)}>
      <CalendarHeader
        currentDate={currentDate}
        view={view}
        onDateChange={setCurrentDate}
        onViewChange={setView}
        staff={staff}
        selectedStaffIds={selectedStaffIds}
        onStaffFilterChange={setSelectedStaffIds}
      />

      <div className="flex-1 overflow-hidden">
        {view === 'day' && (
          <CalendarDayView
            date={currentDate}
            events={events}
            staff={staff}
            selectedStaffIds={selectedStaffIds}
            startHour={startHour}
            endHour={endHour}
            onEventClick={handleEventClick}
            onSlotClick={onSlotClick}
          />
        )}

        {view === 'week' && (
          <CalendarWeekView
            date={currentDate}
            events={events}
            staff={staff}
            selectedStaffIds={selectedStaffIds}
            startHour={startHour}
            endHour={endHour}
            onEventClick={handleEventClick}
            onSlotClick={onSlotClick}
            onDayClick={handleDayClick}
          />
        )}
      </div>

      <AppointmentDetailModal
        event={selectedEvent}
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onEdit={onEventEdit}
        onCancel={onEventCancel}
        onComplete={onEventComplete}
        onNoShow={onEventNoShow}
      />
    </div>
  )
}
