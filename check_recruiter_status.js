const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkRecruiterStatus() {
    try {
        // Get all recruiters with their user and company info
        const recruiters = await prisma.recruiters.findMany({
            include: {
                users: {
                    select: {
                        email: true,
                        role: true,
                        status: true
                    }
                },
                companies: {
                    select: {
                        name: true,
                        slug: true
                    }
                }
            }
        })

        console.log('\n📊 RECRUITER STATUS REPORT\n')
        console.log('=' .repeat(80))
        
        recruiters.forEach((recruiter, index) => {
            console.log(`\n${index + 1}. ${recruiter.firstName} ${recruiter.lastName}`)
            console.log(`   Email: ${recruiter.users.email}`)
            console.log(`   User Status: ${recruiter.users.status}`)
            console.log(`   Is Verified: ${recruiter.isVerified}`)
            console.log(`   Has Company: ${recruiter.companyId ? 'Yes' : 'No'}`)
            if (recruiter.companies) {
                console.log(`   Company: ${recruiter.companies.name} (${recruiter.companies.slug})`)
            }
            console.log(`   Position: ${recruiter.position || 'N/A'}`)
            console.log(`   Department: ${recruiter.department || 'N/A'}`)
        })
        
        console.log('\n' + '='.repeat(80))
        console.log(`\nTotal Recruiters: ${recruiters.length}`)
        console.log(`Verified: ${recruiters.filter(r => r.isVerified).length}`)
        console.log(`With Company: ${recruiters.filter(r => r.companyId).length}`)
        console.log(`Should Redirect to Dashboard: ${recruiters.filter(r => r.isVerified && r.companyId).length}`)
        
    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

checkRecruiterStatus()
