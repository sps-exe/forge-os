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

  const historyRecords = await prisma.taskHistory.findMany({
    where: { userId: session.user.id },
    orderBy: { date: 'desc' },
    take: 60,
  })

  // Format as date -> completed count map
  const daysMap = new Map<string, { completedCount: number; totalCount: number }>()

  for (const item of historyRecords) {
    const dateStr = new Date(item.date).toISOString().split('T')[0] ?? ''
    const existing = daysMap.get(dateStr) ?? { completedCount: 0, totalCount: 0 }
    existing.totalCount += 1
    if (item.status === 'COMPLETED') {
      existing.completedCount += 1
    }
    daysMap.set(dateStr, existing)
  }

  const history = Array.from(daysMap.entries()).map(([date, counts]) => ({
    date,
    completedCount: counts.completedCount,
    totalCount: counts.totalCount,
  }))

  return NextResponse.json({
    success: true,
    data: {
      history,
    },
  })
}
