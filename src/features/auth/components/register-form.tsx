'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Loader2, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { signUp } from '../actions'

export function RegisterForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, setIsPending] = React.useState(false)
  const [emailSent, setEmailSent] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const result = await signUp(formData)

    if (result.success) {
      if (result.message) {
        // Email confirmation required
        setEmailSent(true)
        toast({
          title: 'E-Mail gesendet',
          description: result.message,
          variant: 'success',
        })
      } else {
        toast({
          title: 'Willkommen!',
          description: 'Ihr Konto wurde erfolgreich erstellt.',
          variant: 'success',
        })
        router.push('/konto')
        router.refresh()
      }
    } else {
      toast({
        title: 'Registrierung fehlgeschlagen',
        description: result.error,
        variant: 'destructive',
      })
    }
    setIsPending(false)
  }

  if (emailSent) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl font-bold text-center">E-Mail bestätigen</CardTitle>
          <CardDescription className="text-center">
            Wir haben Ihnen eine E-Mail mit einem Bestätigungslink gesendet.
            Bitte überprüfen Sie Ihr Postfach und klicken Sie auf den Link, um Ihr Konto zu aktivieren.
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex flex-col gap-4">
          <Button variant="outline" asChild className="w-full">
            <Link href="/login">Zurück zur Anmeldung</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Konto erstellen</CardTitle>
        <CardDescription className="text-center">
          Erstellen Sie ein Konto, um Termine zu buchen und Ihre Bestellungen zu verwalten
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">Vorname</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Max"
                required
                disabled={isPending}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Nachname</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Muster"
                required
                disabled={isPending}
              />
            </div>
          </div>
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
          <div className="space-y-2">
            <Label htmlFor="password">Passwort</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mindestens 8 Zeichen"
              required
              minLength={8}
              disabled={isPending}
            />
          </div>
          <p className="text-xs text-muted-foreground">
            Mit der Registrierung akzeptieren Sie unsere{' '}
            <Link href="/agb" className="text-primary hover:underline">AGB</Link>
            {' '}und{' '}
            <Link href="/datenschutz" className="text-primary hover:underline">Datenschutzbestimmungen</Link>.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird registriert...
              </>
            ) : (
              'Registrieren'
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Bereits ein Konto?{' '}
            <Link href="/login" className="text-primary hover:underline">
              Jetzt anmelden
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
