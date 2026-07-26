import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

const ALL_ACHIEVEMENTS = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Complete your first daily task',
    xp: 50,
  },
  {
    id: 'leetcode-10',
    title: 'Problem Solver',
    description: 'Solve 10 LeetCode problems',
    xp: 150,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day coding streak',
    xp: 300,
  },
  {
    id: 'cf-pupil',
    title: 'Pupil Rank',
    description: 'Reach Pupil rank on Codeforces',
    xp: 500,
  },
]

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const unlockedRecords = await prisma.userAchievement.findMany({
    where: { userId: session.user.id },
  })

  const unlockedIds = new Set(unlockedRecords.map((a) => a.achievementId))

  const unlocked = ALL_ACHIEVEMENTS.filter((a) => unlockedIds.has(a.id))
  const available = ALL_ACHIEVEMENTS.filter((a) => !unlockedIds.has(a.id))

  return NextResponse.json({
    success: true,
    data: {
      unlocked,
      available,
    },
  })
}
