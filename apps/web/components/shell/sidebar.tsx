'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  Brain,
  Calendar,
  Award,
  CheckSquare2,
  Code2,
  GitBranch,
  GitPullRequest,
  LayoutDashboard,
  Settings,
  Swords,
  Target,
  User2,
  X,
} from 'lucide-react'
import { cn } from '@forge/ui'
import { Logo } from '@/components/logo'
import { useUiStore } from '@/lib/stores/ui'

export const NAV_ITEMS = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/tasks', label: 'Daily Tasks', icon: CheckSquare2 },
  { href: '/quests', label: 'Weekly Quests', icon: Target },
  { href: '/revision', label: 'Revision & Memory', icon: Brain },
  { href: '/achievements', label: 'Achievements', icon: Award },
  { href: '/leetcode', label: 'LeetCode', icon: Code2 },
  { href: '/codeforces', label: 'Codeforces', icon: Swords },
  { href: '/github', label: 'GitHub', icon: GitBranch },
  { href: '/open-source', label: 'Open Source', icon: GitPullRequest },
  { href: '/contests', label: 'Contests', icon: Calendar },
] as const

export const SETTINGS_ITEMS = [
  { href: '/settings/profile', label: 'Profile', icon: User2 },
  { href: '/settings/connections', label: 'Connections', icon: Settings },
] as const

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()

  const isActive = (href: string) => pathname?.startsWith(href.split('/').slice(0, 2).join('/')) ?? false

  return (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const active = isActive(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        )
      })}

      <p className="text-muted-foreground mt-4 px-3 pb-1 text-xs font-medium uppercase tracking-wider">
        Settings
      </p>
      {SETTINGS_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href)
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
              active
                ? 'bg-accent text-foreground'
                : 'text-muted-foreground hover:bg-accent/50 hover:text-foreground',
            )}
          >
            <item.icon className="size-4" />
            {item.label}
          </Link>
        )
      })}
    </nav>
  )
}


export function Sidebar() {
  const { sidebarOpen, setSidebarOpen } = useUiStore()

  return (
    <>
      {/* Desktop */}
      <aside className="border-border hidden w-60 shrink-0 border-r md:block">
        <div className="sticky top-0 flex h-screen flex-col gap-6 py-5">
          <div className="px-6">
            <Logo />
          </div>
          <NavLinks />
        </div>
      </aside>

      {/* Mobile drawer */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setSidebarOpen(false)}
            aria-hidden
          />
          <aside className="border-border bg-background absolute inset-y-0 left-0 w-64 border-r py-5">
            <div className="mb-6 flex items-center justify-between px-6">
              <Logo />
              <button
                onClick={() => setSidebarOpen(false)}
                aria-label="Close menu"
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="size-5" />
              </button>
            </div>
            <NavLinks onNavigate={() => setSidebarOpen(false)} />
          </aside>
        </div>
      )}
    </>
  )
}
