'use client'

import Link from 'next/link'
import { ShoppingBag, Package } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useToast } from '@/components/ui/use-toast'
import { useCart } from '../hooks/use-cart'
import type { Product } from '../types'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  const { addItem, setIsOpen } = useCart()
  const { toast } = useToast()

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  const isOutOfStock = product.stock_quantity <= 0
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3

  function handleAddToCart() {
    if (isOutOfStock) return

    addItem(product)
    toast({
      title: 'Zum Warenkorb hinzugefügt',
      description: `${product.name} wurde zum Warenkorb hinzugefügt.`,
      variant: 'success',
    })
    setIsOpen(true)
  }

  return (
    <Card className="group overflow-hidden flex flex-col">
      {/* Product Image */}
      <Link href={`/shop/${product.slug}`} className="block">
        <div className="relative aspect-square bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center overflow-hidden">
          <Package className="h-20 w-20 text-brand-300 transition-transform group-hover:scale-110" />
          {isOnSale && (
            <Badge className="absolute top-4 left-4 bg-red-500">
              Sale
            </Badge>
          )}
          {isLowStock && !isOutOfStock && (
            <Badge className="absolute top-4 right-4 bg-orange-500">
              Nur noch {product.stock_quantity}
            </Badge>
          )}
          {isOutOfStock && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="secondary" className="text-lg py-2 px-4">
                Ausverkauft
              </Badge>
            </div>
          )}
        </div>
      </Link>

      <CardContent className="p-6 flex-1">
        {product.brand && (
          <p className="text-sm text-brand-600 font-medium mb-1">
            {product.brand}
          </p>
        )}
        <Link href={`/shop/${product.slug}`}>
          <h3 className="text-lg font-semibold text-salon-charcoal mb-2 hover:text-brand-600 transition-colors">
            {product.name}
          </h3>
        </Link>
        {product.description && (
          <p className="text-sm text-salon-charcoal/70 line-clamp-2 mb-4">
            {product.description}
          </p>
        )}
        <div className="flex items-center gap-2">
          <p className="text-xl font-bold text-brand-600">
            CHF {product.price.toFixed(2)}
          </p>
          {isOnSale && (
            <p className="text-sm text-muted-foreground line-through">
              CHF {product.compare_at_price?.toFixed(2)}
            </p>
          )}
        </div>
      </CardContent>

      <CardFooter className="p-6 pt-0">
        <Button
          className="w-full"
          onClick={handleAddToCart}
          disabled={isOutOfStock}
        >
          <ShoppingBag className="mr-2 h-4 w-4" />
          {isOutOfStock ? 'Ausverkauft' : 'In den Warenkorb'}
        </Button>
      </CardFooter>
    </Card>
  )
}
