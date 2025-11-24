/**
 * User-facing error messages in German.
 * Map error codes to friendly messages for the UI.
 */
export const errorMessages: Record<string, string> = {
  // Booking errors
  BOOKING_SLOT_ALREADY_TAKEN:
    'Dieser Termin wurde soeben vergeben. Bitte wähle einen anderen Zeitpunkt.',
  BOOKING_SLOT_EXPIRED: 'Deine Reservierung ist abgelaufen. Bitte wähle einen neuen Termin.',
  BOOKING_LEAD_TIME_VIOLATED:
    'Termine müssen mindestens {hours} Stunden im Voraus gebucht werden.',
  BOOKING_HORIZON_EXCEEDED: 'Termine können maximal {days} Tage im Voraus gebucht werden.',
  BOOKING_STAFF_NOT_AVAILABLE: 'Der gewählte Mitarbeiter ist zu dieser Zeit nicht verfügbar.',
  BOOKING_SERVICE_NOT_BOOKABLE: 'Dieser Service kann nicht online gebucht werden.',
  BOOKING_MAX_RESERVATIONS: 'Du hast bereits die maximale Anzahl an Reservierungen erreicht.',
  BOOKING_CANCELLATION_TOO_LATE: 'Dieser Termin kann nicht mehr storniert werden.',
  BOOKING_NOT_FOUND: 'Der Termin wurde nicht gefunden.',
  BOOKING_ALREADY_CANCELLED: 'Dieser Termin wurde bereits storniert.',
  BOOKING_CANNOT_RESCHEDULE: 'Dieser Termin kann nicht verschoben werden.',

  // Payment errors
  PAYMENT_DECLINED:
    'Deine Karte wurde abgelehnt. Bitte versuche es mit einer anderen Zahlungsmethode.',
  PAYMENT_INSUFFICIENT_FUNDS: 'Das Guthaben auf deiner Karte reicht nicht aus.',
  PAYMENT_INVALID_CARD: 'Die Kartendaten sind ungültig. Bitte überprüfe deine Eingaben.',
  PAYMENT_EXPIRED_CARD: 'Deine Karte ist abgelaufen.',
  PAYMENT_PROCESSING_ERROR:
    'Bei der Zahlung ist ein Fehler aufgetreten. Bitte versuche es später erneut.',

  // Voucher errors
  VOUCHER_NOT_FOUND: 'Dieser Gutscheincode existiert nicht.',
  VOUCHER_EXPIRED: 'Dieser Gutschein ist leider abgelaufen.',
  VOUCHER_ALREADY_USED: 'Dieser Gutschein wurde bereits vollständig eingelöst.',
  VOUCHER_INSUFFICIENT_BALANCE: 'Das Guthaben auf diesem Gutschein reicht nicht aus.',
  VOUCHER_NOT_APPLICABLE: 'Dieser Gutschein kann für diesen Einkauf nicht verwendet werden.',

  // Order errors
  ORDER_NOT_FOUND: 'Die Bestellung wurde nicht gefunden.',
  ORDER_ALREADY_SHIPPED: 'Diese Bestellung wurde bereits versendet.',
  ORDER_ALREADY_CANCELLED: 'Diese Bestellung wurde bereits storniert.',
  ORDER_ITEM_OUT_OF_STOCK: 'Ein Produkt in deinem Warenkorb ist leider nicht mehr verfügbar.',

  // Auth errors
  AUTH_INVALID_CREDENTIALS: 'E-Mail oder Passwort ist falsch.',
  AUTH_SESSION_EXPIRED: 'Deine Sitzung ist abgelaufen. Bitte melde dich erneut an.',
  AUTH_EMAIL_NOT_VERIFIED: 'Bitte bestätige zuerst deine E-Mail-Adresse.',
  AUTH_ACCOUNT_DISABLED: 'Dein Konto wurde deaktiviert.',
  AUTH_RATE_LIMITED: 'Zu viele Versuche. Bitte warte einige Minuten.',

  // Generic errors
  FORBIDDEN_INSUFFICIENT_ROLE: 'Du hast keine Berechtigung für diese Aktion.',
  FORBIDDEN_WRONG_SALON: 'Du hast keinen Zugriff auf diese Daten.',
  INTERNAL_ERROR: 'Ein unerwarteter Fehler ist aufgetreten. Bitte versuche es später erneut.',
  SERVICE_UNAVAILABLE: 'Der Dienst ist vorübergehend nicht verfügbar.',
  VALIDATION_ERROR: 'Bitte überprüfe deine Eingaben.',
}

/**
 * Get user-facing message for an error code.
 * Falls back to generic message if code is unknown.
 */
export function getErrorMessage(code: string, replacements?: Record<string, string>): string {
  let message = errorMessages[code] || errorMessages.INTERNAL_ERROR

  if (replacements) {
    Object.entries(replacements).forEach(([key, value]) => {
      message = message.replace(`{${key}}`, value)
    })
  }

  return message
}
