'use client'

import * as React from 'react'
import { Check, User, Shuffle } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useBooking } from '../hooks/use-booking'
import type { StaffWithSchedule } from '../types'

interface StaffSelectionProps {
  staff: StaffWithSchedule[]
  isLoading?: boolean
}

export function StaffSelection({ staff, isLoading = false }: StaffSelectionProps) {
  const { selectedStaff, selectStaff, selectedServices } = useBooking()

  // Filter staff who can perform all selected services
  const availableStaff = React.useMemo(() => {
    if (selectedServices.length === 0) return staff

    return staff.filter((member) => {
      // Check if staff has skills for all selected services
      return selectedServices.every((service) =>
        member.service_skills.includes(service.id)
      )
    })
  }, [staff, selectedServices])

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardContent className="flex items-center gap-4 pt-6">
                <Skeleton className="h-16 w-16 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-32" />
                  <Skeleton className="h-4 w-24" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* "No preference" option */}
      <Card
        className={cn(
          'cursor-pointer transition-all hover:shadow-md',
          selectedStaff === null && 'ring-2 ring-primary border-primary'
        )}
        onClick={() => selectStaff(null)}
      >
        <CardContent className="flex items-center gap-4 pt-6">
          <div
            className={cn(
              'flex h-16 w-16 items-center justify-center rounded-full bg-muted',
              selectedStaff === null && 'bg-primary/10'
            )}
          >
            <Shuffle className={cn(
              'h-8 w-8',
              selectedStaff === null ? 'text-primary' : 'text-muted-foreground'
            )} />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold">Keine Präferenz</h3>
            <p className="text-sm text-muted-foreground">
              Wir wählen den besten verfügbaren Mitarbeiter für Sie
            </p>
          </div>
          {selectedStaff === null && (
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
              <Check className="h-4 w-4" />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Staff list */}
      <div>
        <h3 className="mb-4 text-sm font-medium text-muted-foreground">
          Oder wählen Sie einen Mitarbeiter
        </h3>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableStaff.map((member) => {
            const isSelected = selectedStaff?.id === member.id

            return (
              <Card
                key={member.id}
                className={cn(
                  'cursor-pointer transition-all hover:shadow-md',
                  isSelected && 'ring-2 ring-primary border-primary'
                )}
                onClick={() => selectStaff(member)}
              >
                <CardContent className="flex items-center gap-4 pt-6">
                  <Avatar className="h-16 w-16">
                    {member.avatar_url ? (
                      <AvatarImage src={member.avatar_url} alt={member.display_name || ''} />
                    ) : null}
                    <AvatarFallback
                      className="text-lg"
                      style={{ backgroundColor: member.color || undefined }}
                    >
                      {getInitials(member.display_name || 'Staff')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{member.display_name}</h3>
                    {member.title && (
                      <p className="text-sm text-muted-foreground truncate">
                        {member.title}
                      </p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      <Check className="h-4 w-4" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {availableStaff.length === 0 && staff.length > 0 && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
              <User className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <p className="text-muted-foreground">
                Kein Mitarbeiter verfügbar, der alle ausgewählten Dienstleistungen anbietet.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Bitte passen Sie Ihre Auswahl an oder wählen Sie &quot;Keine Präferenz&quot;.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
