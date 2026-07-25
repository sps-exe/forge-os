'use client'

import { useState } from 'react'
import {
  ExternalLink,
  GitPullRequest,
  MessageSquare,
  ShieldAlert,
  Star,
  Tag,
} from 'lucide-react'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@forge/ui'
import { useOpenSource } from '@/lib/api/hooks'

export default function OpenSourcePage() {
  const [selectedLanguage, setSelectedLanguage] = useState<string>('All')
  const { data, isLoading, error } = useOpenSource(
    selectedLanguage === 'All' ? undefined : selectedLanguage,
  )

  const languages = ['All', ...(data?.languages ?? ['TypeScript', 'Python', 'Go', 'Rust'])]

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <GitPullRequest className="text-primary size-6" />
            <h1 className="text-2xl font-semibold tracking-tight">Open Source Hub</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Discover curated Good First Issues and beginner-friendly contributions matched to your tech stack.
          </p>
        </div>
      </div>

      {/* Language Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2 border-b border-border pb-3">
        {languages.map((lang) => (
          <Button
            key={lang}
            variant={selectedLanguage === lang ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setSelectedLanguage(lang)}
            className="rounded-full text-xs"
          >
            {lang}
          </Button>
        ))}
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      ) : error ? (
        <Card className="border-destructive/40 bg-destructive/5">
          <CardContent className="flex items-center gap-3 p-6 text-sm text-destructive">
            <ShieldAlert className="size-5 shrink-0" />
            <span>Could not load open-source issues. Please try again.</span>
          </CardContent>
        </Card>
      ) : data ? (
        <div className="space-y-4">
          <p className="text-muted-foreground text-xs font-medium uppercase tracking-wider">
            Showing {data.totalCount} {selectedLanguage !== 'All' ? selectedLanguage : ''} open-source issues
          </p>

          <div className="grid gap-4 sm:grid-cols-2">
            {data.issues.map((issue) => (
              <Card key={issue.id} className="flex flex-col justify-between transition-colors hover:border-primary/40">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs font-semibold text-primary">{issue.repo}</span>
                    <div className="flex items-center gap-1 text-xs text-warning font-medium">
                      <Star className="size-3.5 fill-warning text-warning" />
                      {issue.stars.toLocaleString()}
                    </div>
                  </div>
                  <CardTitle className="text-base font-semibold leading-snug pt-1">
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:underline flex items-start gap-1.5"
                    >
                      <span>{issue.title}</span>
                      <ExternalLink className="size-3.5 shrink-0 text-muted-foreground mt-0.5" />
                    </a>
                  </CardTitle>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Labels */}
                  <div className="flex flex-wrap items-center gap-1.5">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {issue.language}
                    </Badge>
                    {issue.labels.map((label) => (
                      <Badge key={label} variant="secondary" className="text-[10px]">
                        <Tag className="mr-1 size-2.5" />
                        {label}
                      </Badge>
                    ))}
                  </div>

                  {/* Footer Stats */}
                  <div className="flex items-center justify-between border-t border-border/60 pt-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MessageSquare className="size-3" />
                      {issue.commentsCount} comments
                    </span>
                    <a
                      href={issue.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-primary hover:underline font-medium flex items-center gap-1 text-xs"
                    >
                      Claim & Contribute
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  )
}
