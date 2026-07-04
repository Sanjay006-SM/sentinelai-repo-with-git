"use client";

import { useState, useEffect } from "react";
import { Plus, BrainCircuit, Sparkles, Send, ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import { useAiInvestigate } from "@/lib/queries";
import { motion, AnimatePresence } from "framer-motion";
const RECENT_CHATS = [
  { id: 1, title: "New Investigation", time: "just now" },
];

const QUICK_PROMPTS = [
  "What identities are most at risk this week?",
  "Show me lateral movement from payments to data lake",
  "Which OIDC roles still have wildcard trust policies?",
  "Draft a least-privilege policy for terraform-ci-runner",
];

export default function AIInvestigationPage() {
  const { mutateAsync: runAiInvestigate, isPending } = useAiInvestigate();
  const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [inputValue, setInputValue] = useState("");
  const [dynamicMessages, setDynamicMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);

  // Function to process prompts conversationally
  const triggerInvestigation = async (identityId: string, customUserMsg?: string) => {
    const userMsg = customUserMsg || `Run a security investigation on identity profile ID: ${identityId}`;
    setDynamicMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    
    try {
      const report = await runAiInvestigate({ identity_id: identityId });
      
      if (report.success === false) {
        // Handle sanitized enterprise errors without crashing
        const friendlyMessage = `Sorry, I'm unable to answer this investigation right now.\n\nThe AI service is temporarily unavailable.\n\nPlease try again later.`;
        setDynamicMessages(prev => [...prev, { role: 'ai', content: friendlyMessage }]);
        return;
      }
      
      // Construct detailed AI response from backend Gemini results
      const aiResponseText = `
### Executive Summary
${report.executive_summary || ""}

### Risk Assessment
${report.risk_assessment || ""}

### Attack Path Analysis
${report.attack_path_analysis || ""}

### Findings
${(report.findings || []).map((f: string) => `• ${f}`).join("\n")}

### Recommendations
${(report.recommendations || []).map((r: string) => `• ${r}`).join("\n")}
      `.trim();


      setDynamicMessages(prev => [...prev, { role: 'ai', content: aiResponseText }]);
    } catch (err: any) {
      // Fallback network error or complete API failure
      const friendlyMessage = `Sorry, I'm unable to answer this investigation right now.\n\nThe AI service is temporarily unavailable.\n\nPlease try again later.`;
      setDynamicMessages(prev => [...prev, { role: 'ai', content: friendlyMessage }]);
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim()) return;
    
    if (activeChatId === null) {
      setActiveChatId(Date.now());
    }

    // Check if the query contains a UUID or ARN
    const uuidMatch = inputValue.match(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/);
    const arnMatch = inputValue.match(/arn:aws:[a-zA-Z0-9-]+:[a-zA-Z0-9-]*:[0-9]+:[a-zA-Z0-9-\/]+/);
    
    let identityId = "";
    if (uuidMatch) {
      identityId = uuidMatch[0];
    } else if (arnMatch) {
      identityId = arnMatch[0];
    } else {
      // Fallback: Fetch top identity
      try {
        const { default: api } = await import("@/lib/api");
        const res = await api.get('/identities');
        if (res && res.length > 0) {
          const sorted = res.sort((a: any, b: any) => b.risk_score - a.risk_score);
          identityId = sorted[0].id;
        } else {
          identityId = "1";
        }
      } catch (e) {
        identityId = "1";
      }
    }

    triggerInvestigation(identityId, inputValue);
    setInputValue("");
  };

  // Run automatically if identityId query parameter is present in URL
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const identityId = params.get('identityId');
      if (identityId) {
        setActiveChatId(999);
        triggerInvestigation(identityId);
        // Clean URL query
        window.history.replaceState({}, '', '/ai-investigation');
      }
    }
  }, []);

  const handleNewChat = () => {
    setActiveChatId(null);
    setDynamicMessages([]);
  };

  return (
    <div className="pb-8 h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT SIDEBAR (30%) */}
      <div className="w-full md:w-[30%] flex flex-col gap-4">
        <button 
          onClick={handleNewChat}
          className="w-full btn btn-primary py-3 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Investigation
        </button>

        <div className="bg-white border border-slate-200 rounded-xl flex-1 flex flex-col overflow-hidden shadow-sm">
          <div className="p-4 border-b border-slate-100 bg-slate-50">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Investigation History</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2">
            {activeChatId === 999 && (
              <button className="w-full text-left p-3 flex flex-col gap-1 rounded-lg transition-colors border-l-2 mb-1 bg-indigo-50 border-indigo-600 shadow-sm">
                <span className="text-sm font-semibold truncate text-indigo-900">Active Investigation</span>
                <span className="text-xs text-indigo-500 font-mono">just now</span>
              </button>
            )}
            {RECENT_CHATS.map((chat) => (
              <button
                key={chat.id}
                onClick={() => {
                  setActiveChatId(chat.id);
                  setDynamicMessages([]);
                }}
                className={`w-full text-left p-3 flex flex-col gap-1 rounded-lg transition-colors border-l-2 mb-1 ${
                  activeChatId === chat.id && activeChatId !== 999
                    ? "bg-indigo-50/50 border-indigo-600 shadow-sm text-indigo-900"
                    : "border-transparent hover:bg-slate-50 text-slate-600"
                }`}
              >
                <span className="text-sm font-semibold truncate">
                  {chat.title}
                </span>
                <span className="text-xs text-slate-400 font-mono">{chat.time}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT WORKSPACE (70%) */}
      <div className="w-full md:w-[70%] bg-white border border-slate-200 rounded-xl flex flex-col overflow-hidden shadow-sm h-full">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-100 bg-slate-50 shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="w-6 h-6 text-indigo-600" />
            <h1 className="text-xl font-bold tracking-tight text-slate-900">SentinelAI Copilot</h1>
            <div className="ml-auto flex items-center gap-1.5 px-3 py-1 bg-indigo-100/50 border border-indigo-200 rounded-full text-[10px] font-bold text-indigo-700 uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              GPT-Sec Reasoning Engine
            </div>
          </div>
          <p className="text-slate-500 text-sm">Query machine profiles, lateral movements, and cloud identity relationships.</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative bg-slate-50/50">
          
          <AnimatePresence mode="wait">
            {activeChatId === null && dynamicMessages.length === 0 ? (
              /* Quick Prompts State */
              <motion.div 
                key="prompts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 rounded-2xl bg-indigo-100 border border-indigo-200 flex items-center justify-center mb-6 shadow-sm">
                  <BrainCircuit className="w-8 h-8 text-indigo-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-8">How can I help secure your cloud identities today?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setInputValue(prompt);
                      }}
                      className="text-left bg-white border border-slate-200 hover:border-indigo-600 p-4 rounded-xl transition-all hover:bg-slate-50 group flex items-start gap-3 shadow-sm"
                    >
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-600 shrink-0 mt-0.5 transition-colors" />
                      <span className="text-sm text-slate-700 font-semibold group-hover:text-slate-900 transition-colors">{prompt}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : (
              /* Normal / Dynamic Message History View */
              <div className="flex flex-col gap-6 pb-10">


                {/* Render dynamically exchanged messages */}
                {dynamicMessages.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end pl-12' : 'flex-col items-start pr-12 gap-3'}`}>
                    {msg.role === 'user' ? (
                      <div className="bg-indigo-600 text-white px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm inline-block text-sm font-semibold">
                        {msg.content}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0">
                            <BrainCircuit className="w-4 h-4 text-indigo-600" />
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-full text-[10px] font-bold text-emerald-700 uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" />
                            Copilot Analysis
                          </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-r-xl rounded-bl-xl p-5 shadow-sm flex flex-col gap-3 text-sm text-slate-700 ml-4 leading-relaxed whitespace-pre-wrap">
                          {msg.content}
                        </div>
                      </>
                    )}
                  </div>
                ))}

                {isPending && (
                  <div className="flex items-start gap-3 mt-4">
                    <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 animate-spin">
                      <Loader2 className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div className="flex items-center h-8">
                      <span className="text-sm font-semibold text-slate-500 animate-pulse">SentinelAI Copilot is analyzing database logs and threat paths...</span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </AnimatePresence>

        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 bg-white shrink-0 relative z-10">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask SentinelAI Copilot (e.g. Investigate profile 1)..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600/10 outline-none rounded-xl py-3.5 pl-4 pr-12 text-sm text-slate-900 placeholder:text-slate-400 transition-all"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors shadow-sm"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-3">
            <p className="text-[11px] text-slate-400">
              SentinelAI Copilot is grounded on your cloud telemetry. Responses cite evidence.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
