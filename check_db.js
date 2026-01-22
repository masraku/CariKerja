const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function check() {
  const workers = await prisma.contract_workers.findMany({
    select: { id: true, status: true, terminatedAt: true, jobTitle: true }
  });
  
  const aderama = await prisma.jobseekers.findFirst({
    where: { firstName: { contains: 'aderama', mode: 'insensitive' } },
    include: {
      applications: {
        include: {
          contract_workers: { select: { id: true, status: true } }
        }
      }
    }
  });
  
  await prisma.$disconnect();
}
check();
