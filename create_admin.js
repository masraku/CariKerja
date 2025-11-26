const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function createAdmin() {
  try {
    // Check if admin already exists
    const existingAdmin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })

    if (existingAdmin) {
      console.log('✅ Admin user already exists:', existingAdmin.email)
      return
    }

    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10)
    
    const admin = await prisma.user.create({
      data: {
        email: 'admin@jobseeker.com',
        password: hashedPassword,
        role: 'ADMIN',
        status: 'ACTIVE'
      }
    })

    console.log('✅ Admin user created successfully!')
    console.log('📧 Email:', admin.email)
    console.log('🔑 Password: admin123')
    console.log('')
    console.log('⚠️  IMPORTANT: Change this password after first login!')
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createAdmin()
