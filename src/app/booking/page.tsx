import { Suspense } from 'react'
import { notFound } from 'next/navigation'

import { PublicLayout } from '@/components/layout'
import { LoadingPage } from '@/components/ui/spinner'
import { BookingWizard } from '@/features/booking'
import {
  getDefaultSalon,
  getServicesWithPrices,
  getServiceCategories,
  getBookableStaff,
} from '@/features/booking/actions'

export const metadata = {
  title: 'Termin buchen | SCHNITTWERK',
  description: 'Buchen Sie Ihren Termin online bei SCHNITTWERK - Ihr Premium-Salon in Zürich.',
}

async function BookingContent() {
  // Get default salon (or could be from URL params)
  const salon = await getDefaultSalon()

  if (!salon) {
    notFound()
  }

  // Fetch all booking data in parallel
  const [services, categories, staff] = await Promise.all([
    getServicesWithPrices(salon.id),
    getServiceCategories(salon.id),
    getBookableStaff(salon.id),
  ])

  return (
    <BookingWizard
      salonId={salon.id}
      services={services}
      categories={categories}
      staff={staff}
    />
  )
}

export default function BookingPage() {
  return (
    <PublicLayout>
      <Suspense fallback={<LoadingPage text="Buchungssystem wird geladen..." />}>
        <BookingContent />
      </Suspense>
    </PublicLayout>
  )
}
