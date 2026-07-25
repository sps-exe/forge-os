import { Injectable } from '@nestjs/common'
import {
  type AchievementCategory,
  type AchievementDto,
  type AchievementsOverview,
} from '@forge/shared'
import { PrismaService } from '../prisma/prisma.service'

interface AchievementMetrics {
  connectedAccounts: number
  totalXp: number
  completedTasks: number
  currentStreak: number
  todayCompletionRate: number
  leetCodeSolved: number
  codeforcesRating: number
  githubStreak: number
}

interface AchievementDefinition {
  id: string
  title: string
  description: string
  category: AchievementCategory
  targetValue: number
  value: (metrics: AchievementMetrics) => number
}

const ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'first-check',
    title: 'First check',
    description: 'Complete your first daily task.',
    category: 'HABIT',
    targetValue: 1,
    value: (metrics) => metrics.completedTasks,
  },
  {
    id: 'daily-sweep',
    title: 'Daily sweep',
    description: 'Complete every generated task in a day.',
    category: 'HABIT',
    targetValue: 100,
    value: (metrics) => metrics.todayCompletionRate,
  },
  {
    id: 'three-day-streak',
    title: 'Three-day spark',
    description: 'Complete at least one task for three days in a row.',
    category: 'HABIT',
    targetValue: 3,
    value: (metrics) => metrics.currentStreak,
  },
  {
    id: 'seven-day-streak',
    title: 'One-week rhythm',
    description: 'Complete at least one task for seven days in a row.',
    category: 'HABIT',
    targetValue: 7,
    value: (metrics) => metrics.currentStreak,
  },
  {
    id: 'platform-trio',
    title: 'All signals online',
    description: 'Connect LeetCode, Codeforces, and GitHub.',
    category: 'PLATFORM',
    targetValue: 3,
    value: (metrics) => metrics.connectedAccounts,
  },
  {
    id: 'leetcode-50',
    title: 'Problem solver',
    description: 'Reach 50 solved problems on LeetCode.',
    category: 'PLATFORM',
    targetValue: 50,
    value: (metrics) => metrics.leetCodeSolved,
  },
  {
    id: 'codeforces-rated',
    title: 'Rated fighter',
    description: 'Connect a Codeforces account with a rating.',
    category: 'PLATFORM',
    targetValue: 1,
    value: (metrics) => (metrics.codeforcesRating > 0 ? 1 : 0),
  },
  {
    id: 'github-active',
    title: 'Green square today',
    description: 'Keep a GitHub contribution streak alive.',
    category: 'PLATFORM',
    targetValue: 1,
    value: (metrics) => metrics.githubStreak,
  },
  {
    id: 'xp-100',
    title: '100 XP club',
    description: 'Earn 100 total XP.',
    category: 'XP',
    targetValue: 100,
    value: (metrics) => metrics.totalXp,
  },
  {
    id: 'xp-500',
    title: 'Momentum builder',
    description: 'Earn 500 total XP.',
    category: 'XP',
    targetValue: 500,
    value: (metrics) => metrics.totalXp,
  },
]

@Injectable()
export class AchievementsService {
  constructor(private readonly prisma: PrismaService) {}

  async getOverview(userId: string): Promise<AchievementsOverview> {
    const [metrics, existingUnlocks] = await Promise.all([
      this.getMetrics(userId),
      this.prisma.userAchievement.findMany({
        where: { userId },
        select: { achievementId: true, unlockedAt: true },
      }),
    ])

    const unlockMap = new Map(
      existingUnlocks.map((u) => [u.achievementId, u.unlockedAt]),
    )

    const achievements = ACHIEVEMENTS.map((achievement) =>
      this.evaluate(achievement, metrics, unlockMap),
    )

    // Persist any newly-earned achievements and create notifications
    const newlyEarned = achievements.filter(
      (a) => a.earned && !unlockMap.has(a.id),
    )

    if (newlyEarned.length > 0) {
      await this.prisma.$transaction([
        ...newlyEarned.map((a) =>
          this.prisma.userAchievement.upsert({
            where: { userId_achievementId: { userId, achievementId: a.id } },
            update: {},
            create: { userId, achievementId: a.id },
          }),
        ),
        ...newlyEarned.map((a) =>
          this.prisma.notification.create({
            data: {
              userId,
              type: 'ACHIEVEMENT_UNLOCKED',
              title: `Achievement unlocked: ${a.title}`,
              body: a.description,
            },
          }),
        ),
      ])

      // Stamp unlockedAt on the response objects for items just unlocked
      const now = new Date()
      for (const a of newlyEarned) {
        unlockMap.set(a.id, now)
      }
    }

    // Attach real unlockedAt to the DTOs
    const dtos: AchievementDto[] = achievements.map((a) => ({
      ...a,
      unlockedAt: unlockMap.get(a.id) ?? null,
    }))

    const earnedCount = dtos.filter((a) => a.earned).length
    const nextAchievement =
      dtos
        .filter((a) => !a.earned)
        .sort((a, b) => b.progress - a.progress)[0] ?? null

    return {
      earnedCount,
      totalCount: dtos.length,
      nextAchievement,
      achievements: dtos,
    }
  }

  private async getMetrics(userId: string): Promise<AchievementMetrics> {
    const today = this.today()
    const streakStart = this.addDays(today, -89)

    const [accounts, xp, completedTasks, taskWindow, todayTasks] = await Promise.all([
      this.prisma.codingAccount.findMany({
        where: { userId },
        include: {
          stats: { orderBy: { capturedAt: 'desc' }, take: 1 },
        },
      }),
      this.prisma.xpEvent.aggregate({
        where: { userId },
        _sum: { amount: true },
      }),
      this.prisma.dailyTask.count({
        where: { userId, status: 'COMPLETED' },
      }),
      this.prisma.dailyTask.findMany({
        where: {
          userId,
          date: { gte: streakStart, lte: today },
        },
        select: { date: true, status: true },
      }),
      this.prisma.dailyTask.findMany({
        where: { userId, date: today },
        select: { status: true },
      }),
    ])

    const latestStats = (platform: string) =>
      accounts.find((account) => account.platform === platform)?.stats[0]

    const todayCompleted = todayTasks.filter((task) => task.status === 'COMPLETED').length

    return {
      connectedAccounts: accounts.length,
      totalXp: xp._sum.amount ?? 0,
      completedTasks,
      currentStreak: this.currentStreak(taskWindow),
      todayCompletionRate:
        todayTasks.length > 0 ? Math.round((todayCompleted / todayTasks.length) * 100) : 0,
      leetCodeSolved: latestStats('LEETCODE')?.solvedCount ?? 0,
      codeforcesRating: latestStats('CODEFORCES')?.rating ?? 0,
      githubStreak: latestStats('GITHUB')?.streak ?? 0,
    }
  }

  private evaluate(
    achievement: AchievementDefinition,
    metrics: AchievementMetrics,
    // unlockMap used only for earned status — unlockedAt attached after persisting
    _unlockMap?: Map<string, Date>,
  ): AchievementDto {
    const currentValue = achievement.value(metrics)
    const progress = Math.min(100, Math.round((currentValue / achievement.targetValue) * 100))
    return {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      category: achievement.category,
      earned: currentValue >= achievement.targetValue,
      progress,
      currentValue,
      targetValue: achievement.targetValue,
      unlockedAt: null, // filled in by caller after persisting
    }
  }

  private currentStreak(tasks: Array<{ date: Date; status: string }>): number {
    const byDay = new Map<string, number>()
    for (const task of tasks) {
      const key = this.dateKey(task.date)
      byDay.set(key, (byDay.get(key) ?? 0) + (task.status === 'COMPLETED' ? 1 : 0))
    }

    const today = this.today()
    const todayActive = (byDay.get(this.dateKey(today)) ?? 0) > 0
    let cursor = todayActive ? today : this.addDays(today, -1)
    let streak = 0

    for (let index = 0; index < 90; index += 1) {
      if ((byDay.get(this.dateKey(cursor)) ?? 0) <= 0) break
      streak += 1
      cursor = this.addDays(cursor, -1)
    }

    return streak
  }

  private today(): Date {
    const now = new Date()
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  }

  private addDays(date: Date, days: number): Date {
    const next = new Date(date)
    next.setUTCDate(next.getUTCDate() + days)
    return next
  }

  private dateKey(date: Date): string {
    return date.toISOString().slice(0, 10)
  }
}
