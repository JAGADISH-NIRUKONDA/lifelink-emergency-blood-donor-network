import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Mail,
  Phone,
  Clock,
  Trash2,
  X,
  Stethoscope,
  Briefcase
} from 'lucide-react';

const STAFF_ROLES = [
  { id: 'CHIEF_MEDICAL_OFFICER', label: 'Chief Medical Officer' },
  { id: 'HEMATOLOGIST', label: 'Clinical Hematologist' },
  { id: 'TRANSFUSION_SPECIALIST', label: 'Transfusion Specialist' },
  { id: 'LAB_TECHNICIAN', label: 'Blood Bank Lab Technician' },
  { id: 'NURSE_COORDINATOR', label: 'Blood Drive Nurse Coordinator' }
];

export default function HospitalStaffView({
  staff = [],
  onAddStaff,
  onRemoveStaff
}) {
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    role: 'LAB_TECHNICIAN',
    department: 'Blood Transfusion Service',
    shift: 'MORNING'
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (onAddStaff) {
      onAddStaff(form);
    }
    setModalOpen(false);
    setForm({
      name: '',
      email: '',
      phone: '',
      role: 'LAB_TECHNICIAN',
      department: 'Blood Transfusion Service',
      shift: 'MORNING'
    });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Action */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black border border-purple-200/60 shadow-2xs">
            <Users size={24} />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Hospital Medical & Laboratory Staff</h3>
            <p className="text-xs text-slate-500">
              Active Transfusion Officers & Duty Shift Roster ({staff.length} Active Personnel)
            </p>
          </div>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs cursor-pointer"
        >
          <Plus size={15} />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Staff Grid */}
      {staff.length === 0 ? (
        <div className="p-12 text-center bg-white rounded-3xl border border-slate-200/80 shadow-xs">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
          <h4 className="font-bold text-slate-800 text-sm">No staff members listed</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Add your clinical hematologists, transfusion officers, and duty technicians.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {staff.map((member) => (
            <motion.div
              key={member._id || member.email}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-5 rounded-3xl bg-white border border-slate-200/80 hover:border-purple-200 hover:shadow-xs transition flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 font-bold flex items-center justify-center">
                      <Stethoscope size={18} />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{member.name}</h4>
                      <span className="text-[10px] font-bold text-purple-700 bg-purple-50 px-2 py-0.2 rounded-md">
                        {member.role?.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>

                  <span className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                    {member.shift} SHIFT
                  </span>
                </div>

                <div className="space-y-1.5 py-3 border-y border-slate-100 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{member.email}</span>
                  </div>
                  {member.phone && (
                    <div className="flex items-center gap-2">
                      <Phone size={13} className="text-slate-400 shrink-0" />
                      <span>{member.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Briefcase size={13} className="text-slate-400 shrink-0" />
                    <span className="truncate">{member.department}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="text-[11px] flex items-center gap-1">
                  <Clock size={11} />
                  <span>On Duty</span>
                </span>
                {onRemoveStaff && (
                  <button
                    onClick={() => onRemoveStaff(member._id)}
                    title="Remove staff member"
                    className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Staff Modal */}
      <AnimatePresence>
        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setModalOpen(false)}
              className="fixed inset-0 bg-slate-950/70 backdrop-blur-xs"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 z-10"
            >
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
                <h4 className="font-bold text-slate-900 text-base">Register Staff Member</h4>
                <button
                  onClick={() => setModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dr. Sarah Walker"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      required
                      placeholder="walker@hospital.org"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+1 555-0199"
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Clinical Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      {STAFF_ROLES.map((r) => (
                        <option key={r.id} value={r.id}>{r.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">Duty Shift</label>
                    <select
                      value={form.shift}
                      onChange={(e) => setForm({ ...form, shift: e.target.value })}
                      className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                    >
                      <option value="MORNING">Morning (07:00 - 15:00)</option>
                      <option value="EVENING">Evening (15:00 - 23:00)</option>
                      <option value="NIGHT">Night (23:00 - 07:00)</option>
                      <option value="ROTATING">Rotating On-Call</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    value={form.department}
                    onChange={(e) => setForm({ ...form, department: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-purple-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl font-bold transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold transition shadow-xs cursor-pointer"
                  >
                    Add Staff Member
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

