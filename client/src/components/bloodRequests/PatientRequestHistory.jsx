import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Hospital,
  MapPin,
  Calendar,
  Eye,
  Ban,
  PlusCircle,
  FileQuestion
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';

export default function PatientRequestHistory({
  requests = [],
  isLoading = false,
  onViewDetails,
  onCancelRequest,
  onCreateNew
}) {
  const [cancellingId, setCancellingId] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [isSubmittingCancel, setIsSubmittingCancel] = useState(false);

  const handleOpenCancelDialog = (request) => {
    setCancellingId(request._id || request.requestId);
    setCancelReason('');
  };

  const handleConfirmCancel = async () => {
    if (!cancellingId) return;
    setIsSubmittingCancel(true);
    try {
      await onCancelRequest(cancellingId, cancelReason || 'Patient cancelled requisition');
      setCancellingId(null);
    } finally {
      setIsSubmittingCancel(false);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((n) => (
          <div
            key={n}
            className="p-6 rounded-2xl border border-slate-200 bg-white animate-pulse space-y-3"
          >
            <div className="flex justify-between items-center">
              <div className="h-5 w-32 bg-slate-200 rounded-md" />
              <div className="h-5 w-24 bg-slate-200 rounded-full" />
            </div>
            <div className="h-4 w-48 bg-slate-100 rounded-md" />
            <div className="h-4 w-64 bg-slate-100 rounded-md" />
          </div>
        ))}
      </div>
    );
  }

  if (requests.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 p-8 shadow-sm">
        <div className="w-16 h-16 bg-red-50 text-[#B91C35] rounded-3xl flex items-center justify-center mx-auto mb-4">
          <FileQuestion size={32} />
        </div>
        <h3 className="text-lg font-bold text-slate-900">No Blood Requisitions Found</h3>
        <p className="text-sm text-slate-500 max-w-sm mx-auto mt-2 leading-relaxed">
          You haven't submitted any blood assistance requests yet. When an emergency arises, submit a requisition here.
        </p>
        {onCreateNew && (
          <button
            onClick={onCreateNew}
            className="mt-6 inline-flex items-center gap-2 bg-[#B91C35] hover:bg-[#9E152C] text-white font-semibold text-sm px-6 py-3 rounded-xl transition shadow-md shadow-red-900/15"
          >
            <PlusCircle size={16} />
            <span>Create Emergency Requisition</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {requests.map((req) => {
        const canCancel = ['PENDING', 'APPROVED', 'MATCHED'].includes(req.status);
        const reqId = req._id || req.requestId;

        return (
          <motion.div
            key={reqId}
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-red-50 text-[#B91C35] font-black text-lg flex items-center justify-center border border-red-200/60 shadow-2xs">
                  {req.bloodGroup}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      {req.patientName}
                    </h3>
                    <span className="text-xs text-slate-400 font-mono">
                      #{req.requestId}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-1.5 mt-0.5">
                    <Hospital size={13} className="text-slate-400" />
                    <span>{req.hospital}</span>
                    <span>•</span>
                    <MapPin size={13} className="text-slate-400" />
                    <span>{req.city}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2.5">
                <PriorityBadge priority={req.priority} />
                <StatusBadge status={req.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs py-1">
              <div>
                <span className="text-slate-400 block font-medium">Units Required</span>
                <span className="font-bold text-slate-800 text-sm">
                  {req.unitsRequired} {req.unitsRequired === 1 ? 'Unit' : 'Units'}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Fulfilled</span>
                <span className="font-bold text-emerald-700 text-sm">
                  {req.unitsFulfilled || 0} / {req.unitsRequired}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Required Date</span>
                <span className="font-bold text-slate-800 text-sm flex items-center gap-1">
                  <Calendar size={13} className="text-slate-400" />
                  {new Date(req.requiredDate).toLocaleDateString()}
                </span>
              </div>

              <div>
                <span className="text-slate-400 block font-medium">Created On</span>
                <span className="font-medium text-slate-600">
                  {new Date(req.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {/* Actions Bar */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
              <button
                onClick={() => onViewDetails(req)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 bg-slate-50 hover:bg-slate-100 transition border border-slate-200"
              >
                <Eye size={14} />
                <span>View Details</span>
              </button>

              {canCancel && (
                <button
                  onClick={() => handleOpenCancelDialog(req)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 transition border border-rose-200"
                >
                  <Ban size={14} />
                  <span>Cancel Request</span>
                </button>
              )}
            </div>

            {/* Inline Cancel Reason Confirmation Modal */}
            {cancellingId === reqId && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="mt-4 p-4 rounded-xl bg-rose-50/70 border border-rose-200 space-y-3"
              >
                <div className="flex items-center justify-between text-xs font-bold text-rose-900">
                  <span>Confirm Cancellation for Request #{req.requestId}</span>
                  <button
                    onClick={() => setCancellingId(null)}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    Dismiss
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Optional: State reason for cancellation (e.g. Received blood from family donor)"
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  className="w-full text-xs p-2.5 rounded-lg border border-rose-300 bg-white focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setCancellingId(null)}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-800"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    disabled={isSubmittingCancel}
                    onClick={handleConfirmCancel}
                    className="px-4 py-1.5 text-xs font-bold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition"
                  >
                    {isSubmittingCancel ? 'Cancelling...' : 'Confirm Cancellation'}
                  </button>
                </div>
              </motion.div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
