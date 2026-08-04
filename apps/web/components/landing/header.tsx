"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@forge/ui";
import { Logo } from "@/components/logo";

export function Header() {
  return (
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
  );
}
