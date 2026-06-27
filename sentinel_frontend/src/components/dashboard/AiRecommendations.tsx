"use client";

import { useEffect, useState } from "react";
import { useIdentities, useAiInvestigate } from "@/lib/queries";
import { AlertCircle, BrainCircuit, CheckCircle2 } from "lucide-react";
import { AIInvestigationResponse } from "@/types/canvas";
import { motion, AnimatePresence } from "framer-motion";

export default function AiRecommendations() {
  const { data: identities, isLoading: isIdentitiesLoading } = useIdentities();
  const { mutateAsync: investigate, isPending } = useAiInvestigate();
  
  const [report, setReport] = useState<AIInvestigationResponse | null>(null);
  const [hasTriggered, setHasTriggered] = useState(false);

  useEffect(() => {
    const runAnalysis = async () => {
      if (!isIdentitiesLoading && identities && identities.length > 0 && !hasTriggered) {
        setHasTriggered(true);
        try {
          const topIdentity = identities[0];
          const result = await investigate({ identity_id: topIdentity.id || topIdentity.arn });
          result.identity_id = result.identity_id || topIdentity.arn;
          setReport(result);
        } catch (error) {
          console.error("AI Investigation failed", error);
        }
      }
    };
    runAnalysis();
  }, [identities, isIdentitiesLoading, hasTriggered, investigate]);

  const isLoading = isIdentitiesLoading || isPending;

  return (
    <section className="mt-4">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BrainCircuit className="w-5 h-5 text-primary" />
          <h2 className="text-lg font-semibold text-text-primary">AI Recommendations</h2>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <motion.div 
            key="loading"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-transparent border border-glass-subtle rounded-xl flex flex-col p-5 shadow-lg relative overflow-hidden h-[220px]">
                {/* Shimmer Effect */}
                <div className="absolute inset-0 -translate-x-full animate-[shimmer_1.5s_infinite] bg-gradient-to-r from-transparent via-white/5 to-transparent z-10" />
                <div className="w-3/4 h-5 bg-glass-subtle rounded mb-2"></div>
                <div className="w-1/2 h-3 bg-glass-subtle rounded mb-4"></div>
                <div className="w-full h-12 bg-glass-subtle rounded mb-4 mt-2"></div>
                <div className="flex gap-2 mb-5">
                  <div className="w-20 h-5 bg-glass-subtle rounded"></div>
                  <div className="w-24 h-5 bg-glass-subtle rounded"></div>
                </div>
                <div className="mt-auto w-full h-9 bg-glass-subtle rounded"></div>
              </div>
            ))}
          </motion.div>
        ) : !report ? (
          <motion.div 
            key="empty"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="bg-transparent border border-glass-subtle rounded-xl p-8 flex flex-col items-center justify-center text-center shadow-lg"
          >
            <AlertCircle className="w-10 h-10 text-text-muted mb-4" />
            <h3 className="text-text-primary font-bold mb-2">No AI Analysis Available</h3>
            <p className="text-text-muted text-sm">Upload more data to trigger automated security insights.</p>
          </motion.div>
        ) : (
          <motion.div 
            key="content"
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-6"
          >
            {report.recommendations.slice(0, 3).map((rec, idx) => (
              <div key={idx} className={`bg-transparent border border-glass-subtle border-l-4 rounded-xl flex flex-col p-5 shadow-lg relative overflow-hidden group hover:border-glass-active transition-colors ${
                idx === 0 ? "border-l-[#ef4444]" : "border-l-[#f97316]"
              }`}>
                <div className="flex flex-col gap-1 mb-3">
                  <h4 className="font-bold text-text-primary leading-snug">{rec.split('.')[0] || "Remediation Action"}</h4>
                  <span className="font-mono text-[#06b6d4] text-xs truncate" title={report.identity_id}>{report.identity_id.split('/').pop() || report.identity_id}</span>
                </div>
                <p className="text-sm text-text-muted mb-4 line-clamp-3">
                  {rec}
                </p>
                <div className="flex flex-wrap items-center gap-2 mb-5">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-green-500/20 text-[#22c55e] border-[#22c55e]/20 tracking-wider uppercase flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Auto-Remediable
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold border bg-[#1e1b4b] text-[#818cf8] border-[#818cf8]/20 tracking-wider uppercase">
                    AI confidence &gt;90%
                  </span>
                </div>
                <div className="mt-auto">
                  <button className="btn bg-transparent border border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10 w-full h-9 text-sm font-semibold transition-colors">
                    Apply Remediation
                  </button>
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
