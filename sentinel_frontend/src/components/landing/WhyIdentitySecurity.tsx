"use client";

import { Shield, HelpCircle, Network, Users } from "lucide-react";

export default function WhyIdentitySecurity() {
  const points = [
    {
      icon: <Users className="w-5 h-5 text-indigo-600" />,
      title: "Machine Identities outnumber humans 10:1",
      desc: "Every cloud microservice, Lambda execution role, API key, database connector, and container instance requires access policies. They represent the largest security footprint."
    },
    {
      icon: <Shield className="w-5 h-5 text-indigo-600" />,
      title: "They are prime targets for abuse",
      desc: "Attackers look for stale keys or misconfigured permissions to move laterally. Unlike humans, machine accounts don't trigger multi-factor authentication (MFA)."
    },
    {
      icon: <HelpCircle className="w-5 h-5 text-indigo-600" />,
      title: "Traditional tooling is blind to context",
      desc: "Traditional IAM analyzers check if a single policy is over-privileged, but they cannot see if a role can assume another role that eventually accesses a critical database."
    },
    {
      icon: <Network className="w-5 h-5 text-indigo-600" />,
      title: "Why Graph Analysis is the only solution",
      desc: "Security is a graph, not a list. By mapping identities and resources in Neo4j, SentinelAI discovers indirect access paths that linear IAM scanning misses entirely."
    }
  ];

  return (
    <section id="security" className="w-full py-24 bg-white border-b border-slate-200 relative z-10">
      <div className="max-w-[1100px] mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-indigo-700 text-[13px] font-semibold tracking-[0.04em] bg-indigo-50 border border-indigo-100 mb-4">
            UNDERSTANDING THE RISK
          </div>
          <h2 className="font-[family-name:var(--font-jakarta)] font-extrabold text-3xl md:text-5xl text-slate-900 mb-4">
            Why Machine Identity Security?
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Traditional tools focus on human access keys. But today, the real risk lies in machine integration tokens and service execution roles.
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {points.map((p, idx) => (
            <div key={idx} className="bg-slate-50 border border-slate-200 rounded-[20px] p-6 shadow-sm flex flex-col gap-4">
              <div className="w-10 h-10 rounded-lg bg-indigo-100 flex items-center justify-center">
                {p.icon}
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-base font-bold text-slate-900">
                {p.title}
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {p.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
