"use client";

import { useTopAttackPaths } from "@/lib/queries";
import { ShieldCheck, GitBranch, AlertCircle } from "lucide-react";

export default function TopAttackPaths() {
  const { data: paths, isLoading, isError } = useTopAttackPaths();

  return (
    <section className="mt-4">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold" style={{ color: '#ffffff' }}>Top Attack Paths</h2>
        {!isLoading && !isError && paths && paths.length > 0 && (
          <div className="border border-[#ef4444]/30 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5" style={{ background: '#fee2e2', color: '#dc2626' }}>
            <ShieldCheck className="w-3.5 h-3.5" /> {paths.length} critical paths detected
          </div>
        )}
      </div>
      <div className="glass-panel flex flex-col p-1 min-h-[150px] rounded-[20px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-12 gap-3" style={{ color: '#94a3b8' }}>
            <div className="w-8 h-8 rounded-full border-2 border-t-transparent animate-spin" style={{ borderColor: '#6366f1', borderTopColor: 'transparent' }}></div>
            <p className="text-sm">Analyzing graph paths...</p>
          </div>
        ) : isError ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2" style={{ color: '#dc2626' }}>
            <AlertCircle className="w-8 h-8" />
            <p className="text-sm">Failed to load attack paths</p>
          </div>
        ) : !paths || paths.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 gap-2">
            <ShieldCheck className="w-10 h-10" style={{ color: '#16a34a' }} />
            <p className="text-sm" style={{ color: '#9ca3af' }}>No exploitable paths detected</p>
          </div>
        ) : (
          <div className="flex flex-col">
            {paths.map((path, idx) => (
              <div key={idx} className="flex items-center justify-between p-4 rounded-lg transition-colors group border-b border-glass-subtle border last:border-0">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                    path.severity === "Critical" 
                      ? "bg-[#ef4444]/10 border-[#ef4444]/20 text-[#ef4444]" 
                      : "bg-[#f97316]/10 border-[#f97316]/20 text-[#f97316]"
                  }`}>
                    <GitBranch className="w-4 h-4" />
                  </div>
                  <div className="flex items-center gap-3 text-sm font-mono flex-wrap">
                    {path.nodes.map((node: any, nIdx: number) => {
                      const isFirst = nIdx === 0;
                      const isLast = nIdx === path.nodes.length - 1;
                      const edge = path.edges[nIdx];
                      
                      return (
                        <div key={nIdx} className="flex items-center gap-3">
                          <span className={`px-2 py-1 rounded max-w-[200px] truncate ${
                            isFirst ? "text-[#06b6d4] bg-[#06b6d4]/10" :
                            isLast && path.severity === "Critical" ? "text-[#eab308] bg-[#eab308]/10" :
                            isLast ? "text-[#6366f1] bg-[#6366f1]/10" :
                            "text-text-muted bg-[#f1f5f9]"
                          }`} title={node.name}>
                            {node.name.split('/').pop() || node.name}
                          </span>
                          
                          {edge && (
                            <>
                              <span style={{ color: '#94a3b8' }}>→</span>
                              <span className={`border-b border-dashed ${
                                path.severity === "Critical" ? "text-[#ef4444] border-[#ef4444]/50" : "text-[#f97316] border-[#f97316]/50"
                              }`}>
                                {edge}
                              </span>
                              <span style={{ color: '#94a3b8' }}>→</span>
                            </>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className={`text-xs font-bold px-2 py-1 border rounded uppercase tracking-wider ${
                  path.severity === "Critical" 
                    ? "text-[#ef4444] border-[#ef4444]/20" 
                    : "text-[#f97316] border-[#f97316]/20"
                }`} style={{ background: path.severity === "Critical" ? '#fee2e2' : '#fff7ed' }}>
                  {path.severity}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="p-2 mt-auto border-t border-glass-subtle border">
          <a href="/attack-graph" className="btn bg-transparent w-full justify-center gap-2 h-10 border border-transparent transition-all flex items-center" style={{ color: '#9ca3af' }}>
            View Full Interactive Graph <span className="ml-2" style={{ color: '#D3F531' }}>→</span>
          </a>
        </div>
      </div>
    </section>
  );
}
