import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Eye,
  CheckCircle2,
  UserCheck,
  MapPin,
  Calendar,
  AlertCircle,
  FileText,
  Lock,
  X,
  AlertTriangle
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../bloodRequests/StatusBadge';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'MATCHED', 'FULFILLED', 'REJECTED', 'CANCELLED'];
const PRIORITIES = ['ALL', 'CRITICAL', 'HIGH', 'NORMAL'];

export default function HospitalRequestsView({
  requests = [],
  isVerified = true,
  searchTerm = '',
  onSearchChange,
  selectedBloodGroup = 'ALL',
  onBloodGroupChange,
  selectedStatus = 'ALL',
  onStatusChange,
  selectedPriority = 'ALL',
  onPriorityChange,
  onApproveRequest,
  onRejectRequest,
  onFulfillRequest,
  onCoordinateDonors
}) {
  const [selectedRequestDetails, setSelectedRequestDetails] = useState(null);
  const [rejectModalReq, setRejectModalReq] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [fulfillModalReq, setFulfillModalReq] = useState(null);
  const [fulfillUnits, setFulfillUnits] = useState(1);
  const [fulfillNotes, setFulfillNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleConfirmReject = async () => {
    if (!rejectModalReq) return;
    setIsSubmitting(true);
    try {
      await onRejectRequest(rejectModalReq._id || rejectModalReq.requestId, rejectionReason || 'Institutional review rejection');
      setRejectModalReq(null);
      setRejectionReason('');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmFulfill = async () => {
    if (!fulfillModalReq) return;
    setIsSubmitting(true);
    try {
      await onFulfillRequest(fulfillModalReq._id || fulfillModalReq.requestId, {
        unitsFulfilled: Number(fulfillUnits) || fulfillModalReq.unitsRequired,
        notes: fulfillNotes || 'Transfusion completed successfully.'
      });
      setFulfillModalReq(null);
      setFulfillNotes('');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Unverified Gate Warning (if unverified) */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-300 flex items-center gap-3 text-xs text-amber-900">
          <Lock size={16} className="text-amber-700 shrink-0" />
          <span>
            <strong>Read-Only Mode:</strong> This hospital account is pending platform accreditation. You can inspect all emergency requisitions, but approving, rejecting, or recording fulfillments requires Super Admin verification.
          </span>
        </div>
      )}

      {/* 2. Filter and Search Bar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Request ID, Patient Name, Hospital, or City..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs font-medium focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            />
          </div>

          {/* Blood group select */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Group:
            </span>
            <select
              value={selectedBloodGroup}
              onChange={(e) => onBloodGroupChange(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-[#B91C35] bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>
                  {g === 'ALL' ? 'All Blood Types' : g}
                </option>
              ))}
            </select>
          </div>

          {/* Priority select */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Urgency:
            </span>
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === 'ALL' ? 'All Urgencies' : p}
                </option>
              ))}
            </select>
          </div>

          {/* Status select */}
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Status:
            </span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            >
              {STATUSES.map((s) => (
                <option key={s} value={s}>
                  {s === 'ALL' ? 'All Statuses' : s}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 3. Requisitions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="p-4">Requisition ID</th>
                <th className="p-4">Patient & Location</th>
                <th className="p-4">Blood Group</th>
                <th className="p-4">Required Units</th>
                <th className="p-4">Urgency</th>
                <th className="p-4">Status</th>
                <th className="p-4 text-right">Transfusion Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-12 text-center text-slate-400">
                    No emergency blood requisitions matching selected filters.
                  </td>
                </tr>
              ) : (
                requests.map((r) => {
                  const isPending = r.status === 'PENDING';
                  const isApproved = r.status === 'APPROVED';
                  const isMatched = r.status === 'MATCHED';
                  const isFulfilled = r.status === 'FULFILLED';
                  const isTerminal = ['FULFILLED', 'REJECTED', 'CANCELLED'].includes(r.status);

                  return (
                    <tr key={r._id || r.requestId} className="hover:bg-slate-50/70 transition">
                      <td className="p-4 font-mono font-bold text-slate-900">
                        {r.requestId || 'BLR-N/A'}
                      </td>
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{r.patientName}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {r.hospital || r.facilityName || 'Medical Center'} ({r.city})
                        </div>
                      </td>
                      <td className="p-4">
                        <span className="font-black text-sm text-[#B91C35] bg-red-50 border border-red-200/80 px-2.5 py-1 rounded-xl">
                          {r.bloodGroup}
                        </span>
                      </td>
                      <td className="p-4 font-bold text-slate-700">
                        {r.unitsRequired} {r.unitsRequired > 1 ? 'Units' : 'Unit'}
                        {r.unitsFulfilled > 0 && (
                          <span className="text-[10px] text-emerald-600 font-semibold block mt-0.5">
                            ({r.unitsFulfilled} fulfilled)
                          </span>
                        )}
                      </td>
                      <td className="p-4">
                        <PriorityBadge priority={r.priority} />
                      </td>
                      <td className="p-4">
                        <StatusBadge status={r.status} />
                      </td>
                      <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => setSelectedRequestDetails(r)}
                          title="View Requisition Dossier"
                          className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition inline-flex items-center"
                        >
                          <Eye size={15} />
                        </button>

                        {isPending && (
                          <>
                            <button
                              disabled={!isVerified}
                              onClick={() => onApproveRequest(r._id || r.requestId)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs ${
                                isVerified
                                  ? 'bg-sky-600 hover:bg-sky-700 text-white cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              Approve
                            </button>
                            <button
                              disabled={!isVerified}
                              onClick={() => {
                                setRejectModalReq(r);
                                setRejectionReason('');
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition ${
                                isVerified
                                  ? 'bg-rose-50 hover:bg-rose-100 text-rose-700 border-rose-200 cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 border-slate-200 cursor-not-allowed'
                              }`}
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {(isApproved || isMatched) && (
                          <>
                            <button
                              disabled={!isVerified}
                              onClick={() => onCoordinateDonors(r)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center gap-1 ${
                                isVerified
                                  ? 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <UserCheck size={13} />
                              <span>Outreach Donors</span>
                            </button>
                            <button
                              disabled={!isVerified}
                              onClick={() => {
                                setFulfillModalReq(r);
                                setFulfillUnits(r.unitsRequired);
                                setFulfillNotes('');
                              }}
                              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition shadow-xs inline-flex items-center gap-1 ${
                                isVerified
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              }`}
                            >
                              <CheckCircle2 size={13} />
                              <span>Fulfill</span>
                            </button>
                          </>
                        )}

                        {isTerminal && (
                          <span className="text-[11px] text-slate-400 font-semibold italic">
                            {isFulfilled ? 'Completed Transfusion' : 'Closed File'}
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

      {/* 4. Request Details Dossier Modal */}
      <AnimatePresence>
        {selectedRequestDetails && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-red-100 text-[#B91C35] font-black text-sm flex items-center justify-center">
                    {selectedRequestDetails.bloodGroup}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">
                      {selectedRequestDetails.patientName}
                    </h3>
                    <span className="text-[11px] font-mono text-slate-500">
                      ID: {selectedRequestDetails.requestId}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedRequestDetails(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Priority Status</span>
                  <div className="mt-1">
                    <PriorityBadge priority={selectedRequestDetails.priority} />
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Requisition Lifecycle</span>
                  <div className="mt-1">
                    <StatusBadge status={selectedRequestDetails.status} />
                  </div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Hospital Facility</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {selectedRequestDetails.hospital} ({selectedRequestDetails.city})
                  </span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Units Needed / Fulfilled</span>
                  <span className="font-bold text-slate-800 mt-1 block">
                    {selectedRequestDetails.unitsRequired} needed ({selectedRequestDetails.unitsFulfilled || 0} fulfilled)
                  </span>
                </div>
              </div>

              {selectedRequestDetails.requiredDate && (
                <div className="flex items-center gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
                  <Calendar size={14} className="text-slate-400" />
                  <span>Required by: <strong>{new Date(selectedRequestDetails.requiredDate).toLocaleDateString()}</strong></span>
                </div>
              )}

              {selectedRequestDetails.medicalNotes && (
                <div className="text-xs bg-slate-50 p-3.5 rounded-2xl border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 font-bold block flex items-center gap-1.5">
                    <FileText size={13} />
                    <span>Clinical & Surgical Notes:</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed">
                    {selectedRequestDetails.medicalNotes}
                  </p>
                </div>
              )}

              {selectedRequestDetails.rejectionReason && (
                <div className="text-xs bg-rose-50 text-rose-800 p-3.5 rounded-2xl border border-rose-200 space-y-1">
                  <span className="font-bold block flex items-center gap-1.5 text-rose-900">
                    <AlertTriangle size={13} />
                    <span>Rejection Justification:</span>
                  </span>
                  <p className="leading-relaxed">
                    {selectedRequestDetails.rejectionReason}
                  </p>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setSelectedRequestDetails(null)}
                  className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
                >
                  Close Dossier
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 5. Rejection Justification Modal */}
      <AnimatePresence>
        {rejectModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-rose-600 font-bold text-sm">
                <AlertCircle size={20} />
                <span>Reject Blood Requisition ({rejectModalReq.requestId})</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Provide administrative or clinical justification for declining this requisition (e.g., patient transfer, internal inventory covered, or duplicate entry).
              </p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Reason for declining requisition..."
                className="w-full text-xs p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectModalReq(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmReject}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
                >
                  {isSubmitting ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 6. Transfusion Fulfillment Modal */}
      <AnimatePresence>
        {fulfillModalReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center gap-2.5 text-emerald-600 font-bold text-sm">
                <CheckCircle2 size={20} />
                <span>Record Transfusion Fulfillment ({fulfillModalReq.requestId})</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Verify the units transfused for patient <strong>{fulfillModalReq.patientName}</strong> ({fulfillModalReq.bloodGroup}).
              </p>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Units Transfused / Fulfilled</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={fulfillUnits}
                    onChange={(e) => setFulfillUnits(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Clinical / Transfusion Notes</label>
                  <textarea
                    rows={3}
                    value={fulfillNotes}
                    onChange={(e) => setFulfillNotes(e.target.value)}
                    placeholder="Enter post-transfusion clinical observations or donor unit lot IDs..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setFulfillModalReq(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmFulfill}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
                >
                  {isSubmitting ? 'Recording...' : 'Confirm Fulfillment'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
