"use client";

import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";

export function MarqueeSection() {
  const marqueeRef = useRef(null)
  const { scrollYProgress: marqueeScroll } = useScroll({
    target: marqueeRef,
    offset: ["start end", "end start"]
  })
  const marqueeRotate = useTransform(marqueeScroll, [0, 1], [-3, 3])
  const marqueeScale = useTransform(marqueeScroll, [0, 0.5, 1], [0.9, 1.05, 0.9])
  const marqueeX = useTransform(marqueeScroll, [0, 1], ["5%", "-5%"])

  return (
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
  );
}
