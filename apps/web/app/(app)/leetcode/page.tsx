'use client'

import { Code2 } from 'lucide-react'
import type { LeetCodeDetails } from '@forge/shared'
import { Card, CardContent, CardHeader, CardTitle, StatCard } from '@forge/ui'
import { PlatformGate } from '@/components/platform/platform-gate'
import { PageHeader } from '@/components/platform/page-header'

function DifficultyBar({
  label,
  solved,
  total,
  color,
}: {
  label: string
  solved: number
  total: number
  color: string
}) {
  const pct = total > 0 ? Math.round((solved / total) * 100) : 0
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground tabular-nums">
          {solved} / {total}
        </span>
      </div>
      <div className="bg-muted h-2 overflow-hidden rounded-full">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

export default function LeetCodePage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PlatformGate platform="LEETCODE" title="LeetCode">
        {(stats) => {
          const d = stats.details as unknown as LeetCodeDetails
          const totalSolved = stats.solvedCount ?? 0
          return (
            <>
              <PageHeader
                icon={Code2}
                title="LeetCode"
                handle={stats.handle}
                accentClass="text-platform-leetcode"
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard label="Total solved" value={totalSolved} accent="leetcode" />
                <StatCard label="Contest rating" value={stats.rating ?? '—'} accent="leetcode" />
                <StatCard label="Global rank" value={stats.rank ?? '—'} accent="leetcode" />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Difficulty breakdown</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <DifficultyBar
                    label="Easy"
                    solved={d.easySolved}
                    total={d.easyTotal}
                    color="bg-success"
                  />
                  <DifficultyBar
                    label="Medium"
                    solved={d.mediumSolved}
                    total={d.mediumTotal}
                    color="bg-platform-leetcode"
                  />
                  <DifficultyBar
                    label="Hard"
                    solved={d.hardSolved}
                    total={d.hardTotal}
                    color="bg-destructive"
                  />
                </CardContent>
              </Card>
            </>
          )
        }}
      </PlatformGate>
    </div>
  )
}
