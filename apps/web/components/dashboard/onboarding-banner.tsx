'use client'

import Link from 'next/link'
import { Sparkles, ArrowRight, CheckCircle2, Circle } from 'lucide-react'
import { Button, Card, CardContent } from '@forge/ui'
import { useAccounts } from '@/lib/api/hooks'

export function OnboardingBanner() {
  const { data: accounts, isLoading } = useAccounts()

  if (isLoading || !accounts) return null

  const isConnected = (platform: string) => accounts.some((a) => a.platform === platform)

  const github = isConnected('GITHUB')
  const leetcode = isConnected('LEETCODE')
  const codeforces = isConnected('CODEFORCES')

  const connectedCount = [github, leetcode, codeforces].filter(Boolean).length

  // If all 3 connected, no need for banner
  if (connectedCount === 3) return null

  return (
    <Card className="border-primary/30 bg-gradient-to-r from-primary/10 via-accent/20 to-background overflow-hidden relative">
      <CardContent className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="size-5 text-primary animate-pulse" />
              <h2 className="text-base font-semibold tracking-tight">
                Complete Your Setup ({connectedCount}/3 Connected)
              </h2>
            </div>
            <p className="text-muted-foreground text-xs sm:text-sm max-w-xl">
              Connect your developer handles to automatically sync ratings, solved counts, daily streaks, and unlock quest rewards.
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-1 text-xs">
              <div className="flex items-center gap-1.5 font-medium">
                {github ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" />
                )}
                <span className={github ? 'text-foreground' : 'text-muted-foreground'}>
                  GitHub
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                {leetcode ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" />
                )}
                <span className={leetcode ? 'text-foreground' : 'text-muted-foreground'}>
                  LeetCode
                </span>
              </div>
              <div className="flex items-center gap-1.5 font-medium">
                {codeforces ? (
                  <CheckCircle2 className="size-4 text-success" />
                ) : (
                  <Circle className="size-4 text-muted-foreground" />
                )}
                <span className={codeforces ? 'text-foreground' : 'text-muted-foreground'}>
                  Codeforces
                </span>
              </div>
            </div>
          </div>

          <Button asChild className="gap-2 shrink-0 self-start sm:self-center">
            <Link href="/settings/connections">
              <span>Connect Accounts</span>
              <ArrowRight className="size-4" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
