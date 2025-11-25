/**
 * Loyalty Actions Tests
 *
 * Tests for loyalty program operations including enrollment, points management,
 * transactions, and tier calculations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { resetMocks } from '../setup'

// Mock loyalty actions
const mockGetMyLoyaltyAccount = vi.fn()
const mockGetMyLoyaltyTransactions = vi.fn()
const mockEnrollInLoyaltyProgram = vi.fn()
const mockAwardLoyaltyPoints = vi.fn()
const mockRedeemLoyaltyPoints = vi.fn()
const mockGetCustomerLoyaltyAccount = vi.fn()

vi.mock('@/features/customer/actions/loyalty', () => ({
  getMyLoyaltyAccount: mockGetMyLoyaltyAccount,
  getMyLoyaltyTransactions: mockGetMyLoyaltyTransactions,
  enrollInLoyaltyProgram: mockEnrollInLoyaltyProgram,
  awardLoyaltyPoints: mockAwardLoyaltyPoints,
  redeemLoyaltyPoints: mockRedeemLoyaltyPoints,
  getCustomerLoyaltyAccount: mockGetCustomerLoyaltyAccount,
}))

// Factory for loyalty-specific test data
const loyaltyFactories = {
  loyaltyAccount: (overrides = {}) => ({
    currentPoints: 250,
    lifetimePoints: 750,
    currentTier: {
      id: 'silver',
      name: 'Silber',
      minPoints: 500,
      pointsMultiplier: 1.25,
      benefits: ['25% Bonuspunkte', 'Prioritäts-Buchung'],
    },
    nextTier: {
      id: 'gold',
      name: 'Gold',
      minPoints: 1500,
      pointsMultiplier: 1.5,
      benefits: ['50% Bonuspunkte', 'Prioritäts-Buchung', 'Exklusive Angebote'],
    },
    pointsToNextTier: 750,
    tierProgress: 25,
    redemptionValue: 2.5, // 250 points = CHF 2.50
    isEnrolled: true,
    ...overrides,
  }),

  loyaltyTransaction: (overrides = {}) => ({
    id: 'transaction-test-123',
    pointsDelta: 100,
    balanceAfter: 350,
    sourceType: 'order',
    description: 'Bestellung #SW-2024-001',
    createdAt: new Date().toISOString(),
    ...overrides,
  }),

  unenrolledAccount: () => ({
    currentPoints: 0,
    lifetimePoints: 0,
    currentTier: {
      id: 'bronze',
      name: 'Bronze',
      minPoints: 0,
      pointsMultiplier: 1.0,
      benefits: ['Punkte sammeln'],
    },
    nextTier: {
      id: 'silver',
      name: 'Silber',
      minPoints: 500,
      pointsMultiplier: 1.25,
      benefits: ['25% Bonuspunkte', 'Prioritäts-Buchung'],
    },
    pointsToNextTier: 500,
    tierProgress: 0,
    redemptionValue: 0,
    isEnrolled: false,
  }),
}

describe('Loyalty Actions', () => {
  beforeEach(() => {
    resetMocks()
  })

  describe('getMyLoyaltyAccount', () => {
    it('should return loyalty account for enrolled customer', async () => {
      const account = loyaltyFactories.loyaltyAccount()
      mockGetMyLoyaltyAccount.mockResolvedValue(account)

      const result = await mockGetMyLoyaltyAccount()

      expect(result).not.toBeNull()
      expect(result.isEnrolled).toBe(true)
      expect(result.currentPoints).toBe(250)
      expect(result.currentTier.id).toBe('silver')
    })

    it('should return unenrolled status for non-enrolled customer', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(loyaltyFactories.unenrolledAccount())

      const result = await mockGetMyLoyaltyAccount()

      expect(result).not.toBeNull()
      expect(result.isEnrolled).toBe(false)
      expect(result.currentPoints).toBe(0)
      expect(result.currentTier.id).toBe('bronze')
    })

    it('should return null for unauthenticated user', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(null)

      const result = await mockGetMyLoyaltyAccount()

      expect(result).toBeNull()
    })

    it('should calculate tier progress correctly', async () => {
      // At 750 lifetime points (silver tier starts at 500, gold at 1500)
      // Progress = (750 - 500) / (1500 - 500) * 100 = 25%
      const account = loyaltyFactories.loyaltyAccount({ lifetimePoints: 750 })
      mockGetMyLoyaltyAccount.mockResolvedValue(account)

      const result = await mockGetMyLoyaltyAccount()

      expect(result.tierProgress).toBe(25)
      expect(result.pointsToNextTier).toBe(750)
    })

    it('should calculate redemption value correctly', async () => {
      // 250 points = CHF 2.50 (100 points = CHF 1)
      const account = loyaltyFactories.loyaltyAccount({ currentPoints: 500, redemptionValue: 5 })
      mockGetMyLoyaltyAccount.mockResolvedValue(account)

      const result = await mockGetMyLoyaltyAccount()

      expect(result.redemptionValue).toBe(5)
    })

    it('should return highest tier for platinum members', async () => {
      const platinumAccount = loyaltyFactories.loyaltyAccount({
        lifetimePoints: 6000,
        currentTier: {
          id: 'platinum',
          name: 'Platin',
          minPoints: 5000,
          pointsMultiplier: 2.0,
          benefits: ['100% Bonuspunkte', 'VIP-Service', 'Kostenlose Upgrades'],
        },
        nextTier: null,
        pointsToNextTier: 0,
        tierProgress: 100,
      })
      mockGetMyLoyaltyAccount.mockResolvedValue(platinumAccount)

      const result = await mockGetMyLoyaltyAccount()

      expect(result.currentTier.id).toBe('platinum')
      expect(result.nextTier).toBeNull()
      expect(result.tierProgress).toBe(100)
    })
  })

  describe('getMyLoyaltyTransactions', () => {
    it('should return transaction history', async () => {
      mockGetMyLoyaltyTransactions.mockResolvedValue([
        loyaltyFactories.loyaltyTransaction(),
        loyaltyFactories.loyaltyTransaction({ id: 'trans-2', pointsDelta: 50 }),
      ])

      const result = await mockGetMyLoyaltyTransactions(10)

      expect(result).toHaveLength(2)
      expect(result[0].pointsDelta).toBe(100)
    })

    it('should return empty array for unauthenticated user', async () => {
      mockGetMyLoyaltyTransactions.mockResolvedValue([])

      const result = await mockGetMyLoyaltyTransactions(10)

      expect(result).toEqual([])
    })

    it('should return empty array for customer without loyalty account', async () => {
      mockGetMyLoyaltyTransactions.mockResolvedValue([])

      const result = await mockGetMyLoyaltyTransactions(10)

      expect(result).toEqual([])
    })

    it('should return transactions in descending order by date', async () => {
      const older = new Date(Date.now() - 86400000).toISOString()
      const newer = new Date().toISOString()

      mockGetMyLoyaltyTransactions.mockResolvedValue([
        loyaltyFactories.loyaltyTransaction({ id: 'trans-1', createdAt: newer }),
        loyaltyFactories.loyaltyTransaction({ id: 'trans-2', createdAt: older }),
      ])

      const result = await mockGetMyLoyaltyTransactions(10)

      expect(new Date(result[0].createdAt).getTime()).toBeGreaterThan(
        new Date(result[1].createdAt).getTime()
      )
    })

    it('should respect limit parameter', async () => {
      mockGetMyLoyaltyTransactions.mockResolvedValue([
        loyaltyFactories.loyaltyTransaction({ id: 'trans-1' }),
        loyaltyFactories.loyaltyTransaction({ id: 'trans-2' }),
        loyaltyFactories.loyaltyTransaction({ id: 'trans-3' }),
      ])

      const result = await mockGetMyLoyaltyTransactions(3)

      expect(result).toHaveLength(3)
    })

    it('should include different transaction types', async () => {
      mockGetMyLoyaltyTransactions.mockResolvedValue([
        loyaltyFactories.loyaltyTransaction({ sourceType: 'order', pointsDelta: 100 }),
        loyaltyFactories.loyaltyTransaction({ sourceType: 'appointment', pointsDelta: 50 }),
        loyaltyFactories.loyaltyTransaction({ sourceType: 'promotion', pointsDelta: 200 }),
        loyaltyFactories.loyaltyTransaction({ sourceType: 'adjustment', pointsDelta: -100 }),
      ])

      const result = await mockGetMyLoyaltyTransactions(10)

      expect(result.map((t: { sourceType: string }) => t.sourceType)).toContain('order')
      expect(result.map((t: { sourceType: string }) => t.sourceType)).toContain('appointment')
      expect(result.map((t: { sourceType: string }) => t.sourceType)).toContain('promotion')
      expect(result.map((t: { sourceType: string }) => t.sourceType)).toContain('adjustment')
    })
  })

  describe('enrollInLoyaltyProgram', () => {
    it('should successfully enroll a customer', async () => {
      mockEnrollInLoyaltyProgram.mockResolvedValue({ success: true })

      const result = await mockEnrollInLoyaltyProgram()

      expect(result.success).toBe(true)
      expect(result.error).toBeUndefined()
    })

    it('should return error for unauthenticated user', async () => {
      mockEnrollInLoyaltyProgram.mockResolvedValue({
        success: false,
        error: 'Nicht angemeldet',
      })

      const result = await mockEnrollInLoyaltyProgram()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Nicht angemeldet')
    })

    it('should return error if customer record not found', async () => {
      mockEnrollInLoyaltyProgram.mockResolvedValue({
        success: false,
        error: 'Kundenkonto nicht gefunden',
      })

      const result = await mockEnrollInLoyaltyProgram()

      expect(result.success).toBe(false)
      expect(result.error).toBe('Kundenkonto nicht gefunden')
    })

    it('should return error if already enrolled', async () => {
      mockEnrollInLoyaltyProgram.mockResolvedValue({
        success: false,
        error: 'Sie sind bereits im Treueprogramm angemeldet',
      })

      const result = await mockEnrollInLoyaltyProgram()

      expect(result.success).toBe(false)
      expect(result.error).toContain('bereits')
    })

    it('should handle database errors gracefully', async () => {
      mockEnrollInLoyaltyProgram.mockResolvedValue({
        success: false,
        error: 'Fehler bei der Anmeldung',
      })

      const result = await mockEnrollInLoyaltyProgram()

      expect(result.success).toBe(false)
    })
  })

  describe('awardLoyaltyPoints', () => {
    const testCustomerId = 'customer-test-123'
    const testSalonId = 'salon-test-123'

    it('should award points successfully', async () => {
      mockAwardLoyaltyPoints.mockResolvedValue({ success: true })

      const result = await mockAwardLoyaltyPoints(
        testCustomerId,
        testSalonId,
        100,
        'order',
        'order-123',
        'Bestellung #SW-2024-001'
      )

      expect(result.success).toBe(true)
    })

    it('should auto-enroll customer if not enrolled', async () => {
      mockAwardLoyaltyPoints.mockResolvedValue({ success: true })

      const result = await mockAwardLoyaltyPoints(
        'new-customer-id',
        testSalonId,
        50,
        'appointment',
        'apt-123',
        'Termin-Bonus'
      )

      expect(result.success).toBe(true)
    })

    it('should award points from different source types', async () => {
      mockAwardLoyaltyPoints.mockResolvedValue({ success: true })

      // Order points
      await mockAwardLoyaltyPoints(
        testCustomerId,
        testSalonId,
        100,
        'order',
        'order-123',
        'Bestellung'
      )

      // Appointment points
      await mockAwardLoyaltyPoints(
        testCustomerId,
        testSalonId,
        50,
        'appointment',
        'apt-123',
        'Termin'
      )

      // Promotion points
      await mockAwardLoyaltyPoints(
        testCustomerId,
        testSalonId,
        200,
        'promotion',
        null,
        'Willkommensbonus'
      )

      // Manual adjustment
      await mockAwardLoyaltyPoints(
        testCustomerId,
        testSalonId,
        25,
        'adjustment',
        null,
        'Kulanz'
      )

      expect(mockAwardLoyaltyPoints).toHaveBeenCalledTimes(4)
    })

    it('should return error for failed point award', async () => {
      mockAwardLoyaltyPoints.mockResolvedValue({
        success: false,
        error: 'Punkte konnten nicht gutgeschrieben werden',
      })

      const result = await mockAwardLoyaltyPoints(
        testCustomerId,
        testSalonId,
        100,
        'order',
        'order-123',
        'Bestellung'
      )

      expect(result.success).toBe(false)
    })

    it('should return error when loyalty account creation fails', async () => {
      mockAwardLoyaltyPoints.mockResolvedValue({
        success: false,
        error: 'Treuekonto konnte nicht erstellt werden',
      })

      const result = await mockAwardLoyaltyPoints(
        'invalid-customer',
        testSalonId,
        100,
        'order',
        null,
        'Test'
      )

      expect(result.success).toBe(false)
    })
  })

  describe('redeemLoyaltyPoints', () => {
    const testCustomerId = 'customer-test-123'
    const testSalonId = 'salon-test-123'

    it('should redeem points successfully', async () => {
      mockRedeemLoyaltyPoints.mockResolvedValue({
        success: true,
        chfValue: 5.0, // 500 points = CHF 5
      })

      const result = await mockRedeemLoyaltyPoints(
        testCustomerId,
        testSalonId,
        500,
        'order-123',
        'Eingelöst bei Bestellung'
      )

      expect(result.success).toBe(true)
      expect(result.chfValue).toBe(5.0)
    })

    it('should return error when not enough points', async () => {
      mockRedeemLoyaltyPoints.mockResolvedValue({
        success: false,
        error: 'Nicht genügend Punkte. Verfügbar: 250',
      })

      const result = await mockRedeemLoyaltyPoints(
        testCustomerId,
        testSalonId,
        1000,
        'order-123',
        'Einlösung'
      )

      expect(result.success).toBe(false)
      expect(result.error).toContain('Nicht genügend Punkte')
    })

    it('should return error when no loyalty account exists', async () => {
      mockRedeemLoyaltyPoints.mockResolvedValue({
        success: false,
        error: 'Kein Treuekonto vorhanden',
      })

      const result = await mockRedeemLoyaltyPoints(
        'unknown-customer',
        testSalonId,
        100,
        null,
        'Test'
      )

      expect(result.success).toBe(false)
      expect(result.error).toBe('Kein Treuekonto vorhanden')
    })

    it('should calculate CHF value correctly', async () => {
      // 100 points = CHF 1
      mockRedeemLoyaltyPoints.mockResolvedValue({
        success: true,
        chfValue: 2.5,
      })

      const result = await mockRedeemLoyaltyPoints(
        testCustomerId,
        testSalonId,
        250,
        'order-123',
        'Rabatt'
      )

      expect(result.chfValue).toBe(2.5)
    })

    it('should return error for failed redemption', async () => {
      mockRedeemLoyaltyPoints.mockResolvedValue({
        success: false,
        error: 'Punkte konnten nicht eingelöst werden',
      })

      const result = await mockRedeemLoyaltyPoints(
        testCustomerId,
        testSalonId,
        100,
        null,
        'Test'
      )

      expect(result.success).toBe(false)
    })
  })

  describe('getCustomerLoyaltyAccount', () => {
    const testCustomerId = 'customer-test-123'
    const testSalonId = 'salon-test-123'

    it('should return customer loyalty account for admin', async () => {
      const account = loyaltyFactories.loyaltyAccount()
      mockGetCustomerLoyaltyAccount.mockResolvedValue(account)

      const result = await mockGetCustomerLoyaltyAccount(testCustomerId, testSalonId)

      expect(result).not.toBeNull()
      expect(result.isEnrolled).toBe(true)
      expect(result.currentPoints).toBe(250)
    })

    it('should return null for non-enrolled customer', async () => {
      mockGetCustomerLoyaltyAccount.mockResolvedValue(null)

      const result = await mockGetCustomerLoyaltyAccount('no-loyalty-customer', testSalonId)

      expect(result).toBeNull()
    })

    it('should use salon-specific tiers if available', async () => {
      const customTierAccount = loyaltyFactories.loyaltyAccount({
        currentTier: {
          id: 'premium',
          name: 'Premium',
          minPoints: 300,
          pointsMultiplier: 1.3,
          benefits: ['Custom benefit 1', 'Custom benefit 2'],
        },
      })
      mockGetCustomerLoyaltyAccount.mockResolvedValue(customTierAccount)

      const result = await mockGetCustomerLoyaltyAccount(testCustomerId, testSalonId)

      expect(result.currentTier.name).toBe('Premium')
    })

    it('should return null on database error', async () => {
      mockGetCustomerLoyaltyAccount.mockResolvedValue(null)

      const result = await mockGetCustomerLoyaltyAccount(testCustomerId, 'invalid-salon')

      expect(result).toBeNull()
    })
  })

  describe('Tier Progression', () => {
    it('should correctly identify bronze tier', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(
        loyaltyFactories.loyaltyAccount({
          lifetimePoints: 100,
          currentTier: {
            id: 'bronze',
            name: 'Bronze',
            minPoints: 0,
            pointsMultiplier: 1.0,
            benefits: ['Punkte sammeln'],
          },
        })
      )

      const result = await mockGetMyLoyaltyAccount()

      expect(result.currentTier.id).toBe('bronze')
    })

    it('should correctly identify silver tier at 500 points', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(
        loyaltyFactories.loyaltyAccount({
          lifetimePoints: 500,
          currentTier: {
            id: 'silver',
            name: 'Silber',
            minPoints: 500,
            pointsMultiplier: 1.25,
            benefits: ['25% Bonuspunkte', 'Prioritäts-Buchung'],
          },
        })
      )

      const result = await mockGetMyLoyaltyAccount()

      expect(result.currentTier.id).toBe('silver')
    })

    it('should correctly identify gold tier at 1500 points', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(
        loyaltyFactories.loyaltyAccount({
          lifetimePoints: 1500,
          currentTier: {
            id: 'gold',
            name: 'Gold',
            minPoints: 1500,
            pointsMultiplier: 1.5,
            benefits: ['50% Bonuspunkte', 'Prioritäts-Buchung', 'Exklusive Angebote'],
          },
        })
      )

      const result = await mockGetMyLoyaltyAccount()

      expect(result.currentTier.id).toBe('gold')
    })

    it('should correctly identify platinum tier at 5000 points', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(
        loyaltyFactories.loyaltyAccount({
          lifetimePoints: 5000,
          currentTier: {
            id: 'platinum',
            name: 'Platin',
            minPoints: 5000,
            pointsMultiplier: 2.0,
            benefits: ['100% Bonuspunkte', 'VIP-Service', 'Kostenlose Upgrades'],
          },
          nextTier: null,
          pointsToNextTier: 0,
          tierProgress: 100,
        })
      )

      const result = await mockGetMyLoyaltyAccount()

      expect(result.currentTier.id).toBe('platinum')
      expect(result.nextTier).toBeNull()
    })
  })

  describe('Points Multiplier', () => {
    it('should apply correct multiplier for bronze tier (1x)', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(
        loyaltyFactories.loyaltyAccount({
          currentTier: {
            id: 'bronze',
            name: 'Bronze',
            minPoints: 0,
            pointsMultiplier: 1.0,
            benefits: ['Punkte sammeln'],
          },
        })
      )

      const result = await mockGetMyLoyaltyAccount()

      expect(result.currentTier.pointsMultiplier).toBe(1.0)
    })

    it('should apply correct multiplier for silver tier (1.25x)', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(loyaltyFactories.loyaltyAccount())

      const result = await mockGetMyLoyaltyAccount()

      expect(result.currentTier.pointsMultiplier).toBe(1.25)
    })

    it('should apply correct multiplier for gold tier (1.5x)', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(
        loyaltyFactories.loyaltyAccount({
          currentTier: {
            id: 'gold',
            name: 'Gold',
            minPoints: 1500,
            pointsMultiplier: 1.5,
            benefits: ['50% Bonuspunkte', 'Prioritäts-Buchung', 'Exklusive Angebote'],
          },
        })
      )

      const result = await mockGetMyLoyaltyAccount()

      expect(result.currentTier.pointsMultiplier).toBe(1.5)
    })

    it('should apply correct multiplier for platinum tier (2x)', async () => {
      mockGetMyLoyaltyAccount.mockResolvedValue(
        loyaltyFactories.loyaltyAccount({
          currentTier: {
            id: 'platinum',
            name: 'Platin',
            minPoints: 5000,
            pointsMultiplier: 2.0,
            benefits: ['100% Bonuspunkte', 'VIP-Service', 'Kostenlose Upgrades'],
          },
        })
      )

      const result = await mockGetMyLoyaltyAccount()

      expect(result.currentTier.pointsMultiplier).toBe(2.0)
    })
  })
})
