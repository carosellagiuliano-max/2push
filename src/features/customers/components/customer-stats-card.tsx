'use client'

import * as React from 'react'
import {
  Calendar,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  TrendingUp,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CustomerDetail } from '../types'

interface CustomerStatsCardProps {
  customer: CustomerDetail
}

export function CustomerStatsCard({ customer }: CustomerStatsCardProps) {
  const { statistics } = customer

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(amount)
  }

  const stats = [
    {
      label: 'Termine gesamt',
      value: statistics.totalAppointments,
      icon: Calendar,
      color: 'text-blue-500',
    },
    {
      label: 'Abgeschlossen',
      value: statistics.completedAppointments,
      icon: CheckCircle,
      color: 'text-green-500',
    },
    {
      label: 'Storniert',
      value: statistics.cancelledAppointments,
      icon: XCircle,
      color: 'text-orange-500',
    },
    {
      label: 'Nicht erschienen',
      value: statistics.noShowCount,
      icon: AlertCircle,
      color: 'text-red-500',
    },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Statistiken</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {stats.map((stat) => {
            const Icon = stat.icon
            return (
              <div key={stat.label} className="flex items-center gap-3">
                <div className={`${stat.color}`}>
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-xs text-muted-foreground">{stat.label}</p>
                </div>
              </div>
            )
          })}
        </div>

        <div className="mt-6 pt-4 border-t space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Gesamtumsatz</span>
            </div>
            <span className="text-lg font-semibold">
              {formatCurrency(customer.total_spend)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Durchschnitt/Besuch
              </span>
            </div>
            <span className="text-lg font-semibold">
              {formatCurrency(statistics.averageSpend)}
            </span>
          </div>
        </div>

        {/* Favorite Services */}
        {statistics.favoriteServices.length > 0 && (
          <div className="mt-6 pt-4 border-t">
            <h4 className="text-sm font-medium text-muted-foreground mb-3">
              Häufigste Dienstleistungen
            </h4>
            <div className="space-y-2">
              {statistics.favoriteServices.map((service, idx) => (
                <div
                  key={service.name}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-muted-foreground">{idx + 1}.</span>
                    {service.name}
                  </span>
                  <span className="text-muted-foreground">
                    {service.count}x
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
