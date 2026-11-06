import React, { useState } from 'react';
import {
  Flame,
  Activity,
  Droplet,
  CheckCheck,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  ShieldAlert,
  Package,
  Inbox,
  UserCheck,
  Building2
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../bloodRequests/StatusBadge';

export default function HospitalOverviewView({
  hospital = {},
  requests = [],
  inventory = [],
  batches = [],
  recentTransactions = [],
  onNavigateTab
}) {
  const isVerified = hospital.hospitalDetails?.isVerified ?? hospital.isVerified ?? false;
  const verificationStatus = hospital.hospitalDetails?.verificationStatus ?? hospital.verificationStatus ?? 'PENDING';

  const totalRequests = requests.length;
  const pendingRequests = requests.filter((r) => r.status === 'PENDING').length;
  const acceptedRequests = requests.filter((r) => ['APPROVED', 'MATCHED'].includes(r.status)).length;
  const fulfilledRequests = requests.filter((r) => r.status === 'FULFILLED').length;
  const criticalRequests = requests.filter((r) => r.priority === 'CRITICAL' && !['FULFILLED', 'REJECTED', 'CANCELLED'].includes(r.status)).length;

  const totalAvailableUnits = inventory.reduce((acc, curr) => acc + (curr.unitsAvailable || 0), 0);
  const lowStockCount = inventory.filter((i) => (i.unitsAvailable || 0) <= (i.lowStockThreshold || 5)).length;

  // Filter expiring batches (< 7 days)
  const [now] = useState(() => Date.now());
  const expiringBatches = batches.filter((b) => {
    if (b.status === 'DISCARDED' || b.status === 'TRANSFUSED') return false;
    const diffDays = (new Date(b.expiryDate).getTime() - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  });

  const expiredBatches = batches.filter((b) => {
    if (b.status === 'DISCARDED' || b.status === 'TRANSFUSED') return false;
    return new Date(b.expiryDate).getTime() < now;
  });

  const recentPendingRequests = requests
    .filter((r) => !['FULFILLED', 'REJECTED', 'CANCELLED'].includes(r.status))
    .slice(0, 4);

  return (
    <div className="space-y-6">
      {/* 1. Verification Accreditation Banner */}
      {isVerified ? (
        <div className="p-4 sm:p-5 rounded-3xl bg-emerald-500/10 border border-emerald-500/25 flex items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-emerald-950">
                  Accredited Clinical Transfusion Center
                </h4>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-200 text-emerald-900">
                  Verified
                </span>
              </div>
              <p className="text-xs text-emerald-800/90 mt-0.5">
                License validated. Full operational authority active for blood requisition processing, live donor outreach, and stock dispensation.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('PROFILE')}
            className="text-xs font-bold text-emerald-800 hover:text-emerald-950 bg-white/80 hover:bg-white px-3.5 py-2 rounded-xl transition shadow-2xs whitespace-nowrap hidden sm:inline-flex items-center gap-1.5"
          >
            <Building2 size={13} />
            <span>Facility Details</span>
          </button>
        </div>
      ) : (
        <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs mt-0.5">
              <ShieldAlert size={22} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-bold text-amber-950">
                  Hospital Verification Pending Review
                </h4>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-200 text-amber-900">
                  {verificationStatus}
                </span>
              </div>
              <p className="text-xs text-amber-900/90 mt-1 leading-relaxed max-w-2xl">
                Your medical center registration is currently undergoing verification by LifeLink Super Administrators.
                Requisitions and live platform metrics are accessible in <strong>Read-Only Mode</strong>. Mutation operations
                (approving requisitions, adding batches, inventory stock-out, and donor outreach) will unlock immediately once accredited.
              </p>
            </div>
          </div>
          <button
            onClick={() => onNavigateTab && onNavigateTab('PROFILE')}
            className="text-xs font-bold text-amber-900 bg-white hover:bg-amber-100/60 px-4 py-2.5 rounded-xl border border-amber-300 transition shadow-2xs whitespace-nowrap shrink-0 hidden md:inline-flex items-center gap-1.5"
          >
            <span>Update Documentation</span>
            <ArrowRight size={13} />
          </button>
        </div>
      )}

      {/* 2. Top Metric KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center font-bold shrink-0">
            <Flame className="w-6 h-6 text-[#B91C35]" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {criticalRequests}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Critical Requisitions
            </span>
            <span className="text-[11px] text-red-600 font-bold block mt-0.5">
              {pendingRequests} pending triage
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {acceptedRequests}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Active In-Process
            </span>
            <span className="text-[11px] text-purple-700 font-bold block mt-0.5">
              {totalRequests} total lifecycle
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {fulfilledRequests}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Transfusions Fulfilled
            </span>
            <span className="text-[11px] text-emerald-700 font-bold block mt-0.5">
              {totalRequests > 0 ? `${Math.round((fulfilledRequests / totalRequests) * 100)}% rate` : '100% rate'}
            </span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-100 text-rose-700 flex items-center justify-center font-bold shrink-0">
            <Droplet className="w-6 h-6 text-[#B91C35] fill-current" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {totalAvailableUnits}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Units in Blood Bank
            </span>
            <span className="text-[11px] text-amber-600 font-bold block mt-0.5">
              {lowStockCount > 0 ? `${lowStockCount} blood types low` : 'Adequate reserves'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Expiring Blood Stock Alerts (if any) */}
      {(expiringBatches.length > 0 || expiredBatches.length > 0) && (
        <div className="bg-amber-500/10 border border-amber-300 rounded-3xl p-5">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="text-amber-600" size={18} />
              <h4 className="text-sm font-bold text-amber-950">
                Blood Unit Shelf-Life Alerts ({expiringBatches.length + expiredBatches.length} Batches)
              </h4>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('INVENTORY')}
              className="text-xs font-bold text-amber-900 hover:text-amber-950 underline flex items-center gap-1"
            >
              <span>Manage in Inventory</span>
              <ArrowRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {expiredBatches.map((b) => (
              <div
                key={b.batchNumber || b._id}
                className="bg-white/90 p-3 rounded-2xl border border-red-300 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-mono font-bold text-red-700 block">
                    {b.batchNumber}
                  </span>
                  <span className="text-slate-600">
                    Group: <strong className="text-slate-900 font-black">{b.bloodGroup}</strong> ({b.remainingUnits || b.units} units)
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-800">
                  EXPIRED
                </span>
              </div>
            ))}
            {expiringBatches.map((b) => {
              const diffDays = Math.ceil((new Date(b.expiryDate).getTime() - now) / (1000 * 3600 * 24));
              return (
                <div
                  key={b.batchNumber || b._id}
                  className="bg-white/90 p-3 rounded-2xl border border-amber-200 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-mono font-bold text-slate-800 block">
                      {b.batchNumber}
                    </span>
                    <span className="text-slate-600">
                      Group: <strong className="text-slate-900 font-black">{b.bloodGroup}</strong> ({b.remainingUnits || b.units} units)
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800">
                    Expires in {diffDays}d
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 4. Two-Column Operational Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Urgent Inbound Requisitions */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Inbox size={18} className="text-[#B91C35]" />
                <span>Urgent Inbound Requisitions</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active emergency requisitions awaiting triage or active crossmatching
              </p>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('REQUESTS')}
              className="text-xs font-bold text-[#B91C35] hover:text-red-700 flex items-center gap-1"
            >
              <span>View All ({requests.length})</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {recentPendingRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No active pending requisitions at this moment.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentPendingRequests.map((r) => (
                <div
                  key={r._id || r.requestId}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C35] font-black text-sm flex items-center justify-center border border-red-200 shrink-0">
                      {r.bloodGroup}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{r.patientName}</span>
                        <PriorityBadge priority={r.priority} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {r.unitsRequired} {r.unitsRequired > 1 ? 'units' : 'unit'} needed • Requisition: <span className="font-mono">{r.requestId || 'BLR-N/A'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={r.status} />
                    <button
                      onClick={() => onNavigateTab && onNavigateTab('REQUESTS')}
                      className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition"
                    >
                      Process
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Blood Bank Stock Snapshot */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Package size={18} className="text-[#B91C35]" />
                <span>Stock Balance</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                8 ABO/Rh blood groups reserve
              </p>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('INVENTORY')}
              className="text-xs font-bold text-[#B91C35] hover:text-red-700 flex items-center gap-1"
            >
              <span>Manage</span>
              <ArrowRight size={12} />
            </button>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((bg) => {
              const item = inventory.find((i) => i.bloodGroup === bg) || { unitsAvailable: 0, lowStockThreshold: 5 };
              const isLow = (item.unitsAvailable || 0) <= (item.lowStockThreshold || 5);
              return (
                <div
                  key={bg}
                  className={`p-3 rounded-2xl border text-xs flex items-center justify-between ${
                    isLow ? 'bg-amber-50/60 border-amber-200' : 'bg-slate-50/70 border-slate-200/80'
                  }`}
                >
                  <span className="font-black text-sm text-[#B91C35]">{bg}</span>
                  <div className="text-right">
                    <span className="font-black text-slate-900 block leading-tight">
                      {item.unitsAvailable || 0}
                    </span>
                    <span className={`text-[10px] font-bold ${isLow ? 'text-amber-700' : 'text-slate-400'}`}>
                      {isLow ? 'Low Stock' : 'Units'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-2">
            <button
              onClick={() => onNavigateTab && onNavigateTab('COORDINATION')}
              className="w-full py-2.5 px-4 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 text-xs font-bold flex items-center justify-center gap-2 transition"
            >
              <UserCheck size={14} />
              <span>Launch Donor Outreach</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Recent Activity Stream */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Clock size={18} className="text-slate-700" />
            <span>Recent Institutional Activity</span>
          </h3>
          <span className="text-xs text-slate-400 font-medium">
            Live audit recorded in MongoDB
          </span>
        </div>

        {recentTransactions.length === 0 ? (
          <div className="py-6 text-center text-slate-400 text-xs">
            No recent inventory stock movements recorded yet.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recentTransactions.slice(0, 6).map((tx, idx) => (
              <div
                key={tx._id || idx}
                className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1.5"
              >
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                    tx.transactionType === 'STOCK_IN'
                      ? 'bg-emerald-100 text-emerald-800'
                      : tx.transactionType === 'TRANSFUSION'
                      ? 'bg-blue-100 text-blue-800'
                      : 'bg-rose-100 text-rose-800'
                  }`}>
                    {tx.transactionType}
                  </span>
                  <span className="font-mono text-slate-400 text-[10px]">
                    {tx.createdAt ? new Date(tx.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                  </span>
                </div>
                <div className="font-bold text-slate-900">
                  {tx.units} units of {tx.bloodGroup}
                </div>
                {tx.patientName && (
                  <div className="text-slate-500 text-[11px]">
                    Patient: {tx.patientName}
                  </div>
                )}
                {tx.performedBy?.name && (
                  <div className="text-slate-400 text-[10px]">
                    Logged by {tx.performedBy.name}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
