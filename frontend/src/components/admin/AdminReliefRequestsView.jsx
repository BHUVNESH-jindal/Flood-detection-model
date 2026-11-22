import React, { useState, useEffect } from 'react';
import { getReliefRequestsList, updateReliefRequestStatus } from '../../api';

export default function AdminReliefRequestsView({ onShowToast }) {
 const [requests, setRequests] = useState([]);
 const [filter, setFilter] = useState('all');
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 async function load() {
 try {
 const data = await getReliefRequestsList();
 setRequests(Array.isArray(data) ? data : []);
 } catch (e) {
 console.warn('[Relief Requests Admin] Load error:', e.message);
 setRequests([]);
 } finally {
 setIsLoading(false);
 }
 }
 load();
 }, []);

 const handleToggleStatus = async (item) => {
 const newStatus = item.status === 'open' ? 'fulfilled' : 'open';
 try {
 await updateReliefRequestStatus(item.id, { status: newStatus });
 } catch (e) {
 console.warn('[Update Relief Request] Update error:', e.message);
 if (onShowToast) onShowToast('Unable to update the relief request.');
 return;
 }

 setRequests((prev) =>
 prev.map((r) => (r.id === item.id ? { ...r, status: newStatus } : r))
 );

 if (onShowToast) {
 onShowToast(
 newStatus === 'fulfilled'
 ? `Disaster Request #${item.id} marked as FULFILLED.`
 : `Disaster Request #${item.id} re-opened for dispatch.`
 );
 }
 };

 const filtered = requests.filter((r) => (filter === 'all' ? true : r.status === filter));

 return (
 <div className="flex flex-col w-full space-y-space-md">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-label-code-sm uppercase tracking-wider text-outline font-semibold">
 FIELD INCIDENT TICKETING
 </span>
 <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
 </div>
 <h2 className="font-headline-xl font-bold text-on-surface">Citizen Relief &amp; Dispatch Requests</h2>
 <p className="font-body-sm text-on-surface-variant">
 Live emergency SOS submissions from micro-wards awaiting SDRF / NDRF allocation.
 </p>
 </div>

 <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
 <button
 type="button"
 onClick={() => setFilter('all')}
 className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all ${
 filter === 'all' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
 }`}
 >
 All Requests ({requests.length})
 </button>
 <button
 type="button"
 onClick={() => setFilter('open')}
 className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all ${
 filter === 'open' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
 }`}
 >
 Open SOS ({requests.filter((r) => r.status === 'open').length})
 </button>
 <button
 type="button"
 onClick={() => setFilter('fulfilled')}
 className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all ${
 filter === 'fulfilled' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
 }`}
 >
 Fulfilled ({requests.filter((r) => r.status === 'fulfilled').length})
 </button>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
 {filtered.length === 0 ? (
 <p className="col-span-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-space-lg text-center text-on-surface-variant">
 {isLoading ? 'Loading requests...' : requests.length === 0 ? 'No data yet' : 'No requests match this filter.'}
 </p>
 ) : filtered.map((req) => (
 <div
 key={req.id}
 className={`bg-surface-container-lowest p-space-md rounded-2xl shadow-xs border transition-all flex flex-col justify-between ${
 req.urgency === 'critical' && req.status === 'open'
 ? 'border-error/40 bg-error-container/10'
 : 'border-outline-variant/30'
 }`}
 >
 <div>
 <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
 <span className="font-label-code-sm font-bold text-on-surface">TICKET #{req.id}</span>
 <div className="flex flex-wrap items-center justify-end gap-1.5">
 <span
 className={`font-label-code-sm px-2 py-0.5 rounded-full font-bold uppercase ${
 req.urgency === 'critical'
 ? 'bg-error-container text-error'
 : req.urgency === 'high'
 ? 'bg-amber-100 text-amber-800'
 : 'bg-surface-container text-on-surface-variant'
 }`}
 >
 {req.urgency}
 </span>
 <span
 className={`font-label-code-sm px-2 py-0.5 rounded-full font-bold uppercase ${
 req.status === 'open'
 ? 'bg-red-50 text-red-700 border border-red-200'
 : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
 }`}
 >
 {req.status}
 </span>
 </div>
 </div>

 <div className="pt-3 space-y-2">
 <div className="flex items-center justify-between text-body-sm">
 <span className="font-bold text-on-surface">{req.requester_name}</span>
 <span className="font-label-code-sm text-outline">{req.requester_phone}</span>
 </div>
 <div className="flex items-center gap-2 text-label-code-sm text-secondary font-semibold">
 <span className="material-symbols-outlined text-[16px]">emergency</span>
 <span className="uppercase">TYPE: {req.need_type}</span>
 <span>•</span>
 <span>{req.people_affected_count} people affected</span>
 </div>
 <p className="font-body-sm text-on-surface-variant text-sm line-clamp-3 leading-relaxed">
 {req.description}
 </p>
 </div>
 </div>

 <div className="pt-4 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
 <span className="font-label-code-sm text-outline text-xs">
 Ward #{req.ward_id} •{' '}
 {new Date(req.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })} IST
 </span>
 <button
 type="button"
 onClick={() => handleToggleStatus(req)}
 className={`h-10 px-3 rounded-xl font-body-sm text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
 req.status === 'open'
 ? 'bg-primary text-on-primary hover:bg-inverse-surface'
 : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
 }`}
 >
 <span className="material-symbols-outlined text-[16px]">
 {req.status === 'open' ? 'check' : 'replay'}
 </span>
 <span>{req.status === 'open' ? 'Mark Fulfilled' : 'Re-open Ticket'}</span>
 </button>
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

