'use client'

import * as React from 'react'
import Link from 'next/link'
import { MapPin, Phone, Mail, Clock, Send, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent } from '@/components/ui/card'

export default function KontaktPage() {
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  return (
    <>
      {/* Hero Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-salon-cream via-white to-brand-50">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-brand-600 font-medium tracking-wide uppercase text-sm mb-3">
              Kontakt
            </p>
            <h1 className="text-4xl font-bold tracking-tight text-salon-charcoal sm:text-5xl mb-6">
              Wir freuen uns auf Sie
            </h1>
            <p className="text-lg text-salon-charcoal/70">
              Haben Sie Fragen oder möchten Sie einen Termin vereinbaren?
              Kontaktieren Sie uns – wir sind gerne für Sie da.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Content */}
      <section className="py-16 lg:py-24 bg-white">
        <div className="container-wide">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-20">
            {/* Contact Form */}
            <div>
              <h2 className="text-2xl font-bold text-salon-charcoal mb-6">
                Schreiben Sie uns
              </h2>

              {isSubmitted ? (
                <Card className="bg-green-50 border-green-200">
                  <CardContent className="p-8 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-green-800 mb-2">
                      Nachricht gesendet!
                    </h3>
                    <p className="text-green-700 mb-6">
                      Vielen Dank für Ihre Nachricht. Wir werden uns so schnell
                      wie möglich bei Ihnen melden.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setIsSubmitted(false)}
                    >
                      Weitere Nachricht senden
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">Vorname *</Label>
                      <Input
                        id="firstName"
                        name="firstName"
                        required
                        placeholder="Max"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Nachname *</Label>
                      <Input
                        id="lastName"
                        name="lastName"
                        required
                        placeholder="Mustermann"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-Mail *</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="max@example.ch"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefon</Label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      placeholder="+41 79 123 45 67"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="subject">Betreff *</Label>
                    <Input
                      id="subject"
                      name="subject"
                      required
                      placeholder="Anfrage zu..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="message">Nachricht *</Label>
                    <Textarea
                      id="message"
                      name="message"
                      required
                      rows={5}
                      placeholder="Ihre Nachricht an uns..."
                    />
                  </div>

                  <p className="text-sm text-salon-charcoal/60">
                    * Pflichtfelder
                  </p>

                  <Button type="submit" size="lg" disabled={isSubmitting}>
                    {isSubmitting ? (
                      'Wird gesendet...'
                    ) : (
                      <>
                        Nachricht senden
                        <Send className="ml-2 h-4 w-4" />
                      </>
                    )}
                  </Button>
                </form>
              )}
            </div>

            {/* Contact Info */}
            <div className="space-y-8">
              <h2 className="text-2xl font-bold text-salon-charcoal mb-6">
                Kontaktinformationen
              </h2>

              <div className="space-y-6">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
                        <MapPin className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-salon-charcoal mb-1">
                          Adresse
                        </h3>
                        <p className="text-salon-charcoal/70">
                          SCHNITTWERK by Vanessa Carosella
                          <br />
                          Rorschacherstrasse 152
                          <br />
                          9000 St. Gallen
                        </p>
                        <a
                          href="https://maps.google.com/?q=Rorschacherstrasse+152+9000+St.+Gallen"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-brand-600 hover:underline text-sm mt-2 inline-block"
                        >
                          Route planen →
                        </a>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
                        <Phone className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-salon-charcoal mb-1">
                          Telefon
                        </h3>
                        <a
                          href="tel:+41712345678"
                          className="text-salon-charcoal/70 hover:text-brand-600"
                        >
                          +41 71 234 56 78
                        </a>
                        <p className="text-sm text-salon-charcoal/50 mt-1">
                          Während der Öffnungszeiten erreichbar
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
                        <Mail className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-salon-charcoal mb-1">
                          E-Mail
                        </h3>
                        <a
                          href="mailto:info@schnittwerk.ch"
                          className="text-salon-charcoal/70 hover:text-brand-600"
                        >
                          info@schnittwerk.ch
                        </a>
                        <p className="text-sm text-salon-charcoal/50 mt-1">
                          Wir antworten innerhalb von 24 Stunden
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-brand-50 text-brand-600">
                        <Clock className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-salon-charcoal mb-1">
                          Öffnungszeiten
                        </h3>
                        <div className="text-salon-charcoal/70 text-sm space-y-1">
                          <p>Montag: Geschlossen</p>
                          <p>Dienstag - Freitag: 09:00 - 18:00</p>
                          <p>Samstag: 08:00 - 14:00</p>
                          <p>Sonntag: Geschlossen</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Booking CTA */}
              <Card className="bg-brand-50 border-brand-100">
                <CardContent className="p-6 text-center">
                  <h3 className="font-semibold text-salon-charcoal mb-2">
                    Termin buchen?
                  </h3>
                  <p className="text-sm text-salon-charcoal/70 mb-4">
                    Buchen Sie Ihren Termin einfach online.
                  </p>
                  <Button asChild>
                    <Link href="/booking">Online buchen</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Map Section */}
      <section className="py-16 lg:py-24 bg-salon-cream/30">
        <div className="container-wide">
          <h2 className="text-2xl font-bold text-salon-charcoal mb-8 text-center">
            So finden Sie uns
          </h2>
          <div className="relative aspect-[21/9] rounded-2xl overflow-hidden bg-gray-200">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2697.0!2d9.38!3d47.42!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zNDfCsDI1JzEyLjAiTiA5wrAyMic0OC4wIkU!5e0!3m2!1sde!2sch!4v1234567890"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="SCHNITTWERK Standort"
              className="absolute inset-0"
            />
          </div>
          <div className="mt-6 text-center">
            <p className="text-salon-charcoal/70 mb-4">
              Kostenlose Parkplätze direkt vor dem Salon verfügbar.
              Bus-Haltestelle &ldquo;Rorschacherstrasse&rdquo; in 2 Minuten Gehdistanz.
            </p>
          </div>
        </div>
      </section>
    </>
  )
}
