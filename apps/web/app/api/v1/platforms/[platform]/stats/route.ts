import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

export const dynamic = 'force-dynamic'

// ── LeetCode ─────────────────────────────────────────────────────────────────

async function fetchLeetCodeStats(username: string) {
  // Strategy 1: alfa-leetcode-api (open proxy, no CSRF needed)
  try {
    const res = await fetch(
      `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`,
      {
        headers: { 'User-Agent': 'forge-app/1.0' },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store'
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data && !data.errors) {
        return {
          rating: null,
          maxRating: null,
          solvedCount: data.totalSolved ?? 0,
          rank: data.ranking ? `#${Number(data.ranking).toLocaleString()}` : null,
          streak: null,
          details: {
            easySolved: data.easySolved ?? 0,
            easyTotal: data.totalEasy ?? 0,
            mediumSolved: data.mediumSolved ?? 0,
            mediumTotal: data.totalMedium ?? 0,
            hardSolved: data.hardSolved ?? 0,
            hardTotal: data.totalHard ?? 0,
          },
        }
      }
    }
  } catch (e) {
    console.warn('[LeetCode] alfa-leetcode-api failed:', e)
  }

  // Strategy 2: Direct LeetCode GraphQL (works from some server regions)
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStatsGlobal { acSubmissionNum { difficulty count } }
          profile { ranking }
        }
        allQuestionsCount { difficulty count }
        userContestRanking(username: $username) { rating globalRanking }
      }
    `
    const res = await fetch('https://leetcode.com/graphql/', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        Referer: 'https://leetcode.com/',
        Origin: 'https://leetcode.com',
        'x-csrftoken': 'na',
      },
      body: JSON.stringify({ query, variables: { username } }),
      signal: AbortSignal.timeout(8000),
    })
    if (res.ok) {
      const json = await res.json()
      const user = json?.data?.matchedUser
      if (user) {
        const solved = Object.fromEntries(
          (user.submitStatsGlobal?.acSubmissionNum ?? []).map(
            (s: { difficulty: string; count: number }) => [s.difficulty, s.count]
          )
        )
        const totals = Object.fromEntries(
          (json?.data?.allQuestionsCount ?? []).map(
            (s: { difficulty: string; count: number }) => [s.difficulty, s.count]
          )
        )
        const contestRating = json?.data?.userContestRanking?.rating ?? null
        return {
          rating: contestRating ? Math.round(contestRating) : null,
          maxRating: contestRating ? Math.round(contestRating) : null,
          solvedCount: solved['All'] ?? 0,
          rank:
            user.profile?.ranking
              ? `#${Number(user.profile.ranking).toLocaleString()}`
              : null,
          streak: null,
          details: {
            easySolved: solved['Easy'] ?? 0,
            easyTotal: totals['Easy'] ?? 0,
            mediumSolved: solved['Medium'] ?? 0,
            mediumTotal: totals['Medium'] ?? 0,
            hardSolved: solved['Hard'] ?? 0,
            hardTotal: totals['Hard'] ?? 0,
          },
        }
      }
    }
  } catch (e) {
    console.warn('[LeetCode] GraphQL direct fetch failed:', e)
  }

  // Strategy 3: leetcode-stats-api.herokuapp.com
  try {
    const res = await fetch(
      `https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(username)}`,
      {
        headers: { 'User-Agent': 'forge-app/1.0' },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (res.ok) {
      const data = await res.json()
      if (data.status === 'success') {
        return {
          rating: null,
          maxRating: null,
          solvedCount: data.totalSolved ?? 0,
          rank: data.ranking ? `#${Number(data.ranking).toLocaleString()}` : null,
          streak: null,
          details: {
            easySolved: data.easySolved ?? 0,
            easyTotal: data.totalEasy ?? 0,
            mediumSolved: data.mediumSolved ?? 0,
            mediumTotal: data.totalMedium ?? 0,
            hardSolved: data.hardSolved ?? 0,
            hardTotal: data.totalHard ?? 0,
          },
        }
      }
    }
  } catch (e) {
    console.warn('[LeetCode] heroku stats-api failed:', e)
  }

  // All strategies failed — return null so caller returns 502
  return null
}

// ── Codeforces ────────────────────────────────────────────────────────────────

async function fetchCodeforcesStats(handle: string) {
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
      {
        next: { revalidate: 300 },
        signal: AbortSignal.timeout(8000),
      }
    )
    if (!res.ok) return null
    const json = await res.json()
    if (json.status !== 'OK') return null
    const user = json.result[0]
    return {
      rating: user.rating ?? null,
      maxRating: user.maxRating ?? null,
      solvedCount: null,
      rank: user.rank ?? null,
      streak: null,
      details: { titlePhoto: user.titlePhoto, maxRank: user.maxRank },
    }
  } catch (e) {
    console.warn('[Codeforces] fetch failed:', e)
    return null
  }
}

// ── Route handler ─────────────────────────────────────────────────────────────

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ platform: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const resolvedParams = await params
  const platformStr = resolvedParams.platform.toUpperCase() as 'LEETCODE' | 'CODEFORCES' | 'GITHUB'

  try {
    const account = await prisma.codingAccount.findUnique({
      where: { userId_platform: { userId: session.user.id, platform: platformStr } },
    })

    if (!account) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Account not connected' } },
        { status: 404 }
      )
    }

    let stats = null
    if (platformStr === 'LEETCODE') {
      stats = await fetchLeetCodeStats(account.handle)
    } else if (platformStr === 'CODEFORCES') {
      stats = await fetchCodeforcesStats(account.handle)
    } else {
      return NextResponse.json(
        { success: false, error: { code: 'UNSUPPORTED', message: `GitHub stats not available via this route` } },
        { status: 400 }
      )
    }

    if (!stats) {
      return NextResponse.json(
        { success: false, error: { code: 'FETCH_FAILED', message: `Could not fetch stats for ${account.handle} — LeetCode may be temporarily blocking external requests` } },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, data: { platform: platformStr, handle: account.handle, ...stats, capturedAt: new Date().toISOString() } })
  } catch (err) {
    console.error('Error fetching platform stats:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } },
      { status: 500 }
    )
  }
}
