'use client'

import * as React from 'react'
import { format, isSameDay, setHours, setMinutes } from 'date-fns'
import { de } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import type { CalendarEvent, StaffColumn } from '../../types'

interface CalendarDayViewProps {
  date: Date
  events: CalendarEvent[]
  staff: StaffColumn[]
  selectedStaffIds: string[]
  startHour?: number
  endHour?: number
  onEventClick?: (event: CalendarEvent) => void
  onSlotClick?: (staffId: string, time: Date) => void
}

export function CalendarDayView({
  date,
  events,
  staff,
  selectedStaffIds,
  startHour = 8,
  endHour = 20,
  onEventClick,
  onSlotClick,
}: CalendarDayViewProps) {
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)
  const filteredStaff = staff.filter((s) => selectedStaffIds.includes(s.id))

  const getEventsForStaffAndHour = (staffId: string, hour: number) => {
    return events.filter((event) => {
      if (event.staffId !== staffId) return false
      if (!isSameDay(event.start, date)) return false

      const eventHour = event.start.getHours()
      const eventEndHour = event.end.getHours()
      const eventEndMinutes = event.end.getMinutes()

      // Check if event overlaps with this hour
      return eventHour <= hour && (eventEndHour > hour || (eventEndHour === hour && eventEndMinutes > 0))
    })
  }

  const calculateEventPosition = (event: CalendarEvent, hour: number) => {
    const eventStartHour = event.start.getHours()
    const eventStartMinutes = event.start.getMinutes()
    const eventEndHour = event.end.getHours()
    const eventEndMinutes = event.end.getMinutes()

    // Only show event in its starting hour cell
    if (eventStartHour !== hour) return null

    const top = (eventStartMinutes / 60) * 100
    const durationMinutes =
      (eventEndHour - eventStartHour) * 60 + (eventEndMinutes - eventStartMinutes)
    const height = (durationMinutes / 60) * 100

    return { top, height }
  }

  const handleSlotClick = (staffId: string, hour: number) => {
    if (onSlotClick) {
      const time = setMinutes(setHours(date, hour), 0)
      onSlotClick(staffId, time)
    }
  }

  return (
    <div className="flex flex-1 overflow-auto">
      {/* Time column */}
      <div className="sticky left-0 z-10 w-16 flex-shrink-0 border-r bg-card">
        <div className="h-12 border-b" /> {/* Header spacer */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="relative h-16 border-b pr-2 text-right text-xs text-muted-foreground"
          >
            <span className="absolute -top-2 right-2">
              {format(setHours(new Date(), hour), 'HH:mm')}
            </span>
          </div>
        ))}
      </div>

      {/* Staff columns */}
      <div className="flex flex-1">
        {filteredStaff.map((member) => (
          <div key={member.id} className="flex-1 min-w-[200px] border-r last:border-r-0">
            {/* Staff header */}
            <div
              className="sticky top-0 z-10 flex h-12 items-center justify-center border-b px-2"
              style={{ backgroundColor: member.color + '20' }}
            >
              <div
                className="h-6 w-6 rounded-full mr-2"
                style={{ backgroundColor: member.color }}
              />
              <span className="text-sm font-medium truncate">{member.name}</span>
            </div>

            {/* Hour cells */}
            {hours.map((hour) => {
              const hourEvents = getEventsForStaffAndHour(member.id, hour)

              return (
                <div
                  key={hour}
                  className="relative h-16 border-b hover:bg-muted/50 cursor-pointer"
                  onClick={() => handleSlotClick(member.id, hour)}
                >
                  {/* 30 min line */}
                  <div className="absolute left-0 right-0 top-1/2 border-t border-dashed border-muted" />

                  {/* Events */}
                  {hourEvents.map((event) => {
                    const position = calculateEventPosition(event, hour)
                    if (!position) return null

                    return (
                      <div
                        key={event.id}
                        className={cn(
                          'absolute left-1 right-1 z-20 overflow-hidden rounded-md px-2 py-1 text-xs text-white cursor-pointer transition-opacity hover:opacity-90',
                          event.type === 'blocked' && 'bg-muted text-muted-foreground'
                        )}
                        style={{
                          top: `${position.top}%`,
                          height: `${position.height}%`,
                          minHeight: '24px',
                          backgroundColor:
                            event.type === 'appointment' ? event.staffColor : undefined,
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick?.(event)
                        }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        <div className="truncate opacity-80">
                          {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}
