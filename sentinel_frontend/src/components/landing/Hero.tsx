"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative z-10 w-full min-h-[calc(100vh-120px)] flex flex-col lg:flex-row items-center pt-[120px] pb-20 overflow-hidden">
      
      {/* Left Column (Text Content) - 45% width */}
      <div className="w-full lg:w-[45%] flex flex-col items-start px-6 lg:pl-[100px] relative z-20">
        <motion.h1 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="font-serif font-bold text-[48px] lg:text-[64px] leading-[1.05] text-indigo-600 tracking-tight"
        >
          Turn cloud <span className="text-[#1A1A2E] highlight">identity risks</span> into continuous <span className="text-[#1A1A2E] highlight">protection</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="text-[17px] text-slate-600 max-w-[480px] mt-5 leading-[1.6]"
        >
          SentinelAI makes it easy to continuously discover machine identities, map attack paths with graph intelligence, and resolve risks before they escalate.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="mt-6"
        >
          <Link
            href="/signup"
            className="group flex items-center justify-between rounded-full bg-indigo-600 text-white pl-2.5 pr-7 py-2.5 transition-all hover:bg-indigo-700 shadow-sm"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center mr-4 transition-transform group-hover:scale-105">
              <ArrowRight className="w-4 h-4 text-white" strokeWidth={3} />
            </div>
            <span className="font-medium text-[16px]">Try SentinelAI for free</span>
          </Link>
        </motion.div>
      </div>

      {/* Right Column (Illustration) - 55% width */}
      <div className="w-full lg:w-[55%] h-[400px] sm:h-[500px] lg:h-[700px] relative mt-16 lg:mt-0 z-10 flex items-center justify-center">
        <HeroIllustration />
      </div>

    </section>
  );
}

function HeroIllustration() {
  return (
    <div className="w-full h-full relative flex items-center justify-center pointer-events-none">
      {/* 
        We use an inline SVG designed to exactly match the reference layout's
        geometry, perspective, colors, and components (ribbons, central track, and data nodes).
      */}
      <svg
        viewBox="0 0 1000 700"
        className="w-[120%] h-auto absolute left-[-10%] lg:left-[-5%] lg:w-[130%] max-w-none origin-center"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="trackGrad" x1="0" y1="350" x2="1000" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#D25FC7" />
            <stop offset="100%" stopColor="#C531B9" />
          </linearGradient>

          <linearGradient id="greenRibbon" x1="0" y1="450" x2="1000" y2="150" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF8E8" stopOpacity="0" />
            <stop offset="50%" stopColor="#78A564" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FEF8E8" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="orangeRibbon" x1="0" y1="500" x2="1000" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF8E8" stopOpacity="0" />
            <stop offset="50%" stopColor="#FB9650" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FEF8E8" stopOpacity="0" />
          </linearGradient>

          <linearGradient id="plumRibbon" x1="0" y1="400" x2="1000" y2="550" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#FEF8E8" stopOpacity="0" />
            <stop offset="50%" stopColor="#360F3C" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#B826AB" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {/* --- Background Sweeping Ribbons --- */}
        {/* Green Ribbon */}
        <path d="M-100 480 C 300 450, 600 280, 1100 200 L 1100 240 C 600 320, 300 490, -100 520 Z" fill="url(#greenRibbon)" />
        {/* Plum Ribbon */}
        <path d="M-100 500 C 400 520, 600 380, 1100 450 L 1100 480 C 600 410, 400 550, -100 530 Z" fill="url(#plumRibbon)" />
        {/* Orange Ribbon */}
        <path d="M-100 520 C 300 580, 500 500, 1100 600 L 1100 640 C 500 540, 300 620, -100 560 Z" fill="url(#orangeRibbon)" />

        {/* Ribbon Chevrons */}
        <path d="M600 295 L605 300 L600 305 M608 295 L613 300 L608 305" stroke="#360F3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M850 565 L855 570 L850 575 M858 565 L863 570 L858 575" stroke="#360F3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        {/* --- Main Central Track --- */}
        <rect x="-50" y="320" width="1100" height="60" rx="30" fill="url(#trackGrad)" />
        <line x1="0" y1="350" x2="1000" y2="350" stroke="#360F3C" strokeWidth="1" strokeDasharray="10 5" opacity="0.3" />
        
        {/* Track Details: 3D Nodes */}
        <g transform="translate(150, 330)">
          <path d="M0 10 L15 0 L55 0 L40 10 Z" fill="#EEF2FF" opacity="0.8" />
          <path d="M0 10 L40 10 L40 30 L0 30 Z" fill="#B826AB" opacity="0.7" />
          <path d="M40 10 L55 0 L55 20 L40 30 Z" fill="#360F3C" opacity="0.6" />
        </g>
        
        <g transform="translate(580, 330)">
          <path d="M0 10 L15 0 L55 0 L40 10 Z" fill="#EEF2FF" opacity="0.8" />
          <path d="M0 10 L40 10 L40 30 L0 30 Z" fill="#B826AB" opacity="0.7" />
          <path d="M40 10 L55 0 L55 20 L40 30 Z" fill="#360F3C" opacity="0.6" />
        </g>

        {/* Track Trackers & Ticks */}
        <rect x="250" y="347" width="40" height="6" fill="#FFFFFF" opacity="0.8" />
        <rect x="350" y="347" width="20" height="6" fill="#360F3C" opacity="0.8" />
        <rect x="420" y="347" width="15" height="6" fill="#FB9650" opacity="0.8" />
        <rect x="470" y="347" width="30" height="6" fill="#FFFFFF" opacity="0.9" />
        <circle cx="550" cy="350" r="4" fill="#360F3C" />
        
        <path d="M630 345 L635 350 L630 355 M638 345 L643 350 L638 355" stroke="#360F3C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        
        <rect x="680" y="347" width="10" height="6" fill="#FFFFFF" />
        <rect x="730" y="347" width="25" height="6" fill="#FB9650" />
        <rect x="790" y="344" width="8" height="12" fill="#360F3C" />

        {/* --- Floating Nodes & Connector Lines --- */}
        
        {/* 1. Hexagon Cube (Top Left) */}
        <g transform="translate(580, 160)">
          <line x1="0" y1="50" x2="0" y2="190" stroke="#614D56" strokeWidth="1.5" />
          <rect x="-3" y="187" width="6" height="6" fill="#360F3C" />
          <rect x="-3" y="110" width="6" height="6" fill="#360F3C" />
          
          {/* Hexagon Border */}
          <polygon points="0,-40 34.6,-20 34.6,20 0,40 -34.6,20 -34.6,-20" fill="#FFFFFF" stroke="#360F3C" strokeWidth="2" />
          {/* 3D Cube inside */}
          <path d="M0 0 L0 -25 L-21.6 -12.5 Z" fill="#FB9650" />
          <path d="M0 0 L-21.6 -12.5 L-21.6 12.5 L0 25 Z" fill="#C531B9" />
          <path d="M0 0 L0 25 L21.6 12.5 L21.6 -12.5 Z" fill="#360F3C" />
        </g>

        {/* 2. Donut Chart Circle (Top Right) */}
        <g transform="translate(790, 230)">
          <line x1="0" y1="35" x2="0" y2="120" stroke="#614D56" strokeWidth="1.5" />
          <rect x="-3" y="117" width="6" height="6" fill="#360F3C" />
          
          <circle cx="0" cy="0" r="30" fill="#FFFFFF" stroke="#360F3C" strokeWidth="2" />
          {/* Donut Chart Segments */}
          <path d="M0 0 L0 -20 A20 20 0 0 1 17.3 -10 Z" fill="#C531B9" />
          <path d="M0 0 L17.3 -10 A20 20 0 0 1 10 17.3 Z" fill="#360F3C" />
          <path d="M0 0 L10 17.3 A20 20 0 0 1 -17.3 10 Z" fill="#78A564" />
          <path d="M0 0 L-17.3 10 A20 20 0 0 1 0 -20 Z" fill="#D25FC7" />
          {/* Inner Donut Hole */}
          <circle cx="0" cy="0" r="8" fill="#FFFFFF" />
        </g>

        {/* 3. Data Mosaic 1 (Bottom Center-Left) */}
        <g transform="translate(520, 500)">
          <line x1="0" y1="-150" x2="0" y2="-30" stroke="#614D56" strokeWidth="1.5" />
          <rect x="-3" y="-150" width="6" height="6" fill="#360F3C" />
          
          <rect x="-24" y="-24" width="48" height="48" rx="6" fill="#FFFFFF" stroke="#360F3C" strokeWidth="2" />
          {/* Grid Tiles */}
          <rect x="-16" y="-16" width="10" height="10" fill="#C531B9" />
          <rect x="-2" y="-16" width="10" height="10" fill="#FB9650" />
          <rect x="12" y="-16" width="10" height="10" fill="#360F3C" />
          
          <rect x="-16" y="-2" width="10" height="10" fill="#78A564" />
          <rect x="-2" y="-2" width="10" height="10" fill="#D25FC7" />
          <rect x="12" y="-2" width="10" height="10" fill="#FB9650" />
          
          <rect x="-16" y="12" width="10" height="10" fill="#360F3C" />
          <rect x="-2" y="12" width="10" height="10" fill="#C531B9" />
          <rect x="12" y="12" width="10" height="10" fill="#FEF8E8" stroke="#E8C4E3" strokeWidth="1" />
        </g>

        {/* 4. Data Mosaic 2 (Bottom Right) */}
        <g transform="translate(740, 430)">
          <line x1="0" y1="-80" x2="0" y2="-40" stroke="#614D56" strokeWidth="1.5" />
          <rect x="-3" y="-83" width="6" height="6" fill="#360F3C" />
          
          <rect x="-20" y="-35" width="40" height="70" rx="4" fill="#FFFFFF" stroke="#360F3C" strokeWidth="2" />
          {/* Grid Tiles */}
          <rect x="-12" y="-27" width="10" height="16" fill="#C531B9" />
          <rect x="2" y="-27" width="10" height="10" fill="#78A564" />
          
          <rect x="-12" y="-7" width="10" height="10" fill="#FB9650" />
          <rect x="2" y="-13" width="10" height="20" fill="#360F3C" />
          
          <rect x="-12" y="7" width="10" height="20" fill="#D25FC7" />
          <rect x="2" y="11" width="10" height="16" fill="#FB9650" />
        </g>

        {/* Minor vertical grid tracking lines */}
        <line x1="790" y1="350" x2="790" y2="440" stroke="#614D56" strokeWidth="1.5" opacity="0.5" strokeDasharray="4 4" />
        <line x1="580" y1="350" x2="580" y2="450" stroke="#614D56" strokeWidth="1.5" opacity="0.5" strokeDasharray="4 4" />

      </svg>
    </div>
  );
}
