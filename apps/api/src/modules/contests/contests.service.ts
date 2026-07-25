import { Inject, Injectable } from '@nestjs/common'
import { CACHE_MANAGER } from '@nestjs/cache-manager'
import type { Cache } from 'cache-manager'
import { CACHE_TTL, type Contest } from '@forge/shared'
import { CodeforcesProvider } from '../platforms/providers/codeforces.provider'

const CACHE_KEY = 'contests:upcoming'

@Injectable()
export class ContestsService {
  constructor(
    @Inject(CACHE_MANAGER) private readonly cache: Cache,
    private readonly codeforces: CodeforcesProvider,
  ) {}

  async getUpcoming(): Promise<Contest[]> {
    const cached = await this.cache.get<Contest[]>(CACHE_KEY)
    if (cached) return cached

    const [cf, lc] = await Promise.all([
      this.codeforces.fetchUpcomingContests().catch(() => [] as Contest[]),
      Promise.resolve(this.nextLeetCodeContests()),
    ])

    const contests = [...cf, ...lc].sort(
      (a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime(),
    )

    await this.cache.set(CACHE_KEY, contests, CACHE_TTL.contests * 1000)
    return contests
  }

  /**
   * LeetCode has no public contest API; its schedule is deterministic:
   * Weekly Contest every Sunday 02:30 UTC, Biweekly every other Saturday 14:30 UTC.
   */
  private nextLeetCodeContests(): Contest[] {
    const contests: Contest[] = []
    const now = new Date()

    // Next Sunday 02:30 UTC — weekly
    const nextSunday = new Date(now)
    nextSunday.setUTCDate(now.getUTCDate() + ((7 - now.getUTCDay()) % 7 || 7))
    nextSunday.setUTCHours(2, 30, 0, 0)
    if (nextSunday <= now) nextSunday.setUTCDate(nextSunday.getUTCDate() + 7)

    // Weekly contest number: #1 was 2016-08-21; they increment weekly.
    const weeklyEpoch = Date.UTC(2016, 7, 21, 2, 30)
    const weeklyNumber = Math.round((nextSunday.getTime() - weeklyEpoch) / (7 * 86400_000)) + 1

    contests.push({
      id: `lc-weekly-${weeklyNumber}`,
      platform: 'LEETCODE',
      name: `Weekly Contest ${weeklyNumber}`,
      url: `https://leetcode.com/contest/weekly-contest-${weeklyNumber}/`,
      startsAt: nextSunday,
      durationSeconds: 5400,
      phase: 'UPCOMING',
    })

    // Biweekly: #1 was 2019-06-01 14:30 UTC, every 14 days.
    const biweeklyEpoch = Date.UTC(2019, 5, 1, 14, 30)
    const periods = Math.ceil((now.getTime() - biweeklyEpoch) / (14 * 86400_000))
    const nextBiweekly = new Date(biweeklyEpoch + periods * 14 * 86400_000)
    const biweeklyNumber = periods + 1

    contests.push({
      id: `lc-biweekly-${biweeklyNumber}`,
      platform: 'LEETCODE',
      name: `Biweekly Contest ${biweeklyNumber}`,
      url: `https://leetcode.com/contest/biweekly-contest-${biweeklyNumber}/`,
      startsAt: nextBiweekly,
      durationSeconds: 5400,
      phase: 'UPCOMING',
    })

    return contests
  }
}
