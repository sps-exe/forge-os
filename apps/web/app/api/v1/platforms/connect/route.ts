import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

/**
 * Verify a LeetCode handle exists and return the canonical form.
 * Tries: original → hyphen↔underscore variant → lowercased variants.
 * Returns { handle: string } on success, or null if no variant works.
 */
async function resolveAndVerifyLeetCodeHandle(raw: string): Promise<string | null> {
  const normalized = raw.trim()
  const candidates = Array.from(
    new Set([
      normalized,
      normalized.replaceAll('-', '_'),
      normalized.replaceAll('_', '-'),
      normalized.toLowerCase(),
      normalized.toLowerCase().replaceAll('-', '_'),
      normalized.toLowerCase().replaceAll('_', '-'),
    ])
  )

  for (const candidate of candidates) {
    try {
      const res = await fetch(
        `https://alfa-leetcode-api.onrender.com/userProfile/${encodeURIComponent(candidate)}`,
        {
          headers: { 'User-Agent': 'forge-app/1.0' },
          signal: AbortSignal.timeout(8000),
          cache: 'no-store',
        }
      )
      if (!res.ok) continue
      const data = await res.json()
      // data.errors means user not found; absence means success
      if (data && !data.errors && typeof data.totalSolved === 'number') {
        return candidate // canonical handle that works
      }
    } catch {
      // timeout / network error — skip this candidate, not a definitive "not found"
    }
  }
  return null // none of the variants exist
}

/**
 * Verify a Codeforces handle exists via the official API.
 */
async function verifyCodeforcesHandle(handle: string): Promise<boolean> {
  try {
    const res = await fetch(
      `https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`,
      { signal: AbortSignal.timeout(8000) }
    )
    if (!res.ok) return false
    const json = await res.json()
    return json.status === 'OK' && Array.isArray(json.result) && json.result.length > 0
  } catch {
    return false
  }
}

export async function POST(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  try {
    const { platform, handle } = await req.json()
    if (!platform || !handle || typeof handle !== 'string' || !handle.trim()) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Platform and handle are required' } },
        { status: 400 }
      )
    }

    const validPlatforms = ['LEETCODE', 'CODEFORCES', 'GITHUB']
    const upperPlatform = String(platform).toUpperCase()
    if (!validPlatforms.includes(upperPlatform)) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Invalid platform' } },
        { status: 400 }
      )
    }

    let resolvedHandle = handle.trim()

    if (upperPlatform === 'LEETCODE') {
      const verified = await resolveAndVerifyLeetCodeHandle(resolvedHandle)
      if (!verified) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'HANDLE_NOT_FOUND',
              message: `LeetCode user "${resolvedHandle}" was not found. Please double-check your username on leetcode.com.`,
            },
          },
          { status: 422 }
        )
      }
      resolvedHandle = verified // use the canonical form
    }

    if (upperPlatform === 'CODEFORCES') {
      const exists = await verifyCodeforcesHandle(resolvedHandle)
      if (!exists) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: 'HANDLE_NOT_FOUND',
              message: `Codeforces handle "${resolvedHandle}" was not found. Please double-check your handle on codeforces.com.`,
            },
          },
          { status: 422 }
        )
      }
    }

    const account = await prisma.codingAccount.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: upperPlatform as 'LEETCODE' | 'CODEFORCES' | 'GITHUB',
        },
      },
      update: { handle: resolvedHandle, verified: true },
      create: {
        userId: session.user.id,
        platform: upperPlatform as 'LEETCODE' | 'CODEFORCES' | 'GITHUB',
        handle: resolvedHandle,
        verified: true,
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        id: account.id,
        platform: account.platform,
        handle: account.handle,
        verified: account.verified,
      },
    })
  } catch (err) {
    console.error('Error connecting account:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to connect account' } },
      { status: 500 }
    )
  }
}
