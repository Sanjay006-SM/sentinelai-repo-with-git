"use client";

import { useState } from "react";
import { Search, ShieldAlert, Clock, ArrowRight, CheckCircle2 } from "lucide-react";
import { useRecentFindings } from "@/lib/queries";
import Link from "next/link";

export default function RiskFindingsPage() {
  const { data: recentFindings, isLoading } = useRecentFindings();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSeverityTab, setActiveSeverityTab] = useState<"all" | "CRITICAL" | "HIGH" | "MEDIUM" | "LOW">("all");

  const activeFindings = recentFindings
    ? recentFindings.map(f => ({
        id: f.id.slice(0, 8).toUpperCase(),
        fullId: f.id,
        severity: f.severity.toUpperCase() as "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
        title: f.finding_type,
        identity: f.identity_arn.split("/").pop() || f.identity_arn,
        detail: f.description,
        status: "OPEN",
        timestamp: "Just now",
        impact: f.description,
        resources: f.identity_arn,
        action: "Investigate access path via SentinelAI Copilot"
      }))
    : [];

  const filteredFindings = activeFindings.filter(f => {
    const matchesSearch = f.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          f.identity.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeSeverityTab === "all" || f.severity === activeSeverityTab;
    return matchesSearch && matchesTab;
  });

  const getSeverityStyle = (severity: string) => {
    switch (severity.toUpperCase()) {
      case "CRITICAL": return "text-rose-700 bg-rose-50 border-rose-100";
      case "HIGH": return "text-amber-700 bg-amber-50 border-amber-100";
      case "MEDIUM": return "text-yellow-700 bg-yellow-50 border-yellow-100";
      default: return "text-emerald-700 bg-emerald-50 border-emerald-100";
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <ShieldAlert className="w-6 h-6 text-indigo-600" />
            Risk Center
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Active findings and security exposures prioritized by risk impact.</p>
        </div>

        {/* Severity Grouping Tabs */}
        <div className="flex bg-slate-100 p-1 rounded-xl w-fit border border-slate-200">
          {(["all", "CRITICAL", "HIGH", "MEDIUM", "LOW"] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveSeverityTab(tab)}
              className={`px-4 py-2 text-xs font-semibold rounded-lg uppercase transition-all ${
                activeSeverityTab === tab 
                  ? "bg-white text-slate-900 shadow-sm font-bold" 
                  : "text-slate-500 hover:text-slate-800"
              }`}
            >
              {tab} ({tab === "all" ? activeFindings.length : activeFindings.filter(f => f.severity === tab).length})
            </button>
          ))}
        </div>
      </div>

      {/* Filter and Search */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-4 flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search findings by type, identity, or resource..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 input-field h-9 text-xs"
          />
        </div>
      </div>

      {/* Findings List */}
      <div className="flex flex-col gap-4">
        {isLoading ? (
          <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-400 text-xs">
            Loading findings...
          </div>
        ) : filteredFindings.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center gap-3">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
            <h3 className="font-bold text-slate-800">No Risk Findings Detected</h3>
            <p className="text-slate-400 text-xs max-w-sm">
              No machine identity vulnerabilities or anomalous access trails have been discovered. System posture is fully secure.
            </p>
          </div>
        ) : (
          filteredFindings.map(finding => (
            <div 
              key={finding.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col lg:flex-row lg:items-center justify-between gap-6"
            >
              <div className="flex flex-col gap-3 max-w-3xl">
                <div className="flex flex-wrap items-center gap-3">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${getSeverityStyle(finding.severity)}`}>
                    {finding.severity}
                  </span>
                  <span className="text-[10px] font-mono text-slate-400 font-bold uppercase tracking-wider">{finding.id}</span>
                  <div className="flex items-center gap-1.5 text-slate-400 text-xs">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{finding.timestamp}</span>
                  </div>
                </div>

                <div>
                  <h3 className="font-bold text-slate-900 text-base">{finding.title}</h3>
                  <p className="text-slate-500 text-xs mt-1.5 font-semibold">
                    Identity: <span className="text-indigo-600 font-mono">{finding.identity}</span>
                  </p>
                  <p className="text-slate-400 text-xs mt-1 leading-relaxed">{finding.detail}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Target Resource</span>
                    <span className="text-xs font-semibold text-slate-700 font-mono mt-0.5 block truncate" title={finding.resources}>{finding.resources}</span>
                  </div>
                  <div>
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Remediation Action</span>
                    <span className="text-xs font-semibold text-emerald-600 mt-0.5 block">{finding.action}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Link 
                  href={`/risk-findings/${finding.fullId}`}
                  className="h-9 px-4 bg-slate-900 hover:bg-slate-800 text-white rounded-lg flex items-center gap-2 text-xs transition-all font-semibold shadow-sm"
                >
                  View Details
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
                <Link 
                  href={`/ai-investigation?identityId=${finding.resources}`}
                  className="h-9 px-4 border border-slate-200 hover:border-indigo-400 text-slate-700 hover:text-indigo-600 rounded-lg flex items-center gap-2 text-xs bg-white transition-all font-semibold shadow-sm"
                >
                  AI Investigate
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
