import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    select: { name: true }
  });
  console.log(places.map(p => p.name).join('\n'));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());