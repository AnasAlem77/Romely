import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const places = await prisma.place.findMany({
    where: { city: { slug: 'paris' } },
    select: { name: true },
  });
  
  places.forEach(p => console.log(`- ${p.name}`));
}

main()
  .finally(async () => await prisma.$disconnect());