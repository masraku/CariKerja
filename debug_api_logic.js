const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function debugApiLogic() {
  try {
    const email = 'masendra0303@gmail.com';
    const user = await prisma.users.findUnique({ where: { email } });
    
    if (!user) { console.log('User not found'); return; }
    
    const userId = user.id;
    console.log('User ID:', userId);

    // Replicating API Logic
    const profile = await prisma.jobseekers.findUnique({
      where: { userId: userId },
      include: {
        educations: {
          orderBy: {
            startDate: 'desc'
          }
        },
        work_experiences: {
          orderBy: {
            startDate: 'desc'
          }
        },
        jobseeker_skills: {
          include: {
            skills: true
          }
        },
        certifications: {
          orderBy: {
            issueDate: 'desc'
          }
        }
      }
    })

    if (!profile) {
      console.log('Profile not found');
      return;
    }

    console.log('Raw Profile found. Keys:', Object.keys(profile));
    console.log('Personal Info:', {
        firstName: profile.firstName,
        lastName: profile.lastName,
        email: profile.email,
        phone: profile.phone,
        dateOfBirth: profile.dateOfBirth
    });
    console.log('Work Experiences:', profile.work_experiences?.length);
    console.log('Skills:', profile.jobseeker_skills?.length);

    // Replicating Transformation Logic
    try {
        const transformedProfile = {
          ...profile,
          skills: profile.jobseeker_skills.map(js => ({
            id: js.id,
            name: js.skills.name,
            proficiencyLevel: js.proficiencyLevel,
            yearsOfExperience: js.yearsOfExperience
          }))
        }
        console.log('✅ Transformation successful');
        console.log('Transformed Skills:', transformedProfile.skills);
    } catch (err) {
        console.error('❌ Transformation failed:', err);
    }

  } catch (error) {
    console.error('💥 Prisma Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

debugApiLogic();
