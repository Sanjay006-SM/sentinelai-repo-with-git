"use client";

import { useState } from "react";
import { Clock, Eye, AlertCircle, Zap, Sparkles, Layers } from "lucide-react";

export default function BenefitsSection() {
  const [isExpanded, setIsExpanded] = useState(false);

  const benefits = [
    {
      icon: <Clock className="w-6 h-6 text-[#9C27B0]" />,
      title: "Reduce Triage Time",
      desc: "SentinelAI automates threat path parsing, dropping Mean Time to Investigate (MTTI) from hours to seconds using Gemini's security logic.",
      badge: "Fastest MTTI",
      stackedClasses: "rotate-[-2deg] translate-x-0 translate-y-0 z-40",
      expandedClasses: "rotate-0 -translate-y-[155%] md:translate-y-0 md:-translate-x-[158%] z-10",
    },
    {
      icon: <Eye className="w-6 h-6 text-[#9C27B0]" />,
      title: "Improve Cloud Visibility",
      desc: "Discover shadow identities, inactive keys, and unmanaged roles. Keep a real-time, context-rich catalog of all machine entities.",
      badge: "Deep Audit",
      stackedClasses: "rotate-[-7deg] translate-x-[-6px] translate-y-[4px] z-30",
      expandedClasses: "rotate-0 -translate-y-[52%] md:translate-y-0 md:-translate-x-[53%] z-20",
    },
    {
      icon: <AlertCircle className="w-6 h-6 text-[#9C27B0]" />,
      title: "Prioritize Critical Risks",
      desc: "Stop chasing low-level noise. Our engine scores vulnerabilities based on actual path context, helping you focus resources where they matter most.",
      badge: "Context Scoring",
      stackedClasses: "rotate-[5deg] translate-x-[6px] translate-y-[-4px] z-20",
      expandedClasses: "rotate-0 translate-y-[52%] md:translate-y-0 md:translate-x-[53%] z-30",
    },
    {
      icon: <Zap className="w-6 h-6 text-[#9C27B0]" />,
      title: "Accelerate Remediation",
      desc: "AI Copilot generates tailored JSON permission updates and least-privilege policy changes to safely resolve exposures.",
      badge: "Auto Policy",
      stackedClasses: "rotate-[-4deg] translate-x-[-10px] translate-y-[8px] z-10",
      expandedClasses: "rotate-0 translate-y-[155%] md:translate-y-0 md:translate-x-[158%] z-40",
    },
  ];

  return (
    <section id="benefits" className="w-full py-20 md:py-28 bg-white border-b border-slate-200 relative z-10 overflow-hidden">
      <div className="max-w-[1360px] mx-auto px-4 md:px-8 relative z-10">
        
        {/* Section Heading */}
        <div className="text-center mb-14 md:mb-16 select-none">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-[#8E24AA] text-[13px] font-bold tracking-[0.05em] bg-[#F3E5F5] border border-purple-200/60 mb-4 uppercase gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#9C27B0]" />
            BUSINESS METRICS
          </div>
          <h2 className="font-[family-name:var(--font-jakarta)] font-extrabold text-3xl md:text-5xl text-[#2D124D] mb-4 tracking-tight">
            Quantifiable Enterprise Benefits
          </h2>
          <p className="text-[#6A5378] text-base md:text-lg max-w-2xl mx-auto font-medium">
            SentinelAI empowers security teams with clear, measurable improvements in cloud governance.
          </p>
        </div>

        {/* Card Stack Stage Container */}
        <div 
          onMouseEnter={() => setIsExpanded(true)}
          onMouseLeave={() => setIsExpanded(false)}
          onClick={() => setIsExpanded(!isExpanded)}
          className="relative w-full max-w-[1320px] mx-auto h-[980px] md:h-[340px] flex items-center justify-center cursor-pointer select-none"
        >
          {/* Card Stack Track */}
          <div className="relative w-full max-w-[300px] md:max-w-[310px] h-[285px]">
            {benefits.map((b, idx) => {
              const delay = isExpanded ? idx * 65 : (benefits.length - 1 - idx) * 45;
              const transformClasses = isExpanded ? b.expandedClasses : b.stackedClasses;

              return (
                <div
                  key={idx}
                  style={{ transitionDelay: `${delay}ms` }}
                  className={`absolute inset-0 w-full h-full bg-[#FFFDF8] border border-[#F5E8D6] rounded-[24px] p-6 md:p-7 shadow-[0_12px_35px_-10px_rgba(215,185,155,0.3)] transition-all duration-500 ease-[cubic-bezier(0.63,0.15,0.03,1.12)] flex flex-col justify-between hover:border-purple-300/80 ${transformClasses}`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-12 h-12 rounded-[16px] bg-[#F3E5F5] flex items-center justify-center shadow-inner">
                        {b.icon}
                      </div>
                      <span className="text-[11px] font-bold tracking-wider uppercase text-[#8E24AA] bg-[#F3E5F5]/60 px-3 py-1 rounded-full border border-purple-100">
                        {b.badge}
                      </span>
                    </div>
                    <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-[#3A1854] mb-2 leading-snug">
                      {b.title}
                    </h3>
                    <p className="text-[13px] text-[#5C4A68] leading-relaxed font-normal">
                      {b.desc}
                    </p>
                  </div>

                  {!isExpanded && idx === 0 && (
                    <div className="pt-3 border-t border-purple-100/60 flex items-center justify-between text-xs text-[#8E24AA] font-semibold">
                      <span className="flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5" /> Hover or click to slide cards
                      </span>
                      <span className="animate-pulse text-purple-600 font-bold">✨</span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </section>
  );
}





