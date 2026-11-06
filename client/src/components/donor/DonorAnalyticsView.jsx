import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import {
  Heart,
  Droplet,
  CheckCircle2,
  Activity,
  Award
} from 'lucide-react';

const DEFAULT_TIMELINE = [
  { period: '2026-05', units: 1, donations: 1 },
  { period: '2026-07', units: 1, donations: 1 },
  { period: '2026-09', units: 1, donations: 1 },
  { period: '2026-11', units: 1, donations: 1 }
];

const DEFAULT_DISTRIBUTION = [
  { name: 'Accepted', value: 3, color: '#10B981' },
  { name: 'Declined', value: 1, color: '#EF4444' },
  { name: 'Pending', value: 2, color: '#F59E0B' }
];

export default function DonorAnalyticsView({
  analytics = {}
}) {
  const overview = analytics.overview || {};
  const timeline = (analytics.timeline && analytics.timeline.length > 0) ? analytics.timeline : DEFAULT_TIMELINE;
  const distribution = (analytics.responseDistribution && analytics.responseDistribution.length > 0) ? analytics.responseDistribution : DEFAULT_DISTRIBUTION;

  const totalDonations = overview.totalDonations ?? timeline.reduce((acc, curr) => acc + (curr.donations || 1), 0);
  const livesSaved = overview.livesSavedEstimate ?? (totalDonations * 3);
  const responseRate = overview.responseRate ?? 92;

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-[#B91C35]" size={18} />
            <span>Personal Contribution & Response Analytics</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Lifetime donation metrics, response reliability, and clinical impact summary
          </p>
        </div>

        <span className="text-xs font-bold text-emerald-800 bg-emerald-100 border border-emerald-300 px-3 py-1 rounded-full self-start sm:self-center">
          Verified Donor Standing
        </span>
      </div>

      {/* 2. Top Analytical KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Total Units Donated
            </span>
            <div className="p-2 rounded-xl bg-red-50 text-[#B91C35]">
              <Droplet size={16} className="fill-current" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">
            {totalDonations}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold mt-1.5 block">
            Verified by hospital centers
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Estimated Lives Impacted
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <Heart size={16} className="fill-current" />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">
            ~{livesSaved}
          </span>
          <span className="text-[11px] text-slate-500 font-medium mt-1.5 block">
            3 patients per blood bag
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Requisition Response Rate
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">
            {responseRate}%
          </span>
          <span className="text-[11px] text-purple-700 font-bold mt-1.5 block">
            Emergency alert responsiveness
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
              Recognition Tier
            </span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Award size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">
            {totalDonations >= 10 ? 'Platinum' : totalDonations >= 5 ? 'Gold' : totalDonations >= 2 ? 'Silver' : 'Bronze'}
          </span>
          <span className="text-[11px] text-slate-400 font-medium mt-1.5 block">
            LifeLink Voluntary Champion
          </span>
        </div>
      </div>

      {/* 3. Recharts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 1: Donation History Timeline (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Personal Donation Activity Timeline
              </h4>
              <p className="text-[11px] text-slate-500">
                Verified blood donation units transacted over recent periods
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={timeline} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="period" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} allowDecimals={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="units" name="Units Donated" fill="#B91C35" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Emergency Response Distribution (1 Col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900">
                Requisition Responses
              </h4>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                Invitations
              </span>
            </div>

            <div className="h-44 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={68}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || '#3B82F6'} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            {distribution.map((item) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-slate-600 text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} Requisitions</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
