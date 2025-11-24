'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Clock, ExternalLink } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import type { CustomerAppointmentHistory } from '../types'

interface CustomerAppointmentHistoryCardProps {
  appointments: CustomerAppointmentHistory[]
}

const statusConfig: Record<
  string,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  reserved: { label: 'Reserviert', variant: 'outline' },
  requested: { label: 'Angefragt', variant: 'outline' },
  confirmed: { label: 'Bestätigt', variant: 'default' },
  completed: { label: 'Abgeschlossen', variant: 'secondary' },
  cancelled: { label: 'Storniert', variant: 'destructive' },
  no_show: { label: 'Nicht erschienen', variant: 'destructive' },
}

export function CustomerAppointmentHistoryCard({
  appointments,
}: CustomerAppointmentHistoryCardProps) {
  const [showAll, setShowAll] = React.useState(false)

  const displayedAppointments = showAll ? appointments : appointments.slice(0, 5)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(amount)
  }

  const formatTime = (date: string) => {
    return format(new Date(date), 'HH:mm', { locale: de })
  }

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Terminhistorie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-8">
            Noch keine Termine vorhanden
          </p>
        </CardContent>
      </Card>
    )
  }

  // Group appointments by month
  const groupedAppointments = displayedAppointments.reduce(
    (groups, appointment) => {
      const monthKey = format(new Date(appointment.starts_at), 'MMMM yyyy', {
        locale: de,
      })
      if (!groups[monthKey]) {
        groups[monthKey] = []
      }
      groups[monthKey].push(appointment)
      return groups
    },
    {} as Record<string, CustomerAppointmentHistory[]>
  )

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="text-base">Terminhistorie</CardTitle>
        <span className="text-sm text-muted-foreground">
          {appointments.length} Termine
        </span>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {Object.entries(groupedAppointments).map(([month, monthAppointments]) => (
            <div key={month}>
              <h4 className="text-sm font-medium text-muted-foreground mb-3">
                {month}
              </h4>
              <div className="space-y-3">
                {monthAppointments.map((appointment) => {
                  const status = statusConfig[appointment.status]
                  const isUpcoming = new Date(appointment.starts_at) > new Date()

                  return (
                    <div
                      key={appointment.id}
                      className="flex items-start justify-between p-3 rounded-lg border hover:bg-muted/30 transition-colors"
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">
                            {format(
                              new Date(appointment.starts_at),
                              'EEEE, dd. MMM',
                              { locale: de }
                            )}
                          </span>
                          <Badge variant={status?.variant || 'secondary'}>
                            {status?.label || appointment.status}
                          </Badge>
                          {isUpcoming && (
                            <Badge variant="outline" className="text-xs">
                              Anstehend
                            </Badge>
                          )}
                        </div>

                        <div className="flex items-center gap-3 text-sm text-muted-foreground mb-2">
                          <span className="flex items-center gap-1">
                            <Clock className="h-3.5 w-3.5" />
                            {formatTime(appointment.starts_at)} -{' '}
                            {formatTime(appointment.ends_at)}
                          </span>
                          <span className="flex items-center gap-1">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: appointment.staff.color }}
                            />
                            {appointment.staff.display_name}
                          </span>
                        </div>

                        <div className="text-sm">
                          {appointment.services.map((s) => s.name).join(', ')}
                        </div>
                      </div>

                      <div className="text-right ml-4">
                        {appointment.total_price !== null && (
                          <p className="font-medium">
                            {formatCurrency(appointment.total_price)}
                          </p>
                        )}
                        <Link
                          href={`/dashboard/calendar?date=${format(
                            new Date(appointment.starts_at),
                            'yyyy-MM-dd'
                          )}`}
                          className="text-xs text-primary hover:underline inline-flex items-center gap-1 mt-1"
                        >
                          <ExternalLink className="h-3 w-3" />
                          Im Kalender
                        </Link>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {appointments.length > 5 && (
          <div className="mt-4 text-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowAll(!showAll)}
            >
              {showAll
                ? 'Weniger anzeigen'
                : `Alle ${appointments.length} Termine anzeigen`}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
