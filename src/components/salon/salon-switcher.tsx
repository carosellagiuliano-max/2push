'use client'

import { useState } from 'react'
import { Check, ChevronsUpDown, Building2, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Badge } from '@/components/ui/badge'
import type { Salon } from '@/lib/database.types'

interface SalonSwitcherProps {
  salons: Salon[]
  currentSalon: Salon | null
  onSalonChange: (_salon: Salon) => void
  isHqUser?: boolean
  onCreateSalon?: () => void
  className?: string
}

/**
 * Salon switcher component for multi-salon users
 *
 * Shows current salon and allows switching between accessible salons.
 * HQ users see all salons, regular users see only their assigned salons.
 */
export function SalonSwitcher({
  salons,
  currentSalon,
  onSalonChange,
  isHqUser = false,
  onCreateSalon,
  className,
}: SalonSwitcherProps) {
  const [open, setOpen] = useState(false)

  // Don't show switcher if only one salon
  if (salons.length <= 1 && !isHqUser) {
    return null
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          aria-label="Salon auswählen"
          className={cn('w-[200px] justify-between', className)}
        >
          <Building2 className="mr-2 h-4 w-4 shrink-0 opacity-50" />
          <span className="truncate">
            {currentSalon?.name || 'Salon wählen...'}
          </span>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[250px] p-0">
        <Command>
          <CommandInput placeholder="Salon suchen..." />
          <CommandList>
            <CommandEmpty>Kein Salon gefunden.</CommandEmpty>
            <CommandGroup heading="Ihre Salons">
              {salons.map((salon) => (
                <CommandItem
                  key={salon.id}
                  value={salon.name}
                  onSelect={() => {
                    onSalonChange(salon)
                    setOpen(false)
                  }}
                  className="cursor-pointer"
                >
                  <Check
                    className={cn(
                      'mr-2 h-4 w-4',
                      currentSalon?.id === salon.id ? 'opacity-100' : 'opacity-0'
                    )}
                  />
                  <div className="flex flex-col">
                    <span>{salon.name}</span>
                    <span className="text-xs text-muted-foreground">
                      {salon.city || salon.slug}
                    </span>
                  </div>
                  {!salon.is_active && (
                    <Badge variant="secondary" className="ml-auto text-xs">
                      Inaktiv
                    </Badge>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
            {isHqUser && onCreateSalon && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      onCreateSalon()
                      setOpen(false)
                    }}
                    className="cursor-pointer"
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Neuen Salon hinzufügen
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}

/**
 * Compact version for use in sidebar header
 */
export function SalonSwitcherCompact({
  salons,
  currentSalon,
  onSalonChange,
}: Omit<SalonSwitcherProps, 'isHqUser' | 'onCreateSalon' | 'className'>) {
  const [open, setOpen] = useState(false)

  if (salons.length <= 1) {
    return (
      <div className="flex items-center gap-2 px-2 py-1.5">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium truncate">
          {currentSalon?.name || 'Kein Salon'}
        </span>
      </div>
    )
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          className="flex items-center gap-2 px-2 py-1.5 w-full text-left hover:bg-accent rounded-md transition-colors"
          aria-label="Salon wechseln"
        >
          <Building2 className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="text-sm font-medium truncate flex-1">
            {currentSalon?.name || 'Salon wählen'}
          </span>
          <ChevronsUpDown className="h-3 w-3 text-muted-foreground shrink-0" />
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <Command>
          <CommandList>
            {salons.map((salon) => (
              <CommandItem
                key={salon.id}
                value={salon.name}
                onSelect={() => {
                  onSalonChange(salon)
                  setOpen(false)
                }}
                className="cursor-pointer"
              >
                <Check
                  className={cn(
                    'mr-2 h-4 w-4',
                    currentSalon?.id === salon.id ? 'opacity-100' : 'opacity-0'
                  )}
                />
                {salon.name}
              </CommandItem>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
