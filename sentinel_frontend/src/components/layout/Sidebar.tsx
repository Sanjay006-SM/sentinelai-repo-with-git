"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  GitBranch,
  ShieldAlert,
  FileJson,
  BrainCircuit,
  ChartColumn,
  FileBarChart,
  Settings,
  Zap,
  Hexagon
} from "lucide-react";

const navItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Identities", href: "/identities", icon: Users },
  { name: "Attack Graph", href: "/attack-graph", icon: GitBranch },
  { name: "Risk Findings", href: "/risk-findings", icon: ShieldAlert },
  { name: "CloudTrail", href: "/cloudtrail", icon: FileJson },
  { name: "AI Analyst", href: "/ai-investigation", icon: BrainCircuit },
  { name: "Analytics", href: "/analytics", icon: ChartColumn },
  { name: "Reports", href: "/reports", icon: FileBarChart },
  { name: "Settings", href: "/settings", icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[280px] shrink-0 h-[calc(100vh-2rem)] sticky top-4 ml-4 flex flex-col z-50 glass-panel">
      {/* Logo Area */}
      <div className="h-20 flex items-center px-6 shrink-0 border-b border-glass-subtle border">
        <Link href="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#D3F531]/10 flex items-center justify-center border border-[#D3F531]/30">
            <Hexagon className="w-6 h-6 text-[#D3F531] fill-[#D3F531]/20" />
          </div>
          <span className="font-bold text-xl tracking-tight text-text-primary drop-shadow-md">
            CryptoNest
          </span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2 custom-scrollbar">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`relative flex items-center gap-4 px-4 py-3.5 rounded-2xl text-sm font-semibold transition-all duration-300 ${
                isActive
                  ? "bg-glass-active text-text-primary shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)]"
                  : "text-text-muted hover:bg-white/5 hover:text-white"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active-indicator"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-1.5 h-8 bg-[#D3F531] rounded-r-full shadow-[0_0_10px_rgba(211,245,49,0.5)]"
                  initial={false}
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors ${isActive ? 'bg-[#D3F531] text-black shadow-[0_0_15px_rgba(211,245,49,0.4)]' : 'bg-glass-subtle text-text-muted group-hover:bg-white/10'}`}>
                 <Icon className="w-4 h-4" />
              </div>
              
              <span className="tracking-wide">{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Threat Intel Banner (Adapted for Crypto style) */}
      <div className="mt-auto px-4 pb-4">
        <div className="rounded-2xl p-4 relative overflow-hidden flex gap-3 bg-glass-subtle border border-glass-subtle backdrop-blur-md">
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-[#D3F531]" />
          <div className="flex-shrink-0 text-[#D3F531]">
            <Zap className="w-5 h-5 mt-0.5" />
          </div>
          <div>
            <div className="text-xs font-bold mb-1 text-text-primary uppercase tracking-wider">Trading Bots</div>
            <div className="text-[11px] leading-relaxed text-text-muted">
              Auto-trade enabled for ETH/USDT pool
            </div>
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 mx-4 mb-4 flex items-center gap-3 shrink-0 rounded-2xl bg-glass-subtle border border-glass-subtle cursor-pointer hover:bg-white/10 transition-colors">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-[#D3F531]/20 border border-[#D3F531]/40 flex items-center justify-center overflow-hidden text-[#D3F531] font-bold text-sm">
             DO
          </div>
          <div className="absolute bottom-0 right-0 w-3 h-3 bg-[#D3F531] rounded-full border-2 border-[#15171a] shadow-[0_0_8px_rgba(211,245,49,0.6)]"></div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-bold text-text-primary truncate">David Owner</span>
          <span className="text-[10px] text-text-muted truncate">admin@fn.net</span>
        </div>
      </div>
    </aside>
  );
}
