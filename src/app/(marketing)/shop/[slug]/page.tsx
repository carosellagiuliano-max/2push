import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Package, Truck, Shield, RotateCcw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { getProductBySlug, getFeaturedProducts } from '@/features/shop'
import { AddToCartButton } from './add-to-cart-button'
import { ProductGrid } from '../product-grid'

interface ProductPageProps {
  params: { slug: string }
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    return {
      title: 'Produkt nicht gefunden | SCHNITTWERK',
    }
  }

  return {
    title: `${product.name} | SCHNITTWERK Shop`,
    description: product.description || `${product.name} von ${product.brand}`,
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const product = await getProductBySlug(params.slug)

  if (!product) {
    notFound()
  }

  const relatedProducts = await getFeaturedProducts(4)
  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 3)

  const isOnSale = product.compare_at_price && product.compare_at_price > product.price
  const isOutOfStock = product.stock_quantity <= 0
  const isLowStock = product.stock_quantity > 0 && product.stock_quantity <= 3

  return (
    <>
      {/* Breadcrumb */}
      <div className="bg-white border-b">
        <div className="container-wide py-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Shop
            </Link>
          </Button>
        </div>
      </div>

      {/* Product Detail */}
      <section className="py-12 lg:py-16 bg-white">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-2">
            {/* Product Image */}
            <div className="relative aspect-square bg-gradient-to-br from-brand-50 to-brand-100 rounded-2xl flex items-center justify-center overflow-hidden">
              <Package className="h-32 w-32 text-brand-300" />
              {isOnSale && (
                <Badge className="absolute top-6 left-6 bg-red-500 text-lg px-4 py-1">
                  Sale
                </Badge>
              )}
              {isOutOfStock && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="secondary" className="text-xl py-3 px-6">
                    Ausverkauft
                  </Badge>
                </div>
              )}
            </div>

            {/* Product Info */}
            <div className="flex flex-col">
              {product.brand && (
                <p className="text-brand-600 font-medium mb-2">{product.brand}</p>
              )}
              <h1 className="text-3xl lg:text-4xl font-bold text-salon-charcoal mb-4">
                {product.name}
              </h1>

              {/* Price */}
              <div className="flex items-baseline gap-3 mb-6">
                <span className="text-3xl font-bold text-brand-600">
                  CHF {product.price.toFixed(2)}
                </span>
                {isOnSale && (
                  <span className="text-xl text-muted-foreground line-through">
                    CHF {product.compare_at_price?.toFixed(2)}
                  </span>
                )}
              </div>

              {/* Stock Status */}
              {isLowStock && !isOutOfStock && (
                <Badge variant="outline" className="mb-4 w-fit text-orange-600 border-orange-300">
                  Nur noch {product.stock_quantity} auf Lager
                </Badge>
              )}

              {/* Description */}
              <p className="text-salon-charcoal/70 mb-8 text-lg leading-relaxed">
                {product.description}
              </p>

              {/* Add to Cart */}
              <AddToCartButton product={product} />

              <Separator className="my-8" />

              {/* Benefits */}
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex items-start gap-3">
                  <Truck className="h-5 w-5 text-brand-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Gratis Versand</p>
                    <p className="text-xs text-muted-foreground">Ab CHF 50</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="h-5 w-5 text-brand-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">Originalprodukte</p>
                    <p className="text-xs text-muted-foreground">100% authentisch</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <RotateCcw className="h-5 w-5 text-brand-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">14 Tage Rückgabe</p>
                    <p className="text-xs text-muted-foreground">Einfache Retoure</p>
                  </div>
                </div>
              </div>

              {/* SKU */}
              {product.sku && (
                <p className="text-xs text-muted-foreground mt-8">
                  Artikelnummer: {product.sku}
                </p>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Related Products */}
      {filteredRelated.length > 0 && (
        <section className="py-16 bg-salon-cream/30">
          <div className="container-wide">
            <h2 className="text-2xl font-bold text-salon-charcoal mb-8">
              Das könnte Ihnen auch gefallen
            </h2>
            <ProductGrid products={filteredRelated} />
          </div>
        </section>
      )}
    </>
  )
}
