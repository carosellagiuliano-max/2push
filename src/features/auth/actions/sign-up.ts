'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const signUpSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
  firstName: z.string().min(2, 'Vorname muss mindestens 2 Zeichen haben'),
  lastName: z.string().min(2, 'Nachname muss mindestens 2 Zeichen haben'),
})

export type SignUpResult = {
  success: boolean
  error?: string
  message?: string
}

export async function signUp(formData: FormData): Promise<SignUpResult> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string
    const firstName = formData.get('firstName') as string
    const lastName = formData.get('lastName') as string

    const validated = signUpSchema.parse({ email, password, firstName, lastName })

    const supabase = await createClient()

    const { data, error } = await supabase.auth.signUp({
      email: validated.email,
      password: validated.password,
      options: {
        data: {
          first_name: validated.firstName,
          last_name: validated.lastName,
          full_name: `${validated.firstName} ${validated.lastName}`,
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
      },
    })

    if (error) {
      if (error.message.includes('User already registered')) {
        return {
          success: false,
          error: 'Diese E-Mail-Adresse ist bereits registriert.',
        }
      }
      return {
        success: false,
        error: error.message,
      }
    }

    // Check if email confirmation is required
    if (data.user && !data.session) {
      return {
        success: true,
        message: 'Bitte bestätigen Sie Ihre E-Mail-Adresse. Sie erhalten in Kürze eine E-Mail mit einem Bestätigungslink.',
      }
    }

    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        success: false,
        error: error.errors[0].message,
      }
    }
    return {
      success: false,
      error: 'Ein unerwarteter Fehler ist aufgetreten.',
    }
  }
}
