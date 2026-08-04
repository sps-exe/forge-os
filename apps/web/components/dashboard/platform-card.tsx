'use client'

import Link from 'next/link'
import { Link2 } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Skeleton } from '@forge/ui'
import { usePlatformStats } from '@/lib/api/hooks'
import { ApiClientError } from '@/lib/api/client'
import GlitchText from '@/components/creative/glitch-text'

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
    <div className="bg-black border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.05)] hover:border-primary/60 transition-all font-mono group h-full flex flex-col">
      <div className="px-5 py-4 border-b border-primary/20 flex flex-row items-center justify-between bg-primary/5 group-hover:bg-primary/10 transition-colors">
        <h3 className="flex items-center gap-2 font-bold text-primary tracking-tight">
          <Icon className={`size-4 ${accentClass}`} />
          <GlitchText text={`[ ${platform} ]`} active={false} />
        </h3>
        <Link 
          href={notConnected ? '/settings/connections' : href}
          className="text-xs text-primary/70 hover:text-primary transition-colors border border-primary/30 px-2 py-1 rounded bg-black"
        >
          {notConnected ? 'CONNECT' : 'DETAILS'}
        </Link>
      </div>
      
      <div className="p-5 flex-1 flex flex-col justify-center">
        {notConnected ? (
          <div className="border border-dashed border-primary/30 text-primary/50 flex flex-col items-center justify-center gap-2 bg-primary/5 p-6 text-sm text-center">
            <Link2 className="size-5 shrink-0 opacity-50 mb-2" />
            <span>&gt; CONNECTION_REQUIRED</span>
            <span className="text-xs opacity-70">Link {title} to view telemetry.</span>
          </div>
        ) : isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-10 w-32 bg-primary/10" />
            <Skeleton className="h-5 w-40 bg-primary/10" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm border border-red-500/30 bg-red-500/10 p-3 rounded">
            &gt; ERR: FAILED_TO_FETCH_TELEMETRY
          </p>
        ) : data ? (
          <div className="text-primary space-y-2">
            {renderStats(data)}
          </div>
        ) : null}
      </div>
    </div>
  )
}
