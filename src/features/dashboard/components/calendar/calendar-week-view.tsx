'use client'

import * as React from 'react'
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  isToday,
  setHours,
  setMinutes,
} from 'date-fns'
import { de } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import type { CalendarEvent, StaffColumn } from '../../types'

interface CalendarWeekViewProps {
  date: Date
  events: CalendarEvent[]
  staff: StaffColumn[]
  selectedStaffIds: string[]
  startHour?: number
  endHour?: number
  onEventClick?: (_event: CalendarEvent) => void
  onSlotClick?: (_staffId: string, _time: Date) => void
  onDayClick?: (_date: Date) => void
}

export function CalendarWeekView({
  date,
  events,
  staff: _staff,
  selectedStaffIds,
  startHour = 8,
  endHour = 20,
  onEventClick,
  onSlotClick,
  onDayClick,
}: CalendarWeekViewProps) {
  const weekStart = startOfWeek(date, { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const hours = Array.from({ length: endHour - startHour }, (_, i) => startHour + i)

  // For week view, we aggregate events across all selected staff
  const getEventsForDayAndHour = (day: Date, hour: number) => {
    return events.filter((event) => {
      if (!selectedStaffIds.includes(event.staffId)) return false
      if (!isSameDay(event.start, day)) return false

      const eventHour = event.start.getHours()
      return eventHour === hour
    })
  }

  const handleSlotClick = (day: Date, hour: number) => {
    if (onSlotClick && selectedStaffIds.length === 1) {
      const time = setMinutes(setHours(day, hour), 0)
      onSlotClick(selectedStaffIds[0], time)
    }
  }

  return (
    <div className="flex flex-1 overflow-auto">
      {/* Time column */}
      <div className="sticky left-0 z-10 w-16 flex-shrink-0 border-r bg-card">
        <div className="h-16 border-b" /> {/* Header spacer */}
        {hours.map((hour) => (
          <div
            key={hour}
            className="relative h-12 border-b pr-2 text-right text-xs text-muted-foreground"
          >
            <span className="absolute -top-2 right-2">
              {format(setHours(new Date(), hour), 'HH:mm')}
            </span>
          </div>
        ))}
      </div>

      {/* Day columns */}
      <div className="flex flex-1">
        {days.map((day) => {
          const isCurrentDay = isToday(day)
          const isSunday = day.getDay() === 0

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'flex-1 min-w-[120px] border-r last:border-r-0',
                isSunday && 'bg-muted/30'
              )}
            >
              {/* Day header */}
              <div
                className={cn(
                  'sticky top-0 z-10 flex h-16 flex-col items-center justify-center border-b bg-card cursor-pointer hover:bg-muted/50',
                  isCurrentDay && 'bg-primary/5'
                )}
                onClick={() => onDayClick?.(day)}
              >
                <span className="text-xs text-muted-foreground">
                  {format(day, 'EEE', { locale: de })}
                </span>
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                    isCurrentDay && 'bg-primary text-primary-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>

              {/* Hour cells */}
              {hours.map((hour) => {
                const hourEvents = getEventsForDayAndHour(day, hour)

                return (
                  <div
                    key={hour}
                    className={cn(
                      'relative h-12 border-b hover:bg-muted/50 cursor-pointer',
                      isSunday && 'bg-muted/30'
                    )}
                    onClick={() => handleSlotClick(day, hour)}
                  >
                    {/* Events */}
                    {hourEvents.slice(0, 2).map((event, idx) => (
                      <div
                        key={event.id}
                        className={cn(
                          'absolute left-0.5 right-0.5 z-20 overflow-hidden rounded px-1 text-xs text-white cursor-pointer',
                          idx === 0 ? 'top-0.5' : 'top-6'
                        )}
                        style={{
                          backgroundColor: event.staffColor,
                          height: idx === 0 && hourEvents.length === 1 ? 'calc(100% - 4px)' : '20px',
                        }}
                        onClick={(e) => {
                          e.stopPropagation()
                          onEventClick?.(event)
                        }}
                      >
                        <span className="truncate block">
                          {format(event.start, 'HH:mm')} {event.title}
                        </span>
                      </div>
                    ))}

                    {/* More indicator */}
                    {hourEvents.length > 2 && (
                      <div className="absolute bottom-0.5 left-0.5 text-xs text-muted-foreground">
                        +{hourEvents.length - 2} mehr
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
