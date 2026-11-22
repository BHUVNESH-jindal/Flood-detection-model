import React, { useState, useEffect, useCallback } from 'react';
import { getWards, getAlerts } from '../../api';
import TriggerAlertModal from '../TriggerAlertModal';
import DisseminationLog from '../DisseminationLog';
import { AlertOctagon, Send, RefreshCw, MapPin } from 'lucide-react';

export default function AdminAlertsView({ onShowToast }) {
  const [wards, setWards] = useState([]);
  const [selectedWardId, setSelectedWardId] = useState('');
  const [alerts, setAlerts] = useState([]);
  const [isLoadingAlerts, setIsLoadingAlerts] = useState(true);
  const [alertsError, setAlertsError] = useState(null);
  const [isTriggerModalOpen, setIsTriggerModalOpen] = useState(false);
  const [isLoadingWards, setIsLoadingWards] = useState(true);
  const [wardsError, setWardsError] = useState(null);

  const loadAlerts = useCallback(async () => {
    try {
      const data = await getAlerts();
      setAlerts(data || []);
      setAlertsError(null);
    } catch (err) {
      setAlertsError(err.message || 'Failed to fetch alert dissemination log');
    } finally {
      setIsLoadingAlerts(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    getWards()
      .then((data) => {
        if (!active) return;
        setWards(data || []);
        setSelectedWardId((current) => current || data?.[0]?.id || '');
        setWardsError(null);
      })
      .catch((err) => {
        if (active) {
          console.error('[AdminAlertsView] Failed to load wards:', err);
          setWardsError(err.message || 'Failed to load wards.');
        }
      })
      .finally(() => {
        if (active) setIsLoadingWards(false);
      });
    getAlerts()
      .then((data) => {
        if (active) {
          setAlerts(data || []);
          setAlertsError(null);
        }
      })
      .catch((err) => {
        if (active) setAlertsError(err.message || 'Failed to fetch alert dissemination log');
      })
      .finally(() => {
        if (active) setIsLoadingAlerts(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const selectedWard = wards.find((w) => w.id === selectedWardId) || wards[0] || null;

  const handleAlertTriggered = async (result) => {
    if (onShowToast) {
      onShowToast(`Emergency alert dispatched for ${result.wardName || 'selected ward'}.`);
    }
    setIsLoadingAlerts(true);
    await loadAlerts();
  };

  const refreshAlerts = () => {
    setIsLoadingAlerts(true);
    setAlertsError(null);
    void loadAlerts();
  };

  return (
    <div className="space-y-6">
      {/* Top Header & Ward Alert Dispatcher Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 bg-red-100 text-red-700 rounded-lg font-bold">
                <AlertOctagon className="w-5 h-5" />
              </span>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">
                Emergency Alert Dispatch & Command
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1 font-medium">
              Broadcast verified WhatsApp emergency evacuation orders to target ward subscribers and field teams.
            </p>
          </div>

          <button
            type="button"
            onClick={refreshAlerts}
            disabled={isLoadingAlerts}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-all cursor-pointer self-start sm:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoadingAlerts ? 'animate-spin' : ''}`} />
            <span>Refresh Log</span>
          </button>
        </div>

        {/* Ward Selector Controls */}
        <div className="pt-3 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-slate-500" />
              <label htmlFor="ward-select" className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Target Sector / Ward:
              </label>
            </div>
            <select
              id="ward-select"
              value={selectedWardId}
              onChange={(e) => setSelectedWardId(e.target.value)}
              disabled={isLoadingWards || wards.length === 0}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-red-600 cursor-pointer min-w-[220px]"
            >
              {wards.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.name} ({w.district}) — {w.riskLevel}
                </option>
              ))}
            </select>

            {selectedWard && (
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                selectedWard.riskLevel === 'CRITICAL' ? 'bg-red-100 text-red-800 border border-red-200' :
                selectedWard.riskLevel === 'WARNING' ? 'bg-amber-100 text-amber-800 border border-amber-200' :
                'bg-emerald-100 text-emerald-800 border border-emerald-200'
              }`}>
                Risk: {selectedWard.riskLevel} ({selectedWard.riskScore || 0}/100)
              </span>
            )}
          </div>

          {wardsError && (
              <p role="alert" className="text-sm text-red-700">{wardsError}</p>
          )}

          <button
            type="button"
            onClick={() => setIsTriggerModalOpen(true)}
            disabled={!selectedWard}
            className="flex h-10 items-center justify-center gap-2 px-5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            <span>Send Alert to Ward</span>
          </button>
        </div>
      </div>

      {/* Dissemination Audit Log */}
      <DisseminationLog
        alerts={alerts}
        isLoading={isLoadingAlerts}
        error={alertsError}
        onRetry={refreshAlerts}
      />

      {/* Trigger Alert Modal */}
      {isTriggerModalOpen && selectedWard && (
        <TriggerAlertModal
          ward={selectedWard}
          onClose={() => setIsTriggerModalOpen(false)}
          onConfirmTrigger={handleAlertTriggered}
        />
      )}
    </div>
  );
}
