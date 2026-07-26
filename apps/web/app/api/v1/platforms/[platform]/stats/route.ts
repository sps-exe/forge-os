import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

async function fetchLeetCodeStats(username: string) {
  // Strategy 1: Direct LeetCode GraphQL with Browser Headers
  try {
    const query = `
      query getUserProfile($username: String!) {
        matchedUser(username: $username) {
          submitStats {
            acSubmissionNum {
              difficulty
              count
            }
          }
          profile {
            ranking
          }
          userContestRanking {
            rating
            attendedContestsCount
          }
        }
      }
    `
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        Referer: 'https://leetcode.com',
        Origin: 'https://leetcode.com',
      },
      body: JSON.stringify({ query, variables: { username } }),
      next: { revalidate: 300 },
    })

    if (res.ok) {
      const json = await res.json()
      const user = json?.data?.matchedUser
      if (user) {
        const solvedList: { difficulty: string; count: number }[] =
          user.submitStats?.acSubmissionNum ?? []
        const total =
          solvedList.find((d: { difficulty: string }) => d.difficulty === 'All')?.count ?? 0
        const easy =
          solvedList.find((d: { difficulty: string }) => d.difficulty === 'Easy')?.count ?? 0
        const medium =
          solvedList.find((d: { difficulty: string }) => d.difficulty === 'Medium')?.count ?? 0
        const hard =
          solvedList.find((d: { difficulty: string }) => d.difficulty === 'Hard')?.count ?? 0
        const rating = Math.round(user.userContestRanking?.rating ?? 0) || null
        const ranking = user.profile?.ranking ?? null

        return {
          rating,
          maxRating: rating,
          solvedCount: total,
          rank: ranking ? `#${ranking.toLocaleString()}` : null,
          streak: null,
          details: { easySolved: easy, mediumSolved: medium, hardSolved: hard },
        }
      }
    }
  } catch (e) {
    console.warn('LeetCode GraphQL fetch failed, trying fallback API:', e)
  }

  // Strategy 2: Fallback to leetcode-stats-api
  try {
    const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(username)}`, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      },
      next: { revalidate: 300 },
    })

    if (res.ok) {
      const data = await res.json()
      if (data.status === 'success') {
        return {
          rating: null,
          maxRating: null,
          solvedCount: data.totalSolved ?? 0,
          rank: data.ranking ? `#${data.ranking.toLocaleString()}` : null,
          streak: null,
          details: {
            easySolved: data.easySolved ?? 0,
            mediumSolved: data.mediumSolved ?? 0,
            hardSolved: data.hardSolved ?? 0,
          },
        }
      }
    }
  } catch (e) {
    console.warn('LeetCode stats API fallback failed:', e)
  }

  // Strategy 3: Graceful fallback object so UI never crashes or shows 502
  return {
    rating: null,
    maxRating: null,
    solvedCount: 0,
    rank: null,
    streak: null,
    details: { easySolved: 0, mediumSolved: 0, hardSolved: 0 },
  }
}

async function fetchCodeforcesStats(handle: string) {
  const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`, {
    next: { revalidate: 300 },
  })
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
}

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
    }

    if (!stats) {
      return NextResponse.json(
        { success: false, error: { code: 'FETCH_FAILED', message: `Could not fetch stats for ${account.handle}` } },
        { status: 502 }
      )
    }

    return NextResponse.json({ success: true, data: stats })
  } catch (err) {
    console.error('Error fetching platform stats:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch stats' } },
      { status: 500 }
    )
  }
}
