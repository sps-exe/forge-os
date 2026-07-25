'use client'

import Link from 'next/link'
import { Award, LockKeyhole } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@forge/ui'
import { useAchievements } from '@/lib/api/hooks'

export function AchievementsCard() {
  const { data, isLoading, error } = useAchievements()
  const progress =
    data && data.totalCount > 0 ? Math.round((data.earnedCount / data.totalCount) * 100) : 0

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Award className="text-warning size-4" />
          Achievements
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/achievements">Open</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-32" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">Couldn&apos;t load achievements.</p>
        ) : data ? (
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {data.earnedCount} of {data.totalCount} earned
                </span>
                <Badge variant={progress === 100 ? 'success' : 'secondary'}>{progress}%</Badge>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div className="bg-warning h-full rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>

            {data.nextAchievement ? (
              <div className="border-border flex items-start gap-3 rounded-md border p-3">
                <LockKeyhole className="text-muted-foreground mt-0.5 size-4 shrink-0" />
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{data.nextAchievement.title}</p>
                  <p className="text-muted-foreground text-xs">
                    {data.nextAchievement.progress}% complete
                  </p>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">Every badge is unlocked.</p>
            )}
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
