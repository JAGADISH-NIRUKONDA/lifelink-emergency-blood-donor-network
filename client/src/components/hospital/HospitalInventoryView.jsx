import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplet,
  Plus,
  Minus,
  AlertTriangle,
  Trash2,
  Settings2,
  Calendar,
  X,
  Lock,
  History,
  Filter
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['WHOLE_BLOOD', 'RED_CELLS', 'PLATELETS', 'PLASMA'];

const getDefaultDates = () => {
  const now = new Date();
  const collectionDate = now.toISOString().split('T')[0];
  const expiryDate = new Date(now.getTime() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  return { collectionDate, expiryDate };
};

const checkBatchExpired = (b) => {
  if (b.status === 'EXPIRED') return true;
  return new Date(b.expiryDate).getTime() < Date.now();
};

export default function HospitalInventoryView({
  inventory = [],
  batches = [],
  recentTransactions = [],
  isVerified = true,
  onStockIn,
  onStockOut,
  onDiscardExpired,
  onUpdateThreshold
}) {
  const [activeTab, setActiveTab] = useState('GROUPS'); // 'GROUPS' | 'BATCHES' | 'HISTORY'
  const [batchBloodGroupFilter, setBatchBloodGroupFilter] = useState('ALL');
  const [stockInModalOpen, setStockInModalOpen] = useState(false);
  const [stockOutModalOpen, setStockOutModalOpen] = useState(false);
  const [thresholdModalOpen, setThresholdModalOpen] = useState(false);
  const [selectedGroup, setSelectedGroup] = useState('O+');

  const defaultDates = getDefaultDates();

  // Stock In Form State
  const [stockInForm, setStockInForm] = useState({
    bloodGroup: 'O+',
    units: 1,
    componentType: 'WHOLE_BLOOD',
    collectionDate: defaultDates.collectionDate,
    expiryDate: defaultDates.expiryDate,
    donorName: '',
    storageLocation: 'Refrigeration Bay 1',
    notes: ''
  });

  // Stock Out Form State
  const [stockOutForm, setStockOutForm] = useState({
    bloodGroup: 'O+',
    units: 1,
    transactionType: 'TRANSFUSION',
    patientName: '',
    reason: 'Emergency surgery in trauma ward',
    notes: ''
  });

  // Threshold Form State
  const [thresholdVal, setThresholdVal] = useState(5);

  const totalAvailable = inventory.reduce((acc, curr) => acc + (curr.unitsAvailable || 0), 0);
  const lowStockCount = inventory.filter((i) => i.isLowStock || (i.unitsAvailable <= (i.lowStockThreshold || 5))).length;

  const [now] = useState(() => Date.now());
  const filteredBatches = batches.filter((b) => {
    if (batchBloodGroupFilter !== 'ALL' && b.bloodGroup !== batchBloodGroupFilter) return false;
    return true;
  });

  const expiringBatchesCount = batches.filter((b) => {
    if (b.status === 'DISCARDED' || b.status === 'TRANSFUSED') return false;
    const diffDays = (new Date(b.expiryDate).getTime() - now) / (1000 * 3600 * 24);
    return diffDays >= 0 && diffDays <= 7;
  }).length;

  const handleStockInSubmit = (e) => {
    e.preventDefault();
    if (onStockIn) {
      onStockIn(stockInForm);
    }
    setStockInModalOpen(false);
  };

  const handleStockOutSubmit = (e) => {
    e.preventDefault();
    if (onStockOut) {
      onStockOut(stockOutForm);
    }
    setStockOutModalOpen(false);
  };

  const handleThresholdSubmit = (e) => {
    e.preventDefault();
    if (onUpdateThreshold) {
      onUpdateThreshold({ bloodGroup: selectedGroup, threshold: thresholdVal });
    }
    setThresholdModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Verification Gate Banner */}
      {!isVerified && (
        <div className="p-4 rounded-3xl bg-amber-500/10 border border-amber-300 flex items-center justify-between text-xs text-amber-900">
          <div className="flex items-center gap-2.5">
            <Lock size={16} className="text-amber-700 shrink-0" />
            <span>
              <strong>Accreditation Locked:</strong> Adding inventory batches, stock-out transactions, and threshold modifications are restricted to verified hospital accounts.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase bg-amber-200 text-amber-900 px-2.5 py-1 rounded-full">
            Read-Only
          </span>
        </div>
      )}

      {/* Top Inventory Action Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C35] flex items-center justify-center font-black text-xl border border-red-200/60 shadow-2xs">
            <Droplet size={24} className="fill-current" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <span>Blood Inventory & Stock Management</span>
              {lowStockCount > 0 && (
                <span className="text-xs bg-amber-100 text-amber-800 font-bold px-2.5 py-0.5 rounded-full border border-amber-200">
                  {lowStockCount} Low Stock
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500">
              Total Units Available: <strong className="text-slate-900 font-black">{totalAvailable} Units</strong> across 8 blood groups
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            disabled={!isVerified}
            onClick={() => setStockInModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
              isVerified
                ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Plus size={15} />
            <span>Stock-In Units</span>
          </button>
          <button
            disabled={!isVerified}
            onClick={() => setStockOutModalOpen(true)}
            className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition shadow-xs ${
              isVerified
                ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                : 'bg-slate-200 text-slate-400 cursor-not-allowed'
            }`}
          >
            <Minus size={15} />
            <span>Record Transfusion</span>
          </button>
          <button
            disabled={!isVerified}
            onClick={() => {
              if (onDiscardExpired) onDiscardExpired();
            }}
            className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold border transition ${
              isVerified
                ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer'
                : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
            }`}
          >
            <Trash2 size={14} />
            <span>Discard Expired</span>
          </button>
        </div>
      </div>

      {/* Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('GROUPS')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'GROUPS'
              ? 'bg-[#B91C35] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Blood Group Summary (8 Types)
        </button>
        <button
          onClick={() => setActiveTab('BATCHES')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'BATCHES'
              ? 'bg-[#B91C35] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>Track Stock Batches & Expiry ({batches.length})</span>
          {expiringBatchesCount > 0 && (
            <span className="px-1.5 py-0.2 bg-amber-400 text-amber-950 font-black rounded-md text-[10px]">
              {expiringBatchesCount}
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab('HISTORY')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'HISTORY'
              ? 'bg-[#B91C35] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <History size={13} />
          <span>Inventory History</span>
        </button>
      </div>

      {/* View 1: 8 Blood Groups Inventory Cards */}
      {activeTab === 'GROUPS' && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {BLOOD_GROUPS.map((bg) => {
            const item = inventory.find((i) => i.bloodGroup === bg) || {
              unitsAvailable: 0,
              unitsReserved: 0,
              lowStockThreshold: 5
            };
            const isLow = item.unitsAvailable <= (item.lowStockThreshold || 5);
            const percentage = Math.min(100, Math.round((item.unitsAvailable / 20) * 100));

            return (
              <motion.div
                key={bg}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl border transition relative overflow-hidden flex flex-col justify-between ${
                  isLow
                    ? 'bg-amber-50/40 border-amber-200 shadow-2xs'
                    : 'bg-white border-slate-200/80 shadow-2xs hover:shadow-xs'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <span className="text-2xl font-black text-[#B91C35]">{bg}</span>
                    {isLow ? (
                      <span className="flex items-center gap-1 text-[10px] font-black uppercase text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                        <AlertTriangle size={11} />
                        Low Stock
                      </span>
                    ) : (
                      <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Adequate
                      </span>
                    )}
                  </div>

                  <div className="space-y-1 mb-4">
                    <div className="text-3xl font-black text-slate-900 leading-none">
                      {item.unitsAvailable || 0}
                      <span className="text-xs text-slate-400 font-bold ml-1">Units</span>
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Reserved: <strong className="text-slate-800">{item.unitsReserved || 0}</strong> | Threshold: {item.lowStockThreshold || 5}
                    </div>
                  </div>

                  {/* Stock Level Bar */}
                  <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-3">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Storage: {item.storageLocation || 'Main Bay'}
                  </span>
                  <button
                    disabled={!isVerified}
                    onClick={() => {
                      setSelectedGroup(bg);
                      setThresholdVal(item.lowStockThreshold || 5);
                      setThresholdModalOpen(true);
                    }}
                    className={`text-[11px] font-bold inline-flex items-center gap-1 ${
                      isVerified
                        ? 'text-slate-600 hover:text-slate-900 cursor-pointer'
                        : 'text-slate-300 cursor-not-allowed'
                    }`}
                  >
                    <Settings2 size={12} />
                    <span>Threshold</span>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View 2: Batches & Expiry Tracking Table */}
      {activeTab === 'BATCHES' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden space-y-4">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs font-bold text-slate-600">
            <div className="flex items-center gap-2">
              <span>Biological Blood Units & Shelf-Life Register ({filteredBatches.length} Batches)</span>
            </div>

            {/* Blood Group Filter */}
            <div className="flex items-center gap-2">
              <Filter size={13} className="text-slate-400" />
              <span className="text-[11px] uppercase tracking-wider text-slate-400">Filter Group:</span>
              <select
                value={batchBloodGroupFilter}
                onChange={(e) => setBatchBloodGroupFilter(e.target.value)}
                className="px-2.5 py-1 rounded-xl border border-slate-300 bg-white text-xs font-bold text-slate-800"
              >
                <option value="ALL">All Blood Types</option>
                {BLOOD_GROUPS.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Batch Number</th>
                  <th className="p-4">Group</th>
                  <th className="p-4">Remaining / Total</th>
                  <th className="p-4">Component</th>
                  <th className="p-4">Collection Date</th>
                  <th className="p-4">Expiry Date</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Storage Bay</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {filteredBatches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No stock batches matching filter. Click <strong>Stock-In Units</strong> to register new blood units.
                    </td>
                  </tr>
                ) : (
                  filteredBatches.map((b) => {
                    const isExpired = checkBatchExpired(b);
                    const diffDays = Math.ceil((new Date(b.expiryDate).getTime() - now) / (1000 * 3600 * 24));
                    const isExpiringSoon = !isExpired && diffDays <= 7;

                    return (
                      <tr key={b._id || b.batchNumber} className="hover:bg-slate-50/80 transition">
                        <td className="p-4 font-mono font-bold text-slate-900">{b.batchNumber}</td>
                        <td className="p-4">
                          <span className="font-bold text-[#B91C35] bg-red-50 px-2 py-0.5 rounded-md">
                            {b.bloodGroup}
                          </span>
                        </td>
                        <td className="p-4">
                          <span className="font-bold text-slate-900">{b.remainingUnits}</span>
                          <span className="text-slate-400"> / {b.units} Units</span>
                        </td>
                        <td className="p-4 text-slate-600">{b.componentType}</td>
                        <td className="p-4 text-slate-500">
                          {b.collectionDate ? new Date(b.collectionDate).toLocaleDateString() : 'N/A'}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1 ${isExpired ? 'text-rose-600 font-bold' : isExpiringSoon ? 'text-amber-600 font-bold' : 'text-slate-700'}`}>
                            <Calendar size={12} />
                            {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : 'N/A'}
                            {isExpiringSoon && (
                              <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded-full ml-1">
                                {diffDays}d left
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              b.status === 'AVAILABLE'
                                ? 'bg-emerald-100 text-emerald-800'
                                : b.status === 'TRANSFUSED'
                                ? 'bg-sky-100 text-sky-800'
                                : b.status === 'EXPIRED'
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {b.status}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500">{b.storageLocation || 'Bay 1'}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* View 3: Inventory Transaction History */}
      {activeTab === 'HISTORY' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 text-xs font-bold text-slate-700 flex items-center justify-between">
            <span>Inventory Stock Movement Log</span>
            <span>Recorded in MongoDB</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-100/70 text-slate-500 uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Timestamp</th>
                  <th className="p-4">Transaction</th>
                  <th className="p-4">Blood Group</th>
                  <th className="p-4">Units</th>
                  <th className="p-4">Patient / Donor</th>
                  <th className="p-4">Performed By</th>
                  <th className="p-4">Reason / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {recentTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400">
                      No stock movement history recorded yet.
                    </td>
                  </tr>
                ) : (
                  recentTransactions.map((tx, idx) => (
                    <tr key={tx._id || idx} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-mono text-slate-500 text-[11px]">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'Recent'}
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          tx.transactionType === 'STOCK_IN'
                            ? 'bg-emerald-100 text-emerald-800'
                            : tx.transactionType === 'TRANSFUSION'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}>
                          {tx.transactionType}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-[#B91C35]">{tx.bloodGroup}</td>
                      <td className="p-4 font-bold text-slate-900">{tx.units} Units</td>
                      <td className="p-4 text-slate-700">{tx.patientName || tx.donorName || 'Hospital Unit'}</td>
                      <td className="p-4 text-slate-500">{tx.performedBy?.name || 'Staff Specialist'}</td>
                      <td className="p-4 text-slate-500 max-w-xs truncate">{tx.reason || tx.notes || 'Routine update'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal 1: Stock-In Units Modal */}
      <AnimatePresence>
        {stockInModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStockInModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 z-10"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
                    <Plus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Register Blood Stock-In Batch</h3>
                    <p className="text-xs text-slate-500">Record incoming donated biological units</p>
                  </div>
                </div>
                <button
                  onClick={() => setStockInModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleStockInSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={stockInForm.bloodGroup}
                      onChange={(e) => setStockInForm({ ...stockInForm, bloodGroup: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-[#B91C35] focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Units (Bags)</label>
                    <input
                      type="number"
                      min="1"
                      max="100"
                      value={stockInForm.units}
                      onChange={(e) => setStockInForm({ ...stockInForm, units: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35] font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Component Type</label>
                    <select
                      value={stockInForm.componentType}
                      onChange={(e) => setStockInForm({ ...stockInForm, componentType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    >
                      {COMPONENTS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Storage Location</label>
                    <input
                      type="text"
                      value={stockInForm.storageLocation}
                      onChange={(e) => setStockInForm({ ...stockInForm, storageLocation: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Collection Date</label>
                    <input
                      type="date"
                      value={stockInForm.collectionDate}
                      onChange={(e) => setStockInForm({ ...stockInForm, collectionDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={stockInForm.expiryDate}
                      onChange={(e) => setStockInForm({ ...stockInForm, expiryDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Donor Name / Source (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. Registered Voluntary Donor"
                    value={stockInForm.donorName}
                    onChange={(e) => setStockInForm({ ...stockInForm, donorName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStockInModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
                  >
                    Add Batch to Inventory
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Record Transfusion / Stock Out */}
      <AnimatePresence>
        {stockOutModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setStockOutModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 z-10"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 bg-slate-100 text-slate-800 rounded-xl">
                    <Minus size={18} />
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">Record Transfusion / Stock Out</h3>
                    <p className="text-xs text-slate-500">Deduct units from inventory reserve</p>
                  </div>
                </div>
                <button
                  onClick={() => setStockOutModalOpen(false)}
                  className="p-1.5 rounded-xl hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <form onSubmit={handleStockOutSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={stockOutForm.bloodGroup}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, bloodGroup: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-[#B91C35] focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    >
                      {BLOOD_GROUPS.map((bg) => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Units (Bags)</label>
                    <input
                      type="number"
                      min="1"
                      max="20"
                      value={stockOutForm.units}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, units: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35] font-bold"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Patient Name</label>
                  <input
                    type="text"
                    required
                    placeholder="Admitted Patient Full Name"
                    value={stockOutForm.patientName}
                    onChange={(e) => setStockOutForm({ ...stockOutForm, patientName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinical Procedure / Justification</label>
                  <input
                    type="text"
                    value={stockOutForm.reason}
                    onChange={(e) => setStockOutForm({ ...stockOutForm, reason: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>

                <div className="pt-3 flex justify-end gap-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setStockOutModalOpen(false)}
                    className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs"
                  >
                    Confirm Dispensation
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Threshold Settings Modal */}
      <AnimatePresence>
        {thresholdModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setThresholdModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-sm bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 z-10"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <div className="flex items-center gap-2">
                  <Settings2 size={18} className="text-slate-800" />
                  <h3 className="font-bold text-slate-900 text-sm">
                    Configure Low Stock Threshold
                  </h3>
                </div>
                <button
                  onClick={() => setThresholdModalOpen(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleThresholdSubmit} className="space-y-4 text-xs">
                <div>
                  <span className="text-slate-500 block mb-1">Blood Type:</span>
                  <span className="text-xl font-black text-[#B91C35]">{selectedGroup}</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Minimum Alert Threshold (Units)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={thresholdVal}
                    onChange={(e) => setThresholdVal(parseInt(e.target.value) || 1)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35] font-bold"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Triggers warning flags when inventory dips below this count.
                  </p>
                </div>

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setThresholdModalOpen(false)}
                    className="px-3 py-1.5 text-slate-600 font-semibold"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-slate-900 text-white font-bold"
                  >
                    Save Threshold
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
