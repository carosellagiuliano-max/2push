import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Camera, Scissors, Sparkles, Heart } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Galerie | SCHNITTWERK',
  description: 'Entdecken Sie unsere Arbeiten - Haarschnitte, Colorationen und Stylings aus unserem Salon in St. Gallen.',
}

// Mock gallery data - in production this would come from DB/Storage
const galleryCategories = [
  { id: 'all', name: 'Alle' },
  { id: 'schnitt', name: 'Schnitte' },
  { id: 'coloration', name: 'Colorationen' },
  { id: 'styling', name: 'Stylings' },
  { id: 'braut', name: 'Braut' },
]

const galleryItems = [
  { id: '1', category: 'coloration', icon: Sparkles, description: 'Balayage Blond' },
  { id: '2', category: 'schnitt', icon: Scissors, description: 'Bob Schnitt' },
  { id: '3', category: 'coloration', icon: Sparkles, description: 'Kupfer Highlights' },
  { id: '4', category: 'styling', icon: Heart, description: 'Locken Styling' },
  { id: '5', category: 'braut', icon: Heart, description: 'Brautfrisur' },
  { id: '6', category: 'schnitt', icon: Scissors, description: 'Pixie Cut' },
  { id: '7', category: 'coloration', icon: Sparkles, description: 'Ombré Braun' },
  { id: '8', category: 'styling', icon: Heart, description: 'Hochsteckfrisur' },
  { id: '9', category: 'schnitt', icon: Scissors, description: 'Herrenschnitt Modern' },
  { id: '10', category: 'braut', icon: Heart, description: 'Romantische Wellen' },
  { id: '11', category: 'coloration', icon: Sparkles, description: 'Platinblond' },
  { id: '12', category: 'schnitt', icon: Scissors, description: 'Long Bob' },
]

export default function GaleriePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-salon-cream via-white to-brand-50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-brand-600 font-medium tracking-wide uppercase text-sm mb-3">
              Galerie
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-salon-charcoal sm:text-5xl mb-6">
              Unsere Arbeiten
            </h1>
            <p className="text-lg text-salon-charcoal/70">
              Lassen Sie sich von unseren Kreationen inspirieren. Jedes Bild
              erzählt eine Geschichte von Transformation und Schönheit.
            </p>
          </div>
        </div>
      </section>

      {/* Filter Tabs */}
      <section className="py-8 bg-white border-b sticky top-16 z-40">
        <div className="container-wide">
          <div className="flex flex-wrap gap-2 justify-center">
            {galleryCategories.map((category) => (
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

      {/* Gallery Grid */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide">
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {galleryItems.map((item) => {
              const Icon = item.icon
              return (
                <div
                  key={item.id}
                  className="group relative aspect-[3/4] rounded-xl overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 cursor-pointer"
                >
                  {/* Placeholder for actual image */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center text-brand-600/60">
                      <Icon className="h-12 w-12 mx-auto mb-2" />
                      <p className="text-xs">{item.description}</p>
                    </div>
                  </div>

                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="absolute bottom-0 left-0 right-0 p-6">
                      <p className="text-white font-medium">{item.description}</p>
                      <Badge variant="secondary" className="mt-2 bg-white/20 text-white">
                        {galleryCategories.find((c) => c.id === item.category)?.name}
                      </Badge>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          {/* Placeholder Message */}
          <div className="mt-16 text-center p-8 bg-salon-cream/50 rounded-xl">
            <Camera className="h-12 w-12 text-brand-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-salon-charcoal mb-2">
              Galerie wird bald erweitert
            </h3>
            <p className="text-salon-charcoal/70 max-w-md mx-auto">
              Wir arbeiten daran, diese Galerie mit echten Bildern unserer
              Arbeiten zu füllen. Folgen Sie uns auf Instagram für aktuelle
              Inspirationen!
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <a
                href="https://instagram.com/schnittwerk"
                target="_blank"
                rel="noopener noreferrer"
              >
                @schnittwerk auf Instagram
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Instagram Feed Placeholder */}
      <section className="py-16 lg:py-24 bg-salon-cream/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl mb-4">
              Folgen Sie uns auf Instagram
            </h2>
            <p className="text-salon-charcoal/70">
              Bleiben Sie auf dem Laufenden mit unseren neuesten Kreationen
            </p>
          </div>

          <div className="grid gap-4 grid-cols-2 md:grid-cols-4 lg:grid-cols-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="aspect-square rounded-lg bg-gradient-to-br from-brand-100/50 to-brand-200/50 flex items-center justify-center"
              >
                <Camera className="h-8 w-8 text-brand-400/40" />
              </div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button asChild>
              <a
                href="https://instagram.com/schnittwerk"
                target="_blank"
                rel="noopener noreferrer"
              >
                Mehr auf Instagram
                <ArrowRight className="ml-2 h-4 w-4" />
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide text-center">
          <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl mb-4">
            Bereit für Ihre Transformation?
          </h2>
          <p className="text-salon-charcoal/70 max-w-xl mx-auto mb-8">
            Lassen Sie sich von unseren Stylisten beraten und finden Sie
            Ihren perfekten Look.
          </p>
          <Button size="lg" asChild>
            <Link href="/booking">
              Jetzt Termin buchen
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  )
}
