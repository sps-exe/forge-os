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

async function fetchVercelApi(username: string): Promise<LCStats | null> {
  try {
    const res = await fetch(
      `https://leetcode-api-faisalshohag.vercel.app/${encodeURIComponent(username)}`,
      {
        headers: { 'User-Agent': 'forge-app/1.0' },
        signal: AbortSignal.timeout(6000),
        cache: 'no-store',
      }
    )
    if (!res.ok) return null
    const data = await res.json()
    if (!data || typeof data.totalSolved !== 'number') return null
    return {
      rating: null,
      maxRating: null,
      solvedCount: data.totalSolved,
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

async function fetchAlfa(username: string): Promise<LCStats | null> {
  try {
    const res = await fetch(
      `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(username)}`,
      {
        headers: { 'User-Agent': 'forge-app/1.0' },
        signal: AbortSignal.timeout(10000),
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

/**
 * Try the given handle + hyphen↔underscore variants across fast Vercel proxy then Alfa proxy.
 * Returns { stats, resolvedHandle } for the first combination that works.
 */
async function fetchLeetCodeStats(
  username: string
): Promise<{ stats: LCStats; resolvedHandle: string } | null> {
  const candidates = Array.from(
    new Set([username, username.replaceAll('-', '_'), username.replaceAll('_', '-')])
  )

  // Strategy 1: Fast Vercel LeetCode Proxy (200ms, no cold starts)
  for (const candidate of candidates) {
    const result = await fetchVercelApi(candidate)
    if (result) return { stats: result, resolvedHandle: candidate }
  }

  // Strategy 2: Alfa LeetCode API (Render backup)
  for (const candidate of candidates) {
    const result = await fetchAlfa(candidate)
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
        cache: 'no-store',
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

// ── GitHub ────────────────────────────────────────────────────────────────────

async function fetchGithubStats(username: string) {
  try {
    const [userRes, contribRes] = await Promise.all([
      fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
        headers: { 'User-Agent': 'forge-app/1.0' },
        signal: AbortSignal.timeout(6000),
        cache: 'no-store',
      }),
      fetch(`https://github-contributions.vercel.app/api/v1/${encodeURIComponent(username)}`, {
        headers: { 'User-Agent': 'forge-app/1.0' },
        signal: AbortSignal.timeout(8000),
        cache: 'no-store',
      }),
    ])

    if (!userRes.ok) return null
    const user = await userRes.json()

    let contributionsToday = 0
    let contributionsThisYear = 0
    let streak = 0
    let calendar: { date: string; count: number; level: number }[] = []

    if (contribRes.ok) {
      const contribData = await contribRes.json()
      const rawCalendar: Array<{ date: string; count: number; intensity: string }> =
        contribData.contributions ?? []

      const thisYearStr = new Date().getFullYear().toString()
      const yearObj = contribData.years?.find((y: { year: string }) => y.year === thisYearStr)
      contributionsThisYear = yearObj?.total ?? 0

      const todayStr = new Date().toISOString().split('T')[0]
      const todayItem = rawCalendar.find((c) => c.date === todayStr)
      contributionsToday = todayItem?.count ?? 0

      // Map calendar for heatmap
      calendar = rawCalendar.map((c) => ({
        date: c.date,
        count: c.count,
        level: Math.min(4, Math.max(0, parseInt(c.intensity || '0', 10))),
      }))

      // Calculate streak
      const sorted = [...rawCalendar].sort((a, b) => b.date.localeCompare(a.date))
      let current = 0
      for (let i = 0; i < sorted.length; i++) {
        if (sorted[i].count > 0) {
          current++
        } else {
          // Allow today to be 0 if yesterday had contributions
          if (i === 0 && sorted[i].date === todayStr) continue
          break
        }
      }
      streak = current
    }

    return {
      rating: null,
      maxRating: null,
      solvedCount: null,
      rank: null,
      streak,
      details: {
        followers: user.followers ?? 0,
        following: user.following ?? 0,
        publicRepos: user.public_repos ?? 0,
        totalStars: 0,
        contributionsToday,
        contributionsThisYear,
        contributionCalendar: calendar,
        topLanguages: [],
      },
    }
  } catch (e) {
    console.warn('[GitHub] stats fetch failed:', e)
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

      // Self-heal: if we found a different (correct) variant (e.g. sps_exe instead of sps-exe), update DB
      if (result.resolvedHandle !== account.handle) {
        await prisma.codingAccount
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

    if (platformStr === 'GITHUB') {
      const stats = await fetchGithubStats(account.handle)
      if (!stats) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'FETCH_FAILED',
              message: `Could not fetch GitHub stats for "${account.handle}".`,
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
      { success: false, error: { code: 'UNSUPPORTED', message: 'Platform not supported' } },
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
