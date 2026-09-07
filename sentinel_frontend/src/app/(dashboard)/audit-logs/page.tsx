"use client";

import React, { useState } from 'react';
import { useAuditLogs, useAuditStatistics } from '@/lib/queries';
import { Activity, ShieldAlert, Key, Settings, Download, Search, Filter } from 'lucide-react';
import { format } from 'date-fns';

export default function AuditLogsPage() {
  const { data: statsData, isLoading: isLoadingStats } = useAuditStatistics();
  const { data: logsData, isLoading: isLoadingLogs } = useAuditLogs(0, 100);
  
  const [searchTerm, setSearchTerm] = useState('');

  const stats = (statsData && typeof statsData === 'object')
    ? statsData 
    : { total_events: 0, failed_actions: 0, security_events: 0, administrative_actions: 0 };
  const logs = Array.isArray(logsData?.data) ? logsData.data : (Array.isArray(logsData) ? logsData : []);

  const filteredLogs = logs.filter((log: any) => 
    (log.action || '').toLowerCase().includes(searchTerm.toLowerCase()) || 
    (log.actor || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.category || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <Activity className="w-6 h-6 text-indigo-600" />
            Audit Ledger
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Enterprise event-sourcing and activity timeline.
          </p>
        </div>
        <button className="btn btn-secondary text-xs px-4 h-9 flex items-center gap-2 font-semibold">
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Events" value={stats.total_events} desc="All recorded actions" isLoading={isLoadingStats} />
        <StatCard title="Security Events" value={stats.security_events} desc="Risk and policy actions" isLoading={isLoadingStats} />
        <StatCard title="Administrative" value={stats.administrative_actions} desc="Configuration changes" isLoading={isLoadingStats} />
        <StatCard title="Failed Actions" value={stats.failed_actions} desc="Blocked or errored" isLoading={isLoadingStats} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by actor, action, or category..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn btn-secondary text-xs px-4 h-9 flex items-center gap-2 font-semibold">
            <Filter className="w-4 h-4" />
            Advanced Filters
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Timestamp</th>
                <th className="p-4">Actor</th>
                <th className="p-4">Action</th>
                <th className="p-4">Category</th>
                <th className="p-4">Severity</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoadingLogs ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="h-4 w-32 bg-slate-200 rounded"></div>
                      <div className="text-sm">Loading audit events...</div>
                    </div>
                  </td>
                </tr>
              ) : filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                        <Activity className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No audit logs found</p>
                      <p className="text-xs text-slate-500">Adjust your search filters and try again.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log: any) => (
                  <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4 text-xs text-slate-500 whitespace-nowrap font-medium">
                      {log.created_at ? format(new Date(log.created_at), 'MMM d, yyyy HH:mm:ss') : 'N/A'}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded bg-slate-100 border border-slate-200 flex items-center justify-center text-[10px] font-bold text-slate-600">
                          {(log.actor || 'N/A').substring(0,2).toUpperCase()}
                        </div>
                        <span className="font-semibold text-slate-900">{log.actor || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="p-4 text-xs font-semibold text-slate-600 font-mono">
                      {log.action}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                        {log.category}
                      </span>
                    </td>
                    <td className="p-4">
                      <SeverityBadge severity={log.severity} />
                    </td>
                    <td className="p-4">
                      <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${
                        log.status === 'Success' 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-100' 
                          : 'bg-rose-50 text-rose-700 border-rose-100'
                      }`}>
                        {log.status}
                      </span>
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

function StatCard({ title, value, desc, isLoading }: any) {
  const formattedValue = (value !== undefined && value !== null) 
    ? (typeof value === 'number' ? value.toLocaleString() : String(value)) 
    : '0';

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-2 hover:border-slate-300 transition-all">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</span>
      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-8 w-16 bg-slate-100 rounded animate-pulse"></div>
        ) : (
          <div className="text-2xl font-[family-name:var(--font-jakarta)] font-bold text-slate-900">{formattedValue}</div>
        )}
      </div>
      <span className="text-xs text-slate-500">{desc}</span>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, string> = {
    'Info': 'bg-blue-50 text-blue-700 border-blue-100',
    'Warning': 'bg-amber-50 text-amber-700 border-amber-100',
    'Critical': 'bg-rose-50 text-rose-700 border-rose-100',
  };
  
  const style = styles[severity] || styles['Info'];
  
  return (
    <span className={`inline-flex px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${style}`}>
      {severity}
    </span>
  );
}
