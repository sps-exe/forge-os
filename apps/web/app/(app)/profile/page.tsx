'use client'

import Image from 'next/image'
import Link from 'next/link'
import {
  Award,
  Calendar,
  CheckCircle2,
  Code2,
  GitBranch,
  Settings,
  Shield,
  Swords,
  User,
  Zap,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Skeleton,
  StreakFlame,
} from '@forge/ui'
import {
  useAccounts,
  useAchievements,
  useMe,
  usePlatformStats,
} from '@/lib/api/hooks'
import type { GithubDetails, LeetCodeDetails } from '@forge/shared'

export default function ProfilePage() {
  const { data: me, isLoading: meLoading } = useMe()
  const { data: accounts, isLoading: accountsLoading } = useAccounts()
  const { data: achievements } = useAchievements()

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

            <Button variant="outline" asChild className="gap-2 shrink-0 self-start sm:self-center">
              <Link href="/settings/profile">
                <Settings className="size-4" />
                Edit Profile
              </Link>
            </Button>
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

      {/* Connected Platforms Grid */}
      <div className="space-y-3">
        <h2 className="text-lg font-semibold tracking-tight">Connected Platforms</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {/* GitHub */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <GitBranch className="size-4" />
                  GitHub
                </CardTitle>
                <Badge variant={githubConnected ? 'success' : 'secondary'}>
                  {githubConnected ? 'Connected' : 'Not Linked'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2 pt-2">
              {githubConnected && githubStats ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Streak</span>
                    <span className="font-medium">{githubStats.streak} days</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">This Year</span>
                    <span className="font-medium">{githubDetails?.contributionsThisYear ?? 0} commits</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-xs">Connect your GitHub to track commit streaks.</p>
              )}
            </CardContent>
          </Card>

          {/* LeetCode */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Code2 className="size-4 text-platform-leetcode" />
                  LeetCode
                </CardTitle>
                <Badge variant={leetcodeConnected ? 'warning' : 'secondary'}>
                  {leetcodeConnected ? 'Connected' : 'Not Linked'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2 pt-2">
              {leetcodeConnected && leetcodeStats ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Solved</span>
                    <span className="font-medium">{leetcodeStats.solvedCount ?? 0}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium text-platform-leetcode">
                      {leetcodeStats.rating ?? 'Unrated'}
                    </span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-xs">Connect your LeetCode to track solved problems.</p>
              )}
            </CardContent>
          </Card>

          {/* Codeforces */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Swords className="size-4 text-platform-codeforces" />
                  Codeforces
                </CardTitle>
                <Badge variant={codeforcesConnected ? 'default' : 'secondary'}>
                  {codeforcesConnected ? 'Connected' : 'Not Linked'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-2 pt-2">
              {codeforcesConnected && codeforcesStats ? (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rating</span>
                    <span className="font-medium text-platform-codeforces">
                      {codeforcesStats.rating ?? 'Unrated'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Rank</span>
                    <span className="font-medium capitalize">{codeforcesStats.rank ?? '—'}</span>
                  </div>
                </>
              ) : (
                <p className="text-muted-foreground text-xs">Connect your Codeforces to track contest rating.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

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
