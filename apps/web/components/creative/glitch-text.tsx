"use client";

import { useState } from "react";
import { motion, Variants } from "framer-motion";

interface GlitchTextProps {
  text: string;
  className?: string;
  active?: boolean;
}

export default function GlitchText({ text, className = "", active = true }: GlitchTextProps) {
  // A simple glitch variant that slightly shifts the text and changes opacity randomly
  const glitchVariants: Variants = {
    hidden: { opacity: 1, x: 0, y: 0, scale: 1 },
    visible: {
      opacity: [1, 0.8, 1, 0.9, 1, 0.5, 1],
      x: [0, -2, 2, -1, 3, 0],
      y: [0, 1, -1, 2, -1, 0],
      transition: {
        duration: 0.3,
        repeat: Infinity,
        repeatType: "mirror",
        repeatDelay: Math.random() * 3 + 2, // Random delay between glitches
      },
    },
  };

  return (
    <div className={`relative inline-block whitespace-nowrap max-w-full ${className}`}>
      <motion.span
        variants={glitchVariants}
        initial="hidden"
        animate={active ? "visible" : "hidden"}
        className="relative z-10 block truncate"
      >
        {text}
      </motion.span>
      {/* Red shadow glitch layer */}
      <motion.span
        variants={glitchVariants}
        initial="hidden"
        animate={active ? "visible" : "hidden"}
        className="absolute top-0 left-[-2px] w-full text-red-500 opacity-50 z-0 mix-blend-screen block truncate"
        aria-hidden="true"
        style={{ animationDelay: "0.1s" }}
      >
        {text}
      </motion.span>
      {/* Blue shadow glitch layer */}
      <motion.span
        variants={glitchVariants}
        initial="hidden"
        animate={active ? "visible" : "hidden"}
        className="absolute top-0 left-[2px] w-full text-blue-500 opacity-50 z-0 mix-blend-screen block truncate"
        aria-hidden="true"
        style={{ animationDelay: "0.2s" }}
      >
        {text}
      </motion.span>
    </div>
  );
}
