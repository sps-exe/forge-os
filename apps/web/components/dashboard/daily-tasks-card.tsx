'use client'

import Link from 'next/link'
import { CheckCircle2, Circle, ExternalLink, Terminal } from 'lucide-react'
import { Badge, Skeleton } from '@forge/ui'
import { useTaskSummary, useTodayTasks, useUpdateTaskStatus } from '@/lib/api/hooks'
import GlitchText from '@/components/creative/glitch-text'

export function DailyTasksCard() {
  const { data, isLoading, error } = useTodayTasks()
  const { data: summary } = useTaskSummary()
  const updateStatus = useUpdateTaskStatus()
  const progress =
    data && data.totalCount > 0 ? Math.round((data.completedCount / data.totalCount) * 100) : 0

  return (
    <div className="bg-black border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.05)] hover:border-primary/60 transition-all font-mono group h-full flex flex-col">
      <div className="px-5 py-4 border-b border-primary/20 flex flex-row items-center justify-between bg-primary/5 group-hover:bg-primary/10 transition-colors">
        <h3 className="flex items-center gap-2 font-bold text-primary tracking-tight">
          <Terminal className="text-primary size-4" />
          <GlitchText text="[ DAILY_TASKS ]" active={false} />
        </h3>
        <Link href="/tasks" className="text-xs text-primary/70 hover:text-primary transition-colors border border-primary/30 px-2 py-1 rounded bg-black">
          EXECUTE
        </Link>
      </div>
      
      <div className="p-5 flex-1 flex flex-col">
        {isLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-5 w-40 bg-primary/10" />
            <Skeleton className="h-12 w-full bg-primary/10" />
            <Skeleton className="h-12 w-full bg-primary/10" />
          </div>
        ) : error ? (
          <p className="text-red-500 text-sm border border-red-500/30 bg-red-500/10 p-3 rounded">
            &gt; ERR: FAILED_TO_LOAD_TASKS
          </p>
        ) : data ? (
          <div className="space-y-5 flex-1 flex flex-col">
            <div>
              <div className="mb-3 flex items-center justify-between text-xs">
                <span className="text-primary/70 font-semibold">
                  &gt; PROGRESS: {data.completedCount}/{data.totalCount}
                </span>
                <div className="flex items-center gap-2">
                  {summary && (
                    <span className="text-amber-500 font-bold border border-amber-500/30 px-2 py-0.5 rounded bg-amber-500/10">
                      STREAK:{summary.currentStreak}
                    </span>
                  )}
                  <span className={`font-bold px-2 py-0.5 rounded ${progress === 100 ? 'text-black bg-primary' : 'text-primary border border-primary/30 bg-black'}`}>
                    {progress}%
                  </span>
                </div>
              </div>
              <div className="bg-primary/10 h-1.5 overflow-hidden rounded-none border border-primary/20">
                <div className="bg-primary h-full shadow-[0_0_10px_rgba(0,255,65,0.8)] transition-all duration-500" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div className="space-y-3 mt-4">
              {data.tasks.slice(0, 4).map((task) => {
                const completed = task.status === 'COMPLETED'
                return (
                  <div
                    key={task.id}
                    className={`flex items-center gap-3 rounded-none border p-3 transition-colors ${
                      completed ? 'border-primary/20 bg-primary/5 text-primary/50' : 'border-primary/40 bg-black hover:border-primary/80 hover:bg-primary/5 text-zinc-300'
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() =>
                        updateStatus.mutate({
                          taskId: task.id,
                          status: completed ? 'PENDING' : 'COMPLETED',
                        })
                      }
                      className={`hover:text-primary transition-colors ${completed ? 'text-primary' : 'text-primary/50'}`}
                      aria-label={
                        completed ? `Mark ${task.title} pending` : `Complete ${task.title}`
                      }
                    >
                      {completed ? (
                        <span className="font-bold">[*]</span>
                      ) : (
                        <span className="font-bold">[ ]</span>
                      )}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p
                        className={
                          completed
                            ? 'truncate text-sm line-through opacity-60'
                            : 'truncate text-sm font-semibold text-white'
                        }
                      >
                        {task.title}
                      </p>
                      <p className="text-primary/70 text-xs mt-0.5">+{task.xpReward} XP</p>
                    </div>
                    {task.url && (
                      <a
                        href={task.url}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Open ${task.title}`}
                        className="hover:text-primary hover:scale-110 transition-all"
                      >
                        <ExternalLink className="size-4" />
                      </a>
                    )}
                  </div>
                )
              })}
              
              {data.tasks.length === 0 && (
                <div className="text-center text-primary/50 text-sm py-6 border border-dashed border-primary/20 bg-primary/5">
                  &gt; NO_TASKS_FOUND
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
