import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { getCustomerAppointments } from '@/features/customer'
import { getCustomerProfile } from '@/features/customer'

export const metadata: Metadata = {
  title: 'Mein Konto | SCHNITTWERK',
  description: 'Verwalten Sie Ihre Termine und Ihr Profil bei SCHNITTWERK.',
}

export default async function CustomerDashboardPage() {
  const [appointments, profile] = await Promise.all([
    getCustomerAppointments(),
    getCustomerProfile(),
  ])

  const nextAppointment = appointments.upcoming[0]

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-3xl font-bold">
          Willkommen{profile?.first_name ? `, ${profile.first_name}` : ''}!
        </h1>
        <p className="text-muted-foreground mt-1">
          Verwalten Sie Ihre Termine und Ihr Profil
        </p>
      </div>

      {/* Quick stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Anstehende Termine</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.upcoming.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Vergangene Termine</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{appointments.past.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Schnell buchen</CardTitle>
          </CardHeader>
          <CardContent>
            <Button asChild size="sm">
              <Link href="/booking">Termin buchen</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Next appointment */}
      {nextAppointment && (
        <Card>
          <CardHeader>
            <CardTitle>Nächster Termin</CardTitle>
            <CardDescription>Ihr nächster Besuch bei uns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">
                  {format(new Date(nextAppointment.starts_at), 'EEEE, d. MMMM yyyy', { locale: de })}
                </p>
                <p className="text-muted-foreground">
                  {format(new Date(nextAppointment.starts_at), 'HH:mm', { locale: de })} Uhr
                </p>
                <div className="flex flex-wrap gap-2 mt-2">
                  {nextAppointment.services.map((service) => (
                    <Badge key={service.id} variant="secondary">
                      {service.name}
                    </Badge>
                  ))}
                </div>
                {nextAppointment.staff && (
                  <p className="text-sm text-muted-foreground mt-2">
                    bei {nextAppointment.staff.display_name}
                  </p>
                )}
              </div>
              <Button variant="outline" asChild>
                <Link href="/konto/termine">
                  Details
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* No appointments */}
      {appointments.upcoming.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine anstehenden Termine</h3>
            <p className="text-muted-foreground text-center mb-4">
              Sie haben aktuell keine Termine. Buchen Sie jetzt Ihren nächsten Besuch!
            </p>
            <Button asChild>
              <Link href="/booking">Termin buchen</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
