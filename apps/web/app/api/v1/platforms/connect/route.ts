import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

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
    if (!platform || !handle) {
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

    const account = await prisma.codingAccount.upsert({
      where: {
        userId_platform: {
          userId: session.user.id,
          platform: upperPlatform as 'LEETCODE' | 'CODEFORCES' | 'GITHUB',
        },
      },
      update: {
        handle: String(handle).trim(),
        verified: true,
      },
      create: {
        userId: session.user.id,
        platform: upperPlatform as 'LEETCODE' | 'CODEFORCES' | 'GITHUB',
        handle: String(handle).trim(),
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
