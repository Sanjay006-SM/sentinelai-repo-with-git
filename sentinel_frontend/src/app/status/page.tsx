"use client";

import Navbar from "@/components/landing/Navbar";
import Footer from "@/components/landing/Footer";
import { CheckCircle2 } from "lucide-react";

export default function StatusPage() {
  const services = [
    { name: "API & Authentication", status: "Operational", uptime: "99.99%" },
    { name: "CloudTrail Ingestion Engine", status: "Operational", uptime: "99.99%" },
    { name: "Threat Graph Database (Neo4j)", status: "Operational", uptime: "99.98%" },
    { name: "AI Security Analyst (LLM)", status: "Operational", uptime: "100.00%" },
    { name: "Web Dashboard", status: "Operational", uptime: "99.99%" },
  ];

  return (
    <div className="bg-slate-50 min-h-screen font-sans">
      <Navbar />
      <main className="pt-32 pb-24 px-6 relative z-10">
        <div className="max-w-[800px] mx-auto">
          
          <div className="bg-emerald-50 border border-emerald-200 rounded-[24px] p-10 flex flex-col items-center justify-center text-center mb-8 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircle2 className="w-8 h-8 text-emerald-600" />
            </div>
            <h1 className="font-[family-name:var(--font-jakarta)] text-3xl font-extrabold text-slate-900 mb-2">All Systems Operational</h1>
            <p className="text-emerald-700 font-medium">As of {new Date().toLocaleString()}</p>
          </div>

          <div className="bg-white border border-slate-200 rounded-[24px] shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-slate-100">
              <h2 className="font-[family-name:var(--font-jakarta)] text-xl font-bold text-slate-900">Uptime (Last 90 Days)</h2>
            </div>
            <div className="p-6 md:p-8 flex flex-col gap-6">
              {services.map((service) => (
                <div key={service.name} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center justify-between md:w-[250px] shrink-0">
                    <span className="font-semibold text-slate-700">{service.name}</span>
                    <span className="text-emerald-600 font-medium text-sm md:hidden">{service.status}</span>
                  </div>
                  
                  {/* Uptime bar mock */}
                  <div className="flex-1 flex gap-1 h-8">
                    {Array.from({ length: 90 }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`flex-1 rounded-sm ${i === 42 && service.name === "Threat Graph Database (Neo4j)" ? 'bg-amber-300' : 'bg-emerald-400'}`}
                        title={i === 42 && service.name === "Threat Graph Database (Neo4j)" ? 'Minor degraded performance' : 'No downtime recorded'}
                      />
                    ))}
                  </div>

                  <div className="flex items-center justify-between md:w-[150px] shrink-0 md:justify-end gap-4">
                    <span className="text-slate-400 text-sm">{service.uptime}</span>
                    <span className="text-emerald-600 font-medium text-sm hidden md:inline-block">{service.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
        </div>
      </main>
      <Footer />
    </div>
  );
}
