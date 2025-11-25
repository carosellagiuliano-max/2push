/**
 * CSV Export Tests
 *
 * Tests for CSV generation and export functionality.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  arrayToCsv,
  exportCustomers,
  exportOrders,
  exportAppointments,
  exportFinanceData,
} from '@/lib/utils/csv-export'

// Mock DOM methods for download tests
const mockCreateElement = vi.fn()
const mockAppendChild = vi.fn()
const mockRemoveChild = vi.fn()
const mockClick = vi.fn()
const mockCreateObjectURL = vi.fn(() => 'blob:test-url')
const mockRevokeObjectURL = vi.fn()

beforeEach(() => {
  // Setup DOM mocks
  vi.stubGlobal('document', {
    createElement: mockCreateElement.mockReturnValue({
      href: '',
      download: '',
      click: mockClick,
    }),
    body: {
      appendChild: mockAppendChild,
      removeChild: mockRemoveChild,
    },
  })
  vi.stubGlobal('URL', {
    createObjectURL: mockCreateObjectURL,
    revokeObjectURL: mockRevokeObjectURL,
  })
  vi.stubGlobal('Blob', class {
    constructor(public content: string[], public options: { type: string }) {}
  })
})

afterEach(() => {
  vi.unstubAllGlobals()
})

describe('CSV Export', () => {
  describe('arrayToCsv', () => {
    it('should convert simple data to CSV', () => {
      const data = [
        { name: 'John', age: 30 },
        { name: 'Jane', age: 25 },
      ]

      const csv = arrayToCsv(data, {
        columns: ['name', 'age'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('name;age')
      expect(csv).toContain('John;30')
      expect(csv).toContain('Jane;25')
    })

    it('should use custom headers', () => {
      const data = [{ name: 'John', age: 30 }]

      const csv = arrayToCsv(data, {
        columns: ['name', 'age'],
        headers: ['Full Name', 'Age in Years'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('Full Name;Age in Years')
    })

    it('should handle empty data', () => {
      const csv = arrayToCsv([], {
        columns: ['name', 'age'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toBe('name;age')
    })

    it('should escape values with delimiters', () => {
      const data = [{ name: 'John; Smith', city: 'New York' }]

      const csv = arrayToCsv(data, {
        columns: ['name', 'city'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('"John; Smith"')
    })

    it('should escape values with quotes', () => {
      const data = [{ name: 'John "JD" Doe', city: 'Boston' }]

      const csv = arrayToCsv(data, {
        columns: ['name', 'city'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('"John ""JD"" Doe"')
    })

    it('should handle null and undefined values', () => {
      const data = [{ name: null, age: undefined }]

      const csv = arrayToCsv(data as { name: null; age: undefined }[], {
        columns: ['name', 'age'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain(';')
    })

    it('should include BOM by default', () => {
      const csv = arrayToCsv([{ name: 'Test' }], {
        columns: ['name'],
        filename: 'test',
      })

      expect(csv.charCodeAt(0)).toBe(0xfeff)
    })

    it('should handle boolean values', () => {
      const data = [{ active: true, verified: false }]

      const csv = arrayToCsv(data, {
        columns: ['active', 'verified'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('Ja')
      expect(csv).toContain('Nein')
    })

    it('should handle Date values', () => {
      const date = new Date('2024-01-15T10:30:00Z')
      const data = [{ createdAt: date }]

      const csv = arrayToCsv(data, {
        columns: ['createdAt'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('2024-01-15')
    })

    it('should use custom delimiter', () => {
      const data = [{ name: 'John', age: 30 }]

      const csv = arrayToCsv(data, {
        columns: ['name', 'age'],
        filename: 'test',
        delimiter: ',',
        includeBom: false,
      })

      expect(csv).toContain('name,age')
      expect(csv).toContain('John,30')
    })
  })

  describe('exportCustomers', () => {
    it('should export customers to CSV', () => {
      const customers = [
        {
          id: 'c1',
          firstName: 'Max',
          lastName: 'Mustermann',
          email: 'max@test.ch',
          phone: '+41 79 123 45 67',
          createdAt: new Date('2024-01-01'),
          totalVisits: 5,
          totalSpend: 250,
        },
      ]

      // This triggers a download, so we verify the mock was called
      exportCustomers(customers)

      expect(mockCreateElement).toHaveBeenCalledWith('a')
      expect(mockClick).toHaveBeenCalled()
    })

    it('should handle customers without optional fields', () => {
      const customers = [
        {
          id: 'c1',
          firstName: 'Jane',
          lastName: 'Doe',
          email: 'jane@test.ch',
          createdAt: '2024-01-01',
        },
      ]

      exportCustomers(customers)

      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('exportOrders', () => {
    it('should export orders to CSV', () => {
      const orders = [
        {
          orderNumber: 'SW-001',
          customerName: 'Max Mustermann',
          customerEmail: 'max@test.ch',
          status: 'completed',
          paymentStatus: 'paid',
          paymentMethod: 'card',
          subtotal: 100,
          shipping: 8.90,
          total: 108.90,
          createdAt: new Date('2024-01-01'),
        },
      ]

      exportOrders(orders)

      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('exportAppointments', () => {
    it('should export appointments to CSV', () => {
      const appointments = [
        {
          id: 'a1',
          customerName: 'Max Mustermann',
          staffName: 'Anna Stylist',
          services: 'Haarschnitt Herren',
          date: new Date('2024-01-15'),
          time: '10:00',
          duration: 30,
          status: 'confirmed',
          price: 45,
        },
      ]

      exportAppointments(appointments)

      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('exportFinanceData', () => {
    it('should export finance data to CSV', () => {
      const transactions = [
        {
          date: new Date('2024-01-15'),
          type: 'sale',
          reference: 'SW-001',
          customer: 'Max Mustermann',
          paymentMethod: 'card',
          netAmount: 100,
          vatRate: 8.1,
          vatAmount: 8.10,
          grossAmount: 108.10,
        },
      ]

      exportFinanceData(transactions)

      expect(mockClick).toHaveBeenCalled()
    })
  })

  describe('Swiss Accounting Compatibility', () => {
    it('should use semicolon as default delimiter for Swiss software', () => {
      const data = [{ amount: 1234.56, name: 'Test' }]

      const csv = arrayToCsv(data, {
        columns: ['amount', 'name'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain(';')
      expect(csv).not.toMatch(/^\d.*,/)
    })

    it('should include UTF-8 BOM for Excel compatibility', () => {
      const csv = arrayToCsv([{ name: 'Müller' }], {
        columns: ['name'],
        filename: 'test',
      })

      // BOM is U+FEFF
      expect(csv.startsWith('\uFEFF')).toBe(true)
    })

    it('should handle German special characters', () => {
      const data = [
        {
          name: 'Müller',
          city: 'Zürich',
          street: 'Bahnhofstraße',
        },
      ]

      const csv = arrayToCsv(data, {
        columns: ['name', 'city', 'street'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('Müller')
      expect(csv).toContain('Zürich')
      expect(csv).toContain('Bahnhofstraße')
    })
  })

  describe('Large Dataset Handling', () => {
    it('should handle large datasets efficiently', () => {
      const largeData = Array.from({ length: 10000 }, (_, i) => ({
        id: `id-${i}`,
        name: `Customer ${i}`,
        email: `customer${i}@test.ch`,
        value: Math.random() * 1000,
      }))

      const start = performance.now()
      const csv = arrayToCsv(largeData, {
        columns: ['id', 'name', 'email', 'value'],
        filename: 'large-export',
        includeBom: false,
      })
      const duration = performance.now() - start

      expect(csv).toBeTruthy()
      expect(csv.split('\n').length).toBe(10001) // header + 10000 rows
      expect(duration).toBeLessThan(1000) // Should complete in under 1 second
    })
  })

  describe('Edge Cases', () => {
    it('should handle newlines in values', () => {
      const data = [{ address: 'Line 1\nLine 2' }]

      const csv = arrayToCsv(data, {
        columns: ['address'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('"Line 1\nLine 2"')
    })

    it('should handle carriage returns in values', () => {
      const data = [{ address: 'Line 1\r\nLine 2' }]

      const csv = arrayToCsv(data, {
        columns: ['address'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('"Line 1\r\nLine 2"')
    })

    it('should handle numeric strings', () => {
      const data = [{ id: '000123', zip: '01234' }]

      const csv = arrayToCsv(data, {
        columns: ['id', 'zip'],
        filename: 'test',
        includeBom: false,
      })

      expect(csv).toContain('000123')
      expect(csv).toContain('01234')
    })
  })
})
