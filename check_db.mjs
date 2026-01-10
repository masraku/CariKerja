import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

const aderama = await prisma.jobseekers.findFirst({
  where: { firstName: { contains: 'aderama', mode: 'insensitive' } },
  select: {
    firstName: true,
    isEmployed: true,
    isLookingForJob: true,
    applications: {
      include: {
        contract_workers: { select: { id: true, status: true } }
      }
    }
  }
});

const hasActiveContract = aderama.applications.some(app => 
  app.contract_workers && 
  app.contract_workers.length > 0 &&
  app.contract_workers.some(cw => cw.status === 'ACTIVE')
);

console.log('Database values:');
console.log('- isEmployed (DB):', aderama.isEmployed);
console.log('- isLookingForJob (DB):', aderama.isLookingForJob);
console.log('- hasActiveContract:', hasActiveContract);
console.log('');
console.log('Computed values (what API should return):');
console.log('- isEmployed:', hasActiveContract);
console.log('- isLookingForJob:', !hasActiveContract && (aderama.isLookingForJob ?? true));

await prisma.$disconnect();
