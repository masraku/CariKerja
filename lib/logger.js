import pino from 'pino'

/**
 * Structured JSON logger using Pino
 * Provides consistent logging format across the application
 */
const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  
  // Use pino-pretty in development for readable logs
  transport: process.env.NODE_ENV === 'development' 
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname'
        }
      }
    : undefined,
  
  // Production: structured JSON format
  formatters: {
    level: (label) => ({ level: label }),
  },
  
  // Base properties included in every log
  base: {
    env: process.env.NODE_ENV || 'development',
  },
  
  // Timestamp format
  timestamp: pino.stdTimeFunctions.isoTime,
})

/**
 * Create a child logger with additional context
 * @param {Object} context - Additional context to include in logs
 */
export function createLogger(context) {
  return logger.child(context)
}

/**
 * Log an API request
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {Object} meta - Additional metadata
 */
export function logRequest(method, path, meta = {}) {
  logger.info({ type: 'request', method, path, ...meta })
}

/**
 * Log an API response
 * @param {string} method - HTTP method
 * @param {string} path - Request path
 * @param {number} status - HTTP status code
 * @param {number} duration - Request duration in ms
 */
export function logResponse(method, path, status, duration) {
  const level = status >= 500 ? 'error' : status >= 400 ? 'warn' : 'info'
  logger[level]({ type: 'response', method, path, status, duration: `${duration}ms` })
}

/**
 * Log an error
 * @param {Error} error - Error object
 * @param {Object} context - Additional context
 */
export function logError(error, context = {}) {
  const normalizedError = error instanceof Error ? error : new Error(String(error))

  logger.error({
    type: 'error',
    message: normalizedError.message,
    stack: normalizedError.stack,
    ...context
  })
}

/**
 * Log a security event
 * @param {string} event - Event type (login, logout, failed_auth, etc)
 * @param {Object} meta - Additional metadata
 */
export function logSecurity(event, meta = {}) {
  logger.warn({ type: 'security', event, ...meta })
}

/**
 * Log database operations
 * @param {string} operation - DB operation (query, insert, update, delete)
 * @param {string} table - Table name
 * @param {number} duration - Operation duration in ms
 */
export function logDatabase(operation, table, duration) {
  logger.debug({ type: 'database', operation, table, duration: `${duration}ms` })
}

export default logger
