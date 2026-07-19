"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  GitBranch,
  Download,
  BrainCircuit,
  Search,
  UploadCloud,
  X,
  FileJson,
  Loader2,
  CheckCircle2,
  FileText,
  ShieldCheck,
  Activity,
  Map
} from "lucide-react";
import { useUploadCloudTrail } from "@/lib/queries";

export default function DashboardHero() {
  const router = useRouter();

  // Modal States
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // Upload State: idle, selected, uploading, success
  const [uploadState, setUploadState] = useState<'idle' | 'selected' | 'uploading' | 'success'>('idle');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const { mutateAsync: uploadFile } = useUploadCloudTrail();

  // Export State
  const [exportType, setExportType] = useState("executive");
  const [exportFormat, setExportFormat] = useState("pdf");
  const [exportRange, setExportRange] = useState("7d");
  const [exportState, setExportState] = useState<'idle' | 'generating'>('idle');
  const [showToast, setShowToast] = useState(false);

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadState('selected');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleStartIngestion = async () => {
    if (!selectedFile) return;
    setUploadState('uploading');
    try {
      await uploadFile(selectedFile);
      setUploadState('success');
      setTimeout(() => {
        setUploadState('idle');
        setSelectedFile(null);
        setIsUploadModalOpen(false);
      }, 3000);
    } catch (err) {
      console.error(err);
      setUploadState('idle');
    }
  };

  const handleGenerateExport = () => {
    setExportState('generating');
    setExportState('generating');
    setTimeout(() => {
      // TODO: Connect to backend export API

      setExportState('idle');
      setIsExportModalOpen(false);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }, 1500);
  };

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="glass-panel flex flex-col p-0 overflow-hidden relative light-hero"
      >
        {/* Subtle radial glow in top-right */}
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#D3F531]/10 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Top Gradient Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#D3F531] to-transparent opacity-50"></div>

        <div className="flex flex-col lg:flex-row p-6 lg:p-8 gap-8 relative z-10">
          {/* LEFT SIDE */}
          <div className="flex-1 flex flex-col justify-center">
            <motion.div variants={itemVariants}>
              <h1 className="hero-heading text-[28px] font-bold text-text-primary leading-tight">
                Command Center for Machine Identities
              </h1>
            </motion.div>

            <motion.p variants={itemVariants} className="hero-subtext text-text-muted text-base max-w-2xl mt-3 mb-8">
              Monitor cloud identities, detect attack paths, calculate risk, and investigate threats using AI.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div variants={itemVariants} className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={() => router.push('/risk-findings')}
                className="btn btn-primary h-11 px-6 flex items-center gap-2 light-btn-investigate"
              >
                <Search className="w-4 h-4" />
                Start Investigation
              </button>
              <button
                onClick={() => router.push('/ai-investigation')}
                className="btn h-11 px-6 flex items-center gap-2 transition-colors bg-glass-subtle border border-glass-active text-text-primary hover:bg-white/10 hover:border-[#D3F531]/50 light-btn-ask-ai"
              >
                <BrainCircuit className="w-4 h-4 text-[#D3F531]" />
                Ask SentinelAI Copilot
              </button>
            </motion.div>

            {/* Live Telemetry Strip */}
            <motion.div variants={itemVariants} className="flex flex-wrap items-center gap-3">
              <div className="bg-glass-subtle border border-glass-subtle px-3 py-1.5 rounded text-xs font-mono text-text-primary flex items-center gap-2 light-stat-pill">
                <div className="w-1.5 h-1.5 rounded-full bg-[#D3F531] animate-pulse shadow-[0_0_8px_rgba(211,245,49,0.8)]"></div>
                Live Engine Connected
              </div>
            </motion.div>
          </div>

          {/* RIGHT SIDE: Quick Actions */}
          <motion.div variants={itemVariants} className="lg:w-72 shrink-0 flex flex-col gap-3">
            <h3 className="quick-actions-label text-xs font-bold text-text-muted uppercase tracking-wider mb-1">Quick Actions</h3>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setUploadState('idle'); setIsUploadModalOpen(true); }}
              className="btn bg-glass-subtle border border-glass-subtle hover:border-[#6366f1]/50 w-full justify-start gap-3 h-11 px-4 text-text-primary transition-all light-btn-quick"
            >
              <UploadCloud className="w-4 h-4 text-[#06b6d4]" />
              Upload CloudTrail
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/ai-investigation?prompt=run_full_investigation')}
              className="btn bg-glass-subtle border border-glass-subtle hover:border-[#6366f1]/50 w-full justify-start gap-3 h-11 px-4 text-text-primary transition-all light-btn-quick"
            >
              <Play className="w-4 h-4 text-[#6366f1]" />
              Run SentinelAI Copilot
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/attack-graph')}
              className="btn bg-glass-subtle border border-glass-subtle hover:border-[#6366f1]/50 w-full justify-start gap-3 h-11 px-4 text-text-primary transition-all light-btn-quick"
            >
              <GitBranch className="w-4 h-4 text-[#f97316]" />
              Open Investigations
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => { setExportState('idle'); setIsExportModalOpen(true); }}
              className="btn bg-glass-subtle border border-glass-subtle hover:border-[#6366f1]/50 w-full justify-start gap-3 h-11 px-4 text-text-primary transition-all light-btn-quick"
            >
              <Download className="w-4 h-4 text-[#22c55e]" />
              Export Report
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* --- MODALS --- */}
      <AnimatePresence>
        {isUploadModalOpen && (
          <div key="upload-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setIsUploadModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[520px] bg-transparent border border-glass-subtle rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-glass-subtle border">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Upload CloudTrail Logs</h2>
                  <p className="text-xs text-text-muted mt-1">Upload a JSON CloudTrail export to ingest events and run risk analysis</p>
                </div>
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6">
                {uploadState === 'idle' && (
                  <label
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={`border-2 border-dashed transition-colors rounded-xl p-10 flex flex-col items-center justify-center cursor-pointer text-center ${isDragging ? 'border-[#6366f1] bg-glass-subtle shadow-[0_0_15px_rgba(99,102,241,0.5)]' : 'border-[#6366f1]/50 bg-glass-subtle hover:bg-slate-100/50'
                      }`}
                  >
                    <UploadCloud className="w-10 h-10 text-[#6366f1] mb-4" />
                    <p className="text-sm font-bold text-text-primary mb-1">Drag & drop your CloudTrail JSON file here</p>
                    <p className="text-xs text-text-muted mb-4">or click to browse · .json, .json.gz supported</p>
                    <div className="px-4 py-2 bg-transparent border border-[#6366f1] text-[#6366f1] hover:bg-[#6366f1]/10 rounded-lg text-sm font-semibold transition-colors">
                      Browse Files
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept=".json,.json.gz"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          setSelectedFile(file);
                          setUploadState('selected');
                        }
                      }}
                    />
                  </label>
                )}

                {(uploadState === 'selected' || uploadState === 'uploading') && selectedFile && (
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-4 bg-glass-subtle border border-glass-subtle p-4 rounded-xl relative overflow-hidden">
                      <FileJson className="w-8 h-8 text-[#06b6d4] shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-center mb-1">
                          <span className="text-sm font-bold text-text-primary truncate pr-2">{selectedFile.name}</span>
                          <span className="text-xs font-mono text-text-muted shrink-0">{(selectedFile.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                        {uploadState === 'uploading' && (
                          <div className="w-full h-1.5 bg-glass-subtle rounded-full overflow-hidden mt-2 relative">
                            <motion.div
                              initial={{ width: "0%" }}
                              animate={{ width: "95%" }}
                              transition={{ duration: 15, ease: "easeOut" }}
                              className="h-full bg-[#6366f1]"
                            />
                          </div>
                        )}
                        {uploadState === 'uploading' && <p className="text-xs text-[#6366f1] mt-2 animate-pulse font-medium">Uploading & Analyzing...</p>}
                      </div>
                      {uploadState === 'selected' && (
                        <button
                          onClick={() => {
                            setSelectedFile(null);
                            setUploadState('idle');
                          }}
                          className="absolute top-2 right-2 p-1 text-text-muted hover:text-[#ef4444] transition-colors rounded"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                )}

                {uploadState === 'success' && (
                  <div className="flex flex-col items-center justify-center py-6 text-center">
                    <div className="w-16 h-16 bg-[#22c55e]/10 border border-[#22c55e]/30 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 className="w-8 h-8 text-[#22c55e]" />
                    </div>
                    <h3 className="text-text-primary font-bold text-lg mb-2">CloudTrail logs ingested</h3>
                    <p className="text-sm text-text-muted">Live stream updated · Risk Engine triggered</p>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-glass-subtle border bg-glass-subtle">
                <button
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 text-sm font-semibold text-text-muted hover:text-white transition-colors"
                >
                  {uploadState === 'success' ? 'Close' : 'Cancel'}
                </button>
                {uploadState !== 'success' && (
                  <button
                    onClick={handleStartIngestion}
                    disabled={uploadState === 'idle' || uploadState === 'uploading'}
                    className="px-4 py-2 bg-[#6366f1] hover:bg-[#4f46e5] disabled:opacity-50 disabled:cursor-not-allowed text-text-primary text-sm font-semibold rounded-lg shadow-[0_0_20px_rgba(211,245,49,0.3)] transition-all"
                  >
                    Start Ingestion
                  </button>
                )}
              </div>
            </motion.div>
          </div>
        )}

        {isExportModalOpen && (
          <div key="export-modal" className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => exportState === 'idle' && setIsExportModalOpen(false)}
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              className="relative w-full max-w-[520px] bg-transparent border border-glass-subtle rounded-xl shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between p-5 border-b border-glass-subtle border">
                <div>
                  <h2 className="text-lg font-bold text-text-primary">Export Security Report</h2>
                  <p className="text-xs text-text-muted mt-1">Choose format and content for your export</p>
                </div>
                <button
                  onClick={() => exportState === 'idle' && setIsExportModalOpen(false)}
                  className="p-1.5 text-text-muted hover:text-white hover:bg-white/10 rounded-md transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 flex flex-col gap-6 max-h-[60vh] overflow-y-auto custom-scrollbar">

                {/* REPORT TYPE */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Report Type</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { id: 'executive', name: 'Executive Summary', desc: 'High-level risk posture for leadership', icon: <ShieldCheck className="w-4 h-4" /> },
                      { id: 'findings', name: 'Full Findings', desc: 'All 34 findings with remediation steps', icon: <FileText className="w-4 h-4" /> },
                      { id: 'cloudtrail', name: 'CloudTrail Audit', desc: 'Raw event log for compliance review', icon: <Activity className="w-4 h-4" /> },
                      { id: 'attack', name: 'Attack Path Report', desc: 'Complete graph with blast radius', icon: <Map className="w-4 h-4" /> },
                    ].map(t => (
                      <div
                        key={t.id}
                        onClick={() => setExportType(t.id)}
                        className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${exportType === t.id ? 'bg-glass-subtle border-[#6366f1]' : 'border-glass-subtle border hover:border-glass-active hover:bg-slate-100/50'}`}
                      >
                        <div className={`mt-0.5 ${exportType === t.id ? 'text-[#6366f1]' : 'text-text-muted'}`}>{t.icon}</div>
                        <div>
                          <div className={`text-sm font-bold ${exportType === t.id ? 'text-text-primary' : 'text-text-secondary'}`}>{t.name}</div>
                          <div className="text-xs text-text-muted mt-0.5">{t.desc}</div>
                        </div>
                        <div className="ml-auto mt-1">
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${exportType === t.id ? 'border-[#6366f1]' : 'border-glass-subtle'}`}>
                            {exportType === t.id && <div className="w-2 h-2 rounded-full bg-[#6366f1]"></div>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* FORMAT */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Format</label>
                  <div className="flex bg-glass-subtle p-1 border border-glass-subtle rounded-lg">
                    {['pdf', 'csv', 'json'].map(f => (
                      <button
                        key={f}
                        onClick={() => setExportFormat(f)}
                        className={`flex-1 py-2 text-sm font-medium uppercase rounded-md transition-colors ${exportFormat === f ? 'bg-[#D3F531] text-black font-bold shadow-sm' : 'text-text-muted hover:text-white'}`}
                      >
                        {f}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DATE RANGE */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Date Range</label>
                  <div className="flex flex-wrap gap-2">
                    {['Last 7 days', 'Last 30 days', 'Last 90 days', 'Custom'].map(r => (
                      <button
                        key={r}
                        onClick={() => setExportRange(r)}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${exportRange === r ? 'bg-[#6366f1]/10 border-[#6366f1] text-[#818cf8]' : 'bg-glass-subtle border-glass-subtle border text-text-muted hover:text-white'}`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* INCLUDE SECTIONS */}
                <div className="flex flex-col gap-3">
                  <label className="text-xs font-bold text-text-muted uppercase tracking-wider">Include Sections</label>
                  <div className="flex flex-col gap-2">
                    {['Risk Score Summary', 'Identity Findings', 'Attack Paths', 'AI Recommendations', 'Compliance Posture'].map(s => (
                      <label key={s} className="flex items-center gap-3 cursor-pointer group">
                        <div className="w-4 h-4 rounded border border-glass-active group-hover:border-[#D3F531]/50 bg-glass-subtle flex items-center justify-center transition-colors">
                          <CheckCircle2 className="w-3 h-3 text-[#D3F531] opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <span className="text-sm text-text-muted group-hover:text-white transition-colors">{s}</span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              <div className="flex items-center justify-end gap-3 p-5 border-t border-glass-subtle border bg-glass-subtle">
                <button
                  onClick={() => exportState === 'idle' && setIsExportModalOpen(false)}
                  disabled={exportState === 'generating'}
                  className="px-4 py-2 text-sm font-semibold text-text-muted hover:text-white disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleGenerateExport}
                  disabled={exportState === 'generating'}
                  className="px-4 py-2 bg-[#D3F531] hover:bg-[#bde026] text-black text-sm font-bold rounded-lg shadow-[0_0_20px_rgba(211,245,49,0.3)] transition-all flex items-center gap-2 min-w-[170px] justify-center disabled:opacity-80"
                >
                  {exportState === 'generating' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</>
                  ) : (
                    'Generate & Download'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Global Toast */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            key="toast"
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-green-500/20 border border-[#22c55e]/30 px-5 py-3 rounded-xl shadow-2xl"
          >
            <CheckCircle2 className="w-5 h-5 text-[#22c55e]" />
            <span className="text-text-primary font-medium text-sm">Report exported successfully</span>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
