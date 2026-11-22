import React, { useEffect, useState } from 'react';
import { X, CheckCircle2, ArrowRight } from 'lucide-react';
import { getWards, submitReliefRequest } from '../api';

export default function RequestDisasterHelpModal({ isOpen, type, onClose, onSubmitSuccess }) {
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [location, setLocation] = useState('');
 const [peopleCount, setPeopleCount] = useState('2');
 const [waterDepth, setWaterDepth] = useState('1 - 2 Feet (Ankle/Knee)');
 const [details, setDetails] = useState('');
 const [submitted, setSubmitted] = useState(false);
 const [wards, setWards] = useState([]);
 const [wardId, setWardId] = useState('');
 const [wardsLoading, setWardsLoading] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [error, setError] = useState(null);
 const [requestId, setRequestId] = useState(null);

 useEffect(() => {
 if (!isOpen) return undefined;
 let active = true;
 setWardsLoading(true);
 setError(null);
 setSubmitted(false);
 getWards()
  .then((data) => {
   if (!active) return;
   setWards(data);
   setWardId((current) => current || String(data[0]?.rawId || ''));
  })
  .catch((loadError) => {
   if (active) setError(loadError.message || 'Unable to load wards.');
  })
  .finally(() => {
   if (active) setWardsLoading(false);
  });
 return () => {
  active = false;
 };
 }, [isOpen]);

 if (!isOpen) return null;

 const handleSubmit = async (e) => {
 e.preventDefault();
 setSubmitting(true);
 setError(null);
 try {
  const request = await submitReliefRequest({
   wardId,
   requesterName: name,
   requesterPhone: phone,
   needType: type === 'shuttle' ? 'shuttle' : 'pump/boat rescue',
   description: [`Location: ${location}`, details, `Water depth: ${waterDepth}`].filter(Boolean).join('\n'),
   peopleAffectedCount: peopleCount,
   urgency: 'critical',
  });
  setRequestId(request.id);
  setSubmitted(true);
  onSubmitSuccess?.({
   id: request.id,
   type: type === 'shuttle' ? 'Shuttle transport' : 'Pump / boat rescue',
   location,
   phone,
  });
 } catch (submitError) {
  setError(submitError.message || 'Unable to submit the relief request.');
 } finally {
  setSubmitting(false);
 }
 };

 return (
 <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
 <div className="modal-transition-enter bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-md overflow-hidden relative my-auto p-6 space-y-4">
 <div className="flex items-center justify-between border-b border-slate-100 pb-3">
 <div className="flex items-center gap-2">
 <span className="p-1.5 bg-red-100 text-red-700 rounded-lg font-bold">
 {type === 'shuttle' ? '🚑' : '🚨'}
 </span>
 <div>
 <h3 className="text-base font-black text-slate-900">
 {type === 'shuttle' ? 'Request 4x4 Rescue Shuttle' : 'Request Emergency Pump / Boat'}
 </h3>
 <p className="text-[11px] text-slate-500">
 Submit an emergency relief request to the service.
 </p>
 </div>
 </div>
 <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1">
 <X className="w-5 h-5" />
 </button>
 </div>

 {submitted ? (
 <div className="py-6 text-center space-y-2">
 <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
 <h4 className="text-base font-bold text-slate-900">Request submitted</h4>
 <p className="text-xs text-slate-600">Your request was recorded by the relief service. Reference: {requestId}</p>
 <button type="button" onClick={onClose} className="mt-3 px-4 py-2 bg-slate-950 text-white rounded-lg font-bold">Done</button>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
 WARD
 </label>
 <select
 value={wardId}
 onChange={(e) => setWardId(e.target.value)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 outline-none"
 required
 disabled={wardsLoading || wards.length === 0}
 >
 <option value="">{wardsLoading ? 'Loading wards…' : 'Select your ward'}</option>
 {wards.map((ward) => (
 <option key={ward.rawId} value={ward.rawId}>{ward.name}</option>
 ))}
 </select>
 {!wardsLoading && wards.length === 0 && (
 <p className="mt-1 text-[11px] text-red-700">No wards are available. Please call 1077 for assistance.</p>
 )}
 </div>
 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
 CONTACT NAME
 </label>
 <input
 type="text"
 value={name}
 onChange={(e) => setName(e.target.value)}
 placeholder="Full Name"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 outline-none"
 required
 />
 </div>

 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
 MOBILE NUMBER
 </label>
 <input
 type="tel"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 placeholder="Your contact number"
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 outline-none "
 required
 />
 </div>

 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
 EXACT STREET / WARD / LANDMARK
 </label>
 <input
 type="text"
 value={location}
 onChange={(e) => setLocation(e.target.value)}
 placeholder="House No, Street, Ward 17, Riverbank..."
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 outline-none"
 required
 />
 </div>

 <div className="grid grid-cols-2 gap-3">
 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
 PEOPLE NEEDING RESCUE
 </label>
 <input
 type="number"
 min={1}
 max={20}
 value={peopleCount}
 onChange={(e) => setPeopleCount(e.target.value)}
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 outline-none "
 required
 />
 </div>

 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
 CURRENT WATER DEPTH
 </label>
 <select value={waterDepth} onChange={(e) => setWaterDepth(e.target.value)} className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 outline-none">
 <option>1 - 2 Feet (Ankle/Knee)</option>
 <option>2 - 4 Feet (Waist High)</option>
 <option>Ground Floor Completely Submerged</option>
 </select>
 </div>
 </div>

 <div>
 <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
 SPECIAL INSTRUCTIONS (ELDERLY, INFANTS, MEDICAL)
 </label>
 <textarea
 rows={2}
 value={details}
 onChange={(e) => setDetails(e.target.value)}
 placeholder="Mention elderly family members, infants, or oxygen requirement..."
 className="w-full px-3 py-2 border border-slate-300 rounded-lg text-slate-900 bg-slate-50 outline-none"
 ></textarea>
 </div>

 {error && <p role="alert" className="text-sm text-red-700">{error}</p>}

 <button
 type="submit"
 disabled={submitting || wardsLoading || wards.length === 0}
 className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all shadow-xs disabled:cursor-not-allowed disabled:opacity-60"
 >
 <span>{submitting ? 'Submitting request…' : 'Submit relief request'}</span>
 <ArrowRight className="w-4 h-4" />
 </button>
 </form>
 )}
 </div>
 </div>
 );
}
