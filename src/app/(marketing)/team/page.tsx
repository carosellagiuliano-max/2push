import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, Award, Heart, Scissors, Instagram } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Unser Team | SCHNITTWERK',
  description: 'Lernen Sie unser erfahrenes Team kennen. Professionelle Hairstylisten mit Leidenschaft für Ihr Haar.',
}

// Mock data - in production this would come from DB
const teamMembers = [
  {
    id: '1',
    name: 'Vanessa Carosella',
    role: 'Inhaberin & Stylistin',
    description: 'Mit über 15 Jahren Erfahrung und einer Leidenschaft für innovative Schnitttechniken leite ich SCHNITTWERK mit Hingabe und Kreativität.',
    specialties: ['Coloration', 'Balayage', 'Hochsteckfrisuren'],
    color: '#E11D48',
    instagram: '@vanessa.schnittwerk',
  },
  {
    id: '2',
    name: 'Sarah Müller',
    role: 'Senior Stylistin',
    description: 'Spezialisiert auf natürliche Farbtechniken und klassische Schnitte. Sarah bringt 8 Jahre Erfahrung aus führenden Salons mit.',
    specialties: ['Natürliche Colorationen', 'Keratin-Behandlungen'],
    color: '#2563EB',
    instagram: '@sarah.hairstyle',
  },
  {
    id: '3',
    name: 'Marco Rossi',
    role: 'Stylist',
    description: 'Marcos kreative Ader zeigt sich besonders bei trendigen Herrenschnitten und modernen Styling-Techniken.',
    specialties: ['Herrenschnitte', 'Bart-Styling', 'Fade-Techniken'],
    color: '#059669',
    instagram: '@marco.barber',
  },
]

export default function TeamPage() {
  return (
    <>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-salon-cream via-white to-brand-50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-brand-600 font-medium tracking-wide uppercase text-sm mb-3">
              Unser Team
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-salon-charcoal sm:text-5xl mb-6">
              Leidenschaft für Ihr Haar
            </h1>
            <p className="text-lg text-salon-charcoal/70">
              Unser erfahrenes Team vereint Kreativität, Fachwissen und Hingabe.
              Jedes Teammitglied bringt einzigartige Stärken ein, um Ihnen das
              beste Ergebnis zu ermöglichen.
            </p>
          </div>
        </div>
      </section>

      {/* Team Members */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide">
          <div className="grid gap-12 lg:gap-16">
            {teamMembers.map((member, index) => (
              <div
                key={member.id}
                className={`grid gap-8 lg:grid-cols-2 lg:gap-16 items-center ${
                  index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                }`}
              >
                {/* Image Placeholder */}
                <div
                  className={`relative aspect-[4/5] rounded-2xl overflow-hidden shadow-xl ${
                    index % 2 === 1 ? 'lg:order-2' : ''
                  }`}
                  style={{ backgroundColor: `${member.color}20` }}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center" style={{ color: member.color }}>
                      <Scissors className="h-20 w-20 mx-auto mb-4 opacity-40" />
                      <p className="text-sm opacity-60">Portrait {member.name}</p>
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className={`space-y-6 ${index % 2 === 1 ? 'lg:order-1' : ''}`}>
                  <div>
                    <div
                      className="inline-block w-12 h-1 rounded mb-4"
                      style={{ backgroundColor: member.color }}
                    />
                    <h2 className="text-3xl font-bold text-salon-charcoal mb-2">
                      {member.name}
                    </h2>
                    <p className="text-brand-600 font-medium">{member.role}</p>
                  </div>

                  <p className="text-lg text-salon-charcoal/70">
                    {member.description}
                  </p>

                  <div>
                    <p className="text-sm font-medium text-salon-charcoal mb-3">
                      Spezialisierungen:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {member.specialties.map((specialty) => (
                        <Badge
                          key={specialty}
                          variant="secondary"
                          className="bg-salon-cream text-salon-charcoal"
                        >
                          {specialty}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {member.instagram && (
                    <a
                      href={`https://instagram.com/${member.instagram.replace('@', '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-salon-charcoal/60 hover:text-brand-600 transition-colors"
                    >
                      <Instagram className="h-5 w-5" />
                      <span>{member.instagram}</span>
                    </a>
                  )}

                  <Button asChild>
                    <Link href={`/booking?staff=${member.id}`}>
                      Termin bei {member.name.split(' ')[0]} buchen
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values Section */}
      <section className="py-16 lg:py-24 bg-salon-cream/30">
        <div className="container-wide">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl font-bold tracking-tight text-salon-charcoal sm:text-3xl mb-4">
              Unsere Werte
            </h2>
            <p className="text-salon-charcoal/70">
              Was uns als Team auszeichnet und antreibt
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 rounded-xl bg-brand-50 text-brand-600 mb-6">
                  <Award className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-salon-charcoal mb-2">
                  Qualität
                </h3>
                <p className="text-salon-charcoal/70">
                  Wir arbeiten nur mit den besten Produkten und bilden uns
                  ständig weiter.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 rounded-xl bg-brand-50 text-brand-600 mb-6">
                  <Heart className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-salon-charcoal mb-2">
                  Leidenschaft
                </h3>
                <p className="text-salon-charcoal/70">
                  Jeder Kunde ist einzigartig und verdient unsere volle
                  Aufmerksamkeit.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-8 text-center">
                <div className="inline-flex p-4 rounded-xl bg-brand-50 text-brand-600 mb-6">
                  <Scissors className="h-8 w-8" />
                </div>
                <h3 className="text-xl font-semibold text-salon-charcoal mb-2">
                  Präzision
                </h3>
                <p className="text-salon-charcoal/70">
                  Jeder Schnitt, jede Farbe wird mit höchster Sorgfalt
                  ausgeführt.
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
            Lernen Sie uns persönlich kennen
          </h2>
          <p className="text-salon-charcoal/70 max-w-xl mx-auto mb-8">
            Buchen Sie Ihren Termin und erleben Sie unsere Leidenschaft für Ihr Haar.
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
