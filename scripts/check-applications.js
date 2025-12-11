// Quick Database Check Script
// Run this in Prisma Studio console or create a test endpoint

// Check if applications exist
const applications = await prisma.applications.findMany({
  include: {
    jobseekers: {
      include: {
        users: true
      }
    },
    jobs: true
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 5
})

console.log('Total applications:', applications.length)
console.log('Applications:', JSON.stringify(applications, null, 2))

// Check specific jobseeker
const jobseeker = await prisma.jobseekers.findFirst({
  where: {
    users: {
      email: 'masendra0303@gmail.com' // dari log
    }
  },
  include: {
    applications: {
      include: {
        jobs: true
      }
    }
  }
})

console.log('Jobseeker applications:', jobseeker?.applications?.length || 0)

// Check if interview exists
const interviews = await prisma.interviews.findMany({
  include: {
    interview_participants: {
      include: {
        applications: {
          include: {
            jobseekers: {
              include: {
                users: true
              }
            }
          }
        }
      }
    }
  }
})

console.log('Total interviews:', interviews.length)
