import React from 'react';
import { WifiOff, PhoneCall, Smartphone, X } from 'lucide-react';

export default function MobileOfflineBanner({ onDismiss }) {
 return (
 <div className="bg-amber-600 text-white px-4 py-2.5 shadow-md flex items-center justify-between text-xs animate-in slide-in-from-top-2 duration-200">
 <div className="flex items-center gap-2 overflow-hidden">
 <WifiOff className="w-4 h-4 shrink-0 text-amber-200" />
 <div className="leading-snug truncate">
 <span className="font-bold">Offline / Low-Bandwidth Mode Active: </span>
 <span>Send SMS <strong className="bg-amber-700 px-1 py-0.5 rounded ">SOS</strong> to <strong className="bg-amber-700 px-1 py-0.5 rounded ">56070</strong> for USSD emergency callback.</span>
 </div>
 </div>

 <div className="flex items-center gap-2 shrink-0 ml-2">
 <a 
 href="tel:1077" 
 className="bg-black/30 hover:bg-black/50 text-white px-2 py-0.5 rounded text-[11px] font-bold flex items-center gap-1"
 >
 <PhoneCall className="w-3 h-3" />
 <span>1077</span>
 </a>
 {onDismiss && (
 <button onClick={onDismiss} className="text-white/70 hover:text-white p-0.5 cursor-pointer">
 <X className="w-3.5 h-3.5" />
 </button>
 )}
 </div>
 </div>
 );
}
