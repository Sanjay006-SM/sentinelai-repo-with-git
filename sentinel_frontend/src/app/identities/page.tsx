"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Download, ChevronDown, ChevronRight, MoreHorizontal, Shield, Server, Activity } from "lucide-react";

// Sample Data
const MOCK_IDENTITIES = [
  { id: 1, score: 94, name: "i-prod-payments-svc", cloud: "AWS", env: "prod", region: "us-east-1", type: "IAM User", lastActivity: "2m ago", recommendation: "Rotate key · scope STS" },
  { id: 2, score: 88, name: "k8s-prod-cluster-admin", cloud: "GKE", env: "prod", region: "europe-west4", type: "ServiceAccount", lastActivity: "12m ago", recommendation: "Down-scope RBAC" },
  { id: 3, score: 81, name: "arn:terraform-ci-runner", cloud: "AWS", env: "prod", region: "us-west-2", type: "IAM Role", lastActivity: "27m ago", recommendation: "Pin subject claim" },
  { id: 4, score: 76, name: "azure-fn-stripe-webhook", cloud: "Azure", env: "prod", region: "westeurope", type: "Managed Identity", lastActivity: "1h ago", recommendation: "Re-bind scope" },
  { id: 5, score: 62, name: "gcp-sa-bigquery-etl", cloud: "GCP", env: "prod", region: "us-central1", type: "Service Account", lastActivity: "3h ago", recommendation: "Reduce dataset access" },
  { id: 6, score: 58, name: "github-actions-deploy", cloud: "GitHub", env: "staging", region: "global", type: "OIDC", lastActivity: "5h ago", recommendation: "Add branch claim" },
  { id: 7, score: 41, name: "vault-prod-renewer", cloud: "Vault", env: "prod", region: "us-east-1", type: "AppRole", lastActivity: "6h ago", recommendation: "Shorten TTL" },
  { id: 8, score: 36, name: "snowflake-etl-svc", cloud: "Snowflake", env: "prod", region: "us-west-2", type: "Key Pair", lastActivity: "8h ago", recommendation: "Enable key pair auth" },
  { id: 9, score: 28, name: "datadog-forwarder-fn", cloud: "AWS", env: "prod", region: "us-east-1", type: "Lambda", lastActivity: "12h ago", recommendation: "Trim log access" },
  { id: 10, score: 14, name: "grafana-readonly-sa", cloud: "GCP", env: "staging", region: "eu-west1", type: "Service Account", lastActivity: "1d ago", recommendation: "Rotate credentials" },
];

const getRiskConfig = (score: number) => {
  if (score >= 80) return { label: "Critical", style: "bg-[#450a0a] text-[#ef4444] border-[#ef4444]/20" };
  if (score >= 60) return { label: "High", style: "bg-[#7c2d12] text-[#f97316] border-[#f97316]/20" };
  if (score >= 40) return { label: "Medium", style: "bg-[#78350f] text-[#fbbf24] border-[#fbbf24]/20" };
  return { label: "Low", style: "bg-green-500/20 text-[#22c55e] border-[#22c55e]/20" };
};

const getCloudBadge = (cloud: string) => {
  switch (cloud) {
    case 'AWS': return "text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20";
    case 'GKE': return "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20";
    case 'Azure': return "text-[#06b6d4] bg-[#06b6d4]/10 border-[#06b6d4]/20";
    case 'GCP': return "text-[#22c55e] bg-[#22c55e]/10 border-[#22c55e]/20";
    case 'GitHub': return "text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/20";
    case 'Vault': return "text-[#6366f1] bg-[#6366f1]/10 border-[#6366f1]/20";
    case 'Snowflake': return "text-[#0ea5e9] bg-[#0ea5e9]/10 border-[#0ea5e9]/20";
    default: return "text-text-muted bg-gray-400/10 border-gray-400/20";
  }
};

const IdentityRow = ({ id, rank }: { id: typeof MOCK_IDENTITIES[0], rank: number }) => {
  const [expanded, setExpanded] = useState(false);
  const risk = getRiskConfig(id.score);

  return (
    <>
      <tr 
        onClick={() => setExpanded(!expanded)} 
        className="hover:bg-white/10 cursor-pointer transition-colors border-b border-glass-subtle border group"
      >
        <td className="p-4 text-center font-mono text-text-muted text-sm">
          <div className="flex items-center gap-2">
            <ChevronRight className={`w-4 h-4 transition-transform ${expanded ? "rotate-90" : ""}`} />
            {rank}
          </div>
        </td>
        <td className="p-4">
          <div className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border ${risk.style}`}>
            {risk.label} · {id.score}
          </div>
        </td>
        <td className="p-4 font-bold text-text-primary text-sm truncate max-w-[200px]" title={id.name}>
          {id.name}
        </td>
        <td className="p-4">
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold border uppercase tracking-wider ${getCloudBadge(id.cloud)}`}>
            {id.cloud}
          </span>
        </td>
        <td className="p-4 text-sm text-text-muted">
          {id.env}
        </td>
        <td className="p-4 text-sm text-text-muted">
          {id.region}
        </td>
        <td className="p-4 text-sm text-text-muted whitespace-nowrap">
          {id.type}
        </td>
        <td className="p-4 text-xs font-mono text-text-muted whitespace-nowrap">
          {id.lastActivity}
        </td>
        <td className="p-4 font-mono text-xs text-[#06b6d4] truncate max-w-[200px]" title={id.recommendation}>
          {id.recommendation}
        </td>
        <td className="p-4 text-right">
          <button className="p-1.5 text-text-muted hover:text-white hover:bg-glass-active rounded transition-colors" onClick={(e) => e.stopPropagation()}>
            <MoreHorizontal className="w-4 h-4" />
          </button>
        </td>
      </tr>
      <AnimatePresence>
        {expanded && (
          <motion.tr
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
          >
            <td colSpan={10} className="p-0 border-b border-glass-subtle border bg-glass-subtle">
              <div className="p-6 pl-12 flex gap-4 items-start border-l-2 border-primary ml-4 my-4 bg-transparent rounded-r-lg">
                <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-text-muted">
                    Sentinel observed this identity assuming roles across <span className="font-bold text-text-primary">{Math.floor(Math.random() * 5) + 1}</span> accounts with permissions inconsistent with its baseline.
                  </p>
                  <div className="mt-2 text-sm text-text-muted">
                    Recommended action: <span className="font-mono text-[#06b6d4] bg-[#06b6d4]/10 px-1.5 py-0.5 rounded">{id.recommendation}</span>
                  </div>
                  <div className="mt-4 flex gap-3">
                    <button className="btn btn-primary h-8 px-4 text-xs">Apply Recommendation</button>
                    <button className="btn bg-transparent border border-border hover:border-primary/50 text-text-secondary hover:text-primary h-8 px-4 text-xs transition-colors">View Activity Graph</button>
                  </div>
                </div>
              </div>
            </td>
          </motion.tr>
        )}
      </AnimatePresence>
    </>
  );
};

export default function MachineIdentitiesPage() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Machine Identities</h1>
          <p className="text-text-muted mt-1 text-sm">All machine identities tracked across your cloud accounts</p>
        </div>
        
        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-transparent border border-glass-subtle rounded-md px-4 py-2 flex items-center gap-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Total</span>
            <span className="text-lg font-bold text-text-primary">9,124</span>
          </div>
          <div className="bg-transparent border border-glass-subtle rounded-md px-4 py-2 flex items-center gap-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Critical Risk</span>
            <span className="text-lg font-bold text-[#ef4444]">42</span>
          </div>
          <div className="bg-transparent border border-glass-subtle rounded-md px-4 py-2 flex items-center gap-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">High Risk</span>
            <span className="text-lg font-bold text-[#f97316]">184</span>
          </div>
          <div className="bg-transparent border border-glass-subtle rounded-md px-4 py-2 flex items-center gap-3">
            <span className="text-xs font-semibold text-text-muted uppercase tracking-wider">Avg Risk Score</span>
            <span className="text-lg font-bold text-text-primary">37.4</span>
          </div>
        </div>
      </div>

      <div className="bg-transparent border border-glass-subtle rounded-xl flex flex-col overflow-hidden shadow-lg">
        
        {/* Filter Bar */}
        <div className="p-4 border-b border-glass-subtle border flex flex-col md:flex-row md:items-center justify-between gap-4 bg-glass-subtle">
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-glass-subtle hover:border-glass-active rounded-md text-sm text-text-primary transition-colors">
              All Clouds <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-glass-subtle hover:border-glass-active rounded-md text-sm text-text-primary transition-colors">
              All Environments <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-glass-subtle hover:border-glass-active rounded-md text-sm text-text-primary transition-colors">
              All Severities <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
            </button>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
              <input 
                type="text" 
                placeholder="Search by ARN, name, or tag..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full md:w-64 pl-9 pr-4 py-1.5 bg-glass-subtle border border-glass-subtle hover:border-glass-active focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none rounded-md text-sm text-text-primary font-mono placeholder:font-mono placeholder:text-text-muted transition-all"
              />
            </div>
            <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent hover:bg-white/10 border border-glass-subtle rounded-md text-sm text-text-primary transition-colors">
              <Download className="w-4 h-4 text-text-muted" />
              Export
            </button>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead className="bg-glass-subtle border-b border-glass-subtle border text-xs uppercase tracking-wider text-text-muted font-bold sticky top-0 z-10">
              <tr>
                <th className="p-4 w-16 text-center">Rank</th>
                <th className="p-4">Risk Score</th>
                <th className="p-4">Identity Name</th>
                <th className="p-4">Cloud</th>
                <th className="p-4">Environment</th>
                <th className="p-4">Region</th>
                <th className="p-4">Type</th>
                <th className="p-4">Last Activity</th>
                <th className="p-4">Recommendation</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-subtle bg-transparent">
              {MOCK_IDENTITIES.map((id, index) => (
                <IdentityRow key={id.id} id={id} rank={index + 1} />
              ))}
            </tbody>
          </table>
        </div>
        
      </div>
    </div>
  );
}
