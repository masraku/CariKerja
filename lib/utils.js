/**
 * Utility functions for the application
 */

/**
 * Serialize data containing BigInt to JSON-safe format
 * @param {any} data - Data that may contain BigInt values
 * @returns {any} JSON-serializable data
 */
export function serializeBigInt(data) {
  return JSON.parse(JSON.stringify(data, (_, value) =>
    typeof value === 'bigint' ? value.toString() : value
  ))
}

/**
 * Format currency to Indonesian Rupiah
 * @param {number|string} value - Value to format
 * @returns {string} Formatted currency string
 */
export function formatRupiah(value) {
  const num = typeof value === 'string' ? parseInt(value) : value
  return num.toLocaleString('id-ID')
}

/**
 * Format date to Indonesian locale
 * @param {Date|string} date - Date to format
 * @param {object} options - Intl.DateTimeFormat options
 * @returns {string} Formatted date string
 */
export function formatDate(date, options = {}) {
  const defaultOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    ...options
  }
  return new Date(date).toLocaleDateString('id-ID', defaultOptions)
}
