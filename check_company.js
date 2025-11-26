const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkCompany() {
  const companyId = 'cmi966k88001605m0byzixien'
  console.log(`Checking company: ${companyId}`)

  const company = await prisma.companies.findUnique({
    where: { id: companyId }
  })

  if (!company) {
    console.log('❌ Company NOT found!')
  } else {
    console.log('✅ Company found:', company.name)
  }
}

checkCompany()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
