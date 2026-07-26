import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@forge/database'

const INTERVAL_STEPS = [1, 3, 7, 14, 30]

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth()
  if (!session?.user?.id) {
    return NextResponse.json(
      { success: false, error: { code: 'UNAUTHORIZED', message: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const { id } = await params

  try {
    const item = await prisma.revisionItem.findUnique({ where: { id } })

    if (!item) {
      return NextResponse.json(
        { success: false, error: { code: 'NOT_FOUND', message: 'Revision item not found' } },
        { status: 404 }
      )
    }

    if (item.userId !== session.user.id) {
      return NextResponse.json(
        { success: false, error: { code: 'FORBIDDEN', message: 'Not your revision item' } },
        { status: 403 }
      )
    }

    // Advance spaced-repetition interval: 1 → 3 → 7 → 14 → 30 days
    const currentStepIndex = INTERVAL_STEPS.indexOf(item.intervalDays)
    const nextStepIndex = Math.min(
      INTERVAL_STEPS.length - 1,
      (currentStepIndex >= 0 ? currentStepIndex : 0) + 1
    )
    const nextIntervalDays = INTERVAL_STEPS[nextStepIndex] ?? 1

    const nextReviewAt = new Date()
    nextReviewAt.setUTCDate(nextReviewAt.getUTCDate() + nextIntervalDays)

    await prisma.revisionItem.update({
      where: { id },
      data: {
        intervalDays: nextIntervalDays,
        reviewCount: item.reviewCount + 1,
        nextReviewAt,
      },
    })

    // Award XP for completing a revision
    await prisma.xpEvent.create({
      data: {
        userId: session.user.id,
        amount: 25,
        reason: `Reviewed revision card: ${item.title}`,
      },
    })

    // Return updated RevisionOverview
    const allItems = await prisma.revisionItem.findMany({
      where: { userId: session.user.id },
      orderBy: { nextReviewAt: 'asc' },
    })

    const now = new Date()
    const dueItems = allItems
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
    const upcomingItems = allItems
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

    return NextResponse.json({
      success: true,
      data: {
        dueCount: dueItems.length,
        totalCount: allItems.length,
        dueItems,
        upcomingItems,
      },
    })
  } catch (err) {
    console.error('Error recording revision review:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to record review' } },
      { status: 500 }
    )
  }
}
