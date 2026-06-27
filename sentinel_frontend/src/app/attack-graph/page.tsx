"use client";

import React, { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ZoomIn, ZoomOut, Maximize, Download, ChevronRight, AlertTriangle, ShieldAlert, GitBranch, Server, Database, User, Shield } from "lucide-react";
import ReactFlow, { 
  Background, 
  Controls, 
  Handle, 
  Position, 
  MarkerType, 
  useNodesState, 
  useEdgesState,
  Panel
} from 'reactflow';
import 'reactflow/dist/style.css';

// --- Custom Node Component ---
const CustomNode = ({ data }: any) => {
  const getIcon = () => {
    switch(data.type) {
      case 'Identity': return <User className="w-3.5 h-3.5" style={{ color: data.color }} />;
      case 'Service': return <Server className="w-3.5 h-3.5" style={{ color: data.color }} />;
      case 'DataStore': return <Database className="w-3.5 h-3.5" style={{ color: data.color }} />;
      case 'Exposure': return <Shield className="w-3.5 h-3.5" style={{ color: data.color }} />;
      default: return null;
    }
  };

  return (
    <div 
      className="bg-transparent rounded-xl p-3 min-w-[180px] shadow-2xl relative"
      style={{ border: `1px solid ${data.color}` }}
    >
      <Handle type="target" position={Position.Top} className="!w-2 !h-2 !bg-[#94a3b8] !border-none" />
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-1.5">
            {getIcon()}
            <span className="text-xs font-bold text-text-primary truncate max-w-[120px]" title={data.name}>{data.name}</span>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <span className="text-[10px] text-text-muted uppercase tracking-wider font-bold">{data.type}</span>
          {data.score && (
            <span 
              className="text-[10px] px-1.5 py-0.5 rounded font-bold border" 
              style={{ backgroundColor: `${data.color}20`, color: data.color, borderColor: `${data.color}40` }}
            >
              Risk {data.score}
            </span>
          )}
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!w-2 !h-2 !bg-[#94a3b8] !border-none" />
    </div>
  );
};

const nodeTypes = {
  custom: CustomNode,
};

// --- React Flow Mock Data ---
const initialNodes = [
  { id: '1', type: 'custom', position: { x: 250, y: 50 }, data: { name: 'i-prod-payments-svc', type: 'Identity', color: '#ef4444', score: 94 } },
  { id: '2', type: 'custom', position: { x: 500, y: 50 }, data: { name: 'k8s-prod-cluster-admin', type: 'Identity', color: '#f97316', score: 88 } },
  { id: '3', type: 'custom', position: { x: 750, y: 50 }, data: { name: 'terraform-ci-runner', type: 'Identity', color: '#f97316', score: 81 } },
  
  { id: '4', type: 'custom', position: { x: 400, y: 200 }, data: { name: 'sts.amazonaws.com', type: 'Service', color: '#D3F531' } },
  { id: '5', type: 'custom', position: { x: 150, y: 200 }, data: { name: 'payments-db', type: 'DataStore', color: '#eab308' } },
  { id: '6', type: 'custom', position: { x: 650, y: 200 }, data: { name: 'billing-namespace', type: 'Service', color: '#D3F531' } },
  
  { id: '7', type: 'custom', position: { x: 400, y: 350 }, data: { name: 'card-vault-bucket', type: 'Exposure', color: '#ef4444' } },
];

const initialEdges = [
  { 
    id: 'e1-4', source: '1', target: '4', animated: true, label: 'AssumeRole +412%', 
    style: { stroke: '#ef4444', strokeWidth: 2, strokeDasharray: '5,5' }, 
    labelStyle: { fill: '#f1f5f9', fontWeight: 700, fontSize: 11 }, 
    labelBgStyle: { fill: '#151a22', fillOpacity: 0.8 }, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } 
  },
  { 
    id: 'e1-5', source: '1', target: '5', label: 'Direct access', 
    style: { stroke: '#ef4444', strokeWidth: 2 }, 
    labelStyle: { fill: '#f1f5f9', fontWeight: 700, fontSize: 11 }, 
    labelBgStyle: { fill: '#151a22', fillOpacity: 0.8 }, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } 
  },
  { 
    id: 'e2-6', source: '2', target: '6', animated: true, label: 'ClusterAdmin binding', 
    style: { stroke: '#f97316', strokeWidth: 2, strokeDasharray: '5,5' }, 
    labelStyle: { fill: '#f1f5f9', fontWeight: 700, fontSize: 11 }, 
    labelBgStyle: { fill: '#151a22', fillOpacity: 0.8 }, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' } 
  },
  { 
    id: 'e3-4', source: '3', target: '4', label: 'OIDC wildcard', 
    style: { stroke: '#f97316', strokeWidth: 2 }, 
    labelStyle: { fill: '#f1f5f9', fontWeight: 700, fontSize: 11 }, 
    labelBgStyle: { fill: '#151a22', fillOpacity: 0.8 }, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#f97316' } 
  },
  { 
    id: 'e4-7', source: '4', target: '7', animated: true, label: 'S3:GetObject *', 
    style: { stroke: '#ef4444', strokeWidth: 2 }, 
    labelStyle: { fill: '#f1f5f9', fontWeight: 700, fontSize: 11 }, 
    labelBgStyle: { fill: '#151a22', fillOpacity: 0.8 }, 
    markerEnd: { type: MarkerType.ArrowClosed, color: '#ef4444' } 
  },
];

// --- Paths Mock Data ---
const PATHS = [
  { id: "PATH-9941", source: "i-prod-payments-svc", target: "card-vault-bucket", severity: "Critical", steps: 2, status: "Open", hops: ["i-prod-payments-svc", "AssumeRole +412%", "sts.amazonaws.com", "S3:GetObject *", "card-vault-bucket"] },
  { id: "PATH-9942", source: "k8s-prod-cluster-admin", target: "billing-namespace", severity: "High", steps: 1, status: "Open", hops: ["k8s-prod-cluster-admin", "ClusterAdmin binding", "billing-namespace"] },
  { id: "PATH-9943", source: "terraform-ci-runner", target: "sts.amazonaws.com", severity: "High", steps: 1, status: "Investigating", hops: ["terraform-ci-runner", "OIDC wildcard", "sts.amazonaws.com"] },
];

export default function AttackGraphPage() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [expandedPath, setExpandedPath] = useState<string | null>(null);

  return (
    <div className="animate-in fade-in duration-500 pb-12 flex flex-col gap-6">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary flex items-center gap-3">
            <GitBranch className="w-6 h-6 text-primary" />
            Attack Graph
          </h1>
          <p className="text-text-muted mt-1 text-sm">AI-modeled blast radius across identities, services, and data stores</p>
        </div>
        
        {/* Badges */}
        <div className="flex items-center gap-3">
          <div className="bg-[#450a0a] border border-[#ef4444]/20 text-[#ef4444] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 shadow-[0_0_10px_rgba(239,68,68,0.2)]">
            <ShieldAlert className="w-3.5 h-3.5" /> 3 critical paths
          </div>
          <div className="bg-[#7c2d12] border border-[#f97316]/20 text-[#f97316] px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5" /> 8 high paths
          </div>
          <div className="bg-transparent border border-glass-subtle text-text-muted px-3 py-1 rounded-full text-xs font-medium">
            Last refresh: 1m ago
          </div>
        </div>
      </div>

      {/* Graph Panel */}
      <div className="bg-glass-subtle border border-glass-subtle rounded-xl overflow-hidden relative shadow-lg flex flex-col h-[500px]">
        
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          fitView
          className="bg-glass-subtle"
        >
          <Background color="var(--color-border)" gap={24} size={2} />
          
          <Panel position="top-right" className="bg-slate-100/80 backdrop-blur border border-glass-subtle rounded-lg p-1 flex gap-1 shadow-md m-4">
            <button onClick={() => { /* React flow handles zoom, but we'll leave buttons as UI mock if we wanted manual triggers */ }} className="p-1.5 text-text-muted hover:text-white hover:bg-glass-active rounded transition-colors" title="Zoom In"><ZoomIn className="w-4 h-4" /></button>
            <button className="p-1.5 text-text-muted hover:text-white hover:bg-glass-active rounded transition-colors" title="Zoom Out"><ZoomOut className="w-4 h-4" /></button>
            <button className="p-1.5 text-text-muted hover:text-white hover:bg-glass-active rounded transition-colors" title="Reset View"><Maximize className="w-4 h-4" /></button>
            <div className="w-px h-4 bg-glass-subtle mx-1 self-center"></div>
            <button className="p-1.5 text-text-muted hover:text-white hover:bg-glass-active rounded transition-colors" title="Export PNG"><Download className="w-4 h-4" /></button>
          </Panel>

          <Controls 
            showInteractive={false} 
            showZoom={false} 
            showFitView={false} 
            position="bottom-right" 
          />
        </ReactFlow>

        {/* Legend */}
        <div className="p-3 border-t border-glass-subtle border bg-glass-subtle flex items-center justify-center gap-8 text-xs font-semibold text-text-muted absolute bottom-0 left-0 right-0 z-10">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#6366f1] flex items-center justify-center"></div> Identity
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-[#06b6d4]"></div> Service
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rotate-45 bg-[#eab308]"></div> DataStore
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-[#ef4444]" style={{ clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)"}}></div> Exposure
          </div>
        </div>
      </div>

      {/* Bottom Panel - Attack Paths List */}
      <div className="bg-transparent border border-glass-subtle rounded-xl flex flex-col overflow-hidden shadow-lg">
        <div className="p-4 border-b border-glass-subtle border flex items-center justify-between">
          <h2 className="text-lg font-bold text-text-primary">Identified Attack Paths</h2>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-glass-subtle border-b border-glass-subtle border text-xs uppercase tracking-wider text-text-muted font-bold">
              <tr>
                <th className="p-4 w-12"></th>
                <th className="p-4">Path ID</th>
                <th className="p-4">Source Identity</th>
                <th className="p-4">Target Resource</th>
                <th className="p-4">Severity</th>
                <th className="p-4 text-center">Steps</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-glass-subtle">
              {PATHS.map((path) => (
                <React.Fragment key={path.id}>
                  <tr 
                    className="hover:bg-white/10 cursor-pointer transition-colors group"
                    onClick={() => setExpandedPath(expandedPath === path.id ? null : path.id)}
                  >
                    <td className="p-4 text-center">
                      <ChevronRight className={`w-4 h-4 text-text-muted transition-transform ${expandedPath === path.id ? "rotate-90" : ""}`} />
                    </td>
                    <td className="p-4 font-mono text-sm text-text-muted">{path.id}</td>
                    <td className="p-4 font-bold text-text-primary text-sm">{path.source}</td>
                    <td className="p-4 font-bold text-text-primary text-sm">{path.target}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold border uppercase tracking-wider ${
                        path.severity === 'Critical' ? 'bg-[#450a0a] text-[#ef4444] border-[#ef4444]/20' : 'bg-[#7c2d12] text-[#f97316] border-[#f97316]/20'
                      }`}>
                        {path.severity}
                      </span>
                    </td>
                    <td className="p-4 text-center font-mono text-sm text-text-muted">{path.steps}</td>
                    <td className="p-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold border uppercase tracking-wider ${
                        path.status === 'Open' ? 'bg-[#78350f] text-[#fbbf24] border-[#fbbf24]/20' : 
                        path.status === 'Investigating' ? 'bg-[#1e1b4b] text-[#818cf8] border-[#818cf8]/20' : 
                        'bg-green-500/20 text-[#22c55e] border-[#22c55e]/20'
                      }`}>
                        {path.status}
                      </span>
                    </td>
                  </tr>
                  
                  {/* Expanded Path Hops */}
                  <AnimatePresence>
                    {expandedPath === path.id && (
                      <motion.tr
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                      >
                        <td colSpan={7} className="p-0 border-b border-glass-subtle border bg-glass-subtle">
                          <div className="p-6 pl-16">
                            <h4 className="text-xs font-bold text-text-muted uppercase tracking-wider mb-4">Path Execution Steps</h4>
                            <div className="flex flex-wrap items-center gap-2">
                              {path.hops.map((hop, i) => (
                                <div key={i} className="flex items-center gap-2">
                                  <div className="bg-glass-subtle border border-glass-active px-3 py-1.5 rounded-md text-sm text-[#e2e8f0] font-mono shadow-sm">
                                    {hop}
                                  </div>
                                  {i < path.hops.length - 1 && (
                                    <div className="w-8 h-px bg-[#ef4444] relative">
                                      <div className="absolute right-0 top-1/2 -translate-y-1/2 w-0 h-0 border-y-4 border-y-transparent border-l-[6px] border-l-[#ef4444]"></div>
                                    </div>
                                  )}
                                </div>
                              ))}
                            </div>
                            <div className="mt-6 flex gap-3">
                              <button className="btn bg-[#ef4444] hover:bg-[#dc2626] text-text-primary border-transparent h-8 px-4 text-xs font-bold transition-colors">Isolate Source Identity</button>
                              <button className="btn bg-transparent border border-glass-subtle hover:border-[#6366f1] text-text-muted hover:text-[#818cf8] h-8 px-4 text-xs transition-colors">Create Jira Ticket</button>
                            </div>
                          </div>
                        </td>
                      </motion.tr>
                    )}
                  </AnimatePresence>
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
