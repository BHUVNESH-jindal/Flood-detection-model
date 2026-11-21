import React, { useState, useEffect } from 'react';
import AdminOperationsDashboard from './AdminOperationsDashboard';
import AdminDonationsLedger from './AdminDonationsLedger';
import AdminReliefRequestsView from './AdminReliefRequestsView';
import AdminProvidersView from './AdminProvidersView';

export default function AdminConsoleLayout({
 currentOfficer,
 onLogout,
 onReturnToCitizen
}) {
 const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'donations' | 'disbursements-ledger' | 'relief-requests' | 'providers' | 'audit-log' | 'settings'
 const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
 const [toastMessage, setToastMessage] = useState(null);
 const [isTestMode, setIsTestMode] = useState(false);
 const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
 const [notificationsOpen, setNotificationsOpen] = useState(false);
 const [globalSearch, setGlobalSearch] = useState('');

 // Handle keyboard shortcut ⌘K or Ctrl+K for search, and [ for sidebar collapse
 useEffect(() => {
 const handleKeyDown = (e) => {
 if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
 e.preventDefault();
 const searchInput = document.getElementById('admin-global-search');
 if (searchInput) searchInput.focus();
 }
 if (e.key === '[' && !['INPUT', 'TEXTAREA'].includes(e.target.tagName)) {
 e.preventDefault();
 setIsSidebarCollapsed((prev) => !prev);
 }
 };
 window.addEventListener('keydown', handleKeyDown);
 return () => window.removeEventListener('keydown', handleKeyDown);
 }, []);

 const showToast = (msg) => {
 setToastMessage(msg);
 setTimeout(() => {
 setToastMessage(null);
 }, 3500);
 };

 const officerName = currentOfficer?.full_name || 'SDMA Officer - Vikram Negi';
 const officerEmail = currentOfficer?.email || 'vikram.negi@uk-relief.gov.in';

 return (
 <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
 
 {/* 1. FIXED TOP BANNERS & HEADER */}
 <div className="fixed top-0 left-0 right-0 z-50">
 
 {/* Operational Status Header Bar */}
 <div className={`h-8 ${isTestMode ? 'bg-[#fef3c7] border-b border-[#fde68a] text-[#92400e]' : 'bg-[#ecfdf5] border-b border-[#a7f3d0] text-[#065f46]'} px-margin flex items-center justify-between font-label-code-sm text-label-code-sm transition-colors duration-300`}>
 <div className="flex items-center gap-space-sm">
 <span className={`inline-flex items-center px-space-xs py-0.5 rounded-full ${isTestMode ? 'bg-[#fde68a] text-[#92400e]' : 'bg-[#a7f3d0] text-[#065f46]'} font-semibold uppercase tracking-wider`}>
 {isTestMode ? 'SANDBOX REHEARSAL' : 'LIVE PRODUCTION'}
 </span>
 <span className="hidden sm:inline">
 {isTestMode
 ? 'Simulation mode active: Safe rehearsal environment.'
 : 'SDMA Disaster Command Network: Live telemetry feeds, active subscriber SMS/WhatsApp, & real-time response.'}
 </span>
 </div>
 <div className="flex items-center gap-space-md">
 <span className="flex items-center gap-1 font-body-sm text-body-sm">
 <span className={`w-2 h-2 rounded-full ${isTestMode ? 'bg-amber-500 animate-pulse' : 'bg-emerald-600'}`}></span>
 Environment: {isTestMode ? 'SANDBOX' : 'LIVE PRODUCTION'}
 </span>
 <button
 type="button"
 onClick={() => {
 setIsTestMode(!isTestMode);
 showToast(`Switched gateway environment to ${!isTestMode ? 'SANDBOX' : 'LIVE PRODUCTION'}.`);
 }}
 className="underline hover:opacity-80 font-semibold cursor-pointer"
 >
 {isTestMode ? 'Switch to LIVE Production' : 'Switch to Sandbox'}
 </button>
 </div>
 </div>

 {/* Global Admin Header */}
 <header className="h-16 bg-surface-container-lowest border-b border-outline-variant/30 px-margin flex items-center justify-between">
 <div className="flex items-center gap-space-lg">
 <div
 className="flex items-center gap-space-sm cursor-pointer"
 onClick={() => setActiveTab('dashboard')}
 >
 <img
 alt="Flood-Flash Logo"
 className="h-8 w-auto object-contain"
 src="/predict-flow-logo.png"
 onError={(e) => {
 e.target.src = "https://lh3.googleusercontent.com/aida/AEtjO1ULohT25igS7G39wTEOvSl9T-73mgY98M-DR10ab0-ZVxLGHlm6KTYgf4XIJGkpLXxQVXVTY-aFZQ1tZtcQC7Gv6bZt3gm5xKlVtXkiHsTRahcHIc-u24tIdbG_JR9AhJMzxuhLr_L760ZtTD1QMLsnUvmFNm7RFXvYG5Jc-pH8GfSa9-rYzhQ_5SgDauPFW5Z8xotIdCwIlaX6QwDmL8C2ZQDGr680aCS3vfyfA7dTaQOCe7pQCb9sPfS2";
 }}
 />
 <div className="flex flex-col">
 <span className="font-headline-md text-headline-md tracking-tight leading-none text-on-surface font-bold">
 Flood-Flash
 </span>
 <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-on-surface-variant font-semibold mt-0.5">
 ADMIN / UK-SDMA RELIEF
 </span>
 </div>
 </div>

 <div className="hidden md:flex items-center pl-space-sm">
 <span className="inline-flex items-center gap-1.5 px-space-sm py-1 rounded-full bg-surface-container text-on-surface-variant border border-outline-variant/40 font-label-code-sm text-label-code-sm uppercase">
 <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
 TEST SANDBOX <span className="text-outline font-normal lowercase">v2.4-relief</span>
 </span>
 </div>
 </div>

 {/* Center Search Input (⌘K) */}
 <div className="flex-1 max-w-xl mx-space-xl hidden lg:block">
 <div className="relative flex items-center">
 <span className="material-symbols-outlined absolute left-3 text-outline text-[18px]">search</span>
 <input
 id="admin-global-search"
 type="text"
 value={globalSearch}
 onChange={(e) => {
 setGlobalSearch(e.target.value);
 if (activeTab !== 'donations') setActiveTab('donations');
 }}
 placeholder="Search donations, Razorpay ID, relief token, or donor name (Press ⌘K)..."
 className="w-full h-10 pl-9 pr-14 bg-surface rounded-lg border border-outline-variant/40 text-on-surface font-body-sm text-body-sm placeholder:text-outline focus:outline-none focus:border-primary focus:bg-surface-container-lowest transition-all"
 />
 <span className="absolute right-2.5 px-1.5 py-0.5 rounded bg-surface-container border border-outline-variant/50 text-on-surface-variant font-label-code-sm text-label-code-sm select-none">
 ⌘K
 </span>
 </div>
 </div>

 {/* Right Header Controls */}
 <div className="flex items-center gap-space-md">
 <div className="hidden xl:flex items-center gap-1.5 px-space-sm py-1 rounded bg-surface border border-outline-variant/40 font-label-code-sm text-label-code-sm text-on-surface-variant">
 <span className="material-symbols-outlined text-[16px] text-outline">schedule</span>
 <span>IST (UTC+5:30)</span>
 </div>

 {/* Notifications Button */}
 <div className="relative">
 <button
 type="button"
 aria-label="Notifications"
 onClick={() => setNotificationsOpen(!notificationsOpen)}
 className="relative p-2 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors cursor-pointer"
 >
 <span className="material-symbols-outlined text-[20px]">notifications</span>
 <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-error ring-2 ring-surface-container-lowest"></span>
 </button>

 {notificationsOpen && (
 <div className="absolute right-0 top-full mt-2 w-80 bg-surface-container-lowest rounded-xl shadow-xl border border-outline-variant/40 p-3 z-50 animate-fade-in space-y-2">
 <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
 <span className="font-label-code-sm uppercase font-bold text-on-surface">Emergency Notifications</span>
 <span className="text-[10px] bg-error-container text-error px-1.5 py-0.5 rounded font-bold ">2 NEW</span>
 </div>
 <div className="space-y-2">
 <div className="p-2 bg-error-container/20 rounded-lg text-xs space-y-0.5">
 <p className="font-bold text-on-surface">Mandakini Surge Trigger</p>
 <p className="text-on-surface-variant text-[11px]">Sensor AWS-UTK-02 detected 42mm/h downpour. S-04 alert live.</p>
 </div>
 <div className="p-2 bg-surface-container-low rounded-lg text-xs space-y-0.5">
 <p className="font-bold text-on-surface">Razorpay Webhook Verified</p>
 <p className="text-on-surface-variant text-[11px]">4,120 transactions settled. 80G API sync 100%.</p>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Officer Profile & Dropdown */}
 <div className="relative group">
 <div
 className="flex items-center gap-space-sm pl-space-xs cursor-pointer select-none"
 onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
 >
 <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold">
 <span className="material-symbols-outlined text-[18px]">person</span>
 </div>
 <div className="hidden md:flex flex-col text-left">
 <span className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight">
 {officerName}
 </span>
 <span className="font-label-code-sm text-label-code-sm text-on-surface-variant ">
 Senior Relief Officer
 </span>
 </div>
 <span className="material-symbols-outlined text-outline text-[18px]">expand_more</span>
 </div>

 {/* Profile Dropdown Menu */}
 <div className="absolute right-0 top-full mt-2 w-64 bg-surface-container-lowest rounded-xl shadow-lg border border-outline-variant/40 p-space-sm opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50">
 <div className="px-space-sm py-2 border-b border-outline-variant/20 mb-1">
 <p className="font-body-sm text-body-sm font-semibold text-on-surface">{officerName}</p>
 <p className="font-label-code-sm text-label-code-sm text-on-surface-variant truncate ">
 {officerEmail}
 </p>
 <p className="font-label-code-sm text-label-code-sm text-on-tertiary-container mt-1 font-semibold flex items-center gap-1">
 <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
 Senior Relief Officer
 </p>
 </div>

 <button
 type="button"
 onClick={() => setActiveTab('settings')}
 className="w-full text-left flex items-center gap-2 px-space-sm py-2 rounded-lg text-body-sm font-body-sm text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors cursor-pointer"
 >
 <span className="material-symbols-outlined text-[18px]">settings</span>
 <span>Account Settings</span>
 </button>

 <button
 type="button"
 onClick={() => setActiveTab('audit-log')}
 className="w-full text-left flex items-center gap-2 px-space-sm py-2 rounded-lg text-body-sm font-body-sm text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors cursor-pointer"
 >
 <span className="material-symbols-outlined text-[18px]">shield</span>
 <span>Activity History &amp; Audit</span>
 </button>

 <button
 type="button"
 onClick={onReturnToCitizen}
 className="w-full text-left flex items-center gap-2 px-space-sm py-2 rounded-lg text-body-sm font-body-sm text-secondary hover:bg-secondary-container/10 transition-colors cursor-pointer font-medium"
 >
 <span className="material-symbols-outlined text-[18px]">arrow_back</span>
 <span>Citizen Early Warning Portal</span>
 </button>

 <div className="border-t border-outline-variant/20 my-1"></div>

 <button
 type="button"
 onClick={onLogout}
 className="w-full text-left flex items-center gap-2 px-space-sm py-2 rounded-lg text-body-sm font-body-sm text-error hover:bg-error-container/30 transition-colors cursor-pointer font-medium"
 >
 <span className="material-symbols-outlined text-[18px]">logout</span>
 <span>Sign out</span>
 </button>
 </div>
 </div>
 </div>
 </header>
 </div>

 {/* 2. FIXED COLLAPSIBLE SIDEBAR */}
 <aside
 className={`fixed left-0 top-24 bottom-0 bg-surface-container-lowest border-r border-outline-variant/30 z-40 flex flex-col justify-between transition-all duration-200 ${
 isSidebarCollapsed ? 'w-20' : 'w-64'
 }`}
 >
 <div className="p-space-md">
 {!isSidebarCollapsed && (
 <div className="px-space-sm pb-space-sm mb-space-sm border-b border-outline-variant/20">
 <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-outline font-semibold">
 Relief Console
 </span>
 </div>
 )}

 <nav className="space-y-1">
 {[
 { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
 { id: 'donations', label: 'Donations', icon: 'payments' },
 { id: 'disbursements-ledger', label: 'Disbursements & Ledger', icon: 'account_balance' },
 { id: 'relief-requests', label: 'Relief Requests', icon: 'sos' },
 { id: 'providers', label: 'Providers', icon: 'verified' },
 { id: 'audit-log', label: 'Audit Log', icon: 'history_toggle_off' },
 { id: 'settings', label: 'Settings', icon: 'tune' }
 ].map((nav) => {
 const isActive = activeTab === nav.id;
 return (
 <button
 key={nav.id}
 type="button"
 onClick={() => setActiveTab(nav.id)}
 title={isSidebarCollapsed ? nav.label : ''}
 className={`w-full flex items-center gap-3 px-space-sm py-2.5 rounded-xl transition-colors font-body-sm text-body-sm cursor-pointer ${
 isActive
 ? 'bg-primary text-on-primary font-semibold shadow-xs'
 : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
 } ${isSidebarCollapsed ? 'justify-center' : ''}`}
 >
 <span className="material-symbols-outlined text-[20px] shrink-0">{nav.icon}</span>
 {!isSidebarCollapsed && <span>{nav.label}</span>}
 </button>
 );
 })}
 </nav>
 </div>

 {/* Bottom Sidebar Status & Collapse Toggle */}
 <div className="p-space-md border-t border-outline-variant/30 space-y-space-sm">
 {!isSidebarCollapsed && (
 <div className="p-3 rounded-lg bg-surface border border-outline-variant/30">
 <div className="flex items-center justify-between text-label-code-sm font-label-code-sm">
 <span className="text-outline font-semibold uppercase">UK-SDMA Node</span>
 <span className="text-on-tertiary-container font-semibold flex items-center gap-1 ">
 <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
 SYNC OK
 </span>
 </div>
 <p className="font-label-code-sm text-label-code-sm text-on-surface-variant mt-1 ">
 Gateway: Dehradun HQ
 </p>
 </div>
 )}

 <button
 type="button"
 onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
 className="w-full flex items-center justify-between px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors font-body-sm text-body-sm cursor-pointer"
 >
 <span className="flex items-center gap-2">
 <span className="material-symbols-outlined text-[18px]">
 {isSidebarCollapsed ? 'last_page' : 'first_page'}
 </span>
 {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
 </span>
 {!isSidebarCollapsed && (
 <span className="font-label-code-sm text-label-code-sm text-outline ">[</span>
 )}
 </button>
 </div>
 </aside>

 {/* 3. MAIN WORKSPACE CONTENT AREA */}
 <div className={`transition-all duration-200 ${isSidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
 <main className="w-full min-h-screen pt-28 pb-space-xl px-margin bg-surface">
 <div key={activeTab} className="tab-transition-enter">
 
 {activeTab === 'dashboard' && (
 <AdminOperationsDashboard
 onNavigateToDonations={() => setActiveTab('donations')}
 onShowToast={showToast}
 />
 )}

 {activeTab === 'donations' && (
 <AdminDonationsLedger onShowToast={showToast} />
 )}

 {activeTab === 'relief-requests' && (
 <AdminReliefRequestsView onShowToast={showToast} />
 )}

 {activeTab === 'providers' && (
 <AdminProvidersView onShowToast={showToast} />
 )}

 {activeTab === 'disbursements-ledger' && (
 <div className="space-y-6">
 <div>
 <span className="font-label-code-sm text-outline uppercase font-semibold ">Treasury Capital Route</span>
 <h2 className="font-headline-xl font-bold text-on-surface mt-1">Disbursements &amp; Field Allocation Ledger</h2>
 <p className="font-body-sm text-on-surface-variant">Live disbursements to municipal nodal rescue brigades and NGO ration kitchens.</p>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
 <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs">
 <span className="text-xs text-outline uppercase font-semibold">Total Disbursed (Cycle 64)</span>
 <div className="text-2xl font-bold text-on-surface mt-1">₹48,92,450</div>
 <span className="text-xs text-on-tertiary-container font-semibold mt-1 block">100% accounted on SDMA blockchain node</span>
 </div>
 <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs">
 <span className="text-xs text-outline uppercase font-semibold">Pending Approvals (&gt; ₹1 Lakh)</span>
 <div className="text-2xl font-bold text-amber-700 mt-1">₹3,00,000</div>
 <span className="text-xs text-outline mt-1 block">Dual-signature key exchange required</span>
 </div>
 <div className="p-4 bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-xs">
 <span className="text-xs text-outline uppercase font-semibold">Disaster Relief Escrow</span>
 <div className="text-2xl font-bold text-secondary mt-1">₹1.32 Cr</div>
 <span className="text-xs text-outline mt-1 block">Held with State Bank of India (Gov Pool)</span>
 </div>
 </div>

 <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-4 shadow-xs">
 <h3 className="font-bold text-on-surface mb-3">Recent Direct Bank Disbursements</h3>
 <div className="overflow-x-auto">
 <table className="w-full text-left font-body-sm">
 <thead>
 <tr className="bg-surface-container-low text-outline text-xs">
 <th className="p-2.5 rounded-l">TRANSACTION / BATCH</th>
 <th className="p-2.5">RECIPIENT NODAL ENTITY</th>
 <th className="p-2.5">PURPOSE</th>
 <th className="p-2.5">AMOUNT (INR)</th>
 <th className="p-2.5 text-right rounded-r">AUTHORIZATION</th>
 </tr>
 </thead>
 <tbody className="divide-y divide-outline-variant/10 text-sm">
 <tr>
 <td className="p-2.5 text-xs font-semibold">DISB-UTK-8819</td>
 <td className="p-2.5 font-bold">Joshimath Relief Air-Bridge</td>
 <td className="p-2.5 text-on-surface-variant">Helicopter sortie fuel &amp; ration crates</td>
 <td className="p-2.5 font-bold">₹14,20,000</td>
 <td className="p-2.5 text-right text-xs text-on-tertiary-container font-semibold">DUAL APPROVED</td>
 </tr>
 <tr>
 <td className="p-2.5 text-xs font-semibold">DISB-UTK-8818</td>
 <td className="p-2.5 font-bold">Kedarnath SDRF Emergency Unit</td>
 <td className="p-2.5 text-on-surface-variant">Medical triage supplies &amp; trauma saline</td>
 <td className="p-2.5 font-bold">₹11,80,000</td>
 <td className="p-2.5 text-right text-xs text-on-tertiary-container font-semibold">DUAL APPROVED</td>
 </tr>
 <tr>
 <td className="p-2.5 text-xs font-semibold">DISB-UTK-8817</td>
 <td className="p-2.5 font-bold">Uttarkashi Civil Drainage Taskforce</td>
 <td className="p-2.5 text-on-surface-variant">Mobile diesel de-watering pumps</td>
 <td className="p-2.5 font-bold">₹9,45,000</td>
 <td className="p-2.5 text-right text-xs text-on-tertiary-container font-semibold">DUAL APPROVED</td>
 </tr>
 </tbody>
 </table>
 </div>
 </div>
 </div>
 )}

 {activeTab === 'audit-log' && (
 <div className="space-y-6">
 <div>
 <span className="font-label-code-sm text-outline uppercase font-semibold ">SDMA Security Protocols</span>
 <h2 className="font-headline-xl font-bold text-on-surface mt-1">Cryptographic Activity &amp; Audit Trail</h2>
 <p className="font-body-sm text-on-surface-variant">Immutable ledger events registered under Section 43A Information Technology Act.</p>
 </div>

 <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 shadow-xs space-y-3">
 {[
 { time: '14:22:04 IST', type: 'TAX_INVOICE_DISPATCH', detail: '80G Certificate dispatched to donor Col. Sanjeev Rawat (Retd.) for ₹25,000', node: 'SEC-NODE-DEH-01' },
 { time: '14:21:45 IST', type: 'GATEWAY_SETTLEMENT', detail: 'Razorpay settlement batch sync completed: 4,046 successful webhooks verified', node: 'RZP-SYNC-DAEMON' },
 { time: '13:05:12 IST', type: 'ADMIN_SIGN_IN', detail: 'SDMA Officer Vikram Negi authenticated via FIDO2 hardware token challenge', node: 'SEC-GATEWAY-V4' },
 { time: '11:40:02 IST', type: 'REFUND_REVERSAL', detail: 'Authorized refund req_rf_401 processed. Certificate #UK-80G-99209 revoked.', node: 'SEC-TREASURY-04' },
 { time: '09:15:30 IST', type: 'AIR_BRIDGE_DISPATCH', detail: 'Treasury Block #4 allocated ₹14.20L to Chamoli disaster corridor air sorties', node: 'UK-SDMA-CORE' }
 ].map((ev, i) => (
 <div key={i} className="flex items-start justify-between p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 text-body-sm">
 <div className="flex items-start gap-3">
 <span className="material-symbols-outlined text-secondary text-[20px] mt-0.5">verified</span>
 <div>
 <div className="flex items-center gap-2">
 <span className="font-bold text-on-surface text-xs">{ev.type}</span>
 <span className="font-label-code-sm text-outline ">[{ev.node}]</span>
 </div>
 <p className="text-on-surface-variant text-sm mt-0.5">{ev.detail}</p>
 </div>
 </div>
 <span className="font-label-code-sm text-outline shrink-0">{ev.time}</span>
 </div>
 ))}
 </div>
 </div>
 )}

 {activeTab === 'settings' && (
 <div className="space-y-6 max-w-3xl">
 <div>
 <span className="font-label-code-sm text-outline uppercase font-semibold ">Platform Configuration</span>
 <h2 className="font-headline-xl font-bold text-on-surface mt-1">Admin &amp; Gateway Settings</h2>
 <p className="font-body-sm text-on-surface-variant">Manage sandbox environment parameters, webhook URLs, and dual-authorization limits.</p>
 </div>

 <div className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 p-5 shadow-xs space-y-4">
 <h3 className="font-bold text-on-surface text-base">Payment Gateway Environment</h3>
 <div className="flex items-center justify-between p-3 bg-surface-container-low rounded-xl border border-outline-variant/20">
 <div>
 <span className="font-bold text-sm block">Isolated Test Sandbox Mode</span>
 <span className="text-xs text-on-surface-variant">Simulate high-volume donations and failed gateway drop-offs without live currency transfers.</span>
 </div>
 <button
 type="button"
 onClick={() => {
 setIsTestMode(!isTestMode);
 showToast(`Switched to ${!isTestMode ? 'SANDBOX' : 'LIVE PRODUCTION'} mode.`);
 }}
 className={`h-9 px-4 rounded-lg font-semibold text-xs cursor-pointer transition-colors ${
 isTestMode ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
 }`}
 >
 {isTestMode ? 'Sandbox Active' : 'Live Active'}
 </button>
 </div>

 <div className="space-y-3 pt-2">
 <label className="block text-xs font-bold uppercase text-outline">Razorpay Webhook Endpoint</label>
 <input
 type="text"
 readOnly
 value="https://uk-relief.gov.in/api/v2/webhooks/razorpay/monsoon_cycle_64"
 className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-sm text-on-surface"
 />
 </div>

 <div className="space-y-3 pt-2">
 <label className="block text-xs font-bold uppercase text-outline">Dual Authorization Threshold</label>
 <input
 type="text"
 defaultValue="₹1,00,000 (INR)"
 className="w-full h-10 px-3 bg-surface rounded-lg border border-outline-variant/40 text-sm text-on-surface"
 />
 <p className="text-xs text-outline">Any disbursement exceeding this requires two independent officer biometric / token confirmations.</p>
 </div>
 </div>
 </div>
 )}

 </div>
 </main>
 </div>

 {/* 4. TOAST NOTIFICATION */}
 {toastMessage && (
 <div className="fixed bottom-6 right-6 z-50 bg-primary text-on-primary px-4 py-3 rounded-xl shadow-xl font-body-sm text-body-sm flex items-center gap-2 transform translate-y-0 opacity-100 transition-all duration-300 animate-slide-up">
 <span className="material-symbols-outlined text-[18px] text-on-tertiary-container">check_circle</span>
 <span>{toastMessage}</span>
 </div>
 )}

 </div>
 );
}

