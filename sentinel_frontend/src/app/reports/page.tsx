"use client";

import { FileText, Plus, ShieldCheck, UserMinus, Activity, Map, ClipboardCheck, BrainCircuit, Download, Eye, Trash2, Loader2, CheckCircle2, XCircle } from "lucide-react";

// --- Mock Data ---
const TEMPLATES = [
  { id: "t1", name: "Executive Risk Summary", desc: "High-level risk posture for leadership", icon: <ShieldCheck className="w-5 h-5 text-indigo-400" /> },
  { id: "t2", name: "Identity Exposure Report", desc: "All identities with open findings", icon: <UserMinus className="w-5 h-5 text-cyan-400" /> },
  { id: "t3", name: "CloudTrail Audit Export", desc: "Raw events for compliance review", icon: <Activity className="w-5 h-5 text-orange-400" /> },
  { id: "t4", name: "Attack Path Analysis", desc: "Full graph with blast radius", icon: <Map className="w-5 h-5 text-red-400" /> },
  { id: "t5", name: "Compliance Posture Report", desc: "Framework coverage scores", icon: <ClipboardCheck className="w-5 h-5 text-green-400" /> },
  { id: "t6", name: "AI Investigation Log", desc: "All AI-generated findings and recommendations", icon: <BrainCircuit className="w-5 h-5 text-purple-400" /> },
];

const RECENT_REPORTS = [
  { id: "r1", name: "Q3 Executive Board Summary", type: "Executive Risk Summary", time: "1h ago", status: "READY" },
  { id: "r2", name: "Stale Identity Monthly Sweep", type: "Identity Exposure Report", time: "2h ago", status: "READY" },
  { id: "r3", name: "CloudTrail Anomalies - Nov", type: "CloudTrail Audit Export", time: "1d ago", status: "GENERATING" },
  { id: "r4", name: "HIPAA Compliance Gap Analysis", type: "Compliance Posture Report", time: "2d ago", status: "FAILED" },
  { id: "r5", name: "Prod Env Attack Paths", type: "Attack Path Analysis", time: "1w ago", status: "READY" },
];

export default function ReportsPage() {

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "READY":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border border-[#22c55e]/20 bg-green-100/50 text-[#22c55e]">
            <CheckCircle2 className="w-3.5 h-3.5" /> READY
          </span>
        );
      case "GENERATING":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border border-[#fbbf24]/20 bg-[#78350f]/50 text-[#fbbf24]">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> GENERATING
          </span>
        );
      case "FAILED":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border border-[#ef4444]/20 bg-[#450a0a]/50 text-[#ef4444]">
            <XCircle className="w-3.5 h-3.5" /> FAILED
          </span>
        );
      default:
        return <span className="text-text-muted">{status}</span>;
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            <FileText className="w-6 h-6 text-primary" />
            Reports
          </h1>
          <p className="text-text-muted mt-1 text-sm">Scheduled and on-demand security reports</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2 shadow-[0_0_20px_rgba(211,245,49,0.3)] w-full md:w-auto">
          <Plus className="w-4 h-4" />
          Generate New Report
        </button>
      </div>

      {/* Templates Grid */}
      <div className="flex flex-col gap-4">
        <h2 className="text-text-primary font-bold text-lg">Report Templates</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl) => (
            <div key={tpl.id} className="bg-transparent border border-glass-subtle hover:border-glass-active rounded-xl p-5 shadow-sm transition-all hover:bg-white/10 flex flex-col gap-4 group">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-glass-subtle rounded-lg border border-glass-active group-hover:border-[#6366f1]/30 transition-colors">
                  {tpl.icon}
                </div>
                <div>
                  <h3 className="font-bold text-text-primary text-sm mb-1">{tpl.name}</h3>
                  <p className="text-text-muted text-xs leading-relaxed">{tpl.desc}</p>
                </div>
              </div>
              <div className="mt-auto pt-4 border-t border-glass-subtle border flex justify-end opacity-80 group-hover:opacity-100 transition-opacity">
                <button className="text-xs font-semibold text-[#818cf8] hover:bg-[#818cf8]/10 px-3 py-1.5 rounded-md transition-colors">
                  Generate
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-transparent border border-glass-subtle rounded-xl flex flex-col overflow-hidden shadow-lg">
        <div className="p-4 border-b border-glass-subtle border flex items-center justify-between bg-glass-subtle">
          <h2 className="text-text-primary font-bold text-lg">Recent Reports</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-glass-subtle border-b border-glass-subtle border text-xs uppercase tracking-wider text-text-muted font-bold">
              <tr>
                <th className="p-4">Report Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Generated</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-subtle">
              {RECENT_REPORTS.map((report) => (
                <tr key={report.id} className="hover:bg-white/10 transition-colors group">
                  <td className="p-4 font-bold text-text-primary text-sm">{report.name}</td>
                  <td className="p-4 text-sm text-text-muted">{report.type}</td>
                  <td className="p-4 text-sm font-mono text-text-muted">{report.time}</td>
                  <td className="p-4">{getStatusBadge(report.status)}</td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      <button className="p-1.5 text-text-muted hover:text-[#06b6d4] hover:bg-[#06b6d4]/10 rounded transition-colors" title="View Report" disabled={report.status !== 'READY'}>
                        <Eye className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-[#6366f1] hover:bg-[#6366f1]/10 rounded transition-colors" title="Download PDF" disabled={report.status !== 'READY'}>
                        <Download className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-text-muted hover:text-[#ef4444] hover:bg-[#ef4444]/10 rounded transition-colors" title="Delete">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
