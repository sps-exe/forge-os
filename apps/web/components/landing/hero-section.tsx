"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button, Badge } from "@forge/ui";
import MatrixRain from "@/components/creative/matrix-rain";
import GlitchText from "@/components/creative/glitch-text";
import Typewriter from "@/components/creative/typewriter";

export function HeroSection() {
  const heroRef = useRef(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"]
  });
  
  const heroOpacity = useTransform(heroScroll, [0, 1], [1, 0]);
  const heroY = useTransform(heroScroll, [0, 1], [0, 100]);

  return (
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
  );
}
