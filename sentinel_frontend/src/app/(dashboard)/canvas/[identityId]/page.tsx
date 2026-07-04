import ThreatGraphCanvas from "@/components/canvas/ThreatGraphCanvas";
import AIAnalystPanel from "@/components/canvas/AIAnalystPanel";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function CanvasPage(
  { params }: { params: Promise<{ identityId: string }> }
) {
  const resolvedParams = await params;

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] gap-4 animate-in fade-in duration-500">
      <div className="flex items-center gap-4">
        <Link href="/" className="text-text-muted hover:text-white transition-colors flex items-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Command Center
        </Link>
        <div className="h-4 w-[1px] bg-gray-700"></div>
        <h1 className="text-xl font-bold tracking-tight">Threat Investigation Canvas</h1>
      </div>

      <div className="flex-1 flex gap-4 h-full overflow-hidden">
        {/* Left Pane: Graph (70%) */}
        <div className="flex-[7] bg-white rounded-xl overflow-hidden border border-gray-200 relative shadow-[0_1px_3px_rgba(0,0,0,0.04),0_1px_2px_rgba(0,0,0,0.02)]">
          <ThreatGraphCanvas identityId={resolvedParams.identityId} />
          
          <div className="absolute top-4 left-4 bg-white px-4 py-2 rounded-lg text-sm font-mono border border-gray-200 text-slate-600 shadow-sm z-10">
            ID: {resolvedParams.identityId}
          </div>
        </div>

        {/* Right Pane: AI Panel (30%) */}
        <div className="flex-[3]">
          <AIAnalystPanel identityId={resolvedParams.identityId} />
        </div>
      </div>
    </div>
  );
}
