'use client'

import * as React from 'react'
import Link from 'next/link'
import { Menu, Phone, MapPin, Clock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'

const navigation = [
  { name: 'Startseite', href: '/' },
  { name: 'Leistungen', href: '/leistungen' },
  { name: 'Team', href: '/team' },
  { name: 'Über uns', href: '/ueber-uns' },
  { name: 'Galerie', href: '/galerie' },
  { name: 'Kontakt', href: '/kontakt' },
]

interface HeaderProps {
  className?: string
}

export function Header({ className }: HeaderProps) {
  const [isOpen, setIsOpen] = React.useState(false)
  const [isScrolled, setIsScrolled] = React.useState(false)

  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <header
      className={cn(
        'sticky top-0 z-50 w-full transition-all duration-300',
        isScrolled
          ? 'bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b'
          : 'bg-transparent',
        className
      )}
    >
      {/* Top bar - hidden on mobile */}
      <div className="hidden md:block border-b bg-muted/50">
        <div className="container-wide flex h-10 items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-6">
            <a href="tel:+41712345678" className="flex items-center gap-2 hover:text-primary transition-colors">
              <Phone className="h-4 w-4" />
              <span>+41 71 234 56 78</span>
            </a>
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              <span>Rorschacherstrasse 152, 9000 St. Gallen</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            <span>Di-Fr: 9:00-18:00, Sa: 8:00-14:00</span>
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <nav className="container-wide flex h-16 items-center justify-between">
        {/* Logo */}
        <Link href="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold text-primary">SCHNITTWERK</span>
        </Link>

        {/* Desktop navigation */}
        <div className="hidden md:flex md:items-center md:gap-8">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-sm font-medium text-foreground/80 transition-colors hover:text-primary"
            >
              {item.name}
            </Link>
          ))}
        </div>

        {/* CTA Button */}
        <div className="hidden md:block">
          <Button asChild>
            <Link href="/booking">Termin buchen</Link>
          </Button>
        </div>

        {/* Mobile menu */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-6 w-6" />
              <span className="sr-only">Menü öffnen</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full sm:max-w-sm">
            <div className="flex flex-col space-y-6 mt-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="text-lg font-medium text-foreground transition-colors hover:text-primary"
                >
                  {item.name}
                </Link>
              ))}
              <Button asChild className="mt-4" size="lg">
                <Link href="/booking" onClick={() => setIsOpen(false)}>
                  Termin buchen
                </Link>
              </Button>

              {/* Mobile contact info */}
              <div className="pt-6 border-t space-y-4 text-sm text-muted-foreground">
                <a href="tel:+41712345678" className="flex items-center gap-2">
                  <Phone className="h-4 w-4" />
                  <span>+41 71 234 56 78</span>
                </a>
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  <span>Rorschacherstrasse 152, 9000 St. Gallen</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>Di-Fr: 9:00-18:00, Sa: 8:00-14:00</span>
                </div>
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  )
}
