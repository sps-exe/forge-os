import { afterEach, describe, expect, it, vi } from 'vitest'
import { LeetCodeProvider } from './leetcode.provider'

const mockResponse = {
  data: {
    matchedUser: {
      username: 'demo',
      profile: { ranking: 12345 },
      submitStatsGlobal: {
        acSubmissionNum: [
          { difficulty: 'All', count: 250 },
          { difficulty: 'Easy', count: 100 },
          { difficulty: 'Medium', count: 120 },
          { difficulty: 'Hard', count: 30 },
        ],
      },
    },
    allQuestionsCount: [
      { difficulty: 'All', count: 3000 },
      { difficulty: 'Easy', count: 800 },
      { difficulty: 'Medium', count: 1600 },
      { difficulty: 'Hard', count: 600 },
    ],
    userContestRanking: { rating: 1834.6, globalRanking: 5000, attendedContestsCount: 12 },
  },
}

describe('LeetCodeProvider', () => {
  afterEach(() => vi.restoreAllMocks())

  it('maps GraphQL response into normalized stats', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => mockResponse }))

    const provider = new LeetCodeProvider()
    const stats = await provider.fetchStats('demo')

    expect(stats.platform).toBe('LEETCODE')
    expect(stats.solvedCount).toBe(250)
    expect(stats.rating).toBe(1835)
    expect(stats.rank).toBe('#12,345')
    expect(stats.details).toMatchObject({
      easySolved: 100,
      mediumSolved: 120,
      hardSolved: 30,
      mediumTotal: 1600,
    })
  })

  it('throws PlatformFetchError for unknown users', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({ ok: true, json: async () => ({ data: { matchedUser: null } }) }),
    )

    const provider = new LeetCodeProvider()
    await expect(provider.fetchStats('ghost')).rejects.toThrow('not found')
  })
})
