"use client";

import { useState, useEffect } from "react";
import { Plus, MessageSquare, BrainCircuit, Sparkles, Send, ShieldCheck, Map, Clock, Ticket, FileCode, Loader2, ArrowRight, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const RECENT_CHATS = [
  { id: 1, title: "Lateral movement: payments → lake", time: "2h ago" },
  { id: 2, title: "Audit: stale GCP service accounts", time: "yesterday" },
  { id: 3, title: "Patch: terraform-ci-runner OIDC", time: "2d ago" },
  { id: 4, title: "Why was inv-2829 closed?", time: "3d ago" },
  { id: 5, title: "Compare risk: prod vs staging", time: "1w ago" },
];

const QUICK_PROMPTS = [
  "What identities are most at risk this week?",
  "Show me lateral movement from payments to data lake",
  "Which OIDC roles still have wildcard trust policies?",
  "Draft a least-privilege policy for terraform-ci-runner",
];

export default function AIInvestigationPage() {
  const [activeChatId, setActiveChatId] = useState<number | null>(1);
  const [inputValue, setInputValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [dynamicMessages, setDynamicMessages] = useState<{role: 'user' | 'ai', content: string}[]>([]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    
    // If it's the quick prompts screen, start a new chat
    if (activeChatId === null) {
      setActiveChatId(Date.now());
    }

    setDynamicMessages(prev => [...prev, { role: 'user', content: inputValue }]);
    setInputValue("");
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      setDynamicMessages(prev => [...prev, { role: 'ai', content: `I've analyzed the graph for your query. The telemetry confirms your observation. Do you want me to generate an IR ticket or map the blast radius?` }]);
    }, 1500);
  };

  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.search.includes('prompt=run_full_investigation')) {
      setActiveChatId(999);
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1200);
      
      // Clean up URL so it doesn't trigger again on refresh
      window.history.replaceState({}, '', '/ai-investigation');
    }
  }, []);

  const handleNewChat = () => {
    setActiveChatId(null);
  };

  return (
    <div className="animate-in fade-in duration-500 pb-8 h-[calc(100vh-6rem)] flex flex-col md:flex-row gap-6">
      
      {/* LEFT SIDEBAR (30%) */}
      <div className="w-full md:w-[30%] flex flex-col gap-4">
        {/* New Investigation Button */}
        <button 
          onClick={handleNewChat}
          className="w-full btn btn-primary py-3 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(211,245,49,0.3)]"
        >
          <Plus className="w-4 h-4" />
          New Investigation
        </button>

        {/* Recent Chats List */}
        <div className="bg-transparent border border-glass-subtle rounded-xl flex-1 flex flex-col overflow-hidden shadow-lg">
          <div className="p-4 border-b border-glass-subtle border">
            <h3 className="text-xs font-bold text-text-muted uppercase tracking-wider">Recent</h3>
          </div>
          <div className="flex-1 overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-glass-active scrollbar-track-transparent">
            {activeChatId === 999 && (
              <button className="w-full text-left p-3 flex flex-col gap-1 rounded-lg transition-colors border-l-2 mb-1 bg-glass-subtle border-[#6366f1] shadow-sm">
                <span className="text-sm font-medium truncate text-text-primary">Run a full investigation...</span>
                <span className="text-xs text-text-muted font-mono">just now</span>
              </button>
            )}
            {RECENT_CHATS.map((chat) => (
              <button
                key={chat.id}
                onClick={() => setActiveChatId(chat.id)}
                className={`w-full text-left p-3 flex flex-col gap-1 rounded-lg transition-colors border-l-2 mb-1 ${
                  activeChatId === chat.id
                    ? "bg-glass-subtle border-[#6366f1] shadow-sm"
                    : "border-transparent hover:bg-white/10 text-text-muted"
                }`}
              >
                <span className={`text-sm font-medium truncate ${activeChatId === chat.id ? "text-text-primary" : "text-text-muted"}`}>
                  {chat.title}
                </span>
                <span className="text-xs text-text-muted font-mono">{chat.time}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT WORKSPACE (70%) */}
      <div className="w-full md:w-[70%] bg-transparent border border-glass-subtle rounded-xl flex flex-col overflow-hidden shadow-lg h-full">
        
        {/* Header */}
        <div className="p-5 border-b border-glass-subtle border bg-gradient-to-r from-[#151a22] to-[#0f1318] shrink-0">
          <div className="flex items-center gap-3 mb-2">
            <BrainCircuit className="w-6 h-6 text-[#6366f1]" />
            <h1 className="text-xl font-bold tracking-tight text-text-primary">SentryIQ AI Investigation</h1>
            <div className="ml-auto flex items-center gap-2 px-3 py-1 bg-[#1e1b4b]/50 border border-[#818cf8]/20 rounded-full text-[10px] font-bold text-[#818cf8] uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              Reasoning Engine · GPT-Sec · 32k context
            </div>
          </div>
          <p className="text-text-muted text-sm">Ask anything about machine identities, attack paths, or cloud posture.</p>
        </div>

        {/* Chat Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 relative">
          
          <AnimatePresence mode="wait">
            {activeChatId === null ? (
              /* Quick Prompts State */
              <motion.div 
                key="prompts"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="flex flex-col items-center justify-center h-full text-center max-w-2xl mx-auto"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#6366f1]/20 to-[#06b6d4]/20 border border-[#6366f1]/30 flex items-center justify-center mb-6 shadow-[0_0_30px_rgba(99,102,241,0.15)]">
                  <BrainCircuit className="w-8 h-8 text-[#6366f1]" />
                </div>
                <h2 className="text-2xl font-bold text-text-primary mb-8">How can I help you secure your environment today?</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
                  {QUICK_PROMPTS.map((prompt, i) => (
                    <button 
                      key={i}
                      onClick={() => {
                        setInputValue(prompt);
                      }}
                      className="text-left bg-glass-subtle border border-glass-subtle hover:border-[#6366f1] p-4 rounded-xl transition-all hover:bg-slate-100/80 group flex items-start gap-3"
                    >
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-[#6366f1] shrink-0 mt-0.5 transition-colors" />
                      <span className="text-sm text-text-secondary group-hover:text-slate-900 transition-colors">{prompt}</span>
                    </button>
                  ))}
                </div>
              </motion.div>
            ) : activeChatId === 999 ? (
              /* Injected Quick Action Chat State */
              <motion.div 
                key="chat-999"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-8 pb-10"
              >
                <div className="flex justify-end pl-12">
                  <div className="bg-glass-subtle border border-glass-subtle text-text-primary px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm inline-block">
                    Run a full investigation on current high-risk machine identities
                  </div>
                </div>

                {isTyping ? (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-start gap-3 mt-2"
                  >
                    <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-4 h-4 text-[#6366f1]" />
                    </div>
                    <div className="bg-transparent border border-glass-subtle px-4 py-3 rounded-2xl rounded-tl-sm flex gap-1.5 items-center h-[46px]">
                      <motion.div className="w-1.5 h-1.5 bg-[#64748b] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0 }} />
                      <motion.div className="w-1.5 h-1.5 bg-[#64748b] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }} />
                      <motion.div className="w-1.5 h-1.5 bg-[#64748b] rounded-full" animate={{ y: [0, -4, 0] }} transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }} />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="flex flex-col items-start pr-12 gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center shrink-0">
                        <BrainCircuit className="w-4 h-4 text-[#6366f1]" />
                      </div>
                      <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100/40 border border-[#22c55e]/30 rounded-full text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">
                        <ShieldCheck className="w-3 h-3" />
                        98% confidence
                      </div>
                    </div>
                    
                    <div className="bg-transparent border-l-4 border-[#6366f1] rounded-r-xl rounded-bl-xl p-5 shadow-md flex flex-col gap-4 text-sm text-text-secondary ml-4 leading-relaxed">
                      <p>I've analyzed your current identity posture. Here's what I found:</p>
                      
                      <ul className="flex flex-col gap-3">
                        <li className="flex gap-2">
                          <span className="text-[#ef4444] mt-1">•</span>
                          <div>
                            <span className="font-mono text-[#06b6d4]">i-prod-payments-svc</span> — <span className="text-[#ef4444] font-bold">Risk 94</span>. Key is 312 days old with no rotation. Assumed roles across 3 accounts outside baseline.
                          </div>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#f97316] mt-1">•</span>
                          <div>
                            <span className="font-mono text-[#06b6d4]">k8s-prod-cluster-admin</span> — <span className="text-[#f97316] font-bold">Risk 88</span>. Cluster-admin binding in billing namespace detected.
                          </div>
                        </li>
                        <li className="flex gap-2">
                          <span className="text-[#f97316] mt-1">•</span>
                          <div>
                            <span className="font-mono text-[#06b6d4]">terraform-ci-runner</span> — <span className="text-[#f97316] font-bold">Risk 81</span>. OIDC trust policy uses wildcard subject claim.
                          </div>
                        </li>
                      </ul>

                      <p className="mt-2 text-text-primary">
                        <strong>Recommended actions:</strong> Rotate payments-svc key immediately, down-scope cluster-admin RBAC, pin OIDC subject claim to specific branch.
                      </p>
                      
                      <div className="flex flex-wrap gap-2 mt-2 pt-4 border-t border-glass-subtle border">
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:bg-glass-active hover:text-white transition-colors border border-glass-active">
                          <Map className="w-3.5 h-3.5" /> Map blast radius
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:bg-glass-active hover:text-white transition-colors border border-glass-active">
                          <Ticket className="w-3.5 h-3.5" /> Generate IR ticket
                        </button>
                        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:bg-glass-active hover:text-white transition-colors border border-glass-active">
                          <Download className="w-3.5 h-3.5" /> Export findings
                        </button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            ) : (
              /* Normal Mock Conversation State (Chat 1) */
              <motion.div 
                key="chat-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col gap-8 pb-10"
              >
                <div className="flex justify-end pl-12">
                  <div className="bg-glass-subtle border border-glass-subtle text-text-primary px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm inline-block">
                    What identities pose the highest risk to our payments pipeline?
                  </div>
                </div>

                <div className="flex flex-col items-start pr-12 gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center shrink-0">
                      <BrainCircuit className="w-4 h-4 text-[#6366f1]" />
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100/40 border border-[#22c55e]/30 rounded-full text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">
                      <ShieldCheck className="w-3 h-3" />
                      94% confidence · 3 sources cited
                    </div>
                  </div>
                  
                  <div className="bg-transparent border-l-4 border-[#6366f1] rounded-r-xl rounded-bl-xl p-5 shadow-md flex flex-col gap-4 text-sm text-text-secondary ml-4 leading-relaxed">
                    <p>
                      Based on your current CloudTrail logs and IAM configurations, I have identified 3 identities with critical risk scores affecting the payments pipeline:
                    </p>
                    <div className="flex flex-col gap-3 mt-1">
                      <div className="bg-glass-subtle border border-glass-subtle p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-mono text-[#06b6d4]">i-prod-payments-svc</span>
                          <span className="text-text-muted ml-2 font-mono text-xs">(AWS)</span>
                        </div>
                        <div className="px-2 py-0.5 rounded text-xs font-bold border bg-[#450a0a] text-[#ef4444] border-[#ef4444]/20">Score: 94</div>
                      </div>
                      <div className="bg-glass-subtle border border-glass-subtle p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-mono text-[#06b6d4]">azure-fn-stripe-webhook</span>
                          <span className="text-text-muted ml-2 font-mono text-xs">(Azure)</span>
                        </div>
                        <div className="px-2 py-0.5 rounded text-xs font-bold border bg-[#7c2d12] text-[#f97316] border-[#f97316]/20">Score: 76</div>
                      </div>
                      <div className="bg-glass-subtle border border-glass-subtle p-3 rounded-lg flex items-center justify-between">
                        <div>
                          <span className="font-mono text-[#06b6d4]">k8s-payment-controller</span>
                          <span className="text-text-muted ml-2 font-mono text-xs">(GKE)</span>
                        </div>
                        <div className="px-2 py-0.5 rounded text-xs font-bold border bg-[#7c2d12] text-[#f97316] border-[#f97316]/20">Score: 68</div>
                      </div>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 mt-2">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:bg-glass-active hover:text-white transition-colors border border-glass-active">
                        <Map className="w-3.5 h-3.5" /> Map blast radius
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:bg-glass-active hover:text-white transition-colors border border-glass-active">
                        <Clock className="w-3.5 h-3.5" /> Show attack timeline
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:bg-glass-active hover:text-white transition-colors border border-glass-active">
                        <Ticket className="w-3.5 h-3.5" /> Generate IR ticket
                      </button>
                      <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-text-muted hover:bg-glass-active hover:text-white transition-colors border border-glass-active">
                        <FileCode className="w-3.5 h-3.5" /> Compare to baseline
                      </button>
                    </div>
                  </div>
                </div>

                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  className="flex items-start gap-3 mt-4"
                >
                  <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shrink-0">
                    <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
                  </div>
                  <div className="flex items-center h-8">
                    <span className="text-sm font-medium text-text-muted animate-pulse">Drafting remediation plan...</span>
                  </div>
                </motion.div>
                
                {/* Dynamic Messages */}
                {dynamicMessages.map((msg, i) => (
                  <motion.div key={`dyn-${i}`} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className={`flex ${msg.role === 'user' ? 'justify-end pl-12' : 'flex-col items-start pr-12 gap-3'} mt-2`}>
                    {msg.role === 'user' ? (
                      <div className="bg-glass-subtle border border-glass-subtle text-text-primary px-5 py-3 rounded-2xl rounded-tr-sm shadow-sm inline-block">
                        {msg.content}
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-[#6366f1]/10 border border-[#6366f1]/30 flex items-center justify-center shrink-0">
                            <BrainCircuit className="w-4 h-4 text-[#6366f1]" />
                          </div>
                          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-green-100/40 border border-[#22c55e]/30 rounded-full text-[10px] font-bold text-[#22c55e] uppercase tracking-wider">
                            <ShieldCheck className="w-3 h-3" />
                            AI Assistant
                          </div>
                        </div>
                        <div className="bg-transparent border-l-4 border-[#6366f1] rounded-r-xl rounded-bl-xl p-5 shadow-md flex flex-col gap-4 text-sm text-text-secondary ml-4 leading-relaxed">
                          <p>{msg.content}</p>
                        </div>
                      </>
                    )}
                  </motion.div>
                ))}

                {isTyping && activeChatId !== 999 && (
                  <motion.div 
                    initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="flex items-start gap-3 mt-4"
                  >
                    <div className="w-8 h-8 rounded-lg bg-transparent flex items-center justify-center shrink-0">
                      <Loader2 className="w-5 h-5 text-text-muted animate-spin" />
                    </div>
                    <div className="flex items-center h-8">
                      <span className="text-sm font-medium text-text-muted animate-pulse">Thinking...</span>
                    </div>
                  </motion.div>
                )}
                
              </motion.div>
            )}
          </AnimatePresence>

        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-glass-subtle border bg-glass-subtle shrink-0 relative z-10">
          <div className="relative flex items-center">
            <input 
              type="text" 
              placeholder="Ask SentryIQ AI..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSend();
              }}
              className="w-full bg-glass-subtle border border-glass-subtle hover:border-glass-active focus:border-[#6366f1] focus:ring-1 focus:ring-[#6366f1]/50 outline-none rounded-xl py-3.5 pl-4 pr-12 text-sm text-text-primary placeholder:text-text-muted transition-all"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-[#D3F531] hover:bg-[#bde026] text-text-primary rounded-lg transition-colors"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
          <div className="text-center mt-3">
            <p className="text-[11px] text-text-muted">
              Sentinel AI is grounded on your cloud telemetry. Responses cite evidence.
            </p>
          </div>
        </div>
        
      </div>
    </div>
  );
}
