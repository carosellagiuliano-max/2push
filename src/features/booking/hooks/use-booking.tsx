'use client'

import * as React from 'react'
import type {
  BookingState,
  BookingStep,
  ServiceWithPrice,
  StaffWithSchedule,
  TimeSlot,
  CustomerInfo,
} from '../types'

interface BookingContextValue extends BookingState {
  // Navigation
  setStep: (_step: BookingStep) => void
  nextStep: () => void
  prevStep: () => void
  canProceed: boolean

  // Service selection
  addService: (_service: ServiceWithPrice) => void
  removeService: (_serviceId: string) => void
  clearServices: () => void

  // Staff selection
  selectStaff: (_staff: StaffWithSchedule | null) => void

  // Time slot selection
  selectSlot: (_slot: TimeSlot | null) => void

  // Customer info
  setCustomerInfo: (_info: CustomerInfo) => void

  // Notes
  setNotes: (_notes: string) => void

  // Calculated values
  totalDuration: number
  totalPrice: number

  // Reset
  reset: () => void
}

const BookingContext = React.createContext<BookingContextValue | null>(null)

const STEP_ORDER: BookingStep[] = ['services', 'staff', 'datetime', 'confirm', 'success']

const initialState: BookingState = {
  step: 'services',
  salonId: null,
  selectedServices: [],
  selectedStaff: null,
  selectedSlot: null,
  customerInfo: null,
  notes: '',
}

interface BookingProviderProps {
  children: React.ReactNode
  salonId: string
}

export function BookingProvider({ children, salonId }: BookingProviderProps) {
  const [state, setState] = React.useState<BookingState>({
    ...initialState,
    salonId,
  })

  // Navigation
  const setStep = React.useCallback((step: BookingStep) => {
    setState((prev) => ({ ...prev, step }))
  }, [])

  const nextStep = React.useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step)
      if (currentIndex < STEP_ORDER.length - 1) {
        return { ...prev, step: STEP_ORDER[currentIndex + 1] }
      }
      return prev
    })
  }, [])

  const prevStep = React.useCallback(() => {
    setState((prev) => {
      const currentIndex = STEP_ORDER.indexOf(prev.step)
      if (currentIndex > 0) {
        return { ...prev, step: STEP_ORDER[currentIndex - 1] }
      }
      return prev
    })
  }, [])

  // Service selection
  const addService = React.useCallback((service: ServiceWithPrice) => {
    setState((prev) => {
      if (prev.selectedServices.some((s) => s.id === service.id)) {
        return prev
      }
      return {
        ...prev,
        selectedServices: [...prev.selectedServices, service],
      }
    })
  }, [])

  const removeService = React.useCallback((serviceId: string) => {
    setState((prev) => ({
      ...prev,
      selectedServices: prev.selectedServices.filter((s) => s.id !== serviceId),
    }))
  }, [])

  const clearServices = React.useCallback(() => {
    setState((prev) => ({ ...prev, selectedServices: [] }))
  }, [])

  // Staff selection
  const selectStaff = React.useCallback((staff: StaffWithSchedule | null) => {
    setState((prev) => ({
      ...prev,
      selectedStaff: staff,
      // Clear slot when staff changes
      selectedSlot: null,
    }))
  }, [])

  // Time slot selection
  const selectSlot = React.useCallback((slot: TimeSlot | null) => {
    setState((prev) => ({ ...prev, selectedSlot: slot }))
  }, [])

  // Customer info
  const setCustomerInfo = React.useCallback((info: CustomerInfo) => {
    setState((prev) => ({ ...prev, customerInfo: info }))
  }, [])

  // Notes
  const setNotes = React.useCallback((notes: string) => {
    setState((prev) => ({ ...prev, notes }))
  }, [])

  // Reset
  const reset = React.useCallback(() => {
    setState({ ...initialState, salonId })
  }, [salonId])

  // Calculated values
  const totalDuration = React.useMemo(() => {
    return state.selectedServices.reduce((sum, service) => {
      return sum + (service.duration_minutes || 0)
    }, 0)
  }, [state.selectedServices])

  const totalPrice = React.useMemo(() => {
    return state.selectedServices.reduce((sum, service) => {
      return sum + service.current_price
    }, 0)
  }, [state.selectedServices])

  // Can proceed validation
  const canProceed = React.useMemo(() => {
    switch (state.step) {
      case 'services':
        return state.selectedServices.length > 0
      case 'staff':
        return state.selectedStaff !== null
      case 'datetime':
        return state.selectedSlot !== null
      case 'confirm':
        return state.customerInfo !== null
      default:
        return false
    }
  }, [state.step, state.selectedServices, state.selectedStaff, state.selectedSlot, state.customerInfo])

  const value: BookingContextValue = {
    ...state,
    setStep,
    nextStep,
    prevStep,
    canProceed,
    addService,
    removeService,
    clearServices,
    selectStaff,
    selectSlot,
    setCustomerInfo,
    setNotes,
    totalDuration,
    totalPrice,
    reset,
  }

  return (
    <BookingContext.Provider value={value}>
      {children}
    </BookingContext.Provider>
  )
}

export function useBooking() {
  const context = React.useContext(BookingContext)
  if (!context) {
    throw new Error('useBooking must be used within a BookingProvider')
  }
  return context
}
