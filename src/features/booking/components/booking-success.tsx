'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { CheckCircle, Calendar, Mail, Phone, ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { useBooking } from '../hooks/use-booking'

interface BookingSuccessProps {
  appointmentId?: string
}

export function BookingSuccess({ appointmentId }: BookingSuccessProps) {
  const { selectedSlot, customerInfo, selectedServices, totalPrice, reset } = useBooking()

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(price)
  }

  return (
    <div className="space-y-8 text-center">
      {/* Success icon */}
      <div className="flex justify-center">
        <div className="rounded-full bg-success/10 p-4">
          <CheckCircle className="h-16 w-16 text-success" />
        </div>
      </div>

      {/* Success message */}
      <div className="space-y-2">
        <h2 className="text-2xl font-bold">Termin erfolgreich gebucht!</h2>
        <p className="text-muted-foreground">
          Vielen Dank für Ihre Buchung. Wir freuen uns auf Ihren Besuch.
        </p>
      </div>

      {/* Appointment details */}
      <Card className="mx-auto max-w-md">
        <CardContent className="pt-6 space-y-4">
          {selectedSlot && (
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="text-left">
                <p className="font-medium">
                  {format(selectedSlot.startsAt, 'EEEE, d. MMMM yyyy', { locale: de })}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(selectedSlot.startsAt, 'HH:mm', { locale: de })} Uhr
                </p>
              </div>
            </div>
          )}

          <div className="text-left space-y-1">
            <p className="text-sm text-muted-foreground">Dienstleistungen:</p>
            <ul className="text-sm">
              {selectedServices.map((service) => (
                <li key={service.id}>{service.name}</li>
              ))}
            </ul>
          </div>

          <div className="flex justify-between pt-2 border-t">
            <span className="font-medium">Gesamtpreis</span>
            <span className="font-semibold text-primary">
              {formatPrice(totalPrice)}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation info */}
      <div className="space-y-2 text-sm text-muted-foreground">
        <div className="flex items-center justify-center gap-2">
          <Mail className="h-4 w-4" />
          <span>
            Bestätigung gesendet an: {customerInfo?.email}
          </span>
        </div>
        <p>
          Sie erhalten eine Erinnerung 24 Stunden vor Ihrem Termin.
        </p>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Button variant="outline" asChild>
          <Link href="/">
            Zur Startseite
          </Link>
        </Button>
        <Button onClick={reset}>
          Weiteren Termin buchen
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

      {/* Contact info */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground">
            Fragen zu Ihrer Buchung?
          </p>
          <div className="flex items-center justify-center gap-2 mt-2">
            <Phone className="h-4 w-4 text-primary" />
            <a
              href="tel:+41441234567"
              className="font-medium text-primary hover:underline"
            >
              +41 44 123 45 67
            </a>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
