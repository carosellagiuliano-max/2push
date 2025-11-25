import type { Metadata } from 'next'
import { Plus, Pencil, Trash2, Package, AlertTriangle, TrendingDown } from 'lucide-react'

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

export const metadata: Metadata = {
  title: 'Produkte | SCHNITTWERK Admin',
  description: 'Verwalten Sie Ihre Produkte und Lagerbestand.',
}

// Mock data - in production this would come from DB
const products = [
  {
    id: '1',
    name: 'Repair Shampoo',
    brand: 'Kérastase',
    category: 'Pflege',
    sku: 'KER-REP-001',
    price: 32,
    costPrice: 18,
    stock: 15,
    minStock: 5,
    isActive: true,
  },
  {
    id: '2',
    name: 'Haaröl Luxe',
    brand: 'Olaplex',
    category: 'Pflege',
    sku: 'OLA-OIL-001',
    price: 45,
    costPrice: 25,
    stock: 8,
    minStock: 5,
    isActive: true,
  },
  {
    id: '3',
    name: 'Styling Paste',
    brand: 'Kevin Murphy',
    category: 'Styling',
    sku: 'KM-PASTE-001',
    price: 38,
    costPrice: 20,
    stock: 3,
    minStock: 5,
    isActive: true,
  },
  {
    id: '4',
    name: 'Color Protect Spray',
    brand: 'Aveda',
    category: 'Farbe',
    sku: 'AVE-COL-001',
    price: 28,
    costPrice: 15,
    stock: 20,
    minStock: 8,
    isActive: true,
  },
  {
    id: '5',
    name: 'Deep Conditioner',
    brand: 'Kérastase',
    category: 'Pflege',
    sku: 'KER-COND-001',
    price: 42,
    costPrice: 22,
    stock: 0,
    minStock: 5,
    isActive: true,
  },
  {
    id: '6',
    name: 'Volume Mousse',
    brand: 'Kevin Murphy',
    category: 'Styling',
    sku: 'KM-MOUSSE-001',
    price: 29,
    costPrice: 15,
    stock: 18,
    minStock: 8,
    isActive: true,
  },
]

export default function ProductsPage() {
  const totalValue = products.reduce((a, b) => a + b.price * b.stock, 0)
  const lowStockProducts = products.filter((p) => p.stock <= p.minStock && p.stock > 0)
  const outOfStockProducts = products.filter((p) => p.stock === 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Produkte</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Produkte und Lagerbestand
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Neues Produkt
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Produkte
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lagerwert
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              CHF {totalValue.toLocaleString()}
            </div>
          </CardContent>
        </Card>
        <Card className={lowStockProducts.length > 0 ? 'border-orange-500' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Niedriger Bestand
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {lowStockProducts.length}
            </div>
          </CardContent>
        </Card>
        <Card className={outOfStockProducts.length > 0 ? 'border-red-500' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Ausverkauft
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {outOfStockProducts.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerts */}
      {(lowStockProducts.length > 0 || outOfStockProducts.length > 0) && (
        <Card className="border-orange-200 bg-orange-50">
          <CardHeader>
            <CardTitle className="text-orange-800 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Lagerbestand-Warnungen
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {outOfStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ml-2">({p.brand})</span>
                </div>
                <Badge variant="destructive">Ausverkauft</Badge>
              </div>
            ))}
            {lowStockProducts.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b last:border-0">
                <div>
                  <span className="font-medium">{p.name}</span>
                  <span className="text-muted-foreground ml-2">({p.brand})</span>
                </div>
                <Badge variant="outline" className="text-orange-600 border-orange-600">
                  Nur noch {p.stock}
                </Badge>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Products Table */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Alle Produkte</CardTitle>
              <CardDescription>
                Übersicht aller Produkte im Inventar
              </CardDescription>
            </div>
            <Input placeholder="Suchen..." className="max-w-xs" />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produkt</TableHead>
                <TableHead>SKU</TableHead>
                <TableHead>Kategorie</TableHead>
                <TableHead className="text-right">EK</TableHead>
                <TableHead className="text-right">VK</TableHead>
                <TableHead className="text-right">Bestand</TableHead>
                <TableHead className="text-right">Aktionen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const isLowStock = product.stock <= product.minStock && product.stock > 0
                const isOutOfStock = product.stock === 0

                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{product.name}</div>
                        <div className="text-sm text-muted-foreground">{product.brand}</div>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{product.sku}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{product.category}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      CHF {product.costPrice.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      CHF {product.price.toFixed(2)}
                    </TableCell>
                    <TableCell className="text-right">
                      {isOutOfStock ? (
                        <Badge variant="destructive">0</Badge>
                      ) : isLowStock ? (
                        <Badge variant="outline" className="text-orange-600 border-orange-600">
                          {product.stock}
                        </Badge>
                      ) : (
                        <span>{product.stock}</span>
                      )}
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
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
