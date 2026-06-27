"use client";

import { useState } from "react";
import { Search, ChevronDown, ShieldAlert, AlertCircle, AlertTriangle, Info, Clock, CheckCircle, Activity, ShieldCheck } from "lucide-react";

// --- Mock Data ---
const FINDINGS = [
  { id: "F-01", severity: "CRITICAL", title: "Long-lived AWS access key", identity: "i-prod-payments-svc", detail: "312 days old, last rotated never", status: "OPEN", timestamp: "2m ago" },
  { id: "F-02", severity: "HIGH", title: "Cluster-admin SA in billing namespace", identity: "k8s-prod-cluster-admin", detail: "namespace billing", status: "INVESTIGATING", timestamp: "15m ago" },
  { id: "F-03", severity: "HIGH", title: "GitHub OIDC wildcard trust policy", identity: "terraform-ci-runner", detail: "trust = *", status: "OPEN", timestamp: "1h ago" },
  { id: "F-04", severity: "MEDIUM", title: "Anomalous STS AssumeRole spike", identity: "azure-fn-stripe-webhook", detail: "+412% above baseline", status: "OPEN", timestamp: "3h ago" },
  { id: "F-05", severity: "LOW", title: "Auto-remediated: 14 stale service accounts rotated", identity: "policy: stale-identity-90d", detail: "Automated rotation completed successfully", status: "AUTO-REMEDIATED", timestamp: "5h ago" },
  { id: "F-06", severity: "MEDIUM", title: "Root account console login attempt", identity: "root@acme.io", detail: "MFA bypass attempt blocked", status: "INVESTIGATING", timestamp: "12h ago" },
];

export default function RiskFindingsPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const getSeverityStyle = (severity: string) => {
    switch (severity) {
      case "CRITICAL": return { bar: "bg-[#ef4444]", badge: "text-[#ef4444] border-[#ef4444]/20 bg-[#ef4444]/10", icon: <ShieldAlert className="w-3.5 h-3.5" /> };
      case "HIGH": return { bar: "bg-[#f97316]", badge: "text-[#f97316] border-[#f97316]/20 bg-[#f97316]/10", icon: <AlertCircle className="w-3.5 h-3.5" /> };
      case "MEDIUM": return { bar: "bg-[#fbbf24]", badge: "text-[#fbbf24] border-[#fbbf24]/20 bg-[#fbbf24]/10", icon: <AlertTriangle className="w-3.5 h-3.5" /> };
      case "LOW": return { bar: "bg-[#22c55e]", badge: "text-[#22c55e] border-[#22c55e]/20 bg-[#22c55e]/10", icon: <Info className="w-3.5 h-3.5" /> };
      default: return { bar: "bg-[#64748b]", badge: "text-text-muted border-[#64748b]/20 bg-[#64748b]/10", icon: <Info className="w-3.5 h-3.5" /> };
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "OPEN": return "text-[#ef4444] border-[#ef4444]/30 bg-[#450a0a]/50";
      case "INVESTIGATING": return "text-[#fbbf24] border-[#fbbf24]/30 bg-[#78350f]/50";
      case "RESOLVED": return "text-[#22c55e] border-[#22c55e]/30 bg-green-100/50";
      case "AUTO-REMEDIATED": return "text-[#818cf8] border-[#818cf8]/30 bg-[#1e1b4b]/50";
      default: return "text-text-muted border-[#64748b]/30 bg-transparent";
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-primary" />
            Risk Findings
          </h1>
          <p className="text-text-muted mt-1 text-sm">Active findings from the Risk Engine</p>
        </div>
        
        {/* Summary Chips */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-transparent border border-glass-subtle rounded-md px-4 py-2 flex items-center gap-3 shadow-sm">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total Findings</span>
            <span className="text-lg font-bold text-text-primary">34</span>
          </div>
          <div className="bg-transparent border border-glass-subtle rounded-md px-4 py-2 flex items-center gap-3 shadow-sm">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Critical</span>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#ef4444] shadow-[0_0_8px_rgba(239,68,68,0.6)]"></div><span className="text-lg font-bold text-text-primary">4</span></div>
          </div>
          <div className="bg-transparent border border-glass-subtle rounded-md px-4 py-2 flex items-center gap-3 shadow-sm">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">High</span>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#f97316]"></div><span className="text-lg font-bold text-text-primary">12</span></div>
          </div>
          <div className="bg-transparent border border-glass-subtle rounded-md px-4 py-2 flex items-center gap-3 shadow-sm">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Medium</span>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#fbbf24]"></div><span className="text-lg font-bold text-text-primary">11</span></div>
          </div>
          <div className="bg-transparent border border-glass-subtle rounded-md px-4 py-2 flex items-center gap-3 shadow-sm">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Low</span>
            <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-[#22c55e]"></div><span className="text-lg font-bold text-text-primary">7</span></div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 border border-glass-subtle rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4 bg-glass-subtle shadow-md">
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-glass-subtle hover:border-glass-active rounded-md text-sm text-text-primary transition-colors">
            All Severities <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-glass-subtle hover:border-glass-active rounded-md text-sm text-text-primary transition-colors">
            All Clouds <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-glass-subtle hover:border-glass-active rounded-md text-sm text-text-primary transition-colors">
            All Statuses <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search findings, identities..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-1.5 bg-glass-subtle border border-glass-subtle hover:border-glass-active focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none rounded-md text-sm text-text-primary font-mono placeholder:font-mono placeholder:text-text-muted transition-all"
          />
        </div>
      </div>

      {/* Findings List (Cards) */}
      <div className="flex flex-col gap-3">
        {FINDINGS.map((finding) => {
          const sevStyle = getSeverityStyle(finding.severity);
          
          return (
            <div 
              key={finding.id} 
              className="relative bg-transparent border border-glass-subtle hover:border-glass-active rounded-xl flex flex-col md:flex-row overflow-hidden shadow-md hover:bg-white/10 transition-colors group"
            >
              {/* Left colored bar */}
              <div className={`absolute left-0 top-0 bottom-0 w-1 ${sevStyle.bar}`} />
              
              <div className="flex-1 p-5 pl-6 flex flex-col justify-center">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  
                  {/* Main Content */}
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-lg text-text-primary leading-tight">{finding.title}</h3>
                      <div className={`hidden md:flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold border ${sevStyle.badge}`}>
                        {sevStyle.icon}
                        {finding.severity}
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 mt-1">
                      <span className="text-sm font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-1.5 py-0.5 rounded">
                        {finding.identity}
                      </span>
                      <span className="text-text-muted mx-1">•</span>
                      <span className="text-sm text-text-muted">{finding.detail}</span>
                    </div>
                  </div>

                  {/* Right Side Info */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-start gap-3 md:gap-2 shrink-0">
                    <div className="flex items-center gap-2 text-xs text-text-muted font-mono">
                      <Clock className="w-3.5 h-3.5" />
                      {finding.timestamp}
                    </div>
                    <div className={`flex items-center px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getStatusStyle(finding.status)}`}>
                      {finding.status}
                    </div>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="mt-4 pt-4 border-t border-slate-200/50 flex items-center justify-between opacity-80 group-hover:opacity-100 transition-opacity">
                  <div className="text-xs font-mono text-text-muted uppercase tracking-wider">
                    ID: {finding.id}
                  </div>
                  <div className="flex items-center gap-2">
                    {finding.status !== 'AUTO-REMEDIATED' && finding.status !== 'RESOLVED' && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#818cf8] hover:bg-[#818cf8]/10 hover:text-[#a5b4fc] transition-colors border border-transparent hover:border-[#818cf8]/20">
                        <Activity className="w-3.5 h-3.5" /> Investigate
                      </button>
                    )}
                    {finding.status !== 'RESOLVED' && finding.status !== 'AUTO-REMEDIATED' && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-[#22c55e] hover:bg-[#22c55e]/10 hover:text-[#4ade80] transition-colors border border-transparent hover:border-[#22c55e]/20">
                        <CheckCircle className="w-3.5 h-3.5" /> Resolve
                      </button>
                    )}
                    {(finding.status === 'AUTO-REMEDIATED' || finding.status === 'RESOLVED') && (
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold text-text-muted hover:bg-glass-active transition-colors border border-transparent">
                        <ShieldCheck className="w-3.5 h-3.5" /> View Report
                      </button>
                    )}
                  </div>
                </div>

              </div>
            </div>
          );
        })}
      </div>
      
    </div>
  );
}
