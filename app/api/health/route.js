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
  let databaseLatency = null
  
  try {
    // Test database connection
    const dbStart = Date.now()
    await prisma.$queryRaw`SELECT 1`
    databaseLatency = Date.now() - dbStart
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
    version: process.env.npm_package_version || '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    checks: {
      database: {
        status: databaseStatus,
        latency: databaseLatency ? `${databaseLatency}ms` : null
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
