import { Injectable } from '@nestjs/common'
import { type OpenSourceIssueDto, type OpenSourceOverview } from '@forge/shared'

const CURATED_ISSUES: OpenSourceIssueDto[] = [
  {
    id: 'issue-1',
    repo: 'facebook/react',
    title: 'Good First Issue: Fix hydration warnings on server components in edge runtime',
    url: 'https://github.com/facebook/react/issues',
    language: 'TypeScript',
    labels: ['good first issue', 'component', 'hydration'],
    stars: 228000,
    commentsCount: 14,
    createdAt: new Date('2026-07-20T10:00:00Z'),
  },
  {
    id: 'issue-2',
    repo: 'vercel/next.js',
    title: 'Add TypeScript strict type validation to Turbopack loader config',
    url: 'https://github.com/vercel/next.js/issues',
    language: 'TypeScript',
    labels: ['good first issue', 'turbopack', 'typescript'],
    stars: 125000,
    commentsCount: 8,
    createdAt: new Date('2026-07-22T14:30:00Z'),
  },
  {
    id: 'issue-3',
    repo: 'astral-sh/ruff',
    title: 'Implement new Python 3.13 AST visitor rule for type parameter syntax',
    url: 'https://github.com/astral-sh/ruff/issues',
    language: 'Rust',
    labels: ['good first issue', 'linter', 'parser'],
    stars: 34000,
    commentsCount: 5,
    createdAt: new Date('2026-07-21T09:15:00Z'),
  },
  {
    id: 'issue-4',
    repo: 'gin-gonic/gin',
    title: 'Add middleware support for structured logging with slog package',
    url: 'https://github.com/gin-gonic/gin/issues',
    language: 'Go',
    labels: ['help wanted', 'middleware', 'logging'],
    stars: 79000,
    commentsCount: 11,
    createdAt: new Date('2026-07-19T16:45:00Z'),
  },
  {
    id: 'issue-5',
    repo: 'pydantic/pydantic',
    title: 'Improve error message formatting for nested dataclass validation failures',
    url: 'https://github.com/pydantic/pydantic/issues',
    language: 'Python',
    labels: ['good first issue', 'validation', 'error-handling'],
    stars: 52000,
    commentsCount: 9,
    createdAt: new Date('2026-07-23T11:20:00Z'),
  },
  {
    id: 'issue-6',
    repo: 'tailwindlabs/tailwindcss',
    title: 'Support container query container-type syntax in arbitrary values parser',
    url: 'https://github.com/tailwindlabs/tailwindcss/issues',
    language: 'TypeScript',
    labels: ['good first issue', 'v4', 'parser'],
    stars: 84000,
    commentsCount: 6,
    createdAt: new Date('2026-07-24T08:10:00Z'),
  },
  {
    id: 'issue-7',
    repo: 'tokio-rs/tokio',
    title: 'Add cooperative yield hint macro for long-running sync compute blocks',
    url: 'https://github.com/tokio-rs/tokio/issues',
    language: 'Rust',
    labels: ['help wanted', 'async', 'macros'],
    stars: 26000,
    commentsCount: 18,
    createdAt: new Date('2026-07-18T13:00:00Z'),
  },
  {
    id: 'issue-8',
    repo: 'kubernetes/kubernetes',
    title: 'Refactor kubectl output formatting for custom resource definitions',
    url: 'https://github.com/kubernetes/kubernetes/issues',
    language: 'Go',
    labels: ['good first issue', 'kubectl', 'cli'],
    stars: 110000,
    commentsCount: 22,
    createdAt: new Date('2026-07-17T15:30:00Z'),
  },
]

@Injectable()
export class OpenSourceService {
  getOverview(languageFilter?: string): OpenSourceOverview {
    const languages = Array.from(new Set(CURATED_ISSUES.map((i) => i.language))).sort()

    const issues = languageFilter && languageFilter !== 'All'
      ? CURATED_ISSUES.filter((i) => i.language.toLowerCase() === languageFilter.toLowerCase())
      : CURATED_ISSUES

    return {
      languages,
      totalCount: issues.length,
      issues,
    }
  }
}
