const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkJobseekerData() {
  try {
    console.log('🔍 Checking all jobseekers in database...\n')
    
    const jobseekers = await prisma.jobseekers.findMany({
      include: {
        users: {
          select: {
            email: true,
            role: true,
            status: true
          }
        },
        educations: true,
        work_experiences: true,
        applications: {
          select: {
            id: true,
            status: true,
            appliedAt: true,
            jobs: {
              select: {
                title: true
              }
            }
          }
        }
      }
    })
    
    console.log(`Found ${jobseekers.length} jobseeker(s)\n`)
    
    for (const js of jobseekers) {
      console.log('==========================================')
      console.log('👤 Jobseeker:', js.firstName, js.lastName)
      console.log('📧 Email:', js.users?.email)
      console.log('📸 Photo:', js.photo || '(no photo)')
      console.log('📊 Profile Completeness:', js.profileCompleteness + '%')
      console.log('🎓 Education count:', js.educations?.length || 0)
      console.log('💼 Work Experience count:', js.work_experiences?.length || 0)
      console.log('📝 Applications count:', js.applications?.length || 0)
      
      if (js.applications && js.applications.length > 0) {
        console.log('\n📋 Recent Applications:')
        js.applications.slice(0, 3).forEach(app => {
          console.log(`  - ${app.jobs?.title} (${app.status})`)
        })
      }
      
      console.log('==========================================\n')
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  } finally {
    await prisma.$disconnect()
  }
}

checkJobseekerData()
