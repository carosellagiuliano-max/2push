'use client'

import * as React from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import {
  CustomerProfileCard,
  CustomerStatsCard,
  CustomerAppointmentHistoryCard,
} from '@/features/customers'
import type { CustomerDetail } from '@/features/customers'

// Mock data for development
const mockCustomerDetail: CustomerDetail = {
  id: '1',
  salon_id: '1',
  profile_id: null,
  first_name: 'Max',
  last_name: 'Mustermann',
  email: 'max@example.ch',
  phone: '+41 79 123 45 67',
  birthday: '1985-03-15',
  preferred_staff_id: '1',
  notes: 'Stammkunde seit 2023. Bevorzugt Termine am Vormittag. Allergisch gegen bestimmte Haarfärbemittel.',
  accepts_marketing: true,
  first_visit_at: '2023-01-15T10:00:00Z',
  last_visit_at: '2024-11-20T14:00:00Z',
  total_visits: 24,
  total_spend: 2450,
  is_active: true,
  created_at: '2023-01-15T10:00:00Z',
  updated_at: '2024-11-20T14:00:00Z',
  preferred_staff: {
    id: '1',
    display_name: 'Anna Müller',
    color: '#E11D48',
  },
  appointments: [
    {
      id: 'apt-1',
      starts_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      ends_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 45 * 60 * 1000).toISOString(),
      status: 'confirmed',
      total_price: 85,
      staff: { id: '1', display_name: 'Anna Müller', color: '#E11D48' },
      services: [
        { id: '1', name: 'Herrenschnitt', price: 45 },
        { id: '2', name: 'Bartpflege', price: 25 },
      ],
    },
    {
      id: 'apt-2',
      starts_at: '2024-11-20T14:00:00Z',
      ends_at: '2024-11-20T14:45:00Z',
      status: 'completed',
      total_price: 70,
      staff: { id: '1', display_name: 'Anna Müller', color: '#E11D48' },
      services: [{ id: '1', name: 'Herrenschnitt', price: 45 }],
    },
    {
      id: 'apt-3',
      starts_at: '2024-10-15T10:00:00Z',
      ends_at: '2024-10-15T10:45:00Z',
      status: 'completed',
      total_price: 85,
      staff: { id: '1', display_name: 'Anna Müller', color: '#E11D48' },
      services: [
        { id: '1', name: 'Herrenschnitt', price: 45 },
        { id: '2', name: 'Bartpflege', price: 25 },
      ],
    },
    {
      id: 'apt-4',
      starts_at: '2024-09-10T11:00:00Z',
      ends_at: '2024-09-10T11:30:00Z',
      status: 'completed',
      total_price: 45,
      staff: { id: '2', display_name: 'Marco Rossi', color: '#2563EB' },
      services: [{ id: '1', name: 'Herrenschnitt', price: 45 }],
    },
    {
      id: 'apt-5',
      starts_at: '2024-08-05T09:00:00Z',
      ends_at: '2024-08-05T09:45:00Z',
      status: 'cancelled',
      total_price: 70,
      staff: { id: '1', display_name: 'Anna Müller', color: '#E11D48' },
      services: [{ id: '1', name: 'Herrenschnitt', price: 45 }],
    },
    {
      id: 'apt-6',
      starts_at: '2024-07-20T14:30:00Z',
      ends_at: '2024-07-20T15:15:00Z',
      status: 'completed',
      total_price: 85,
      staff: { id: '1', display_name: 'Anna Müller', color: '#E11D48' },
      services: [
        { id: '1', name: 'Herrenschnitt', price: 45 },
        { id: '2', name: 'Bartpflege', price: 25 },
      ],
    },
  ],
  statistics: {
    totalAppointments: 24,
    completedAppointments: 22,
    cancelledAppointments: 1,
    noShowCount: 1,
    averageSpend: 102,
    favoriteServices: [
      { name: 'Herrenschnitt', count: 24 },
      { name: 'Bartpflege', count: 12 },
      { name: 'Kopfmassage', count: 5 },
    ],
  },
}

export default function CustomerDetailPage() {
  const params = useParams()
  const customerId = params.id as string

  // TODO: Fetch real customer data
  const customer = { ...mockCustomerDetail, id: customerId }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title={`${customer.first_name} ${customer.last_name}`}
        description="Kundendetails und Terminhistorie"
        actions={
          <Button variant="outline" asChild>
            <Link href="/dashboard/customers">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zur Liste
            </Link>
          </Button>
        }
      />

      <div className="flex-1 p-6">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            <CustomerProfileCard customer={customer} />
            <CustomerAppointmentHistoryCard appointments={customer.appointments} />
          </div>

          {/* Sidebar */}
          <div>
            <CustomerStatsCard customer={customer} />
          </div>
        </div>
      </div>
    </div>
  )
}
