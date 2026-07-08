"use client";

import { motion, Variants } from "framer-motion";
import { Check } from "lucide-react";
import Link from "next/link";

export default function Pricing() {
  const containerVariants: Variants = {
    hidden: {},
    visible: {
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants: Variants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } }
  };

  return (
    <section id="pricing" className="w-full py-24 relative z-10 overflow-hidden bg-slate-50 border-b border-slate-200">
      <div className="max-w-[1100px] mx-auto px-6">
        
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-indigo-700 text-[13px] font-semibold tracking-[0.04em] bg-indigo-50 border border-indigo-100 mb-4">
            SIMPLE PRICING
          </div>
          <h2 className="font-[family-name:var(--font-jakarta)] font-extrabold text-4xl md:text-5xl text-slate-900">
            No per-seat pricing. No surprises.
          </h2>
        </div>

        <motion.div 
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-100px" }}
          className="flex flex-col md:flex-row items-stretch justify-center gap-6 md:gap-4 lg:gap-8"
        >
          {/* Starter */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-sm p-8 flex flex-col transition-all duration-300 rounded-[24px] bg-white border border-slate-200 shadow-sm"
          >
            <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-slate-900 mb-2">Starter</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">$0</span>
              <span className="text-slate-500 font-medium">/ month</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Up to 500 identities</p>
            
            <div className="flex flex-col gap-4 mb-10 flex-1">
              {[
                "CloudTrail JSON ingestion",
                "Graph mapping in Neo4j",
                "Incident risk scoring",
                "7-day log retention",
                "Dashboard alert metrics"
              ].map(f => (
                <div key={f} className="flex items-center gap-3">
                  <Check className="w-5 h-5 text-indigo-600 shrink-0" />
                  <span className="text-slate-600 text-[15px]">{f}</span>
                </div>
              ))}
            </div>
            
            <Link
              href="/signup"
              className="w-full py-3.5 text-center font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Get Started Free
            </Link>
          </motion.div>

          {/* Pro */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-sm p-8 flex flex-col relative z-10 transition-all duration-300 rounded-[24px] bg-white border-2 border-indigo-600 shadow-md md:scale-[1.03]"
          >
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
              <div className="inline-flex items-center justify-center px-4 py-1 rounded-full text-white text-xs font-bold tracking-[0.04em] bg-indigo-600 shadow-md">
                MOST POPULAR
              </div>
            </div>

            <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-slate-900 mb-2 mt-2">Pro</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">$499</span>
              <span className="text-slate-500 font-medium">/ month</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Up to 10,000 identities</p>
            
            <div className="flex flex-col gap-4 mb-10 flex-1">
              {[
                "Everything in Starter",
                "AI Security Analyst Copilot",
                "Attack path visualization",
                "90-day retention",
                "Slack + PagerDuty alerts",
                "API access & integration tokens"
              ].map((f, i) => (
                <div key={f} className="flex items-start gap-3">
                  <Check className="w-5 h-5 shrink-0 text-indigo-600" />
                  <span className="text-slate-600 text-[15px]">{f}</span>
                </div>
              ))}
            </div>
            
            <Link
              href="/signup"
              className="w-full py-3.5 text-center text-white bg-indigo-600 font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
            >
              Start 14-Day Trial
            </Link>
          </motion.div>

          {/* Enterprise */}
          <motion.div 
            variants={itemVariants}
            className="w-full max-w-sm p-8 flex flex-col transition-all duration-300 rounded-[24px] bg-white border border-slate-200 shadow-sm"
          >
            <h3 className="font-[family-name:var(--font-jakarta)] text-2xl font-bold text-slate-900 mb-2">Enterprise</h3>
            <div className="flex items-baseline gap-1 mb-2">
              <span className="text-4xl font-extrabold text-slate-900 tracking-tight">Custom</span>
            </div>
            <p className="text-slate-500 text-sm mb-8">Unlimited identities</p>
            
            <div className="flex flex-col gap-4 mb-10 flex-1">
              {[
                "Everything in Pro",
                "Multi-Tenant workspaces",
                "Continuous AWS integration",
                "Custom data retention",
                "Dedicated support & SLAs",
                "API Keys and SIEM webhook exports"
              ].map((f, i) => (
                <div key={f} className="flex items-start gap-3">
                  <Check className="w-5 h-5 shrink-0 text-indigo-600" />
                  <span className="text-slate-600 text-[15px]">{f}</span>
                </div>
              ))}
            </div>
            
            <Link
              href="/signup"
              className="w-full py-3.5 text-center font-semibold rounded-xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition-colors"
            >
              Contact Sales
            </Link>
          </motion.div>

        </motion.div>
      </div>
    </section>
  );
}
