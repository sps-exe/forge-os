import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'
import type { AchievementCategory } from '@forge/shared'

interface SeedAchievement {
  id: string
  title: string
  description: string
  category: AchievementCategory
  targetValue: number
}

const ALL_ACHIEVEMENTS: SeedAchievement[] = [
  {
    id: 'first-step',
    title: 'First Step',
    description: 'Complete your first daily task',
    category: 'HABIT',
    targetValue: 1,
  },
  {
    id: 'streak-7',
    title: 'Week Warrior',
    description: 'Maintain a 7-day coding streak',
    category: 'HABIT',
    targetValue: 7,
  },
  {
    id: 'leetcode-10',
    title: 'Problem Solver',
    description: 'Solve 10 LeetCode problems',
    category: 'PLATFORM',
    targetValue: 10,
  },
  {
    id: 'cf-pupil',
    title: 'Pupil Rank',
    description: 'Reach Pupil rank on Codeforces',
    category: 'CONTEST',
    targetValue: 1200,
  },
  {
    id: 'xp-1000',
    title: 'Leveling Up',
    description: 'Earn 1,000 total XP',
    category: 'XP',
    targetValue: 1000,
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

  try {
    const unlockedRecords = await prisma.userAchievement.findMany({
      where: { userId: session.user.id },
    })

    const unlockedMap = new Map(
      unlockedRecords.map((r) => [r.achievementId, r.unlockedAt])
    )

    const achievements = ALL_ACHIEVEMENTS.map((seed) => {
      const unlockedAt = unlockedMap.get(seed.id) ?? null
      const earned = unlockedAt !== null
      const currentValue = earned ? seed.targetValue : 0
      const progress = earned ? 100 : 0

      return {
        id: seed.id,
        title: seed.title,
        description: seed.description,
        category: seed.category,
        earned,
        progress,
        currentValue,
        targetValue: seed.targetValue,
        unlockedAt,
      }
    })

    const earnedCount = achievements.filter((a) => a.earned).length
    const nextAchievement = achievements.find((a) => !a.earned) ?? null

    return NextResponse.json({
      success: true,
      data: {
        earnedCount,
        totalCount: achievements.length,
        nextAchievement,
        achievements,
      },
    })
  } catch (err) {
    console.error('Error fetching achievements:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch achievements' } },
      { status: 500 }
    )
  }
}
