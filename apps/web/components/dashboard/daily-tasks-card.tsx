'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, ExternalLink } from 'lucide-react'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@forge/ui'
import { useTaskSummary, useTodayTasks, useUpdateTaskStatus } from '@/lib/api/hooks'

export function DailyTasksCard() {
  const { data, isLoading, error } = useTodayTasks()
  const { data: summary } = useTaskSummary()
  const updateStatus = useUpdateTaskStatus()
  const progress =
    data && data.totalCount > 0 ? Math.round((data.completedCount / data.totalCount) * 100) : 0

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <CheckCircle2 className="text-success size-4" />
          Today&apos;s tasks
        </CardTitle>
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks">Open</Link>
        </Button>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-40" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : error ? (
          <p className="text-destructive text-sm">Couldn&apos;t load today&apos;s tasks.</p>
        ) : data ? (
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  {data.completedCount} of {data.totalCount} complete
                </span>
                <div className="flex items-center gap-2">
                  {summary && <Badge variant="warning">{summary.currentStreak} day streak</Badge>}
                  <Badge variant={progress === 100 ? 'success' : 'secondary'}>{progress}%</Badge>
                </div>
              </div>
              <div className="bg-muted h-2 overflow-hidden rounded-full">
                <div className="bg-success h-full rounded-full" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="space-y-2">
              {data.tasks.slice(0, 4).map((task) => {
                const completed = task.status === 'COMPLETED'
                return (
                  <div
                    key={task.id}
                    className="border-border flex items-center gap-3 rounded-md border p-3"
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({
                          taskId: task.id,
                          status: completed ? 'PENDING' : 'COMPLETED',
                        })
                      }
                      className="text-muted-foreground hover:text-success transition-colors"
                      aria-label={
                        completed ? `Mark ${task.title} pending` : `Complete ${task.title}`
                      }
                    >
                      {completed ? (
                        <CheckCircle2 className="text-success size-5" />
                      ) : (
                        <Circle className="size-5" />
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          completed
                            ? 'text-muted-foreground truncate text-sm line-through'
                            : 'truncate text-sm'
                        }
                      >
                        {task.title}
                      </p>
                      <p className="text-muted-foreground text-xs">+{task.xpReward} XP</p>
                    </div>
                    {task.url && (
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${task.title}`}
                      >
                        <ExternalLink className="text-muted-foreground size-4" />
                      </a>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
