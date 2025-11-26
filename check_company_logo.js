const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkCompanyLogo() {
  const companyId = 'cmi966k88001605m0byzixien'
  
  const company = await prisma.companies.findUnique({
    where: { id: companyId },
    select: {
      name: true,
      logo: true,
      bio: true,
      description: true,
      culture: true,
      benefits: true,
      gallery: true
    }
  })

  console.log('Company Logo:', company.logo)
  console.log('Company Bio:', company.bio)
  console.log('Company Description:', company.description)
  console.log('Company Culture:', company.culture)
  console.log('Company Benefits:', company.benefits)
  console.log('Company Gallery:', company.gallery)
}

checkCompanyLogo()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
