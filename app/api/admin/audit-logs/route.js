import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { requireAdmin } from '@/lib/authHelper'
import { validateQuery } from '@/lib/validations'
import { z } from 'zod'

// Query schema
const auditQuerySchema = z.object({
  page: z.string().optional().transform(v => parseInt(v) || 1),
  limit: z.string().optional().transform(v => Math.min(parseInt(v) || 20, 100)),
  action: z.string().optional(),
  userId: z.string().optional(),
  targetType: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  search: z.string().optional()
})

// GET /api/admin/audit-logs - Get audit logs with filters
export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Validate query
    const validation = validateQuery(request, auditQuerySchema)
    if (!validation.success) {
      return validation.response
    }
    
    const { page, limit, action, userId, targetType, startDate, endDate, search } = validation.data

    // Build where clause
    const where = {}

    if (action) {
      where.action = action
    }

    if (userId) {
      where.userId = userId
    }

    if (targetType) {
      where.targetType = targetType
    }

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) {
        where.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        where.createdAt.lte = new Date(endDate)
      }
    }

    if (search) {
      where.OR = [
        { action: { contains: search, mode: 'insensitive' } },
        { targetType: { contains: search, mode: 'insensitive' } },
        { ipAddress: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Get total count
    const total = await prisma.audit_logs.count({ where })

    // Get logs
    const logs = await prisma.audit_logs.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit
    })

    // Get distinct actions for filter dropdown
    const actions = await prisma.audit_logs.findMany({
      select: { action: true },
      distinct: ['action']
    })

    return NextResponse.json({
      success: true,
      data: logs,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      },
      filters: {
        actions: actions.map(a => a.action)
      }
    })

  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch audit logs',
      ...createErrorResponse('Terjadi kesalahan', error) 
    }, { status: 500 })
  }
}
