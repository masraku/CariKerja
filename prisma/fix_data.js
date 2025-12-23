const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Starting migration...')

  // 1. Set all isActive=true jobs to status='ACTIVE' if they are currently pending
  // logic: if it was active in legacy system, it should be ACTIVE now.
  const activeJobs = await prisma.jobs.updateMany({
    where: {
      isActive: true,
      status: 'PENDING' // Update only if currently pending default
    },
    data: {
      status: 'ACTIVE'
    }
  })
  console.log(`✅ Updated ${activeJobs.count} jobs to ACTIVE status.`)

  // 2. Convert invalid JobTypes to FULL_TIME
  // Invalid types: CONTRACT, FREELANCE, INTERNSHIP (based on user request to keep only Fulltime/Parttime)
  const legacyTypes = ['CONTRACT', 'FREELANCE', 'INTERNSHIP']
  
  const updatedTypes = await prisma.jobs.updateMany({
    where: {
      jobType: {
        in: legacyTypes
      }
    },
    data: {
      jobType: 'FULL_TIME' // Defaulting to FULL_TIME as per plan
    }
  })
  console.log(`✅ Converted ${updatedTypes.count} legacy job types to FULL_TIME.`)

  // 3. Ensure isRemote is kept (no change needed as it's a boolean and separate field)
  
  console.log('🎉 Migration completed successfully.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
