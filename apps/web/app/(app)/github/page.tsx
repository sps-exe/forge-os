'use client'

import { GitBranch, Star, Users } from 'lucide-react'
import type { GithubDetails } from '@forge/shared'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  ContributionHeatmap,
  StatCard,
  StreakFlame,
} from '@forge/ui'
import { PlatformGate } from '@/components/platform/platform-gate'
import { PageHeader } from '@/components/platform/page-header'

export default function GithubPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PlatformGate platform="GITHUB" title="GitHub">
        {(stats) => {
          const d = (stats.details ?? {}) as unknown as Partial<GithubDetails>
          const topLanguages = Array.isArray(d.topLanguages) ? d.topLanguages : []
          return (
            <>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <PageHeader
                  icon={GitBranch}
                  title="GitHub"
                  handle={stats.handle}
                  accentClass="text-platform-github"
                />
                <StreakFlame days={stats.streak ?? 0} active={(stats.streak ?? 0) > 0} size="sm" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                  label="Contributions this year"
                  value={(d.contributionsThisYear ?? 0).toLocaleString()}
                  accent="github"
                  icon={<GitBranch />}
                />
                <StatCard
                  label="Today"
                  value={d.contributionsToday ?? 0}
                  accent={(d.contributionsToday ?? 0) > 0 ? 'success' : 'default'}
                />
                <StatCard
                  label="Total stars"
                  value={(d.totalStars ?? 0).toLocaleString()}
                  icon={<Star />}
                />
                <StatCard label="Followers" value={(d.followers ?? 0).toLocaleString()} icon={<Users />} />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Contribution activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <ContributionHeatmap days={d.contributionCalendar ?? []} />
                </CardContent>
              </Card>

              {topLanguages.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Top languages</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {topLanguages.map((lang) => (
                      <div key={lang.name}>
                        <div className="mb-1 flex justify-between text-sm">
                          <span className="font-medium">{lang.name}</span>
                          <span className="text-muted-foreground tabular-nums">
                            {lang.percentage}%
                          </span>
                        </div>
                        <div className="bg-muted h-2 overflow-hidden rounded-full">
                          <div
                            className="bg-platform-github h-full rounded-full"
                            style={{ width: `${lang.percentage}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              )}
            </>
          )
        }}
      </PlatformGate>
    </div>
  )
}
