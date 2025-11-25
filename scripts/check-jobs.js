const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkJobs() {
  try {
    // Check all jobs
    const allJobs = await prisma.job.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        isActive: true,
        company: {
          select: {
            name: true
          }
        }
      },
      take: 10
    })

    console.log('Total jobs in database:', allJobs.length)
    console.log('\nAll Jobs:')
    console.log(JSON.stringify(allJobs, null, 2))

    // Check published jobs
    const publishedJobs = await prisma.job.findMany({
      where: {
        isActive: true,
        publishedAt: { not: null }
      },
      select: {
        id: true,
        title: true,
        slug: true,
        publishedAt: true,
        company: {
          select: {
            name: true
          }
        }
      }
    })

    console.log('\n\nPublished & Active Jobs:', publishedJobs.length)
    console.log(JSON.stringify(publishedJobs, null, 2))

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkJobs()
