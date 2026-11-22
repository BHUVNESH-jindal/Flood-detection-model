import React, { useState, useEffect, useRef } from 'react';
import {
 ShieldCheck,
 Activity,
 ArrowRight,
 ChevronRight,
 Waves,
 HeartHandshake,
 CheckCircle2,
 Cpu,
 Lock,
 UserCheck,
 MapPin,
 Bell,
 Cloud,
 TrendingUp,
 Users,
 Navigation,
 Siren,
 Eye,
 Database
} from 'lucide-react';

export default function LandingPage({
 onEnterCitizen,
 onEnterAdmin: _onEnterAdmin,
 onOpenLogin,
 currentUser,
 currentOfficer: _currentOfficer
}) {
 const [scrollY, setScrollY] = useState(0);
 const heroRef = useRef(null);

 useEffect(() => {
 const handleScroll = () => setScrollY(window.scrollY);
 window.addEventListener('scroll', handleScroll, { passive: true });
 return () => window.removeEventListener('scroll', handleScroll);
 }, []);

 const navOpacity = Math.min(scrollY / 80, 1);

 const capabilities = [
 {
 icon: <Activity className="w-8 h-8" />,
 color: 'text-blue-600',
 bg: 'bg-blue-50',
 border: 'border-blue-100',
 title: 'Real-Time Flood Forecasting',
 desc: 'Sub-hourly basin hydrology models using C++ runoff cores and Doppler radar rainfall velocity feeds to predict inundation 3–6 hours ahead.',
 },
 {
 icon: <Bell className="w-8 h-8" />,
 color: 'text-orange-600',
 bg: 'bg-orange-50',
 border: 'border-orange-100',
 title: 'Officer WhatsApp Alerting',
 desc: 'Authorized disaster management officers can trigger targeted evacuation advisories to ward contacts via WhatsApp using the Twilio sandbox.',
 },
 {
 icon: <MapPin className="w-8 h-8" />,
 color: 'text-emerald-600',
 bg: 'bg-emerald-50',
 border: 'border-emerald-100',
 title: 'GPS Evacuation Routing',
 desc: 'Live map overlays show safe corridors, shelter locations, and blocked roads updated from field units and community reports.',
 },
 {
 icon: <HeartHandshake className="w-8 h-8" />,
 color: 'text-rose-600',
 bg: 'bg-rose-50',
 border: 'border-rose-100',
 title: 'Transparent Relief Ledger',
 desc: 'Razorpay-integrated donation tracking with full public audit trail. Every rupee accounted for from donor to affected household.',
 },
 {
 icon: <Cpu className="w-8 h-8" />,
 color: 'text-purple-600',
 bg: 'bg-purple-50',
 border: 'border-purple-100',
 title: 'AI Risk Classification',
 desc: 'Machine learning terrain vulnerability scoring identifies high-risk settlements before the storm arrives, enabling preemptive action.',
 },
 {
 icon: <Database className="w-8 h-8" />,
 color: 'text-cyan-600',
 bg: 'bg-cyan-50',
 border: 'border-cyan-100',
 title: 'Offline-First Mobile',
 desc: 'Capacitor-powered Android app caches critical data locally. Citizens receive alerts and can report conditions even without connectivity.',
 },
 ];

 const disasterHubs = [
 {
 icon: <Waves className="w-6 h-6" />,
 tag: 'HYDROLOGY',
 title: 'Flash Flood Command',
 sub: 'River basin & catchment analysis',
 metric: 'Sector 04 Active',
 color: 'border-l-blue-500',
 iconColor: 'text-blue-500',
 },
 {
 icon: <Cloud className="w-6 h-6" />,
 tag: 'METEOROLOGY',
 title: 'Doppler Radar Array',
 sub: 'Precipitation velocity mapping',
 metric: '3–6 hr lead time',
 color: 'border-l-sky-500',
 iconColor: 'text-sky-500',
 },
 {
 icon: <Navigation className="w-6 h-6" />,
 tag: 'LOGISTICS',
 title: 'Evacuation Corridors',
 sub: 'Live GPS route assignment',
 metric: '24 shelters mapped',
 color: 'border-l-emerald-500',
 iconColor: 'text-emerald-500',
 },
 {
 icon: <Siren className="w-6 h-6" />,
 tag: 'EMERGENCY',
 title: 'Crisis Alert Engine',
 sub: 'Officer WhatsApp dispatch',
 metric: 'Twilio WhatsApp',
 color: 'border-l-orange-500',
 iconColor: 'text-orange-500',
 },
 {
 icon: <TrendingUp className="w-6 h-6" />,
 tag: 'ANALYTICS',
 title: 'Relief Fund Tracker',
 sub: 'Transparent donor-to-aid ledger',
 metric: '100% audit trail',
 color: 'border-l-rose-500',
 iconColor: 'text-rose-500',
 },
 {
 icon: <Eye className="w-6 h-6" />,
 tag: 'MONITORING',
 title: 'Field Unit Tracking',
 sub: 'NDRF / SDRF real-time positions',
 metric: '11 teams live',
 color: 'border-l-violet-500',
 iconColor: 'text-violet-500',
 },
 ];

 const stats = [
 { label: 'Pilot Wards', value: '18', unit: 'monitored' },
 { label: 'Catchment Area', value: '14,200', unit: 'km²' },
 { label: 'Forecast Lead Time', value: '3–6', unit: 'hours' },
 { label: 'Alert Channel', value: '1', unit: 'WhatsApp' },
 { label: 'Relief Disbursed', value: '₹2.4Cr', unit: 'tracked' },
 { label: 'Uptime', value: '99.9', unit: '%' },
 ];

 return (
 <div
 className="min-h-screen text-slate-900 selection:bg-blue-200 selection:text-blue-900"
 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}
 >

 {/* ─── STICKY NAVIGATION ─── */}
 <header
 className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
 style={{
 backgroundColor: `rgba(255,255,255,${navOpacity * 0.95})`,
 backdropFilter: navOpacity > 0.1 ? 'blur(16px)' : 'none',
 borderBottom: navOpacity > 0.3 ? '1px solid rgba(0,0,0,0.08)' : 'none',
 boxShadow: navOpacity > 0.5 ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
 }}
 >
 <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">

 {/* Brand */}
 <a href="#hero" className="flex items-center gap-2.5 group">
 <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center shadow-sm">
 <Waves className="w-4.5 h-4.5 text-white" style={{ width: 18, height: 18 }} />
 </div>
 <span className="sr-only">FloodFlash home</span>
 </a>

 {/* Center nav links */}
 <nav className="hidden lg:flex items-center gap-8">
 {['Capabilities', 'Architecture', 'Disaster Hubs', 'About'].map(link => (
 <a
 key={link}
 href={`#${link.toLowerCase().replace(' ', '-')}`}
 className="text-sm font-medium transition-colors hover:text-blue-600"
 style={{ color: navOpacity > 0.3 ? '#475569' : 'rgba(255,255,255,0.8)' }}
 >
 {link}
 </a>
 ))}
 </nav>

 {/* Right buttons */}
 <div className="flex items-center gap-3">
 {currentUser ? (
 <button
 onClick={onOpenLogin}
 className="flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm font-medium hover:bg-emerald-100 transition-all cursor-pointer"
 >
 <UserCheck className="w-4 h-4" />
 <span className="max-w-[120px] truncate">{currentUser.full_name || currentUser.username}</span>
 </button>
 ) : (
 <button
 onClick={onOpenLogin}
 className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all cursor-pointer"
 style={{
 backgroundColor: navOpacity > 0.3 ? 'white' : 'rgba(255,255,255,0.1)',
 borderColor: navOpacity > 0.3 ? '#e2e8f0' : 'rgba(255,255,255,0.3)',
 color: navOpacity > 0.3 ? '#374151' : 'white',
 }}
 >
 <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
 <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
 <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
 <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
 <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
 </svg>
 <span>Sign In</span>
 </button>
 )}

 <button
 onClick={onEnterCitizen}
 className="flex items-center gap-2 px-5 py-2 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold transition-all shadow-sm hover:shadow-blue-200 cursor-pointer"
 >
 <span>Citizen Portal</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </div>
 </div>
 </header>

 {/* ─── HERO — FULL VIEWPORT WITH FLOOD IMAGE BACKGROUND ─── */}
 <section
 id="hero"
 ref={heroRef}
 className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden"
 style={{
 backgroundImage: "url('/flood-hero-bg.jpg')",
 backgroundSize: 'cover',
 backgroundPosition: 'center 40%',
 backgroundAttachment: 'fixed',
 }}
 >
 {/* Layered gradient overlay — dark at top/bottom, transparent in middle */}
 <div className="absolute inset-0 bg-gradient-to-b from-black/70 via-black/40 to-black/80 pointer-events-none" />
 {/* Extra depth from left */}
 <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent pointer-events-none" />

 {/* Hero Content */}
 <div className="relative z-10 max-w-5xl mx-auto px-6 text-center space-y-8 pt-24 pb-20">

 {/* Status pill */}
 <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-white/10 border border-white/20 backdrop-blur-md text-sm font-medium text-white/90">
 <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
 <span>Predictive Hydrology Command</span>
 <span className="text-white/40">•</span>
 <span className="text-emerald-300">Uttarakhand Sector 04 Live</span>
 </div>

 {/* Main headline */}
 <h1
 className="text-5xl sm:text-7xl md:text-[108px] font-bold tracking-tight text-white leading-none"
 style={{ fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", letterSpacing: '-0.03em' }}
 >
 Flood risk<br className="hidden sm:block" /> intelligence.
 </h1>

 {/* Tagline */}
 <p className="max-w-2xl mx-auto text-xl sm:text-2xl text-white/75 font-light leading-relaxed">
 Intelligent flash flood defense. Real-time basin hydrology forecasting,
 automated citizen evacuation, and transparent disaster relief — all in one command.
 </p>

 {/* Feature bullets */}
 <div className="flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm text-white/60 font-medium">
 <span className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
 C++ Runoff Core · Sub-hourly hydrographs
 </span>
 <span className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-cyan-400" />
 Doppler Radar · Real-time rainfall velocity
 </span>
 <span className="flex items-center gap-2">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
 100% Transparent · Razorpay relief ledger
 </span>
 </div>

 {/* CTA buttons */}
 <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
 <button
 onClick={onEnterCitizen}
 className="group px-8 py-4 rounded-full bg-white hover:bg-blue-50 text-slate-900 font-semibold text-base transition-all shadow-2xl hover:shadow-white/20 flex items-center gap-2 cursor-pointer"
 >
 <span>Enter Citizen Portal</span>
 <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
 </button>

 <button
 onClick={onOpenLogin}
 className="group px-8 py-4 rounded-full bg-white/10 hover:bg-white/20 border border-white/25 text-white font-semibold text-base backdrop-blur-sm transition-all flex items-center gap-2 cursor-pointer"
 >
 <ShieldCheck className="w-4 h-4 text-amber-300" />
 <span>Official Login</span>
 </button>
 </div>
 </div>

 {/* Telemetry stat strip pinned to bottom of hero */}
 <div className="absolute bottom-0 left-0 right-0 z-10 bg-black/40 backdrop-blur-md border-t border-white/10">
 <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between gap-4 overflow-x-auto scrollbar-none">
 {stats.map((s, i) => (
 <div key={i} className="flex flex-col items-center min-w-[80px]">
 <span className="text-lg font-bold text-white leading-none">{s.value}</span>
 <span className="text-[10px] font-medium text-white/50 uppercase tracking-wider mt-0.5">{s.label}</span>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ─── CAPABILITIES SECTION (LIGHT) ─── */}
 <section id="capabilities" className="bg-white py-24 px-6">
 <div className="max-w-7xl mx-auto">
 <div className="mb-14">
 <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Core Capabilities</span>
 <div className="mt-3 h-px w-full bg-slate-100" />
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-x-16 gap-y-12">
 {capabilities.map((cap, i) => (
 <div key={i} className="flex gap-5 group">
 <div className={`shrink-0 w-14 h-14 rounded-2xl ${cap.bg} ${cap.border} border flex items-center justify-center ${cap.color} transition-transform group-hover:scale-105`}>
 {cap.icon}
 </div>
 <div>
 <h3 className="text-xl font-bold text-slate-900 mb-2 leading-tight">{cap.title}</h3>
 <p className="text-slate-500 text-sm leading-relaxed">{cap.desc}</p>
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ─── PORTAL SELECTOR SECTION ─── */}
 <section id="portals" className="bg-slate-50 py-24 px-6 border-y border-slate-100">
 <div className="max-w-7xl mx-auto">
 <div className="text-center mb-14">
 <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Who Are You?</span>
 <h2 className="mt-4 text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight leading-tight">
 Choose your portal.
 </h2>
 <p className="mt-4 text-slate-500 text-lg max-w-xl mx-auto">
 FloodFlash serves both citizens seeking safety and officials coordinating disaster response.
 </p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">

 {/* Citizen Portal Card */}
 <button
 onClick={onEnterCitizen}
 className="group relative text-left p-8 rounded-3xl bg-white border border-slate-200 hover:border-blue-300 hover:shadow-xl hover:shadow-blue-100 transition-all duration-300 cursor-pointer overflow-hidden"
 >
 <div className="absolute top-0 left-0 w-1 h-full bg-blue-500 rounded-l-3xl" />
 <div className="w-14 h-14 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center mb-6">
 <Users className="w-7 h-7 text-blue-600" />
 </div>
 <div className="text-xs font-semibold tracking-widest text-blue-500 uppercase mb-2">For Citizens</div>
 <h3 className="text-2xl font-bold text-slate-900 mb-3">Citizen Safety Portal</h3>
 <p className="text-slate-500 text-sm leading-relaxed mb-6">
 Get live flood warnings for your area, find nearest evacuation shelters, 
 report field conditions, track relief fund disbursements, and call emergency helplines — all in one place.
 </p>
 <div className="flex flex-wrap gap-2 mb-6">
 {['Live Alerts', 'Shelter Map', 'SOS Helpline', 'Report Flood', 'Relief Status'].map(tag => (
 <span key={tag} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-medium">{tag}</span>
 ))}
 </div>
 <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all">
 <span>Enter Citizen Portal</span>
 <ArrowRight className="w-4 h-4" />
 </div>
 </button>

 {/* Official Portal Card */}
 <button
 onClick={onOpenLogin}
 className="group relative text-left p-8 rounded-3xl bg-white border border-slate-200 hover:border-amber-300 hover:shadow-xl hover:shadow-amber-100 transition-all duration-300 cursor-pointer overflow-hidden"
 >
 <div className="absolute top-0 left-0 w-1 h-full bg-amber-500 rounded-l-3xl" />
 <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center mb-6">
 <ShieldCheck className="w-7 h-7 text-amber-600" />
 </div>
 <div className="text-xs font-semibold tracking-widest text-amber-500 uppercase mb-2">For Officials</div>
 <h3 className="text-2xl font-bold text-slate-900 mb-3">Admin Command Center</h3>
 <p className="text-slate-500 text-sm leading-relaxed mb-6">
 Full situational awareness dashboard for NDRF, SDRF, and district administration. 
 Manage alerts, coordinate field teams, approve relief distributions, and analyze predictive models.
 </p>
 <div className="flex flex-wrap gap-2 mb-6">
 {['Radar Command', 'Field Teams', 'Alert Dispatch', 'Relief Mgmt', 'Analytics'].map(tag => (
 <span key={tag} className="px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-medium">{tag}</span>
 ))}
 </div>
 <div className="flex items-center gap-2 text-amber-600 font-semibold text-sm group-hover:gap-3 transition-all">
 <span>Official Login</span>
 <Lock className="w-4 h-4" />
 </div>
 </button>
 </div>
 </div>
 </section>

 {/* ─── ARCHITECTURE SECTION — DARK ─── */}
 <section id="architecture" className="bg-slate-900 py-24 px-6">
 <div className="max-w-7xl mx-auto">
 <div className="mb-14">
 <span className="text-xs font-semibold tracking-widest text-slate-400 uppercase">Architecture</span>
 <div className="mt-3 h-px w-full bg-white/10" />
 </div>

 <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
 {/* Left: big statement */}
 <div>
 <h2 className="text-5xl sm:text-6xl font-bold text-white leading-tight tracking-tight mb-6">
 Built for extreme<br />reliability.
 </h2>
 <p className="text-slate-400 text-lg leading-relaxed mb-8">
 Every layer of FloodFlash is designed to function under crisis conditions — from satellite data ingestion
 to offline Android alerting. Zero single points of failure.
 </p>
 <div className="space-y-4">
 {[
 { label: 'C++ Hydrological Engine', detail: 'Sub-hourly runoff calculations, basin morphology analysis' },
 { label: 'FastAPI + SQLite WAL Backend', detail: 'Concurrent reads, write-ahead logging, 99.9% uptime' },
 { label: 'React + Capacitor Frontend', detail: 'PWA + native Android, works offline with local cache' },
 { label: 'WhatsApp Alert Dispatch', detail: 'Officer-initiated ward evacuation advisories via Twilio sandbox' },
 ].map((item, i) => (
 <div key={i} className="flex items-start gap-3">
 <CheckCircle2 className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
 <div>
 <span className="text-white font-semibold text-sm">{item.label}</span>
 <span className="text-slate-500 text-sm"> — {item.detail}</span>
 </div>
 </div>
 ))}
 </div>
 </div>

 {/* Right: Architecture diagram as styled cards */}
 <div className="space-y-3">
 {[
 { layer: 'Data Ingestion', items: ['Doppler Radar API', 'Open-Meteo & IMD Feeds', 'Satellite Imagery'], color: 'border-cyan-500', tag: 'INPUT' },
 { layer: 'Processing Core', items: ['C++ Runoff Engine', 'ML Risk Classifier', 'GIS Terrain Analysis'], color: 'border-blue-500', tag: 'COMPUTE' },
 { layer: 'Command Platform', items: ['FastAPI Backend', 'SQLite WAL Store', 'WebSocket Bus'], color: 'border-violet-500', tag: 'PLATFORM' },
 { layer: 'Citizen Delivery', items: ['React Dashboard', 'Android App (Capacitor)', 'WhatsApp Alert Dispatch'], color: 'border-emerald-500', tag: 'DELIVERY' },
 ].map((block, i) => (
 <div key={i} className={`flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/10 border-l-4 ${block.color}`}>
 <span className={`text-[9px] font-bold tracking-widest text-slate-500 w-14 shrink-0 uppercase`}>{block.tag}</span>
 <div>
 <div className="text-white font-semibold text-sm mb-1">{block.layer}</div>
 <div className="flex flex-wrap gap-1.5">
 {block.items.map(item => (
 <span key={item} className="px-2 py-0.5 rounded bg-white/10 text-slate-300 text-[11px] font-medium">{item}</span>
 ))}
 </div>
 </div>
 </div>
 ))}
 <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-blue-600/20 to-cyan-600/20 border border-blue-500/30">
 <div className="flex items-center gap-3">
 <Activity className="w-5 h-5 text-blue-400" />
 <div>
 <div className="text-white font-semibold text-sm">System Status: Nominal</div>
 <div className="text-slate-400 text-xs">All 18 pilot ward telemetry streams active · Continuous evaluation</div>
 </div>
 <div className="ml-auto w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>

 {/* ─── DISASTER HUBS SECTION (LIGHT) ─── */}
 <section id="disaster-hubs" className="bg-white py-24 px-6">
 <div className="max-w-7xl mx-auto">
 <div className="mb-14">
 <span className="text-xs font-semibold tracking-widest text-blue-600 uppercase">Disaster Hubs</span>
 <div className="mt-3 h-px w-full bg-slate-100" />
 </div>

 <div className="mb-10">
 <h2 className="text-4xl sm:text-5xl font-bold text-slate-900 tracking-tight">
 Specialized response modules.
 </h2>
 <p className="mt-4 text-slate-500 text-lg max-w-2xl">
 Each hub is a purpose-built operational unit that can be activated independently or as part of a full disaster response chain.
 </p>
 </div>

 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
 {disasterHubs.map((hub, i) => (
 <div
 key={i}
 className={`group relative bg-white rounded-2xl border border-slate-200 border-l-4 ${hub.color} p-6 hover:shadow-lg transition-all duration-300 cursor-pointer`}
 onClick={onEnterCitizen}
 >
 <div className="flex items-start justify-between mb-4">
 <div className={`${hub.iconColor} opacity-80 group-hover:opacity-100 transition-opacity`}>
 {hub.icon}
 </div>
 <span className="text-[9px] font-bold tracking-widest text-slate-400 uppercase">{hub.tag}</span>
 </div>
 <h3 className="text-base font-bold text-slate-900 mb-1">{hub.title}</h3>
 <p className="text-slate-500 text-sm mb-4">{hub.sub}</p>
 <div className="flex items-center justify-between">
 <span className="text-xs font-medium text-slate-400">{hub.metric}</span>
 <ChevronRight className="w-4 h-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all" />
 </div>
 </div>
 ))}
 </div>
 </div>
 </section>

 {/* ─── FOOTER ─── */}
 <footer className="bg-slate-50 border-t border-slate-200 py-14 px-6">
 <div className="max-w-7xl mx-auto">
 <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
 {/* Brand */}
 <div className="md:col-span-1">
 <div className="flex items-center gap-2.5 mb-4">
 <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center">
 <Waves className="w-4 h-4 text-white" />
 </div>
 <span className="text-base font-bold text-slate-900">FloodFlash<span className="text-blue-600">.</span></span>
 </div>
 <p className="text-slate-500 text-sm leading-relaxed">
 Predictive flood defense and real-time disaster response platform for Himalayan river basins.
 </p>
 </div>

 {/* Links */}
 <div>
 <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Response</h4>
 <ul className="space-y-2.5 text-sm text-slate-500">
 {['Flash Flood Command', 'Evacuation Routes', 'Shelter Locator', 'Emergency Call 1077'].map(l => (
 <li key={l}><a href="#" className="hover:text-blue-600 transition-colors">{l}</a></li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Platform</h4>
 <ul className="space-y-2.5 text-sm text-slate-500">
 {['Architecture', 'API Documentation', 'Mobile App', 'Radar Array'].map(l => (
 <li key={l}><a href="#" className="hover:text-blue-600 transition-colors">{l}</a></li>
 ))}
 </ul>
 </div>

 <div>
 <h4 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4">Official</h4>
 <ul className="space-y-2.5 text-sm text-slate-500">
 {['Admin Login', 'NDRF Portal', 'Relief Ledger', 'Transparency Report'].map(l => (
 <li key={l}><a href="#" className="hover:text-blue-600 transition-colors">{l}</a></li>
 ))}
 </ul>
 </div>
 </div>

 <div className="pt-8 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4">
 <p className="text-xs text-slate-400">© 2026 FloodFlash. All rights reserved. Built for India's disaster resilience.</p>
 <div className="flex items-center gap-6 text-xs text-slate-400">
 <a href="#" className="hover:text-blue-600 transition-colors">Privacy</a>
 <a href="#" className="hover:text-blue-600 transition-colors">Status</a>
 <a href="#" className="hover:text-blue-600 transition-colors">GitHub</a>
 <div className="flex items-center gap-1.5">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
 <span>All systems operational</span>
 </div>
 </div>
 </div>
 </div>
 </footer>

 </div>
 );
}
