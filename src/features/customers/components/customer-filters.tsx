'use client'

import * as React from 'react'
import { SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CustomerFilterValues } from '../types'

interface CustomerFiltersProps {
  filters: CustomerFilterValues
  onChange: (filters: CustomerFilterValues) => void
}

export function CustomerFilters({ filters, onChange }: CustomerFiltersProps) {
  const [isExpanded, setIsExpanded] = React.useState(false)

  const handleStatusChange = (value: string) => {
    onChange({
      ...filters,
      status: value as CustomerFilterValues['status'],
    })
  }

  const handleSortByChange = (value: string) => {
    onChange({
      ...filters,
      sortBy: value as CustomerFilterValues['sortBy'],
    })
  }

  const handleSortOrderChange = (value: string) => {
    onChange({
      ...filters,
      sortOrder: value as CustomerFilterValues['sortOrder'],
    })
  }

  const hasActiveFilters =
    filters.status !== 'all' ||
    filters.sortBy !== 'name' ||
    filters.sortOrder !== 'asc'

  const handleReset = () => {
    onChange({
      search: filters.search,
      status: 'all',
      sortBy: 'name',
      sortOrder: 'asc',
    })
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Button
          variant={isExpanded ? 'secondary' : 'outline'}
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="gap-2"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filter
          {hasActiveFilters && (
            <span className="ml-1 rounded-full bg-primary w-2 h-2" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            Zurücksetzen
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="flex flex-wrap gap-3 p-3 bg-muted/50 rounded-lg">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Status
            </label>
            <Select
              value={filters.status || 'all'}
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Alle</SelectItem>
                <SelectItem value="active">Aktiv</SelectItem>
                <SelectItem value="inactive">Inaktiv</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Sortieren nach
            </label>
            <Select
              value={filters.sortBy || 'name'}
              onValueChange={handleSortByChange}
            >
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="last_visit">Letzter Besuch</SelectItem>
                <SelectItem value="total_visits">Besuche</SelectItem>
                <SelectItem value="total_spend">Umsatz</SelectItem>
                <SelectItem value="created_at">Erstellt</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-medium text-muted-foreground">
              Reihenfolge
            </label>
            <Select
              value={filters.sortOrder || 'asc'}
              onValueChange={handleSortOrderChange}
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Aufsteigend</SelectItem>
                <SelectItem value="desc">Absteigend</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
