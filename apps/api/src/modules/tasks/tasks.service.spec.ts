import { describe, expect, it, vi } from 'vitest'
import { TasksService } from './tasks.service'

function createPrismaMock() {
  const tx = {
    dailyTask: { update: vi.fn() },
    xpEvent: { create: vi.fn() },
  }

  return {
    tx,
    prisma: {
      codingAccount: { findMany: vi.fn().mockResolvedValue([]) },
      dailyTask: {
        upsert: vi.fn().mockResolvedValue({}),
        findMany: vi.fn().mockResolvedValue([]),
        findUnique: vi.fn(),
      },
      xpEvent: {
        aggregate: vi.fn().mockResolvedValue({ _sum: { amount: 0 } }),
      },
      notification: {
        findFirst: vi.fn().mockResolvedValue(null),
        create: vi.fn().mockResolvedValue({}),
      },
      $transaction: vi.fn(async (input) => {
        if (typeof input === 'function') return input(tx)
        return Promise.all(input)
      }),
    },
  }
}

describe('TasksService', () => {
  it('creates the prepared daily task set once per day', async () => {
    const { prisma } = createPrismaMock()
    const service = new TasksService(prisma as never)

    await service.ensureTodayTasks('user-1')

    expect(prisma.dailyTask.upsert).toHaveBeenCalledTimes(6)
    expect(prisma.dailyTask.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: {
          userId_type_date: expect.objectContaining({
            userId: 'user-1',
            type: 'LEETCODE_DAILY',
          }),
        },
      }),
    )
  })

  it('awards XP when a pending task is completed', async () => {
    const { prisma, tx } = createPrismaMock()
    const date = new Date('2026-07-25T00:00:00.000Z')
    prisma.dailyTask.findUnique.mockResolvedValue({
      id: 'task-1',
      userId: 'user-1',
      type: 'LEETCODE_DAILY',
      title: "Solve today's LeetCode problem",
      url: 'https://leetcode.com/problemset/',
      status: 'PENDING',
      date,
      createdAt: date,
      updatedAt: date,
    })
    prisma.dailyTask.findMany.mockResolvedValue([])

    const service = new TasksService(prisma as never)
    await service.updateStatus('user-1', 'task-1', 'COMPLETED')

    expect(tx.dailyTask.update).toHaveBeenCalledWith({
      where: { id: 'task-1' },
      data: expect.objectContaining({ status: 'COMPLETED' }),
    })
    expect(tx.xpEvent.create).toHaveBeenCalledWith({
      data: {
        userId: 'user-1',
        amount: 25,
        reason: 'Completed LeetCode Daily Task',
      },
    })
  })

  it('provides weak-topic recommendations in daily overview', async () => {
    const { prisma } = createPrismaMock()
    prisma.codingAccount.findMany.mockResolvedValue([
      {
        platform: 'CODEFORCES',
        stats: [{ rating: 1350, solvedCount: 120 }],
      },
      {
        platform: 'LEETCODE',
        stats: [{ rating: null, solvedCount: 45 }],
      },
    ])

    const service = new TasksService(prisma as never)
    const overview = await service.getToday('user-1')

    expect(overview.recommendations.length).toBeGreaterThan(0)
    expect(overview.recommendations[0].topic).toBe('Binary Search & Two Pointers')
  })
})
