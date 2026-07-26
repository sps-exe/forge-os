import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

export async function DELETE(
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

  try {
    const resolvedParams = await params
    const platformStr = resolvedParams.platform.toUpperCase()

    await prisma.codingAccount.deleteMany({
      where: {
        userId: session.user.id,
        platform: platformStr as 'LEETCODE' | 'CODEFORCES' | 'GITHUB',
      },
    })

    return NextResponse.json({ success: true, data: null })
  } catch (err) {
    console.error('Error disconnecting account:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to disconnect account' } },
      { status: 500 }
    )
  }
}
