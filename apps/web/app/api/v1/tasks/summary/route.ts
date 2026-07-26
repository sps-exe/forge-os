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

  const tasksToday = await prisma.dailyTask.findMany({
    where: {
      userId: session.user.id,
      date: todayDate,
    },
  })

  const completedToday = tasksToday.filter((t) => t.status === 'COMPLETED').length
  const totalToday = tasksToday.length

  // Calculate streak based on task history
  const history = await prisma.taskHistory.findMany({
    where: { userId: session.user.id, status: 'COMPLETED' },
    orderBy: { date: 'desc' },
    take: 30,
  })

  const uniqueDays = Array.from(
    new Set(history.map((h) => new Date(h.date).toISOString().split('T')[0] ?? ''))
  )

  let currentStreak = 0
  if (completedToday > 0) {
    currentStreak += 1
  }

  for (const dayStr of uniqueDays) {
    if (!dayStr) continue
    const day = new Date(dayStr)
    const diffDays = Math.floor((Date.now() - day.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays <= currentStreak + 1) {
      currentStreak += 1
    } else {
      break
    }
  }

  return NextResponse.json({
    success: true,
    data: {
      currentStreak: Math.max(currentStreak, 1),
      longestStreak: Math.max(currentStreak, 1),
      completedToday,
      totalToday,
    },
  })
}
