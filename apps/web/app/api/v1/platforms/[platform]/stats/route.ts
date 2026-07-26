import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

export const dynamic = 'force-dynamic'

// ── Shared shape ──────────────────────────────────────────────────────────────

interface LCStats {
  rating: number | null
  maxRating: number | null
  solvedCount: number
  rank: string | null
  streak: number | null
  details: Record<string, unknown>
}

// ── LeetCode helpers ──────────────────────────────────────────────────────────

async function fetchAlfa(username: string): Promise<LCStats | null> {
  try {
    const res = await fetch(
      `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`,
      {
        headers: { 'User-Agent': 'forge-app/1.0' },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data || data.errors || typeof data.totalSolved !== 'number') return null
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
  } catch {
    return null
  }
}

async function fetchGraphQL(username: string): Promise<LCStats | null> {
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
    if (!res.ok) return null
    const json = await res.json()
    const user = json?.data?.matchedUser
    if (!user) return null
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
      rank: user.profile?.ranking
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
  } catch {
    return null
  }
}

/**
 * Try the given handle + hyphen↔underscore variants across alfa and GraphQL.
 * Returns { stats, resolvedHandle } for the first combination that works.
 */
async function fetchLeetCodeStats(
  username: string
): Promise<{ stats: LCStats; resolvedHandle: string } | null> {
  const candidates = Array.from(
    new Set([username, username.replaceAll('-', '_'), username.replaceAll('_', '-')])
  )

  // Strategy 1: alfa-leetcode-api (fastest, no CSRF)
  for (const candidate of candidates) {
    const result = await fetchAlfa(candidate)
    if (result) return { stats: result, resolvedHandle: candidate }
  }

  // Strategy 2: Direct LeetCode GraphQL
  for (const candidate of candidates) {
    const result = await fetchGraphQL(candidate)
    if (result) return { stats: result, resolvedHandle: candidate }
  }

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

    if (platformStr === 'LEETCODE') {
      const result = await fetchLeetCodeStats(account.handle)
      if (!result) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FETCH_FAILED',
              message: `Could not fetch LeetCode stats for "${account.handle}". The handle may not exist or the API is temporarily unavailable.`,
            },
          },
          { status: 502 }
        )
      }

      // Self-heal: if we found a different (correct) variant, silently fix the DB
      if (result.resolvedHandle !== account.handle) {
        prisma.codingAccount
          .update({
            where: { userId_platform: { userId: session.user.id, platform: 'LEETCODE' } },
            data: { handle: result.resolvedHandle },
          })
          .catch((e: unknown) => console.warn('[LeetCode] self-heal DB update failed:', e))
      }

      return NextResponse.json({
        success: true,
        data: {
          platform: platformStr,
          handle: result.resolvedHandle,
          ...result.stats,
          capturedAt: new Date().toISOString(),
        },
      })
    }

    if (platformStr === 'CODEFORCES') {
      const stats = await fetchCodeforcesStats(account.handle)
      if (!stats) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FETCH_FAILED',
              message: `Could not fetch Codeforces stats for "${account.handle}".`,
            },
          },
          { status: 502 }
        )
      }
      return NextResponse.json({
        success: true,
        data: { platform: platformStr, handle: account.handle, ...stats, capturedAt: new Date().toISOString() },
      })
    }

    return NextResponse.json(
      { success: false, error: { code: 'UNSUPPORTED', message: 'GitHub stats not available via this route' } },
      { status: 400 }
    )
  } catch (err) {
    console.error('Error fetching platform stats:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } },
      { status: 500 }
    )
  }
}
