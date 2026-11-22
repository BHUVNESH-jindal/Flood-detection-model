import React from 'react';
import { PhoneCall, User, Home } from 'lucide-react';

export default function Header({ 
 activeTab, 
 setActiveTab, 
 onOpenLogin,
 currentUser,
 onLogout: _onLogout,
 onOpenLanding
}) {
 return (
 <header className="w-full bg-white border-b border-slate-200 sticky top-0 z-50 shadow-xs">
 {/* Main Nav Header */}
 <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
 {/* Left: Brand Identity with PREDICT FLOW Logo */}
 <div className="flex items-center gap-2 cursor-pointer py-1" onClick={onOpenLanding}>
 <img 
 src="/predict-flow-logo.png" 
 alt="PREDICT FLOW Logo" 
 className="h-7 sm:h-10 md:h-14 w-auto object-contain transition-transform hover:scale-105"
 />
 <span className="text-[11px] uppercase font-black tracking-widest px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md hidden md:inline-block shadow-2xs">
 CITIZEN PORTAL
 </span>
 </div>

 {/* Center: Navigation Links */}
 <nav className="hidden lg:flex items-center gap-1 sm:gap-2 overflow-x-auto py-1 scrollbar-none">
 <button
 onClick={onOpenLanding}
 className="px-2.5 py-1.5 rounded-md text-xs font-bold text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-all whitespace-nowrap cursor-pointer flex items-center gap-1"
 >
 <Home className="w-3.5 h-3.5 text-slate-500" />
 <span>Home</span>
 </button>

 <button
 onClick={() => setActiveTab('alerts')}
 className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
 activeTab === 'alerts'
 ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
 }`}
 >
 Live Alerts & Safety
 </button>

 <button
 onClick={() => setActiveTab('shelters')}
 className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
 activeTab === 'shelters'
 ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
 }`}
 >
 Verified Shelters
 </button>

 <button
 onClick={() => setActiveTab('charity')}
 className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
 activeTab === 'charity'
 ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
 }`}
 >
 Community Relief & Charity
 </button>

 <button
 onClick={() => setActiveTab('emergency')}
 className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
 activeTab === 'emergency'
 ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
 : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
 }`}
 >
 Emergency Numbers
 </button>
 </nav>

 {/* Right: Quick Emergency Badge & Profile Button */}
 <div className="flex items-center gap-2">
 {activeTab !== 'emergency' && (
 <a
 href="tel:1077"
 className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white px-3 py-1.5 rounded-md text-xs font-bold transition-all shadow-xs"
 >
 <PhoneCall className="w-3.5 h-3.5" />
 <span>1077</span>
 </a>
 )}

 {currentUser ? (
 <div className="flex items-center gap-2">
 <button
 onClick={onOpenLogin}
 className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 bg-slate-50 text-slate-800 text-xs font-bold hover:bg-slate-100 transition-all cursor-pointer"
 >
 <User className="w-4 h-4 text-slate-500" />
 <span className="max-w-[100px] truncate">{currentUser.full_name || currentUser.username}</span>
 </button>
 </div>
 ) : (
 <button
 onClick={onOpenLogin}
 className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs cursor-pointer border border-slate-700"
 >
 <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
 <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
 <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
 <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
 <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
 </svg>
 <span>Sign In</span>
 </button>
 )}
 </div>
 </div>
 </header>
 );
}
