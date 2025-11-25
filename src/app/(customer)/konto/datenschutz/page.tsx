'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import {
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
  Mail,
  Smartphone,
  BarChart3,
  Users,
  Gift,
  CheckCircle2,
} from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useToast } from '@/components/ui/use-toast'
import {
  exportMyData,
  deleteMyAccount,
  getMyConsents,
  updateMyConsent,
  type ConsentCategory,
  type CustomerConsent,
} from '@/features/customer'

const CONSENT_CONFIG: Array<{
  category: ConsentCategory
  label: string
  description: string
  icon: React.ElementType
}> = [
  {
    category: 'marketing_email',
    label: 'E-Mail Marketing',
    description: 'Erhalten Sie Neuigkeiten, Angebote und Tipps per E-Mail',
    icon: Mail,
  },
  {
    category: 'marketing_sms',
    label: 'SMS Benachrichtigungen',
    description: 'Terminerinnerungen und Angebote per SMS',
    icon: Smartphone,
  },
  {
    category: 'loyalty_program',
    label: 'Treueprogramm',
    description: 'Sammeln Sie Punkte und erhalten Sie Prämien',
    icon: Gift,
  },
  {
    category: 'analytics',
    label: 'Nutzungsanalyse',
    description: 'Helfen Sie uns, unsere Dienste zu verbessern',
    icon: BarChart3,
  },
  {
    category: 'partner_sharing',
    label: 'Partner-Angebote',
    description: 'Erhalten Sie Angebote von ausgewählten Partnern',
    icon: Users,
  },
]

export default function DatenschutzPage() {
  const { toast } = useToast()
  const router = useRouter()

  const [isLoading, setIsLoading] = React.useState(true)
  const [isExporting, setIsExporting] = React.useState(false)
  const [isDeleting, setIsDeleting] = React.useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = React.useState(false)
  const [consents, setConsents] = React.useState<CustomerConsent[]>([])
  const [updatingConsent, setUpdatingConsent] = React.useState<ConsentCategory | null>(null)

  // Load consents on mount
  React.useEffect(() => {
    const loadConsents = async () => {
      const data = await getMyConsents()
      setConsents(data)
      setIsLoading(false)
    }
    loadConsents()
  }, [])

  // Get consent status for a category
  const getConsentStatus = (category: ConsentCategory): boolean => {
    const consent = consents.find((c) => c.category === category)
    return consent?.status === 'given'
  }

  // Handle consent toggle
  const handleConsentToggle = async (category: ConsentCategory) => {
    const currentStatus = getConsentStatus(category)
    const newStatus = currentStatus ? 'withdrawn' : 'given'

    setUpdatingConsent(category)
    const result = await updateMyConsent(category, newStatus)
    setUpdatingConsent(null)

    if (result.success) {
      // Update local state
      setConsents((prev) => {
        const existing = prev.find((c) => c.category === category)
        if (existing) {
          return prev.map((c) =>
            c.category === category ? { ...c, status: newStatus, recordedAt: new Date().toISOString() } : c
          )
        }
        return [...prev, { category, status: newStatus, recordedAt: new Date().toISOString() }]
      })
      toast({
        title: 'Einstellung gespeichert',
        description: `${CONSENT_CONFIG.find((c) => c.category === category)?.label} wurde ${newStatus === 'given' ? 'aktiviert' : 'deaktiviert'}.`,
      })
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Einstellung konnte nicht gespeichert werden.',
        variant: 'destructive',
      })
    }
  }

  // Handle data export
  const handleExport = async () => {
    setIsExporting(true)

    const result = await exportMyData()

    if (result.success && result.data) {
      // Create and download JSON file
      const blob = new Blob([JSON.stringify(result.data, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `meine-daten-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: 'Daten exportiert',
        description: 'Ihre Daten wurden als JSON-Datei heruntergeladen.',
      })
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Daten konnten nicht exportiert werden.',
        variant: 'destructive',
      })
    }

    setIsExporting(false)
  }

  // Handle account deletion
  const handleDelete = async () => {
    setIsDeleting(true)

    const result = await deleteMyAccount()

    if (result.success) {
      toast({
        title: 'Konto gelöscht',
        description: 'Ihr Konto wurde erfolgreich gelöscht. Sie werden abgemeldet.',
      })
      // Redirect to home after short delay
      setTimeout(() => {
        router.push('/')
      }, 2000)
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Konto konnte nicht gelöscht werden.',
        variant: 'destructive',
      })
      setIsDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Datenschutz</h1>
        <p className="text-muted-foreground mt-1">
          Verwalten Sie Ihre Datenschutzeinstellungen und persönlichen Daten
        </p>
      </div>

      {/* Consent Management */}
      <Card>
        <CardHeader>
          <CardTitle>Einwilligungen</CardTitle>
          <CardDescription>
            Steuern Sie, wie wir Ihre Daten verwenden dürfen. Sie können Ihre Einwilligungen jederzeit ändern.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {CONSENT_CONFIG.map((config, index) => {
            const Icon = config.icon
            const isEnabled = getConsentStatus(config.category)
            const isUpdating = updatingConsent === config.category

            return (
              <React.Fragment key={config.category}>
                {index > 0 && <Separator />}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <div className="p-2 bg-muted rounded-lg">
                      <Icon className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor={config.category} className="text-base font-medium cursor-pointer">
                        {config.label}
                      </Label>
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isUpdating && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
                    <Switch
                      id={config.category}
                      checked={isEnabled}
                      onCheckedChange={() => handleConsentToggle(config.category)}
                      disabled={isUpdating}
                    />
                  </div>
                </div>
              </React.Fragment>
            )
          })}
        </CardContent>
      </Card>

      {/* Data Export */}
      <Card>
        <CardHeader>
          <CardTitle>Meine Daten exportieren</CardTitle>
          <CardDescription>
            Laden Sie alle Ihre gespeicherten Daten als JSON-Datei herunter. Dies beinhaltet Ihre Profildaten, Termine,
            Bestellungen und Einwilligungen.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm">DSGVO Art. 20 - Recht auf Datenübertragbarkeit</span>
            </div>
            <Button onClick={handleExport} disabled={isExporting} variant="outline">
              {isExporting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Exportiere...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Daten herunterladen
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Account Deletion */}
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Konto löschen
          </CardTitle>
          <CardDescription>
            Löschen Sie Ihr Konto und alle zugehörigen Daten. Diese Aktion kann nicht rückgängig gemacht werden.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              <span className="text-sm">DSGVO Art. 17 - Recht auf Löschung</span>
            </div>
            <Button variant="destructive" onClick={() => setShowDeleteDialog(true)} disabled={isDeleting}>
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Lösche...
                </>
              ) : (
                <>
                  <Trash2 className="mr-2 h-4 w-4" />
                  Konto löschen
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Konto wirklich löschen?
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-2">
              <p>
                Diese Aktion kann <strong>nicht rückgängig</strong> gemacht werden. Es werden:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Alle Ihre persönlichen Daten anonymisiert</li>
                <li>Ihre Einwilligungen gelöscht</li>
                <li>Ihr Konto deaktiviert</li>
              </ul>
              <p className="pt-2">Bereits gebuchte Termine bleiben bestehen, werden aber nicht mehr mit Ihrem Konto verknüpft.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Abbrechen</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Lösche...
                </>
              ) : (
                'Ja, Konto löschen'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
