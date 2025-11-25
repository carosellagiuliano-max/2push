'use server'

import { z } from 'zod'
import { createClient } from '@/lib/supabase/server'

const signInSchema = z.object({
  email: z.string().email('Ungültige E-Mail-Adresse'),
  password: z.string().min(8, 'Passwort muss mindestens 8 Zeichen haben'),
})

export type SignInResult = {
  success: boolean
  error?: string
}

export async function signIn(formData: FormData): Promise<SignInResult> {
  try {
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const validated = signInSchema.parse({ email, password })

    const supabase = await createClient()

    const { error } = await supabase.auth.signInWithPassword({
      email: validated.email,
      password: validated.password,
    })

    if (error) {
      if (error.message.includes('Invalid login credentials')) {
        return {
          success: false,
          error: 'E-Mail oder Passwort ist falsch.',
        }
      }
      return {
        success: false,
        error: error.message,
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
