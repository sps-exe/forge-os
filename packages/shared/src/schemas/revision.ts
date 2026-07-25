import { z } from 'zod'

export const revisionItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  topic: z.string(),
  difficulty: z.string(),
  notes: z.string().nullable(),
  solutionUrl: z.string().url().nullable().or(z.literal('')),
  nextReviewAt: z.coerce.date(),
  intervalDays: z.number(),
  reviewCount: z.number(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
})
export type RevisionItemDto = z.infer<typeof revisionItemSchema>

export const createRevisionItemSchema = z.object({
  title: z.string().min(1).max(120),
  topic: z.string().min(1).max(64),
  difficulty: z.enum(['Easy', 'Medium', 'Hard']).default('Medium'),
  notes: z.string().max(1000).optional(),
  solutionUrl: z.string().url().optional().or(z.literal('')),
})
export type CreateRevisionItemInput = z.infer<typeof createRevisionItemSchema>

export const revisionOverviewSchema = z.object({
  dueCount: z.number(),
  totalCount: z.number(),
  dueItems: z.array(revisionItemSchema),
  upcomingItems: z.array(revisionItemSchema),
})
export type RevisionOverview = z.infer<typeof revisionOverviewSchema>
