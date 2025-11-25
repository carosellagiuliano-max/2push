'use client'

import * as React from 'react'
import Link from 'next/link'
import { Loader2, ArrowLeft, Mail } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { requestPasswordReset } from '../actions'

export function ForgotPasswordForm() {
  const { toast } = useToast()
  const [isPending, setIsPending] = React.useState(false)
  const [isSubmitted, setIsSubmitted] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const result = await requestPasswordReset(formData)

    if (result.success) {
      setIsSubmitted(true)
      toast({
        title: 'E-Mail gesendet',
        description: 'Falls ein Konto mit dieser E-Mail existiert, erhalten Sie einen Link zum Zurücksetzen.',
      })
    } else {
      toast({
        title: 'Fehler',
        description: result.error,
        variant: 'destructive',
      })
    }

    setIsPending(false)
  }

  if (isSubmitted) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto p-3 bg-primary/10 rounded-full w-fit mb-2">
            <Mail className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold">Prüfen Sie Ihre E-Mails</CardTitle>
          <CardDescription>
            Wir haben Ihnen einen Link zum Zurücksetzen Ihres Passworts gesendet.
            Der Link ist 24 Stunden gültig.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-sm text-muted-foreground text-center space-y-2">
            <p>Keine E-Mail erhalten?</p>
            <ul className="list-disc list-inside text-left pl-4">
              <li>Überprüfen Sie Ihren Spam-Ordner</li>
              <li>Stellen Sie sicher, dass die E-Mail-Adresse korrekt war</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button variant="outline" className="w-full" onClick={() => setIsSubmitted(false)}>
            Erneut versuchen
          </Button>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Anmeldung
          </Link>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Passwort vergessen?</CardTitle>
        <CardDescription className="text-center">
          Geben Sie Ihre E-Mail-Adresse ein und wir senden Ihnen einen Link zum Zurücksetzen.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="name@beispiel.ch"
              required
              disabled={isPending}
            />
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gesendet...
              </>
            ) : (
              'Link zum Zurücksetzen senden'
            )}
          </Button>
          <Link href="/login" className="text-sm text-muted-foreground hover:text-primary flex items-center justify-center gap-1">
            <ArrowLeft className="h-4 w-4" />
            Zurück zur Anmeldung
          </Link>
        </CardFooter>
      </form>
    </Card>
  )
}
