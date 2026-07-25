import { z } from 'zod'

export const taskTypeSchema = z.enum([
  'LEETCODE_DAILY',
  'CODEFORCES_PRACTICE',
  'GITHUB_CONTRIBUTION',
  'CS_READING',
  'REVISION',
  'INTERVIEW_QUESTION',
  'CUSTOM',
])
export type TaskType = z.infer<typeof taskTypeSchema>

export const taskStatusSchema = z.enum(['PENDING', 'COMPLETED', 'SKIPPED'])
export type TaskStatus = z.infer<typeof taskStatusSchema>

export const topicRecommendationSchema = z.object({
  topic: z.string(),
  reason: z.string(),
  suggestedLevel: z.string(),
})
export type TopicRecommendation = z.infer<typeof topicRecommendationSchema>

export const dailyTaskSchema = z.object({
  id: z.string(),
  type: taskTypeSchema,
  title: z.string(),
  url: z.string().url().nullable(),
  status: taskStatusSchema,
  date: z.coerce.date(),
  xpReward: z.number(),
  difficulty: z.string().nullable().optional(),
  recommendedTopic: z.string().nullable().optional(),
  platformTarget: z.string().nullable().optional(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type DailyTaskDto = z.infer<typeof dailyTaskSchema>

export const dailyTasksOverviewSchema = z.object({
  date: z.string(),
  tasks: z.array(dailyTaskSchema),
  completedCount: z.number(),
  totalCount: z.number(),
  earnedXpToday: z.number(),
  recommendations: z.array(topicRecommendationSchema),
})
export type DailyTasksOverview = z.infer<typeof dailyTasksOverviewSchema>

export const taskDaySummarySchema = z.object({
  date: z.string(),
  completedCount: z.number(),
  totalCount: z.number(),
  completionRate: z.number(),
})
export type TaskDaySummary = z.infer<typeof taskDaySummarySchema>

export const taskMomentumSummarySchema = z.object({
  currentStreak: z.number(),
  activeDaysLast14: z.number(),
  completedTasksLast7: z.number(),
  totalTasksLast7: z.number(),
  week: z.array(taskDaySummarySchema),
})
export type TaskMomentumSummary = z.infer<typeof taskMomentumSummarySchema>

export const taskHistoryDaySchema = z.object({
  date: z.string(),
  completedCount: z.number(),
  totalCount: z.number(),
  tasks: z.array(dailyTaskSchema),
})
export type TaskHistoryDay = z.infer<typeof taskHistoryDaySchema>

export const taskHistoryOverviewSchema = z.object({
  days: z.array(taskHistoryDaySchema),
})
export type TaskHistoryOverview = z.infer<typeof taskHistoryOverviewSchema>

export const updateTaskStatusSchema = z.object({
  status: taskStatusSchema,
})
export type UpdateTaskStatusInput = z.infer<typeof updateTaskStatusSchema>
