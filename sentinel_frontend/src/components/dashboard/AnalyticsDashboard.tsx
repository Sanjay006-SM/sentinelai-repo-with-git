"use client";

import { motion } from "framer-motion";
import { Activity, PieChart as PieChartIcon, Cloud, Info } from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";

// Mock Data for Risk Over Time
const riskOverTimeData = [
  { time: "00:00", critical: 2, high: 5, medium: 12 },
  { time: "04:00", critical: 3, high: 7, medium: 15 },
  { time: "08:00", critical: 1, high: 4, medium: 10 },
  { time: "12:00", critical: 4, high: 8, medium: 18 },
  { time: "16:00", critical: 2, high: 6, medium: 14 },
  { time: "20:00", critical: 0, high: 3, medium: 9 },
  { time: "24:00", critical: 1, high: 5, medium: 11 },
];

// Mock Data for Identities by Provider
const providerData = [
  { name: "AWS", value: 1240, color: "#f97316" }, // Orange
  { name: "Azure", value: 842, color: "#0ea5e9" }, // Blue
  { name: "GCP", value: 430, color: "#22c55e" }, // Green
  { name: "Kubernetes", value: 610, color: "#8b5cf6" }, // Purple
];

const totalIdentities = providerData.reduce((acc, curr) => acc + curr.value, 0);

export default function AnalyticsDashboard() {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-6 w-full"
    >
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-lg font-semibold text-text-primary">Analytics</h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Risk Over Time (Stacked Area Chart) */}
        <motion.div 
          variants={cardVariants}
          className="glass-panel flex flex-col p-6 h-96"
        >
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md flex items-center justify-center bg-glass-subtle border-glass-subtle border">
                <Activity className="w-4 h-4 text-text-muted" />
              </div>
              <h3 className="font-semibold text-text-primary">Risk Over Time</h3>
            </div>
            
            {/* Legend */}
            <div className="flex items-center gap-4 text-xs font-medium text-text-muted">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-critical"></span> Critical
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-high"></span> High
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-medium"></span> Medium
              </div>
            </div>
          </div>
          
          <div className="flex-1 w-full -ml-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={riskOverTimeData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCritical" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-critical)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-critical)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorHigh" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-high)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-high)" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorMedium" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--color-medium)" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="var(--color-medium)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(203,213,225,0.40)" vertical={false} />
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-glass, rgba(0,0,0,0.8))', backdropFilter: 'blur(12px)', borderRadius: '10px', border: "1px solid var(--color-border)", color: 'var(--color-text-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                  itemStyle={{ color: 'var(--color-text-primary)' }}
                />
                <Area type="monotone" dataKey="critical" stackId="1" stroke="var(--color-critical)" fillOpacity={1} fill="url(#colorCritical)" />
                <Area type="monotone" dataKey="high" stackId="1" stroke="var(--color-high)" fillOpacity={1} fill="url(#colorHigh)" />
                <Area type="monotone" dataKey="medium" stackId="1" stroke="var(--color-medium)" fillOpacity={1} fill="url(#colorMedium)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Identities by Provider (Donut Chart) */}
        <motion.div 
          variants={cardVariants}
          className="glass-panel flex flex-col p-6 h-96 relative"
        >
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 rounded-md flex items-center justify-center bg-glass-subtle border-glass-subtle border">
              <PieChartIcon className="w-4 h-4 text-text-muted" />
            </div>
            <h3 className="font-semibold text-text-primary">Identities by Provider</h3>
          </div>
          
          <div className="flex-1 flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={providerData}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {providerData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip 
                  contentStyle={{ backgroundColor: 'var(--color-bg-glass, rgba(0,0,0,0.8))', backdropFilter: 'blur(12px)', borderRadius: '10px', border: "1px solid var(--color-border)", color: 'var(--color-text-primary)', boxShadow: '0 4px 16px rgba(0,0,0,0.2)' }}
                  itemStyle={{ color: 'var(--color-text-primary)' }}
                />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Total Center Text */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-3xl font-bold text-text-primary leading-none">{totalIdentities.toLocaleString()}</span>
              <span className="text-xs text-text-muted uppercase tracking-wider mt-1">Total</span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
