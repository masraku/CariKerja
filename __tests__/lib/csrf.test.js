import { describe, expect, it } from 'vitest'
import { validateCSRFToken } from '@/lib/csrf'

function createRequest({ cookieToken, headerToken } = {}) {
  return {
    cookies: {
      get: (name) => name === 'csrf_token' && cookieToken ? { value: cookieToken } : undefined,
    },
    headers: {
      get: (name) => name.toLowerCase() === 'x-csrf-token' ? headerToken : null,
    },
  }
}

describe('CSRF validation', () => {
  it('accepts matching cookie and header tokens', () => {
    const token = 'a'.repeat(64)

    expect(validateCSRFToken(createRequest({ cookieToken: token, headerToken: token }))).toBe(true)
  })

  it('rejects missing tokens', () => {
    expect(validateCSRFToken(createRequest())).toBe(false)
  })

  it('rejects mismatched tokens', () => {
    expect(validateCSRFToken(createRequest({
      cookieToken: 'a'.repeat(64),
      headerToken: 'b'.repeat(64),
    }))).toBe(false)
  })
})
