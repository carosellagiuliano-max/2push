import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, ShoppingBag, Sparkles, Droplet, Leaf, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Shop | SCHNITTWERK',
  description: 'Entdecken Sie unsere Auswahl an Premium-Haarpflegeprodukten. Professionelle Produkte für Ihr Haar.',
}

// Mock product data - in production this would come from DB
const productCategories = [
  { id: 'all', name: 'Alle' },
  { id: 'pflege', name: 'Haarpflege' },
  { id: 'styling', name: 'Styling' },
  { id: 'color', name: 'Colorschutz' },
  { id: 'zubehoer', name: 'Zubehör' },
]

const featuredProducts = [
  {
    id: '1',
    name: 'Repair Shampoo',
    brand: 'Kérastase',
    description: 'Intensiv reparierendes Shampoo für strapaziertes Haar',
    price: 32,
    category: 'pflege',
    icon: Droplet,
    badge: 'Bestseller',
  },
  {
    id: '2',
    name: 'Haaröl Luxe',
    brand: 'Olaplex',
    description: 'Pflegendes Haaröl für Glanz und Geschmeidigkeit',
    price: 45,
    category: 'pflege',
    icon: Sparkles,
  },
  {
    id: '3',
    name: 'Styling Paste',
    brand: 'Kevin Murphy',
    description: 'Flexible Styling-Paste mit mattem Finish',
    price: 38,
    category: 'styling',
    icon: Leaf,
    badge: 'Neu',
  },
  {
    id: '4',
    name: 'Color Protect Spray',
    brand: 'Aveda',
    description: 'Schützt coloriertes Haar vor dem Ausbleichen',
    price: 28,
    category: 'color',
    icon: Sparkles,
  },
  {
    id: '5',
    name: 'Deep Conditioner',
    brand: 'Kérastase',
    description: 'Tiefenpflege-Maske für intensives Repair',
    price: 42,
    category: 'pflege',
    icon: Droplet,
  },
  {
    id: '6',
    name: 'Volume Mousse',
    brand: 'Kevin Murphy',
    description: 'Leichter Schaum für voluminöses Styling',
    price: 29,
    category: 'styling',
    icon: Leaf,
  },
]

export default function ShopPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-salon-cream via-white to-brand-50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-brand-600 font-medium tracking-wide uppercase text-sm mb-3">
              Online Shop
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-salon-charcoal sm:text-5xl mb-6">
              Premium Haarpflege
            </h1>
            <p className="text-lg text-salon-charcoal/70">
              Entdecken Sie die gleichen hochwertigen Produkte, die wir auch im
              Salon verwenden. Professionelle Pflege für Zuhause.
            </p>
          </div>
        </div>
      </section>

      {/* Category Filter */}
      <section className="py-8 bg-white border-b sticky top-16 z-40">
        <div className="container-wide">
          <div className="flex flex-wrap gap-2 justify-center">
            {productCategories.map((category) => (
              <Badge
                key={category.id}
                variant={category.id === 'all' ? 'default' : 'outline'}
                className="cursor-pointer px-4 py-2 text-sm hover:bg-brand-50"
              >
                {category.name}
              </Badge>
            ))}
          </div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => {
              const Icon = product.icon
              return (
                <Card key={product.id} className="group overflow-hidden">
                  {/* Product Image Placeholder */}
                  <div className="relative aspect-square bg-gradient-to-br from-brand-50 to-brand-100 flex items-center justify-center">
                    <Icon className="h-20 w-20 text-brand-300" />
                    {product.badge && (
                      <Badge className="absolute top-4 left-4 bg-brand-600">
                        {product.badge}
                      </Badge>
                    )}
                  </div>

                  <CardContent className="p-6">
                    <p className="text-sm text-brand-600 font-medium mb-1">
                      {product.brand}
                    </p>
                    <h3 className="text-lg font-semibold text-salon-charcoal mb-2">
                      {product.name}
                    </h3>
                    <p className="text-sm text-salon-charcoal/70 mb-4">
                      {product.description}
                    </p>
                    <p className="text-xl font-bold text-brand-600">
                      CHF {product.price.toFixed(2)}
                    </p>
                  </CardContent>

                  <CardFooter className="p-6 pt-0">
                    <Button className="w-full" disabled>
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      In den Warenkorb
                    </Button>
                  </CardFooter>
                </Card>
              )
            })}
          </div>

          {/* Coming Soon Notice */}
          <div className="mt-16 text-center p-8 bg-brand-50 rounded-xl">
            <ShoppingBag className="h-12 w-12 text-brand-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-salon-charcoal mb-2">
              Online Shop in Vorbereitung
            </h3>
            <p className="text-salon-charcoal/70 max-w-md mx-auto mb-4">
              Unser Online Shop wird bald verfügbar sein. In der Zwischenzeit
              können Sie alle Produkte direkt bei uns im Salon kaufen.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/kontakt">
                  Produktberatung anfragen
                </Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/booking">
                  Salon besuchen
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 lg:py-24 bg-salon-cream/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl mb-4">
              Warum bei uns kaufen?
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 rounded-xl bg-brand-50 text-brand-600 mb-6">
                  <Star className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-salon-charcoal mb-2">
                  Fachberatung
                </h3>
                <p className="text-salon-charcoal/70">
                  Unsere Stylisten beraten Sie persönlich zu den richtigen
                  Produkten für Ihren Haartyp.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 rounded-xl bg-brand-50 text-brand-600 mb-6">
                  <Sparkles className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-salon-charcoal mb-2">
                  Profi-Qualität
                </h3>
                <p className="text-salon-charcoal/70">
                  Nur hochwertige Markenprodukte, die auch von Profis verwendet
                  werden.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 rounded-xl bg-brand-50 text-brand-600 mb-6">
                  <Leaf className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-salon-charcoal mb-2">
                  Nachhaltig
                </h3>
                <p className="text-salon-charcoal/70">
                  Wir achten auf umweltfreundliche Produkte und nachhaltige
                  Verpackungen.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide text-center">
          <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl mb-4">
            Persönliche Beratung gewünscht?
          </h2>
          <p className="text-salon-charcoal/70 max-w-xl mx-auto mb-8">
            Besuchen Sie uns im Salon für eine individuelle Produktberatung
            oder buchen Sie ein Behandlung mit Ihren neuen Lieblingsprodukten.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/booking">
                Termin buchen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/kontakt">Kontakt aufnehmen</Link>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
