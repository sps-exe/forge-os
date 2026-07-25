'use client'

import Link from 'next/link'
import { ArrowRight, CheckCircle2, Target, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@forge/ui'
import { useQuests } from '@/lib/api/hooks'

export function WeeklyQuestsCard() {
  const { data, isLoading } = useQuests()

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!data) return null

  const activeQuests = data.quests.slice(0, 3)

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Target className="text-primary size-4" />
            Weekly Quests
          </CardTitle>
          <Link
            href="/quests"
            className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
          >
            View all ({data.completedCount}/{data.totalCount})
            <ArrowRight className="size-3" />
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        <div className="flex items-center justify-between rounded-md bg-accent/40 px-3 py-2 text-xs">
          <span className="text-muted-foreground">Cycle {data.weekKey}</span>
          <span className="text-warning font-medium">
            +{data.totalXpEarned} / {data.totalXpAvailable} XP
          </span>
        </div>

        <div className="space-y-2.5">
          {activeQuests.map((quest) => (
            <div key={quest.id} className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 font-medium">
                  {quest.completed ? (
                    <CheckCircle2 className="text-success size-3.5 shrink-0" />
                  ) : (
                    <Zap className="text-muted-foreground size-3.5 shrink-0" />
                  )}
                  {quest.title}
                </span>
                <span className="text-muted-foreground">
                  {quest.currentValue}/{quest.targetValue}
                </span>
              </div>
              <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                <div
                  className={`h-full transition-all duration-300 ${
                    quest.completed ? 'bg-success' : 'bg-primary'
                  }`}
                  style={{ width: `${quest.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
