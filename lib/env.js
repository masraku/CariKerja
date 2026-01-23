 import { z } from 'zod'

/**
 * Environment variables schema
 * Validates required env vars at startup to fail fast
 */
const envSchema = z.object({
  // Database
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  
  // Authentication
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
  
  // Optional - Redis for rate limiting
  UPSTASH_REDIS_REST_URL: z.string().url().optional(),
  UPSTASH_REDIS_REST_TOKEN: z.string().optional(),
  
  // Optional - Base URL
  NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
  
  // Optional - Supabase
  NEXT_PUBLIC_SUPABASE_URL: z.string().url().optional(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().optional(),
  
  // Node environment
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
})

/**
 * Validates environment variables and returns typed env object
 * @throws {Error} if validation fails
 */
export function validateEnv() {
  const result = envSchema.safeParse(process.env)
  
  if (!result.success) {
    const errors = result.error.issues.map(issue => {
      return `  - ${issue.path.join('.')}: ${issue.message}`
    }).join('\n')
    
    console.error('\n❌ Environment validation failed:\n')
    console.error(errors)
    console.error('\nPlease check your .env file\n')
    
    throw new Error(`Environment validation failed:\n${errors}`)
  }
  
  return result.data
}

/**
 * Get validated environment variable
 * Safe to use after validateEnv() has been called
 */
export function getEnv(key) {
  return process.env[key]
}

/**
 * Typed environment object (after validation)
 */
export const env = {
  get DATABASE_URL() { return process.env.DATABASE_URL },
  get JWT_SECRET() { return process.env.JWT_SECRET },
  get NODE_ENV() { return process.env.NODE_ENV || 'development' },
  get isProduction() { return process.env.NODE_ENV === 'production' },
  get isDevelopment() { return process.env.NODE_ENV === 'development' },
}

export default { validateEnv, getEnv, env }
