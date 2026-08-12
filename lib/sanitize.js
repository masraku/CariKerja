/**
 * Server-safe HTML sanitization utilities.
 *
 * `sanitizeText` strips all HTML tags and is safe for server components.
 * `sanitizeHtml` uses DOMPurify (client-only) for safe HTML rendering.
 *
 * We avoid `isomorphic-dompurify` because its `jsdom` dependency
 * (v27+) pulls in ESM-only packages (`@exodus/bytes`) that break
 * on Vercel's CommonJS runtime (`ERR_REQUIRE_ESM`).
 */

/**
 * Strip all HTML tags and return plain text.
 * Safe to use in both server and client components.
 *
 * @param {string} text - Text potentially containing HTML
 * @returns {string} Plain text without HTML tags
 */
export function sanitizeText(text) {
  if (!text) return ''
  return text
    .replace(/<[^>]*>/g, '') // strip HTML tags
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Sanitize HTML content to prevent XSS attacks.
 * Uses DOMPurify - only safe for client components ("use client").
 *
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html) return ''

  // Server-side: return stripped text as fallback
  if (typeof window === 'undefined') {
    return sanitizeText(html)
  }

  // Client-side: use DOMPurify for proper sanitization
  const DOMPurify = require('dompurify')
  return DOMPurify.default
    ? DOMPurify.default.sanitize(html, SANITIZE_CONFIG)
    : DOMPurify.sanitize(html, SANITIZE_CONFIG)
}

const SANITIZE_CONFIG = {
  // Allowed tags for job descriptions
  ALLOWED_TAGS: [
    'p', 'br', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li',
    'a', 'span', 'div',
    'table', 'thead', 'tbody', 'tr', 'th', 'td',
    'blockquote', 'pre', 'code'
  ],
  // Allowed attributes
  ALLOWED_ATTR: [
    'href', 'target', 'rel', 'class',
    'colspan', 'rowspan'
  ],
  // Force links to open in new tab and be safe
  ADD_ATTR: ['target', 'rel'],
  // Forbid dangerous protocols
  ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  // Force all links to have rel="noopener noreferrer"
  TRANSFORM_TAGS: {
    'a': (tagName, attribs) => ({
      tagName: 'a',
      attribs: {
        ...attribs,
        target: '_blank',
        rel: 'noopener noreferrer'
      }
    })
  }
}

const sanitizeUtils = { sanitizeHtml, sanitizeText }

export default sanitizeUtils
