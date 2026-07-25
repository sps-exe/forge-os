'use client'

import {
  CheckCircle2,
  Circle,
  ExternalLink,
  Flame,
  GitCommitHorizontal,
  RotateCcw,
  SkipForward,
  Trophy,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  Skeleton,
} from '@forge/ui'
import {
  useGenerateTodayTasks,
  useTaskHistory,
  useTaskSummary,
  useTodayTasks,
  useUpdateTaskStatus,
} from '@/lib/api/hooks'
import { TopicRecommendationsCard } from '@/components/tasks/topic-recommendations-card'

const TASK_LABELS: Record<string, string> = {
  LEETCODE_DAILY: 'LeetCode',
  CODEFORCES_PRACTICE: 'Practice',
  GITHUB_CONTRIBUTION: 'GitHub',
  CS_READING: 'Reading',
  REVISION: 'Revision',
  INTERVIEW_QUESTION: 'Interview',
  CUSTOM: 'Custom',
}

export default function TasksPage() {
  const { data, isLoading, error } = useTodayTasks()
  const { data: summary } = useTaskSummary()
  const { data: history } = useTaskHistory()
  const generate = useGenerateTodayTasks()
  const updateStatus = useUpdateTaskStatus()
  const progress =
    data && data.totalCount > 0 ? Math.round((data.completedCount / data.totalCount) * 100) : 0

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="text-success size-7" />
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Daily Tasks</h1>
            <p className="text-muted-foreground text-sm">
              Your daily operating loop for practice, contribution, revision, and interview prep.
            </p>
          </div>
        </div>
        <Button variant="outline" onClick={() => generate.mutate()} disabled={generate.isPending}>
          <RotateCcw />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Trophy className="text-primary size-5" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{data?.completedCount ?? '—'}</p>
              <p className="text-muted-foreground text-xs">completed today</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Flame className="text-warning size-5" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{summary?.currentStreak ?? '—'}</p>
              <p className="text-muted-foreground text-xs">day developer streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Progress</span>
              <span className="font-medium tabular-nums">{progress}%</span>
            </div>
            <div className="bg-muted h-2 overflow-hidden rounded-full">
              <div className="bg-success h-full rounded-full" style={{ width: `${progress}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {data?.recommendations && (
        <TopicRecommendationsCard recommendations={data.recommendations} />
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <GitCommitHorizontal className="text-primary size-4" />
            Weekly momentum
          </CardTitle>
        </CardHeader>
        <CardContent>
          {summary ? (
            <div className="space-y-4">
              <div className="grid gap-3 sm:grid-cols-3">
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {summary.completedTasksLast7}
                  </p>
                  <p className="text-muted-foreground text-xs">tasks completed in 7 days</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tabular-nums">{summary.activeDaysLast14}</p>
                  <p className="text-muted-foreground text-xs">active days in 14 days</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold tabular-nums">
                    {data?.earnedXpToday ?? '—'}
                  </p>
                  <p className="text-muted-foreground text-xs">XP earned today</p>
                </div>
              </div>
              <div className="grid grid-cols-7 gap-2">
                {summary.week.map((day) => (
                  <div key={day.date} className="space-y-2">
                    <div className="bg-muted flex h-24 items-end overflow-hidden rounded-md">
                      <div
                        className="bg-success w-full rounded-md transition-all"
                        style={{
                          height: `${Math.max(day.completionRate, 6)}%`,
                          opacity: day.completionRate > 0 ? 1 : 0.2,
                        }}
                      />
                    </div>
                    <p className="text-muted-foreground text-center text-xs">
                      {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
                        weekday: 'short',
                      })}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <Skeleton className="h-36 w-full" />
          )}
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Couldn't load today's tasks" description="Try again in a moment." />
      ) : !data || data.tasks.length === 0 ? (
        <EmptyState title="No tasks yet" description="Generate today's task list to begin." />
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>
              {new Date(`${data.date}T00:00:00`).toLocaleDateString(undefined, {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.tasks.map((task) => {
              const completed = task.status === 'COMPLETED'
              const skipped = task.status === 'SKIPPED'
              return (
                <div
                  key={task.id}
                  className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({
                          taskId: task.id,
                          status: completed ? 'PENDING' : 'COMPLETED',
                        })
                      }
                      className="text-muted-foreground hover:text-success mt-0.5 transition-colors"
                      aria-label={
                        completed ? `Mark ${task.title} pending` : `Complete ${task.title}`
                      }
                    >
                      {completed ? (
                        <CheckCircle2 className="text-success size-6" />
                      ) : (
                        <Circle className="size-6" />
                      )}
                    </button>
                    <div className="min-w-0">
                      <div className="mb-1 flex flex-wrap items-center gap-2">
                        <p
                          className={
                            completed
                              ? 'text-muted-foreground font-medium line-through'
                              : 'font-medium'
                          }
                        >
                          {task.title}
                        </p>
                        <Badge variant={completed ? 'success' : skipped ? 'warning' : 'secondary'}>
                          {completed ? 'Done' : skipped ? 'Skipped' : TASK_LABELS[task.type]}
                        </Badge>
                      </div>
                      <p className="text-muted-foreground text-sm">Worth {task.xpReward} XP</p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    {task.url && (
                      <Button variant="outline" size="sm" asChild>
                        <a href={task.url} target="_blank" rel="noreferrer">
                          <ExternalLink />
                          Open
                        </a>
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        updateStatus.mutate({
                          taskId: task.id,
                          status: skipped ? 'PENDING' : 'SKIPPED',
                        })
                      }
                    >
                      <SkipForward />
                      {skipped ? 'Undo' : 'Skip'}
                    </Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Recent history</CardTitle>
        </CardHeader>
        <CardContent>
          {history ? (
            <div className="space-y-3">
              {history.days.slice(0, 7).map((day) => {
                const progress =
                  day.totalCount > 0 ? Math.round((day.completedCount / day.totalCount) * 100) : 0
                return (
                  <div key={day.date} className="border-border rounded-lg border p-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <p className="font-medium">
                          {new Date(`${day.date}T00:00:00`).toLocaleDateString(undefined, {
                            weekday: 'long',
                            month: 'short',
                            day: 'numeric',
                          })}
                        </p>
                        <p className="text-muted-foreground text-xs">
                          {day.completedCount} of {day.totalCount} completed
                        </p>
                      </div>
                      <Badge variant={progress === 100 ? 'success' : 'secondary'}>
                        {progress}%
                      </Badge>
                    </div>

                    {day.tasks.length > 0 && (
                      <div className="mt-3 grid gap-2 sm:grid-cols-2">
                        {day.tasks.map((task) => (
                          <div
                            key={task.id}
                            className="bg-accent/40 flex items-center justify-between gap-2 rounded-md px-3 py-2"
                          >
                            <span
                              className={
                                task.status === 'COMPLETED'
                                  ? 'text-muted-foreground truncate text-xs line-through'
                                  : 'truncate text-xs'
                              }
                            >
                              {task.title}
                            </span>
                            <Badge
                              variant={
                                task.status === 'COMPLETED'
                                  ? 'success'
                                  : task.status === 'SKIPPED'
                                    ? 'warning'
                                    : 'secondary'
                              }
                            >
                              {task.status === 'COMPLETED'
                                ? 'Done'
                                : task.status === 'SKIPPED'
                                  ? 'Skipped'
                                  : 'Pending'}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <Skeleton className="h-48 w-full" />
          )}
        </CardContent>
      </Card>
    </div>
  )
}
