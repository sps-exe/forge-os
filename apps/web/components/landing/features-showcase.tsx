"use client";

import { motion } from "framer-motion";
import { FEATURES, FEATURE_SLIDES } from "@/lib/constants";
import Smooth3DSlideshow from "@/components/creative/coverflow-gallery";

export function FeaturesShowcase() {
  return (
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
  );
}
