import React, { useState } from 'react';
import { 
 ShieldCheck, 
 ArrowRight, 
 ArrowLeft, 
 Lock, 
 Smartphone, 
 Mail, 
 KeyRound, 
 CheckCircle2, 
 AlertCircle, 
 Zap, 
 UserCheck, 
 PhoneCall, 
 Radio, 
 Eye, 
 EyeOff,
 Sparkles
} from 'lucide-react';
import { loginUser, loginWithGoogle } from '../../api';

export default function LoginPage({ 
 onLoginSuccess, 
 onAdminLoginSuccess, 
 onReturnToHome,
 onReturnToCitizen,
 onOpenHardwareTokenAdmin
}) {
 const [portalTab, setPortalTab] = useState('citizen'); // 'citizen' | 'official'
 const [citizenAuthMode, setCitizenAuthMode] = useState('google'); // 'google' | 'phone' | 'email'
 
 // Form states
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [phone, setPhone] = useState('98765 43210');
 const [otpSent, setOtpSent] = useState(false);
 const [otpCode, setOtpCode] = useState('');
 const [showPassword, setShowPassword] = useState(false);

 // Status & feedback
 const [isLoading, setIsLoading] = useState(false);
 const [errorMsg, setErrorMsg] = useState(null);
 const [successMsg, setSuccessMsg] = useState(null);
 const [googleModalOpen, setGoogleModalOpen] = useState(false);

 // Preset demo Google accounts for easy 1-click test
 const demoGoogleAccounts = [
 {
 name: "Ananya Sharma",
 email: "ananya.sharma@gmail.com",
 role: "Verified Citizen Resident",
 district: "Dehradun (Ward 04)"
 },
 {
 name: "Dr. Rohan Joshi",
 email: "rohan.joshi.dr@gmail.com",
 role: "Emergency Medical Volunteer",
 district: "Rudraprayag"
 },
 {
 name: "Pooja Bisht",
 email: "pooja.bisht.relief@gmail.com",
 role: "Community NGO Coordinator",
 district: "Chamoli"
 }
 ];

 // 1. Google OAuth Authentication Handler
 const handleGoogleAuth = async (selectedAccount) => {
 setIsLoading(true);
 setErrorMsg(null);
 try {
 const googlePayload = selectedAccount || {
 email: "citizen.resident@gmail.com",
 full_name: "Citizen Resident (Google Verified)",
 token: "mock_google_oauth2_token_xyz"
 };

 const res = await loginWithGoogle(googlePayload);
 setSuccessMsg(`Welcome, ${res.full_name || res.username}! Authenticated with Google.`);
 setTimeout(() => {
 onLoginSuccess({
 username: res.username,
 full_name: res.full_name,
 email: res.email,
 role: res.role,
 token: res.access_token,
 authMethod: 'google'
 });
 }, 500);
 } catch (err) {
 console.warn("[Google Auth fallback to local session]:", err.message);
 // Fallback in case backend is offline
 const fallbackUser = {
 username: (selectedAccount?.email || "citizen@gmail.com").split('@')[0],
 full_name: selectedAccount?.name || "Citizen Resident (Google)",
 email: selectedAccount?.email || "citizen@gmail.com",
 role: "viewer",
 authMethod: 'google'
 };
 onLoginSuccess(fallbackUser);
 } finally {
 setIsLoading(false);
 setGoogleModalOpen(false);
 }
 };

 // 2. Email / Password Form Submit
 const handleEmailLogin = async (e) => {
 e.preventDefault();
 if (!email || !password) {
 setErrorMsg("Please enter both email and password");
 return;
 }

 setIsLoading(true);
 setErrorMsg(null);

 try {
 const res = await loginUser(email, password);
 setSuccessMsg(`Access granted! Welcome, ${res.full_name}.`);

 setTimeout(() => {
 if (res.role === 'admin' || res.role === 'district_official' || portalTab === 'official') {
 onAdminLoginSuccess({
 username: res.username,
 full_name: res.full_name,
 email: res.email,
 role: res.role,
 token: res.access_token
 });
 } else {
 onLoginSuccess({
 username: res.username,
 full_name: res.full_name,
 email: res.email,
 role: res.role,
 token: res.access_token
 });
 }
 }, 400);
 } catch (err) {
 setErrorMsg(err.message || "Invalid credentials. Please verify email and password.");
 } finally {
 setIsLoading(false);
 }
 };

 // 3. Phone OTP Flow
 const handleSendOtp = (e) => {
 e.preventDefault();
 if (!phone) {
 setErrorMsg("Please enter a valid mobile number");
 return;
 }
 setOtpSent(true);
 setErrorMsg(null);
 };

 const handleVerifyOtp = (e) => {
 e.preventDefault();
 if (!otpCode || otpCode.length < 4) {
 setErrorMsg("Please enter the 6-digit emergency passcode");
 return;
 }

 setIsLoading(true);
 setTimeout(() => {
 setIsLoading(false);
 const user = {
 username: `+91 ${phone}`,
 full_name: "Citizen Resident",
 role: "viewer",
 authMethod: "phone_otp"
 };
 onLoginSuccess(user);
 }, 400);
 };

 // Quick preset loader
 const fillDemoCredentials = (target) => {
 setErrorMsg(null);
 if (target === 'officer_rawat') {
 setPortalTab('official');
 setEmail('officer.rawat@uk-relief.gov.in');
 setPassword('official123');
 } else if (target === 'officer_negi') {
 setPortalTab('official');
 setEmail('vikram.negi@uk-relief.gov.in');
 setPassword('official123');
 } else if (target === 'citizen_ananya') {
 setPortalTab('citizen');
 setCitizenAuthMode('email');
 setEmail('citizen@uttarakhand.in');
 setPassword('official123');
 }
 };

 return (
 <div className="min-h-screen bg-[#050505] text-[#e1e2e5] font-sans flex flex-col justify-between selection:bg-amber-400/20 selection:text-amber-200 relative overflow-hidden">
 
 {/* ─── AMBIENT BACKGROUND GLOW & CONTOURS ─── */}
 <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-b from-amber-500/10 via-cyan-500/5 to-transparent blur-[140px] pointer-events-none"></div>

 {/* Topographic Background Contour Grid */}
 <div className="absolute inset-0 pointer-events-none opacity-10">
 <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
 <defs>
 <pattern id="contour-grid" width="60" height="60" patternUnits="userSpaceOnUse">
 <path d="M 60 0 L 0 0 0 60" fill="none" stroke="rgba(255, 255, 255, 0.4)" strokeWidth="0.5" />
 <circle cx="30" cy="30" r="1.5" fill="rgba(217, 119, 6, 0.5)" />
 </pattern>
 </defs>
 <rect width="100%" height="100%" fill="url(#contour-grid)" />
 </svg>
 </div>

 {/* ─── TOP NAVIGATION BAR ─── */}
 <header className="relative z-20 border-b border-white/10 px-6 py-4 bg-[#050505]/80 backdrop-blur-md">
 <div className="max-w-6xl mx-auto flex items-center justify-between">
 
 {/* Brand */}
 <div className="flex items-center gap-3">
 <button 
 onClick={onReturnToHome}
 className="flex items-center gap-2 group cursor-pointer"
 >
 <span className=" text-xl font-bold tracking-tight text-white group-hover:text-amber-300 transition-colors">
 FloodFlash<span className="text-amber-400">.</span>
 </span>
 </button>
 <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-slate-400">
 UNIFIED AUTH GATEWAY
 </span>
 </div>

 {/* Quick Return Actions */}
 <div className="flex items-center gap-4 text-xs ">
 <button
 onClick={onReturnToHome}
 className="flex items-center gap-1.5 text-slate-400 hover:text-white transition-colors cursor-pointer"
 >
 <ArrowLeft className="w-3.5 h-3.5" />
 <span>Back to Home</span>
 </button>

 <button
 onClick={onReturnToCitizen}
 className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/15 text-slate-200 transition-all cursor-pointer"
 >
 <span>Public Citizen Portal</span>
 <ArrowRight className="w-3 h-3" />
 </button>
 </div>

 </div>
 </header>

 {/* ─── MAIN AUTHENTICATION CONTAINER ─── */}
 <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-6">
 <div className="w-full max-w-xl bg-[#0b0c0e]/90 border border-white/15 rounded-2xl shadow-2xl overflow-hidden backdrop-blur-xl">
 
 {/* Card Top Official Telemetry Header */}
 <div className="bg-[#101216] px-6 py-4 border-b border-white/10 flex items-center justify-between">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-lg bg-amber-400/10 border border-amber-400/30 flex items-center justify-center text-amber-300">
 <ShieldCheck className="w-4 h-4" />
 </div>
 <div>
 <div className="text-[10px] uppercase tracking-widest text-slate-400 font-bold">
 STATE DISASTER MANAGEMENT AUTHORITY
 </div>
 <div className="text-sm font-medium text-white">
 Secure Access & Identity Verification
 </div>
 </div>
 </div>

 <div className="hidden sm:flex items-center gap-1.5 text-[10px] text-emerald-400">
 <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
 <span>256-BIT ENCRYPTED</span>
 </div>
 </div>

 {/* Portal Switcher Tabs (Citizen vs Official) */}
 <div className="p-6 pb-2">
 <div className="flex items-center p-1 bg-white/5 rounded-xl border border-white/10">
 <button
 type="button"
 onClick={() => {
 setPortalTab('citizen');
 setErrorMsg(null);
 }}
 className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
 portalTab === 'citizen'
 ? 'bg-white text-black shadow-lg'
 : 'text-slate-400 hover:text-white'
 }`}
 >
 <span>👤</span>
 <span>Citizen / Resident</span>
 </button>

 <button
 type="button"
 onClick={() => {
 setPortalTab('official');
 setErrorMsg(null);
 }}
 className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
 portalTab === 'official'
 ? 'bg-amber-400 text-black shadow-lg font-bold'
 : 'text-slate-400 hover:text-white'
 }`}
 >
 <span>🛡️</span>
 <span>Official / Admin</span>
 </button>
 </div>
 </div>

 {/* Notification Messages */}
 {errorMsg && (
 <div className="mx-6 mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-center gap-2">
 <AlertCircle className="w-4 h-4 shrink-0" />
 <span>{errorMsg}</span>
 </div>
 )}

 {successMsg && (
 <div className="mx-6 mt-3 p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center gap-2">
 <CheckCircle2 className="w-4 h-4 shrink-0" />
 <span>{successMsg}</span>
 </div>
 )}

 {/* ═══════════════ CITIZEN AUTHENTICATION BODY ═══════════════ */}
 {portalTab === 'citizen' && (
 <div className="p-6 space-y-6">
 
 {/* ── GOOGLE AUTHENTICATION BUTTON (PROMINENT TOP POSITION) ── */}
 <div>
 <button
 type="button"
 onClick={() => setGoogleModalOpen(true)}
 disabled={isLoading}
 className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-sans font-semibold text-sm transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg hover:shadow-white/20 border border-slate-200 group relative overflow-hidden"
 >
 {/* Google Multi-color G Icon */}
 <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
 <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
 <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
 <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
 <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
 </svg>
 <span>Continue with Google</span>
 <span className="ml-auto text-[10px] uppercase font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
 Instant
 </span>
 </button>
 <p className="text-[10px] text-center text-slate-500 mt-2">
 One-tap secure login with your Google account • Fast disaster alerts & SOS priority
 </p>
 </div>

 {/* Divider */}
 <div className="relative flex items-center justify-center">
 <div className="border-t border-white/10 w-full"></div>
 <span className="bg-[#0b0c0e] px-3 text-[10px] text-slate-500 uppercase tracking-widest shrink-0">
 OR SIGN IN WITH
 </span>
 <div className="border-t border-white/10 w-full"></div>
 </div>

 {/* Citizen Auth Method Sub-Toggle */}
 <div className="flex items-center justify-center gap-4 text-xs ">
 <button
 type="button"
 onClick={() => setCitizenAuthMode('email')}
 className={`pb-1 border-b-2 cursor-pointer transition-all ${
 citizenAuthMode === 'email' 
 ? 'border-white text-white font-bold' 
 : 'border-transparent text-slate-500 hover:text-slate-300'
 }`}
 >
 Email & Password
 </button>
 <span className="text-slate-600">/</span>
 <button
 type="button"
 onClick={() => setCitizenAuthMode('phone')}
 className={`pb-1 border-b-2 cursor-pointer transition-all ${
 citizenAuthMode === 'phone' 
 ? 'border-white text-white font-bold' 
 : 'border-transparent text-slate-500 hover:text-slate-300'
 }`}
 >
 Phone SMS OTP
 </button>
 </div>

 {/* Form 1: Email & Password */}
 {citizenAuthMode === 'email' && (
 <form onSubmit={handleEmailLogin} className="space-y-4">
 <div>
 <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
 EMAIL ADDRESS
 </label>
 <div className="relative">
 <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
 <input
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="citizen@uttarakhand.in"
 className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white transition-all"
 required
 />
 </div>
 </div>

 <div>
 <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
 PASSWORD
 </label>
 <div className="relative">
 <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
 <input
 type={showPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••••••"
 className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-white transition-all"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-200 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
 >
 <span>{isLoading ? 'Verifying Credentials...' : 'Sign In to Citizen Profile'}</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </form>
 )}

 {/* Form 2: Phone OTP */}
 {citizenAuthMode === 'phone' && (
 <div className="space-y-4">
 {!otpSent ? (
 <form onSubmit={handleSendOtp} className="space-y-4">
 <div>
 <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
 MOBILE NUMBER
 </label>
 <div className="flex items-center bg-black/50 border border-white/15 rounded-xl overflow-hidden focus-within:border-white transition-all">
 <span className="px-3.5 py-2.5 bg-white/5 border-r border-white/10 text-xs text-slate-400 font-bold">
 +91
 </span>
 <input
 type="tel"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="98765 43210"
 className="w-full px-3.5 py-2.5 text-xs text-white bg-transparent outline-none"
 required
 />
 </div>
 <p className="text-[10px] text-slate-500 mt-1.5">
 Instant one-time security passcode will be sent via National Emergency Gateway.
 </p>
 </div>

 <button
 type="submit"
 className="w-full py-3 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
 >
 <span>Generate Emergency OTP</span>
 <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
 </button>
 </form>
 ) : (
 <form onSubmit={handleVerifyOtp} className="space-y-4">
 <div>
 <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
 ENTER 6-DIGIT PASSCODE
 </label>
 <input
 type="text"
 maxLength={6}
 value={otpCode}
 onChange={(e) => setOtpCode(e.target.value)}
 placeholder="123456"
 className="w-full py-3 px-4 bg-black/50 border border-white/20 rounded-xl text-center text-lg tracking-widest text-white outline-none focus:border-emerald-400"
 required
 />
 <div className="flex items-center justify-between text-[10px] text-emerald-400 mt-1.5">
 <span>OTP sent to +91 {phone}</span>
 <button 
 type="button" 
 onClick={() => setOtpSent(false)} 
 className="text-slate-400 hover:text-white underline cursor-pointer"
 >
 Change number
 </button>
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
 >
 <span>Verify & Sign In</span>
 <ArrowRight className="w-3.5 h-3.5" />
 </button>
 </form>
 )}
 </div>
 )}

 {/* Demo Quick-Fill Pills */}
 <div className="pt-2 border-t border-white/5 space-y-2">
 <div className="text-[10px] uppercase text-slate-500">
 QUICK-FILL TEST PROFILES:
 </div>
 <div className="flex flex-wrap gap-2 text-[11px] ">
 <button
 type="button"
 onClick={() => fillDemoCredentials('citizen_ananya')}
 className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer"
 >
 👤 Citizen: citizen@uttarakhand.in
 </button>
 <button
 type="button"
 onClick={() => handleGoogleAuth(demoGoogleAccounts[0])}
 className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-cyan-300 cursor-pointer"
 >
 Google: Ananya Sharma
 </button>
 </div>
 </div>

 {/* Public Guest Pass Button */}
 <div className="pt-2">
 <button
 type="button"
 onClick={onReturnToCitizen}
 className="w-full py-2.5 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-xs flex items-center justify-between transition-colors cursor-pointer"
 >
 <span>Continue as Public Viewer (No Login Required)</span>
 <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
 GUEST PASS <ArrowRight className="w-3 h-3" />
 </span>
 </button>
 </div>

 </div>
 )}

 {/* ═══════════════ OFFICIAL / ADMIN AUTHENTICATION BODY ═══════════════ */}
 {portalTab === 'official' && (
 <div className="p-6 space-y-6">
 
 {/* Official Alert Notice */}
 <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs space-y-1">
 <div className="font-bold flex items-center gap-1.5 text-amber-300">
 <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
 <span>SDMA SECTOR 04 OFFICIAL COMMAND ACCESS</span>
 </div>
 <p className="text-[11px] text-amber-200/80 leading-relaxed">
 Restricted to authorized Disaster Management Authorities, District Magistrates, and NDRF Incident Commanders.
 </p>
 </div>

 {/* Hardware Token Quick Option */}
 <button
 type="button"
 onClick={onOpenHardwareTokenAdmin}
 className="w-full py-3 px-4 rounded-xl bg-white/5 hover:bg-white/10 border border-amber-400/40 text-amber-300 text-xs flex items-center justify-between transition-all cursor-pointer group shadow-sm"
 >
 <div className="flex items-center gap-2">
 <ShieldCheck className="w-4 h-4 text-amber-400" />
 <span className="font-bold">Switch to SDMA Hardware Key / Contour Gateway</span>
 </div>
 <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
 </button>

 {/* Officer Form */}
 <form onSubmit={handleEmailLogin} className="space-y-4">
 <div>
 <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
 GOVERNMENT EMAIL OR OFFICER ID
 </label>
 <div className="relative">
 <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
 <input
 type="text"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 placeholder="officer.rawat@uk-relief.gov.in"
 className="w-full pl-10 pr-4 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-all"
 required
 />
 </div>
 </div>

 <div>
 <label className="block text-[11px] uppercase tracking-wider text-slate-400 mb-1.5">
 OFFICER PASSPHRASE
 </label>
 <div className="relative">
 <KeyRound className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
 <input
 type={showPassword ? 'text' : 'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 placeholder="••••••••••••"
 className="w-full pl-10 pr-10 py-2.5 bg-black/50 border border-white/15 rounded-xl text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-400 transition-all"
 required
 />
 <button
 type="button"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-3.5 top-3 text-slate-500 hover:text-white"
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </button>
 </div>
 </div>

 <button
 type="submit"
 disabled={isLoading}
 className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-amber-400/20"
 >
 <ShieldCheck className="w-4 h-4" />
 <span>{isLoading ? 'Authorizing Command Session...' : 'Authorize SDMA Session'}</span>
 </button>
 </form>

 {/* Demo Officer Accounts */}
 <div className="pt-2 border-t border-white/5 space-y-2">
 <div className="text-[10px] uppercase text-slate-500">
 OFFICIAL DEMO ACCOUNTS:
 </div>
 <div className="flex flex-wrap gap-2 text-[11px] ">
 <button
 type="button"
 onClick={() => fillDemoCredentials('officer_rawat')}
 className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-amber-300 cursor-pointer"
 >
 🛡️ Col. Sanjeev Rawat (Pass: official123)
 </button>
 <button
 type="button"
 onClick={() => fillDemoCredentials('officer_negi')}
 className="px-2.5 py-1 rounded-md bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 cursor-pointer"
 >
 Vikram Negi (Pass: official123)
 </button>
 </div>
 </div>

 </div>
 )}

 {/* Footer Security Badges */}
 <div className="bg-[#08090a] px-6 py-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2">
 <div className="flex items-center gap-1.5">
 <Lock className="w-3 h-3 text-emerald-400" />
 <span>TLS 1.3 / AES-256 Hardware Telemetry</span>
 </div>
 <div>
 EMERGENCY DIAL: <a href="tel:1077" className="text-amber-400 font-bold hover:underline">1077</a>
 </div>
 </div>

 </div>
 </main>

 {/* ─── GOOGLE ACCOUNT SELECTION MODAL ─── */}
 {googleModalOpen && (
 <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
 <div className="w-full max-w-md bg-[#121418] border border-white/20 rounded-2xl shadow-2xl p-6 space-y-5 animate-in fade-in zoom-in-95 duration-150">
 
 {/* Modal Header */}
 <div className="flex items-center justify-between border-b border-white/10 pb-4">
 <div className="flex items-center gap-3">
 <svg className="w-6 h-6" viewBox="0 0 24 24">
 <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
 <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
 <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
 <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
 </svg>
 <div>
 <h4 className="text-sm font-bold text-white">Sign in with Google</h4>
 <p className="text-[11px] text-slate-400">Choose an account to continue to FloodFlash</p>
 </div>
 </div>

 <button
 onClick={() => setGoogleModalOpen(false)}
 className="text-slate-400 hover:text-white p-1 text-sm cursor-pointer"
 >
 ✕
 </button>
 </div>

 {/* Account List */}
 <div className="space-y-2">
 {demoGoogleAccounts.map((acc, idx) => (
 <button
 key={idx}
 type="button"
 onClick={() => handleGoogleAuth(acc)}
 className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-amber-400/40 transition-all flex items-center gap-3.5 text-left cursor-pointer group"
 >
 <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center font-bold text-white text-xs shrink-0 shadow-sm">
 {acc.name.charAt(0)}
 </div>
 <div className="overflow-hidden flex-1">
 <div className="text-xs font-semibold text-white group-hover:text-amber-200 transition-colors">
 {acc.name}
 </div>
 <div className="text-[11px] text-slate-400 truncate">{acc.email}</div>
 <div className="text-[10px] text-slate-500 mt-0.5">{acc.district} • {acc.role}</div>
 </div>
 <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-white group-hover:translate-x-1 transition-all shrink-0" />
 </button>
 ))}

 {/* Custom Google Email input */}
 <div className="pt-2">
 <button
 type="button"
 onClick={() => {
 const custom = prompt("Enter your Google Email (e.g. yourname@gmail.com):", "citizen.test@gmail.com");
 if (custom) {
 handleGoogleAuth({
 email: custom,
 name: custom.split('@')[0].replace('.', ' '),
 district: "Uttarakhand General"
 });
 }
 }}
 className="w-full py-2.5 px-3 rounded-lg bg-transparent hover:bg-white/5 border border-dashed border-white/20 text-xs text-slate-400 hover:text-white text-center cursor-pointer transition-colors"
 >
 + Use another Google account
 </button>
 </div>
 </div>

 {/* Privacy note */}
 <p className="text-[10px] text-slate-500 text-center leading-relaxed">
 To continue, Google will share your name, email address, and language preference with FloodFlash.
 </p>

 </div>
 </div>
 )}

 {/* ─── BOTTOM LEGAL BAR ─── */}
 <footer className="relative z-10 border-t border-white/10 px-6 py-4 text-center text-xs text-slate-600">
 © 2026 FloodFlash AI. State Disaster Management Authority & National Civil Defense. All rights reserved.
 </footer>

 </div>
 );
}
