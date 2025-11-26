const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkUser() {
  const email = 'laksmanarakho@gmail.com'
  
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

  if (!user || !user.recruiters[0]) {
    console.log('User or recruiter not found')
    return
  }

  const recruiter = user.recruiters[0]
  console.log('Companies Type:', typeof recruiter.companies)
  console.log('Is Array:', Array.isArray(recruiter.companies))
  console.log('Companies Value:', JSON.stringify(recruiter.companies, null, 2))
}

checkUser()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
