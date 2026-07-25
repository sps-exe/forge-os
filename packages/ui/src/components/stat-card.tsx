'use client'

import * as React from 'react'
import { motion } from 'framer-motion'
import { cn } from '../lib/utils'
import { Card, CardContent } from './card'
import { Skeleton } from './skeleton'

export interface StatCardProps {
  label: string
  value: React.ReactNode
  sublabel?: string
  icon?: React.ReactNode
  accent?: 'default' | 'leetcode' | 'codeforces' | 'github' | 'success'
  loading?: boolean
  className?: string
}

const accentStyles: Record<NonNullable<StatCardProps['accent']>, string> = {
  default: 'text-primary',
  leetcode: 'text-platform-leetcode',
  codeforces: 'text-platform-codeforces',
  github: 'text-platform-github',
  success: 'text-success',
}

export function StatCard({
  label,
  value,
  sublabel,
  icon,
  accent = 'default',
  loading,
  className,
}: StatCardProps) {
  return (
    <Card className={cn('relative overflow-hidden', className)}>
      <CardContent className="p-5">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
              {label}
            </p>
            {loading ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-2xl font-semibold tabular-nums tracking-tight"
              >
                {value}
              </motion.p>
            )}
            {sublabel && !loading && <p className="text-muted-foreground text-xs">{sublabel}</p>}
          </div>
          {icon && <div className={cn('mt-0.5 [&_svg]:size-5', accentStyles[accent])}>{icon}</div>}
        </div>
      </CardContent>
    </Card>
  )
}
