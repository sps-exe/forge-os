'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  Award,
  Check,
  CheckCircle2,
  Code2,
  GitBranch,
  Loader2,
  Save,
  Shield,
  Swords,
  Trash2,
  User,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'
import type { LucideIcon } from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
  Skeleton,
  StreakFlame,
} from '@forge/ui'
import {
  useAccounts,
  useAchievements,
  useMe,
  usePlatformStats,
  useConnectAccount,
  useDisconnectAccount,
} from '@/lib/api/hooks'
import { api, ApiClientError } from '@/lib/api/client'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { queryKeys } from '@/lib/api/hooks'
import type { GithubDetails, LeetCodeDetails } from '@forge/shared'

const TIMEZONES = Intl.supportedValuesOf
  ? Intl.supportedValuesOf('timeZone')
  : ['UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Asia/Kolkata']

const PLATFORMS: {
  platform: 'LEETCODE' | 'CODEFORCES' | 'GITHUB'
  title: string
  icon: LucideIcon
  accentClass: string
  placeholder: string
  managed?: boolean
}[] = [
  {
    platform: 'LEETCODE',
    title: 'LeetCode',
    icon: Code2,
    accentClass: 'text-platform-leetcode',
    placeholder: 'your-leetcode-username',
  },
  {
    platform: 'CODEFORCES',
    title: 'Codeforces',
    icon: Swords,
    accentClass: 'text-platform-codeforces',
    placeholder: 'your-codeforces-handle',
  },
  {
    platform: 'GITHUB',
    title: 'GitHub',
    icon: GitBranch,
    accentClass: 'text-platform-github',
    placeholder: 'your-github-username',
    managed: true,
  },
]

function ConnectionRow({ config }: { config: (typeof PLATFORMS)[number] }) {
  const { data: accounts, isLoading } = useAccounts()
  const connect = useConnectAccount()
  const disconnect = useDisconnectAccount()
  const [handle, setHandle] = useState('')

  const account = accounts?.find((a) => a.platform === config.platform)
  const Icon = config.icon

  const handleConnect = async () => {
    if (!handle.trim()) return
    try {
      await connect.mutateAsync({ platform: config.platform, handle: handle.trim() })
      toast.success(`${config.title} connected`)
      setHandle('')
    } catch (error) {
      toast.error(
        error instanceof ApiClientError ? error.message : `Couldn't connect ${config.title}`,
      )
    }
  }

  const handleDisconnect = async () => {
    try {
      await disconnect.mutateAsync(config.platform)
      toast.success(`${config.title} disconnected`)
    } catch {
      toast.error(`Couldn't disconnect ${config.title}`)
    }
  }

  return (
    <div className="border-border flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex items-center gap-3">
        <Icon className={`size-5 ${config.accentClass}`} />
        <div>
          <p className="font-medium">{config.title}</p>
          {isLoading ? (
            <p className="text-muted-foreground text-xs animate-pulse">Loading status...</p>
          ) : account ? (
            <p className="text-muted-foreground text-xs">@{account.handle}</p>
          ) : (
            <p className="text-muted-foreground text-xs">Not connected</p>
          )}
        </div>
      </div>

      {isLoading ? (
        <div className="h-9 w-24 bg-muted animate-pulse rounded-md" />
      ) : account ? (
        <div className="flex items-center gap-2">
          <Badge variant="success">
            <Check className="mr-1 size-3" /> Connected
          </Badge>
          {!config.managed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDisconnect}
              disabled={disconnect.isPending}
              aria-label={`Disconnect ${config.title}`}
            >
              <Trash2 className="text-destructive" />
            </Button>
          )}
        </div>
      ) : config.managed ? (
        <Badge variant="secondary">Sign in with GitHub to link</Badge>
      ) : (
        <div className="flex gap-2">
          <Input
            value={handle}
            onChange={(e) => setHandle(e.target.value)}
            placeholder={config.placeholder}
            className="sm:w-52"
            onKeyDown={(e) => e.key === 'Enter' && handleConnect()}
          />
          <Button onClick={handleConnect} disabled={connect.isPending || !handle.trim()}>
            {connect.isPending ? <Loader2 className="animate-spin" /> : 'Connect'}
          </Button>
        </div>
      )}
    </div>
  )
}

export default function SettingsPage() {
  const { data: me, isLoading: meLoading } = useMe()
  const { data: accounts } = useAccounts()
  const { data: achievements } = useAchievements()
  const queryClient = useQueryClient()

  const [displayName, setDisplayName] = useState('')
  const [bio, setBio] = useState('')
  const [timezone, setTimezone] = useState('UTC')

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
      toast.success('Profile updated successfully')
      queryClient.invalidateQueries({ queryKey: queryKeys.me })
    },
    onError: (err: unknown) => {
      const msg = err instanceof Error ? err.message : 'Failed to update profile'
      toast.error(msg)
    },
  })

  const isConnected = (platform: string) => accounts?.some((a) => a.platform === platform) ?? false

  const githubConnected = isConnected('GITHUB')
  const leetcodeConnected = isConnected('LEETCODE')
  const codeforcesConnected = isConnected('CODEFORCES')

  const { data: githubStats } = usePlatformStats('GITHUB', githubConnected)
  const { data: leetcodeStats } = usePlatformStats('LEETCODE', leetcodeConnected)
  const { data: codeforcesStats } = usePlatformStats('CODEFORCES', codeforcesConnected)

  const githubDetails = githubStats?.details as unknown as GithubDetails | undefined
  const leetcodeDetails = leetcodeStats?.details as unknown as LeetCodeDetails | undefined

  const totalXp = me?.totalXp ?? 0
  const level = me?.level ?? 1
  const xpInCurrentLevel = totalXp % 1000
  const xpProgress = Math.round((xpInCurrentLevel / 1000) * 100)

  const earnedBadges = achievements?.achievements?.filter((a) => a.earned) ?? []

  const hasChanges =
    displayName !== (me?.profile?.displayName ?? me?.name ?? '') ||
    bio !== (me?.profile?.bio ?? '') ||
    timezone !== (me?.profile?.timezone ?? 'UTC')

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header Profile Card */}
      <Card className="border-primary/20 bg-gradient-to-r from-accent/30 via-background to-background p-6">
        {meLoading ? (
          <div className="flex items-center gap-4">
            <Skeleton className="size-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                {me?.image ? (
                  <Image
                    src={me.image}
                    alt={me.name ?? 'Avatar'}
                    width={80}
                    height={80}
                    className="ring-primary/40 rounded-full ring-2"
                  />
                ) : (
                  <div className="bg-primary/10 text-primary flex size-20 items-center justify-center rounded-full text-2xl font-semibold">
                    {me?.name?.[0] ?? 'U'}
                  </div>
                )}
                <div className="bg-primary text-primary-foreground absolute -bottom-1 -right-1 flex size-7 items-center justify-center rounded-full text-xs font-bold shadow">
                  {level}
                </div>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl font-bold tracking-tight">
                    {me?.profile?.displayName ?? me?.name ?? 'Developer'}
                  </h1>
                  <Badge variant="default" className="gap-1">
                    <Shield className="size-3" />
                    Level {level}
                  </Badge>
                </div>
                <p className="text-muted-foreground text-sm">{me?.email}</p>
                {me?.profile?.bio && (
                  <p className="text-muted-foreground mt-1 text-sm max-w-md">
                    {me.profile.bio}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Level XP Progress Bar */}
        <div className="mt-6 pt-4 border-t border-border space-y-2">
          <div className="flex justify-between text-xs font-medium">
            <span className="text-muted-foreground flex items-center gap-1">
              <Zap className="size-3.5 text-warning" />
              Level {level} Progress
            </span>
            <span>
              {xpInCurrentLevel} / 1000 XP ({xpProgress}%)
            </span>
          </div>
          <div className="bg-muted h-2.5 w-full overflow-hidden rounded-full">
            <div
              className="bg-gradient-to-r from-primary to-warning h-full rounded-full transition-all duration-500"
              style={{ width: `${xpProgress}%` }}
            />
          </div>
        </div>
      </Card>

      {/* Quick Overview Grid */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Zap className="text-warning size-5 shrink-0" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{totalXp.toLocaleString()}</p>
              <p className="text-muted-foreground text-xs">Total XP Earned</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <Award className="text-primary size-5 shrink-0" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{earnedBadges.length}</p>
              <p className="text-muted-foreground text-xs">Badges Unlocked</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <StreakFlame days={githubStats?.streak ?? 0} active={(githubStats?.streak ?? 0) > 0} size="sm" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">{githubStats?.streak ?? 0}</p>
              <p className="text-muted-foreground text-xs">Current Streak</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex items-center gap-3 p-5">
            <CheckCircle2 className="text-success size-5 shrink-0" />
            <div>
              <p className="text-2xl font-semibold tabular-nums">
                {[githubConnected, leetcodeConnected, codeforcesConnected].filter(Boolean).length} / 3
              </p>
              <p className="text-muted-foreground text-xs">Connected Accounts</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Platform Connections Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Code2 className="size-5 text-primary" />
            Coding Platforms
          </CardTitle>
          <CardDescription>
            Link your coding accounts so Forge can track everything in one place. We only read public profile data. GitHub connects automatically when you sign in with it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {PLATFORMS.map((config) => (
            <ConnectionRow key={config.platform} config={config} />
          ))}
        </CardContent>
      </Card>

      {/* Edit Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <User className="size-5 text-primary" />
            Edit Profile Details
          </CardTitle>
          <CardDescription>Update your display name, bio, and preferences.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-5">
          {meLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-20 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          ) : (
            <>
              <div className="space-y-2">
                <label htmlFor="display-name" className="text-sm font-medium">
                  Display Name
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
                  Used for daily streak resets and notifications.
                </p>
              </div>

              <Button
                onClick={() => updateProfile.mutate()}
                disabled={updateProfile.isPending || !hasChanges}
                className="gap-2"
              >
                {updateProfile.isPending ? <Loader2 className="animate-spin" /> : <Save />}
                Save Changes
              </Button>
            </>
          )}
        </CardContent>
      </Card>
      
      {/* Badges Showcase */}
      {earnedBadges.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold tracking-tight">Earned Badges ({earnedBadges.length})</h2>
          <div className="grid gap-3 sm:grid-cols-3">
            {earnedBadges.map((badge) => (
              <Card key={badge.id} className="border-success/30 bg-success/5">
                <CardContent className="flex items-center gap-3 p-4">
                  <CheckCircle2 className="size-5 text-success shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{badge.title}</p>
                    <p className="text-muted-foreground text-xs truncate">{badge.description}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
