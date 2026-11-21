import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  Radio, 
  Activity, 
  ArrowRight, 
  ChevronRight, 
  Zap, 
  AlertTriangle, 
  Compass, 
  Waves, 
  HeartHandshake, 
  LifeBuoy, 
  Layers, 
  CheckCircle2, 
  ExternalLink,
  Cpu,
  Lock,
  PhoneCall,
  UserCheck
} from 'lucide-react';

export default function LandingPage({ 
  onEnterCitizen, 
  onEnterAdmin, 
  onOpenLogin,
  currentUser,
  currentOfficer
}) {
  const [activeTab, setActiveTab] = useState('all');

  // Matrix-style falling telemetry characters in hero
  const matrixColumns = [
    { left: '4%', chars: ['λ', '7', 'θ', 'β', 'Ω', '4', '∿', '∇'], delay: '0s', duration: '12s' },
    { left: '11%', chars: ['m³/s', '3', 'Δ', '9', '5', '1', 'α'], delay: '1.5s', duration: '14s' },
    { left: '19%', chars: ['mm/h', '0', '8', 'μ', '6', '2'], delay: '0.8s', duration: '11s' },
    { left: '26%', chars: ['3', '5', '8', 'Ω', '1', '7'], delay: '2.2s', duration: '16s' },
    { left: '33%', chars: ['∇', 'β', '0', '4', '9', 'θ'], delay: '1.1s', duration: '13s' },
    { left: '41%', chars: ['λ', 'm³/s', '5', '2', '8', 'Δ'], delay: '0.3s', duration: '15s' },
    { left: '49%', chars: ['8', '1', 'Ω', '4', '7', '0'], delay: '2.5s', duration: '17s' },
    { left: '57%', chars: ['2', 'β', '3', 'γ', '8', 'β', 'φ'], delay: '1.7s', duration: '12s' },
    { left: '65%', chars: ['9', 'θ', '4', '6', '4', '1'], delay: '0.9s', duration: '14s' },
    { left: '73%', chars: ['7', '8', '2', '9', '5', '1'], delay: '2.8s', duration: '13s' },
    { left: '81%', chars: ['λ', '9', '6', '7', 'β', 'Σ'], delay: '1.3s', duration: '15s' },
    { left: '88%', chars: ['4', '1', '9', '0', '8', '2'], delay: '0.5s', duration: '12s' },
    { left: '95%', chars: ['β', 'Ω', '3', '8', '5', 'φ'], delay: '2.0s', duration: '16s' },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-[#e1e2e5] font-sans selection:bg-amber-400/20 selection:text-amber-200">
      
      {/* ─── TOP MINIMAL NAVIGATION BAR ─── */}
      <header className="sticky top-0 z-50 bg-[#050505]/85 backdrop-blur-md border-b border-white/10 px-6 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Brand Logo & Telemetry Status */}
          <div className="flex items-center gap-4">
            <a href="#landing" className="flex items-center gap-2 group cursor-pointer">
              <span className="font-mono text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
                FloodFlash<span className="text-amber-400">.</span>
              </span>
            </a>
            <div className="hidden md:flex items-center gap-2 px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] font-mono text-slate-300">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>DOPPLER RADAR 04 ACTIVE</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">SECTOR 04 LIVE</span>
            </div>
          </div>

          {/* Center Links */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-mono text-slate-400">
            <a href="#capabilities" className="hover:text-white transition-colors">Capabilities</a>
            <a href="#banner-showcase" className="hover:text-white transition-colors">Radar Array</a>
            <a href="#portals" className="hover:text-white transition-colors">Portal Selector</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
            <a href="#modules" className="hover:text-white transition-colors">Disaster Hubs</a>
            <a href="#alerts" onClick={onEnterCitizen} className="hover:text-white transition-colors text-amber-300/90">Live Alerts</a>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3">
            {/* Google Auth / Sign In Button */}
            {currentUser ? (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium hover:bg-emerald-500/20 transition-all cursor-pointer"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="max-w-[120px] truncate">{currentUser.full_name || currentUser.username}</span>
              </button>
            ) : (
              <button
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-white text-xs font-mono transition-all cursor-pointer group"
              >
                {/* Google Multi-Color G Icon */}
                <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                  <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                  <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                </svg>
                <span>Sign In</span>
              </button>
            )}

            {/* Admin Console Pill */}
            <button
              onClick={onEnterAdmin}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-200 text-xs font-mono font-medium transition-all cursor-pointer"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Admin Gateway</span>
            </button>

            {/* Primary Citizen Entry */}
            <button
              onClick={onEnterCitizen}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-slate-200 text-black text-xs font-mono font-bold transition-all shadow-lg hover:shadow-white/10 cursor-pointer"
            >
              <span>Citizen Portal</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </header>

      {/* ─── HERO SECTION WITH MATRIX TELEMETRY & EDITORIAL HEADLINE ─── */}
      <section className="relative min-h-[85vh] flex flex-col justify-center px-6 pt-16 pb-20 overflow-hidden">
        
        {/* Subtle Matrix Falling Characters in Background */}
        <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden font-mono text-[11px] text-amber-200/80">
          {matrixColumns.map((col, idx) => (
            <div 
              key={idx}
              className="absolute top-0 flex flex-col gap-4 select-none animate-pulse"
              style={{ left: col.left, animationDuration: col.duration, animationDelay: col.delay }}
            >
              {col.chars.map((char, cIdx) => (
                <span key={cIdx} className="opacity-70">{char}</span>
              ))}
            </div>
          ))}
        </div>

        {/* Ambient Radial Glow & Topographic Contour Lines */}
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-gradient-to-b from-amber-500/10 via-cyan-500/5 to-transparent blur-[120px] pointer-events-none"></div>

        {/* Hero Content */}
        <div className="relative max-w-5xl mx-auto w-full text-center space-y-6 z-10">
          
          {/* Micro Telemetry Pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-mono text-slate-300 backdrop-blur-sm shadow-sm">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
            <span className="text-amber-300 font-bold tracking-wider">PREDICTIVE HYDROLOGY COMMAND</span>
            <span className="text-slate-500">•</span>
            <span>UTTARAKHAND CATCHMENTS</span>
          </div>

          {/* Main Display Headline (Style: Reference Conalyzer.) */}
          <h1 className="text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-bold tracking-tight text-white font-mono">
            FloodFlash<span className="text-amber-400">.</span>
          </h1>

          {/* Editorial Subtitle */}
          <p className="max-w-3xl mx-auto text-lg sm:text-xl text-slate-300 font-serif-display font-light italic leading-relaxed">
            Intelligent basin hydrology forecasting & real-time flash flood defense command. 
            Determine catchment inundation, classify terrain vulnerability vectors, and direct automated citizen evacuations.
          </p>

          {/* Monospaced Precision Telemetry Bullets */}
          <div className="pt-2 text-xs sm:text-sm font-mono text-slate-400 flex flex-wrap items-center justify-center gap-x-6 gap-y-2">
            <span className="flex items-center gap-1.5">
              <span className="text-amber-400 font-bold">C++ Runoff Core</span> · Sub-hourly hydrographs
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-cyan-400 font-bold">Doppler Radar</span> · Real-time rainfall velocity
            </span>
            <span className="text-slate-600 hidden sm:inline">•</span>
            <span className="flex items-center gap-1.5">
              <span className="text-emerald-400 font-bold">100% Transparent</span> · Razorpay relief ledger
            </span>
          </div>

          {/* Hero CTAs */}
          <div className="pt-8 flex flex-wrap items-center justify-center gap-4">
            {/* Primary: Citizen Portal */}
            <button
              onClick={onEnterCitizen}
              className="px-8 py-3.5 rounded-full bg-white hover:bg-slate-200 text-black font-mono font-bold text-sm transition-all shadow-xl hover:shadow-white/20 flex items-center gap-2 cursor-pointer group"
            >
              <span>Start Citizen Portal</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>

            {/* Secondary: Admin War Room */}
            <button
              onClick={onEnterAdmin}
              className="px-8 py-3.5 rounded-full bg-black/60 hover:bg-white/10 text-white font-mono text-sm border border-white/20 transition-all flex items-center gap-2 cursor-pointer group backdrop-blur-sm"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Launch Admin Console</span>
            </button>

            {/* Google Auth Quick Sign-In */}
            <button
              onClick={onOpenLogin}
              className="px-6 py-3.5 rounded-full bg-white/5 hover:bg-white/10 text-slate-200 font-mono text-sm border border-white/10 transition-all flex items-center gap-2.5 cursor-pointer backdrop-blur-sm"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
              </svg>
              <span>Continue with Google</span>
            </button>
          </div>

          {/* Quick Stats Strip */}
          <div className="pt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto border-t border-white/10 text-left font-mono">
            <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">PREDICTION ACCURACY</div>
              <div className="text-xl font-bold text-white mt-1">99.4%</div>
              <div className="text-[10px] text-emerald-400 mt-0.5">Verified vs IMD Gauges</div>
            </div>
            <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">SIREN DISPATCH LAG</div>
              <div className="text-xl font-bold text-white mt-1">&lt; 1.2s</div>
              <div className="text-[10px] text-cyan-400 mt-0.5">CAP Protocol Webhooks</div>
            </div>
            <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">VERIFIED SHELTERS</div>
              <div className="text-xl font-bold text-white mt-1">11,500+</div>
              <div className="text-[10px] text-slate-400 mt-0.5">Live Occupancy Feed</div>
            </div>
            <div className="p-3 bg-white/[0.02] rounded-lg border border-white/5">
              <div className="text-[10px] text-slate-500 uppercase tracking-widest">TREASURY AUDITED</div>
              <div className="text-xl font-bold text-white mt-1">₹28.4L</div>
              <div className="text-[10px] text-amber-400 mt-0.5">100% Public Ledger</div>
            </div>
          </div>

        </div>

        {/* Bottom Contoured Horizon Wireframe */}
        <div className="absolute bottom-0 inset-x-0 h-16 pointer-events-none opacity-25">
          <svg className="w-full h-full" viewBox="0 0 1200 64" fill="none" preserveAspectRatio="none">
            <path d="M0 64C150 45 300 20 450 40C600 60 750 25 900 35C1050 45 1125 20 1200 48L1200 64L0 64Z" fill="url(#horizon-grad)" />
            <path d="M0 45C200 25 400 55 600 30C800 10 1000 40 1200 25" stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
            <defs>
              <linearGradient id="horizon-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgba(217, 119, 6, 0.2)" />
                <stop offset="100%" stopColor="transparent" />
              </linearGradient>
            </defs>
          </svg>
        </div>

      </section>

      {/* ─── BANNER SHOWCASE SECTION (THE PROPER BANNER IMAGE) ─── */}
      <section id="banner-showcase" className="relative px-6 py-12 max-w-7xl mx-auto">
        <div className="border border-white/10 rounded-2xl overflow-hidden bg-black/60 shadow-2xl relative group">
          
          {/* Header Bar of Banner */}
          <div className="bg-[#0c0d0e] px-4 py-2.5 border-b border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span className="text-white font-bold">STATE DISASTER RADAR SENSOR ARRAY 04</span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">DUAL POLARIMETRIC DOPPLER TELEMETRY</span>
            </div>
            <div className="flex items-center gap-3 text-[11px]">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/10 text-amber-300">SWEEP: 360° / 300S</span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-300">GRID: 250M</span>
              <span className="text-slate-500 hidden sm:inline">RESOLUTION: SUB-METER HYDROLOGY</span>
            </div>
          </div>

          {/* Banner Image Container */}
          <div className="relative aspect-[16/9] sm:aspect-[21/9] w-full overflow-hidden bg-slate-950">
            <img 
              src="/hero-flood-radar.jpg" 
              alt="FloodFlash Doppler Radar & River Basin Telemetry Array" 
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = '/flood-telemetry-banner.jpg';
              }}
              className="w-full h-full object-cover object-center filter brightness-95 contrast-105 group-hover:scale-102 transition-transform duration-700"
            />
            
            {/* Subtle Gradient Vignette Over Banner */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/30 pointer-events-none"></div>

            {/* Live Interactive Telemetry HUD Overlays */}
            <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-4 pointer-events-none">
              <div className="bg-black/75 backdrop-blur-md border border-white/15 rounded-xl p-4 max-w-md pointer-events-auto">
                <div className="text-[10px] font-mono uppercase tracking-widest text-amber-400 font-bold flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5" />
                  <span>Basin Discharge Convergence</span>
                </div>
                <h3 className="text-lg font-serif-display font-medium text-white mt-1">
                  Mandakini & Alaknanda Confluence
                </h3>
                <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                  Real-time neural routing forecasting peak flood crest 4.2 hours prior to downstream arrival.
                </p>
                <div className="mt-3 flex items-center gap-3 text-xs font-mono">
                  <button 
                    onClick={onEnterCitizen}
                    className="text-amber-300 hover:text-white flex items-center gap-1 font-bold cursor-pointer"
                  >
                    <span>View Inundation Map</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                  <span className="text-slate-600">•</span>
                  <span className="text-emerald-400">Current Flow: Safe</span>
                </div>
              </div>

              {/* Real-time Telemetry Indicators */}
              <div className="hidden md:flex flex-col gap-2 font-mono text-[11px] text-right pointer-events-auto">
                <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-slate-200">
                  <span className="text-slate-400">PRECIPITATION: </span>
                  <span className="text-amber-300 font-bold">14.2 mm/hr (Moderate)</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-slate-200">
                  <span className="text-slate-400">SOIL MOISTURE SATURATION: </span>
                  <span className="text-cyan-300 font-bold">68.4%</span>
                </div>
                <div className="px-3 py-1.5 rounded-lg bg-black/70 backdrop-blur-md border border-white/10 text-slate-200">
                  <span className="text-slate-400">NDRF AIR BRIDGE: </span>
                  <span className="text-emerald-400 font-bold">READY (HELIPAD 02)</span>
                </div>
              </div>
            </div>

          </div>

          {/* Footer Bar of Banner */}
          <div className="bg-[#08090a] px-5 py-3 border-t border-white/10 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-3">
            <div className="flex items-center gap-4">
              <span>LAT: 30.7346° N</span>
              <span>LON: 79.0669° E</span>
              <span>ALT: 1,320M ASL</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-slate-500">IMD AWS NODE ID: AWS-UTK-04</span>
              <button 
                onClick={onEnterAdmin}
                className="text-amber-300 hover:text-white font-bold flex items-center gap-1 cursor-pointer"
              >
                <span>SDMA Officer Telemetry & Overrides</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* ─── DUAL PORTAL SELECTOR: CHOOSE YOUR ROLE ─── */}
      <section id="portals" className="relative px-6 py-20 max-w-7xl mx-auto">
        <div className="text-center space-y-3 mb-12">
          <div className="text-[11px] font-mono tracking-widest uppercase text-slate-400">
            CHOOSE YOUR DISASTER COMMAND VIEW
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif-display font-light text-white">
            Where would you like to navigate?
          </h2>
          <p className="max-w-2xl mx-auto text-sm text-slate-400 font-sans">
            Dedicated consoles tailored for civil residents seeking safety and authorized disaster management officers orchestrating county-wide rescue.
          </p>
        </div>

        {/* Side-by-Side Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          
          {/* Card 1: Citizen & Resident Portal */}
          <div className="relative rounded-2xl bg-gradient-to-b from-white/[0.04] to-white/[0.01] border border-white/10 p-8 flex flex-col justify-between hover:border-amber-400/40 transition-all group shadow-xl">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 font-mono text-xs font-bold uppercase tracking-wider">
                  PUBLIC RESIDENT ACCESS
                </span>
                <span className="text-2xl">👤</span>
              </div>

              <div>
                <h3 className="text-2xl font-serif-display font-semibold text-white group-hover:text-amber-200 transition-colors">
                  Citizen Portal & Emergency Safety
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Zero credentials required during active flood warnings. Instant access to live inundation maps, verified dry shelters, and one-click rescue dispatch.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2 text-xs font-mono text-slate-300 border-t border-white/5">
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Real-time flood perimeter & ward-level depth isolines</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>1-Click Boat Rescue & Dewatering Heavy Pump Request</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>Verified safe shelter locations with live bed & food status</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>80G tax-exempt community relief donations via Razorpay</span>
                </div>
              </div>

            </div>

            {/* Action Button */}
            <div className="pt-8">
              <button
                onClick={onEnterCitizen}
                className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-200 text-black font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-white/20"
              >
                <span>Enter Citizen Portal</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[10px] font-mono text-center text-slate-500 mt-2">
                Dial 1077 Toll-Free for offline emergency helpline
              </p>
            </div>
          </div>

          {/* Card 2: Disaster Authority & Admin Gateway */}
          <div className="relative rounded-2xl bg-gradient-to-b from-amber-500/[0.04] to-white/[0.01] border border-amber-500/20 p-8 flex flex-col justify-between hover:border-amber-400/60 transition-all group shadow-xl">
            <div className="space-y-6">
              
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse"></span>
                  SDMA SECTOR 04 COMMAND
                </span>
                <span className="text-2xl">🛡️</span>
              </div>

              <div>
                <h3 className="text-2xl font-serif-display font-semibold text-white group-hover:text-amber-300 transition-colors">
                  Disaster War Room & Officer Console
                </h3>
                <p className="text-sm text-slate-400 mt-2 leading-relaxed">
                  Restricted command center for District Disaster Authorities, Ward Engineers, and NDRF commanders. Full telemetry overrides and ledger audits.
                </p>
              </div>

              {/* Feature Checklist */}
              <div className="space-y-3 pt-2 text-xs font-mono text-slate-300 border-t border-white/5">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Real-time rainfall simulation & manual siren triggers</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Public Razorpay donation audit ledger & refund workflow</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Citizen SOS dispatch tickets & heavy machinery routing</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <span>Hardware token FIDO2 & government email authentication</span>
                </div>
              </div>

            </div>

            {/* Action Button */}
            <div className="pt-8">
              <button
                onClick={onEnterAdmin}
                className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-mono font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md group-hover:shadow-amber-400/20"
              >
                <span>Launch Admin Command War Room</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="text-[10px] font-mono text-center text-slate-500 mt-2">
                Requires authorized official credentials or hardware key
              </p>
            </div>
          </div>

        </div>
      </section>

      {/* ─── CORE CAPABILITIES (STYLE MATCHING REFERENCE IMAGE 2) ─── */}
      <section id="capabilities" className="relative px-6 py-24 max-w-7xl mx-auto border-t border-white/10">
        
        {/* Section Header */}
        <div className="mb-16">
          <div className="text-[11px] font-mono tracking-widest uppercase text-slate-500 mb-2">
            CORE CAPABILITIES
          </div>
          <div className="h-px w-full bg-white/10"></div>
        </div>

        {/* Capability Rows */}
        <div className="space-y-20">
          
          {/* Row 1: Time / Hydrological Complexity */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif-display font-light text-white tracking-tight">
                Hydrodynamic Inundation Forecasting
              </h3>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Automatically determine Big O flood velocity vectors and depth curves for mountainous catchments. 
                From instantaneous O(1) cloudburst sirens to 24-hour neural hydrodynamic runoff simulation, 
                our Tree-Sitter & terrain AST engine precisely classifies flood behavior.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span>MODEL: 2D RUNOFF DIFFUSION</span>
                <span>•</span>
                <span className="text-amber-400">LATENCY: 42MS</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-white/5"></div>

          {/* Row 2: Space / Doppler Radar Analysis */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif-display font-light text-amber-200/90 tracking-tight">
                Doppler Precipitation Analysis
              </h3>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Continuous dual-polarization atmospheric radar scans capturing millimeter-level cloudburst accumulation. 
                Correlates soil pore water pressure with hillside slope angles to detect debris flow triggers before riverbanks fail.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span>RADAR TILT: 0.5° TO 19.5°</span>
                <span>•</span>
                <span className="text-cyan-400">RESOLUTION: 250M GRID</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-white/5"></div>

          {/* Row 3: Automated Evacuation & Priority SOS */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif-display font-light text-white tracking-tight">
                Automated Evacuation Routing & SOS
              </h3>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Immediate micro-ward SMS and WhatsApp sirens triggered through the National Common Alerting Protocol (CAP). 
                Prioritizes bedridden and elderly residents for early evacuation by NDRF motorized boats.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span>CAP PROTOCOL V1.2</span>
                <span>•</span>
                <span className="text-emerald-400">DELIVERY RATE: 99.8%</span>
              </div>
            </div>
          </div>

          <div className="h-px w-full bg-white/5"></div>

          {/* Row 4: Public Razorpay Treasury Ledger */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7">
              <h3 className="text-4xl sm:text-5xl md:text-6xl font-serif-display font-light text-amber-200/90 tracking-tight">
                Zero-Leakage Razorpay Treasury Ledger
              </h3>
            </div>
            <div className="lg:col-span-5 space-y-4">
              <p className="text-sm text-slate-400 leading-relaxed font-sans">
                Immutable, cryptographically verifiable public donation ledger. Every rupee donated for medical kits, 
                drinking water tankers, or heavy diesel pumps is matched against verified vendor disbursements with 80G tax receipts.
              </p>
              <div className="flex items-center gap-4 text-xs font-mono text-slate-500">
                <span>PUBLIC AUDIT TRAIL</span>
                <span>•</span>
                <span className="text-amber-400">TRANSPARENCY: 100%</span>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* ─── ARCHITECTURE SECTION (STYLE MATCHING REFERENCE IMAGE 5) ─── */}
      <section id="architecture" className="relative px-6 py-24 max-w-7xl mx-auto border-t border-white/10">
        <div className="mb-12">
          <div className="text-[11px] font-mono tracking-widest uppercase text-slate-500 mb-2">
            ARCHITECTURE & TELEMETRY PIPELINE
          </div>
          <div className="h-px w-full bg-white/10"></div>
        </div>

        {/* 4 Pipeline Stages */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="text-xs font-mono text-amber-400">01 / INGESTION</div>
            <h4 className="text-lg font-serif-display font-medium text-white">Multi-Sensor Telemetry</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time ingestion of IMD Automatic Weather Stations (AWS), Central Water Commission (CWC) river gauges, and INSAT-3DR rainfall radar.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="text-xs font-mono text-cyan-400">02 / MODELING</div>
            <h4 className="text-lg font-serif-display font-medium text-white">Neural Runoff Engine</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Coupled hydrodynamic infiltration models executing on 250m Digital Elevation Model (DEM) grids to project water depth surges.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="text-xs font-mono text-emerald-400">03 / TRIAGE</div>
            <h4 className="text-lg font-serif-display font-medium text-white">Ward Risk Classifier</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Automated classification into Safe, Moderate, High, or Critical threat tiers with immediate safe-zone routing vectors.
            </p>
          </div>

          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 space-y-3">
            <div className="text-xs font-mono text-amber-300">04 / DISPATCH</div>
            <h4 className="text-lg font-serif-display font-medium text-white">Emergency Dissemination</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sub-second CAP sirens, WhatsApp emergency broadcast, boat rescue mobilization, and public Razorpay relief ledger synchronization.
            </p>
          </div>
        </div>
      </section>

      {/* ─── DISASTER MODULES & TOPICS (STYLE MATCHING REFERENCE IMAGE 3) ─── */}
      <section id="modules" className="relative px-6 py-24 max-w-7xl mx-auto border-t border-white/10">
        
        <div className="mb-12">
          <div className="text-[11px] font-mono tracking-widest uppercase text-slate-500 mb-2">
            OPERATIONAL MODULES & DISASTER HUBS
          </div>
          <div className="h-px w-full bg-white/10"></div>
        </div>

        {/* 6 Dark Glowing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Card 1 */}
          <div 
            onClick={onEnterCitizen}
            className="group p-6 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="text-amber-400 font-bold">GIS HYDRAULICS</span>
                <span>O(V + E)</span>
              </div>
              <h4 className="text-xl font-serif-display text-white group-hover:text-amber-300 transition-colors">
                Live Inundation & Risk Map
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Interactive ward-level water depth isolines, active evacuation corridors, and road blockages across Uttarakhand.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-amber-300 flex items-center justify-between">
              <span>EXPLORE CATCHMENT MAP</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2 */}
          <div 
            onClick={onEnterCitizen}
            className="group p-6 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="text-cyan-400 font-bold">RAPID DISPATCH</span>
                <span>O(1) PRIORITY</span>
              </div>
              <h4 className="text-xl font-serif-display text-white group-hover:text-amber-300 transition-colors">
                Citizen SOS & Rescue Dispatch
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Request NDRF motorized rescue boats, municipal diesel dewatering pumps, and trauma medical assistance.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-cyan-300 flex items-center justify-between">
              <span>DISPATCH EMERGENCY RESCUE</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3 */}
          <div 
            onClick={onEnterCitizen}
            className="group p-6 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="text-emerald-400 font-bold">CIVIL SHELTERS</span>
                <span>11,500 CAPACITY</span>
              </div>
              <h4 className="text-xl font-serif-display text-white group-hover:text-amber-300 transition-colors">
                Verified Safe Shelters & Evacuation
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Government helipads, community halls, and high-ground stadiums with real-time bed counts and clean water rations.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-emerald-300 flex items-center justify-between">
              <span>VIEW DRY MUSTER ZONES</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4 */}
          <div 
            onClick={onEnterCitizen}
            className="group p-6 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="text-amber-400 font-bold">RELIEF TREASURY</span>
                <span>RAZORPAY VERIFIED</span>
              </div>
              <h4 className="text-xl font-serif-display text-white group-hover:text-amber-300 transition-colors">
                Community Relief & Charity
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Direct donor-to-beneficiary fund deployment. 100% transparent audit trails for flood rations and medical supplies.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-amber-300 flex items-center justify-between">
              <span>DONATE & VIEW AUDIT</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 5 */}
          <div 
            onClick={onEnterAdmin}
            className="group p-6 rounded-xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/10 hover:border-amber-400/40 transition-all cursor-pointer flex flex-col justify-between space-y-6"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="text-amber-300 font-bold">SDMA WAR ROOM</span>
                <span>SECTOR 04 COMMAND</span>
              </div>
              <h4 className="text-xl font-serif-display text-white group-hover:text-amber-300 transition-colors">
                Admin Operations Console
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Real-time rainfall simulation overrides, siren dispatch verification, and public Razorpay refund ledger management.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-amber-300 flex items-center justify-between">
              <span>ACCESS OFFICER WAR ROOM</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 6 */}
          <div className="p-6 rounded-xl bg-white/[0.02] border border-white/10 flex flex-col justify-between space-y-6">
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono text-slate-500">
                <span className="text-red-400 font-bold">24/7 HELPLINE</span>
                <span>TOLL-FREE 1077</span>
              </div>
              <h4 className="text-xl font-serif-display text-white">
                Offline Disaster Hotline
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                For areas with disrupted mobile internet or power outages. Direct priority routing to State Disaster Emergency Response.
              </p>
            </div>
            <div className="pt-2 text-xs font-mono text-red-400 flex items-center justify-between">
              <a href="tel:1077" className="font-bold flex items-center gap-1.5 hover:underline">
                <PhoneCall className="w-3.5 h-3.5" />
                <span>DIAL 1077 IMMEDIATELY</span>
              </a>
              <span>TOLL FREE</span>
            </div>
          </div>

        </div>
      </section>

      {/* ─── EDITORIAL FOOTER (STYLE MATCHING REFERENCE IMAGE 4) ─── */}
      <footer className="relative px-6 pt-24 pb-16 max-w-7xl mx-auto border-t border-white/10">
        
        {/* Massive Editorial Serif Statement */}
        <div className="mb-20">
          <h2 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-serif-display font-light text-white tracking-tight">
            Protecting every basin<span className="text-amber-400">.</span>
          </h2>
        </div>

        {/* Footer Navigation Columns */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10 font-mono text-xs">
          
          <div className="space-y-3">
            <div className="text-slate-500 uppercase tracking-widest text-[10px]">ANALYSIS & HYDROLOGY</div>
            <ul className="space-y-2 text-slate-400">
              <li><a href="#capabilities" className="hover:text-white transition-colors">Inundation Modeling</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Doppler Radar Velocity</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Hillside Inclinometer</a></li>
              <li><a href="#capabilities" className="hover:text-white transition-colors">Cloudburst Classification</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-slate-500 uppercase tracking-widest text-[10px]">PLATFORMS</div>
            <ul className="space-y-2 text-slate-400">
              <li><button onClick={onEnterCitizen} className="hover:text-white transition-colors cursor-pointer text-left">Citizen Portal</button></li>
              <li><button onClick={onEnterAdmin} className="hover:text-white transition-colors cursor-pointer text-left">SDMA Admin Console</button></li>
              <li><button onClick={onOpenLogin} className="hover:text-white transition-colors cursor-pointer text-left">Google Auth Sign In</button></li>
              <li><a href="tel:1077" className="hover:text-white transition-colors">Emergency Toll-Free 1077</a></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-slate-500 uppercase tracking-widest text-[10px]">GOVERNANCE & AUDIT</div>
            <ul className="space-y-2 text-slate-400">
              <li><span className="text-slate-500">SDMA Certified</span></li>
              <li><span className="text-slate-500">FCRA Registered</span></li>
              <li><span className="text-slate-500">Section 80G Tax Exemption</span></li>
              <li><span className="text-slate-500">Razorpay Public Audit</span></li>
            </ul>
          </div>

          <div className="space-y-3">
            <div className="text-slate-500 uppercase tracking-widest text-[10px]">SYSTEM STATUS</div>
            <div className="space-y-2 text-slate-400">
              <div className="flex items-center gap-2 text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>ALL SENSORS NORMAL</span>
              </div>
              <div className="text-[11px] text-slate-500">IMD AWS Latency: 42ms</div>
              <div className="text-[11px] text-slate-500">CWC Mandakini: Active</div>
            </div>
          </div>

        </div>

        {/* Copyright & Meta */}
        <div className="pt-16 mt-16 border-t border-white/5 flex flex-wrap items-center justify-between text-xs font-mono text-slate-600 gap-4">
          <div>
            © 2026 FloodFlash AI. State Disaster Management Authority & National Civil Defense. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <span className="hover:text-slate-400 transition-colors">API Docs</span>
            <span className="hover:text-slate-400 transition-colors">GitHub</span>
            <span className="hover:text-slate-400 transition-colors">Status</span>
          </div>
        </div>

      </footer>

    </div>
  );
}
