import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Flame,
  MapPin,
  Eye,
  Send,
  X,
  FileText,
  CheckCircle2
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from '../bloodRequests/StatusBadge';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const URGENCIES = ['ALL', 'CRITICAL', 'HIGH', 'NORMAL'];

export default function DonorRequestsDiscoveryView({
  requests = [],
  donorBloodGroup = 'O-',
  onRespondToRequest
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('ALL');
  const [selectedUrgency, setSelectedUrgency] = useState('ALL');

  // Response dialog state
  const [respondReq, setRespondReq] = useState(null);
  const [respondDecision, setRespondDecision] = useState('ACCEPTED'); // 'ACCEPTED' | 'REJECTED'
  const [responseNotes, setResponseNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Requisition Dossier modal
  const [detailsReq, setDetailsReq] = useState(null);

  const filteredRequests = requests.filter((r) => {
    if (selectedGroup !== 'ALL' && r.bloodGroup !== selectedGroup) return false;
    if (selectedUrgency !== 'ALL' && r.priority !== selectedUrgency) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = r.requestId?.toLowerCase().includes(term);
      const matchHosp = (r.hospital || '').toLowerCase().includes(term);
      const matchCity = (r.city || '').toLowerCase().includes(term);
      if (!matchId && !matchHosp && !matchCity) return false;
    }
    return true;
  });

  const handleConfirmResponse = async () => {
    if (!respondReq) return;
    setIsSubmitting(true);
    try {
      if (onRespondToRequest) {
        await onRespondToRequest(respondReq._id || respondReq.requestId, {
          response: respondDecision,
          notes: responseNotes
        });
      }
      setFeedback(`Response recorded successfully: ${respondDecision === 'ACCEPTED' ? 'Accepted Requisition' : 'Declined'}.`);
      setRespondReq(null);
      setResponseNotes('');
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Toolbar & Filters */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Flame size={18} className="text-[#B91C35]" />
              <span>Emergency Blood Requisitions Discovery</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Urgent hospital transfusion requests compatible with your biological profile
            </p>
          </div>

          <span className="text-xs font-bold text-slate-600 bg-red-50 text-[#B91C35] border border-red-200 px-3 py-1 rounded-full self-start md:self-center">
            Donor Blood Type: {donorBloodGroup}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 pt-2 border-t border-slate-100">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by Hospital, City, or Requisition ID..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Group:
            </span>
            <select
              value={selectedGroup}
              onChange={(e) => setSelectedGroup(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
            >
              {BLOOD_GROUPS.map((g) => (
                <option key={g} value={g}>{g === 'ALL' ? 'All Blood Types' : g}</option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Urgency:
            </span>
            <select
              value={selectedUrgency}
              onChange={(e) => setSelectedUrgency(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-800 bg-white"
            >
              {URGENCIES.map((u) => (
                <option key={u} value={u}>{u === 'ALL' ? 'All Urgencies' : u}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {feedback && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{feedback}</span>
        </motion.div>
      )}

      {/* 2. Requests Grid / Cards */}
      {filteredRequests.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center space-y-2">
          <CheckCircle2 size={32} className="mx-auto text-emerald-500" />
          <h4 className="font-bold text-slate-800 text-sm">No Urgent Requisitions Matching Criteria</h4>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            All current nearby hospital blood demands are currently satisfied or undergoing active cross-matching.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredRequests.map((r) => {
            const hasResponded = r.myResponse?.status;
            const isAccepted = r.myResponse?.status === 'ACCEPTED';
            const isRejected = r.myResponse?.status === 'REJECTED';

            return (
              <motion.div
                key={r._id || r.requestId}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs hover:shadow-sm transition flex flex-col justify-between space-y-4"
              >
                <div>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C35] font-black text-lg flex items-center justify-center border border-red-200 shrink-0">
                        {r.bloodGroup}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold text-slate-400">
                            {r.requestId}
                          </span>
                          <PriorityBadge priority={r.priority} />
                        </div>
                        <h4 className="font-bold text-sm text-slate-900 mt-0.5">
                          {r.hospital || 'Accredited Medical Center'}
                        </h4>
                        <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin size={11} /> {r.city}
                        </span>
                      </div>
                    </div>

                    <StatusBadge status={r.status} />
                  </div>

                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-200/80 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Units Required</span>
                      <span className="font-bold text-slate-800">{r.unitsRequired} Units Needed</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Required By</span>
                      <span className="font-bold text-slate-800">
                        {r.requiredDate ? new Date(r.requiredDate).toLocaleDateString() : 'Immediate'}
                      </span>
                    </div>
                  </div>

                  {r.medicalNotes && (
                    <p className="text-[11px] text-slate-600 italic mt-2.5 line-clamp-2">
                      "{r.medicalNotes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button
                    onClick={() => setDetailsReq(r)}
                    className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition inline-flex items-center gap-1 text-xs font-semibold"
                  >
                    <Eye size={14} />
                    <span>Dossier</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {hasResponded ? (
                      <span className={`px-3 py-1.5 rounded-xl text-xs font-bold ${
                        isAccepted
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {isAccepted ? '✓ You Accepted' : isRejected ? '✗ Declined' : 'Responded'}
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => {
                            setRespondReq(r);
                            setRespondDecision('REJECTED');
                            setResponseNotes('');
                          }}
                          className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition cursor-pointer"
                        >
                          Decline
                        </button>
                        <button
                          onClick={() => {
                            setRespondReq(r);
                            setRespondDecision('ACCEPTED');
                            setResponseNotes('');
                          }}
                          className="px-4 py-1.5 rounded-xl bg-[#B91C35] hover:bg-red-700 text-white text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <Send size={12} />
                          <span>I'll Donate</span>
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* 3. Response Modal */}
      <AnimatePresence>
        {respondReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <h3 className="font-bold text-slate-900 text-sm flex items-center gap-2">
                  <Send size={16} className="text-[#B91C35]" />
                  <span>Respond to Emergency Requisition</span>
                </h3>
                <button onClick={() => setRespondReq(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs space-y-1">
                <span className="font-bold text-slate-800 block text-sm">
                  {respondReq.hospital} ({respondReq.bloodGroup})
                </span>
                <span className="text-slate-500 block">
                  Requisition: <strong className="font-mono text-slate-700">{respondReq.requestId}</strong> • {respondReq.city}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Your Response Decision</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRespondDecision('ACCEPTED')}
                      className={`p-2.5 rounded-xl font-bold border transition ${
                        respondDecision === 'ACCEPTED'
                          ? 'bg-emerald-50 border-emerald-500 text-emerald-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      ✓ I Can Donate
                    </button>
                    <button
                      type="button"
                      onClick={() => setRespondDecision('REJECTED')}
                      className={`p-2.5 rounded-xl font-bold border transition ${
                        respondDecision === 'REJECTED'
                          ? 'bg-rose-50 border-rose-500 text-rose-800 shadow-xs'
                          : 'bg-white border-slate-200 text-slate-600'
                      }`}
                    >
                      ✗ Cannot Make It
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Operational Note to Hospital (Optional)
                  </label>
                  <textarea
                    rows={3}
                    value={responseNotes}
                    onChange={(e) => setResponseNotes(e.target.value)}
                    placeholder="e.g. Can arrive at the blood bank at 2:00 PM today..."
                    className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRespondReq(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={handleConfirmResponse}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-slate-900 hover:bg-slate-800 text-white transition shadow-sm"
                >
                  {isSubmitting ? 'Transmitting...' : 'Confirm Response'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* 4. Request Details Modal */}
      <AnimatePresence>
        {detailsReq && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl border border-slate-200 space-y-4 text-xs"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="w-8 h-8 rounded-xl bg-red-100 text-[#B91C35] font-black text-xs flex items-center justify-center">
                    {detailsReq.bloodGroup}
                  </span>
                  <div>
                    <h3 className="font-bold text-slate-900 text-sm">{detailsReq.hospital}</h3>
                    <span className="font-mono text-[10px] text-slate-400">ID: {detailsReq.requestId}</span>
                  </div>
                </div>
                <button onClick={() => setDetailsReq(null)} className="p-1 rounded-lg text-slate-400 hover:bg-slate-100">
                  <X size={16} />
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Urgency Priority</span>
                  <div className="mt-1"><PriorityBadge priority={detailsReq.priority} /></div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Status</span>
                  <div className="mt-1"><StatusBadge status={detailsReq.status} /></div>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Required Units</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{detailsReq.unitsRequired} Units</span>
                </div>
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">City / Location</span>
                  <span className="font-bold text-slate-800 mt-0.5 block">{detailsReq.city}</span>
                </div>
              </div>

              {detailsReq.medicalNotes && (
                <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
                  <span className="text-slate-500 font-bold block flex items-center gap-1">
                    <FileText size={13} />
                    <span>Clinical Notes:</span>
                  </span>
                  <p className="text-slate-700 leading-relaxed">{detailsReq.medicalNotes}</p>
                </div>
              )}

              <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-300 text-amber-950 text-[11px] leading-relaxed">
                Patient identity and diagnostic records are protected under medical confidentiality laws. Transfusion will be conducted directly at the hospital facility.
              </div>

              <div className="flex justify-end pt-2">
                <button
                  onClick={() => setDetailsReq(null)}
                  className="px-4 py-2 rounded-xl bg-slate-900 text-white font-bold"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
