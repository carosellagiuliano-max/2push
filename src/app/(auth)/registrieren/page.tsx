import type { Metadata } from 'next'
import { RegisterForm } from '@/features/auth'

export const metadata: Metadata = {
  title: 'Registrieren | SCHNITTWERK',
  description: 'Erstellen Sie ein Konto bei SCHNITTWERK, um Termine zu buchen und Ihre Bestellungen zu verwalten.',
}

export default function RegisterPage() {
  return (
    <div className="container-narrow">
      <RegisterForm />
    </div>
  )
}
