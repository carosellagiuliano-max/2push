'use client'

import * as React from 'react'
import Link from 'next/link'
import { Loader2, ShoppingBag, CreditCard, FileText, Tag, X, ArrowLeft, CheckCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { useToast } from '@/components/ui/use-toast'
import { useCart, createOrder } from '@/features/shop'
import type { ShippingMethod, CheckoutFormData } from '@/features/shop'

interface CheckoutFormProps {
  shippingMethods: ShippingMethod[]
}

export function CheckoutForm({ shippingMethods }: CheckoutFormProps) {
  const { toast } = useToast()
  const { cart, items, clearCart, applyVoucher, removeVoucher } = useCart()

  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [isComplete, setIsComplete] = React.useState(false)
  const [orderNumber, setOrderNumber] = React.useState<string>()
  const [voucherCode, setVoucherCode] = React.useState('')
  const [isApplyingVoucher, setIsApplyingVoucher] = React.useState(false)

  const [formData, setFormData] = React.useState<CheckoutFormData>({
    email: '',
    firstName: '',
    lastName: '',
    phone: '',
    shippingAddress: {
      street: '',
      city: '',
      postalCode: '',
      country: 'Schweiz',
    },
    sameAsBilling: true,
    shippingMethodId: shippingMethods[0]?.id || 'standard',
    paymentMethod: 'invoice',
  })

  const selectedShipping = shippingMethods.find(m => m.id === formData.shippingMethodId)
  const shippingCost = cart.subtotal >= 50 ? 0 : (selectedShipping?.price || 0)
  const total = cart.subtotal + shippingCost - cart.discount

  async function handleApplyVoucher() {
    if (!voucherCode.trim()) return
    setIsApplyingVoucher(true)
    const result = await applyVoucher(voucherCode.trim())
    setIsApplyingVoucher(false)

    if (result.success) {
      toast({ title: 'Gutschein angewendet', variant: 'success' })
      setVoucherCode('')
    } else {
      toast({ title: 'Fehler', description: result.error, variant: 'destructive' })
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (items.length === 0) {
      toast({ title: 'Warenkorb ist leer', variant: 'destructive' })
      return
    }

    setIsSubmitting(true)

    const result = await createOrder(
      { ...formData, voucherCode: cart.voucher_code || undefined },
      items,
      cart.subtotal,
      cart.discount
    )

    setIsSubmitting(false)

    if (result.success && result.order) {
      setOrderNumber(result.order.order_number)
      setIsComplete(true)
      clearCart()
    } else {
      toast({
        title: 'Bestellung fehlgeschlagen',
        description: result.error,
        variant: 'destructive',
      })
    }
  }

  // Order Complete Screen
  if (isComplete) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <div className="inline-flex p-4 rounded-full bg-green-100 text-green-600 mb-6">
          <CheckCircle className="h-12 w-12" />
        </div>
        <h2 className="text-2xl font-bold mb-4">Vielen Dank für Ihre Bestellung!</h2>
        <p className="text-muted-foreground mb-2">
          Ihre Bestellnummer lautet:
        </p>
        <p className="text-xl font-mono font-bold mb-6">{orderNumber}</p>
        <p className="text-muted-foreground mb-8">
          Sie erhalten in Kürze eine Bestätigungs-E-Mail mit allen Details.
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/shop">Weiter einkaufen</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/">Zur Startseite</Link>
          </Button>
        </div>
      </div>
    )
  }

  // Empty Cart
  if (items.length === 0) {
    return (
      <div className="max-w-xl mx-auto text-center py-12">
        <ShoppingBag className="h-16 w-16 text-muted-foreground/50 mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Ihr Warenkorb ist leer</h2>
        <p className="text-muted-foreground mb-6">
          Fügen Sie Produkte hinzu, um fortzufahren.
        </p>
        <Button asChild>
          <Link href="/shop">Zum Shop</Link>
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit}>
      <div className="grid gap-8 lg:grid-cols-3">
        {/* Checkout Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Back Link */}
          <Button variant="ghost" size="sm" asChild>
            <Link href="/shop">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Zurück zum Shop
            </Link>
          </Button>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>Kontakt</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="email">E-Mail *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(f => ({ ...f, email: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">Vorname *</Label>
                  <Input
                    id="firstName"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData(f => ({ ...f, firstName: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Nachname *</Label>
                  <Input
                    id="lastName"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData(f => ({ ...f, lastName: e.target.value }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="phone">Telefon *</Label>
                <Input
                  id="phone"
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData(f => ({ ...f, phone: e.target.value }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle>Lieferadresse</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="street">Strasse und Hausnummer *</Label>
                <Input
                  id="street"
                  required
                  value={formData.shippingAddress.street}
                  onChange={(e) => setFormData(f => ({
                    ...f,
                    shippingAddress: { ...f.shippingAddress, street: e.target.value }
                  }))}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="postalCode">PLZ *</Label>
                  <Input
                    id="postalCode"
                    required
                    value={formData.shippingAddress.postalCode}
                    onChange={(e) => setFormData(f => ({
                      ...f,
                      shippingAddress: { ...f.shippingAddress, postalCode: e.target.value }
                    }))}
                  />
                </div>
                <div>
                  <Label htmlFor="city">Ort *</Label>
                  <Input
                    id="city"
                    required
                    value={formData.shippingAddress.city}
                    onChange={(e) => setFormData(f => ({
                      ...f,
                      shippingAddress: { ...f.shippingAddress, city: e.target.value }
                    }))}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="country">Land *</Label>
                <Input
                  id="country"
                  required
                  value={formData.shippingAddress.country}
                  onChange={(e) => setFormData(f => ({
                    ...f,
                    shippingAddress: { ...f.shippingAddress, country: e.target.value }
                  }))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Shipping Method */}
          <Card>
            <CardHeader>
              <CardTitle>Versandart</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.shippingMethodId}
                onValueChange={(value) => setFormData(f => ({ ...f, shippingMethodId: value }))}
              >
                {shippingMethods.map((method) => (
                  <div key={method.id} className="flex items-center space-x-3 p-4 border rounded-lg">
                    <RadioGroupItem value={method.id} id={method.id} />
                    <Label htmlFor={method.id} className="flex-1 cursor-pointer">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{method.name}</p>
                          <p className="text-sm text-muted-foreground">{method.description}</p>
                        </div>
                        <p className="font-medium">
                          {cart.subtotal >= 50 && method.price > 0
                            ? <span className="text-green-600">Gratis</span>
                            : method.price === 0
                            ? 'Gratis'
                            : `CHF ${method.price.toFixed(2)}`}
                        </p>
                      </div>
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </CardContent>
          </Card>

          {/* Payment Method */}
          <Card>
            <CardHeader>
              <CardTitle>Zahlungsart</CardTitle>
            </CardHeader>
            <CardContent>
              <RadioGroup
                value={formData.paymentMethod}
                onValueChange={(value: 'card' | 'invoice') => setFormData(f => ({ ...f, paymentMethod: value }))}
              >
                <div className="flex items-center space-x-3 p-4 border rounded-lg">
                  <RadioGroupItem value="invoice" id="invoice" />
                  <Label htmlFor="invoice" className="flex items-center gap-2 cursor-pointer">
                    <FileText className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Rechnung</p>
                      <p className="text-sm text-muted-foreground">Zahlung innert 30 Tagen</p>
                    </div>
                  </Label>
                </div>
                <div className="flex items-center space-x-3 p-4 border rounded-lg mt-2">
                  <RadioGroupItem value="card" id="card" />
                  <Label htmlFor="card" className="flex items-center gap-2 cursor-pointer">
                    <CreditCard className="h-5 w-5" />
                    <div>
                      <p className="font-medium">Kreditkarte</p>
                      <p className="text-sm text-muted-foreground">Visa, Mastercard, AMEX</p>
                    </div>
                  </Label>
                </div>
              </RadioGroup>
            </CardContent>
          </Card>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <div className="sticky top-24">
            <Card>
              <CardHeader>
                <CardTitle>Bestellübersicht</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-16 w-16 flex-shrink-0 rounded bg-muted flex items-center justify-center">
                      <ShoppingBag className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.product.name}</p>
                      <p className="text-xs text-muted-foreground">Menge: {item.quantity}</p>
                      <p className="text-sm font-medium">
                        CHF {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}

                <Separator />

                {/* Voucher */}
                {cart.voucher_code ? (
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      <Tag className="h-4 w-4 text-green-600" />
                      <span className="text-sm font-medium text-green-700">
                        {cart.voucher_code}
                      </span>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="h-8 text-green-700"
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
                    />
                    <Button
                      type="button"
                      variant="outline"
                      onClick={handleApplyVoucher}
                      disabled={isApplyingVoucher}
                    >
                      {isApplyingVoucher ? '...' : 'OK'}
                    </Button>
                  </div>
                )}

                <Separator />

                {/* Totals */}
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Zwischensumme</span>
                    <span>CHF {cart.subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Versand</span>
                    <span>
                      {shippingCost === 0 ? (
                        <span className="text-green-600">Gratis</span>
                      ) : (
                        `CHF ${shippingCost.toFixed(2)}`
                      )}
                    </span>
                  </div>
                  {cart.discount > 0 && (
                    <div className="flex justify-between text-sm text-green-600">
                      <span>Rabatt</span>
                      <span>-CHF {cart.discount.toFixed(2)}</span>
                    </div>
                  )}
                  <Separator />
                  <div className="flex justify-between font-semibold text-lg">
                    <span>Gesamt</span>
                    <span>CHF {total.toFixed(2)}</span>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  className="w-full"
                  size="lg"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Wird verarbeitet...
                    </>
                  ) : (
                    'Zahlungspflichtig bestellen'
                  )}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Mit Ihrer Bestellung akzeptieren Sie unsere{' '}
                  <Link href="/agb" className="underline">AGB</Link>.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </form>
  )
}
