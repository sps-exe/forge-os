import Link from 'next/link'
import { Flame } from 'lucide-react'
import { cn } from '@forge/ui'

export function Logo({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      className={cn('flex items-center gap-2 font-semibold tracking-tight', className)}
    >
      <span className="flex size-7 items-center justify-center rounded-lg bg-gradient-to-br from-orange-500 to-amber-600">
        <Flame className="size-4 text-white" />
      </span>
      Forge
    </Link>
  )
}
