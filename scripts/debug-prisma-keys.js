const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugPrisma() {
  console.log('Prisma keys:', Object.keys(prisma))
  console.log('Does jobSeeker exist?', !!prisma.jobSeeker)
  console.log('Does jobseeker exist?', !!prisma.jobseeker)
  console.log('Does JobSeeker exist?', !!prisma.JobSeeker)
  
  if (prisma.jobSeeker) {
    console.log('jobSeeker keys:', Object.keys(prisma.jobSeeker))
  }
}

debugPrisma()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
