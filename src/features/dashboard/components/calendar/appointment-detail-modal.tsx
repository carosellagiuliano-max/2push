'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Calendar,
  Clock,
  User,
  Phone,
  Mail,
  Scissors,
  CreditCard,
  MoreVertical,
  Edit,
  Trash,
  X as XIcon,
  CheckCircle,
  AlertCircle,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { CalendarEvent } from '../../types'

interface AppointmentDetailModalProps {
  event: CalendarEvent | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onEdit?: (event: CalendarEvent) => void
  onCancel?: (event: CalendarEvent) => void
  onComplete?: (event: CalendarEvent) => void
  onNoShow?: (event: CalendarEvent) => void
}

export function AppointmentDetailModal({
  event,
  open,
  onOpenChange,
  onEdit,
  onCancel,
  onComplete,
  onNoShow,
}: AppointmentDetailModalProps) {
  if (!event || !event.appointment) return null

  const { appointment } = event

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(price)
  }

  const totalPrice = appointment.services.reduce((sum, s) => sum + s.price, 0)
  const totalDuration = appointment.services.reduce((sum, s) => sum + s.duration_minutes, 0)

  const getStatusBadge = () => {
    switch (appointment.status) {
      case 'confirmed':
        return <Badge variant="default">Bestätigt</Badge>
      case 'completed':
        return <Badge variant="success">Abgeschlossen</Badge>
      case 'cancelled':
        return <Badge variant="destructive">Storniert</Badge>
      case 'no_show':
        return <Badge variant="warning">Nicht erschienen</Badge>
      default:
        return <Badge variant="secondary">{appointment.status}</Badge>
    }
  }

  const canEdit = ['confirmed', 'reserved'].includes(appointment.status)
  const canComplete = appointment.status === 'confirmed'
  const canCancel = ['confirmed', 'reserved'].includes(appointment.status)
  const canMarkNoShow = appointment.status === 'confirmed'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader className="pb-4">
          <div className="flex items-start justify-between">
            <div>
              <DialogTitle className="text-xl">Termindetails</DialogTitle>
              <DialogDescription>
                {format(event.start, 'EEEE, d. MMMM yyyy', { locale: de })}
              </DialogDescription>
            </div>
            {getStatusBadge()}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Time */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Clock className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="font-medium">
                {format(event.start, 'HH:mm')} - {format(event.end, 'HH:mm')} Uhr
              </p>
              <p className="text-sm text-muted-foreground">
                Dauer: {totalDuration} Minuten
              </p>
            </div>
          </div>

          <Separator />

          {/* Customer */}
          <div className="flex items-start gap-3">
            <Avatar className="h-10 w-10">
              <AvatarFallback>
                {appointment.customer.first_name[0]}
                {appointment.customer.last_name[0]}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-medium">
                {appointment.customer.first_name} {appointment.customer.last_name}
              </p>
              <div className="mt-1 space-y-1 text-sm text-muted-foreground">
                {appointment.customer.phone && (
                  <a
                    href={`tel:${appointment.customer.phone}`}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <Phone className="h-4 w-4" />
                    {appointment.customer.phone}
                  </a>
                )}
                {appointment.customer.email && (
                  <a
                    href={`mailto:${appointment.customer.email}`}
                    className="flex items-center gap-2 hover:text-foreground"
                  >
                    <Mail className="h-4 w-4" />
                    {appointment.customer.email}
                  </a>
                )}
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div>
            <h4 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
              <Scissors className="h-4 w-4" />
              Dienstleistungen
            </h4>
            <div className="space-y-2">
              {appointment.services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between rounded-lg bg-muted/50 px-3 py-2"
                >
                  <div>
                    <p className="font-medium">{service.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {service.duration_minutes} Min.
                    </p>
                  </div>
                  <span className="font-medium">{formatPrice(service.price)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Staff */}
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              {appointment.staff.avatar_url && (
                <AvatarImage src={appointment.staff.avatar_url} />
              )}
              <AvatarFallback style={{ backgroundColor: appointment.staff.color }}>
                {appointment.staff.display_name.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div>
              <p className="text-sm text-muted-foreground">Mitarbeiter</p>
              <p className="font-medium">{appointment.staff.display_name}</p>
            </div>
          </div>

          {/* Notes */}
          {(appointment.customer_notes || appointment.internal_notes) && (
            <>
              <Separator />
              <div className="space-y-2">
                {appointment.customer_notes && (
                  <div className="rounded-lg bg-muted/50 p-3">
                    <p className="text-xs font-medium text-muted-foreground mb-1">
                      Kundennotiz
                    </p>
                    <p className="text-sm">{appointment.customer_notes}</p>
                  </div>
                )}
                {appointment.internal_notes && (
                  <div className="rounded-lg bg-warning/10 p-3">
                    <p className="text-xs font-medium text-warning mb-1">
                      Interne Notiz
                    </p>
                    <p className="text-sm">{appointment.internal_notes}</p>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Total */}
          <div className="flex items-center justify-between rounded-lg bg-primary/5 p-4">
            <div className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              <span className="font-medium">Gesamtbetrag</span>
            </div>
            <span className="text-xl font-bold text-primary">{formatPrice(totalPrice)}</span>
          </div>
        </div>

        <DialogFooter className="mt-6 flex-col gap-2 sm:flex-row">
          {canComplete && (
            <Button
              variant="default"
              className="w-full sm:w-auto"
              onClick={() => onComplete?.(event)}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Abschliessen
            </Button>
          )}

          {canEdit && (
            <Button
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => onEdit?.(event)}
            >
              <Edit className="mr-2 h-4 w-4" />
              Bearbeiten
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {canMarkNoShow && (
                <DropdownMenuItem onClick={() => onNoShow?.(event)}>
                  <AlertCircle className="mr-2 h-4 w-4" />
                  Als No-Show markieren
                </DropdownMenuItem>
              )}
              {canCancel && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={() => onCancel?.(event)}
                    className="text-destructive"
                  >
                    <Trash className="mr-2 h-4 w-4" />
                    Stornieren
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
