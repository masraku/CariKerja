const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
  const email = 'laksmanarakho@gmail.com'
  console.log(`Checking user: ${email}`)

  const user = await prisma.users.findUnique({
    where: { email },
    include: {
      recruiters: {
        include: {
          companies: true
        }
      }
    }
  })

  if (!user) {
    console.log('User not found')
    return
  }

  console.log('User found:', user.id)
  console.log('Recruiters:', JSON.stringify(user.recruiters, null, 2))
}

checkUser()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
