import { describe, it, expect } from 'vitest'
import {
  validateVoucher,
  hassufficientBalance,
  calculateRedemptionAmount,
  calculateNewBalance,
  validateRedemption,
  formatVoucherCode,
  normalizeVoucherCode,
  isExpiringSoon,
  getDaysUntilExpiry,
  type Voucher,
} from './voucher'
import { addDays, subDays } from 'date-fns'

// Test fixtures
const baseDate = new Date('2025-01-20T10:00:00Z')
const salonId = 'salon-1'

const createVoucher = (overrides: Partial<Voucher> = {}): Voucher => ({
  id: 'voucher-1',
  code: 'ABCD1234EFGH',
  salonId,
  totalValue: 100,
  remainingValue: 100,
  expiresAt: addDays(baseDate, 90),
  isActive: true,
  createdAt: subDays(baseDate, 30),
  ...overrides,
})

describe('Voucher Domain Logic', () => {
  describe('validateVoucher', () => {
    it('should return valid for a valid voucher', () => {
      const voucher = createVoucher()
      const result = validateVoucher(voucher, salonId, baseDate)
      expect(result.valid).toBe(true)
      expect(result.voucher).toBe(voucher)
      expect(result.availableAmount).toBe(100)
    })

    it('should return error for null voucher', () => {
      const result = validateVoucher(null, salonId, baseDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('VOUCHER_NOT_FOUND')
    })

    it('should return error for inactive voucher', () => {
      const voucher = createVoucher({ isActive: false })
      const result = validateVoucher(voucher, salonId, baseDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('VOUCHER_INACTIVE')
    })

    it('should return error for wrong salon', () => {
      const voucher = createVoucher({ salonId: 'different-salon' })
      const result = validateVoucher(voucher, salonId, baseDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('VOUCHER_WRONG_SALON')
    })

    it('should return error for expired voucher', () => {
      const voucher = createVoucher({ expiresAt: subDays(baseDate, 1) })
      const result = validateVoucher(voucher, salonId, baseDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('VOUCHER_EXPIRED')
    })

    it('should return error for voucher with no balance', () => {
      const voucher = createVoucher({ remainingValue: 0 })
      const result = validateVoucher(voucher, salonId, baseDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('VOUCHER_NO_BALANCE')
    })

    it('should accept voucher with no expiry date', () => {
      const voucher = createVoucher({ expiresAt: null })
      const result = validateVoucher(voucher, salonId, baseDate)
      expect(result.valid).toBe(true)
    })
  })

  describe('hassufficientBalance', () => {
    it('should return true when balance is sufficient', () => {
      const voucher = createVoucher({ remainingValue: 100 })
      expect(hassufficientBalance(voucher, 50)).toBe(true)
    })

    it('should return true when balance equals required', () => {
      const voucher = createVoucher({ remainingValue: 100 })
      expect(hassufficientBalance(voucher, 100)).toBe(true)
    })

    it('should return false when balance is insufficient', () => {
      const voucher = createVoucher({ remainingValue: 30 })
      expect(hassufficientBalance(voucher, 50)).toBe(false)
    })
  })

  describe('calculateRedemptionAmount', () => {
    it('should return order amount when voucher has sufficient balance', () => {
      const voucher = createVoucher({ remainingValue: 100 })
      expect(calculateRedemptionAmount(voucher, 50)).toBe(50)
    })

    it('should return remaining value when order exceeds balance', () => {
      const voucher = createVoucher({ remainingValue: 30 })
      expect(calculateRedemptionAmount(voucher, 50)).toBe(30)
    })

    it('should return full balance when order equals balance', () => {
      const voucher = createVoucher({ remainingValue: 50 })
      expect(calculateRedemptionAmount(voucher, 50)).toBe(50)
    })
  })

  describe('calculateNewBalance', () => {
    it('should subtract redemption from balance', () => {
      expect(calculateNewBalance(100, 30)).toBe(70)
    })

    it('should return 0 when redemption equals balance', () => {
      expect(calculateNewBalance(50, 50)).toBe(0)
    })

    it('should never return negative value', () => {
      expect(calculateNewBalance(30, 50)).toBe(0)
    })
  })

  describe('validateRedemption', () => {
    it('should return valid for valid redemption', () => {
      const voucher = createVoucher({ remainingValue: 100 })
      const result = validateRedemption(voucher, 50, salonId, baseDate)
      expect(result.valid).toBe(true)
    })

    it('should return error for insufficient balance', () => {
      const voucher = createVoucher({ remainingValue: 30 })
      const result = validateRedemption(voucher, 50, salonId, baseDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('VOUCHER_INSUFFICIENT_BALANCE')
      expect(result.availableAmount).toBe(30)
    })

    it('should return error for zero amount', () => {
      const voucher = createVoucher()
      const result = validateRedemption(voucher, 0, salonId, baseDate)
      expect(result.valid).toBe(false)
    })

    it('should return error for negative amount', () => {
      const voucher = createVoucher()
      const result = validateRedemption(voucher, -10, salonId, baseDate)
      expect(result.valid).toBe(false)
    })

    it('should propagate voucher validation errors', () => {
      const voucher = createVoucher({ isActive: false })
      const result = validateRedemption(voucher, 50, salonId, baseDate)
      expect(result.valid).toBe(false)
      expect(result.error).toBe('VOUCHER_INACTIVE')
    })
  })

  describe('formatVoucherCode', () => {
    it('should format code with dashes', () => {
      expect(formatVoucherCode('ABCD1234EFGH')).toBe('ABCD-1234-EFGH')
    })

    it('should handle already formatted code', () => {
      expect(formatVoucherCode('ABCD-1234-EFGH')).toBe('ABCD-1234-EFGH')
    })

    it('should uppercase lowercase input', () => {
      expect(formatVoucherCode('abcd1234efgh')).toBe('ABCD-1234-EFGH')
    })

    it('should handle short codes', () => {
      expect(formatVoucherCode('ABC')).toBe('ABC')
    })

    it('should handle codes with spaces', () => {
      expect(formatVoucherCode('ABCD 1234 EFGH')).toBe('ABCD-1234-EFGH')
    })
  })

  describe('normalizeVoucherCode', () => {
    it('should remove dashes and uppercase', () => {
      expect(normalizeVoucherCode('abcd-1234-efgh')).toBe('ABCD1234EFGH')
    })

    it('should handle mixed case and spaces', () => {
      expect(normalizeVoucherCode('AbCd 1234 EfGh')).toBe('ABCD1234EFGH')
    })

    it('should handle already normalized code', () => {
      expect(normalizeVoucherCode('ABCD1234EFGH')).toBe('ABCD1234EFGH')
    })
  })

  describe('isExpiringSoon', () => {
    it('should return true when expiring within threshold', () => {
      const voucher = createVoucher({ expiresAt: addDays(baseDate, 15) })
      expect(isExpiringSoon(voucher, 30, baseDate)).toBe(true)
    })

    it('should return false when not expiring within threshold', () => {
      const voucher = createVoucher({ expiresAt: addDays(baseDate, 60) })
      expect(isExpiringSoon(voucher, 30, baseDate)).toBe(false)
    })

    it('should return false when already expired', () => {
      const voucher = createVoucher({ expiresAt: subDays(baseDate, 1) })
      expect(isExpiringSoon(voucher, 30, baseDate)).toBe(false)
    })

    it('should return false when no expiry date', () => {
      const voucher = createVoucher({ expiresAt: null })
      expect(isExpiringSoon(voucher, 30, baseDate)).toBe(false)
    })
  })

  describe('getDaysUntilExpiry', () => {
    it('should return days until expiry', () => {
      const voucher = createVoucher({ expiresAt: addDays(baseDate, 30) })
      expect(getDaysUntilExpiry(voucher, baseDate)).toBe(30)
    })

    it('should return 0 for expired voucher', () => {
      const voucher = createVoucher({ expiresAt: subDays(baseDate, 5) })
      expect(getDaysUntilExpiry(voucher, baseDate)).toBe(0)
    })

    it('should return null for voucher without expiry', () => {
      const voucher = createVoucher({ expiresAt: null })
      expect(getDaysUntilExpiry(voucher, baseDate)).toBeNull()
    })
  })
})
