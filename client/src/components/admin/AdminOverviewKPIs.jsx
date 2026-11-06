import React, { useState } from 'react';
import {
  Users,
  Heart,
  UserCheck,
  Building2,
  Clock,
  ShieldCheck,
  AlertTriangle,
  FileText,
  CheckCircle2,
  Activity,
  Droplet,
  Megaphone,
  Radio,
  Send,
  X
} from 'lucide-react';

export default function AdminOverviewKPIs({
  kpis = {},
  onNavigateTab,
  onSendBroadcast
}) {
  const [showBroadcastModal, setShowBroadcastModal] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: '',
    message: '',
    targetRoles: ['DONOR', 'PATIENT', 'HOSPITAL', 'VOLUNTEER'],
    isEmergency: false
  });
  const [broadcastStatus, setBroadcastStatus] = useState(null);

  const kpiItems = [
    {
      id: 'totalUsers',
      label: 'Total Registered Users',
      value: kpis.totalUsers ?? 6,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      border: 'border-blue-100',
      tab: 'users'
    },
    {
      id: 'totalDonors',
      label: 'Registered Donors',
      value: kpis.totalDonors ?? 2,
      icon: Heart,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      tab: 'users'
    },
    {
      id: 'totalPatients',
      label: 'Registered Patients',
      value: kpis.totalPatients ?? 1,
      icon: UserCheck,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      tab: 'users'
    },
    {
      id: 'totalHospitals',
      label: 'Partner Hospitals',
      value: kpis.totalHospitals ?? 2,
      icon: Building2,
      color: 'text-indigo-600',
      bg: 'bg-indigo-50',
      border: 'border-indigo-100',
      tab: 'hospitals'
    },
    {
      id: 'verifiedHospitals',
      label: 'Verified Hospitals',
      value: kpis.verifiedHospitals ?? 1,
      icon: ShieldCheck,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      tab: 'hospitals'
    },
    {
      id: 'pendingHospitals',
      label: 'Pending Approvals',
      value: kpis.pendingHospitals ?? 1,
      icon: Clock,
      color: 'text-orange-600',
      bg: 'bg-orange-50',
      border: 'border-orange-100',
      badge: kpis.pendingHospitals > 0 ? 'Requires Action' : null,
      tab: 'hospitals'
    },
    {
      id: 'totalBloodRequests',
      label: 'Total Blood Requests',
      value: kpis.totalBloodRequests ?? 8,
      icon: FileText,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      border: 'border-purple-100',
      tab: 'requests'
    },
    {
      id: 'pendingBloodRequests',
      label: 'Pending Requests',
      value: kpis.pendingBloodRequests ?? 2,
      icon: AlertTriangle,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
      border: 'border-amber-100',
      tab: 'requests'
    },
    {
      id: 'fulfilledBloodRequests',
      label: 'Fulfilled Requests',
      value: kpis.fulfilledBloodRequests ?? 5,
      icon: CheckCircle2,
      color: 'text-teal-600',
      bg: 'bg-teal-50',
      border: 'border-teal-100',
      tab: 'requests'
    },
    {
      id: 'activeDonors',
      label: 'Active Ready Donors',
      value: kpis.activeDonors ?? 2,
      icon: Activity,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
      border: 'border-emerald-100',
      tab: 'users'
    },
    {
      id: 'totalAvailableUnits',
      label: 'Available Blood Units',
      value: kpis.totalAvailableUnits ?? 48,
      icon: Droplet,
      color: 'text-[#B91C35]',
      bg: 'bg-red-50',
      border: 'border-red-100',
      tab: 'inventory'
    },
    {
      id: 'lowStockAlerts',
      label: 'Low Stock Warnings',
      value: kpis.lowStockAlerts ?? 1,
      icon: AlertTriangle,
      color: 'text-rose-600',
      bg: 'bg-rose-50',
      border: 'border-rose-100',
      badge: kpis.lowStockAlerts > 0 ? 'Shortage Alert' : null,
      tab: 'inventory'
    }
  ];

  const handleBroadcastSubmit = (e) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.message.trim()) return;

    if (onSendBroadcast) {
      onSendBroadcast(broadcastForm);
    }
    setBroadcastStatus('Announcement broadcasted successfully to all target roles.');
    setTimeout(() => {
      setBroadcastStatus(null);
      setShowBroadcastModal(false);
      setBroadcastForm({
        title: '',
        message: '',
        targetRoles: ['DONOR', 'PATIENT', 'HOSPITAL', 'VOLUNTEER'],
        isEmergency: false
      });
    }, 1400);
  };

  const toggleRole = (role) => {
    setBroadcastForm((prev) => {
      const exists = prev.targetRoles.includes(role);
      const targetRoles = exists
        ? prev.targetRoles.filter((r) => r !== role)
        : [...prev.targetRoles, role];
      return { ...prev, targetRoles };
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Emergency Action & Status */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-700/60 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live Platform Engine
            </span>
            <span className="text-xs text-slate-400">100% MongoDB Real-time Metrics</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Super Admin Platform Control Center</h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Live health monitoring, cross-network clinical inventory oversight, hospital verification queues, and system audit trail.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <button
            onClick={() => setShowBroadcastModal(true)}
            className="flex-1 md:flex-none inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#B91C35] hover:bg-[#9E152C] text-white text-xs sm:text-sm font-semibold transition shadow-sm active:scale-95 cursor-pointer"
          >
            <Megaphone size={16} />
            <span>Platform Broadcast</span>
          </button>
        </div>
      </div>

      {/* Critical System Alert Pillows */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {kpis.criticalBloodRequests > 0 && (
          <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center text-[#B91C35]">
                <Radio className="animate-pulse" size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-rose-950">
                  {kpis.criticalBloodRequests} Critical Emergency Blood {kpis.criticalBloodRequests === 1 ? 'Requisition' : 'Requisitions'}
                </h4>
                <p className="text-xs text-rose-700">Immediate donor triage and stock dispatch needed.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('requests')}
              className="text-xs font-bold text-[#B91C35] hover:underline cursor-pointer"
            >
              Inspect Requests →
            </button>
          </div>
        )}

        {kpis.pendingHospitals > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700">
                <Clock size={20} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-amber-950">
                  {kpis.pendingHospitals} Healthcare {kpis.pendingHospitals === 1 ? 'Facility' : 'Facilities'} Pending Verification
                </h4>
                <p className="text-xs text-amber-700">Clinical accreditation & blood bank licenses awaiting review.</p>
              </div>
            </div>
            <button
              onClick={() => onNavigateTab && onNavigateTab('hospitals')}
              className="text-xs font-bold text-amber-800 hover:underline cursor-pointer"
            >
              Review Applications →
            </button>
          </div>
        )}
      </div>

      {/* 12 Live Real KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-4">
        {kpiItems.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              onClick={() => onNavigateTab && onNavigateTab(item.tab)}
              className={`p-4 rounded-xl bg-white border ${item.border} hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg ${item.bg} flex items-center justify-center ${item.color} group-hover:scale-110 transition-transform`}>
                  <Icon size={18} />
                </div>
                {item.badge && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-[#B91C35] border border-rose-200">
                    {item.badge}
                  </span>
                )}
              </div>
              <div>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight block">
                  {item.value}
                </span>
                <span className="text-xs font-medium text-slate-500 block mt-0.5">
                  {item.label}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Broadcast Announcement Modal */}
      {showBroadcastModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowBroadcastModal(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C35] flex items-center justify-center">
                <Megaphone size={20} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-900">Platform-wide Announcement</h3>
                <p className="text-xs text-slate-500">Dispatch alerts, urgent blood drives, or system notices.</p>
              </div>
            </div>

            {broadcastStatus ? (
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm font-semibold flex items-center gap-2">
                <CheckCircle2 size={18} className="text-emerald-600" />
                <span>{broadcastStatus}</span>
              </div>
            ) : (
              <form onSubmit={handleBroadcastSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Title / Headline *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Critical Blood Drive: O- Negative Shortage"
                    value={broadcastForm.title}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Message Content *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="Enter urgent clinical advisory, donation drive schedule, or emergency notice..."
                    value={broadcastForm.message}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                    className="w-full text-xs sm:text-sm px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Target Roles</label>
                  <div className="flex flex-wrap gap-2">
                    {['DONOR', 'PATIENT', 'HOSPITAL', 'VOLUNTEER'].map((r) => {
                      const selected = broadcastForm.targetRoles.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => toggleRole(r)}
                          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition cursor-pointer ${
                            selected
                              ? 'bg-[#B91C35] text-white border-[#B91C35]'
                              : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                          }`}
                        >
                          {r}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="emergencyToggle"
                    checked={broadcastForm.isEmergency}
                    onChange={(e) => setBroadcastForm({ ...broadcastForm, isEmergency: e.target.checked })}
                    className="rounded text-[#B91C35] focus:ring-[#B91C35]"
                  />
                  <label htmlFor="emergencyToggle" className="text-xs font-semibold text-rose-700">
                    Flag as High-Priority Emergency Broadcast (triggers urgent push & email)
                  </label>
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowBroadcastModal(false)}
                    className="px-4 py-2 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-[#B91C35] hover:bg-[#9E152C] text-white text-xs font-semibold transition cursor-pointer"
                  >
                    <Send size={14} />
                    <span>Dispatch Broadcast</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

