'use client'

import { Calendar, ExternalLink } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle, EmptyState, Skeleton } from '@forge/ui'
import { useUpcomingContests } from '@/lib/api/hooks'

const PLATFORM_BADGE: Record<string, { label: string; variant: 'default' | 'warning' }> = {
  LEETCODE: { label: 'LeetCode', variant: 'warning' },
  CODEFORCES: { label: 'Codeforces', variant: 'default' },
}

function formatCountdown(startsAt: string | Date): string {
  const diff = new Date(startsAt).getTime() - Date.now()
  if (diff <= 0) return 'live now'
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(hours / 24)
  if (days > 0) return `in ${days}d ${hours % 24}h`
  const minutes = Math.floor((diff % 3_600_000) / 60_000)
  return `in ${hours}h ${minutes}m`
}

export function ContestsCard() {
  const { data, isLoading, error } = useUpcomingContests()
  const contests = data?.slice(0, 5) ?? []

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Calendar className="text-primary size-4" />
          Upcoming Contests
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">Couldn&apos;t load contests.</p>
        ) : contests.length === 0 ? (
          <EmptyState title="No upcoming contests" description="Check back soon." />
        ) : (
          <ul className="space-y-2">
            {contests.map((contest) => {
              const badge = PLATFORM_BADGE[contest.platform] ?? {
                label: contest.platform,
                variant: 'default' as const,
              }
              return (
                <li key={contest.id}>
                  <a
                    href={contest.url}
                    target="_blank"
                    rel="noreferrer"
                    className="border-border hover:bg-accent/40 group flex items-center justify-between gap-3 rounded-lg border p-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{contest.name}</p>
                      <p className="text-muted-foreground text-xs">
                        {new Date(contest.startsAt).toLocaleString(undefined, {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}{' '}
                        · {formatCountdown(contest.startsAt)}
                      </p>
                    </div>
                    <div className="flex shrink-0 items-center gap-2">
                      <Badge variant={badge.variant}>{badge.label}</Badge>
                      <ExternalLink className="text-muted-foreground size-3.5 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
