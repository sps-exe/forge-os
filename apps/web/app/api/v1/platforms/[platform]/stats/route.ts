import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'

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
  const platform = resolvedParams.platform.toUpperCase()

  return NextResponse.json({
    success: true,
    data: {
      platform,
      rating: 1500,
      solvedCount: 42,
      streak: 5,
      details: {},
    },
  })
}
