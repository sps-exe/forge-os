import { describe, expect, it, vi } from 'vitest'
import { AchievementsService } from './achievements.service'

function createPrismaMock() {
  return {
    codingAccount: {
      findMany: vi.fn().mockResolvedValue([
        {
          platform: 'LEETCODE',
          stats: [{ solvedCount: 75, rating: null, streak: null }],
        },
        {
          platform: 'CODEFORCES',
          stats: [{ solvedCount: null, rating: 1420, streak: null }],
        },
        {
          platform: 'GITHUB',
          stats: [{ solvedCount: null, rating: null, streak: 4 }],
        },
      ]),
    },
    xpEvent: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 125 } }),
    },
    dailyTask: {
      count: vi.fn().mockResolvedValue(8),
      findMany: vi.fn(),
    },
    userAchievement: {
      findMany: vi.fn().mockResolvedValue([]),
      upsert: vi.fn().mockResolvedValue({}),
    },
    notification: {
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
  }
}

describe('AchievementsService', () => {
  it('computes earned and next achievements from user metrics', async () => {
    const prisma = createPrismaMock()
    const today = new Date()
    const todayUtc = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    )

    prisma.dailyTask.findMany
      .mockResolvedValueOnce([
        { date: todayUtc, status: 'COMPLETED' },
        { date: todayUtc, status: 'PENDING' },
      ])
      .mockResolvedValueOnce([{ status: 'COMPLETED' }, { status: 'COMPLETED' }])

    const service = new AchievementsService(prisma as never)
    const overview = await service.getOverview('user-1')

    expect(overview.totalCount).toBeGreaterThan(0)
    expect(overview.earnedCount).toBeGreaterThan(0)
    expect(overview.achievements.find((a) => a.id === 'platform-trio')?.earned).toBe(true)
    expect(overview.achievements.find((a) => a.id === 'leetcode-50')?.earned).toBe(true)
    expect(overview.achievements.find((a) => a.id === 'xp-500')?.earned).toBe(false)
    expect(overview.nextAchievement?.earned).toBe(false)
  })

  it('persists newly earned achievements and creates notifications', async () => {
    const prisma = createPrismaMock()
    const today = new Date()
    const todayUtc = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    )

    prisma.dailyTask.findMany
      .mockResolvedValueOnce([{ date: todayUtc, status: 'COMPLETED' }])
      .mockResolvedValueOnce([{ status: 'COMPLETED' }])

    const service = new AchievementsService(prisma as never)
    await service.getOverview('user-1')

    // $transaction should have been called with upserts + notifications for newly earned badges
    expect(prisma.$transaction).toHaveBeenCalled()
  })

  it('returns unlockedAt from existing UserAchievement rows', async () => {
    const prisma = createPrismaMock()
    const today = new Date()
    const todayUtc = new Date(
      Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), today.getUTCDate()),
    )
    const unlockedAt = new Date('2024-01-15T10:00:00Z')

    prisma.userAchievement.findMany.mockResolvedValue([
      { achievementId: 'platform-trio', unlockedAt },
    ])

    prisma.dailyTask.findMany
      .mockResolvedValueOnce([{ date: todayUtc, status: 'COMPLETED' }])
      .mockResolvedValueOnce([{ status: 'COMPLETED' }])

    const service = new AchievementsService(prisma as never)
    const overview = await service.getOverview('user-1')
    const trioAchievement = overview.achievements.find((a) => a.id === 'platform-trio')

    expect(trioAchievement?.unlockedAt).toEqual(unlockedAt)
  })
})

