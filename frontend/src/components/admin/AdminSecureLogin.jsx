import React, { useState } from 'react';
import { loginUser } from '../../api';

export default function AdminSecureLogin({ onLoginSuccess, onReturnToCitizen }) {
  const [email, setEmail] = useState('officer.rawat@uk-relief.gov.in');
  const [passphrase, setPassphrase] = useState('official123');
  const [showPassphrase, setShowPassphrase] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showKeyRecoveryModal, setShowKeyRecoveryModal] = useState(false);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const res = await loginUser(email.trim(), passphrase);
      if (!res.access_token) {
        throw new Error("No authentication token received from backend.");
      }
      const officerUser = {
        username: res.username || email,
        email: res.email || email,
        full_name: res.full_name || 'SDMA Officer',
        role: res.role || 'district_official',
        token: res.access_token,
      };
      setIsLoading(false);
      onLoginSuccess(officerUser);
    } catch (err) {
      setIsLoading(false);
      setErrorMessage(err.message || 'Invalid credentials or unauthorized login.');
    }
  };

  const handleQuickFill = (officerEmail, pwd = 'official123') => {
    setEmail(officerEmail);
    setPassphrase(pwd);
    setErrorMessage('');
  };

  return (
    <main className="w-full min-h-screen bg-surface font-body-md text-on-surface antialiased flex items-center justify-center p-space-md">
      <div className="flex flex-col w-full">
        <div className="w-full max-w-7xl mx-auto my-auto p-space-sm md:p-space-lg">
          <div className="w-full bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col lg:flex-row border border-outline-variant/30">
            
            {/* Left Brand & Information Panel (Approx 45%) */}
            <div className="relative w-full lg:w-[45%] bg-primary-container text-inverse-on-surface p-space-lg lg:p-space-xl flex flex-col justify-between overflow-hidden">
              {/* Abstract Topographical Elevation Contours SVG Background */}
              <div className="absolute inset-0 pointer-events-none opacity-20">
                <svg className="w-full h-full object-cover" fill="none" viewBox="0 0 800 1000" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-100,200 C150,150 250,380 450,220 C650,60 750,300 950,240" stroke="#5bb8fe" strokeDasharray="3 3" strokeWidth="1.2"></path>
                  <path d="M-100,280 C120,240 280,450 480,310 C680,170 720,410 950,320" stroke="#5bb8fe" strokeWidth="1"></path>
                  <path d="M-100,360 C180,310 240,520 520,390 C800,260 760,520 950,420" stroke="#5bb8fe" strokeWidth="1.4"></path>
                  <path d="M-100,450 C140,400 320,620 550,480 C780,340 810,610 950,510" stroke="#93ccff" strokeWidth="1"></path>
                  <path d="M-100,530 C190,490 280,710 590,570 C900,430 790,720 950,600" stroke="#5bb8fe" strokeWidth="1.5"></path>
                  <path d="M-100,620 C220,580 340,800 630,660 C920,520 840,820 950,710" stroke="#93ccff" strokeWidth="1.2"></path>
                  <path d="M-100,720 C180,690 390,890 680,760 C970,630 810,910 950,830" stroke="#5bb8fe" strokeWidth="1"></path>
                  <path d="M-100,810 C240,790 420,970 720,850 C1020,730 860,990 950,920" stroke="#5bb8fe" strokeWidth="1.6"></path>
                  <text fill="#5bb8fe" fontFamily="JetBrains Mono" fontSize="9" opacity="0.8" x="180" y="325">3,850M • KEDARNATH RIDGE</text>
                  <text fill="#5bb8fe" fontFamily="JetBrains Mono" fontSize="9" opacity="0.8" x="420" y="585">2,420M • ALAKNANDA BASIN</text>
                  <text fill="#5bb8fe" fontFamily="JetBrains Mono" fontSize="9" opacity="0.8" x="120" y="740">1,960M • BHAGIRATHI GAUGE</text>
                </svg>
              </div>

              {/* Ambient gradient glow */}
              <div className="absolute -top-32 -left-32 w-80 h-80 rounded-full bg-secondary-container/10 blur-3xl pointer-events-none"></div>
              <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full bg-secondary/15 blur-3xl pointer-events-none"></div>

              {/* Left Top Content */}
              <div className="relative z-10 space-y-space-lg">
                {/* Authority & Organization Badge */}
                <div className="flex items-center gap-space-sm">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-surface-container-highest/20 text-secondary-fixed text-label-code-sm font-label-code-sm uppercase tracking-wider">
                    <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed-dim animate-pulse"></span>
                    UK-SDMA COMMAND NODE
                  </span>
                  <span className="text-surface-variant/60 text-label-code-sm font-label-code-sm">SYS-NODE // DEHRADUN</span>
                </div>

                {/* Logo & Brand Representation */}
                <div className="flex items-center gap-space-md pt-space-xs">
                  <div className="w-12 h-12 rounded-lg bg-red-600 flex items-center justify-center font-black text-white text-xl shadow-md shrink-0">
                    FF
                  </div>
                  <div>
                    <p className="text-label-code-sm font-label-code-sm tracking-widest text-secondary-fixed uppercase">STATE CRISIS PORTAL</p>
                    <h1 className="text-headline-lg font-headline-lg text-on-primary font-bold tracking-tight">Flood-Flash Admin</h1>
                  </div>
                </div>

                {/* Operational Directive Statement */}
                <div className="pt-space-md space-y-space-sm">
                  <div className="inline-block px-2 py-0.5 rounded bg-surface-variant/15 text-surface-container-high text-label-code-sm font-label-code-sm uppercase font-semibold">
                    UTTARAKHAND DISASTER RELIEF MANAGEMENT
                  </div>
                  <h2 className="text-headline-xl font-headline-xl text-on-primary leading-tight font-bold">
                    Emergency Operations Administration
                  </h2>
                  <p className="text-body-md font-body-md text-surface-variant/80 max-w-md pt-space-xs">
                    Authorised administrators only. Centralized dispatch oversight for Chamoli, Rudraprayag, Uttarkashi, and Pithoragarh incident corridors.
                  </p>
                </div>
              </div>

              {/* Telemetry Data Nodes */}
              <div className="relative z-10 my-space-lg grid grid-cols-2 gap-space-sm">
                <div className="p-space-sm rounded-lg bg-surface-variant/10 shadow-sm backdrop-blur-sm border border-white/5">
                  <div className="flex items-center justify-between text-surface-variant/70 text-label-code-sm font-label-code-sm">
                    <span>PILOT WARDS</span>
                    <span className="material-symbols-outlined text-[16px] text-tertiary-fixed-dim">map</span>
                  </div>
                  <p className="text-headline-md font-headline-md text-on-primary font-semibold mt-1">18 Wards</p>
                  <p className="text-label-code-sm font-label-code-sm text-tertiary-fixed-dim">Risk Telemetry Active</p>
                </div>

                <div className="p-space-sm rounded-lg bg-surface-variant/10 shadow-sm backdrop-blur-sm border border-white/5">
                  <div className="flex items-center justify-between text-surface-variant/70 text-label-code-sm font-label-code-sm">
                    <span>ALERT CONSOLE</span>
                    <span className="material-symbols-outlined text-[16px] text-secondary-container">campaign</span>
                  </div>
                  <p className="text-headline-md font-headline-md text-on-primary font-semibold mt-1">Twilio WhatsApp</p>
                  <p className="text-label-code-sm font-label-code-sm text-surface-variant/70">Verified Dispatch Node</p>
                </div>
              </div>

              {/* Left Bottom Compliance Notice */}
              <div className="relative z-10 pt-space-md bg-surface-variant/5 -mx-space-lg -mb-space-lg lg:-mx-space-xl lg:-mb-space-xl p-space-md lg:p-space-lg flex items-start gap-space-sm border-t border-white/10">
                <span className="material-symbols-outlined text-secondary-fixed text-lg shrink-0 mt-0.5">verified_user</span>
                <p className="text-body-sm font-body-sm text-surface-variant/80">
                  All administrative sessions and ledger modifications are monitored under SDMA audit protocols. Discretionary access logs are stored in the State Data Repository.
                </p>
              </div>
            </div>

            {/* Right Form Panel (Approx 55%) */}
            <div className="w-full lg:w-[55%] bg-surface-container-lowest p-space-lg lg:p-space-xl flex flex-col justify-center">
              <div className="max-w-md w-full mx-auto space-y-space-md">
                
                {/* Console Header */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-label-code-sm font-label-code-sm text-secondary uppercase font-semibold">SECURE SDMA GATEWAY</span>
                    <span className="inline-flex items-center gap-1 text-label-code-sm font-label-code-sm text-on-surface-variant">
                      <span className="w-2 h-2 rounded-full bg-on-tertiary-container animate-pulse"></span>
                      ONLINE
                    </span>
                  </div>
                  <h2 className="text-headline-lg font-headline-lg text-on-surface font-bold tracking-tight">
                    Sign in to Command Console
                  </h2>
                  <p className="text-body-sm font-body-sm text-on-surface-variant">
                    Enter your official disaster response credentials to access command logs and relief operations.
                  </p>
                </div>

                {/* Inline Warning / Error Box */}
                {errorMessage && (
                  <div className="rounded-lg bg-error-container p-3.5 flex items-start gap-3 shadow-sm border border-error/20 animate-fade-in">
                    <span className="material-symbols-outlined text-error text-xl shrink-0 mt-0.5">warning</span>
                    <div className="space-y-0.5">
                      <p className="text-body-sm font-body-sm font-semibold text-on-error-container">
                        {errorMessage}
                      </p>
                    </div>
                  </div>
                )}

                {/* Main Authentication Form */}
                <form className="space-y-4 pt-1" onSubmit={handleSubmit}>
                  {/* Email Field */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-label-code-sm font-label-code-sm text-on-surface-variant tracking-wider font-semibold" htmlFor="gov-email">
                        GOVERNMENT EMAIL
                      </label>
                      <span className="text-label-code-sm font-label-code-sm text-outline">NIC / GOV DOMAIN ONLY</span>
                    </div>
                    <div className="relative rounded-lg shadow-sm bg-surface-container-low border border-outline-variant/40 focus-within:border-secondary focus-within:bg-surface-container-lowest transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">badge</span>
                      </div>
                      <input
                        id="gov-email"
                        name="email"
                        type="text"
                        autoComplete="username"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="officer.name@uk-relief.gov.in"
                        className="w-full h-11 pl-11 pr-4 bg-transparent text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none rounded-lg"
                      />
                    </div>
                  </div>

                  {/* Password Field with Show/Hide Toggle */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-label-code-sm font-label-code-sm text-on-surface-variant tracking-wider font-semibold" htmlFor="gov-passphrase">
                        SECURITY PASSPHRASE
                      </label>
                      <button
                        type="button"
                        onClick={() => setShowKeyRecoveryModal(true)}
                        className="text-body-sm font-body-sm text-secondary hover:underline cursor-pointer"
                      >
                        Help?
                      </button>
                    </div>
                    <div className="relative rounded-lg shadow-sm bg-surface-container-low border border-outline-variant/40 focus-within:border-secondary focus-within:bg-surface-container-lowest transition-all">
                      <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-outline">
                        <span className="material-symbols-outlined text-[20px]">key</span>
                      </div>
                      <input
                        id="gov-passphrase"
                        name="passphrase"
                        type={showPassphrase ? 'text' : 'password'}
                        autoComplete="current-password"
                        required
                        value={passphrase}
                        onChange={(e) => setPassphrase(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full h-11 pl-11 pr-12 bg-transparent text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none rounded-lg"
                      />
                      <button
                        type="button"
                        aria-label="Toggle password visibility"
                        onClick={() => setShowPassphrase(!showPassphrase)}
                        className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-outline hover:text-on-surface transition-colors cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[20px]">
                          {showPassphrase ? 'visibility_off' : 'visibility'}
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Primary Action Button */}
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full h-11 rounded-lg bg-primary text-on-primary font-body-md text-body-md font-semibold shadow-md hover:bg-inverse-surface active:scale-[0.99] transition-all flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-secondary focus:ring-offset-2 cursor-pointer disabled:opacity-75"
                    >
                      {isLoading ? (
                        <>
                          <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                          <span>Authenticating Session...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign in to Dashboard</span>
                          <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Quick-Fill Demo Credentials */}
                <div className="pt-1">
                  <div className="flex items-center justify-between text-label-code-sm font-label-code-sm text-outline mb-1.5">
                    <span>SECTOR OFFICIAL TEST ACCOUNT:</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickFill('officer.rawat@uk-relief.gov.in', 'official123')}
                      className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface text-label-code-sm font-label-code-sm border border-outline-variant/40 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Col. Rawat</span>
                      <span className="text-secondary font-semibold">Chamoli</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickFill('admin_official', 'official123')}
                      className="px-2.5 py-1 rounded bg-surface-container-low hover:bg-surface-container text-on-surface text-label-code-sm font-label-code-sm border border-outline-variant/40 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span>Officer Sharma</span>
                      <span className="text-secondary font-semibold">Rudraprayag</span>
                    </button>
                  </div>
                </div>

                {/* Audit Information Grid */}
                <div className="grid grid-cols-2 gap-2 pt-2 text-label-code-sm font-label-code-sm text-outline">
                  <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1.5 rounded border border-outline-variant/30">
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span>Encrypted TLS Session</span>
                  </div>
                  <div className="flex items-center gap-1.5 bg-surface-container-low px-2.5 py-1.5 rounded border border-outline-variant/30">
                    <span className="material-symbols-outlined text-[14px]">terminal</span>
                    <span>SDMA SEC-AUTH</span>
                  </div>
                </div>

                {/* Return to Citizen Portal Navigation */}
                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={onReturnToCitizen}
                    className="inline-flex items-center gap-1.5 text-body-sm font-body-sm text-secondary hover:underline cursor-pointer font-medium"
                  >
                    <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                    <span>Return to Citizen Early Warning Portal</span>
                  </button>
                </div>

                {/* Notice */}
                <div className="pt-space-xs">
                  <p className="text-label-code-sm font-label-code-sm text-outline uppercase leading-relaxed text-center">
                    Authorized State Disaster Management Command Portal
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Recovery Modal */}
      {showKeyRecoveryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-xl max-w-md w-full p-space-lg shadow-2xl border border-outline-variant/40 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-on-surface">
                <span className="material-symbols-outlined text-secondary">help</span>
                <h3 className="font-headline-md text-headline-md font-bold">Officer Access Assistance</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowKeyRecoveryModal(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface cursor-pointer"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <p className="text-body-sm font-body-sm text-on-surface-variant leading-relaxed">
              If you require passphrase assistance or credential renewal, please contact your District Disaster Management Authority coordinator.
            </p>
            <div className="p-3 bg-surface-container-low rounded-lg text-label-code-sm font-label-code-sm text-on-surface space-y-1 border border-outline-variant/30">
              <p className="font-semibold text-secondary">Authorized Verification Path:</p>
              <p>1. Present Gov Photo ID at District Collectorate IT Cell.</p>
              <p>2. Identity verification reset by Sector Security Officer.</p>
              <p>3. Emergency Hotline: 1077 (NIC / SDMA Dehradun)</p>
            </div>
            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setShowKeyRecoveryModal(false)}
                className="h-9 px-4 rounded-lg bg-primary text-on-primary text-body-sm font-semibold hover:bg-inverse-surface cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
