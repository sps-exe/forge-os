"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Link from "next/link";
import { Button } from "@forge/ui";

export function CtaSection() {
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
  );
}
