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

  if (!user) {
    console.log('User not found')
    return
  }

  const recruiter = user.recruiters[0]
  console.log('Recruiter ID:', recruiter.id)
  console.log('Recruiter PhotoURL:', recruiter.photoUrl)
  console.log('Company Name:', recruiter.companies[0]?.name)
  console.log('Company Logo:', recruiter.companies[0]?.logo)
}

checkUser()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
