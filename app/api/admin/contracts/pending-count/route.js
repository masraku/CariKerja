import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/authHelper'

// GET /api/admin/contracts/pending-count - Get count of pending contracts
export async function GET(request) {
  try {
    const auth = await requireAdmin(request)
    if (auth.error) {
      return NextResponse.json({ error: auth.error }, { status: auth.status })
    }

    const count = await prisma.contract_registrations.count({
      where: {
        status: 'PENDING'
      }
    })

    return NextResponse.json({ count })
  } catch (error) {
    console.error('Error fetching pending contracts count:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
