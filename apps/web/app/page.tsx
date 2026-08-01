import Link from 'next/link'
import { ArrowRight, Calendar, Flame, GitBranch, LineChart, Sparkles, Trophy } from 'lucide-react'
import { Badge, Button, Card, CardContent } from '@forge/ui'
import { Logo } from '@/components/logo'
import Text3DFlip from '@/components/creative/3d-stagger-flip'
import Smooth3DSlideshow from '@/components/creative/coverflow-gallery'
import CurvedLoop from '@/components/creative/curved-marquee'
import LiquidHover from '@/components/creative/liquid-distortion'
import ZoomTextTunnel from '@/components/creative/zoom-text-tunnel'
import ImageBox from '@/components/creative/gallery-tunnel'

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

const FEATURE_SLIDES = FEATURES.map((f, i) => ({
  title: f.title,
  image: { 
    src: [
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/f8b3688c-11d0-425c-0b6f-66f133322c00/w=800",
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/c083d83a-f5a4-4434-989f-4eaa9bbe7500/w=800",
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/12e8b0be-f114-4134-1ab7-53116bfc2800/w=800",
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/b14ae2a2-1116-4a7f-0a18-1d74c4a46f00/w=800",
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/babdb603-8b5b-4520-58d6-240a34463c00/w=800",
      "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/041b1d75-2371-44dc-4b15-972ecd7b2400/w=800",
    ][i % 6],
    alt: f.title 
  }
}))

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
      <section className="container flex flex-col items-center py-24 text-center md:py-32 relative overflow-hidden">
        <Badge className="mb-6">Now in early access</Badge>
        
        <div className="max-w-4xl text-4xl font-bold tracking-tight md:text-7xl mb-8 min-h-[140px] flex items-center justify-center">
          <Text3DFlip 
            text="The daily operating system for developers"
            font={{
              fontFamily: "var(--font-sans)",
              fontWeight: 800,
              fontSize: "inherit",
              lineHeight: "1.1em",
            }}
            color="currentColor"
          />
        </div>
        
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

        {/* Dashboard preview with Liquid Hover */}
        <div className="border-border bg-surface shadow-glow mt-16 w-full max-w-4xl rounded-xl border p-2 relative">
          <div className="w-full aspect-[16/9] rounded-lg overflow-hidden border border-border relative">
            <LiquidHover 
              imageSrc="/dashboard-preview.png"
              resolution={12}
              cursorSize={80}
              intensity={70}
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>
      </section>

      {/* Platforms Marquee */}
      <div className="py-12 border-y border-border/40 bg-surface overflow-hidden">
        <CurvedLoop 
          text="LEETCODE • CODEFORCES • GITHUB • "
          color="hsl(var(--muted-foreground))"
          font={{ fontFamily: "var(--font-mono)", fontWeight: 600, fontSize: "1.5rem" }}
          baseVelocity={-1.5}
          curveAmount={50}
        />
      </div>

      {/* Visual Divider / Gallery Tunnel */}
      <section className="w-full h-[600px] border-b border-border/40 relative">
        <ImageBox 
          images={[
            { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/f8b3688c-11d0-425c-0b6f-66f133322c00/w=800", alt: "Leetcode" },
            { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/c083d83a-f5a4-4434-989f-4eaa9bbe7500/w=800", alt: "Codeforces" },
            { src: "https://imagedelivery.net/IEUjvl3YUlxY-MrTpOAWDQ/12e8b0be-f114-4134-1ab7-53116bfc2800/w=800", alt: "GitHub" }
          ]} 
          colors={["#FF6A00", "#AB54F7", "#EA3737", "#0072E3", "#00AA3C", "#FFB200"]}
          background="#000000"
          lineColor="#202020"
          lineOpacity={80}
          grid={4}
          speed={80}
          boost={120}
          fade={150}
          label={true}
          labelText="Enter the Forge"
          labelFill="#FFFFFF"
        />
      </section>

      {/* Features */}
      <section id="features" className="container py-24">
        <h2 className="text-center text-3xl font-bold tracking-tight mb-16">
          Everything you check daily. One tab.
        </h2>
        
        {/* Replace static cards with Coverflow */}
        <div className="w-full h-[500px] mb-12">
          <Smooth3DSlideshow slides={FEATURE_SLIDES} cardWidth={400} cardHeight={300} autoplay={true} />
        </div>

        {/* Keep the descriptions below for accessibility/clarity */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 mt-12">
          {FEATURES.map((feature) => (
            <Card key={feature.title} className="bg-background/50">
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

      {/* Infinite Text Call to Action */}
      <section className="w-full h-[400px] border-y border-border/40 relative overflow-hidden bg-black flex items-center justify-center">
        <ZoomTextTunnel 
          texts={["NEVER BREAK", "YOUR STREAK", "START NOW"]}
          font={{
            fontFamily: "var(--font-sans)",
            fontWeight: 900,
            fontSize: "4rem",
            textTransform: "uppercase"
          }}
          color="#ffffff"
        />
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none mix-blend-difference">
           <Button size="lg" className="pointer-events-auto" asChild>
            <Link href="/sign-in">Join Forge</Link>
          </Button>
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
