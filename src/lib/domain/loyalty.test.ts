import { describe, it, expect } from 'vitest'
import {
  calculatePointsFromPurchase,
  determineTier,
  getPointsToNextTier,
  calculateRedemptionValue,
  calculatePointsRequired,
  canRedeemPoints,
  calculateNewBalance,
  validatePointsTransaction,
  getTierProgress,
  formatPoints,
  willUpgradeTier,
  DEFAULT_TIERS,
  DEFAULT_POINTS_PER_CHF,
  DEFAULT_POINTS_PER_REDEMPTION,
  type LoyaltyAccount,
  type LoyaltyTier,
} from './loyalty'

const salonId = 'salon-1'

const createAccount = (overrides: Partial<LoyaltyAccount> = {}): LoyaltyAccount => ({
  id: 'account-1',
  salonId,
  customerId: 'customer-1',
  currentPoints: 500,
  lifetimePoints: 750,
  tierId: 'silver',
  ...overrides,
})

describe('Loyalty Domain Logic', () => {
  describe('calculatePointsFromPurchase', () => {
    it('should calculate base points correctly', () => {
      const tier = DEFAULT_TIERS[0] // Bronze, multiplier 1.0
      const result = calculatePointsFromPurchase(100, tier)
      expect(result.basePoints).toBe(100)
      expect(result.bonusPoints).toBe(0)
      expect(result.totalPoints).toBe(100)
    })

    it('should apply tier multiplier for bonus points', () => {
      const tier = DEFAULT_TIERS[2] // Gold, multiplier 1.5
      const result = calculatePointsFromPurchase(100, tier)
      expect(result.basePoints).toBe(100)
      expect(result.bonusPoints).toBe(50) // 50% bonus
      expect(result.totalPoints).toBe(150)
    })

    it('should floor points to avoid fractions', () => {
      const tier = DEFAULT_TIERS[0]
      const result = calculatePointsFromPurchase(99.99, tier)
      expect(result.basePoints).toBe(99)
      expect(result.totalPoints).toBe(99)
    })

    it('should handle double multiplier (Platinum)', () => {
      const tier = DEFAULT_TIERS[3] // Platinum, multiplier 2.0
      const result = calculatePointsFromPurchase(100, tier)
      expect(result.basePoints).toBe(100)
      expect(result.bonusPoints).toBe(100) // 100% bonus
      expect(result.totalPoints).toBe(200)
    })

    it('should handle custom points per CHF', () => {
      const tier = DEFAULT_TIERS[0]
      const result = calculatePointsFromPurchase(100, tier, 2) // 2 points per CHF
      expect(result.basePoints).toBe(200)
      expect(result.totalPoints).toBe(200)
    })
  })

  describe('determineTier', () => {
    it('should return Bronze for 0 points', () => {
      const tier = determineTier(0)
      expect(tier.id).toBe('bronze')
    })

    it('should return Silver for 500+ points', () => {
      const tier = determineTier(500)
      expect(tier.id).toBe('silver')
    })

    it('should return Gold for 1500+ points', () => {
      const tier = determineTier(1500)
      expect(tier.id).toBe('gold')
    })

    it('should return Platinum for 5000+ points', () => {
      const tier = determineTier(5000)
      expect(tier.id).toBe('platinum')
    })

    it('should handle points between tiers', () => {
      const tier = determineTier(1000) // Between Silver (500) and Gold (1500)
      expect(tier.id).toBe('silver')
    })

    it('should handle very high points', () => {
      const tier = determineTier(100000)
      expect(tier.id).toBe('platinum')
    })
  })

  describe('getPointsToNextTier', () => {
    it('should calculate points needed for Silver', () => {
      const result = getPointsToNextTier(250)
      expect(result.nextTier?.id).toBe('silver')
      expect(result.pointsNeeded).toBe(250)
    })

    it('should calculate points needed for Gold', () => {
      const result = getPointsToNextTier(1000)
      expect(result.nextTier?.id).toBe('gold')
      expect(result.pointsNeeded).toBe(500)
    })

    it('should return null for max tier', () => {
      const result = getPointsToNextTier(10000)
      expect(result.nextTier).toBeNull()
      expect(result.pointsNeeded).toBe(0)
    })
  })

  describe('calculateRedemptionValue', () => {
    it('should convert points to CHF', () => {
      expect(calculateRedemptionValue(100)).toBe(1) // 100 points = 1 CHF
      expect(calculateRedemptionValue(500)).toBe(5)
      expect(calculateRedemptionValue(1000)).toBe(10)
    })

    it('should handle custom conversion rate', () => {
      expect(calculateRedemptionValue(100, 50)).toBe(2) // 50 points = 1 CHF
    })
  })

  describe('calculatePointsRequired', () => {
    it('should convert CHF to points', () => {
      expect(calculatePointsRequired(1)).toBe(100) // 1 CHF = 100 points
      expect(calculatePointsRequired(5)).toBe(500)
      expect(calculatePointsRequired(10)).toBe(1000)
    })

    it('should round up for fractional CHF', () => {
      expect(calculatePointsRequired(1.5)).toBe(150)
      expect(calculatePointsRequired(1.01)).toBe(101)
    })
  })

  describe('canRedeemPoints', () => {
    it('should return true when sufficient points', () => {
      const account = createAccount({ currentPoints: 500 })
      expect(canRedeemPoints(account, 300)).toBe(true)
    })

    it('should return true when exact points', () => {
      const account = createAccount({ currentPoints: 500 })
      expect(canRedeemPoints(account, 500)).toBe(true)
    })

    it('should return false when insufficient points', () => {
      const account = createAccount({ currentPoints: 200 })
      expect(canRedeemPoints(account, 300)).toBe(false)
    })

    it('should return false for zero redemption', () => {
      const account = createAccount({ currentPoints: 500 })
      expect(canRedeemPoints(account, 0)).toBe(false)
    })

    it('should return false for negative redemption', () => {
      const account = createAccount({ currentPoints: 500 })
      expect(canRedeemPoints(account, -100)).toBe(false)
    })
  })

  describe('calculateNewBalance', () => {
    it('should add positive points', () => {
      expect(calculateNewBalance(500, 100)).toBe(600)
    })

    it('should subtract negative points (redemption)', () => {
      expect(calculateNewBalance(500, -100)).toBe(400)
    })

    it('should not go negative', () => {
      expect(calculateNewBalance(100, -200)).toBe(0)
    })
  })

  describe('validatePointsTransaction', () => {
    it('should validate positive transaction', () => {
      const account = createAccount({ currentPoints: 100 })
      const result = validatePointsTransaction(account, 50)
      expect(result.valid).toBe(true)
    })

    it('should validate redemption with sufficient balance', () => {
      const account = createAccount({ currentPoints: 500 })
      const result = validatePointsTransaction(account, -300)
      expect(result.valid).toBe(true)
    })

    it('should reject redemption with insufficient balance', () => {
      const account = createAccount({ currentPoints: 200 })
      const result = validatePointsTransaction(account, -300)
      expect(result.valid).toBe(false)
      expect(result.error).toContain('Nicht genügend Punkte')
    })
  })

  describe('getTierProgress', () => {
    it('should return 0% at tier start', () => {
      expect(getTierProgress(0)).toBe(0)
    })

    it('should return 50% halfway through tier', () => {
      // Bronze: 0-500, halfway = 250
      expect(getTierProgress(250)).toBe(50)
    })

    it('should return 100% at max tier', () => {
      expect(getTierProgress(10000)).toBe(100)
    })

    it('should calculate progress within a tier', () => {
      // Silver: 500-1500, range = 1000
      // At 1000 points: (1000-500)/1000 = 50%
      expect(getTierProgress(1000)).toBe(50)
    })
  })

  describe('formatPoints', () => {
    it('should format points with Swiss locale', () => {
      // Swiss locale uses narrow no-break space or apostrophe as thousand separator
      const formatted1234 = formatPoints(1234)
      const formatted1M = formatPoints(1000000)
      expect(formatted1234).toMatch(/1.234/)
      expect(formatted1M).toMatch(/1.000.000/)
    })

    it('should handle small numbers', () => {
      expect(formatPoints(42)).toBe('42')
    })
  })

  describe('willUpgradeTier', () => {
    it('should detect tier upgrade', () => {
      const result = willUpgradeTier(450, 100) // 450 + 100 = 550 > 500 (Silver)
      expect(result.willUpgrade).toBe(true)
      expect(result.newTier?.id).toBe('silver')
    })

    it('should return false when staying in same tier', () => {
      const result = willUpgradeTier(600, 100) // 600 + 100 = 700 (still Silver)
      expect(result.willUpgrade).toBe(false)
      expect(result.newTier).toBeNull()
    })

    it('should handle multiple tier jumps', () => {
      const result = willUpgradeTier(400, 1200) // 400 + 1200 = 1600 > 1500 (Gold)
      expect(result.willUpgrade).toBe(true)
      expect(result.newTier?.id).toBe('gold')
    })

    it('should return false at max tier', () => {
      const result = willUpgradeTier(5000, 1000) // Already Platinum
      expect(result.willUpgrade).toBe(false)
    })
  })
})
