'use client'

import Link from 'next/link'
import { Award, LockKeyhole } from 'lucide-react'
import { Skeleton } from '@forge/ui'
import { useAchievements } from '@/lib/api/hooks'
import GlitchText from '@/components/creative/glitch-text'

export function AchievementsCard() {
  const { data, isLoading, error } = useAchievements()
  const progress =
    data && data.totalCount > 0 ? Math.round((data.earnedCount / data.totalCount) * 100) : 0

  return (
    <div className="bg-black border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.05)] hover:border-primary/60 transition-all font-mono group h-full flex flex-col">
      <div className="px-5 py-4 border-b border-primary/20 flex flex-row items-center justify-between gap-2 bg-primary/5 group-hover:bg-primary/10 transition-colors">
        <h3 className="flex items-center gap-2 font-bold text-primary tracking-tight min-w-0">
          <Award className="text-primary size-4 shrink-0" />
          <GlitchText text="[ ACHIEVEMENTS ]" active={false} className="truncate" />
        </h3>
        <Link href="/achievements" className="text-xs shrink-0 text-primary/70 hover:text-primary transition-colors border border-primary/30 px-2 py-1 rounded bg-black">
          UNLOCKS
        </Link>
      </div>

      <div className="p-5 flex-1 flex flex-col">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-32 bg-primary/10" />
            <Skeleton className="h-16 w-full bg-primary/10" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm border border-red-500/30 bg-red-500/10 p-3 rounded">
            &gt; ERR: FAILED_TO_LOAD_ACHIEVEMENTS
          </p>
        ) : data ? (
          <div className="space-y-5 flex-1 flex flex-col">
            <div>
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="text-primary/70 font-semibold truncate">
                  &gt; UNLOCKED: {data.earnedCount ?? 0}/{data.totalCount ?? 0}
                </span>
                <span className={`font-bold px-2 py-0.5 rounded ${progress === 100 ? 'text-black bg-primary' : 'text-primary border border-primary/30 bg-black'}`}>
                  {progress}%
                </span>
              </div>
              <div className="bg-primary/10 h-1.5 overflow-hidden rounded-none border border-primary/20">
                <div className="bg-primary h-full shadow-[0_0_10px_rgba(0,255,65,0.8)] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {data.nextAchievement ? (
              <div className="border border-primary/40 bg-black flex items-start gap-3 rounded-none p-4 mt-2">
                <LockKeyhole className="text-primary mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-white">
                    {data.nextAchievement.title}
                  </p>
                  <p className="text-primary/70 text-xs mt-1">
                    &gt; {data.nextAchievement.progress}% COMPLETE
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center text-primary font-bold text-sm py-6 border border-dashed border-primary/30 bg-primary/10">
                [ ALL_ACHIEVEMENTS_UNLOCKED ]
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  )
}
