/**
 * Email notification service
 *
 * This is a placeholder implementation that logs emails.
 * In production, this should be replaced with a real email provider like Resend.
 */

export type EmailOptions = {
  to: string
  subject: string
  html: string
  text?: string
}

export type BookingConfirmationData = {
  customerName: string
  customerEmail: string
  appointmentDate: string
  appointmentTime: string
  services: string[]
  staffName: string
  totalPrice: number
  salonName: string
  salonAddress: string
  salonPhone: string
}

/**
 * Send an email (placeholder implementation)
 * In production, replace with actual email provider
 */
export async function sendEmail(options: EmailOptions): Promise<{ success: boolean; error?: string }> {
  // In production, use Resend or similar
  // const resend = new Resend(process.env.RESEND_API_KEY)
  // const { error } = await resend.emails.send({
  //   from: 'SCHNITTWERK <noreply@schnittwerk.ch>',
  //   ...options
  // })

  console.log('[Email] Would send email:', {
    to: options.to,
    subject: options.subject,
  })

  // Simulate success
  return { success: true }
}

/**
 * Send booking confirmation email
 */
export async function sendBookingConfirmation(data: BookingConfirmationData): Promise<{ success: boolean; error?: string }> {
  const servicesList = data.services.join(', ')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Terminbestätigung</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; }
    .content { padding: 30px 0; }
    .details { background: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0; }
    .details p { margin: 8px 0; }
    .label { color: #666; font-size: 14px; }
    .value { font-weight: 600; }
    .footer { text-align: center; padding: 20px 0; border-top: 2px solid #f0f0f0; color: #666; font-size: 14px; }
    .button { display: inline-block; background: #0a0a0a; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; color: #0a0a0a;">${data.salonName}</h1>
  </div>

  <div class="content">
    <h2>Terminbestätigung</h2>
    <p>Liebe/r ${data.customerName},</p>
    <p>vielen Dank für Ihre Buchung! Ihr Termin wurde bestätigt.</p>

    <div class="details">
      <p><span class="label">Datum:</span><br><span class="value">${data.appointmentDate}</span></p>
      <p><span class="label">Uhrzeit:</span><br><span class="value">${data.appointmentTime} Uhr</span></p>
      <p><span class="label">Dienstleistungen:</span><br><span class="value">${servicesList}</span></p>
      <p><span class="label">Stylist/in:</span><br><span class="value">${data.staffName}</span></p>
      <p><span class="label">Preis:</span><br><span class="value">CHF ${data.totalPrice.toFixed(2)}</span></p>
    </div>

    <p>Wir freuen uns auf Ihren Besuch!</p>

    <p style="color: #666; font-size: 14px;">
      Falls Sie den Termin stornieren oder verschieben möchten, können Sie dies in Ihrem Kundenkonto tun oder uns telefonisch kontaktieren.
    </p>
  </div>

  <div class="footer">
    <p><strong>${data.salonName}</strong></p>
    <p>${data.salonAddress}</p>
    <p>Tel: ${data.salonPhone}</p>
  </div>
</body>
</html>
`

  const text = `
Terminbestätigung

Liebe/r ${data.customerName},

vielen Dank für Ihre Buchung! Ihr Termin wurde bestätigt.

TERMINDETAILS:
- Datum: ${data.appointmentDate}
- Uhrzeit: ${data.appointmentTime} Uhr
- Dienstleistungen: ${servicesList}
- Stylist/in: ${data.staffName}
- Preis: CHF ${data.totalPrice.toFixed(2)}

Wir freuen uns auf Ihren Besuch!

Falls Sie den Termin stornieren oder verschieben möchten, können Sie dies in Ihrem Kundenkonto tun oder uns telefonisch kontaktieren.

---
${data.salonName}
${data.salonAddress}
Tel: ${data.salonPhone}
`

  return sendEmail({
    to: data.customerEmail,
    subject: `Terminbestätigung - ${data.appointmentDate}`,
    html,
    text,
  })
}

/**
 * Send booking cancellation confirmation email
 */
export async function sendBookingCancellation(data: {
  customerName: string
  customerEmail: string
  appointmentDate: string
  appointmentTime: string
  salonName: string
  salonPhone: string
}): Promise<{ success: boolean; error?: string }> {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Terminstornierung</title>
</head>
<body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0a0a0a;">${data.salonName}</h1>
  <h2>Terminstornierung</h2>
  <p>Liebe/r ${data.customerName},</p>
  <p>Ihr Termin am <strong>${data.appointmentDate}</strong> um <strong>${data.appointmentTime} Uhr</strong> wurde storniert.</p>
  <p>Wir hoffen, Sie bald wieder bei uns begrüssen zu dürfen!</p>
  <p>Bei Fragen erreichen Sie uns unter ${data.salonPhone}.</p>
  <p style="color: #666; margin-top: 30px;">Mit freundlichen Grüssen,<br>${data.salonName}</p>
</body>
</html>
`

  return sendEmail({
    to: data.customerEmail,
    subject: 'Terminstornierung bestätigt',
    html,
  })
}

/**
 * Order confirmation email data
 */
export type OrderConfirmationData = {
  customerName: string
  customerEmail: string
  orderNumber: string
  items: {
    name: string
    quantity: number
    price: number
  }[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  shippingAddress: {
    name: string
    street: string
    city: string
    postal_code: string
    country: string
  }
  paymentMethod: string
}

/**
 * Send order confirmation email
 */
export async function sendOrderConfirmation(data: OrderConfirmationData): Promise<{ success: boolean; error?: string }> {
  const itemsHtml = data.items
    .map(
      (item) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">${item.name}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">CHF ${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `
    )
    .join('')

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Bestellbestätigung</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; }
    .header { text-align: center; padding: 20px 0; border-bottom: 2px solid #f0f0f0; }
    .content { padding: 30px 0; }
    .order-number { background: #f9f9f9; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; }
    .order-number span { font-size: 24px; font-weight: bold; color: #0a0a0a; }
    table { width: 100%; border-collapse: collapse; margin: 20px 0; }
    th { text-align: left; padding: 10px; background: #f9f9f9; border-bottom: 2px solid #ddd; }
    .totals { margin-top: 20px; }
    .totals p { display: flex; justify-content: space-between; margin: 8px 0; }
    .totals .total { font-size: 18px; font-weight: bold; border-top: 2px solid #ddd; padding-top: 10px; margin-top: 10px; }
    .address { background: #f9f9f9; padding: 15px; border-radius: 8px; margin: 20px 0; }
    .footer { text-align: center; padding: 20px 0; border-top: 2px solid #f0f0f0; color: #666; font-size: 14px; }
  </style>
</head>
<body>
  <div class="header">
    <h1 style="margin: 0; color: #0a0a0a;">SCHNITTWERK</h1>
  </div>

  <div class="content">
    <h2>Vielen Dank für Ihre Bestellung!</h2>
    <p>Liebe/r ${data.customerName},</p>
    <p>Ihre Bestellung wurde erfolgreich aufgegeben.</p>

    <div class="order-number">
      <p style="margin: 0; color: #666; font-size: 14px;">Bestellnummer</p>
      <span>${data.orderNumber}</span>
    </div>

    <h3>Ihre Bestellung</h3>
    <table>
      <thead>
        <tr>
          <th>Produkt</th>
          <th style="text-align: center;">Menge</th>
          <th style="text-align: right;">Preis</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    <div class="totals">
      <p><span>Zwischensumme</span><span>CHF ${data.subtotal.toFixed(2)}</span></p>
      <p><span>Versand</span><span>${data.shipping === 0 ? 'Gratis' : `CHF ${data.shipping.toFixed(2)}`}</span></p>
      ${data.discount > 0 ? `<p style="color: #16a34a;"><span>Rabatt</span><span>-CHF ${data.discount.toFixed(2)}</span></p>` : ''}
      <p class="total"><span>Gesamt</span><span>CHF ${data.total.toFixed(2)}</span></p>
    </div>

    <h3>Lieferadresse</h3>
    <div class="address">
      <p style="margin: 0;">${data.shippingAddress.name}</p>
      <p style="margin: 0;">${data.shippingAddress.street}</p>
      <p style="margin: 0;">${data.shippingAddress.postal_code} ${data.shippingAddress.city}</p>
      <p style="margin: 0;">${data.shippingAddress.country}</p>
    </div>

    <p><strong>Zahlungsart:</strong> ${data.paymentMethod}</p>

    <p style="color: #666; font-size: 14px; margin-top: 30px;">
      Bei Fragen zu Ihrer Bestellung können Sie uns jederzeit kontaktieren.
    </p>
  </div>

  <div class="footer">
    <p><strong>SCHNITTWERK</strong></p>
    <p>Rorschacherstrasse 152, 9000 St. Gallen</p>
    <p>Tel: +41 71 123 45 67</p>
  </div>
</body>
</html>
`

  return sendEmail({
    to: data.customerEmail,
    subject: `Bestellbestätigung - ${data.orderNumber}`,
    html,
  })
}
