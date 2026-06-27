import TopMetricsCards from "@/components/dashboard/TopMetricsCards";
import CloudTrailDropzone from "@/components/dashboard/CloudTrailDropzone";
import RiskLeaderboard from "@/components/dashboard/RiskLeaderboard";
import RecentFindingsWidget from "@/components/dashboard/RecentFindingsWidget";
import DashboardHero from "@/components/dashboard/DashboardHero";
import AnalyticsDashboard from "@/components/dashboard/AnalyticsDashboard";
import TopAttackPaths from "@/components/dashboard/TopAttackPaths";
import AiRecommendations from "@/components/dashboard/AiRecommendations";
import { BrainCircuit } from "lucide-react";

export default function CommandCenter() {
  return (
    <div className="flex flex-col gap-8 animate-in fade-in duration-500 pb-12">
      
      {/* Dashboard Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-text-primary">Command Center</h1>
          <p className="text-text-secondary mt-1">
            Global view of your identity security posture and active threats.
          </p>
        </div>
      </div>

      <DashboardHero />

      {/* 3. KPI Card Grid */}
      <section>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-text-primary">Platform Metrics</h2>
        </div>
        <TopMetricsCards />
      </section>

      {/* 4. Analytics Area */}
      <section>
        <AnalyticsDashboard />
      </section>

      {/* 5. Threat Intelligence Area */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Risk Leaderboard</h2>
          </div>
          <div className="card flex-1 h-full">
            <RiskLeaderboard />
          </div>
        </div>
        <div className="flex flex-col">
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-text-primary">Live Findings</h2>
          </div>
          <div className="card flex-1 h-full">
            <RecentFindingsWidget />
          </div>
        </div>
      </section>

      {/* 6. Cloud Activity Area */}
      <section>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-text-primary">Cloud Activity</h2>
        </div>
        <div className="card">
          <CloudTrailDropzone />
        </div>
      </section>

      {/* 7. Attack Intelligence Area */}
      <TopAttackPaths />

      {/* 8. AI Investigation Area (Placeholder) */}
      <section className="card bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 min-h-[300px] flex flex-col items-center justify-center text-center mt-4 shadow-[inset_0_0_50px_rgba(99,102,241,0.05)]">
        <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center mb-4 border border-primary/30 shadow-[0_0_15px_var(--color-primary)] shadow-primary/20">
          <BrainCircuit className="w-8 h-8 text-primary" />
        </div>
        <h3 className="text-xl font-semibold text-text-primary">SentinelAI Investigator</h3>
        <p className="text-text-secondary mt-2 max-w-md">Ask natural language questions about your security posture and let Gemini analyze your graph data instantly.</p>
        <button className="mt-6 btn btn-primary px-6 shadow-[0_0_20px_rgba(211,245,49,0.3)]">
          Start New Investigation
        </button>
      </section>

      {/* 9. Recommendations Area */}
      <AiRecommendations />
      
    </div>
  );
}
