import type { Metadata } from 'next'
import Link from 'next/link'
import { Suspense } from 'react'
import { ArrowRight, Star, Sparkles, Leaf } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Spinner } from '@/components/ui/spinner'
import { getProducts, getProductCategories } from '@/features/shop'
import { ProductGrid } from './product-grid'
import { CategoryFilter } from './category-filter'

export const metadata: Metadata = {
  title: 'Shop | SCHNITTWERK',
  description: 'Entdecken Sie unsere Auswahl an Premium-Haarpflegeprodukten. Professionelle Produkte für Ihr Haar.',
}

interface ShopPageProps {
  searchParams: { category?: string; search?: string }
}

async function ProductsContent({ category, search }: { category?: string; search?: string }) {
  const products = await getProducts({ category, search })
  return <ProductGrid products={products} />
}

export default async function ShopPage({ searchParams }: ShopPageProps) {
  const categories = await getProductCategories()
  const { category, search } = searchParams

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
      <CategoryFilter categories={categories} currentCategory={category} />

      {/* Products Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide">
          <Suspense fallback={<div className="flex justify-center py-12"><Spinner /></div>}>
            <ProductsContent category={category} search={search} />
          </Suspense>
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
