import { Injectable } from '@nestjs/common'
import type { GithubDetails, PlatformStats } from '@forge/shared'
import { PlatformFetchError, type PlatformProvider } from './provider.interface'

const GITHUB_GRAPHQL = 'https://api.github.com/graphql'
const GITHUB_REST = 'https://api.github.com'

const CONTRIBUTIONS_QUERY = `
query contributions($login: String!) {
  user(login: $login) {
    followers { totalCount }
    following { totalCount }
    repositories(first: 100, ownerAffiliations: OWNER, orderBy: {field: STARGAZERS, direction: DESC}) {
      totalCount
      nodes {
        stargazerCount
        primaryLanguage { name }
      }
    }
    contributionsCollection {
      contributionCalendar {
        totalContributions
        weeks {
          contributionDays { date contributionCount contributionLevel }
        }
      }
    }
  }
}`

const LEVEL_MAP: Record<string, number> = {
  NONE: 0,
  FIRST_QUARTILE: 1,
  SECOND_QUARTILE: 2,
  THIRD_QUARTILE: 3,
  FOURTH_QUARTILE: 4,
}

interface GhGraphQLResponse {
  data?: {
    user: {
      followers: { totalCount: number }
      following: { totalCount: number }
      repositories: {
        totalCount: number
        nodes: Array<{ stargazerCount: number; primaryLanguage: { name: string } | null }>
      }
      contributionsCollection: {
        contributionCalendar: {
          totalContributions: number
          weeks: Array<{
            contributionDays: Array<{
              date: string
              contributionCount: number
              contributionLevel: string
            }>
          }>
        }
      }
    } | null
  }
  errors?: Array<{ message: string }>
}

@Injectable()
export class GithubProvider implements PlatformProvider {
  async validateHandle(handle: string): Promise<boolean> {
    const res = await fetch(`${GITHUB_REST}/users/${encodeURIComponent(handle)}`, {
      headers: { 'User-Agent': 'ForgeBot/1.0' },
    })
    return res.ok
  }

  /**
   * GitHub's contribution calendar requires GraphQL, which requires a token.
   * We use the user's OAuth access token captured during sign-in.
   */
  async fetchStats(handle: string, accessToken?: string | null): Promise<PlatformStats> {
    if (!accessToken) {
      throw new PlatformFetchError('GITHUB', 'GitHub access token required — sign in with GitHub')
    }

    const res = await fetch(GITHUB_GRAPHQL, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
        'User-Agent': 'ForgeBot/1.0',
      },
      body: JSON.stringify({ query: CONTRIBUTIONS_QUERY, variables: { login: handle } }),
    })
    if (!res.ok) throw new PlatformFetchError('GITHUB', `HTTP ${res.status}`)

    const json = (await res.json()) as GhGraphQLResponse
    const user = json.data?.user
    if (!user) {
      throw new PlatformFetchError(
        'GITHUB',
        json.errors?.[0]?.message ?? `User "${handle}" not found`,
      )
    }

    const days = user.contributionsCollection.contributionCalendar.weeks.flatMap(
      (w) => w.contributionDays,
    )
    const today = new Date().toISOString().slice(0, 10)
    const todayEntry = days.find((d) => d.date === today)

    // Language breakdown weighted by repo count
    const langCounts = new Map<string, number>()
    for (const repo of user.repositories.nodes) {
      const lang = repo.primaryLanguage?.name
      if (lang) langCounts.set(lang, (langCounts.get(lang) ?? 0) + 1)
    }
    const totalLangRepos = [...langCounts.values()].reduce((a, b) => a + b, 0) || 1
    const topLanguages = [...langCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 6)
      .map(([name, count]) => ({ name, percentage: Math.round((count / totalLangRepos) * 100) }))

    // Current contribution streak (walk backwards from today)
    let streak = 0
    const sorted = [...days].sort((a, b) => (a.date < b.date ? 1 : -1))
    for (const day of sorted) {
      if (day.date > today) continue
      if (day.contributionCount > 0) streak += 1
      else if (day.date !== today) break // today with 0 doesn't break the streak yet
    }

    const details: GithubDetails = {
      followers: user.followers.totalCount,
      following: user.following.totalCount,
      publicRepos: user.repositories.totalCount,
      totalStars: user.repositories.nodes.reduce((sum, r) => sum + r.stargazerCount, 0),
      contributionsToday: todayEntry?.contributionCount ?? 0,
      contributionsThisYear: user.contributionsCollection.contributionCalendar.totalContributions,
      contributionCalendar: days.map((d) => ({
        date: d.date,
        count: d.contributionCount,
        level: LEVEL_MAP[d.contributionLevel] ?? 0,
      })),
      topLanguages,
    }

    return {
      platform: 'GITHUB',
      handle,
      rating: null,
      maxRating: null,
      rank: null,
      solvedCount: null,
      streak,
      details: details as unknown as Record<string, unknown>,
      capturedAt: new Date(),
    }
  }
}
