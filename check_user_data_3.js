const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
  const email = 'laksmanarakho@gmail.com'
  
  const user = await prisma.users.findUnique({
    where: { email },
    include: {
      recruiters: true // Check if any recruiters exist
    }
  })

  if (!user) {
    console.log('User not found')
    return
  }

  console.log('User ID:', user.id)
  console.log('User Role:', user.role)
  console.log('Recruiters Array:', user.recruiters)
  
  // Also check recruiters table directly
  const recruiters = await prisma.recruiters.findMany({
    where: { userId: user.id }
  })
  console.log('Recruiters Table Check:', recruiters)
}

checkUser()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
