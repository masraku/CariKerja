const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAuthMe() {
  const email = 'laksmanarakho@gmail.com'
  
  const user = await prisma.users.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      role: true,
      status: true,
      recruiters: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          position: true,
          photoUrl: true,
          isVerified: true,
          companies: {
            select: {
              id: true,
              name: true,
              logo: true
            }
          }
        }
      }
    }
  })

  console.log('User:', JSON.stringify(user, null, 2))
}

checkAuthMe()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
