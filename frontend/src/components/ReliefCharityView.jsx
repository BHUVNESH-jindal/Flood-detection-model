import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle2, Heart, Link as LinkIcon, Users } from 'lucide-react';
import { getDonationLinks, registerReliefProvider } from '../api';

const volunteerRoles = [
 'Food distribution',
 'Medical and first-aid support',
 'Rescue and logistics assistance',
 'Shelter support',
];

export default function ReliefCharityView() {
 const [donationLinks, setDonationLinks] = useState([]);
 const [linksLoading, setLinksLoading] = useState(true);
 const [linksError, setLinksError] = useState(null);
 const [name, setName] = useState('');
 const [phone, setPhone] = useState('');
 const [role, setRole] = useState(volunteerRoles[0]);
 const [availability, setAvailability] = useState('');
 const [submitting, setSubmitting] = useState(false);
 const [formError, setFormError] = useState(null);
 const [submitted, setSubmitted] = useState(false);

 useEffect(() => {
  let active = true;
  getDonationLinks()
   .then((data) => {
    if (active) setDonationLinks(Array.isArray(data) ? data : []);
   })
   .catch((error) => {
    if (active) setLinksError(error.message || 'Unable to load donation links.');
   })
   .finally(() => {
    if (active) setLinksLoading(false);
   });
  return () => {
   active = false;
  };
 }, []);

 const handleVolunteerSubmit = async (event) => {
  event.preventDefault();
  setSubmitting(true);
  setFormError(null);
  setSubmitted(false);
  try {
   await registerReliefProvider({
    name,
    type: role,
    phone,
    whatTheyCanOffer: availability ? `${role}; availability: ${availability}` : role,
   });
   setSubmitted(true);
   setName('');
   setPhone('');
   setAvailability('');
  } catch (error) {
   setFormError(error.message || 'Unable to submit volunteer registration.');
  } finally {
   setSubmitting(false);
  }
 };

 return (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
   <header>
    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">COMMUNITY RELIEF</span>
    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Relief & Charity</h2>
    <p className="text-sm text-slate-600 mt-1">Donation links are provided by the relief registry. Volunteer registrations are submitted to the relief provider service.</p>
   </header>

   <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
    <div className="flex items-center gap-2">
     <Heart className="w-5 h-5 text-red-600" />
     <h3 className="text-lg font-bold text-slate-900">Donation links</h3>
    </div>
    {linksError && (
     <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
      {linksError}
     </div>
    )}
    {linksLoading ? (
     <p className="text-sm text-slate-600">Loading donation links…</p>
    ) : donationLinks.length ? (
     <ul className="space-y-3">
      {donationLinks.map((link) => (
       <li key={link.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-lg border border-slate-200 bg-slate-50 p-4">
        <div>
         <h4 className="text-sm font-bold text-slate-900">{link.organization_name}</h4>
         <p className="text-xs text-slate-500 mt-0.5">{link.organization_type}</p>
         {link.description && <p className="text-sm text-slate-700 mt-2">{link.description}</p>}
        </div>
        <a
         href={link.donation_url}
         target="_blank"
         rel="noopener noreferrer"
         className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
        >
         <LinkIcon className="w-4 h-4" /> Open donation link
        </a>
       </li>
      ))}
     </ul>
    ) : !linksError ? (
     <p className="text-sm text-slate-600">No donation links are currently available.</p>
    ) : null}
   </section>

   <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
    <div className="flex items-center gap-2">
     <Users className="w-5 h-5 text-blue-700" />
     <h3 className="text-lg font-bold text-slate-900">Volunteer registration</h3>
    </div>
    {submitted ? (
     <div role="status" className="flex items-center gap-2 rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
      <CheckCircle2 className="w-5 h-5 text-emerald-700" />
      Registration received. It will need to be verified before appearing as an approved provider.
     </div>
    ) : (
     <form onSubmit={handleVolunteerSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
       <label className="text-xs font-bold text-slate-700">
        Full name
        <input
         type="text"
         value={name}
         onChange={(event) => setName(event.target.value)}
         required
         className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
       </label>
       <label className="text-xs font-bold text-slate-700">
        Contact phone
        <input
         type="tel"
         value={phone}
         onChange={(event) => setPhone(event.target.value)}
         required
         className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
       </label>
       <label className="text-xs font-bold text-slate-700">
        Volunteer role
        <select
         value={role}
         onChange={(event) => setRole(event.target.value)}
         className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        >
         {volunteerRoles.map((volunteerRole) => <option key={volunteerRole}>{volunteerRole}</option>)}
        </select>
       </label>
       <label className="text-xs font-bold text-slate-700">
        Availability (optional)
        <input
         type="text"
         value={availability}
         onChange={(event) => setAvailability(event.target.value)}
         placeholder="Days or times you are available"
         className="mt-1 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-600"
        />
       </label>
      </div>
      {formError && <p role="alert" className="text-sm text-red-700">{formError}</p>}
      <button
       type="submit"
       disabled={submitting}
       className="w-full rounded-lg bg-slate-950 px-4 py-3 text-sm font-bold text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
       {submitting ? 'Submitting…' : 'Submit volunteer registration'}
      </button>
     </form>
    )}
   </section>
  </div>
 );
}
