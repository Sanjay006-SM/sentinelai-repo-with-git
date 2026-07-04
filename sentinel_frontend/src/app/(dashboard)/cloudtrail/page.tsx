"use client";

import { useState, useEffect } from "react";
import { Search, ChevronDown, Terminal, ShieldAlert, Cloud, HelpCircle, CheckCircle2 } from "lucide-react";
import CloudTrailDropzone from "@/components/dashboard/CloudTrailDropzone";
import { motion, AnimatePresence } from "framer-motion";
import { useRecentEvents } from "@/lib/queries";

export default function DataSourcesPage() {
  const [activeTab, setActiveTab] = useState<"aws" | "azure" | "gcp">("aws");
  const [searchQuery, setSearchQuery] = useState("");
  const { data: events, isLoading } = useRecentEvents();

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col gap-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
            <Terminal className="w-6 h-6 text-indigo-600" />
            Data Sources
          </h1>
          <p className="text-slate-500 mt-1 text-sm">Stream, upload, and connect log audits to identify anomalous access paths.</p>
        </div>
      </div>

      {/* Provider Tabs */}
      <div className="flex border-b border-slate-200 gap-6">
        <button
          onClick={() => setActiveTab("aws")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "aws" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Amazon Web Services (AWS)
        </button>
        <button
          onClick={() => setActiveTab("azure")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "azure" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Microsoft Azure (Coming Soon)
        </button>
        <button
          onClick={() => setActiveTab("gcp")}
          className={`pb-3 text-sm font-semibold border-b-2 transition-all ${
            activeTab === "gcp" 
              ? "border-indigo-600 text-indigo-600" 
              : "border-transparent text-slate-500 hover:text-slate-900"
          }`}
        >
          Google Cloud (Coming Soon)
        </button>
      </div>

      {activeTab === "aws" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          {/* Dropzone & connection details */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            
            {/* Ingestion Dropzone */}
            <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Cloud className="w-4.5 h-4.5 text-indigo-600" />
                Demo Mode: Ingest CloudTrail JSON File
              </h2>
              <p className="text-xs text-slate-500">
                Upload static log exports manually. We construct graphs and evaluate risk scores instantly.
              </p>
              <CloudTrailDropzone />
            </div>

            {/* Live AWS Connect — fully implemented */}
            <div className="bg-white border border-indigo-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Cloud className="w-4.5 h-4.5 text-indigo-600" />
                  Live Sync: Connect AWS Account
                </h2>
                <span className="bg-emerald-100 border border-emerald-200 text-emerald-700 px-2.5 py-0.5 rounded text-[10px] font-bold">
                  AVAILABLE
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Configure automated IAM read-only cross-account access to stream CloudTrail events live into SentinelAI.
              </p>
              <a href="/integrations/aws" className="btn btn-primary text-xs w-fit h-9 flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5" /> Configure Live AWS Integration
              </a>
            </div>

          </div>

          {/* Activity Logs details sidebar */}
          <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col gap-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HelpCircle className="w-4.5 h-4.5 text-indigo-600" />
              Ingestion Details
            </h2>
            <div className="flex flex-col gap-3 text-xs leading-normal">
              <span className="text-slate-500 font-medium">No ingestion statistics available.</span>
            </div>
          </div>
        </div>
      )}

      {/* Stream activity logs table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50">
          <h2 className="text-sm font-bold text-slate-800">Telemetry Event Activity Stream</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold uppercase tracking-wider text-slate-500">
                <th className="p-4">Time</th>
                <th className="p-4">Event Action</th>
                <th className="p-4">Identity (ARN)</th>
                <th className="p-4">Source IP</th>
                <th className="p-4">Status / Risk</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm font-mono text-slate-600">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">Loading events...</td>
                </tr>
              ) : !events || events.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">No events ingested yet.</td>
                </tr>
              ) : (
                events.map((ev: any) => (
                  <tr key={ev.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-xs text-slate-400 whitespace-nowrap">
                      {new Date(ev.event_time).toLocaleString()}
                    </td>
                    <td className="p-4 font-semibold text-slate-900">{ev.event}</td>
                    <td className="p-4 text-xs text-slate-500 truncate max-w-[250px]">{ev.user}</td>
                    <td className="p-4 text-xs text-slate-500">{ev.source}</td>
                    <td className="p-4 flex flex-col gap-1 items-start">
                      <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold border ${
                        ev.status === "Success" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-100" 
                          : "bg-rose-50 text-rose-700 border-rose-100"
                      }`}>
                        {ev.status}
                      </span>
                      {ev.isAnomaly && (
                        <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold border bg-amber-50 text-amber-700 border-amber-100">
                          {ev.anomalyReason}
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
