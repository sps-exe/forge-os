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

  const items = await prisma.revisionItem.findMany({
    where: { userId: session.user.id },
    orderBy: { nextReviewAt: 'asc' },
  })

  return NextResponse.json({
    success: true,
    data: {
      items: items.map((item) => ({
        id: item.id,
        title: item.title,
        topic: item.topic,
        difficulty: item.difficulty,
        notes: item.notes,
        solutionUrl: item.solutionUrl,
        nextReviewAt: item.nextReviewAt.toISOString(),
        intervalDays: item.intervalDays,
        reviewCount: item.reviewCount,
      })),
    },
  })
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
    const body = await req.json()
    const { title, topic, difficulty, notes, solutionUrl } = body

    if (!title || !topic) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Title and topic are required' } },
        { status: 400 }
      )
    }

    const item = await prisma.revisionItem.create({
      data: {
        userId: session.user.id,
        title,
        topic,
        difficulty: difficulty ?? 'Medium',
        notes,
        solutionUrl,
        nextReviewAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // Review tomorrow
      },
    })

    return NextResponse.json({ success: true, data: item })
  } catch (err) {
    console.error('Error creating revision item:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create revision item' } },
      { status: 500 }
    )
  }
}
