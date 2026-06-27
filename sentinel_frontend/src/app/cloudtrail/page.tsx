"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, ChevronDown, Activity, Terminal, ShieldAlert } from "lucide-react";

// --- Mock Data ---
const MOCK_EVENTS = [
  { id: "e1", time: "2s", provider: "AWS", event: "AssumeRole", arn: "arn:aws:iam::4129::role/payments-svc", tag: "+412% baseline", type: "ANOMALY" },
  { id: "e2", time: "6s", provider: "AWS", event: "CreateAccessKey", arn: "arn:aws:iam::4129::user/ci-runner", tag: "new long-lived key", type: "ANOMALY" },
  { id: "e3", time: "14s", provider: "GCP", event: "iam.SetIamPolicy", arn: "sa-bigquery-etl@acme", tag: "scope expanded", type: "INFO" },
  { id: "e4", time: "22s", provider: "AWS", event: "RotateSecret", arn: "secretsmanager.amazonaws.com", tag: "auto by SentryIQ", type: "AUTO" },
  { id: "e5", time: "31s", provider: "Azure", event: "RoleAssignment.Write", arn: "fn-stripe-webhook", tag: "owner → contributor", type: "INFO" },
  { id: "e6", time: "47s", provider: "AWS", event: "ConsoleLogin", arn: "root@acme.io", tag: "MFA bypass attempt", type: "CRITICAL" },
  { id: "e7", time: "1m", provider: "GKE", event: "k8s.exec", arn: "user:platform-on-call", tag: "session 8m12s", type: "INFO" },
  { id: "e8", time: "1m", provider: "AWS", event: "DeleteTrail", arn: "arn:aws:cloudtrail::log-bucket", tag: "trail deletion", type: "ANOMALY" },
  { id: "e9", time: "2m", provider: "GCP", event: "storage.objects.get", arn: "sa-bigquery-etl", tag: "card-vault/* bucket", type: "INFO" },
  { id: "e10", time: "2m", provider: "Azure", event: "KeyVault.GetSecret", arn: "fn-payments-prod", tag: "unusual time access", type: "ANOMALY" },
];

const POOL = [
  { provider: "AWS", event: "ListBuckets", arn: "arn:aws:iam::4129::user/auditor", tag: "routine scan", type: "INFO" },
  { provider: "GCP", event: "compute.instances.insert", arn: "sa-compute@acme", tag: "new VM created", type: "INFO" },
  { provider: "Azure", event: "KeyVault.SecretSet", arn: "fn-payments-prod", tag: "key rotation", type: "AUTO" },
  { provider: "AWS", event: "GetCallerIdentity", arn: "arn:aws:iam::4129::role/eks-node", tag: "eks auth", type: "INFO" },
  { provider: "GKE", event: "k8s.pod.delete", arn: "user:ci-cd", tag: "eviction", type: "INFO" },
  { provider: "AWS", event: "AttachUserPolicy", arn: "arn:aws:iam::4129::user/dev", tag: "privilege granted", type: "ANOMALY" },
];

export default function CloudTrailEventsPage() {
  const [events, setEvents] = useState(MOCK_EVENTS);

  // Animate new events arriving every 3 seconds
  useEffect(() => {
    let count = 0;
    const interval = setInterval(() => {
      setEvents(prev => {
        const poolEvent = POOL[count % POOL.length];
        const newEvent = {
          ...poolEvent,
          id: `new-${Date.now()}`,
          time: "0s",
        };
        // Update times for existing events (simplified mockup logic)
        const updatedPrev = prev.map(e => {
          if (e.time.endsWith('s')) {
            const sec = parseInt(e.time);
            return { ...e, time: sec + 3 > 59 ? '1m' : `${sec + 3}s` };
          }
          return e;
        });
        return [newEvent, ...updatedPrev].slice(0, 12); // keep top 12
      });
      count++;
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const getProviderBadge = (provider: string) => {
    switch (provider) {
      case "AWS": return "text-[#f97316] bg-[#f97316]/10 border-[#f97316]/20";
      case "GCP": return "text-[#3b82f6] bg-[#3b82f6]/10 border-[#3b82f6]/20";
      case "Azure": return "text-[#06b6d4] bg-[#06b6d4]/10 border-[#06b6d4]/20";
      case "GKE": return "text-[#a855f7] bg-[#a855f7]/10 border-[#a855f7]/20";
      default: return "text-text-muted bg-[#64748b]/10 border-[#64748b]/20";
    }
  };

  const getTagStyle = (type: string) => {
    switch (type) {
      case "ANOMALY": return "text-[#fbbf24] bg-[#78350f]/30 border-[#fbbf24]/20";
      case "CRITICAL": return "text-[#ef4444] bg-[#450a0a]/50 border-[#ef4444]/20 font-bold";
      case "AUTO": return "text-[#818cf8] bg-[#1e1b4b]/50 border-[#818cf8]/20";
      default: return "text-text-muted bg-glass-subtle border-glass-active border";
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col">
            <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
              <Terminal className="w-6 h-6 text-primary" />
              CloudTrail Events
            </h1>
            <p className="text-text-muted mt-1 text-sm">Streaming · 18 AWS accounts · 12 GCP projects · 8 Azure subs</p>
          </div>
          
          {/* Live Badge */}
          <div className="flex items-center gap-3 bg-green-100/50 border border-[#22c55e]/30 px-4 py-2 rounded-lg shadow-[0_0_15px_rgba(34,197,94,0.1)]">
            <div className="w-2.5 h-2.5 rounded-full bg-[#22c55e] animate-pulse shadow-[0_0_8px_rgba(34,197,94,0.8)]"></div>
            <span className="text-[#22c55e] font-mono font-bold text-sm tracking-wider">LIVE · 12.4k ev/min</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="glass-panel p-4 flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-glass-subtle hover:border-glass-active rounded-md text-sm text-text-primary transition-colors">
            Cloud Provider <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-glass-subtle hover:border-glass-active rounded-md text-sm text-text-primary transition-colors">
            Event Type <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>
          <button className="flex items-center gap-2 px-3 py-1.5 bg-transparent border border-glass-subtle hover:border-glass-active rounded-md text-sm text-text-primary transition-colors">
            Time Range <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
          </button>
        </div>
        
        <div className="relative flex-1 max-w-md ml-auto">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <input 
            type="text" 
            placeholder="Search ARN, identity, or resource..." 
            className="w-full pl-9 pr-4 py-1.5 bg-glass-subtle border border-glass-subtle hover:border-glass-active focus:border-primary focus:ring-1 focus:ring-primary/50 outline-none rounded-md text-sm text-text-primary font-mono placeholder:font-mono placeholder:text-text-muted transition-all"
          />
        </div>
      </div>

      {/* Events Stream Panel */}
      <div className="bg-transparent border border-glass-subtle rounded-xl flex flex-col overflow-hidden shadow-lg h-[650px]">
        <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-glass-active scrollbar-track-transparent">
          <div className="flex flex-col gap-1">
            <AnimatePresence initial={false}>
              {events.map((ev) => (
                <motion.div
                  key={ev.id}
                  initial={{ opacity: 0, y: -20, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ type: "spring", stiffness: 300, damping: 25 }}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 p-3 rounded-lg hover:bg-white/10 border border-transparent hover:border-glass-active transition-colors group"
                >
                  {/* Timestamp */}
                  <div className="bg-glass-subtle border border-glass-subtle text-text-muted font-mono text-xs px-2 py-1 rounded w-12 text-center shrink-0 group-hover:text-slate-500">
                    {ev.time}
                  </div>
                  
                  {/* Provider */}
                  <div className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border shrink-0 text-center w-14 ${getProviderBadge(ev.provider)}`}>
                    {ev.provider}
                  </div>

                  {/* Event Name */}
                  <div className="font-bold text-text-primary text-sm shrink-0 w-44">
                    {ev.event}
                  </div>

                  {/* ARN */}
                  <div className="font-mono text-[#06b6d4] text-xs truncate flex-1" title={ev.arn}>
                    {ev.arn}
                  </div>

                  {/* Tag / Anomaly */}
                  <div className="shrink-0 flex items-center justify-end min-w-[150px]">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs border ${getTagStyle(ev.type)}`}>
                      {ev.type === 'CRITICAL' && <ShieldAlert className="w-3.5 h-3.5" />}
                      {ev.tag}
                      {ev.type !== 'INFO' && <span className="uppercase text-[9px] font-bold opacity-70 ml-1">[{ev.type}]</span>}
                    </span>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
      
    </div>
  );
}
