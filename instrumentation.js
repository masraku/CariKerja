/**
 * Next.js Instrumentation File
 * Runs once when the server starts
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run validation on server side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { validateEnv } = await import('./lib/env.js')
    
    try {
      validateEnv()
      console.log('✅ Environment variables validated successfully')
    } catch (error) {
      console.error('❌ Environment validation failed:', error.message)
      // In production, we want to fail fast
      if (process.env.NODE_ENV === 'production') {
        process.exit(1)
      }
    }
  }
}
