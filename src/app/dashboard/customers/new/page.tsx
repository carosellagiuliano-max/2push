'use client'

import * as React from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import { CustomerForm } from '@/features/customers'

const mockStaff = [
  { id: '1', display_name: 'Anna Müller', color: '#E11D48' },
  { id: '2', display_name: 'Marco Rossi', color: '#2563EB' },
  { id: '3', display_name: 'Julia Weber', color: '#059669' },
]

export default function NewCustomerPage() {
  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Neuer Kunde"
        description="Erfassen Sie einen neuen Kunden"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück
            </Link>
          </Button>
        }
      />

      <div className="flex-1 p-6 max-w-2xl">
        <CustomerForm
          salonId="1"
          staff={mockStaff}
        />
      </div>
    </div>
  )
}
