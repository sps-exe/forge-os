const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const accounts = await prisma.codingAccount.findMany({ where: { platform: 'LEETCODE' } });
  for (const acc of accounts) {
    console.log('Handle:', acc.handle);
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/userProfile/${acc.handle}`);
    const data = await res.json();
    console.log('Alfa totalSolved:', data.totalSolved);
  }
}
main().finally(() => prisma.$disconnect());
