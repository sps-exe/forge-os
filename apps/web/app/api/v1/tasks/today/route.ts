import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      date: new Date().toISOString().split('T')[0],
      tasks: [
        {
          id: 't-1',
          type: 'LEETCODE_DAILY',
          title: 'Two Sum & Array Manipulation',
          url: 'https://leetcode.com/problems/two-sum/',
          status: 'PENDING',
        },
        {
          id: 't-2',
          type: 'CS_READING',
          title: 'Read System Design & Architecture Patterns',
          url: 'https://github.com/donnemartin/system-design-primer',
          status: 'PENDING',
        },
      ],
    },
  })
}
