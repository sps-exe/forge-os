'use client'

import { Swords } from 'lucide-react'
import type { CodeforcesDetails } from '@forge/shared'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  EmptyState,
  RatingChart,
  StatCard,
} from '@forge/ui'
import { PlatformGate } from '@/components/platform/platform-gate'
import { PageHeader } from '@/components/platform/page-header'

export default function CodeforcesPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <PlatformGate platform="CODEFORCES" title="Codeforces">
        {(stats) => {
          const d = stats.details as unknown as CodeforcesDetails
          const chartData = d.ratingHistory.map((r) => ({
            label: new Date(r.at).toLocaleDateString(undefined, {
              month: 'short',
              year: '2-digit',
            }),
            rating: r.newRating,
          }))
          return (
            <>
              <PageHeader
                icon={Swords}
                title="Codeforces"
                handle={stats.handle}
                accentClass="text-platform-codeforces"
              />

              <div className="grid gap-4 sm:grid-cols-3">
                <StatCard
                  label="Current rating"
                  value={stats.rating ?? 'unrated'}
                  accent="codeforces"
                />
                <StatCard label="Max rating" value={stats.maxRating ?? '—'} accent="codeforces" />
                <StatCard
                  label="Rank"
                  value={<span className="capitalize">{stats.rank ?? '—'}</span>}
                  accent="codeforces"
                />
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Rating history</CardTitle>
                </CardHeader>
                <CardContent>
                  {chartData.length > 0 ? (
                    <RatingChart data={chartData} color="#318ce7" />
                  ) : (
                    <EmptyState
                      title="No rated contests yet"
                      description="Compete in a rated round to see your rating curve."
                    />
                  )}
                </CardContent>
              </Card>
            </>
          )
        }}
      </PlatformGate>
    </div>
  )
}
