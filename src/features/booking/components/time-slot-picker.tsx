'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, Clock, AlertCircle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { useBooking } from '../hooks/use-booking'
import { DatePicker } from './date-picker'
import type { TimeSlot } from '../types'

interface TimeSlotPickerProps {
  availableSlots: TimeSlot[]
  isLoading?: boolean
  onDateChange: (date: Date) => void
  selectedDate: Date | null
  maxHorizonDays?: number
}

export function TimeSlotPicker({
  availableSlots,
  isLoading = false,
  onDateChange,
  selectedDate,
  maxHorizonDays = 60,
}: TimeSlotPickerProps) {
  const { selectedSlot, selectSlot, totalDuration } = useBooking()

  // Group slots by time of day
  const slotsByPeriod = React.useMemo(() => {
    const morning: TimeSlot[] = []
    const afternoon: TimeSlot[] = []
    const evening: TimeSlot[] = []

    availableSlots.forEach((slot) => {
      const hour = slot.startsAt.getHours()
      if (hour < 12) {
        morning.push(slot)
      } else if (hour < 17) {
        afternoon.push(slot)
      } else {
        evening.push(slot)
      }
    })

    return { morning, afternoon, evening }
  }, [availableSlots])

  const formatTime = (date: Date) => {
    return format(date, 'HH:mm', { locale: de })
  }

  const maxDate = React.useMemo(() => {
    const date = new Date()
    date.setDate(date.getDate() + maxHorizonDays)
    return date
  }, [maxHorizonDays])

  const renderSlotGroup = (slots: TimeSlot[], title: string) => {
    if (slots.length === 0) return null

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">{title}</h4>
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
          {slots.map((slot) => {
            const isSelected =
              selectedSlot?.startsAt.getTime() === slot.startsAt.getTime() &&
              selectedSlot?.staffId === slot.staffId

            return (
              <button
                key={`${slot.startsAt.toISOString()}-${slot.staffId}`}
                type="button"
                disabled={!slot.isAvailable}
                onClick={() => selectSlot(slot)}
                className={cn(
                  'rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  'hover:bg-accent hover:text-accent-foreground',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                  'border border-input',
                  !slot.isAvailable && 'opacity-50 cursor-not-allowed line-through',
                  isSelected && 'bg-primary text-primary-foreground border-primary hover:bg-primary hover:text-primary-foreground'
                )}
              >
                {formatTime(slot.startsAt)}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Date selection */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Calendar className="h-5 w-5 text-muted-foreground" />
          <h3 className="font-medium">Datum wählen</h3>
        </div>

        <DatePicker
          selectedDate={selectedDate}
          onSelectDate={onDateChange}
          maxDate={maxDate}
        />
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <h3 className="font-medium">Uhrzeit wählen</h3>
            </div>
            {totalDuration > 0 && (
              <span className="text-sm text-muted-foreground">
                Dauer: ca. {totalDuration} Min.
              </span>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-4 w-24" />
              <div className="grid grid-cols-4 gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <Skeleton key={i} className="h-10" />
                ))}
              </div>
            </div>
          ) : availableSlots.length > 0 ? (
            <div className="space-y-6">
              {renderSlotGroup(slotsByPeriod.morning, 'Vormittag')}
              {renderSlotGroup(slotsByPeriod.afternoon, 'Nachmittag')}
              {renderSlotGroup(slotsByPeriod.evening, 'Abend')}
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <AlertCircle className="h-12 w-12 text-muted-foreground/50 mb-4" />
                <p className="text-muted-foreground">
                  Keine freien Termine an diesem Tag verfügbar.
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  Bitte wählen Sie ein anderes Datum.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Selected slot summary */}
      {selectedSlot && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="py-4">
            <p className="text-sm font-medium">Ausgewählter Termin:</p>
            <p className="text-lg font-semibold text-primary">
              {selectedDate && format(selectedDate, 'EEEE, d. MMMM yyyy', { locale: de })}
              {' um '}
              {formatTime(selectedSlot.startsAt)} Uhr
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
