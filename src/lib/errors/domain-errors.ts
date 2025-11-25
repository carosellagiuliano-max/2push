/**
 * Base class for all domain errors.
 * Provides consistent error structure across the application.
 */
export class DomainError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly httpStatus: number = 400,
    public readonly fieldErrors?: Record<string, string>
  ) {
    super(message)
    this.name = 'DomainError'
  }

  toJSON() {
    return {
      code: this.code,
      message: this.message,
      fieldErrors: this.fieldErrors,
    }
  }
}

/**
 * Booking-related errors
 */
export class BookingError extends DomainError {
  constructor(code: string, message: string, httpStatus = 400) {
    super(code, message, httpStatus)
    this.name = 'BookingError'
  }
}

/**
 * Payment-related errors
 */
export class PaymentError extends DomainError {
  constructor(code: string, message: string, httpStatus = 400) {
    super(code, message, httpStatus)
    this.name = 'PaymentError'
  }
}

/**
 * Order-related errors
 */
export class OrderError extends DomainError {
  constructor(code: string, message: string, httpStatus = 400) {
    super(code, message, httpStatus)
    this.name = 'OrderError'
  }
}

/**
 * Authentication/Authorization errors
 */
export class AuthError extends DomainError {
  constructor(code: string, message: string, httpStatus = 401) {
    super(code, message, httpStatus)
    this.name = 'AuthError'
  }
}

/**
 * Validation errors with field-level details
 */
export class ValidationError extends DomainError {
  constructor(message: string, fieldErrors: Record<string, string>) {
    super('VALIDATION_ERROR', message, 400, fieldErrors)
    this.name = 'ValidationError'
  }
}
