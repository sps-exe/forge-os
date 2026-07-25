'use client'

import Link from 'next/link'
import { Link2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@forge/ui'
import { usePlatformStats } from '@/lib/api/hooks'
import { ApiClientError } from '@/lib/api/client'

interface PlatformCardProps {
  platform: 'LEETCODE' | 'CODEFORCES' | 'GITHUB'
  title: string
  icon: LucideIcon
  href: string
  connected: boolean
  accentClass: string
  renderStats: (stats: {
    rating: number | null
    maxRating: number | null
    solvedCount: number | null
    rank: string | null
    streak: number | null
    details: Record<string, unknown>
  }) => React.ReactNode
}

export function PlatformCard({
  platform,
  title,
  icon: Icon,
  href,
  connected,
  accentClass,
  renderStats,
}: PlatformCardProps) {
  const { data, isLoading, error } = usePlatformStats(platform, connected)
  const notConnected = !connected || (error instanceof ApiClientError && error.code === 'NOT_FOUND')

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Icon className={`size-4 ${accentClass}`} />
          {title}
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href={notConnected ? '/settings/connections' : href}>
            {notConnected ? 'Connect' : 'Details'}
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {notConnected ? (
          <div className="border-border text-muted-foreground flex items-center gap-3 rounded-lg border border-dashed p-4 text-sm">
            <Link2 className="size-4 shrink-0" />
            Connect your {title} account to see stats here.
          </div>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-28" />
            <Skeleton className="h-4 w-40" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">Couldn&apos;t load stats — try again shortly.</p>
        ) : data ? (
          renderStats(data)
        ) : null}
      </CardContent>
    </Card>
  )
}
