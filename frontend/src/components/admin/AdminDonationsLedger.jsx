import React, { useState, useEffect } from 'react';
import { getDonationsLedger, processDonationRefund, syncGatewayWebhooks } from '../../api';

export default function AdminDonationsLedger({ onShowToast }) {
 const [activeMainView, setActiveMainView] = useState('table'); // 'table' | 'empty' | 'loading' | 'error'
 const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'paid' | 'pending' | 'failed'
 const [searchQuery, setSearchQuery] = useState('');
 const [isSyncing, setIsSyncing] = useState(false);
 const [isDrawerOpen, setIsDrawerOpen] = useState(true);
 const [selectedIndex, setSelectedIndex] = useState(0);
 const [isRefundModalOpen, setIsRefundModalOpen] = useState(false);
 const [refundReason, setRefundReason] = useState('Duplicate contribution by donor');
 const [copiedId, setCopiedId] = useState(false);
 const [donations, setDonations] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 async function fetchLedger() {
 try {
 const liveTxs = await getDonationsLedger();
 const formatted = (Array.isArray(liveTxs) ? liveTxs : []).map((t) => {
 const d = new Date(t.created_at);
 return {
 id: t.id,
 name: t.donor_name || '',
 email: t.donor_email || '',
 phone: t.donor_phone || '',
 pan: t.donor_pan || '',
 amountValue: Number(t.amount) || 0,
 amount: `₹${Number(t.amount || 0).toLocaleString('en-IN')}`,
 amountFormatted: `₹${Number(t.amount || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`,
 status: t.status,
 statusClass:
 t.status === 'Paid'
 ? 'text-on-tertiary-container'
 : t.status === 'Failed'
 ? 'text-error'
 : 'text-amber-700',
 orderId: t.order_id || '',
 paymentId: t.payment_id || '',
 receipt: t.receipt_number || '',
 date: Number.isNaN(d.getTime()) ? '' : d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' }),
 time: Number.isNaN(d.getTime()) ? '' : `${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })} IST`,
 method: t.payment_method || ''
 };
 });
 setDonations(formatted);
 } catch (err) {
 console.warn('[Admin Ledger] Fetch live ledger error:', err.message);
 setDonations([]);
 } finally {
 setIsLoading(false);
 }
 }
 fetchLedger();
 }, []);

 const filteredDonations = donations.filter((row) => {
 const matchesStatus =
 statusFilter === 'all'
 ? true
 : row.status?.toLowerCase() === statusFilter.toLowerCase();

 const matchesSearch =
 searchQuery.trim() === ''
 ? true
 : row.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
 row.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
 row.phone.includes(searchQuery) ||
 row.paymentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
 row.orderId.toLowerCase().includes(searchQuery.toLowerCase());

 return matchesStatus && matchesSearch;
 });
 const totalPaidAmount = donations.reduce(
 (total, row) => total + (row.status?.toLowerCase() === 'paid' ? row.amountValue : 0),
 0
 );

 const selectedItem = filteredDonations[selectedIndex] || filteredDonations[0];

 const handleCopyPaymentId = () => {
 if (!selectedItem) return;
 navigator.clipboard.writeText(selectedItem.paymentId);
 setCopiedId(true);
 if (onShowToast) onShowToast(`Copied ${selectedItem.paymentId} to clipboard`);
 setTimeout(() => setCopiedId(false), 2000);
 };

 const handleSyncGateway = async () => {
 setIsSyncing(true);
 if (onShowToast) onShowToast('Syncing Razorpay ledger webhooks...');
 try {
 await syncGatewayWebhooks();
 } catch (e) {
 console.warn('[Admin Ledger] Gateway sync error:', e.message);
 }
 setTimeout(() => {
 setIsSyncing(false);
 setActiveMainView('table');
 if (onShowToast) onShowToast('Gateway sync complete.');
 }, 1200);
 };

 const handleExportCsv = () => {
 let csv = 'Donor,Amount,Status,Order ID,Payment ID,Date,Method,Receipt\n';
 filteredDonations.forEach((r) => {
 csv += `"${r.name}","${r.amount}","${r.status}","${r.orderId}","${r.paymentId}","${r.date} ${r.time}","${r.method}","${r.receipt}"\n`;
 });
 const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
 const url = URL.createObjectURL(blob);
 const link = document.createElement('a');
 link.href = url;
 link.setAttribute('download', `Razorpay_Ledger_${new Date().toISOString().slice(0, 10)}.csv`);
 document.body.appendChild(link);
 link.click();
 document.body.removeChild(link);
 if (onShowToast) onShowToast(`Exported ${filteredDonations.length} records to CSV.`);
 };

 const handleConfirmRefund = async () => {
 if (!selectedItem) return;
 setIsRefundModalOpen(false);
 try {
 await processDonationRefund(selectedItem.paymentId, refundReason);
 } catch (e) {
 console.warn('[Refund API] Request error:', e.message);
 if (onShowToast) onShowToast('Unable to process the refund.');
 return;
 }

 setDonations((prev) =>
 prev.map((d) =>
 d.paymentId === selectedItem.paymentId
 ? {
 ...d,
 status: 'Refunded',
 statusClass: 'text-amber-700',
 receipt: `REVOKED (${d.receipt})`
 }
 : d
 )
 );

 if (onShowToast) {
 onShowToast(`Refund processed for ${selectedItem.paymentId}. 80G Certificate revoked.`);
 }
 };

 return (
 <div className="flex flex-col w-full relative">
 
 {/* 1. Header & Controls Section */}
 <div className="flex flex-col gap-space-md mb-space-lg">
 <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-space-md">
 <div className="flex flex-col">
 <div className="flex items-center gap-space-sm mb-1">
 <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-outline font-semibold">
 UK-SDMA Emergency Fund Pool
 </span>
 <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface-container text-on-surface-variant font-label-code-sm text-label-code-sm border border-outline-variant/40">
 <span className="w-1.5 h-1.5 rounded-full bg-on-tertiary-container animate-pulse"></span>
 Donation records
 </span>
 </div>
 <h1 className="font-headline-xl text-headline-xl text-on-surface tracking-tight font-bold">
 Donations Ledger &amp; Verification
 </h1>
 </div>

 <div className="flex flex-wrap items-center gap-space-sm">
 {/* View Switchers */}
 <div className="flex items-center bg-surface-container-low p-1 rounded-xl shadow-xs border border-outline-variant/30">
 <button
 type="button"
 onClick={() => setActiveMainView('table')}
 className={`px-3 py-1.5 rounded-lg font-body-sm text-body-sm transition-all flex items-center gap-1.5 cursor-pointer ${
 activeMainView === 'table'
 ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
 : 'text-on-surface-variant hover:text-on-surface'
 }`}
 >
 <span className="material-symbols-outlined text-[18px]">table_rows</span>
 Ledger View
 </button>
 <button
 type="button"
 onClick={() => setActiveMainView('empty')}
 className={`px-3 py-1.5 rounded-lg font-body-sm text-body-sm transition-all flex items-center gap-1.5 cursor-pointer ${
 activeMainView === 'empty'
 ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
 : 'text-on-surface-variant hover:text-on-surface'
 }`}
 >
 <span className="material-symbols-outlined text-[18px]">inbox</span>
 Empty State
 </button>
 <button
 type="button"
 onClick={() => setActiveMainView('loading')}
 className={`px-3 py-1.5 rounded-lg font-body-sm text-body-sm transition-all flex items-center gap-1.5 cursor-pointer ${
 activeMainView === 'loading'
 ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
 : 'text-on-surface-variant hover:text-on-surface'
 }`}
 >
 <span className="material-symbols-outlined text-[18px]">hourglass_top</span>
 Skeleton
 </button>
 <button
 type="button"
 onClick={() => setActiveMainView('error')}
 className={`px-3 py-1.5 rounded-lg font-body-sm text-body-sm transition-all flex items-center gap-1.5 cursor-pointer ${
 activeMainView === 'error'
 ? 'bg-surface-container-lowest text-on-surface font-semibold shadow-xs'
 : 'text-on-surface-variant hover:text-on-surface'
 }`}
 >
 <span className="material-symbols-outlined text-[18px]">error</span>
 Gateway Error
 </button>
 </div>

 <button
 type="button"
 onClick={handleSyncGateway}
 className="h-10 px-4 rounded-xl bg-surface-container-lowest text-on-surface hover:bg-surface-container font-body-sm text-body-sm font-medium shadow-xs border border-outline-variant/30 transition-colors flex items-center gap-2 cursor-pointer"
 >
 <span className={`material-symbols-outlined text-[18px] text-secondary ${isSyncing ? 'animate-spin' : ''}`}>
 sync
 </span>
 <span>Sync Gateway</span>
 </button>

 <button
 type="button"
 onClick={handleExportCsv}
 className="h-10 px-4 rounded-xl bg-primary text-on-primary hover:bg-primary-container font-body-sm text-body-sm font-medium shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
 >
 <span className="material-symbols-outlined text-[18px]">download</span>
 <span>Export CSV</span>
 </button>
 </div>
 </div>
 <div className="grid grid-cols-1 sm:grid-cols-2 gap-space-md">
 <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30">
 <p className="font-label-code-sm text-outline uppercase font-semibold">Donations</p>
 <p className="font-headline-lg text-on-surface font-bold">
 {isLoading ? 'Loading...' : donations.length || 'No data yet'}
 </p>
 </div>
 <div className="p-space-md rounded-xl bg-surface-container-lowest border border-outline-variant/30">
 <p className="font-label-code-sm text-outline uppercase font-semibold">Paid total</p>
 <p className="font-headline-lg text-on-surface font-bold">
 {isLoading ? 'Loading...' : donations.length ? `₹${totalPaidAmount.toLocaleString('en-IN')}` : 'No data yet'}
 </p>
 </div>
 </div>
 </div>

 {/* 2. Filter Bar & Search Controls */}
 <div className="p-space-md rounded-2xl bg-surface-container-lowest shadow-xs border border-outline-variant/30 mb-space-md flex flex-col gap-space-sm">
 <div className="flex flex-col lg:flex-row lg:items-center gap-space-md">
 <div className="relative flex-1">
 <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">
 search
 </span>
 <input
 type="text"
 value={searchQuery}
 onChange={(e) => setSearchQuery(e.target.value)}
 placeholder="Search donor name, email, phone, or Razorpay ID..."
 className="w-full h-11 pl-11 pr-4 bg-surface rounded-xl text-on-surface font-body-md text-body-md placeholder:text-outline focus:outline-none focus:bg-surface-container-low transition-all border border-outline-variant/30"
 />
 </div>

 </div>

 <div className="flex flex-wrap items-center justify-between gap-space-sm pt-space-xs">
 <div className="flex flex-wrap items-center gap-2">
 <button
 type="button"
 onClick={() => setStatusFilter('all')}
 className={`px-3.5 py-1.5 rounded-full font-label-code-sm text-label-code-sm font-semibold transition-all cursor-pointer ${
 statusFilter === 'all'
 ? 'bg-primary text-on-primary'
 : 'bg-surface text-on-surface-variant hover:bg-surface-container'
 }`}
 >
 All ({donations.length})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('paid')}
 className={`px-3.5 py-1.5 rounded-full font-label-code-sm text-label-code-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
 statusFilter === 'paid'
 ? 'bg-primary text-on-primary'
 : 'bg-surface text-on-surface-variant hover:bg-surface-container'
 }`}
 >
 <span className="w-2 h-2 rounded-full bg-on-tertiary-container"></span>
 Paid ({donations.filter((row) => row.status?.toLowerCase() === 'paid').length})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('pending')}
 className={`px-3.5 py-1.5 rounded-full font-label-code-sm text-label-code-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
 statusFilter === 'pending'
 ? 'bg-primary text-on-primary'
 : 'bg-surface text-on-surface-variant hover:bg-surface-container'
 }`}
 >
 <span className="w-2 h-2 rounded-full bg-amber-500"></span>
 Pending ({donations.filter((row) => row.status?.toLowerCase() === 'pending').length})
 </button>
 <button
 type="button"
 onClick={() => setStatusFilter('failed')}
 className={`px-3.5 py-1.5 rounded-full font-label-code-sm text-label-code-sm font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
 statusFilter === 'failed'
 ? 'bg-primary text-on-primary'
 : 'bg-surface text-on-surface-variant hover:bg-surface-container'
 }`}
 >
 <span className="w-2 h-2 rounded-full bg-error"></span>
 Failed ({donations.filter((row) => row.status?.toLowerCase() === 'failed').length})
 </button>
 </div>

 <div className="flex items-center gap-space-sm">
 <span className="font-body-sm text-body-sm text-on-surface-variant">
 Active filter:{' '}
 <span className="font-semibold text-on-surface capitalize">
 {statusFilter === 'all' ? 'All statuses' : `${statusFilter} status`}
 </span>
 </span>
 <button
 type="button"
 onClick={() => {
 setSearchQuery('');
 setStatusFilter('all');
 setActiveMainView('table');
 if (onShowToast) onShowToast('Filters reset to default 30-day scope.');
 }}
 className="text-secondary hover:text-on-secondary-container font-body-sm text-body-sm font-semibold underline underline-offset-2 cursor-pointer"
 >
 Clear filters
 </button>
 </div>
 </div>
 </div>

 {/* 3. Main Views Grid (Table + Drawer / Empty / Loading / Error) */}
 <div className="relative w-full flex flex-col lg:flex-row items-start gap-space-md">
 
 {/* Main Content Pane */}
 <div className="flex-1 w-full min-w-0 transition-all duration-300">
 
 {/* A. TABLE VIEW */}
 {activeMainView === 'table' && (
 <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col">
 <div className="overflow-x-auto">
 <table className="w-full text-left border-collapse">
 <thead>
 <tr className="bg-surface font-label-code-sm text-label-code-sm uppercase tracking-wider text-outline select-none border-b border-outline-variant/20">
 <th className="py-3.5 px-space-md">Donor</th>
 <th className="py-3.5 px-space-md">Amount (INR)</th>
 <th className="py-3.5 px-space-md">Status</th>
 <th className="py-3.5 px-space-md">Order ID</th>
 <th className="py-3.5 px-space-md">Payment ID</th>
 <th className="py-3.5 px-space-md">Date &amp; Time</th>
 <th className="py-3.5 px-space-md text-right">Actions</th>
 </tr>
 </thead>
 <tbody className="font-body-md text-body-md text-on-surface divide-y divide-outline-variant/10">
 {filteredDonations.length === 0 ? (
 <tr>
 <td colSpan={7} className="py-12 text-center text-outline">
 {isLoading
 ? 'Loading donations...'
 : donations.length === 0
 ? 'No data yet'
 : 'No matching donation records found. Try adjusting your search query.'}
 </td>
 </tr>
 ) : (
 filteredDonations.map((row, index) => {
 const isSelected = selectedIndex === index && isDrawerOpen;
 const initials = row.name
 .split(' ')
 .map((n) => n[0])
 .slice(0, 2)
 .join('')
 .toUpperCase();

 return (
 <tr
 key={row.id}
 onClick={() => {
 setSelectedIndex(index);
 setIsDrawerOpen(true);
 }}
 className={`cursor-pointer transition-colors ${
 isSelected
 ? 'bg-surface-container-low border-l-4 border-l-secondary'
 : 'hover:bg-surface-container/60'
 }`}
 >
 <td className="py-3.5 px-space-md">
 <div className="flex items-center gap-3">
 <div className="w-8 h-8 rounded-full bg-surface-variant flex items-center justify-center font-bold text-on-surface text-xs ">
 {initials}
 </div>
 <div className="flex flex-col min-w-0">
 <span className="font-semibold text-on-surface truncate">{row.name}</span>
 <span className="font-label-code-sm text-label-code-sm text-outline truncate">{row.email}</span>
 </div>
 </div>
 </td>
 <td className="py-3.5 px-space-md">
 <div className="font-label-code-md text-label-code-md font-bold text-on-surface ">
 {row.amount}
 </div>
 <span className="font-label-code-sm text-label-code-sm text-outline">{row.method}</span>
 </td>
 <td className="py-3.5 px-space-md">
 <span
 className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full font-label-code-sm text-label-code-sm font-semibold ${
 row.status === 'Paid'
 ? 'bg-surface text-on-tertiary-container'
 : row.status === 'Failed'
 ? 'bg-error-container/40 text-error'
 : 'bg-amber-50 text-amber-700'
 }`}
 >
 <span
 className={`w-1.5 h-1.5 rounded-full ${
 row.status === 'Paid'
 ? 'bg-on-tertiary-container'
 : row.status === 'Failed'
 ? 'bg-error'
 : 'bg-amber-500'
 }`}
 ></span>
 {row.status}
 </span>
 </td>
 <td className="py-3.5 px-space-md font-label-code-sm text-label-code-sm text-on-surface-variant ">
 {row.orderId}
 </td>
 <td className="py-3.5 px-space-md font-label-code-sm text-label-code-sm text-on-surface font-medium ">
 {row.paymentId}
 </td>
 <td className="py-3.5 px-space-md">
 <div className="flex flex-col">
 <span className="font-body-sm text-body-sm text-on-surface">{row.date}</span>
 <span className="font-label-code-sm text-label-code-sm text-outline">{row.time}</span>
 </div>
 </td>
 <td className="py-3.5 px-space-md text-right">
 <button
 type="button"
 aria-label="View Details"
 className="p-1.5 rounded-lg hover:bg-surface-container-highest text-on-surface-variant transition-colors"
 >
 <span className="material-symbols-outlined text-[18px]">chevron_right</span>
 </button>
 </td>
 </tr>
 );
 })
 )}
 </tbody>
 </table>
 </div>

 <div className="p-space-md bg-surface font-body-sm text-on-surface-variant border-t border-outline-variant/20">
 Showing {filteredDonations.length} of {donations.length} donations
 </div>
 </div>
 )}

 {/* B. EMPTY STATE VIEW */}
 {activeMainView === 'empty' && (
 <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 p-space-xl flex flex-col items-center justify-center text-center min-h-[460px]">
 <div className="w-16 h-16 rounded-full bg-surface-container-low flex items-center justify-center text-outline mb-space-md">
 <span className="material-symbols-outlined text-[32px]">filter_alt_off</span>
 </div>
 <h3 className="font-headline-md text-headline-md text-on-surface font-semibold mb-1">
 No donations found matching criteria
 </h3>
 <p className="font-body-md text-body-md text-on-surface-variant max-w-md mb-space-lg">
 No records match the active query or filter parameters. Try clearing applied date tags or checking the gateway ledger sync.
 </p>
 <div className="flex items-center gap-space-sm">
 <button
 type="button"
 onClick={() => {
 setSearchQuery('');
 setStatusFilter('all');
 setActiveMainView('table');
 }}
 className="h-10 px-4 rounded-xl bg-primary text-on-primary font-body-sm text-body-sm font-medium shadow-xs transition-colors cursor-pointer"
 >
 Reset Filters
 </button>
 <button
 type="button"
 onClick={() => setActiveMainView('table')}
 className="h-10 px-4 rounded-xl bg-surface-container text-on-surface font-body-sm text-body-sm font-medium hover:bg-surface-container-high transition-colors cursor-pointer"
 >
 Return to Ledger
 </button>
 </div>
 </div>
 )}

 {/* C. LOADING SKELETON VIEW */}
 {activeMainView === 'loading' && (
 <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 p-space-lg flex flex-col gap-4 animate-pulse">
 <div className="flex items-center justify-between pb-3">
 <div className="h-4 bg-surface-container-high rounded w-48"></div>
 <div className="h-4 bg-surface-container-high rounded w-24"></div>
 </div>
 <div className="h-10 bg-surface-container-low rounded-xl w-full"></div>
 <div className="space-y-3 pt-2">
 <div className="h-12 bg-surface-container rounded-xl w-full"></div>
 <div className="h-12 bg-surface-container rounded-xl w-full"></div>
 <div className="h-12 bg-surface-container rounded-xl w-full"></div>
 <div className="h-12 bg-surface-container rounded-xl w-full"></div>
 <div className="h-12 bg-surface-container rounded-xl w-full"></div>
 </div>
 <div className="flex items-center justify-between pt-4">
 <div className="h-4 bg-surface-container-high rounded w-36"></div>
 <div className="h-8 bg-surface-container-high rounded w-44"></div>
 </div>
 </div>
 )}

 {/* D. GATEWAY ERROR VIEW */}
 {activeMainView === 'error' && (
 <div className="bg-surface-container-lowest rounded-2xl shadow-xs border border-outline-variant/30 overflow-hidden flex flex-col">
 <div className="p-space-md bg-error-container/60 flex items-start gap-space-md">
 <div className="p-2 rounded-lg bg-surface-container-lowest text-error shadow-xs">
 <span className="material-symbols-outlined text-[24px]">signal_disconnected</span>
 </div>
 <div className="flex-1">
 <div className="flex items-center justify-between">
 <h4 className="font-headline-md text-headline-md text-on-error-container font-semibold">
 Razorpay webhook sync timeout
 </h4>
 <span className="font-label-code-sm text-label-code-sm text-error font-semibold ">
 GATEWAY_TIMEOUT_504
 </span>
 </div>
 <p className="font-body-md text-body-md text-on-error-container/90 mt-1">
 Automated reconciliation socket failed to establish a secure handshake with Razorpay node{' '}
 <span className="font-label-code-sm ">rzp-del-cluster-04</span>. Retrying synchronization in 30s.
 </p>
 <div className="flex items-center gap-space-sm mt-space-md">
 <button
 type="button"
 onClick={handleSyncGateway}
 className="h-9 px-3.5 rounded-lg bg-error text-on-error font-body-sm text-body-sm font-semibold shadow-xs hover:opacity-90 transition-opacity flex items-center gap-2 cursor-pointer"
 >
 <span className="material-symbols-outlined text-[16px]">refresh</span>
 Force Immediate Resync
 </button>
 <button
 type="button"
 onClick={() => setActiveMainView('table')}
 className="h-9 px-3.5 rounded-lg bg-surface-container-lowest text-on-surface font-body-sm text-body-sm font-medium hover:bg-surface transition-colors shadow-xs cursor-pointer"
 >
 View Stored Cache
 </button>
 </div>
 </div>
 </div>
 <div className="p-space-xl flex flex-col items-center justify-center text-center">
 <div className="max-w-md space-y-2">
 <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-outline font-semibold">
 Fallback Engine Active
 </span>
 <p className="font-body-md text-body-md text-on-surface-variant">
 Transactions recorded in local SQLite audit ring continue to be preserved. Offline state prevents new instant 80G PDF dispatch until connection restores.
 </p>
 </div>
 </div>
 </div>
 )}
 </div>

 {/* Detail Drawer (Audit Record) */}
 {isDrawerOpen && selectedItem && (
 <aside className="w-full lg:w-[410px] shrink-0 bg-surface-container-lowest rounded-xl shadow-md border border-outline-variant/30 p-space-lg flex flex-col gap-space-md transition-all duration-300 relative">
 <div className="flex items-center justify-between pb-space-sm border-b border-outline-variant/20">
 <div className="flex items-center gap-2">
 <span className="material-symbols-outlined text-outline text-[20px]">receipt</span>
 <div className="flex flex-col">
 <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-outline font-semibold">
 Audit Record
 </span>
 <span className="font-label-code-md text-label-code-md font-bold text-on-surface ">
 {selectedItem.paymentId}
 </span>
 </div>
 </div>
 <div className="flex items-center gap-1">
 <button
 type="button"
 aria-label="Copy ID"
 onClick={handleCopyPaymentId}
 title="Copy Payment ID"
 className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
 >
 <span className="material-symbols-outlined text-[18px]">
 {copiedId ? 'done' : 'content_copy'}
 </span>
 </button>
 <button
 type="button"
 aria-label="Close Drawer"
 onClick={() => setIsDrawerOpen(false)}
 className="p-1.5 rounded-lg hover:bg-surface-container text-on-surface-variant transition-colors cursor-pointer"
 >
 <span className="material-symbols-outlined text-[20px]">close</span>
 </button>
 </div>
 </div>

 {/* Gross Contribution Tile */}
 <div className="p-space-md rounded-xl bg-surface-container-low flex flex-col gap-2 shadow-xs border border-outline-variant/30">
 <div className="flex items-baseline justify-between">
 <div className="flex flex-col">
 <span className="font-label-code-sm text-label-code-sm text-outline font-semibold uppercase">
 Gross Contribution
 </span>
 <span className="font-headline-xl text-headline-xl text-on-surface font-bold ">
 {selectedItem.amountFormatted}
 </span>
 </div>
 <span
 className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-surface-container-lowest font-label-code-sm text-label-code-sm font-semibold shadow-xs ${selectedItem.statusClass}`}
 >
 <span
 className={`w-1.5 h-1.5 rounded-full ${
 selectedItem.status === 'Paid'
 ? 'bg-on-tertiary-container'
 : selectedItem.status === 'Failed'
 ? 'bg-error'
 : 'bg-amber-500'
 }`}
 ></span>
 {selectedItem.status}
 </span>
 </div>
 <div className="pt-2 flex items-center justify-between text-body-sm font-body-sm border-t border-outline-variant/20">
 <span className="text-on-surface-variant">Tax Exemption Receipt:</span>
 <span className="font-label-code-sm text-label-code-sm text-secondary font-semibold ">
 {selectedItem.receipt}
 </span>
 </div>
 </div>

 {/* Transaction details */}
 <div className="flex flex-col gap-2">
 <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-outline font-semibold">
 Transaction details
 </span>
 <div className="p-space-md rounded-xl bg-surface flex flex-col gap-2 border border-outline-variant/30">
 <div className="flex items-center justify-between text-body-sm">
 <span className="text-on-surface-variant">Order ID:</span>
 <span className="font-label-code-sm text-on-surface">{selectedItem.orderId || '—'}</span>
 </div>
 <div className="flex items-center justify-between text-body-sm">
 <span className="text-on-surface-variant">Payment ID:</span>
 <span className="font-label-code-sm text-on-surface">{selectedItem.paymentId || '—'}</span>
 </div>
 <div className="flex items-center justify-between text-body-sm">
 <span className="text-on-surface-variant">Date:</span>
 <span className="font-label-code-sm text-on-surface">{selectedItem.date || '—'} {selectedItem.time}</span>
 </div>
 </div>
 </div>

 {/* Donor Profile */}
 <div className="p-space-md rounded-xl bg-surface flex flex-col gap-2 border border-outline-variant/30">
 <span className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-outline font-semibold">
 Donor Profile
 </span>
 <div className="flex flex-col gap-1.5">
 <div className="flex items-center justify-between text-body-sm font-body-sm">
 <span className="text-on-surface-variant">Full Name:</span>
 <span className="font-semibold text-on-surface">{selectedItem.name}</span>
 </div>
 <div className="flex items-center justify-between text-body-sm font-body-sm">
 <span className="text-on-surface-variant">Email Address:</span>
 <span className="font-semibold text-on-surface font-label-code-sm text-label-code-sm truncate max-w-[200px]">
 {selectedItem.email}
 </span>
 </div>
 <div className="flex items-center justify-between text-body-sm font-body-sm">
 <span className="text-on-surface-variant">Mobile:</span>
 <span className="font-semibold text-on-surface font-label-code-sm text-label-code-sm ">
 {selectedItem.phone}
 </span>
 </div>
 <div className="flex items-center justify-between text-body-sm font-body-sm">
 <span className="text-on-surface-variant">PAN (For 80G):</span>
 <span className="font-semibold text-on-surface font-label-code-sm text-label-code-sm ">
 {selectedItem.pan}
 </span>
 </div>
 </div>
 </div>

 {/* Actions Bottom Bar */}
 <div className="flex flex-col gap-2 mt-auto pt-space-xs">
 <button
 type="button"
 disabled={selectedItem.status === 'Refunded'}
 onClick={() => setIsRefundModalOpen(true)}
 className="w-full h-10 rounded-xl bg-surface-container hover:bg-error-container/40 text-error hover:text-on-error-container font-body-sm text-body-sm font-semibold transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
 >
 <span className="material-symbols-outlined text-[18px]">undo</span>
 <span>{selectedItem.status === 'Refunded' ? 'Already Refunded' : 'Issue Refund'}</span>
 </button>

 </div>
 </aside>
 )}
 </div>

 {/* Refund Confirmation Modal */}
 {isRefundModalOpen && selectedItem && (
 <div className="fixed inset-0 z-50 flex items-center justify-center bg-inverse-surface/45 backdrop-blur-xs p-4 animate-fade-in">
 <div className="w-full max-w-md bg-surface-container-lowest rounded-2xl shadow-xl p-space-lg flex flex-col gap-space-md border border-outline-variant/40">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2 text-error">
 <span className="material-symbols-outlined text-[24px]">warning</span>
 <h3 className="font-headline-md text-headline-md font-semibold text-on-surface">Confirm Disaster Refund</h3>
 </div>
 <button
 type="button"
 onClick={() => setIsRefundModalOpen(false)}
 className="p-1 rounded-lg text-outline hover:text-on-surface cursor-pointer"
 >
 <span className="material-symbols-outlined text-[20px]">close</span>
 </button>
 </div>
 <p className="font-body-md text-body-md text-on-surface-variant">
 Are you sure you want to reverse payment{' '}
 <span className="font-label-code-sm text-label-code-sm font-bold text-on-surface ">
 {selectedItem.paymentId}
 </span>{' '}
 of <span className="font-bold text-on-surface ">{selectedItem.amountFormatted}</span>? This will cancel the associated 80G tax certificate immediately.
 </p>

 <div className="p-space-sm bg-surface-container-low rounded-xl flex flex-col gap-1 border border-outline-variant/30">
 <label className="font-label-code-sm text-label-code-sm uppercase tracking-wider text-outline font-semibold" htmlFor="refundReasonSelect">
 Reason for Cancellation
 </label>
 <select
 id="refundReasonSelect"
 value={refundReason}
 onChange={(e) => setRefundReason(e.target.value)}
 className="bg-surface rounded-lg p-2 font-body-sm text-body-sm text-on-surface focus:outline-none border border-outline-variant/40"
 >
 <option>Duplicate contribution by donor</option>
 <option>Chargeback request initiated</option>
 <option>Ineligible payment gateway route</option>
 <option>Donor requested correction</option>
 </select>
 </div>

 <div className="flex items-center justify-end gap-space-sm mt-2">
 <button
 type="button"
 onClick={() => setIsRefundModalOpen(false)}
 className="h-10 px-4 rounded-xl bg-surface-container text-on-surface font-body-sm text-body-sm font-medium hover:bg-surface-container-high transition-colors cursor-pointer"
 >
 Cancel
 </button>
 <button
 type="button"
 onClick={handleConfirmRefund}
 className="h-10 px-4 rounded-xl bg-error text-on-error font-body-sm text-body-sm font-semibold shadow-xs hover:opacity-90 transition-opacity cursor-pointer"
 >
 Authorize Reversal
 </button>
 </div>
 </div>
 </div>
 )}
 </div>
 );
}

