import { describe, it, expect } from 'vitest'
import { getTokenFromRequest } from '@/lib/auth'
import { 
  loginSchema, 
  registerJobseekerSchema, 
  registerRecruiterSchema,
  changePasswordSchema,
  passwordSchema 
} from '@/lib/validations/auth'

function createRequest({ authorization, cookieToken } = {}) {
  return {
    headers: {
      get: (name) => name.toLowerCase() === 'authorization' ? authorization : null
    },
    cookies: {
      get: (name) => name === 'token' && cookieToken ? { value: cookieToken } : undefined
    }
  }
}

describe('Auth Token Extraction', () => {
  it('prefers a valid bearer token from the authorization header', () => {
    const request = createRequest({ authorization: 'Bearer header-token', cookieToken: 'cookie-token' })

    expect(getTokenFromRequest(request)).toBe('header-token')
  })

  it('falls back to the httpOnly cookie when legacy bearer token is empty', () => {
    const request = createRequest({ authorization: 'Bearer null', cookieToken: 'cookie-token' })

    expect(getTokenFromRequest(request)).toBe('cookie-token')
  })

  it('returns null when no token is available', () => {
    const request = createRequest()

    expect(getTokenFromRequest(request)).toBeNull()
  })
})

describe('Password Schema', () => {
  describe('Strong Password Requirements', () => {
    it('should reject passwords shorter than 8 characters', () => {
      const result = passwordSchema.safeParse('Ab1@xyz')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without uppercase letter', () => {
      const result = passwordSchema.safeParse('abcd1234@')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without lowercase letter', () => {
      const result = passwordSchema.safeParse('ABCD1234@')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without number', () => {
      const result = passwordSchema.safeParse('Abcdefgh@')
      expect(result.success).toBe(false)
    })

    it('should reject passwords without special character', () => {
      const result = passwordSchema.safeParse('Abcd1234')
      expect(result.success).toBe(false)
    })

    it('should accept valid strong passwords', () => {
      const validPasswords = [
        'Password123!',
        'MySecure@Pass1',
        'Test#1234Abc',
        'Complex!Pass99'
      ]

      validPasswords.forEach(password => {
        const result = passwordSchema.safeParse(password)
        expect(result.success).toBe(true)
      })
    })
  })
})

describe('Login Schema', () => {
  it('should validate correct login data', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: 'anypassword'
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email format', () => {
    const result = loginSchema.safeParse({
      email: 'invalid-email',
      password: 'password'
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty password', () => {
    const result = loginSchema.safeParse({
      email: 'user@example.com',
      password: ''
    })
    expect(result.success).toBe(false)
  })
})

describe('Register Jobseeker Schema', () => {
  it('should validate correct registration data', () => {
    const result = registerJobseekerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      phone: '08123456789'
    })
    expect(result.success).toBe(true)
  })

  it('should reject weak password', () => {
    const result = registerJobseekerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'weakpass',
      phone: '08123456789'
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid phone number', () => {
    const result = registerJobseekerSchema.safeParse({
      name: 'John Doe',
      email: 'john@example.com',
      password: 'SecurePass123!',
      phone: 'invalid'
    })
    expect(result.success).toBe(false)
  })
})

describe('Change Password Schema', () => {
  it('should validate matching passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'NewSecure123!',
      confirmPassword: 'NewSecure123!'
    })
    expect(result.success).toBe(true)
  })

  it('should reject mismatched passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'NewSecure123!',
      confirmPassword: 'Different123!'
    })
    expect(result.success).toBe(false)
  })

  it('should reject weak new password', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldpass',
      newPassword: 'weakpass',
      confirmPassword: 'weakpass'
    })
    expect(result.success).toBe(false)
  })
})
