import Link from 'next/link'
import { Phone, Mail, MapPin, Instagram, Facebook } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Separator } from '@/components/ui/separator'

const footerNavigation = {
  services: [
    { name: 'Schnitt', href: '/services#schnitt' },
    { name: 'Coloration', href: '/services#coloration' },
    { name: 'Styling', href: '/services#styling' },
    { name: 'Pflege', href: '/services#pflege' },
  ],
  company: [
    { name: 'Über uns', href: '/about' },
    { name: 'Team', href: '/team' },
    { name: 'Karriere', href: '/careers' },
    { name: 'Kontakt', href: '/contact' },
  ],
  legal: [
    { name: 'Impressum', href: '/impressum' },
    { name: 'Datenschutz', href: '/privacy' },
    { name: 'AGB', href: '/terms' },
  ],
}

interface FooterProps {
  className?: string
}

export function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear()

  return (
    <footer className={cn('bg-salon-charcoal text-salon-cream', className)}>
      <div className="container-wide py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Contact */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <span className="text-2xl font-bold text-brand-400">SCHNITTWERK</span>
            </Link>
            <p className="text-salon-cream/70 text-sm">
              Ihr Premium-Salon für Haarstyling und Pflege in Zürich.
              Erleben Sie erstklassige Dienstleistungen in entspannter Atmosphäre.
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3 text-salon-cream/70">
                <MapPin className="h-4 w-4 text-brand-400" />
                <span>Bahnhofstrasse 42, 8001 Zürich</span>
              </div>
              <div className="flex items-center gap-3 text-salon-cream/70">
                <Phone className="h-4 w-4 text-brand-400" />
                <span>+41 44 123 45 67</span>
              </div>
              <div className="flex items-center gap-3 text-salon-cream/70">
                <Mail className="h-4 w-4 text-brand-400" />
                <span>info@schnittwerk.ch</span>
              </div>
            </div>
          </div>

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-6">Dienstleistungen</h3>
            <ul className="space-y-3">
              {footerNavigation.services.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-salon-cream/70 transition-colors hover:text-brand-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="font-semibold mb-6">Unternehmen</h3>
            <ul className="space-y-3">
              {footerNavigation.company.map((item) => (
                <li key={item.name}>
                  <Link
                    href={item.href}
                    className="text-sm text-salon-cream/70 transition-colors hover:text-brand-400"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Opening Hours */}
          <div>
            <h3 className="font-semibold mb-6">Öffnungszeiten</h3>
            <div className="space-y-3 text-sm text-salon-cream/70">
              <div className="flex justify-between">
                <span>Montag - Freitag</span>
                <span>09:00 - 18:00</span>
              </div>
              <div className="flex justify-between">
                <span>Samstag</span>
                <span>09:00 - 16:00</span>
              </div>
              <div className="flex justify-between">
                <span>Sonntag</span>
                <span>Geschlossen</span>
              </div>
            </div>

            {/* Social Links */}
            <div className="mt-6 flex gap-4">
              <a
                href="https://instagram.com/schnittwerk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-salon-cream/70 transition-colors hover:text-brand-400"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://facebook.com/schnittwerk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-salon-cream/70 transition-colors hover:text-brand-400"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-salon-cream/10" />

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-salon-cream/50">
            © {currentYear} SCHNITTWERK. Alle Rechte vorbehalten.
          </p>
          <div className="flex gap-6">
            {footerNavigation.legal.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-sm text-salon-cream/50 transition-colors hover:text-brand-400"
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
