import type { Metadata } from 'next'
import { Plus, Pencil, Trash2, Clock, Calendar, Users } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'

export const metadata: Metadata = {
  title: 'Arbeitszeiten | SCHNITTWERK Admin',
  description: 'Verwalten Sie Öffnungszeiten und Mitarbeiter-Schichten.',
}

// Mock data - in production this would come from DB
const openingHours = [
  { day: 'Montag', dayShort: 'Mo', open: '09:00', close: '18:00', isOpen: true },
  { day: 'Dienstag', dayShort: 'Di', open: '09:00', close: '18:00', isOpen: true },
  { day: 'Mittwoch', dayShort: 'Mi', open: '09:00', close: '20:00', isOpen: true },
  { day: 'Donnerstag', dayShort: 'Do', open: '09:00', close: '20:00', isOpen: true },
  { day: 'Freitag', dayShort: 'Fr', open: '09:00', close: '18:00', isOpen: true },
  { day: 'Samstag', dayShort: 'Sa', open: '09:00', close: '16:00', isOpen: true },
  { day: 'Sonntag', dayShort: 'So', open: '', close: '', isOpen: false },
]

const staffSchedules = [
  {
    id: '1',
    name: 'Maria Schmidt',
    role: 'Inhaberin',
    schedule: [
      { day: 'Mo', start: '09:00', end: '18:00' },
      { day: 'Di', start: '09:00', end: '18:00' },
      { day: 'Mi', start: '09:00', end: '20:00' },
      { day: 'Do', start: '09:00', end: '20:00' },
      { day: 'Fr', start: '09:00', end: '18:00' },
    ],
  },
  {
    id: '2',
    name: 'Thomas Weber',
    role: 'Senior Stylist',
    schedule: [
      { day: 'Di', start: '09:00', end: '18:00' },
      { day: 'Mi', start: '09:00', end: '20:00' },
      { day: 'Do', start: '09:00', end: '20:00' },
      { day: 'Fr', start: '09:00', end: '18:00' },
      { day: 'Sa', start: '09:00', end: '16:00' },
    ],
  },
  {
    id: '3',
    name: 'Laura Müller',
    role: 'Stylistin',
    schedule: [
      { day: 'Mo', start: '09:00', end: '18:00' },
      { day: 'Di', start: '09:00', end: '18:00' },
      { day: 'Mi', start: '12:00', end: '20:00' },
      { day: 'Do', start: '12:00', end: '20:00' },
      { day: 'Sa', start: '09:00', end: '16:00' },
    ],
  },
]

const holidays = [
  { id: '1', name: 'Neujahr', date: '2025-01-01', type: 'holiday' },
  { id: '2', name: 'Karfreitag', date: '2025-04-18', type: 'holiday' },
  { id: '3', name: 'Ostermontag', date: '2025-04-21', type: 'holiday' },
  { id: '4', name: 'Tag der Arbeit', date: '2025-05-01', type: 'holiday' },
  { id: '5', name: 'Betriebsferien', date: '2025-07-21', endDate: '2025-08-03', type: 'vacation' },
  { id: '6', name: 'Weihnachten', date: '2025-12-24', endDate: '2025-12-26', type: 'holiday' },
]

const days = ['Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa', 'So']

export default function SchedulePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Arbeitszeiten</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Öffnungszeiten, Schichten und Feiertage
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Opening Hours */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Öffnungszeiten
                </CardTitle>
                <CardDescription>
                  Reguläre Geschäftszeiten des Salons
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Pencil className="mr-2 h-4 w-4" />
                Bearbeiten
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {openingHours.map((day) => (
                <div
                  key={day.day}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Switch checked={day.isOpen} />
                    <span className="font-medium w-24">{day.day}</span>
                  </div>
                  {day.isOpen ? (
                    <span className="text-muted-foreground">
                      {day.open} - {day.close}
                    </span>
                  ) : (
                    <Badge variant="secondary">Geschlossen</Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Holidays & Closures */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Feiertage & Schliessungen
                </CardTitle>
                <CardDescription>
                  Tage an denen der Salon geschlossen ist
                </CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Hinzufügen
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {holidays.map((holiday) => (
                <div
                  key={holiday.id}
                  className="flex items-center justify-between py-2 border-b last:border-0"
                >
                  <div>
                    <div className="font-medium">{holiday.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {new Date(holiday.date).toLocaleDateString('de-CH')}
                      {holiday.endDate && (
                        <> - {new Date(holiday.endDate).toLocaleDateString('de-CH')}</>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={holiday.type === 'vacation' ? 'default' : 'secondary'}>
                      {holiday.type === 'vacation' ? 'Ferien' : 'Feiertag'}
                    </Badge>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff Schedules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Mitarbeiter-Schichten
              </CardTitle>
              <CardDescription>
                Wochenübersicht aller Mitarbeiter-Arbeitszeiten
              </CardDescription>
            </div>
            <Button variant="outline" size="sm">
              <Pencil className="mr-2 h-4 w-4" />
              Schichten bearbeiten
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 pr-4 font-medium">Mitarbeiter</th>
                  {days.map((day) => (
                    <th key={day} className="text-center py-3 px-2 font-medium min-w-[80px]">
                      {day}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {staffSchedules.map((staff) => (
                  <tr key={staff.id} className="border-b last:border-0">
                    <td className="py-4 pr-4">
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-sm text-muted-foreground">{staff.role}</div>
                    </td>
                    {days.map((day) => {
                      const shift = staff.schedule.find((s) => s.day === day)
                      return (
                        <td key={day} className="text-center py-4 px-2">
                          {shift ? (
                            <div className="text-xs">
                              <div className="font-medium">{shift.start}</div>
                              <div className="text-muted-foreground">{shift.end}</div>
                            </div>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Wochenstunden (Salon)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">54 Std.</div>
            <p className="text-xs text-muted-foreground">Mo-Sa total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mitarbeiter-Kapazität
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">126 Std.</div>
            <p className="text-xs text-muted-foreground">Total pro Woche</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nächste Schliessung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1. Jan</div>
            <p className="text-xs text-muted-foreground">Neujahr</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
