const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function migratePhotoToLogo() {
  const companyId = 'cmi966k88001605m0byzixien'
  
  // Get recruiter photo URL
  const recruiter = await prisma.recruiters.findFirst({
    where: { companyId },
    select: { photoUrl: true }
  })

  console.log('Recruiter photo URL:', recruiter?.photoUrl)

  if (recruiter?.photoUrl) {
    // Update company logo with recruiter photo URL
    await prisma.companies.update({
      where: { id: companyId },
      data: { logo: recruiter.photoUrl }
    })
    console.log('✅ Successfully copied photo to company logo!')
  } else {
    console.log('❌ No photo to migrate')
  }

  // Verify
  const company = await prisma.companies.findUnique({
    where: { id: companyId },
    select: { logo: true }
  })
  console.log('Company logo after migration:', company.logo)
}

migratePhotoToLogo()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
