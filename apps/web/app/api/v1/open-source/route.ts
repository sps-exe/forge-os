import { NextResponse } from 'next/server'

export async function GET() {
  return NextResponse.json({
    success: true,
    data: {
      repositories: [
        {
          name: 'vercel/next.js',
          stars: 120000,
          description: 'The React Framework',
          url: 'https://github.com/vercel/next.js',
        },
      ],
    },
  })
}
