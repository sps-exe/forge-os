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
    let user = await prisma.user.findUnique({
      where: { id: session.user.id },
      include: { profile: true },
    })

    if (!user) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'User not found' } },
        { status: 404 }
      )
    }

    // Ensure user has a profile record
    if (!user.profile) {
      const newProfile = await prisma.profile.create({
        data: { userId: user.id },
      })
      user = { ...user, profile: newProfile }
    }

    return NextResponse.json({
      success: true,
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        level: 1,
        totalXp: 0,
        currentStreak: 0,
        profile: user.profile
          ? {
              displayName: user.profile.displayName,
              bio: user.profile.bio,
              timezone: user.profile.timezone,
            }
          : null,
      },
    })
  } catch (err) {
    console.error('Error fetching me:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch user profile' } },
      { status: 500 }
    )
  }
}
