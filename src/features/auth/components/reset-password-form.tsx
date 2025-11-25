'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { useToast } from '@/components/ui/use-toast'
import { updatePassword } from '../actions'

export function ResetPasswordForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isPending, setIsPending] = React.useState(false)
  const [isSuccess, setIsSuccess] = React.useState(false)

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setIsPending(true)

    const formData = new FormData(event.currentTarget)
    const result = await updatePassword(formData)

    if (result.success) {
      setIsSuccess(true)
      toast({
        title: 'Passwort geändert',
        description: 'Ihr Passwort wurde erfolgreich aktualisiert.',
        variant: 'success',
      })
      // Redirect to login after a short delay
      setTimeout(() => {
        router.push('/login')
      }, 3000)
    } else {
      toast({
        title: 'Fehler',
        description: result.error,
        variant: 'destructive',
      })
      setIsPending(false)
    }
  }

  if (isSuccess) {
    return (
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto p-3 bg-green-100 rounded-full w-fit mb-2">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold">Passwort geändert!</CardTitle>
          <CardDescription>
            Ihr Passwort wurde erfolgreich aktualisiert.
            Sie werden in Kürze zur Anmeldung weitergeleitet.
          </CardDescription>
        </CardHeader>
        <CardFooter>
          <Button asChild className="w-full">
            <Link href="/login">Zur Anmeldung</Link>
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Neues Passwort festlegen</CardTitle>
        <CardDescription className="text-center">
          Wählen Sie ein sicheres Passwort für Ihr Konto
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="password">Neues Passwort</Label>
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
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Passwort bestätigen</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="Passwort wiederholen"
              required
              minLength={8}
              disabled={isPending}
            />
          </div>
          <div className="text-sm text-muted-foreground">
            <p>Ihr Passwort sollte:</p>
            <ul className="list-disc list-inside mt-1 space-y-0.5">
              <li>Mindestens 8 Zeichen lang sein</li>
              <li>Gross- und Kleinbuchstaben enthalten</li>
              <li>Mindestens eine Zahl enthalten</li>
            </ul>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col gap-4">
          <Button type="submit" className="w-full" disabled={isPending}>
            {isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Wird gespeichert...
              </>
            ) : (
              'Passwort speichern'
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
