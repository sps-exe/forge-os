import { Injectable } from '@nestjs/common'
import type { CodeforcesDetails, Contest, PlatformStats } from '@forge/shared'
import { PlatformFetchError, type PlatformProvider } from './provider.interface'

const CF_API = 'https://codeforces.com/api'

interface CfUser {
  handle: string
  rating?: number
  maxRating?: number
  rank?: string
  maxRank?: string
  contribution?: number
  friendOfCount?: number
}

interface CfRatingChange {
  contestId: number
  contestName: string
  rank: number
  oldRating: number
  newRating: number
  ratingUpdateTimeSeconds: number
}

interface CfContest {
  id: number
  name: string
  phase: 'BEFORE' | 'CODING' | 'FINISHED' | string
  startTimeSeconds?: number
  durationSeconds: number
}

@Injectable()
export class CodeforcesProvider implements PlatformProvider {
  async validateHandle(handle: string): Promise<boolean> {
    try {
      await this.call<CfUser[]>(`user.info?handles=${encodeURIComponent(handle)}`)
      return true
    } catch {
      return false
    }
  }

  async fetchStats(handle: string): Promise<PlatformStats> {
    const [users, ratingHistory] = await Promise.all([
      this.call<CfUser[]>(`user.info?handles=${encodeURIComponent(handle)}`),
      this.call<CfRatingChange[]>(`user.rating?handle=${encodeURIComponent(handle)}`).catch(
        () => [] as CfRatingChange[],
      ),
    ])

    const user = users[0]
    if (!user) throw new PlatformFetchError('CODEFORCES', `User "${handle}" not found`)

    const details: CodeforcesDetails = {
      contribution: user.contribution ?? null,
      friendOfCount: user.friendOfCount ?? null,
      ratingHistory: ratingHistory.map((r) => ({
        contestId: r.contestId,
        contestName: r.contestName,
        rank: r.rank,
        oldRating: r.oldRating,
        newRating: r.newRating,
        at: new Date(r.ratingUpdateTimeSeconds * 1000),
      })),
    }

    return {
      platform: 'CODEFORCES',
      handle: user.handle,
      rating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
      rank: user.rank ?? null,
      solvedCount: null,
      streak: null,
      details: details as unknown as Record<string, unknown>,
      capturedAt: new Date(),
    }
  }

  async fetchUpcomingContests(): Promise<Contest[]> {
    const contests = await this.call<CfContest[]>('contest.list?gym=false')
    return contests
      .filter((c) => c.phase === 'BEFORE' && c.startTimeSeconds)
      .sort((a, b) => (a.startTimeSeconds ?? 0) - (b.startTimeSeconds ?? 0))
      .slice(0, 10)
      .map((c) => ({
        id: `cf-${c.id}`,
        platform: 'CODEFORCES' as const,
        name: c.name,
        url: `https://codeforces.com/contests/${c.id}`,
        startsAt: new Date((c.startTimeSeconds ?? 0) * 1000),
        durationSeconds: c.durationSeconds,
        phase: 'UPCOMING' as const,
      }))
  }

  private async call<T>(path: string): Promise<T> {
    const res = await fetch(`${CF_API}/${path}`)
    if (!res.ok) throw new PlatformFetchError('CODEFORCES', `HTTP ${res.status}`)
    const json = (await res.json()) as { status: string; result?: T; comment?: string }
    if (json.status !== 'OK' || json.result === undefined) {
      throw new PlatformFetchError('CODEFORCES', json.comment ?? 'API error')
    }
    return json.result
  }
}
