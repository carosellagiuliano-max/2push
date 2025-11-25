import type { Metadata } from 'next'
import {
  Mail,
  MessageSquare,
  Bell,
  Edit,
  Eye,
  Send,
  Check,
  X,
  Copy,
  Search,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const metadata: Metadata = {
  title: 'Benachrichtigungen | SCHNITTWERK Admin',
  description: 'Verwalten Sie E-Mail-Vorlagen und Benachrichtigungseinstellungen.',
}

// Mock data - in production this would come from notification_templates table
const templates = [
  {
    id: '1',
    key: 'booking_confirmation',
    name: 'Buchungsbestätigung',
    description: 'Wird nach erfolgreicher Terminbuchung gesendet',
    channel: 'email',
    language: 'de',
    subject: 'Ihre Terminbestätigung bei SCHNITTWERK',
    isActive: true,
    lastUpdated: '2025-01-10T14:30:00Z',
    variables: ['customer_name', 'appointment_date', 'appointment_time', 'services_list', 'staff_name', 'total_price'],
  },
  {
    id: '2',
    key: 'booking_reminder_24h',
    name: 'Terminerinnerung (24h)',
    description: '24 Stunden vor dem Termin',
    channel: 'email',
    language: 'de',
    subject: 'Erinnerung: Ihr Termin morgen bei SCHNITTWERK',
    isActive: true,
    lastUpdated: '2025-01-08T10:15:00Z',
    variables: ['customer_name', 'appointment_date', 'appointment_time', 'cancel_url'],
  },
  {
    id: '3',
    key: 'booking_cancelled_customer',
    name: 'Stornierungsbestätigung',
    description: 'Wenn der Kunde seinen Termin storniert',
    channel: 'email',
    language: 'de',
    subject: 'Ihre Terminabsage bei SCHNITTWERK',
    isActive: true,
    lastUpdated: '2025-01-05T09:00:00Z',
    variables: ['customer_name', 'appointment_date', 'appointment_time'],
  },
  {
    id: '4',
    key: 'booking_cancelled_salon',
    name: 'Absage durch Salon',
    description: 'Wenn der Salon den Termin absagen muss',
    channel: 'email',
    language: 'de',
    subject: 'Wichtig: Änderung Ihres Termins bei SCHNITTWERK',
    isActive: true,
    lastUpdated: '2025-01-05T09:00:00Z',
    variables: ['customer_name', 'appointment_date', 'appointment_time', 'reschedule_url'],
  },
  {
    id: '5',
    key: 'order_confirmation',
    name: 'Bestellbestätigung',
    description: 'Nach Abschluss einer Shop-Bestellung',
    channel: 'email',
    language: 'de',
    subject: 'Ihre Bestellung bei SCHNITTWERK',
    isActive: true,
    lastUpdated: '2025-01-12T16:45:00Z',
    variables: ['customer_name', 'order_number', 'order_items', 'total', 'shipping_address'],
  },
  {
    id: '6',
    key: 'order_shipped',
    name: 'Versandbestätigung',
    description: 'Wenn die Bestellung versendet wurde',
    channel: 'email',
    language: 'de',
    subject: 'Ihre Bestellung wurde versendet',
    isActive: true,
    lastUpdated: '2025-01-12T16:45:00Z',
    variables: ['customer_name', 'order_number', 'tracking_url'],
  },
  {
    id: '7',
    key: 'welcome',
    name: 'Willkommens-E-Mail',
    description: 'Nach der Registrierung eines neuen Kunden',
    channel: 'email',
    language: 'de',
    subject: 'Willkommen bei SCHNITTWERK',
    isActive: true,
    lastUpdated: '2025-01-03T11:20:00Z',
    variables: ['customer_name', 'customer_first_name'],
  },
  {
    id: '8',
    key: 'password_reset',
    name: 'Passwort zurücksetzen',
    description: 'Link zum Zurücksetzen des Passworts',
    channel: 'email',
    language: 'de',
    subject: 'Passwort zurücksetzen - SCHNITTWERK',
    isActive: true,
    lastUpdated: '2025-01-01T08:00:00Z',
    variables: ['customer_name', 'reset_url'],
  },
  {
    id: '9',
    key: 'booking_reminder_2h',
    name: 'Terminerinnerung (2h) SMS',
    description: '2 Stunden vor dem Termin per SMS',
    channel: 'sms',
    language: 'de',
    subject: null,
    isActive: false,
    lastUpdated: '2025-01-08T10:15:00Z',
    variables: ['customer_first_name', 'appointment_time'],
  },
]

const notificationLogs = [
  { id: '1', template: 'Buchungsbestätigung', recipient: 'anna@example.com', status: 'sent', sentAt: '2025-01-15T10:32:00Z' },
  { id: '2', template: 'Terminerinnerung (24h)', recipient: 'peter@example.com', status: 'sent', sentAt: '2025-01-15T08:00:00Z' },
  { id: '3', template: 'Bestellbestätigung', recipient: 'lisa@example.com', status: 'sent', sentAt: '2025-01-14T14:25:00Z' },
  { id: '4', template: 'Willkommens-E-Mail', recipient: 'max@example.com', status: 'sent', sentAt: '2025-01-14T11:00:00Z' },
  { id: '5', template: 'Buchungsbestätigung', recipient: 'sarah@example.com', status: 'failed', sentAt: '2025-01-14T09:45:00Z' },
]

const channelConfig: Record<string, { label: string; icon: typeof Mail }> = {
  email: { label: 'E-Mail', icon: Mail },
  sms: { label: 'SMS', icon: MessageSquare },
  push: { label: 'Push', icon: Bell },
}

const categoryGroups = [
  { name: 'Buchungen', templates: ['booking_confirmation', 'booking_reminder_24h', 'booking_reminder_2h', 'booking_cancelled_customer', 'booking_cancelled_salon'] },
  { name: 'Bestellungen', templates: ['order_confirmation', 'order_shipped'] },
  { name: 'Konto', templates: ['welcome', 'password_reset'] },
]

export default function NotificationsPage() {
  const formatDate = (date: string) => new Date(date).toLocaleDateString('de-CH', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Benachrichtigungen</h1>
          <p className="text-muted-foreground">
            E-Mail-Vorlagen und Benachrichtigungseinstellungen
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Vorlagen gesamt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{templates.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Aktive Vorlagen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {templates.filter((t) => t.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Gesendet (heute)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Fehlgeschlagen (heute)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">1</div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="templates" className="space-y-6">
        <TabsList>
          <TabsTrigger value="templates">Vorlagen</TabsTrigger>
          <TabsTrigger value="logs">Versandprotokoll</TabsTrigger>
          <TabsTrigger value="settings">Einstellungen</TabsTrigger>
        </TabsList>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          {/* Filter */}
          <div className="flex items-center gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input placeholder="Vorlagen durchsuchen..." className="pl-9" />
            </div>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Kanal" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kanäle</SelectItem>
                <SelectItem value="email">E-Mail</SelectItem>
                <SelectItem value="sms">SMS</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="all">
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Kategorie" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle Kategorien</SelectItem>
                <SelectItem value="booking">Buchungen</SelectItem>
                <SelectItem value="order">Bestellungen</SelectItem>
                <SelectItem value="account">Konto</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Templates by Category */}
          {categoryGroups.map((group) => {
            const groupTemplates = templates.filter((t) => group.templates.includes(t.key))
            if (groupTemplates.length === 0) return null

            return (
              <Card key={group.name}>
                <CardHeader>
                  <CardTitle>{group.name}</CardTitle>
                  <CardDescription>
                    {groupTemplates.length} Vorlage{groupTemplates.length !== 1 ? 'n' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Vorlage</TableHead>
                        <TableHead>Kanal</TableHead>
                        <TableHead>Betreff</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Aktualisiert</TableHead>
                        <TableHead className="text-right">Aktionen</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {groupTemplates.map((template) => {
                        const channel = channelConfig[template.channel]
                        const ChannelIcon = channel.icon

                        return (
                          <TableRow key={template.id}>
                            <TableCell>
                              <div>
                                <div className="font-medium">{template.name}</div>
                                <div className="text-sm text-muted-foreground">
                                  {template.description}
                                </div>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="gap-1">
                                <ChannelIcon className="h-3 w-3" />
                                {channel.label}
                              </Badge>
                            </TableCell>
                            <TableCell className="max-w-xs truncate">
                              {template.subject || '-'}
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Switch checked={template.isActive} />
                                <span className="text-sm text-muted-foreground">
                                  {template.isActive ? 'Aktiv' : 'Inaktiv'}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell className="text-sm text-muted-foreground">
                              {formatDate(template.lastUpdated)}
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex justify-end gap-2">
                                <Button variant="ghost" size="icon" title="Vorschau">
                                  <Eye className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Bearbeiten">
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" title="Test senden">
                                  <Send className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        )
                      })}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            )
          })}

          {/* Template Variables Reference */}
          <Card>
            <CardHeader>
              <CardTitle>Verfügbare Variablen</CardTitle>
              <CardDescription>
                Diese Variablen können in den Vorlagen verwendet werden
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="space-y-2">
                  <h4 className="font-medium">Allgemein</h4>
                  <div className="space-y-1 text-sm">
                    {['salon_name', 'salon_address', 'salon_phone', 'salon_email', 'current_year'].map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{`{{${v}}}`}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Kunde</h4>
                  <div className="space-y-1 text-sm">
                    {['customer_name', 'customer_first_name', 'customer_email'].map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{`{{${v}}}`}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <h4 className="font-medium">Termin</h4>
                  <div className="space-y-1 text-sm">
                    {['appointment_date', 'appointment_time', 'services_list', 'staff_name', 'total_price'].map((v) => (
                      <div key={v} className="flex items-center gap-2">
                        <code className="bg-muted px-1.5 py-0.5 rounded text-xs">{`{{${v}}}`}</code>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Versandprotokoll</CardTitle>
              <CardDescription>
                Übersicht der zuletzt versendeten Benachrichtigungen
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Vorlage</TableHead>
                    <TableHead>Empfänger</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Gesendet</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {notificationLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.template}</TableCell>
                      <TableCell>{log.recipient}</TableCell>
                      <TableCell>
                        {log.status === 'sent' ? (
                          <Badge variant="default" className="gap-1">
                            <Check className="h-3 w-3" />
                            Gesendet
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="gap-1">
                            <X className="h-3 w-3" />
                            Fehlgeschlagen
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {formatDate(log.sentAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>E-Mail-Konfiguration</CardTitle>
              <CardDescription>
                Absender und allgemeine E-Mail-Einstellungen
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Absendername</label>
                  <Input defaultValue="SCHNITTWERK" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Antwort-Adresse</label>
                  <Input defaultValue="info@schnittwerk.ch" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Automatische Benachrichtigungen</CardTitle>
              <CardDescription>
                Aktivieren oder deaktivieren Sie automatische E-Mails
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Buchungsbestätigungen</div>
                  <div className="text-sm text-muted-foreground">
                    E-Mail nach jeder erfolgreichen Buchung
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Terminerinnerungen</div>
                  <div className="text-sm text-muted-foreground">
                    24 Stunden vor dem Termin
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Bestellbestätigungen</div>
                  <div className="text-sm text-muted-foreground">
                    E-Mail nach jeder Shop-Bestellung
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between py-2">
                <div>
                  <div className="font-medium">Versandbenachrichtigungen</div>
                  <div className="text-sm text-muted-foreground">
                    E-Mail wenn Bestellung versendet wird
                  </div>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Test-E-Mail senden</CardTitle>
              <CardDescription>
                Senden Sie eine Test-E-Mail an Ihre Adresse
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Input placeholder="test@example.com" className="max-w-sm" />
                <Select defaultValue="booking_confirmation">
                  <SelectTrigger className="w-64">
                    <SelectValue placeholder="Vorlage wählen" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.filter((t) => t.channel === 'email').map((t) => (
                      <SelectItem key={t.id} value={t.key}>
                        {t.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button>
                  <Send className="mr-2 h-4 w-4" />
                  Test senden
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
