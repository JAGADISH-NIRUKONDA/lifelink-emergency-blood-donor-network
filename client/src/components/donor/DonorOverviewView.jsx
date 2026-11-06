import React from 'react';
import {
  Heart,
  Droplet,
  Clock,
  ArrowRight,
  ShieldCheck,
  MapPin,
  Flame,
  UserCheck,
  PauseCircle,
  PlayCircle,
  Info
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../bloodRequests/StatusBadge';

export default function DonorOverviewView({
  donor = {},
  dashboardData = {},
  onNavigateTab,
  onQuickToggleAvailability
}) {
  const overview = dashboardData.overview || {};
  const metrics = dashboardData.metrics || {};
  const eligibility = dashboardData.eligibility || {};
  const recentRequests = dashboardData.recentNearbyRequests || [];
  const recentDonations = dashboardData.recentDonations || [];

  const totalDonations = metrics.totalDonations ?? overview.totalDonations ?? 0;
  const livesSaved = metrics.livesSavedEstimate ?? (totalDonations * 3);
  const profileCompletion = overview.profileCompletion ?? 75;
  const isAvailable = overview.isAvailable ?? true;
  const availabilityStatus = overview.availabilityStatus || (isAvailable ? 'AVAILABLE' : 'UNAVAILABLE');

  return (
    <div className="space-y-6">
      {/* 1. Donor Hero Greeting & Quick Availability Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-12 -translate-y-8 w-64 h-64 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#B91C35] to-red-700 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-red-900/30 shrink-0">
              {donor.bloodGroup || overview.bloodGroup || 'O+'}
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                  Welcome back, {donor.name || overview.name || 'Hero Donor'}
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Verified Donor
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Universal or matched voluntary blood donors are the foundation of emergency surgical and trauma care.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 self-start md:self-center bg-slate-800/80 p-2 rounded-2xl border border-slate-700">
            <div className="px-3 text-right">
              <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                Availability
              </span>
              <span className={`text-xs font-black ${isAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
                {availabilityStatus}
              </span>
            </div>
            <button
              onClick={() => onQuickToggleAvailability && onQuickToggleAvailability(!isAvailable)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer shadow-xs ${
                isAvailable
                  ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 font-black'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              {isAvailable ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
              <span>{isAvailable ? 'Pause' : 'Resume'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Metric KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C35] flex items-center justify-center font-bold shrink-0">
            <Droplet className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {totalDonations}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Verified Donations
            </span>
            <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
              100% authenticated
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold shrink-0">
            <Heart className="w-6 h-6 fill-current" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              ~{livesSaved}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Lives Impacted
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              3 lives per whole blood unit
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold shrink-0">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {profileCompletion}%
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Profile Completeness
            </span>
            <button
              onClick={() => onNavigateTab && onNavigateTab('PROFILE')}
              className="text-[11px] text-purple-700 font-bold hover:underline block mt-0.5"
            >
              Complete credentials →
            </button>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {eligibility.daysUntilEligible > 0 ? `${eligibility.daysUntilEligible}d` : 'Eligible'}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Clinical Assessment
            </span>
            <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
              56-day standard cycle
            </span>
          </div>
        </div>
      </div>

      {/* 3. Operational Hub: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Relevant Nearby Blood Requests */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Flame size={18} className="text-[#B91C35]" />
                <span>Compatible Inbound Blood Requests</span>
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Active clinical requisitions compatible with your biological blood type
              </p>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('REQUESTS')}
              className="text-xs font-bold text-[#B91C35] hover:text-red-700 flex items-center gap-1"
            >
              <span>Explore All</span>
              <ArrowRight size={13} />
            </button>
          </div>

          {recentRequests.length === 0 ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              No matching urgent blood requisitions currently in your region.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentRequests.slice(0, 3).map((r) => (
                <div
                  key={r._id || r.requestId}
                  className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/60 rounded-2xl px-2 transition"
                >
                  <div className="flex items-center gap-3.5">
                    <span className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C35] font-black text-sm flex items-center justify-center border border-red-200 shrink-0">
                      {r.bloodGroup}
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-slate-900">{r.patientName}</span>
                        <PriorityBadge priority={r.priority} />
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                        <span className="flex items-center gap-1">
                          <MapPin size={11} /> {r.hospital} ({r.city})
                        </span>
                        <span>•</span>
                        <span>{r.unitsRequired} {r.unitsRequired > 1 ? 'Units' : 'Unit'} needed</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <StatusBadge status={r.status} />
                    <button
                      onClick={() => onNavigateTab && onNavigateTab('REQUESTS')}
                      className="px-3.5 py-1.5 rounded-xl bg-[#B91C35] hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
                    >
                      Respond
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: Recent Verified Donation Activity */}
        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs p-6 space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShieldCheck size={18} className="text-emerald-600" />
                  <span>Donation Activity</span>
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verified clinical transfusion center records
                </p>
              </div>
              <button
                onClick={() => onNavigateTab && onNavigateTab('HISTORY')}
                className="text-xs font-bold text-[#B91C35] hover:text-red-700 flex items-center gap-1"
              >
                <span>History</span>
                <ArrowRight size={13} />
              </button>
            </div>

            {recentDonations.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No past donations recorded yet. Complete an emergency response to log your first verified donation.
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {recentDonations.slice(0, 3).map((d) => (
                  <div
                    key={d._id || d.certificateNumber}
                    className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1"
                  >
                    <div className="flex items-center justify-between font-bold text-slate-800">
                      <span>{d.hospitalName}</span>
                      <span className="text-[#B91C35] font-black">{d.bloodGroup}</span>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-slate-500">
                      <span>{d.units} unit ({d.componentType || 'Whole Blood'})</span>
                      <span>{new Date(d.donationDate).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab && onNavigateTab('ANALYTICS')}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition flex items-center justify-center gap-2"
            >
              <span>View Lifetime Contribution Analytics</span>
              <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </div>

      {/* 4. Clinical Safety Advisory Banner */}
      <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-300 flex items-start gap-3.5 text-xs text-amber-950">
        <Info size={18} className="text-amber-700 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong>Clinical Safety Advisory:</strong> Digital availability and eligibility calculations represent preliminary informational screening tools only. Final medical eligibility, serological screening, and hemoglobin qualification are verified in person by licensed clinical staff at the transfusion center.
        </p>
      </div>
    </div>
  );
}
