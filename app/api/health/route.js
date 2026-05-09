import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

const startTime = Date.now()

/**
 * Health check endpoint for monitoring
 * GET /api/health
 * 
 * Returns server status, uptime, and database connectivity
 */
export async function GET() {
  const timestamp = new Date().toISOString()
  const uptime = Math.floor((Date.now() - startTime) / 1000)
  
  let databaseStatus = 'unknown'
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`
    databaseStatus = 'connected'
  } catch (error) {
    databaseStatus = 'disconnected'
    console.error('Health check - DB error:', error.message)
  }
  
  const isHealthy = databaseStatus === 'connected'
  
  const healthData = {
    status: isHealthy ? 'healthy' : 'unhealthy',
    timestamp,
    uptime,
    checks: {
      database: {
        status: databaseStatus
      }
    }
  }
  
  return NextResponse.json(
    healthData,
    { 
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      }
    }
  )
}
