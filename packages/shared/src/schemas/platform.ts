import { z } from 'zod'
import { PLATFORMS } from '../constants'

export const platformSchema = z.enum(PLATFORMS)

export const connectAccountSchema = z.object({
  platform: platformSchema,
  handle: z
    .string()
    .min(1, 'Handle is required')
    .max(64)
    .regex(/^[a-zA-Z0-9_.-]+$/, 'Invalid handle format'),
})
export type ConnectAccountInput = z.infer<typeof connectAccountSchema>

/** Normalized stats snapshot returned by every platform provider. */
export const platformStatsSchema = z.object({
  platform: platformSchema,
  handle: z.string(),
  rating: z.number().nullable(),
  maxRating: z.number().nullable(),
  rank: z.string().nullable(),
  solvedCount: z.number().nullable(),
  streak: z.number().nullable(),
  /** Provider-specific extras (difficulty breakdown, languages, calendar…) */
  details: z.record(z.unknown()),
  capturedAt: z.coerce.date(),
})
export type PlatformStats = z.infer<typeof platformStatsSchema>

export const leetCodeDetailsSchema = z.object({
  easySolved: z.number(),
  easyTotal: z.number(),
  mediumSolved: z.number(),
  mediumTotal: z.number(),
  hardSolved: z.number(),
  hardTotal: z.number(),
  acceptanceRate: z.number().nullable(),
  contributionPoints: z.number().nullable(),
  submissionCalendar: z.record(z.number()).optional(),
})
export type LeetCodeDetails = z.infer<typeof leetCodeDetailsSchema>

export const codeforcesDetailsSchema = z.object({
  contribution: z.number().nullable(),
  friendOfCount: z.number().nullable(),
  ratingHistory: z.array(
    z.object({
      contestId: z.number(),
      contestName: z.string(),
      rank: z.number(),
      oldRating: z.number(),
      newRating: z.number(),
      at: z.coerce.date(),
    }),
  ),
})
export type CodeforcesDetails = z.infer<typeof codeforcesDetailsSchema>

export const githubDetailsSchema = z.object({
  followers: z.number(),
  following: z.number(),
  publicRepos: z.number(),
  totalStars: z.number(),
  contributionsToday: z.number(),
  contributionsThisYear: z.number(),
  contributionCalendar: z.array(
    z.object({ date: z.string(), count: z.number(), level: z.number().min(0).max(4) }),
  ),
  topLanguages: z.array(z.object({ name: z.string(), percentage: z.number() })),
})
export type GithubDetails = z.infer<typeof githubDetailsSchema>
