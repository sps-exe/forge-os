import { describe, expect, it, vi } from 'vitest'
import { QuestsService } from './quests.service'

function createPrismaMock() {
  return {
    codingAccount: {
      findMany: vi.fn().mockResolvedValue([
        { platform: 'LEETCODE' },
        { platform: 'CODEFORCES' },
      ]),
    },
    xpEvent: {
      aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 250 } }),
      create: vi.fn().mockResolvedValue({}),
    },
    dailyTask: {
      count: vi.fn().mockResolvedValue(12),
      findMany: vi.fn().mockResolvedValue([
        { date: new Date(), status: 'COMPLETED' },
      ]),
    },
    userQuest: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockResolvedValue({}),
    },
    notification: {
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
  }
}

describe('QuestsService', () => {
  it('computes weekly quest overview with progress and rewards', async () => {
    const prisma = createPrismaMock()
    const service = new QuestsService(prisma as never)
    const overview = await service.getOverview('user-1')

    expect(overview.weekKey).toContain('W')
    expect(overview.totalCount).toBe(4)
    expect(overview.totalXpAvailable).toBe(450)
    expect(overview.quests.length).toBe(4)
    expect(overview.completedCount).toBeGreaterThan(0)
  })

  it('persists newly completed quests, awards XP, and creates notifications', async () => {
    const prisma = createPrismaMock()
    const service = new QuestsService(prisma as never)
    await service.getOverview('user-1')

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.userQuest.create).toHaveBeenCalled()
    expect(prisma.xpEvent.create).toHaveBeenCalled()
    expect(prisma.notification.create).toHaveBeenCalled()
  })

  it('honors existing completed quests without duplicate persistence', async () => {
    const prisma = createPrismaMock()
    prisma.userQuest.findMany.mockResolvedValue([
      { questId: 'weekly-task-master', completedAt: new Date(), xpAwarded: 150 },
      { questId: 'weekly-xp-surge', completedAt: new Date(), xpAwarded: 100 },
      { questId: 'weekly-streak-keeper', completedAt: new Date(), xpAwarded: 120 },
      { questId: 'weekly-polyglot', completedAt: new Date(), xpAwarded: 80 },
    ])

    const service = new QuestsService(prisma as never)
    const overview = await service.getOverview('user-1')

    expect(overview.completedCount).toBe(4)
    expect(prisma.$transaction).not.toHaveBeenCalled()
  })
})
