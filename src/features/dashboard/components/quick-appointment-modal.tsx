'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Calendar, Clock, User, Scissors, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import type { StaffColumn } from '../types'

interface QuickAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: StaffColumn[]
  services: Array<{ id: string; name: string; duration_minutes: number }>
  initialDate?: Date
  initialStaffId?: string
  onSubmit?: (data: QuickAppointmentData) => Promise<void>
}

interface QuickAppointmentData {
  customerName: string
  customerPhone: string
  customerEmail: string
  staffId: string
  serviceId: string
  date: string
  time: string
  notes: string
}

export function QuickAppointmentModal({
  open,
  onOpenChange,
  staff,
  services,
  initialDate = new Date(),
  initialStaffId,
  onSubmit,
}: QuickAppointmentModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  const [formData, setFormData] = React.useState<QuickAppointmentData>({
    customerName: '',
    customerPhone: '',
    customerEmail: '',
    staffId: initialStaffId || '',
    serviceId: '',
    date: format(initialDate, 'yyyy-MM-dd'),
    time: format(initialDate, 'HH:mm'),
    notes: '',
  })

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setFormData({
        customerName: '',
        customerPhone: '',
        customerEmail: '',
        staffId: initialStaffId || '',
        serviceId: '',
        date: format(initialDate, 'yyyy-MM-dd'),
        time: format(initialDate, 'HH:mm'),
        notes: '',
      })
    }
  }, [open, initialDate, initialStaffId])

  const handleChange = (field: keyof QuickAppointmentData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.customerName || !formData.staffId || !formData.serviceId) {
      toast({
        title: 'Fehler',
        description: 'Bitte füllen Sie alle Pflichtfelder aus.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await onSubmit?.(formData)
      onOpenChange(false)
      toast({
        title: 'Termin erstellt',
        description: 'Der Termin wurde erfolgreich erstellt.',
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Der Termin konnte nicht erstellt werden.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Schnelltermin erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie schnell einen neuen Termin für einen Kunden.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer info */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customerName">Kundenname *</Label>
              <Input
                id="customerName"
                value={formData.customerName}
                onChange={(e) => handleChange('customerName', e.target.value)}
                placeholder="Max Mustermann"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="customerPhone">Telefon</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  value={formData.customerPhone}
                  onChange={(e) => handleChange('customerPhone', e.target.value)}
                  placeholder="+41 79 123 45 67"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customerEmail">E-Mail</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={formData.customerEmail}
                  onChange={(e) => handleChange('customerEmail', e.target.value)}
                  placeholder="max@example.ch"
                />
              </div>
            </div>
          </div>

          {/* Service & Staff */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Dienstleistung *</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(v) => handleChange('serviceId', v)}
              >
                <SelectTrigger>
                  <Scissors className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service.id} value={service.id}>
                      {service.name} ({service.duration_minutes} Min.)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Mitarbeiter *</Label>
              <Select
                value={formData.staffId}
                onValueChange={(v) => handleChange('staffId', v)}
              >
                <SelectTrigger>
                  <User className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: member.color }}
                        />
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Date & Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Datum *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => handleChange('date', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="time">Uhrzeit *</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => handleChange('time', e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              placeholder="Optionale Notizen..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Erstellen...
                </>
              ) : (
                'Termin erstellen'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
