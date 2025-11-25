'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import { CustomerForm } from '@/features/customers'
import type { Customer } from '@/lib/database.types'

// Mock data for development
const mockCustomer: Customer = {
  id: '1',
  salon_id: '1',
  profile_id: null,
  first_name: 'Max',
  last_name: 'Mustermann',
  email: 'max@example.ch',
  phone: '+41 79 123 45 67',
  birthday: '1985-03-15',
  preferred_staff_id: '1',
  notes: 'Stammkunde seit 2023. Bevorzugt Termine am Vormittag.',
  accepts_marketing: true,
  first_visit_at: '2023-01-15T10:00:00Z',
  last_visit_at: '2024-11-20T14:00:00Z',
  total_visits: 24,
  total_spend: 2450,
  is_active: true,
  created_at: '2023-01-15T10:00:00Z',
  updated_at: '2024-11-20T14:00:00Z',
}

const mockStaff = [
  { id: '1', display_name: 'Anna Müller', color: '#E11D48' },
  { id: '2', display_name: 'Marco Rossi', color: '#2563EB' },
  { id: '3', display_name: 'Julia Weber', color: '#059669' },
]

export default function EditCustomerPage() {
  const params = useParams()
  const customerId = params.id as string

  // TODO: Fetch real customer data
  const customer = { ...mockCustomer, id: customerId }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Kunde bearbeiten"
        description={`${customer.first_name} ${customer.last_name}`}
        actions={
          <Button variant="outline" asChild>
            <Link href={`/dashboard/customers/${customerId}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Link>
          </Button>
        }
      />

      <div className="flex-1 p-6 max-w-2xl">
        <CustomerForm
          salonId="1"
          customer={customer}
          staff={mockStaff}
        />
      </div>
    </div>
  )
}
