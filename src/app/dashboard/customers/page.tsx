'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DashboardHeader } from '@/features/dashboard'
import {
  CustomerSearch,
  CustomerFilters,
  CustomerTable,
  CustomerPagination,
} from '@/features/customers'
import type { CustomerFilterValues, CustomerWithStats } from '@/features/customers'

// Mock data for development
const mockCustomers: CustomerWithStats[] = [
  {
    id: '1',
    salon_id: '1',
    profile_id: null,
    first_name: 'Max',
    last_name: 'Mustermann',
    email: 'max@example.ch',
    phone: '+41 79 123 45 67',
    birthday: '1985-03-15',
    preferred_staff_id: '1',
    preferred_staff_name: 'Anna Müller',
    notes: null,
    accepts_marketing: true,
    first_visit_at: '2023-01-15T10:00:00Z',
    last_visit_at: '2024-11-20T14:00:00Z',
    total_visits: 24,
    total_spend: 2450,
    is_active: true,
    created_at: '2023-01-15T10:00:00Z',
    updated_at: '2024-11-20T14:00:00Z',
  },
  {
    id: '2',
    salon_id: '1',
    profile_id: null,
    first_name: 'Laura',
    last_name: 'Schmidt',
    email: 'laura@example.ch',
    phone: '+41 79 234 56 78',
    birthday: '1990-07-22',
    preferred_staff_id: '2',
    preferred_staff_name: 'Marco Rossi',
    notes: 'Allergisch gegen bestimmte Produkte',
    accepts_marketing: false,
    first_visit_at: '2023-06-10T09:00:00Z',
    last_visit_at: '2024-11-18T16:30:00Z',
    total_visits: 18,
    total_spend: 1890,
    is_active: true,
    created_at: '2023-06-10T09:00:00Z',
    updated_at: '2024-11-18T16:30:00Z',
  },
  {
    id: '3',
    salon_id: '1',
    profile_id: null,
    first_name: 'Thomas',
    last_name: 'Meier',
    email: 'thomas@example.ch',
    phone: '+41 79 345 67 89',
    birthday: null,
    preferred_staff_id: null,
    preferred_staff_name: undefined,
    notes: null,
    accepts_marketing: true,
    first_visit_at: '2024-02-01T11:00:00Z',
    last_visit_at: '2024-10-15T10:00:00Z',
    total_visits: 8,
    total_spend: 680,
    is_active: true,
    created_at: '2024-02-01T11:00:00Z',
    updated_at: '2024-10-15T10:00:00Z',
  },
  {
    id: '4',
    salon_id: '1',
    profile_id: null,
    first_name: 'Sarah',
    last_name: 'Weber',
    email: 'sarah@example.ch',
    phone: '+41 79 456 78 90',
    birthday: '1988-11-30',
    preferred_staff_id: '3',
    preferred_staff_name: 'Julia Weber',
    notes: 'VIP Kundin',
    accepts_marketing: true,
    first_visit_at: '2022-05-20T14:00:00Z',
    last_visit_at: '2024-11-22T09:30:00Z',
    total_visits: 45,
    total_spend: 5200,
    is_active: true,
    created_at: '2022-05-20T14:00:00Z',
    updated_at: '2024-11-22T09:30:00Z',
  },
  {
    id: '5',
    salon_id: '1',
    profile_id: null,
    first_name: 'Michael',
    last_name: 'Fischer',
    email: 'michael@example.ch',
    phone: '+41 79 567 89 01',
    birthday: null,
    preferred_staff_id: null,
    preferred_staff_name: undefined,
    notes: null,
    accepts_marketing: false,
    first_visit_at: '2024-08-05T15:00:00Z',
    last_visit_at: null,
    total_visits: 1,
    total_spend: 45,
    is_active: false,
    created_at: '2024-08-05T15:00:00Z',
    updated_at: '2024-08-05T15:00:00Z',
  },
]

export default function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [filters, setFilters] = React.useState<CustomerFilterValues>({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as CustomerFilterValues['status']) || 'active',
    sortBy: (searchParams.get('sortBy') as CustomerFilterValues['sortBy']) || 'name',
    sortOrder: (searchParams.get('sortOrder') as CustomerFilterValues['sortOrder']) || 'asc',
  })

  const [page, setPage] = React.useState(1)
  const pageSize = 20

  // Filter and sort customers (mock implementation)
  const filteredCustomers = React.useMemo(() => {
    let result = [...mockCustomers]

    // Apply search
    if (filters.search) {
      const term = filters.search.toLowerCase()
      result = result.filter(
        (c) =>
          c.first_name.toLowerCase().includes(term) ||
          c.last_name.toLowerCase().includes(term) ||
          c.email?.toLowerCase().includes(term) ||
          c.phone?.includes(term)
      )
    }

    // Apply status filter
    if (filters.status === 'active') {
      result = result.filter((c) => c.is_active)
    } else if (filters.status === 'inactive') {
      result = result.filter((c) => !c.is_active)
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      switch (filters.sortBy) {
        case 'name':
          comparison = `${a.last_name} ${a.first_name}`.localeCompare(
            `${b.last_name} ${b.first_name}`
          )
          break
        case 'last_visit':
          comparison =
            (new Date(a.last_visit_at || 0).getTime()) -
            (new Date(b.last_visit_at || 0).getTime())
          break
        case 'total_visits':
          comparison = a.total_visits - b.total_visits
          break
        case 'total_spend':
          comparison = a.total_spend - b.total_spend
          break
        case 'created_at':
          comparison =
            new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
          break
      }
      return filters.sortOrder === 'desc' ? -comparison : comparison
    })

    return result
  }, [filters])

  const totalPages = Math.ceil(filteredCustomers.length / pageSize)
  const paginatedCustomers = filteredCustomers.slice(
    (page - 1) * pageSize,
    page * pageSize
  )

  const handleFiltersChange = (newFilters: CustomerFilterValues) => {
    setFilters(newFilters)
    setPage(1)

    // Update URL params
    const params = new URLSearchParams()
    if (newFilters.search) params.set('search', newFilters.search)
    if (newFilters.status && newFilters.status !== 'all')
      params.set('status', newFilters.status)
    if (newFilters.sortBy && newFilters.sortBy !== 'name')
      params.set('sortBy', newFilters.sortBy)
    if (newFilters.sortOrder && newFilters.sortOrder !== 'asc')
      params.set('sortOrder', newFilters.sortOrder)

    const queryString = params.toString()
    router.push(queryString ? `?${queryString}` : '/dashboard/customers', {
      scroll: false,
    })
  }

  const handleSearchChange = (search: string) => {
    handleFiltersChange({ ...filters, search })
  }

  const handleDelete = async (_customerId: string) => {
    // TODO: Implement with real API
  }

  const handleRestore = async (_customerId: string) => {
    // TODO: Implement with real API
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Kunden"
        description="Verwalten Sie Ihre Kundendaten"
        actions={
          <Button asChild>
            <Link href="/dashboard/customers/new">
              <Plus className="mr-2 h-4 w-4" />
              Neuer Kunde
            </Link>
          </Button>
        }
      />

      <div className="flex-1 p-6 space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 max-w-md">
            <CustomerSearch
              value={filters.search || ''}
              onChange={handleSearchChange}
            />
          </div>
          <CustomerFilters
            filters={filters}
            onChange={handleFiltersChange}
          />
        </div>

        {/* Customer Table */}
        <CustomerTable
          customers={paginatedCustomers}
          onDelete={handleDelete}
          onRestore={handleRestore}
        />

        {/* Pagination */}
        <CustomerPagination
          currentPage={page}
          totalPages={totalPages}
          totalItems={filteredCustomers.length}
          pageSize={pageSize}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}
