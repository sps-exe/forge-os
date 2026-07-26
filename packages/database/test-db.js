const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const accounts = await prisma.codingAccount.findMany({ where: { platform: 'LEETCODE' } });
  console.log(accounts);
}
main().finally(() => prisma.$disconnect());
