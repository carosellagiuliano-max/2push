'use client'

import * as React from 'react'
import { format, isToday, isTomorrow, differenceInMinutes } from 'date-fns'
import { de } from 'date-fns/locale'
import { Clock, ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CalendarAppointment } from '../types'

interface UpcomingAppointmentsProps {
  appointments: CalendarAppointment[]
  maxItems?: number
}

export function UpcomingAppointments({
  appointments,
  maxItems = 5,
}: UpcomingAppointmentsProps) {
  const sortedAppointments = [...appointments]
    .sort((a, b) => new Date(a.starts_at).getTime() - new Date(b.starts_at).getTime())
    .slice(0, maxItems)

  const getTimeLabel = (date: Date) => {
    if (isToday(date)) {
      const minutesUntil = differenceInMinutes(date, new Date())
      if (minutesUntil <= 0) return 'Jetzt'
      if (minutesUntil < 60) return `In ${minutesUntil} Min.`
      return `Heute, ${format(date, 'HH:mm')}`
    }
    if (isTomorrow(date)) {
      return `Morgen, ${format(date, 'HH:mm')}`
    }
    return format(date, 'EEE, d. MMM HH:mm', { locale: de })
  }

  const getStatusColor = (appointment: CalendarAppointment) => {
    const start = new Date(appointment.starts_at)
    const minutesUntil = differenceInMinutes(start, new Date())

    if (minutesUntil <= 15 && minutesUntil >= 0) return 'bg-warning'
    if (minutesUntil < 0) return 'bg-destructive'
    return 'bg-success'
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-lg">Kommende Termine</CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/dashboard/calendar">
            Alle anzeigen
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {sortedAppointments.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">
            Keine bevorstehenden Termine
          </p>
        ) : (
          <div className="space-y-4">
            {sortedAppointments.map((appointment) => {
              const start = new Date(appointment.starts_at)

              return (
                <div
                  key={appointment.id}
                  className="flex items-center gap-4 rounded-lg border p-3"
                >
                  {/* Status indicator */}
                  <div
                    className={cn(
                      'h-2 w-2 rounded-full flex-shrink-0',
                      getStatusColor(appointment)
                    )}
                  />

                  {/* Customer avatar */}
                  <Avatar className="h-10 w-10 flex-shrink-0">
                    <AvatarFallback>
                      {appointment.customer.first_name[0]}
                      {appointment.customer.last_name[0]}
                    </AvatarFallback>
                  </Avatar>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">
                      {appointment.customer.first_name} {appointment.customer.last_name}
                    </p>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      <span>{getTimeLabel(start)}</span>
                      <span>•</span>
                      <span className="truncate">
                        {appointment.services.map((s) => s.name).join(', ')}
                      </span>
                    </div>
                  </div>

                  {/* Staff */}
                  <div className="flex-shrink-0">
                    <Avatar className="h-8 w-8">
                      {appointment.staff.avatar_url && (
                        <AvatarImage src={appointment.staff.avatar_url} />
                      )}
                      <AvatarFallback
                        style={{ backgroundColor: appointment.staff.color }}
                        className="text-white text-xs"
                      >
                        {appointment.staff.display_name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
