import React from 'react';
import { motion } from 'framer-motion';
import {
  Heart,
  CheckCircle2,
  Calendar,
  Scale,
  Activity,
  ShieldCheck,
  ArrowRight,
  HeartPulse
} from 'lucide-react';

export default function BecomeDonor({ onBecomeDonor }) {
  const benefits = [
    {
      title: 'Save Up to 3 Lives',
      description: 'A single whole blood donation can be processed into red cells, platelets, and plasma to help multiple patients.'
    },
    {
      title: 'Complimentary Health Check',
      description: 'Receive mini-health screening before every donation, including blood pressure, pulse, and hemoglobin levels.'
    },
    {
      title: 'Targeted Emergency Alerts',
      description: 'Receive notifications only when a nearby patient or hospital specifically requires your blood group.'
    },
    {
      title: 'Complete Contact Privacy',
      description: 'Your phone number and private records are never published publicly; all dispatch is handled via secure hospital routing.'
    }
  ];

  const eligibilityCriteria = [
    { label: 'Age Requirement', value: '18 – 65 years old', icon: Calendar },
    { label: 'Body Weight', value: 'Minimum 50 kg (110 lbs)', icon: Scale },
    { label: 'General Wellness', value: 'Feeling well & healthy on donation day', icon: Activity },
    { label: 'Donation Interval', value: 'At least 56 days since last donation', icon: HeartPulse }
  ];

  return (
    <section id="donors" className="py-24 px-4 sm:px-6 lg:px-8 bg-slate-50/70 border-t border-slate-200/80">
      <div className="max-w-7xl mx-auto">
        <div className="grid lg:grid-cols-12 gap-12 items-center">
          {/* Left Column: Visual & Eligibility Card */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-5 space-y-6"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-xl border border-white bg-slate-200 aspect-4/3">
              <img
                src="https://images.unsplash.com/photo-1579154204601-01588f351e67?w=1000&auto=format&fit=crop&q=80"
                alt="Healthcare donor consultation"
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "https://images.unsplash.com/photo-1584515979956-d9f6e5d09982?w=1000&auto=format&fit=crop&q=80";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 text-white">
                <span className="bg-[#B91C35] text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
                  Volunteer Community
                </span>
                <p className="font-bold text-base sm:text-lg mt-2 leading-snug">
                  "Giving blood takes 15 minutes, but gives someone a lifetime."
                </p>
              </div>
            </div>

            {/* General Eligibility Checklist Card */}
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm">
              <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                <ShieldCheck size={18} className="text-[#B91C35]" />
                Preliminary Eligibility Guidelines
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {eligibilityCriteria.map((item) => {
                  const Icon = item.icon;
                  return (
                    <div key={item.label} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex items-start gap-2.5">
                      <Icon size={18} className="text-[#B91C35] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-xs font-semibold text-slate-500 block">{item.label}</span>
                        <span className="text-xs font-bold text-slate-800">{item.value}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <p className="text-[11px] text-slate-500 mt-4 leading-normal bg-red-50/60 p-2.5 rounded-lg border border-red-100">
                ⚠️ <strong>Clinical Notice:</strong> Initial sign-up does not guarantee donation eligibility. Formal medical screening (hemoglobin, travel history, vitals) is conducted by certified clinicians at the donation site.
              </p>
            </div>
          </motion.div>

          {/* Right Column: Copy, Benefits & CTA */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.6 }}
            className="lg:col-span-7 space-y-6"
          >
            <div>
              <span className="inline-flex items-center gap-2 bg-red-100/80 text-[#B91C35] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
                <Heart className="w-3.5 h-3.5 fill-current" />
                Join the Donor Registry
              </span>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-slate-900 tracking-tight mt-4 leading-tight">
                Be the Reason Someone Gets Another Chance.
              </h2>
              <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed font-normal">
                Every two seconds, someone needs blood for surgery, cancer therapy, or traumatic emergency care. As a LifeLink registered donor, you are the lifeline our partner hospitals call upon when minutes matter.
              </p>
            </div>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-5 pt-2">
              {benefits.map((b) => (
                <div key={b.title} className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-base mb-1.5">
                    <CheckCircle2 size={18} className="text-[#B91C35] shrink-0" />
                    <span>{b.title}</span>
                  </div>
                  <p className="text-slate-600 text-xs sm:text-sm leading-relaxed">
                    {b.description}
                  </p>
                </div>
              ))}
            </div>

            {/* Call to Action Bar */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <button
                onClick={onBecomeDonor}
                className="bg-[#B91C35] hover:bg-[#9E152C] text-white font-bold text-base px-8 py-4 rounded-2xl transition duration-200 shadow-lg shadow-red-900/20 hover:shadow-xl flex items-center justify-center gap-3 group active:scale-95"
              >
                <span>Register as a Volunteer Donor</span>
                <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>

              <span className="text-xs text-slate-500 text-center sm:text-left">
                100% voluntary • No commercial sales • Free registration
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

