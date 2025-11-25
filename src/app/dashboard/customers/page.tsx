'use client'

import * as React from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Plus, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { DashboardHeader, getCurrentUserSalonId } from '@/features/dashboard'
import {
  CustomerSearch,
  CustomerFilters,
  CustomerTable,
  CustomerPagination,
  getCustomers,
  deleteCustomer,
  restoreCustomer,
} from '@/features/customers'
import type { CustomerFilterValues, CustomerWithStats, PaginatedCustomers } from '@/features/customers'
import { useToast } from '@/components/ui/use-toast'
import { SkeletonTable } from '@/components/ui/skeleton'

export default function CustomersPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [salonId, setSalonId] = React.useState<string | null>(null)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)
  const [customers, setCustomers] = React.useState<CustomerWithStats[]>([])
  const [pagination, setPagination] = React.useState<Omit<PaginatedCustomers, 'customers'>>({
    total: 0,
    page: 1,
    pageSize: 20,
    totalPages: 0,
  })

  const [filters, setFilters] = React.useState<CustomerFilterValues>({
    search: searchParams.get('search') || '',
    status: (searchParams.get('status') as CustomerFilterValues['status']) || 'active',
    sortBy: (searchParams.get('sortBy') as CustomerFilterValues['sortBy']) || 'name',
    sortOrder: (searchParams.get('sortOrder') as CustomerFilterValues['sortOrder']) || 'asc',
  })

  const [page, setPage] = React.useState(1)
  const pageSize = 20

  // Fetch salon ID on mount
  React.useEffect(() => {
    async function fetchSalonId() {
      const id = await getCurrentUserSalonId()
      setSalonId(id)
    }
    fetchSalonId()
  }, [])

  // Fetch customers when salon ID or filters change
  const fetchCustomers = React.useCallback(async (showRefreshing = false) => {
    if (!salonId) return

    if (showRefreshing) {
      setIsRefreshing(true)
    } else {
      setIsLoading(true)
    }

    try {
      const result = await getCustomers(salonId, filters, page, pageSize)
      setCustomers(result.customers)
      setPagination({
        total: result.total,
        page: result.page,
        pageSize: result.pageSize,
        totalPages: result.totalPages,
      })
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: 'Fehler',
        description: 'Kunden konnten nicht geladen werden.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }, [salonId, filters, page, pageSize, toast])

  React.useEffect(() => {
    if (salonId) {
      fetchCustomers()
    }
  }, [salonId, fetchCustomers])

  const handleRefresh = () => {
    fetchCustomers(true)
  }

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

  const handleDelete = async (customerId: string) => {
    if (!salonId) return

    const result = await deleteCustomer(customerId, salonId)
    if (result.success) {
      toast({
        title: 'Kunde deaktiviert',
        description: 'Der Kunde wurde erfolgreich deaktiviert.',
        variant: 'success',
      })
      fetchCustomers(true)
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Kunde konnte nicht deaktiviert werden.',
        variant: 'destructive',
      })
    }
  }

  const handleRestore = async (customerId: string) => {
    if (!salonId) return

    const result = await restoreCustomer(customerId, salonId)
    if (result.success) {
      toast({
        title: 'Kunde wiederhergestellt',
        description: 'Der Kunde wurde erfolgreich wiederhergestellt.',
        variant: 'success',
      })
      fetchCustomers(true)
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Kunde konnte nicht wiederhergestellt werden.',
        variant: 'destructive',
      })
    }
  }

  const handlePageChange = (newPage: number) => {
    setPage(newPage)
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Kunden"
        description="Verwalten Sie Ihre Kundendaten"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={handleRefresh}
              disabled={isRefreshing}
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button asChild>
              <Link href="/dashboard/customers/new">
                <Plus className="mr-2 h-4 w-4" />
                Neuer Kunde
              </Link>
            </Button>
          </div>
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
        {isLoading ? (
          <SkeletonTable rows={5} columns={6} />
        ) : (
          <CustomerTable
            customers={customers}
            onDelete={handleDelete}
            onRestore={handleRestore}
          />
        )}

        {/* Pagination */}
        {!isLoading && (
          <CustomerPagination
            currentPage={pagination.page}
            totalPages={pagination.totalPages}
            totalItems={pagination.total}
            pageSize={pagination.pageSize}
            onPageChange={handlePageChange}
          />
        )}
      </div>
    </div>
  )
}
