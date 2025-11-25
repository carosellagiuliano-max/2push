/**
 * Logging Utility
 *
 * Structured logging for server-side operations.
 * Uses JSON format for easy parsing in production.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error'

export interface LogContext {
  salonId?: string
  userId?: string
  customerId?: string
  requestId?: string
  action?: string
  [key: string]: unknown
}

export interface LogEntry {
  timestamp: string
  level: LogLevel
  message: string
  context?: LogContext
  error?: {
    name: string
    message: string
    stack?: string
  }
}

const LOG_LEVELS: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
}

// Get log level from environment (default: info in production, debug in development)
function getMinLogLevel(): LogLevel {
  const envLevel = process.env.LOG_LEVEL as LogLevel
  if (envLevel && LOG_LEVELS[envLevel] !== undefined) {
    return envLevel
  }
  return process.env.NODE_ENV === 'production' ? 'info' : 'debug'
}

function shouldLog(level: LogLevel): boolean {
  const minLevel = getMinLogLevel()
  return LOG_LEVELS[level] >= LOG_LEVELS[minLevel]
}

function formatLogEntry(entry: LogEntry): string {
  if (process.env.NODE_ENV === 'production') {
    // JSON format for production (easier to parse)
    return JSON.stringify(entry)
  }
  // Human-readable format for development
  const { timestamp, level, message, context, error } = entry
  let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`
  if (context && Object.keys(context).length > 0) {
    output += ` ${JSON.stringify(context)}`
  }
  if (error) {
    output += `\n  Error: ${error.name}: ${error.message}`
    if (error.stack) {
      output += `\n  Stack: ${error.stack}`
    }
  }
  return output
}

function createLogEntry(
  level: LogLevel,
  message: string,
  context?: LogContext,
  error?: Error
): LogEntry {
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
  }

  if (context && Object.keys(context).length > 0) {
    entry.context = context
  }

  if (error) {
    entry.error = {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return entry
}

function log(level: LogLevel, message: string, context?: LogContext, error?: Error): void {
  if (!shouldLog(level)) {
    return
  }

  const entry = createLogEntry(level, message, context, error)
  const formatted = formatLogEntry(entry)

  switch (level) {
    case 'debug':
      console.debug(formatted)
      break
    case 'info':
      console.info(formatted)
      break
    case 'warn':
      console.warn(formatted)
      break
    case 'error':
      console.error(formatted)
      break
  }
}

/**
 * Logger object with level-specific methods
 */
export const logger = {
  debug: (message: string, context?: LogContext) => log('debug', message, context),
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, error?: Error, context?: LogContext) =>
    log('error', message, context, error),
}

/**
 * Create a child logger with preset context
 */
export function createLogger(defaultContext: LogContext) {
  return {
    debug: (message: string, context?: LogContext) =>
      log('debug', message, { ...defaultContext, ...context }),
    info: (message: string, context?: LogContext) =>
      log('info', message, { ...defaultContext, ...context }),
    warn: (message: string, context?: LogContext) =>
      log('warn', message, { ...defaultContext, ...context }),
    error: (message: string, error?: Error, context?: LogContext) =>
      log('error', message, { ...defaultContext, ...context }, error),
  }
}

/**
 * Log action with timing
 */
export async function logAction<T>(
  actionName: string,
  fn: () => Promise<T>,
  context?: LogContext
): Promise<T> {
  const startTime = Date.now()
  logger.debug(`Starting: ${actionName}`, context)

  try {
    const result = await fn()
    const duration = Date.now() - startTime
    logger.info(`Completed: ${actionName}`, { ...context, durationMs: duration })
    return result
  } catch (error) {
    const duration = Date.now() - startTime
    logger.error(
      `Failed: ${actionName}`,
      error instanceof Error ? error : new Error(String(error)),
      { ...context, durationMs: duration }
    )
    throw error
  }
}
