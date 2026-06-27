"use client";

import { Bell, Search, MessageSquare, Plus } from "lucide-react";
import { motion } from "framer-motion";

export default function TopNav() {
  return (
    <header className="h-20 z-40 flex items-center justify-between px-6 pt-4 mb-2">
      <div className="flex items-center gap-6">
        {/* Floating Glass Search Pill */}
        <div className="relative group flex items-center">
          <input
            type="text"
            placeholder="Search Here..."
            className="h-11 w-64 md:w-80 rounded-2xl pl-4 pr-12 text-sm text-text-primary placeholder:text-gray-400 bg-glass-subtle border border-glass-subtle backdrop-blur-md focus:outline-none focus:ring-1 focus:ring-[#D3F531] transition-all shadow-[inset_0_2px_4px_rgba(0,0,0,0.2)]"
          />
          <div className="absolute right-2 flex items-center">
            <kbd className="inline-flex items-center justify-center h-7 px-2 rounded-xl text-xs font-semibold bg-glass-active text-text-secondary border border-glass-subtle">
              ⌘K
            </kbd>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Message Icon */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full flex items-center justify-center bg-glass-subtle border border-glass-subtle text-text-secondary hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <MessageSquare className="w-4 h-4" />
        </motion.button>

        {/* Notification Icon */}
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-10 h-10 rounded-full flex items-center justify-center bg-glass-subtle border border-glass-subtle text-text-secondary hover:text-white hover:bg-white/10 transition-colors backdrop-blur-md shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#D3F531] rounded-full shadow-[0_0_8px_rgba(211,245,49,0.8)]"></span>
        </motion.button>
        
        {/* User Dropdown Profile (Floating pill style) */}
        <div className="h-11 pl-1.5 pr-4 rounded-full flex items-center gap-3 bg-glass-subtle border border-glass-subtle backdrop-blur-md cursor-pointer hover:bg-white/10 transition-colors shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]">
          <div className="w-8 h-8 rounded-full bg-[#D3F531]/20 border border-[#D3F531]/40 flex items-center justify-center overflow-hidden text-[#D3F531] font-bold text-xs">
            DO
          </div>
          <div className="flex flex-col">
            <span className="text-xs font-bold text-text-primary leading-tight">David Owner</span>
            <span className="text-[9px] text-text-muted">admin@fn.net</span>
          </div>
          <div className="ml-2 w-4 h-4 flex items-center justify-center text-text-muted">
            <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        </div>
      </div>
    </header>
  );
}
