import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  try {
    const body = await req.json()
    const { displayName, bio, timezone } = body as {
      displayName?: string
      bio?: string
      timezone?: string
    }

    const updatedProfile = await prisma.profile.upsert({
      where: { userId: session.user.id },
      update: {
        ...(displayName !== undefined && { displayName }),
        ...(bio !== undefined && { bio }),
        ...(timezone !== undefined && { timezone }),
      },
      create: {
        userId: session.user.id,
        displayName: displayName ?? null,
        bio: bio ?? null,
        timezone: timezone ?? 'UTC',
      },
    })

    return NextResponse.json({
      success: true,
      data: updatedProfile,
    })
  } catch (err) {
    console.error('Error updating profile:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update profile' } },
      { status: 500 }
    )
  }
}
