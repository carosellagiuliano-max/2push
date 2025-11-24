import Link from 'next/link'
import { ArrowRight, Scissors, Sparkles, Heart, Clock, MapPin, Star } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

// Mock data - in production this would come from DB
const featuredServices = [
  {
    id: '1',
    name: 'Schnitt & Styling',
    description: 'Professioneller Haarschnitt mit Beratung und Styling',
    price: 'ab CHF 65',
    icon: Scissors,
  },
  {
    id: '2',
    name: 'Coloration',
    description: 'Natürliche Farben oder auffällige Highlights',
    price: 'ab CHF 85',
    icon: Sparkles,
  },
  {
    id: '3',
    name: 'Pflege-Treatments',
    description: 'Intensive Haarpflege für gesundes, glänzendes Haar',
    price: 'ab CHF 45',
    icon: Heart,
  },
]

const testimonials = [
  {
    id: '1',
    name: 'Sarah M.',
    text: 'Endlich ein Salon, der wirklich auf meine Wünsche eingeht. Das Ergebnis war perfekt!',
    rating: 5,
  },
  {
    id: '2',
    name: 'Michael K.',
    text: 'Professionelle Beratung und tolle Atmosphäre. Ich komme immer wieder gerne.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Lisa B.',
    text: 'Die beste Coloristin in St. Gallen! Meine Haare sehen fantastisch aus.',
    rating: 5,
  },
]

export default function HomePage() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center bg-gradient-to-br from-salon-cream via-white to-brand-50">
        <div className="absolute inset-0 bg-[url('/images/hero-pattern.svg')] opacity-5" />
        <div className="container-wide relative py-20 lg:py-32">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <div className="space-y-4">
                <p className="text-brand-600 font-medium tracking-wide uppercase text-sm">
                  Willkommen bei SCHNITTWERK
                </p>
                <h1 className="text-4xl font-bold tracking-tight text-salon-charcoal sm:text-5xl lg:text-6xl">
                  Wo Stil auf{' '}
                  <span className="text-brand-600">Perfektion</span> trifft
                </h1>
                <p className="text-lg text-salon-charcoal/70 max-w-xl">
                  Erleben Sie erstklassige Haarpflege in entspannter Atmosphäre.
                  Unser erfahrenes Team verwandelt Ihre Haarträume in Realität.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild className="text-base">
                  <Link href="/booking">
                    Termin buchen
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild className="text-base">
                  <Link href="/leistungen">Unsere Leistungen</Link>
                </Button>
              </div>

              {/* Quick Info Cards */}
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/80 shadow-sm">
                  <div className="p-2 rounded-full bg-brand-100">
                    <Clock className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-salon-charcoal">Öffnungszeiten</p>
                    <p className="text-salon-charcoal/60">Di-Fr 9-18, Sa 8-14</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-white/80 shadow-sm">
                  <div className="p-2 rounded-full bg-brand-100">
                    <MapPin className="h-5 w-5 text-brand-600" />
                  </div>
                  <div className="text-sm">
                    <p className="font-medium text-salon-charcoal">Standort</p>
                    <p className="text-salon-charcoal/60">St. Gallen</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Hero Image Placeholder */}
            <div className="relative aspect-[4/5] lg:aspect-[3/4] rounded-2xl overflow-hidden bg-gradient-to-br from-brand-200 to-brand-400 shadow-2xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-white/80">
                  <Scissors className="h-24 w-24 mx-auto mb-4 opacity-50" />
                  <p className="text-sm">Hero Image</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Services Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-brand-600 font-medium tracking-wide uppercase text-sm mb-3">
              Unsere Expertise
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-salon-charcoal sm:text-4xl mb-4">
              Entdecken Sie unsere Leistungen
            </h2>
            <p className="text-salon-charcoal/70">
              Von klassischen Schnitten bis hin zu trendigen Colorationen –
              wir bieten Ihnen das volle Spektrum moderner Haarpflege.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {featuredServices.map((service) => {
              const Icon = service.icon
              return (
                <Card key={service.id} className="group hover:shadow-lg transition-shadow">
                  <CardContent className="p-8">
                    <div className="mb-6 inline-flex p-4 rounded-xl bg-brand-50 text-brand-600 group-hover:bg-brand-100 transition-colors">
                      <Icon className="h-8 w-8" />
                    </div>
                    <h3 className="text-xl font-semibold text-salon-charcoal mb-2">
                      {service.name}
                    </h3>
                    <p className="text-salon-charcoal/70 mb-4">
                      {service.description}
                    </p>
                    <p className="text-brand-600 font-semibold">{service.price}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" asChild>
              <Link href="/leistungen">
                Alle Leistungen ansehen
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 lg:py-28 bg-salon-cream/30">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Image Placeholder */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 shadow-xl order-2 lg:order-1">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-brand-600/60">
                  <Heart className="h-20 w-20 mx-auto mb-4" />
                  <p className="text-sm">Salon Image</p>
                </div>
              </div>
            </div>

            <div className="space-y-6 order-1 lg:order-2">
              <div>
                <p className="text-brand-600 font-medium tracking-wide uppercase text-sm mb-3">
                  Über uns
                </p>
                <h2 className="text-3xl font-bold tracking-tight text-salon-charcoal sm:text-4xl mb-4">
                  SCHNITTWERK by Vanessa Carosella
                </h2>
              </div>
              <p className="text-lg text-salon-charcoal/70">
                Mit über 15 Jahren Erfahrung in der Hairstyling-Branche habe ich
                meinen Traum verwirklicht: Ein Salon, der Qualität, Entspannung
                und individuelle Beratung vereint.
              </p>
              <p className="text-salon-charcoal/70">
                Bei SCHNITTWERK steht jeder Kunde im Mittelpunkt. Wir nehmen uns
                Zeit für eine ausführliche Beratung und setzen Ihre Wünsche mit
                höchster Präzision und den besten Produkten um.
              </p>
              <Button asChild>
                <Link href="/ueber-uns">
                  Mehr erfahren
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 lg:py-28 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <p className="text-brand-600 font-medium tracking-wide uppercase text-sm mb-3">
              Kundenstimmen
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-salon-charcoal sm:text-4xl">
              Was unsere Kunden sagen
            </h2>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.id} className="bg-salon-cream/30">
                <CardContent className="p-8">
                  <div className="flex gap-1 mb-4">
                    {Array.from({ length: testimonial.rating }).map((_, i) => (
                      <Star key={i} className="h-5 w-5 fill-brand-500 text-brand-500" />
                    ))}
                  </div>
                  <p className="text-salon-charcoal/80 mb-6 italic">
                    &ldquo;{testimonial.text}&rdquo;
                  </p>
                  <p className="font-semibold text-salon-charcoal">
                    {testimonial.name}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 lg:py-28 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Bereit für Ihren neuen Look?
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Buchen Sie jetzt Ihren Termin und lassen Sie sich von unserem Team verwöhnen.
          </p>
          <Button size="lg" variant="secondary" asChild className="text-base">
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
