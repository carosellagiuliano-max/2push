import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft, Palette, Upload, Eye, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'Branding | SCHNITTWERK Admin',
  description: 'Salon-Branding und Farbschema anpassen.',
}

// Mock data
const salon = {
  id: 'salon-1',
  name: 'SCHNITTWERK St. Gallen',
  slug: 'st-gallen',
  logo_url: null,
  primary_color: '#b87444',
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

export default function SalonBrandingPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/dashboard/salons">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h1 className="text-3xl font-bold">Branding</h1>
          <p className="text-muted-foreground">{salon.name}</p>
        </div>
        <Button>Speichern</Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Logo */}
          <Card>
            <CardHeader>
              <CardTitle>Logo</CardTitle>
              <CardDescription>
                Das Logo erscheint in der Buchungsseite und E-Mails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  {salon.logo_url ? (
                    <AvatarImage src={salon.logo_url} alt={salon.name} />
                  ) : null}
                  <AvatarFallback
                    style={{ backgroundColor: salon.primary_color }}
                    className="text-white text-2xl font-bold"
                  >
                    {salon.name
                      .split(' ')
                      .map((w) => w[0])
                      .join('')
                      .slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-2">
                  <Button variant="outline">
                    <Upload className="mr-2 h-4 w-4" />
                    Logo hochladen
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG oder SVG. Max 2MB. Empfohlen: 512x512px
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Primary Color */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="h-5 w-5" />
                Primärfarbe
              </CardTitle>
              <CardDescription>
                Die Hauptfarbe für Buttons, Links und Akzente
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Voreingestellte Farben</Label>
                <div className="flex flex-wrap gap-3">
                  {colorPresets.map((preset) => (
                    <button
                      key={preset.color}
                      type="button"
                      className={cn(
                        'relative w-12 h-12 rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-2',
                        salon.primary_color === preset.color
                          ? 'ring-2 ring-foreground ring-offset-2'
                          : 'hover:scale-105'
                      )}
                      style={{ backgroundColor: preset.color }}
                      title={preset.name}
                    >
                      {salon.primary_color === preset.color && (
                        <Check className="absolute inset-0 m-auto h-5 w-5 text-white" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label htmlFor="custom_color">Eigene Farbe</Label>
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-lg border-2 border-border"
                    style={{ backgroundColor: salon.primary_color }}
                  />
                  <div className="flex-1 max-w-xs">
                    <Input
                      id="custom_color"
                      defaultValue={salon.primary_color}
                      placeholder="#000000"
                    />
                  </div>
                  <Input
                    type="color"
                    defaultValue={salon.primary_color}
                    className="w-12 h-12 p-1 cursor-pointer"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Geben Sie einen Hex-Farbcode ein oder verwenden Sie den Color-Picker
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Additional Branding Options */}
          <Card>
            <CardHeader>
              <CardTitle>Erweiterte Einstellungen</CardTitle>
              <CardDescription>
                Optionale Anpassungen für fortgeschrittenes Branding
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="favicon">Favicon URL</Label>
                <Input
                  id="favicon"
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Kleines Icon für Browser-Tabs (ICO, PNG, 32x32px)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="og_image">Social-Media-Bild</Label>
                <Input
                  id="og_image"
                  placeholder="https://..."
                />
                <p className="text-xs text-muted-foreground">
                  Wird angezeigt wenn die Seite geteilt wird (1200x630px empfohlen)
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Preview Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-4 w-4" />
                Vorschau
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Mini preview of branding */}
              <div className="rounded-lg border p-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: salon.primary_color }}
                  >
                    SW
                  </div>
                  <span className="font-semibold">{salon.name}</span>
                </div>
                <Separator />
                <div className="space-y-2">
                  <button
                    className="w-full py-2 px-4 rounded-md text-white font-medium"
                    style={{ backgroundColor: salon.primary_color }}
                  >
                    Termin buchen
                  </button>
                  <button
                    className="w-full py-2 px-4 rounded-md border font-medium"
                    style={{
                      borderColor: salon.primary_color,
                      color: salon.primary_color,
                    }}
                  >
                    Mehr erfahren
                  </button>
                </div>
                <div className="text-sm">
                  <span
                    className="underline cursor-pointer"
                    style={{ color: salon.primary_color }}
                  >
                    Link-Beispiel
                  </span>
                </div>
              </div>
              <p className="text-xs text-muted-foreground text-center">
                So erscheint die Farbe auf der Website
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tipps</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>
                <strong>Kontrast:</strong> Wählen Sie eine Farbe mit ausreichend
                Kontrast zu Weiss für gute Lesbarkeit.
              </p>
              <p>
                <strong>Konsistenz:</strong> Verwenden Sie dieselbe Farbe wie
                in Ihrem physischen Salon für Wiedererkennung.
              </p>
              <p>
                <strong>Logo:</strong> Ein quadratisches Logo funktioniert am
                besten auf allen Plattformen.
              </p>
            </CardContent>
          </Card>

          <Button variant="outline" className="w-full" asChild>
            <Link href={`/${salon.slug}`} target="_blank">
              <Eye className="mr-2 h-4 w-4" />
              Live-Vorschau öffnen
            </Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
