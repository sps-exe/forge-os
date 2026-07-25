import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import {
  type CreateRevisionItemInput,
  type RevisionItemDto,
  type RevisionOverview,
  XP_REWARDS,
} from '@forge/shared'
import { PrismaService } from '../prisma/prisma.service'

const INTERVAL_STEPS = [1, 3, 7, 14, 30]

@Injectable()
export class RevisionService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string): Promise<RevisionOverview> {
    const now = new Date()
    const items = await this.prisma.revisionItem.findMany({
      where: { userId },
      orderBy: { nextReviewAt: 'asc' },
    })

    const dueItems = items.filter((i) => i.nextReviewAt <= now).map((i) => this.toDto(i))
    const upcomingItems = items.filter((i) => i.nextReviewAt > now).map((i) => this.toDto(i))

    return {
      dueCount: dueItems.length,
      totalCount: items.length,
      dueItems,
      upcomingItems,
    }
  }

  async createItem(userId: string, input: CreateRevisionItemInput): Promise<RevisionItemDto> {
    const item = await this.prisma.revisionItem.create({
      data: {
        userId,
        title: input.title,
        topic: input.topic,
        difficulty: input.difficulty,
        notes: input.notes || null,
        solutionUrl: input.solutionUrl || null,
        nextReviewAt: new Date(),
        intervalDays: 1,
        reviewCount: 0,
      },
    })
    return this.toDto(item)
  }

  async recordReview(userId: string, itemId: string): Promise<RevisionOverview> {
    const item = await this.prisma.revisionItem.findUnique({
      where: { id: itemId },
    })

    if (!item) {
      throw new NotFoundException(`Revision item ${itemId} not found`)
    }

    if (item.userId !== userId) {
      throw new ForbiddenException(`You do not own revision item ${itemId}`)
    }

    const currentStepIndex = INTERVAL_STEPS.indexOf(item.intervalDays)
    const nextStepIndex = Math.min(INTERVAL_STEPS.length - 1, (currentStepIndex >= 0 ? currentStepIndex : 0) + 1)
    const nextIntervalDays = INTERVAL_STEPS[nextStepIndex] ?? 1

    const nextReviewAt = new Date()
    nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + nextIntervalDays)

    await this.prisma.$transaction([
      this.prisma.revisionItem.update({
        where: { id: itemId },
        data: {
          intervalDays: nextIntervalDays,
          reviewCount: item.reviewCount + 1,
          nextReviewAt,
        },
      }),
      this.prisma.xpEvent.create({
        data: {
          userId,
          amount: XP_REWARDS.DAILY_TASK_COMPLETE,
          reason: `Completed Revision: ${item.title}`,
        },
      }),
    ])

    return this.getOverview(userId)
  }

  private toDto(item: {
    id: string
    title: string
    topic: string
    difficulty: string
    notes: string | null
    solutionUrl: string | null
    nextReviewAt: Date
    intervalDays: number
    reviewCount: number
    createdAt: Date
    updatedAt: Date
  }): RevisionItemDto {
    return {
      id: item.id,
      title: item.title,
      topic: item.topic,
      difficulty: item.difficulty,
      notes: item.notes,
      solutionUrl: item.solutionUrl,
      nextReviewAt: item.nextReviewAt,
      intervalDays: item.intervalDays,
      reviewCount: item.reviewCount,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    }
  }
}
