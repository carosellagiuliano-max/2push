'use client'

import * as React from 'react'
import { z } from 'zod'

import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { FormField } from '@/components/ui/form-field'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { useBooking } from '../hooks/use-booking'
import type { CustomerInfo } from '../types'

const customerSchema = z.object({
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
  email: z.string().email('Bitte geben Sie eine gültige E-Mail-Adresse ein'),
  phone: z
    .string()
    .min(10, 'Bitte geben Sie eine gültige Telefonnummer ein')
    .regex(/^[+]?[\d\s-()]+$/, 'Bitte geben Sie eine gültige Telefonnummer ein'),
})

interface CustomerFormProps {
  onValidChange?: (_isValid: boolean) => void
}

export function CustomerForm({ onValidChange }: CustomerFormProps) {
  const { customerInfo, setCustomerInfo, notes, setNotes } = useBooking()

  const [formData, setFormData] = React.useState<CustomerInfo>({
    firstName: customerInfo?.firstName || '',
    lastName: customerInfo?.lastName || '',
    email: customerInfo?.email || '',
    phone: customerInfo?.phone || '',
  })

  const [errors, setErrors] = React.useState<Record<string, string>>({})
  const [acceptTerms, setAcceptTerms] = React.useState(false)

  // Validate and update on change
  React.useEffect(() => {
    const result = customerSchema.safeParse(formData)

    if (result.success) {
      setErrors({})
      setCustomerInfo(formData)
      onValidChange?.(acceptTerms)
    } else {
      const fieldErrors: Record<string, string> = {}
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as string
        fieldErrors[field] = issue.message
      })
      setErrors(fieldErrors)
      onValidChange?.(false)
    }
  }, [formData, acceptTerms, setCustomerInfo, onValidChange])

  const handleChange = (field: keyof CustomerInfo, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2">
        <FormField
          label="Vorname"
          htmlFor="firstName"
          required
          error={errors.firstName}
        >
          <Input
            id="firstName"
            value={formData.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            placeholder="Max"
            error={!!errors.firstName}
          />
        </FormField>

        <FormField
          label="Nachname"
          htmlFor="lastName"
          required
          error={errors.lastName}
        >
          <Input
            id="lastName"
            value={formData.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            placeholder="Mustermann"
            error={!!errors.lastName}
          />
        </FormField>
      </div>

      <FormField
        label="E-Mail"
        htmlFor="email"
        required
        error={errors.email}
        description="Wir senden Ihnen eine Bestätigung an diese Adresse"
      >
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleChange('email', e.target.value)}
          placeholder="max.mustermann@example.ch"
          error={!!errors.email}
        />
      </FormField>

      <FormField
        label="Telefon"
        htmlFor="phone"
        required
        error={errors.phone}
        description="Für Rückfragen zu Ihrem Termin"
      >
        <Input
          id="phone"
          type="tel"
          value={formData.phone}
          onChange={(e) => handleChange('phone', e.target.value)}
          placeholder="+41 79 123 45 67"
          error={!!errors.phone}
        />
      </FormField>

      <FormField
        label="Anmerkungen"
        htmlFor="notes"
        description="Optionale Hinweise für Ihren Termin"
      >
        <Textarea
          id="notes"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="z.B. besondere Wünsche oder Allergien"
          rows={3}
        />
      </FormField>

      {/* Terms checkbox */}
      <div className="flex items-start space-x-3">
        <Checkbox
          id="terms"
          checked={acceptTerms}
          onCheckedChange={(checked) => setAcceptTerms(checked === true)}
        />
        <div className="grid gap-1.5 leading-none">
          <Label
            htmlFor="terms"
            className="text-sm font-normal cursor-pointer"
          >
            Ich akzeptiere die{' '}
            <a href="/terms" className="text-primary underline hover:no-underline">
              AGB
            </a>{' '}
            und{' '}
            <a href="/privacy" className="text-primary underline hover:no-underline">
              Datenschutzerklärung
            </a>
          </Label>
        </div>
      </div>
    </div>
  )
}
