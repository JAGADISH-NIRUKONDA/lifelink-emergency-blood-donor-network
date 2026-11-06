import React, { useState } from 'react';
import {
  Building2,
  ShieldCheck,
  Clock,
  Phone,
  MapPin,
  FileText,
  Bed,
  Check,
  Edit3
} from 'lucide-react';

export default function HospitalProfileView({
  hospital = {},
  onUpdateProfile
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: hospital.name || 'Metro Trauma Center',
    facilityName: hospital.hospitalDetails?.facilityName || 'Metro Regional Apex Trauma & Transfusion Hospital',
    department: hospital.hospitalDetails?.department || 'Department of Transfusion Medicine',
    hospitalType: hospital.hospitalDetails?.hospitalType || 'GOVERNMENT',
    licenseNumber: hospital.hospitalDetails?.licenseNumber || 'LIC-METRO-991',
    bloodBankLicense: hospital.hospitalDetails?.bloodBankLicense || 'BB-LIC-2026-X99',
    totalBeds: hospital.hospitalDetails?.totalBeds || 450,
    emergencyHotline: hospital.hospitalDetails?.emergencyHotline || '+1 (555) 911-0022',
    phone: hospital.phone || '+1 (555) 019-4400',
    address: hospital.hospitalDetails?.address || '100 Medical Plaza Blvd, Ward 4',
    city: hospital.city || 'Metropolis',
    state: hospital.hospitalDetails?.state || 'Metro State',
    postalCode: hospital.hospitalDetails?.postalCode || '10001'
  });

  const isVerified = hospital.hospitalDetails?.isVerified || false;
  const verificationStatus = hospital.hospitalDetails?.verificationStatus || 'VERIFIED';

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onUpdateProfile) {
      onUpdateProfile(formData);
    }
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Top Profile Summary Card */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-slate-900 text-white flex items-center justify-center font-black text-2xl shadow-sm">
            <Building2 size={32} className="text-red-400" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-xl font-bold text-slate-900">{formData.name}</h3>
              {isVerified ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Clinical Board Verified</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
                  <Clock size={14} className="text-amber-600" />
                  <span>Verification {verificationStatus}</span>
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              {formData.facilityName} • {formData.department}
            </p>
          </div>
        </div>

        <button
          onClick={() => setIsEditing(!isEditing)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-slate-200 hover:border-slate-300 bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer self-start sm:self-center"
        >
          <Edit3 size={14} />
          <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
        </button>
      </div>

      {/* Main Profile Info or Edit Form */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4 text-xs">
          <h4 className="font-bold text-sm text-slate-900 border-b border-slate-100 pb-3">
            Edit Hospital Facility Credentials
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Institution Display Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Official Facility Name</label>
              <input
                type="text"
                value={formData.facilityName}
                onChange={(e) => setFormData({ ...formData, facilityName: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Hospital Type</label>
              <select
                value={formData.hospitalType}
                onChange={(e) => setFormData({ ...formData, hospitalType: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              >
                <option value="GOVERNMENT">Government / Apex Hospital</option>
                <option value="PRIVATE">Private Healthcare Network</option>
                <option value="TRUST">Charitable Medical Trust</option>
                <option value="CLINIC">Trauma Day Clinic</option>
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">State Medical License Number</label>
              <input
                type="text"
                value={formData.licenseNumber}
                onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Blood Bank Certification License</label>
              <input
                type="text"
                value={formData.bloodBankLicense}
                onChange={(e) => setFormData({ ...formData, bloodBankLicense: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Emergency 24/7 Hotline</label>
              <input
                type="text"
                value={formData.emergencyHotline}
                onChange={(e) => setFormData({ ...formData, emergencyHotline: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">General Contact Phone</label>
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Inpatient Bed Capacity</label>
              <input
                type="number"
                min={0}
                value={formData.totalBeds}
                onChange={(e) => setFormData({ ...formData, totalBeds: Number(e.target.value) })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="block font-bold text-slate-700 mb-1">Facility Address</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">City / District</label>
              <input
                type="text"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#B91C35] hover:bg-[#9E152C] text-white rounded-xl font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
            >
              <Check size={14} />
              <span>Save Hospital Profile</span>
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <FileText size={16} className="text-[#B91C35]" />
              <span>Licensing & Accreditations</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Hospital Type:</span>
                <span className="font-bold text-slate-800">{formData.hospitalType}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Institutional License:</span>
                <span className="font-mono font-bold text-slate-800">{formData.licenseNumber}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Blood Bank Certified:</span>
                <span className="font-mono font-bold text-slate-800">{formData.bloodBankLicense}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Bed Capacity:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <Bed size={13} className="text-slate-400" /> {formData.totalBeds} Inpatient Beds
                </span>
              </div>
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-2xs space-y-3">
            <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2">
              <Phone size={16} className="text-emerald-600" />
              <span>Contact & Emergency Logistics</span>
            </h4>
            <div className="space-y-2 text-xs text-slate-600 divide-y divide-slate-100">
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Emergency 24/7 Desk:</span>
                <span className="font-bold text-rose-700">{formData.emergencyHotline}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Main Switchboard:</span>
                <span className="font-bold text-slate-800">{formData.phone}</span>
              </div>
              <div className="pt-2 flex justify-between">
                <span className="text-slate-400">Location:</span>
                <span className="font-medium text-slate-800 flex items-center gap-1">
                  <MapPin size={13} className="text-slate-400 shrink-0" />
                  {formData.address}, {formData.city}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
