"use client";

import { useRecentFindings } from "@/lib/queries";
import { formatDistanceToNow } from "date-fns";
import { motion, AnimatePresence } from "framer-motion";

export default function RecentFindingsWidget() {
  const { data: findings, isLoading } = useRecentFindings();

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case 'Critical': return "border-critical bg-critical/5";
      case 'High': return "border-high bg-high/5";
      case 'Medium': return "border-warning bg-warning/5";
      default: return "border-success bg-success/5";
    }
  };

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'Critical': return "text-critical border-critical/20 bg-critical/10";
      case 'High': return "text-high border-high/20 bg-high/10";
      case 'Medium': return "text-warning border-warning/20 bg-warning/10";
      default: return "text-success border-success/20 bg-success/10";
    }
  };

  return (
    <div className="card rounded-xl overflow-hidden flex flex-col h-full bg-card border-border">
      <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-text-primary flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-critical animate-pulse shadow-[0_0_8px_var(--color-critical)]"></span>
            Live Risk Findings
          </h2>
          <p className="text-[11px] text-text-muted mt-0.5">Real-time policy violations and anomalies</p>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1.5">
        <AnimatePresence mode="popLayout">
          {isLoading ? (
            <motion.div key="loading" exit={{ opacity: 0 }} className="flex items-center justify-center h-32">
              <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            </motion.div>
          ) : !findings || findings.length === 0 ? (
            <motion.div key="empty" exit={{ opacity: 0 }} className="text-center text-text-muted text-xs py-8">
              No active findings.
            </motion.div>
          ) : (
            findings.map((f, index) => (
              <motion.div 
                key={f.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.03 }}
                className={`group relative px-3 py-2.5 rounded-r-lg border-l-[3px] ${getSeverityStyle(f.severity)} hover:bg-elevated transition-all duration-200 border border-transparent border-r-border border-y-border hover:border-border-subtle cursor-pointer hover:translate-x-1`}
              >
                <div className="flex justify-between items-start mb-1 gap-2">
                  <h3 className="font-semibold text-text-primary text-[13px] leading-snug group-hover:text-primary transition-colors line-clamp-1">
                    {f.description}
                  </h3>
                  <span className="text-[10px] text-text-muted whitespace-nowrap font-mono mt-0.5 flex-shrink-0">
                    {f.created_at ? formatDistanceToNow(new Date(f.created_at), { addSuffix: true }).replace('about ', '') : 'Just now'}
                  </span>
                </div>
                
                <div className="flex items-center justify-between mt-1">
                  <div className="flex items-center gap-1.5">
                    <span className={`px-1.5 py-[1px] rounded text-[9px] font-bold uppercase tracking-widest border ${getSeverityBadge(f.severity)}`}>
                      {f.severity}
                    </span>
                    <span className="text-[10px] text-text-secondary font-mono bg-elevated px-1.5 py-[1px] rounded border border-border-subtle truncate max-w-[150px] md:max-w-[220px]" title={f.identity_arn}>
                      {f.identity_arn.split('/').pop() || f.identity_arn}
                    </span>
                  </div>
                  <span className="px-1.5 py-[1px] rounded text-[9px] font-bold bg-success/10 text-success uppercase tracking-widest border border-success/20">
                    Open
                  </span>
                </div>
              </motion.div>
            ))
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
