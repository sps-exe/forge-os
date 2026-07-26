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

  const todayStr = new Date().toISOString().split('T')[0] ?? ''
  const todayDate = new Date(`${todayStr}T00:00:00.000Z`)

  let tasks = await prisma.dailyTask.findMany({
    where: {
      userId: session.user.id,
      date: todayDate,
    },
    orderBy: { createdAt: 'asc' },
  })

  // If no tasks exist for today, seed default tasks
  if (tasks.length === 0) {
    await prisma.dailyTask.createMany({
      data: [
        {
          userId: session.user.id,
          type: 'LEETCODE_DAILY',
          title: 'Daily Problem Solving',
          url: 'https://leetcode.com/problemset/all/',
          status: 'PENDING',
          date: todayDate,
        },
        {
          userId: session.user.id,
          type: 'CS_READING',
          title: 'System Design & CS Core Reading',
          url: 'https://github.com/donnemartin/system-design-primer',
          status: 'PENDING',
          date: todayDate,
        },
        {
          userId: session.user.id,
          type: 'GITHUB_CONTRIBUTION',
          title: 'Push Code / Make GitHub Contribution',
          url: 'https://github.com',
          status: 'PENDING',
          date: todayDate,
        },
      ],
    })

    tasks = await prisma.dailyTask.findMany({
      where: {
        userId: session.user.id,
        date: todayDate,
      },
      orderBy: { createdAt: 'asc' },
    })
  }

  return NextResponse.json({
    success: true,
    data: {
      date: todayStr,
      tasks: tasks.map((t) => ({
        id: t.id,
        type: t.type,
        title: t.title,
        url: t.url,
        status: t.status,
      })),
    },
  })
}

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
    const { taskId, status } = body

    if (!taskId || !status) {
      return NextResponse.json(
        { success: false, error: { code: 'BAD_REQUEST', message: 'Missing taskId or status' } },
        { status: 400 }
      )
    }

    const updated = await prisma.dailyTask.update({
      where: { id: taskId, userId: session.user.id },
      data: { status },
    })

    return NextResponse.json({ success: true, data: updated })
  } catch (err) {
    console.error('Error updating task status:', err)
    return NextResponse.json(
      { success: false, error: { code: 'INTERNAL_ERROR', message: 'Failed to update task status' } },
      { status: 500 }
    )
  }
}
