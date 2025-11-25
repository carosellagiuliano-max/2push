'use client'

import * as React from 'react'
import { format, addDays, subDays, startOfWeek, addWeeks, subWeeks } from 'date-fns'
import { de } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, CalendarDays } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CalendarView, StaffColumn } from '../../types'

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  onDateChange: (_date: Date) => void
  onViewChange: (_view: CalendarView) => void
  staff: StaffColumn[]
  selectedStaffIds: string[]
  onStaffFilterChange: (_staffIds: string[]) => void
}

export function CalendarHeader({
  currentDate,
  view,
  onDateChange,
  onViewChange,
  staff,
  selectedStaffIds,
  onStaffFilterChange,
}: CalendarHeaderProps) {
  const goToPrevious = () => {
    if (view === 'day') {
      onDateChange(subDays(currentDate, 1))
    } else if (view === 'week') {
      onDateChange(subWeeks(currentDate, 1))
    }
  }

  const goToNext = () => {
    if (view === 'day') {
      onDateChange(addDays(currentDate, 1))
    } else if (view === 'week') {
      onDateChange(addWeeks(currentDate, 1))
    }
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const getDateLabel = () => {
    if (view === 'day') {
      return format(currentDate, 'EEEE, d. MMMM yyyy', { locale: de })
    } else if (view === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 })
      const weekEnd = addDays(weekStart, 6)
      return `${format(weekStart, 'd. MMM', { locale: de })} - ${format(weekEnd, 'd. MMM yyyy', { locale: de })}`
    }
    return format(currentDate, 'MMMM yyyy', { locale: de })
  }

  const toggleStaff = (staffId: string) => {
    if (selectedStaffIds.includes(staffId)) {
      onStaffFilterChange(selectedStaffIds.filter((id) => id !== staffId))
    } else {
      onStaffFilterChange([...selectedStaffIds, staffId])
    }
  }

  return (
    <div className="flex flex-col gap-4 border-b bg-card px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
      {/* Left: Navigation */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-1">
          <Button variant="outline" size="icon" onClick={goToPrevious}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="icon" onClick={goToNext}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <Button variant="outline" onClick={goToToday}>
          Heute
        </Button>

        <h2 className="text-lg font-semibold">{getDateLabel()}</h2>
      </div>

      {/* Right: View selector & Staff filter */}
      <div className="flex items-center gap-4">
        {/* Staff filter */}
        <div className="flex items-center gap-2">
          {staff.map((member) => (
            <button
              key={member.id}
              onClick={() => toggleStaff(member.id)}
              className={cn(
                'flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium transition-opacity',
                selectedStaffIds.includes(member.id)
                  ? 'opacity-100 ring-2 ring-offset-2'
                  : 'opacity-40'
              )}
              style={{ backgroundColor: member.color, color: '#fff' }}
              title={member.name}
            >
              {member.name.slice(0, 2).toUpperCase()}
            </button>
          ))}
        </div>

        {/* View selector */}
        <Select value={view} onValueChange={(v) => onViewChange(v as CalendarView)}>
          <SelectTrigger className="w-32">
            <CalendarDays className="mr-2 h-4 w-4" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="day">Tag</SelectItem>
            <SelectItem value="week">Woche</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
}
