'use client'

import { useEffect, useRef, useState } from 'react'
import { Bell, Check, CheckCheck, Trophy, Flame, Info } from 'lucide-react'
import { cn } from '@forge/ui'
import { useMarkAllNotificationsRead, useMarkNotificationRead, useNotifications } from '@/lib/api/hooks'
import type { NotificationDto } from '@forge/shared'

function notificationIcon(type: NotificationDto['type']) {
  switch (type) {
    case 'ACHIEVEMENT_UNLOCKED':
      return <Trophy className="text-warning size-4 shrink-0" />
    case 'STREAK_MILESTONE':
      return <Flame className="text-orange-400 size-4 shrink-0" />
    default:
      return <Info className="text-muted-foreground size-4 shrink-0" />
  }
}

function timeAgo(date: Date): string {
  const diff = Date.now() - new Date(date).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(
    new Date(date),
  )
}

export function NotificationBell() {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const { data } = useNotifications()
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const unread = data?.unreadCount ?? 0
  const notifications = data?.notifications ?? []

  function handleOpen() {
    setOpen((prev) => !prev)
  }

  function handleMarkAll() {
    markAll.mutate()
  }

  function handleClickNotification(id: string, read: boolean) {
    if (!read) markRead.mutate(id)
  }

  return (
    <div ref={ref} className="relative">
      <button
        id="notification-bell"
        onClick={handleOpen}
        aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
        className={cn(
          'relative flex size-8 items-center justify-center rounded-md transition-colors',
          'text-muted-foreground hover:bg-accent hover:text-foreground',
          open && 'bg-accent text-foreground',
        )}
      >
        <Bell className="size-4" />
        {unread > 0 && (
          <span className="bg-primary text-primary-foreground absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold leading-none">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div
          className={cn(
            'border-border bg-background absolute right-0 top-10 z-50 w-80 rounded-lg border shadow-lg',
          )}
        >
          {/* Header */}
          <div className="border-border flex items-center justify-between border-b px-4 py-3">
            <p className="text-sm font-medium">Notifications</p>
            {unread > 0 && (
              <button
                onClick={handleMarkAll}
                disabled={markAll.isPending}
                className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-xs transition-colors"
                aria-label="Mark all as read"
              >
                <CheckCheck className="size-3.5" />
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center gap-2 p-8 text-center text-sm">
                <Bell className="size-8 opacity-30" />
                <p>No notifications yet.</p>
              </div>
            ) : (
              <ul>
                {notifications.map((n) => (
                  <li key={n.id}>
                    <button
                      onClick={() => handleClickNotification(n.id, n.read)}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition-colors',
                        'hover:bg-accent/50',
                        !n.read && 'bg-accent/30',
                      )}
                      aria-label={n.read ? n.title : `Unread: ${n.title}`}
                    >
                      <span className="mt-0.5">{notificationIcon(n.type)}</span>
                      <div className="min-w-0 flex-1">
                        <p
                          className={cn(
                            'text-sm',
                            !n.read ? 'font-medium' : 'text-muted-foreground',
                          )}
                        >
                          {n.title}
                        </p>
                        <p className="text-muted-foreground mt-0.5 text-xs leading-snug">
                          {n.body}
                        </p>
                        <p className="text-muted-foreground/70 mt-1 text-xs">
                          {timeAgo(n.createdAt)}
                        </p>
                      </div>
                      {!n.read && (
                        <span className="bg-primary mt-1.5 size-2 shrink-0 rounded-full" />
                      )}
                      {n.read && <Check className="text-muted-foreground/40 mt-0.5 size-3.5 shrink-0" />}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
