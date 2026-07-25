import { PrismaClient, Platform } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@forge.dev' },
    update: {},
    create: {
      email: 'demo@forge.dev',
      name: 'Demo Developer',
      profile: {
        create: {
          displayName: 'Demo Developer',
          bio: 'Grinding DSA one day at a time.',
          timezone: 'Asia/Kolkata',
        },
      },
      codingAccounts: {
        create: [
          { platform: Platform.LEETCODE, handle: 'demo_lc' },
          { platform: Platform.CODEFORCES, handle: 'tourist' },
        ],
      },
      xpEvents: {
        create: [
          { amount: 25, reason: 'LEETCODE_DAILY' },
          { amount: 15, reason: 'GITHUB_CONTRIBUTION' },
        ],
      },
    },
  })

  console.log(`Seeded demo user: ${user.email}`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
