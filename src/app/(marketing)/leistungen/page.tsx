import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Clock, Scissors, Sparkles, Droplet, Wind } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Leistungen | SCHNITTWERK',
  description: 'Entdecken Sie unsere Dienstleistungen: Schnitt, Coloration, Styling und Pflege. Professionelle Haarpflege in St. Gallen.',
}

// Mock data - in production this would come from DB
const serviceCategories = [
  {
    id: 'schnitt',
    name: 'Schnitt',
    description: 'Professionelle Haarschnitte für Damen und Herren',
    icon: Scissors,
    services: [
      { id: '1', name: 'Damenschnitt', description: 'Waschen, Schneiden, Föhnen', duration: 60, price: 85 },
      { id: '2', name: 'Herrenschnitt', description: 'Waschen, Schneiden, Styling', duration: 30, price: 45 },
      { id: '3', name: 'Kinderschnitt', description: 'Für Kinder bis 12 Jahre', duration: 30, price: 35 },
      { id: '4', name: 'Pony schneiden', description: 'Ponyschnitt zwischen den Terminen', duration: 15, price: 15 },
      { id: '5', name: 'Maschinenschnitt', description: 'Kompletter Maschinenschnitt', duration: 20, price: 25 },
    ],
  },
  {
    id: 'coloration',
    name: 'Coloration',
    description: 'Farbe und Highlights für Ihren individuellen Look',
    icon: Sparkles,
    services: [
      { id: '6', name: 'Ansatzfarbe', description: 'Ansatzfärbung bis 2cm', duration: 60, price: 65 },
      { id: '7', name: 'Komplettfärbung', description: 'Komplette Haarfärbung', duration: 90, price: 95 },
      { id: '8', name: 'Strähnen Folie', description: 'Strähnentechnik mit Folie', duration: 120, price: 120, popular: true },
      { id: '9', name: 'Balayage', description: 'Natürliche Farbverläufe', duration: 150, price: 180, popular: true },
      { id: '10', name: 'Glossing', description: 'Glanz und Farbauffrischung', duration: 30, price: 45 },
    ],
  },
  {
    id: 'styling',
    name: 'Styling',
    description: 'Perfektes Styling für jeden Anlass',
    icon: Wind,
    services: [
      { id: '11', name: 'Föhnstyling', description: 'Waschen und Föhnen', duration: 30, price: 35 },
      { id: '12', name: 'Hochsteckfrisur', description: 'Elegante Hochsteckfrisur', duration: 60, price: 85 },
      { id: '13', name: 'Brautstyling', description: 'Komplettes Braut-Haarstyling inkl. Probe', duration: 120, price: 250, popular: true },
      { id: '14', name: 'Locken / Wellen', description: 'Locken oder Wellen mit Lockenstab', duration: 45, price: 55 },
    ],
  },
  {
    id: 'pflege',
    name: 'Pflege',
    description: 'Intensive Treatments für gesundes Haar',
    icon: Droplet,
    services: [
      { id: '15', name: 'Intensivpflege', description: 'Tiefenwirksame Haarkur', duration: 20, price: 25 },
      { id: '16', name: 'Olaplex Treatment', description: 'Strukturaufbau mit Olaplex', duration: 30, price: 45, popular: true },
      { id: '17', name: 'Kopfhaut-Treatment', description: 'Beruhigende Kopfhautpflege', duration: 30, price: 35 },
      { id: '18', name: 'Keratin-Behandlung', description: 'Glättung und Pflege mit Keratin', duration: 120, price: 250 },
    ],
  },
]

export default function LeistungenPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-salon-cream via-white to-brand-50">
        <div className="container-wide">
          <div className="max-w-3xl">
            <p className="text-brand-600 font-medium tracking-wide uppercase text-sm mb-3">
              Unsere Dienstleistungen
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-salon-charcoal sm:text-5xl mb-6">
              Leistungen & Preise
            </h1>
            <p className="text-lg text-salon-charcoal/70 mb-8">
              Von klassischen Schnitten bis hin zu aufwendigen Colorationen –
              entdecken Sie unser umfangreiches Angebot an professionellen
              Haarpflege-Dienstleistungen.
            </p>
            <Button size="lg" asChild>
              <Link href="/booking">
                Termin buchen
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Services List */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide space-y-20">
          {serviceCategories.map((category) => {
            const Icon = category.icon
            return (
              <div key={category.id} id={category.id} className="scroll-mt-24">
                <div className="flex items-center gap-4 mb-8">
                  <div className="p-3 rounded-xl bg-brand-50 text-brand-600">
                    <Icon className="h-8 w-8" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-salon-charcoal">
                      {category.name}
                    </h2>
                    <p className="text-salon-charcoal/60">{category.description}</p>
                  </div>
                </div>

                <div className="grid gap-4">
                  {category.services.map((service) => (
                    <Card key={service.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-1">
                              <h3 className="text-lg font-semibold text-salon-charcoal">
                                {service.name}
                              </h3>
                              {service.popular && (
                                <Badge variant="secondary" className="bg-brand-100 text-brand-700">
                                  Beliebt
                                </Badge>
                              )}
                            </div>
                            <p className="text-salon-charcoal/60 text-sm">
                              {service.description}
                            </p>
                          </div>
                          <div className="flex items-center gap-6">
                            <div className="flex items-center gap-2 text-salon-charcoal/60">
                              <Clock className="h-4 w-4" />
                              <span className="text-sm">{service.duration} Min.</span>
                            </div>
                            <div className="text-right">
                              <p className="text-xl font-bold text-brand-600">
                                CHF {service.price}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Info Section */}
      <section className="py-16 lg:py-24 bg-salon-cream/30">
        <div className="container-wide">
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>Wichtige Hinweise</CardTitle>
            </CardHeader>
            <CardContent className="prose prose-sm max-w-none text-salon-charcoal/70">
              <ul>
                <li>
                  Alle Preise verstehen sich inklusive Mehrwertsteuer.
                </li>
                <li>
                  Für Langhaar-Zuschläge oder aufwendige Techniken können zusätzliche
                  Kosten anfallen. Wir beraten Sie gerne vorab.
                </li>
                <li>
                  Bei Erstbesuchen empfehlen wir eine ausführliche Beratung.
                  Bitte planen Sie etwas mehr Zeit ein.
                </li>
                <li>
                  Terminabsagen bitten wir mindestens 24 Stunden vorher mitzuteilen.
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide text-center">
          <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl mb-4">
            Bereit für Ihren Termin?
          </h2>
          <p className="text-salon-charcoal/70 max-w-xl mx-auto mb-8">
            Buchen Sie jetzt online oder rufen Sie uns an für eine persönliche Beratung.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/booking">Online buchen</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="tel:+41712345678">+41 71 234 56 78</a>
            </Button>
          </div>
        </div>
      </section>
    </>
  )
}
