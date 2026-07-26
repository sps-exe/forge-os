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
