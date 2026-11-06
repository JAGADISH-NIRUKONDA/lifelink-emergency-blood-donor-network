import React, { useState } from 'react';
import {
  Droplet,
  AlertTriangle,
  History,
  Clock,
  Filter
} from 'lucide-react';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export default function AdminInventoryOversight({
  inventoryData = {},
  onFilterBloodGroup,
  onToggleLowStock
}) {
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const summary = inventoryData.summary || {
    totalUnitsAvailable: 48,
    totalUnitsReserved: 12,
    lowStockCount: 1,
    byBloodGroup: {}
  };

  const inventories = inventoryData.inventories || [];
  const expiringBatches = inventoryData.expiringBatches || [];
  const recentTransactions = inventoryData.recentTransactions || [];

  const handleGroupSelect = (bg) => {
    setSelectedGroup(bg);
    if (onFilterBloodGroup) onFilterBloodGroup(bg === 'ALL' ? '' : bg);
  };

  const handleLowStockToggle = () => {
    const nextVal = !lowStockOnly;
    setLowStockOnly(nextVal);
    if (onToggleLowStock) onToggleLowStock(nextVal);
  };

  const filteredInventories = inventories.filter((inv) => {
    if (selectedGroup !== 'ALL' && inv.bloodGroup !== selectedGroup) return false;
    if (lowStockOnly && inv.unitsAvailable > inv.lowStockThreshold) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Platform-wide Inventory Summary Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Total Units Available</span>
            <span className="text-2xl font-bold text-[#B91C35] mt-0.5 block">
              {summary.totalUnitsAvailable} Units
            </span>
            <span className="text-[11px] text-slate-400">Across all connected hospitals</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-red-50 text-[#B91C35] flex items-center justify-center">
            <Droplet size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Units Reserved</span>
            <span className="text-2xl font-bold text-amber-600 mt-0.5 block">
              {summary.totalUnitsReserved} Units
            </span>
            <span className="text-[11px] text-slate-400">Earmarked for surgeries</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Clock size={20} />
          </div>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 block">Low Stock Alerts</span>
            <span className="text-2xl font-bold text-rose-600 mt-0.5 block">
              {summary.lowStockCount} Facilities
            </span>
            <span className="text-[11px] text-slate-400">Stock below safety reserve</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <AlertTriangle size={20} />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Blood Groups:
          </span>
          {BLOOD_GROUPS.map((bg) => (
            <button
              key={bg}
              onClick={() => handleGroupSelect(bg)}
              className={`text-xs font-semibold px-2.5 py-1 rounded-md transition cursor-pointer ${
                selectedGroup === bg
                  ? 'bg-[#B91C35] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {bg}
            </button>
          ))}
        </div>

        <button
          onClick={handleLowStockToggle}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition cursor-pointer flex items-center gap-1.5 ${
            lowStockOnly
              ? 'bg-rose-50 border-rose-300 text-rose-700'
              : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <AlertTriangle size={13} className={lowStockOnly ? 'text-rose-600' : 'text-slate-400'} />
          <span>Low-Stock Only</span>
        </button>
      </div>

      {/* Cross-Network Inventory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900">Hospital-wise Inventory Balance</h4>
          <span className="text-xs text-slate-400">{filteredInventories.length} inventory records</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-2.5 px-4">Hospital Facility</th>
                <th className="py-2.5 px-4">Blood Group</th>
                <th className="py-2.5 px-4">Available Units</th>
                <th className="py-2.5 px-4">Reserved</th>
                <th className="py-2.5 px-4">Safety Threshold</th>
                <th className="py-2.5 px-4">Stock Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventories.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-6 text-center text-slate-400">
                    No hospital inventory records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredInventories.map((inv, idx) => {
                  const isLow = inv.unitsAvailable <= inv.lowStockThreshold;
                  return (
                    <tr key={inv._id || idx} className="hover:bg-slate-50/70 transition">
                      <td className="py-2.5 px-4 font-bold text-slate-900">
                        {inv.hospital?.hospitalDetails?.facilityName || inv.hospital?.name || 'Partner Hospital'}
                        <span className="block text-[10px] text-slate-400 font-normal">
                          {inv.hospital?.city || 'Metropolis'}
                        </span>
                      </td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded font-black text-[#B91C35] bg-red-50 border border-red-100">
                          {inv.bloodGroup}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 font-extrabold text-slate-900 text-sm">
                        {inv.unitsAvailable}
                      </td>
                      <td className="py-2.5 px-4 text-slate-600 font-semibold">
                        {inv.unitsReserved || 0}
                      </td>
                      <td className="py-2.5 px-4 text-slate-500 font-mono">
                        {inv.lowStockThreshold}
                      </td>
                      <td className="py-2.5 px-4">
                        {isLow ? (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200 inline-flex items-center gap-1">
                            <AlertTriangle size={10} />
                            <span>Low Stock</span>
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Adequate Reserve
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Expiring Batches Table */}
      {expiringBatches.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h4 className="text-sm font-bold text-slate-900">Expiring Batches Warning (Next 14 Days)</h4>
              <p className="text-xs text-slate-500">Prioritize these units for upcoming elective or trauma transfusions.</p>
            </div>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              {expiringBatches.length} Batches Near Expiry
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4">Batch Number</th>
                  <th className="py-2.5 px-4">Facility</th>
                  <th className="py-2.5 px-4">Group</th>
                  <th className="py-2.5 px-4">Component</th>
                  <th className="py-2.5 px-4">Units Remaining</th>
                  <th className="py-2.5 px-4">Expiry Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {expiringBatches.map((b) => (
                  <tr key={b._id || b.batchNumber} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-4 font-mono font-bold text-slate-800">{b.batchNumber}</td>
                    <td className="py-2.5 px-4 text-slate-700 font-medium">
                      {b.hospital?.hospitalDetails?.facilityName || b.hospital?.name || 'Metropolis Center'}
                    </td>
                    <td className="py-2.5 px-4">
                      <span className="font-bold text-[#B91C35]">{b.bloodGroup}</span>
                    </td>
                    <td className="py-2.5 px-4 text-slate-600">{b.componentType || 'WHOLE_BLOOD'}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{b.remainingUnits}</td>
                    <td className="py-2.5 px-4 font-semibold text-rose-600">
                      {new Date(b.expiryDate).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Transactions Trail */}
      {recentTransactions.length > 0 && (
        <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <History size={16} className="text-slate-400" />
              <span>Recent Blood Transactions Audit Trail</span>
            </h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                  <th className="py-2.5 px-4">Transaction Type</th>
                  <th className="py-2.5 px-4">Facility</th>
                  <th className="py-2.5 px-4">Group</th>
                  <th className="py-2.5 px-4">Units</th>
                  <th className="py-2.5 px-4">Performed By</th>
                  <th className="py-2.5 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentTransactions.map((tx) => (
                  <tr key={tx._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-2.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded font-bold text-[10px] ${
                          tx.transactionType === 'STOCK_IN'
                            ? 'bg-emerald-50 text-emerald-700'
                            : tx.transactionType === 'TRANSFUSION'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {tx.transactionType}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-medium text-slate-800">
                      {tx.hospital?.hospitalDetails?.facilityName || tx.hospital?.name || 'Hospital'}
                    </td>
                    <td className="py-2.5 px-4 font-bold text-[#B91C35]">{tx.bloodGroup}</td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">{tx.units}</td>
                    <td className="py-2.5 px-4 text-slate-600">{tx.performedBy?.name || 'Staff Member'}</td>
                    <td className="py-2.5 px-4 text-slate-400">
                      {new Date(tx.createdAt).toLocaleString()}
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

