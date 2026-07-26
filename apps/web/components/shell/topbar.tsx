'use client'

import { useState, useRef, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Menu, Search, User, Settings, LogOut, ChevronDown } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { Button } from '@forge/ui'
import { useUiStore } from '@/lib/stores/ui'
import { NotificationBell } from './notification-bell'

interface TopbarProps {
  user: { name?: string | null; image?: string | null; email?: string | null }
}

export function Topbar({ user }: TopbarProps) {
  const { setSidebarOpen, setCommandPaletteOpen } = useUiStore()
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

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

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 rounded-full p-1 transition hover:bg-accent focus:outline-none"
            aria-expanded={dropdownOpen}
            aria-label="User menu"
          >
            <div className="ring-border overflow-hidden rounded-full ring-1">
              {user.image ? (
                <Image src={user.image} alt={user.name ?? 'avatar'} width={28} height={28} />
              ) : (
                <div className="bg-accent flex size-7 items-center justify-center text-xs font-medium">
                  {user.name?.[0] ?? '?'}
                </div>
              )}
            </div>
            <span className="text-muted-foreground hidden text-sm font-medium sm:block">
              {user.name}
            </span>
            <ChevronDown className="text-muted-foreground hidden size-3.5 sm:block" />
          </button>

          {dropdownOpen && (
            <div className="border-border bg-popover text-popover-foreground absolute right-0 mt-2 w-56 rounded-lg border p-1 shadow-lg ring-1 ring-black/5 z-50 animate-in fade-in-50 zoom-in-95">
              <div className="border-border border-b px-3 py-2.5">
                <p className="truncate text-sm font-medium">{user.name ?? 'Developer'}</p>
                {user.email && (
                  <p className="text-muted-foreground truncate text-xs">{user.email}</p>
                )}
              </div>

              <div className="py-1">
                <Link
                  href="/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="hover:bg-accent flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <User className="size-4 text-muted-foreground" />
                  <span>My Profile</span>
                </Link>
                <Link
                  href="/settings/profile"
                  onClick={() => setDropdownOpen(false)}
                  className="hover:bg-accent flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <Settings className="size-4 text-muted-foreground" />
                  <span>Profile Settings</span>
                </Link>
                <Link
                  href="/settings/connections"
                  onClick={() => setDropdownOpen(false)}
                  className="hover:bg-accent flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <Settings className="size-4 text-muted-foreground" />
                  <span>Platform Connections</span>
                </Link>
              </div>

              <div className="border-border border-t pt-1">
                <button
                  onClick={() => signOut({ callbackUrl: '/' })}
                  className="hover:bg-destructive/10 text-destructive flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors"
                >
                  <LogOut className="size-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}


