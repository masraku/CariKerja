const { PrismaClient } = require('./app/generated/prisma');
const prisma = new PrismaClient();

async function check() {
  const workers = await prisma.contract_workers.findMany({
    select: { id: true, status: true, terminatedAt: true, jobTitle: true }
  });
  console.log('Contract Workers:', JSON.stringify(workers, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  
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
  console.log('Aderama applications:', JSON.stringify(aderama?.applications, (k, v) => typeof v === 'bigint' ? v.toString() : v, 2));
  
  await prisma.$disconnect();
}
check();
