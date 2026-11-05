import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  CheckCircle,
  ArrowRight,
  Lock,
  FileCheck2
} from 'lucide-react';

export default function HospitalPartnership({ onPartnerHospital }) {
  const benefits = [
    {
      title: 'Emergency Shortage Mitigation',
      desc: 'Rapidly broadcast targeted blood requests to verified community donors when rare types are in critical supply.'
    },
    {
      title: 'Institutional Verification Protocol',
      desc: 'Every registered medical facility is authenticated against state and national healthcare licensing boards.'
    },
    {
      title: 'Encrypted Digital Chain of Custody',
      desc: 'Audit-ready logs for request timestamps, donor arrival confirmations, and transfusion unit coordination.'
    },
    {
      title: '24/7 Dedicated Clinical Desk',
      desc: 'Specialized priority support line for urgent triage, mass casualty responses, and cross-hospital sharing.'
    }
  ];

  return (
    <section id="hospitals" className="py-24 px-4 sm:px-6 lg:px-8 bg-[#101827] text-white relative overflow-hidden">
      {/* Decorative ambient glow */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-red-600/10 blur-3xl rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-slate-800/40 blur-3xl rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Heading, Benefits & CTA */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div className="inline-flex items-center gap-2 bg-red-950/80 border border-red-500/30 text-red-300 px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider">
              <Building2 size={14} className="text-red-400" />
              Institutional Healthcare Portal
            </div>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Empowering Hospitals with Rapid Blood Donor Coordination
            </h2>

            <p className="text-slate-300 text-base sm:text-lg leading-relaxed">
              When emergency surgeries, trauma cases, or obstetrical emergencies deplete local inventories,
              LifeLink bridges the gap between your transfusion medicine department and ready voluntary donors.
            </p>

            {/* Benefits 2x2 Grid */}
            <div className="grid sm:grid-cols-2 gap-4 pt-2">
              {benefits.map((b) => (
                <div
                  key={b.title}
                  className="bg-slate-900/90 border border-slate-800 p-5 rounded-2xl backdrop-blur-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center gap-2 text-red-400 font-bold text-sm mb-1.5">
                    <CheckCircle size={16} className="shrink-0" />
                    <span>{b.title}</span>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm leading-relaxed">
                    {b.desc}
                  </p>
                </div>
              ))}
            </div>

            {/* Institutional Security Bar */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-center gap-3 text-xs text-slate-300">
              <Lock className="text-emerald-400 shrink-0" size={18} />
              <div>
                <span className="font-bold text-white block">Accreditation & Safety Standards:</span>
                Partnership is restricted to licensed hospitals, certified trauma centers, and authorized blood transfusion services.
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-2">
              <button
                onClick={onPartnerHospital}
                className="bg-[#B91C35] hover:bg-[#9E152C] text-white font-bold text-base px-8 py-4 rounded-2xl transition duration-200 shadow-lg shadow-red-950/50 flex items-center justify-center gap-3 group active:scale-95"
              >
                <span>Partner Your Healthcare Institution</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </div>
          </motion.div>

          {/* Right Column: Visual and Credential Card */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-slate-700/60 bg-slate-900 aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=1000&auto=format&fit=crop&q=80"
                alt="Modern hospital reception and clinical facility"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=1000&auto=format&fit=crop&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="bg-red-600/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  Clinical Network
                </span>
                <p className="font-bold text-base sm:text-lg mt-2 leading-snug">
                  Integrated with regional blood banks and emergency trauma centers
                </p>
              </div>
            </div>

            {/* Hospital Coordinator Verification Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
              <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-4 flex items-center gap-2">
                <FileCheck2 size={18} className="text-red-400" />
                Hospital Onboarding Flow
              </h4>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 font-bold flex items-center justify-center shrink-0">
                    1
                  </span>
                  <span>Submit institution details, medical license, and blood bank director credentials.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 font-bold flex items-center justify-center shrink-0">
                    2
                  </span>
                  <span>Direct phone verification by LifeLink medical advisory board.</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-slate-800 text-red-400 font-bold flex items-center justify-center shrink-0">
                    3
                  </span>
                  <span>Access private dispatch portal for instant emergency community broadcasts.</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
