'use client'

import { CheckCircle2, Clock, Flame, ShieldAlert, Target, Zap } from 'lucide-react'
import {
  Badge,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@forge/ui'
import { useQuests } from '@/lib/api/hooks'
import type { QuestCategory } from '@forge/shared'

const CATEGORY_LABELS: Record<QuestCategory, string> = {
  DAILY_TASKS: 'Daily Tasks',
  XP: 'XP Gain',
  STREAK: 'Streak',
  PLATFORM: 'Platforms',
}

const CATEGORY_VARIANTS: Record<QuestCategory, 'default' | 'secondary' | 'success' | 'warning'> = {
  DAILY_TASKS: 'default',
  XP: 'warning',
  STREAK: 'success',
  PLATFORM: 'secondary',
}

export default function QuestsPage() {
  const { data, isLoading, error } = useQuests()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold tracking-tight">Weekly Quests</h1>
            <Badge variant="secondary" className="gap-1">
              <Clock className="size-3" />
              {data ? `${data.daysRemaining} days left` : 'Week reset Sunday'}
            </Badge>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Complete 7-day targets to level up faster and earn bonus XP payouts every week.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
            <Skeleton className="h-44 w-full" />
          </div>
        </div>
      ) : error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-destructive">
            <ShieldAlert className="size-5 shrink-0" />
            <span>Could not load weekly quests. Please try again.</span>
          </CardContent>
        </Card>
      ) : data ? (
        <>
          {/* Stats Bar */}
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    Completed Quests
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    {data.completedCount} <span className="text-muted-foreground text-sm font-normal">/ {data.totalCount}</span>
                  </p>
                </div>
                <div className="bg-primary/10 text-primary flex size-10 items-center justify-center rounded-lg">
                  <Target className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    Bonus XP Earned
                  </p>
                  <p className="mt-1 text-2xl font-bold">
                    +{data.totalXpEarned} <span className="text-muted-foreground text-sm font-normal">/ {data.totalXpAvailable} XP</span>
                  </p>
                </div>
                <div className="bg-warning/10 text-warning flex size-10 items-center justify-center rounded-lg">
                  <Zap className="size-5" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="flex items-center justify-between p-5">
                <div>
                  <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
                    Active Cycle
                  </p>
                  <p className="mt-1 text-2xl font-bold font-mono">{data.weekKey}</p>
                </div>
                <div className="bg-success/10 text-success flex size-10 items-center justify-center rounded-lg">
                  <Flame className="size-5" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quests Grid */}
          <div className="grid gap-4 sm:grid-cols-2">
            {data.quests.map((quest) => (
              <Card
                key={quest.id}
                className={quest.completed ? 'border-success/40 bg-success/5' : ''}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-base">{quest.title}</CardTitle>
                        {quest.completed && (
                          <CheckCircle2 className="text-success size-4 shrink-0" />
                        )}
                      </div>
                      <CardDescription className="text-xs">
                        {quest.description}
                      </CardDescription>
                    </div>
                    <Badge variant={CATEGORY_VARIANTS[quest.category]}>
                      {CATEGORY_LABELS[quest.category]}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-3">
                  {/* Progress Bar */}
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-muted-foreground">Progress</span>
                      <span>
                        {quest.currentValue} / {quest.targetValue} ({quest.progress}%)
                      </span>
                    </div>
                    <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
                      <div
                        className={`h-full transition-all duration-500 ${
                          quest.completed ? 'bg-success' : 'bg-primary'
                        }`}
                        style={{ width: `${quest.progress}%` }}
                      />
                    </div>
                  </div>

                  {/* Footer Info */}
                  <div className="flex items-center justify-between pt-1 text-xs">
                    <span className="text-warning font-semibold">
                      +{quest.xpReward} XP Reward
                    </span>
                    {quest.completed && quest.completedAt ? (
                      <span className="text-muted-foreground">
                        Completed{' '}
                        {new Intl.DateTimeFormat(undefined, {
                          month: 'short',
                          day: 'numeric',
                        }).format(new Date(quest.completedAt))}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">
                        {quest.targetValue - quest.currentValue > 0
                          ? `${quest.targetValue - quest.currentValue} more to go`
                          : 'Almost there!'}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : null}
    </div>
  )
}
