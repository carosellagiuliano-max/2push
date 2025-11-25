'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { signIn } from '../actions'

export function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const [isPending, setIsPending] = React.useState(false)

  const redirectTo = searchParams.get('redirect') || '/konto'

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const result = await signIn(formData)

    if (result.success) {
      toast({
        title: 'Willkommen zurück!',
        description: 'Sie wurden erfolgreich angemeldet.',
        variant: 'success',
      })
      router.push(redirectTo)
      router.refresh()
    } else {
      toast({
        title: 'Anmeldung fehlgeschlagen',
        description: result.error,
        variant: 'destructive',
      })
      setIsPending(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Anmelden</CardTitle>
        <CardDescription className="text-center">
          Melden Sie sich bei Ihrem Konto an
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
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Passwort</Label>
              <Link
                href="/passwort-vergessen"
                className="text-sm text-muted-foreground hover:text-primary"
              >
                Passwort vergessen?
              </Link>
            </div>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="Mindestens 8 Zeichen"
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
                Wird angemeldet...
              </>
            ) : (
              'Anmelden'
            )}
          </Button>
          <p className="text-sm text-muted-foreground text-center">
            Noch kein Konto?{' '}
            <Link href="/registrieren" className="text-primary hover:underline">
              Jetzt registrieren
            </Link>
          </p>
        </CardFooter>
      </form>
    </Card>
  )
}
