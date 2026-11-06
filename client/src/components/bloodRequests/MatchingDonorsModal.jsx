import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Users,
  MapPin,
  Phone,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ShieldCheck,
  Send
} from 'lucide-react';

export default function MatchingDonorsModal({
  isOpen,
  request,
  matchingData,
  isLoading,
  onClose,
  onNotifyDonor
}) {
  const [notifiedDonors, setNotifiedDonors] = useState({});

  if (!isOpen) return null;

  const donors = matchingData?.donors || [];
  const totalFound = matchingData?.totalMatchesFound || 0;
  const compatibleGroups = matchingData?.compatibleBloodGroups || [];
  const clinicalNotice =
    matchingData?.clinicalNotice ||
    'Donor matching provides potential candidates based on registered ABO/Rh compatibility and location. Final cross-matching must be performed by hospital medical staff.';

  const handleNotify = (donorId) => {
    setNotifiedDonors((prev) => ({ ...prev, [donorId]: true }));
    if (onNotifyDonor) onNotifyDonor(donorId);
  };

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
          className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-900 via-slate-900 to-slate-950 text-white p-6 flex items-center justify-between border-b border-purple-800/40">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-300 border border-purple-400/30 flex items-center justify-center">
                <Users size={24} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-bold text-white">
                    Compatible Donor Matching Engine
                  </h3>
                  <span className="text-xs bg-purple-500/30 text-purple-200 px-2.5 py-0.5 rounded-full font-bold">
                    {totalFound} Identified
                  </span>
                </div>
                <p className="text-xs text-purple-200/80 mt-0.5">
                  Target: {request?.patientName} • Group <strong className="text-white">{request?.bloodGroup}</strong> ({request?.unitsRequired} Units) • {request?.city}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
            >
              <X size={18} />
            </button>
          </div>

          {/* Compatible Groups Bar */}
          <div className="px-6 py-3 bg-purple-50/50 border-b border-purple-100/70 flex items-center gap-2 text-xs text-purple-900">
            <Sparkles size={14} className="text-purple-600 shrink-0" />
            <span>
              <strong>Acceptable Red Cell Donor Groups:</strong> {compatibleGroups.join(', ')}
            </span>
          </div>

          {/* Modal Body */}
          <div className="p-6 max-h-[70vh] overflow-y-auto space-y-4">
            {/* Clinical Oversight Notice */}
            <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <div className="leading-relaxed">
                <span className="font-bold block">Hospital Clinical Protocol:</span>
                {clinicalNotice}
              </div>
            </div>

            {/* List of Matched Donors */}
            {isLoading ? (
              <div className="space-y-3 py-4">
                {[1, 2, 3].map((n) => (
                  <div key={n} className="h-24 bg-slate-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : donors.length === 0 ? (
              <div className="text-center py-12 bg-slate-50 rounded-2xl border border-slate-200">
                <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                <h4 className="font-bold text-slate-800">No registered donors found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  No active volunteer donors with compatible blood types ({compatibleGroups.join(', ')}) are currently registered in this district.
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {donors.map(({ donor, matchDetails }) => {
                  const isNotified = notifiedDonors[donor._id];
                  const isEligible = matchDetails.eligibility?.isEligible;

                  return (
                    <div
                      key={donor._id}
                      className="p-5 rounded-2xl border border-slate-200 bg-white hover:border-purple-200 hover:shadow-md transition flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-[#B91C35] font-black text-lg flex items-center justify-center border border-red-200 shrink-0">
                          {donor.bloodGroup}
                        </div>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-bold text-slate-900 text-sm">{donor.name}</h4>
                            {matchDetails.isExactMatch ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                                Exact Match
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-sky-100 text-sky-800">
                                Compatible
                              </span>
                            )}
                            {matchDetails.isSameCity && (
                              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-100 text-purple-800">
                                Same City
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                            <span className="flex items-center gap-1">
                              <MapPin size={12} /> {donor.city || 'Location unlisted'}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone size={12} /> {donor.phone || 'Phone verified'}
                            </span>
                            <span>• Total Donations: {donor.totalDonations}</span>
                          </div>

                          {/* Eligibility Status Tag */}
                          <div className="pt-1">
                            {isEligible ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                                <CheckCircle2 size={12} />
                                Rest Interval Cleared (Eligible)
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                                <AlertTriangle size={12} />
                                {matchDetails.eligibility?.summary || 'Pending screening'}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Action Button */}
                      <div className="sm:self-center shrink-0">
                        <button
                          onClick={() => handleNotify(donor._id)}
                          disabled={isNotified}
                          className={`w-full sm:w-auto px-4 py-2.5 rounded-xl font-bold text-xs transition flex items-center justify-center gap-2 ${
                            isNotified
                              ? 'bg-emerald-100 text-emerald-800 cursor-default'
                              : 'bg-purple-600 hover:bg-purple-700 text-white shadow-sm'
                          }`}
                        >
                          {isNotified ? (
                            <>
                              <CheckCircle2 size={14} />
                              <span>Dispatch Alert Sent</span>
                            </>
                          ) : (
                            <>
                              <Send size={14} />
                              <span>Dispatch Emergency Alert</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2.5 text-xs font-bold rounded-xl bg-slate-900 text-white hover:bg-slate-800 transition"
            >
              Close Matching Engine
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
