"use client";

import { motion, Variants } from "framer-motion";
import { ShieldCheck, Play } from "lucide-react";
import Link from "next/link";

export default function Hero() {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] }
    },
  };

  return (
    <section className="pt-[140px] pb-20 px-6 flex flex-col items-center justify-start relative z-10 bg-slate-50 bg-radial-wash">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="max-w-[960px] w-full flex flex-col items-center text-center relative z-[2]"
      >
        {/* Eyebrow */}
        <motion.div variants={itemVariants} className="mb-6">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-indigo-700 text-[12px] font-semibold tracking-[0.04em] bg-indigo-50 border border-indigo-100">
            ✦ AI-Native Cloud Identity Security Platform
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1 variants={itemVariants} className="font-[family-name:var(--font-jakarta)] font-extrabold text-[clamp(36px,5.5vw,72px)] leading-[1.1] tracking-[-0.03em] mb-6 text-slate-900 max-w-[850px]">
          Protect Machine Identities Before They Become <span className="text-gradient-primary">Attack Paths</span>
        </motion.h1>

        {/* Subheadline */}
        <motion.p variants={itemVariants} className="text-slate-600 text-lg md:text-xl font-normal max-w-[780px] leading-[1.6] mb-10">
          SentinelAI continuously discovers machine identities, maps attack paths using graph intelligence, prioritizes cloud identity risks, and accelerates investigations with AI.
        </motion.p>

        {/* CTAs */}
        <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-center gap-4 mb-16">
          <motion.div whileHover={{ translateY: -1 }} whileTap={{ scale: 0.97 }}>
            <Link
              href="/login?redirect=onboarding"
              className="inline-flex items-center justify-center px-8 py-3.5 text-base font-semibold rounded-xl btn-gradient"
            >
              Start Free Trial
            </Link>
          </motion.div>
          <motion.div whileHover={{ translateY: -1 }} whileTap={{ scale: 0.97 }}>
            <button
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 text-base font-semibold rounded-xl text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 shadow-[var(--shadow-xs)]"
            >
              Book Demo <Play className="w-4 h-4 fill-current text-slate-400" />
            </button>
          </motion.div>
        </motion.div>

        {/* Section 3: Trusted By */}
        <motion.div variants={itemVariants} className="flex flex-col items-center gap-4 w-full">
          <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Trusted by leading security teams</span>
          <div className="flex flex-wrap justify-center items-center gap-6 md:gap-12 opacity-85">
            {[
              "Global Enterprises",
              "Cloud Security Teams",
              "DevSecOps Teams",
              "SOC Teams"
            ].map(group => (
              <div 
                key={group}
                className="px-6 py-2.5 text-sm font-semibold rounded-lg bg-white border border-slate-200 text-slate-500 shadow-sm"
              >
                {group}
              </div>
            ))}
          </div>
        </motion.div>

      </motion.div>
    </section>
  );
}
