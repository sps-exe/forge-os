import { z } from 'zod'

export const questCategorySchema = z.enum([
  'DAILY_TASKS',
  'XP',
  'STREAK',
  'PLATFORM',
])
export type QuestCategory = z.infer<typeof questCategorySchema>

export const questSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: questCategorySchema,
  xpReward: z.number(),
  completed: z.boolean(),
  progress: z.number().min(0).max(100),
  currentValue: z.number(),
  targetValue: z.number(),
  completedAt: z.coerce.date().nullable(),
})
export type QuestDto = z.infer<typeof questSchema>

export const questsOverviewSchema = z.object({
  weekKey: z.string(),
  daysRemaining: z.number(),
  completedCount: z.number(),
  totalCount: z.number(),
  totalXpAvailable: z.number(),
  totalXpEarned: z.number(),
  quests: z.array(questSchema),
})
export type QuestsOverview = z.infer<typeof questsOverviewSchema>
