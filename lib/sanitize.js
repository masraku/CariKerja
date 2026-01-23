import DOMPurify from 'isomorphic-dompurify'

/**
 * Sanitize HTML content to prevent XSS attacks
 * Removes dangerous tags, attributes, and JavaScript
 * 
 * @param {string} html - HTML content to sanitize
 * @returns {string} Sanitized HTML
 */
export function sanitizeHtml(html) {
  if (!html) return ''
  
  return DOMPurify.sanitize(html, {
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
      'href', 'target', 'rel', 'class', 'style',
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
  })
}

/**
 * Sanitize plain text (strip all HTML)
 * @param {string} text - Text to sanitize
 * @returns {string} Plain text without HTML
 */
export function sanitizeText(text) {
  if (!text) return ''
  return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

export default { sanitizeHtml, sanitizeText }
