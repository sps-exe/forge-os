import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const res = await fetch(
      'https://api.github.com/search/repositories?q=stars:>10000+topic:nextjs&sort=stars&order=desc&per_page=6',
      {
        headers: { 'User-Agent': 'ForgeApp' },
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      return NextResponse.json({
        success: true,
        data: {
          repositories: [
            {
              name: 'vercel/next.js',
              stars: 125000,
              description: 'The React Framework for the Web',
              url: 'https://github.com/vercel/next.js',
              language: 'TypeScript',
            },
          ],
        },
      })
    }

    const json = await res.json()
    const repositories = (json.items ?? []).map((repo: {
      full_name: string
      stargazers_count: number
      description: string
      html_url: string
      language: string
    }) => ({
      name: repo.full_name,
      stars: repo.stargazers_count,
      description: repo.description ?? '',
      url: repo.html_url,
      language: repo.language ?? 'TypeScript',
    }))

    return NextResponse.json({
      success: true,
      data: {
        repositories,
      },
    })
  } catch (err) {
    console.error('Error fetching open source repos:', err)
    return NextResponse.json({
      success: true,
      data: {
        repositories: [],
      },
    })
  }
}
