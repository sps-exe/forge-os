import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      quests: [
        {
          id: 'q-1',
          title: 'Solve 5 LeetCode Mediums',
          progress: 2,
          total: 5,
          xpReward: 200,
        },
      ],
    },
  })
}
