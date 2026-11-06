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
  X
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
  onStockIn,
  onStockOut,
  onDiscardExpired,
  onUpdateThreshold
}) {
  const [activeTab, setActiveTab] = useState('GROUPS'); // 'GROUPS' | 'BATCHES'
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
            onClick={() => setStockInModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Plus size={15} />
            <span>Stock-In Units</span>
          </button>
          <button
            onClick={() => setStockOutModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer"
          >
            <Minus size={15} />
            <span>Record Transfusion</span>
          </button>
          <button
            onClick={() => {
              if (onDiscardExpired) onDiscardExpired();
            }}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold transition cursor-pointer"
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
          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
            activeTab === 'BATCHES'
              ? 'bg-[#B91C35] text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          Track Stock Batches & Expiry ({batches.length})
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
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Adequate
                      </span>
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{item.unitsAvailable}</span>
                      <span className="text-xs font-semibold text-slate-500">Units</span>
                    </div>
                    <p className="text-[11px] text-slate-400">
                      Threshold: {item.lowStockThreshold || 5} units
                    </p>
                  </div>

                  {/* Stock Level Progress Bar */}
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mt-4">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isLow ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-400 text-[11px] truncate max-w-[100px]">
                    {item.storageLocation || 'Central Fridge'}
                  </span>
                  <button
                    onClick={() => {
                      setSelectedGroup(bg);
                      setThresholdVal(item.lowStockThreshold || 5);
                      setThresholdModalOpen(true);
                    }}
                    title="Configure threshold"
                    className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                  >
                    <Settings2 size={14} />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* View 2: Batches & Expiry Tracking Table */}
      {activeTab === 'BATCHES' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="p-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between text-xs font-bold text-slate-600">
            <span>Biological Blood Units & Shelf-Life Register</span>
            <span>Total Batches: {batches.length}</span>
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
                {batches.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-slate-400">
                      No stock batches registered yet. Click <strong>Stock-In Units</strong> to add new blood units.
                    </td>
                  </tr>
                ) : (
                  batches.map((b) => {
                    const isExpired = checkBatchExpired(b);
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
                          <span className={`inline-flex items-center gap-1 ${isExpired ? 'text-rose-600 font-bold' : 'text-slate-700'}`}>
                            <Calendar size={12} />
                            {b.expiryDate ? new Date(b.expiryDate).toLocaleDateString() : 'N/A'}
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
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Plus size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Record Blood Stock-In</h4>
                    <p className="text-xs text-slate-400">Intake voluntary donations or external procurement</p>
                  </div>
                </div>
                <button
                  onClick={() => setStockInModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleStockInSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={stockInForm.bloodGroup}
                      onChange={(e) => setStockInForm({ ...stockInForm, bloodGroup: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    >
                      {BLOOD_GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Units (Bags)</label>
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={stockInForm.units}
                      onChange={(e) => setStockInForm({ ...stockInForm, units: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Component Type</label>
                    <select
                      value={stockInForm.componentType}
                      onChange={(e) => setStockInForm({ ...stockInForm, componentType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    >
                      {COMPONENTS.map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Donor Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. John Doe"
                      value={stockInForm.donorName}
                      onChange={(e) => setStockInForm({ ...stockInForm, donorName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    />
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

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Intake Notes</label>
                  <textarea
                    rows={2}
                    placeholder="Batch notes, donor screening clearance..."
                    value={stockInForm.notes}
                    onChange={(e) => setStockInForm({ ...stockInForm, notes: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStockInModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                  >
                    Confirm Stock-In
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 2: Stock-Out / Transfusion Modal */}
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
                  <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Minus size={20} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-base">Record Transfusion / Stock-Out</h4>
                    <p className="text-xs text-slate-400">Deducts verified inventory units via FIFO algorithm</p>
                  </div>
                </div>
                <button
                  onClick={() => setStockOutModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleStockOutSubmit} className="space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={stockOutForm.bloodGroup}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, bloodGroup: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    >
                      {BLOOD_GROUPS.map((g) => (
                        <option key={g} value={g}>{g}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Units (Bags)</label>
                    <input
                      type="number"
                      min={1}
                      max={20}
                      value={stockOutForm.units}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, units: Number(e.target.value) })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Patient Name</label>
                    <input
                      type="text"
                      placeholder="Recipient full name"
                      value={stockOutForm.patientName}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, patientName: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Transaction Type</label>
                    <select
                      value={stockOutForm.transactionType}
                      onChange={(e) => setStockOutForm({ ...stockOutForm, transactionType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                    >
                      <option value="TRANSFUSION">Clinical Transfusion</option>
                      <option value="STOCK_OUT">Institutional Transfer</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinical Rationale / Department</label>
                  <textarea
                    rows={2}
                    value={stockOutForm.reason}
                    onChange={(e) => setStockOutForm({ ...stockOutForm, reason: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setStockOutModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                  >
                    Authorize Transfusion
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal 3: Update Threshold Modal */}
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
              <h4 className="font-bold text-slate-900 text-sm mb-1">
                Configure Alert Threshold for {selectedGroup}
              </h4>
              <p className="text-xs text-slate-400 mb-4">
                Alerts trigger when available units drop below this quantity.
              </p>

              <form onSubmit={handleThresholdSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Minimum Units Threshold</label>
                  <input
                    type="number"
                    min={1}
                    max={50}
                    value={thresholdVal}
                    onChange={(e) => setThresholdVal(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-slate-200 font-bold focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setThresholdModalOpen(false)}
                    className="px-3.5 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#B91C35] text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
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
