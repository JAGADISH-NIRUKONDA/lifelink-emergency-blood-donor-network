import React from 'react';
import { motion } from 'framer-motion';
import {
  HeartPulse,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles,
  Users2,
  Activity
} from 'lucide-react';

export default function Hero({ onRequestBlood, onBecomeDonor }) {
  return (
    <section
      id="home"
      className="relative pt-32 pb-20 lg:pt-36 lg:pb-28 overflow-hidden bg-gradient-to-b from-red-50/70 via-white to-slate-50/40"
    >
      {/* Decorative ambient background accents */}
      <div className="absolute top-12 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-red-100/40 blur-3xl -z-10 rounded-full pointer-events-none" />
      <div className="absolute -top-24 right-0 w-96 h-96 bg-rose-200/20 blur-3xl -z-10 rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* Left Column: Text Content & CTAs */}
          <motion.div
            initial={{ opacity: 0, x: -35 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
            className="lg:col-span-7 space-y-6 sm:space-y-8"
          >
            {/* Tagline Badge */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2.5 bg-red-100/80 border border-red-200/80 text-[#B91C35] px-4 py-2 rounded-full text-xs sm:text-sm font-bold shadow-xs"
            >
              <HeartPulse className="w-4 h-4 animate-pulse" />
              <span>Every Drop Connects a Life</span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#B91C35]" />
              <span className="text-slate-600 font-medium hidden sm:inline">Emergency Blood Network</span>
            </motion.div>

            {/* Main Heading */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 leading-[1.12]">
              Give Blood.{' '}
              <span className="text-[#B91C35] relative inline-block">
                Save Lives.
                <svg
                  className="absolute -bottom-2 left-0 w-full text-red-200 -z-10 h-3"
                  viewBox="0 0 100 20"
                  preserveAspectRatio="none"
                  fill="currentColor"
                >
                  <path d="M0,15 Q50,0 100,15 L100,20 L0,20 Z" />
                </svg>
              </span>
              <br />
              Be Someone's Hero.
            </h1>

            {/* Description */}
            <p className="text-slate-600 text-base sm:text-lg lg:text-xl leading-relaxed max-w-2xl font-normal">
              LifeLink connects patients, hospitals and verified blood donors
              to make emergency blood assistance easier, safer, and significantly faster.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 pt-2">
              <button
                onClick={onRequestBlood}
                className="bg-[#B91C35] hover:bg-[#9E152C] text-white text-base font-semibold px-8 py-4 rounded-2xl transition duration-200 shadow-lg shadow-red-900/20 hover:shadow-xl hover:shadow-red-900/25 flex items-center justify-center gap-3 group active:scale-95"
              >
                <span>Request Blood</span>
                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onBecomeDonor}
                className="border-2 border-slate-300 hover:border-[#B91C35] text-slate-800 hover:text-[#B91C35] bg-white hover:bg-red-50/50 text-base font-semibold px-8 py-4 rounded-2xl transition duration-200 shadow-xs flex items-center justify-center gap-2 group active:scale-95"
              >
                <HeartPulse size={19} className="text-[#B91C35]" />
                <span>Become a Donor</span>
              </button>
            </div>

            {/* Verified Trust Markers */}
            <div className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#B91C35]">
                  <Clock size={18} />
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">24/7</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Emergency Access</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#B91C35]">
                  <ShieldCheck size={18} />
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">100%</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Hospital Verified</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-[#B91C35]">
                  <Sparkles size={18} />
                  <span className="text-2xl sm:text-3xl font-extrabold text-slate-900">Rapid</span>
                </div>
                <p className="text-xs sm:text-sm font-medium text-slate-500">Smart Matching</p>
              </div>
            </div>
          </motion.div>

          {/* Right Column: Hero Visual with Overlays */}
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: 'easeOut' }}
            className="lg:col-span-5 relative"
          >
            {/* Main Visual Container */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Soft decorative background glow */}
              <div className="absolute -inset-4 bg-gradient-to-r from-red-600/20 to-rose-400/20 rounded-3xl blur-2xl -z-10" />

              <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-white/60 bg-slate-100 aspect-4/3 lg:aspect-square">
                <img
                  src="https://images.unsplash.com/photo-1615461066841-6116e61058f4?w=1000&auto=format&fit=crop&q=80"
                  alt="Clinical blood donation setup"
                  className="w-full h-full object-cover object-center transform hover:scale-105 transition-transform duration-700 ease-out"
                  loading="eager"
                  onError={(e) => {
                    // Fallback to high-reliability healthcare image if needed
                    e.currentTarget.src = "https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1000&auto=format&fit=crop&q=80";
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent pointer-events-none" />

                {/* Badge inside image at bottom */}
                <div className="absolute bottom-4 left-4 right-4 text-white text-xs sm:text-sm p-3 rounded-xl bg-slate-900/60 backdrop-blur-md border border-white/10 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                    <span className="font-semibold">Live Emergency Dispatch Network</span>
                  </div>
                  <span className="text-[11px] text-red-200 uppercase tracking-wider font-bold">Active</span>
                </div>
              </div>

              {/* Floating Top-Right Notification Card */}
              <motion.div
                initial={{ opacity: 0, y: -20, x: 20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 0.5, duration: 0.6 }}
                className="absolute -top-6 -right-4 sm:-right-6 bg-white/95 backdrop-blur-md shadow-xl rounded-2xl p-4 border border-slate-100 max-w-[210px] hidden sm:block"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-red-50 text-[#B91C35] flex items-center justify-center shrink-0">
                    <Activity size={20} />
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-slate-900 leading-tight">Priority Routing</p>
                    <p className="text-[10px] text-slate-500 mt-0.5">Automated Hospital Link</p>
                  </div>
                </div>
              </motion.div>

              {/* Floating Bottom-Left Card (Preserved & Enhanced) */}
              <motion.div
                initial={{ opacity: 0, y: 20, x: -20 }}
                animate={{ opacity: 1, y: 0, x: 0 }}
                transition={{ delay: 0.6, duration: 0.6 }}
                className="absolute -bottom-8 -left-4 sm:-left-8 bg-white shadow-2xl rounded-2xl p-4 sm:p-5 border border-slate-100 max-w-xs"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-red-100 flex items-center justify-center shrink-0 text-[#B91C35] shadow-xs">
                    <HeartPulse size={26} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm sm:text-base leading-snug">
                      Together We Save Lives
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                      <Users2 size={13} className="text-[#B91C35]" />
                      Join the verified donor network
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

