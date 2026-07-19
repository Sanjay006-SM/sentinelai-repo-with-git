"use client";

import { useState, useEffect } from "react";
import { Settings, Building2, Bell, Key, CreditCard, LayoutGrid, Sliders, CheckCircle2 } from "lucide-react";
import api from "@/lib/api";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState<"org" | "workspace" | "preferences" | "notifications" | "api" | "billing">("org");
  const [companyName, setCompanyName] = useState("");
  const [orgId, setOrgId] = useState("");
  const [timezone, setTimezone] = useState("UTC (Coordinated Universal Time)");
  const [workspaceName, setWorkspaceName] = useState("");
  const [workspaceEnv, setWorkspaceEnv] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrg = async () => {
      try {
        const org = await api.get('/organizations/me');
        setCompanyName(org.name || "");
        setOrgId(org.id || "");
        if (org.workspaces && org.workspaces.length > 0) {
          setWorkspaceName(org.workspaces[0].name);
          setWorkspaceEnv(org.workspaces[0].environment);
        }
      } catch (e) {
        console.error("Failed to fetch organization", e);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrg();
  }, []);

  const [toggles, setToggles] = useState({
    emailAlerts: true,
    slackAlerts: false,
    auditSync: true,
  });

  const saveOrg = async () => {
    try {
      await api.put('/organizations/me', { name: companyName });
      alert("Organization saved");
    } catch (e) {
      alert("Failed to save");
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col md:flex-row gap-8">

      {/* Left Navigation */}
      <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 mb-4">Settings</h1>

        <div className="flex flex-col gap-1">
          {[
            { id: "org", name: "Organization", icon: <Building2 className="w-4 h-4" />, disabled: false },
            { id: "workspace", name: "Workspace", icon: <LayoutGrid className="w-4 h-4" />, disabled: false },
            { id: "preferences", name: "Preferences", icon: <Sliders className="w-4 h-4" />, disabled: false },
            { id: "notifications", name: "Notifications", icon: <Bell className="w-4 h-4" />, disabled: true, label: "Coming Soon" },
            { id: "api", name: "API Config", icon: <Key className="w-4 h-4" />, disabled: true, label: "Coming Soon" },
            { id: "billing", name: "Billing", icon: <CreditCard className="w-4 h-4" />, disabled: true, label: "Coming Soon" },
          ].map(tab => (
            <button
              key={tab.id}
              disabled={tab.disabled}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-semibold transition-all relative ${activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 border-indigo-100"
                  : "text-slate-500 border border-transparent hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 disabled:hover:bg-transparent"
                }`}
            >
              {tab.icon}
              {tab.name}
              {tab.label && (
                <span className="absolute right-2 text-[8px] font-bold text-slate-400 uppercase tracking-wide">
                  {tab.label}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Right Content Panel */}
      <div className="flex-1 bg-white border border-slate-200 rounded-xl shadow-sm p-6 min-h-[500px]">

        {/* ORGANIZATION */}
        {activeTab === "org" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Organization Settings</h2>
              <p className="text-xs text-slate-500 mt-1">Configure company profiles and identity boundaries.</p>
            </div>

            <div className="flex flex-col gap-4 max-w-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Organization Name</label>
                <input
                  type="text"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="input-field h-10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Organization ID</label>
                <span className="text-xs font-mono font-bold bg-slate-50 border border-slate-100 p-2 rounded-lg text-slate-600">
                  {orgId || "Loading..."}
                </span>
              </div>
              <button onClick={saveOrg} className="btn btn-primary h-10 w-fit text-xs px-6 mt-2">
                Save Profile
              </button>
            </div>
          </div>
        )}

        {/* WORKSPACE */}
        {activeTab === "workspace" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Workspace Directory</h2>
              <p className="text-xs text-slate-500 mt-1">Isolate settings, dashboards, and role alerts.</p>
            </div>

            <div className="flex flex-col gap-4 max-w-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Workspace Name</label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="input-field h-10 text-sm"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Environment Mode</label>
                <span className="text-xs font-bold text-indigo-700 bg-indigo-50 border border-indigo-100 px-3 py-1 rounded w-fit uppercase">
                  {workspaceEnv || "Loading..."}
                </span>
              </div>
              <button className="btn btn-primary h-10 w-fit text-xs px-6 mt-2">
                Save Workspace
              </button>
            </div>
          </div>
        )}

        {/* PREFERENCES */}
        {activeTab === "preferences" && (
          <div className="flex flex-col gap-6">
            <div className="border-b border-slate-100 pb-4">
              <h2 className="text-lg font-bold text-slate-900">Global Preferences</h2>
              <p className="text-xs text-slate-500 mt-1">Configure timezone and scoring variables.</p>
            </div>

            <div className="flex flex-col gap-4 max-w-md">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Preferred Timezone</label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="input-field h-10 text-sm"
                >
                  <option>UTC (Coordinated Universal Time)</option>
                  <option>EST (Eastern Standard Time)</option>
                  <option>PST (Pacific Standard Time)</option>
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-700">Theme Option</label>
                <span className="text-xs font-semibold text-slate-500 bg-slate-50 p-3 rounded-lg border border-slate-100">
                  Enforced: Light SaaS Console
                </span>
              </div>
              <button className="btn btn-primary h-10 w-fit text-xs px-6 mt-2">
                Save Preferences
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
