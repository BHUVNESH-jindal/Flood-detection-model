import React, { useState } from 'react';
import AdminOperationsDashboard from './AdminOperationsDashboard';
import AdminDonationsLedger from './AdminDonationsLedger';
import AdminReliefRequestsView from './AdminReliefRequestsView';
import AdminProvidersView from './AdminProvidersView';
import AdminAlertsView from './AdminAlertsView';

export default function AdminConsoleLayout({
  currentOfficer,
  onLogout,
  onReturnToCitizen
}) {
  const [activeTab, setActiveTab] = useState('dashboard'); // 'dashboard' | 'alerts' | 'relief-requests' | 'providers' | 'donations'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  const officerName = currentOfficer?.full_name || 'SDMA Officer';
  const officerEmail = currentOfficer?.email || '';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: 'grid_view' },
    { id: 'alerts', label: 'Alerts', icon: 'campaign' },
    { id: 'relief-requests', label: 'Relief Requests', icon: 'sos' },
    { id: 'providers', label: 'Providers', icon: 'verified' },
    { id: 'donations', label: 'Donations', icon: 'payments' },
  ];

  return (
    <div className="bg-surface font-body-md text-on-surface antialiased min-h-screen flex flex-col">
      
      {/* 1. PLAIN FIXED ADMIN HEADER */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-surface-container-lowest border-b border-outline-variant/30 px-3 sm:px-margin flex items-center justify-between gap-3 z-50 shadow-2xs">
        <div className="flex items-center gap-space-lg">
          <div
            className="flex items-center gap-space-sm cursor-pointer"
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="w-8 h-8 rounded-lg bg-red-600 flex items-center justify-center font-bold text-white shadow-md">
              FF
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-headline-md text-headline-md tracking-tight leading-none text-on-surface font-bold truncate">
                Flood-Flash Command Console
              </span>
              <span className="hidden sm:block font-label-code-sm text-label-code-sm uppercase tracking-wider text-on-surface-variant font-semibold mt-0.5">
                Live ward risk, alerts and relief operations
              </span>
            </div>
          </div>
        </div>

        {/* Right Header Controls: Officer Name + Portal Switch + Sign-out */}
        <div className="flex items-center gap-space-md">
          <div className="hidden md:flex flex-col text-right">
            <span className="font-body-sm text-body-sm font-semibold text-on-surface leading-tight">
              {officerName}
            </span>
            {officerEmail && (
              <span className="font-label-code-sm text-label-code-sm text-on-surface-variant truncate max-w-[200px]">
                {officerEmail}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={onReturnToCitizen}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-outline-variant/40 hover:bg-surface text-on-surface font-body-sm text-xs transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_back</span>
            <span>Citizen Portal</span>
          </button>

          <button
            type="button"
            onClick={onLogout}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-container/30 hover:bg-error-container/50 text-error font-body-sm text-xs font-semibold transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">logout</span>
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* 2. FIXED COLLAPSIBLE SIDEBAR */}
      <aside
        className={`fixed left-0 top-16 bottom-0 bg-surface-container-lowest border-r border-outline-variant/30 z-40 flex flex-col justify-between transition-all duration-200 max-sm:w-16 ${
          isSidebarCollapsed ? 'w-20' : 'w-64'
        }`}
      >
        <div className="p-space-md max-sm:px-2">
          {!isSidebarCollapsed && (
            <div className="px-space-sm pb-space-sm mb-space-sm border-b border-outline-variant/20">
              <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-outline font-semibold">
                SDMA Management
              </span>
            </div>
          )}

          <nav className="space-y-1">
            {navItems.map((nav) => {
              const isActive = activeTab === nav.id;
              return (
                <button
                  key={nav.id}
                  type="button"
                  onClick={() => setActiveTab(nav.id)}
                  title={isSidebarCollapsed ? nav.label : ''}
                  className={`w-full flex items-center gap-3 px-space-sm py-2.5 rounded-xl transition-colors font-body-sm text-body-sm cursor-pointer max-sm:justify-center max-sm:px-2 ${
                    isActive
                      ? 'bg-primary text-on-primary font-semibold shadow-xs'
                      : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                  } ${isSidebarCollapsed ? 'justify-center' : ''}`}
                >
                  <span className="material-symbols-outlined text-[20px] shrink-0">{nav.icon}</span>
                  {!isSidebarCollapsed && <span className="max-sm:hidden">{nav.label}</span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Bottom Sidebar Collapse Toggle */}
        <div className="p-space-md border-t border-outline-variant/30 space-y-space-sm max-sm:px-2">
          <button
            type="button"
            onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            className="w-full flex items-center justify-between px-space-sm py-2 rounded-lg text-on-surface-variant hover:bg-surface hover:text-on-surface transition-colors font-body-sm text-body-sm cursor-pointer max-sm:justify-center max-sm:px-2"
          >
            <span className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[18px]">
                {isSidebarCollapsed ? 'last_page' : 'first_page'}
              </span>
              {!isSidebarCollapsed && <span className="max-sm:hidden">Collapse Sidebar</span>}
            </span>
          </button>
        </div>
      </aside>

      {/* 3. MAIN WORKSPACE CONTENT AREA */}
      <div className={`transition-all duration-200 max-sm:pl-16 ${isSidebarCollapsed ? 'pl-20' : 'pl-64'}`}>
        <main className="w-full min-h-screen pt-20 pb-space-xl px-margin bg-surface">
          <div key={activeTab} className="tab-transition-enter">
            
            {activeTab === 'dashboard' && (
              <AdminOperationsDashboard
                onNavigateToDonations={() => setActiveTab('donations')}
                onShowToast={showToast}
              />
            )}

            {activeTab === 'alerts' && (
              <AdminAlertsView onShowToast={showToast} />
            )}

            {activeTab === 'relief-requests' && (
              <AdminReliefRequestsView onShowToast={showToast} />
            )}

            {activeTab === 'providers' && (
              <AdminProvidersView onShowToast={showToast} />
            )}

            {activeTab === 'donations' && (
              <AdminDonationsLedger onShowToast={showToast} />
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
