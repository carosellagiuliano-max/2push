'use client'

import * as React from 'react'
import { Plus, RefreshCw, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  DashboardHeader,
  StatsCards,
  UpcomingAppointments,
  QuickAppointmentModal,
  getDashboardData,
  getCurrentUserSalonId,
  createAdminAppointment,
  searchCustomers,
  createWalkInCustomer,
} from '@/features/dashboard'
import { useToast } from '@/components/ui/use-toast'
import type { DashboardStats, CalendarAppointment, StaffColumn } from '@/features/dashboard'

export default function DashboardPage() {
  const { toast } = useToast()
  const [salonId, setSalonId] = React.useState<string | null>(null)
  const [isQuickModalOpen, setIsQuickModalOpen] = React.useState(false)
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  // Dashboard data state
  const [stats, setStats] = React.useState<DashboardStats>({
    todayAppointments: 0,
    upcomingAppointments: 0,
    todayRevenue: 0,
    weekRevenue: 0,
    newCustomers: 0,
    noShows: 0,
  })
  const [upcomingAppointments, setUpcomingAppointments] = React.useState<CalendarAppointment[]>([])
  const [staff, setStaff] = React.useState<StaffColumn[]>([])
  const [services, setServices] = React.useState<Array<{ id: string; name: string; duration_minutes: number }>>([])

  const fetchData = React.useCallback(async (currentSalonId: string) => {
    try {
      const data = await getDashboardData(currentSalonId)
      setStats(data.stats)
      setUpcomingAppointments(data.upcomingAppointments)
      setStaff(data.staff)
      setServices(data.services)
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
      toast({
        title: 'Fehler',
        description: 'Dashboard-Daten konnten nicht geladen werden.',
        variant: 'destructive',
      })
    }
  }, [toast])

  // Load salon ID on mount
  React.useEffect(() => {
    const loadSalonId = async () => {
      const id = await getCurrentUserSalonId()
      setSalonId(id)
    }
    loadSalonId()
  }, [])

  // Fetch data when salon ID is available
  React.useEffect(() => {
    if (salonId) {
      const loadData = async () => {
        setIsLoading(true)
        await fetchData(salonId)
        setIsLoading(false)
      }
      loadData()
    }
  }, [salonId, fetchData])

  // Refresh handler
  const handleRefresh = async () => {
    if (!salonId) return
    setIsRefreshing(true)
    await fetchData(salonId)
    setIsRefreshing(false)
    toast({
      title: 'Aktualisiert',
      description: 'Dashboard-Daten wurden aktualisiert.',
    })
  }

  // Customer search for quick appointment modal
  const handleCustomerSearch = async (query: string) => {
    if (!salonId) return []
    const results = await searchCustomers(salonId, query)
    return results.map((c) => ({
      id: c.id,
      first_name: c.firstName,
      last_name: c.lastName,
      email: c.email,
      phone: c.phone,
    }))
  }

  // Create walk-in customer
  const handleCreateWalkIn = async (firstName: string, lastName: string, phone?: string) => {
    if (!salonId) return { success: false, error: 'Salon nicht gefunden' }
    return createWalkInCustomer(salonId, firstName, lastName, phone)
  }

  // Create quick appointment
  const handleQuickAppointment = async (data: {
    customerId: string
    staffId: string
    serviceIds: string[]
    startsAt: Date
    notes?: string
  }) => {
    if (!salonId) return
    const result = await createAdminAppointment({
      salonId: salonId,
      customerId: data.customerId,
      staffId: data.staffId,
      serviceIds: data.serviceIds,
      startsAt: data.startsAt.toISOString(),
      notes: data.notes,
    })

    if (result.success) {
      toast({
        title: 'Termin erstellt',
        description: 'Der Termin wurde erfolgreich erstellt.',
      })
      setIsQuickModalOpen(false)
      // Refresh dashboard data
      await fetchData(salonId)
    } else {
      toast({
        title: 'Fehler',
        description: result.error || 'Termin konnte nicht erstellt werden.',
        variant: 'destructive',
      })
    }
  }

  if (isLoading) {
    return (
      <div className="flex flex-col">
        <DashboardHeader
          title="Dashboard"
          description="Willkommen zurück! Hier ist Ihr Tagesüberblick."
        />
        <div className="flex-1 p-6 flex items-center justify-center min-h-[400px]">
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Lade Dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col">
      <DashboardHeader
        title="Dashboard"
        description="Willkommen zurück! Hier ist Ihr Tagesüberblick."
        actions={
          <div className="flex gap-2">
            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </Button>
            <Button onClick={() => setIsQuickModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Termin
            </Button>
          </div>
        }
      />

      <div className="flex-1 p-6 space-y-6">
        <StatsCards stats={stats} />

        <div className="grid gap-6 lg:grid-cols-2">
          <UpcomingAppointments appointments={upcomingAppointments} />

          {/* Quick actions card */}
          <div className="space-y-4">
            {/* Can add more widgets here */}
          </div>
        </div>
      </div>

      <QuickAppointmentModal
        open={isQuickModalOpen}
        onOpenChange={setIsQuickModalOpen}
        staff={staff}
        services={services}
        onSubmit={handleQuickAppointment}
        onCustomerSearch={handleCustomerSearch}
        onCreateWalkIn={handleCreateWalkIn}
      />
    </div>
  )
}
