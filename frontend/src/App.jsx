import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import LiveAlertsSafetyView from './components/LiveAlertsSafetyView';
import VerifiedSheltersView from './components/VerifiedSheltersView';
import ReliefCharityView from './components/ReliefCharityView';
import EmergencyNumbersView from './components/EmergencyNumbersView';
import RequestDisasterHelpModal from './components/RequestDisasterHelpModal';
import AdminSecureLogin from './components/admin/AdminSecureLogin';
import AdminConsoleLayout from './components/admin/AdminConsoleLayout';
import LandingPage from './components/landing/LandingPage';
import LoginPage from './components/auth/LoginPage';
import MobileBottomNav from './components/mobile/MobileBottomNav';
import MobileOfflineBanner from './components/mobile/MobileOfflineBanner';
import { setAuthToken } from './api';
import { subscribeNetworkStatus } from './services/mobileNativeService';
import { CheckCircle2, X } from 'lucide-react';

export default function App() {
 const [activeTab, setActiveTab] = useState('alerts'); // 'alerts' | 'shelters' | 'charity' | 'emergency'
 const [isOnline, setIsOnline] = useState(true);
 const [dismissOfflineBanner, setDismissOfflineBanner] = useState(false);
 
 // Citizen User Auth State
 const [currentUser, setCurrentUser] = useState(() => {
 try {
 const saved = localStorage.getItem('flood_flash_user');
 return saved ? JSON.parse(saved) : null;
 } catch {
 return null;
 }
 });

 // Admin Officer Auth State
 const [currentOfficer, setCurrentOfficer] = useState(() => {
 try {
 const saved = localStorage.getItem('flood_flash_admin_officer');
 return saved ? JSON.parse(saved) : null;
 } catch {
 return null;
 }
 });

 // Portal Mode: 'landing' | 'citizen' | 'login' | 'admin_login' | 'admin_console'
 const [portalMode, setPortalMode] = useState(() => {
 const hash = window.location.hash.toLowerCase();
 const savedOfficer = localStorage.getItem('flood_flash_admin_officer');
 if (hash.startsWith('#admin/login')) return 'admin_login';
 if (hash.startsWith('#admin')) return savedOfficer ? 'admin_console' : 'admin_login';
 if (hash.startsWith('#login') || hash.startsWith('#signin')) return 'login';
 if (hash.startsWith('#citizen') || hash.startsWith('#alerts') || hash.startsWith('#shelters') || hash.startsWith('#charity') || hash.startsWith('#emergency')) {
 return 'citizen';
 }
 // Default entry to the main landing page
 return 'landing';
 });

 const [helpModal, setHelpModal] = useState({ open: false, type: 'pump' });
 const [toastMessage, setToastMessage] = useState(null);

 function showToast(msg) {
 setToastMessage(msg);
 setTimeout(() => setToastMessage(null), 4000);
 }

 // Subscribe to native mobile network connectivity
 useEffect(() => {
 const unsubscribe = subscribeNetworkStatus((connected) => {
 setIsOnline(connected);
 if (!connected) setDismissOfflineBanner(false);
 });
 return () => {
 if (unsubscribe) unsubscribe();
 };
 }, []);

 // Sync Hash on mount and window hashchange with RBAC route protection
 useEffect(() => {
 const handleHashChange = () => {
 const hash = window.location.hash.toLowerCase();
 const savedOfficer = localStorage.getItem('flood_flash_admin_officer');

 // STRICT RBAC ROUTE GUARD:
 // If user is accessing #admin, ensure they have valid officer credentials
 if (hash.startsWith('#admin') && !hash.startsWith('#admin/login')) {
 if (!savedOfficer) {
 // Unauthenticated or non-officer cannot jump to admin console
 setPortalMode('admin_login');
 window.location.hash = '#admin/login';
 showToast('Access Restricted: SDMA Command Console requires authorized officer credentials.');
 return;
 } else {
 setPortalMode('admin_console');
 return;
 }
 }

 if (hash.startsWith('#admin/login')) {
 setPortalMode('admin_login');
 } else if (hash.startsWith('#login') || hash.startsWith('#signin')) {
 setPortalMode('login');
 } else if (hash.startsWith('#citizen') || hash.startsWith('#alerts') || hash.startsWith('#shelters') || hash.startsWith('#charity') || hash.startsWith('#emergency')) {
 setPortalMode('citizen');
 if (hash.startsWith('#shelters')) setActiveTab('shelters');
 else if (hash.startsWith('#charity')) setActiveTab('charity');
 else if (hash.startsWith('#emergency')) setActiveTab('emergency');
 else setActiveTab('alerts');
 } else if (hash === '' || hash === '#' || hash.startsWith('#landing') || hash.startsWith('#home')) {
 setPortalMode('landing');
 }
 };

 window.addEventListener('hashchange', handleHashChange);
 return () => window.removeEventListener('hashchange', handleHashChange);
 }, []);

 // Citizen Login / Logout Handlers
 const handleLoginSuccess = (user) => {
 setCurrentUser(user);
 localStorage.setItem('flood_flash_user', JSON.stringify(user));
 if (user.token) setAuthToken(user.token);
 showToast(`Welcome, ${user.full_name || user.username}! Identity verified.`);
 };

 const handleLoginSuccessFromPage = (user) => {
 handleLoginSuccess(user);
 setPortalMode('citizen');
 window.location.hash = '#alerts';
 };

 const handleLogout = () => {
 setCurrentUser(null);
 localStorage.removeItem('flood_flash_user');
 showToast('Logged out of Citizen Profile.');
 };

 // Admin Officer Login / Logout Handlers
 const handleAdminLoginSuccess = (officer) => {
 setCurrentOfficer(officer);
 localStorage.setItem('flood_flash_admin_officer', JSON.stringify(officer));
 if (officer.token) setAuthToken(officer.token);
 setPortalMode('admin_console');
 window.location.hash = '#admin';
 showToast(`Welcome, ${officer.full_name}! SDMA Secure Session Authorized.`);
 };

 const handleAdminLogout = () => {
 setCurrentOfficer(null);
 localStorage.removeItem('flood_flash_admin_officer');
 setAuthToken(null);
 setPortalMode('landing');
 window.location.hash = '#landing';
 showToast('Signed out of SDMA Disaster Command Console.');
 };

 // Navigation Handlers
 const handleEnterCitizen = () => {
 setPortalMode('citizen');
 window.location.hash = '#alerts';
 };

 const handleEnterAdmin = () => {
 if (currentOfficer) {
 setPortalMode('admin_console');
 window.location.hash = '#admin';
 } else {
 setPortalMode('admin_login');
 window.location.hash = '#admin/login';
 }
 };

 const handleOpenLogin = () => {
 setPortalMode('login');
 window.location.hash = '#login';
 };

 const handleOpenLanding = () => {
 setPortalMode('landing');
 window.location.hash = '#landing';
 };

 const handleRequestSuccess = (ticket) => {
 showToast(`Relief request ${ticket.id} submitted.`);
 };

 // ─── 1. RENDER MAIN LANDING PAGE (DEFAULT FRONT PAGE) ───
 if (portalMode === 'landing') {
 return (
 <div key="portal-landing" className="page-transition-enter min-h-screen">
 {toastMessage && (
 <div className="fixed bottom-5 right-5 z-50 bg-[#121418] text-white px-4 py-3 rounded-lg shadow-2xl border border-white/20 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-from-bottom-5">
 <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
 <span>{toastMessage}</span>
 <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 cursor-pointer">
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 <LandingPage
 onEnterCitizen={handleEnterCitizen}
 onEnterAdmin={handleEnterAdmin}
 onOpenLogin={handleOpenLogin}
 currentUser={currentUser}
 currentOfficer={currentOfficer}
 />
 </div>
 );
 }

 // ─── 2. RENDER DEDICATED LOGIN PAGE (WITH GOOGLE AUTH) ───
 if (portalMode === 'login') {
 return (
 <div key="portal-login" className="page-transition-enter min-h-screen">
 {toastMessage && (
 <div className="fixed bottom-5 right-5 z-50 bg-[#121418] text-white px-4 py-3 rounded-lg shadow-2xl border border-white/20 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-from-bottom-5">
 <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
 <span>{toastMessage}</span>
 <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-white ml-2 cursor-pointer">
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 )}
 <LoginPage
 onLoginSuccess={handleLoginSuccessFromPage}
 onAdminLoginSuccess={handleAdminLoginSuccess}
 onReturnToHome={handleOpenLanding}
 onReturnToCitizen={handleEnterCitizen}
 />
 </div>
 );
 }

 // ─── 3. RENDER ADMIN SECURE LOGIN (CONTOUR / HARDWARE TOKEN) ───
 if (portalMode === 'admin_login') {
 return (
 <div key="portal-admin-login" className="page-transition-enter min-h-screen">
 <AdminSecureLogin
 onLoginSuccess={handleAdminLoginSuccess}
 onReturnToCitizen={handleOpenLanding}
 />
 </div>
 );
 }

 // ─── 4. RENDER ADMIN CONSOLE (OPERATIONS & LEDGER) ───
 if (portalMode === 'admin_console') {
 return (
 <div key="portal-admin-console" className="page-transition-enter min-h-screen">
 <AdminConsoleLayout
 currentOfficer={currentOfficer}
 onLogout={handleAdminLogout}
 onReturnToCitizen={handleOpenLanding}
 />
 </div>
 );
 }

 // ─── 5. RENDER CITIZEN RESIDENT PORTAL (STRICTLY CITIZEN SAFE - ZERO ADMIN CONTROLS) ───
 return (
 <div key="portal-citizen" className="page-transition-enter min-h-screen bg-[#f4f6fb] text-slate-900 flex flex-col font-sans relative">
 
 {/* Offline / Low-Bandwidth Alert Banner (Native Mobile & Web) */}
 {!isOnline && !dismissOfflineBanner && (
 <MobileOfflineBanner onDismiss={() => setDismissOfflineBanner(true)} />
 )}

 {/* Toast Notification */}
 {toastMessage && (
 <div className="fixed bottom-20 sm:bottom-5 right-5 z-50 bg-white text-slate-900 px-4 py-3 rounded-lg shadow-xl border border-slate-200 flex items-center gap-3 text-xs font-semibold animate-in fade-in slide-from-bottom-5">
 <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
 <span>{toastMessage}</span>
 <button onClick={() => setToastMessage(null)} className="text-slate-400 hover:text-slate-700 ml-2 cursor-pointer">
 <X className="w-3.5 h-3.5" />
 </button>
 </div>
 )}

 {/* Main Citizen Navigation Header - ZERO admin links */}
 <Header
 activeTab={activeTab}
 setActiveTab={setActiveTab}
 onOpenLogin={handleOpenLogin}
 currentUser={currentUser}
 onLogout={handleLogout}
 onOpenLanding={handleOpenLanding}
 />

 {/* Dynamic Citizen Tab Body with smooth tab transitions */}
 <main className="flex-1 pb-20 lg:pb-12">
 <div key={activeTab} className="tab-transition-enter">
 {activeTab === 'alerts' && (
 <LiveAlertsSafetyView
 onNavigateTab={setActiveTab}
 onOpenReportModal={() => setHelpModal({ open: true, type: 'pump' })}
 />
 )}

 {activeTab === 'shelters' && (
 <VerifiedSheltersView
 onOpenShuttleModal={() => setHelpModal({ open: true, type: 'shuttle' })}
 />
 )}

 {activeTab === 'charity' && (
 <ReliefCharityView />
 )}

 {activeTab === 'emergency' && (
 <EmergencyNumbersView />
 )}
 </div>
 </main>

 {/* 1-Tap Emergency SOS Request Modal */}
 <RequestDisasterHelpModal
 isOpen={helpModal.open}
 type={helpModal.type}
 onClose={() => setHelpModal({ open: false, type: 'pump' })}
 onSubmitSuccess={handleRequestSuccess}
 />

 {/* Mobile Bottom Navigation Bar (Visible only on mobile screens < 640px) */}
 <MobileBottomNav
 activeTab={activeTab}
 setActiveTab={setActiveTab}
 onOpenSosModal={() => setHelpModal({ open: true, type: 'pump' })}
 />

 </div>
 );
}
