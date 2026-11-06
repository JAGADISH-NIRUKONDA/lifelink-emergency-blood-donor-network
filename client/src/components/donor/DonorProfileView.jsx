import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  Mail,
  MapPin,
  Edit3,
  Save,
  X,
  CheckCircle2,
  Camera
} from 'lucide-react';

const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const GENDERS = ['MALE', 'FEMALE', 'OTHER', 'PREFER_NOT_TO_SAY'];

export default function DonorProfileView({
  profile = {},
  onUpdateProfile
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState(null);

  const donorDetails = profile.donorDetails || {};

  const [form, setForm] = useState({
    name: profile.name || '',
    email: profile.email || '',
    phone: profile.phone || '',
    bloodGroup: profile.bloodGroup || 'O+',
    city: profile.city || '',
    dateOfBirth: donorDetails.dateOfBirth ? donorDetails.dateOfBirth.split('T')[0] : '',
    age: donorDetails.age || '',
    weight: donorDetails.weight || '',
    gender: donorDetails.gender || 'PREFER_NOT_TO_SAY',
    address: donorDetails.address || '',
    state: donorDetails.state || '',
    postalCode: donorDetails.postalCode || '',
    emergencyContact: donorDetails.emergencyContact || '',
    emergencyContactName: donorDetails.emergencyContactName || '',
    avatar: donorDetails.avatar || '',
    medicalNotes: donorDetails.medicalNotes || ''
  });

  const completionScore = profile.profileCompletion ?? 80;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (onUpdateProfile) {
        await onUpdateProfile(form);
      }
      setIsEditing(false);
      setSuccessMsg('Donor credentials and profile updated successfully.');
      setTimeout(() => setSuccessMsg(null), 4000);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. Profile Completion Banner & Header Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="relative group">
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-red-600 to-[#B91C35] text-white flex items-center justify-center font-black text-3xl shadow-md shrink-0 overflow-hidden">
              {form.avatar ? (
                <img src={form.avatar} alt="Donor Avatar" className="w-full h-full object-cover" />
              ) : (
                <span>{form.bloodGroup || 'O+'}</span>
              )}
            </div>
            {isEditing && (
              <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition cursor-pointer">
                <Camera size={18} />
              </div>
            )}
          </div>

          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
                {form.name || 'Anonymous Donor'}
              </h2>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-200">
                Blood Type {form.bloodGroup}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-2">
              <MapPin size={12} className="text-slate-400" />
              <span>{form.city ? `${form.city}, ${form.state || 'Region'}` : 'Location unconfigured'}</span>
              <span>•</span>
              <Mail size={12} className="text-slate-400" />
              <span>{form.email}</span>
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:items-end gap-2">
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Profile Completeness
            </span>
            <div className="flex items-center gap-2 mt-1">
              <div className="w-32 bg-slate-100 h-2.5 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${completionScore}%` }}
                />
              </div>
              <span className="text-xs font-black text-slate-800">{completionScore}%</span>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="mt-2 inline-flex items-center gap-1.5 px-4 py-2 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer"
          >
            {isEditing ? <X size={14} /> : <Edit3 size={14} />}
            <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
          </button>
        </div>
      </div>

      {successMsg && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{successMsg}</span>
        </motion.div>
      )}

      {/* 2. Main Profile Information (Read or Edit) */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6 text-xs">
          <div className="border-b border-slate-100 pb-3">
            <h3 className="text-sm font-bold text-slate-900">Edit Personal & Transfusion Profile</h3>
            <p className="text-slate-500 mt-0.5">Please provide accurate personal information for emergency hospital matching.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Full Legal Name</label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35] font-medium"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Address (Read-only)</label>
              <input
                type="email"
                disabled
                value={form.email}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Contact Phone</label>
              <input
                type="tel"
                required
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Blood Group</label>
              <select
                value={form.bloodGroup}
                onChange={(e) => setForm({ ...form, bloodGroup: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white font-bold text-[#B91C35] focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              >
                {BLOOD_GROUPS.map((bg) => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Date of Birth</label>
              <input
                type="date"
                value={form.dateOfBirth}
                onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Gender</label>
              <select
                value={form.gender}
                onChange={(e) => setForm({ ...form, gender: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>{g.replace(/_/g, ' ')}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Approx Weight (kg)</label>
              <input
                type="number"
                min="30"
                max="250"
                value={form.weight}
                onChange={(e) => setForm({ ...form, weight: e.target.value })}
                placeholder="e.g. 68"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City / Region</label>
              <input
                type="text"
                required
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Residential Address</label>
              <input
                type="text"
                value={form.address}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="Street Address, Apt / Unit"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">State / Postal Code</label>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  value={form.state}
                  onChange={(e) => setForm({ ...form, state: e.target.value })}
                  placeholder="State"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                />
                <input
                  type="text"
                  value={form.postalCode}
                  onChange={(e) => setForm({ ...form, postalCode: e.target.value })}
                  placeholder="Postal Code"
                  className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency Contact Person</label>
              <input
                type="text"
                value={form.emergencyContactName}
                onChange={(e) => setForm({ ...form, emergencyContactName: e.target.value })}
                placeholder="e.g. Spouse, Parent, Kin"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency Contact Phone</label>
              <input
                type="tel"
                value={form.emergencyContact}
                onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })}
                placeholder="+1 555-0199"
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 text-slate-600 hover:text-slate-800 font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold transition shadow-xs flex items-center gap-1.5"
            >
              <Save size={14} />
              <span>{isSaving ? 'Saving Changes...' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Card 1: Core Credentials */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <User size={16} className="text-[#B91C35]" />
              <span>Identity & Contact Details</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Full Name</span>
                <span className="font-bold text-slate-900">{form.name || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Email Address</span>
                <span className="font-bold text-slate-900">{form.email}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Primary Phone</span>
                <span className="font-bold text-slate-900">{form.phone || 'Not configured'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Blood Group</span>
                <span className="font-black text-sm text-[#B91C35]">{form.bloodGroup}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Date of Birth</span>
                <span className="font-bold text-slate-900">{form.dateOfBirth || 'Not provided'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Weight & Gender</span>
                <span className="font-bold text-slate-900">
                  {form.weight ? `${form.weight} kg` : 'N/A'} • {form.gender ? form.gender.replace(/_/g, ' ') : 'N/A'}
                </span>
              </div>
            </div>
          </div>

          {/* Card 2: Location & Emergency Contact */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 border-b border-slate-100 pb-3 flex items-center gap-2">
              <MapPin size={16} className="text-purple-600" />
              <span>Location & Emergency Contact</span>
            </h3>

            <div className="space-y-3">
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">City / Ward</span>
                <span className="font-bold text-slate-900">{form.city || 'Not specified'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Street Address</span>
                <span className="font-bold text-slate-900">{form.address || 'Not specified'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">State & Postal</span>
                <span className="font-bold text-slate-900">
                  {form.state || ''} {form.postalCode ? `(${form.postalCode})` : ''}
                </span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Emergency Kin</span>
                <span className="font-bold text-slate-900">{form.emergencyContactName || 'Not specified'}</span>
              </div>
              <div className="flex items-center justify-between py-1 border-b border-slate-50">
                <span className="text-slate-400">Emergency Phone</span>
                <span className="font-bold text-slate-900">{form.emergencyContact || 'Not specified'}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 text-[11px] text-slate-500 leading-relaxed">
              Personal contact details are protected under LifeLink medical confidentiality policies and only dispatched to verified transfusion hospitals during urgent requisition responses.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
