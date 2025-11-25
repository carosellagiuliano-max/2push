'use client'

import * as React from 'react'
import { Loader2, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { StaffMember, CreateStaffInput, WorkingHoursEntry } from '../actions/staff'
import type { DayOfWeek, RoleName } from '@/lib/database.types'

interface Service {
  id: string
  name: string
}

interface StaffFormModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff?: StaffMember | null
  services: Service[]
  onSubmit: (data: CreateStaffInput) => Promise<{ success: boolean; error?: string }>
}

const DAYS_OF_WEEK: { value: DayOfWeek; label: string; shortLabel: string }[] = [
  { value: '1', label: 'Montag', shortLabel: 'Mo' },
  { value: '2', label: 'Dienstag', shortLabel: 'Di' },
  { value: '3', label: 'Mittwoch', shortLabel: 'Mi' },
  { value: '4', label: 'Donnerstag', shortLabel: 'Do' },
  { value: '5', label: 'Freitag', shortLabel: 'Fr' },
  { value: '6', label: 'Samstag', shortLabel: 'Sa' },
  { value: '7', label: 'Sonntag', shortLabel: 'So' },
]

const COLORS = [
  { value: '#3B82F6', label: 'Blau' },
  { value: '#10B981', label: 'Grün' },
  { value: '#F59E0B', label: 'Orange' },
  { value: '#EF4444', label: 'Rot' },
  { value: '#8B5CF6', label: 'Lila' },
  { value: '#EC4899', label: 'Pink' },
  { value: '#06B6D4', label: 'Cyan' },
]

const ROLES: { value: RoleName; label: string }[] = [
  { value: 'admin', label: 'Administrator' },
  { value: 'manager', label: 'Manager' },
  { value: 'mitarbeiter', label: 'Mitarbeiter' },
]

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}

function timeToMinutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number)
  return hours * 60 + mins
}

export function StaffFormModal({
  open,
  onOpenChange,
  staff,
  services,
  onSubmit,
}: StaffFormModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const isEditing = !!staff

  // Form state
  const [displayName, setDisplayName] = React.useState('')
  const [email, setEmail] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [title, setTitle] = React.useState('')
  const [bio, setBio] = React.useState('')
  const [color, setColor] = React.useState(COLORS[0].value)
  const [isBookable, setIsBookable] = React.useState(true)
  const [role, setRole] = React.useState<RoleName>('mitarbeiter')
  const [selectedServices, setSelectedServices] = React.useState<string[]>([])

  // Working hours state - simplified to single time range per day
  const [workingDays, setWorkingDays] = React.useState<Record<DayOfWeek, { enabled: boolean; start: string; end: string }>>({
    '1': { enabled: true, start: '09:00', end: '18:00' },
    '2': { enabled: true, start: '09:00', end: '18:00' },
    '3': { enabled: true, start: '09:00', end: '18:00' },
    '4': { enabled: true, start: '09:00', end: '18:00' },
    '5': { enabled: true, start: '09:00', end: '18:00' },
    '6': { enabled: false, start: '09:00', end: '14:00' },
    '7': { enabled: false, start: '10:00', end: '14:00' },
  })

  // Reset form when modal opens/closes or staff changes
  React.useEffect(() => {
    if (open) {
      if (staff) {
        setDisplayName(staff.displayName)
        setEmail(staff.email || '')
        setPhone(staff.phone || '')
        setTitle(staff.title || '')
        setBio(staff.bio || '')
        setColor(staff.color || COLORS[0].value)
        setIsBookable(staff.isBookable)
        setRole(staff.role || 'mitarbeiter')

        // Set selected services based on skills
        const matchingServiceIds = services
          .filter((s) => staff.skills.includes(s.name))
          .map((s) => s.id)
        setSelectedServices(matchingServiceIds)

        // Set working hours
        const newWorkingDays = { ...workingDays }
        for (const day of DAYS_OF_WEEK) {
          const dayHours = staff.workingHours.filter((wh) => wh.dayOfWeek === day.value)
          if (dayHours.length > 0) {
            newWorkingDays[day.value] = {
              enabled: true,
              start: minutesToTime(dayHours[0].startMinutes),
              end: minutesToTime(dayHours[0].endMinutes),
            }
          } else {
            newWorkingDays[day.value] = { enabled: false, start: '09:00', end: '18:00' }
          }
        }
        setWorkingDays(newWorkingDays)
      } else {
        // Reset to defaults for new staff
        setDisplayName('')
        setEmail('')
        setPhone('')
        setTitle('')
        setBio('')
        setColor(COLORS[0].value)
        setIsBookable(true)
        setRole('mitarbeiter')
        setSelectedServices([])
        setWorkingDays({
          '1': { enabled: true, start: '09:00', end: '18:00' },
          '2': { enabled: true, start: '09:00', end: '18:00' },
          '3': { enabled: true, start: '09:00', end: '18:00' },
          '4': { enabled: true, start: '09:00', end: '18:00' },
          '5': { enabled: true, start: '09:00', end: '18:00' },
          '6': { enabled: false, start: '09:00', end: '14:00' },
          '7': { enabled: false, start: '10:00', end: '14:00' },
        })
      }
    }
  }, [open, staff, services])

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const toggleWorkingDay = (day: DayOfWeek) => {
    setWorkingDays((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }))
  }

  const updateWorkingHours = (day: DayOfWeek, field: 'start' | 'end', value: string) => {
    setWorkingDays((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!displayName.trim()) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie einen Namen ein.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)

    try {
      // Build working hours array
      const workingHours: WorkingHoursEntry[] = []
      for (const day of DAYS_OF_WEEK) {
        const dayConfig = workingDays[day.value]
        if (dayConfig.enabled) {
          workingHours.push({
            dayOfWeek: day.value,
            startMinutes: timeToMinutes(dayConfig.start),
            endMinutes: timeToMinutes(dayConfig.end),
          })
        }
      }

      const data: CreateStaffInput = {
        displayName: displayName.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        title: title.trim() || undefined,
        bio: bio.trim() || undefined,
        color,
        isBookable,
        role,
        workingHours,
        serviceIds: selectedServices,
      }

      const result = await onSubmit(data)

      if (result.success) {
        toast({
          title: isEditing ? 'Mitarbeiter aktualisiert' : 'Mitarbeiter erstellt',
          description: isEditing
            ? 'Der Mitarbeiter wurde erfolgreich aktualisiert.'
            : 'Der neue Mitarbeiter wurde erfolgreich erstellt.',
        })
        onOpenChange(false)
      } else {
        toast({
          title: 'Fehler',
          description: result.error || 'Ein Fehler ist aufgetreten.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ein Fehler ist aufgetreten.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}
          </DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Bearbeiten Sie die Mitarbeiterdaten und Arbeitszeiten.'
              : 'Erfassen Sie einen neuen Mitarbeiter mit Arbeitszeiten und Fähigkeiten.'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="space-y-4">
            <h4 className="font-medium">Grunddaten</h4>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="displayName">Name *</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Max Mustermann"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="title">Funktion / Titel</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Senior Stylist"
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="email">E-Mail</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="max@salon.ch"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+41 79 123 45 67"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Beschreibung</Label>
              <Textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Kurze Beschreibung des Mitarbeiters..."
                rows={2}
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <Label>Farbe</Label>
                <Select value={color} onValueChange={setColor}>
                  <SelectTrigger>
                    <div className="flex items-center gap-2">
                      <div
                        className="h-4 w-4 rounded-full"
                        style={{ backgroundColor: color }}
                      />
                      <SelectValue />
                    </div>
                  </SelectTrigger>
                  <SelectContent>
                    {COLORS.map((c) => (
                      <SelectItem key={c.value} value={c.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-4 w-4 rounded-full"
                            style={{ backgroundColor: c.value }}
                          />
                          {c.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Rolle</Label>
                <Select value={role} onValueChange={(v) => setRole(v as RoleName)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {isEditing && !staff?.profileId && (
                  <p className="text-xs text-muted-foreground">
                    Rollen können nur für Mitarbeiter mit verknüpftem Benutzerkonto gespeichert werden.
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>&nbsp;</Label>
                <div className="flex items-center space-x-2 pt-2">
                  <Checkbox
                    id="isBookable"
                    checked={isBookable}
                    onCheckedChange={(checked) => setIsBookable(!!checked)}
                  />
                  <Label htmlFor="isBookable" className="font-normal cursor-pointer">
                    Online buchbar
                  </Label>
                </div>
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="space-y-4">
            <h4 className="font-medium">Arbeitszeiten</h4>
            <div className="space-y-3">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day.value}
                  className="flex items-center gap-4 p-2 rounded-md hover:bg-muted"
                >
                  <div className="w-24 flex items-center gap-2">
                    <Checkbox
                      checked={workingDays[day.value].enabled}
                      onCheckedChange={() => toggleWorkingDay(day.value)}
                    />
                    <span className="text-sm font-medium">{day.shortLabel}</span>
                  </div>
                  {workingDays[day.value].enabled ? (
                    <div className="flex items-center gap-2">
                      <Input
                        type="time"
                        value={workingDays[day.value].start}
                        onChange={(e) =>
                          updateWorkingHours(day.value, 'start', e.target.value)
                        }
                        className="w-28"
                      />
                      <span className="text-muted-foreground">-</span>
                      <Input
                        type="time"
                        value={workingDays[day.value].end}
                        onChange={(e) =>
                          updateWorkingHours(day.value, 'end', e.target.value)
                        }
                        className="w-28"
                      />
                    </div>
                  ) : (
                    <span className="text-sm text-muted-foreground">Frei</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Services / Skills */}
          {services.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-medium">Dienstleistungen</h4>
              <div className="grid gap-2 sm:grid-cols-2 max-h-40 overflow-y-auto p-1">
                {services.map((service) => (
                  <div
                    key={service.id}
                    className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                    onClick={() => toggleService(service.id)}
                  >
                    <Checkbox
                      checked={selectedServices.includes(service.id)}
                      onCheckedChange={() => toggleService(service.id)}
                    />
                    <Label className="font-normal cursor-pointer">{service.name}</Label>
                  </div>
                ))}
              </div>
            </div>
          )}

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
                  Speichern...
                </>
              ) : isEditing ? (
                'Speichern'
              ) : (
                'Erstellen'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
