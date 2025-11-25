# Testing Guide

This document describes the testing strategy and practices for SCHNITTWERK.

## Testing Stack

- **Unit Tests**: Vitest
- **Component Tests**: Testing Library
- **E2E Tests**: Playwright
- **Property-Based Tests**: fast-check

## Running Tests

```bash
# Run all unit tests
pnpm test

# Run tests with UI
pnpm test:ui

# Run tests with coverage
pnpm test:coverage

# Run E2E tests
pnpm test:e2e
```

## Test Structure

```
src/
├── lib/
│   └── domain/
│       ├── booking.ts
│       ├── booking.test.ts    # Unit tests for booking logic
│       ├── voucher.ts
│       ├── voucher.test.ts    # Unit tests for voucher logic
│       ├── loyalty.ts
│       └── loyalty.test.ts    # Unit tests for loyalty logic
├── features/
│   └── booking/
│       └── components/
│           └── __tests__/     # Component tests
└── __tests__/
    └── e2e/                   # E2E tests
```

## Unit Tests

### Domain Logic

Unit tests focus on pure business logic without external dependencies.

```typescript
// Example: Testing booking validation
describe('validateBookingRules', () => {
  it('should return valid for a valid booking', () => {
    const proposedTime = addHours(now, 4)
    const result = validateBookingRules(proposedTime, 60, [], rules, now)
    expect(result.valid).toBe(true)
  })
})
```

### Key Areas to Test

1. **Booking Logic**
   - Lead time validation
   - Horizon validation
   - Conflict detection
   - Slot generation
   - Cancellation rules

2. **Voucher Logic**
   - Validation (expiry, balance, salon)
   - Redemption calculations
   - Balance updates

3. **Loyalty Logic**
   - Points calculation
   - Tier determination
   - Progress calculation
   - Redemption validation

## Property-Based Tests

For complex logic like the slot engine, use property-based testing:

```typescript
import { fc } from 'fast-check'

describe('Slot Engine Properties', () => {
  it('should never generate overlapping slots for same staff', () => {
    fc.assert(
      fc.property(
        fc.array(serviceArbitrary),
        fc.date(),
        (services, date) => {
          const slots = generateSlots(...)
          // Assert no overlaps
          return noOverlaps(slots)
        }
      )
    )
  })
})
```

## Component Tests

Test React components with Testing Library:

```typescript
import { render, screen, fireEvent } from '@testing-library/react'
import { BookingForm } from './booking-form'

describe('BookingForm', () => {
  it('should show validation errors', async () => {
    render(<BookingForm />)
    fireEvent.click(screen.getByText('Buchen'))
    expect(await screen.findByText('Bitte wählen Sie einen Service')).toBeInTheDocument()
  })
})
```

## E2E Tests

Test complete user flows with Playwright:

```typescript
import { test, expect } from '@playwright/test'

test('complete booking flow', async ({ page }) => {
  // Navigate to booking page
  await page.goto('/termin-buchen')

  // Select service
  await page.click('[data-testid="service-herrenschnitt"]')

  // Select staff
  await page.click('[data-testid="staff-any"]')

  // Select time slot
  await page.click('[data-testid="slot-10-00"]')

  // Fill customer info
  await page.fill('[name="name"]', 'Test User')
  await page.fill('[name="email"]', 'test@example.com')
  await page.fill('[name="phone"]', '+41 79 123 45 67')

  // Confirm booking
  await page.click('[data-testid="confirm-booking"]')

  // Verify success
  await expect(page.locator('[data-testid="booking-success"]')).toBeVisible()
})
```

## Test Coverage

### Minimum Coverage Targets

| Area | Target |
|------|--------|
| Domain Logic | 90% |
| Server Actions | 80% |
| Components | 70% |
| Overall | 75% |

### Generating Coverage Report

```bash
pnpm test:coverage
```

Coverage report will be generated in `coverage/` directory.

## Mocking

### Database
Use test fixtures and mock the Supabase client:

```typescript
vi.mock('@/lib/supabase/server', () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockResolvedValue({ data: mockData, error: null }),
    }),
  }),
}))
```

### External Services
Mock Stripe, email providers, etc.:

```typescript
vi.mock('@/lib/payments/stripe', () => ({
  createPaymentIntent: vi.fn().mockResolvedValue({
    id: 'pi_test_123',
    client_secret: 'test_secret',
  }),
}))
```

## Best Practices

### Do
- Test business logic thoroughly
- Use descriptive test names in German where appropriate
- Test error cases, not just happy paths
- Keep tests independent and isolated
- Use test fixtures for complex data

### Don't
- Test implementation details
- Mock everything (integration tests are valuable)
- Write brittle tests tied to UI structure
- Skip edge cases
- Leave flaky tests in CI

## CI Integration

Tests run automatically on:
- Every push to `main` and `develop`
- Every pull request

CI workflow:
1. Install dependencies
2. Run linting
3. Run type checking
4. Run unit tests
5. Run E2E tests (on PRs to main)

## Test Data

### Fixtures
Store reusable test data in fixtures:

```typescript
// __fixtures__/booking.ts
export const mockServices = [
  { id: '1', name: 'Herrenhaarschnitt', durationMinutes: 30, price: 45 },
  { id: '2', name: 'Damenhaarschnitt', durationMinutes: 45, price: 65 },
]
```

### Seeding
For E2E tests, use a test seed:

```bash
# Seed test database
pnpm db:seed --env test
```

## Troubleshooting

### Tests Timing Out
- Increase timeout in vitest config
- Check for unresolved promises
- Use `vi.useFakeTimers()` for time-dependent tests

### Flaky Tests
- Avoid depending on timing
- Use proper wait utilities
- Ensure test isolation

### Coverage Not Updating
- Clear cache: `pnpm test --clearCache`
- Rebuild: `pnpm build`
