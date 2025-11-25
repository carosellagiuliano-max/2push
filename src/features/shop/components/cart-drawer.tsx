'use client'

import * as React from 'react'
import Link from 'next/link'
import { ShoppingBag, X, Plus, Minus, Trash2, Tag } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { useToast } from '@/components/ui/use-toast'
import { useCart } from '../hooks/use-cart'

export function CartDrawer() {
  const { cart, items, itemCount, isOpen, setIsOpen, updateQuantity, removeItem, applyVoucher, removeVoucher } = useCart()
  const { toast } = useToast()
  const [voucherCode, setVoucherCode] = React.useState('')
  const [isApplyingVoucher, setIsApplyingVoucher] = React.useState(false)

  async function handleApplyVoucher() {
    if (!voucherCode.trim()) return

    setIsApplyingVoucher(true)
    const result = await applyVoucher(voucherCode.trim())
    setIsApplyingVoucher(false)

    if (result.success) {
      toast({
        title: 'Gutschein angewendet',
        description: 'Der Rabatt wurde auf Ihre Bestellung angewendet.',
        variant: 'success',
      })
      setVoucherCode('')
    } else {
      toast({
        title: 'Fehler',
        description: result.error,
        variant: 'destructive',
      })
    }
  }

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="flex flex-col w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Warenkorb ({itemCount})
          </SheetTitle>
        </SheetHeader>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center py-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mb-4" />
            <p className="text-lg font-medium mb-2">Ihr Warenkorb ist leer</p>
            <p className="text-muted-foreground mb-4">
              Entdecken Sie unsere Produkte
            </p>
            <Button asChild onClick={() => setIsOpen(false)}>
              <Link href="/shop">Zum Shop</Link>
            </Button>
          </div>
        ) : (
          <>
            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto py-4 space-y-4">
              {items.map((item) => (
                <div key={item.id} className="flex gap-4">
                  {/* Product Image Placeholder */}
                  <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-muted flex items-center justify-center">
                    <ShoppingBag className="h-8 w-8 text-muted-foreground/50" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">{item.product.brand}</p>
                    <h4 className="font-medium truncate">{item.product.name}</h4>
                    <p className="text-sm font-semibold mt-1">
                      CHF {item.product.price.toFixed(2)}
                    </p>

                    {/* Quantity Controls */}
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock_quantity}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive hover:text-destructive ml-auto"
                        onClick={() => removeItem(item.product.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Separator />

            {/* Voucher Code */}
            <div className="py-4 space-y-2">
              {cart.voucher_code ? (
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700">
                      {cart.voucher_code}
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-green-700 hover:text-green-900"
                    onClick={removeVoucher}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    placeholder="Gutscheincode"
                    value={voucherCode}
                    onChange={(e) => setVoucherCode(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                  />
                  <Button
                    variant="outline"
                    onClick={handleApplyVoucher}
                    disabled={isApplyingVoucher || !voucherCode.trim()}
                  >
                    {isApplyingVoucher ? '...' : 'Anwenden'}
                  </Button>
                </div>
              )}
            </div>

            <Separator />

            {/* Order Summary */}
            <div className="py-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Zwischensumme</span>
                <span>CHF {cart.subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  Versand {cart.shipping === 0 && <span className="text-green-600">(Gratis)</span>}
                </span>
                <span>{cart.shipping === 0 ? 'Gratis' : `CHF ${cart.shipping.toFixed(2)}`}</span>
              </div>
              {cart.discount > 0 && (
                <div className="flex justify-between text-sm text-green-600">
                  <span>Rabatt</span>
                  <span>-CHF {cart.discount.toFixed(2)}</span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>Gesamt</span>
                <span>CHF {cart.total.toFixed(2)}</span>
              </div>
              {cart.shipping > 0 && cart.subtotal < 50 && (
                <p className="text-xs text-muted-foreground text-center">
                  Noch CHF {(50 - cart.subtotal).toFixed(2)} bis zur Gratis-Lieferung
                </p>
              )}
            </div>

            {/* Checkout Button */}
            <Button className="w-full" size="lg" asChild>
              <Link href="/shop/checkout" onClick={() => setIsOpen(false)}>
                Zur Kasse
              </Link>
            </Button>
          </>
        )}
      </SheetContent>
    </Sheet>
  )
}
