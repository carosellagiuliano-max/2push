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
