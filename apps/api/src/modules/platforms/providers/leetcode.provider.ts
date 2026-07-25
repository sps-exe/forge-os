import { Injectable } from '@nestjs/common'
import type { LeetCodeDetails, PlatformStats } from '@forge/shared'
import { PlatformFetchError, type PlatformProvider } from './provider.interface'

const LEETCODE_GRAPHQL = 'https://leetcode.com/graphql'

const PROFILE_QUERY = `
query userProfile($username: String!) {
  matchedUser(username: $username) {
    username
    profile { ranking }
    submitStatsGlobal {
      acSubmissionNum { difficulty count }
    }
  }
  allQuestionsCount { difficulty count }
  userContestRanking(username: $username) {
    rating
    globalRanking
    attendedContestsCount
  }
}`

interface LeetCodeResponse {
  data?: {
    matchedUser: {
      username: string
      profile: { ranking: number | null }
      submitStatsGlobal: { acSubmissionNum: Array<{ difficulty: string; count: number }> }
    } | null
    allQuestionsCount: Array<{ difficulty: string; count: number }>
    userContestRanking: {
      rating: number | null
      globalRanking: number | null
      attendedContestsCount: number
    } | null
  }
}

@Injectable()
export class LeetCodeProvider implements PlatformProvider {
  async validateHandle(handle: string): Promise<boolean> {
    try {
      const data = await this.query(handle)
      return Boolean(data.data?.matchedUser)
    } catch {
      return false
    }
  }

  async fetchStats(handle: string): Promise<PlatformStats> {
    const json = await this.query(handle)
    const matched = json.data?.matchedUser
    if (!matched) throw new PlatformFetchError('LEETCODE', `User "${handle}" not found`)

    const solved = Object.fromEntries(
      matched.submitStatsGlobal.acSubmissionNum.map((s) => [s.difficulty, s.count]),
    )
    const totals = Object.fromEntries(
      (json.data?.allQuestionsCount ?? []).map((s) => [s.difficulty, s.count]),
    )
    const contest = json.data?.userContestRanking

    const details: LeetCodeDetails = {
      easySolved: solved['Easy'] ?? 0,
      easyTotal: totals['Easy'] ?? 0,
      mediumSolved: solved['Medium'] ?? 0,
      mediumTotal: totals['Medium'] ?? 0,
      hardSolved: solved['Hard'] ?? 0,
      hardTotal: totals['Hard'] ?? 0,
      acceptanceRate: null,
      contributionPoints: null,
    }

    return {
      platform: 'LEETCODE',
      handle,
      rating: contest?.rating ? Math.round(contest.rating) : null,
      maxRating: null,
      rank: matched.profile.ranking ? `#${matched.profile.ranking.toLocaleString()}` : null,
      solvedCount: solved['All'] ?? 0,
      streak: null,
      details: details as unknown as Record<string, unknown>,
      capturedAt: new Date(),
    }
  }

  private async query(username: string): Promise<LeetCodeResponse> {
    const res = await fetch(LEETCODE_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Referer: 'https://leetcode.com',
        'User-Agent': 'Mozilla/5.0 (compatible; ForgeBot/1.0)',
      },
      body: JSON.stringify({ query: PROFILE_QUERY, variables: { username } }),
    })
    if (!res.ok) {
      throw new PlatformFetchError('LEETCODE', `HTTP ${res.status}`)
    }
    return (await res.json()) as LeetCodeResponse
  }
}
