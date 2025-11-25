'use client'

import * as React from 'react'
import Link from 'next/link'
import {
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
  RefreshCw,
  Loader2,
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
import { useToast } from '@/components/ui/use-toast'
import {
  getSalons,
  getHQStats,
  deactivateSalon,
  reactivateSalon,
  deleteSalon,
  type SalonListItem,
  type HQStats,
} from '@/features/dashboard/actions'

export default function SalonsPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState('')

  const [salons, setSalons] = React.useState<SalonListItem[]>([])
  const [stats, setStats] = React.useState<HQStats>({
    totalSalons: 0,
    activeSalons: 0,
    totalStaff: 0,
    totalCustomers: 0,
    totalMonthlyRevenue: 0,
  })

  const fetchData = React.useCallback(async () => {
    try {
      const [salonsData, statsData] = await Promise.all([
        getSalons(),
        getHQStats(),
      ])
      setSalons(salonsData)
      setStats(statsData)
    } catch (error) {
      console.error('Failed to fetch salons:', error)
      toast({
        title: 'Fehler',
        description: 'Salon-Daten konnten nicht geladen werden.',
        variant: 'destructive',
      })
    }
  }, [toast])

  React.useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchData()
      setIsLoading(false)
    }
    loadData()
  }, [fetchData])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }

  const handleToggleActive = async (salon: SalonListItem) => {
    const action = salon.isActive ? deactivateSalon : reactivateSalon
    const result = await action(salon.id)

    if (result.success) {
      toast({
        title: salon.isActive ? 'Salon deaktiviert' : 'Salon aktiviert',
        description: `${salon.name} wurde ${salon.isActive ? 'deaktiviert' : 'aktiviert'}.`,
      })
      await fetchData()
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Aktion konnte nicht ausgeführt werden.',
        variant: 'destructive',
      })
    }
  }

  const handleDelete = async (salon: SalonListItem) => {
    if (!confirm(`Möchten Sie "${salon.name}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`)) {
      return
    }

    const result = await deleteSalon(salon.id)

    if (result.success) {
      toast({
        title: 'Salon gelöscht',
        description: `${salon.name} wurde gelöscht.`,
      })
      await fetchData()
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Salon konnte nicht gelöscht werden.',
        variant: 'destructive',
      })
    }
  }

  const formatCurrency = (value: number) => `CHF ${value.toLocaleString('de-CH')}`

  // Filter salons by search query
  const filteredSalons = salons.filter((salon) =>
    salon.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    salon.slug.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Lade Salon-Daten...</p>
        </div>
      </div>
    )
  }

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
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button asChild>
            <Link href="/dashboard/salons/new">
              <Plus className="mr-2 h-4 w-4" />
              Neuer Salon
            </Link>
          </Button>
        </div>
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
            <div className="text-2xl font-bold">{stats.totalSalons}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeSalons} aktiv
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
            <div className="text-2xl font-bold">{stats.totalStaff}</div>
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
              {stats.totalCustomers.toLocaleString('de-CH')}
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
              {formatCurrency(stats.totalMonthlyRevenue)}
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
              <Input
                placeholder="Salon suchen..."
                className="pl-9 w-64"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredSalons.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">
                {searchQuery ? 'Keine Salons gefunden.' : 'Noch keine Salons vorhanden.'}
              </p>
              {!searchQuery && (
                <Button asChild className="mt-4">
                  <Link href="/dashboard/salons/new">
                    <Plus className="mr-2 h-4 w-4" />
                    Ersten Salon anlegen
                  </Link>
                </Button>
              )}
            </div>
          ) : (
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
                {filteredSalons.map((salon) => (
                  <TableRow key={salon.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          {salon.logoUrl ? (
                            <AvatarImage src={salon.logoUrl} alt={salon.name} />
                          ) : null}
                          <AvatarFallback
                            style={{ backgroundColor: salon.primaryColor }}
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
                          <div>{salon.street || '-'}</div>
                          <div className="text-muted-foreground">
                            {salon.postalCode} {salon.city}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1 text-sm">
                        {salon.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            {salon.email}
                          </div>
                        )}
                        {salon.phone && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3 text-muted-foreground" />
                            {salon.phone}
                          </div>
                        )}
                        {!salon.email && !salon.phone && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {salon.staffCount}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {salon.customerCount.toLocaleString('de-CH')}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(salon.monthlyRevenue)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={salon.isActive ? 'default' : 'secondary'}>
                        {salon.isActive ? 'Aktiv' : 'Inaktiv'}
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
                          <DropdownMenuItem onClick={() => handleToggleActive(salon)}>
                            <ToggleLeft className="mr-2 h-4 w-4" />
                            {salon.isActive ? 'Deaktivieren' : 'Aktivieren'}
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive"
                            onClick={() => handleDelete(salon)}
                          >
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
          )}
        </CardContent>
      </Card>

      {/* Quick Actions for HQ */}
      <div className="grid gap-4 md:grid-cols-3">
        <Link href="/dashboard/salons/new">
          <Card className="cursor-pointer hover:bg-accent transition-colors h-full">
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
        </Link>
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
