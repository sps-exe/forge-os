import { afterEach, describe, expect, it, vi } from 'vitest'
import { CodeforcesProvider } from './codeforces.provider'

function mockCfFetch(routes: Record<string, unknown>) {
  return vi.fn().mockImplementation((url: string) => {
    const match = Object.entries(routes).find(([path]) => url.includes(path))
    if (!match) return Promise.resolve({ ok: false, status: 404 })
    return Promise.resolve({
      ok: true,
      json: async () => ({ status: 'OK', result: match[1] }),
    })
  })
}

describe('CodeforcesProvider', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps user.info + user.rating into normalized stats', async () => {
    vi.stubGlobal(
      'fetch',
      mockCfFetch({
        'user.info': [
          {
            handle: 'tourist',
            rating: 3850,
            maxRating: 4009,
            rank: 'legendary grandmaster',
            contribution: 128,
          },
        ],
        'user.rating': [
          {
            contestId: 1,
            contestName: 'Codeforces Round #1',
            rank: 1,
            oldRating: 0,
            newRating: 1500,
            ratingUpdateTimeSeconds: 1600000000,
          },
        ],
      }),
    )

    const provider = new CodeforcesProvider()
    const stats = await provider.fetchStats('tourist')

    expect(stats.platform).toBe('CODEFORCES')
    expect(stats.rating).toBe(3850)
    expect(stats.maxRating).toBe(4009)
    expect(stats.rank).toBe('legendary grandmaster')
    expect((stats.details as { ratingHistory: unknown[] }).ratingHistory).toHaveLength(1)
  })

  it('maps upcoming contests', async () => {
    const future = Math.floor(Date.now() / 1000) + 86400
    vi.stubGlobal(
      'fetch',
      mockCfFetch({
        'contest.list': [
          {
            id: 2000,
            name: 'Round A',
            phase: 'BEFORE',
            startTimeSeconds: future,
            durationSeconds: 7200,
          },
          {
            id: 1999,
            name: 'Done Round',
            phase: 'FINISHED',
            startTimeSeconds: future - 172800,
            durationSeconds: 7200,
          },
        ],
      }),
    )

    const provider = new CodeforcesProvider()
    const contests = await provider.fetchUpcomingContests()

    expect(contests).toHaveLength(1)
    expect(contests[0]).toMatchObject({ id: 'cf-2000', platform: 'CODEFORCES', phase: 'UPCOMING' })
  })
})
