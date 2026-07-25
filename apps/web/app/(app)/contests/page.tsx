'use client'

import { Calendar, ExternalLink } from 'lucide-react'
import type { Contest } from '@forge/shared'
import { Badge, Card, CardContent, EmptyState, Skeleton } from '@forge/ui'
import { useUpcomingContests } from '@/lib/api/hooks'

const PLATFORM_BADGE: Record<string, { label: string; variant: 'default' | 'warning' }> = {
  LEETCODE: { label: 'LeetCode', variant: 'warning' },
  CODEFORCES: { label: 'Codeforces', variant: 'default' },
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600)
  const minutes = Math.round((seconds % 3600) / 60)
  return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`
}

function getGoogleCalendarUrl(contest: Contest): string {
  const start = new Date(contest.startsAt).toISOString().replace(/-|:|\.\d+/g, '')
  const end = new Date(new Date(contest.startsAt).getTime() + contest.durationSeconds * 1000)
    .toISOString()
    .replace(/-|:|\.\d+/g, '')
  const title = encodeURIComponent(`${contest.platform}: ${contest.name}`)
  const details = encodeURIComponent(`Contest URL: ${contest.url}\n\nTracked via Forge OS.`)
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${start}/${end}&details=${details}`
}

function downloadIcsFile(contest: Contest) {
  const start = new Date(contest.startsAt).toISOString().replace(/-|:|\.\d+/g, '')
  const end = new Date(new Date(contest.startsAt).getTime() + contest.durationSeconds * 1000)
    .toISOString()
    .replace(/-|:|\.\d+/g, '')
  const icsData = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Forge OS//Contest Calendar//EN',
    'BEGIN:VEVENT',
    `SUMMARY:${contest.platform}: ${contest.name}`,
    `DESCRIPTION:Contest URL: ${contest.url}`,
    `URL:${contest.url}`,
    `DTSTART:${start}`,
    `DTEND:${end}`,
    'END:VEVENT',
    'END:VCALENDAR',
  ].join('\r\n')

  const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.setAttribute('download', `${contest.name.replace(/[^a-z0-9]/gi, '_')}.ics`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

function groupByDay(contests: Contest[]): [string, Contest[]][] {
  const groups = new Map<string, Contest[]>()
  for (const contest of contests) {
    const day = new Date(contest.startsAt).toLocaleDateString(undefined, {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })
    groups.set(day, [...(groups.get(day) ?? []), contest])
  }
  return [...groups.entries()]
}

export default function ContestsPage() {
  const { data, isLoading, error } = useUpcomingContests()

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="text-primary size-7" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Contest Calendar</h1>
          <p className="text-muted-foreground text-sm">
            Every upcoming round across LeetCode and Codeforces, in one place.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Couldn't load contests" description="Try again in a moment." />
      ) : !data || data.length === 0 ? (
        <EmptyState title="No upcoming contests" description="Check back soon." />
      ) : (
        <div className="space-y-6">
          {groupByDay(data).map(([day, contests]) => (
            <div key={day}>
              <h2 className="text-muted-foreground mb-2 text-sm font-medium">{day}</h2>
              <Card>
                <CardContent className="divide-border divide-y p-0">
                  {contests.map((contest) => {
                    const badge = PLATFORM_BADGE[contest.platform] ?? {
                      label: contest.platform,
                      variant: 'default' as const,
                    }
                    return (
                      <div
                        key={contest.id}
                        className="hover:bg-accent/40 flex flex-col gap-2 p-4 transition-colors sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div className="min-w-0">
                          <a
                            href={contest.url}
                            target="_blank"
                            rel="noreferrer"
                            className="hover:underline flex items-center gap-1.5 font-medium"
                          >
                            <span className="truncate">{contest.name}</span>
                            <ExternalLink className="size-3.5 shrink-0 text-muted-foreground" />
                          </a>
                          <p className="text-muted-foreground text-xs">
                            {new Date(contest.startsAt).toLocaleTimeString(undefined, {
                              hour: '2-digit',
                              minute: '2-digit',
                            })}{' '}
                            · {formatDuration(contest.durationSeconds)}
                          </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge variant={badge.variant}>{badge.label}</Badge>
                          <a
                            href={getGoogleCalendarUrl(contest)}
                            target="_blank"
                            rel="noreferrer"
                            className="border-border bg-background text-muted-foreground hover:text-foreground flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition-colors"
                          >
                            <Calendar className="size-3" />
                            Google Cal
                          </a>
                          <button
                            onClick={() => downloadIcsFile(contest)}
                            className="border-border bg-background text-muted-foreground hover:text-foreground flex items-center gap-1 rounded border px-2 py-1 text-[11px] font-medium transition-colors"
                          >
                            .ics Export
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
