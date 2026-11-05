import React from 'react';
import { motion } from 'framer-motion';
import { HeartPulse, ArrowRight, ShieldCheck, Heart, Sparkles } from 'lucide-react';

export default function FinalCTA({ onRequestBlood, onBecomeDonor }) {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="relative bg-gradient-to-r from-[#B91C35] via-[#a81930] to-[#8c1428] rounded-3xl p-10 sm:p-14 lg:p-16 text-white text-center shadow-2xl overflow-hidden"
        >
          {/* Subtle decorative concentric rings & glow */}
          <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -top-12 -right-12 w-56 h-56 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 w-80 h-80 rounded-full border border-white/10 pointer-events-none" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-radial from-white/10 via-transparent to-transparent pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto space-y-6">
            <span className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-xs text-white text-xs font-bold uppercase tracking-wider px-4 py-1.5 rounded-full shadow-xs">
              <Sparkles size={14} />
              Emergency Response Network
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight leading-tight">
              Together, We Can Make a Difference.
            </h2>

            <p className="text-red-100 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto font-normal">
              Every two seconds, someone needs blood for emergency trauma care, childbirth, or oncology support.
              Your decision to act today can give someone another tomorrow.
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
              <button
                onClick={onRequestBlood}
                className="w-full sm:w-auto bg-white text-[#B91C35] hover:bg-red-50 text-base font-bold px-8 py-4 rounded-2xl transition duration-200 shadow-lg hover:shadow-xl flex items-center justify-center gap-2 group active:scale-95"
              >
                <span>Request Blood</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={onBecomeDonor}
                className="w-full sm:w-auto bg-transparent border-2 border-white/80 hover:border-white text-white hover:bg-white/10 text-base font-bold px-8 py-4 rounded-2xl transition duration-200 flex items-center justify-center gap-2 active:scale-95"
              >
                <Heart size={18} className="fill-current" />
                <span>Join as Donor</span>
              </button>
            </div>

            {/* Assurance Badges */}
            <div className="pt-8 border-t border-white/20 flex flex-wrap items-center justify-center gap-6 sm:gap-8 text-xs text-red-100">
              <div className="flex items-center gap-2">
                <ShieldCheck size={16} />
                <span>100% Free Public Coordination</span>
              </div>
              <div className="flex items-center gap-2">
                <HeartPulse size={16} />
                <span>Hospital Clinical Oversight</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                <span>Confidential Donor Data Protection</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

