'use client'

import * as React from 'react'
import {
  Calendar,
  Users,
  AlertTriangle,
  CreditCard,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { DashboardStats } from '../types'

interface StatsCardsProps {
  stats: DashboardStats
  isLoading?: boolean
}

export function StatsCards({ stats, isLoading: _isLoading }: StatsCardsProps) {
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(price)
  }

  const cards = [
    {
      title: 'Termine heute',
      value: stats.todayAppointments,
      icon: Calendar,
      description: `${stats.upcomingAppointments} bevorstehend`,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Umsatz heute',
      value: formatPrice(stats.todayRevenue),
      icon: CreditCard,
      description: `Woche: ${formatPrice(stats.weekRevenue)}`,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      title: 'Neue Kunden',
      value: stats.newCustomers,
      icon: Users,
      description: 'Diese Woche',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      title: 'No-Shows',
      value: stats.noShows,
      icon: AlertTriangle,
      description: 'Diese Woche',
      color: stats.noShows > 0 ? 'text-destructive' : 'text-green-600',
      bgColor: stats.noShows > 0 ? 'bg-destructive/10' : 'bg-green-100',
    },
  ]

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => (
        <Card key={card.title}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
            <div className={cn('rounded-lg p-2', card.bgColor)}>
              <card.icon className={cn('h-4 w-4', card.color)} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{card.value}</div>
            <p className="text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
