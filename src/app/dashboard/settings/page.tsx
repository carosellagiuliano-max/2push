import type { Metadata } from 'next'
import {
  Building2,
  CreditCard,
  Bell,
  Calendar,
  Clock,
  Percent,
  Mail,
  Phone,
  MapPin,
  Globe,
  Save,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export const metadata: Metadata = {
  title: 'Einstellungen | SCHNITTWERK Admin',
  description: 'Geschäftseinstellungen, Buchungsregeln und Zahlungsoptionen.',
}

// Mock settings - in production this would come from DB
const businessSettings = {
  name: 'SCHNITTWERK',
  email: 'info@schnittwerk.ch',
  phone: '+41 71 123 45 67',
  address: 'Bahnhofstrasse 42',
  city: 'St. Gallen',
  postalCode: '9000',
  country: 'Schweiz',
  website: 'https://schnittwerk.ch',
  description: 'Ihr Premium Coiffeur in St. Gallen für stilvolle Haarschnitte und professionelle Colorationen.',
}

const bookingSettings = {
  minAdvanceBooking: 2, // hours
  maxAdvanceBooking: 30, // days
  slotDuration: 15, // minutes
  bufferBetweenBookings: 0, // minutes
  allowSameDayBooking: true,
  allowOnlineBooking: true,
  requireDeposit: false,
  depositAmount: 50,
  cancellationPeriod: 24, // hours
  sendReminders: true,
  reminderHours: 24,
}

const paymentSettings = {
  vatRate: 8.1,
  acceptCash: true,
  acceptCard: true,
  acceptTwint: true,
  acceptInvoice: true,
  invoicePaymentDays: 30,
  currency: 'CHF',
}

const notificationSettings = {
  sendBookingConfirmation: true,
  sendBookingReminder: true,
  sendCancellationConfirmation: true,
  sendOrderConfirmation: true,
  sendShippingNotification: true,
  emailFromName: 'SCHNITTWERK',
  emailReplyTo: 'info@schnittwerk.ch',
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Einstellungen</h1>
          <p className="text-muted-foreground">
            Verwalten Sie Ihre Geschäfts- und Systemeinstellungen
          </p>
        </div>
        <Button>
          <Save className="mr-2 h-4 w-4" />
          Speichern
        </Button>
      </div>

      <Tabs defaultValue="business" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="business" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            <span className="hidden sm:inline">Geschäft</span>
          </TabsTrigger>
          <TabsTrigger value="booking" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Buchung</span>
          </TabsTrigger>
          <TabsTrigger value="payment" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Zahlung</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Benachrichtigungen</span>
          </TabsTrigger>
        </TabsList>

        {/* Business Settings */}
        <TabsContent value="business" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Geschäftsinformationen</CardTitle>
              <CardDescription>
                Grundlegende Informationen zu Ihrem Salon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="business-name">Geschäftsname</Label>
                  <Input id="business-name" defaultValue={businessSettings.name} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="website">Website</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="website" defaultValue={businessSettings.website} className="pl-9" />
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung</Label>
                <Textarea
                  id="description"
                  defaultValue={businessSettings.description}
                  rows={3}
                />
              </div>

              <Separator />

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="email" type="email" defaultValue={businessSettings.email} className="pl-9" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input id="phone" type="tel" defaultValue={businessSettings.phone} className="pl-9" />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Adresse
                </h4>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2 md:col-span-2">
                    <Label htmlFor="address">Strasse</Label>
                    <Input id="address" defaultValue={businessSettings.address} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="postal-code">PLZ</Label>
                    <Input id="postal-code" defaultValue={businessSettings.postalCode} />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="city">Stadt</Label>
                    <Input id="city" defaultValue={businessSettings.city} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Booking Settings */}
        <TabsContent value="booking" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Buchungsregeln</CardTitle>
              <CardDescription>
                Steuern Sie, wie Kunden Termine buchen können
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Online-Buchung aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    Kunden können Termine online buchen
                  </p>
                </div>
                <Switch defaultChecked={bookingSettings.allowOnlineBooking} />
              </div>

              <Separator />

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="min-advance">Mindestvorlauf (Stunden)</Label>
                  <div className="relative">
                    <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="min-advance"
                      type="number"
                      defaultValue={bookingSettings.minAdvanceBooking}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wie früh muss gebucht werden?
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="max-advance">Maximaler Vorlauf (Tage)</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="max-advance"
                      type="number"
                      defaultValue={bookingSettings.maxAdvanceBooking}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Wie weit im Voraus kann gebucht werden?
                  </p>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="slot-duration">Zeitslot-Dauer (Minuten)</Label>
                  <Select defaultValue={String(bookingSettings.slotDuration)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 Minuten</SelectItem>
                      <SelectItem value="30">30 Minuten</SelectItem>
                      <SelectItem value="60">60 Minuten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="buffer">Puffer zwischen Terminen (Min.)</Label>
                  <Select defaultValue={String(bookingSettings.bufferBetweenBookings)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Kein Puffer</SelectItem>
                      <SelectItem value="5">5 Minuten</SelectItem>
                      <SelectItem value="10">10 Minuten</SelectItem>
                      <SelectItem value="15">15 Minuten</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Stornierungsregeln</h4>
                <div className="space-y-2">
                  <Label htmlFor="cancellation-period">Stornierungsfrist (Stunden)</Label>
                  <Input
                    id="cancellation-period"
                    type="number"
                    defaultValue={bookingSettings.cancellationPeriod}
                    className="max-w-xs"
                  />
                  <p className="text-xs text-muted-foreground">
                    Bis wann kann kostenlos storniert werden?
                  </p>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Anzahlung</h4>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Anzahlung verlangen</Label>
                    <p className="text-sm text-muted-foreground">
                      Kunden müssen eine Anzahlung leisten
                    </p>
                  </div>
                  <Switch defaultChecked={bookingSettings.requireDeposit} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="deposit-amount">Anzahlungsbetrag (CHF)</Label>
                  <Input
                    id="deposit-amount"
                    type="number"
                    defaultValue={bookingSettings.depositAmount}
                    className="max-w-xs"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Terminerinnerungen</CardTitle>
              <CardDescription>
                Automatische Erinnerungen an Kunden senden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Erinnerungen aktivieren</Label>
                  <p className="text-sm text-muted-foreground">
                    E-Mail-Erinnerung vor dem Termin senden
                  </p>
                </div>
                <Switch defaultChecked={bookingSettings.sendReminders} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder-hours">Erinnerung senden (Stunden vorher)</Label>
                <Select defaultValue={String(bookingSettings.reminderHours)}>
                  <SelectTrigger className="max-w-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="12">12 Stunden</SelectItem>
                    <SelectItem value="24">24 Stunden</SelectItem>
                    <SelectItem value="48">48 Stunden</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payment" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Zahlungseinstellungen</CardTitle>
              <CardDescription>
                Steuern, Währung und akzeptierte Zahlungsmethoden
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="vat-rate">MwSt.-Satz (%)</Label>
                  <div className="relative">
                    <Percent className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="vat-rate"
                      type="number"
                      step="0.1"
                      defaultValue={paymentSettings.vatRate}
                      className="pl-9"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Schweizer Normalsatz: 8.1%
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Währung</Label>
                  <Select defaultValue={paymentSettings.currency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CHF">CHF (Schweizer Franken)</SelectItem>
                      <SelectItem value="EUR">EUR (Euro)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Akzeptierte Zahlungsmethoden</h4>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Barzahlung</Label>
                      <p className="text-sm text-muted-foreground">Zahlung vor Ort in bar</p>
                    </div>
                    <Switch defaultChecked={paymentSettings.acceptCash} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Kartenzahlung</Label>
                      <p className="text-sm text-muted-foreground">Kredit- und Debitkarten</p>
                    </div>
                    <Switch defaultChecked={paymentSettings.acceptCard} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>TWINT</Label>
                      <p className="text-sm text-muted-foreground">Mobile Payment via TWINT</p>
                    </div>
                    <Switch defaultChecked={paymentSettings.acceptTwint} />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Rechnung</Label>
                      <p className="text-sm text-muted-foreground">Zahlung auf Rechnung (nur Shop)</p>
                    </div>
                    <Switch defaultChecked={paymentSettings.acceptInvoice} />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="invoice-days">Zahlungsfrist Rechnung (Tage)</Label>
                <Input
                  id="invoice-days"
                  type="number"
                  defaultValue={paymentSettings.invoicePaymentDays}
                  className="max-w-xs"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Einstellungen</CardTitle>
              <CardDescription>
                Absender und allgemeine E-Mail-Konfiguration
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="email-from">Absendername</Label>
                  <Input id="email-from" defaultValue={notificationSettings.emailFromName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email-reply">Antwort-Adresse</Label>
                  <Input id="email-reply" type="email" defaultValue={notificationSettings.emailReplyTo} />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automatische Benachrichtigungen</CardTitle>
              <CardDescription>
                Welche E-Mails sollen automatisch versendet werden?
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Buchungsbestätigung</Label>
                  <p className="text-sm text-muted-foreground">
                    E-Mail nach erfolgreicher Terminbuchung
                  </p>
                </div>
                <Switch defaultChecked={notificationSettings.sendBookingConfirmation} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Terminerinnerung</Label>
                  <p className="text-sm text-muted-foreground">
                    Erinnerung vor dem Termin
                  </p>
                </div>
                <Switch defaultChecked={notificationSettings.sendBookingReminder} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Stornierungsbestätigung</Label>
                  <p className="text-sm text-muted-foreground">
                    E-Mail nach Terminstornierung
                  </p>
                </div>
                <Switch defaultChecked={notificationSettings.sendCancellationConfirmation} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Bestellbestätigung</Label>
                  <p className="text-sm text-muted-foreground">
                    E-Mail nach Shop-Bestellung
                  </p>
                </div>
                <Switch defaultChecked={notificationSettings.sendOrderConfirmation} />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Versandbenachrichtigung</Label>
                  <p className="text-sm text-muted-foreground">
                    E-Mail wenn Bestellung verschickt wird
                  </p>
                </div>
                <Switch defaultChecked={notificationSettings.sendShippingNotification} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Vorlagen</CardTitle>
              <CardDescription>
                Bearbeiten Sie die Texte Ihrer automatischen E-Mails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <Button variant="outline" className="h-auto py-4 justify-start">
                  <div className="text-left">
                    <div className="font-medium">Buchungsbestätigung</div>
                    <div className="text-sm text-muted-foreground">Vorlage bearbeiten</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start">
                  <div className="text-left">
                    <div className="font-medium">Terminerinnerung</div>
                    <div className="text-sm text-muted-foreground">Vorlage bearbeiten</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start">
                  <div className="text-left">
                    <div className="font-medium">Stornierungsbestätigung</div>
                    <div className="text-sm text-muted-foreground">Vorlage bearbeiten</div>
                  </div>
                </Button>
                <Button variant="outline" className="h-auto py-4 justify-start">
                  <div className="text-left">
                    <div className="font-medium">Bestellbestätigung</div>
                    <div className="text-sm text-muted-foreground">Vorlage bearbeiten</div>
                  </div>
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
