import React, { useState, useEffect } from 'react';
import { getReliefProvidersList, verifyReliefProvider } from '../../api';

export default function AdminProvidersView({ onShowToast }) {
 const [providers, setProviders] = useState([]);
 const [isLoading, setIsLoading] = useState(true);

 useEffect(() => {
 async function load() {
 try {
 const data = await getReliefProvidersList();
 setProviders(Array.isArray(data) ? data : []);
 } catch (e) {
 console.warn('[Providers Admin] Load error:', e.message);
 setProviders([]);
 } finally {
 setIsLoading(false);
 }
 }
 load();
 }, []);

 const handleVerify = async (item) => {
 try {
 await verifyReliefProvider(item.id);
 } catch (e) {
 console.warn('[Verify Provider] Update error:', e.message);
 if (onShowToast) onShowToast('Unable to verify the provider.');
 return;
 }

 setProviders((prev) =>
 prev.map((p) => (p.id === item.id ? { ...p, verified: true } : p))
 );

 if (onShowToast) {
 onShowToast(`Provider ${item.name} officially verified and granted dispatch clearance.`);
 }
 };

 return (
 <div className="flex flex-col w-full space-y-space-md">
 <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
 <div>
 <div className="flex items-center gap-2 mb-1">
 <span className="font-label-code-sm uppercase tracking-wider text-outline font-semibold">
 FIELD ALLIANCES &amp; PARTNERS
 </span>
 <span className="w-2 h-2 rounded-full bg-secondary"></span>
 </div>
 <h2 className="font-headline-xl font-bold text-on-surface">Relief Organizations &amp; Provider Registry</h2>
 <p className="font-body-sm text-on-surface-variant">
 Vetting FCRA certification, equipment inventory, and operational jurisdiction across river corridors.
 </p>
 </div>
 </div>

 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md">
 {providers.length === 0 ? (
 <p className="col-span-full rounded-xl border border-outline-variant/30 bg-surface-container-lowest p-space-lg text-center text-on-surface-variant">
 {isLoading ? 'Loading providers...' : 'No data yet'}
 </p>
 ) : providers.map((p) => (
 <div
 key={p.id}
 className="bg-surface-container-lowest p-space-md rounded-xl shadow-xs border border-outline-variant/30 flex flex-col justify-between"
 >
 <div>
 <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
 <span className="font-label-code-sm text-outline">ORG ID #{p.id}</span>
 <span
 className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-code-sm font-semibold text-xs ${
 p.verified
 ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
 : 'bg-amber-50 text-amber-800 border border-amber-200'
 }`}
 >
 <span
 className={`w-1.5 h-1.5 rounded-full ${p.verified ? 'bg-emerald-600' : 'bg-amber-500'}`}
 ></span>
 {p.verified ? 'VERIFIED PARTNER' : 'PENDING AUDIT'}
 </span>
 </div>

 <div className="pt-3 space-y-2">
 <h3 className="font-headline-md font-bold text-on-surface">{p.name}</h3>
 <div className="flex items-center justify-between text-body-sm text-on-surface-variant">
 <span className="font-semibold text-secondary">{p.type}</span>
 <span className=" font-label-code-sm">{p.phone}</span>
 </div>
 <div className="p-2.5 rounded-lg bg-surface-container-low text-body-sm text-on-surface border border-outline-variant/20 leading-relaxed">
 <span className="font-semibold block text-xs text-outline mb-1 uppercase ">Inventory &amp; Capabilities</span>
 {p.what_they_can_offer}
 </div>
 <div className="text-label-code-sm text-outline ">
 Covered Wards: {p.ward_ids_covered === '*' ? 'All Uttarakhand Wards' : `Wards [${p.ward_ids_covered}]`}
 </div>
 </div>
 </div>

 <div className="pt-4 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
 <span className="text-body-sm text-on-surface-variant font-medium text-xs">
 {p.verified ? 'Authorized for Direct Allocation' : 'Documents Submitted'}
 </span>
 {p.verified ? (
 <div className="flex items-center gap-1 text-on-tertiary-container font-label-code-sm font-semibold">
 <span className="material-symbols-outlined text-[18px]">verified</span>
 <span>Approved</span>
 </div>
 ) : (
 <button
 type="button"
 onClick={() => handleVerify(p)}
 className="h-10 px-3 rounded-xl bg-secondary text-on-secondary hover:bg-on-secondary-container font-body-sm text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shadow-xs"
 >
 <span className="material-symbols-outlined text-[16px]">verified_user</span>
 <span>Verify Credentials</span>
 </button>
 )}
 </div>
 </div>
 ))}
 </div>
 </div>
 );
}

