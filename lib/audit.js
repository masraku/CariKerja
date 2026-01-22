import { prisma } from '@/lib/prisma'
import { v4 as uuidv4 } from 'uuid'

/**
 * Create an audit log entry
 * @param {Object} params
 * @param {string} params.action - Action type (LOGIN, LOGOUT, CREATE_JOB, etc.)
 * @param {string} [params.userId] - User ID who performed the action
 * @param {string} [params.userRole] - User role (ADMIN, RECRUITER, JOBSEEKER)
 * @param {string} [params.targetType] - Target entity type (job, company, user, etc.)
 * @param {string} [params.targetId] - Target entity ID
 * @param {Object} [params.changes] - Changes made (before/after or details)
 * @param {Request} [params.request] - Request object for IP and user agent
 */
export async function createAuditLog({
  action,
  userId = null,
  userRole = null,
  targetType = null,
  targetId = null,
  changes = null,
  request = null
}) {
  try {
    const ipAddress = request?.headers?.get('x-forwarded-for')?.split(',')[0] 
      ?? request?.headers?.get('x-real-ip') 
      ?? null
    const userAgent = request?.headers?.get('user-agent') ?? null

    await prisma.audit_logs.create({
      data: {
        id: uuidv4(),
        action,
        userId,
        userRole,
        targetType,
        targetId,
        changes: changes ? JSON.parse(JSON.stringify(changes)) : null,
        ipAddress,
        userAgent
      }
    })
  } catch (error) {
    // Don't fail the main request if audit logging fails
    console.error('Audit log error:', error)
  }
}

// Common action types
export const AuditAction = {
  // Auth
  LOGIN: 'LOGIN',
  LOGIN_FAILED: 'LOGIN_FAILED',
  LOGOUT: 'LOGOUT',
  REGISTER: 'REGISTER',
  
  // Admin
  VERIFY_COMPANY: 'VERIFY_COMPANY',
  REJECT_COMPANY: 'REJECT_COMPANY',
  APPROVE_CONTRACT: 'APPROVE_CONTRACT',
  REJECT_CONTRACT: 'REJECT_CONTRACT',
  APPROVE_JOB: 'APPROVE_JOB',
  REJECT_JOB: 'REJECT_JOB',
  
  // Jobs
  CREATE_JOB: 'CREATE_JOB',
  UPDATE_JOB: 'UPDATE_JOB',
  DELETE_JOB: 'DELETE_JOB',
  
  // Resignation
  SUBMIT_RESIGNATION: 'SUBMIT_RESIGNATION',
  APPROVE_RESIGNATION: 'APPROVE_RESIGNATION',
  REJECT_RESIGNATION: 'REJECT_RESIGNATION',
  
  // Contract
  CREATE_CONTRACT: 'CREATE_CONTRACT',
  TERMINATE_CONTRACT: 'TERMINATE_CONTRACT'
}
