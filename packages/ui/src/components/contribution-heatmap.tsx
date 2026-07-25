'use client'

import * as React from 'react'
import { cn } from '../lib/utils'

export interface HeatmapDay {
  date: string
  count: number
  /** 0–4 intensity, GitHub-style */
  level: number
}

export interface ContributionHeatmapProps {
  days: HeatmapDay[]
  className?: string
}

const LEVEL_CLASSES = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']

/** GitHub-style contribution heatmap. Expects days sorted ascending. */
export function ContributionHeatmap({ days, className }: ContributionHeatmapProps) {
  // Group into weeks (columns of 7)
  const weeks: HeatmapDay[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  return (
    <div className={cn('overflow-x-auto', className)}>
      <div className="flex gap-[3px]" role="img" aria-label="Contribution heatmap">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((day) => (
              <div
                key={day.date}
                title={`${day.date}: ${day.count} contribution${day.count === 1 ? '' : 's'}`}
                className={cn(
                  'size-[10px] rounded-[2px]',
                  LEVEL_CLASSES[Math.min(day.level, 4)] ?? LEVEL_CLASSES[0],
                )}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="text-muted-foreground mt-2 flex items-center justify-end gap-1 text-xs">
        <span>Less</span>
        {LEVEL_CLASSES.map((cls) => (
          <div key={cls} className={cn('size-[10px] rounded-[2px]', cls)} />
        ))}
        <span>More</span>
      </div>
    </div>
  )
}
