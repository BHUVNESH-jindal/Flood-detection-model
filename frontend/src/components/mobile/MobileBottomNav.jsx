import React from 'react';
import { Radio, Shield, HeartHandshake, PhoneCall, LifeBuoy, AlertOctagon } from 'lucide-react';
import { triggerTapHaptic, triggerHazardSirenHaptics } from '../../services/mobileNativeService';

export default function MobileBottomNav({ 
  activeTab, 
  setActiveTab, 
  onOpenSosModal 
}) {
  const handleTabClick = (tab) => {
    triggerTapHaptic();
    setActiveTab(tab);
    window.location.hash = `#${tab}`;
  };

  const handleSosClick = () => {
    triggerHazardSirenHaptics();
    onOpenSosModal();
  };

  return (
    <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-lg border-t border-slate-200 shadow-2xl px-2 py-1 safe-area-bottom">
      <div className="flex items-center justify-around relative">
        
        {/* Tab 1: Live Alerts */}
        <button
          type="button"
          onClick={() => handleTabClick('alerts')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'alerts' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Radio className={`w-5 h-5 ${activeTab === 'alerts' ? 'animate-pulse' : ''}`} />
          <span className="text-[10px] mt-0.5">Alerts</span>
        </button>

        {/* Tab 2: Shelters */}
        <button
          type="button"
          onClick={() => handleTabClick('shelters')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'shelters' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Shelters</span>
        </button>

        {/* CENTER PROMINENT SOS BUTTON */}
        <div className="-mt-5 flex flex-col items-center">
          <button
            type="button"
            onClick={handleSosClick}
            className="w-13 h-13 rounded-full bg-red-600 hover:bg-red-700 text-white flex items-center justify-center shadow-lg shadow-red-600/40 border-2 border-white transition-transform active:scale-90 cursor-pointer animate-pulse"
            title="Instant Emergency SOS (Boat Rescue & Heavy Pump)"
          >
            <LifeBuoy className="w-7 h-7" />
          </button>
          <span className="text-[10px] font-black text-red-600 tracking-wider mt-0.5">SOS</span>
        </div>

        {/* Tab 3: Charity Relief */}
        <button
          type="button"
          onClick={() => handleTabClick('charity')}
          className={`flex flex-col items-center justify-center py-1 px-2 rounded-lg transition-colors cursor-pointer ${
            activeTab === 'charity' ? 'text-blue-700 font-bold' : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          <HeartHandshake className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">Relief</span>
        </button>

        {/* Tab 4: Helpline 1077 */}
        <a
          href="tel:1077"
          onClick={triggerTapHaptic}
          className="flex flex-col items-center justify-center py-1 px-2 rounded-lg text-red-600 hover:text-red-700 transition-colors cursor-pointer"
        >
          <PhoneCall className="w-5 h-5" />
          <span className="text-[10px] font-bold mt-0.5">1077</span>
        </a>

      </div>
    </div>
  );
}
