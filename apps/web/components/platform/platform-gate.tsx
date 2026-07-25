'use client'

import Link from 'next/link'
import { Link2 } from 'lucide-react'
import type { PlatformStats } from '@forge/shared'
import { Button, EmptyState, Skeleton } from '@forge/ui'
import { useAccounts, usePlatformStats } from '@/lib/api/hooks'
import { ApiClientError } from '@/lib/api/client'

interface PlatformGateProps {
  platform: 'LEETCODE' | 'CODEFORCES' | 'GITHUB'
  title: string
  children: (stats: PlatformStats) => React.ReactNode
}

/** Handles the connected / loading / error / empty states for a detail page. */
export function PlatformGate({ platform, title, children }: PlatformGateProps) {
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const connected = accounts?.some((a) => a.platform === platform) ?? false
  const { data, isLoading, error } = usePlatformStats(platform, connected)

  if (accountsLoading || (connected && isLoading)) {
    return (
      <div className="grid gap-4 sm:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 w-full" />
        ))}
      </div>
    )
  }

  if (!connected || (error instanceof ApiClientError && error.code === 'NOT_FOUND')) {
    return (
      <EmptyState
        icon={<Link2 />}
        title={`${title} not connected`}
        description={`Connect your ${title} account to see your stats and history.`}
        action={
          <Button asChild>
            <Link href="/settings/connections">Connect {title}</Link>
          </Button>
        }
      />
    )
  }

  if (error || !data) {
    return (
      <EmptyState
        title="Couldn't load stats"
        description="The platform may be rate-limiting us. Try again in a minute."
      />
    )
  }

  return <>{children(data)}</>
}
