import { Injectable } from '@nestjs/common'
import {
  type QuestCategory,
  type QuestDto,
  type QuestsOverview,
} from '@forge/shared'
import { PrismaService } from '../prisma/prisma.service'

interface QuestMetrics {
  completedTasksThisWeek: number
  xpEarnedThisWeek: number
  currentStreak: number
  connectedPlatforms: number
}

interface QuestDefinition {
  id: string
  title: string
  description: string
  category: QuestCategory
  targetValue: number
  xpReward: number
  value: (metrics: QuestMetrics) => number
}

const WEEKLY_QUESTS: QuestDefinition[] = [
  {
    id: 'weekly-task-master',
    title: 'Task Crusher',
    description: 'Complete 10 daily tasks this week.',
    category: 'DAILY_TASKS',
    targetValue: 10,
    xpReward: 150,
    value: (m) => m.completedTasksThisWeek,
  },
  {
    id: 'weekly-xp-surge',
    title: 'XP Surge',
    description: 'Earn 200 XP from daily activities this week.',
    category: 'XP',
    targetValue: 200,
    xpReward: 100,
    value: (m) => m.xpEarnedThisWeek,
  },
  {
    id: 'weekly-streak-keeper',
    title: 'Rhythm Master',
    description: 'Maintain an active streak of at least 3 days.',
    category: 'STREAK',
    targetValue: 3,
    xpReward: 120,
    value: (m) => m.currentStreak,
  },
  {
    id: 'weekly-polyglot',
    title: 'Multi-Platform',
    description: 'Link at least 2 coding platforms to your Forge OS.',
    category: 'PLATFORM',
    targetValue: 2,
    xpReward: 80,
    value: (m) => m.connectedPlatforms,
  },
]

@Injectable()
export class QuestsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string): Promise<QuestsOverview> {
    const now = new Date()
    const { weekKey, startOfWeek, endOfWeek, daysRemaining } = this.getWeekInfo(now)

    const [metrics, existingQuests] = await Promise.all([
      this.getMetrics(userId, startOfWeek, endOfWeek),
      this.prisma.userQuest.findMany({
        where: { userId, weekKey },
        select: { questId: true, completedAt: true, xpAwarded: true },
      }),
    ])

    const completedMap = new Map(
      existingQuests.map((q) => [q.questId, q.completedAt]),
    )

    const evaluated = WEEKLY_QUESTS.map((questDef) =>
      this.evaluate(questDef, metrics, completedMap),
    )

    // Identify quests that are newly completed and haven't been persisted yet
    const newlyCompleted = evaluated.filter(
      (q) => q.completed && !completedMap.has(q.id),
    )

    if (newlyCompleted.length > 0) {
      const nowUtc = new Date()
      await this.prisma.$transaction([
        ...newlyCompleted.map((q) =>
          this.prisma.userQuest.create({
            data: {
              userId,
              questId: q.id,
              weekKey,
              xpAwarded: q.xpReward,
            },
          }),
        ),
        ...newlyCompleted.map((q) =>
          this.prisma.xpEvent.create({
            data: {
              userId,
              amount: q.xpReward,
              reason: `Completed Weekly Quest: ${q.title}`,
            },
          }),
        ),
        ...newlyCompleted.map((q) =>
          this.prisma.notification.create({
            data: {
              userId,
              type: 'QUEST_COMPLETED',
              title: `Weekly Quest Complete: ${q.title}! 🎯`,
              body: `You earned +${q.xpReward} XP for completing "${q.title}".`,
            },
          }),
        ),
      ])

      for (const q of newlyCompleted) {
        completedMap.set(q.id, nowUtc)
      }
    }

    const questDtos: QuestDto[] = evaluated.map((q) => ({
      ...q,
      completedAt: completedMap.get(q.id) ?? null,
    }))

    const completedCount = questDtos.filter((q) => q.completed).length
    const totalXpAvailable = WEEKLY_QUESTS.reduce((sum, q) => sum + q.xpReward, 0)
    const totalXpEarned = questDtos
      .filter((q) => q.completed)
      .reduce((sum, q) => sum + q.xpReward, 0)

    return {
      weekKey,
      daysRemaining,
      completedCount,
      totalCount: questDtos.length,
      totalXpAvailable,
      totalXpEarned,
      quests: questDtos,
    }
  }

  private async getMetrics(
    userId: string,
    startOfWeek: Date,
    endOfWeek: Date,
  ): Promise<QuestMetrics> {
    const today = this.todayUtc()
    const streakStart = this.addDays(today, -89)

    const [accounts, xp, completedTasks, taskWindow] = await Promise.all([
      this.prisma.codingAccount.findMany({
        where: { userId },
        select: { platform: true },
      }),
      this.prisma.xpEvent.aggregate({
        where: {
          userId,
          createdAt: { gte: startOfWeek, lte: endOfWeek },
        },
        _sum: { amount: true },
      }),
      this.prisma.dailyTask.count({
        where: {
          userId,
          status: 'COMPLETED',
          date: { gte: startOfWeek, lte: endOfWeek },
        },
      }),
      this.prisma.dailyTask.findMany({
        where: {
          userId,
          date: { gte: streakStart, lte: today },
        },
        select: { date: true, status: true },
      }),
    ])

    return {
      connectedPlatforms: accounts.length,
      xpEarnedThisWeek: xp._sum.amount ?? 0,
      completedTasksThisWeek: completedTasks,
      currentStreak: this.calculateStreak(taskWindow),
    }
  }

  private evaluate(
    quest: QuestDefinition,
    metrics: QuestMetrics,
    completedMap: Map<string, Date>,
  ): QuestDto {
    const currentValue = quest.value(metrics)
    const progress = Math.min(
      100,
      Math.round((currentValue / quest.targetValue) * 100),
    )
    const completed = completedMap.has(quest.id) || currentValue >= quest.targetValue

    return {
      id: quest.id,
      title: quest.title,
      description: quest.description,
      category: quest.category,
      xpReward: quest.xpReward,
      completed,
      progress,
      currentValue,
      targetValue: quest.targetValue,
      completedAt: completedMap.get(quest.id) ?? null,
    }
  }

  private getWeekInfo(date: Date) {
    const d = new Date(date)
    const day = d.getUTCDay()
    const diffToMonday = (day === 0 ? -6 : 1) - day
    const monday = new Date(d)
    monday.setUTCDate(d.getUTCDate() + diffToMonday)
    monday.setUTCHours(0, 0, 0, 0)

    const sunday = new Date(monday)
    sunday.setUTCDate(monday.getUTCDate() + 6)
    sunday.setUTCHours(23, 59, 59, 999)

    // ISO week key (e.g. 2026-W30)
    const year = monday.getUTCFullYear()
    const firstJan = new Date(Date.UTC(year, 0, 1))
    const dayOfYear = Math.floor((monday.getTime() - firstJan.getTime()) / (24 * 60 * 60 * 1000)) + 1
    const weekNumber = Math.ceil((dayOfYear + firstJan.getUTCDay() - 1) / 7)
    const weekKey = `${year}-W${weekNumber.toString().padStart(2, '0')}`

    const diffDays = Math.ceil((sunday.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    const daysRemaining = Math.max(0, diffDays)

    return {
      weekKey,
      startOfWeek: monday,
      endOfWeek: sunday,
      daysRemaining,
    }
  }

  private calculateStreak(tasks: Array<{ date: Date; status: string }>): number {
    const byDay = new Map<string, number>()
    for (const task of tasks) {
      const key = task.date.toISOString().slice(0, 10)
      byDay.set(key, (byDay.get(key) ?? 0) + (task.status === 'COMPLETED' ? 1 : 0))
    }

    const today = this.todayUtc()
    const todayKey = today.toISOString().slice(0, 10)
    const todayActive = (byDay.get(todayKey) ?? 0) > 0
    let cursor = todayActive ? today : this.addDays(today, -1)
    let streak = 0

    for (let index = 0; index < 90; index += 1) {
      const key = cursor.toISOString().slice(0, 10)
      if ((byDay.get(key) ?? 0) <= 0) break
      streak += 1
      cursor = this.addDays(cursor, -1)
    }

    return streak
  }

  private todayUtc(): Date {
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date)
    next.setUTCDate(next.getUTCDate() + days)
    return next
  }
}
