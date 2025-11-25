'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logging'
import { z } from 'zod'

// Validation schemas
const requestResetSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
})

const updatePasswordSchema = z.object({
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwörter stimmen nicht überein',
  path: ['confirmPassword'],
})

export interface ResetPasswordResult {
  success: boolean
  error?: string
}

/**
 * Request a password reset email
 */
export async function requestPasswordReset(formData: FormData): Promise<ResetPasswordResult> {
  const supabase = await createClient()

  const email = formData.get('email')

  // Validate input
  const validation = requestResetSchema.safeParse({ email })
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Ungültige Eingabe',
    }
  }

  try {
    // Get the base URL for the redirect
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const redirectTo = `${baseUrl}/passwort-zuruecksetzen`

    const { error } = await supabase.auth.resetPasswordForEmail(validation.data.email, {
      redirectTo,
    })

    if (error) {
      logger.error('Password reset request failed', { error: error.message })
      // Don't reveal if email exists or not for security
      return { success: true }
    }

    logger.info('Password reset email sent', { email: validation.data.email })

    // Always return success to prevent email enumeration
    return { success: true }
  } catch (error) {
    logger.error('Unexpected error during password reset request', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return {
      success: false,
      error: 'Ein unerwarteter Fehler ist aufgetreten',
    }
  }
}

/**
 * Update password after clicking reset link
 */
export async function updatePassword(formData: FormData): Promise<ResetPasswordResult> {
  const supabase = await createClient()

  const password = formData.get('password')
  const confirmPassword = formData.get('confirmPassword')

  // Validate input
  const validation = updatePasswordSchema.safeParse({ password, confirmPassword })
  if (!validation.success) {
    return {
      success: false,
      error: validation.error.errors[0]?.message || 'Ungültige Eingabe',
    }
  }

  try {
    const { error } = await supabase.auth.updateUser({
      password: validation.data.password,
    })

    if (error) {
      logger.error('Password update failed', { error: error.message })

      if (error.message.includes('same_password')) {
        return {
          success: false,
          error: 'Das neue Passwort muss sich vom alten unterscheiden',
        }
      }

      return {
        success: false,
        error: 'Passwort konnte nicht aktualisiert werden',
      }
    }

    logger.info('Password updated successfully')

    return { success: true }
  } catch (error) {
    logger.error('Unexpected error during password update', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return {
      success: false,
      error: 'Ein unerwarteter Fehler ist aufgetreten',
    }
  }
}
