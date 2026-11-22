import React, { useState, useEffect } from 'react';
import { getDonationsStats, getDonationsLedger } from '../../api';

export default function AdminOperationsDashboard({ onNavigateToDonations, onShowToast }) {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const statsData = await getDonationsStats();
        if (statsData) setStats(statsData);
        const ledger = await getDonationsLedger({ limit: 4 });
        if (ledger && ledger.length > 0) {
          setRecentTransactions(ledger);
        } else {
          setRecentTransactions([]);
        }
      } catch (err) {
        console.warn('[Admin Dashboard] Loading error:', err.message);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleExportDailySummary = () => {
    if (!stats) {
      if (onShowToast) onShowToast('No ledger statistics available to export.');
      return;
    }
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Unit\n' +
      `Total Raised,${stats.total_raised_inr || 0},INR\n` +
      `Raised Today,${stats.raised_today_inr || 0},INR\n` +
      `Payment Success Rate,${stats.payment_success_rate_pct || 0},Percentage\n` +
      `Failed Transactions Amount,${stats.failed_amount_inr || 0},INR\n` +
      `Refunds Settled Amount,${stats.refunds_settled_inr || 0},INR\n`;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SDMA_Daily_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('Exported official SDMA Daily Treasury Summary (.CSV)');
  };

  const hasStats = stats !== null;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      
      {/* PAGE HEADER & ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-sm mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-code-sm text-label-code-sm font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
              Live Telemetry • Disaster Command
            </span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Operations Overview &amp; Relief Treasury
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Real-time verified metrics from Uttarakhand SDMA telemetry and relief ledger.
          </p>
        </div>

        <div className="flex items-center gap-space-sm self-start md:self-auto">
          <div className="hidden sm:flex flex-col text-right pr-2">
            <span className="font-label-code-sm text-label-code-sm text-outline uppercase font-semibold">Current Window</span>
            <span className="font-body-sm text-body-sm font-semibold text-on-surface">
              {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })} • IST (UTC+5:30)
            </span>
          </div>
          <button
            type="button"
            onClick={handleExportDailySummary}
            className="h-10 px-space-md rounded-xl bg-primary hover:bg-inverse-surface text-on-primary font-body-sm text-body-sm font-semibold flex items-center gap-2 transition-all shadow-sm cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">file_download</span>
            <span>Export Daily Summary</span>
          </button>
        </div>
      </div>

      {/* KPI CARDS GRID (5 ACROSS) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-space-md">
        
        {/* KPI 1: TOTAL RAISED */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden">
          <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Total Raised</span>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              {hasStats ? `₹${Number(stats.total_raised_inr || 0).toLocaleString('en-IN')}` : 'No data yet'}
            </div>
            <p className="font-label-code-sm text-label-code-sm text-on-surface-variant mt-0.5">
              {hasStats ? `${stats.total_transactions_count || 0} transactions recorded` : 'Awaiting data'}
            </p>
          </div>
        </div>

        {/* KPI 2: RAISED TODAY */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden">
          <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Raised Today</span>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              {hasStats ? `₹${Number(stats.raised_today_inr || 0).toLocaleString('en-IN')}` : 'No data yet'}
            </div>
            <p className="font-label-code-sm text-label-code-sm text-on-surface-variant mt-0.5">
              {hasStats ? `${stats.verified_transactions_count || 0} verified today` : 'Awaiting data'}
            </p>
          </div>
        </div>

        {/* KPI 3: SUCCESS RATE */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden">
          <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Payment Success</span>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              {hasStats ? `${stats.payment_success_rate_pct || 0}%` : 'No data yet'}
            </div>
            <p className="font-label-code-sm text-label-code-sm text-on-surface-variant mt-0.5">
              {hasStats ? 'Gateway completion rate' : 'Awaiting data'}
            </p>
          </div>
        </div>

        {/* KPI 4: FAILED TRANSACTIONS */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden">
          <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Failed Transactions</span>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-error font-bold tracking-tight">
              {hasStats ? `₹${Number(stats.failed_amount_inr || 0).toLocaleString('en-IN')}` : 'No data yet'}
            </div>
            <p className="font-label-code-sm text-label-code-sm text-outline mt-0.5">
              {hasStats ? `${stats.failed_transactions_count || 0} drop-offs` : 'Awaiting data'}
            </p>
          </div>
        </div>

        {/* KPI 5: REFUNDS PROCESSED */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden">
          <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Refunds Settled</span>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">
              {hasStats ? `₹${Number(stats.refunds_settled_inr || 0).toLocaleString('en-IN')}` : 'No data yet'}
            </div>
            <p className="font-label-code-sm text-label-code-sm text-on-surface-variant mt-0.5">
              {hasStats ? `${stats.refunds_settled_count || 0} claims processed` : 'Awaiting data'}
            </p>
          </div>
        </div>
      </div>

      {/* LOWER SECTION: RELIEF ALLOCATIONS & RECENT DONATIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        
        {/* RELIEF ALLOCATIONS BY WARD (5 cols) */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Relief Allocations by Ward</h2>
              {hasStats && stats.total_raised_inr > 0 && (
                <span className="font-label-code-sm text-label-code-sm text-outline font-semibold">
                  ₹{Number(stats.total_raised_inr).toLocaleString('en-IN')} TRACKED
                </span>
              )}
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Capital distribution across incident corridors from ledger stats
            </p>

            {hasStats && stats.ward_allocations && stats.ward_allocations.length > 0 ? (
              <div className="space-y-space-md">
                {stats.ward_allocations.map((alloc, idx) => (
                  <div key={idx}>
                    <div className="flex items-center justify-between text-body-sm font-body-sm mb-1">
                      <span className="font-semibold text-on-surface flex items-center gap-1.5">
                        <span 
                          className="w-2 h-2 rounded-full" 
                          style={{ backgroundColor: alloc.color || '#006398' }}
                        ></span>
                        {alloc.ward}
                      </span>
                      <span className="font-label-code-sm text-label-code-sm font-bold text-on-surface">
                        ₹{Number(alloc.amount).toLocaleString('en-IN')} <span className="text-outline font-normal">({alloc.pct}%)</span>
                      </span>
                    </div>
                    <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full" 
                        style={{ width: `${alloc.pct}%`, backgroundColor: alloc.color || '#006398' }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="py-12 text-center text-on-surface-variant text-sm italic">
                No ward allocations recorded yet.
              </div>
            )}
          </div>
        </div>

        {/* RECENT DONATIONS TABLE (7 cols) */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-sm mb-space-sm">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Recent Public Donations</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Live gateway settlements from getDonationsLedger()</p>
              </div>
              <button
                type="button"
                onClick={onNavigateToDonations}
                className="text-secondary hover:text-on-secondary-container font-label-code-sm text-label-code-sm font-semibold flex items-center gap-1 cursor-pointer"
              >
                <span>FULL LEDGER</span>
                <span className="material-symbols-outlined text-[16px]">chevron_right</span>
              </button>
            </div>

            {/* Table Container */}
            <div className="overflow-x-auto -mx-space-md px-space-md">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low text-outline font-label-code-sm text-label-code-sm">
                    <th scope="col" className="whitespace-nowrap rounded-l-lg px-4 py-3 text-left">DONOR</th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 text-left">AMOUNT</th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 text-left">METHOD</th>
                    <th scope="col" className="whitespace-nowrap px-4 py-3 text-left">PAYMENT ID</th>
                    <th scope="col" className="whitespace-nowrap rounded-r-lg px-4 py-3 text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0 font-body-sm text-body-sm">
                  {recentTransactions.length === 0 ? (
                    <tr>
                      <td colSpan="5" className="py-12 text-center text-on-surface-variant text-sm italic">
                        {isLoading ? 'Loading donations...' : 'No donations recorded yet.'}
                      </td>
                    </tr>
                  ) : (
                    recentTransactions.map((row) => (
                      <tr key={row.id} className="hover:bg-surface-container-low/60 transition-colors">
                        <td className="px-4 py-3 font-semibold text-on-surface">{row.donor_name}</td>
                        <td className="px-4 py-3 font-label-code-md text-label-code-md font-bold text-on-surface">
                          ₹{Number(row.amount || 0).toLocaleString('en-IN')}
                        </td>
                        <td className="px-4 py-3 text-on-surface-variant">
                          {row.payment_method || 'Online'}
                        </td>
                        <td className="px-4 py-3 font-label-code-sm text-label-code-sm text-outline">
                          {row.payment_id || `TX-${row.id}`}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`inline-flex min-w-[5.5rem] justify-center items-center gap-1 rounded-full px-2.5 py-1 font-label-code-sm text-label-code-sm font-semibold ${
                            row.status === 'Paid' ? 'bg-tertiary-fixed/30 text-on-tertiary-container' :
                            row.status === 'Refunded' ? 'bg-surface-container text-outline' :
                            'bg-error-container text-error'
                          }`}>
                            {row.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="flex items-center justify-between pt-space-sm mt-space-sm text-label-code-sm font-label-code-sm text-outline border-t border-outline-variant/20">
            <span>Verified State Disaster Relief Ledger</span>
            <span>Showing {recentTransactions.length} of {stats?.total_transactions_count || recentTransactions.length}</span>
          </div>
        </div>

      </div>

    </div>
  );
}
