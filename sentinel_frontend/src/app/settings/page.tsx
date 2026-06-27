"use client";

import { useState } from "react";
import { useGlobalStore } from "@/lib/store";
import { Settings, Cloud, Shield, Bell, Key, Users, CreditCard, CheckCircle2, Server, GitBranch, Lock, Activity, Save, Loader2, Check } from "lucide-react";

const CATEGORIES = [
  { id: "general", name: "General", icon: <Settings className="w-4 h-4" /> },
  { id: "connections", name: "Cloud Connections", icon: <Cloud className="w-4 h-4" /> },
  { id: "notifications", name: "Notifications", icon: <Bell className="w-4 h-4" /> },
  { id: "risk", name: "Risk Engine", icon: <Activity className="w-4 h-4" /> },
  { id: "api", name: "API Keys", icon: <Key className="w-4 h-4" /> },
  { id: "team", name: "Team & Access", icon: <Users className="w-4 h-4" /> },
  { id: "billing", name: "Billing", icon: <CreditCard className="w-4 h-4" /> },
];

const CONNECTIONS = [
  { id: "aws", name: "AWS", type: "Accounts", count: 18, lastSync: "2m ago", icon: <Cloud className="w-6 h-6 text-[#f97316]" /> },
  { id: "gcp", name: "GCP", type: "Projects", count: 12, lastSync: "5m ago", icon: <Server className="w-6 h-6 text-[#3b82f6]" /> },
  { id: "azure", name: "Azure", type: "Subscriptions", count: 8, lastSync: "3m ago", icon: <Cloud className="w-6 h-6 text-[#06b6d4]" /> },
  { id: "github", name: "GitHub", type: "Repos", count: 47, lastSync: "1h ago", icon: <GitBranch className="w-6 h-6 text-[#a855f7]" /> },
  { id: "vault", name: "Vault", type: "Mounts", count: 6, lastSync: "10m ago", icon: <Lock className="w-6 h-6 text-[#6366f1]" /> },
];

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general");
  const theme = useGlobalStore((state) => state.theme);
  const setTheme = useGlobalStore((state) => state.setTheme);
  const [orgName, setOrgName] = useState("Acme Corp");
  const [timezone, setTimezone] = useState("UTC (Coordinated Universal Time)");
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 2000);
    }, 800);
  };

  const [toggles, setToggles] = useState({
    remediate: true,
    alerts: true,
    aiScoring: true,
    anomalyUpdates: false,
  });

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col md:flex-row gap-8">
      
      {/* Left Navigation */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-4">Settings</h1>
        
        <div className="flex flex-col gap-1">
          {CATEGORIES.map(category => (
            <button
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === category.id 
                  ? "bg-glass-subtle text-text-primary border border-glass-active shadow-sm" 
                  : "text-text-muted border border-transparent hover:bg-slate-100/50 hover:text-[#e2e8f0]"
              }`}
            >
              {category.icon}
              {category.name}
            </button>
          ))}
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 bg-transparent border border-glass-subtle rounded-xl shadow-lg p-6 min-h-[600px]">
        
        {/* GENERAL SECTION */}
        {activeTab === "general" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-8">
            <div className="border-b border-glass-subtle border pb-4">
              <h2 className="text-xl font-bold text-text-primary">General Settings</h2>
              <p className="text-sm text-text-muted mt-1">Manage your organization details and global preferences.</p>
            </div>
            
            <div className="flex flex-col gap-6 max-w-xl">
              {/* Organization Name */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">Organization Name</label>
                <input 
                  type="text" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-glass-subtle border border-glass-subtle hover:border-glass-active focus:border-[#D3F531] focus:ring-1 focus:ring-[#D3F531] outline-none rounded-lg px-4 py-2.5 text-sm text-text-primary transition-all"
                />
              </div>

              {/* Timezone */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">Timezone</label>
                <select 
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full bg-glass-subtle border border-glass-subtle hover:border-glass-active focus:border-[#D3F531] focus:ring-1 focus:ring-[#D3F531] outline-none rounded-lg px-4 py-2.5 text-sm text-text-primary transition-all"
                >
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                </select>
              </div>

              {/* Theme Toggle */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-text-secondary">Theme</label>
                <div className="flex bg-glass-subtle p-1 border border-glass-subtle rounded-lg">
                  <button 
                    onClick={() => setTheme("Dark")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${theme === "Dark" ? "bg-[#D3F531] text-black font-bold shadow-sm" : "text-text-muted hover:text-white"}`}
                  >
                    Dark
                  </button>
                  <button 
                    onClick={() => setTheme("Light")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${theme === "Light" ? "bg-[#D3F531] text-black font-bold shadow-sm" : "text-text-muted hover:text-white"}`}
                  >
                    Light
                  </button>
                  <button 
                    onClick={() => setTheme("System")}
                    className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${theme === "System" ? "bg-[#D3F531] text-black font-bold shadow-sm" : "text-text-muted hover:text-white"}`}
                  >
                    System
                  </button>
                </div>
              </div>

              <div className="pt-4">
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="px-6 py-2.5 bg-[#D3F531] hover:bg-[#bde026] text-black font-bold rounded-lg shadow-[0_0_20px_rgba(211,245,49,0.3)] transition-all flex items-center justify-center gap-2 min-w-[160px] disabled:opacity-80"
                >
                  {isSaving ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                  ) : saveSuccess ? (
                    <><Check className="w-4 h-4" /> Saved Successfully!</>
                  ) : (
                    <><Save className="w-4 h-4" /> Save Changes</>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* CLOUD CONNECTIONS SECTION */}
        {activeTab === "connections" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-8">
            <div className="border-b border-glass-subtle border pb-4 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-text-primary">Cloud Connections</h2>
                <p className="text-sm text-text-muted mt-1">Manage active integrations with cloud providers and tools.</p>
              </div>
              <button className="btn btn-primary text-xs px-4">Add Connection</button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {CONNECTIONS.map(conn => (
                <div key={conn.id} className="bg-glass-subtle border border-glass-subtle hover:border-glass-active rounded-xl p-5 flex flex-col gap-4 transition-colors group">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-glass-subtle border border-glass-subtle rounded-lg">
                        {conn.icon}
                      </div>
                      <h3 className="font-bold text-text-primary text-lg">{conn.name}</h3>
                    </div>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[10px] font-bold border border-[#22c55e]/20 bg-green-100/50 text-[#22c55e]">
                      <CheckCircle2 className="w-3.5 h-3.5" /> CONNECTED
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs text-text-muted font-semibold uppercase">{conn.type}</span>
                      <span className="text-sm font-mono text-text-primary font-bold">{conn.count}</span>
                    </div>
                    <div className="flex flex-col gap-1 text-right">
                      <span className="text-xs text-text-muted font-semibold uppercase">Last Sync</span>
                      <span className="text-sm font-mono text-[#06b6d4]">{conn.lastSync}</span>
                    </div>
                  </div>

                  <div className="mt-2 pt-4 border-t border-glass-subtle border flex justify-end">
                    <button className="text-xs font-semibold text-[#ef4444] hover:bg-[#ef4444]/10 px-3 py-1.5 rounded-md transition-colors opacity-80 group-hover:opacity-100">
                      Disconnect
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* RISK ENGINE SECTION */}
        {activeTab === "risk" && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 flex flex-col gap-8">
            <div className="border-b border-glass-subtle border pb-4">
              <h2 className="text-xl font-bold text-text-primary">Risk Engine Configuration</h2>
              <p className="text-sm text-text-muted mt-1">Fine-tune detection rules, auto-remediation, and scoring weights.</p>
            </div>
            
            <div className="flex flex-col gap-8 max-w-2xl">
              
              {/* Toggles */}
              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Engine Features</h3>
                
                <div className="flex items-center justify-between p-4 bg-glass-subtle border border-glass-subtle rounded-xl">
                  <div>
                    <h4 className="font-bold text-text-primary">Auto-remediate stale identities</h4>
                    <p className="text-xs text-text-muted mt-1">Automatically rotate or disable keys older than 90 days.</p>
                  </div>
                  <button 
                    onClick={() => setToggles({...toggles, remediate: !toggles.remediate})}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${toggles.remediate ? 'bg-[#6366f1]' : 'bg-glass-subtle'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-transparent absolute transition-transform ${toggles.remediate ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-glass-subtle border border-glass-subtle rounded-xl">
                  <div>
                    <h4 className="font-bold text-text-primary">Alert on new critical paths</h4>
                    <p className="text-xs text-text-muted mt-1">Send immediate push alerts when new blast radius exposures are found.</p>
                  </div>
                  <button 
                    onClick={() => setToggles({...toggles, alerts: !toggles.alerts})}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${toggles.alerts ? 'bg-[#6366f1]' : 'bg-glass-subtle'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-transparent absolute transition-transform ${toggles.alerts ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-glass-subtle border border-glass-subtle rounded-xl">
                  <div>
                    <h4 className="font-bold text-text-primary">AI-assisted scoring</h4>
                    <p className="text-xs text-text-muted mt-1">Use GPT-Sec reasoning to adjust risk scores based on context.</p>
                  </div>
                  <button 
                    onClick={() => setToggles({...toggles, aiScoring: !toggles.aiScoring})}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${toggles.aiScoring ? 'bg-[#6366f1]' : 'bg-glass-subtle'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-transparent absolute transition-transform ${toggles.aiScoring ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 bg-glass-subtle border border-glass-subtle rounded-xl">
                  <div>
                    <h4 className="font-bold text-text-primary">Anomaly detection baseline updates</h4>
                    <p className="text-xs text-text-muted mt-1">Continuously retrain baseline models based on accepted deviations.</p>
                  </div>
                  <button 
                    onClick={() => setToggles({...toggles, anomalyUpdates: !toggles.anomalyUpdates})}
                    className={`w-12 h-6 rounded-full transition-colors relative flex items-center ${toggles.anomalyUpdates ? 'bg-[#6366f1]' : 'bg-glass-subtle'}`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-transparent absolute transition-transform ${toggles.anomalyUpdates ? 'translate-x-7' : 'translate-x-1'}`} />
                  </button>
                </div>
              </div>

              {/* Thresholds */}
              <div className="flex flex-col gap-4 mt-4">
                <h3 className="text-sm font-bold text-text-secondary uppercase tracking-wider mb-2">Risk Thresholds</h3>
                
                <div className="flex flex-col gap-6 p-6 bg-glass-subtle border border-glass-subtle rounded-xl">
                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-[#ef4444]">Critical Threshold</label>
                      <span className="text-xs font-mono text-text-primary bg-glass-subtle px-2 py-1 rounded">80+</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="80" className="w-full accent-[#ef4444] h-1.5 bg-glass-subtle rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-[#f97316]">High Threshold</label>
                      <span className="text-xs font-mono text-text-primary bg-glass-subtle px-2 py-1 rounded">60-79</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="60" className="w-full accent-[#f97316] h-1.5 bg-glass-subtle rounded-lg appearance-none cursor-pointer" />
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-bold text-[#fbbf24]">Medium Threshold</label>
                      <span className="text-xs font-mono text-text-primary bg-glass-subtle px-2 py-1 rounded">40-59</span>
                    </div>
                    <input type="range" min="0" max="100" defaultValue="40" className="w-full accent-[#fbbf24] h-1.5 bg-glass-subtle rounded-lg appearance-none cursor-pointer" />
                  </div>
                </div>
              </div>

            </div>
          </div>
        )}

        {/* PLACEHOLDERS for other tabs */}
        {["notifications", "api", "team", "billing"].includes(activeTab) && (
          <div className="animate-in fade-in flex items-center justify-center h-full min-h-[400px]">
            <div className="text-center">
              <Settings className="w-12 h-12 text-text-primary mx-auto mb-4" />
              <p className="text-text-muted">This section is not configured in the current demo.</p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
