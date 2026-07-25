'use client'

import { useEffect, useState } from 'react'
import { Loader2, Save, User } from 'lucide-react'
import { toast } from 'sonner'
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
} from '@forge/ui'
import { useMe } from '@/lib/api/hooks'
import { api } from '@/lib/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/hooks'

const TIMEZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf('timeZone')
  : ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata']

export default function ProfileSettingsPage() {
  const { data: me, isLoading } = useMe()
  const queryClient = useQueryClient()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [timezone, setTimezone] = useState('UTC')

  // Sync form fields when data loads
  useEffect(() => {
    if (me) {
      setDisplayName(me.profile?.displayName ?? me.name ?? '')
      setBio(me.profile?.bio ?? '')
      setTimezone(me.profile?.timezone ?? 'UTC')
    }
  }, [me])

  const updateProfile = useMutation({
    mutationFn: () =>
      api.updateProfile({
        displayName: displayName.trim() || undefined,
        bio: bio.trim() || undefined,
        timezone,
      }),
    onSuccess: () => {
      toast.success('Profile updated')
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(msg)
    },
  })

  const hasChanges =
    displayName !== (me?.profile?.displayName ?? me?.name ?? '') ||
    bio !== (me?.profile?.bio ?? '') ||
    timezone !== (me?.profile?.timezone ?? 'UTC')

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-3">
        <User className="text-primary size-6" />
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Profile</h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Manage how your name and bio appear across Forge.
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Basic info</CardTitle>
          <CardDescription>These are visible to you today and on future public profiles.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {isLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <>
              {/* Avatar preview */}
              {me?.image && (
                <div className="flex items-center gap-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={me.image}
                    alt={me.name ?? 'avatar'}
                    className="ring-border size-12 rounded-full ring-1"
                  />
                  <div>
                    <p className="text-sm font-medium">{me.name}</p>
                    <p className="text-muted-foreground text-xs">{me.email}</p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <label htmlFor="display-name" className="text-sm font-medium">
                  Display name
                </label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="How should Forge greet you?"
                  maxLength={64}
                />
                <p className="text-muted-foreground text-xs">{displayName.length}/64</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="bio" className="text-sm font-medium">
                  Bio
                </label>
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="A sentence about what you're building or learning."
                  maxLength={280}
                  rows={3}
                  className="border-input bg-background placeholder:text-muted-foreground focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                <p className="text-muted-foreground text-xs">{bio.length}/280</p>
              </div>

              <div className="space-y-2">
                <label htmlFor="timezone" className="text-sm font-medium">
                  Timezone
                </label>
                <select
                  id="timezone"
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-2"
                >
                  {TIMEZONES.map((tz) => (
                    <option key={tz} value={tz}>
                      {tz}
                    </option>
                  ))}
                </select>
                <p className="text-muted-foreground text-xs">
                  Used for streak resets and future daily digests.
                </p>
              </div>

              <Button
                onClick={() => updateProfile.mutate()}
                disabled={updateProfile.isPending || !hasChanges}
                className="gap-2"
              >
                {updateProfile.isPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <Save />
                )}
                Save changes
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
          <CardDescription>Read-only account details from your OAuth provider.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {isLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="border-border space-y-2 rounded-md border p-4">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Email</span>
                <span className="font-medium">{me?.email ?? '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Level</span>
                <span className="font-medium">Level {me?.level ?? 1}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total XP</span>
                <span className="font-medium">{me?.totalXp ?? 0} XP</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
