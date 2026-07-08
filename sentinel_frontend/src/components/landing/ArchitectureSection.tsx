"use client";

import { Cloud, FileCode, Cpu, GitBranch, ShieldCheck, BrainCircuit, LayoutDashboard, ArrowRight } from "lucide-react";

export default function ArchitectureSection() {
  const nodes = [
    { icon: <Cloud className="w-5 h-5 text-indigo-600" />, label: "Cloud Platforms", desc: "AWS, GCP, Azure API integrations" },
    { icon: <FileCode className="w-5 h-5 text-indigo-600" />, label: "CloudTrail logs", desc: "High throughput API access events" },
    { icon: <Cpu className="w-5 h-5 text-indigo-600" />, label: "Processing Engine", desc: "Stream parsing & sanitization" },
    { icon: <GitBranch className="w-5 h-5 text-indigo-600" />, label: "Neo4j Graph DB", desc: "Identity relationships mapping" },
    { icon: <ShieldCheck className="w-5 h-5 text-indigo-600" />, label: "Risk Engine", desc: "Signal heuristics scoring" },
    { icon: <BrainCircuit className="w-5 h-5 text-indigo-600" />, label: "Gemini AI", desc: "Contextual semantic logic" },
    { icon: <LayoutDashboard className="w-5 h-5 text-indigo-600" />, label: "SecOps Dashboard", desc: "Real-time command center alerts" }
  ];

  return (
    <section id="platform" className="w-full py-24 bg-slate-50 border-b border-slate-200 relative z-10">
      <div className="max-w-[1200px] mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-indigo-700 text-[13px] font-semibold tracking-[0.04em] bg-indigo-50 border border-indigo-100 mb-4">
            SYSTEM ARCHITECTURE
          </div>
          <h2 className="font-[family-name:var(--font-jakarta)] font-extrabold text-3xl md:text-5xl text-slate-900 mb-4">
            Security Graph Pipeline
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            A secure cloud infrastructure processing audit streams into graph assets in real time.
          </p>
        </div>

        {/* Horizontal flow line on desktop */}
        <div className="flex flex-col lg:flex-row flex-wrap items-center justify-center gap-6 lg:gap-3 relative">
          {nodes.map((node, i) => (
            <div key={i} className="flex flex-col lg:flex-row items-center gap-4 lg:gap-2 w-full lg:w-auto relative">
              <div className="flex flex-col items-center p-4 rounded-2xl bg-white border border-slate-200 shadow-sm w-full lg:w-[150px] text-center hover:border-indigo-400 transition-all">
                <div className="w-10 h-10 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center mb-3">
                  {node.icon}
                </div>
                <h3 className="font-[family-name:var(--font-jakarta)] text-xs font-bold text-slate-900 mb-1">
                  {node.label}
                </h3>
                <p className="text-[10px] text-slate-400 leading-tight">
                  {node.desc}
                </p>
              </div>

              {i < nodes.length - 1 && (
                <div className="flex items-center justify-center text-slate-300 lg:rotate-0 rotate-90 my-2 lg:my-0">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
