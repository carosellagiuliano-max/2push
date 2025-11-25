import type { Metadata } from 'next'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import { Package, ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getCustomerOrders } from '@/features/customer'

export const metadata: Metadata = {
  title: 'Meine Bestellungen | SCHNITTWERK',
  description: 'Verwalten Sie Ihre Bestellungen bei SCHNITTWERK.',
}

const statusLabels: Record<string, string> = {
  pending: 'Ausstehend',
  confirmed: 'Bestätigt',
  processing: 'In Bearbeitung',
  shipped: 'Versendet',
  delivered: 'Geliefert',
  cancelled: 'Storniert',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  pending: 'secondary',
  confirmed: 'default',
  processing: 'default',
  shipped: 'default',
  delivered: 'outline',
  cancelled: 'destructive',
}

export default async function CustomerOrdersPage() {
  const orders = await getCustomerOrders()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Meine Bestellungen</h1>
        <p className="text-muted-foreground mt-1">
          Ihre Bestellhistorie
        </p>
      </div>

      {orders.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ShoppingBag className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">Keine Bestellungen</h3>
            <p className="text-muted-foreground text-center mb-4">
              Sie haben noch keine Bestellungen aufgegeben.
            </p>
            <Button asChild>
              <Link href="/shop">Zum Shop</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id}>
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">
                      Bestellung {order.order_number}
                    </CardTitle>
                    <CardDescription>
                      {format(new Date(order.created_at), 'd. MMMM yyyy', { locale: de })}
                    </CardDescription>
                  </div>
                  <Badge variant={statusVariants[order.status] || 'outline'}>
                    {statusLabels[order.status] || order.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {/* Order Items */}
                  <div className="space-y-2">
                    {order.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 rounded bg-muted flex items-center justify-center">
                          <Package className="h-5 w-5 text-muted-foreground/50" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium">{item.product_name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item.quantity}x CHF {item.unit_price.toFixed(2)}
                          </p>
                        </div>
                        <p className="text-sm font-medium">
                          CHF {item.total_price.toFixed(2)}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Order Summary */}
                  <div className="flex justify-between pt-4 border-t">
                    <div>
                      <p className="text-sm text-muted-foreground">
                        {order.items.length} {order.items.length === 1 ? 'Artikel' : 'Artikel'}
                      </p>
                    </div>
                    <div className="text-right">
                      {order.discount > 0 && (
                        <p className="text-sm text-green-600">
                          Rabatt: -CHF {order.discount.toFixed(2)}
                        </p>
                      )}
                      <p className="font-semibold">
                        Gesamt: CHF {order.total.toFixed(2)}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
