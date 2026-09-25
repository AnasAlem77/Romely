const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const users = await prisma.user.findMany();
    console.log('✅ Successfully connected to the database! Current users:', users);
  } catch (error) {
    console.error('❌ Connection error occurred:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
