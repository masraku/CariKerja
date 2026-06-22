const { PrismaClient } = require('@prisma/client')
const argon2 = require('argon2')
const crypto = require('crypto')

const prisma = new PrismaClient()

function out(line = '') {
  process.stdout.write(String(line) + '\n')
}

/**
 * Generate a secure random password
 * @returns {string} A 24-character random password
 */
function generateSecurePassword() {
  return crypto.randomBytes(18).toString('base64url')
}

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.users.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      out(`✅ Admin user already exists: ${existingAdmin.email}`)
      return
    }

    // Use env var or generate a secure random password
    const password = process.env.ADMIN_PASSWORD || generateSecurePassword()
    const hashedPassword = await argon2.hash(password)
    
    const admin = await prisma.users.create({
      data: {
        id: crypto.randomUUID(),
        email: 'admin@jobseeker.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    })

    out('✅ Admin user created successfully!')
    out(`📧 Email: ${admin.email}`)
    out(`🔑 Password: ${password}`)
    out('')
    out('⚠️  IMPORTANT: Change this password immediately after first login!')
    out('⚠️  Store it securely — it will NOT be shown again.')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
