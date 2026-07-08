"use client";

import { ShieldCheck, Code, Globe } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full relative z-10 pt-16 pb-12 px-6 border-t border-slate-200 bg-white">
      <div className="max-w-[1200px] mx-auto grid grid-cols-2 md:grid-cols-5 gap-10 md:gap-6">
        
        {/* Col 1 */}
        <div className="col-span-2 flex flex-col gap-4">
          <div className="flex items-center gap-2.5 mb-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-[family-name:var(--font-jakarta)] text-slate-900 font-bold text-xl">
              SentinelAI
            </span>
          </div>
          <p className="text-slate-500 text-sm mb-4 max-w-sm">
            AI-native cloud identity security platform mapping relationship paths and risk anomalies.
          </p>
          <div className="flex items-center gap-4 text-slate-400">
            <a href="#" className="hover:text-indigo-600 transition-colors"><Code className="w-5 h-5" /></a>
            <a href="#" className="hover:text-indigo-600 transition-colors"><Globe className="w-5 h-5" /></a>
          </div>
        </div>

        {/* Col 2 */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-slate-900 mb-2">Platform</h4>
          {[{name: 'Identity Center', href: '/#features'}, {name: 'Threat Graph', href: '/#platform'}, {name: 'Risk Center', href: '/#security'}, {name: 'SentinelAI Copilot', href: '/#features'}].map(link => (
            <Link key={link.name} href={link.href} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Col 3 */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-slate-900 mb-2">Resources</h4>
          {[{name: 'Documentation', href: '/#documentation'}, {name: 'Solutions', href: '/#solutions'}, {name: 'Security', href: '/#security'}, {name: 'Trust Center', href: '/#company'}].map(link => (
            <Link key={link.name} href={link.href} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
              {link.name}
            </Link>
          ))}
        </div>

        {/* Col 4 */}
        <div className="flex flex-col gap-3">
          <h4 className="font-semibold text-slate-900 mb-2">Legal & Trust</h4>
          {[{name: 'Privacy Policy', href: '/privacy'}, {name: 'Terms of Service', href: '/terms'}, {name: 'Status', href: '/status'}].map(link => (
            <Link key={link.name} href={link.href} className="text-slate-500 text-sm hover:text-slate-900 transition-colors">
              {link.name}
            </Link>
          ))}
        </div>
      </div>

      <div className="max-w-[1200px] mx-auto mt-16 pt-8 border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-slate-400 text-xs">
          &copy; 2026 SentinelAI. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
