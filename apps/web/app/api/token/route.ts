import { NextResponse } from 'next/server'
import { getApiToken } from '@/lib/api-token'

/** The client fetches its API bearer token here; token lives 15 minutes. */
export async function GET() {
  const token = await getApiToken()
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return NextResponse.json({ token })
}
