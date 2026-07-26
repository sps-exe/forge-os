import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      currentStreak: 3,
      longestStreak: 7,
      completedToday: 1,
      totalToday: 2,
    },
  })
}
