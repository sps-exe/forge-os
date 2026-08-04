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

  const oneYearAgo = new Date()
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1)

  const historyRecords = await prisma.taskHistory.findMany({
    where: {
      userId: session.user.id,
      date: { gte: oneYearAgo }
    },
    orderBy: { date: 'desc' },
  })

  // Format as date -> completed count map
  const daysMap = new Map<string, { completedCount: number; totalCount: number; tasks: any[] }>()

  for (const item of historyRecords) {
    const dateStr = new Date(item.date).toISOString().split('T')[0] ?? ''
    const existing = daysMap.get(dateStr) ?? { completedCount: 0, totalCount: 0, tasks: [] }
    existing.totalCount += 1
    if (item.status === 'COMPLETED') {
      existing.completedCount += 1
    }
    // We omit adding full task objects for now to keep response lightweight
    daysMap.set(dateStr, existing)
  }

  const days = Array.from(daysMap.entries()).map(([date, counts]) => ({
    date,
    completedCount: counts.completedCount,
    totalCount: counts.totalCount,
    tasks: counts.tasks,
  }))

  return NextResponse.json({
    success: true,
    data: {
      days,
    },
  })
}
