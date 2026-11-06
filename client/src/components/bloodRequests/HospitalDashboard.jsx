import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Flame,
  Users,
  CheckCheck,
  Eye,
  MapPin,
  AlertCircle,
  Activity,
  Droplet
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'MATCHED', 'FULFILLED', 'REJECTED', 'CANCELLED'];
const PRIORITIES = ['ALL', 'CRITICAL', 'HIGH', 'NORMAL'];

export default function HospitalDashboard({
  requests = [],
  stats = {},
  isLoading = false,
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
  onFindDonors,
  onViewDetails
}) {
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    setIsProcessing(true);
    try {
      await onRejectRequest(rejectingId, rejectionReason || 'Institutional review rejection');
      setRejectingId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const overview = stats?.overview || {};

  return (
    <div className="space-y-6">
      {/* Top Analytics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold shrink-0">
            <Flame className="w-6 h-6 text-red-600 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {overview.criticalRequests ?? requests.filter((r) => r.priority === 'CRITICAL').length}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Critical Urgency
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {overview.pendingRequests ?? requests.filter((r) => r.status === 'PENDING').length}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Pending Triage
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6 text-purple-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {overview.matchedRequests ?? requests.filter((r) => r.status === 'MATCHED').length}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Donors Dispatched
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {overview.fulfilledRequests ?? requests.filter((r) => r.status === 'FULFILLED').length}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Transfusions Fulfilled
            </span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search by Request ID, Patient Name, Hospital, or City..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            />
          </div>

          {/* Blood group select */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Group:
            </span>
            <select
              value={selectedBloodGroup}
              onChange={(e) => onBloodGroupChange(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#B91C35] bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
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
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
              Priority:
            </span>
            <select
              value={selectedPriority}
              onChange={(e) => onPriorityChange(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === 'ALL' ? 'All Priorities' : p}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-1 border-t border-slate-100">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider pr-2">
            Status:
          </span>
          {STATUSES.map((st) => (
            <button
              key={st}
              onClick={() => onStatusChange(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                selectedStatus === st
                  ? 'bg-[#B91C35] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Requests Table / Cards */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-20 bg-white rounded-xl border border-slate-200 animate-pulse" />
          ))}
        </div>
      ) : requests.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200">
          <Droplet className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="font-bold text-slate-800">No matching blood requests found</h4>
          <p className="text-xs text-slate-500 mt-1">
            Try adjusting your search query, priority filter, or blood group selection.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Request / Patient</th>
                  <th className="py-3.5 px-4">Group</th>
                  <th className="py-3.5 px-4">Units</th>
                  <th className="py-3.5 px-4">Hospital & Location</th>
                  <th className="py-3.5 px-4">Priority</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Clinical Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {requests.map((req) => {
                  const reqId = req._id || req.requestId;
                  const isPending = req.status === 'PENDING';
                  const isApproved = req.status === 'APPROVED';
                  const isMatched = req.status === 'MATCHED';

                  return (
                    <tr key={reqId} className="hover:bg-slate-50/70 transition">
                      {/* Patient & ID */}
                      <td className="py-4 px-4 font-medium">
                        <div className="font-bold text-slate-900 text-sm">{req.patientName}</div>
                        <div className="font-mono text-[11px] text-slate-400">#{req.requestId}</div>
                      </td>

                      {/* Blood Group */}
                      <td className="py-4 px-4">
                        <span className="w-9 h-9 rounded-lg bg-red-50 text-[#B91C35] font-black text-xs flex items-center justify-center border border-red-200/70">
                          {req.bloodGroup}
                        </span>
                      </td>

                      {/* Units Required vs Fulfilled */}
                      <td className="py-4 px-4">
                        <span className="font-bold text-slate-800 text-sm">
                          {req.unitsFulfilled || 0} / {req.unitsRequired}
                        </span>
                        <span className="text-[10px] text-slate-400 block">Units</span>
                      </td>

                      {/* Hospital & City */}
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-800">{req.hospital}</div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <MapPin size={11} /> {req.city}
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="py-4 px-4">
                        <PriorityBadge priority={req.priority} />
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={req.status} />
                      </td>

                      {/* Clinical Actions */}
                      <td className="py-4 px-4 text-right space-x-1.5 whitespace-nowrap">
                        {isPending && (
                          <>
                            <button
                              onClick={() => onApproveRequest(reqId)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition shadow-2xs"
                              title="Approve Requisition"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => setRejectingId(reqId)}
                              className="px-2.5 py-1.5 rounded-lg bg-rose-100 hover:bg-rose-200 text-rose-800 font-bold text-[11px] transition"
                              title="Reject Requisition"
                            >
                              Reject
                            </button>
                          </>
                        )}

                        {(isApproved || isMatched) && (
                          <>
                            <button
                              onClick={() => onFindDonors(req)}
                              className="px-2.5 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white font-bold text-[11px] transition shadow-2xs inline-flex items-center gap-1"
                              title="Find Compatible Donors"
                            >
                              <Users size={12} />
                              Find Donors
                            </button>
                            <button
                              onClick={() => onFulfillRequest(reqId)}
                              className="px-2.5 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-[11px] transition"
                              title="Record Clinical Fulfillment"
                            >
                              Fulfilled
                            </button>
                          </>
                        )}

                        <button
                          onClick={() => onViewDetails(req)}
                          className="px-2 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium text-[11px] transition"
                          title="View Requisition File"
                        >
                          <Eye size={13} className="inline mr-1" />
                          File
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Inline Reject Modal */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertCircle className="text-rose-600" size={18} />
                Reject Emergency Blood Requisition
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Please state the clinical or institutional reason for rejection (e.g. duplicate patient file, hospital inventory available, or invalid admitting ward details).
              </p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection justification..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmReject}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
