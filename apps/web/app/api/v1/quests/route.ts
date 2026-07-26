import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'
import type { QuestCategory } from '@forge/shared'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const userQuests = await prisma.userQuest.findMany({
    where: { userId: session.user.id },
  })

  const DEFAULT_QUESTS = [
    {
      id: 'q-1',
      title: 'Solve 5 LeetCode Mediums',
      description: 'Sharpen your algorithmic problem solving skills',
      category: 'PLATFORM' as QuestCategory,
      progress: 0,
      currentValue: 0,
      targetValue: 5,
      xpReward: 200,
    },
    {
      id: 'q-2',
      title: 'Participate in 1 Codeforces Contest',
      description: 'Test your speed and competitive programming rating',
      category: 'PLATFORM' as QuestCategory,
      progress: 0,
      currentValue: 0,
      targetValue: 1,
      xpReward: 300,
    },
    {
      id: 'q-3',
      title: 'Maintain a 5-day streak',
      description: 'Consistently complete at least one daily task for 5 days',
      category: 'STREAK' as QuestCategory,
      progress: 40,
      currentValue: 2,
      targetValue: 5,
      xpReward: 250,
    },
  ]

  const completedQuestIds = new Set(userQuests.map((q) => q.questId))
  const completedDateMap = new Map(userQuests.map(q => [q.questId, q.completedAt]))

  const quests = DEFAULT_QUESTS.map((q) => {
    const completed = completedQuestIds.has(q.id)
    return {
      ...q,
      completed,
      completedAt: completed ? (completedDateMap.get(q.id) || new Date()).toISOString() : null,
      progress: completed ? 100 : q.progress,
      currentValue: completed ? q.targetValue : q.currentValue,
    }
  })

  const completedCount = quests.filter(q => q.completed).length
  const totalCount = quests.length
  const totalXpAvailable = quests.reduce((sum, q) => sum + q.xpReward, 0)
  const totalXpEarned = quests.filter(q => q.completed).reduce((sum, q) => sum + q.xpReward, 0)

  // Current week key
  const now = new Date()
  const weekStart = new Date(now)
  weekStart.setDate(now.getDate() - now.getDay())
  const weekKey = `${weekStart.getFullYear()}-W${Math.ceil((now.getDate() - now.getDay()) / 7)}`
  const daysRemaining = 7 - now.getDay()

  return NextResponse.json({
    success: true,
    data: {
      weekKey,
      daysRemaining,
      completedCount,
      totalCount,
      totalXpAvailable,
      totalXpEarned,
      quests,
    },
  })
}
