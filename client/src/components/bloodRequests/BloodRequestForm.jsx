import React, { useState } from 'react';
import {
  Droplet,
  Hospital,
  MapPin,
  Calendar,
  Phone,
  FileText,
  AlertCircle,
  Flame,
  Send,
  ShieldCheck
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

const getDefaultRequiredDate = () => {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  return d.toISOString().split('T')[0];
};

const getTodayDateString = () => {
  return new Date().toISOString().split('T')[0];
};

export default function BloodRequestForm({ onSubmitRequest, defaultBloodGroup = 'O+' }) {
  const [formData, setFormData] = useState(() => ({
    patientName: '',
    bloodGroup: defaultBloodGroup,
    unitsRequired: 1,
    hospital: '',
    city: '',
    requiredDate: getDefaultRequiredDate(),
    priority: 'HIGH',
    contactPhone: '',
    attendantName: '',
    medicalNotes: ''
  }));

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.patientName.trim()) {
      setErrorMsg('Please enter the patient full name.');
      return;
    }

    if (!formData.hospital.trim()) {
      setErrorMsg('Please enter the admitting hospital name.');
      return;
    }

    if (!formData.city.trim()) {
      setErrorMsg('Please enter the city or medical district.');
      return;
    }

    if (!formData.contactPhone.trim()) {
      setErrorMsg('Please enter a valid emergency contact phone number.');
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmitRequest(formData);
      // Reset form on success
      setFormData({
        patientName: '',
        bloodGroup: defaultBloodGroup,
        unitsRequired: 1,
        hospital: '',
        city: '',
        requiredDate: getDefaultRequiredDate(),
        priority: 'NORMAL',
        contactPhone: '',
        attendantName: '',
        medicalNotes: ''
      });
    } catch (err) {
      setErrorMsg(err.message || 'Failed to submit blood request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-xl">
      <div className="flex items-center gap-3 border-b border-slate-100 pb-5 mb-6">
        <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#B91C35] flex items-center justify-center shadow-xs">
          <Droplet className="w-6 h-6 fill-current" />
        </div>
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Create Emergency Blood Requisition
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Broadcast emergency requirement to verified treating hospitals and matching donors
          </p>
        </div>
      </div>

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 flex items-start gap-2.5">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Row 1: Patient Name & Blood Group */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
          <div className="sm:col-span-7">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Patient Full Name *
            </label>
            <input
              type="text"
              name="patientName"
              required
              value={formData.patientName}
              onChange={handleChange}
              placeholder="e.g. Eleanor Vance"
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35] focus:border-transparent"
            />
          </div>

          <div className="sm:col-span-5">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Blood Group Required *
            </label>
            <div className="relative">
              <select
                name="bloodGroup"
                value={formData.bloodGroup}
                onChange={handleChange}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-[#B91C35] bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              >
                {BLOOD_GROUPS.map((grp) => (
                  <option key={grp} value={grp}>
                    {grp} {grp === 'O-' ? '(Universal Donor)' : grp === 'AB+' ? '(Universal Recipient)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Row 2: Units Required & Priority Selection */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-5">
          <div className="sm:col-span-4">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Units Required (Pints) *
            </label>
            <input
              type="number"
              name="unitsRequired"
              min="1"
              max="20"
              required
              value={formData.unitsRequired}
              onChange={handleChange}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Maximum 20 units per request</span>
          </div>

          <div className="sm:col-span-8">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Emergency Priority Level *
            </label>
            <div className="grid grid-cols-3 gap-2 sm:gap-3">
              {[
                { id: 'CRITICAL', label: 'Critical', desc: '< 2 Hours' },
                { id: 'HIGH', label: 'High', desc: '< 6 Hours' },
                { id: 'NORMAL', label: 'Normal', desc: '24-48 Hours' }
              ].map((p) => {
                const isSelected = formData.priority === p.id;
                return (
                  <button
                    type="button"
                    key={p.id}
                    onClick={() => setFormData((prev) => ({ ...prev, priority: p.id }))}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? p.id === 'CRITICAL'
                          ? 'bg-red-50 border-red-500 ring-2 ring-red-200'
                          : p.id === 'HIGH'
                          ? 'bg-amber-50 border-amber-500 ring-2 ring-amber-200'
                          : 'bg-slate-100 border-slate-400 ring-2 ring-slate-200'
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs uppercase tracking-wide text-slate-900">
                        {p.label}
                      </span>
                      {p.id === 'CRITICAL' && <Flame size={14} className="text-red-600 animate-bounce" />}
                    </div>
                    <span className="text-[10px] text-slate-500 block mt-0.5">{p.desc}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Row 3: Hospital & City */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Treating Hospital / Medical Center *
            </label>
            <div className="relative">
              <Hospital className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="hospital"
                required
                value={formData.hospital}
                onChange={handleChange}
                placeholder="e.g. Memorial General Hospital"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              City / Medical District *
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="text"
                name="city"
                required
                value={formData.city}
                onChange={handleChange}
                placeholder="e.g. Metropolis"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>
        </div>

        {/* Row 4: Required Date & Contact Phone */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Required Transfusion Date *
            </label>
            <div className="relative">
              <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="date"
                name="requiredDate"
                required
                min={getTodayDateString()}
                value={formData.requiredDate}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
              Emergency Contact Phone *
            </label>
            <div className="relative">
              <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="tel"
                name="contactPhone"
                required
                value={formData.contactPhone}
                onChange={handleChange}
                placeholder="+1 (555) 012-3456"
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>
        </div>

        {/* Row 5: Attendant & Clinical Notes */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Clinical / Diagnosis Notes & Ward Info (Optional)
          </label>
          <div className="relative">
            <FileText className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
            <textarea
              name="medicalNotes"
              rows={3}
              value={formData.medicalNotes}
              onChange={handleChange}
              placeholder="e.g. Patient scheduled for coronary bypass surgery in Ward 4B. Emergency cross-match sample ready at pathology lab."
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            />
          </div>
        </div>

        {/* Clinical Disclaimer Box */}
        <div className="bg-red-50/70 border border-red-200/80 p-4 rounded-xl flex items-start gap-3 text-xs text-slate-700">
          <ShieldCheck className="w-5 h-5 text-[#B91C35] shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <span className="font-bold text-slate-900 block sm:inline">Clinical Verification Notice: </span>
            Submitting this request alerts our partner hospital transfusion coordinators and compatible donors.
            All cross-matching, pathogen screening, and transfusions are conducted strictly under licensed medical hospital supervision.
          </div>
        </div>

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#B91C35] hover:bg-[#9E152C] disabled:bg-slate-300 text-white font-bold py-4 px-6 rounded-2xl transition duration-200 shadow-lg shadow-red-900/20 flex items-center justify-center gap-2 cursor-pointer active:scale-98"
          >
            {isSubmitting ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Dispatching Requisition...
              </span>
            ) : (
              <>
                <Send size={18} />
                <span>Submit Emergency Blood Requisition</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
