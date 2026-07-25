'use client'

import { motion } from 'framer-motion'
import { Flame } from 'lucide-react'
import { cn } from '../lib/utils'

export interface StreakFlameProps {
  days: number
  active?: boolean
  size?: 'sm' | 'lg'
  className?: string
}

/** Animated streak indicator — orange when alive, muted when broken. */
export function StreakFlame({ days, active = true, size = 'lg', className }: StreakFlameProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <motion.div
        animate={active ? { scale: [1, 1.08, 1] } : undefined}
        transition={{ repeat: Infinity, duration: 1.6, ease: 'easeInOut' }}
        aria-hidden
      >
        <Flame
          className={cn(
            size === 'lg' ? 'size-8' : 'size-5',
            active ? 'fill-orange-500/30 text-orange-400' : 'text-muted-foreground',
          )}
        />
      </motion.div>
      <div>
        <span
          className={cn(
            'font-semibold tabular-nums',
            size === 'lg' ? 'text-3xl' : 'text-lg',
            active ? 'text-foreground' : 'text-muted-foreground',
          )}
        >
          {days}
        </span>
        <span className="text-muted-foreground ml-1.5 text-sm">day{days === 1 ? '' : 's'}</span>
      </div>
    </div>
  )
}
