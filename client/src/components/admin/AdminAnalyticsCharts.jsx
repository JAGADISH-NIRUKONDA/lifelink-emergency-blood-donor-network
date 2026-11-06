import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
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
  Award
} from 'lucide-react';

const RANGE_OPTIONS = [
  { id: '7d', label: 'Last 7 Days' },
  { id: '30d', label: 'Last 30 Days' },
  { id: '90d', label: 'Quarter (90d)' },
  { id: 'year', label: 'Annual (1y)' }
];

const DEFAULT_REGISTRATION_DATA = [
  { date: 'Day 1', DONOR: 2, PATIENT: 1, HOSPITAL: 1, total: 4 },
  { date: 'Day 5', DONOR: 4, PATIENT: 2, HOSPITAL: 0, total: 6 },
  { date: 'Day 10', DONOR: 3, PATIENT: 3, HOSPITAL: 1, total: 7 },
  { date: 'Day 15', DONOR: 6, PATIENT: 2, HOSPITAL: 1, total: 9 },
  { date: 'Day 20', DONOR: 5, PATIENT: 4, HOSPITAL: 0, total: 9 },
  { date: 'Day 25', DONOR: 8, PATIENT: 3, HOSPITAL: 2, total: 13 },
  { date: 'Day 30', DONOR: 10, PATIENT: 5, HOSPITAL: 1, total: 16 }
];

const DEFAULT_REQUEST_TRENDS = [
  { date: 'Week 1', totalRequests: 8, fulfilled: 6, critical: 2 },
  { date: 'Week 2', totalRequests: 14, fulfilled: 12, critical: 4 },
  { date: 'Week 3', totalRequests: 11, fulfilled: 9, critical: 3 },
  { date: 'Week 4', totalRequests: 19, fulfilled: 17, critical: 6 }
];

const DEFAULT_BLOOD_GROUPS = [
  { bloodGroup: 'A+', donors: 18, requests: 12, stockAvailable: 15 },
  { bloodGroup: 'A-', donors: 7, requests: 5, stockAvailable: 6 },
  { bloodGroup: 'B+', donors: 22, requests: 16, stockAvailable: 18 },
  { bloodGroup: 'B-', donors: 6, requests: 4, stockAvailable: 5 },
  { bloodGroup: 'AB+', donors: 9, requests: 6, stockAvailable: 8 },
  { bloodGroup: 'AB-', donors: 4, requests: 3, stockAvailable: 3 },
  { bloodGroup: 'O+', donors: 28, requests: 24, stockAvailable: 22 },
  { bloodGroup: 'O-', donors: 8, requests: 14, stockAvailable: 6 }
];

const PRIORITY_COLORS = {
  CRITICAL: '#B91C35',
  HIGH: '#EA580C',
  NORMAL: '#0D9488'
};

const DEFAULT_PRIORITY_DATA = [
  { name: 'Critical Emergency', value: 35, color: PRIORITY_COLORS.CRITICAL },
  { name: 'High Priority', value: 45, color: PRIORITY_COLORS.HIGH },
  { name: 'Normal Requisition', value: 20, color: PRIORITY_COLORS.NORMAL }
];

export default function AdminAnalyticsCharts({
  overview = {},
  registrationTrends = DEFAULT_REGISTRATION_DATA,
  requestTrends = DEFAULT_REQUEST_TRENDS,
  bloodGroups = DEFAULT_BLOOD_GROUPS,
  priorities = DEFAULT_PRIORITY_DATA,
  hospitals = [],
  selectedRange = '30d',
  onRangeChange
}) {
  const [range, setRange] = useState(selectedRange);

  const handleRangeClick = (r) => {
    setRange(r);
    if (onRangeChange) onRangeChange(r);
  };

  const priorityPieData = Array.isArray(priorities)
    ? priorities
    : [
        { name: 'Critical Emergency', value: priorities.CRITICAL || 1, color: PRIORITY_COLORS.CRITICAL },
        { name: 'High Priority', value: priorities.HIGH || 2, color: PRIORITY_COLORS.HIGH },
        { name: 'Normal Requisition', value: priorities.NORMAL || 5, color: PRIORITY_COLORS.NORMAL }
      ];

  return (
    <div className="space-y-6">
      {/* Analytics Toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
        <div>
          <h3 className="text-base font-bold text-slate-900">Platform Analytics & Intelligence</h3>
          <p className="text-xs text-slate-500">Cross-network supply vs demand aggregations and clinical fulfillment rates.</p>
        </div>

        <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
          {RANGE_OPTIONS.map((opt) => (
            <button
              key={opt.id}
              onClick={() => handleRangeClick(opt.id)}
              className={`text-xs font-semibold px-3 py-1.5 rounded-md transition cursor-pointer ${
                range === opt.id
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Overview Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">New Registrations</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {overview.newUsersCount ?? 14}
          </span>
          <span className="text-[11px] text-emerald-600 font-medium inline-flex items-center gap-1 mt-1">
            <TrendingUp size={12} /> User growth in period
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Total Requests in Window</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {overview.requestsInWindow ?? 52}
          </span>
          <span className="text-[11px] text-blue-600 font-medium inline-flex items-center gap-1 mt-1">
            <Activity size={12} /> Requisitions logged
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Fulfillment Rate</span>
          <span className="text-2xl font-bold text-slate-900 mt-1 block">
            {overview.fulfillmentRate ?? 88}%
          </span>
          <span className="text-[11px] text-teal-600 font-medium inline-flex items-center gap-1 mt-1">
            <Award size={12} /> Successfully matched
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs">
          <span className="text-xs font-semibold text-slate-500 block">Units Transfused</span>
          <span className="text-2xl font-bold text-[#B91C35] mt-1 block">
            {overview.unitsTransfused ?? 34}
          </span>
          <span className="text-[11px] text-slate-500 font-medium block mt-1">
            Units verified transfused
          </span>
        </div>
      </div>

      {/* Recharts Grid: Chart 1 & Chart 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Registration Trends */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900">User Growth & Onboarding Trend</h4>
            <p className="text-xs text-slate-500">Chronological registration count across all participant roles</p>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={registrationTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Line type="monotone" dataKey="total" stroke="#B91C35" strokeWidth={2.5} name="Total Users" />
                <Line type="monotone" dataKey="DONOR" stroke="#2563eb" strokeWidth={2} name="Donors" />
                <Line type="monotone" dataKey="PATIENT" stroke="#d97706" strokeWidth={2} name="Patients" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Blood Requests & Fulfillment */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900">Blood Requests vs Fulfillment</h4>
            <p className="text-xs text-slate-500">Comparison of requisitions submitted against successfully fulfilled units</p>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={requestTrends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="totalRequests" fill="#94a3b8" name="Total Requested" radius={[4, 4, 0, 0]} />
                <Bar dataKey="fulfilled" fill="#0d9488" name="Fulfilled" radius={[4, 4, 0, 0]} />
                <Bar dataKey="critical" fill="#B91C35" name="Critical Emergency" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3 & Chart 4 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Blood Group Distribution Bar Chart */}
        <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900">Blood Group Supply vs Demand Matrix</h4>
            <p className="text-xs text-slate-500">Registered voluntary donors vs patient demand vs stocked inventory</p>
          </div>
          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={bloodGroups}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="bloodGroup" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} allowDecimals={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="donors" fill="#3b82f6" name="Registered Donors" radius={[3, 3, 0, 0]} />
                <Bar dataKey="requests" fill="#B91C35" name="Requisition Count" radius={[3, 3, 0, 0]} />
                <Bar dataKey="stockAvailable" fill="#10b981" name="Stock Available" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Urgency Pie Chart */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-slate-900">Requisition Urgency Distribution</h4>
            <p className="text-xs text-slate-500">Breakdown by emergency priority classification</p>
          </div>

          <div className="h-52 w-full my-auto">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={priorityPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {priorityPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderRadius: '8px',
                    color: '#fff',
                    fontSize: '12px',
                    border: 'none'
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            {priorityPieData.map((p) => (
              <div key={p.name} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-600">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  {p.name}
                </span>
                <span className="font-bold text-slate-800">{p.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Hospital Performance Rankings */}
      {hospitals.length > 0 && (
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
          <div className="mb-4">
            <h4 className="text-sm font-bold text-slate-900">Partner Hospital Processing Volume</h4>
            <p className="text-xs text-slate-500">Top healthcare facilities by emergency response and fulfillment rate</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-slate-500 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-3">Facility Name</th>
                  <th className="py-2.5 px-3">City</th>
                  <th className="py-2.5 px-3">Handled Requisitions</th>
                  <th className="py-2.5 px-3">Fulfilled</th>
                  <th className="py-2.5 px-3">Fulfillment Rate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {hospitals.map((h, i) => (
                  <tr key={h.hospitalId || i} className="hover:bg-slate-50/80 transition">
                    <td className="py-2.5 px-3 font-bold text-slate-800">{h.facilityName || 'Hospital'}</td>
                    <td className="py-2.5 px-3 text-slate-600">{h.city || 'Metropolis'}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-800">{h.totalHandled || 0}</td>
                    <td className="py-2.5 px-3 text-teal-700 font-semibold">{h.fulfilledCount || 0}</td>
                    <td className="py-2.5 px-3">
                      <span className="px-2 py-0.5 rounded-full font-bold text-[11px] bg-emerald-50 text-emerald-700 border border-emerald-200">
                        {h.fulfillmentRate || 0}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

