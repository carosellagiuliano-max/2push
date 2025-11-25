import type { Metadata } from 'next'
import { Suspense } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { getCustomerAppointments } from '@/features/customer'
import { AppointmentList } from './appointment-list'

export const metadata: Metadata = {
  title: 'Meine Termine | SCHNITTWERK',
  description: 'Verwalten Sie Ihre Termine bei SCHNITTWERK.',
}

async function AppointmentsContent() {
  const appointments = await getCustomerAppointments()

  return (
    <div className="space-y-8">
      {/* Upcoming appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Anstehende Termine</CardTitle>
          <CardDescription>Ihre geplanten Besuche bei uns</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentList
            appointments={appointments.upcoming}
            type="upcoming"
            emptyMessage="Sie haben keine anstehenden Termine."
          />
        </CardContent>
      </Card>

      {/* Past appointments */}
      <Card>
        <CardHeader>
          <CardTitle>Vergangene Termine</CardTitle>
          <CardDescription>Ihre letzten Besuche</CardDescription>
        </CardHeader>
        <CardContent>
          <AppointmentList
            appointments={appointments.past}
            type="past"
            emptyMessage="Sie haben noch keine vergangenen Termine."
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default function CustomerAppointmentsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Meine Termine</h1>
        <p className="text-muted-foreground mt-1">
          Verwalten Sie Ihre Termine
        </p>
      </div>

      <Suspense fallback={<Spinner />}>
        <AppointmentsContent />
      </Suspense>
    </div>
  )
}
