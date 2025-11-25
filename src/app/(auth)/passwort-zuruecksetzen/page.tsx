import type { Metadata } from 'next'
import { Suspense } from 'react'
import { ResetPasswordForm } from '@/features/auth'
import { Spinner } from '@/components/ui/spinner'

export const metadata: Metadata = {
  title: 'Neues Passwort | SCHNITTWERK',
  description: 'Legen Sie ein neues Passwort für Ihr SCHNITTWERK-Konto fest.',
}

export default function ResetPasswordPage() {
  return (
    <div className="container-narrow">
      <Suspense fallback={<Spinner />}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  )
}
