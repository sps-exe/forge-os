import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

function toRevisionOverview(items: Array<{
  id: string
  title: string
  topic: string
  difficulty: string
  notes: string | null
  solutionUrl: string | null
  nextReviewAt: Date
  intervalDays: number
  reviewCount: number
}>) {
  const now = new Date()
  const dueItems = items
    .filter((i) => i.nextReviewAt <= now)
    .map((i) => ({
      id: i.id,
      title: i.title,
      topic: i.topic,
      difficulty: i.difficulty,
      notes: i.notes,
      solutionUrl: i.solutionUrl,
      nextReviewAt: i.nextReviewAt.toISOString(),
      intervalDays: i.intervalDays,
      reviewCount: i.reviewCount,
    }))
  const upcomingItems = items
    .filter((i) => i.nextReviewAt > now)
    .map((i) => ({
      id: i.id,
      title: i.title,
      topic: i.topic,
      difficulty: i.difficulty,
      notes: i.notes,
      solutionUrl: i.solutionUrl,
      nextReviewAt: i.nextReviewAt.toISOString(),
      intervalDays: i.intervalDays,
      reviewCount: i.reviewCount,
    }))

  return {
    dueCount: dueItems.length,
    totalCount: items.length,
    dueItems,
    upcomingItems,
  }
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  try {
    const items = await prisma.revisionItem.findMany({
      where: { userId: session.user.id },
      orderBy: { nextReviewAt: 'asc' },
    })

    return NextResponse.json({
      success: true,
      data: toRevisionOverview(items),
    })
  } catch (err) {
    console.error('Error fetching revision items:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to fetch revision items' } },
      { status: 500 }
    )
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
    const body = await req.json()
    const { title, topic, difficulty, notes, solutionUrl } = body

    if (!title || !topic) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Title and topic are required' } },
        { status: 400 }
      )
    }

    await prisma.revisionItem.create({
      data: {
        userId: session.user.id,
        title,
        topic,
        difficulty: difficulty ?? 'Medium',
        notes: notes || null,
        solutionUrl: solutionUrl || null,
        nextReviewAt: new Date(), // Due immediately so user can review right away
      },
    })

    // Return the updated overview so the UI refreshes correctly
    const allItems = await prisma.revisionItem.findMany({
      where: { userId: session.user.id },
      orderBy: { nextReviewAt: 'asc' },
    })

    return NextResponse.json({ success: true, data: toRevisionOverview(allItems) })
  } catch (err) {
    console.error('Error creating revision item:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to create revision item' } },
      { status: 500 }
    )
  }
}
