/**
 * CSV Export Utility
 *
 * Provides functions for exporting data to CSV format.
 * Compatible with Swiss accounting software (Bexio, Abacus, Run my Accounts).
 */

type CsvValue = string | number | boolean | null | undefined | Date

interface CsvExportOptions {
  /** Column headers (keys from the data objects) */
  columns: string[]
  /** Human-readable column labels */
  headers?: string[]
  /** Filename without extension */
  filename: string
  /** Delimiter character (default: semicolon for Swiss compatibility) */
  delimiter?: string
  /** Include BOM for Excel compatibility */
  includeBom?: boolean
}

/**
 * Formats a value for CSV output
 */
function formatCsvValue(value: CsvValue, delimiter: string): string {
  if (value === null || value === undefined) {
    return ''
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (typeof value === 'boolean') {
    return value ? 'Ja' : 'Nein'
  }

  const stringValue = String(value)

  // Escape quotes and wrap in quotes if contains delimiter, quotes, or newlines
  if (
    stringValue.includes(delimiter) ||
    stringValue.includes('"') ||
    stringValue.includes('\n') ||
    stringValue.includes('\r')
  ) {
    return `"${stringValue.replace(/"/g, '""')}"`
  }

  return stringValue
}

/**
 * Converts data array to CSV string
 */
export function arrayToCsv<T extends Record<string, CsvValue>>(
  data: T[],
  options: CsvExportOptions
): string {
  const { columns, headers, delimiter = ';', includeBom = true } = options

  const headerRow = (headers || columns).map((h) => formatCsvValue(h, delimiter)).join(delimiter)

  const dataRows = data.map((row) =>
    columns.map((col) => formatCsvValue(row[col], delimiter)).join(delimiter)
  )

  const csv = [headerRow, ...dataRows].join('\n')

  // Add BOM for Excel to recognize UTF-8
  return includeBom ? '\uFEFF' + csv : csv
}

/**
 * Triggers a CSV file download in the browser
 */
export function downloadCsv(csvContent: string, filename: string): void {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = `${filename}.csv`
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  URL.revokeObjectURL(url)
}

/**
 * Export data to CSV and trigger download
 */
export function exportToCsv<T extends Record<string, CsvValue>>(
  data: T[],
  options: CsvExportOptions
): void {
  const csv = arrayToCsv(data, options)
  downloadCsv(csv, options.filename)
}

// Pre-configured export functions for common data types

export function exportCustomers(
  customers: Array<{
    id: string
    firstName: string
    lastName: string
    email: string
    phone?: string
    createdAt: Date | string
    totalVisits?: number
    totalSpend?: number
  }>
): void {
  const data = customers.map((c) => ({
    id: c.id,
    vorname: c.firstName,
    nachname: c.lastName,
    email: c.email,
    telefon: c.phone || '',
    erstellt: typeof c.createdAt === 'string' ? c.createdAt : c.createdAt.toISOString(),
    besuche: c.totalVisits || 0,
    umsatz: c.totalSpend || 0,
  }))

  exportToCsv(data, {
    columns: ['id', 'vorname', 'nachname', 'email', 'telefon', 'erstellt', 'besuche', 'umsatz'],
    headers: ['ID', 'Vorname', 'Nachname', 'E-Mail', 'Telefon', 'Erstellt am', 'Besuche', 'Umsatz (CHF)'],
    filename: `kunden-export-${new Date().toISOString().split('T')[0]}`,
  })
}

export function exportOrders(
  orders: Array<{
    orderNumber: string
    customerName: string
    customerEmail: string
    status: string
    paymentStatus: string
    paymentMethod: string
    subtotal: number
    shipping: number
    total: number
    createdAt: Date | string
  }>
): void {
  const data = orders.map((o) => ({
    bestellnummer: o.orderNumber,
    kunde: o.customerName,
    email: o.customerEmail,
    status: o.status,
    zahlungsstatus: o.paymentStatus,
    zahlungsart: o.paymentMethod,
    zwischensumme: o.subtotal,
    versand: o.shipping,
    gesamt: o.total,
    datum: typeof o.createdAt === 'string' ? o.createdAt : o.createdAt.toISOString(),
  }))

  exportToCsv(data, {
    columns: ['bestellnummer', 'kunde', 'email', 'status', 'zahlungsstatus', 'zahlungsart', 'zwischensumme', 'versand', 'gesamt', 'datum'],
    headers: ['Bestellnummer', 'Kunde', 'E-Mail', 'Status', 'Zahlungsstatus', 'Zahlungsart', 'Zwischensumme (CHF)', 'Versand (CHF)', 'Gesamt (CHF)', 'Datum'],
    filename: `bestellungen-export-${new Date().toISOString().split('T')[0]}`,
  })
}

export function exportAppointments(
  appointments: Array<{
    id: string
    customerName: string
    staffName: string
    services: string
    date: Date | string
    time: string
    duration: number
    status: string
    price: number
  }>
): void {
  const data = appointments.map((a) => ({
    id: a.id,
    kunde: a.customerName,
    mitarbeiter: a.staffName,
    dienstleistungen: a.services,
    datum: typeof a.date === 'string' ? a.date : a.date.toISOString().split('T')[0],
    uhrzeit: a.time,
    dauer: a.duration,
    status: a.status,
    preis: a.price,
  }))

  exportToCsv(data, {
    columns: ['id', 'kunde', 'mitarbeiter', 'dienstleistungen', 'datum', 'uhrzeit', 'dauer', 'status', 'preis'],
    headers: ['ID', 'Kunde', 'Mitarbeiter', 'Dienstleistungen', 'Datum', 'Uhrzeit', 'Dauer (Min.)', 'Status', 'Preis (CHF)'],
    filename: `termine-export-${new Date().toISOString().split('T')[0]}`,
  })
}

export function exportFinanceData(
  transactions: Array<{
    date: Date | string
    type: string
    reference: string
    customer: string
    paymentMethod: string
    netAmount: number
    vatRate: number
    vatAmount: number
    grossAmount: number
  }>
): void {
  const data = transactions.map((t) => ({
    datum: typeof t.date === 'string' ? t.date : t.date.toISOString().split('T')[0],
    typ: t.type,
    referenz: t.reference,
    kunde: t.customer,
    zahlungsart: t.paymentMethod,
    netto: t.netAmount,
    mwst_satz: t.vatRate,
    mwst_betrag: t.vatAmount,
    brutto: t.grossAmount,
  }))

  exportToCsv(data, {
    columns: ['datum', 'typ', 'referenz', 'kunde', 'zahlungsart', 'netto', 'mwst_satz', 'mwst_betrag', 'brutto'],
    headers: ['Datum', 'Typ', 'Referenz', 'Kunde', 'Zahlungsart', 'Netto (CHF)', 'MwSt. %', 'MwSt. (CHF)', 'Brutto (CHF)'],
    filename: `buchhaltung-export-${new Date().toISOString().split('T')[0]}`,
  })
}
