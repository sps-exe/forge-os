import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      unlocked: [],
      available: [
        {
          id: 'first-step',
          title: 'First Step',
          description: 'Complete your first daily task',
          xp: 50,
        },
      ],
    },
  })
}
