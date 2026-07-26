import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: [
      {
        id: 'cf-1900',
        platform: 'CODEFORCES',
        title: 'Codeforces Round 990 (Div. 2)',
        startTime: new Date(Date.now() + 86400000).toISOString(),
        durationSeconds: 7200,
        url: 'https://codeforces.com/contests',
      },
      {
        id: 'lc-400',
        platform: 'LEETCODE',
        title: 'Weekly Contest 435',
        startTime: new Date(Date.now() + 172800000).toISOString(),
        durationSeconds: 5400,
        url: 'https://leetcode.com/contest/',
      },
    ],
  })
}
