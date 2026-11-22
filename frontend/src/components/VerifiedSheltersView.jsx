import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, MapPin, Search } from 'lucide-react';
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import { getSafeZones } from '../api';

const shelterIcon = new L.DivIcon({
 className: 'custom-shelter-pin',
 html: '<div style="background:#1e40af;color:white;border-radius:50%;width:28px;height:28px;display:flex;align-items:center;justify-content:center;border:2px solid white;box-shadow:0 2px 6px rgba(0,0,0,.3)">⌂</div>',
 iconSize: [28, 28],
 iconAnchor: [14, 14],
});

const hasCoordinates = (shelter) =>
 shelter.latitude !== null && shelter.latitude !== undefined &&
 shelter.longitude !== null && shelter.longitude !== undefined &&
 Number.isFinite(Number(shelter.latitude)) && Number.isFinite(Number(shelter.longitude));

export default function VerifiedSheltersView({ onOpenShuttleModal }) {
 const [shelters, setShelters] = useState([]);
 const [searchQuery, setSearchQuery] = useState('');
 const [loading, setLoading] = useState(true);
 const [error, setError] = useState(null);

 const loadShelters = useCallback(async () => {
  try {
   const data = await getSafeZones();
   setShelters(Array.isArray(data) ? data : []);
   setError(null);
  } catch (loadError) {
   setError(loadError.message || 'Unable to load shelters.');
  } finally {
   setLoading(false);
  }
 }, []);

 useEffect(() => {
  let active = true;
  getSafeZones()
   .then((data) => {
    if (!active) return;
    setShelters(Array.isArray(data) ? data : []);
    setError(null);
   })
   .catch((loadError) => {
    if (active) setError(loadError.message || 'Unable to load shelters.');
   })
   .finally(() => {
    if (active) setLoading(false);
   });
  return () => {
   active = false;
  };
 }, []);

 const filteredShelters = useMemo(() => {
  const query = searchQuery.trim().toLowerCase();
  if (!query) return shelters;
  return shelters.filter((shelter) =>
   [shelter.name, shelter.district, shelter.safe_zone_type]
    .filter(Boolean)
    .some((value) => value.toLowerCase().includes(query))
  );
 }, [searchQuery, shelters]);

 const mappedShelters = filteredShelters.filter(hasCoordinates);
 const center = mappedShelters.length
  ? [
    mappedShelters.reduce((sum, shelter) => sum + Number(shelter.latitude), 0) / mappedShelters.length,
    mappedShelters.reduce((sum, shelter) => sum + Number(shelter.longitude), 0) / mappedShelters.length,
   ]
  : [30.3, 79.0];

 return (
  <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-6">
   <header className="flex flex-wrap items-start justify-between gap-4">
    <div>
     <span className="text-[10px] uppercase font-bold tracking-widest text-slate-500">SHELTER DIRECTORY</span>
     <h2 className="text-2xl font-black text-slate-900 tracking-tight">Verified Safe Zones</h2>
     <p className="text-sm text-slate-600 mt-1">Shelter locations and details are loaded from the safe-zone registry.</p>
    </div>
   </header>

   <div className="flex flex-col sm:flex-row gap-3">
    <label className="relative flex-1">
     <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
     <input
      type="search"
      value={searchQuery}
      onChange={(event) => setSearchQuery(event.target.value)}
      placeholder="Search by shelter or district"
      className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-slate-900"
     />
    </label>
    {onOpenShuttleModal && (
     <button
      type="button"
      onClick={onOpenShuttleModal}
      className="px-4 py-2.5 bg-slate-950 text-white text-sm font-bold rounded-lg hover:bg-slate-800"
     >
      Request evacuation help
     </button>
    )}
   </div>

   {error && (
    <div role="alert" className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800">
     <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
     <span>{error}</span>
     <button
      type="button"
      onClick={() => {
       setLoading(true);
       setError(null);
       void loadShelters();
      }}
      className="ml-auto font-bold underline"
     >
      Retry
     </button>
    </div>
   )}

   <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
    <section className="lg:col-span-3 space-y-3" aria-label="Shelter results">
     {loading ? (
      <p className="bg-white border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-600">Loading shelters…</p>
     ) : filteredShelters.length ? (
      filteredShelters.map((shelter) => (
       <article key={shelter.id} className="bg-white border border-slate-200 rounded-xl p-5 space-y-3">
        <div className="flex items-start justify-between gap-3">
         <div>
          <h3 className="text-base font-bold text-slate-900">{shelter.name}</h3>
          <p className="text-sm text-slate-600 mt-1">
           {[shelter.district, shelter.safe_zone_type].filter(Boolean).join(' · ') || 'Safe zone'}
          </p>
         </div>
         <MapPin className="w-5 h-5 text-blue-700 shrink-0" />
        </div>
        {Number.isFinite(Number(shelter.capacity)) && (
         <p className="text-xs text-slate-600">Registered capacity: {shelter.capacity}</p>
        )}
        {hasCoordinates(shelter) && (
         <a
          href={`https://maps.google.com/?q=${shelter.latitude},${shelter.longitude}`}
          target="_blank"
          rel="noreferrer"
          className="inline-flex text-xs font-bold text-blue-700 hover:underline"
         >
          Get directions
         </a>
        )}
       </article>
      ))
     ) : (
      <p className="bg-white border border-slate-200 rounded-xl p-6 text-center text-sm text-slate-600">
       {searchQuery ? 'No shelters match your search.' : 'No shelters available.'}
      </p>
     )}
    </section>

    <section className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 space-y-3" aria-label="Shelter map">
     <h3 className="text-base font-bold text-slate-900">Shelter map</h3>
     <div className="h-[420px] rounded-lg overflow-hidden">
      <MapContainer center={center} zoom={mappedShelters.length ? 9 : 6} scrollWheelZoom={false} style={{ height: '100%', width: '100%' }}>
       <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
       />
       {mappedShelters.map((shelter) => (
        <Marker key={shelter.id} position={[Number(shelter.latitude), Number(shelter.longitude)]} icon={shelterIcon}>
         <Popup>{shelter.name}</Popup>
        </Marker>
       ))}
      </MapContainer>
     </div>
    </section>
   </div>
  </div>
 );
}
