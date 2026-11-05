import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  HeartPulse,
  ShieldCheck,
  Building2,
  AlertCircle,
  CheckCircle2,
  Send,
  Droplet,
  User,
  Hospital
} from 'lucide-react';

export default function ActionModal({ isOpen, onClose, initialMode = 'request', defaultBloodGroup = '' }) {
  const [activeTab, setActiveTab] = useState(initialMode);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    bloodGroup: defaultBloodGroup || 'O+',
    units: '1',
    hospital: '',
    city: '',
    urgency: 'urgent',
    role: 'donor',
    notes: ''
  });

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setIsSubmitted(false);
    onClose();
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
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          aria-hidden="true"
        />

        {/* Modal Dialog Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ type: 'spring', duration: 0.4, bounce: 0.15 }}
          role="dialog"
          aria-modal="true"
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#B91C35] to-[#9E152C] px-6 py-5 text-white flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white">
                {activeTab === 'request' && <Droplet className="w-5 h-5 fill-current" />}
                {activeTab === 'donor' && <HeartPulse className="w-5 h-5" />}
                {activeTab === 'hospital' && <Hospital className="w-5 h-5" />}
                {(activeTab === 'login' || activeTab === 'register') && <User className="w-5 h-5" />}
                {(activeTab === 'privacy' || activeTab === 'terms') && <ShieldCheck className="w-5 h-5" />}
              </div>
              <div>
                <h3 className="text-xl font-bold tracking-tight">
                  {activeTab === 'request' && 'Emergency Blood Request'}
                  {activeTab === 'donor' && 'Volunteer Donor Registration'}
                  {activeTab === 'hospital' && 'Hospital Partner Onboarding'}
                  {activeTab === 'login' && 'LifeLink Account Access'}
                  {activeTab === 'privacy' && 'Patient Privacy & Confidentiality'}
                  {activeTab === 'terms' && 'Terms of Service & Medical Disclaimer'}
                </h3>
                <p className="text-xs text-red-100 font-medium">
                  {activeTab === 'request' && 'Direct clinical dispatch coordination'}
                  {activeTab === 'donor' && 'Join the life-saving verified community'}
                  {activeTab === 'hospital' && 'Accredited healthcare institutional portal'}
                  {activeTab === 'login' && 'Secure portal for donors, patients & hospitals'}
                  {(activeTab === 'privacy' || activeTab === 'terms') && 'Official network compliance guidelines'}
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Close dialog"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/25 flex items-center justify-center transition text-white"
            >
              <X size={20} />
            </button>
          </div>

          {/* Interactive Navigation Tabs for forms */}
          {['request', 'donor', 'hospital', 'login'].includes(activeTab) && !isSubmitted && (
            <div className="flex border-b border-slate-100 bg-slate-50 text-xs font-semibold text-slate-600 px-4 pt-2 gap-1 overflow-x-auto">
              {[
                { id: 'request', label: 'Blood Request' },
                { id: 'donor', label: 'Be a Donor' },
                { id: 'hospital', label: 'Partner Hospital' },
                { id: 'login', label: 'Login / Register' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2.5 rounded-t-xl transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'bg-white text-[#B91C35] border-t-2 border-[#B91C35] shadow-xs font-bold'
                      : 'hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          )}

          {/* Body */}
          <div className="p-6 max-h-[75vh] overflow-y-auto">
            {isSubmitted ? (
              <div className="text-center py-8">
                <div className="w-16 h-16 bg-red-50 text-[#B91C35] rounded-full flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 size={36} />
                </div>
                <h4 className="text-2xl font-bold text-slate-900">
                  {activeTab === 'request' ? 'Request Submitted Successfully!' : 'Information Recorded!'}
                </h4>
                <p className="text-slate-600 text-sm mt-2 max-w-md mx-auto leading-relaxed">
                  {activeTab === 'request'
                    ? 'Our emergency routing engine has logged your request. In production, nearby verified donors and hospital blood banks will be notified within seconds.'
                    : 'Thank you for connecting with LifeLink. Your information has been registered in the platform preview queue.'}
                </p>

                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mt-6 text-left text-xs text-amber-800 flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold block mb-0.5">Clinical Protocol Reminder:</span>
                    All blood requests require direct cross-matching and hospital authorization before transfusion. LifeLink does not dispatch blood units independently.
                  </div>
                </div>

                <div className="mt-8 flex justify-center gap-3">
                  <button
                    onClick={handleReset}
                    className="bg-[#B91C35] hover:bg-[#9E152C] text-white font-semibold px-6 py-2.5 rounded-xl transition shadow-md shadow-red-900/10"
                  >
                    Done
                  </button>
                </div>
              </div>
            ) : (
              <>
                {/* Notice Banner */}
                <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5 mb-5 flex items-start gap-3 text-xs text-slate-600">
                  <ShieldCheck className="w-4 h-4 text-[#B91C35] shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-slate-900">Demonstration Mode:</span> This interactive dialogue demonstrates our production onboarding flows. No external medical records or payment information are required in this phase.
                  </div>
                </div>

                {/* FORM: EMERGENCY REQUEST */}
                {activeTab === 'request' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Patient Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Sarah Jenkins"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35] focus:border-transparent"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Blood Group Needed *
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-[#B91C35] bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35] focus:border-transparent"
                        >
                          {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((grp) => (
                            <option key={grp} value={grp}>
                              {grp} {grp === 'O-' ? '(Universal Donor)' : grp === 'AB+' ? '(Universal Recipient)' : ''}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Units Required *
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="10"
                          name="units"
                          value={formData.units}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Urgency Level *
                        </label>
                        <select
                          name="urgency"
                          value={formData.urgency}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        >
                          <option value="critical">🚨 Critical (Within 2 Hours)</option>
                          <option value="urgent">⚡ Urgent (Within 6 Hours)</option>
                          <option value="standard">📅 Scheduled (Next 24 Hours)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Treating Hospital / Medical Center *
                        </label>
                        <input
                          type="text"
                          name="hospital"
                          required
                          value={formData.hospital}
                          onChange={handleChange}
                          placeholder="e.g. City General Hospital"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          City / Region *
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="e.g. Metro Area"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Contact Phone for Hospital Verification *
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="e.g. +1 (555) 012-3456"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-[#B91C35] hover:bg-[#9E152C] text-white font-bold py-3 px-5 rounded-xl transition duration-200 shadow-md shadow-red-900/20 flex items-center justify-center gap-2"
                      >
                        <Send size={18} />
                        Dispatch Emergency Request
                      </button>
                    </div>
                  </form>
                )}

                {/* FORM: BECOME A DONOR */}
                {activeTab === 'donor' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          name="name"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="e.g. Alex Morgan"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Your Blood Group *
                        </label>
                        <select
                          name="bloodGroup"
                          value={formData.bloodGroup}
                          onChange={handleChange}
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm font-semibold text-[#B91C35] bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        >
                          {['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'].map((grp) => (
                            <option key={grp} value={grp}>
                              {grp}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          name="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="alex@example.com"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Mobile Phone *
                        </label>
                        <input
                          type="tel"
                          name="phone"
                          required
                          value={formData.phone}
                          onChange={handleChange}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          City / Postal Area *
                        </label>
                        <input
                          type="text"
                          name="city"
                          required
                          value={formData.city}
                          onChange={handleChange}
                          placeholder="e.g. West District"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Approx. Age (Must be 18–65) *
                        </label>
                        <input
                          type="number"
                          min="18"
                          max="65"
                          placeholder="e.g. 28"
                          required
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>
                    </div>

                    <div className="text-xs text-slate-500 bg-slate-50 p-3 rounded-xl border border-slate-200">
                      ℹ️ By registering, you agree to receive urgent SMS/App alerts when a patient in your vicinity matches your blood group. Donor health suitability is confirmed during formal clinical screening at the hospital.
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-[#B91C35] hover:bg-[#9E152C] text-white font-bold py-3 px-5 rounded-xl transition duration-200 shadow-md shadow-red-900/20 flex items-center justify-center gap-2"
                      >
                        <HeartPulse size={18} />
                        Join LifeLink Donor Community
                      </button>
                    </div>
                  </form>
                )}

                {/* FORM: PARTNER HOSPITAL */}
                {activeTab === 'hospital' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Hospital / Healthcare Institution Name *
                      </label>
                      <input
                        type="text"
                        name="hospital"
                        required
                        value={formData.hospital}
                        onChange={handleChange}
                        placeholder="e.g. St. Jude Memorial Hospital"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Accreditation / Clinical License ID *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. MED-8942-NY"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Blood Bank / Transfusion Head Name *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="Dr. Katherine Vance"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Official Institutional Email *
                        </label>
                        <input
                          type="email"
                          required
                          placeholder="bloodbank@stjude.org"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                          Direct Blood Bank Contact Desk *
                        </label>
                        <input
                          type="tel"
                          required
                          placeholder="+1 (555) 789-0123"
                          className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-[#101827] hover:bg-slate-800 text-white font-bold py-3 px-5 rounded-xl transition duration-200 shadow-md flex items-center justify-center gap-2"
                      >
                        <Building2 size={18} />
                        Submit Institutional Accreditation Request
                      </button>
                    </div>
                  </form>
                )}

                {/* FORM: LOGIN / REGISTER */}
                {activeTab === 'login' && (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Portal Account Type *
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {['donor', 'hospital', 'patient'].map((role) => (
                          <button
                            type="button"
                            key={role}
                            onClick={() => setFormData((p) => ({ ...p, role }))}
                            className={`py-2 px-3 text-xs font-semibold rounded-xl border capitalize transition ${
                              formData.role === role
                                ? 'bg-red-50 border-[#B91C35] text-[#B91C35]'
                                : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            {role}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                        Email Address or Verified Mobile *
                      </label>
                      <input
                        type="text"
                        required
                        placeholder="user@lifelink.org"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                          Password *
                        </label>
                        <a href="#reset" onClick={(e) => e.preventDefault()} className="text-xs text-[#B91C35] hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <input
                        type="password"
                        required
                        placeholder="••••••••••••"
                        className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                      />
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-[#B91C35] hover:bg-[#9E152C] text-white font-bold py-3 px-5 rounded-xl transition duration-200 shadow-md shadow-red-900/20"
                      >
                        Sign In to LifeLink
                      </button>
                    </div>

                    <p className="text-center text-xs text-slate-500 pt-2">
                      New to LifeLink?{' '}
                      <button
                        type="button"
                        onClick={() => setActiveTab('donor')}
                        className="text-[#B91C35] font-semibold hover:underline"
                      >
                        Register as a Voluntary Donor
                      </button>
                    </p>
                  </form>
                )}

                {/* CONTENT: PRIVACY POLICY */}
                {activeTab === 'privacy' && (
                  <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                    <h4 className="font-bold text-slate-900 text-base">Privacy & Donor Data Protection Policy</h4>
                    <p>
                      LifeLink is engineered with strict patient and donor privacy standards. We treat personal contact and medical profile data with medical-grade confidentiality.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2 text-xs">
                      <p><strong>1. Zero Public Exposure:</strong> Donor contact numbers and home locations are never exposed on public directories.</p>
                      <p><strong>2. Emergency Match Masking:</strong> When emergency alerts are triggered, communication is routed through encrypted, authorized hospital channels.</p>
                      <p><strong>3. Institutional Verification:</strong> Only credentialed hospital blood bank personnel can view donor arrival schedules.</p>
                    </div>
                    <p className="text-xs text-slate-500">
                      Last updated: January 2026. For questions regarding compliance, contact our clinical privacy officer at privacy@lifelink.demo.
                    </p>
                  </div>
                )}

                {/* CONTENT: TERMS OF SERVICE */}
                {activeTab === 'terms' && (
                  <div className="space-y-4 text-sm text-slate-600 leading-relaxed">
                    <h4 className="font-bold text-slate-900 text-base">Terms of Service & Clinical Disclaimer</h4>
                    <p>
                      LifeLink functions strictly as an emergency coordination and communication framework connecting patients, accredited hospitals, and voluntary blood donors.
                    </p>
                    <div className="bg-red-50/70 border border-red-200 p-4 rounded-xl text-xs text-slate-700 space-y-2">
                      <p><strong>Clinical Disclaimer:</strong> LifeLink is not a blood bank, diagnostic facility, or healthcare provider. LifeLink does not conduct clinical tests or collect, store, or transfuse blood.</p>
                      <p><strong>Hospital Responsibility:</strong> All biological screening, pathogen testing, cross-matching, donor eligibility clearance, and clinical transfusions are governed entirely by authorized treating hospitals.</p>
                      <p><strong>Voluntary Non-Commercial Policy:</strong> LifeLink strictly adheres to WHO voluntary unpaid blood donation principles. Commercial sale of human blood is strictly prohibited.</p>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
