const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyRecruiter() {
    try {
        // Find recruiter by email
        const user = await prisma.users.findUnique({
            where: { email: 'laksmanarakho@gmail.com' },
            include: { recruiters: true }
        })

        if (!user) {
            console.log('❌ User not found')
            return
        }

        if (user.role !== 'RECRUITER') {
            console.log('❌ User is not a recruiter')
            return
        }

        const recruiter = user.recruiters[0] || user.recruiters

        if (!recruiter) {
            console.log('❌ Recruiter profile not found')
            return
        }

        console.log('\n📋 Current Status:')
        console.log(`   Name: ${recruiter.firstName} ${recruiter.lastName}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Is Verified: ${recruiter.isVerified}`)
        console.log(`   Company ID: ${recruiter.companyId || 'None'}`)

        // Update to verified
        const updated = await prisma.recruiters.update({
            where: { id: recruiter.id },
            data: { isVerified: true }
        })

        console.log('\n✅ Recruiter has been verified!')
        console.log(`   Is Verified: ${updated.isVerified}`)
        console.log('\n🎉 You can now login and will be redirected to dashboard!\n')

    } catch (error) {
        console.error('❌ Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

verifyRecruiter()
