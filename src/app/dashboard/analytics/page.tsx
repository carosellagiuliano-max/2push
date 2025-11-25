'use client'

import * as React from 'react'
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
  RefreshCw,
  Loader2,
  AlertCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  getAnalyticsData,
  exportAnalyticsCSV,
  type AnalyticsPeriod,
  type AnalyticsData,
  type AnalyticsInsight,
} from '@/features/dashboard/actions'

// TODO: Get from auth context
const SALON_ID = process.env.NEXT_PUBLIC_DEFAULT_SALON_ID || 'default-salon-id'

export default function AnalyticsPage() {
  const { toast } = useToast()
  const [period, setPeriod] = React.useState<AnalyticsPeriod>('month')
  const [data, setData] = React.useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [isExporting, setIsExporting] = React.useState(false)

  const formatCurrency = (value: number) => `CHF ${value.toLocaleString('de-CH', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
  const formatCurrencyDecimal = (value: number) => `CHF ${value.toLocaleString('de-CH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
  const formatPercent = (value: number) => `${value > 0 ? '+' : ''}${value.toFixed(1)}%`

  // Fetch data on mount and when period changes
  React.useEffect(() => {
    fetchData()
  }, [period])

  const fetchData = async () => {
    try {
      const analyticsData = await getAnalyticsData(SALON_ID, period)
      setData(analyticsData)
    } catch (error) {
      console.error('Failed to fetch analytics:', error)
      toast({
        title: 'Fehler',
        description: 'Statistiken konnten nicht geladen werden.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await fetchData()
    setIsRefreshing(false)
  }

  const handleExport = async () => {
    setIsExporting(true)
    try {
      const result = await exportAnalyticsCSV(SALON_ID, period)
      if (result.success && result.csv) {
        // Create and download CSV file
        const blob = new Blob([result.csv], { type: 'text/csv;charset=utf-8;' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = `statistiken-${period}-${new Date().toISOString().split('T')[0]}.csv`
        link.click()
        URL.revokeObjectURL(url)

        toast({
          title: 'Export erfolgreich',
          description: 'Die Statistiken wurden als CSV exportiert.',
        })
      } else {
        toast({
          title: 'Fehler',
          description: result.error || 'Export fehlgeschlagen.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Export fehlgeschlagen.',
        variant: 'destructive',
      })
    } finally {
      setIsExporting(false)
    }
  }

  const getInsightIcon = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'positive':
        return TrendingUp
      case 'warning':
        return TrendingDown
      default:
        return Users
    }
  }

  const getInsightColors = (type: AnalyticsInsight['type']) => {
    switch (type) {
      case 'positive':
        return 'bg-green-50 border-green-200 text-green-800'
      case 'warning':
        return 'bg-orange-50 border-orange-200 text-orange-800'
      default:
        return 'bg-blue-50 border-blue-200 text-blue-800'
    }
  }

  const getPeriodLabel = (p: AnalyticsPeriod) => {
    switch (p) {
      case 'week':
        return 'vs. Vorwoche'
      case 'month':
        return 'vs. Vormonat'
      case 'quarter':
        return 'vs. Vorquartal'
      case 'year':
        return 'vs. Vorjahr'
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Lade Statistiken...</p>
        </div>
      </div>
    )
  }

  // No data state
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <AlertCircle className="h-8 w-8 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">Keine Daten verfügbar</p>
          <Button variant="outline" onClick={handleRefresh} className="mt-4">
            Erneut versuchen
          </Button>
        </div>
      </div>
    )
  }

  const { stats, revenueByService, revenueByStaff, dailyRevenue, topProducts, insights } = data

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
        <div className="flex items-center gap-2">
          <Select value={period} onValueChange={(v) => setPeriod(v as AnalyticsPeriod)}>
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
          <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
          <Button variant="outline" onClick={handleExport} disabled={isExporting}>
            {isExporting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Download className="mr-2 h-4 w-4" />
            )}
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
              {stats.revenue.change >= 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              )}
              <span className={stats.revenue.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(stats.revenue.change)}
              </span>
              <span className="ml-1 text-muted-foreground">{getPeriodLabel(period)}</span>
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
              {stats.appointments.change >= 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              )}
              <span className={stats.appointments.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(stats.appointments.change)}
              </span>
              <span className="ml-1 text-muted-foreground">{getPeriodLabel(period)}</span>
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
              {stats.newCustomers.change >= 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              )}
              <span className={stats.newCustomers.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(stats.newCustomers.change)}
              </span>
              <span className="ml-1 text-muted-foreground">{getPeriodLabel(period)}</span>
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
            <div className="text-2xl font-bold">{formatCurrencyDecimal(stats.avgTicket.current)}</div>
            <div className="flex items-center text-xs">
              {stats.avgTicket.change >= 0 ? (
                <ArrowUpRight className="mr-1 h-4 w-4 text-green-600" />
              ) : (
                <ArrowDownRight className="mr-1 h-4 w-4 text-red-600" />
              )}
              <span className={stats.avgTicket.change >= 0 ? 'text-green-600' : 'text-red-600'}>
                {formatPercent(stats.avgTicket.change)}
              </span>
              <span className="ml-1 text-muted-foreground">{getPeriodLabel(period)}</span>
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
            {dailyRevenue.length === 0 || dailyRevenue.every((d) => d.revenue === 0) ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Keine Daten für diesen Zeitraum
              </p>
            ) : (
              <div className="space-y-4">
                {dailyRevenue.map((day) => {
                  const maxRevenue = Math.max(...dailyRevenue.map((d) => d.revenue))
                  const width = maxRevenue > 0 ? (day.revenue / maxRevenue) * 100 : 0
                  return (
                    <div key={day.day} className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium w-8">{day.dayName}</span>
                        <span className="text-muted-foreground">{day.appointments} Termine</span>
                        <span className="font-medium">{formatCurrency(day.revenue)}</span>
                      </div>
                      <div className="h-2 w-full rounded-full bg-muted">
                        <div
                          className="h-2 rounded-full bg-primary transition-all"
                          style={{ width: `${width}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Revenue by Service */}
        <Card>
          <CardHeader>
            <CardTitle>Umsatz nach Dienstleistung</CardTitle>
            <CardDescription>Top-Dienstleistungen nach Umsatz</CardDescription>
          </CardHeader>
          <CardContent>
            {revenueByService.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Keine Daten für diesen Zeitraum
              </p>
            ) : (
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
                          className="h-2 rounded-full bg-primary transition-all"
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
            )}
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
            {revenueByStaff.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Keine Daten für diesen Zeitraum
              </p>
            ) : (
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
                        Ø {formatCurrencyDecimal(staff.avgTicket)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Top Produkte</CardTitle>
            <CardDescription>Meistverkaufte Produkte</CardDescription>
          </CardHeader>
          <CardContent>
            {topProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Keine Produktverkäufe in diesem Zeitraum
              </p>
            ) : (
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
                        {product.brand && (
                          <div className="text-sm text-muted-foreground">{product.brand}</div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-medium">{formatCurrency(product.revenue)}</div>
                      <div className="text-sm text-muted-foreground">{product.sold} verkauft</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Quick Insights</CardTitle>
            <CardDescription>Wichtige Erkenntnisse auf einen Blick</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-3">
              {insights.map((insight, index) => {
                const Icon = getInsightIcon(insight.type)
                const colorClasses = getInsightColors(insight.type)
                return (
                  <div
                    key={index}
                    className={`flex items-start gap-3 p-4 rounded-lg border ${colorClasses}`}
                  >
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div>
                      <div className="font-medium">{insight.title}</div>
                      <div className="text-sm opacity-90">{insight.description}</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
