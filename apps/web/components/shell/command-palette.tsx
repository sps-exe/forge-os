'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Command } from 'cmdk'
import { LogOut, Search } from 'lucide-react'
import { signOut } from 'next-auth/react'
import { NAV_ITEMS } from './sidebar'
import { useUiStore } from '@/lib/stores/ui'

export function CommandPalette() {
  const router = useRouter()
  const { commandPaletteOpen, setCommandPaletteOpen } = useUiStore()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setCommandPaletteOpen(!commandPaletteOpen)
      }
    }
    document.addEventListener('keydown', down)
    return () => document.removeEventListener('keydown', down)
  }, [commandPaletteOpen, setCommandPaletteOpen])

  return (
    <Command.Dialog
      open={commandPaletteOpen}
      onOpenChange={setCommandPaletteOpen}
      label="Command palette"
      className="border-border bg-surface-raised fixed left-1/2 top-[20%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border shadow-2xl"
    >
      <div className="border-border flex items-center gap-2 border-b px-4">
        <Search className="text-muted-foreground size-4" />
        <Command.Input
          placeholder="Where to?"
          className="placeholder:text-muted-foreground h-12 w-full bg-transparent text-sm outline-none"
        />
      </div>
      <Command.List className="max-h-72 overflow-y-auto p-2">
        <Command.Empty className="text-muted-foreground py-6 text-center text-sm">
          No results found.
        </Command.Empty>
        <Command.Group
          heading="Navigate"
          className="text-muted-foreground text-xs [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
        >
          {NAV_ITEMS.map((item) => (
            <Command.Item
              key={item.href}
              onSelect={() => {
                router.push(item.href)
                setCommandPaletteOpen(false)
              }}
              className="text-foreground data-[selected=true]:bg-accent flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm"
            >
              <item.icon className="size-4" />
              {item.label}
            </Command.Item>
          ))}
        </Command.Group>
        <Command.Group
          heading="Account"
          className="text-muted-foreground text-xs [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5"
        >
          <Command.Item
            onSelect={() => signOut({ callbackUrl: '/' })}
            className="text-foreground data-[selected=true]:bg-accent flex cursor-pointer items-center gap-3 rounded-md px-2 py-2 text-sm"
          >
            <LogOut className="size-4" />
            Sign out
          </Command.Item>
        </Command.Group>
      </Command.List>
    </Command.Dialog>
  )
}
