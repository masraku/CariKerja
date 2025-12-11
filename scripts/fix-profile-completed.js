// Script to fix profileCompleted flag for existing users
// Run this with: node scripts/fix-profile-completed.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixProfileCompleted() {
  try {
    console.log('🔍 Finding jobseekers with profiles...')
    
    // Get all jobseekers
    const jobseekers = await prisma.jobseekers.findMany({
      include: {
        educations: true,
        work_experiences: true,
        jobseeker_skills: true,
        certifications: true,
      }
    })

    console.log(`Found ${jobseekers.length} jobseekers`)

    let updatedCount = 0

    for (const jobseeker of jobseekers) {
      // Calculate completeness
      const totalFields = 15
      let filledFields = 0
      
      if (jobseeker.photo) filledFields++
      if (jobseeker.firstName && jobseeker.lastName) filledFields++
      if (jobseeker.dateOfBirth) filledFields++
      if (jobseeker.gender) filledFields++
      if (jobseeker.religion) filledFields++
      if (jobseeker.phone) filledFields++
      if (jobseeker.address && jobseeker.city && jobseeker.province) filledFields++
      if (jobseeker.summary) filledFields++
      if (jobseeker.cvUrl) filledFields++
      if (jobseeker.educations && jobseeker.educations.length > 0) filledFields++
      if (jobseeker.work_experiences && jobseeker.work_experiences.length > 0) filledFields++
      if (jobseeker.jobseeker_skills && jobseeker.jobseeker_skills.length > 0) filledFields++
      if (jobseeker.desiredJobTitle) filledFields++
      if (jobseeker.desiredSalaryMin && jobseeker.desiredSalaryMax) filledFields++
      if (jobseeker.preferredJobType) filledFields++
      
      const completeness = Math.round((filledFields / totalFields) * 100)
      const shouldBeCompleted = completeness >= 70

      // Update if needed
      if (jobseeker.profileCompleted !== shouldBeCompleted || jobseeker.profileCompleteness !== completeness) {
        await prisma.jobseekers.update({
          where: { id: jobseeker.id },
          data: {
            profileCompleted: shouldBeCompleted,
            profileCompleteness: completeness
          }
        })

        console.log(`✅ Updated: ${jobseeker.firstName} ${jobseeker.lastName} - ${completeness}% (${shouldBeCompleted ? 'COMPLETED' : 'INCOMPLETE'})`)
        updatedCount++
      } else {
        console.log(`⏭️  Skipped: ${jobseeker.firstName} ${jobseeker.lastName} - ${completeness}% (already correct)`)
      }
    }

    console.log(`\n🎉 Done! Updated ${updatedCount} jobseeker profiles`)
    
    // Do the same for recruiters
    console.log('\n🔍 Finding recruiters...')
    const recruiters = await prisma.recruiters.findMany()
    
    console.log(`Found ${recruiters.length} recruiters`)
    
    let recruiterUpdatedCount = 0
    
    for (const recruiter of recruiters) {
      // For recruiters, we don't auto-verify them. Leave isVerified as manual verification
      // Just log their status
      console.log(`⏭️  Recruiter: ${recruiter.firstName} ${recruiter.lastName} - isVerified: ${recruiter.isVerified}`)
    }

    console.log(`\n✅ Checked ${recruiters.length} recruiter profiles (manual verification required)`)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixProfileCompleted()
