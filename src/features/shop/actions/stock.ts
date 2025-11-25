'use server'

import { createClient } from '@/lib/supabase/server'
import { logger } from '@/lib/logging'

// ============================================
// TYPES
// ============================================

export interface StockMovement {
  id: string
  inventory_item_id: string
  movement_type: 'purchase' | 'sale' | 'return' | 'adjustment' | 'transfer'
  quantity_delta: number
  reference_type: string | null
  reference_id: string | null
  notes: string | null
  created_by: string | null
  created_at: string
}

export interface InventoryItem {
  id: string
  salon_id: string
  product_id: string
  current_stock: number
  minimum_stock: number
  maximum_stock: number | null
  reorder_point: number | null
  last_counted_at: string | null
}

export interface StockResult {
  success: boolean
  error?: string
  newStock?: number
}

export interface StockCheckResult {
  available: boolean
  currentStock: number
  requestedQuantity: number
  productId: string
  productName?: string
}

// ============================================
// STOCK QUERIES
// ============================================

/**
 * Get current stock level for a product in a salon.
 */
export async function getStockLevel(
  productId: string,
  salonId: string
): Promise<{ stock: number; minStock: number }> {
  const supabase = await createClient()

  const { data: inventory } = await supabase
    .from('inventory_items')
    .select('current_stock, minimum_stock')
    .eq('product_id', productId)
    .eq('salon_id', salonId)
    .single()

  if (!inventory) {
    // Fall back to product stock_quantity
    const { data: product } = await supabase
      .from('products')
      .select('stock_quantity')
      .eq('id', productId)
      .single()

    return {
      stock: product?.stock_quantity || 0,
      minStock: 0,
    }
  }

  return {
    stock: inventory.current_stock,
    minStock: inventory.minimum_stock,
  }
}

/**
 * Check if requested quantities are available for all items.
 */
export async function checkStockAvailability(
  items: Array<{ productId: string; quantity: number; productName?: string }>,
  salonId: string
): Promise<{
  allAvailable: boolean
  results: StockCheckResult[]
}> {
  const supabase = await createClient()
  const results: StockCheckResult[] = []

  for (const item of items) {
    const { data: inventory } = await supabase
      .from('inventory_items')
      .select('current_stock')
      .eq('product_id', item.productId)
      .eq('salon_id', salonId)
      .single()

    // Fall back to product stock if no inventory record
    let currentStock = inventory?.current_stock
    if (currentStock === undefined) {
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', item.productId)
        .single()
      currentStock = product?.stock_quantity || 0
    }

    results.push({
      available: currentStock >= item.quantity,
      currentStock,
      requestedQuantity: item.quantity,
      productId: item.productId,
      productName: item.productName,
    })
  }

  return {
    allAvailable: results.every((r) => r.available),
    results,
  }
}

// ============================================
// STOCK MODIFICATIONS
// ============================================

/**
 * Reduce stock when an order is paid.
 * Called by webhook after successful payment.
 *
 * Business Rules:
 * - Stock cannot go negative
 * - Creates a stock movement record for audit
 * - If stock goes below minimum, could trigger notification (not implemented)
 */
export async function reduceStock(
  productId: string,
  salonId: string,
  quantity: number,
  referenceType: string,
  referenceId: string
): Promise<StockResult> {
  const supabase = await createClient()

  try {
    // Get or create inventory item
    let { data: inventory } = await supabase
      .from('inventory_items')
      .select('id, current_stock')
      .eq('product_id', productId)
      .eq('salon_id', salonId)
      .single()

    if (!inventory) {
      // Create inventory item from product
      const { data: product } = await supabase
        .from('products')
        .select('stock_quantity')
        .eq('id', productId)
        .single()

      const { data: newInventory, error: createError } = await supabase
        .from('inventory_items')
        .insert({
          salon_id: salonId,
          product_id: productId,
          current_stock: product?.stock_quantity || 0,
          minimum_stock: 5,
        })
        .select('id, current_stock')
        .single()

      if (createError || !newInventory) {
        logger.error('Failed to create inventory item', {
          productId,
          salonId,
          error: createError?.message,
        })
        return { success: false, error: 'Lagerbestand konnte nicht aktualisiert werden' }
      }

      inventory = newInventory
    }

    // Check if we have enough stock
    if (inventory.current_stock < quantity) {
      logger.warn('Insufficient stock for reduction', {
        productId,
        available: inventory.current_stock,
        requested: quantity,
      })
      // Still proceed but log warning - stock might have been pre-validated
    }

    // Calculate new stock (prevent negative)
    const newStock = Math.max(0, inventory.current_stock - quantity)

    // Update stock
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventory.id)

    if (updateError) {
      logger.error('Failed to update inventory stock', {
        productId,
        error: updateError.message,
      })
      return { success: false, error: 'Lagerbestand konnte nicht aktualisiert werden' }
    }

    // Create stock movement record
    const { error: movementError } = await supabase.from('stock_movements').insert({
      inventory_item_id: inventory.id,
      movement_type: 'sale',
      quantity_delta: -quantity,
      reference_type: referenceType,
      reference_id: referenceId,
    })

    if (movementError) {
      logger.warn('Failed to create stock movement record', {
        productId,
        error: movementError.message,
      })
      // Don't fail the operation for this
    }

    logger.info('Stock reduced', {
      productId,
      oldStock: inventory.current_stock,
      newStock,
      quantity,
      referenceType,
      referenceId,
    })

    return { success: true, newStock }
  } catch (error) {
    logger.error('Error reducing stock', {
      productId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Restore stock when an order is cancelled/refunded.
 * Called by webhook after refund.
 */
export async function restoreStock(
  productId: string,
  salonId: string,
  quantity: number,
  referenceType: string,
  referenceId: string
): Promise<StockResult> {
  const supabase = await createClient()

  try {
    const { data: inventory } = await supabase
      .from('inventory_items')
      .select('id, current_stock, maximum_stock')
      .eq('product_id', productId)
      .eq('salon_id', salonId)
      .single()

    if (!inventory) {
      logger.warn('No inventory record found for stock restoration', {
        productId,
        salonId,
      })
      return { success: false, error: 'Lagerartikel nicht gefunden' }
    }

    // Calculate new stock (cap at maximum if set)
    let newStock = inventory.current_stock + quantity
    if (inventory.maximum_stock) {
      newStock = Math.min(newStock, inventory.maximum_stock)
    }

    // Update stock
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        current_stock: newStock,
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventory.id)

    if (updateError) {
      logger.error('Failed to restore inventory stock', {
        productId,
        error: updateError.message,
      })
      return { success: false, error: 'Lagerbestand konnte nicht wiederhergestellt werden' }
    }

    // Create stock movement record
    await supabase.from('stock_movements').insert({
      inventory_item_id: inventory.id,
      movement_type: 'return',
      quantity_delta: quantity,
      reference_type: referenceType,
      reference_id: referenceId,
    })

    logger.info('Stock restored', {
      productId,
      oldStock: inventory.current_stock,
      newStock,
      quantity,
      referenceType,
      referenceId,
    })

    return { success: true, newStock }
  } catch (error) {
    logger.error('Error restoring stock', {
      productId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

/**
 * Manually adjust stock (admin function).
 * Creates audit trail.
 */
export async function adjustStock(
  productId: string,
  salonId: string,
  newQuantity: number,
  reason: string,
  adjustedBy: string
): Promise<StockResult> {
  const supabase = await createClient()

  try {
    const { data: inventory } = await supabase
      .from('inventory_items')
      .select('id, current_stock')
      .eq('product_id', productId)
      .eq('salon_id', salonId)
      .single()

    if (!inventory) {
      return { success: false, error: 'Lagerartikel nicht gefunden' }
    }

    const oldStock = inventory.current_stock
    const delta = newQuantity - oldStock

    // Update stock
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({
        current_stock: newQuantity,
        last_counted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', inventory.id)

    if (updateError) {
      return { success: false, error: 'Lagerbestand konnte nicht angepasst werden' }
    }

    // Create adjustment record
    await supabase.from('stock_movements').insert({
      inventory_item_id: inventory.id,
      movement_type: 'adjustment',
      quantity_delta: delta,
      reference_type: 'manual_adjustment',
      reference_id: null,
      notes: reason,
      created_by: adjustedBy,
    })

    logger.info('Stock manually adjusted', {
      productId,
      oldStock,
      newStock: newQuantity,
      delta,
      reason,
      adjustedBy,
    })

    return { success: true, newStock: newQuantity }
  } catch (error) {
    logger.error('Error adjusting stock', {
      productId,
      error: error instanceof Error ? error.message : 'Unknown error',
    })
    return { success: false, error: 'Unerwarteter Fehler' }
  }
}

// ============================================
// STOCK REPORTS
// ============================================

/**
 * Get products with low stock for a salon.
 */
export async function getLowStockProducts(salonId: string): Promise<
  Array<{
    productId: string
    productName: string
    currentStock: number
    minimumStock: number
  }>
> {
  const supabase = await createClient()

  const { data: lowStock } = await supabase
    .from('inventory_items')
    .select(
      `
      product_id,
      current_stock,
      minimum_stock,
      products (name)
    `
    )
    .eq('salon_id', salonId)
    .lt('current_stock', supabase.rpc('get_minimum_stock'))

  // Alternative approach since we can't do column comparison directly
  const { data: allInventory } = await supabase
    .from('inventory_items')
    .select(
      `
      product_id,
      current_stock,
      minimum_stock,
      products:product_id (name)
    `
    )
    .eq('salon_id', salonId)

  if (!allInventory) return []

  return allInventory
    .filter((item) => item.current_stock <= item.minimum_stock)
    .map((item) => {
      const productData = item.products as { name: string } | { name: string }[] | null
      return {
        productId: item.product_id,
        productName: Array.isArray(productData) ? productData[0]?.name : productData?.name || 'Unknown',
        currentStock: item.current_stock,
        minimumStock: item.minimum_stock,
      }
    })
}

/**
 * Get stock movements history for a product.
 */
export async function getStockHistory(
  productId: string,
  salonId: string,
  limit: number = 50
): Promise<StockMovement[]> {
  const supabase = await createClient()

  // First get inventory item ID
  const { data: inventory } = await supabase
    .from('inventory_items')
    .select('id')
    .eq('product_id', productId)
    .eq('salon_id', salonId)
    .single()

  if (!inventory) return []

  const { data: movements } = await supabase
    .from('stock_movements')
    .select('*')
    .eq('inventory_item_id', inventory.id)
    .order('created_at', { ascending: false })
    .limit(limit)

  return movements || []
}
