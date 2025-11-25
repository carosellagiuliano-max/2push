import type { Metadata } from 'next'
import { Plus, Pencil, Calendar, Mail, Phone } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

export const metadata: Metadata = {
  title: 'Team | SCHNITTWERK Admin',
  description: 'Verwalten Sie Ihr Team und Mitarbeiter.',
}

// Mock data - in production this would come from DB
const staff = [
  {
    id: '1',
    name: 'Maria Schmidt',
    email: 'maria@schnittwerk.ch',
    phone: '+41 79 123 45 67',
    role: 'Inhaberin',
    skills: ['Schnitt', 'Farbe', 'Styling'],
    isActive: true,
    workingDays: ['Mo', 'Di', 'Mi', 'Do', 'Fr'],
  },
  {
    id: '2',
    name: 'Thomas Müller',
    email: 'thomas@schnittwerk.ch',
    phone: '+41 79 234 56 78',
    role: 'Senior Stylist',
    skills: ['Schnitt', 'Bart', 'Styling'],
    isActive: true,
    workingDays: ['Mo', 'Di', 'Mi', 'Do'],
  },
  {
    id: '3',
    name: 'Laura Weber',
    email: 'laura@schnittwerk.ch',
    phone: '+41 79 345 67 89',
    role: 'Coloristin',
    skills: ['Farbe', 'Strähnen', 'Pflege'],
    isActive: true,
    workingDays: ['Di', 'Mi', 'Do', 'Fr', 'Sa'],
  },
  {
    id: '4',
    name: 'Nico Brunner',
    email: 'nico@schnittwerk.ch',
    phone: '+41 79 456 78 90',
    role: 'Stylist',
    skills: ['Schnitt', 'Styling'],
    isActive: true,
    workingDays: ['Mo', 'Mi', 'Fr', 'Sa'],
  },
  {
    id: '5',
    name: 'Sophie Keller',
    email: 'sophie@schnittwerk.ch',
    phone: '+41 79 567 89 01',
    role: 'Auszubildende',
    skills: ['Waschen', 'Pflege'],
    isActive: false,
    workingDays: ['Mo', 'Di', 'Mi'],
  },
]

export default function TeamPage() {
  const activeStaff = staff.filter((s) => s.isActive)
  const inactiveStaff = staff.filter((s) => !s.isActive)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Team</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihr Team und deren Arbeitszeiten
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Mitarbeiter hinzufügen
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Team-Mitglieder
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{staff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktive Mitarbeiter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStaff.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Heute im Dienst
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3</div>
          </CardContent>
        </Card>
      </div>

      {/* Active Staff */}
      <Card>
        <CardHeader>
          <CardTitle>Aktive Mitarbeiter</CardTitle>
          <CardDescription>
            Mitarbeiter, die aktuell im Team aktiv sind
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {activeStaff.map((member) => (
              <Card key={member.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback>
                          {member.name.split(' ').map((n) => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold">{member.name}</h3>
                        <p className="text-sm text-muted-foreground">{member.role}</p>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-4 w-4" />
                      {member.email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-4 w-4" />
                      {member.phone}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {member.workingDays.join(', ')}
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-1">
                    {member.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Inactive Staff */}
      {inactiveStaff.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Inaktive Mitarbeiter</CardTitle>
            <CardDescription>
              Mitarbeiter, die momentan nicht aktiv sind
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {inactiveStaff.map((member) => (
                <Card key={member.id} className="opacity-60">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {member.name.split(' ').map((n) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <h3 className="font-semibold">{member.name}</h3>
                          <p className="text-sm text-muted-foreground">{member.role}</p>
                        </div>
                      </div>
                      <Badge variant="secondary">Inaktiv</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
