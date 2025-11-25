import type { Metadata } from 'next'
import { Suspense } from 'react'
import { LoginForm } from '@/features/auth'
import { Spinner } from '@/components/ui/spinner'

export const metadata: Metadata = {
  title: 'Anmelden | SCHNITTWERK',
  description: 'Melden Sie sich bei Ihrem SCHNITTWERK-Konto an.',
}

export default function LoginPage() {
  return (
    <div className="container-narrow">
      <Suspense fallback={<Spinner />}>
        <LoginForm />
      </Suspense>
    </div>
  )
}
