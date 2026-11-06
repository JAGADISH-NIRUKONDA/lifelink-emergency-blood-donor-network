import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Save
} from 'lucide-react';

export default function DonorAvailabilityView({
  donor = {},
  onUpdateAvailability
}) {
  const donorDetails = donor.donorDetails || {};
  const currentStatus = donorDetails.availabilityStatus || (donorDetails.isAvailable !== false ? 'AVAILABLE' : 'UNAVAILABLE');
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);
  const [notes, setNotes] = useState(donorDetails.availabilityNotes || '');
  const [isSaving, setIsSaving] = useState(false);
  const [feedback, setFeedback] = useState(null);

  const lastUpdated = donorDetails.availabilityUpdatedAt
    ? new Date(donorDetails.availabilityUpdatedAt).toLocaleString()
    : 'Recently';

  const handleSave = async (statusOverride = null) => {
    const statusToApply = statusOverride || selectedStatus;
    setIsSaving(true);
    try {
      if (onUpdateAvailability) {
        await onUpdateAvailability({
          availabilityStatus: statusToApply,
          isAvailable: statusToApply === 'AVAILABLE',
          availabilityNotes: notes
        });
      }
      setSelectedStatus(statusToApply);
      setFeedback(`Availability status successfully set to ${statusToApply}.`);
      setTimeout(() => setFeedback(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Availability Status Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Current Voluntary Status
          </span>
          <div className="flex items-center gap-3 mt-1.5">
            <span className={`text-2xl font-black ${
              selectedStatus === 'AVAILABLE'
                ? 'text-emerald-600'
                : selectedStatus === 'PAUSED'
                ? 'text-amber-500'
                : 'text-rose-600'
            }`}>
              {selectedStatus === 'AVAILABLE' ? 'Actively Available' : selectedStatus === 'PAUSED' ? 'Temporarily Paused' : 'Unavailable'}
            </span>
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
              selectedStatus === 'AVAILABLE'
                ? 'bg-emerald-100 text-emerald-800'
                : selectedStatus === 'PAUSED'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              {selectedStatus}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
            <Clock size={12} className="text-slate-400" />
            <span>Last status adjustment: <strong>{lastUpdated}</strong></span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          {selectedStatus !== 'AVAILABLE' ? (
            <button
              disabled={isSaving}
              onClick={() => handleSave('AVAILABLE')}
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle2 size={16} />
              <span>Resume Availability</span>
            </button>
          ) : (
            <button
              disabled={isSaving}
              onClick={() => handleSave('PAUSED')}
              className="px-5 py-2.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold transition shadow-xs flex items-center gap-2 cursor-pointer"
            >
              <PauseCircle size={16} />
              <span>Pause Availability</span>
            </button>
          )}
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

      {/* 2. Three State Options Selector */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Option 1: Available */}
        <div
          onClick={() => setSelectedStatus('AVAILABLE')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'AVAILABLE'
              ? 'bg-emerald-50/70 border-emerald-300 shadow-sm'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-2xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={20} />
              </span>
              <input
                type="radio"
                checked={selectedStatus === 'AVAILABLE'}
                onChange={() => setSelectedStatus('AVAILABLE')}
                className="w-4 h-4 text-emerald-600"
              />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Available for Donation</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Your profile will appear in hospital candidate searches for compatible urgent blood requisitions.
            </p>
          </div>
          <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mt-4 block">
            Recommended
          </span>
        </div>

        {/* Option 2: Paused */}
        <div
          onClick={() => setSelectedStatus('PAUSED')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'PAUSED'
              ? 'bg-amber-50/70 border-amber-300 shadow-sm'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-2xl bg-amber-100 text-amber-700">
                <PauseCircle size={20} />
              </span>
              <input
                type="radio"
                checked={selectedStatus === 'PAUSED'}
                onChange={() => setSelectedStatus('PAUSED')}
                className="w-4 h-4 text-amber-600"
              />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Temporarily Paused</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Temporarily mute emergency requests while traveling, recovering from illness, or taking personal leave.
            </p>
          </div>
          <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider mt-4 block">
            Temporary status
          </span>
        </div>

        {/* Option 3: Unavailable */}
        <div
          onClick={() => setSelectedStatus('UNAVAILABLE')}
          className={`p-5 rounded-3xl border transition cursor-pointer flex flex-col justify-between ${
            selectedStatus === 'UNAVAILABLE'
              ? 'bg-rose-50/70 border-rose-300 shadow-sm'
              : 'bg-white border-slate-200/90 hover:bg-slate-50'
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="p-2.5 rounded-2xl bg-rose-100 text-rose-700">
                <XCircle size={20} />
              </span>
              <input
                type="radio"
                checked={selectedStatus === 'UNAVAILABLE'}
                onChange={() => setSelectedStatus('UNAVAILABLE')}
                className="w-4 h-4 text-rose-600"
              />
            </div>
            <h4 className="font-bold text-sm text-slate-900">Unavailable</h4>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Indicates extended ineligibility or personal preference not to receive donation outreach.
            </p>
          </div>
          <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider mt-4 block">
            Inactive mode
          </span>
        </div>
      </div>

      {/* 3. Operational Availability Notes Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
        <div>
          <label className="block font-bold text-slate-800 text-sm mb-1">
            Optional Operational Availability Notes
          </label>
          <p className="text-slate-500 mb-3">
            Provide institutional context for hospital transfusion coordinators (e.g. "Available only during weekend mornings", or "Traveling until next week").
          </p>
          <textarea
            rows={3}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Enter scheduling or availability details..."
            className="w-full p-3 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B91C35] text-xs"
          />
        </div>

        <div className="flex justify-end">
          <button
            disabled={isSaving}
            onClick={() => handleSave()}
            className="px-6 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Save size={14} />
            <span>{isSaving ? 'Updating...' : 'Save Availability Preferences'}</span>
          </button>
        </div>
      </div>

      {/* 4. Strict Protocol Warning: Availability != Medical Eligibility */}
      <div className="p-5 rounded-3xl bg-amber-500/10 border-2 border-amber-400/80 shadow-xs flex items-start gap-4 text-xs text-amber-950">
        <AlertTriangle size={22} className="text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h4 className="font-black text-sm uppercase tracking-wide">
            Mandatory Clinical Safety Notice
          </h4>
          <p className="leading-relaxed font-medium">
            <strong>Do not interpret availability as medical eligibility.</strong> Setting your availability status to "Available" confirms your willingness and schedule readiness, but does <em>not</em> bypass physical hemoglobin screening, serological crossmatching, or blood bank deferral policies. Certified clinical eligibility must be verified by hospital physicians prior to transfusion.
          </p>
        </div>
      </div>
    </div>
  );
}
