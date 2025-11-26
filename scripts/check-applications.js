// Quick Database Check Script
// Run this in Prisma Studio console or create a test endpoint

// Check if applications exist
const applications = await prisma.applications.findMany({
  include: {
    jobseeker: {
      include: {
        user: true
      }
    },
    job: true
  },
  orderBy: {
    createdAt: 'desc'
  },
  take: 5
})

console.log('Total applications:', applications.length)
console.log('Applications:', JSON.stringify(applications, null, 2))

// Check specific jobseeker
const jobseeker = await prisma.jobSeeker.findFirst({
  where: {
    user: {
      email: 'masendra0303@gmail.com' // dari log
    }
  },
  include: {
    applications: {
      include: {
        job: true
      }
    }
  }
})

console.log('Jobseeker applications:', jobseeker?.applications?.length || 0)

// Check if interview exists
const interviews = await prisma.interview.findMany({
  include: {
    participants: {
      include: {
        application: {
          include: {
            jobseeker: {
              include: {
                user: true
              }
            }
          }
        }
      }
    }
  }
})

console.log('Total interviews:', interviews.length)
