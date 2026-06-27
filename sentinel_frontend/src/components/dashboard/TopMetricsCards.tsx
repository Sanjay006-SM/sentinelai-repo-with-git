"use client";

import { useDashboardSummary } from "@/lib/queries";
import { ShieldAlert, Users, GitBranch, FileWarning, TrendingUp, TrendingDown, Info, Cloud, Activity, Clock3 } from "lucide-react";
import { motion } from "framer-motion";

function WidgetBadge({ status, variant }: { status: string, variant: "monitoring" | "healthy" | "attention" | "processing" }) {
  const colors: Record<string, string> = {
    monitoring: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    healthy:    "bg-[#D3F531]/10 text-[#D3F531] border-[#D3F531]/20",
    attention:  "bg-amber-500/10 text-amber-400 border-amber-500/20",
    processing: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  };
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider border backdrop-blur-md ${colors[variant]}`}>
      {status}
    </span>
  );
}

export default function TopMetricsCards() {
  const { data, isLoading, isError, error } = useDashboardSummary();

  if (isError) {
    console.error("React Query Dashboard Error:", error);
  }

  const metrics = [
    {
      title: "Identities",
      value: data?.identities_count ?? 0,
      icon: Users,
      description: "Unique AWS identities",
      trend: "+12 today",
      trendDirection: "up",
      status: "Monitoring",
      statusVariant: "monitoring" as const,
      tooltip: "Unique AWS identities discovered from CloudTrail logs."
    },
    {
      title: "Critical Risks",
      value: data?.critical_risk_count ?? 0,
      icon: ShieldAlert,
      description: "High severity issues",
      trend: "+2 this week",
      trendDirection: "down",
      status: (data?.critical_risk_count ?? 0) > 0 ? "Attention" : "Healthy",
      statusVariant: (data?.critical_risk_count ?? 0) > 0 ? "attention" as const : "healthy" as const,
      tooltip: "Misconfigurations or vulnerable identities."
    },
    {
      title: "Attack Paths",
      value: data?.attack_path_count ?? 0,
      icon: GitBranch,
      description: "Exploitable chains",
      trend: "Stable",
      trendDirection: "neutral",
      status: "Attention",
      statusVariant: "attention" as const,
      tooltip: "Potential privilege escalation chains."
    },
    {
      title: "Findings",
      value: data?.total_findings_count ?? 0,
      icon: FileWarning,
      description: "Security anomalies",
      trend: "+18 new",
      trendDirection: "up",
      status: "Processing",
      statusVariant: "processing" as const,
      tooltip: "Aggregate count of all security anomalies."
    },
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Top Status Strip */}
      <div className="glass-panel p-4 flex flex-col md:flex-row gap-6 md:gap-12 items-center justify-between rounded-3xl">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-glass-subtle border border-glass-subtle flex items-center justify-center text-text-muted">
            <Cloud className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-0.5">Cloud Provider</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary">AWS</span>
              <span className="w-2 h-2 rounded-full bg-[#D3F531] shadow-[0_0_8px_rgba(211,245,49,0.8)]" />
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-glass-active hidden md:block" />

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-glass-subtle border border-glass-subtle flex items-center justify-center text-text-muted">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-0.5">System Status</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary">Healthy</span>
            </div>
          </div>
        </div>

        <div className="h-8 w-px bg-glass-active hidden md:block" />

        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-glass-subtle border border-glass-subtle flex items-center justify-center text-text-muted">
            <Clock3 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] font-bold text-text-muted tracking-wider uppercase mb-0.5">Last Scan</div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-text-primary">2 mins ago</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Metric Cards */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6"
      >
        {metrics.map((m, i) => {
          const Icon = m.icon;
          
          return (
            <motion.div 
              key={i} 
              variants={cardVariants}
              whileHover={{ y: -4, scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300, damping: 20 }}
              className="glass-panel group relative flex flex-col p-6 rounded-3xl"
            >
              {/* Top Row: Icon and Badge */}
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center bg-glass-subtle border border-glass-subtle group-hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
                  <Icon className="w-5 h-5 text-[#D3F531]" />
                </div>
                <WidgetBadge status={m.status} variant={m.statusVariant} />
              </div>

              {/* Middle Row: Title, Tooltip, Value */}
              <div className="flex flex-col gap-1 mb-6">
                <div className="flex items-center gap-2">
                  <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">{m.title}</h3>
                  <div className="group/tooltip relative flex items-center justify-center">
                    <Info className="w-3.5 h-3.5 text-text-muted hover:text-white cursor-help transition-colors" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 text-xs rounded-lg shadow-xl opacity-0 group-hover/tooltip:opacity-100 transition-opacity pointer-events-none z-50 bg-black/80 backdrop-blur-xl border border-glass-subtle text-text-secondary">
                      {m.tooltip}
                    </div>
                  </div>
                </div>
                <div className="flex items-baseline gap-2">
                  <h2 className="text-4xl font-bold text-text-primary tracking-tight drop-shadow-md">
                    {isLoading ? "-" : m.value}
                  </h2>
                </div>
                <p className="text-xs text-text-muted mt-1">{m.description}</p>
              </div>

              {/* Bottom Row: Trend (Mini Chart visualization) */}
              <div className="mt-auto pt-4 flex items-center gap-2 border-t border-glass-subtle border relative overflow-hidden">
                 {/* Decorative background glow for trend */}
                 {m.trendDirection === 'up' && (
                   <div className="absolute bottom-0 right-0 w-24 h-12 bg-[#D3F531]/10 blur-xl rounded-full" />
                 )}
                {m.trendDirection === "up" ? (
                  <TrendingUp className="w-4 h-4 text-[#D3F531]" />
                ) : m.trendDirection === "down" ? (
                  <TrendingDown className="w-4 h-4 text-red-400" />
                ) : (
                  <div className="w-4 h-px bg-gray-500" />
                )}
                <span className={`text-xs font-bold ${
                  m.trendDirection === "up" ? "text-[#D3F531]" : m.trendDirection === "down" ? "text-red-400" : "text-text-muted"
                }`}>
                  {m.trend}
                </span>
              </div>
            </motion.div>
          );
        })}
      </motion.div>
    </div>
  );
}
