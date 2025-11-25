'use client'

import { Package } from 'lucide-react'
import { ProductCard } from '@/features/shop'
import type { Product } from '@/features/shop'

interface ProductGridProps {
  products: Product[]
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
        <h3 className="text-lg font-semibold mb-2">Keine Produkte gefunden</h3>
        <p className="text-muted-foreground">
          Versuchen Sie eine andere Kategorie oder Suche.
        </p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  )
}
