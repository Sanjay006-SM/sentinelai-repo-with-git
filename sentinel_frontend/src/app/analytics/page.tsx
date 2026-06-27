"use client";

import { useState } from "react";
import { 
  LineChart, Line, PieChart, Pie, Cell, BarChart, Bar, 
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";
import { TrendingDown, TrendingUp, BarChart3 } from "lucide-react";

// --- Mock Data ---
const LINE_DATA = Array.from({ length: 30 }, (_, i) => ({
  day: `Day ${i + 1}`,
  detections: Math.floor(Math.random() * 50) + 20 + (i > 15 ? 20 : 0),
  remediations: Math.floor(Math.random() * 45) + 15 + (i > 16 ? 25 : 0),
}));

const PIE_DATA = [
  { name: 'Workload', value: 48, fill: '#06b6d4' },
  { name: 'Human-tied', value: 32, fill: '#6366f1' },
  { name: 'External', value: 12, fill: '#f97316' },
  { name: 'Unknown', value: 8, fill: '#475569' },
];

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const HEATMAP_DATA = DAYS.map(day => ({
  day,
  hours: Array.from({ length: 24 }, (_, h) => ({
    hour: h,
    value: Math.floor(Math.random() * 1000), 
  }))
}));

const BAR_DATA = [
  { name: 'SOC2', value: 96 },
  { name: 'ISO27001', value: 92 },
  { name: 'PCI', value: 88 },
  { name: 'HIPAA', value: 81 },
  { name: 'FedRAMP', value: 74 },
];

const ACCOUNTS_DATA = [
  { name: 'prod-payments-aws', last: 42, current: 28, delta: -14 },
  { name: 'k8s-cluster-admin', last: 55, current: 78, delta: 23 },
  { name: 'dev-sandbox-gcp', last: 81, current: 40, delta: -41 },
  { name: 'azure-databricks', last: 33, current: 45, delta: 12 },
  { name: 'ci-cd-runners', last: 60, current: 62, delta: 2 },
];

// Helper for heatmap colors (low=dark green, high=bright red)
const getHeatmapColor = (val: number) => {
  if (val < 200) return '#064e3b'; // very low
  if (val < 400) return '#047857'; // low
  if (val < 600) return '#b45309'; // medium
  if (val < 800) return '#c2410c'; // high
  return '#ef4444'; // very high
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-glass-subtle border border-glass-active rounded-lg p-3 shadow-xl">
        <p className="text-text-primary font-bold text-sm mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }}></div>
            <span className="text-text-muted capitalize">{entry.name}:</span>
            <span className="text-text-primary font-bold">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("30d");

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            <BarChart3 className="w-6 h-6 text-primary" />
            Analytics
          </h1>
          <p className="text-text-muted mt-1 text-sm">Trends, heatmaps, and posture across your machine identity surface</p>
        </div>
        
        {/* Time Range Selector */}
        <div className="flex bg-transparent p-1 border border-glass-subtle rounded-lg">
          {['7d', '30d', '90d'].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all ${
                timeRange === range
                  ? "bg-[#D3F531] text-black font-bold shadow-md"
                  : "text-text-muted hover:text-white"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* 1. Detection vs Remediation (Full width) */}
        <div className="xl:col-span-2 bg-transparent border border-glass-subtle rounded-xl p-5 shadow-lg flex flex-col">
          <h2 className="text-text-primary font-bold mb-6">Detection vs Remediation</h2>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={LINE_DATA} margin={{ top: 5, right: 20, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" vertical={false} />
                <XAxis dataKey="day" stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(val) => val.replace('Day ', '')} />
                <YAxis stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Line type="monotone" dataKey="detections" name="Detections" stroke="#ef4444" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#ef4444', stroke: '#0f1318', strokeWidth: 2 }} />
                <Line type="monotone" dataKey="remediations" name="Remediations" stroke="#22c55e" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: '#22c55e', stroke: '#0f1318', strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 2. Identity Composition */}
        <div className="bg-transparent border border-glass-subtle rounded-xl p-5 shadow-lg flex flex-col">
          <h2 className="text-text-primary font-bold mb-2">Identity Composition</h2>
          <div className="h-[250px] w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={PIE_DATA}
                  cx="50%"
                  cy="50%"
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {PIE_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            {/* Center Total */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-text-muted text-xs font-bold uppercase tracking-wider">Total</span>
              <span className="text-3xl font-bold text-text-primary">9.1k</span>
            </div>
          </div>
          {/* Legend */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 mt-4">
            {PIE_DATA.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: item.fill }}></div>
                <span className="text-xs text-text-muted">{item.name}</span>
                <span className="text-xs font-bold text-text-primary">{item.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Activity Heatmap */}
        <div className="bg-transparent border border-glass-subtle rounded-xl p-5 shadow-lg flex flex-col">
          <h2 className="text-text-primary font-bold mb-4">Activity Heatmap</h2>
          <div className="flex-1 flex flex-col justify-center">
            <div className="flex gap-2">
              {/* Y Axis Labels */}
              <div className="flex flex-col justify-between py-1 pr-2">
                {DAYS.map(d => <div key={d} className="text-[10px] text-text-muted font-mono leading-none">{d}</div>)}
              </div>
              
              {/* Grid */}
              <div className="flex-1 flex flex-col gap-1">
                {HEATMAP_DATA.map((row) => (
                  <div key={row.day} className="flex gap-1 flex-1">
                    {row.hours.map((col) => (
                      <div 
                        key={`${row.day}-${col.hour}`} 
                        className="flex-1 rounded-sm group relative"
                        style={{ backgroundColor: getHeatmapColor(col.value) }}
                      >
                        {/* Tooltip */}
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block z-10 w-max bg-glass-subtle border border-glass-active px-2 py-1 rounded text-xs text-text-primary shadow-xl pointer-events-none">
                          {row.day} {col.hour}:00 — <span className="font-bold text-[#f97316]">{col.value}</span> privileged actions
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
            
            {/* X Axis Labels */}
            <div className="flex justify-between pl-8 pr-2 mt-2">
              <span className="text-[10px] text-text-muted font-mono">00:00</span>
              <span className="text-[10px] text-text-muted font-mono">12:00</span>
              <span className="text-[10px] text-text-muted font-mono">23:00</span>
            </div>
          </div>
        </div>

        {/* 4. Compliance Posture */}
        <div className="bg-transparent border border-glass-subtle rounded-xl p-5 shadow-lg flex flex-col">
          <h2 className="text-text-primary font-bold mb-6">Compliance Posture</h2>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={BAR_DATA} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border-subtle)" horizontal={false} />
                <XAxis type="number" domain={[0, 100]} stroke="var(--color-text-muted)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis dataKey="name" type="category" stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip cursor={{ fill: '#151a22' }} content={<CustomTooltip />} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {BAR_DATA.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={`url(#colorGradient)`} />
                  ))}
                </Bar>
                <defs>
                  <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 5. Top Accounts by Risk Delta */}
        <div className="bg-transparent border border-glass-subtle rounded-xl flex flex-col shadow-lg overflow-hidden">
          <div className="p-5 border-b border-glass-subtle border">
            <h2 className="text-text-primary font-bold">Top Accounts by Risk Delta</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-glass-subtle text-text-muted text-xs uppercase tracking-wider font-bold">
                <tr>
                  <th className="p-4 font-semibold">Account Name</th>
                  <th className="p-4 font-semibold text-center">Last Week</th>
                  <th className="p-4 font-semibold text-center">This Week</th>
                  <th className="p-4 font-semibold text-right">Delta</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-glass-subtle">
                {ACCOUNTS_DATA.map((acc, i) => (
                  <tr key={i} className="hover:bg-white/10 transition-colors">
                    <td className="p-4 font-mono text-sm text-[#06b6d4]">{acc.name}</td>
                    <td className="p-4 text-center font-bold text-text-muted">{acc.last}</td>
                    <td className="p-4 text-center font-bold text-text-primary">{acc.current}</td>
                    <td className="p-4 text-right">
                      <div className={`inline-flex items-center gap-1 font-bold ${acc.delta < 0 ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                        {acc.delta < 0 ? <TrendingDown className="w-4 h-4" /> : <TrendingUp className="w-4 h-4" />}
                        {Math.abs(acc.delta)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
