'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, Clock, User, Scissors, CreditCard } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { useBooking } from '../hooks/use-booking'

interface BookingSummaryProps {
  className?: string
  showTotal?: boolean
}

export function BookingSummary({ className, showTotal = true }: BookingSummaryProps) {
  const {
    selectedServices,
    selectedStaff,
    selectedSlot,
    totalDuration,
    totalPrice,
  } = useBooking()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} Min.`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} Std.`
    }
    return `${hours} Std. ${remainingMinutes} Min.`
  }

  return (
    <Card className={cn('', className)}>
      <CardHeader className="pb-4">
        <CardTitle className="text-lg">Zusammenfassung</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Services */}
        {selectedServices.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Scissors className="h-4 w-4" />
              <span>Dienstleistungen</span>
            </div>
            <div className="space-y-2 pl-6">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex justify-between text-sm">
                  <span>{service.name}</span>
                  <span className="text-muted-foreground">
                    {formatPrice(service.current_price)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Staff */}
        {(selectedStaff || selectedServices.length > 0) && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <User className="h-4 w-4" />
                <span>Mitarbeiter</span>
              </div>
              <p className="pl-6 text-sm">
                {selectedStaff?.display_name || 'Keine Präferenz'}
              </p>
            </div>
          </>
        )}

        {/* Date & Time */}
        {selectedSlot && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Calendar className="h-4 w-4" />
                <span>Termin</span>
              </div>
              <div className="pl-6 text-sm">
                <p className="font-medium">
                  {format(selectedSlot.startsAt, 'EEEE, d. MMMM yyyy', { locale: de })}
                </p>
                <p className="text-muted-foreground">
                  {format(selectedSlot.startsAt, 'HH:mm', { locale: de })} Uhr
                </p>
              </div>
            </div>
          </>
        )}

        {/* Duration */}
        {totalDuration > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>Dauer</span>
              </div>
              <p className="pl-6 text-sm">
                ca. {formatDuration(totalDuration)}
              </p>
            </div>
          </>
        )}

        {/* Total */}
        {showTotal && totalPrice > 0 && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CreditCard className="h-4 w-4" />
                <span>Gesamtpreis</span>
              </div>
              <p className="pl-6 text-lg font-semibold text-primary">
                {formatPrice(totalPrice)}
              </p>
              <p className="pl-6 text-xs text-muted-foreground">
                inkl. MwSt. • Zahlung vor Ort
              </p>
            </div>
          </>
        )}

        {/* Empty state */}
        {selectedServices.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Wählen Sie Dienstleistungen aus, um eine Zusammenfassung zu sehen.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
