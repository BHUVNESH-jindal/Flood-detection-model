import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AlertTriangle, CheckSquare, MapPin, Share2, Square } from 'lucide-react';
import MapView from './MapView';
import LocationRiskCheck from './LocationRiskCheck';
import { getWards, getSafeZones, checkLocationRisk, sendEmailRiskReport, connectWebSocket } from '../api';

const checklistItems = [
 { key: 'electricMeter', title: 'Turn off the main electrical breaker if water approaches', detail: 'Do not touch electrical equipment while standing in water.' },
 { key: 'zipMedicines', title: 'Seal medicines and identification in waterproof packaging', detail: 'Keep essential prescriptions and identification accessible.' },
 { key: 'batterySaver', title: 'Conserve phone battery for emergency calls', detail: 'Limit non-essential use and keep a power bank dry.' },
 { key: 'storeWater', title: 'Store clean drinking water in sealed containers', detail: 'Use only water known to be safe to drink.' },
];

export default function LiveAlertsSafetyView({ onNavigateTab }) {
 const [wards, setWards] = useState([]);
 const [safeZones, setSafeZones] = useState([]);
 const [selectedWard, setSelectedWard] = useState(null);
 const [queriedLocation, setQueriedLocation] = useState(null);
 const [locationLoading, setLocationLoading] = useState(false);
 const [locationError, setLocationError] = useState(null);
 const [wardsLoading, setWardsLoading] = useState(true);
 const [telemetryError, setTelemetryError] = useState(null);
 const [checkedItems, setCheckedItems] = useState({});
 const [notificationEmail, setNotificationEmail] = useState('');
 const [automaticEmailAlerts, setAutomaticEmailAlerts] = useState(false);
 const [emailLoading, setEmailLoading] = useState(false);
 const [emailStatus, setEmailStatus] = useState(null);
 const mapSectionRef = useRef(null);
 const locationCheckSequence = useRef(0);
 const autoAlertedCheckId = useRef(0);

 const safetyActionForRisk = (riskLevel) => {
  switch ((riskLevel || '').toUpperCase()) {
   case 'CRITICAL':
    return 'Move immediately to designated higher ground or the nearest safe zone. Avoid river channels and unstable slopes, and call 112 or 1077 for emergency help.';
   case 'WARNING':
    return 'Avoid flood-prone roads and unstable slopes, prepare to evacuate, and follow official local advisories.';
   case 'WATCH':
    return 'Monitor official alerts, prepare essential supplies, and do not cross streams or flooded roads.';
   default:
    return 'Continue monitoring official weather and safety advisories, and remain prepared for changing conditions.';
  }
 };

 const sendLocationReport = async (location, autoTriggered, recipient = notificationEmail) => {
  const email = recipient.trim();
  if (!email) {
   setEmailStatus({ kind: 'error', message: 'Enter an email address to receive this report.' });
   return;
  }

  setEmailLoading(true);
  setEmailStatus(null);
  try {
   const response = await sendEmailRiskReport({
    email,
    location_name: location.location_name,
    latitude: location.latitude,
    longitude: location.longitude,
    risk_level: location.risk_level,
    probability: Math.min(1, Math.max(0, Number(location.risk_probability ?? location.danger_factor / 100))),
    advisory: safetyActionForRisk(location.risk_level),
    auto_triggered: autoTriggered
   });
   setEmailStatus({
    kind: response.sent ? 'success' : response.status === 'threshold_not_met' ? 'info' : 'error',
    message: autoTriggered && response.sent
     ? `High risk threshold exceeded — alert emailed to ${email}`
     : response.message
   });
  } catch (error) {
   setEmailStatus({ kind: 'error', message: error.message || 'Unable to send the risk report email.' });
  } finally {
   setEmailLoading(false);
  }
 };

 const isAutoAlertEligible = (location) => (
  Number(location.risk_probability ?? location.danger_factor / 100) >= 0.7
  || ['HIGH', 'CRITICAL'].includes((location.risk_level || '').toUpperCase())
 );

 const sendAutomaticReportOnce = (location, checkId, recipient = notificationEmail) => {
  if (
   !location
   || !recipient.trim()
   || !isAutoAlertEligible(location)
   || autoAlertedCheckId.current === checkId
  ) {
   return;
  }

  autoAlertedCheckId.current = checkId;
  void sendLocationReport(location, true, recipient);
 };

 const scrollToMap = () => {
  mapSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
 };

 const loadTelemetryData = useCallback(async () => {
  const [wardsResult, safeZonesResult] = await Promise.allSettled([getWards(), getSafeZones()]);

  if (wardsResult.status === 'fulfilled') {
   setWards(wardsResult.value);
   setSelectedWard((current) => current || wardsResult.value[0] || null);
  }
  if (safeZonesResult.status === 'fulfilled') {
   setSafeZones(safeZonesResult.value);
  }

  const errors = [wardsResult, safeZonesResult]
   .filter((result) => result.status === 'rejected')
   .map((result) => result.reason?.message || 'Unable to load map data.');
  setTelemetryError(errors.length ? errors.join(' ') : null);
  setWardsLoading(false);
 }, []);

 useEffect(() => {
  let active = true;
  Promise.allSettled([getWards(), getSafeZones()]).then(([wardsResult, safeZonesResult]) => {
   if (!active) return;
   if (wardsResult.status === 'fulfilled') {
    setWards(wardsResult.value);
    setSelectedWard((current) => current || wardsResult.value[0] || null);
   }
   if (safeZonesResult.status === 'fulfilled') {
    setSafeZones(safeZonesResult.value);
   }
   const errors = [wardsResult, safeZonesResult]
    .filter((result) => result.status === 'rejected')
    .map((result) => result.reason?.message || 'Unable to load map data.');
   setTelemetryError(errors.length ? errors.join(' ') : null);
   setWardsLoading(false);
  });
  return () => {
   active = false;
  };
 }, []);

 useEffect(() => connectWebSocket((message) => {
  if (message?.type === 'telemetry_update') {
   void loadTelemetryData();
  }
 }), [loadTelemetryData]);

 const handleCheckLocation = async (payload) => {
  setLocationLoading(true);
  setLocationError(null);
  setEmailStatus(null);
  try {
   const result = await checkLocationRisk(payload);
   const checkId = ++locationCheckSequence.current;
   setQueriedLocation(result);
   if (automaticEmailAlerts) {
    sendAutomaticReportOnce(result, checkId);
   }
   setTimeout(scrollToMap, 350);
  } catch (error) {
   setLocationError(error.message || 'Failed to calculate hazard score for location.');
  } finally {
   setLocationLoading(false);
  }
 };

 const shareAdvisory = (ward) => {
  const message = `Flood risk advisory for ${ward.name}: current risk level ${ward.riskLevel}. Check local conditions and call 1077 for emergency assistance.`;
  window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank', 'noopener,noreferrer');
 };

 const advisories = wards
  .filter((ward) => !['SAFE', 'LOW'].includes((ward.riskLevel || '').toUpperCase()))
  .slice(0, 3);

 return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-8">
   <section aria-label="Check this location">
    <LocationRiskCheck
     onCheckLocation={handleCheckLocation}
     locationResult={queriedLocation}
     isLoading={locationLoading}
     error={locationError}
     onClearResult={() => setQueriedLocation(null)}
     onViewOnMap={scrollToMap}
     onEmailReport={() => queriedLocation && sendLocationReport(queriedLocation, false)}
     emailReportLoading={emailLoading}
     emailReportDisabled={!notificationEmail.trim()}
     notificationEmail={notificationEmail}
     onNotificationEmailChange={(email) => {
      setNotificationEmail(email);
      if (automaticEmailAlerts) {
       sendAutomaticReportOnce(queriedLocation, locationCheckSequence.current, email);
      }
     }}
     automaticEmailAlerts={automaticEmailAlerts}
     onAutomaticEmailAlertsChange={(enabled) => {
      setAutomaticEmailAlerts(enabled);
      if (enabled) {
       sendAutomaticReportOnce(queriedLocation, locationCheckSequence.current);
      }
     }}
     emailStatus={emailStatus}
    />
   </section>

   <section ref={mapSectionRef} className="space-y-3 scroll-mt-6">
    <div>
     <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">GIS TELEMETRY & HEATMAP</span>
     <h3 className="text-xl font-black text-slate-900 tracking-tight">Flood Risk Map</h3>
     <p className="text-xs text-slate-500">Select a point on the map to check its location risk.</p>
    </div>
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-lg border border-slate-200">
     <MapView
      wards={wards}
      selectedWard={selectedWard}
      onSelectWard={setSelectedWard}
      activeFilter="ALL"
      isLoading={wardsLoading}
      error={telemetryError}
      onRetry={() => {
       setWardsLoading(true);
       void loadTelemetryData();
      }}
      safeZones={safeZones}
      queriedLocation={queriedLocation}
      onMapClickLocation={(latitude, longitude) => handleCheckLocation({ latitude, longitude })}
     />
    </div>
   </section>

   <section className="space-y-4">
    <div className="flex items-center gap-2">
     <AlertTriangle className="w-5 h-5 text-amber-600" />
     <h3 className="text-base font-bold text-slate-900 tracking-tight">Risk Advisories</h3>
    </div>
    {advisories.length ? (
     <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {advisories.map((ward) => (
       <article key={ward.rawId || ward.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-center justify-between gap-2 text-xs">
         <span className="font-bold text-amber-800">{ward.riskLevel} RISK</span>
         <span className="text-slate-500">Score: {ward.riskScore}</span>
        </div>
        <h4 className="text-sm font-bold text-slate-900">{ward.name}</h4>
        <p className="text-xs text-slate-600">Check local conditions and use the location risk checker before travelling.</p>
        <button
         type="button"
         onClick={() => shareAdvisory(ward)}
         className="flex items-center gap-1 px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 rounded text-[10px] font-bold"
        >
         <Share2 className="w-3 h-3" /> Share advisory
        </button>
       </article>
      ))}
     </div>
    ) : (
     <p className="bg-white border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-600">
      {wardsLoading ? 'Loading current ward risk data…' : 'No active alerts are currently reported.'}
     </p>
    )}
   </section>

   <section className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
    <div>
     <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">OFFLINE SAFETY CHECKLIST</span>
     <h3 className="text-lg font-black text-slate-900 tracking-tight">Quick Safety Steps</h3>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
     {checklistItems.map((item) => {
      const checked = Boolean(checkedItems[item.key]);
      return (
       <button
        key={item.key}
        type="button"
        aria-pressed={checked}
        onClick={() => setCheckedItems((previous) => ({ ...previous, [item.key]: !previous[item.key] }))}
        className="flex items-start gap-3 p-3 text-left bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100"
       >
        {checked ? <CheckSquare className="w-5 h-5 text-slate-900 shrink-0" /> : <Square className="w-5 h-5 text-slate-400 shrink-0" />}
        <span>
         <span className={`block text-xs font-bold ${checked ? 'line-through text-slate-500' : 'text-slate-900'}`}>{item.title}</span>
         <span className="block text-[11px] text-slate-500 mt-1">{item.detail}</span>
        </span>
       </button>
      );
     })}
    </div>
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-slate-100 pt-4">
     <button type="button" onClick={() => onNavigateTab?.('shelters')} className="inline-flex items-center gap-1 text-sm font-bold text-blue-700 hover:underline">
      <MapPin className="w-4 h-4" /> View shelters
     </button>
    </div>
   </section>
  </div>
 );
}
