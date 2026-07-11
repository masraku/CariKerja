import { describe, expect, it } from 'vitest'
import { jobSearchSchema } from '@/lib/validations/jobs'

describe('Job search validation', () => {
  it('returns numeric defaults for pagination', () => {
    const result = jobSearchSchema.parse({})

    expect(result.page).toBe(1)
    expect(result.limit).toBe(10)
  })

  it('coerces pagination query strings to numbers', () => {
    const result = jobSearchSchema.parse({ page: '2', limit: '25' })

    expect(result.page).toBe(2)
    expect(result.limit).toBe(25)
  })
})
