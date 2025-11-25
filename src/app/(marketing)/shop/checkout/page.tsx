import type { Metadata } from 'next'
import { getShippingMethods } from '@/features/shop'
import { CheckoutForm } from './checkout-form'

export const metadata: Metadata = {
  title: 'Kasse | SCHNITTWERK Shop',
  description: 'Schliessen Sie Ihre Bestellung ab.',
}

export default async function CheckoutPage() {
  const shippingMethods = await getShippingMethods()

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-wide">
        <h1 className="text-3xl font-bold text-salon-charcoal mb-8">Kasse</h1>
        <CheckoutForm shippingMethods={shippingMethods} />
      </div>
    </div>
  )
}
