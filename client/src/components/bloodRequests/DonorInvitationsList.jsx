import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  Building2,
  Calendar,
  Check
} from 'lucide-react';
import StatusBadge, { PriorityBadge } from './StatusBadge';

function formatExpiry(expiresAt) {
  if (!expiresAt) return '24h remaining';
  const diffMs = new Date(expiresAt).getTime() - Date.now();
  if (diffMs <= 0) return 'Expired';
  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return `${hours}h ${mins}m remaining`;
}

function checkIsExpired(inv) {
  if (inv.status === 'EXPIRED') return true;
  if (inv.status === 'INVITED' && new Date(inv.expiresAt).getTime() < Date.now()) return true;
  return false;
}

export default function DonorInvitationsList({
  invitations = [],
  onAcceptInvitation,
  onRejectInvitation,
  isLoading: _isLoading
}) {
  const [selectedInvitation, setSelectedInvitation] = useState(null);
  const [actionType, setActionType] = useState(null); // 'ACCEPT' | 'REJECT'
  const [responseNotes, setResponseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleOpenActionModal = (invitation, type) => {
    setSelectedInvitation(invitation);
    setActionType(type);
    setResponseNotes(type === 'ACCEPT' ? 'Available to donate. Ready for hospital cross-match.' : 'Unable to donate at this time.');
  };

  const handleConfirmAction = async () => {
    if (!selectedInvitation || !actionType) return;
    setIsSubmitting(true);
    try {
      if (actionType === 'ACCEPT') {
        await onAcceptInvitation(selectedInvitation._id, responseNotes);
      } else {
        await onRejectInvitation(selectedInvitation._id, responseNotes);
      }
      setSelectedInvitation(null);
      setActionType(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner Notice */}
      <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200/80 flex items-start gap-3">
        <Mail className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
        <div className="text-xs text-purple-900 leading-relaxed">
          <strong>Direct Emergency Invitations:</strong> When verified hospitals initiate matching for compatible patients, invitations appear here. Review the request details and respond promptly to assist clinical coordination.
        </div>
      </div>

      {/* Invitations List */}
      {invitations.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-100 shadow-xs">
          <Mail className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h4 className="text-base font-bold text-slate-800">No Active Invitations</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            You will receive instant alerts and email notifications whenever hospital staff dispatch donation requests matching your blood group.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {invitations.map((inv) => {
            const req = inv.request || {};
            const isPendingResponse = inv.status === 'INVITED';
            const isCritical = req.priority === 'CRITICAL' || inv.priority === 'CRITICAL';
            const isExpired = checkIsExpired(inv);

            return (
              <motion.div
                key={inv._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-5 rounded-3xl border transition relative overflow-hidden flex flex-col justify-between ${
                  isCritical && isPendingResponse
                    ? 'bg-rose-50/30 border-rose-200 shadow-sm'
                    : 'bg-white border-slate-200/80 hover:border-slate-300 shadow-2xs'
                }`}
              >
                {/* Top Row: Blood Group & Priority */}
                <div>
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C35] border border-red-200/60 flex items-center justify-center font-black text-lg shadow-2xs">
                        {req.bloodGroup || inv.compatibilityDetails?.compatibleBloodGroup || 'O+'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm text-slate-900">
                            {req.requestId || 'BLR-EMERGENCY'}
                          </h4>
                          <PriorityBadge priority={req.priority || inv.priority || 'NORMAL'} />
                        </div>
                        <p className="text-xs text-slate-500 font-medium">
                          Patient: {req.patientName || 'Emergency Patient'} • {req.unitsRequired || 1} Unit(s)
                        </p>
                      </div>
                    </div>

                    <StatusBadge status={inv.status} />
                  </div>

                  {/* Hospital & Location */}
                  <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-600">
                    <div className="flex items-center gap-2">
                      <Building2 size={14} className="text-slate-400 shrink-0" />
                      <span className="font-semibold text-slate-800">{req.hospital || 'Hospital Facility'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-slate-400 shrink-0" />
                      <span>{req.city || 'Regional Center'}</span>
                      {inv.compatibilityDetails?.isSameCity && (
                        <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.2 rounded-full">
                          Same City
                        </span>
                      )}
                    </div>
                    {req.requiredDate && (
                      <div className="flex items-center gap-2">
                        <Calendar size={14} className="text-slate-400 shrink-0" />
                        <span>Needed by: {new Date(req.requiredDate).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>

                  {/* Expiry indicator */}
                  {isPendingResponse && (
                    <div className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-amber-700 bg-amber-50/80 px-3 py-1.5 rounded-xl border border-amber-200/60">
                      <Clock size={13} />
                      <span>Respond promptly: {formatExpiry(inv.expiresAt)}</span>
                    </div>
                  )}

                  {inv.responseNotes && (
                    <p className="mt-2 text-xs text-slate-500 italic bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      "{inv.responseNotes}"
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-5 pt-3 border-t border-slate-100 flex items-center gap-2">
                  {isPendingResponse && !isExpired ? (
                    <>
                      <button
                        onClick={() => handleOpenActionModal(inv, 'ACCEPT')}
                        className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-2.5 px-3 rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
                      >
                        <Check size={14} />
                        <span>Accept Invitation</span>
                      </button>
                      <button
                        onClick={() => handleOpenActionModal(inv, 'REJECT')}
                        className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2.5 px-3 rounded-xl transition cursor-pointer"
                      >
                        Decline
                      </button>
                    </>
                  ) : (
                    <div className="w-full text-center py-1 text-xs text-slate-400 font-medium">
                      {inv.status === 'ACCEPTED' && '✓ You accepted this donation invitation'}
                      {inv.status === 'REJECTED' && '✕ You declined this invitation'}
                      {isExpired && '⚠ Invitation expired'}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Action Dialog / Modal */}
      <AnimatePresence>
        {selectedInvitation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedInvitation(null)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 z-10"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'ACCEPT' ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                }`}>
                  {actionType === 'ACCEPT' ? <CheckCircle2 size={22} /> : <XCircle size={22} />}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    {actionType === 'ACCEPT' ? 'Confirm Donation Acceptance' : 'Decline Donation Invitation'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    Requisition {selectedInvitation.request?.requestId || 'BLR-EMERGENCY'}
                  </p>
                </div>
              </div>

              <div className="text-xs text-slate-600 mb-4 leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                {actionType === 'ACCEPT' ? (
                  <>
                    By accepting, you confirm your voluntary willingness to undergo hospital cross-matching at{' '}
                    <strong>{selectedInvitation.request?.hospital}</strong>. Your contact information will be shared with the transfusion desk.
                  </>
                ) : (
                  <>
                    Declining this invitation allows the LifeLink matching engine to promptly dispatch the request to other compatible voluntary donors.
                  </>
                )}
              </div>

              <div className="mb-5">
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Optional Notes for Clinical Staff:
                </label>
                <textarea
                  rows={2}
                  value={responseNotes}
                  onChange={(e) => setResponseNotes(e.target.value)}
                  placeholder="e.g. Can arrive by 4 PM, phone is best..."
                  className="w-full text-xs p-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                />
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setSelectedInvitation(null)}
                  className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmAction}
                  className={`flex-1 py-2.5 text-xs font-bold text-white rounded-xl transition shadow-xs cursor-pointer ${
                    actionType === 'ACCEPT'
                      ? 'bg-emerald-600 hover:bg-emerald-700'
                      : 'bg-rose-600 hover:bg-rose-700'
                  }`}
                >
                  {isSubmitting ? 'Submitting...' : actionType === 'ACCEPT' ? 'Confirm Accept' : 'Confirm Decline'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

