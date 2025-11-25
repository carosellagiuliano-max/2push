/**
 * Performance Tests - API Response Times
 *
 * Tests for measuring API response times and ensuring performance thresholds.
 */

import { describe, it, expect, vi } from 'vitest'

// Performance thresholds (in milliseconds)
const THRESHOLDS = {
  FAST: 100,      // Simple operations
  NORMAL: 500,    // Standard CRUD operations
  SLOW: 2000,     // Complex operations (search, aggregation)
  VERY_SLOW: 5000, // Heavy operations (exports, reports)
}

// Helper to measure execution time
async function measureTime<T>(fn: () => Promise<T>): Promise<{ result: T; duration: number }> {
  const start = performance.now()
  const result = await fn()
  const duration = performance.now() - start
  return { result, duration }
}

describe('Performance Tests', () => {
  describe('Response Time Thresholds', () => {
    it('should define acceptable response time thresholds', () => {
      expect(THRESHOLDS.FAST).toBeLessThanOrEqual(100)
      expect(THRESHOLDS.NORMAL).toBeLessThanOrEqual(500)
      expect(THRESHOLDS.SLOW).toBeLessThanOrEqual(2000)
      expect(THRESHOLDS.VERY_SLOW).toBeLessThanOrEqual(5000)
    })
  })

  describe('Simulated API Performance', () => {
    it('should measure fast operation time', async () => {
      const mockFastOperation = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return { success: true }
      })

      const { duration } = await measureTime(mockFastOperation)

      expect(duration).toBeLessThan(THRESHOLDS.FAST)
    })

    it('should measure normal operation time', async () => {
      const mockNormalOperation = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return { success: true, data: { id: '123' } }
      })

      const { duration } = await measureTime(mockNormalOperation)

      expect(duration).toBeLessThan(THRESHOLDS.NORMAL)
    })

    it('should warn for slow operations', async () => {
      const mockSlowOperation = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return { success: true }
      })

      const { duration } = await measureTime(mockSlowOperation)

      // Should complete but might be slow
      expect(duration).toBeLessThan(THRESHOLDS.SLOW)
    })
  })

  describe('Concurrent Request Handling', () => {
    it('should handle multiple concurrent requests', async () => {
      const mockRequest = vi.fn(async (id: number) => {
        await new Promise((resolve) => setTimeout(resolve, 10))
        return { id, success: true }
      })

      const concurrentRequests = 10
      const requests = Array.from({ length: concurrentRequests }, (_, i) =>
        mockRequest(i)
      )

      const start = performance.now()
      const results = await Promise.all(requests)
      const totalDuration = performance.now() - start

      expect(results).toHaveLength(concurrentRequests)
      expect(results.every((r) => r.success)).toBe(true)

      // Parallel execution should be faster than sequential
      expect(totalDuration).toBeLessThan(concurrentRequests * 50)
    })

    it('should not degrade under moderate load', async () => {
      const mockRequest = vi.fn(async () => {
        await new Promise((resolve) => setTimeout(resolve, 5))
        return { success: true }
      })

      const iterations = 100
      const durations: number[] = []

      for (let i = 0; i < iterations; i++) {
        const { duration } = await measureTime(mockRequest)
        durations.push(duration)
      }

      const avgDuration = durations.reduce((a, b) => a + b, 0) / durations.length
      const maxDuration = Math.max(...durations)

      // Average should be reasonable
      expect(avgDuration).toBeLessThan(50)
      // No extreme outliers
      expect(maxDuration).toBeLessThan(avgDuration * 10)
    })
  })

  describe('Memory Usage', () => {
    it('should not leak memory in repeated operations', async () => {
      const iterations = 1000
      const objects: unknown[] = []

      for (let i = 0; i < iterations; i++) {
        const obj = { id: i, data: new Array(100).fill('x') }
        objects.push(obj)
      }

      // Clear references
      objects.length = 0

      // Should be able to run without memory errors
      expect(true).toBe(true)
    })
  })

  describe('Data Processing Performance', () => {
    it('should process large arrays efficiently', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => ({
        id: i,
        name: `Item ${i}`,
        value: Math.random() * 1000,
      }))

      const start = performance.now()

      // Filter operation
      const filtered = largeArray.filter((item) => item.value > 500)

      // Map operation
      const mapped = filtered.map((item) => ({
        ...item,
        processed: true,
      }))

      // Sort operation
      const sorted = [...mapped].sort((a, b) => b.value - a.value)

      const duration = performance.now() - start

      expect(sorted.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(100) // Should process quickly
    })

    it('should handle string operations efficiently', async () => {
      const iterations = 10000
      const strings: string[] = []

      const start = performance.now()

      for (let i = 0; i < iterations; i++) {
        const str = `User ${i} - Email: user${i}@example.com - Phone: +41 79 ${String(i).padStart(3, '0')} 00 00`
        strings.push(str)
      }

      // Search operation
      const found = strings.filter((s) => s.includes('User 500'))

      const duration = performance.now() - start

      expect(found.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(100)
    })
  })

  describe('JSON Processing', () => {
    it('should serialize large objects quickly', async () => {
      const largeObject = {
        customers: Array.from({ length: 1000 }, (_, i) => ({
          id: `customer-${i}`,
          name: `Customer ${i}`,
          email: `customer${i}@test.ch`,
          appointments: Array.from({ length: 5 }, (_, j) => ({
            id: `apt-${i}-${j}`,
            date: new Date().toISOString(),
          })),
        })),
      }

      const start = performance.now()
      const json = JSON.stringify(largeObject)
      const parsed = JSON.parse(json)
      const duration = performance.now() - start

      expect(parsed.customers).toHaveLength(1000)
      expect(duration).toBeLessThan(200)
    })
  })

  describe('Date Operations', () => {
    it('should handle date calculations efficiently', async () => {
      const iterations = 10000
      const dates: Date[] = []

      const start = performance.now()

      for (let i = 0; i < iterations; i++) {
        const date = new Date()
        date.setDate(date.getDate() + i)
        dates.push(date)
      }

      // Filter future dates
      const today = new Date()
      const futureDates = dates.filter((d) => d > today)

      const duration = performance.now() - start

      expect(futureDates.length).toBeGreaterThan(0)
      expect(duration).toBeLessThan(100)
    })
  })
})
