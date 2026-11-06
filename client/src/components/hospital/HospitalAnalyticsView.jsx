import React from 'react';
import {
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

const DEMO_GROUP_STATS = [
  { group: 'O+', percentage: 38, count: 48, demand: 'High' },
  { group: 'A+', percentage: 28, count: 35, demand: 'High' },
  { group: 'B+', percentage: 18, count: 22, demand: 'Medium' },
  { group: 'O-', percentage: 7, count: 9, demand: 'Critical' },
  { group: 'A-', percentage: 4, count: 5, demand: 'Selective' },
  { group: 'AB+', percentage: 3, count: 4, demand: 'Regular' },
  { group: 'B-', percentage: 1.5, count: 2, demand: 'Rare' },
  { group: 'AB-', percentage: 0.5, count: 1, demand: 'Rare' }
];

export default function HospitalAnalyticsView({
  stats: _stats = {},
  analytics: _analytics = {}
}) {
  return (
    <div className="space-y-6">
      {/* Top Analytical KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Monthly Transfusions
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">126</span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            ↑ 14% from previous clinical cycle
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Crossmatch Speed
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Activity size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">42 min</span>
          <span className="text-[11px] text-purple-600 font-semibold mt-1 block">
            Within 60-min emergency benchmark
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fulfillment Efficiency
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">94.8%</span>
          <span className="text-[11px] text-blue-600 font-semibold mt-1 block">
            Approved requisitions completed
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Wastage / Expiry Rate
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldCheck size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">0.8%</span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1 block">
            Well below standard 2.0% threshold
          </span>
        </div>
      </div>

      {/* Blood Group Distribution & Clinical Consumption Breakdown */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h4 className="font-bold text-base text-slate-900">
              Blood Group Transfusion Demand & Distribution
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Relative utilization pattern across institutional surgical and emergency wards
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
            Active 30-Day Analysis
          </span>
        </div>

        <div className="space-y-3.5 pt-2">
          {DEMO_GROUP_STATS.map((item) => (
            <div key={item.group} className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#B91C35] text-sm w-8">{item.group}</span>
                  <span className="text-slate-500 text-[11px]">Demand: {item.demand}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-800">{item.count} Units Transfused</span>
                  <span className="text-slate-400 font-medium">({item.percentage}%)</span>
                </div>
              </div>

              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#B91C35] transition-all duration-700"
                  style={{ width: `${item.percentage * 2.2}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
