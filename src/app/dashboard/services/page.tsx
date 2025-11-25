import type { Metadata } from 'next'
import { Plus, Pencil, Trash2, Clock, Banknote } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export const metadata: Metadata = {
  title: 'Dienstleistungen | SCHNITTWERK Admin',
  description: 'Verwalten Sie Ihre Dienstleistungen.',
}

// Mock data - in production this would come from DB
const services = [
  {
    id: '1',
    name: 'Herrenhaarschnitt',
    category: 'Schnitt',
    duration: 30,
    price: 45,
    isActive: true,
  },
  {
    id: '2',
    name: 'Damenhaarschnitt',
    category: 'Schnitt',
    duration: 60,
    price: 85,
    isActive: true,
  },
  {
    id: '3',
    name: 'Waschen & Föhnen',
    category: 'Styling',
    duration: 30,
    price: 35,
    isActive: true,
  },
  {
    id: '4',
    name: 'Coloration',
    category: 'Farbe',
    duration: 90,
    price: 120,
    isActive: true,
  },
  {
    id: '5',
    name: 'Strähnen',
    category: 'Farbe',
    duration: 120,
    price: 150,
    isActive: true,
  },
  {
    id: '6',
    name: 'Bartschnitt',
    category: 'Bart',
    duration: 20,
    price: 25,
    isActive: true,
  },
  {
    id: '7',
    name: 'Haarpflege-Behandlung',
    category: 'Pflege',
    duration: 45,
    price: 55,
    isActive: false,
  },
]

const categories = [
  { id: 'schnitt', name: 'Schnitt', count: 2 },
  { id: 'styling', name: 'Styling', count: 1 },
  { id: 'farbe', name: 'Farbe', count: 2 },
  { id: 'bart', name: 'Bart', count: 1 },
  { id: 'pflege', name: 'Pflege', count: 1 },
]

export default function ServicesPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Dienstleistungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Dienstleistungen und Preise
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neue Dienstleistung
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktiv
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.filter((s) => s.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kategorien
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{categories.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ø Preis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {Math.round(services.reduce((a, b) => a + b.price, 0) / services.length)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Categories */}
      <Card>
        <CardHeader>
          <CardTitle>Kategorien</CardTitle>
          <CardDescription>Verwalten Sie Ihre Service-Kategorien</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <Badge key={cat.id} variant="secondary" className="text-sm py-1 px-3">
                {cat.name} ({cat.count})
              </Badge>
            ))}
            <Button variant="outline" size="sm">
              <Plus className="mr-1 h-3 w-3" />
              Kategorie hinzufügen
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>Alle Dienstleistungen</CardTitle>
          <CardDescription>
            Liste aller verfügbaren Dienstleistungen
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    Dauer
                  </div>
                </TableHead>
                <TableHead>
                  <div className="flex items-center gap-1">
                    <Banknote className="h-4 w-4" />
                    Preis
                  </div>
                </TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service.id}>
                  <TableCell className="font-medium">{service.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{service.category}</Badge>
                  </TableCell>
                  <TableCell>{service.duration} Min.</TableCell>
                  <TableCell>CHF {service.price.toFixed(2)}</TableCell>
                  <TableCell>
                    <Badge variant={service.isActive ? 'default' : 'secondary'}>
                      {service.isActive ? 'Aktiv' : 'Inaktiv'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
