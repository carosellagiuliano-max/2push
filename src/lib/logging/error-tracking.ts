/**
 * Error Tracking Utility
 *
 * Abstraction layer for error tracking services (Sentry, etc.)
 * Allows easy switching between providers without code changes.
 */

import { logger } from './logger'

export interface ErrorContext {
  salonId?: string
  userId?: string
  customerId?: string
  action?: string
  tags?: Record<string, string>
  extra?: Record<string, unknown>
}

export interface UserContext {
  id: string
  email?: string
  name?: string
  role?: string
}

// Check if Sentry is available
function getSentry() {
  // In production, this would be @sentry/nextjs
  // For now, we just log errors
  return null
}

/**
 * Initialize error tracking
 * Call this at application startup
 */
export function initErrorTracking() {
  const dsn = process.env.SENTRY_DSN

  if (!dsn) {
    logger.info('Error tracking not configured (SENTRY_DSN not set)')
    return
  }

  // Initialize Sentry here when ready
  // import * as Sentry from '@sentry/nextjs'
  // Sentry.init({ dsn, environment: process.env.NODE_ENV })

  logger.info('Error tracking initialized')
}

/**
 * Capture an exception
 */
export function captureException(error: Error, context?: ErrorContext): void {
  // Log locally first
  logger.error('Exception captured', error, {
    salonId: context?.salonId,
    userId: context?.userId,
    action: context?.action,
  })

  // Send to error tracking service
  const sentry = getSentry()
  if (sentry) {
    // Sentry.captureException(error, {
    //   tags: context?.tags,
    //   extra: context?.extra,
    // })
  }
}

/**
 * Capture a message (non-exception)
 */
export function captureMessage(
  message: string,
  level: 'info' | 'warning' | 'error' = 'info',
  context?: ErrorContext
): void {
  // Log locally
  switch (level) {
    case 'info':
      logger.info(message, { salonId: context?.salonId, userId: context?.userId })
      break
    case 'warning':
      logger.warn(message, { salonId: context?.salonId, userId: context?.userId })
      break
    case 'error':
      logger.error(message, undefined, { salonId: context?.salonId, userId: context?.userId })
      break
  }

  // Send to error tracking service
  const sentry = getSentry()
  if (sentry) {
    // Sentry.captureMessage(message, level)
  }
}

/**
 * Set user context for error tracking
 */
export function setUserContext(user: UserContext | null): void {
  const sentry = getSentry()
  if (sentry) {
    // if (user) {
    //   Sentry.setUser({
    //     id: user.id,
    //     email: user.email,
    //     username: user.name,
    //   })
    // } else {
    //   Sentry.setUser(null)
    // }
  }
}

/**
 * Add breadcrumb for debugging
 */
export function addBreadcrumb(
  message: string,
  category: string,
  data?: Record<string, unknown>
): void {
  logger.debug(`Breadcrumb [${category}]: ${message}`, data as Record<string, string>)

  const sentry = getSentry()
  if (sentry) {
    // Sentry.addBreadcrumb({
    //   message,
    //   category,
    //   data,
    //   level: 'info',
    // })
  }
}

/**
 * Create error boundary handler for React
 */
export function createErrorBoundaryHandler(componentName: string) {
  return (error: Error, errorInfo: { componentStack: string }) => {
    captureException(error, {
      action: 'react_error_boundary',
      extra: {
        componentName,
        componentStack: errorInfo.componentStack,
      },
    })
  }
}

/**
 * Wrap an async function with error tracking
 */
export function withErrorTracking<T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  actionName: string,
  context?: ErrorContext
): T {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args)
    } catch (error) {
      captureException(error instanceof Error ? error : new Error(String(error)), {
        ...context,
        action: actionName,
      })
      throw error
    }
  }) as T
}

/**
 * Performance monitoring
 */
export function startTransaction(name: string, op: string) {
  const startTime = Date.now()

  return {
    finish: () => {
      const duration = Date.now() - startTime
      logger.debug(`Transaction completed: ${name}`, { op, durationMs: duration })

      // Send to error tracking service
      const sentry = getSentry()
      if (sentry) {
        // Sentry would handle this via its performance monitoring
      }
    },
    setData: (key: string, value: unknown) => {
      // Store additional data
      logger.debug(`Transaction data [${name}]: ${key}`, { value: String(value) })
    },
  }
}

/**
 * Report a custom metric
 */
export function reportMetric(name: string, value: number, unit: string = 'count'): void {
  logger.debug(`Metric: ${name}`, { value, unit })

  // Could send to monitoring service
}
