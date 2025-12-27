
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const jobs = await prisma.jobs.findMany({
    select: { id: true, title: true, isActive: true, createdAt: true }
  });
  console.log(JSON.stringify(jobs, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
