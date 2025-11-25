'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logging'
import {
  DEFAULT_TIERS,
  determineTier,
  getPointsToNextTier,
  getTierProgress,
  calculateRedemptionValue,
  formatPoints,
  type LoyaltyTier,
} from '@/lib/domain/loyalty'

// ============================================
// TYPES
// ============================================

export interface LoyaltyAccountSummary {
  currentPoints: number
  lifetimePoints: number
  currentTier: LoyaltyTier
  nextTier: LoyaltyTier | null
  pointsToNextTier: number
  tierProgress: number
  redemptionValue: number // CHF value of current points
  isEnrolled: boolean
}

export interface LoyaltyTransaction {
  id: string
  pointsDelta: number
  balanceAfter: number
  sourceType: string
  description: string
  createdAt: string
}

// ============================================
// CUSTOMER LOYALTY ACTIONS
// ============================================

/**
 * Get the current customer's loyalty account summary
 */
export async function getMyLoyaltyAccount(): Promise<LoyaltyAccountSummary | null> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    // Get customer record
    const { data: customer } = await supabase
      .from('customers')
      .select('id, salon_id')
      .eq('profile_id', user.id)
      .single()

    if (!customer) {
      return null
    }

    // Get loyalty account
    const { data: account } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('customer_id', customer.id)
      .eq('is_active', true)
      .single()

    if (!account) {
      // Customer not enrolled in loyalty program
      return {
        currentPoints: 0,
        lifetimePoints: 0,
        currentTier: DEFAULT_TIERS[0],
        nextTier: DEFAULT_TIERS[1],
        pointsToNextTier: DEFAULT_TIERS[1].minPoints,
        tierProgress: 0,
        redemptionValue: 0,
        isEnrolled: false,
      }
    }

    // Get salon's custom tiers or use defaults
    const { data: customTiers } = await supabase
      .from('loyalty_tiers')
      .select('*')
      .eq('salon_id', customer.salon_id)
      .eq('is_active', true)
      .order('sort_order')

    const tiers: LoyaltyTier[] =
      customTiers && customTiers.length > 0
        ? customTiers.map((t) => ({
            id: t.id,
            name: t.name,
            minPoints: t.min_points,
            pointsMultiplier: parseFloat(t.points_multiplier),
            benefits: t.benefits || [],
          }))
        : DEFAULT_TIERS

    const currentTier = determineTier(account.lifetime_points, tiers)
    const { nextTier, pointsNeeded } = getPointsToNextTier(account.lifetime_points, tiers)
    const tierProgress = getTierProgress(account.lifetime_points, tiers)
    const redemptionValue = calculateRedemptionValue(account.current_points)

    return {
      currentPoints: account.current_points,
      lifetimePoints: account.lifetime_points,
      currentTier,
      nextTier,
      pointsToNextTier: pointsNeeded,
      tierProgress,
      redemptionValue,
      isEnrolled: true,
    }
  } catch (error) {
    logger.error('Error getting loyalty account', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null
  }
}

/**
 * Get the current customer's loyalty transaction history
 */
export async function getMyLoyaltyTransactions(limit: number = 20): Promise<LoyaltyTransaction[]> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return []
    }

    // Get customer record
    const { data: customer } = await supabase
      .from('customers')
      .select('id')
      .eq('profile_id', user.id)
      .single()

    if (!customer) {
      return []
    }

    // Get loyalty account
    const { data: account } = await supabase
      .from('loyalty_accounts')
      .select('id')
      .eq('customer_id', customer.id)
      .single()

    if (!account) {
      return []
    }

    // Get transactions
    const { data: transactions } = await supabase
      .from('loyalty_transactions')
      .select('id, points_delta, balance_after, source_type, description, created_at')
      .eq('loyalty_account_id', account.id)
      .order('created_at', { ascending: false })
      .limit(limit)

    return (transactions || []).map((t) => ({
      id: t.id,
      pointsDelta: t.points_delta,
      balanceAfter: t.balance_after,
      sourceType: t.source_type,
      description: t.description,
      createdAt: t.created_at,
    }))
  } catch (error) {
    logger.error('Error getting loyalty transactions', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return []
  }
}

/**
 * Enroll the current customer in the loyalty program
 */
export async function enrollInLoyaltyProgram(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: 'Nicht angemeldet' }
    }

    // Get customer record
    const { data: customer } = await supabase
      .from('customers')
      .select('id, salon_id')
      .eq('profile_id', user.id)
      .single()

    if (!customer) {
      return { success: false, error: 'Kundenkonto nicht gefunden' }
    }

    // Check if already enrolled
    const { data: existingAccount } = await supabase
      .from('loyalty_accounts')
      .select('id')
      .eq('customer_id', customer.id)
      .single()

    if (existingAccount) {
      return { success: false, error: 'Sie sind bereits im Treueprogramm angemeldet' }
    }

    // Create loyalty account
    const { error: insertError } = await supabase.from('loyalty_accounts').insert({
      salon_id: customer.salon_id,
      customer_id: customer.id,
      current_points: 0,
      lifetime_points: 0,
      tier_id: 'bronze',
      enrolled_at: new Date().toISOString(),
    })

    if (insertError) {
      logger.error('Failed to create loyalty account', { error: insertError.message })
      return { success: false, error: 'Fehler bei der Anmeldung' }
    }

    logger.info('Customer enrolled in loyalty program', { customerId: customer.id })

    return { success: true }
  } catch (error) {
    logger.error('Error enrolling in loyalty program', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// ADMIN LOYALTY ACTIONS (for dashboard)
// ============================================

/**
 * Award points to a customer (admin action)
 */
export async function awardLoyaltyPoints(
  customerId: string,
  salonId: string,
  points: number,
  sourceType: 'order' | 'appointment' | 'promotion' | 'adjustment',
  sourceId: string | null,
  description: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  try {
    // Get or create loyalty account
    let { data: account } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('customer_id', customerId)
      .eq('salon_id', salonId)
      .single()

    if (!account) {
      // Auto-enroll customer
      const { data: newAccount, error: createError } = await supabase
        .from('loyalty_accounts')
        .insert({
          salon_id: salonId,
          customer_id: customerId,
          current_points: 0,
          lifetime_points: 0,
          tier_id: 'bronze',
        })
        .select()
        .single()

      if (createError || !newAccount) {
        return { success: false, error: 'Treuekonto konnte nicht erstellt werden' }
      }
      account = newAccount
    }

    // Calculate new balances
    const newCurrentPoints = account.current_points + points
    const newLifetimePoints = account.lifetime_points + points

    // Update account
    const { error: updateError } = await supabase
      .from('loyalty_accounts')
      .update({
        current_points: newCurrentPoints,
        lifetime_points: newLifetimePoints,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', account.id)

    if (updateError) {
      return { success: false, error: 'Punkte konnten nicht gutgeschrieben werden' }
    }

    // Record transaction
    await supabase.from('loyalty_transactions').insert({
      loyalty_account_id: account.id,
      salon_id: salonId,
      points_delta: points,
      balance_after: newCurrentPoints,
      source_type: sourceType,
      source_id: sourceId,
      description,
    })

    logger.info('Loyalty points awarded', {
      customerId,
      points,
      sourceType,
      newBalance: newCurrentPoints,
    })

    return { success: true }
  } catch (error) {
    logger.error('Error awarding loyalty points', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Redeem points for a customer (admin action)
 */
export async function redeemLoyaltyPoints(
  customerId: string,
  salonId: string,
  points: number,
  sourceId: string | null,
  description: string
): Promise<{ success: boolean; chfValue?: number; error?: string }> {
  const supabase = await createClient()

  try {
    // Get loyalty account
    const { data: account } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('customer_id', customerId)
      .eq('salon_id', salonId)
      .single()

    if (!account) {
      return { success: false, error: 'Kein Treuekonto vorhanden' }
    }

    if (account.current_points < points) {
      return {
        success: false,
        error: `Nicht genügend Punkte. Verfügbar: ${formatPoints(account.current_points)}`,
      }
    }

    // Calculate new balance and CHF value
    const newCurrentPoints = account.current_points - points
    const chfValue = calculateRedemptionValue(points)

    // Update account
    const { error: updateError } = await supabase
      .from('loyalty_accounts')
      .update({
        current_points: newCurrentPoints,
        last_activity_at: new Date().toISOString(),
      })
      .eq('id', account.id)

    if (updateError) {
      return { success: false, error: 'Punkte konnten nicht eingelöst werden' }
    }

    // Record transaction
    await supabase.from('loyalty_transactions').insert({
      loyalty_account_id: account.id,
      salon_id: salonId,
      points_delta: -points, // Negative for redemption
      balance_after: newCurrentPoints,
      source_type: 'adjustment', // Use adjustment for redemptions
      source_id: sourceId,
      description,
    })

    logger.info('Loyalty points redeemed', {
      customerId,
      points,
      chfValue,
      newBalance: newCurrentPoints,
    })

    return { success: true, chfValue }
  } catch (error) {
    logger.error('Error redeeming loyalty points', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Get loyalty account for a specific customer (admin view)
 */
export async function getCustomerLoyaltyAccount(
  customerId: string,
  salonId: string
): Promise<LoyaltyAccountSummary | null> {
  const supabase = await createClient()

  try {
    const { data: account } = await supabase
      .from('loyalty_accounts')
      .select('*')
      .eq('customer_id', customerId)
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .single()

    if (!account) {
      return null
    }

    // Get salon's custom tiers or use defaults
    const { data: customTiers } = await supabase
      .from('loyalty_tiers')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('sort_order')

    const tiers: LoyaltyTier[] =
      customTiers && customTiers.length > 0
        ? customTiers.map((t) => ({
            id: t.id,
            name: t.name,
            minPoints: t.min_points,
            pointsMultiplier: parseFloat(t.points_multiplier),
            benefits: t.benefits || [],
          }))
        : DEFAULT_TIERS

    const currentTier = determineTier(account.lifetime_points, tiers)
    const { nextTier, pointsNeeded } = getPointsToNextTier(account.lifetime_points, tiers)
    const tierProgress = getTierProgress(account.lifetime_points, tiers)
    const redemptionValue = calculateRedemptionValue(account.current_points)

    return {
      currentPoints: account.current_points,
      lifetimePoints: account.lifetime_points,
      currentTier,
      nextTier,
      pointsToNextTier: pointsNeeded,
      tierProgress,
      redemptionValue,
      isEnrolled: true,
    }
  } catch (error) {
    logger.error('Error getting customer loyalty account', {
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return null
  }
}
