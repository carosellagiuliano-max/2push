import type { Metadata } from 'next'
import Link from 'next/link'
import {
  Search,
  Filter,
  Download,
  Eye,
  Truck,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  MoreHorizontal,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

export const metadata: Metadata = {
  title: 'Bestellungen | SCHNITTWERK Admin',
  description: 'Verwalten Sie Shop-Bestellungen und Versand.',
}

// Mock data - in production this would come from DB
const orders = [
  {
    id: 'order-1',
    orderNumber: 'SW-2025-0001',
    customer: { name: 'Anna Meier', email: 'anna@example.com' },
    items: [
      { name: 'Repair Shampoo', quantity: 1, price: 32 },
      { name: 'Haaröl Luxe', quantity: 1, price: 45 },
    ],
    subtotal: 77,
    shipping: 0,
    total: 77,
    status: 'delivered',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    shippingMethod: 'Abholung im Salon',
    createdAt: '2025-01-15T10:30:00Z',
  },
  {
    id: 'order-2',
    orderNumber: 'SW-2025-0002',
    customer: { name: 'Peter Müller', email: 'peter@example.com' },
    items: [
      { name: 'Styling Paste', quantity: 2, price: 38 },
    ],
    subtotal: 76,
    shipping: 9,
    total: 85,
    status: 'shipped',
    paymentStatus: 'paid',
    paymentMethod: 'twint',
    shippingMethod: 'A-Post',
    createdAt: '2025-01-14T14:22:00Z',
  },
  {
    id: 'order-3',
    orderNumber: 'SW-2025-0003',
    customer: { name: 'Lisa Weber', email: 'lisa@example.com' },
    items: [
      { name: 'Color Protect Spray', quantity: 1, price: 28 },
      { name: 'Deep Conditioner', quantity: 1, price: 42 },
      { name: 'Volume Mousse', quantity: 1, price: 29 },
    ],
    subtotal: 99,
    shipping: 0,
    total: 99,
    status: 'processing',
    paymentStatus: 'paid',
    paymentMethod: 'card',
    shippingMethod: 'Abholung im Salon',
    createdAt: '2025-01-14T09:15:00Z',
  },
  {
    id: 'order-4',
    orderNumber: 'SW-2025-0004',
    customer: { name: 'Max Schmidt', email: 'max@example.com' },
    items: [
      { name: 'Repair Shampoo', quantity: 2, price: 32 },
    ],
    subtotal: 64,
    shipping: 9,
    total: 73,
    status: 'pending',
    paymentStatus: 'pending',
    paymentMethod: 'invoice',
    shippingMethod: 'A-Post',
    createdAt: '2025-01-13T16:45:00Z',
  },
  {
    id: 'order-5',
    orderNumber: 'SW-2025-0005',
    customer: { name: 'Sarah Keller', email: 'sarah@example.com' },
    items: [
      { name: 'Haaröl Luxe', quantity: 1, price: 45 },
    ],
    subtotal: 45,
    shipping: 9,
    total: 54,
    status: 'cancelled',
    paymentStatus: 'refunded',
    paymentMethod: 'card',
    shippingMethod: 'A-Post',
    createdAt: '2025-01-12T11:30:00Z',
  },
]

const stats = {
  total: orders.length,
  pending: orders.filter((o) => o.status === 'pending').length,
  processing: orders.filter((o) => o.status === 'processing').length,
  shipped: orders.filter((o) => o.status === 'shipped').length,
  delivered: orders.filter((o) => o.status === 'delivered').length,
  cancelled: orders.filter((o) => o.status === 'cancelled').length,
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline'; icon: typeof Clock }> = {
  pending: { label: 'Ausstehend', variant: 'secondary', icon: Clock },
  processing: { label: 'In Bearbeitung', variant: 'outline', icon: Package },
  shipped: { label: 'Versendet', variant: 'default', icon: Truck },
  delivered: { label: 'Zugestellt', variant: 'default', icon: CheckCircle },
  cancelled: { label: 'Storniert', variant: 'destructive', icon: XCircle },
}

const paymentStatusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
  pending: { label: 'Ausstehend', variant: 'secondary' },
  paid: { label: 'Bezahlt', variant: 'default' },
  refunded: { label: 'Erstattet', variant: 'destructive' },
}

export default function OrdersPage() {
  const formatCurrency = (value: number) => `CHF ${value.toFixed(2)}`
  const formatDate = (date: string) => new Date(date).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Bestellungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Shop-Bestellungen und Versand
          </p>
        </div>
        <Button variant="outline">
          <Download className="mr-2 h-4 w-4" />
          Export
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className={stats.pending > 0 ? 'border-orange-500' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Ausstehend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Package className="h-4 w-4" />
              In Bearbeitung
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Truck className="h-4 w-4" />
              Versendet
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.shipped}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Zugestellt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.delivered}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Storniert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelled}</div>
          </CardContent>
        </Card>
      </div>

      {/* Orders Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alle Bestellungen</CardTitle>
              <CardDescription>
                Übersicht aller Shop-Bestellungen
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input placeholder="Suchen..." className="pl-9 w-64" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Alle Status</SelectItem>
                  <SelectItem value="pending">Ausstehend</SelectItem>
                  <SelectItem value="processing">In Bearbeitung</SelectItem>
                  <SelectItem value="shipped">Versendet</SelectItem>
                  <SelectItem value="delivered">Zugestellt</SelectItem>
                  <SelectItem value="cancelled">Storniert</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bestellung</TableHead>
                <TableHead>Kunde</TableHead>
                <TableHead>Artikel</TableHead>
                <TableHead className="text-right">Betrag</TableHead>
                <TableHead>Zahlung</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const status = statusConfig[order.status]
                const paymentStatus = paymentStatusConfig[order.paymentStatus]
                const StatusIcon = status.icon

                return (
                  <TableRow key={order.id}>
                    <TableCell>
                      <div className="font-mono text-sm font-medium">
                        {order.orderNumber}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <div className="font-medium">{order.customer.name}</div>
                        <div className="text-sm text-muted-foreground">{order.customer.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm">
                        {order.items.length} Artikel
                        <div className="text-muted-foreground">
                          {order.items.map((item) => item.name).join(', ').slice(0, 30)}
                          {order.items.map((item) => item.name).join(', ').length > 30 ? '...' : ''}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(order.total)}
                    </TableCell>
                    <TableCell>
                      <Badge variant={paymentStatus.variant}>
                        {paymentStatus.label}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.variant} className="gap-1">
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Eye className="mr-2 h-4 w-4" />
                            Details anzeigen
                          </DropdownMenuItem>
                          {order.status === 'processing' && (
                            <DropdownMenuItem>
                              <Truck className="mr-2 h-4 w-4" />
                              Als versendet markieren
                            </DropdownMenuItem>
                          )}
                          {order.status === 'shipped' && (
                            <DropdownMenuItem>
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Als zugestellt markieren
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuSeparator />
                          {order.paymentStatus === 'paid' && order.status !== 'cancelled' && (
                            <DropdownMenuItem className="text-destructive">
                              <RefreshCw className="mr-2 h-4 w-4" />
                              Erstattung veranlassen
                            </DropdownMenuItem>
                          )}
                          {order.status === 'pending' && (
                            <DropdownMenuItem className="text-destructive">
                              <XCircle className="mr-2 h-4 w-4" />
                              Stornieren
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
