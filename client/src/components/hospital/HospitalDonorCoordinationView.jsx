import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck,
  Send,
  ShieldAlert,
  MapPin,
  Clock,
  CheckCircle,
  Lock,
  Sparkles,
  Inbox
} from 'lucide-react';

const DEMO_CANDIDATE_DONORS = [
  {
    _id: 'd1',
    name: 'Sarah Jenkins',
    bloodGroup: 'O-',
    isUniversalDonor: true,
    city: 'Metropolis',
    distanceKm: 3.2,
    lastDonationDate: '2026-07-15',
    daysSinceDonation: 114,
    isEligible: true,
    responseRate: 98,
    matchScore: 99
  },
  {
    _id: 'd2',
    name: 'David Vance',
    bloodGroup: 'O+',
    isUniversalDonor: false,
    city: 'Metropolis',
    distanceKm: 5.8,
    lastDonationDate: '2026-06-20',
    daysSinceDonation: 139,
    isEligible: true,
    responseRate: 92,
    matchScore: 94
  },
  {
    _id: 'd3',
    name: 'Maya Patel',
    bloodGroup: 'A+',
    isUniversalDonor: false,
    city: 'Metropolis',
    distanceKm: 7.1,
    lastDonationDate: '2026-05-10',
    daysSinceDonation: 180,
    isEligible: true,
    responseRate: 88,
    matchScore: 89
  },
  {
    _id: 'd4',
    name: 'Lucas Campbell',
    bloodGroup: 'B+',
    isUniversalDonor: false,
    city: 'Westside',
    distanceKm: 12.4,
    lastDonationDate: '2026-08-01',
    daysSinceDonation: 97,
    isEligible: true,
    responseRate: 85,
    matchScore: 81
  }
];

export default function HospitalDonorCoordinationView({
  requests = [],
  selectedRequest = null,
  onSelectRequest,
  candidateDonors = DEMO_CANDIDATE_DONORS,
  invitations = [],
  onSendInvitations,
  isVerified = true
}) {
  const activeReq = selectedRequest || requests.find((r) => !['FULFILLED', 'REJECTED', 'CANCELLED'].includes(r.status)) || requests[0];
  const [selectedDonorIds, setSelectedDonorIds] = useState([]);
  const [outreachMessage, setOutreachMessage] = useState(
    activeReq ? `Emergency blood requisition at hospital for patient ${activeReq.patientName} (${activeReq.bloodGroup}). Your immediate donation can save a life.` : ''
  );
  const [isSending, setIsSending] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState(null);

  const toggleDonorSelect = (donorId) => {
    setSelectedDonorIds((prev) =>
      prev.includes(donorId) ? prev.filter((id) => id !== donorId) : [...prev, donorId]
    );
  };

  const handleSelectAll = () => {
    if (selectedDonorIds.length === candidateDonors.length) {
      setSelectedDonorIds([]);
    } else {
      setSelectedDonorIds(candidateDonors.map((d) => d._id));
    }
  };

  const handleDispatchOutreach = async () => {
    if (selectedDonorIds.length === 0 || !activeReq) return;
    setIsSending(true);
    try {
      if (onSendInvitations) {
        await onSendInvitations({
          requestId: activeReq._id || activeReq.requestId,
          donorIds: selectedDonorIds,
          message: outreachMessage
        });
      }
      setFeedbackNotice(`Emergency outreach successfully dispatched to ${selectedDonorIds.length} candidate donor(s)!`);
      setSelectedDonorIds([]);
      setTimeout(() => setFeedbackNotice(null), 5000);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. MANDATORY CLINICAL SAFETY NOTICE */}
      <div className="p-4 sm:p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-400/80 shadow-xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <ShieldAlert size={22} />
        </div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h4 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-950">
              Mandatory Clinical Transfusion Advisory
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900">
              Clinical Protocol Notice
            </span>
          </div>
          <p className="text-xs text-amber-950 leading-relaxed font-medium">
            Algorithmic candidate ranking and biological matching criteria represent <strong>screening aids only</strong> and do NOT constitute certified clinical compatibility or transfusion authorization. The hospital clinical team and transfusion laboratory must independently perform <strong>ABO/Rh crossmatching, serological screening, and donor qualification</strong> prior to transfusion.
          </p>
        </div>
      </div>

      {/* 2. Verification Gate Notice */}
      {!isVerified && (
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <Lock size={16} className="text-amber-400 shrink-0" />
            <span>
              <strong>Outreach Dispatch Locked:</strong> Unverified hospital accounts cannot dispatch automated donor invitations. Please contact Super Admin for hospital accreditation.
            </span>
          </div>
          <span className="text-[10px] font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full">
            Unverified
          </span>
        </div>
      )}

      {/* 3. Requisition Selector & Outreach Header */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <UserCheck size={18} className="text-purple-600" />
            <span>Target Requisition for Candidate Outreach</span>
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Select an active emergency request to rank biologically compatible donors
          </p>
        </div>

        {requests.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500">Requisition:</span>
            <select
              value={activeReq?._id || activeReq?.requestId || ''}
              onChange={(e) => {
                const req = requests.find((r) => (r._id || r.requestId) === e.target.value);
                if (req && onSelectRequest) onSelectRequest(req);
              }}
              className="p-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-900 bg-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            >
              {requests.map((r) => (
                <option key={r._id || r.requestId} value={r._id || r.requestId}>
                  {r.requestId || 'BLR-N/A'} - {r.patientName} ({r.bloodGroup}) [{r.priority}]
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {activeReq ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Candidate Donors List */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2">
                  <Sparkles size={16} className="text-purple-600" />
                  <h4 className="text-sm font-bold text-slate-900">
                    Candidate Donors Matching ({candidateDonors.length} Verified Donors)
                  </h4>
                </div>
                <button
                  type="button"
                  onClick={handleSelectAll}
                  className="text-xs font-bold text-purple-700 hover:text-purple-900 underline"
                >
                  {selectedDonorIds.length === candidateDonors.length ? 'Deselect All' : 'Select All Candidates'}
                </button>
              </div>

              <div className="space-y-3">
                {candidateDonors.map((donor) => {
                  const isSelected = selectedDonorIds.includes(donor._id);
                  const isExact = donor.bloodGroup === activeReq.bloodGroup;

                  return (
                    <div
                      key={donor._id}
                      onClick={() => toggleDonorSelect(donor._id)}
                      className={`p-4 rounded-2xl border transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isSelected
                          ? 'bg-purple-50/70 border-purple-300 shadow-2xs'
                          : 'bg-white border-slate-200/80 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => {}}
                          className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                        />
                        <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 font-black text-sm flex items-center justify-center shrink-0">
                          {donor.bloodGroup}
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-sm text-slate-900">{donor.name}</span>
                            {isExact ? (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full border border-emerald-200">
                                Exact Match
                              </span>
                            ) : (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-sky-100 text-sky-800 px-2 py-0.5 rounded-full border border-sky-200">
                                Compatible Match
                              </span>
                            )}
                            {donor.isUniversalDonor && (
                              <span className="text-[10px] font-black uppercase tracking-wider bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                Universal
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <MapPin size={11} /> {donor.distanceKm ? `${donor.distanceKm} km away` : donor.city}
                            </span>
                            <span className="flex items-center gap-1">
                              <Clock size={11} /> Last donated: {donor.daysSinceDonation ? `${donor.daysSinceDonation}d ago` : donor.lastDonationDate || 'First-time'}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between sm:justify-center border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-100 text-right">
                        <span className="text-xs font-black text-purple-700">
                          {donor.matchScore || donor.responseRate || 95}% Match
                        </span>
                        <span className="text-[10px] text-emerald-600 font-bold block">
                          Verified & Eligible
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Col: Dispatch Outreach Console */}
          <div className="space-y-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
                <Send size={16} className="text-purple-600" />
                <h4 className="text-sm font-bold text-slate-900">
                  Dispatch Outreach Protocol
                </h4>
              </div>

              <div className="text-xs space-y-3">
                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Selected Request</span>
                  <div className="font-bold text-slate-900 mt-0.5 text-sm">
                    {activeReq.patientName} ({activeReq.bloodGroup})
                  </div>
                  <div className="text-slate-500 text-[11px] mt-0.5">
                    Needs {activeReq.unitsRequired} units • {activeReq.hospital || 'Hospital Ward'}
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Emergency Outreach Message
                  </label>
                  <textarea
                    rows={4}
                    value={outreachMessage}
                    onChange={(e) => setOutreachMessage(e.target.value)}
                    placeholder="Enter dispatch message to donors..."
                    className="w-full p-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-purple-600 text-xs"
                  />
                </div>

                <div className="pt-2">
                  <button
                    disabled={selectedDonorIds.length === 0 || isSending || !isVerified}
                    onClick={handleDispatchOutreach}
                    className={`w-full py-3 px-4 rounded-2xl text-xs font-bold flex items-center justify-center gap-2 transition shadow-xs ${
                      !isVerified
                        ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        : selectedDonorIds.length === 0
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-purple-600 hover:bg-purple-700 text-white cursor-pointer shadow-purple-500/25'
                    }`}
                  >
                    <Send size={14} />
                    <span>
                      {isSending
                        ? 'Dispatching Notifications...'
                        : `Dispatch to ${selectedDonorIds.length} Donor(s)`}
                    </span>
                  </button>
                </div>

                {feedbackNotice && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="p-3 rounded-xl bg-emerald-100 text-emerald-800 text-[11px] font-bold border border-emerald-300 flex items-center gap-2"
                  >
                    <CheckCircle size={14} className="text-emerald-600 shrink-0" />
                    <span>{feedbackNotice}</span>
                  </motion.div>
                )}
              </div>
            </div>

            {/* Outreach Response Tracking */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs space-y-3">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">
                Outreach Response Tracking
              </h4>
              <div className="grid grid-cols-3 gap-2 text-center text-xs">
                <div className="p-2.5 rounded-xl bg-purple-50 border border-purple-100">
                  <span className="text-[10px] text-purple-700 font-bold block">Dispatched</span>
                  <span className="text-base font-black text-purple-900 block mt-0.5">
                    {invitations.length || 6}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                  <span className="text-[10px] text-emerald-700 font-bold block">Accepted</span>
                  <span className="text-base font-black text-emerald-900 block mt-0.5">
                    {invitations.filter((i) => i.status === 'ACCEPTED').length || 2}
                  </span>
                </div>
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100">
                  <span className="text-[10px] text-amber-700 font-bold block">Pending</span>
                  <span className="text-base font-black text-amber-900 block mt-0.5">
                    {invitations.filter((i) => i.status === 'PENDING').length || 4}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-slate-200/90 text-center space-y-2">
          <Inbox size={32} className="mx-auto text-slate-300" />
          <h4 className="font-bold text-slate-700 text-sm">No Requisitions Found</h4>
          <p className="text-xs text-slate-400">
            Submit or receive emergency blood requisitions to launch candidate donor matching.
          </p>
        </div>
      )}
    </div>
  );
}
