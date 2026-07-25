import { describe, expect, it, vi } from 'vitest'
import { RevisionService } from './revision.service'

function createPrismaMock() {
  return {
    revisionItem: {
      findMany: vi.fn().mockResolvedValue([]),
      create: vi.fn().mockImplementation(({ data }) => Promise.resolve({ id: 'rev-1', ...data, createdAt: new Date(), updatedAt: new Date() })),
      findUnique: vi.fn(),
      update: vi.fn().mockResolvedValue({}),
    },
    xpEvent: {
      create: vi.fn().mockResolvedValue({}),
    },
    $transaction: vi.fn().mockImplementation((ops: unknown[]) => Promise.all(ops)),
  }
}

describe('RevisionService', () => {
  it('creates a new revision item scheduled for immediate review', async () => {
    const prisma = createPrismaMock()
    const service = new RevisionService(prisma as never)

    const item = await service.createItem('user-1', {
      title: 'LRU Cache Design',
      topic: 'Data Structures',
      difficulty: 'Medium',
      notes: 'Use doubly linked list + hash map',
    })

    expect(item.title).toBe('LRU Cache Design')
    expect(item.intervalDays).toBe(1)
    expect(item.reviewCount).toBe(0)
    expect(prisma.revisionItem.create).toHaveBeenCalled()
  })

  it('advances review interval and awards XP upon review', async () => {
    const prisma = createPrismaMock()
    const now = new Date()
    prisma.revisionItem.findUnique.mockResolvedValue({
      id: 'rev-1',
      userId: 'user-1',
      title: 'LRU Cache Design',
      topic: 'Data Structures',
      difficulty: 'Medium',
      notes: null,
      solutionUrl: null,
      nextReviewAt: now,
      intervalDays: 1,
      reviewCount: 0,
      createdAt: now,
      updatedAt: now,
    })

    const service = new RevisionService(prisma as never)
    await service.recordReview('user-1', 'rev-1')

    expect(prisma.$transaction).toHaveBeenCalled()
    expect(prisma.revisionItem.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'rev-1' },
        data: expect.objectContaining({
          intervalDays: 3,
          reviewCount: 1,
        }),
      }),
    )
    expect(prisma.xpEvent.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: 'user-1',
        amount: 10,
      }),
    })
  })
})
