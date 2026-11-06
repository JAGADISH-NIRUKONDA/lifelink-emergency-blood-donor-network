import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Droplet,
  FileText,
  Clock,
  AlertCircle
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';

export default function RequestDetailsModal({ isOpen, request, compatibility, onClose }) {
  if (!isOpen || !request) return null;

  const history = request.statusHistory || [];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-600/20 text-[#B91C35] border border-red-500/30 flex items-center justify-center font-black text-xl">
                {request.bloodGroup}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    Emergency Requisition #{request.requestId}
                  </h3>
                  <PriorityBadge priority={request.priority} />
                </div>
                <p className="text-xs text-slate-400 mt-0.5">
                  Treating Hospital: <span className="text-slate-200">{request.hospital}</span> • {request.city}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-400 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Modal Content */}
          <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
            {/* Status Summary Banner */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Current Lifecycle Status
                </span>
                <div className="mt-1">
                  <StatusBadge status={request.status} />
                </div>
              </div>

              <div className="text-left sm:text-right">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
                  Units Requisitioned
                </span>
                <span className="text-sm font-extrabold text-slate-900">
                  {request.unitsFulfilled || 0} Fulfilled of {request.unitsRequired} Required
                </span>
              </div>
            </div>

            {/* Rejection / Cancellation alerts if terminal */}
            {request.rejectionReason && (
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Hospital Rejection Reason:</span>
                  {request.rejectionReason}
                </div>
              </div>
            )}

            {request.cancellationReason && (
              <div className="p-4 rounded-xl bg-slate-100 border border-slate-200 text-xs text-slate-700 flex items-start gap-2.5">
                <AlertCircle size={16} className="text-slate-500 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Cancellation Note:</span>
                  {request.cancellationReason}
                </div>
              </div>
            )}

            {/* Patient & Requisition Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Patient & Hospital Information
                </span>
                <div>
                  <span className="text-slate-400 block">Admitted Patient</span>
                  <span className="font-semibold text-slate-800">{request.patientName}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Treating Institution</span>
                  <span className="font-semibold text-slate-800">{request.hospital}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Location / City</span>
                  <span className="font-semibold text-slate-800">{request.city}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block">
                  Emergency Contact & Timelines
                </span>
                <div>
                  <span className="text-slate-400 block">Contact Phone</span>
                  <span className="font-semibold text-slate-800">{request.contactPhone}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Required Transfusion Date</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(request.requiredDate).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block">Logged Timestamp</span>
                  <span className="font-semibold text-slate-800">
                    {new Date(request.createdAt).toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            {/* Medical / Diagnosis Notes */}
            {request.medicalNotes && (
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 uppercase tracking-wider text-[11px] block mb-1.5 flex items-center gap-1.5">
                  <FileText size={14} className="text-slate-400" />
                  Clinical & Diagnosis Notes
                </span>
                <p className="text-slate-700 leading-relaxed">{request.medicalNotes}</p>
              </div>
            )}

            {/* Biological Compatibility Matrix */}
            {compatibility && (
              <div className="p-4 rounded-xl bg-red-50/60 border border-red-200/80 text-xs">
                <span className="font-bold text-[#B91C35] uppercase tracking-wider text-[11px] block mb-2 flex items-center gap-1.5">
                  <Droplet size={14} className="fill-current" />
                  Compatible Blood Group Transfusion Sources
                </span>
                <div className="flex flex-wrap gap-2">
                  {compatibility.receiveFrom.map((grp) => (
                    <span
                      key={grp}
                      className="px-2.5 py-1 rounded-md bg-white border border-red-300 font-bold text-red-900 text-xs"
                    >
                      {grp} {grp === 'O-' ? '(Universal)' : ''}
                    </span>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-2">
                  Patients with {request.bloodGroup} can safely receive red blood cell units from the groups listed above under hospital cross-matching.
                </p>
              </div>
            )}

            {/* Status History Timeline */}
            <div>
              <span className="font-bold text-slate-900 uppercase tracking-wider text-xs block mb-3">
                Requisition Lifecycle Audit Trail
              </span>
              <div className="space-y-2.5">
                {history.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-3"
                  >
                    <Clock size={14} className="text-slate-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900">{step.status}</span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(step.changedAt).toLocaleString()}
                        </span>
                      </div>
                      {step.note && <p className="text-slate-600 mt-0.5">{step.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Close Requisition View
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
