import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common'
import { TaskStatus, TaskType } from '@prisma/client'
import {
  XP_REWARDS,
  type DailyTaskDto,
  type DailyTasksOverview,
  type TaskHistoryOverview,
  type TaskDaySummary,
  type TaskMomentumSummary,
  type TopicRecommendation,
} from '@forge/shared'
import { PrismaService } from '../prisma/prisma.service'

const TASK_REWARDS: Record<TaskType, number> = {
  LEETCODE_DAILY: XP_REWARDS.LEETCODE_DAILY,
  CODEFORCES_PRACTICE: XP_REWARDS.DAILY_TASK_COMPLETE,
  GITHUB_CONTRIBUTION: XP_REWARDS.GITHUB_CONTRIBUTION,
  CS_READING: XP_REWARDS.DAILY_TASK_COMPLETE,
  REVISION: XP_REWARDS.DAILY_TASK_COMPLETE,
  INTERVIEW_QUESTION: XP_REWARDS.DAILY_TASK_COMPLETE,
  CUSTOM: XP_REWARDS.DAILY_TASK_COMPLETE,
}

interface TaskTemplate {
  type: TaskType
  title: string
  url: string | null
  difficulty?: string
  recommendedTopic?: string
  platformTarget?: string
}

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async getToday(userId: string): Promise<DailyTasksOverview> {
    await this.ensureTodayTasks(userId)
    return this.buildOverview(userId, this.today())
  }

  async ensureTodayTasks(userId: string): Promise<DailyTasksOverview> {
    const date = this.today()
    const accounts = await this.prisma.codingAccount.findMany({
      where: { userId },
      include: { stats: { orderBy: { capturedAt: 'desc' }, take: 1 } },
    })

    const getAccount = (platform: string) => accounts.find((a) => a.platform === platform)
    const lcStats = getAccount('LEETCODE')?.stats[0]
    const cfStats = getAccount('CODEFORCES')?.stats[0]
    const ghStats = getAccount('GITHUB')?.stats[0]

    // Tailored Codeforces target rating
    const cfRating = cfStats?.rating ?? 1200
    const cfTarget = Math.ceil((cfRating + 100) / 100) * 100

    // Tailored LeetCode difficulty
    const lcSolved = lcStats?.solvedCount ?? 0
    const lcDifficulty = lcSolved > 100 ? 'Hard' : lcSolved > 30 ? 'Medium' : 'Easy'

    // Tailored GitHub title
    const ghStreak = ghStats?.streak ?? 0
    const ghTitle = ghStreak > 0
      ? `Keep your ${ghStreak}-day GitHub contribution streak alive`
      : 'Make one meaningful GitHub contribution'

    const templates: TaskTemplate[] = [
      {
        type: 'LEETCODE_DAILY',
        title: `Solve today's LeetCode daily (${lcDifficulty})`,
        url: 'https://leetcode.com/problemset/',
        difficulty: lcDifficulty,
        recommendedTopic: lcDifficulty === 'Hard' ? 'Dynamic Programming' : 'Arrays & Hashing',
        platformTarget: 'LeetCode',
      },
      {
        type: 'CODEFORCES_PRACTICE',
        title: `Solve one ${cfTarget}-rated Codeforces problem`,
        url: getAccount('CODEFORCES')
          ? `https://codeforces.com/problemset?tags=${cfTarget}`
          : 'https://codeforces.com/problemset',
        difficulty: `Rating ${cfTarget}`,
        recommendedTopic: 'Binary Search & Greedy',
        platformTarget: 'Codeforces',
      },
      {
        type: 'GITHUB_CONTRIBUTION',
        title: ghTitle,
        url: getAccount('GITHUB')
          ? `https://github.com/${getAccount('GITHUB')?.handle}`
          : 'https://github.com',
        difficulty: 'Daily',
        recommendedTopic: 'Open Source / Projects',
        platformTarget: 'GitHub',
      },
      {
        type: 'CS_READING',
        title: 'Read one core CS concept (OS / Distributed Systems)',
        url: null,
        difficulty: 'Core',
        recommendedTopic: 'Systems Architecture',
      },
      {
        type: 'REVISION',
        title: 'Revise one previous mistake or saved pattern',
        url: null,
        difficulty: 'Review',
        recommendedTopic: 'Spaced Repetition',
      },
      {
        type: 'INTERVIEW_QUESTION',
        title: 'Practice one mock behavioral or system design question',
        url: null,
        difficulty: 'Medium',
        recommendedTopic: 'System Design',
      },
    ]

    await this.prisma.$transaction(
      templates.map((task) =>
        this.prisma.dailyTask.upsert({
          where: { userId_type_date: { userId, type: task.type, date } },
          update: {},
          create: {
            userId,
            type: task.type,
            title: task.title,
            url: task.url,
            date,
          },
        }),
      ),
    )

    return this.buildOverview(userId, date)
  }

  async getSummary(userId: string): Promise<TaskMomentumSummary> {
    await this.ensureTodayTasks(userId)
    const today = this.today()
    const streakStart = this.addDays(today, -89)

    const [tasks, windowTasks] = await Promise.all([
      this.prisma.dailyTask.findMany({
        where: {
          userId,
          date: { gte: this.addDays(today, -6), lte: today },
        },
        select: { date: true, status: true },
      }),
      this.prisma.dailyTask.findMany({
        where: {
          userId,
          date: { gte: streakStart, lte: today },
        },
        select: { date: true, status: true },
      }),
    ])

    const byDay = new Map<string, { completed: number; total: number }>()
    for (let index = 6; index >= 0; index -= 1) {
      const dayDate = this.addDays(today, -index)
      byDay.set(this.dateKey(dayDate), { completed: 0, total: 0 })
    }

    for (const task of tasks) {
      const key = this.dateKey(task.date)
      const current = byDay.get(key)
      if (current) {
        current.total += 1
        if (task.status === 'COMPLETED') current.completed += 1
      }
    }

    const week: TaskDaySummary[] = Array.from(byDay.entries()).map(([dateStr, stats]) => ({
      date: dateStr,
      completedCount: stats.completed,
      totalCount: stats.total,
      completionRate: stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0,
    }))

    const windowDays = new Map<string, { completed: number; total: number }>()
    for (const task of windowTasks) {
      const key = this.dateKey(task.date)
      const current = windowDays.get(key) ?? { completed: 0, total: 0 }
      current.total += 1
      if (task.status === 'COMPLETED') current.completed += 1
      windowDays.set(key, current)
    }

    const activeDaysLast14 = Array.from(windowDays.entries())
      .filter(([dateStr]) => dateStr >= this.dateKey(this.addDays(today, -13)))
      .filter(([, stats]) => stats.completed > 0).length

    const completedTasksLast7 = week.reduce((acc, d) => acc + d.completedCount, 0)
    const totalTasksLast7 = week.reduce((acc, d) => acc + d.totalCount, 0)
    const currentStreak = this.calculateStreak(windowDays, today)

    return {
      currentStreak,
      activeDaysLast14,
      completedTasksLast7,
      totalTasksLast7,
      week,
    }
  }

  async getHistory(userId: string): Promise<TaskHistoryOverview> {
    await this.ensureTodayTasks(userId)
    const today = this.today()
    const startDate = this.addDays(today, -13)

    const tasks = await this.prisma.dailyTask.findMany({
      where: {
        userId,
        date: { gte: startDate, lte: today },
      },
      orderBy: [{ date: 'desc' }, { createdAt: 'asc' }],
    })

    const byDay = new Map<string, typeof tasks>()
    for (let i = 0; i < 14; i += 1) {
      const dayDate = this.addDays(today, -i)
      byDay.set(this.dateKey(dayDate), [])
    }

    for (const task of tasks) {
      const key = this.dateKey(task.date)
      const dayTasks = byDay.get(key)
      if (dayTasks) dayTasks.push(task)
    }

    const days = Array.from(byDay.entries()).map(([dateStr, dayTasks]) => {
      const dtoTasks = dayTasks.map((t) => this.toDto(t))
      return {
        date: dateStr,
        completedCount: dtoTasks.filter((t) => t.status === 'COMPLETED').length,
        totalCount: dtoTasks.length,
        tasks: dtoTasks,
      }
    })

    return { days }
  }

  async updateStatus(
    userId: string,
    taskId: string,
    status: TaskStatus,
  ): Promise<DailyTasksOverview> {
    const task = await this.prisma.dailyTask.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      throw new NotFoundException(`Task ${taskId} not found`)
    }

    if (task.userId !== userId) {
      throw new ForbiddenException(`You do not own task ${taskId}`)
    }

    const previouslyCompleted = task.status === 'COMPLETED'

    await this.prisma.$transaction(async (tx) => {
      await tx.dailyTask.update({
        where: { id: taskId },
        data: {
          status,
        },
      })

      if (status === 'COMPLETED' && !previouslyCompleted) {
        await tx.xpEvent.create({
          data: {
            userId,
            amount: TASK_REWARDS[task.type],
            reason: `Completed ${this.humanizeTaskType(task.type)}`,
          },
        })
      }
    })

    if (status === 'COMPLETED') {
      const updatedOverview = await this.buildOverview(userId, task.date)
      const streak = await this.getCurrentStreak(userId)
      const MILESTONES = [3, 7, 14, 30]
      if (MILESTONES.includes(streak)) {
        const existing = await this.prisma.notification.findFirst({
          where: {
            userId,
            type: 'STREAK_MILESTONE',
            body: { contains: `${streak}-day` },
          },
        })
        if (!existing) {
          await this.prisma.notification.create({
            data: {
              userId,
              type: 'STREAK_MILESTONE',
              title: `${streak}-day streak! 🔥`,
              body: `You've completed at least one task for ${streak} days in a row. Keep it up!`,
            },
          })
        }
      }
      return updatedOverview
    }

    return this.buildOverview(userId, task.date)
  }

  private async buildOverview(userId: string, date: Date): Promise<DailyTasksOverview> {
    const [tasks, xp, accounts] = await Promise.all([
      this.prisma.dailyTask.findMany({
        where: { userId, date },
        orderBy: { createdAt: 'asc' },
      }),
      this.prisma.xpEvent.aggregate({
        where: {
          userId,
          createdAt: {
            gte: date,
            lt: this.addDays(date, 1),
          },
        },
        _sum: { amount: true },
      }),
      this.prisma.codingAccount.findMany({
        where: { userId },
        include: { stats: { orderBy: { capturedAt: 'desc' }, take: 1 } },
      }),
    ])

    const dtoTasks: DailyTaskDto[] = tasks.map((task) => this.toDto(task))
    const recommendations = this.deriveRecommendations(accounts)

    return {
      date: date.toISOString().slice(0, 10),
      tasks: dtoTasks,
      completedCount: dtoTasks.filter((task) => task.status === 'COMPLETED').length,
      totalCount: dtoTasks.length,
      earnedXpToday: xp._sum.amount ?? 0,
      recommendations,
    }
  }

  private deriveRecommendations(
    accounts: Array<{ platform: string; stats: Array<{ rating: number | null; solvedCount: number | null }> }>,
  ): TopicRecommendation[] {
    const recommendations: TopicRecommendation[] = []

    const cfAccount = accounts.find((a) => a.platform === 'CODEFORCES')
    const cfRating = cfAccount?.stats[0]?.rating ?? null

    if (cfRating !== null) {
      if (cfRating < 1400) {
        recommendations.push({
          topic: 'Binary Search & Two Pointers',
          reason: `Current Codeforces rating is ${cfRating}. Mastering two pointers & binary search boosts Div 2 B/C speed.`,
          suggestedLevel: 'Rating 1200 - 1400',
        })
      } else {
        recommendations.push({
          topic: 'Dynamic Programming & Segment Trees',
          reason: `Rating ${cfRating} unlocked advanced problem types. Target 1600+ DP & range queries.`,
          suggestedLevel: 'Rating 1600+',
        })
      }
    } else {
      recommendations.push({
        topic: 'Arrays, Strings & Basic Hashing',
        reason: 'Foundation topics for competitive programming speed and accuracy.',
        suggestedLevel: 'Beginner',
      })
    }

    const lcAccount = accounts.find((a) => a.platform === 'LEETCODE')
    const lcSolved = lcAccount?.stats[0]?.solvedCount ?? 0

    if (lcSolved < 50) {
      recommendations.push({
        topic: 'BFS / DFS Graph Traversals',
        reason: 'Frequently tested in software engineer technical screen rounds.',
        suggestedLevel: 'LeetCode Medium',
      })
    } else {
      recommendations.push({
        topic: 'Sliding Window & Monotonic Stack',
        reason: 'Optimal pattern for array and string performance optimization.',
        suggestedLevel: 'LeetCode Medium / Hard',
      })
    }

    recommendations.push({
      topic: 'Caching & Distributed Message Queues',
      reason: 'Key concepts for backend engineering and system design rounds.',
      suggestedLevel: 'System Design',
    })

    return recommendations
  }

  private calculateStreak(
    byDayMap: Map<string, { completed: number; total: number }>,
    today: Date,
  ): number {
    const todayKey = this.dateKey(today)
    const todayActive = (byDayMap.get(todayKey)?.completed ?? 0) > 0
    let cursor = todayActive ? today : this.addDays(today, -1)
    let streak = 0

    for (let index = 0; index < 90; index += 1) {
      const key = this.dateKey(cursor)
      const dayData = byDayMap.get(key)
      if (!dayData || dayData.completed <= 0) break
      streak += 1
      cursor = this.addDays(cursor, -1)
    }

    return streak
  }

  private async getCurrentStreak(userId: string): Promise<number> {
    const today = this.today()
    const streakStart = this.addDays(today, -89)
    const tasks = await this.prisma.dailyTask.findMany({
      where: { userId, date: { gte: streakStart, lte: today } },
      select: { date: true, status: true },
    })
    const byDay = new Map<string, number>()
    for (const task of tasks) {
      const key = this.dateKey(task.date)
      byDay.set(key, (byDay.get(key) ?? 0) + (task.status === 'COMPLETED' ? 1 : 0))
    }
    const todayActive = (byDay.get(this.dateKey(today)) ?? 0) > 0
    let cursor = todayActive ? today : this.addDays(today, -1)
    let streak = 0
    for (let i = 0; i < 90; i++) {
      if ((byDay.get(this.dateKey(cursor)) ?? 0) <= 0) break
      streak++
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

  private humanizeTaskType(type: TaskType): string {
    switch (type) {
      case 'LEETCODE_DAILY':
        return 'LeetCode Daily Task'
      case 'CODEFORCES_PRACTICE':
        return 'Codeforces Practice Task'
      case 'GITHUB_CONTRIBUTION':
        return 'GitHub Contribution Task'
      case 'CS_READING':
        return 'CS Reading Task'
      case 'REVISION':
        return 'Revision Task'
      case 'INTERVIEW_QUESTION':
        return 'Interview Practice Task'
      default:
        return 'Daily Task'
    }
  }

  private toDto(task: {
    id: string
    type: TaskType
    title: string
    url: string | null
    status: TaskStatus
    date: Date
    createdAt: Date
    updatedAt: Date
  }): DailyTaskDto {
    return {
      id: task.id,
      type: task.type,
      title: task.title,
      url: task.url,
      status: task.status,
      date: task.date,
      xpReward: TASK_REWARDS[task.type],
      createdAt: task.createdAt,
      updatedAt: task.updatedAt,
    }
  }
}
