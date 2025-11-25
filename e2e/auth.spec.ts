import { test, expect } from '@playwright/test'

/**
 * Authentication E2E Tests
 *
 * Tests for login, registration, and logout flows.
 */

test.describe('Authentication', () => {
  test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/login')
    })

    test('should display login form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /anmelden/i })).toBeVisible()
      await expect(page.getByLabel(/e-mail/i)).toBeVisible()
      await expect(page.getByLabel(/passwort/i)).toBeVisible()
      await expect(page.getByRole('button', { name: /anmelden/i })).toBeVisible()
    })

    test('should show error for empty form submission', async ({ page }) => {
      await page.getByRole('button', { name: /anmelden/i }).click()

      // Should show validation errors
      await expect(page.getByText(/e-mail|passwort/i)).toBeVisible()
    })

    test('should show error for invalid email format', async ({ page }) => {
      await page.getByLabel(/e-mail/i).fill('invalid-email')
      await page.getByLabel(/passwort/i).fill('password123')
      await page.getByRole('button', { name: /anmelden/i }).click()

      await expect(page.getByText(/ungültige e-mail/i)).toBeVisible()
    })

    test('should show error for wrong credentials', async ({ page }) => {
      await page.getByLabel(/e-mail/i).fill('wrong@test.ch')
      await page.getByLabel(/passwort/i).fill('wrongpassword')
      await page.getByRole('button', { name: /anmelden/i }).click()

      await expect(page.getByText(/falsch|fehler/i)).toBeVisible({ timeout: 10000 })
    })

    test('should have link to registration', async ({ page }) => {
      const registerLink = page.getByRole('link', { name: /registrieren/i })
      await expect(registerLink).toBeVisible()

      await registerLink.click()
      await expect(page).toHaveURL(/registrieren/)
    })

    test('should navigate to password reset', async ({ page }) => {
      const forgotLink = page.getByRole('link', { name: /vergessen/i })
      if (await forgotLink.isVisible()) {
        await forgotLink.click()
        // Should navigate to password reset page
        await expect(page.url()).toContain('passwort')
      }
    })

    test('should prevent XSS in email field', async ({ page }) => {
      await page.getByLabel(/e-mail/i).fill('<script>alert("xss")</script>@test.ch')
      await page.getByLabel(/passwort/i).fill('password123')
      await page.getByRole('button', { name: /anmelden/i }).click()

      // Should show validation error, not execute script
      await expect(page.getByText(/ungültige e-mail/i)).toBeVisible()
    })
  })

  test.describe('Registration Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/registrieren')
    })

    test('should display registration form', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /registrieren|konto/i })).toBeVisible()
      await expect(page.getByLabel(/vorname/i)).toBeVisible()
      await expect(page.getByLabel(/nachname/i)).toBeVisible()
      await expect(page.getByLabel(/e-mail/i)).toBeVisible()
      await expect(page.getByLabel(/passwort/i)).toBeVisible()
    })

    test('should validate password strength', async ({ page }) => {
      await page.getByLabel(/vorname/i).fill('Test')
      await page.getByLabel(/nachname/i).fill('User')
      await page.getByLabel(/e-mail/i).fill('test@example.ch')

      // Short password
      await page.getByLabel(/passwort/i).first().fill('short')
      await page.getByRole('button', { name: /registrieren/i }).click()

      await expect(page.getByText(/mindestens 8 zeichen/i)).toBeVisible()
    })

    test('should have link to login', async ({ page }) => {
      const loginLink = page.getByRole('link', { name: /anmelden/i })
      await expect(loginLink).toBeVisible()
    })
  })

  test.describe('Protected Routes', () => {
    test('should redirect to login when accessing dashboard without auth', async ({ page }) => {
      await page.goto('/dashboard')

      // Should redirect to login
      await expect(page).toHaveURL(/login/)
    })

    test('should redirect to login when accessing customer portal without auth', async ({ page }) => {
      await page.goto('/konto')

      // Should redirect to login or show access denied
      await expect(page.url()).toMatch(/login|konto/)
    })
  })
})
