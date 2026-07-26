import { NextResponse } from 'next/server'

async function fetchCodeforcesContests() {
  try {
    const res = await fetch('https://codeforces.com/api/contest.list?gym=false', {
      next: { revalidate: 600 },
    })
    if (!res.ok) return []
    const json = await res.json()
    if (json.status !== 'OK') return []

    const upcoming = (json.result as Array<{
      id: number
      name: string
      startTimeSeconds: number
      durationSeconds: number
      phase: string
      type: string
    }>)
      .filter((c) => c.phase === 'BEFORE')
      .slice(0, 5)
      .map((c) => ({
        id: `cf-${c.id}`,
        platform: 'CODEFORCES',
        name: c.name,
        url: `https://codeforces.com/contest/${c.id}`,
        startsAt: new Date(c.startTimeSeconds * 1000).toISOString(),
        durationSeconds: c.durationSeconds,
        phase: 'UPCOMING',
      }))

    return upcoming
  } catch {
    return []
  }
}

async function fetchLeetCodeContests() {
  try {
    const query = `
      query {
        allContests {
          title
          titleSlug
          startTime
          duration
        }
      }
    `
    const res = await fetch('https://leetcode.com/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query }),
      next: { revalidate: 600 },
    })
    if (!res.ok) return []
    const json = await res.json()
    const now = Date.now() / 1000

    const upcoming = (json?.data?.allContests ?? [])
      .filter((c: { startTime: number }) => c.startTime > now)
      .slice(0, 3)
      .map((c: { title: string; titleSlug: string; startTime: number; duration: number }) => ({
        id: `lc-${c.titleSlug}`,
        platform: 'LEETCODE',
        name: c.title,
        url: `https://leetcode.com/contest/${c.titleSlug}/`,
        startsAt: new Date(c.startTime * 1000).toISOString(),
        durationSeconds: c.duration,
        phase: 'UPCOMING',
      }))

    return upcoming
  } catch {
    return []
  }
}

export async function GET() {
  const [cfContests, lcContests] = await Promise.all([
    fetchCodeforcesContests(),
    fetchLeetCodeContests(),
  ])

  const all = [...lcContests, ...cfContests]
    .sort((a, b) => new Date(a.startsAt).getTime() - new Date(b.startsAt).getTime())
    .slice(0, 8)

  return NextResponse.json({ success: true, data: all })
}
