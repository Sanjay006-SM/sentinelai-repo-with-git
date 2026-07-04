"use client";

import React, { useState } from 'react';
import { useReports, useReportStatistics, useGenerateReport } from '@/lib/queries';
import { FileText, Calendar, Download, Plus, Search, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function ReportsPage() {
  const { data: statsData, isLoading: isLoadingStats } = useReportStatistics();
  const { data: reportsData, isLoading: isLoadingReports } = useReports(0, 100);
  const generateReport = useGenerateReport();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const stats = statsData || { total_reports: 0, reports_generated: 0, scheduled_reports: 0, failed_reports: 0 };
  const reports = reportsData?.data || [];

  const filteredReports = reports.filter((report: any) => 
    report.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    report.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGenerate = async (type: string, name: string) => {
    setIsGenerating(true);
    setError(null);
    try {
      await generateReport.mutateAsync({
        name,
        report_type: type,
        filters: {}
      });
    } catch (err: any) {
      setError(err.message || 'Unable to generate report.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex flex-col gap-8 pb-12">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2.5">
            <FileText className="w-6 h-6 text-indigo-600" />
            Reports & Compliance
          </h1>
          <p className="text-slate-500 mt-1 text-sm">
            Generate and schedule enterprise risk and compliance reports.
          </p>
        </div>
        <button 
          onClick={() => handleGenerate('Upload Analysis', 'Latest Upload Report')}
          disabled={isGenerating}
          className="btn btn-primary text-xs px-4 h-9 flex items-center gap-2 font-semibold disabled:opacity-50"
        >
          {isGenerating ? <Clock className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
          Generate Report
        </button>
      </div>
      
      {error && (
        <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-lg flex items-center gap-3 text-sm font-medium">
          <AlertCircle className="w-5 h-5 text-rose-500" />
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard title="Total Reports" value={stats.total_reports} desc="Historical records" isLoading={isLoadingStats} />
        <StatCard title="Generated" value={stats.reports_generated} desc="Successfully generated" isLoading={isLoadingStats} />
        <StatCard title="Scheduled" value={stats.scheduled_reports} desc="Automated exports" isLoading={isLoadingStats} />
        <StatCard title="Failed" value={stats.failed_reports} desc="Errors in generation" isLoading={isLoadingStats} />
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col">
        <div className="p-4 border-b border-slate-100 bg-slate-50 flex flex-col sm:flex-row gap-4 items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search reports by name or type..."
              className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition-all shadow-sm"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                <th className="p-4">Report Name</th>
                <th className="p-4">Type</th>
                <th className="p-4">Status</th>
                <th className="p-4">Generated At</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {isLoadingReports ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-500">
                    <div className="animate-pulse flex flex-col items-center gap-2">
                      <div className="h-4 w-32 bg-slate-200 rounded"></div>
                      <div className="text-sm">Loading reports...</div>
                    </div>
                  </td>
                </tr>
              ) : filteredReports.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                        <FileText className="w-6 h-6 text-slate-400" />
                      </div>
                      <p className="text-sm font-semibold text-slate-700">No reports generated</p>
                      <p className="text-xs text-slate-500">Click the button below to generate your first report.</p>
                      <button 
                        onClick={() => handleGenerate('Initial Security Posture', 'First Run Report')}
                        className="text-indigo-600 hover:text-indigo-700 text-sm mt-2 font-bold"
                      >
                        Generate Report &rarr;
                      </button>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredReports.map((report: any) => (
                  <tr key={report.id} className="hover:bg-slate-50 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center">
                          <FileText className="w-4 h-4 text-slate-500" />
                        </div>
                        <span className="font-semibold text-slate-900">{report.name}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="inline-flex px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 border border-slate-200 uppercase">
                        {report.type}
                      </span>
                    </td>
                    <td className="p-4">
                      <StatusBadge status={report.status} />
                    </td>
                    <td className="p-4 text-xs font-medium text-slate-500">
                      {report.created_at ? format(new Date(report.created_at), 'MMM d, yyyy HH:mm') : 'N/A'}
                    </td>
                    <td className="p-4 text-right">
                      {report.status === 'COMPLETED' && (
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={async () => {
                              try {
                                setError(null);
                                const api = (await import('@/lib/api')).default;
                                await api.download(`/reports/${report.id}/download`, `report-${report.name.replace(/\s+/g, '_')}.pdf`);
                              } catch (err: any) {
                                setError(err.message || 'Download unavailable.');
                              }
                            }}
                            className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-white hover:bg-slate-50 text-slate-600 transition-colors border border-slate-200 shadow-sm" 
                            title="Download PDF Report"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                        </div>
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

function StatCard({ title, value, desc, isLoading }: any) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex flex-col gap-2 hover:border-slate-300 transition-all">
      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{title}</span>
      <div className="flex items-baseline gap-2">
        {isLoading ? (
          <div className="h-8 w-16 bg-slate-100 rounded animate-pulse"></div>
        ) : (
          <div className="text-2xl font-[family-name:var(--font-jakarta)] font-bold text-slate-900">{value.toLocaleString()}</div>
        )}
      </div>
      <span className="text-xs text-slate-500">{desc}</span>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    'COMPLETED': 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'PENDING': 'bg-slate-50 text-slate-600 border-slate-200',
    'GENERATING': 'bg-blue-50 text-blue-700 border-blue-100',
    'FAILED': 'bg-rose-50 text-rose-700 border-rose-100',
  };
  
  const style = styles[status] || styles['PENDING'];
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase border ${style}`}>
      {status === 'GENERATING' && <Clock className="w-3 h-3 animate-spin text-blue-600" />}
      {status === 'COMPLETED' && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
      {status}
    </span>
  );
}
