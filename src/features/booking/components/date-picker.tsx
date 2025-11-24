'use client'

import * as React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format,
  addDays,
  startOfWeek,
  addWeeks,
  isSameDay,
  isToday,
  isBefore,
  startOfDay,
} from 'date-fns'
import { de } from 'date-fns/locale'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface DatePickerProps {
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
  minDate?: Date
  maxDate?: Date
  disabledDates?: Date[]
  className?: string
}

export function DatePicker({
  selectedDate,
  onSelectDate,
  minDate = new Date(),
  maxDate,
  disabledDates = [],
  className,
}: DatePickerProps) {
  const [weekStart, setWeekStart] = React.useState(() =>
    startOfWeek(new Date(), { weekStartsOn: 1 }) // Monday
  )

  const days = React.useMemo(() => {
    return Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  }, [weekStart])

  const goToPrevWeek = () => {
    setWeekStart((prev) => addWeeks(prev, -1))
  }

  const goToNextWeek = () => {
    setWeekStart((prev) => addWeeks(prev, 1))
  }

  const isDateDisabled = (date: Date) => {
    const dateStart = startOfDay(date)
    const minDateStart = startOfDay(minDate)

    // Before min date
    if (isBefore(dateStart, minDateStart)) return true

    // After max date
    if (maxDate && isBefore(startOfDay(maxDate), dateStart)) return true

    // In disabled dates
    if (disabledDates.some((d) => isSameDay(d, date))) return true

    return false
  }

  const canGoPrev = !isBefore(addDays(weekStart, -1), startOfDay(minDate))

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header with navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={goToPrevWeek}
          disabled={!canGoPrev}
        >
          <ChevronLeft className="h-5 w-5" />
          <span className="sr-only">Vorherige Woche</span>
        </Button>

        <h3 className="font-medium">
          {format(weekStart, 'MMMM yyyy', { locale: de })}
        </h3>

        <Button
          variant="ghost"
          size="icon"
          onClick={goToNextWeek}
        >
          <ChevronRight className="h-5 w-5" />
          <span className="sr-only">Nächste Woche</span>
        </Button>
      </div>

      {/* Days grid */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const disabled = isDateDisabled(day)
          const selected = selectedDate && isSameDay(day, selectedDate)
          const today = isToday(day)

          return (
            <button
              key={day.toISOString()}
              type="button"
              disabled={disabled}
              onClick={() => onSelectDate(day)}
              className={cn(
                'flex flex-col items-center justify-center rounded-lg p-2 text-sm transition-colors',
                'hover:bg-accent hover:text-accent-foreground',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                disabled && 'opacity-50 cursor-not-allowed hover:bg-transparent',
                selected && 'bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground',
                today && !selected && 'border border-primary'
              )}
            >
              <span className="text-xs text-muted-foreground mb-1">
                {format(day, 'EEE', { locale: de })}
              </span>
              <span className={cn('text-lg font-medium', selected && 'text-primary-foreground')}>
                {format(day, 'd')}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
