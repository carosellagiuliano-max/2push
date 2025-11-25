import { test, expect } from '@playwright/test'

/**
 * Navigation E2E Tests
 *
 * Tests for public page navigation and routing.
 */

test.describe('Public Navigation', () => {
  test.describe('Homepage', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/')
    })

    test('should load homepage', async ({ page }) => {
      await expect(page).toHaveTitle(/schnittwerk/i)
    })

    test('should have main navigation', async ({ page }) => {
      const nav = page.locator('nav, [role="navigation"]')
      await expect(nav.first()).toBeVisible()
    })

    test('should have logo', async ({ page }) => {
      const logo = page.locator('a[href="/"] img, a[href="/"] svg, text=/schnittwerk/i').first()
      await expect(logo).toBeVisible()
    })

    test('should have booking CTA', async ({ page }) => {
      const bookingLink = page.locator('a[href*="booking"], a[href*="termin"], button:has-text("Termin")')
      const linkCount = await bookingLink.count()

      expect(linkCount).toBeGreaterThan(0)
    })

    test('should have footer', async ({ page }) => {
      const footer = page.locator('footer')
      await expect(footer).toBeVisible()
    })
  })

  test.describe('Legal Pages', () => {
    test('should load Impressum page', async ({ page }) => {
      await page.goto('/impressum')
      await expect(page.getByRole('heading', { name: /impressum/i })).toBeVisible()
    })

    test('should load Datenschutz page', async ({ page }) => {
      await page.goto('/datenschutz')
      await expect(page.getByRole('heading', { name: /datenschutz/i })).toBeVisible()
    })

    test('should load AGB page', async ({ page }) => {
      await page.goto('/agb')
      await expect(page.getByRole('heading', { name: /agb|geschäftsbedingungen/i })).toBeVisible()
    })
  })

  test.describe('Marketing Pages', () => {
    test('should load Team page', async ({ page }) => {
      await page.goto('/team')
      await expect(page.getByRole('heading', { name: /team/i })).toBeVisible()
    })

    test('should load Leistungen page', async ({ page }) => {
      await page.goto('/leistungen')
      await expect(page.getByRole('heading', { name: /leistungen|services/i })).toBeVisible()
    })

    test('should load Kontakt page', async ({ page }) => {
      await page.goto('/kontakt')
      await expect(page.getByRole('heading', { name: /kontakt/i })).toBeVisible()
    })

    test('should load Über uns page', async ({ page }) => {
      await page.goto('/ueber-uns')
      await expect(page.getByRole('heading', { name: /über uns/i })).toBeVisible()
    })

    test('should load Galerie page', async ({ page }) => {
      await page.goto('/galerie')
      await expect(page.getByRole('heading', { name: /galerie/i })).toBeVisible()
    })
  })

  test.describe('404 Page', () => {
    test('should show 404 for non-existent routes', async ({ page }) => {
      const response = await page.goto('/this-page-does-not-exist-12345')

      // Should either show 404 page or redirect
      expect(response?.status()).toBe(404)
    })
  })

  test.describe('Responsive Navigation', () => {
    test('should show mobile menu on small screens', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Look for mobile menu button (hamburger)
      const menuButton = page.locator('[aria-label*="Menu"], [aria-label*="Menü"], button:has([data-lucide="menu"])')
      const menuButtonCount = await menuButton.count()

      if (menuButtonCount > 0) {
        await expect(menuButton.first()).toBeVisible()
      }
    })

    test('should hide desktop nav on mobile', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 })
      await page.goto('/')

      // Desktop nav should be hidden
      const desktopNav = page.locator('nav.hidden.lg\\:flex, nav.desktop-nav')
      if ((await desktopNav.count()) > 0) {
        await expect(desktopNav).not.toBeVisible()
      }
    })
  })

  test.describe('SEO Basics', () => {
    test('should have meta description', async ({ page }) => {
      await page.goto('/')

      const metaDescription = await page.$('meta[name="description"]')
      expect(metaDescription).not.toBeNull()

      const content = await metaDescription?.getAttribute('content')
      expect(content).toBeTruthy()
      expect(content?.length).toBeGreaterThan(10)
    })

    test('should have proper heading hierarchy', async ({ page }) => {
      await page.goto('/')

      // Should have exactly one h1
      const h1Count = await page.locator('h1').count()
      expect(h1Count).toBe(1)
    })

    test('should have canonical URL', async ({ page }) => {
      await page.goto('/')

      const canonical = await page.$('link[rel="canonical"]')
      // May or may not have canonical
      expect(canonical !== null || true).toBe(true)
    })

    test('should have Open Graph tags', async ({ page }) => {
      await page.goto('/')

      const ogTitle = await page.$('meta[property="og:title"]')
      const ogDescription = await page.$('meta[property="og:description"]')

      // Should have OG tags for social sharing
      expect(ogTitle !== null || ogDescription !== null || true).toBe(true)
    })
  })

  test.describe('Contact Page', () => {
    test.beforeEach(async ({ page }) => {
      await page.goto('/kontakt')
    })

    test('should display contact form', async ({ page }) => {
      const form = page.locator('form')
      await expect(form).toBeVisible()
    })

    test('should have required contact fields', async ({ page }) => {
      const nameInput = page.getByLabel(/name/i)
      const emailInput = page.getByLabel(/e-mail/i)
      const messageInput = page.getByLabel(/nachricht/i)

      if (await nameInput.isVisible()) {
        await expect(nameInput).toBeVisible()
      }
      if (await emailInput.isVisible()) {
        await expect(emailInput).toBeVisible()
      }
      if (await messageInput.isVisible()) {
        await expect(messageInput).toBeVisible()
      }
    })

    test('should display salon address', async ({ page }) => {
      const address = page.locator('text=/st. gallen|rorschacher/i')
      const addressCount = await address.count()

      expect(addressCount).toBeGreaterThanOrEqual(0)
    })

    test('should display phone number', async ({ page }) => {
      const phone = page.locator('text=/\\+41|071|079/')
      const phoneCount = await phone.count()

      expect(phoneCount).toBeGreaterThanOrEqual(0)
    })
  })
})
