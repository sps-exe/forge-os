'use client'

import { Calendar, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { Skeleton } from '@forge/ui'
import { useUpcomingContests } from '@/lib/api/hooks'
import GlitchText from '@/components/creative/glitch-text'

const PLATFORM_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  LEETCODE: { bg: 'bg-amber-500/10', text: 'text-amber-500', border: 'border-amber-500/30' },
  CODEFORCES: { bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
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
    <div className="bg-black border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.05)] hover:border-primary/60 transition-all font-mono group h-full flex flex-col">
      <div className="px-5 py-4 border-b border-primary/20 flex flex-row items-center justify-between gap-2 bg-primary/5 group-hover:bg-primary/10 transition-colors">
        <h3 className="flex items-center gap-2 font-bold text-primary tracking-tight min-w-0">
          <Calendar className="text-primary size-4 shrink-0" />
          <GlitchText text="[ CRON: CONTESTS ]" active={false} className="truncate" />
        </h3>
        <Link href="/contests" className="text-xs shrink-0 text-primary/70 hover:text-primary transition-colors border border-primary/30 px-2 py-1 rounded bg-black">
          VIEW_ALL
        </Link>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-12 w-full bg-primary/10" />
            ))}
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm border border-red-500/30 bg-red-500/10 p-3 rounded">
            &gt; ERR: FAILED_TO_LOAD_CONTESTS
          </p>
        ) : contests.length === 0 ? (
          <div className="text-center text-primary/50 text-sm py-6 border border-dashed border-primary/20 bg-primary/5 flex-1 flex items-center justify-center">
            &gt; SYSTEM_IDLE: NO_UPCOMING_CONTESTS
          </div>
        ) : (
          <ul className="space-y-3 flex-1 flex flex-col">
            {contests.map((contest) => {
              const colors = PLATFORM_COLORS[contest.platform] ?? {
                bg: 'bg-primary/10',
                text: 'text-primary',
                border: 'border-primary/30'
              }
              
              return (
                <li key={contest.id}>
                  <a
                    href={contest.url}
                    target="_blank"
                    rel="noreferrer"
                    className="border border-primary/20 bg-black hover:border-primary/80 hover:bg-primary/5 group flex items-center justify-between gap-3 rounded-none p-3 transition-colors"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white group-hover:text-primary transition-colors">
                        {contest.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-primary/60 text-xs">
                          {new Date(contest.startsAt).toLocaleString(undefined, {
                            weekday: 'short',
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                        <span className="text-primary/40 text-xs">|</span>
                        <span className="text-primary font-bold text-xs">
                          {formatCountdown(contest.startsAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-3">
                      <span className={`text-[10px] font-bold px-2 py-1 rounded border ${colors.border} ${colors.bg} ${colors.text}`}>
                        {contest.platform}
                      </span>
                      <ExternalLink className="text-primary/50 size-4 group-hover:text-primary transition-colors" />
                    </div>
                  </a>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
