import Link from 'next/link'
import { ArrowRight, Calendar, Flame, GitBranch, LineChart, Sparkles, Trophy } from 'lucide-react'
import { Badge, Button, Card, CardContent } from '@forge/ui'
import { Logo } from '@/components/logo'

const FEATURES = [
  {
    icon: Flame,
    title: 'Never break a streak',
    description:
      'LeetCode daily, Codeforces practice, and GitHub contributions tracked in one place — with reminders before midnight.',
  },
  {
    icon: Calendar,
    title: 'Every contest, one calendar',
    description:
      'LeetCode, Codeforces, and more merged into a single schedule with countdowns. Never miss a rated round again.',
  },
  {
    icon: GitBranch,
    title: 'GitHub, front and center',
    description:
      "Contribution graph, commit streak, and language breakdown — see today's status the moment you open the app.",
  },
  {
    icon: LineChart,
    title: 'Analytics that mean something',
    description:
      'Rating graphs, difficulty breakdowns, weak-topic detection. Know exactly what to practice next.',
  },
  {
    icon: Sparkles,
    title: 'AI coaching (soon)',
    description:
      'A daily plan generated from your actual performance — not a generic roadmap someone else wrote.',
  },
  {
    icon: Trophy,
    title: 'XP, levels, achievements',
    description:
      'Consistency becomes a game. Earn XP for every problem, contribution, and contest you complete.',
  },
]

const FAQS = [
  {
    q: 'Is Forge free?',
    a: 'Yes — the core dashboard, integrations, and streak tracking are free. Advanced AI features will be premium later.',
  },
  {
    q: 'Which platforms are supported?',
    a: 'LeetCode, Codeforces, and GitHub today. CodeChef and AtCoder are on the roadmap.',
  },
  {
    q: 'Do I need to share my passwords?',
    a: 'Never. GitHub connects via OAuth; LeetCode and Codeforces use your public profile handles only.',
  },
]

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen">
      {/* Nav */}
      <header className="border-border/60 bg-background/80 sticky top-0 z-40 border-b backdrop-blur">
        <div className="container flex h-14 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/sign-in">
                Get started <ArrowRight />
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="container flex flex-col items-center py-24 text-center md:py-32">
        <Badge className="mb-6">Now in early access</Badge>
        <h1 className="max-w-3xl text-4xl font-bold tracking-tight md:text-6xl">
          The daily <span className="text-gradient">operating system</span> for developers
        </h1>
        <p className="text-muted-foreground mt-6 max-w-xl text-lg">
          LeetCode dailies, Codeforces contests, GitHub streaks — unified into one habit-forming
          dashboard you actually want to open every morning.
        </p>
        <div className="mt-8 flex gap-3">
          <Button size="lg" asChild>
            <Link href="/sign-in">
              Start your streak <ArrowRight />
            </Link>
          </Button>
          <Button size="lg" variant="secondary" asChild>
            <Link href="#features">See features</Link>
          </Button>
        </div>

        {/* Dashboard preview */}
        <div className="border-border bg-surface shadow-glow mt-16 w-full max-w-4xl rounded-xl border p-2">
          <div className="border-border bg-background rounded-lg border p-6">
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Streak', value: '47 days', accent: 'text-orange-400' },
                { label: 'CF Rating', value: '1624', accent: 'text-platform-codeforces' },
                { label: 'Solved', value: '312', accent: 'text-platform-leetcode' },
              ].map((s) => (
                <div
                  key={s.label}
                  className="border-border bg-surface rounded-lg border p-4 text-left"
                >
                  <p className="text-muted-foreground text-xs uppercase tracking-wider">
                    {s.label}
                  </p>
                  <p className={`mt-1 text-2xl font-semibold tabular-nums ${s.accent}`}>
                    {s.value}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-[3px]" aria-hidden>
              {Array.from({ length: 52 }).map((_, i) => (
                <div key={i} className="flex flex-col gap-[3px]">
                  {Array.from({ length: 7 }).map((_, j) => {
                    const level = (i * 7 + j * 13) % 5
                    const colors = ['bg-heat-0', 'bg-heat-1', 'bg-heat-2', 'bg-heat-3', 'bg-heat-4']
                    return <div key={j} className={`size-[8px] rounded-[2px] ${colors[level]}`} />
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight">
          Everything you check daily. One tab.
        </h2>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature) => (
            <Card key={feature.title}>
              <CardContent className="p-6">
                <feature.icon className="text-primary size-6" />
                <h3 className="mt-4 font-semibold">{feature.title}</h3>
                <p className="text-muted-foreground mt-2 text-sm">{feature.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="container max-w-2xl py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight">FAQ</h2>
        <div className="mt-10 space-y-6">
          {FAQS.map((faq) => (
            <div key={faq.q} className="border-border bg-surface rounded-xl border p-5">
              <h3 className="font-medium">{faq.q}</h3>
              <p className="text-muted-foreground mt-2 text-sm">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-border border-t py-10">
        <div className="container flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Logo />
          <p className="text-muted-foreground text-sm">Built for developers who ship every day.</p>
        </div>
      </footer>
    </div>
  )
}
