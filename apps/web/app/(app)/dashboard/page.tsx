'use client'

import { Code2, GitBranch, Swords, Zap } from 'lucide-react'
import type { GithubDetails, LeetCodeDetails } from '@forge/shared'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ContributionHeatmap,
  Skeleton,
  StatCard,
  StreakFlame,
} from '@forge/ui'
import { useAccounts, useMe, usePlatformStats } from '@/lib/api/hooks'
import { PlatformCard } from '@/components/dashboard/platform-card'
import { ContestsCard } from '@/components/dashboard/contests-card'
import { DailyTasksCard } from '@/components/dashboard/daily-tasks-card'
import { AchievementsCard } from '@/components/dashboard/achievements-card'
import { WeeklyQuestsCard } from '@/components/dashboard/weekly-quests-card'
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner'

const QUOTES = [
  'Consistency beats intensity.',
  'One problem a day keeps the rejection away.',
  'Ship something today, even if it is small.',
  'The streak is the strategy.',
  'Future you is watching. Make them proud.',
]

export default function DashboardPage() {
  const { data: me, isLoading: meLoading } = useMe()
  const { data: accounts } = useAccounts()

  const connected = (platform: string) => accounts?.some((a) => a.platform === platform) ?? false

  const githubConnected = connected('GITHUB')
  const { data: githubStats } = usePlatformStats('GITHUB', githubConnected)
  const githubDetails = githubStats?.details as unknown as GithubDetails | undefined

  // Deterministic per-day quote so it doesn't change on rerender
  const quote = QUOTES[new Date().getDate() % QUOTES.length]

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* Greeting */}
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          {meLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <h1 className="text-2xl font-semibold tracking-tight">
              Good{' '}
              {new Date().getHours() < 12
                ? 'morning'
                : new Date().getHours() < 18
                  ? 'afternoon'
                  : 'evening'}
              , {me?.profile?.displayName ?? me?.name?.split(' ')[0] ?? 'developer'}
            </h1>
          )}
          <p className="text-muted-foreground mt-1 text-sm">{quote}</p>
        </div>
        <StreakFlame
          days={githubStats?.streak ?? 0}
          active={(githubStats?.streak ?? 0) > 0}
          size="sm"
        />
      </div>

      <OnboardingBanner />

      {/* Top stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Level"
          value={me?.level ?? '—'}
          sublabel={me ? `${me.totalXp} XP total` : undefined}
          icon={<Zap />}
          loading={meLoading}
        />
        <StatCard
          label="GitHub streak"
          value={githubStats?.streak ?? '—'}
          sublabel={githubConnected ? 'days of contributions' : 'not connected'}
          icon={<GitBranch />}
          accent="github"
          loading={githubConnected && !githubStats}
        />
        <StatCard
          label="Today"
          value={githubDetails ? githubDetails.contributionsToday : '—'}
          sublabel="contributions so far"
          icon={<GitBranch />}
          accent={githubDetails && githubDetails.contributionsToday > 0 ? 'success' : 'default'}
          loading={githubConnected && !githubStats}
        />
        <StatCard
          label="This year"
          value={githubDetails ? githubDetails.contributionsThisYear.toLocaleString() : '—'}
          sublabel="total contributions"
          icon={<GitBranch />}
          accent="github"
          loading={githubConnected && !githubStats}
        />
      </div>

      {/* Contribution heatmap */}
      {githubDetails && (
        <Card>
          <CardHeader>
            <CardTitle>Contribution activity</CardTitle>
          </CardHeader>
          <CardContent>
            <ContributionHeatmap days={githubDetails.contributionCalendar} />
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 lg:grid-cols-3">
        <DailyTasksCard />
        <WeeklyQuestsCard />
        <AchievementsCard />
      </div>

      {/* Platform cards + contests */}
      <div className="grid gap-4 lg:grid-cols-2">
        <PlatformCard
          platform="LEETCODE"
          title="LeetCode"
          icon={Code2}
          href="/leetcode"
          connected={connected('LEETCODE')}
          accentClass="text-platform-leetcode"
          renderStats={(stats) => {
            const d = stats.details as unknown as LeetCodeDetails
            return (
              <div className="grid grid-cols-3 gap-3 text-center">
                <div>
                  <p className="text-xl font-semibold tabular-nums">{stats.solvedCount ?? 0}</p>
                  <p className="text-muted-foreground text-xs">solved</p>
                </div>
                <div>
                  <p className="text-platform-leetcode text-xl font-semibold tabular-nums">
                    {stats.rating ?? '—'}
                  </p>
                  <p className="text-muted-foreground text-xs">contest rating</p>
                </div>
                <div>
                  <p className="text-xl font-semibold tabular-nums">{d.hardSolved}</p>
                  <p className="text-muted-foreground text-xs">hard solved</p>
                </div>
              </div>
            )
          }}
        />
        <PlatformCard
          platform="CODEFORCES"
          title="Codeforces"
          icon={Swords}
          href="/codeforces"
          connected={connected('CODEFORCES')}
          accentClass="text-platform-codeforces"
          renderStats={(stats) => (
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-platform-codeforces text-xl font-semibold tabular-nums">
                  {stats.rating ?? 'unrated'}
                </p>
                <p className="text-muted-foreground text-xs">rating</p>
              </div>
              <div>
                <p className="text-xl font-semibold tabular-nums">{stats.maxRating ?? '—'}</p>
                <p className="text-muted-foreground text-xs">max rating</p>
              </div>
              <div>
                <p className="truncate text-xl font-semibold capitalize">{stats.rank ?? '—'}</p>
                <p className="text-muted-foreground text-xs">rank</p>
              </div>
            </div>
          )}
        />
      </div>

      <ContestsCard />
    </div>
  )
}
