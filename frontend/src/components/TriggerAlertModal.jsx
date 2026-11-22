import React, { useState } from 'react';
import { 
  AlertOctagon, X, MessageSquare, 
  CheckCircle2, Send, AlertTriangle, AlertCircle,
  Copy, ExternalLink
} from 'lucide-react';
import { triggerAlert } from '../api';

export default function TriggerAlertModal({ ward, onClose, onConfirmTrigger }) {
  const [step, setStep] = useState(1); // 1: Select & Preview | 2: Execution Confirmation
  const [customNote, setCustomNote] = useState('');
  const [directPhone, setDirectPhone] = useState('+917018703712');
  const [isExecuting, setIsExecuting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  if (!ward) return null;

  // Build the universal emergency message for WhatsApp
  const buildAlertMessage = () => {
    const timestampStr = new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) + ' IST';
    const noteLine = customNote.trim() ? `\n📝 Advisory: ${customNote.trim()}\n` : '';
    return (
      `🚨 [${(ward.riskLevel || 'CRITICAL').toUpperCase()} FLOOD ALERT] — ${ward.name}\n\n` +
      `Severe flash flood & elevated soil saturation detected in this sector.\n` +
      `🏃 SAFE EVACUATION ZONE: Move towards ${ward.safeZoneName || 'Designated Shelter'} immediately.\n` +
      noteLine +
      `\n📞 Emergency Control Room: Dial 1077 or 112\n` +
      `🕒 Issued: ${timestampStr}\n` +
      `State Disaster Management Authority (SDMA)`
    );
  };

  // Generate direct wa.me link or universal broadcast link
  const getWhatsAppUrl = () => {
    const text = encodeURIComponent(buildAlertMessage());
    const cleanDigits = directPhone.replace(/\D/g, '');
    if (cleanDigits) {
      return `https://wa.me/${cleanDigits}?text=${text}`;
    }
    return `https://api.whatsapp.com/send?text=${text}`;
  };

  const handleLaunchWhatsApp = () => {
    const url = getWhatsAppUrl();
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(buildAlertMessage());
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleExecute = async () => {
    setIsExecuting(true);
    setErrorMsg(null);
    try {
      const apiResult = await triggerAlert({
        wardId: ward.rawId || ward.id,
        severity: ward.riskLevel,
        customNote: customNote || undefined,
        directPhone: directPhone.trim() || undefined,
        triggeredBy: 'manual (Disaster Management Control Room)'
      });

      handleLaunchWhatsApp();

      onConfirmTrigger({
        wardId: ward.id,
        rawId: ward.rawId,
        wardName: ward.name,
        district: ward.district,
        severity: ward.riskLevel,
        channels: ['WHATSAPP'],
        recipientsCount: apiResult.recipient_count || ward.population,
        customNote,
        apiResult
      });

      setIsExecuting(false);
      onClose();
    } catch (err) {
      console.error("Alert trigger failed:", err);
      // Fallback: Even if server has network delay, open WhatsApp directly so emergency flow NEVER fails
      handleLaunchWhatsApp();
      setIsExecuting(false);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4" aria-modal="true" role="dialog">
      <div className="bg-white border border-red-200 rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden text-slate-900 modal-transition-enter font-sans">
        
        {/* Header */}
        <div className="bg-red-600 border-b border-red-700 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <AlertOctagon className="w-5 h-5 text-white animate-pulse" />
            <h2 className="text-base font-black uppercase tracking-wider ">
              Emergency Evacuation Alert Dispatch • {ward.id}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-white hover:bg-red-700 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 space-y-4 max-h-[80vh] overflow-y-auto bg-slate-50">
          {errorMsg && (
            <div className="bg-red-50 border border-red-200 p-3.5 rounded-lg text-xs text-red-800 flex items-center gap-2 font-medium">
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {step === 1 ? (
            <>
              {/* Target Ward Info */}
              <div className="bg-white border border-slate-200 p-4 rounded-xl flex items-center justify-between shadow-2xs">
                <div>
                  <span className="text-[10px] font-bold text-slate-500">TARGET WARD & SECTOR</span>
                  <h3 className="text-base font-black text-slate-900">{ward.name} ({ward.district} District)</h3>
                  <p className="text-xs text-slate-600 font-medium mt-0.5">
                    Population: {ward.population?.toLocaleString('en-IN')} residents • Safe Zone: {ward.safeZoneName}
                  </p>
                </div>
                <div className="text-right ">
                  <span className="text-xs text-slate-500 font-bold block">Soil Saturation</span>
                  <span className="text-lg font-black text-red-600">{ward.sensors?.soilMoisture || 80}% VWC</span>
                </div>
              </div>

              {/* 1-Click WhatsApp Direct Dispatch Banner */}
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl shadow-xs space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
                      <MessageSquare className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-black text-emerald-950 uppercase tracking-wide block">
                        WhatsApp Dispatch Channel
                      </span>
                      <p className="text-[11px] text-emerald-800 leading-snug mt-0.5">
                        Transmits through the backend Twilio WhatsApp service and launches the pre-formatted evacuation alert.
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900 text-[10px] font-bold uppercase shrink-0">
                    WHATSAPP
                  </span>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleLaunchWhatsApp}
                    className="flex-1 py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2 transition-all shadow-sm cursor-pointer active:scale-95"
                  >
                    <MessageSquare className="w-4 h-4 fill-white" />
                    <span>{directPhone.trim() ? `Send to ${directPhone}` : 'Broadcast to WhatsApp Group / Chat'}</span>
                    <ExternalLink className="w-3.5 h-3.5 opacity-80" />
                  </button>

                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="py-2.5 px-3.5 bg-white border border-emerald-300 hover:bg-emerald-100/50 text-emerald-900 font-bold text-xs rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-emerald-700" />}
                    <span>{copied ? 'Copied!' : 'Copy Text'}</span>
                  </button>
                </div>
              </div>

              {/* Channel Indicator (WhatsApp only) */}
              <div className="bg-white border border-slate-200 p-3 rounded-lg flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-emerald-600 shrink-0" />
                  <div>
                    <span className="text-xs font-bold block text-slate-900">Broadcast Channel: WhatsApp</span>
                    <span className="text-[10px] text-slate-500 font-medium block">Verified official channel connected to POST /alerts/trigger</span>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                  ACTIVE
                </span>
              </div>

              {/* Message Template Preview */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    WhatsApp Message Preview:
                  </label>
                  <button
                    type="button"
                    onClick={handleCopyMessage}
                    className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="space-y-1.5 bg-white p-3.5 rounded-xl border border-slate-200 text-xs shadow-2xs font-mono leading-relaxed whitespace-pre-wrap text-slate-800">
                  {buildAlertMessage()}
                </div>
              </div>

              {/* Optional Custom Instructions */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">
                  Add Custom Advisory Note (Optional):
                </label>
                <input
                  type="text"
                  placeholder="e.g. Move via North Ridge Road to Helipad. Avoid low bridges."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-white border border-slate-300 text-slate-900 placeholder-slate-400 p-2.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-600"
                />
              </div>

              {/* Direct WhatsApp Phone Number */}
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1 flex items-center justify-between">
                  <span>Target WhatsApp Contact Number:</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Direct 1-to-1 or leave blank for group pick</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. +91 9876543210 (Leave blank to pick any contact or group inside WhatsApp)"
                  value={directPhone}
                  onChange={(e) => setDirectPhone(e.target.value)}
                  className="w-full bg-white border border-emerald-300 text-slate-900 placeholder-slate-400 p-2.5 rounded-lg text-xs font-medium focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
            </>
          ) : (
            /* Step 2: Final Confirmation */
            <div className="py-6 text-center space-y-4">
              <div className="w-16 h-16 bg-red-100 rounded-full border-2 border-red-500 flex items-center justify-center mx-auto text-red-600 animate-pulse">
                <AlertOctagon className="w-10 h-10" />
              </div>

              <div>
                <h3 className="text-lg font-black text-slate-900 uppercase tracking-wider">Confirm Evacuation Dispatch</h3>
                <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 font-medium">
                  You are dispatching an official evacuation warning for <strong className="text-slate-900">{ward.name}</strong>.
                  This logs the incident in the SDMA state register and broadcasts via WhatsApp.
                </p>
              </div>

              <div className="p-3 bg-red-50 border border-red-200 rounded-lg max-w-md mx-auto text-xs text-red-800 flex items-start gap-2 text-left font-medium">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <span>Incident will be committed to the State Disaster Telemetry Database.</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-200 p-4 flex items-center justify-between">
          <button
            onClick={() => (step === 2 ? setStep(1) : onClose())}
            disabled={isExecuting}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all disabled:opacity-50 cursor-pointer"
          >
            {step === 2 ? 'Back' : 'Cancel'}
          </button>

          {step === 1 ? (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleLaunchWhatsApp}
                className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <MessageSquare className="w-4 h-4 fill-white" />
                <span>Launch WhatsApp</span>
              </button>
              <button
                onClick={() => setStep(2)}
                className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg border border-red-700 shadow-xs transition-all cursor-pointer"
              >
                <span>Review & Log Alert</span>
                <Send className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              onClick={handleExecute}
              disabled={isExecuting}
              className="flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs uppercase tracking-wider rounded-lg border border-red-700 shadow-md disabled:opacity-50 transition-all active:scale-95 cursor-pointer"
            >
              {isExecuting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Logging & Dispatching...</span>
                </>
              ) : (
                <>
                  <AlertOctagon className="w-4 h-4 text-white" />
                  <span>LOG & BROADCAST ON WHATSAPP</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
