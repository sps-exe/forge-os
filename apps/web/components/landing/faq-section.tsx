"use client";

import { motion } from "framer-motion";
import { FAQS } from "@/lib/constants";

export function FaqSection() {
  return (
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
  );
}
