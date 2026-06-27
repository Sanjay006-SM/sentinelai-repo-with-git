"use client";

import { useState, useMemo } from "react";
import { useIdentities } from "@/lib/queries";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  GitBranch, 
  Search, 
  Users, 
  UserCog, 
  Cloud, 
  KeyRound,
  ArrowUpDown,
  Info
} from "lucide-react";

type SortKey = "arn" | "risk_score" | "total_events" | "identity_type";
type SortDirection = "asc" | "desc";

// Helper for Provider
const getProviderDetails = (arn: string) => {
  if (arn.includes("gcp") || arn.includes("gserviceaccount")) return { label: "GKE", color: "bg-[#22c55e]/10 text-[#22c55e] border-[#22c55e]/20" }; // Green
  if (arn.includes("azure")) return { label: "Azure", color: "bg-[#06b6d4]/10 text-[#06b6d4] border-[#06b6d4]/20" }; // Cyan
  return { label: "AWS", color: "bg-[#f97316]/10 text-[#f97316] border-[#f97316]/20" }; // Orange
};

export default function RiskLeaderboard() {
  const { data: identities, isLoading } = useIdentities();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
  const [sortConfig, setSortConfig] = useState<{ key: SortKey, direction: SortDirection }>({ key: "risk_score", direction: "desc" });

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === "desc" ? "asc" : "desc"
    }));
  };

  const getIdentityDetails = (type: string) => {
    switch(type) {
      case "IAMUser": return { icon: Users, label: "IAM User" };
      case "AssumedRole": return { icon: UserCog, label: "Assumed Role" };
      case "AWSService": return { icon: Cloud, label: "AWS Service" };
      default: return { icon: KeyRound, label: "Credential" };
    }
  };

  const getRiskDetails = (score: number) => {
    if (score >= 80) return { label: "Critical", chip: "bg-[#450a0a] text-critical border-critical/20" };
    if (score >= 60) return { label: "High", chip: "bg-[#7c2d12] text-high border-high/20" }; 
    if (score >= 40) return { label: "Medium", chip: "bg-warning/20 text-warning border-warning/30" };
    return { label: "Low", chip: "bg-success/20 text-success border-success/30" };
  };

  const filteredAndSorted = useMemo(() => {
    if (!identities) return [];
    
    // 1. Filter
    let filtered = identities.filter(id => {
      const q = searchQuery.toLowerCase();
      const name = (id.arn.split('/').pop() || id.arn).toLowerCase();
      return name.includes(q) || id.arn.toLowerCase().includes(q) || id.identity_type.toLowerCase().includes(q);
    });

    // 2. Sort
    filtered.sort((a, b) => {
      let aVal: any = a[sortConfig.key];
      let bVal: any = b[sortConfig.key];

      if (sortConfig.key === "arn") {
        aVal = a.arn.split('/').pop() || a.arn;
        bVal = b.arn.split('/').pop() || b.arn;
      }

      if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
      if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [identities, searchQuery, sortConfig]);

  return (
    <div className="card flex flex-col h-full bg-card border-border overflow-hidden">
      
      {/* Header & Search */}
      <div className="px-4 py-2.5 border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-text-primary">Risk Leaderboard</h2>
          <p className="text-[11px] text-text-secondary mt-0.5">Identities ranked by lateral movement potential.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search by name, ARN or type..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field pl-9 h-8 text-[13px]"
          />
        </div>
      </div>
      
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse min-w-[800px]">
          <thead className="bg-elevated border-b border-border sticky top-0 z-10 text-[11px] uppercase tracking-wider text-text-muted font-bold">
            <tr>
              <th className="px-3 py-2 w-12 text-center">#</th>
              <th className="px-3 py-2 cursor-pointer hover:text-text-primary transition-colors group" onClick={() => handleSort("arn")}>
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1">
                    Identity
                  </span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="px-3 py-2">Provider</th>
              <th className="px-3 py-2 cursor-pointer hover:text-text-primary transition-colors group" onClick={() => handleSort("identity_type")}>
                <div className="flex items-center gap-1.5">
                  Type
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="px-3 py-2 cursor-pointer hover:text-text-primary transition-colors group w-48" onClick={() => handleSort("risk_score")}>
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1">
                    Risk Score
                  </span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="px-3 py-2 cursor-pointer hover:text-text-primary transition-colors group" onClick={() => handleSort("total_events")}>
                <div className="flex items-center gap-1.5">
                  <span className="flex items-center gap-1">
                    Events
                  </span>
                  <ArrowUpDown className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
                </div>
              </th>
              <th className="px-3 py-2 text-right">Action</th>
            </tr>
          </thead>
          
          <tbody className="divide-y divide-border bg-card">
            <AnimatePresence>
              {isLoading ? (
                <motion.tr key="loading" exit={{ opacity: 0 }}>
                  <td colSpan={7} className="p-8 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mb-2"></div>
                      <span className="text-sm text-text-muted">Analyzing identities...</span>
                    </div>
                  </td>
                </motion.tr>
              ) : filteredAndSorted?.length === 0 ? (
                <motion.tr key="empty" exit={{ opacity: 0 }}>
                  <td colSpan={7} className="p-8 text-center text-text-muted text-sm">
                    No identities match your search.
                  </td>
                </motion.tr>
              ) : (
                filteredAndSorted?.map((id, index) => {
                  const name = id.arn.split('/').pop() || id.arn;
                  const IdentityIcon = getIdentityDetails(id.identity_type).icon;
                  const identityTypeLabel = getIdentityDetails(id.identity_type).label;
                  
                  const riskConfig = getRiskDetails(id.risk_score);
                  const providerConfig = getProviderDetails(id.arn);

                  return (
                    <motion.tr 
                      key={id.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.03 }}
                      onClick={() => router.push(`/canvas/${id.id}`)}
                      className="hover:bg-elevated cursor-pointer transition-colors group"
                    >
                      {/* Rank Number */}
                      <td className="px-3 py-2 text-center font-mono text-text-muted text-[11px]">
                        {index + 1}
                      </td>

                      {/* Identity */}
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center border bg-elevated border-border-subtle group-hover:bg-card transition-colors`}>
                            <IdentityIcon className="w-3.5 h-3.5 text-text-secondary group-hover:text-primary transition-colors" />
                          </div>
                          <div className="flex flex-col">
                            <span className="font-bold text-[13px] text-text-primary leading-none">{name}</span>
                            <span className="text-[11px] text-text-secondary font-mono truncate max-w-[200px] mt-0.5">us-east-1</span>
                          </div>
                        </div>
                      </td>

                      {/* Provider Badge */}
                      <td className="px-3 py-2">
                        <span className={`inline-flex items-center px-1.5 py-[1px] rounded-full text-[9px] font-bold border ${providerConfig.color} uppercase tracking-widest`}>
                          {providerConfig.label}
                        </span>
                      </td>

                      {/* Identity Type */}
                      <td className="px-3 py-2">
                        <span className="text-[12px] text-text-secondary">{identityTypeLabel}</span>
                      </td>

                      {/* Risk Score */}
                      <td className="px-3 py-2">
                        <div className={`inline-flex items-center px-2 py-0.5 rounded border ${riskConfig.chip}`}>
                          <span className="text-[11px] font-bold">{riskConfig.label} · {id.risk_score}</span>
                        </div>
                      </td>

                      {/* Events */}
                      <td className="px-3 py-2">
                        <span className="text-[13px] font-semibold text-text-primary font-mono">
                          {id.total_events || "--"}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="px-3 py-2 text-right">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/canvas/${id.id}`);
                          }}
                          className="btn bg-transparent border border-border text-text-secondary hover:border-primary hover:text-primary inline-flex items-center gap-1.5 h-6 px-2.5 transition-colors"
                        >
                          <GitBranch className="w-3 h-3" />
                          <span className="text-[11px]">View</span>
                        </button>
                      </td>
                    </motion.tr>
                  );
                })
              )}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
    </div>
  );
}
