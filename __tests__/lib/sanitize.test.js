import { describe, expect, it } from 'vitest'
import { sanitizeHtml, sanitizeText } from '@/lib/sanitize'

describe('HTML sanitization', () => {
  it('removes script tags and dangerous attributes', () => {
    const dirty = '<p style="color:red" onclick="alert(1)">Aman</p><script>alert(1)</script>'
    const clean = sanitizeHtml(dirty)

    expect(clean).toContain('<p>Aman</p>')
    expect(clean).not.toContain('script')
    expect(clean).not.toContain('onclick')
    expect(clean).not.toContain('style=')
  })

  it('strips HTML when plain text is needed', () => {
    expect(sanitizeText('<strong>Lowongan</strong> kerja')).toBe('Lowongan kerja')
  })
})
