'use client'

import * as React from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createCustomer, updateCustomer } from '../actions'
import type { Customer } from '@/lib/database.types'

const customerSchema = z.object({
  first_name: z.string().min(1, 'Vorname ist erforderlich'),
  last_name: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültige E-Mail').optional().or(z.literal('')),
  phone: z.string().optional(),
  birthday: z.string().optional(),
  preferred_staff_id: z.string().optional(),
  notes: z.string().optional(),
  accepts_marketing: z.boolean().default(false),
})

type CustomerFormValues = z.infer<typeof customerSchema>

interface StaffOption {
  id: string
  display_name: string
  color: string
}

interface CustomerFormProps {
  salonId: string
  customer?: Customer | null
  staff?: StaffOption[]
  onSuccess?: () => void
}

export function CustomerForm({
  salonId,
  customer,
  staff = [],
  onSuccess,
}: CustomerFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [error, setError] = React.useState<string | null>(null)

  const isEditing = !!customer

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      first_name: customer?.first_name || '',
      last_name: customer?.last_name || '',
      email: customer?.email || '',
      phone: customer?.phone || '',
      birthday: customer?.birthday || '',
      preferred_staff_id: customer?.preferred_staff_id || '',
      notes: customer?.notes || '',
      accepts_marketing: customer?.accepts_marketing || false,
    },
  })

  const acceptsMarketing = watch('accepts_marketing')
  const preferredStaffId = watch('preferred_staff_id')

  const onSubmit = async (data: CustomerFormValues) => {
    setIsSubmitting(true)
    setError(null)

    try {
      const formData = {
        first_name: data.first_name,
        last_name: data.last_name,
        email: data.email || undefined,
        phone: data.phone || undefined,
        birthday: data.birthday || undefined,
        preferred_staff_id: data.preferred_staff_id || undefined,
        notes: data.notes || undefined,
        accepts_marketing: data.accepts_marketing,
      }

      const result = isEditing
        ? await updateCustomer(customer.id, salonId, formData)
        : await createCustomer(salonId, formData)

      if (!result.success) {
        setError(result.error || 'Ein Fehler ist aufgetreten')
        return
      }

      if (onSuccess) {
        onSuccess()
      } else {
        router.push(`/dashboard/customers/${result.customerId}`)
      }
    } catch (err) {
      setError('Ein unerwarteter Fehler ist aufgetreten')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {error && (
        <div className="p-4 bg-destructive/10 text-destructive rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Personal Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Persönliche Daten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="first_name">
                Vorname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="first_name"
                {...register('first_name')}
                placeholder="Max"
              />
              {errors.first_name && (
                <p className="text-sm text-destructive">
                  {errors.first_name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="last_name">
                Nachname <span className="text-destructive">*</span>
              </Label>
              <Input
                id="last_name"
                {...register('last_name')}
                placeholder="Mustermann"
              />
              {errors.last_name && (
                <p className="text-sm text-destructive">
                  {errors.last_name.message}
                </p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="birthday">Geburtstag</Label>
            <Input
              id="birthday"
              type="date"
              {...register('birthday')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Kontaktdaten</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">E-Mail</Label>
            <Input
              id="email"
              type="email"
              {...register('email')}
              placeholder="max@example.ch"
            />
            {errors.email && (
              <p className="text-sm text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Telefon</Label>
            <Input
              id="phone"
              type="tel"
              {...register('phone')}
              placeholder="+41 79 123 45 67"
            />
          </div>
        </CardContent>
      </Card>

      {/* Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Präferenzen</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {staff.length > 0 && (
            <div className="space-y-2">
              <Label htmlFor="preferred_staff_id">Bevorzugter Mitarbeiter</Label>
              <Select
                value={preferredStaffId || 'none'}
                onValueChange={(value) =>
                  setValue('preferred_staff_id', value === 'none' ? '' : value)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kein bevorzugter Mitarbeiter" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Kein bevorzugter Mitarbeiter</SelectItem>
                  {staff.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      <span className="flex items-center gap-2">
                        <span
                          className="h-3 w-3 rounded-full"
                          style={{ backgroundColor: s.color }}
                        />
                        {s.display_name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="accepts_marketing" className="cursor-pointer">
                Marketing-Einwilligung
              </Label>
              <p className="text-sm text-muted-foreground">
                Erlaubt Werbung und Newsletter per E-Mail/SMS
              </p>
            </div>
            <Switch
              id="accepts_marketing"
              checked={acceptsMarketing}
              onCheckedChange={(checked) => setValue('accepts_marketing', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Notizen</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <Label htmlFor="notes">Interne Notizen</Label>
            <Textarea
              id="notes"
              {...register('notes')}
              placeholder="Allergien, Präferenzen, besondere Hinweise..."
              rows={4}
            />
            <p className="text-xs text-muted-foreground">
              Diese Notizen sind nur für das Team sichtbar.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-end gap-3">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
          disabled={isSubmitting}
        >
          Abbrechen
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? 'Speichern' : 'Kunde erstellen'}
        </Button>
      </div>
    </form>
  )
}
