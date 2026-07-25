import { z } from 'zod'

export const openSourceIssueSchema = z.object({
  id: z.string(),
  repo: z.string(),
  title: z.string(),
  url: z.string().url(),
  language: z.string(),
  labels: z.array(z.string()),
  stars: z.number(),
  commentsCount: z.number(),
  createdAt: z.coerce.date(),
})
export type OpenSourceIssueDto = z.infer<typeof openSourceIssueSchema>

export const openSourceOverviewSchema = z.object({
  languages: z.array(z.string()),
  totalCount: z.number(),
  issues: z.array(openSourceIssueSchema),
})
export type OpenSourceOverview = z.infer<typeof openSourceOverviewSchema>
