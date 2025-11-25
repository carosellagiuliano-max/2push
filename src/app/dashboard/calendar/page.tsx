'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { Plus, RefreshCw } from 'lucide-react'
import { startOfWeek, endOfWeek } from 'date-fns'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import {
  DashboardHeader,
  Calendar,
  QuickAppointmentModal,
  getCalendarData,
  getServicesForCalendar,
  createAdminAppointment,
  cancelAppointment,
  completeAppointment,
  markNoShow,
  searchCustomers,
  createWalkInCustomer,
} from '@/features/dashboard'
import type { CalendarEvent, StaffColumn } from '@/features/dashboard'

// Default salon ID - in production this would come from context/session
const DEFAULT_SALON_ID = process.env.NEXT_PUBLIC_DEFAULT_SALON_ID || 'default-salon'

export default function CalendarPage() {
  const router = useRouter()
  const { toast } = useToast()

  const [events, setEvents] = React.useState<CalendarEvent[]>([])
  const [staff, setStaff] = React.useState<StaffColumn[]>([])
  const [services, setServices] = React.useState<
    Array<{ id: string; name: string; duration_minutes: number; price?: number }>
  >([])
  const [isLoading, setIsLoading] = React.useState(true)
  const [isRefreshing, setIsRefreshing] = React.useState(false)

  const [isQuickModalOpen, setIsQuickModalOpen] = React.useState(false)
  const [selectedSlot, setSelectedSlot] = React.useState<{
    staffId: string
    time: Date
  } | null>(null)

  const [currentDate, setCurrentDate] = React.useState(new Date())

  // Calculate date range for data fetching
  const getDateRange = React.useCallback((date: Date) => {
    const start = startOfWeek(date, { weekStartsOn: 1 })
    const end = endOfWeek(date, { weekStartsOn: 1 })
    return { start, end }
  }, [])

  // Fetch calendar data
  const fetchCalendarData = React.useCallback(
    async (showRefreshIndicator = false) => {
      if (showRefreshIndicator) {
        setIsRefreshing(true)
      }

      try {
        const { start, end } = getDateRange(currentDate)

        const [calendarData, servicesData] = await Promise.all([
          getCalendarData({
            salonId: DEFAULT_SALON_ID,
            startDate: start,
            endDate: end,
          }),
          getServicesForCalendar(DEFAULT_SALON_ID),
        ])

        setEvents(calendarData.events)
        setStaff(calendarData.staff)
        setServices(servicesData)
      } catch (error) {
        console.error('Failed to fetch calendar data:', error)
        toast({
          title: 'Fehler',
          description: 'Kalenderdaten konnten nicht geladen werden',
          variant: 'destructive',
        })
      } finally {
        setIsLoading(false)
        setIsRefreshing(false)
      }
    },
    [currentDate, getDateRange, toast]
  )

  // Initial data fetch
  React.useEffect(() => {
    fetchCalendarData()
  }, [fetchCalendarData])

  // Handle slot click - open quick appointment modal
  const handleSlotClick = (staffId: string, time: Date) => {
    setSelectedSlot({ staffId, time })
    setIsQuickModalOpen(true)
  }

  // Handle quick appointment submission
  const handleQuickAppointment = async (data: {
    customerId: string
    staffId: string
    serviceIds: string[]
    startsAt: Date
    notes?: string
  }) => {
    try {
      const result = await createAdminAppointment({
        salonId: DEFAULT_SALON_ID,
        customerId: data.customerId,
        staffId: data.staffId,
        serviceIds: data.serviceIds,
        startsAt: data.startsAt.toISOString(),
        notes: data.notes,
      })

      if (result.success) {
        toast({
          title: 'Termin erstellt',
          description: 'Der Termin wurde erfolgreich erstellt',
        })
        setIsQuickModalOpen(false)
        setSelectedSlot(null)
        fetchCalendarData(true)
      } else {
        toast({
          title: 'Fehler',
          description: result.error || 'Termin konnte nicht erstellt werden',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive',
      })
    }
  }

  // Handle appointment edit
  const handleEventEdit = (event: CalendarEvent) => {
    if (event.appointment) {
      router.push(`/dashboard/appointments/${event.appointment.id}/edit`)
    }
  }

  // Handle appointment cancel
  const handleEventCancel = async (event: CalendarEvent) => {
    if (!event.appointment) return

    const confirmed = window.confirm(
      `Möchten Sie den Termin von ${event.title} wirklich stornieren?`
    )

    if (!confirmed) return

    try {
      const result = await cancelAppointment(
        event.appointment.id,
        DEFAULT_SALON_ID,
        'Vom Administrator storniert',
        'admin'
      )

      if (result.success) {
        toast({
          title: 'Termin storniert',
          description: 'Der Termin wurde erfolgreich storniert',
        })
        fetchCalendarData(true)
      } else {
        toast({
          title: 'Fehler',
          description: result.error || 'Termin konnte nicht storniert werden',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive',
      })
    }
  }

  // Handle appointment complete
  const handleEventComplete = async (event: CalendarEvent) => {
    if (!event.appointment) return

    try {
      const result = await completeAppointment(event.appointment.id, DEFAULT_SALON_ID)

      if (result.success) {
        toast({
          title: 'Termin abgeschlossen',
          description: 'Der Termin wurde als abgeschlossen markiert',
        })
        fetchCalendarData(true)
      } else {
        toast({
          title: 'Fehler',
          description: result.error || 'Termin konnte nicht abgeschlossen werden',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive',
      })
    }
  }

  // Handle no-show
  const handleEventNoShow = async (event: CalendarEvent) => {
    if (!event.appointment) return

    const confirmed = window.confirm(
      `Möchten Sie ${event.title} als No-Show markieren?`
    )

    if (!confirmed) return

    try {
      const result = await markNoShow(
        event.appointment.id,
        DEFAULT_SALON_ID,
        'admin',
        false
      )

      if (result.success) {
        toast({
          title: 'No-Show markiert',
          description: 'Der Termin wurde als No-Show markiert',
        })
        fetchCalendarData(true)
      } else {
        toast({
          title: 'Fehler',
          description: result.error || 'No-Show konnte nicht markiert werden',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ein unerwarteter Fehler ist aufgetreten',
        variant: 'destructive',
      })
    }
  }

  // Handle customer search for quick appointment modal
  const handleCustomerSearch = async (query: string) => {
    if (query.length < 2) return []
    return searchCustomers(DEFAULT_SALON_ID, query)
  }

  // Handle walk-in customer creation
  const handleCreateWalkIn = async (
    firstName: string,
    lastName: string,
    phone?: string
  ) => {
    const result = await createWalkInCustomer(
      DEFAULT_SALON_ID,
      firstName,
      lastName,
      phone
    )
    return result
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col h-screen">
        <DashboardHeader
          title="Kalender"
          description="Verwalten Sie Ihre Termine"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="h-8 w-8 animate-spin text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Lade Kalender...</p>
          </div>
        </div>
      </div>
    )
  }

  // Empty state - no staff configured
  if (staff.length === 0) {
    return (
      <div className="flex flex-col h-screen">
        <DashboardHeader
          title="Kalender"
          description="Verwalten Sie Ihre Termine"
        />
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center max-w-md">
            <h2 className="text-xl font-semibold mb-2">Keine Mitarbeiter</h2>
            <p className="text-muted-foreground mb-4">
              Bitte fügen Sie zuerst Mitarbeiter hinzu, um den Kalender nutzen zu können.
            </p>
            <Button onClick={() => router.push('/dashboard/team')}>
              Zum Team
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader
        title="Kalender"
        description="Verwalten Sie Ihre Termine"
        actions={
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={() => fetchCalendarData(true)}
              disabled={isRefreshing}
            >
              <RefreshCw
                className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
              />
            </Button>
            <Button onClick={() => setIsQuickModalOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Neuer Termin
            </Button>
          </div>
        }
      />

      <div className="flex-1 overflow-hidden">
        <Calendar
          events={events}
          staff={staff}
          onSlotClick={handleSlotClick}
          onEventEdit={handleEventEdit}
          onEventCancel={handleEventCancel}
          onEventComplete={handleEventComplete}
          onEventNoShow={handleEventNoShow}
        />
      </div>

      <QuickAppointmentModal
        open={isQuickModalOpen}
        onOpenChange={(open) => {
          setIsQuickModalOpen(open)
          if (!open) setSelectedSlot(null)
        }}
        staff={staff}
        services={services}
        initialDate={selectedSlot?.time}
        initialStaffId={selectedSlot?.staffId}
        onSubmit={handleQuickAppointment}
        onCustomerSearch={handleCustomerSearch}
        onCreateWalkIn={handleCreateWalkIn}
      />
    </div>
  )
}
