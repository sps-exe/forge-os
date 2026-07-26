import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

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
      progress: 0,
      total: 5,
      xpReward: 200,
    },
    {
      id: 'q-2',
      title: 'Participate in 1 Codeforces Contest',
      description: 'Test your speed and competitive programming rating',
      progress: 0,
      total: 1,
      xpReward: 300,
    },
    {
      id: 'q-3',
      title: 'Maintain a 5-day streak',
      description: 'Consistently complete at least one daily task for 5 days',
      progress: 0,
      total: 5,
      xpReward: 250,
    },
  ]

  const completedQuestIds = new Set(userQuests.map((q) => q.questId))

  const quests = DEFAULT_QUESTS.map((q) => ({
    ...q,
    completed: completedQuestIds.has(q.id),
  }))

  return NextResponse.json({
    success: true,
    data: {
      quests,
    },
  })
}
