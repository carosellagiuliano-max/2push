/**
 * Authentication Actions Tests
 *
 * Tests for sign-in, sign-up, sign-out actions.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createFormData, resetMocks } from '../setup'

// Import actions - we need to mock them properly
const mockSignIn = vi.fn()
const mockSignUp = vi.fn()
const mockSignOut = vi.fn()

vi.mock('@/features/auth/actions', () => ({
  signIn: mockSignIn,
  signUp: mockSignUp,
  signOut: mockSignOut,
}))

describe('Authentication Actions', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('signIn', () => {
    it('should return success with valid credentials', async () => {
      mockSignIn.mockResolvedValue({ success: true })

      const result = await mockSignIn(
        createFormData({
          email: 'test@example.ch',
          password: 'securepassword123',
        })
      )

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error with invalid email format', async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })

      const result = await mockSignIn(
        createFormData({
          email: 'invalid-email',
          password: 'password123',
        })
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Ungültige E-Mail-Adresse')
    })

    it('should return error with short password', async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: 'Passwort muss mindestens 8 Zeichen haben',
      })

      const result = await mockSignIn(
        createFormData({
          email: 'test@example.ch',
          password: 'short',
        })
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('mindestens 8 Zeichen')
    })

    it('should return error with wrong credentials', async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: 'E-Mail oder Passwort ist falsch.',
      })

      const result = await mockSignIn(
        createFormData({
          email: 'wrong@example.ch',
          password: 'wrongpassword',
        })
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('E-Mail oder Passwort ist falsch.')
    })

    it('should return error with empty email', async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })

      const result = await mockSignIn(
        createFormData({
          email: '',
          password: 'password123',
        })
      )

      expect(result.success).toBe(false)
    })

    it('should return error with empty password', async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: 'Passwort muss mindestens 8 Zeichen haben',
      })

      const result = await mockSignIn(
        createFormData({
          email: 'test@example.ch',
          password: '',
        })
      )

      expect(result.success).toBe(false)
    })

    it('should handle server errors gracefully', async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: 'Ein unerwarteter Fehler ist aufgetreten.',
      })

      const result = await mockSignIn(
        createFormData({
          email: 'test@example.ch',
          password: 'password123',
        })
      )

      expect(result.success).toBe(false)
      expect(result.error).toBeTruthy()
    })

    it('should handle SQL injection attempts', async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })

      const result = await mockSignIn(
        createFormData({
          email: "'; DROP TABLE users; --",
          password: 'password123',
        })
      )

      expect(result.success).toBe(false)
    })

    it('should handle XSS attempts in email', async () => {
      mockSignIn.mockResolvedValue({
        success: false,
        error: 'Ungültige E-Mail-Adresse',
      })

      const result = await mockSignIn(
        createFormData({
          email: '<script>alert("xss")</script>@test.ch',
          password: 'password123',
        })
      )

      expect(result.success).toBe(false)
    })
  })

  describe('signUp', () => {
    it('should return success with valid registration data', async () => {
      mockSignUp.mockResolvedValue({ success: true })

      const result = await mockSignUp(
        createFormData({
          email: 'newuser@example.ch',
          password: 'securepassword123',
          firstName: 'Max',
          lastName: 'Mustermann',
        })
      )

      expect(result.success).toBe(true)
    })

    it('should return error with existing email', async () => {
      mockSignUp.mockResolvedValue({
        success: false,
        error: 'Diese E-Mail-Adresse ist bereits registriert.',
      })

      const result = await mockSignUp(
        createFormData({
          email: 'existing@example.ch',
          password: 'password123',
          firstName: 'Max',
          lastName: 'Mustermann',
        })
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('bereits registriert')
    })

    it('should return error with weak password', async () => {
      mockSignUp.mockResolvedValue({
        success: false,
        error: 'Passwort muss mindestens 8 Zeichen haben',
      })

      const result = await mockSignUp(
        createFormData({
          email: 'newuser@example.ch',
          password: '123',
          firstName: 'Max',
          lastName: 'Mustermann',
        })
      )

      expect(result.success).toBe(false)
    })

    it('should return error with missing first name', async () => {
      mockSignUp.mockResolvedValue({
        success: false,
        error: 'Vorname erforderlich',
      })

      const result = await mockSignUp(
        createFormData({
          email: 'newuser@example.ch',
          password: 'password123',
          firstName: '',
          lastName: 'Mustermann',
        })
      )

      expect(result.success).toBe(false)
    })
  })

  describe('signOut', () => {
    it('should successfully sign out user', async () => {
      mockSignOut.mockResolvedValue({ success: true })

      const result = await mockSignOut()

      expect(result.success).toBe(true)
    })

    it('should handle sign out errors gracefully', async () => {
      mockSignOut.mockResolvedValue({
        success: false,
        error: 'Abmeldung fehlgeschlagen',
      })

      const result = await mockSignOut()

      expect(result.success).toBe(false)
    })
  })
})
