'use client'

import * as React from 'react'
import { Check } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useBooking } from '../hooks/use-booking'
import type { BookingStep } from '../types'

const steps: { id: BookingStep; label: string }[] = [
  { id: 'services', label: 'Dienstleistungen' },
  { id: 'staff', label: 'Mitarbeiter' },
  { id: 'datetime', label: 'Termin' },
  { id: 'confirm', label: 'Bestätigen' },
]

export function BookingStepper() {
  const { step } = useBooking()

  const currentIndex = steps.findIndex((s) => s.id === step)

  // Don't show stepper on success page
  if (step === 'success') return null

  return (
    <nav aria-label="Progress">
      <ol className="flex items-center justify-between">
        {steps.map((stepItem, index) => {
          const isCurrent = stepItem.id === step
          const isCompleted = index < currentIndex

          return (
            <li key={stepItem.id} className="relative flex-1">
              <div className="flex flex-col items-center">
                {/* Connector line */}
                {index > 0 && (
                  <div
                    className={cn(
                      'absolute left-0 top-4 -translate-y-1/2 h-0.5 w-full -translate-x-1/2',
                      isCompleted || isCurrent ? 'bg-primary' : 'bg-muted'
                    )}
                    style={{ width: 'calc(100% - 2rem)' }}
                  />
                )}

                {/* Step indicator */}
                <div
                  className={cn(
                    'relative z-10 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    isCompleted && 'bg-primary text-primary-foreground',
                    isCurrent && 'border-2 border-primary bg-background text-primary',
                    !isCompleted && !isCurrent && 'border-2 border-muted bg-background text-muted-foreground'
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <span>{index + 1}</span>
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    'mt-2 text-xs font-medium text-center',
                    isCurrent && 'text-primary',
                    !isCurrent && 'text-muted-foreground'
                  )}
                >
                  {stepItem.label}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
