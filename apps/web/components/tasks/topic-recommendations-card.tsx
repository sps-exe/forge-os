'use client'

import { Compass, Lightbulb, Sparkles } from 'lucide-react'
import { Badge, Card, CardContent, CardHeader, CardTitle } from '@forge/ui'
import type { TopicRecommendation } from '@forge/shared'

interface TopicRecommendationsCardProps {
  recommendations: TopicRecommendation[]
}

export function TopicRecommendationsCard({ recommendations }: TopicRecommendationsCardProps) {
  if (!recommendations || recommendations.length === 0) return null

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-background via-surface to-accent/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base font-semibold">
            <Sparkles className="text-primary size-4" />
            Recommended Focus Topics
          </CardTitle>
          <Badge variant="secondary" className="gap-1 text-xs">
            <Compass className="size-3" />
            Stats-Tailored
          </Badge>
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid gap-3 sm:grid-cols-3">
          {recommendations.map((item) => (
            <div
              key={item.topic}
              className="border-border bg-background/80 flex flex-col justify-between space-y-2 rounded-lg border p-3.5 shadow-sm"
            >
              <div className="space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-sm font-semibold leading-snug">{item.topic}</p>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  {item.reason}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-border/50 text-[11px]">
                <span className="text-muted-foreground flex items-center gap-1">
                  <Lightbulb className="text-warning size-3" />
                  Suggested Level
                </span>
                <Badge variant="outline" className="font-mono text-[10px]">
                  {item.suggestedLevel}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
