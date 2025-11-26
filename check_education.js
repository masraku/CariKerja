const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkData() {
  try {
    const email = 'masendra0303@gmail.com'; // User's email from previous context
    
    console.log(`🔍 Checking data for ${email}...`);
    
    const user = await prisma.users.findUnique({
      where: { email },
      include: {
        jobseekers: {
          include: {
            educations: true,
            work_experiences: true,
            jobseeker_skills: true,
            certifications: true
          }
        }
      }
    });

    if (!user) {
      console.log('❌ User not found');
      return;
    }

    if (!user.jobseekers) {
      console.log('❌ Jobseeker profile not found');
      return;
    }

    console.log('✅ Jobseeker found:', user.jobseekers.id);
    console.log('🎓 Educations count:', user.jobseekers.educations.length);
    console.log('🎓 Educations data:', JSON.stringify(user.jobseekers.educations, null, 2));
    
    console.log('💼 Work Experiences count:', user.jobseekers.work_experiences.length);
    console.log('🛠 Skills count:', user.jobseekers.jobseeker_skills.length);

  } catch (error) {
    console.error('💥 Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkData();
