import type { Metadata } from 'next'
import {
  Download,
  CreditCard,
  Banknote,
  Smartphone,
  FileText,
  TrendingUp,
  Receipt,
  Percent,
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Finanzen | SCHNITTWERK Admin',
  description: 'Finanzübersicht, Buchhaltungsexport und MwSt.-Übersicht.',
}

// Mock data - in production this would come from accounting_export view
const revenueByPaymentMethod = [
  { method: 'Kartenzahlung', icon: CreditCard, amount: 8450, count: 98, percent: 68 },
  { method: 'Barzahlung', icon: Banknote, amount: 2480, count: 42, percent: 20 },
  { method: 'TWINT', icon: Smartphone, amount: 1120, count: 28, percent: 9 },
  { method: 'Rechnung', icon: FileText, amount: 400, count: 5, percent: 3 },
]

const vatSummary = [
  { rate: '8.1%', description: 'Normalsatz (Dienstleistungen)', netAmount: 10250, vatAmount: 830.25, grossAmount: 11080.25 },
  { rate: '8.1%', description: 'Normalsatz (Produkte)', netAmount: 1852, vatAmount: 150.01, grossAmount: 2002.01 },
  { rate: '2.6%', description: 'Reduzierter Satz', netAmount: 320, vatAmount: 8.32, grossAmount: 328.32 },
]

const recentTransactions = [
  { id: 'TRX-001', date: '2025-01-15', type: 'Termin', customer: 'Anna Meier', method: 'Karte', amount: 125, status: 'completed' },
  { id: 'TRX-002', date: '2025-01-15', type: 'Shop', customer: 'Peter Müller', method: 'TWINT', amount: 78, status: 'completed' },
  { id: 'TRX-003', date: '2025-01-15', type: 'Termin', customer: 'Lisa Weber', method: 'Bar', amount: 85, status: 'completed' },
  { id: 'TRX-004', date: '2025-01-14', type: 'Termin', customer: 'Max Schmidt', method: 'Karte', amount: 145, status: 'completed' },
  { id: 'TRX-005', date: '2025-01-14', type: 'Shop', customer: 'Sarah Keller', method: 'Rechnung', amount: 210, status: 'pending' },
  { id: 'TRX-006', date: '2025-01-14', type: 'Termin', customer: 'Thomas Huber', method: 'Karte', amount: 95, status: 'refunded' },
]

const monthlyRevenue = [
  { month: 'Jan', services: 9800, products: 1650 },
  { month: 'Feb', services: 10200, products: 1420 },
  { month: 'Mär', services: 11500, products: 1890 },
  { month: 'Apr', services: 10800, products: 1720 },
  { month: 'Mai', services: 12100, products: 2100 },
  { month: 'Jun', services: 11800, products: 1950 },
]

export default function FinancePage() {
  const formatCurrency = (value: number) => `CHF ${value.toLocaleString('de-CH', { minimumFractionDigits: 2 })}`

  const totalRevenue = revenueByPaymentMethod.reduce((a, b) => a + b.amount, 0)
  const totalVatNet = vatSummary.reduce((a, b) => a + b.netAmount, 0)
  const totalVat = vatSummary.reduce((a, b) => a + b.vatAmount, 0)
  const totalVatGross = vatSummary.reduce((a, b) => a + b.grossAmount, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Finanzen</h1>
          <p className="text-muted-foreground">
            Finanzübersicht und Buchhaltungsexport
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
            CSV Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamtumsatz (Brutto)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVatGross)}</div>
            <p className="text-xs text-muted-foreground">inkl. MwSt.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Nettoumsatz
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVatNet)}</div>
            <p className="text-xs text-muted-foreground">exkl. MwSt.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              MwSt. Schuld
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVat)}</div>
            <p className="text-xs text-muted-foreground">abzuführen</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Transaktionen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {revenueByPaymentMethod.reduce((a, b) => a + b.count, 0)}
            </div>
            <p className="text-xs text-muted-foreground">diesen Monat</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Übersicht</TabsTrigger>
          <TabsTrigger value="vat">MwSt.-Übersicht</TabsTrigger>
          <TabsTrigger value="transactions">Transaktionen</TabsTrigger>
          <TabsTrigger value="export">Export</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Revenue by Payment Method */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Umsatz nach Zahlungsart
                </CardTitle>
                <CardDescription>
                  Aufschlüsselung der Einnahmen
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {revenueByPaymentMethod.map((method) => {
                    const Icon = method.icon
                    return (
                      <div key={method.method} className="flex items-center gap-4">
                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{method.method}</span>
                            <span className="text-sm text-muted-foreground">{method.count} Transaktionen</span>
                          </div>
                          <div className="h-2 w-full rounded-full bg-muted">
                            <div
                              className="h-2 rounded-full bg-primary"
                              style={{ width: `${method.percent}%` }}
                            />
                          </div>
                        </div>
                        <span className="text-sm font-medium w-28 text-right">
                          {formatCurrency(method.amount)}
                        </span>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-6 pt-4 border-t flex justify-between items-center">
                  <span className="font-medium">Gesamt</span>
                  <span className="text-xl font-bold">{formatCurrency(totalRevenue)}</span>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Revenue Chart */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Monatsumsatz
                </CardTitle>
                <CardDescription>
                  Dienstleistungen vs. Produkte
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {monthlyRevenue.map((month) => {
                    const total = month.services + month.products
                    const maxTotal = Math.max(...monthlyRevenue.map((m) => m.services + m.products))
                    const servicesWidth = (month.services / maxTotal) * 100
                    const productsWidth = (month.products / maxTotal) * 100
                    return (
                      <div key={month.month} className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium w-8">{month.month}</span>
                          <span className="text-muted-foreground">
                            DL: {formatCurrency(month.services)} | Prod: {formatCurrency(month.products)}
                          </span>
                        </div>
                        <div className="h-4 w-full rounded-full bg-muted flex overflow-hidden">
                          <div
                            className="h-4 bg-primary"
                            style={{ width: `${servicesWidth}%` }}
                          />
                          <div
                            className="h-4 bg-primary/50"
                            style={{ width: `${productsWidth}%` }}
                          />
                        </div>
                      </div>
                    )
                  })}
                </div>
                <div className="mt-4 flex gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary" />
                    <span>Dienstleistungen</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 w-3 rounded bg-primary/50" />
                    <span>Produkte</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* VAT Tab */}
        <TabsContent value="vat" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Percent className="h-5 w-5" />
                MwSt.-Übersicht
              </CardTitle>
              <CardDescription>
                Aufschlüsselung nach Steuersätzen gemäss Schweizer MwSt.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>MwSt.-Satz</TableHead>
                    <TableHead>Beschreibung</TableHead>
                    <TableHead className="text-right">Netto</TableHead>
                    <TableHead className="text-right">MwSt.</TableHead>
                    <TableHead className="text-right">Brutto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {vatSummary.map((vat, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Badge variant="outline">{vat.rate}</Badge>
                      </TableCell>
                      <TableCell>{vat.description}</TableCell>
                      <TableCell className="text-right">{formatCurrency(vat.netAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(vat.vatAmount)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(vat.grossAmount)}</TableCell>
                    </TableRow>
                  ))}
                  <TableRow className="font-bold bg-muted/50">
                    <TableCell colSpan={2}>Total</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalVatNet)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalVat)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(totalVatGross)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>MwSt.-Abrechnung</CardTitle>
              <CardDescription>
                Informationen zur MwSt.-Abrechnung für die Schweiz
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-3">
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Abrechnungsperiode</div>
                  <div className="font-medium">Q1 2025</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">Fälligkeit</div>
                  <div className="font-medium">30. April 2025</div>
                </div>
                <div className="p-4 rounded-lg bg-muted">
                  <div className="text-sm text-muted-foreground">MwSt.-Nr.</div>
                  <div className="font-medium">CHE-123.456.789 MWST</div>
                </div>
              </div>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                MwSt.-Abrechnung exportieren
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Transactions Tab */}
        <TabsContent value="transactions" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Letzte Transaktionen
              </CardTitle>
              <CardDescription>
                Übersicht der letzten Zahlungseingänge
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Referenz</TableHead>
                    <TableHead>Datum</TableHead>
                    <TableHead>Typ</TableHead>
                    <TableHead>Kunde</TableHead>
                    <TableHead>Zahlungsart</TableHead>
                    <TableHead className="text-right">Betrag</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((trx) => (
                    <TableRow key={trx.id}>
                      <TableCell className="font-mono text-sm">{trx.id}</TableCell>
                      <TableCell>{new Date(trx.date).toLocaleDateString('de-CH')}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{trx.type}</Badge>
                      </TableCell>
                      <TableCell>{trx.customer}</TableCell>
                      <TableCell>{trx.method}</TableCell>
                      <TableCell className="text-right font-medium">
                        {formatCurrency(trx.amount)}
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            trx.status === 'completed' ? 'default' :
                            trx.status === 'pending' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {trx.status === 'completed' ? 'Abgeschlossen' :
                           trx.status === 'pending' ? 'Ausstehend' :
                           'Erstattet'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Export Tab */}
        <TabsContent value="export" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buchhaltungsexport</CardTitle>
              <CardDescription>
                Exportieren Sie Ihre Finanzdaten für die Buchhaltung
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="border-2 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Umsatzübersicht</CardTitle>
                    <CardDescription>
                      Tägliche/monatliche Umsätze nach Kategorie
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      CSV herunterladen
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">MwSt.-Bericht</CardTitle>
                    <CardDescription>
                      Detaillierte MwSt.-Aufstellung nach Sätzen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      CSV herunterladen
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Zahlungseingänge</CardTitle>
                    <CardDescription>
                      Alle Transaktionen mit Zahlungsart
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      CSV herunterladen
                    </Button>
                  </CardContent>
                </Card>

                <Card className="border-2 border-dashed">
                  <CardHeader>
                    <CardTitle className="text-lg">Rechnungen</CardTitle>
                    <CardDescription>
                      Alle ausgestellten Rechnungen
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full">
                      <Download className="mr-2 h-4 w-4" />
                      CSV herunterladen
                    </Button>
                  </CardContent>
                </Card>
              </div>

              <div className="p-4 rounded-lg bg-muted">
                <h4 className="font-medium mb-2">Hinweis zum Export</h4>
                <p className="text-sm text-muted-foreground">
                  Die exportierten CSV-Dateien sind kompatibel mit gängiger Buchhaltungssoftware
                  wie Bexio, Abacus und Run my Accounts. Die Spaltenstruktur entspricht den
                  Schweizer Buchhaltungsstandards.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
