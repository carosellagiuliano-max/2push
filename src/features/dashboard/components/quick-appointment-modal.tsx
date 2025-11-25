'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar, Clock, User, Scissors, Loader2, Search, Plus, X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { useToast } from '@/components/ui/use-toast'
import type { StaffColumn } from '../types'

interface Customer {
  id: string
  first_name: string
  last_name: string
  email?: string
  phone?: string
}

interface QuickAppointmentModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  staff: StaffColumn[]
  services: Array<{ id: string; name: string; duration_minutes: number; price?: number }>
  initialDate?: Date
  initialStaffId?: string
  onSubmit?: (data: {
    customerId: string
    staffId: string
    serviceIds: string[]
    startsAt: Date
    notes?: string
  }) => Promise<void>
  onCustomerSearch?: (query: string) => Promise<Customer[]>
  onCreateWalkIn?: (
    firstName: string,
    lastName: string,
    phone?: string
  ) => Promise<{ success: boolean; customerId?: string; error?: string }>
}

export function QuickAppointmentModal({
  open,
  onOpenChange,
  staff,
  services,
  initialDate = new Date(),
  initialStaffId,
  onSubmit,
  onCustomerSearch,
  onCreateWalkIn,
}: QuickAppointmentModalProps) {
  const { toast } = useToast()
  const [isSubmitting, setIsSubmitting] = React.useState(false)

  // Form state
  const [selectedCustomer, setSelectedCustomer] = React.useState<Customer | null>(null)
  const [staffId, setStaffId] = React.useState(initialStaffId || '')
  const [selectedServiceIds, setSelectedServiceIds] = React.useState<string[]>([])
  const [date, setDate] = React.useState(format(initialDate, 'yyyy-MM-dd'))
  const [time, setTime] = React.useState(format(initialDate, 'HH:mm'))
  const [notes, setNotes] = React.useState('')

  // Customer search state
  const [customerSearchOpen, setCustomerSearchOpen] = React.useState(false)
  const [customerSearchQuery, setCustomerSearchQuery] = React.useState('')
  const [searchResults, setSearchResults] = React.useState<Customer[]>([])
  const [isSearching, setIsSearching] = React.useState(false)

  // Walk-in form state
  const [showWalkInForm, setShowWalkInForm] = React.useState(false)
  const [walkInFirstName, setWalkInFirstName] = React.useState('')
  const [walkInLastName, setWalkInLastName] = React.useState('')
  const [walkInPhone, setWalkInPhone] = React.useState('')

  // Reset form when modal opens
  React.useEffect(() => {
    if (open) {
      setSelectedCustomer(null)
      setStaffId(initialStaffId || '')
      setSelectedServiceIds([])
      setDate(format(initialDate, 'yyyy-MM-dd'))
      setTime(format(initialDate, 'HH:mm'))
      setNotes('')
      setCustomerSearchQuery('')
      setSearchResults([])
      setShowWalkInForm(false)
      setWalkInFirstName('')
      setWalkInLastName('')
      setWalkInPhone('')
    }
  }, [open, initialDate, initialStaffId])

  // Customer search effect
  React.useEffect(() => {
    const searchCustomers = async () => {
      if (customerSearchQuery.length < 2 || !onCustomerSearch) {
        setSearchResults([])
        return
      }

      setIsSearching(true)
      try {
        const results = await onCustomerSearch(customerSearchQuery)
        setSearchResults(results)
      } catch (error) {
        console.error('Customer search failed:', error)
      } finally {
        setIsSearching(false)
      }
    }

    const debounce = setTimeout(searchCustomers, 300)
    return () => clearTimeout(debounce)
  }, [customerSearchQuery, onCustomerSearch])

  const handleSelectCustomer = (customer: Customer) => {
    setSelectedCustomer(customer)
    setCustomerSearchOpen(false)
    setCustomerSearchQuery('')
  }

  const handleCreateWalkIn = async () => {
    if (!walkInFirstName || !walkInLastName) {
      toast({
        title: 'Fehler',
        description: 'Bitte geben Sie Vor- und Nachnamen ein.',
        variant: 'destructive',
      })
      return
    }

    if (!onCreateWalkIn) return

    try {
      const result = await onCreateWalkIn(walkInFirstName, walkInLastName, walkInPhone)
      if (result.success && result.customerId) {
        setSelectedCustomer({
          id: result.customerId,
          first_name: walkInFirstName,
          last_name: walkInLastName,
          phone: walkInPhone,
        })
        setShowWalkInForm(false)
        setWalkInFirstName('')
        setWalkInLastName('')
        setWalkInPhone('')
      } else {
        toast({
          title: 'Fehler',
          description: result.error || 'Kunde konnte nicht erstellt werden.',
          variant: 'destructive',
        })
      }
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Ein Fehler ist aufgetreten.',
        variant: 'destructive',
      })
    }
  }

  const toggleService = (serviceId: string) => {
    setSelectedServiceIds((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedCustomer) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie einen Kunden aus.',
        variant: 'destructive',
      })
      return
    }

    if (!staffId) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie einen Mitarbeiter aus.',
        variant: 'destructive',
      })
      return
    }

    if (selectedServiceIds.length === 0) {
      toast({
        title: 'Fehler',
        description: 'Bitte wählen Sie mindestens eine Dienstleistung aus.',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      const startsAt = new Date(`${date}T${time}`)

      await onSubmit?.({
        customerId: selectedCustomer.id,
        staffId,
        serviceIds: selectedServiceIds,
        startsAt,
        notes: notes || undefined,
      })
    } catch (error) {
      toast({
        title: 'Fehler',
        description: 'Der Termin konnte nicht erstellt werden.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Calculate total duration
  const totalDuration = selectedServiceIds.reduce((sum, id) => {
    const service = services.find((s) => s.id === id)
    return sum + (service?.duration_minutes || 0)
  }, 0)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Schnelltermin erstellen</DialogTitle>
          <DialogDescription>
            Erstellen Sie schnell einen neuen Termin für einen Kunden.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Customer Selection */}
          <div className="space-y-2">
            <Label>Kunde *</Label>

            {selectedCustomer ? (
              <div className="flex items-center justify-between p-3 bg-muted rounded-md">
                <div>
                  <p className="font-medium">
                    {selectedCustomer.first_name} {selectedCustomer.last_name}
                  </p>
                  {selectedCustomer.phone && (
                    <p className="text-sm text-muted-foreground">{selectedCustomer.phone}</p>
                  )}
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setSelectedCustomer(null)}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ) : showWalkInForm ? (
              <div className="space-y-3 p-3 border rounded-md">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <Label htmlFor="walkInFirstName" className="text-sm">Vorname *</Label>
                    <Input
                      id="walkInFirstName"
                      value={walkInFirstName}
                      onChange={(e) => setWalkInFirstName(e.target.value)}
                      placeholder="Max"
                    />
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="walkInLastName" className="text-sm">Nachname *</Label>
                    <Input
                      id="walkInLastName"
                      value={walkInLastName}
                      onChange={(e) => setWalkInLastName(e.target.value)}
                      placeholder="Mustermann"
                    />
                  </div>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="walkInPhone" className="text-sm">Telefon</Label>
                  <Input
                    id="walkInPhone"
                    type="tel"
                    value={walkInPhone}
                    onChange={(e) => setWalkInPhone(e.target.value)}
                    placeholder="+41 79 123 45 67"
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowWalkInForm(false)}
                  >
                    Abbrechen
                  </Button>
                  <Button type="button" size="sm" onClick={handleCreateWalkIn}>
                    Kunde erstellen
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Popover open={customerSearchOpen} onOpenChange={setCustomerSearchOpen}>
                  <PopoverTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full justify-start"
                    >
                      <Search className="mr-2 h-4 w-4" />
                      Kunden suchen...
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-80 p-0" align="start">
                    <Command>
                      <CommandInput
                        placeholder="Name, E-Mail oder Telefon..."
                        value={customerSearchQuery}
                        onValueChange={setCustomerSearchQuery}
                      />
                      <CommandList>
                        {isSearching ? (
                          <div className="p-4 text-center text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin mx-auto mb-2" />
                            Suche...
                          </div>
                        ) : searchResults.length === 0 && customerSearchQuery.length >= 2 ? (
                          <CommandEmpty>Keine Kunden gefunden</CommandEmpty>
                        ) : (
                          <CommandGroup>
                            {searchResults.map((customer) => (
                              <CommandItem
                                key={customer.id}
                                onSelect={() => handleSelectCustomer(customer)}
                              >
                                <div>
                                  <p className="font-medium">
                                    {customer.first_name} {customer.last_name}
                                  </p>
                                  {customer.phone && (
                                    <p className="text-sm text-muted-foreground">
                                      {customer.phone}
                                    </p>
                                  )}
                                </div>
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full"
                  onClick={() => setShowWalkInForm(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Neuen Laufkunden anlegen
                </Button>
              </div>
            )}
          </div>

          {/* Staff & Date/Time */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Mitarbeiter *</Label>
              <Select value={staffId} onValueChange={setStaffId}>
                <SelectTrigger>
                  <User className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Auswählen" />
                </SelectTrigger>
                <SelectContent>
                  {staff.map((member) => (
                    <SelectItem key={member.id} value={member.id}>
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: member.color }}
                        />
                        {member.name}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="date">Datum *</Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="time">Uhrzeit *</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="pl-9 w-full sm:w-32"
              />
            </div>
          </div>

          {/* Services (Multi-select) */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Dienstleistungen *</Label>
              {totalDuration > 0 && (
                <Badge variant="secondary">{totalDuration} Min.</Badge>
              )}
            </div>
            <div className="grid gap-2 max-h-48 overflow-y-auto p-1">
              {services.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted cursor-pointer"
                  onClick={() => toggleService(service.id)}
                >
                  <Checkbox
                    checked={selectedServiceIds.includes(service.id)}
                    onCheckedChange={() => toggleService(service.id)}
                  />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{service.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {service.duration_minutes} Min.
                      {service.price && ` • CHF ${service.price.toFixed(2)}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notizen</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optionale Notizen..."
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Erstellen...
                </>
              ) : (
                'Termin erstellen'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
