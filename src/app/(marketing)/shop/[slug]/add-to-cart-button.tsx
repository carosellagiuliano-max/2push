'use client'

import * as React from 'react'
import { ShoppingBag, Plus, Minus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useToast } from '@/components/ui/use-toast'
import { useCart } from '@/features/shop'
import type { Product } from '@/features/shop'

interface AddToCartButtonProps {
  product: Product
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
  const [quantity, setQuantity] = React.useState(1)
  const { addItem, setIsOpen } = useCart()
  const { toast } = useToast()

  const isOutOfStock = product.stock_quantity <= 0
  const maxQuantity = product.stock_quantity

  function handleAddToCart() {
    if (isOutOfStock) return

    addItem(product, quantity)
    toast({
      title: 'Zum Warenkorb hinzugefügt',
      description: `${quantity}x ${product.name} wurde zum Warenkorb hinzugefügt.`,
      variant: 'success',
    })
    setIsOpen(true)
    setQuantity(1)
  }

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      {/* Quantity Selector */}
      <div className="flex items-center border rounded-lg">
        <Button
          variant="ghost"
          size="icon"
          className="rounded-r-none"
          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
          disabled={quantity <= 1 || isOutOfStock}
        >
          <Minus className="h-4 w-4" />
        </Button>
        <span className="w-12 text-center font-medium">{quantity}</span>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-l-none"
          onClick={() => setQuantity((q) => Math.min(maxQuantity, q + 1))}
          disabled={quantity >= maxQuantity || isOutOfStock}
        >
          <Plus className="h-4 w-4" />
        </Button>
      </div>

      {/* Add to Cart Button */}
      <Button
        size="lg"
        className="flex-1"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
      >
        <ShoppingBag className="mr-2 h-5 w-5" />
        {isOutOfStock ? 'Ausverkauft' : 'In den Warenkorb'}
      </Button>
    </div>
  )
}
