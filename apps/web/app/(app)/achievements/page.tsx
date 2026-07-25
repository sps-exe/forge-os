'use client'

import { Award, CheckCircle2, LockKeyhole } from 'lucide-react'
import { Badge, Card, CardContent, EmptyState, Skeleton } from '@forge/ui'
import type { AchievementDto } from '@forge/shared'
import { useAchievements } from '@/lib/api/hooks'

const CATEGORY_LABELS: Record<AchievementDto['category'], string> = {
  HABIT: 'Habit',
  PLATFORM: 'Platform',
  XP: 'XP',
  CONTEST: 'Contest',
}

const CATEGORY_VARIANTS: Record<
  AchievementDto['category'],
  'default' | 'secondary' | 'success' | 'warning'
> = {
  HABIT: 'success',
  PLATFORM: 'default',
  XP: 'warning',
  CONTEST: 'secondary',
}

export default function AchievementsPage() {
  const { data, isLoading, error } = useAchievements()

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex items-center gap-3">
        <Award className="text-warning size-7" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Achievements</h1>
          <p className="text-muted-foreground text-sm">
            Badges earned from consistency, connected platforms, and XP.
          </p>
        </div>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Couldn't load achievements" description="Try again in a moment." />
      ) : !data ? (
        <EmptyState title="No achievements yet" description="Complete tasks to start earning." />
      ) : (
        <>
          <div className="grid gap-4 sm:grid-cols-3">
            <Card>
              <CardContent className="p-5">
                <p className="text-2xl font-semibold tabular-nums">{data.earnedCount}</p>
                <p className="text-muted-foreground text-xs">badges earned</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="text-2xl font-semibold tabular-nums">{data.totalCount}</p>
                <p className="text-muted-foreground text-xs">total badges</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-5">
                <p className="truncate text-2xl font-semibold">
                  {data.nextAchievement?.title ?? 'Complete'}
                </p>
                <p className="text-muted-foreground text-xs">next unlock</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {data.achievements.map((achievement) => (
              <Card key={achievement.id} className={achievement.earned ? '' : 'opacity-75'}>
                <CardContent className="space-y-4 p-5">
                  <div className="flex items-start gap-3">
                    <div className="flex min-w-0 items-start gap-3">
                      <div className="bg-accent flex size-10 shrink-0 items-center justify-center rounded-md">
                        {achievement.earned ? (
                          <CheckCircle2 className="text-success size-5" />
                        ) : (
                          <LockKeyhole className="text-muted-foreground size-5" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <h2 className="font-medium">{achievement.title}</h2>
                        <p className="text-muted-foreground mt-1 text-sm">
                          {achievement.description}
                        </p>
                        {achievement.earned && achievement.unlockedAt && (
                          <p className="text-muted-foreground mt-1 text-xs">
                            Unlocked{' '}
                            {new Intl.DateTimeFormat(undefined, {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            }).format(new Date(achievement.unlockedAt))}
                          </p>
                        )}
                      </div>
                    </div>
                    <Badge variant={CATEGORY_VARIANTS[achievement.category]}>
                      {CATEGORY_LABELS[achievement.category]}
                    </Badge>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">
                        {achievement.currentValue} / {achievement.targetValue}
                      </span>
                      <span className="font-medium tabular-nums">{achievement.progress}%</span>
                    </div>
                    <div className="bg-muted h-2 overflow-hidden rounded-full">
                      <div
                        className={achievement.earned ? 'bg-success h-full' : 'bg-primary h-full'}
                        style={{ width: `${achievement.progress}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
