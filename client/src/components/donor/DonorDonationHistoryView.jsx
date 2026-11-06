import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  Calendar,
  Filter,
  Plus,
  X,
  FileCheck
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const COMPONENTS = ['WHOLE_BLOOD', 'RED_CELLS', 'PLATELETS', 'PLASMA'];

const getTodayIsoDate = () => new Date().toISOString().split('T')[0];

export default function DonorDonationHistoryView({
  donations = [],
  summary = {},
  donorBloodGroup = 'O+',
  onRecordDonation
}) {
  const [filterGroup, setFilterGroup] = useState('ALL');
  const [filterYear, setFilterYear] = useState('ALL');
  const [modalOpen, setModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState(() => ({
    hospitalName: '',
    bloodGroup: donorBloodGroup || 'O+',
    units: 1,
    componentType: 'WHOLE_BLOOD',
    donationDate: getTodayIsoDate(),
    certificateNumber: '',
    notes: ''
  }));

  const filteredDonations = donations.filter((d) => {
    if (filterGroup !== 'ALL' && d.bloodGroup !== filterGroup) return false;
    if (filterYear !== 'ALL') {
      const yr = new Date(d.donationDate).getFullYear().toString();
      if (yr !== filterYear) return false;
    }
    return true;
  });

  const years = Array.from(
    new Set(donations.map((d) => new Date(d.donationDate).getFullYear()))
  ).sort((a, b) => b - a);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (onRecordDonation) {
        await onRecordDonation(form);
      }
      setModalOpen(false);
      setForm({
        hospitalName: '',
        bloodGroup: donorBloodGroup || 'O+',
        units: 1,
        componentType: 'WHOLE_BLOOD',
        donationDate: new Date().toISOString().split('T')[0],
        certificateNumber: '',
        notes: ''
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar & Verification Stats */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-600" />
            <span>Verified Clinical Donation History</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Institutional records authenticated by accredited hospital transfusion centers
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition shadow-xs cursor-pointer self-start sm:self-center"
        >
          <Plus size={15} />
          <span>Log Verified Donation</span>
        </button>
      </div>

      {/* 2. Top Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Verified Records
          </span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {summary.totalVerifiedRecords || donations.length}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
            Confirmed with blood bank logs
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Units Contributed
          </span>
          <span className="text-2xl font-black text-slate-900 block mt-1">
            {summary.totalUnitsDonated || donations.reduce((acc, curr) => acc + (curr.units || 1), 0)} Units
          </span>
          <span className="text-[11px] text-slate-400 font-medium block mt-0.5">
            Whole blood & apheresis units
          </span>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Estimated Lives Saved
          </span>
          <span className="text-2xl font-black text-[#B91C35] block mt-1">
            ~{summary.livesSavedEstimate || ((summary.totalUnitsDonated || donations.length) * 3)}
          </span>
          <span className="text-[11px] text-emerald-600 font-bold block mt-0.5">
            Clinical standard (3 lives/unit)
          </span>
        </div>
      </div>

      {/* 3. Filter Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3">
          <Filter size={14} className="text-slate-400" />
          <span className="font-bold text-slate-600">Filter Records:</span>

          <select
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
          >
            <option value="ALL">All Blood Types</option>
            {BLOOD_GROUPS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>

          {years.length > 0 && (
            <select
              value={filterYear}
              onChange={(e) => setFilterYear(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-200 bg-white font-bold text-slate-800"
            >
              <option value="ALL">All Years</option>
              {years.map((y) => (
                <option key={y} value={y.toString()}>{y}</option>
              ))}
            </select>
          )}
        </div>

        <span className="text-slate-400 font-medium">
          Showing {filteredDonations.length} records
        </span>
      </div>

      {/* 4. Donation Records Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Donation Date</th>
                <th className="p-4">Hospital / Transfusion Center</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4">Component & Units</th>
                <th className="p-4">Certificate #</th>
                <th className="p-4">Verification Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDonations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400">
                    No verified donation records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredDonations.map((d) => (
                  <tr key={d._id || d.certificateNumber} className="hover:bg-slate-50/70 transition">
                    <td className="p-4 font-medium text-slate-800 whitespace-nowrap">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={13} className="text-slate-400" />
                        <span>{new Date(d.donationDate).toLocaleDateString()}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-900">
                      {d.hospitalName}
                    </td>
                    <td className="p-4">
                      <span className="font-black text-xs text-[#B91C35] bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-xl">
                        {d.bloodGroup}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700">
                      <strong className="text-slate-900 font-bold">{d.units} Unit</strong> ({d.componentType ? d.componentType.replace(/_/g, ' ') : 'Whole Blood'})
                    </td>
                    <td className="p-4 font-mono text-slate-500 text-[11px]">
                      {d.certificateNumber || 'CERT-AUTOGEN'}
                    </td>
                    <td className="p-4">
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-300">
                        <ShieldCheck size={12} className="text-emerald-600" />
                        <span>{d.status || 'VERIFIED'}</span>
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 5. Log Donation Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <FileCheck size={18} className="text-emerald-600" />
                  <h3 className="font-bold text-slate-900 text-sm">Log Verified Clinical Donation</h3>
                </div>
                <button onClick={() => setModalOpen(false)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Hospital / Transfusion Center</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Metro Apex Regional Hospital"
                    value={form.hospitalName}
                    onChange={(e) => setForm({ ...form, hospitalName: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
                    <select
                      value={form.bloodGroup}
                      onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-[#B91C35]"
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
                      max="5"
                      value={form.units}
                      onChange={(e) => setForm({ ...form, units: parseInt(e.target.value) || 1 })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 font-bold"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Component</label>
                    <select
                      value={form.componentType}
                      onChange={(e) => setForm({ ...form, componentType: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 bg-white"
                    >
                      {COMPONENTS.map((c) => (
                        <option key={c} value={c}>{c.replace(/_/g, ' ')}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Donation Date</label>
                    <input
                      type="date"
                      required
                      value={form.donationDate}
                      onChange={(e) => setForm({ ...form, donationDate: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Certificate / Lot Number (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. CERT-2026-X99"
                    value={form.certificateNumber}
                    onChange={(e) => setForm({ ...form, certificateNumber: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 font-semibold text-slate-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition shadow-xs"
                  >
                    {isSubmitting ? 'Recording...' : 'Save Verified Record'}
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
