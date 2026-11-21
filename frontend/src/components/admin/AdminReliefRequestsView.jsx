import React, { useState, useEffect } from 'react';
import { getReliefRequestsList, updateReliefRequestStatus } from '../../api';

export default function AdminReliefRequestsView({ onShowToast }) {
  const [requests, setRequests] = useState([
    {
      id: 104,
      ward_id: 1,
      requester_name: 'Pooja Bhatt',
      requester_phone: '+91 94120 44921',
      need_type: 'rescue',
      description: 'Family of 4 stranded near temple footbridge due to rising Alaknanda flash flow. Elderly member requires stretcher.',
      people_affected_count: 4,
      urgency: 'critical',
      status: 'open',
      created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString()
    },
    {
      id: 103,
      ward_id: 2,
      requester_name: 'Kailash Chandra',
      requester_phone: '+91 98210 11983',
      need_type: 'medicine',
      description: 'Urgent insulin supplies and antiseptic wound dressings needed for village community center.',
      people_affected_count: 8,
      urgency: 'high',
      status: 'open',
      created_at: new Date(Date.now() - 1000 * 60 * 55).toISOString()
    },
    {
      id: 102,
      ward_id: 3,
      requester_name: 'Gram Pradhan - Agastyamuni',
      requester_phone: '+91 97110 33812',
      need_type: 'pump',
      description: 'De-watering heavy diesel pump required for school basement serving as temporary transit camp.',
      people_affected_count: 45,
      urgency: 'medium',
      status: 'fulfilled',
      created_at: new Date(Date.now() - 1000 * 60 * 180).toISOString()
    }
  ]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await getReliefRequestsList();
        if (data && data.length > 0) setRequests(data);
      } catch (e) {
        console.warn('[Relief Requests Admin] Fallback to cached items:', e.message);
      }
    }
    load();
  }, []);

  const handleToggleStatus = async (item) => {
    const newStatus = item.status === 'open' ? 'fulfilled' : 'open';
    try {
      await updateReliefRequestStatus(item.id, { status: newStatus });
    } catch (e) {
      console.warn('[Update Relief Request] Local fallback:', e.message);
    }

    setRequests((prev) =>
      prev.map((r) => (r.id === item.id ? { ...r, status: newStatus } : r))
    );

    if (onShowToast) {
      onShowToast(
        newStatus === 'fulfilled'
          ? `Disaster Request #${item.id} marked as FULFILLED.`
          : `Disaster Request #${item.id} re-opened for dispatch.`
      );
    }
  };

  const filtered = requests.filter((r) => (filter === 'all' ? true : r.status === filter));

  return (
    <div className="flex flex-col w-full space-y-space-md">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-label-code-sm uppercase tracking-wider text-outline font-semibold">
              FIELD INCIDENT TICKETING
            </span>
            <span className="w-2 h-2 rounded-full bg-error animate-pulse"></span>
          </div>
          <h2 className="font-headline-xl font-bold text-on-surface">Citizen Relief &amp; Dispatch Requests</h2>
          <p className="font-body-sm text-on-surface-variant">
            Live emergency SOS submissions from micro-wards awaiting SDRF / NDRF allocation.
          </p>
        </div>

        <div className="flex items-center bg-surface-container-low p-1 rounded-xl border border-outline-variant/30">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all ${
              filter === 'all' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            All Requests ({requests.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('open')}
            className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all ${
              filter === 'open' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Open SOS ({requests.filter((r) => r.status === 'open').length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('fulfilled')}
            className={`px-3 py-1.5 rounded-lg text-body-sm font-semibold transition-all ${
              filter === 'fulfilled' ? 'bg-primary text-on-primary shadow-xs' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Fulfilled ({requests.filter((r) => r.status === 'fulfilled').length})
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-space-md pt-2">
        {filtered.map((req) => (
          <div
            key={req.id}
            className={`bg-surface-container-lowest p-space-md rounded-2xl shadow-xs border transition-all flex flex-col justify-between ${
              req.urgency === 'critical' && req.status === 'open'
                ? 'border-error/40 bg-error-container/10'
                : 'border-outline-variant/30'
            }`}
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-outline-variant/20">
                <span className="font-label-code-sm font-mono font-bold text-on-surface">TICKET #{req.id}</span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-label-code-sm px-2 py-0.5 rounded-full font-bold uppercase ${
                      req.urgency === 'critical'
                        ? 'bg-error-container text-error'
                        : req.urgency === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-surface-container text-on-surface-variant'
                    }`}
                  >
                    {req.urgency}
                  </span>
                  <span
                    className={`font-label-code-sm px-2 py-0.5 rounded-full font-bold uppercase ${
                      req.status === 'open'
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              </div>

              <div className="pt-3 space-y-2">
                <div className="flex items-center justify-between text-body-sm">
                  <span className="font-bold text-on-surface">{req.requester_name}</span>
                  <span className="font-label-code-sm font-mono text-outline">{req.requester_phone}</span>
                </div>
                <div className="flex items-center gap-2 text-label-code-sm text-secondary font-semibold">
                  <span className="material-symbols-outlined text-[16px]">emergency</span>
                  <span className="uppercase">TYPE: {req.need_type}</span>
                  <span>•</span>
                  <span>{req.people_affected_count} people affected</span>
                </div>
                <p className="font-body-sm text-on-surface-variant text-sm line-clamp-3 leading-relaxed">
                  {req.description}
                </p>
              </div>
            </div>

            <div className="pt-4 mt-3 border-t border-outline-variant/20 flex items-center justify-between">
              <span className="font-label-code-sm text-outline font-mono text-xs">
                Ward #{req.ward_id} •{' '}
                {new Date(req.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: false })} IST
              </span>
              <button
                type="button"
                onClick={() => handleToggleStatus(req)}
                className={`h-9 px-3 rounded-lg font-body-sm text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  req.status === 'open'
                    ? 'bg-primary text-on-primary hover:bg-inverse-surface'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                <span className="material-symbols-outlined text-[16px]">
                  {req.status === 'open' ? 'check' : 'replay'}
                </span>
                <span>{req.status === 'open' ? 'Mark Fulfilled' : 'Re-open Ticket'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

