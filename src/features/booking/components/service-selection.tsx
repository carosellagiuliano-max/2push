'use client'

import * as React from 'react'
import { Check, Clock, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useBooking } from '../hooks/use-booking'
import type { ServiceWithPrice, ServiceCategory } from '../types'

interface ServiceSelectionProps {
  services: ServiceWithPrice[]
  categories: ServiceCategory[]
  isLoading?: boolean
}

export function ServiceSelection({
  services,
  categories,
  isLoading = false,
}: ServiceSelectionProps) {
  const { selectedServices, addService, removeService, totalDuration, totalPrice } = useBooking()

  // Group services by category
  const servicesByCategory = React.useMemo(() => {
    const grouped = new Map<string, ServiceWithPrice[]>()

    // Initialize with all categories
    categories.forEach((cat) => {
      grouped.set(cat.id, [])
    })

    // Group services
    services.forEach((service) => {
      const categoryServices = grouped.get(service.category_id || '') || []
      categoryServices.push(service)
      grouped.set(service.category_id || '', categoryServices)
    })

    return grouped
  }, [services, categories])

  const isSelected = (serviceId: string) =>
    selectedServices.some((s) => s.id === serviceId)

  const toggleService = (service: ServiceWithPrice) => {
    if (isSelected(service.id)) {
      removeService(service.id)
    } else {
      addService(service)
    }
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(price)
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} Min.`
    }
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    if (remainingMinutes === 0) {
      return `${hours} Std.`
    }
    return `${hours} Std. ${remainingMinutes} Min.`
  }

  if (isLoading) {
    return (
      <div className="space-y-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <div className="grid gap-4 sm:grid-cols-2">
              <Skeleton className="h-32" />
              <Skeleton className="h-32" />
            </div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Summary bar */}
      {selectedServices.length > 0 && (
        <Card className="bg-primary/5 border-primary/20">
          <CardContent className="flex items-center justify-between py-4">
            <div className="space-y-1">
              <p className="text-sm font-medium">
                {selectedServices.length} {selectedServices.length === 1 ? 'Dienstleistung' : 'Dienstleistungen'} ausgewählt
              </p>
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  {formatDuration(totalDuration)}
                </span>
                <span className="font-semibold text-foreground">
                  {formatPrice(totalPrice)}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Services by category */}
      {categories.map((category) => {
        const categoryServices = servicesByCategory.get(category.id) || []
        if (categoryServices.length === 0) return null

        return (
          <div key={category.id} className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-muted-foreground">{category.description}</p>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              {categoryServices.map((service) => {
                const selected = isSelected(service.id)

                return (
                  <Card
                    key={service.id}
                    className={cn(
                      'cursor-pointer transition-all hover:shadow-md',
                      selected && 'ring-2 ring-primary border-primary'
                    )}
                    onClick={() => toggleService(service)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">{service.name}</CardTitle>
                        <div
                          className={cn(
                            'flex h-6 w-6 items-center justify-center rounded-full border-2 transition-colors',
                            selected
                              ? 'border-primary bg-primary text-primary-foreground'
                              : 'border-muted-foreground/30'
                          )}
                        >
                          {selected ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4 text-muted-foreground/50" />
                          )}
                        </div>
                      </div>
                      {service.description && (
                        <CardDescription className="line-clamp-2">
                          {service.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Clock className="h-4 w-4" />
                          <span>{formatDuration(service.duration_minutes || 0)}</span>
                        </div>
                        <span className="font-semibold">
                          {formatPrice(service.current_price)}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          </div>
        )
      })}

      {services.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <p className="text-muted-foreground">
              Keine Dienstleistungen verfügbar.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
