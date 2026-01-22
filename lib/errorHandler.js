/**
 * Centralized Error Handler
 * - Hides technical details in production
 * - Shows detailed errors in development
 * - Logs errors server-side for debugging
 */

const isDevelopment = process.env.NODE_ENV === 'development'

/**
 * Create a safe error response for API routes
 * @param {string} userMessage - Generic message to show users
 * @param {Error|string} error - The actual error
 * @param {number} status - HTTP status code
 * @returns {{ error: string, details?: string }}
 */
export function createErrorResponse(userMessage, error, status = 500) {
  // Always log full error server-side
  console.error(`[${new Date().toISOString()}] ${userMessage}:`, error)

  const response = {
    error: userMessage
  }

  // Only include details in development
  if (isDevelopment && error) {
    response.details = error instanceof Error ? error.message : String(error)
  }

  return response
}

/**
 * Wrap API handler with error handling
 * @param {Function} handler - Async API handler function
 * @returns {Function} - Wrapped handler
 */
export function withErrorHandler(handler) {
  return async (request, context) => {
    try {
      return await handler(request, context)
    } catch (error) {
      console.error('[API Error]:', error)
      
      const response = createErrorResponse(
        'Terjadi kesalahan pada server',
        error,
        500
      )

      return new Response(JSON.stringify(response), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

/**
 * Standard error messages (Indonesian)
 */
export const ErrorMessages = {
  SERVER_ERROR: 'Terjadi kesalahan pada server',
  NOT_FOUND: 'Data tidak ditemukan',
  UNAUTHORIZED: 'Anda tidak memiliki akses',
  BAD_REQUEST: 'Permintaan tidak valid',
  RATE_LIMITED: 'Terlalu banyak permintaan, coba lagi nanti',
  UPLOAD_FAILED: 'Gagal mengunggah file',
  DATABASE_ERROR: 'Gagal mengakses database',
  VALIDATION_ERROR: 'Data yang dikirim tidak valid'
}
