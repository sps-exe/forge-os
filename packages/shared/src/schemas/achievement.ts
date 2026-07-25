import { z } from 'zod'

export const achievementCategorySchema = z.enum(['HABIT', 'PLATFORM', 'XP', 'CONTEST'])
export type AchievementCategory = z.infer<typeof achievementCategorySchema>

export const achievementSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  category: achievementCategorySchema,
  earned: z.boolean(),
  progress: z.number().min(0).max(100),
  currentValue: z.number(),
  targetValue: z.number(),
  unlockedAt: z.coerce.date().nullable(),
})
export type AchievementDto = z.infer<typeof achievementSchema>

export const achievementsOverviewSchema = z.object({
  earnedCount: z.number(),
  totalCount: z.number(),
  nextAchievement: achievementSchema.nullable(),
  achievements: z.array(achievementSchema),
})
export type AchievementsOverview = z.infer<typeof achievementsOverviewSchema>
