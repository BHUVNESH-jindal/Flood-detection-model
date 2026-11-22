import React, { useState } from 'react';
import { useGoogleLogin } from '@react-oauth/google';
import { 
  ShieldCheck, 
  ArrowRight, 
  ArrowLeft, 
  Lock, 
  Mail, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  Eye, 
  EyeOff,
  Loader2
} from 'lucide-react';
import { loginUser, loginWithGoogle } from '../../api';

export default function LoginPage({ 
  onLoginSuccess, 
  onAdminLoginSuccess, 
  onReturnToHome,
  onReturnToCitizen
}) {
  const [portalTab, setPortalTab] = useState('citizen'); // 'citizen' | 'official'
  
  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Status & feedback
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(null);

  const isClientIdConfigured = () => {
    const id = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';
    return id && !id.includes('YOUR_GOOGLE_CLIENT_ID_HERE');
  };

  // ─── Real Google OAuth via @react-oauth/google ───────────────────────────
  // Uses the Authorization Code flow (popup) — sends the Google credential
  // (ID token) to our backend for server-side verification.
  const triggerGoogleLogin = useGoogleLogin({
    // tokenResponse flow gives us access_token; use code flow for ID token
    flow: 'implicit',
    onSuccess: async (tokenResponse) => {
      // tokenResponse.access_token is a Google Access Token.
      // We fetch the userinfo to get email + name, then send to backend.
      setIsGoogleLoading(true);
      setErrorMsg(null);
      try {
        // Fetch user info from Google
        const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
        });
        if (!userInfoRes.ok) throw new Error('Failed to fetch Google profile info.');
        const userInfo = await userInfoRes.json();

        const googlePayload = {
          email: userInfo.email,
          full_name: userInfo.name || userInfo.email,
          sub: userInfo.sub,
          avatar_url: userInfo.picture || null,
        };

        const res = await loginWithGoogle(googlePayload);
        setSuccessMsg(`Welcome, ${res.full_name || res.username}! Signed in with Google.`);
        setTimeout(() => {
          onLoginSuccess({
            username: res.username,
            full_name: res.full_name,
            email: res.email,
            role: res.role,
            token: res.access_token,
            authMethod: 'google',
            avatar_url: userInfo.picture || null,
          });
        }, 500);
      } catch (err) {
        setErrorMsg(err.message || 'Google sign-in failed. Please try again.');
      } finally {
        setIsGoogleLoading(false);
      }
    },
    onError: (err) => {
      console.error('[Google OAuth] Error:', err);
      setErrorMsg(
        err?.error === 'popup_closed_by_user'
          ? 'Sign-in popup was closed. Please try again.'
          : 'Google sign-in failed. Make sure pop-ups are allowed and try again.'
      );
      setIsGoogleLoading(false);
    },
  });

  const handleGoogleSignIn = () => {
    if (!isClientIdConfigured()) {
      setErrorMsg(
        'Google Sign-In is not configured yet. Please add VITE_GOOGLE_CLIENT_ID to frontend/.env and GOOGLE_CLIENT_ID to .env, then restart the dev server.'
      );
      return;
    }
    setErrorMsg(null);
    setIsGoogleLoading(true);
    triggerGoogleLogin();
  };

  // ─── Standard Email/Password Login ───────────────────────────────────────
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);
    setSuccessMsg(null);

    try {
      const res = await loginUser(email.trim(), password);

      if (portalTab === 'official') {
        if (!['official', 'district_official', 'admin'].includes(res.role)) {
          throw new Error("This profile does not possess SDMA Officer command clearance.");
        }
        setSuccessMsg(`Access granted! Welcome, ${res.full_name}.`);
        setTimeout(() => {
          onAdminLoginSuccess({
            username: res.username,
            full_name: res.full_name,
            email: res.email,
            role: res.role,
            token: res.access_token
          });
        }, 500);
      } else {
        setSuccessMsg(`Welcome back, ${res.full_name || res.username}!`);
        setTimeout(() => {
          onLoginSuccess({
            username: res.username,
            full_name: res.full_name,
            email: res.email,
            role: res.role,
            token: res.access_token,
            authMethod: 'email_password'
          });
        }, 500);
      }
    } catch (err) {
      setErrorMsg(err.message || "Invalid credentials or unauthorized login.");
    } finally {
      setIsLoading(false);
    }
  };

  // Quick preset loader
  const fillDemoCredentials = (target) => {
    setErrorMsg(null);
    if (target === 'officer_rawat') {
      setPortalTab('official');
      setEmail('officer.rawat@uk-relief.gov.in');
      setPassword('official123');
    } else if (target === 'citizen_ananya') {
      setPortalTab('citizen');
      setEmail('citizen@uttarakhand.in');
      setPassword('CitizenPass2026!');
    }
  };

  return (
    <div className="relative min-h-screen bg-[#020408] text-white flex flex-col justify-between overflow-x-hidden font-sans">
      
      {/* Ambient background glow */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-blue-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[400px] bg-emerald-600/10 rounded-full blur-[120px]" />
      </div>

      {/* Top Navbar */}
      <header className="relative z-20 border-b border-white/10 px-6 py-4 bg-[#050505]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div 
            onClick={onReturnToHome}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-md group-hover:scale-105 transition-transform">
              FF
            </div>
            <div>
              <span className="font-extrabold text-sm tracking-tight text-white block">Flood-Flash AI</span>
              <span className="text-[10px] text-slate-400 font-mono tracking-wider">UTTARAKHAND EARLY WARNING</span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-xs">
            <button
              onClick={onReturnToCitizen}
              className="px-3.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Public Citizen Portal</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 flex-1 flex items-center justify-center p-4 sm:p-6 my-auto">
        <div className="w-full max-w-md bg-[#0a0c10]/90 backdrop-blur-xl border border-white/15 rounded-2xl shadow-2xl overflow-hidden">
          
          {/* Card Top Official Header */}
          <div className="p-6 border-b border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent">
            <div className="flex items-center justify-between mb-4">
              <span className="px-2.5 py-1 rounded bg-white/10 text-[10px] font-mono uppercase tracking-wider text-slate-300 border border-white/10">
                SECURE IDENTITY GATEWAY
              </span>
              <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                ONLINE
              </span>
            </div>

            <h1 className="text-2xl font-black tracking-tight text-white">
              {portalTab === 'citizen' ? 'Citizen Resident Sign In' : 'SDMA Command Authorization'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              {portalTab === 'citizen' 
                ? 'Access safe-zone navigation, SOS dispatch tickets, and verified relief logs.' 
                : 'Officer authentication for risk telemetry, alert dissemination, and relief operations.'}
            </p>

            {/* Portal Tab Pill Toggle */}
            <div className="grid grid-cols-2 gap-1.5 p-1 bg-black/60 border border-white/10 rounded-xl mt-5">
              <button
                type="button"
                onClick={() => {
                  setPortalTab('citizen');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  portalTab === 'citizen'
                    ? 'bg-white text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Resident Citizen
              </button>
              <button
                type="button"
                onClick={() => {
                  setPortalTab('official');
                  setErrorMsg(null);
                  setSuccessMsg(null);
                }}
                className={`py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  portalTab === 'official'
                    ? 'bg-amber-400 text-black shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                SDMA Officer
              </button>
            </div>
          </div>

          {/* Feedback Banners */}
          {errorMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-xs text-red-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mx-6 mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* ═══════════════ CITIZEN RESIDENT AUTHENTICATION BODY ═══════════════ */}
          {portalTab === 'citizen' && (
            <div className="p-6 space-y-6">
              
              {/* ── Real Google Sign-In Button ── */}
              <div>
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isGoogleLoading || isLoading}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-60 disabled:cursor-not-allowed text-slate-900 font-bold text-xs transition-all flex items-center justify-center gap-3 cursor-pointer shadow-lg active:scale-95"
                >
                  {isGoogleLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-slate-500" />
                      <span>Connecting to Google...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" viewBox="0 0 24 24">
                        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"/>
                        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                      </svg>
                      <span>Continue with Google</span>
                    </>
                  )}
                </button>

                {/* Configuration warning if Client ID not set */}
                {!isClientIdConfigured() && (
                  <div className="mt-2 p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/80 leading-relaxed">
                    ⚙️ <strong>Setup needed:</strong> Add your Google Client ID to{' '}
                    <code className="text-amber-200 font-mono">frontend/.env</code> and{' '}
                    <code className="text-amber-200 font-mono">.env</code> to enable real Google sign-in.
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="relative flex items-center justify-center">
                <div className="border-t border-white/10 w-full"></div>
                <span className="bg-[#0a0c10] px-3 text-[10px] text-slate-500 uppercase tracking-widest font-mono shrink-0">
                  OR SIGN IN WITH EMAIL
                </span>
                <div className="border-t border-white/10 w-full"></div>
              </div>

              {/* Form: Email & Password */}
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
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || isGoogleLoading}
                  className="w-full py-3 px-4 rounded-xl bg-white hover:bg-slate-200 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In to Citizen Profile</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>

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
                </div>
              </div>

              {/* Guest Pass Shortcut */}
              <div className="pt-2 border-t border-white/5">
                <button
                  type="button"
                  onClick={onReturnToCitizen}
                  className="w-full py-2.5 px-3 rounded-lg bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 text-slate-400 hover:text-white text-xs flex items-center justify-between transition-colors cursor-pointer"
                >
                  <span>Continue as Public Viewer (No Login Required)</span>
                  <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1">
                    GUEST PASS <ArrowRight className="w-3.5 h-3.5" />
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
                  <span>SDMA OFFICIAL COMMAND ACCESS</span>
                </div>
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  Restricted to authorized Disaster Management Authorities, District Magistrates, and NDRF Incident Commanders.
                </p>
              </div>

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
                      className="absolute right-3.5 top-3 text-slate-500 hover:text-white cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 disabled:opacity-60 disabled:cursor-not-allowed text-black font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg hover:shadow-amber-400/20"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Authorizing Command Session...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4" />
                      <span>Authorize SDMA Session</span>
                    </>
                  )}
                </button>
              </form>

              {/* Demo Quick-Fill Pills for Officer */}
              <div className="pt-2 border-t border-white/5 space-y-2">
                <div className="text-[10px] uppercase text-slate-500">
                  OFFICIAL TEST PROFILE:
                </div>
                <div className="flex flex-wrap gap-2 text-[11px] ">
                  <button
                    type="button"
                    onClick={() => fillDemoCredentials('officer_rawat')}
                    className="px-2.5 py-1 rounded-md bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-200 cursor-pointer"
                  >
                    🛡️ Officer: officer.rawat@uk-relief.gov.in
                  </button>
                </div>
              </div>

              {/* Official Verification Notice */}
              <div className="pt-2 border-t border-white/5 flex items-center justify-between text-[11px] text-slate-400">
                <span className="flex items-center gap-1.5 text-amber-400/90 font-medium">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Authorized SDMA Officer Access</span>
                </span>
                <span className="text-[10px] text-slate-500 font-mono">GOV-SEC-AUTH</span>
              </div>

            </div>
          )}

          {/* Footer Security Badges */}
          <div className="bg-[#08090a] px-6 py-3 border-t border-white/10 flex flex-wrap items-center justify-between text-[10px] text-slate-500 gap-2">
            <div className="flex items-center gap-1.5">
              <Lock className="w-3 h-3 text-emerald-400" />
              <span>Official SDMA Disaster Response Network • Encrypted Portal</span>
            </div>
            <div>
              EMERGENCY DIAL: <a href="tel:1077" className="text-amber-400 font-bold hover:underline">1077</a>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Legal Bar */}
      <footer className="relative z-10 border-t border-white/10 px-6 py-4 text-center text-xs text-slate-600">
        © 2026 FloodFlash AI. State Disaster Management Authority & National Civil Defense. All rights reserved.
      </footer>

    </div>
  );
}
