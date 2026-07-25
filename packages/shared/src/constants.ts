/** Supported coding platforms. Mirrors the Prisma `Platform` enum. */
export const PLATFORMS = ['LEETCODE', 'CODEFORCES', 'GITHUB'] as const
export type Platform = (typeof PLATFORMS)[number]

export const PLATFORM_LABELS: Record<Platform, string> = {
  LEETCODE: 'LeetCode',
  CODEFORCES: 'Codeforces',
  GITHUB: 'GitHub',
}

/** Cache TTLs (seconds) for external platform data. */
export const CACHE_TTL = {
  platformStats: 15 * 60,
  contests: 30 * 60,
  githubActivity: 10 * 60,
} as const

/** XP awarded per action — used by XpEvent records. */
export const XP_REWARDS = {
  DAILY_TASK_COMPLETE: 10,
  LEETCODE_DAILY: 25,
  CONTEST_PARTICIPATION: 50,
  GITHUB_CONTRIBUTION: 15,
  STREAK_MILESTONE: 100,
} as const

/** Level curve: level n requires n^2 * 100 XP total. */
export function levelForXp(totalXp: number): {
  level: number
  currentXp: number
  nextLevelXp: number
} {
  let level = 1
  while (totalXp >= level * level * 100) level += 1
  const prevThreshold = (level - 1) * (level - 1) * 100
  return {
    level,
    currentXp: totalXp - prevThreshold,
    nextLevelXp: level * level * 100 - prevThreshold,
  }
}
