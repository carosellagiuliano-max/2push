import type { Metadata } from 'next'
import { ForgotPasswordForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Passwort vergessen | SCHNITTWERK',
  description: 'Setzen Sie Ihr SCHNITTWERK-Passwort zurück.',
}

export default function ForgotPasswordPage() {
  return (
    <div className="container-narrow">
      <ForgotPasswordForm />
    </div>
  )
}
