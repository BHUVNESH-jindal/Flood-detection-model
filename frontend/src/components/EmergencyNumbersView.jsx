import React from 'react';
import { PhoneCall } from 'lucide-react';

const emergencyNumbers = [
 { number: '1077', name: 'Disaster management helpline', description: 'Report a flood or request disaster assistance.', color: 'bg-red-600 hover:bg-red-700' },
 { number: '112', name: 'National emergency number', description: 'For urgent police, fire, or medical assistance.', color: 'bg-slate-950 hover:bg-slate-800' },
 { number: '108', name: 'Ambulance', description: 'Request emergency medical assistance.', color: 'bg-slate-950 hover:bg-slate-800' },
 { number: '100', name: 'Police', description: 'Contact police for immediate assistance.', color: 'bg-slate-950 hover:bg-slate-800' },
];

export default function EmergencyNumbersView() {
 return (
  <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 space-y-6">
   <header>
    <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">EMERGENCY CONTACTS</span>
    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">Emergency Numbers</h2>
    <p className="text-sm text-slate-600 mt-1">Tap a number to call from your device.</p>
   </header>

   <section className="grid grid-cols-1 sm:grid-cols-2 gap-4" aria-label="Emergency numbers">
    {emergencyNumbers.map((contact) => (
     <article key={contact.number} className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
      <div>
       <h3 className="text-base font-bold text-slate-900">{contact.name}</h3>
       <p className="text-sm text-slate-600 mt-1">{contact.description}</p>
      </div>
      <a
       href={`tel:${contact.number}`}
       className={`w-full px-4 py-3 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 ${contact.color}`}
      >
       <PhoneCall className="w-4 h-4" />
       Call {contact.number}
      </a>
     </article>
    ))}
   </section>
  </div>
 );
}
