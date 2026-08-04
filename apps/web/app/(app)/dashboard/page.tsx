'use client'

import { Code2, GitBranch, Swords, Zap, Terminal } from 'lucide-react'
import type { GithubDetails, LeetCodeDetails } from '@forge/shared'
import {
  ContributionHeatmap,
  Skeleton,
  StreakFlame,
} from '@forge/ui'
import { useAccounts, useMe, usePlatformStats } from '@/lib/api/hooks'
import { PlatformCard } from '@/components/dashboard/platform-card'
import { ContestsCard } from '@/components/dashboard/contests-card'
import { DailyTasksCard } from '@/components/dashboard/daily-tasks-card'
import { AchievementsCard } from '@/components/dashboard/achievements-card'
import { WeeklyQuestsCard } from '@/components/dashboard/weekly-quests-card'
import { OnboardingBanner } from '@/components/dashboard/onboarding-banner'
import GlitchText from '@/components/creative/glitch-text'

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

  const quote = QUOTES[new Date().getDate() % QUOTES.length]
  const displayName = me?.profile?.displayName ?? me?.name?.split(' ')[0] ?? 'DEVELOPER'

  return (
    <div className="mx-auto max-w-6xl space-y-8 font-mono pb-12">
      {/* Terminal Header */}
      <div className="border border-primary/30 bg-black p-6 rounded-xl shadow-[0_0_30px_rgba(0,255,65,0.05)] relative overflow-hidden">
        <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.03)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-6">
          <div className="space-y-3">
            {meLoading ? (
              <Skeleton className="h-8 w-64 bg-primary/10" />
            ) : (
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-primary/70 text-sm mb-2">
                  <Terminal className="size-4" />
                  <span>forge_os v1.0.4</span>
                </div>
                <h1 className="text-2xl font-bold text-primary flex flex-wrap items-center gap-2 md:gap-3">
                  <span className="text-primary/50">&gt;</span> 
                  <span>SYSTEM_LOGIN:</span>
                  <GlitchText text={displayName.toUpperCase()} active={false} className="max-w-[200px] md:max-w-[400px]" />
                </h1>
              </div>
            )}
            <p className="text-primary/60 text-sm flex gap-2">
              <span className="text-primary/40">~%</span> {quote}
            </p>
          </div>
          
          <div className="bg-primary/5 border border-primary/20 p-3 rounded flex items-center gap-4">
            <div className="text-right">
              <div className="text-xs text-primary/50">STREAK_STATUS</div>
              <div className="text-primary font-bold">{githubStats?.streak ?? 0} DAYS</div>
            </div>
            <div className="h-10 w-px bg-primary/20"></div>
            <StreakFlame
              days={githubStats?.streak ?? 0}
              active={(githubStats?.streak ?? 0) > 0}
              size="sm"
            />
          </div>
        </div>
      </div>

      <div className="border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.05)] bg-black">
         <OnboardingBanner />
      </div>

      {/* Telemetry Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Level */}
        <div className="bg-black border border-primary/30 rounded-xl p-5 hover:border-primary/60 transition-all group flex flex-col">
          <div className="text-primary/50 text-xs mb-2 flex items-center gap-2">
            <Zap className="size-3" />
            <span>CURRENT_LEVEL</span>
          </div>
          {meLoading ? (
            <Skeleton className="h-10 w-16 bg-primary/10 mt-1" />
          ) : (
            <div className="text-4xl font-bold text-primary mb-1">{me?.level ?? '—'}</div>
          )}
          <div className="text-primary/40 text-xs mt-auto pt-2 border-t border-primary/10">
            {me ? `${me.totalXp} XP TOTAL` : 'LOADING...'}
          </div>
        </div>

        {/* GitHub Streak */}
        <div className="bg-black border border-primary/30 rounded-xl p-5 hover:border-primary/60 transition-all group flex flex-col">
           <div className="text-primary/50 text-xs mb-2 flex items-center gap-2">
            <GitBranch className="size-3" />
            <span>GH_STREAK</span>
          </div>
          {githubConnected && !githubStats ? (
            <Skeleton className="h-10 w-16 bg-primary/10 mt-1" />
          ) : (
            <div className="text-4xl font-bold text-white mb-1">{githubStats?.streak ?? '—'}</div>
          )}
          <div className="text-primary/40 text-xs mt-auto pt-2 border-t border-primary/10">
            {githubConnected ? 'ACTIVE_DAYS' : 'DISCONNECTED'}
          </div>
        </div>

        {/* Today's Commits */}
        <div className="bg-black border border-primary/30 rounded-xl p-5 hover:border-primary/60 transition-all group flex flex-col relative overflow-hidden">
          {githubDetails && githubDetails.contributionsToday > 0 && (
             <div className="absolute top-0 right-0 w-16 h-16 bg-primary/10 blur-xl rounded-full translate-x-1/2 -translate-y-1/2"></div>
          )}
           <div className="text-primary/50 text-xs mb-2 flex items-center gap-2 relative z-10">
            <GitBranch className="size-3" />
            <span>TODAY_COMMITS</span>
          </div>
          {githubConnected && !githubStats ? (
            <Skeleton className="h-10 w-16 bg-primary/10 mt-1" />
          ) : (
            <div className={`text-4xl font-bold mb-1 relative z-10 ${githubDetails && githubDetails.contributionsToday > 0 ? 'text-primary' : 'text-white'}`}>
              {githubDetails ? githubDetails.contributionsToday : '—'}
            </div>
          )}
          <div className="text-primary/40 text-xs mt-auto pt-2 border-t border-primary/10 relative z-10">
            CONTRIBUTIONS
          </div>
        </div>

        {/* Year Commits */}
         <div className="bg-black border border-primary/30 rounded-xl p-5 hover:border-primary/60 transition-all group flex flex-col">
           <div className="text-primary/50 text-xs mb-2 flex items-center gap-2">
            <GitBranch className="size-3" />
            <span>YEAR_TOTAL</span>
          </div>
          {githubConnected && !githubStats ? (
            <Skeleton className="h-10 w-24 bg-primary/10 mt-1" />
          ) : (
            <div className="text-4xl font-bold text-white mb-1">
              {githubDetails ? githubDetails.contributionsThisYear.toLocaleString() : '—'}
            </div>
          )}
          <div className="text-primary/40 text-xs mt-auto pt-2 border-t border-primary/10">
            CONTRIBUTIONS
          </div>
        </div>
      </div>

      {/* Contribution heatmap */}
      {githubDetails && (
        <div className="bg-black border border-primary/30 rounded-xl overflow-hidden shadow-[0_0_15px_rgba(0,255,65,0.05)]">
           <div className="px-5 py-3 border-b border-primary/20 flex flex-row items-center justify-between bg-primary/5">
             <h3 className="flex items-center gap-2 font-bold text-primary tracking-tight text-sm">
                <GitBranch className="size-4" />
                <span>[ CONTRIBUTION_MATRIX ]</span>
             </h3>
           </div>
           <div className="p-6 overflow-x-auto relative [&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-track]:bg-primary/5 [&::-webkit-scrollbar-thumb]:bg-primary/20 [&::-webkit-scrollbar-thumb]:rounded-full hover:[&::-webkit-scrollbar-thumb]:bg-primary/40">
              <div className="absolute inset-0 bg-[linear-gradient(rgba(0,255,65,0.02)_1px,transparent_1px)] bg-[size:100%_4px] pointer-events-none"></div>
              <div className="relative z-10 min-w-max">
                <ContributionHeatmap days={githubDetails.contributionCalendar} />
              </div>
           </div>
        </div>
      )}

      {/* Main Grid: Tasks, Quests, Achievements */}
      <div className="grid gap-6 lg:grid-cols-3">
        <DailyTasksCard />
        <WeeklyQuestsCard />
        <AchievementsCard />
      </div>

      {/* Platform Integrations */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PlatformCard
          platform="LEETCODE"
          title="LEETCODE"
          icon={Code2}
          href="/leetcode"
          connected={connected('LEETCODE')}
          accentClass="text-amber-500"
          renderStats={(stats) => {
            const d = stats.details as unknown as LeetCodeDetails
            return (
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-none">
                  <p className="text-2xl font-bold tabular-nums text-white">{stats.solvedCount ?? 0}</p>
                  <p className="text-primary/50 text-[10px] mt-1 uppercase">SOLVED</p>
                </div>
                <div className="bg-amber-500/10 border border-amber-500/30 p-3 rounded-none relative overflow-hidden">
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(245,158,11,0.05)_50%)] bg-[size:100%_4px]"></div>
                  <p className="text-amber-500 text-2xl font-bold tabular-nums relative z-10">
                    {stats.rating ?? '—'}
                  </p>
                  <p className="text-amber-500/60 text-[10px] mt-1 uppercase relative z-10">RATING</p>
                </div>
                <div className="bg-primary/5 border border-primary/20 p-3 rounded-none">
                  <p className="text-2xl font-bold tabular-nums text-red-400">{d.hardSolved}</p>
                  <p className="text-primary/50 text-[10px] mt-1 uppercase">HARD</p>
                </div>
              </div>
            )
          }}
        />
        <PlatformCard
          platform="CODEFORCES"
          title="CODEFORCES"
          icon={Swords}
          href="/codeforces"
          connected={connected('CODEFORCES')}
          accentClass="text-blue-400"
          renderStats={(stats) => (
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded-none relative overflow-hidden">
                 <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(59,130,246,0.05)_50%)] bg-[size:100%_4px]"></div>
                <p className="text-blue-400 text-2xl font-bold tabular-nums relative z-10">
                  {stats.rating ?? 'UNRATED'}
                </p>
                <p className="text-blue-400/60 text-[10px] mt-1 uppercase relative z-10">RATING</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-3 rounded-none">
                <p className="text-2xl font-bold tabular-nums text-white">{stats.maxRating ?? '—'}</p>
                <p className="text-primary/50 text-[10px] mt-1 uppercase">MAX_RATING</p>
              </div>
              <div className="bg-primary/5 border border-primary/20 p-3 rounded-none">
                <p className="truncate text-xl font-bold uppercase text-white mt-1">{stats.rank ?? '—'}</p>
                <p className="text-primary/50 text-[10px] mt-1 uppercase">RANK</p>
              </div>
            </div>
          )}
        />
      </div>

      <ContestsCard />
    </div>
  )
}
