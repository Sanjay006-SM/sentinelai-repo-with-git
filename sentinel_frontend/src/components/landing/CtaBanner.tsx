"use client";

import { motion } from "framer-motion";
import Link from "next/link";

export default function CtaBanner() {
  return (
    <section id="demo-video" className="w-full py-24 relative z-10 overflow-hidden px-6 bg-slate-50">
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }}
        whileInView={{ scale: 1, opacity: 1 }}
        viewport={{ once: true, margin: "-100px" }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="w-full max-w-[800px] mx-auto text-center px-6 py-[80px] md:px-12 flex flex-col items-center rounded-[24px] bg-white border border-slate-200 shadow-lg"
      >
        <h2 className="font-[family-name:var(--font-jakarta)] font-extrabold text-3xl md:text-5xl text-slate-900 mb-4">
          Ready to Secure Your Cloud Identities?
        </h2>
        <p className="text-slate-600 text-base md:text-lg mb-10 max-w-lg">
          Get started with our 14-day free trial or run immediate sandbox checks using static CloudTrail log files.
        </p>
        
        <div className="flex flex-col sm:flex-row items-center gap-4">
          <Link
            href="/login?redirect=onboarding"
            className="w-full sm:w-auto px-8 py-3.5 text-white bg-indigo-600 text-base font-semibold rounded-xl hover:bg-indigo-700 transition-all shadow-md shadow-indigo-100"
          >
            Start Free Trial
          </Link>
          <button
            type="button"
            className="w-full sm:w-auto px-8 py-3.5 text-base font-semibold rounded-xl transition-colors border border-slate-200 text-slate-700 bg-white hover:bg-slate-50"
          >
            Book Demo
          </button>
        </div>
      </motion.div>
    </section>
  );
}
