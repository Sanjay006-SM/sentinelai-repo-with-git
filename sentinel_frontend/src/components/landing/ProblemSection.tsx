"use client";

import { ShieldAlert, EyeOff, FileSpreadsheet, Sparkles } from "lucide-react";

export default function ProblemSection() {
  const problems = [
    {
      icon: <ShieldAlert className="w-6 h-6 text-indigo-600" />,
      title: "Machine Identity Sprawl",
      desc: "Organizations have thousands of compute instances, serverless tasks, and service keys. Over-privileged machine roles outnumber human users 10-to-1."
    },
    {
      icon: <FileSpreadsheet className="w-6 h-6 text-indigo-600" />,
      title: "Alert Fatigue",
      desc: "CloudTrail logs generate millions of API events daily. Sifting through noise manually to isolate suspicious IAM actions is a mathematical impossibility."
    },
    {
      icon: <EyeOff className="w-6 h-6 text-indigo-600" />,
      title: "Invisible Attack Paths",
      desc: "Attackers don't exploit a single critical CVE; they chain minor IAM assume-role policies to quietly access keys and data stores. These paths remain hidden."
    }
  ];

  return (
    <section id="company" className="w-full py-24 bg-white border-y border-slate-200 z-10 relative">
      <div className="max-w-[1100px] mx-auto px-6">
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-indigo-700 text-[13px] font-semibold tracking-[0.04em] bg-indigo-50 border border-indigo-100 mb-4">
            THE IDENTITY CRISIS
          </div>
          <h2 className="font-[family-name:var(--font-jakarta)] font-extrabold text-3xl md:text-5xl text-slate-900 mb-4">
            Why Traditional Monitoring Fails Cloud Identities
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Traditional security tools flag individual compliance checks. SentinelAI discovers how they chain together to create real threats.
          </p>
        </div>

        {/* Problem grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {problems.map((prob, i) => (
            <div key={i} className="bg-slate-50 border border-slate-200 rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-sm">
                {prob.icon}
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-lg font-bold text-slate-900">
                {prob.title}
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {prob.desc}
              </p>
            </div>
          ))}
        </div>

        {/* Resolution Banner */}
        <div className="mt-12 bg-indigo-50/50 border border-indigo-100 rounded-[24px] p-8 flex flex-col md:flex-row items-center gap-6">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-100 shrink-0">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h4 className="text-lg font-bold text-slate-900 mb-1">
              SentinelAI Resolution Engine
            </h4>
            <p className="text-slate-600 text-sm leading-relaxed">
              We ingest logs, map relationships using a Neo4j graph db, run them through our Risk Engine, and use generative AI to deliver single-click incident investigations. No sprawl, no manual triage.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
