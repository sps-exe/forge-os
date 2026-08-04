"use client";
import { useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import Link from 'next/link'
import { ArrowRight, Calendar, Flame, GitBranch, LineChart, Sparkles, Trophy, Activity, GitCommit } from 'lucide-react'
import { Badge, Button, Card, CardContent } from '@forge/ui'
import { Logo } from '@/components/logo'
import Text3DFlip from '@/components/creative/3d-stagger-flip'
import Smooth3DSlideshow from '@/components/creative/coverflow-gallery'
import CurvedLoop from '@/components/creative/curved-marquee'
import LiquidHover from '@/components/creative/liquid-distortion'
import ZoomTextTunnel from '@/components/creative/zoom-text-tunnel'
import ImageBox from '@/components/creative/gallery-tunnel'
import MatrixRain from '@/components/creative/matrix-rain'
import GlitchText from '@/components/creative/glitch-text'
import Typewriter from '@/components/creative/typewriter'
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
      'View PRs, commits, and issues directly inside your dashboard.',
  },
  {
    icon: Activity,
    title: 'Habit-forming dashboard',
    description:
      'One place to see your LeetCode dailies, Codeforces upcoming contests, and GitHub contributions.',
  },
  {
    icon: GitCommit,
    title: 'Cross-platform streaks',
    description:
      'Missed a LeetCode problem but pushed code to GitHub? Your Forge streak stays alive. Never break the chain.',
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

const FEATURE_IMAGES = [
  "/images/feature_streaks.jpg",
  "/images/feature_dashboard.jpg",
  "/images/feature_github.jpg",
  "/images/feature_dashboard.jpg",
  "/images/feature_streaks.jpg",
  "/images/feature_ai.jpg",
  "/images/feature_achievements.jpg"
];

const FEATURE_SLIDES = FEATURES.map((f, i) => ({
  title: f.title,
  image: { 
    src: FEATURE_IMAGES[i],
    alt: f.title 
  }
}))

export default function LandingPage() {
  const heroRef = useRef(null)
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  })
  
  const heroOpacity = useTransform(heroScroll, [0, 1], [1, 0])
  const heroScale = useTransform(heroScroll, [0, 1], [1, 0.85])
  const heroY = useTransform(heroScroll, [0, 1], [0, 100])

  const marqueeRef = useRef(null)
  const { scrollYProgress: marqueeScroll } = useScroll({
    target: marqueeRef,
    offset: ["start end", "end start"]
  })
  const marqueeRotate = useTransform(marqueeScroll, [0, 1], [-3, 3])
  const marqueeScale = useTransform(marqueeScroll, [0, 0.5, 1], [0.9, 1.05, 0.9])
  const marqueeX = useTransform(marqueeScroll, [0, 1], ["5%", "-5%"])

  const ctaRef = useRef(null)
  const { scrollYProgress: ctaScroll } = useScroll({
    target: ctaRef,
    offset: ["start start", "end end"]
  })

  const text1Opacity = useTransform(ctaScroll, [0, 0.1, 0.2, 0.3], [0, 1, 1, 0])
  const text1Scale = useTransform(ctaScroll, [0, 0.3], [0.8, 1.5])

  const text2Opacity = useTransform(ctaScroll, [0.3, 0.4, 0.5, 0.6], [0, 1, 1, 0])
  const text2Scale = useTransform(ctaScroll, [0.3, 0.6], [0.8, 1.5])

  const text3Opacity = useTransform(ctaScroll, [0.6, 0.7, 0.8, 0.9], [0, 1, 1, 0])
  const text3Scale = useTransform(ctaScroll, [0.6, 0.9], [0.8, 1.5])

  const buttonOpacity = useTransform(ctaScroll, [0.85, 0.95], [0, 1])
  const buttonScale = useTransform(ctaScroll, [0.85, 0.95], [0.8, 1])
  const buttonPointerEvents = useTransform(ctaScroll, (v) => typeof v === 'number' && v > 0.85 ? "auto" : "none")

  return (
    <div className="bg-background min-h-screen selection:bg-primary/30">
      {/* Nav */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="border-border/60 bg-background/80 sticky top-0 z-50 border-b backdrop-blur-xl"
      >
        <div className="container flex h-14 items-center justify-between">
          <Logo />
          <nav className="flex items-center gap-2">
            <Button variant="ghost" className="hidden sm:inline-flex" asChild>
              <Link href="/sign-in">Sign in</Link>
            </Button>
            <Button className="group" asChild>
              <Link href="/sign-in">
                Get started <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
          </nav>
        </div>
      </motion.header>

      {/* Hero Section (Retro Terminal) */}
      <section ref={heroRef} className="relative min-h-[95vh] flex flex-col items-center justify-center pt-24 pb-12 overflow-hidden bg-black font-mono">
        <MatrixRain />
        
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/50 to-black z-0" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-0 opacity-80" />

        <motion.div 
          style={{ opacity: heroOpacity, y: heroY }}
          className="container flex flex-col items-center text-center z-10"
        >
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <Badge className="px-4 py-1.5 text-sm bg-black text-primary border-primary hover:bg-primary hover:text-black transition-colors rounded-none tracking-widest font-bold font-mono">
              <GlitchText text="[ SYSTEM_ONLINE: EARLY_ACCESS ]" active={true} />
            </Badge>
          </motion.div>
          
          <div className="max-w-5xl text-4xl font-bold tracking-tight md:text-7xl mb-8 min-h-[160px] flex items-center justify-center text-primary drop-shadow-[0_0_10px_rgba(0,255,0,0.8)]">
            <Typewriter text="The daily operating system for developers_" speed={60} />
          </div>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 3.5 }}
            className="text-primary/70 mt-4 max-w-2xl text-lg md:text-xl leading-relaxed font-mono"
          >
            &gt; Initializing LeetCode protocols... OK<br/>
            &gt; Syncing Codeforces contests... OK<br/>
            &gt; Tracking GitHub streaks... OK<br/>
            <span className="text-primary mt-4 block font-bold">One terminal dashboard. Never break the chain.</span>
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 4.0 }}
            className="mt-12 flex flex-col sm:flex-row gap-6"
          >
            <Button size="lg" className="h-14 px-8 text-lg rounded-none group bg-primary text-black hover:bg-white border-2 border-primary hover:border-white font-bold transition-all shadow-[0_0_15px_rgba(0,255,65,0.5)] hover:shadow-[0_0_25px_rgba(255,255,255,0.8)]" asChild>
              <Link href="/sign-in">
                [ INIT_STREAK ] <ArrowRight className="ml-2 transition-transform group-hover:translate-x-2" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="h-14 px-8 text-lg rounded-none bg-black text-primary border-2 border-primary hover:bg-primary hover:text-black font-bold transition-all" asChild>
              <Link href="#features">
                <GlitchText text="READ_MANUAL" active={false} className="group-hover:text-black" />
              </Link>
            </Button>
          </motion.div>
        </motion.div>
      </section>

      {/* Platforms Marquee (Dynamic Divider) */}
      <div ref={marqueeRef} className="py-24 bg-black overflow-hidden relative font-mono flex items-center justify-center">
        <div className="absolute inset-y-0 left-0 w-32 lg:w-64 bg-gradient-to-r from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
        <div className="absolute inset-y-0 right-0 w-32 lg:w-64 bg-gradient-to-l from-black via-black/80 to-transparent z-10 pointer-events-none"></div>
        
        <motion.div 
          style={{ rotate: marqueeRotate, scale: marqueeScale, x: marqueeX }} 
          className="w-full flex items-center"
        >
          <div className="flex whitespace-nowrap overflow-visible">
            <motion.div 
              animate={{ x: ["0%", "-50%"] }}
              transition={{ ease: "linear", duration: 20, repeat: Infinity }}
              className="flex whitespace-nowrap items-center text-primary"
            >
              {[1, 2, 3, 4].map((i) => (
                <span 
                  key={i} 
                  className="text-[clamp(5rem,15vw,16rem)] font-black tracking-[-0.08em] leading-[0.8] mx-8 block"
                  style={{ transform: "scaleY(1.3)" }}
                >
                  LEETCODE • CODEFORCES • GITHUB •{" "}
                </span>
              ))}
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Features Showcase */}
      <section id="features" className="container py-32 relative">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          className="text-center mb-20"
        >
          <h2 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Everything you check daily.<br/><span className="text-primary">One tab.</span>
          </h2>
          <p className="text-muted-foreground text-xl max-w-2xl mx-auto">
            Stop context switching. Forge brings all your developer stats into a single, unified experience.
          </p>
        </motion.div>
        
        {/* Coverflow Gallery for Feature visuals */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="w-full h-[600px] mb-24 rounded-2xl overflow-hidden border border-border/20 bg-background/50 relative"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none z-10"></div>
          <Smooth3DSlideshow slides={FEATURE_SLIDES} cardWidth={450} cardHeight={320} autoplay={true} />
        </motion.div>

        {/* Premium Bento Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 relative z-20 -mt-24 px-4 auto-rows-[200px]">
          {FEATURES.map((feature, i) => {
            const bentoClasses = [
              "md:col-span-2 lg:col-span-4 lg:row-span-2", // 0: Large main
              "md:col-span-1 lg:col-span-2 lg:row-span-1", // 1: Standard
              "md:col-span-1 lg:col-span-2 lg:row-span-1", // 2: Standard
              "md:col-span-1 lg:col-span-2 lg:row-span-2", // 3: Tall
              "md:col-span-1 lg:col-span-2 lg:row-span-1", // 4: Standard
              "md:col-span-1 lg:col-span-2 lg:row-span-1", // 5: Standard
              "md:col-span-2 lg:col-span-4 lg:row-span-1", // 6: Wide footer
            ];
            
            const isLarge = i === 0;

            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 120, rotateX: 15 }}
                whileInView={{ opacity: 1, y: 0, rotateX: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  delay: (i % 3) * 0.1, 
                  duration: 0.8, 
                  type: "spring", 
                  damping: 20,
                  stiffness: 100
                }}
                className={`group relative rounded-3xl overflow-hidden bg-black/40 backdrop-blur-2xl border border-white/5 hover:border-primary/40 transition-all duration-700 hover:shadow-[0_0_40px_-10px_rgba(0,255,0,0.15)] flex flex-col ${bentoClasses[i]}`}
              >
                {/* Dynamic corner glow */}
                <div className="absolute -top-32 -right-32 w-64 h-64 bg-primary/20 rounded-full blur-[100px] pointer-events-none transition-opacity duration-700 opacity-30 group-hover:opacity-100" />
                
                {/* Scanline overlay */}
                <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent_50%,rgba(0,255,0,0.02)_50%)] bg-[length:100%_4px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none z-0" />
                
                {/* Content Container */}
                <div className={`relative z-10 flex flex-col h-full ${isLarge ? 'p-10' : 'p-8'}`}>
                  
                  {/* Icon wrapper */}
                  <div className={`rounded-2xl flex items-center justify-center transition-all duration-500 mb-auto
                    ${isLarge ? 'w-16 h-16 bg-primary/10 border border-primary/20 group-hover:bg-primary/20 group-hover:scale-110 group-hover:-rotate-3' 
                              : 'w-12 h-12 bg-white/5 border border-white/10 group-hover:bg-primary/10 group-hover:border-primary/30 group-hover:scale-110'}
                  `}>
                    <feature.icon className={`transition-colors duration-500 ${isLarge ? 'w-8 h-8 text-primary' : 'w-6 h-6 text-white group-hover:text-primary'}`} />
                  </div>

                  {/* Text content positioned at bottom */}
                  <div className="mt-8">
                    <h3 className={`font-black tracking-tight text-white group-hover:text-primary transition-colors duration-500
                      ${isLarge ? 'text-3xl md:text-4xl mb-4' : 'text-xl mb-3'}
                    `}>
                      {feature.title}
                    </h3>
                    <p className={`font-mono text-white/50 leading-relaxed
                      ${isLarge ? 'text-lg max-w-md' : 'text-sm'}
                    `}>
                      {feature.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* FAQ */}
      <section className="container max-w-3xl py-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold tracking-tight">Frequently Asked Questions</h2>
        </motion.div>
        
        <div className="space-y-4">
          {FAQS.map((faq, i) => (
            <motion.div 
              key={faq.q} 
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.1 }}
              className="border border-border/40 bg-surface/30 backdrop-blur-sm rounded-2xl p-6 hover:bg-surface/60 transition-colors"
            >
              <h3 className="font-semibold text-lg">{faq.q}</h3>
              <p className="text-muted-foreground mt-3 leading-relaxed">{faq.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Scroll-Driven Call to Action */}
      <section ref={ctaRef} className="w-full h-[300vh] bg-black relative">
        <div className="sticky top-0 h-screen w-full flex flex-col items-center justify-center overflow-hidden font-mono border-t border-border/20">
          
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,black_100%)] z-0 opacity-80 pointer-events-none" />

          {/* Text 1 */}
          <motion.div 
            style={{ opacity: text1Opacity, scale: text1Scale }}
            className="absolute text-5xl md:text-8xl lg:text-[8rem] font-black text-primary uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,0,0.5)] z-10 text-center"
          >
            Never Break
          </motion.div>

          {/* Text 2 */}
          <motion.div 
            style={{ opacity: text2Opacity, scale: text2Scale }}
            className="absolute text-5xl md:text-8xl lg:text-[8rem] font-black text-primary uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(0,255,0,0.5)] z-10 text-center"
          >
            Your Streak
          </motion.div>

          {/* Text 3 */}
          <motion.div 
            style={{ opacity: text3Opacity, scale: text3Scale }}
            className="absolute text-5xl md:text-8xl lg:text-[8rem] font-black text-white uppercase tracking-tighter drop-shadow-[0_0_15px_rgba(255,255,255,0.5)] z-10 text-center"
          >
            Start Now
          </motion.div>

          {/* Button */}
          <motion.div 
            style={{ opacity: buttonOpacity, scale: buttonScale, pointerEvents: buttonPointerEvents as any }}
            className="absolute z-20"
          >
            <Button size="lg" className="h-16 px-10 text-xl rounded-none bg-primary text-black hover:bg-white border-2 border-primary hover:border-white font-bold transition-all shadow-[0_0_20px_rgba(0,255,65,0.5)] hover:shadow-[0_0_40px_rgba(255,255,255,0.8)]" asChild>
              <Link href="/sign-in">Join Forge Now</Link>
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/20 py-12 bg-black">
        <div className="container flex flex-col items-center justify-between gap-6 md:flex-row">
          <Logo />
          <p className="text-muted-foreground text-sm">Built for developers who ship every day.</p>
        </div>
      </footer>
    </div>
  )
}
