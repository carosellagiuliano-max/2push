import * as React from 'react'
import { LucideIcon, FileQuestion, Search, Users, Calendar, ShoppingBag, Package } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon?: LucideIcon
  title: string
  description?: string
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function EmptyState({
  icon: Icon = FileQuestion,
  title,
  description,
  action,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mb-4">
        <Icon className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="text-lg font-semibold mb-2">{title}</h3>
      {description && (
        <p className="text-sm text-muted-foreground max-w-sm mb-4">{description}</p>
      )}
      {action && (
        <Button onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  )
}

// Pre-configured empty states for common scenarios

export function EmptySearchResults({ query }: { query: string }) {
  return (
    <EmptyState
      icon={Search}
      title="Keine Ergebnisse"
      description={`Keine Einträge gefunden für "${query}". Versuchen Sie einen anderen Suchbegriff.`}
    />
  )
}

export function EmptyCustomers({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Users}
      title="Keine Kunden"
      description="Noch keine Kunden vorhanden. Fügen Sie Ihren ersten Kunden hinzu oder importieren Sie bestehende Daten."
      action={onAdd ? { label: 'Kunde hinzufügen', onClick: onAdd } : undefined}
    />
  )
}

export function EmptyAppointments({ onBook }: { onBook?: () => void }) {
  return (
    <EmptyState
      icon={Calendar}
      title="Keine Termine"
      description="Keine Termine für diesen Zeitraum gefunden."
      action={onBook ? { label: 'Termin erstellen', onClick: onBook } : undefined}
    />
  )
}

export function EmptyOrders() {
  return (
    <EmptyState
      icon={ShoppingBag}
      title="Keine Bestellungen"
      description="Noch keine Bestellungen eingegangen. Sobald Kunden bestellen, erscheinen sie hier."
    />
  )
}

export function EmptyProducts({ onAdd }: { onAdd?: () => void }) {
  return (
    <EmptyState
      icon={Package}
      title="Keine Produkte"
      description="Noch keine Produkte im Sortiment. Fügen Sie Ihre ersten Produkte hinzu."
      action={onAdd ? { label: 'Produkt hinzufügen', onClick: onAdd } : undefined}
    />
  )
}
