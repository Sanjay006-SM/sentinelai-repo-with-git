"use client";

import { useCallback, useState } from "react";
import { UploadCloud, CheckCircle, AlertTriangle, Terminal } from "lucide-react";
import { useUploadCloudTrail, useRecentEvents } from "@/lib/queries";
import { useGlobalStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

export default function CloudTrailDropzone() {
  const { mutateAsync: uploadFile } = useUploadCloudTrail();
  const { data: recentEvents } = useRecentEvents();
  const { isUploading, setUploading } = useGlobalStore();
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [isDragging, setIsDragging] = useState(false);
  
  const logs = recentEvents || [];

  const handleFile = useCallback(async (file: File) => {
    setUploading(true);
    setStatus('idle');
    try {
      await uploadFile(file);
      setStatus('success');
      setTimeout(() => setStatus('idle'), 3000);
    } catch (err) {
      console.error(err);
      setStatus('error');
      setTimeout(() => setStatus('idle'), 3000);
    } finally {
      setUploading(false);
    }
  }, [uploadFile, setUploading]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }, [handleFile]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  return (
    <div 
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      className={`glass-panel relative overflow-hidden flex flex-col h-[400px] hover-transition ${isDragging ? 'border-indigo-500 border-dashed bg-[var(--hover-bg-tint)] shadow-[0_0_15px_rgba(99,102,241,0.2)]' : ''}`}
    >
      {/* Header */}
      <div className="p-4 flex items-center justify-between z-10 border-b border-glass-subtle border bg-glass-subtle rounded-t-[20px]">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-primary" />
          <h2 className="text-sm font-semibold text-text-primary">CloudTrail Activity Stream</h2>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#22c55e] animate-pulse"></span>
            <span className="text-xs font-semibold tracking-wide" style={{ color: '#16a34a' }}>Live Polling</span>
          </div>
          <div className="h-4 w-px" style={{ background: 'rgba(203,213,225,0.50)' }}></div>
          <label className="cursor-pointer flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md hover-transition hover:bg-indigo-900/40 hover:scale-[1.02]" style={{ color: '#D3F531', background: 'rgba(99,102,241,0.10)', border: '1px solid rgba(99,102,241,0.25)' }}>
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Upload Log</span>
            <input 
              type="file" 
              className="hidden" 
              accept=".json"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  handleFile(file);
                }
              }}
            />
          </label>
        </div>
      </div>

      {/* Stream Area */}
      <div className="flex-1 p-4 overflow-hidden relative flex flex-col">
        {/* Overlay for Drag/Upload States */}
        <AnimatePresence>
          {(isDragging || isUploading || status !== 'idle') && (
            <motion.div 
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-20 backdrop-blur-sm flex flex-col items-center justify-center bg-black/60"
            >
              {isUploading ? (
                <div className="flex flex-col items-center gap-4">
                  <div className="w-12 h-12 rounded-full border-4 border-[#6366f1] border-t-transparent animate-spin"></div>
                  <p className="font-bold tracking-widest uppercase text-sm" style={{ color: '#D3F531' }}>Processing Log Data...</p>
                </div>
              ) : status === 'success' ? (
                <div className="flex flex-col items-center gap-4">
                  <CheckCircle className="w-12 h-12 text-[#22c55e]" />
                  <p className="font-bold tracking-widest uppercase text-sm" style={{ color: '#16a34a' }}>Ingestion Complete</p>
                </div>
              ) : status === 'error' ? (
                <div className="flex flex-col items-center gap-4">
                  <AlertTriangle className="w-12 h-12 text-[#ef4444]" />
                  <p className="font-bold tracking-widest uppercase text-sm" style={{ color: '#dc2626' }}>Upload Failed</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-4 border-2 border-dashed border-[#6366f1] rounded-xl p-8" style={{ background: 'rgba(99,102,241,0.05)' }}>
                  <UploadCloud className="w-12 h-12 text-[#6366f1]" />
                  <p className="text-[#6366f1] font-bold tracking-widest uppercase text-sm">Drop JSON File Here</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Logs */}
        <div className="flex flex-col gap-2 relative z-0 h-full overflow-hidden">
          <AnimatePresence initial={false}>
            {logs.length === 0 && (
              <motion.div key="empty-stream" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 flex items-center justify-center text-text-muted text-sm font-mono opacity-50">
                Waiting for stream...
              </motion.div>
            )}
            {logs.map((log: any) => (
              <motion.div
                key={log.id}
                initial={{ opacity: 0, y: -20, backgroundColor: 'rgba(99,102,241,0.08)' }}
                animate={{ opacity: 1, y: 0, backgroundColor: 'rgba(255,255,255,0)' }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ 
                  duration: 0.5,
                  y: { type: "spring", stiffness: 300, damping: 24 }
                }}
                className="group/stream flex items-center gap-4 p-2 rounded hover-transition hover:bg-[var(--hover-bg-tint)] border-b border-glass-subtle border last:border-0"
              >
                <div className="text-text-muted whitespace-nowrap font-mono text-[11px]">
                  {log.event_time ? new Date(log.event_time).toISOString().split('T')[1].slice(0, 8) : "--:--:--"}
                </div>
                <div className="flex-1 flex flex-row items-center gap-4 font-mono text-[11px]">
                  <span className={`font-bold ${log.event?.includes('Delete') || log.event?.includes('Deny') ? 'text-critical' : 'text-text-primary'}`}>
                    {log.event}
                  </span>
                  <Link href="/identities" className="truncate max-w-[200px] font-mono text-primary hover:underline hover:text-indigo-800" title={log.user}>
                    {log.user?.split('/').pop() || "Unknown"}
                  </Link>
                  {log.isAnomaly && (
                    <span className="bg-[#7c2d12] text-[#f97316] border border-[#f97316]/20 px-1.5 py-0.5 rounded text-[9px] uppercase font-bold ml-auto flex-shrink-0">
                      [ANOMALY] {log.anomalyReason}
                    </span>
                  )}
                </div>
                <div className={`whitespace-nowrap px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider font-bold transition-transform duration-200 ${log.status === 'Success' ? 'group-hover/stream:scale-110' : ''}`}
                  style={log.status === 'Success' ? { background: 'rgba(22,163,74,0.10)', color: '#16a34a', border: '1px solid rgba(22,163,74,0.25)', borderRadius: '6px' } : { background: 'rgba(220,38,38,0.10)', color: '#dc2626', border: '1px solid rgba(220,38,38,0.25)', borderRadius: '6px' }}>
                  {log.status}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
      
      {/* Footer Instructions */}
      <div className="p-2 text-center z-10 bg-glass-subtle border-t border-dashed border-glass-active border">
        <p className={`text-[10px] uppercase tracking-widest hover-transition ${isDragging ? 'text-indigo-600 font-bold' : 'text-text-muted'}`} style={{ letterSpacing: '0.08em' }}>Drag and drop CloudTrail JSON here to upload manually</p>
      </div>
    </div>
  );
}
