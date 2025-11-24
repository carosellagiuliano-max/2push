'use client'

import * as React from 'react'
import Link from 'next/link'
import { format } from 'date-fns'
import { de } from 'date-fns/locale'
import {
  MoreHorizontal,
  Mail,
  Phone,
  Calendar,
  CreditCard,
  User,
  Archive,
  RotateCcw,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { CustomerWithStats } from '../types'

interface CustomerTableProps {
  customers: CustomerWithStats[]
  onDelete?: (customerId: string) => void
  onRestore?: (customerId: string) => void
}

export function CustomerTable({
  customers,
  onDelete,
  onRestore,
}: CustomerTableProps) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <User className="mx-auto h-12 w-12 mb-4 opacity-50" />
        <p>Keine Kunden gefunden</p>
      </div>
    )
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('de-CH', {
      style: 'currency',
      currency: 'CHF',
    }).format(amount)
  }

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase()
  }

  return (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full">
        <thead className="bg-muted/50">
          <tr>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground">
              Kunde
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden md:table-cell">
              Kontakt
            </th>
            <th className="text-left px-4 py-3 text-sm font-medium text-muted-foreground hidden lg:table-cell">
              Letzter Besuch
            </th>
            <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">
              Besuche
            </th>
            <th className="text-right px-4 py-3 text-sm font-medium text-muted-foreground hidden sm:table-cell">
              Umsatz
            </th>
            <th className="px-4 py-3 w-10"></th>
          </tr>
        </thead>
        <tbody className="divide-y">
          {customers.map((customer) => (
            <tr
              key={customer.id}
              className="hover:bg-muted/30 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/dashboard/customers/${customer.id}`}
                  className="flex items-center gap-3 group"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/10 text-primary text-sm">
                      {getInitials(customer.first_name, customer.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium group-hover:text-primary transition-colors">
                      {customer.first_name} {customer.last_name}
                    </p>
                    {!customer.is_active && (
                      <Badge variant="secondary" className="mt-0.5 text-xs">
                        Inaktiv
                      </Badge>
                    )}
                    {customer.preferred_staff_name && (
                      <p className="text-xs text-muted-foreground">
                        Bevorzugt: {customer.preferred_staff_name}
                      </p>
                    )}
                  </div>
                </Link>
              </td>
              <td className="px-4 py-3 hidden md:table-cell">
                <div className="space-y-1">
                  {customer.email && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Mail className="h-3.5 w-3.5" />
                      <span className="truncate max-w-[200px]">
                        {customer.email}
                      </span>
                    </div>
                  )}
                  {customer.phone && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Phone className="h-3.5 w-3.5" />
                      <span>{customer.phone}</span>
                    </div>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 hidden lg:table-cell">
                {customer.last_visit_at ? (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3.5 w-3.5" />
                    <span>
                      {format(new Date(customer.last_visit_at), 'dd. MMM yyyy', {
                        locale: de,
                      })}
                    </span>
                  </div>
                ) : (
                  <span className="text-sm text-muted-foreground">
                    Noch kein Besuch
                  </span>
                )}
              </td>
              <td className="px-4 py-3 text-right hidden sm:table-cell">
                <span className="text-sm font-medium">
                  {customer.total_visits}
                </span>
              </td>
              <td className="px-4 py-3 text-right hidden sm:table-cell">
                <div className="flex items-center justify-end gap-1.5">
                  <CreditCard className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">
                    {formatCurrency(customer.total_spend)}
                  </span>
                </div>
              </td>
              <td className="px-4 py-3">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Menü öffnen</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/customers/${customer.id}`}>
                        <User className="mr-2 h-4 w-4" />
                        Details anzeigen
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/dashboard/customers/${customer.id}/edit`}>
                        Bearbeiten
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    {customer.is_active ? (
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        onClick={() => onDelete?.(customer.id)}
                      >
                        <Archive className="mr-2 h-4 w-4" />
                        Archivieren
                      </DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem onClick={() => onRestore?.(customer.id)}>
                        <RotateCcw className="mr-2 h-4 w-4" />
                        Wiederherstellen
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
