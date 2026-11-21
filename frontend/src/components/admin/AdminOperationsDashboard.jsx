import React, { useState, useEffect } from 'react';
import { getDonationsStats, getDonationsLedger } from '../../api';

export default function AdminOperationsDashboard({ onNavigateToDonations, onShowToast }) {
  const [stats, setStats] = useState(null);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [selectedZone, setSelectedZone] = useState('All');
  const [showZoneModal, setShowZoneModal] = useState(false);
  const [attentionItems, setAttentionItems] = useState([
    {
      id: 'pay_N82bX719',
      type: 'GATEWAY_TIMEOUT',
      badgeClass: 'bg-error-container text-error',
      title: 'pay_N82bX719',
      desc: 'Bank drop-off during OTP verification for ₹5,000 (ICICI Bank).',
      time: 'Detected 18m ago',
      actionLabel: 'Review',
      resolved: false
    },
    {
      id: 'req_rf_401',
      type: 'REFUND_REQUEST',
      badgeClass: 'bg-amber-100 text-amber-900 border border-amber-300',
      title: 'req_rf_401',
      desc: 'Duplicate charge reported by donor Vikram Bisht (₹2,500).',
      time: 'Logged 34m ago',
      actionLabel: 'Approve Refund',
      resolved: false
    },
    {
      id: 'prov_audit_99',
      type: 'PROVIDER_AUDIT',
      badgeClass: 'bg-secondary-container/20 text-secondary border border-secondary-container/40',
      title: 'Himalayan Foothills Rescue Trust',
      desc: 'Awaiting FCRA & 12A documentation audit before disbursing grant block of ₹3,00,000.',
      time: 'Submitted 2h ago',
      actionLabel: 'Audit Docs',
      resolved: false
    }
  ]);

  useEffect(() => {
    async function loadData() {
      try {
        const statsData = await getDonationsStats();
        if (statsData) setStats(statsData);
        const ledger = await getDonationsLedger({ limit: 4 });
        if (ledger && ledger.length > 0) {
          setRecentTransactions(ledger);
        }
      } catch (err) {
        console.warn('[Admin Dashboard] Loading error:', err.message);
      }
    }
    loadData();
  }, []);

  const handleResolveAttention = (item) => {
    setAttentionItems((prev) => prev.map((i) => (i.id === item.id ? { ...i, resolved: true } : i)));
    if (onShowToast) {
      if (item.type === 'REFUND_REQUEST') {
        onShowToast(`Refund req_rf_401 approved for ₹2,500. Reversal queued.`);
      } else if (item.type === 'PROVIDER_AUDIT') {
        onShowToast(`Himalayan Foothills Rescue Trust documents verified & FCRA certificate validated.`);
      } else {
        onShowToast(`Gateway timeout reviewed for ${item.id}. Automated retry scheduled.`);
      }
    }
  };

  const handleExportDailySummary = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Metric,Value,Unit\n' +
      'Total Raised,4892450,INR\n' +
      'Raised Today,345000,INR\n' +
      'Payment Success Rate,98.2,Percentage\n' +
      'Failed Transactions,28500,INR\n' +
      'Refunds Settled,14200,INR\n' +
      'Active Incident,S-04 Mandakini Flash Watch,Status\n' +
      'Disbursed Escrow,13200000,INR\n' +
      'Joshimath Allocation,1420000,INR\n' +
      'Kedarnath Allocation,1180000,INR\n' +
      'Uttarkashi Allocation,945000,INR\n';
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `SDMA_Daily_Summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (onShowToast) onShowToast('Exported official SDMA Daily Treasury Summary (.CSV)');
  };

  const defaultRecentDonations = [
    { donor: 'Col. Sanjeev Rawat (Retd.)', amount: '₹25,000', method: 'UPI / GPay', ref: 'pay_N83aKd991j', time: '2m ago', icon: 'phone_iphone' },
    { donor: 'Anita Joshi', amount: '₹2,500', method: 'NetBanking HDFC', ref: 'pay_N83aKx882a', time: '7m ago', icon: 'account_balance' },
    { donor: 'Dr. Ramesh Nautiyal', amount: '₹50,000', method: 'RuPay Corporate', ref: 'pay_N83aLp330w', time: '14m ago', icon: 'credit_card' },
    { donor: 'Anonymous Citizen', amount: '₹1,000', method: 'UPI / BHIM', ref: 'pay_N83aMq115k', time: '19m ago', icon: 'phone_iphone' }
  ];

  const activeAttentionCount = attentionItems.filter((i) => !i.resolved).length;

  return (
    <div className="flex flex-col w-full space-y-space-lg">
      
      {/* PAGE HEADER & ACTION CONTROLS */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-space-md">
        <div>
          <div className="flex items-center gap-space-sm mb-1">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-secondary-container/20 text-secondary font-label-code-sm text-label-code-sm font-semibold uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-secondary animate-ping"></span>
              Telemetry Live • Active Incident S-04
            </span>
            <span className="text-outline font-label-code-sm text-label-code-sm">SYNC INTERVAL: 5S</span>
          </div>
          <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
            Operations Overview &amp; Relief Treasury
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">
            Real-time metrics for Chamoli, Rudraprayag, and Uttarkashi flood zones • State Disaster Management Node
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
            onClick={() => setShowZoneModal(true)}
            className="h-10 px-space-md rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-body-sm text-body-sm font-semibold flex items-center gap-2 transition-all shadow-xs cursor-pointer border border-outline-variant/30"
          >
            <span className="material-symbols-outlined text-[18px]">tune</span>
            <span>{selectedZone === 'All' ? 'Filter Zones' : `Zone: ${selectedZone}`}</span>
          </button>
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
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Total Raised</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-tertiary-fixed/30 text-on-tertiary-container font-label-code-sm text-label-code-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">arrow_upward</span>18.4%
            </span>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">₹48,92,450</div>
            <p className="font-label-code-sm text-label-code-sm text-on-surface-variant mt-0.5">4,120 transactions settled</p>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-primary h-full rounded-full" style={{ width: '78%' }}></div>
          </div>
        </div>

        {/* KPI 2: RAISED TODAY */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Raised Today</span>
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded bg-tertiary-fixed/30 text-on-tertiary-container font-label-code-sm text-label-code-sm font-semibold">
              <span className="material-symbols-outlined text-[14px]">trending_up</span>+8.2%
            </span>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">₹3,45,000</div>
            <p className="font-label-code-sm text-label-code-sm text-on-surface-variant mt-0.5">280 donations recorded</p>
          </div>
          <div className="flex items-center gap-1.5 font-label-code-sm text-label-code-sm text-secondary">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
            <span>Avg ₹1,232 / donation</span>
          </div>
        </div>

        {/* KPI 3: SUCCESS RATE */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Payment Success</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-tertiary-fixed/40 text-on-tertiary-container font-label-code-sm text-label-code-sm font-semibold">
              OPTIMAL
            </span>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">98.2%</div>
            <p className="font-label-code-sm text-label-code-sm text-on-tertiary-container font-medium mt-0.5">Target SLA: &gt;95.0%</p>
          </div>
          <div className="w-full bg-surface-container h-1.5 rounded-full overflow-hidden">
            <div className="bg-on-tertiary-container h-full rounded-full" style={{ width: '98.2%' }}></div>
          </div>
        </div>

        {/* KPI 4: FAILED TRANSACTIONS */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Failed Transactions</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-error-container text-error font-label-code-sm text-label-code-sm font-semibold">
              24 DROPS
            </span>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-error font-bold tracking-tight">₹28,500</div>
            <p className="font-label-code-sm text-label-code-sm text-outline mt-0.5">Uncollected gateway timeouts</p>
          </div>
          <button
            type="button"
            onClick={onNavigateToDonations}
            className="inline-flex items-center gap-1 font-label-code-sm text-label-code-sm text-secondary hover:text-on-secondary-container font-semibold cursor-pointer"
          >
            Review queue <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </button>
        </div>

        {/* KPI 5: REFUNDS PROCESSED */}
        <div className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden group">
          <div className="flex items-center justify-between">
            <span className="font-label-code-sm text-label-code-sm uppercase font-semibold text-outline tracking-wider">Refunds Settled</span>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded bg-surface-container text-on-surface-variant font-label-code-sm text-label-code-sm font-semibold">
              6 CLAIMS
            </span>
          </div>
          <div className="my-space-sm">
            <div className="font-headline-lg text-headline-lg text-on-surface font-bold tracking-tight">₹14,200</div>
            <p className="font-label-code-sm text-label-code-sm text-on-surface-variant mt-0.5">0.29% refund ratio</p>
          </div>
          <div className="flex items-center justify-between font-label-code-sm text-label-code-sm text-outline">
            <span>Ledger balanced</span>
            <span className="material-symbols-outlined text-[14px] text-on-tertiary-container">verified</span>
          </div>
        </div>
      </div>

      {/* MAIN DATA VISUALIZATIONS SECTION (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg">
        {/* LEFT COLUMN (60%): 30-DAY VELOCITY CHART */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-space-sm mb-space-md">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">30-Day Donations Velocity</h2>
                <span className="font-label-code-sm text-label-code-sm px-2 py-0.5 rounded bg-surface-container font-semibold text-on-surface-variant">
                  INR in Lakhs
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                Peak surges aligned with cloudburst warning dates &amp; media dispatch
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1.5 text-label-code-sm font-label-code-sm text-on-surface-variant">
                <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                <span>Daily Intake</span>
              </div>
              <div className="flex items-center gap-1.5 text-label-code-sm font-label-code-sm text-outline">
                <span className="w-2.5 h-2.5 rounded-full bg-surface-container-highest"></span>
                <span>Baseline</span>
              </div>
            </div>
          </div>

          {/* INLINE SVG INTERACTIVE-STYLED CHART */}
          <div className="relative w-full h-64 bg-surface-container-low/40 rounded-xl p-space-sm flex flex-col justify-between overflow-hidden border border-outline-variant/20">
            {/* Peak callout badge overlay */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-primary text-on-primary px-2.5 py-1 rounded shadow-md z-10 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary-fixed animate-ping"></span>
              <span className="font-label-code-sm text-label-code-sm font-semibold">18 OCT SURGE: ₹6.85L (Cloudburst Alert)</span>
            </div>

            <svg className="w-full h-full overflow-visible" preserveAspectRatio="none" viewBox="0 0 700 240">
              <defs>
                <linearGradient id="velocityGrad" x1="0%" x2="0%" y1="0%" y2="100%">
                  <stop offset="0%" stopColor="#006398" stopOpacity="0.35"></stop>
                  <stop offset="60%" stopColor="#006398" stopOpacity="0.08"></stop>
                  <stop offset="100%" stopColor="#006398" stopOpacity="0.0"></stop>
                </linearGradient>
                <linearGradient id="strokeGrad" x1="0%" x2="100%" y1="0%" y2="0%">
                  <stop offset="0%" stopColor="#5bb8fe"></stop>
                  <stop offset="50%" stopColor="#006398"></stop>
                  <stop offset="100%" stopColor="#00476e"></stop>
                </linearGradient>
              </defs>

              {/* Grid horizontal reference guides */}
              <line stroke="#cbd5e1" strokeDasharray="4 4" strokeOpacity="0.6" x1="0" x2="700" y1="40" y2="40"></line>
              <line stroke="#cbd5e1" strokeDasharray="4 4" strokeOpacity="0.6" x1="0" x2="700" y1="100" y2="100"></line>
              <line stroke="#cbd5e1" strokeDasharray="4 4" strokeOpacity="0.6" x1="0" x2="700" y1="160" y2="160"></line>
              <line stroke="#cbd5e1" strokeOpacity="0.8" x1="0" x2="700" y1="210" y2="210"></line>

              {/* Shaded Area */}
              <path
                d="M 0,200 L 30,195 L 70,185 L 110,190 L 150,165 L 190,170 L 230,130 L 270,140 L 310,110 L 350,35 L 390,70 L 430,95 L 470,80 L 510,120 L 550,105 L 590,85 L 630,75 L 670,60 L 700,55 L 700,210 L 0,210 Z"
                fill="url(#velocityGrad)"
              ></path>

              {/* Trend Line Path */}
              <path
                d="M 0,200 L 30,195 L 70,185 L 110,190 L 150,165 L 190,170 L 230,130 L 270,140 L 310,110 L 350,35 L 390,70 L 430,95 L 470,80 L 510,120 L 550,105 L 590,85 L 630,75 L 670,60 L 700,55"
                fill="none"
                stroke="url(#strokeGrad)"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="3"
              ></path>

              {/* Peak Node Circle */}
              <circle cx="350" cy="35" fill="#006398" r="6" stroke="#ffffff" strokeWidth="2"></circle>
              <circle cx="350" cy="35" fill="none" r="10" stroke="#006398" strokeDasharray="3 3" strokeWidth="1.5"></circle>

              {/* Current Node Circle */}
              <circle cx="700" cy="55" fill="#069669" r="5" stroke="#ffffff" strokeWidth="2"></circle>
            </svg>

            {/* X-Axis timeline labels */}
            <div className="flex items-center justify-between font-label-code-sm text-label-code-sm text-outline pt-2">
              <span>01 OCT</span>
              <span>07 OCT</span>
              <span>14 OCT</span>
              <span className="text-on-surface font-semibold">18 OCT (PEAK)</span>
              <span>21 OCT</span>
              <span>TODAY</span>
            </div>
          </div>

          {/* Quick summary row */}
          <div className="grid grid-cols-3 gap-space-sm pt-space-md mt-space-md bg-surface-container-low rounded-lg p-space-sm border border-outline-variant/30">
            <div>
              <span className="font-label-code-sm text-label-code-sm text-outline uppercase font-semibold">30D Peak Day</span>
              <p className="font-body-md text-body-md font-bold text-on-surface mt-0.5 font-mono">₹6,85,200</p>
            </div>
            <div>
              <span className="font-label-code-sm text-label-code-sm text-outline uppercase font-semibold">Daily Median</span>
              <p className="font-body-md text-body-md font-bold text-on-surface mt-0.5 font-mono">₹1,42,800</p>
            </div>
            <div>
              <span className="font-label-code-sm text-label-code-sm text-outline uppercase font-semibold">Projected 7D Intake</span>
              <p className="font-body-md text-body-md font-bold text-on-tertiary-container mt-0.5 font-mono">₹19,40,000</p>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN (40%): RELIEF ALLOCATIONS BY WARD / VALLEY */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Relief Allocations by Ward</h2>
              <span className="font-label-code-sm text-label-code-sm text-outline font-semibold">₹48,92,450 DISBURSED</span>
            </div>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-md">
              Live capital distribution to field relief nodal teams
            </p>

            {/* Allocation Bars */}
            <div className="space-y-space-md">
              {/* Ward 1 */}
              <div>
                <div className="flex items-center justify-between text-body-sm font-body-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary"></span>
                    Joshimath &amp; Alaknanda Basin
                  </span>
                  <span className="font-label-code-sm text-label-code-sm font-bold text-on-surface">
                    ₹14,20,000 <span className="text-outline font-normal">(29.0%)</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-primary h-full rounded-full" style={{ width: '29.0%' }}></div>
                </div>
              </div>

              {/* Ward 2 */}
              <div>
                <div className="flex items-center justify-between text-body-sm font-body-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary"></span>
                    Kedarnath Valley &amp; Mandakini
                  </span>
                  <span className="font-label-code-sm text-label-code-sm font-bold text-on-surface">
                    ₹11,80,000 <span className="text-outline font-normal">(24.1%)</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary h-full rounded-full" style={{ width: '24.1%' }}></div>
                </div>
              </div>

              {/* Ward 3 */}
              <div>
                <div className="flex items-center justify-between text-body-sm font-body-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-secondary-container"></span>
                    Uttarkashi Bhagirathi Sector
                  </span>
                  <span className="font-label-code-sm text-label-code-sm font-bold text-on-surface">
                    ₹9,45,000 <span className="text-outline font-normal">(19.3%)</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-secondary-container h-full rounded-full" style={{ width: '19.3%' }}></div>
                </div>
              </div>

              {/* Ward 4 */}
              <div>
                <div className="flex items-center justify-between text-body-sm font-body-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-outline"></span>
                    Pithoragarh Border Wards
                  </span>
                  <span className="font-label-code-sm text-label-code-sm font-bold text-on-surface">
                    ₹7,10,000 <span className="text-outline font-normal">(14.5%)</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-outline h-full rounded-full" style={{ width: '14.5%' }}></div>
                </div>
              </div>

              {/* Ward 5 */}
              <div>
                <div className="flex items-center justify-between text-body-sm font-body-sm mb-1">
                  <span className="font-semibold text-on-surface flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-outline-variant"></span>
                    Chamoli Buffer Zones
                  </span>
                  <span className="font-label-code-sm text-label-code-sm font-bold text-on-surface">
                    ₹6,37,450 <span className="text-outline font-normal">(13.0%)</span>
                  </span>
                </div>
                <div className="w-full bg-surface-container h-2 rounded-full overflow-hidden">
                  <div className="bg-outline-variant h-full rounded-full" style={{ width: '13.0%' }}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Field Status Notice */}
          <div className="p-space-sm rounded-lg bg-surface-container flex items-start gap-space-sm mt-space-md border border-outline-variant/30">
            <span className="material-symbols-outlined text-secondary text-[20px] shrink-0 mt-0.5">health_and_safety</span>
            <div className="text-body-sm font-body-sm text-on-surface">
              <span className="font-semibold">Joshimath Air-Bridge active:</span> 4 cargo sorties delivered emergency medical packs and ration rations funded via Treasury Node #4.
            </div>
          </div>
        </div>
      </div>

      {/* BOTTOM OPERATIONAL PANELS (60% / 40%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-space-lg" id="attention-panel">
        {/* LEFT COLUMN (60%): RECENT PUBLIC DONATIONS */}
        <div className="lg:col-span-7 bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-sm mb-space-sm">
              <div>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Recent Public Donations</h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant">Real-time gateway settlements with immutable ledger stamps</p>
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
                    <th className="py-2.5 px-3 rounded-l-lg">DONOR</th>
                    <th className="py-2.5 px-3">AMOUNT</th>
                    <th className="py-2.5 px-3">METHOD</th>
                    <th className="py-2.5 px-3">GATEWAY REF</th>
                    <th className="py-2.5 px-3">TIME</th>
                    <th className="py-2.5 px-3 text-right rounded-r-lg">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y-0 font-body-sm text-body-sm">
                  {defaultRecentDonations.map((row, idx) => (
                    <tr key={idx} className="hover:bg-surface-container-low/60 transition-colors">
                      <td className="py-3 px-3 font-semibold text-on-surface">{row.donor}</td>
                      <td className="py-3 px-3 font-label-code-md text-label-code-md font-bold text-on-surface font-mono">{row.amount}</td>
                      <td className="py-3 px-3 text-on-surface-variant flex items-center gap-1.5">
                        <span className="material-symbols-outlined text-[16px] text-secondary">{row.icon}</span>
                        <span>{row.method}</span>
                      </td>
                      <td className="py-3 px-3 font-label-code-sm text-label-code-sm text-outline font-mono">{row.ref}</td>
                      <td className="py-3 px-3 font-label-code-sm text-label-code-sm text-outline">{row.time}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-tertiary-fixed/30 text-on-tertiary-container font-label-code-sm text-label-code-sm font-semibold">
                          <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container"></span>
                          Paid
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Table Footnote */}
          <div className="flex items-center justify-between pt-space-sm mt-space-sm text-label-code-sm font-label-code-sm text-outline border-t border-outline-variant/20">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
              80G Tax Deductible Receipts automatically mailed
            </span>
            <span>Showing 4 of 4,120</span>
          </div>
        </div>

        {/* RIGHT COLUMN (40%): ATTENTION NEEDED CRITICAL OPERATIONS */}
        <div className="lg:col-span-5 bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-space-sm mb-space-sm">
              <div className="flex items-center gap-2">
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold">Attention Needed</h2>
                {activeAttentionCount > 0 && (
                  <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-error text-on-error font-label-code-sm text-label-code-sm font-bold">
                    {activeAttentionCount}
                  </span>
                )}
              </div>
              <span className="font-label-code-sm text-label-code-sm text-outline uppercase font-semibold">Queue Action Priority</span>
            </div>

            <div className="space-y-space-sm">
              {attentionItems.map((item) => (
                <div
                  key={item.id}
                  className={`p-space-sm rounded-xl border transition-all ${
                    item.resolved
                      ? 'bg-surface-container/50 opacity-60 border-transparent'
                      : item.type === 'GATEWAY_TIMEOUT'
                      ? 'bg-error-container/30 border-error/20'
                      : item.type === 'REFUND_REQUEST'
                      ? 'bg-amber-500/10 border-amber-200'
                      : 'bg-surface-container-low border-outline-variant/30'
                  } flex flex-col gap-2`}
                >
                  <div className="flex items-start justify-between gap-space-sm">
                    <div className="flex items-start gap-2">
                      <span
                        className={`material-symbols-outlined text-[20px] shrink-0 mt-0.5 ${
                          item.type === 'GATEWAY_TIMEOUT'
                            ? 'text-error'
                            : item.type === 'REFUND_REQUEST'
                            ? 'text-amber-700'
                            : 'text-secondary'
                        }`}
                      >
                        {item.type === 'GATEWAY_TIMEOUT'
                          ? 'error'
                          : item.type === 'REFUND_REQUEST'
                          ? 'currency_exchange'
                          : 'verified_user'}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-label-code-sm text-label-code-sm font-bold font-mono text-on-surface">
                            {item.title}
                          </span>
                          <span className={`font-label-code-sm text-label-code-sm px-1.5 py-0.5 rounded font-semibold ${item.badgeClass}`}>
                            {item.type}
                          </span>
                        </div>
                        <p className="font-body-sm text-body-sm text-on-surface mt-0.5">{item.desc}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="font-label-code-sm text-label-code-sm text-outline">{item.time}</span>
                    {item.resolved ? (
                      <span className="text-label-code-sm text-on-tertiary-container font-semibold flex items-center gap-1">
                        <span className="material-symbols-outlined text-[16px]">check_circle</span>
                        Resolved
                      </span>
                    ) : (
                      <button
                        type="button"
                        onClick={() => handleResolveAttention(item)}
                        className={`h-8 px-space-sm rounded-lg font-body-sm text-body-sm font-semibold flex items-center gap-1 transition-all cursor-pointer ${
                          item.type === 'GATEWAY_TIMEOUT'
                            ? 'bg-primary hover:bg-inverse-surface text-on-primary'
                            : item.type === 'REFUND_REQUEST'
                            ? 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                            : 'bg-secondary text-on-secondary hover:bg-on-secondary-container'
                        }`}
                      >
                        <span>{item.actionLabel}</span>
                        {item.type === 'GATEWAY_TIMEOUT' && (
                          <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        )}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Safety Guard Indicator */}
          <div className="flex items-center gap-2 text-label-code-sm text-outline pt-space-sm mt-space-sm border-t border-outline-variant/20">
            <span className="material-symbols-outlined text-[16px] text-on-tertiary-container">lock</span>
            <span>Dual authorization protocol active on disbursements &gt; ₹1,00,000</span>
          </div>
        </div>
      </div>

      {/* Filter Zones Modal */}
      {showZoneModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/45 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-surface-container-lowest rounded-xl max-w-sm w-full p-space-lg shadow-2xl border border-outline-variant/40 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-headline-md font-bold text-on-surface">Filter By Incident Zone</h3>
              <button
                type="button"
                onClick={() => setShowZoneModal(false)}
                className="p-1 rounded-lg text-outline hover:text-on-surface"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <div className="space-y-1.5">
              {['All', 'Chamoli', 'Rudraprayag', 'Uttarkashi', 'Pithoragarh'].map((z) => (
                <button
                  key={z}
                  type="button"
                  onClick={() => {
                    setSelectedZone(z);
                    setShowZoneModal(false);
                    if (onShowToast) onShowToast(`Filtered operations telemetry to ${z === 'All' ? 'All Districts' : z}`);
                  }}
                  className={`w-full text-left px-3 py-2 rounded-lg text-body-sm font-body-sm font-medium transition-colors flex items-center justify-between ${
                    selectedZone === z ? 'bg-primary text-on-primary' : 'hover:bg-surface-container text-on-surface'
                  }`}
                >
                  <span>{z === 'All' ? 'All Zones (State Overview)' : `${z} District`}</span>
                  {selectedZone === z && <span className="material-symbols-outlined text-[18px]">check</span>}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

