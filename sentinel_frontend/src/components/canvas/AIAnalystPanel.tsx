"use client";

import { useAiInvestigate } from "@/lib/queries";
import { Bot, ShieldAlert, CheckCircle } from "lucide-react";
import { useState } from "react";

export default function AIAnalystPanel({ identityId }: { identityId: string }) {
  const { mutateAsync: investigate, isPending } = useAiInvestigate();
  const [report, setReport] = useState<any>(null);

  const handleInvestigate = async () => {
    try {
      const res = await investigate({ identity_id: identityId });
      setReport(res);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="h-full flex flex-col glass-panel rounded-xl overflow-hidden border border-[#8b5cf6]/30">
      <div className="p-4 border-b border-[#ffffff]/5 bg-[#8b5cf6]/10 flex items-center gap-3">
        <Bot className="text-[#8b5cf6]" />
        <h2 className="font-semibold text-text-primary">AI Security Analyst</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {!report ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-4">
            <Bot className="w-16 h-16 opacity-20" />
            <p className="text-center text-sm px-4">
              I can analyze this attack path to determine blast radius, potential privilege escalation, and active lateral movement.
            </p>
            <button 
              onClick={handleInvestigate}
              disabled={isPending}
              className="bg-purple-600 hover:bg-purple-700 text-text-primary px-6 py-2 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isPending ? "Analyzing..." : "Investigate Blast Radius"}
            </button>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div>
              <h3 className="text-xs uppercase text-text-muted font-bold mb-2 tracking-wider">Executive Summary</h3>
              <p className="text-sm text-text-secondary leading-relaxed bg-glass-subtle p-3 rounded-lg border border-[#ffffff]/5">
                {report.executive_summary}
              </p>
            </div>
            
            <div>
              <h3 className="text-xs uppercase text-[#ef4444] font-bold mb-2 tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" /> Findings
              </h3>
              <ul className="space-y-2">
                {report.findings.map((f: string, i: number) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2 bg-[#ef4444]/5 p-2 rounded border border-[#ef4444]/10">
                    <span className="text-[#ef4444] mt-0.5">•</span> {f}
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-xs uppercase text-[#10b981] font-bold mb-2 tracking-wider flex items-center gap-2">
                <CheckCircle className="w-4 h-4" /> Recommendations
              </h3>
              <ul className="space-y-2">
                {report.recommendations.map((r: string, i: number) => (
                  <li key={i} className="text-sm text-text-secondary flex items-start gap-2 bg-[#10b981]/5 p-2 rounded border border-[#10b981]/10">
                    <span className="text-[#10b981] mt-0.5">•</span> {r}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
