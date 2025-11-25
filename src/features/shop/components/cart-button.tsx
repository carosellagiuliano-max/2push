'use client'

import { ShoppingBag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { useCart } from '../hooks/use-cart'

export function CartButton() {
  const { itemCount, setIsOpen } = useCart()

  return (
    <Button
      variant="ghost"
      size="icon"
      className="relative"
      onClick={() => setIsOpen(true)}
    >
      <ShoppingBag className="h-5 w-5" />
      {itemCount > 0 && (
        <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-brand-600 text-white text-xs flex items-center justify-center">
          {itemCount > 9 ? '9+' : itemCount}
        </span>
      )}
      <span className="sr-only">Warenkorb öffnen</span>
    </Button>
  )
}
