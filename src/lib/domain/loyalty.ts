/**
 * Loyalty Domain Logic
 *
 * Core business rules for loyalty points calculation, tiers, and rewards.
 */

export interface LoyaltyTier {
  id: string
  name: string
  minPoints: number
  pointsMultiplier: number // e.g., 1.5 = 50% bonus points
  benefits: string[]
}

export interface LoyaltyAccount {
  id: string
  salonId: string
  customerId: string
  currentPoints: number
  lifetimePoints: number
  tierId: string
}

export interface LoyaltyTransaction {
  id: string
  loyaltyAccountId: string
  salonId: string
  pointsDelta: number // positive for earning, negative for redemption
  sourceType: 'order' | 'appointment' | 'adjustment' | 'redemption' | 'expiry' | 'bonus'
  sourceId: string | null
  description: string
  createdAt: Date
}

export interface PointsCalculationResult {
  basePoints: number
  bonusPoints: number
  totalPoints: number
  multiplier: number
}

// Default configuration
export const DEFAULT_POINTS_PER_CHF = 1 // 1 point per CHF spent
export const DEFAULT_POINTS_PER_REDEMPTION = 100 // 100 points = 1 CHF discount

/**
 * Default loyalty tiers
 */
export const DEFAULT_TIERS: LoyaltyTier[] = [
  {
    id: 'bronze',
    name: 'Bronze',
    minPoints: 0,
    pointsMultiplier: 1.0,
    benefits: ['Punkte sammeln'],
  },
  {
    id: 'silver',
    name: 'Silber',
    minPoints: 500,
    pointsMultiplier: 1.25,
    benefits: ['25% Bonuspunkte', 'Prioritäts-Buchung'],
  },
  {
    id: 'gold',
    name: 'Gold',
    minPoints: 1500,
    pointsMultiplier: 1.5,
    benefits: ['50% Bonuspunkte', 'Prioritäts-Buchung', 'Exklusive Angebote'],
  },
  {
    id: 'platinum',
    name: 'Platin',
    minPoints: 5000,
    pointsMultiplier: 2.0,
    benefits: ['100% Bonuspunkte', 'VIP-Service', 'Kostenlose Upgrades'],
  },
]

/**
 * Calculate points earned from a purchase
 */
export function calculatePointsFromPurchase(
  amount: number,
  tier: LoyaltyTier,
  pointsPerChf: number = DEFAULT_POINTS_PER_CHF
): PointsCalculationResult {
  const basePoints = Math.floor(amount * pointsPerChf)
  const bonusPoints = Math.floor(basePoints * (tier.pointsMultiplier - 1))
  const totalPoints = basePoints + bonusPoints

  return {
    basePoints,
    bonusPoints,
    totalPoints,
    multiplier: tier.pointsMultiplier,
  }
}

/**
 * Determine tier based on lifetime points
 */
export function determineTier(
  lifetimePoints: number,
  tiers: LoyaltyTier[] = DEFAULT_TIERS
): LoyaltyTier {
  // Sort tiers by minPoints descending
  const sortedTiers = [...tiers].sort((a, b) => b.minPoints - a.minPoints)

  // Find the highest tier the customer qualifies for
  const tier = sortedTiers.find((t) => lifetimePoints >= t.minPoints)

  // Return the tier or the lowest tier as fallback
  return tier || tiers[0]
}

/**
 * Calculate points needed for next tier
 */
export function getPointsToNextTier(
  lifetimePoints: number,
  tiers: LoyaltyTier[] = DEFAULT_TIERS
): { nextTier: LoyaltyTier | null; pointsNeeded: number } {
  const sortedTiers = [...tiers].sort((a, b) => a.minPoints - b.minPoints)
  const nextTier = sortedTiers.find((t) => t.minPoints > lifetimePoints)

  if (!nextTier) {
    return { nextTier: null, pointsNeeded: 0 }
  }

  return {
    nextTier,
    pointsNeeded: nextTier.minPoints - lifetimePoints,
  }
}

/**
 * Calculate redemption value in CHF
 */
export function calculateRedemptionValue(
  points: number,
  pointsPerChf: number = DEFAULT_POINTS_PER_REDEMPTION
): number {
  return points / pointsPerChf
}

/**
 * Calculate points required for a given CHF value
 */
export function calculatePointsRequired(
  chfValue: number,
  pointsPerChf: number = DEFAULT_POINTS_PER_REDEMPTION
): number {
  return Math.ceil(chfValue * pointsPerChf)
}

/**
 * Check if account has enough points for redemption
 */
export function canRedeemPoints(
  account: LoyaltyAccount,
  pointsToRedeem: number
): boolean {
  return account.currentPoints >= pointsToRedeem && pointsToRedeem > 0
}

/**
 * Calculate new account balance after transaction
 */
export function calculateNewBalance(
  currentPoints: number,
  pointsDelta: number
): number {
  const newBalance = currentPoints + pointsDelta
  return Math.max(0, newBalance) // Ensure never negative
}

/**
 * Validate a points transaction
 */
export function validatePointsTransaction(
  account: LoyaltyAccount,
  pointsDelta: number
): { valid: boolean; error?: string } {
  // For redemptions (negative delta), check balance
  if (pointsDelta < 0) {
    const absolutePoints = Math.abs(pointsDelta)
    if (account.currentPoints < absolutePoints) {
      return {
        valid: false,
        error: `Nicht genügend Punkte. Verfügbar: ${account.currentPoints}, Benötigt: ${absolutePoints}`,
      }
    }
  }

  return { valid: true }
}

/**
 * Calculate progress percentage to next tier
 */
export function getTierProgress(
  lifetimePoints: number,
  tiers: LoyaltyTier[] = DEFAULT_TIERS
): number {
  const currentTier = determineTier(lifetimePoints, tiers)
  const { nextTier, pointsNeeded } = getPointsToNextTier(lifetimePoints, tiers)

  if (!nextTier) {
    return 100 // Already at max tier
  }

  const currentTierMin = currentTier.minPoints
  const nextTierMin = nextTier.minPoints
  const tierRange = nextTierMin - currentTierMin
  const pointsInTier = lifetimePoints - currentTierMin

  return Math.min(100, Math.max(0, (pointsInTier / tierRange) * 100))
}

/**
 * Format points for display
 */
export function formatPoints(points: number): string {
  return points.toLocaleString('de-CH')
}

/**
 * Calculate estimated points from cart/order
 */
export function estimatePointsFromCart(
  cartTotal: number,
  tier: LoyaltyTier,
  pointsPerChf: number = DEFAULT_POINTS_PER_CHF
): PointsCalculationResult {
  return calculatePointsFromPurchase(cartTotal, tier, pointsPerChf)
}

/**
 * Check if tier upgrade will occur after earning points
 */
export function willUpgradeTier(
  currentLifetimePoints: number,
  pointsToEarn: number,
  tiers: LoyaltyTier[] = DEFAULT_TIERS
): { willUpgrade: boolean; newTier: LoyaltyTier | null } {
  const currentTier = determineTier(currentLifetimePoints, tiers)
  const newLifetimePoints = currentLifetimePoints + pointsToEarn
  const newTier = determineTier(newLifetimePoints, tiers)

  if (newTier.id !== currentTier.id && newTier.minPoints > currentTier.minPoints) {
    return { willUpgrade: true, newTier }
  }

  return { willUpgrade: false, newTier: null }
}

/**
 * Create a loyalty transaction record
 */
export function createTransaction(
  accountId: string,
  salonId: string,
  pointsDelta: number,
  sourceType: LoyaltyTransaction['sourceType'],
  sourceId: string | null,
  description: string
): Omit<LoyaltyTransaction, 'id' | 'createdAt'> {
  return {
    loyaltyAccountId: accountId,
    salonId,
    pointsDelta,
    sourceType,
    sourceId,
    description,
  }
}
