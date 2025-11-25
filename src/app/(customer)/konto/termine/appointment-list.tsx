'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, Clock, User, X, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { cancelAppointment, type CustomerAppointment } from '@/features/customer'

interface AppointmentListProps {
  appointments: CustomerAppointment[]
  type: 'upcoming' | 'past'
  emptyMessage: string
}

const statusLabels: Record<string, string> = {
  confirmed: 'Bestätigt',
  reserved: 'Reserviert',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
  no_show: 'Nicht erschienen',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  confirmed: 'default',
  reserved: 'secondary',
  completed: 'outline',
  cancelled: 'destructive',
  no_show: 'destructive',
}

export function AppointmentList({ appointments, type, emptyMessage }: AppointmentListProps) {
  const { toast } = useToast()
  const [cancellingId, setCancellingId] = React.useState<string | null>(null)

  async function handleCancel(appointmentId: string) {
    setCancellingId(appointmentId)

    const result = await cancelAppointment(appointmentId)

    if (result.success) {
      toast({
        title: 'Termin storniert',
        description: 'Ihr Termin wurde erfolgreich storniert.',
        variant: 'success',
      })
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Der Termin konnte nicht storniert werden.',
        variant: 'destructive',
      })
    }

    setCancellingId(null)
  }

  if (appointments.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
        <p>{emptyMessage}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {appointments.map((appointment) => {
        const totalPrice = appointment.services.reduce(
          (sum, s) => sum + (s.snapshot_price || 0),
          0
        )

        return (
          <div
            key={appointment.id}
            className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border rounded-lg"
          >
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge variant={statusVariants[appointment.status] || 'outline'}>
                  {statusLabels[appointment.status] || appointment.status}
                </Badge>
              </div>
              <div className="flex items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Calendar className="h-4 w-4" />
                  {format(new Date(appointment.starts_at), 'EEEE, d. MMMM yyyy', { locale: de })}
                </span>
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {format(new Date(appointment.starts_at), 'HH:mm', { locale: de })} Uhr
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {appointment.services.map((service) => (
                  <span key={service.id} className="text-sm text-muted-foreground">
                    {service.name}
                  </span>
                ))}
              </div>
              {appointment.staff && (
                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                  <User className="h-4 w-4" />
                  {appointment.staff.display_name}
                </div>
              )}
            </div>

            <div className="flex flex-col sm:items-end gap-2">
              <span className="font-semibold">
                CHF {totalPrice.toFixed(2)}
              </span>

              {type === 'upcoming' && (appointment.status === 'confirmed' || appointment.status === 'reserved') && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={cancellingId === appointment.id}
                    >
                      {cancellingId === appointment.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <>
                          <X className="h-4 w-4 mr-1" />
                          Stornieren
                        </>
                      )}
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Termin stornieren?</AlertDialogTitle>
                      <AlertDialogDescription>
                        Möchten Sie diesen Termin wirklich stornieren? Diese Aktion kann nicht rückgängig gemacht werden.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Abbrechen</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleCancel(appointment.id)}
                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      >
                        Stornieren
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
