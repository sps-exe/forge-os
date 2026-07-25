'use client'

import { useState } from 'react'
import {
  Brain,
  CheckCircle2,
  Clock,
  ExternalLink,
  Plus,
  RotateCcw,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
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
} from '@forge/ui'
import {
  useCreateRevisionItem,
  useReviewRevisionItem,
  useRevision,
} from '@/lib/api/hooks'

const DIFFICULTY_VARIANTS: Record<string, 'success' | 'warning' | 'default'> = {
  Easy: 'success',
  Medium: 'warning',
  Hard: 'default',
}

export default function RevisionPage() {
  const { data, isLoading } = useRevision()
  const createItem = useCreateRevisionItem()
  const reviewItem = useReviewRevisionItem()

  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [topic, setTopic] = useState('')
  const [difficulty, setDifficulty] = useState<'Easy' | 'Medium' | 'Hard'>('Medium')
  const [notes, setNotes] = useState('')
  const [solutionUrl, setSolutionUrl] = useState('')

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !topic.trim()) return

    try {
      await createItem.mutateAsync({
        title: title.trim(),
        topic: topic.trim(),
        difficulty,
        notes: notes.trim() || undefined,
        solutionUrl: solutionUrl.trim() || undefined,
      })
      toast.success('Revision card created!')
      setTitle('')
      setTopic('')
      setNotes('')
      setSolutionUrl('')
      setShowForm(false)
    } catch {
      toast.error('Failed to create revision card.')
    }
  }

  const handleReview = async (id: string, itemTitle: string) => {
    try {
      await reviewItem.mutateAsync(id)
      toast.success(`Reviewed "${itemTitle}" (+25 XP)`)
    } catch {
      toast.error('Failed to record review.')
    }
  }

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="text-primary size-6" />
            <h1 className="text-2xl font-semibold tracking-tight">Revision & Memory</h1>
          </div>
          <p className="text-muted-foreground mt-1 text-sm">
            Retain problem patterns, algorithm tricks, and CS concepts with spaced repetition (1d → 3d → 7d → 14d → 30d).
          </p>
        </div>

        <Button onClick={() => setShowForm(!showForm)} className="gap-2">
          <Plus className="size-4" />
          Add Revision Card
        </Button>
      </div>

      {/* Creation Form */}
      {showForm && (
        <Card className="border-primary/40 bg-accent/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">New Revision Card</CardTitle>
            <CardDescription className="text-xs">
              Save a key pattern, trick, or mistake to review on an optimal memory schedule.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="title" className="text-xs font-medium">Title / Problem Name</label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g. LRU Cache doubly-linked list design"
                    required
                  />
                </div>
                <div className="space-y-1">
                  <label htmlFor="topic" className="text-xs font-medium">Topic / Domain</label>
                  <Input
                    id="topic"
                    value={topic}
                    onChange={(e) => setTopic(e.target.value)}
                    placeholder="e.g. Data Structures, DP, System Design"
                    required
                  />
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-1">
                  <label htmlFor="difficulty" className="text-xs font-medium">Difficulty</label>
                  <select
                    id="difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as 'Easy' | 'Medium' | 'Hard')}
                    className="border-input bg-background focus-visible:ring-ring h-9 w-full rounded-md border px-3 text-sm"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label htmlFor="solutionUrl" className="text-xs font-medium">Solution / Reference URL (Optional)</label>
                  <Input
                    id="solutionUrl"
                    value={solutionUrl}
                    onChange={(e) => setSolutionUrl(e.target.value)}
                    placeholder="https://leetcode.com/..."
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label htmlFor="notes" className="text-xs font-medium">Key Notes / Code Snippet / Trap to Avoid</label>
                <textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Dummy head/tail pointers simplify edge cases during removal..."
                  rows={3}
                  className="border-input bg-background focus-visible:ring-ring w-full rounded-md border px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="ghost" onClick={() => setShowForm(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={createItem.isPending}>
                  {createItem.isPending ? 'Saving...' : 'Save Card'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-36 w-full" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : data ? (
        <div className="space-y-8">
          {/* Due For Review Today */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Clock className="text-warning size-5" />
                Due For Review Today ({data.dueCount})
              </h2>
            </div>

            {data.dueItems.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="flex flex-col items-center gap-2 p-8 text-center text-sm text-muted-foreground">
                  <CheckCircle2 className="text-success size-8" />
                  <p className="font-medium text-foreground">You are all caught up for today!</p>
                  <p>No revision cards are due right now. Scheduled cards will appear here automatically.</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.dueItems.map((item) => (
                  <Card key={item.id} className="border-warning/40 bg-warning/5 flex flex-col justify-between">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <CardTitle className="text-base">{item.title}</CardTitle>
                          <p className="text-muted-foreground text-xs font-mono">{item.topic}</p>
                        </div>
                        <Badge variant={DIFFICULTY_VARIANTS[item.difficulty] ?? 'default'}>
                          {item.difficulty}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-3">
                      {item.notes && (
                        <div className="bg-background/80 border-border rounded-md border p-3 text-xs text-muted-foreground leading-relaxed whitespace-pre-wrap font-mono">
                          {item.notes}
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-1">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Badge variant="outline" className="font-mono text-[10px]">
                            Review #{item.reviewCount + 1}
                          </Badge>
                          {item.solutionUrl && (
                            <a
                              href={item.solutionUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-primary hover:underline flex items-center gap-1"
                            >
                              Solution <ExternalLink className="size-3" />
                            </a>
                          )}
                        </div>

                        <Button
                          size="sm"
                          onClick={() => handleReview(item.id, item.title)}
                          disabled={reviewItem.isPending}
                          className="gap-1.5 text-xs"
                        >
                          <RotateCcw className="size-3.5" />
                          Mark Reviewed (+25 XP)
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Scheduled Memory Bank */}
          {data.upcomingItems.length > 0 && (
            <div className="space-y-3">
              <h2 className="flex items-center gap-2 text-lg font-semibold tracking-tight">
                <Sparkles className="text-primary size-5" />
                Scheduled Memory Bank ({data.upcomingItems.length})
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                {data.upcomingItems.map((item) => (
                  <Card key={item.id}>
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <CardTitle className="text-sm">{item.title}</CardTitle>
                          <p className="text-muted-foreground text-xs font-mono">{item.topic}</p>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          Next in {item.intervalDays}d
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="text-xs text-muted-foreground flex justify-between items-center pt-2">
                      <span>Reviewed {item.reviewCount} times</span>
                      <span>
                        Due{' '}
                        {new Intl.DateTimeFormat(undefined, {
                          month: 'short',
                          day: 'numeric',
                        }).format(new Date(item.nextReviewAt))}
                      </span>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : null}
    </div>
  )
}
