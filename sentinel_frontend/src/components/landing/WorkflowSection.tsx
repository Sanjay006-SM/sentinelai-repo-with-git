"use client";

import { FileJson, Cloud, UploadCloud, ChevronRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

export default function WorkflowSection() {
  return (
    <section id="solutions" className="w-full py-24 bg-slate-50 border-b border-slate-200 relative z-10">
      <div className="max-w-[1100px] mx-auto px-6">
        
        {/* Section Heading */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center px-4 py-1.5 rounded-full text-indigo-700 text-[13px] font-semibold tracking-[0.04em] bg-indigo-50 border border-indigo-100 mb-4">
            OPERATION MODELS
          </div>
          <h2 className="font-[family-name:var(--font-jakarta)] font-extrabold text-3xl md:text-5xl text-slate-900 mb-4">
            Interactive Demo vs. Production Setup
          </h2>
          <p className="text-slate-600 text-lg max-w-2xl mx-auto">
            Test the platform instantly using demo uploads, or connect continuous production cloud integration streams.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Demo Experience */}
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm flex flex-col justify-between hover:border-indigo-400 transition-all">
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
                  <FileJson className="w-6 h-6 text-indigo-600" />
                </div>
                <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                  Demo Experience
                </span>
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-slate-900 mt-2">
                Analyze Risk Maps Instantly
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Ingest static CloudTrail logs manually in a sandboxed sandbox workspace. Test attack path calculations, identity indexes, and SentinelAI Copilot queries immediately.
              </p>
              
              <ul className="flex flex-col gap-3 text-xs text-slate-500 font-semibold mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Upload sample JSON log files
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Map identity relationships inside Neo4j
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600" /> Test AI-driven query reasoning
                </li>
              </ul>
            </div>
            
            <Link 
              href="/login?redirect=onboarding"
              className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-center rounded-xl shadow-md shadow-indigo-100 flex items-center justify-center gap-2 transition-all"
            >
              Start Demo Ingestion
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Production Workflow */}
          <div className="bg-white border border-slate-200 rounded-[24px] p-8 shadow-sm flex flex-col justify-between relative opacity-85 hover:border-slate-300 transition-all">
            <div className="absolute top-4 right-4">
              <span className="bg-slate-100 text-slate-500 px-3 py-1 rounded text-[10px] font-bold uppercase tracking-wider border border-slate-200">
                Coming Soon
              </span>
            </div>

            <div className="flex flex-col gap-4">
              <div className="w-12 h-12 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                <Cloud className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-slate-900 mt-2">
                Continuous Integration Streams
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed mb-6">
                Establish read-only cross-account IAM roles or AWS EventBridge integrations to stream CloudTrail events automatically, maintaining a real-time risk posture index.
              </p>
              
              <ul className="flex flex-col gap-3 text-xs text-slate-400 font-semibold mb-6">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" /> Continuous discovery of new resources
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" /> Automated incident triage notifications
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-slate-300" /> Multi-tenant workspaces configuration
                </li>
              </ul>
            </div>

            <button
              disabled
              className="w-full py-3.5 bg-slate-100 text-slate-400 font-semibold text-center rounded-xl cursor-not-allowed border border-slate-200"
            >
              Connect Cloud Providers
            </button>
          </div>
        </div>

      </div>
    </section>
  );
}
