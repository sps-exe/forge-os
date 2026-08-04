"use client";

import { Header } from "@/components/landing/header";
import { HeroSection } from "@/components/landing/hero-section";
import { MarqueeSection } from "@/components/landing/marquee-section";
import { FeaturesShowcase } from "@/components/landing/features-showcase";
import { FaqSection } from "@/components/landing/faq-section";
import { CtaSection } from "@/components/landing/cta-section";
import { Footer } from "@/components/landing/footer";

export default function LandingPage() {
  return (
    <div className="bg-background min-h-screen selection:bg-primary/30">
      <Header />
      <HeroSection />
      <MarqueeSection />
      <FeaturesShowcase />
      <FaqSection />
      <CtaSection />
      <Footer />
    </div>
  );
}
