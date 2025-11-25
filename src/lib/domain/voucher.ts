/**
 * Voucher Domain Logic
 *
 * Core business rules for voucher validation and redemption.
 */

import { isBefore, isAfter } from 'date-fns'

export interface Voucher {
  id: string
  code: string
  salonId: string
  totalValue: number
  remainingValue: number
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
}

export interface VoucherRedemption {
  id: string
  voucherId: string
  orderId: string
  redeemedAmount: number
  createdAt: Date
}

export type VoucherValidationError =
  | 'VOUCHER_NOT_FOUND'
  | 'VOUCHER_EXPIRED'
  | 'VOUCHER_INACTIVE'
  | 'VOUCHER_NO_BALANCE'
  | 'VOUCHER_WRONG_SALON'
  | 'VOUCHER_INSUFFICIENT_BALANCE'

export interface VoucherValidationResult {
  valid: boolean
  error?: VoucherValidationError
  message?: string
  voucher?: Voucher
  availableAmount?: number
}

/**
 * Validate a voucher code
 */
export function validateVoucher(
  voucher: Voucher | null,
  salonId: string,
  now: Date = new Date()
): VoucherValidationResult {
  if (!voucher) {
    return {
      valid: false,
      error: 'VOUCHER_NOT_FOUND',
      message: 'Gutschein nicht gefunden.',
    }
  }

  if (!voucher.isActive) {
    return {
      valid: false,
      error: 'VOUCHER_INACTIVE',
      message: 'Dieser Gutschein ist nicht mehr aktiv.',
    }
  }

  if (voucher.salonId !== salonId) {
    return {
      valid: false,
      error: 'VOUCHER_WRONG_SALON',
      message: 'Dieser Gutschein ist für einen anderen Salon.',
    }
  }

  if (voucher.expiresAt && isBefore(voucher.expiresAt, now)) {
    return {
      valid: false,
      error: 'VOUCHER_EXPIRED',
      message: 'Dieser Gutschein ist abgelaufen.',
    }
  }

  if (voucher.remainingValue <= 0) {
    return {
      valid: false,
      error: 'VOUCHER_NO_BALANCE',
      message: 'Dieser Gutschein hat kein Guthaben mehr.',
    }
  }

  return {
    valid: true,
    voucher,
    availableAmount: voucher.remainingValue,
  }
}

/**
 * Check if voucher has sufficient balance for a given amount
 */
export function hassufficientBalance(
  voucher: Voucher,
  requiredAmount: number
): boolean {
  return voucher.remainingValue >= requiredAmount
}

/**
 * Calculate redemption amount
 * Returns the actual amount that can be redeemed (capped at remaining balance)
 */
export function calculateRedemptionAmount(
  voucher: Voucher,
  orderAmount: number
): number {
  return Math.min(voucher.remainingValue, orderAmount)
}

/**
 * Calculate new remaining value after redemption
 */
export function calculateNewBalance(
  currentBalance: number,
  redemptionAmount: number
): number {
  const newBalance = currentBalance - redemptionAmount
  return Math.max(0, newBalance) // Ensure never negative
}

/**
 * Validate a redemption operation
 */
export function validateRedemption(
  voucher: Voucher,
  amount: number,
  salonId: string,
  now: Date = new Date()
): VoucherValidationResult {
  const validation = validateVoucher(voucher, salonId, now)

  if (!validation.valid) {
    return validation
  }

  if (amount <= 0) {
    return {
      valid: false,
      error: 'VOUCHER_INSUFFICIENT_BALANCE',
      message: 'Ungültiger Einlösebetrag.',
    }
  }

  if (voucher.remainingValue < amount) {
    return {
      valid: false,
      error: 'VOUCHER_INSUFFICIENT_BALANCE',
      message: `Guthabenrest (CHF ${voucher.remainingValue.toFixed(2)}) reicht nicht aus.`,
      voucher,
      availableAmount: voucher.remainingValue,
    }
  }

  return {
    valid: true,
    voucher,
    availableAmount: voucher.remainingValue,
  }
}

/**
 * Format voucher code for display (with dashes)
 */
export function formatVoucherCode(code: string): string {
  // Format: XXXX-XXXX-XXXX
  const cleaned = code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
  const chunks = cleaned.match(/.{1,4}/g) || []
  return chunks.join('-')
}

/**
 * Normalize voucher code for lookup (remove dashes, uppercase)
 */
export function normalizeVoucherCode(code: string): string {
  return code.replace(/[^A-Z0-9]/gi, '').toUpperCase()
}

/**
 * Check if a voucher is expiring soon (within days)
 */
export function isExpiringSoon(
  voucher: Voucher,
  daysThreshold: number = 30,
  now: Date = new Date()
): boolean {
  if (!voucher.expiresAt) {
    return false
  }

  const thresholdDate = new Date(now)
  thresholdDate.setDate(thresholdDate.getDate() + daysThreshold)

  return isBefore(voucher.expiresAt, thresholdDate) && isAfter(voucher.expiresAt, now)
}

/**
 * Calculate days until expiry
 */
export function getDaysUntilExpiry(voucher: Voucher, now: Date = new Date()): number | null {
  if (!voucher.expiresAt) {
    return null
  }

  const diffTime = voucher.expiresAt.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return Math.max(0, diffDays)
}
