import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Building2,
  Plus,
  Search,
  MapPin,
  Phone,
  Mail,
  Globe,
  MoreHorizontal,
  Eye,
  Settings,
  Palette,
  Users,
  ToggleLeft,
  Trash2,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const metadata: Metadata = {
  title: 'Salon-Verwaltung | SCHNITTWERK Admin',
  description: 'Verwalten Sie alle Salons im Netzwerk.',
}

// Mock data - in production this would come from DB
const salons = [
  {
    id: 'salon-1',
    name: 'SCHNITTWERK St. Gallen',
    slug: 'st-gallen',
    email: 'stgallen@schnittwerk.ch',
    phone: '+41 71 123 45 67',
    street: 'Bahnhofstrasse 42',
    city: 'St. Gallen',
    postal_code: '9000',
    country: 'CH',
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    logo_url: null,
    primary_color: '#b87444',
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
    stats: {
      staff: 5,
      customers: 342,
      appointments_this_month: 156,
      revenue_this_month: 12450,
    },
  },
  {
    id: 'salon-2',
    name: 'SCHNITTWERK Zürich',
    slug: 'zuerich',
    email: 'zuerich@schnittwerk.ch',
    phone: '+41 44 987 65 43',
    street: 'Limmatstrasse 88',
    city: 'Zürich',
    postal_code: '8005',
    country: 'CH',
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    logo_url: null,
    primary_color: '#1e293b',
    is_active: true,
    created_at: '2024-06-15T00:00:00Z',
    stats: {
      staff: 8,
      customers: 521,
      appointments_this_month: 243,
      revenue_this_month: 21890,
    },
  },
  {
    id: 'salon-3',
    name: 'SCHNITTWERK Winterthur',
    slug: 'winterthur',
    email: 'winterthur@schnittwerk.ch',
    phone: '+41 52 111 22 33',
    street: 'Marktgasse 15',
    city: 'Winterthur',
    postal_code: '8400',
    country: 'CH',
    timezone: 'Europe/Zurich',
    currency: 'CHF',
    logo_url: null,
    primary_color: '#166534',
    is_active: false,
    created_at: '2024-09-01T00:00:00Z',
    stats: {
      staff: 0,
      customers: 0,
      appointments_this_month: 0,
      revenue_this_month: 0,
    },
  },
]

const totalStats = {
  salons: salons.length,
  active: salons.filter((s) => s.is_active).length,
  totalStaff: salons.reduce((sum, s) => sum + s.stats.staff, 0),
  totalCustomers: salons.reduce((sum, s) => sum + s.stats.customers, 0),
  totalRevenue: salons.reduce((sum, s) => sum + s.stats.revenue_this_month, 0),
}

export default function SalonsPage() {
  const formatCurrency = (value: number) => `CHF ${value.toLocaleString('de-CH')}`
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('de-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Salon-Verwaltung</h1>
          <p className="text-muted-foreground">
            Verwalten Sie alle Salons im SCHNITTWERK Netzwerk
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/salons/new">
            <Plus className="mr-2 h-4 w-4" />
            Neuer Salon
          </Link>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Salons Gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.salons}</div>
            <p className="text-xs text-muted-foreground">
              {totalStats.active} aktiv
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Mitarbeiter
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStats.totalStaff}</div>
            <p className="text-xs text-muted-foreground">alle Standorte</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kunden
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalStats.totalCustomers.toLocaleString('de-CH')}
            </div>
            <p className="text-xs text-muted-foreground">alle Standorte</p>
          </CardContent>
        </Card>
        <Card className="md:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Umsatz (Monat)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(totalStats.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground">alle Standorte kombiniert</p>
          </CardContent>
        </Card>
      </div>

      {/* Salons Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alle Salons</CardTitle>
              <CardDescription>
                Übersicht aller Standorte im Netzwerk
              </CardDescription>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Salon suchen..." className="pl-9 w-64" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Salon</TableHead>
                <TableHead>Standort</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead className="text-right">Mitarbeiter</TableHead>
                <TableHead className="text-right">Kunden</TableHead>
                <TableHead className="text-right">Umsatz (Monat)</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {salons.map((salon) => (
                <TableRow key={salon.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        {salon.logo_url ? (
                          <AvatarImage src={salon.logo_url} alt={salon.name} />
                        ) : null}
                        <AvatarFallback
                          style={{ backgroundColor: salon.primary_color }}
                          className="text-white font-medium"
                        >
                          {salon.name
                            .split(' ')
                            .map((w) => w[0])
                            .join('')
                            .slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{salon.name}</div>
                        <div className="text-sm text-muted-foreground">
                          /{salon.slug}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-start gap-2">
                      <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                      <div className="text-sm">
                        <div>{salon.street}</div>
                        <div className="text-muted-foreground">
                          {salon.postal_code} {salon.city}
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      <div className="flex items-center gap-2">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        {salon.email}
                      </div>
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        {salon.phone}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {salon.stats.staff}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {salon.stats.customers.toLocaleString('de-CH')}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(salon.stats.revenue_this_month)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={salon.is_active ? 'default' : 'secondary'}>
                      {salon.is_active ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/salons/${salon.id}`}>
                            <Eye className="mr-2 h-4 w-4" />
                            Details anzeigen
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/salons/${salon.id}/settings`}>
                            <Settings className="mr-2 h-4 w-4" />
                            Einstellungen
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/salons/${salon.id}/branding`}>
                            <Palette className="mr-2 h-4 w-4" />
                            Branding
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link href={`/dashboard/salons/${salon.id}/team`}>
                            <Users className="mr-2 h-4 w-4" />
                            Team verwalten
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <ToggleLeft className="mr-2 h-4 w-4" />
                          {salon.is_active ? 'Deaktivieren' : 'Aktivieren'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Löschen
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Quick Actions for HQ */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Plus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Neuen Salon anlegen</h3>
                <p className="text-sm text-muted-foreground">
                  Salon-Assistent starten
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Benutzer verwalten</h3>
                <p className="text-sm text-muted-foreground">
                  Rollen und Zugriffe
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="cursor-pointer hover:bg-accent transition-colors">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-lg">
                <Globe className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">Globale Einstellungen</h3>
                <p className="text-sm text-muted-foreground">
                  Netzwerk-Konfiguration
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
