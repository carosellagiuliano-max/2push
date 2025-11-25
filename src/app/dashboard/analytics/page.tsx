import type { Metadata } from 'next'
import {
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  ShoppingBag,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Download,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const metadata: Metadata = {
  title: 'Statistiken | SCHNITTWERK Admin',
  description: 'Analysieren Sie Ihre Geschäftskennzahlen und Performance.',
}

// Mock data - in production this would come from DB
const stats = {
  revenue: {
    current: 12450,
    previous: 10890,
    change: 14.3,
  },
  appointments: {
    current: 156,
    previous: 142,
    change: 9.9,
  },
  newCustomers: {
    current: 23,
    previous: 18,
    change: 27.8,
  },
  avgTicket: {
    current: 79.81,
    previous: 76.69,
    change: 4.1,
  },
}

const revenueByService = [
  { name: 'Damenhaarschnitt', revenue: 3240, count: 54, percent: 26 },
  { name: 'Herrenhaarschnitt', revenue: 2700, count: 60, percent: 22 },
  { name: 'Balayage', revenue: 2400, count: 16, percent: 19 },
  { name: 'Coloration', revenue: 1980, count: 22, percent: 16 },
  { name: 'Styling', revenue: 1200, count: 40, percent: 10 },
  { name: 'Andere', revenue: 930, count: 31, percent: 7 },
]

const revenueByStaff = [
  { name: 'Maria Schmidt', revenue: 4200, appointments: 52, avgTicket: 80.77 },
  { name: 'Thomas Weber', revenue: 3850, appointments: 48, avgTicket: 80.21 },
  { name: 'Laura Müller', revenue: 2800, appointments: 35, avgTicket: 80.00 },
  { name: 'Sophie Keller', revenue: 1600, appointments: 21, avgTicket: 76.19 },
]

const topProducts = [
  { name: 'Repair Shampoo', brand: 'Kérastase', sold: 12, revenue: 384 },
  { name: 'Haaröl Luxe', brand: 'Olaplex', sold: 8, revenue: 360 },
  { name: 'Styling Paste', brand: 'Kevin Murphy', sold: 15, revenue: 570 },
  { name: 'Color Protect Spray', brand: 'Aveda', sold: 10, revenue: 280 },
]

const dailyRevenue = [
  { day: 'Mo', revenue: 1850, appointments: 22 },
  { day: 'Di', revenue: 2100, appointments: 26 },
  { day: 'Mi', revenue: 2450, appointments: 28 },
  { day: 'Do', revenue: 2680, appointments: 32 },
  { day: 'Fr', revenue: 2120, appointments: 25 },
  { day: 'Sa', revenue: 1250, appointments: 23 },
]

export default function AnalyticsPage() {
  const formatCurrency = (value: number) => `CHF ${value.toLocaleString('de-CH')}`
  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Statistiken</h1>
          <p className="text-muted-foreground">
            Analysieren Sie Ihre Geschäftskennzahlen
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select defaultValue="month">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">Diese Woche</SelectItem>
              <SelectItem value="month">Dieser Monat</SelectItem>
              <SelectItem value="quarter">Dieses Quartal</SelectItem>
              <SelectItem value="year">Dieses Jahr</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Umsatz
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.revenue.current)}</div>
            <div className="flex items-center text-xs">
              {stats.revenue.change > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              )}
              <span className={stats.revenue.change > 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(stats.revenue.change)}
              </span>
              <span className="ml-1 text-muted-foreground">vs. Vormonat</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Termine
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.appointments.current}</div>
            <div className="flex items-center text-xs">
              {stats.appointments.change > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              )}
              <span className={stats.appointments.change > 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(stats.appointments.change)}
              </span>
              <span className="ml-1 text-muted-foreground">vs. Vormonat</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Neue Kunden
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newCustomers.current}</div>
            <div className="flex items-center text-xs">
              {stats.newCustomers.change > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              )}
              <span className={stats.newCustomers.change > 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(stats.newCustomers.change)}
              </span>
              <span className="ml-1 text-muted-foreground">vs. Vormonat</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ø Bon
            </CardTitle>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.avgTicket.current)}</div>
            <div className="flex items-center text-xs">
              {stats.avgTicket.change > 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              )}
              <span className={stats.avgTicket.change > 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(stats.avgTicket.change)}
              </span>
              <span className="ml-1 text-muted-foreground">vs. Vormonat</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Revenue by Day */}
        <Card>
          <CardHeader>
            <CardTitle>Umsatz nach Wochentag</CardTitle>
            <CardDescription>Durchschnittlicher Umsatz pro Tag</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dailyRevenue.map((day) => {
                const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue))
                const width = (day.revenue / maxRevenue) * 100
                return (
                  <div key={day.day} className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium w-8">{day.day}</span>
                      <span className="text-muted-foreground">{day.appointments} Termine</span>
                      <span className="font-medium">{formatCurrency(day.revenue)}</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${width}%` }}
                      />
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* Revenue by Service */}
        <Card>
          <CardHeader>
            <CardTitle>Umsatz nach Dienstleistung</CardTitle>
            <CardDescription>Top-Dienstleistungen nach Umsatz</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByService.map((service) => (
                <div key={service.name} className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium">{service.name}</span>
                      <span className="text-sm text-muted-foreground">{service.count}x</span>
                    </div>
                    <div className="h-2 w-full rounded-full bg-muted">
                      <div
                        className="h-2 rounded-full bg-primary"
                        style={{ width: `${service.percent}%` }}
                      />
                    </div>
                  </div>
                  <span className="ml-4 text-sm font-medium w-24 text-right">
                    {formatCurrency(service.revenue)}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Staff and Products Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Staff Performance */}
        <Card>
          <CardHeader>
            <CardTitle>Mitarbeiter Performance</CardTitle>
            <CardDescription>Umsatz und Termine pro Mitarbeiter</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {revenueByStaff.map((staff, index) => (
                <div
                  key={staff.name}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium">{staff.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {staff.appointments} Termine
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(staff.revenue)}</div>
                    <div className="text-sm text-muted-foreground">
                      Ø {formatCurrency(staff.avgTicket)}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produkte</CardTitle>
            <CardDescription>Meistverkaufte Produkte</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div
                  key={product.name}
                  className="flex items-center justify-between py-3 border-b last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="h-8 w-8 rounded-full justify-center">
                      {index + 1}
                    </Badge>
                    <div>
                      <div className="font-medium">{product.name}</div>
                      <div className="text-sm text-muted-foreground">{product.brand}</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{formatCurrency(product.revenue)}</div>
                    <div className="text-sm text-muted-foreground">{product.sold} verkauft</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Insights</CardTitle>
          <CardDescription>Wichtige Erkenntnisse auf einen Blick</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-green-50 border border-green-200">
              <TrendingUp className="h-5 w-5 text-green-600 mt-0.5" />
              <div>
                <div className="font-medium text-green-800">Umsatzwachstum</div>
                <div className="text-sm text-green-700">
                  Umsatz ist um 14.3% gestiegen im Vergleich zum Vormonat
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 border border-blue-200">
              <Users className="h-5 w-5 text-blue-600 mt-0.5" />
              <div>
                <div className="font-medium text-blue-800">Kundenakquise</div>
                <div className="text-sm text-blue-700">
                  23 neue Kunden gewonnen - 28% mehr als letzten Monat
                </div>
              </div>
            </div>
            <div className="flex items-start gap-3 p-4 rounded-lg bg-orange-50 border border-orange-200">
              <TrendingDown className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <div className="font-medium text-orange-800">Auslastung Samstag</div>
                <div className="text-sm text-orange-700">
                  Samstag hat die niedrigste Auslastung - Potential für Aktionen
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
