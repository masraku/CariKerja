const { PrismaClient } = require('@prisma/client')
const argon2 = require('argon2')

const prisma = new PrismaClient()

function out(line = '') {
  process.stdout.write(String(line) + '\n')
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

    // Create admin user
    const hashedPassword = await argon2.hash('admin123')
    
    const admin = await prisma.users.create({
      data: {
        id: require('crypto').randomUUID(),
        email: 'admin@jobseeker.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE',
        updatedAt: new Date()
      }
    })

    out('✅ Admin user created successfully!')
    out(`📧 Email: ${admin.email}`)
    out('🔑 Password: admin123')
    out('')
    out('⚠️  IMPORTANT: Change this password after first login!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
