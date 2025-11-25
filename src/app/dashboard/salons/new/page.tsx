import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Building2, MapPin, Mail, Phone, Globe, Palette } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Separator } from '@/components/ui/separator'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const metadata: Metadata = {
  title: 'Neuer Salon | SCHNITTWERK Admin',
  description: 'Einen neuen Salon zum Netzwerk hinzufügen.',
}

const colorPresets = [
  { name: 'Kupfer', color: '#b87444' },
  { name: 'Midnight', color: '#1e293b' },
  { name: 'Forest', color: '#166534' },
  { name: 'Ocean', color: '#0369a1' },
  { name: 'Berry', color: '#9333ea' },
  { name: 'Rose', color: '#e11d48' },
  { name: 'Coral', color: '#ea580c' },
  { name: 'Gold', color: '#ca8a04' },
]

export default function NewSalonPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/salons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Neuer Salon</h1>
          <p className="text-muted-foreground">
            Fügen Sie einen neuen Standort zum Netzwerk hinzu
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Grundinformationen
              </CardTitle>
              <CardDescription>
                Name und grundlegende Details des Salons
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Salonname *</Label>
                  <Input id="name" placeholder="z.B. SCHNITTWERK Bern" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="slug">URL-Slug *</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">/</span>
                    <Input id="slug" placeholder="bern" />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wird in der URL verwendet: schnittwerk.ch/bern
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  placeholder="Kurze Beschreibung des Salons..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Adresse
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="street">Strasse *</Label>
                <Input id="street" placeholder="Bahnhofstrasse 42" />
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="postal_code">PLZ *</Label>
                  <Input id="postal_code" placeholder="3000" />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="city">Stadt *</Label>
                  <Input id="city" placeholder="Bern" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Land</Label>
                <Select defaultValue="CH">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CH">Schweiz</SelectItem>
                    <SelectItem value="DE">Deutschland</SelectItem>
                    <SelectItem value="AT">Österreich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Kontakt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="bern@schnittwerk.ch"
                      className="pl-9"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon *</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+41 31 123 45 67"
                      className="pl-9"
                    />
                  </div>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="website">Website (optional)</Label>
                <div className="relative">
                  <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="website"
                    type="url"
                    placeholder="https://schnittwerk.ch/bern"
                    className="pl-9"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Branding
              </CardTitle>
              <CardDescription>
                Primärfarbe für das Salon-Branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Primärfarbe</Label>
                <div className="flex flex-wrap gap-2">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      className="w-10 h-10 rounded-lg border-2 border-transparent hover:border-foreground/20 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    />
                  ))}
                </div>
                <p className="text-xs text-muted-foreground">
                  Wählen Sie eine Farbe oder geben Sie einen eigenen Hex-Wert ein
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="custom_color">Eigene Farbe (Hex)</Label>
                <div className="flex items-center gap-2">
                  <div
                    className="w-10 h-10 rounded-lg border"
                    style={{ backgroundColor: '#b87444' }}
                  />
                  <Input
                    id="custom_color"
                    placeholder="#b87444"
                    className="w-32"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Einstellungen</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Zeitzone</Label>
                <Select defaultValue="Europe/Zurich">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Europe/Zurich">
                      Europe/Zurich (MEZ)
                    </SelectItem>
                    <SelectItem value="Europe/Berlin">
                      Europe/Berlin (MEZ)
                    </SelectItem>
                    <SelectItem value="Europe/Vienna">
                      Europe/Vienna (MEZ)
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency">Währung</Label>
                <Select defaultValue="CHF">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CHF">CHF (Schweizer Franken)</SelectItem>
                    <SelectItem value="EUR">EUR (Euro)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="language">Standardsprache</Label>
                <Select defaultValue="de">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="de">Deutsch</SelectItem>
                    <SelectItem value="fr">Französisch</SelectItem>
                    <SelectItem value="it">Italienisch</SelectItem>
                    <SelectItem value="en">Englisch</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Hinweise</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                Nach dem Erstellen des Salons können Sie:
              </p>
              <ul className="list-disc pl-4 space-y-1">
                <li>Öffnungszeiten festlegen</li>
                <li>Team-Mitglieder hinzufügen</li>
                <li>Dienstleistungen konfigurieren</li>
                <li>Buchungsregeln anpassen</li>
              </ul>
              <Separator className="my-4" />
              <p>
                Felder mit * sind Pflichtfelder.
              </p>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button className="w-full">Salon erstellen</Button>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/dashboard/salons">Abbrechen</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
