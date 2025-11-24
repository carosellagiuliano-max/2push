'use client'

import * as React from 'react'
import { Bell, Search, Plus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Badge } from '@/components/ui/badge'

interface DashboardHeaderProps {
  title: string
  description?: string
  actions?: React.ReactNode
  className?: string
}

export function DashboardHeader({
  title,
  description,
  actions,
  className,
}: DashboardHeaderProps) {
  return (
    <header className={cn('border-b bg-card px-6 py-4', className)}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">{title}</h1>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>

        <div className="flex items-center gap-4">
          {/* Search */}
          <div className="hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Suchen..."
                className="w-64 pl-9"
              />
            </div>
          </div>

          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge
                  className="absolute -right-1 -top-1 h-5 w-5 rounded-full p-0 text-xs"
                  variant="destructive"
                >
                  3
                </Badge>
                <span className="sr-only">Benachrichtigungen</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <div className="p-4">
                <h3 className="font-semibold">Benachrichtigungen</h3>
              </div>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Neuer Termin</span>
                  <span className="text-xs text-muted-foreground">
                    Max Mustermann hat einen Termin gebucht
                  </span>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem>
                <div className="flex flex-col gap-1">
                  <span className="font-medium">Terminerinnerung</span>
                  <span className="text-xs text-muted-foreground">
                    3 Termine in den nächsten 30 Minuten
                  </span>
                </div>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Custom actions */}
          {actions}
        </div>
      </div>
    </header>
  )
}

interface QuickActionButtonProps {
  onNewAppointment?: () => void
}

export function QuickActionButton({ onNewAppointment }: QuickActionButtonProps) {
  return (
    <Button onClick={onNewAppointment}>
      <Plus className="mr-2 h-4 w-4" />
      Neuer Termin
    </Button>
  )
}
