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
import { getAvailableSlots } from '../actions/get-available-slots'
import { createBooking } from '../actions/create-booking'
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
    if (!salonId || selectedServices.length === 0 || !selectedStaff) return

    setIsSlotsLoading(true)
    try {
      const result = await getAvailableSlots({
        salonId,
        staffId: selectedStaff.id,
        serviceIds: selectedServices.map((s) => s.id),
        date,
      })

      // Convert ISO strings back to Date objects
      const slots: TimeSlot[] = result.slots.map((slot) => ({
        startsAt: new Date(slot.startsAt),
        endsAt: new Date(slot.endsAt),
        staffId: slot.staffId,
        isAvailable: slot.isAvailable,
      }))

      setAvailableSlots(slots)
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
    if (!salonId || !selectedSlot || !customerInfo || !selectedStaff) return

    setIsSubmitting(true)
    try {
      const result = await createBooking({
        salonId,
        staffId: selectedStaff.id,
        serviceIds: selectedServices.map((s) => s.id),
        startsAt: selectedSlot.startsAt.toISOString(),
        customerInfo: {
          firstName: customerInfo.firstName,
          lastName: customerInfo.lastName,
          email: customerInfo.email,
          phone: customerInfo.phone,
        },
        notes: notes || undefined,
      })

      if (result.success && result.appointmentId) {
        setAppointmentId(result.appointmentId)
        nextStep()

        toast({
          title: 'Buchung erfolgreich',
          description: 'Ihr Termin wurde bestätigt. Sie erhalten eine Bestätigungs-E-Mail.',
          variant: 'success',
        })
      } else {
        toast({
          title: 'Buchung fehlgeschlagen',
          description: result.error || 'Bitte versuchen Sie es erneut.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      console.error('Booking failed:', error)
      toast({
        title: 'Buchung fehlgeschlagen',
        description: 'Ein unerwarteter Fehler ist aufgetreten.',
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
