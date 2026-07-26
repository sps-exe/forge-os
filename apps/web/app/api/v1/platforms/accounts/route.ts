import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  try {
    const accounts = await prisma.codingAccount.findMany({
      where: { userId: session.user.id },
    })

    // Check if user has a linked GitHub account in Auth.js
    const githubAccount = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: 'github' },
    })

    const hasGithub = accounts.some((a) => a.platform === 'GITHUB')
    if (githubAccount && !hasGithub) {
      const handleName = session.user.name?.toLowerCase().replace(/\s+/g, '') || 'connected'
      const newGithub = await prisma.codingAccount.upsert({
        where: { userId_platform: { userId: session.user.id, platform: 'GITHUB' } },
        update: {},
        create: {
          userId: session.user.id,
          platform: 'GITHUB',
          handle: handleName,
          verified: true,
        },
      })
      accounts.push(newGithub)
    }

    return NextResponse.json({
      success: true,
      data: accounts.map((a) => ({
        id: a.id,
        platform: a.platform,
        handle: a.handle,
        verified: a.verified,
      })),
    })
  } catch (err) {
    console.error('Error fetching accounts:', err)
    return NextResponse.json({ success: true, data: [] })
  }
}
