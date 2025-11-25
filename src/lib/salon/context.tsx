'use client'

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import type { Salon } from '@/lib/database.types'

interface SalonContextValue {
  /** Currently selected salon */
  currentSalon: Salon | null
  /** All salons the user has access to */
  accessibleSalons: Salon[]
  /** Whether user has access to multiple salons */
  isMultiSalon: boolean
  /** Whether user has HQ role (cross-salon access) */
  isHqUser: boolean
  /** Switch to a different salon */
  switchSalon: (salon: Salon) => void
  /** Set accessible salons (usually from server) */
  setAccessibleSalons: (salons: Salon[]) => void
  /** Set HQ user status */
  setIsHqUser: (isHq: boolean) => void
}

const SalonContext = createContext<SalonContextValue | null>(null)

interface SalonProviderProps {
  children: ReactNode
  initialSalon?: Salon | null
  initialSalons?: Salon[]
  initialIsHq?: boolean
}

/**
 * SalonProvider for multi-salon access control
 *
 * Manages which salon the user is currently viewing/editing,
 * and provides context for salon-scoped operations.
 */
export function SalonProvider({
  children,
  initialSalon = null,
  initialSalons = [],
  initialIsHq = false,
}: SalonProviderProps) {
  const [currentSalon, setCurrentSalon] = useState<Salon | null>(initialSalon)
  const [accessibleSalons, setAccessibleSalons] = useState<Salon[]>(initialSalons)
  const [isHqUser, setIsHqUser] = useState(initialIsHq)

  const switchSalon = useCallback((salon: Salon) => {
    setCurrentSalon(salon)
    // Could also persist to localStorage or update URL
    if (typeof window !== 'undefined') {
      localStorage.setItem('schnittwerk_current_salon', salon.id)
    }
  }, [])

  const isMultiSalon = accessibleSalons.length > 1 || isHqUser

  const value: SalonContextValue = {
    currentSalon,
    accessibleSalons,
    isMultiSalon,
    isHqUser,
    switchSalon,
    setAccessibleSalons,
    setIsHqUser,
  }

  return <SalonContext.Provider value={value}>{children}</SalonContext.Provider>
}

/**
 * Hook to access salon context
 */
export function useSalon(): SalonContextValue {
  const context = useContext(SalonContext)
  if (!context) {
    throw new Error('useSalon must be used within a SalonProvider')
  }
  return context
}

/**
 * Hook to get current salon ID (for queries)
 */
export function useCurrentSalonId(): string | null {
  const { currentSalon } = useSalon()
  return currentSalon?.id ?? null
}

/**
 * Hook to require a salon (throws if none selected)
 */
export function useRequiredSalon(): Salon {
  const { currentSalon } = useSalon()
  if (!currentSalon) {
    throw new Error('No salon selected')
  }
  return currentSalon
}
