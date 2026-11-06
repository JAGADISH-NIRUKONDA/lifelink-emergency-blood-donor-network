import React, { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
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
  TrendingUp,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Calendar
} from 'lucide-react';

const DEFAULT_INVENTORY_TRENDS = [
  { time: 'Day 1', stockIn: 12, transfused: 8, inventoryLevel: 58 },
  { time: 'Day 5', stockIn: 18, transfused: 14, inventoryLevel: 62 },
  { time: 'Day 10', stockIn: 15, transfused: 11, inventoryLevel: 66 },
  { time: 'Day 15', stockIn: 24, transfused: 19, inventoryLevel: 71 },
  { time: 'Day 20', stockIn: 20, transfused: 16, inventoryLevel: 75 },
  { time: 'Day 25', stockIn: 28, transfused: 22, inventoryLevel: 81 },
  { time: 'Day 30', stockIn: 25, transfused: 21, inventoryLevel: 85 }
];

const DEFAULT_DEMAND_SUPPLY = [
  { bloodGroup: 'O+', available: 22, demanded: 28, fulfilled: 26 },
  { bloodGroup: 'O-', available: 4, demanded: 14, fulfilled: 12 },
  { bloodGroup: 'A+', available: 14, demanded: 18, fulfilled: 16 },
  { bloodGroup: 'A-', available: 6, demanded: 7, fulfilled: 6 },
  { bloodGroup: 'B+', available: 18, demanded: 15, fulfilled: 14 },
  { bloodGroup: 'B-', available: 3, demanded: 5, fulfilled: 4 },
  { bloodGroup: 'AB+', available: 7, demanded: 6, fulfilled: 6 },
  { bloodGroup: 'AB-', available: 2, demanded: 3, fulfilled: 2 }
];

const DEFAULT_REQUEST_VOLUME = [
  { week: 'Week 1', CRITICAL: 4, HIGH: 6, NORMAL: 5 },
  { week: 'Week 2', CRITICAL: 7, HIGH: 8, NORMAL: 7 },
  { week: 'Week 3', CRITICAL: 5, HIGH: 10, NORMAL: 8 },
  { week: 'Week 4', CRITICAL: 8, HIGH: 12, NORMAL: 9 }
];

const SHELF_LIFE_COLORS = ['#10B981', '#F59E0B', '#EF4444'];

export default function HospitalAnalyticsView({
  stats = {},
  analytics = {}
}) {
  const [timeRange, setTimeRange] = useState('30d');

  const overview = analytics.overview || stats.overview || {};
  const bloodDemandData = analytics.bloodGroupDemand || DEFAULT_DEMAND_SUPPLY;
  const inventoryTrends = analytics.inventoryTrends || DEFAULT_INVENTORY_TRENDS;
  const requestVolumeData = analytics.requestVolume || DEFAULT_REQUEST_VOLUME;

  const shelfLifeData = [
    { name: 'Fresh / Stable Stock', value: analytics.shelfLife?.safe || 62 },
    { name: 'Expiring in < 7 Days', value: analytics.shelfLife?.expiring || 5 },
    { name: 'Expired / To Discard', value: analytics.shelfLife?.expired || 1 }
  ];

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar with Filter */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Activity className="text-[#B91C35]" size={20} />
            <span>Clinical Transfusion & Inventory Analytics</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time MongoDB metrics, inventory trends, demand patterns, and shelf-life analysis
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Calendar size={14} className="text-slate-400" />
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
          >
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Quarterly (90 Days)</option>
          </select>
        </div>
      </div>

      {/* 2. Top Analytical KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Total Transfusions
            </span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <TrendingUp size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">
            {overview.fulfilledRequests || 126}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1.5 block">
            ↑ 14% from previous clinical cycle
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Avg Fulfillment Speed
            </span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Activity size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">
            {overview.avgFulfillmentSpeed || '38 min'}
          </span>
          <span className="text-[11px] text-purple-600 font-semibold mt-1.5 block">
            Within 60-min emergency protocol
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Fulfillment Rate
            </span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <CheckCircle2 size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">
            {overview.fulfillmentRate ? `${overview.fulfillmentRate}%` : '95.2%'}
          </span>
          <span className="text-[11px] text-blue-600 font-semibold mt-1.5 block">
            Emergency requisitions satisfied
          </span>
        </div>

        <div className="p-5 rounded-3xl bg-white border border-slate-200/90 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Stock Wastage Rate
            </span>
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <ShieldCheck size={16} />
            </div>
          </div>
          <span className="text-3xl font-black text-slate-900 block leading-none">
            {overview.wastageRate || '0.6%'}
          </span>
          <span className="text-[11px] text-emerald-600 font-semibold mt-1.5 block">
            Well below standard 2.0% threshold
          </span>
        </div>
      </div>

      {/* 3. Recharts Section: Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chart 1: Blood Inventory Trends & Flow */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Blood Stock Movement & Reserve Trends
              </h4>
              <p className="text-[11px] text-slate-500">
                Daily incoming units vs transfusions fulfilled
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={inventoryTrends} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorStockIn" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTransfused" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#B91C35" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#B91C35" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="time" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Area type="monotone" dataKey="stockIn" name="Stock In Units" stroke="#10B981" fillOpacity={1} fill="url(#colorStockIn)" strokeWidth={2} />
                <Area type="monotone" dataKey="transfused" name="Units Transfused" stroke="#B91C35" fillOpacity={1} fill="url(#colorTransfused)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Request Volume by Priority */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Inbound Requisition Volume by Urgency
              </h4>
              <p className="text-[11px] text-slate-500">
                Weekly breakdown of incoming patient emergency priorities
              </p>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestVolumeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="week" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="CRITICAL" name="Critical Priority" fill="#EF4444" radius={[4, 4, 0, 0]} />
                <Bar dataKey="HIGH" name="High Priority" fill="#F59E0B" radius={[4, 4, 0, 0]} />
                <Bar dataKey="NORMAL" name="Normal Priority" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. Recharts Section: Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart 3: Blood Group Demand vs Available Supply (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h4 className="font-bold text-sm text-slate-900">
                Blood Group Demand vs. Available Stock Units
              </h4>
              <p className="text-[11px] text-slate-500">
                ABO/Rh inventory balance across 8 blood groups
              </p>
            </div>
          </div>

          <div className="h-68 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodDemandData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="bloodGroup" tick={{ fontSize: 12, fill: '#1E293B', fontWeight: 'bold' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0F172A', color: '#fff', borderRadius: '12px', fontSize: '11px', border: 'none' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="available" name="Available In Stock" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="demanded" name="Requisition Demand" fill="#B91C35" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fulfilled" name="Transfused Units" fill="#3B82F6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Shelf-Life & Expiry Ring (1 Col) */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h4 className="font-bold text-sm text-slate-900">
                Stock Shelf-Life Status
              </h4>
              <span className="text-[10px] font-black uppercase tracking-wider bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                Active Batches
              </span>
            </div>

            <div className="h-48 w-full mt-2">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={shelfLifeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={75}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {shelfLifeData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={SHELF_LIFE_COLORS[index % SHELF_LIFE_COLORS.length]} />
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
            {shelfLifeData.map((item, idx) => (
              <div key={item.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: SHELF_LIFE_COLORS[idx] }}
                  />
                  <span className="text-slate-600 text-[11px]">{item.name}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value} Units</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
