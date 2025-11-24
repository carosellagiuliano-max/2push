'use client'

import * as React from 'react'
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useBooking, BookingProvider } from '../hooks/use-booking'
import { BookingStepper } from './booking-stepper'
import { BookingSummary } from './booking-summary'
import { ServiceSelection } from './service-selection'
import { StaffSelection } from './staff-selection'
import { TimeSlotPicker } from './time-slot-picker'
import { CustomerForm } from './customer-form'
import { BookingSuccess } from './booking-success'
import type { ServiceWithPrice, ServiceCategory, StaffWithSchedule, TimeSlot } from '../types'

interface BookingWizardProps {
  salonId: string
  services: ServiceWithPrice[]
  categories: ServiceCategory[]
  staff: StaffWithSchedule[]
}

function BookingWizardContent({
  services,
  categories,
  staff,
}: Omit<BookingWizardProps, 'salonId'>) {
  const {
    step,
    nextStep,
    prevStep,
    canProceed,
    selectedServices,
    selectedStaff,
    selectedSlot,
    customerInfo,
    notes,
    salonId,
  } = useBooking()

  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [selectedDate, setSelectedDate] = React.useState<Date | null>(null)
  const [availableSlots, setAvailableSlots] = React.useState<TimeSlot[]>([])
  const [isSlotsLoading, setIsSlotsLoading] = React.useState(false)
  const [appointmentId, setAppointmentId] = React.useState<string>()
  const [isFormValid, setIsFormValid] = React.useState(false)

  // Fetch available slots when date or staff changes
  const fetchSlots = React.useCallback(async (date: Date) => {
    if (!salonId || selectedServices.length === 0) return

    setIsSlotsLoading(true)
    try {
      // TODO: Replace with actual API call
      // For now, generate mock slots
      const mockSlots: TimeSlot[] = []
      const startHour = 9
      const endHour = 18

      for (let hour = startHour; hour < endHour; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const startsAt = new Date(date)
          startsAt.setHours(hour, minute, 0, 0)

          const endsAt = new Date(startsAt)
          endsAt.setMinutes(endsAt.getMinutes() + 30)

          // Randomly make some slots unavailable for demo
          const isAvailable = Math.random() > 0.3

          mockSlots.push({
            startsAt,
            endsAt,
            staffId: selectedStaff?.id || 'any',
            isAvailable,
          })
        }
      }

      setAvailableSlots(mockSlots)
    } catch (error) {
      console.error('Failed to fetch slots:', error)
      toast({
        title: 'Fehler',
        description: 'Verfügbare Termine konnten nicht geladen werden.',
        variant: 'destructive',
      })
    } finally {
      setIsSlotsLoading(false)
    }
  }, [salonId, selectedServices, selectedStaff, toast])

  // Fetch slots when date changes
  React.useEffect(() => {
    if (selectedDate) {
      fetchSlots(selectedDate)
    }
  }, [selectedDate, fetchSlots])

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleSubmit = async () => {
    if (!salonId || !selectedSlot || !customerInfo) return

    setIsSubmitting(true)
    try {
      // TODO: Replace with actual server action
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock success
      setAppointmentId('mock-appointment-id')
      nextStep()

      toast({
        title: 'Buchung erfolgreich',
        description: 'Ihr Termin wurde bestätigt.',
        variant: 'success',
      })
    } catch (error) {
      console.error('Booking failed:', error)
      toast({
        title: 'Buchung fehlgeschlagen',
        description: 'Bitte versuchen Sie es erneut.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStepTitle = () => {
    switch (step) {
      case 'services':
        return 'Wählen Sie Ihre Dienstleistungen'
      case 'staff':
        return 'Wählen Sie einen Mitarbeiter'
      case 'datetime':
        return 'Wählen Sie einen Termin'
      case 'confirm':
        return 'Ihre Daten & Bestätigung'
      case 'success':
        return ''
      default:
        return ''
    }
  }

  const renderStep = () => {
    switch (step) {
      case 'services':
        return (
          <ServiceSelection
            services={services}
            categories={categories}
          />
        )
      case 'staff':
        return <StaffSelection staff={staff} />
      case 'datetime':
        return (
          <TimeSlotPicker
            availableSlots={availableSlots}
            isLoading={isSlotsLoading}
            onDateChange={handleDateChange}
            selectedDate={selectedDate}
          />
        )
      case 'confirm':
        return <CustomerForm onValidChange={setIsFormValid} />
      case 'success':
        return <BookingSuccess appointmentId={appointmentId} />
      default:
        return null
    }
  }

  const canSubmit = step === 'confirm' && isFormValid && customerInfo !== null

  return (
    <div className="container-narrow py-8">
      {/* Stepper */}
      <div className="mb-8">
        <BookingStepper />
      </div>

      {/* Main content */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Step content */}
        <div className="lg:col-span-2 space-y-6">
          {step !== 'success' && (
            <h1 className="text-2xl font-bold">{getStepTitle()}</h1>
          )}
          {renderStep()}
        </div>

        {/* Summary sidebar */}
        {step !== 'success' && (
          <div className="lg:col-span-1">
            <div className="sticky top-24">
              <BookingSummary />
            </div>
          </div>
        )}
      </div>

      {/* Navigation */}
      {step !== 'success' && (
        <div className="mt-8 flex justify-between border-t pt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={step === 'services'}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Zurück
          </Button>

          {step === 'confirm' ? (
            <Button
              onClick={handleSubmit}
              disabled={!canSubmit || isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Wird gebucht...
                </>
              ) : (
                'Jetzt buchen'
              )}
            </Button>
          ) : (
            <Button
              onClick={nextStep}
              disabled={!canProceed}
            >
              Weiter
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export function BookingWizard(props: BookingWizardProps) {
  return (
    <BookingProvider salonId={props.salonId}>
      <BookingWizardContent
        services={props.services}
        categories={props.categories}
        staff={props.staff}
      />
    </BookingProvider>
  )
}
