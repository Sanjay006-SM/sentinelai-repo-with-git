import React from 'react';
import { ShieldAlert, Activity, CheckCircle, Brain, GitMerge } from 'lucide-react';

export const EvidencePanel = ({ evidence }: { evidence: any }) => {
  if (!evidence) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Brain className="w-5 h-5 text-indigo-600" />
        Graph Explainability Engine
      </h3>
      <p className="text-sm text-slate-700 bg-indigo-50/50 p-4 rounded-lg border border-indigo-100">
        {evidence.explainability}
      </p>
    </div>
  );
};

export const ConfidencePanel = ({ confidence }: { confidence: any }) => {
  if (!confidence) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <CheckCircle className="w-5 h-5 text-emerald-600" />
        Confidence Score
      </h3>
      <div className="flex items-center gap-4">
        <div className="text-3xl font-black text-slate-900">{confidence.score}%</div>
        <div className="flex flex-col gap-1">
          {confidence.factors_weighted?.map((f: any, i: number) => (
            <div key={i} className="text-xs text-slate-500 font-mono">
              <span className="text-emerald-600 font-bold mr-2">{f.weight}</span>
              {f.factor}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export const RiskFactorsPanel = ({ riskFactors }: { riskFactors: any[] }) => {
  if (!riskFactors || riskFactors.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <ShieldAlert className="w-5 h-5 text-rose-600" />
        Graph Risk Factors
      </h3>
      <div className="flex flex-col gap-3">
        {riskFactors.map((rf: any, i: number) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className={`px-2 py-1 text-[10px] font-bold rounded uppercase ${rf.severity === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
              {rf.severity}
            </div>
            <div>
              <div className="font-bold text-sm text-slate-800">{rf.factor}</div>
              <div className="text-xs text-slate-500 mt-1">{rf.description}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export const GraphMetricsPanel = ({ metrics }: { metrics: any }) => {
  if (!metrics) return null;
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
      <h3 className="text-lg font-bold flex items-center gap-2 mb-4">
        <Activity className="w-5 h-5 text-blue-600" />
        Graph Context Metrics
      </h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Critical Assets Reachable</div>
          <div className="text-xl font-black text-slate-900 mt-1">{metrics.reachable_critical_assets || 0}</div>
        </div>
        <div className="p-3 bg-slate-50 rounded-lg">
          <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Cycle Detected</div>
          <div className="text-xl font-black text-slate-900 mt-1">{metrics.cycle_detected ? 'Yes' : 'No'}</div>
        </div>
      </div>
    </div>
  );
};
