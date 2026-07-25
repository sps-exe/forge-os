'use client'

import Image from 'next/image'
import { Menu, Search } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@forge/ui'
import { useUiStore } from '@/lib/stores/ui'
import { NotificationBell } from './notification-bell'

interface TopbarProps {
  user: { name?: string | null; image?: string | null }
}

export function Topbar({ user }: TopbarProps) {
  const { setSidebarOpen, setCommandPaletteOpen } = useUiStore()

  return (
    <header className="border-border bg-background/80 sticky top-0 z-40 flex h-14 items-center gap-3 border-b px-4 backdrop-blur md:px-6">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={() => setSidebarOpen(true)}
        aria-label="Open menu"
      >
        <Menu />
      </Button>

      <button
        onClick={() => setCommandPaletteOpen(true)}
        className="border-border bg-surface text-muted-foreground hover:border-muted-foreground/40 flex h-8 max-w-sm flex-1 items-center gap-2 rounded-md border px-3 text-sm transition-colors"
      >
        <Search className="size-3.5" />
        <span className="flex-1 text-left">Search…</span>
        <kbd className="border-border bg-background rounded border px-1.5 font-mono text-[10px]">
          ⌘K
        </kbd>
      </button>

      <div className="ml-auto flex items-center gap-2">
        <NotificationBell />
        <span className="text-muted-foreground hidden text-sm sm:block">{user.name}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/' })}
          title="Sign out"
          className="ring-border hover:ring-primary overflow-hidden rounded-full ring-1 transition"
        >
          {user.image ? (
            <Image src={user.image} alt={user.name ?? 'avatar'} width={30} height={30} />
          ) : (
            <div className="bg-accent flex size-[30px] items-center justify-center text-xs font-medium">
              {user.name?.[0] ?? '?'}
            </div>
          )}
        </button>
      </div>
    </header>
  )
}

