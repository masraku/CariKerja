import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createErrorResponse } from '@/lib/errorHandler'
import { requireAdmin } from '@/lib/authHelper'

// GET /api/admin/audit-logs/export - Export audit logs as CSV
export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    // Get query params for filters
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Build where clause
    const where = {}

    if (action) where.action = action

    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }

    // Get logs (limit to 10000 for performance)
    const logs = await prisma.audit_logs.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 10000
    })

    // Generate CSV
    const headers = ['ID', 'Timestamp', 'Action', 'User ID', 'Role', 'Target Type', 'Target ID', 'IP Address', 'Changes']
    
    const csvRows = [
      headers.join(','),
      ...logs.map(log => [
        log.id,
        log.createdAt.toISOString(),
        log.action,
        log.userId || '',
        log.userRole || '',
        log.targetType || '',
        log.targetId || '',
        log.ipAddress || '',
        log.changes ? JSON.stringify(log.changes).replace(/,/g, ';') : ''
      ].map(v => `"${v}"`).join(','))
    ]

    const csv = csvRows.join('\n')

    // Return as CSV file
    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="audit-logs-${new Date().toISOString().split('T')[0]}.csv"`
      }
    })

  } catch (error) {
    console.error('Error exporting audit logs:', error)
    return NextResponse.json({ 
      error: 'Failed to export audit logs',
      ...createErrorResponse('Terjadi kesalahan', error) 
    }, { status: 500 })
  }
}
