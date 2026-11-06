import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  XCircle,
  Clock,
  Search,
  CheckCircle2,
  FileCheck,
  AlertCircle,
  X
} from 'lucide-react';

export default function AdminHospitalVerification({
  hospitals = [],
  pendingHospitals = [],
  onVerifyHospital,
  onRejectHospital,
  onSearch
}) {
  const [activeTab, setActiveTab] = useState('PENDING'); // 'PENDING' | 'ALL'
  const [searchTerm, setSearchTerm] = useState('');
  const [reviewingHospital, setReviewingHospital] = useState(null);
  const [actionType, setActionType] = useState('VERIFY'); // 'VERIFY' | 'REJECT'
  const [verificationNotes, setVerificationNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionFeedback, setActionFeedback] = useState(null);

  const displayedList = activeTab === 'PENDING' ? pendingHospitals : hospitals;

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const handleActionSubmit = async (e) => {
    e.preventDefault();
    if (!reviewingHospital) return;
    setIsSubmitting(true);
    setActionFeedback(null);

    try {
      if (actionType === 'VERIFY') {
        await onVerifyHospital(reviewingHospital._id, verificationNotes);
        setActionFeedback({
          type: 'success',
          message: `${reviewingHospital.hospitalDetails?.facilityName || reviewingHospital.name} successfully verified!`
        });
      } else {
        await onRejectHospital(reviewingHospital._id, verificationNotes);
        setActionFeedback({
          type: 'warning',
          message: `Application for ${reviewingHospital.hospitalDetails?.facilityName || reviewingHospital.name} rejected.`
        });
      }

      setTimeout(() => {
        setIsSubmitting(false);
        setReviewingHospital(null);
        setVerificationNotes('');
        setActionFeedback(null);
      }, 1200);
    } catch (err) {
      setIsSubmitting(false);
      setActionFeedback({
        type: 'error',
        message: err.message || 'Operation failed. Please try again.'
      });
    }
  };

  return (
    <div className="space-y-5">
      {/* Tab Switcher & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-lg">
          <button
            onClick={() => setActiveTab('PENDING')}
            className={`text-xs font-bold px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'PENDING'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Clock size={13} className="text-amber-500" />
            <span>Pending Approvals</span>
            {pendingHospitals.length > 0 && (
              <span className="px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded-full text-[10px]">
                {pendingHospitals.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ALL')}
            className={`text-xs font-bold px-3 py-1.5 rounded-md transition cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'ALL'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Building2 size={13} className="text-indigo-500" />
            <span>All Healthcare Facilities</span>
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
          <input
            type="text"
            placeholder="Search facility name, license..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="w-full text-xs pl-8 pr-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
          />
        </div>
      </div>

      {/* Hospital List / Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {displayedList.length === 0 ? (
          <div className="md:col-span-2 p-10 bg-white rounded-xl border border-slate-200 text-center">
            <CheckCircle2 size={32} className="mx-auto text-emerald-500 mb-2" />
            <h4 className="text-sm font-bold text-slate-800">Verification Queue Clear</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              {activeTab === 'PENDING'
                ? 'No pending hospital applications awaiting review.'
                : 'No registered hospitals matching current filter.'}
            </p>
          </div>
        ) : (
          displayedList.map((h) => {
            const details = h.hospitalDetails || {};
            const isPending = details.verificationStatus === 'PENDING';
            const isVerified = details.verificationStatus === 'VERIFIED';

            return (
              <div
                key={h._id}
                className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                        <Building2 size={20} />
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-slate-900">
                          {details.facilityName || h.name}
                        </h4>
                        <span className="text-[11px] text-slate-500 block">{h.city || 'Metropolis'}</span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        isVerified
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : isPending
                            ? 'bg-amber-50 text-amber-700 border-amber-200'
                            : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      {details.verificationStatus || 'PENDING'}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 my-3 p-3 bg-slate-50 rounded-lg">
                    <div>
                      <span className="text-slate-400 block">Facility Type</span>
                      <span className="font-semibold text-slate-800">{details.hospitalType || 'PRIVATE'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">License No.</span>
                      <span className="font-semibold text-slate-800">{details.licenseNumber || 'PENDING'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Blood Bank Lic.</span>
                      <span className="font-semibold text-slate-800">{details.bloodBankLicense || 'PENDING'}</span>
                    </div>
                    <div>
                      <span className="text-slate-400 block">Total Beds</span>
                      <span className="font-semibold text-slate-800">{details.totalBeds || '—'}</span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] text-slate-400">
                    Reg: {new Date(h.createdAt).toLocaleDateString()}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {isPending ? (
                      <>
                        <button
                          onClick={() => {
                            setReviewingHospital(h);
                            setActionType('VERIFY');
                            setVerificationNotes('Credentials and clinical blood bank licenses validated.');
                            setActionFeedback(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <CheckCircle2 size={12} />
                          <span>Approve</span>
                        </button>
                        <button
                          onClick={() => {
                            setReviewingHospital(h);
                            setActionType('REJECT');
                            setVerificationNotes('Clinical documentation does not meet platform accreditation standards.');
                            setActionFeedback(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                        >
                          <XCircle size={12} />
                          <span>Reject</span>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setReviewingHospital(h);
                          setActionType('VERIFY');
                          setVerificationNotes(details.verificationNotes || '');
                          setActionFeedback(null);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 transition cursor-pointer"
                      >
                        <FileCheck size={12} />
                        <span>Inspect Credentials</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Review & Verification Action Modal */}
      {reviewingHospital && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setReviewingHospital(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-4">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                  actionType === 'VERIFY' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'
                }`}
              >
                {actionType === 'VERIFY' ? <ShieldCheck size={22} /> : <XCircle size={22} />}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {actionType === 'VERIFY' ? 'Verify Facility Accreditation' : 'Reject Facility Application'}
                </h3>
                <p className="text-xs text-slate-500">
                  {reviewingHospital.hospitalDetails?.facilityName || reviewingHospital.name}
                </p>
              </div>
            </div>

            {/* Dossier Summary */}
            <div className="p-3.5 bg-slate-50 rounded-xl text-xs space-y-2 mb-4 border border-slate-200/60">
              <div className="flex justify-between">
                <span className="text-slate-500">Clinical Facility:</span>
                <span className="font-bold text-slate-800">
                  {reviewingHospital.hospitalDetails?.facilityName || reviewingHospital.name}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Medical License:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {reviewingHospital.hospitalDetails?.licenseNumber || 'LIC-METRO-000'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Blood Bank Accreditation:</span>
                <span className="font-mono font-semibold text-slate-800">
                  {reviewingHospital.hospitalDetails?.bloodBankLicense || 'BB-LIC-AUTHENTICATED'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Facility Type:</span>
                <span className="font-semibold text-slate-800">
                  {reviewingHospital.hospitalDetails?.hospitalType || 'PRIVATE'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Contact / Emergency Phone:</span>
                <span className="font-semibold text-slate-800">{reviewingHospital.phone || reviewingHospital.email}</span>
              </div>
            </div>

            {actionFeedback && (
              <div
                className={`p-3 rounded-lg text-xs font-semibold mb-4 flex items-center gap-2 ${
                  actionFeedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    : actionFeedback.type === 'warning'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-rose-50 text-rose-800 border border-rose-200'
                }`}
              >
                <AlertCircle size={14} />
                <span>{actionFeedback.message}</span>
              </div>
            )}

            <form onSubmit={handleActionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Accreditation / Audit Notes (visible to hospital) *
                </label>
                <textarea
                  required
                  rows={3}
                  value={verificationNotes}
                  onChange={(e) => setVerificationNotes(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActionType('VERIFY')}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition cursor-pointer ${
                      actionType === 'VERIFY'
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Verify
                  </button>
                  <button
                    type="button"
                    onClick={() => setActionType('REJECT')}
                    className={`text-xs font-bold px-3 py-1 rounded-lg transition cursor-pointer ${
                      actionType === 'REJECT'
                        ? 'bg-rose-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    Reject
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewingHospital(null)}
                    className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className={`px-4 py-1.5 rounded-lg text-white text-xs font-bold transition cursor-pointer ${
                      actionType === 'VERIFY'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-rose-600 hover:bg-rose-700'
                    } disabled:opacity-50`}
                  >
                    {isSubmitting ? 'Recording...' : actionType === 'VERIFY' ? 'Confirm Verification' : 'Confirm Rejection'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
