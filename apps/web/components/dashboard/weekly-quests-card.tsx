'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Target, Zap } from 'lucide-react'
import { Skeleton } from '@forge/ui'
import { useQuests } from '@/lib/api/hooks'
import GlitchText from '@/components/creative/glitch-text'

export function WeeklyQuestsCard() {
  const { data, isLoading } = useQuests()

  if (isLoading) {
    return (
      <div className="bg-black border border-primary/30 rounded-xl p-5 space-y-4 font-mono">
        <Skeleton className="h-5 w-36 bg-primary/10" />
        <Skeleton className="h-4 w-full bg-primary/10" />
        <Skeleton className="h-4 w-full bg-primary/10" />
      </div>
    )
  }

  if (!data) return null

  const activeQuests = data.quests.slice(0, 3)

  return (
    <div className="bg-black border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.05)] hover:border-primary/60 transition-all font-mono group h-full flex flex-col">
      <div className="px-5 py-4 border-b border-primary/20 flex flex-row items-center justify-between bg-primary/5 group-hover:bg-primary/10 transition-colors">
        <h3 className="flex items-center gap-2 font-bold text-primary tracking-tight">
          <Target className="text-primary size-4" />
          <GlitchText text="[ WEEKLY_QUESTS ]" active={false} />
        </h3>
        <Link
          href="/quests"
          className="text-xs text-primary/70 hover:text-primary transition-colors flex items-center gap-1 border border-primary/30 px-2 py-1 rounded bg-black"
        >
          VIEW_ALL ({data.completedCount}/{data.totalCount})
          <ArrowRight className="size-3" />
        </Link>
      </div>

      <div className="p-5 space-y-4 flex-1 flex flex-col">
        <div className="flex items-center justify-between rounded-none border border-primary/30 bg-primary/5 px-3 py-2 text-xs">
          <span className="text-primary/70 font-semibold">&gt; CYCLE: {data.weekKey}</span>
          <span className="text-primary font-bold">
            +{data.totalXpEarned} / {data.totalXpAvailable} XP
          </span>
        </div>

        <div className="space-y-4 mt-2">
          {activeQuests.map((quest) => (
            <div key={quest.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className={`flex items-center gap-1.5 font-semibold ${quest.completed ? 'text-primary/60' : 'text-zinc-200'}`}>
                  {quest.completed ? (
                    <span className="text-primary font-bold">[*]</span>
                  ) : (
                    <span className="text-primary/50 font-bold">[ ]</span>
                  )}
                  {quest.title}
                </span>
                <span className={`font-mono ${quest.completed ? 'text-primary/60' : 'text-primary/90'}`}>
                  {quest.currentValue}/{quest.targetValue}
                </span>
              </div>
              <div className="bg-primary/10 h-1.5 w-full overflow-hidden rounded-none border border-primary/20">
                <div
                  className={`h-full transition-all duration-500 shadow-[0_0_10px_rgba(0,255,65,0.8)] ${
                    quest.completed ? 'bg-primary' : 'bg-primary/70'
                  }`}
                  style={{ width: `${quest.progress}%` }}
                />
              </div>
            </div>
          ))}
          
          {activeQuests.length === 0 && (
             <div className="text-center text-primary/50 text-sm py-6 border border-dashed border-primary/20 bg-primary/5">
                &gt; NO_ACTIVE_QUESTS
             </div>
          )}
        </div>
      </div>
    </div>
  )
}
