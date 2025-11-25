'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  Mail,
  Phone,
  Calendar,
  Gift,
  Heart,
  Edit,
  MessageSquare,
} from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import type { CustomerDetail } from '../types'

interface CustomerProfileCardProps {
  customer: CustomerDetail
}

export function CustomerProfileCard({ customer }: CustomerProfileCardProps) {
  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-start justify-between space-y-0">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="bg-primary/10 text-primary text-xl">
              {getInitials(customer.first_name, customer.last_name)}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle className="text-xl">
              {customer.first_name} {customer.last_name}
            </CardTitle>
            <div className="flex items-center gap-2 mt-1">
              {customer.is_active ? (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  Aktiv
                </Badge>
              ) : (
                <Badge variant="secondary">Inaktiv</Badge>
              )}
              {customer.accepts_marketing && (
                <Badge variant="outline" className="gap-1">
                  <Heart className="h-3 w-3" />
                  Marketing
                </Badge>
              )}
            </div>
          </div>
        </div>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/dashboard/customers/${customer.id}/edit`}>
            <Edit className="mr-2 h-4 w-4" />
            Bearbeiten
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 sm:grid-cols-2">
          {/* Contact Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Kontaktdaten
            </h4>
            <div className="space-y-2">
              {customer.email && (
                <div className="flex items-center gap-2 text-sm">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`mailto:${customer.email}`}
                    className="hover:text-primary"
                  >
                    {customer.email}
                  </a>
                </div>
              )}
              {customer.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <a
                    href={`tel:${customer.phone}`}
                    className="hover:text-primary"
                  >
                    {customer.phone}
                  </a>
                </div>
              )}
              {customer.birthday && (
                <div className="flex items-center gap-2 text-sm">
                  <Gift className="h-4 w-4 text-muted-foreground" />
                  <span>
                    {format(new Date(customer.birthday), 'dd. MMMM yyyy', {
                      locale: de,
                    })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Membership Info */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground">
              Kundeninfo
            </h4>
            <div className="space-y-2">
              {customer.first_visit_at && (
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>
                    Kunde seit{' '}
                    {format(new Date(customer.first_visit_at), 'MMMM yyyy', {
                      locale: de,
                    })}
                  </span>
                </div>
              )}
              {customer.preferred_staff && (
                <div className="flex items-center gap-2 text-sm">
                  <div
                    className="h-4 w-4 rounded-full"
                    style={{ backgroundColor: customer.preferred_staff.color }}
                  />
                  <span>
                    Bevorzugt: {customer.preferred_staff.display_name}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Notes */}
        {customer.notes && (
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-start gap-2">
              <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5" />
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Notizen
                </h4>
                <p className="text-sm whitespace-pre-wrap">{customer.notes}</p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
