// Run: node scripts/fix-profiles.js
// This will auto-create missing JobSeeker and Recruiter profiles

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixProfiles() {
  console.log('🔧 Starting profile fix...\n')

  try {
    // 1. Find users without JobSeeker profile
    const jobseekersWithoutProfile = await prisma.users.findMany({
      where: {
        role: 'JOBSEEKER',
        jobseekers: null
      }
    })

    console.log(`Found ${jobseekersWithoutProfile.length} jobseekers without profile`)

    // Create missing profiles
    for (const user of jobseekersWithoutProfile) {
      await prisma.jobseekers.create({
        data: {
          id: require('crypto').randomUUID(),
          userId: user.id,
          firstName: '',
          lastName: '',
          profileCompleted: false,
          profileCompleteness: 0,
          updatedAt: new Date()
        }
      })
      console.log(`✅ Created jobseeker profile for: ${user.email}`)
    }

    // 2. Find users without Recruiter profile
    const recruitersWithoutProfile = await prisma.users.findMany({
      where: {
        role: 'RECRUITER',
        recruiters: null
      },
      include: {
        recruiters: true
      }
    })

    console.log(`\nFound ${recruitersWithoutProfile.length} recruiters without profile`)

    if (recruitersWithoutProfile.length > 0) {
      console.log('⚠️  Recruiters need manual fix - they require a companyId')
      console.log('Run the recruiter registration/onboarding flow for these users:')
      recruitersWithoutProfile.forEach(u => console.log(`  - ${u.email}`))
    }

    // 3. Check for duplicate profiles
    const duplicateJobseekers = await prisma.$queryRaw`
      SELECT "userId", COUNT(*) as count
      FROM jobseekers
      GROUP BY "userId"
      HAVING COUNT(*) > 1
    `

    if (duplicateJobseekers.length > 0) {
      console.log(`\n⚠️  Found ${duplicateJobseekers.length} users with duplicate JobSeeker profiles!`)
      console.log('This needs manual investigation.')
      console.log('Check: /scripts/fix-profile-data.sql for SQL to remove duplicates')
    }

    // 4. Summary
    console.log('\n📊 Summary:')
    const totalJobseekers = await prisma.jobseekers.count()
    const totalRecruiters = await prisma.recruiters.count()
    const totalApplications = await prisma.applications.count()
    
    console.log(`  JobSeekers: ${totalJobseekers}`)
    console.log(`  Recruiters: ${totalRecruiters}`)
    console.log(`  Applications: ${totalApplications}`)

    console.log('\n✅ Profile fix completed!')

  } catch (error) {
    console.error('❌ Error fixing profiles:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProfiles()
