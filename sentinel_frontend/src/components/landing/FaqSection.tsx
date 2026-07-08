"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

export default function FaqSection() {
  const faqs = [
    {
      q: "What are machine identities?",
      a: "Machine identities are non-human security credentials used by machines to access cloud resources. Examples include AWS IAM execution roles, GCP service accounts, API keys, OAuth tokens, and database connector credentials."
    },
    {
      q: "Why CloudTrail?",
      a: "AWS CloudTrail records API calls made by or on behalf of your account. By auditing these logs, SentinelAI builds relationship connections, detects anomalies, and discovers hidden attack paths that static IAM configurations miss."
    },
    {
      q: "How does the AI Security Analyst work?",
      a: "SentinelAI combines Neo4j graph queries with Gemini's semantic model. When you query an identity, we feed the contextual relationship graph into Gemini to produce logical incident explanations, threat ratings, and remediation tips."
    },
    {
      q: "Do you store my cloud data?",
      a: "No. SentinelAI parses CloudTrail events to build metadata graphs of identity relationships. We do not store raw database payloads or transaction logs. All analytics data is securely isolated inside your tenant organization."
    },
    {
      q: "Can I connect live AWS accounts?",
      a: "Yes. In production workspaces, you can connect AWS accounts continuously via read-only cross-account IAM roles or AWS S3 log streams. For sandboxed testing, you can use our Demo Upload mode to analyze static JSON logs instantly."
    }
  ];

  const [openIdx, setOpenIdx] = useState<number | null>(null);

  const toggle = (idx: number) => {
    setOpenIdx(openIdx === idx ? null : idx);
  };

  return (
    <section id="faq" className="w-full py-24 bg-white border-b border-slate-200 relative z-10">
      <div className="max-w-[800px] mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-indigo-700 text-[13px] font-semibold tracking-[0.04em] bg-indigo-50 border border-indigo-100 mb-4">
            QUESTIONS & ANSWERS
          </div>
          <h2 className="font-[family-name:var(--font-jakarta)] font-extrabold text-3xl md:text-4xl text-slate-900 mb-4">
            Frequently Asked Questions
          </h2>
        </div>

        {/* Faq List */}
        <div className="flex flex-col gap-4">
          {faqs.map((faq, idx) => (
            <div 
              key={idx} 
              className="border border-slate-200 rounded-xl bg-slate-50 overflow-hidden transition-all"
            >
              <button
                onClick={() => toggle(idx)}
                className="w-full p-5 flex items-center justify-between text-left font-bold text-slate-900 text-sm md:text-base focus:outline-none"
              >
                <span>{faq.q}</span>
                {openIdx === idx ? (
                  <ChevronUp className="w-4 h-4 text-slate-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                )}
              </button>
              {openIdx === idx && (
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-200/50 pt-3">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
