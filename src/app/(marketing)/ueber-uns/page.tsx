import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Heart, Award, Users, Leaf, Clock } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

export const metadata: Metadata = {
  title: 'Über uns | SCHNITTWERK',
  description: 'Erfahren Sie mehr über SCHNITTWERK by Vanessa Carosella - Ihr Premium-Salon für Haarstyling und Pflege in St. Gallen.',
}

const milestones = [
  { year: '2008', text: 'Vanessa beginnt ihre Ausbildung zur Coiffeuse' },
  { year: '2012', text: 'Erste Erfahrungen in renommierten Salons in Zürich' },
  { year: '2016', text: 'Weiterbildung zur Coloristin und Spezialisierung auf Balayage' },
  { year: '2019', text: 'Rückkehr nach St. Gallen mit der Vision eines eigenen Salons' },
  { year: '2021', text: 'Eröffnung von SCHNITTWERK an der Rorschacherstrasse' },
  { year: '2023', text: 'Erweiterung des Teams und neue Behandlungsräume' },
]

const values = [
  {
    icon: Heart,
    title: 'Persönliche Betreuung',
    description: 'Jeder Kunde ist einzigartig. Wir nehmen uns Zeit für ausführliche Beratung und individuelle Lösungen.',
  },
  {
    icon: Award,
    title: 'Höchste Qualität',
    description: 'Wir arbeiten nur mit Premium-Produkten und bilden uns regelmässig weiter.',
  },
  {
    icon: Leaf,
    title: 'Nachhaltigkeit',
    description: 'Umweltbewusstsein ist uns wichtig - von biologisch abbaubaren Produkten bis zur Energieeffizienz.',
  },
  {
    icon: Users,
    title: 'Teamgeist',
    description: 'Ein starkes Team ist die Basis für zufriedene Kunden. Wir unterstützen uns gegenseitig.',
  },
]

export default function UeberUnsPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-salon-cream via-white to-brand-50">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            <div className="space-y-6">
              <p className="text-brand-600 font-medium tracking-wide uppercase text-sm">
                Über uns
              </p>
              <h1 className="text-4xl font-bold tracking-tight text-salon-charcoal sm:text-5xl">
                Die Geschichte hinter SCHNITTWERK
              </h1>
              <p className="text-lg text-salon-charcoal/70">
                SCHNITTWERK wurde aus einer Vision geboren: Ein Ort zu schaffen,
                an dem Haarstyling zur Kunst wird und jeder Besuch zu einem
                Erlebnis. Ein Salon, der Qualität, Entspannung und individuelle
                Beratung vereint.
              </p>
              <p className="text-salon-charcoal/70">
                Gegründet von Vanessa Carosella, verbindet SCHNITTWERK jahrelange
                Erfahrung mit innovativen Techniken. Unser Ziel ist es, jedem
                Kunden das Gefühl zu geben, verstanden und wertgeschätzt zu werden.
              </p>
            </div>

            {/* Image Placeholder */}
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200 shadow-xl">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-brand-600/60">
                  <Heart className="h-20 w-20 mx-auto mb-4" />
                  <p className="text-sm">Salon Interior</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl mb-8 text-center">
              Meine Geschichte
            </h2>
            <div className="prose prose-lg max-w-none text-salon-charcoal/70">
              <p>
                Schon als Kind war ich fasziniert von der Kunst des Haarstylings.
                Was andere als alltägliche Routine sahen, war für mich eine
                Möglichkeit, Menschen zu transformieren und ihnen Selbstvertrauen
                zu schenken.
              </p>
              <p>
                Nach meiner Ausbildung und Jahren in führenden Salons in Zürich
                wusste ich: Ich möchte meinen eigenen Weg gehen. Einen Salon
                erschaffen, der meine Vision von Qualität und persönlicher
                Betreuung widerspiegelt.
              </p>
              <p>
                2021 wurde dieser Traum Wirklichkeit. SCHNITTWERK öffnete seine
                Türen in St. Gallen - ein Ort, an dem Tradition auf Innovation
                trifft und jeder Kunde als Individuum behandelt wird.
              </p>
              <p>
                Heute bin ich stolz auf das Team, das ich um mich versammelt habe.
                Gemeinsam arbeiten wir jeden Tag daran, unseren Kunden das beste
                Erlebnis zu bieten.
              </p>
              <p className="text-right font-serif text-brand-600 text-xl">
                — Vanessa Carosella
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="py-16 lg:py-24 bg-salon-cream/30">
        <div className="container-wide">
          <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl mb-12 text-center">
            Unser Weg
          </h2>
          <div className="max-w-3xl mx-auto">
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <div key={milestone.year} className="flex gap-6">
                  <div className="flex flex-col items-center">
                    <div className="flex items-center justify-center w-16 h-16 rounded-full bg-brand-600 text-white font-bold text-lg">
                      {milestone.year}
                    </div>
                    {index < milestones.length - 1 && (
                      <div className="w-px h-full bg-brand-200 my-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-8">
                    <p className="text-lg text-salon-charcoal pt-4">
                      {milestone.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl mb-4">
              Unsere Werte
            </h2>
            <p className="text-salon-charcoal/70">
              Diese Prinzipien leiten uns bei allem, was wir tun
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => {
              const Icon = value.icon
              return (
                <Card key={value.title}>
                  <CardContent className="p-6 text-center">
                    <div className="inline-flex p-4 rounded-xl bg-brand-50 text-brand-600 mb-4">
                      <Icon className="h-6 w-6" />
                    </div>
                    <h3 className="font-semibold text-salon-charcoal mb-2">
                      {value.title}
                    </h3>
                    <p className="text-sm text-salon-charcoal/70">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* Location Section */}
      <section className="py-16 lg:py-24 bg-salon-cream/30">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20 items-center">
            {/* Map Placeholder */}
            <div className="relative aspect-video lg:aspect-square rounded-2xl overflow-hidden bg-gray-200">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Clock className="h-12 w-12 mx-auto mb-4" />
                  <p className="text-sm">Google Maps Embed</p>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl">
                Besuchen Sie uns
              </h2>
              <div className="space-y-4 text-salon-charcoal/70">
                <div>
                  <p className="font-semibold text-salon-charcoal">Adresse</p>
                  <p>Rorschacherstrasse 152</p>
                  <p>9000 St. Gallen</p>
                </div>
                <div>
                  <p className="font-semibold text-salon-charcoal">Öffnungszeiten</p>
                  <p>Montag: Geschlossen</p>
                  <p>Dienstag - Freitag: 09:00 - 18:00</p>
                  <p>Samstag: 08:00 - 14:00</p>
                  <p>Sonntag: Geschlossen</p>
                </div>
                <div>
                  <p className="font-semibold text-salon-charcoal">Kontakt</p>
                  <p>Tel: +41 71 234 56 78</p>
                  <p>E-Mail: info@schnittwerk.ch</p>
                </div>
              </div>
              <div className="flex gap-4">
                <Button asChild>
                  <Link href="/kontakt">Kontakt aufnehmen</Link>
                </Button>
                <Button variant="outline" asChild>
                  <a
                    href="https://maps.google.com/?q=Rorschacherstrasse+152+9000+St.+Gallen"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Route planen
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-brand-600 to-brand-700 text-white">
        <div className="container-wide text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
            Werden Sie Teil der SCHNITTWERK Familie
          </h2>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Buchen Sie Ihren ersten Termin und erleben Sie den Unterschied.
          </p>
          <Button size="lg" variant="secondary" asChild>
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
