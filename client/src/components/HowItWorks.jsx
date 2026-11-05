import React from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Radio,
  Stethoscope,
  ShieldCheck,
  Check,
  Sparkles
} from 'lucide-react';

const steps = [
  {
    stepNumber: '01',
    title: 'Submit Blood Request',
    subtitle: 'Rapid intake with clinical parameters',
    description:
      'The patient attendant or hospital coordinator submits the required blood group, units, urgency level, and admitting medical center details.',
    icon: FileText,
    highlights: [
      'Specifies exact ABO/Rh group',
      'Selects treating accredited hospital',
      'Immediate emergency triage level'
    ]
  },
  {
    stepNumber: '02',
    title: 'Discover Potential Donors',
    subtitle: 'Encrypted proximity notification',
    description:
      'LifeLink’s matching engine alerts nearby verified voluntary donors who match biological compatibility criteria, without exposing private patient data.',
    icon: Radio,
    highlights: [
      'Location-based proximity matching',
      'Biological compatibility filtration',
      'Direct SMS & in-app alerts'
    ]
  },
  {
    stepNumber: '03',
    title: 'Hospital Coordinates Donation',
    subtitle: 'Clinical screening & safe transfusion',
    description:
      'When donors confirm readiness, the hospital transfusion department conducts vital checks, hemoglobin screening, cross-matching, and safe collection.',
    icon: Stethoscope,
    highlights: [
      'In-person medical pre-screening',
      'Laboratory cross-match validation',
      'Safe clinical blood collection'
    ]
  }
];

export default function HowItWorks() {
  return (
    <section id="how" className="py-24 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-[#B91C35] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5" />
            Standardized Workflow
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
            How LifeLink Coordinates Life-Saving Blood
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Three streamlined, medically sound steps connecting those in urgent need with
            ready donors under direct hospital supervision.
          </p>
        </div>

        {/* Steps Container with connecting line */}
        <div className="relative">
          {/* Connecting line for desktop (hidden on mobile) */}
          <div className="hidden lg:block absolute top-28 left-[16%] right-[16%] h-0.5 border-t-2 border-dashed border-red-200 -z-0" />

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
            {steps.map((item, index) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={item.stepNumber}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.2 }}
                  transition={{ duration: 0.6, delay: index * 0.15 }}
                  className="bg-slate-50/80 hover:bg-white rounded-3xl p-7 sm:p-8 border border-slate-200/90 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Header: Step number & Icon */}
                    <div className="flex items-center justify-between mb-6">
                      <span className="text-4xl font-black text-red-200 group-hover:text-[#B91C35] transition-colors">
                        {item.stepNumber}
                      </span>
                      <div className="w-14 h-14 rounded-2xl bg-white border border-slate-200/80 shadow-xs flex items-center justify-center text-[#B91C35] group-hover:bg-[#B91C35] group-hover:text-white transition-all">
                        <Icon size={26} />
                      </div>
                    </div>

                    <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                      {item.title}
                    </h3>
                    <p className="text-xs font-semibold text-[#B91C35] mt-1 uppercase tracking-wider">
                      {item.subtitle}
                    </p>

                    <p className="text-slate-600 text-sm mt-4 leading-relaxed">
                      {item.description}
                    </p>

                    {/* Bullet Highlights */}
                    <div className="mt-6 pt-5 border-t border-slate-200/70 space-y-2">
                      {item.highlights.map((hl) => (
                        <div key={hl} className="flex items-center gap-2 text-xs text-slate-600">
                          <div className="w-4 h-4 rounded-full bg-red-100 text-[#B91C35] flex items-center justify-center shrink-0">
                            <Check size={10} strokeWidth={3} />
                          </div>
                          <span>{hl}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Medical Authority Disclaimer Box */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-12 bg-red-50/60 border border-red-200/80 rounded-2xl p-5 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 text-slate-700"
        >
          <div className="w-12 h-12 rounded-xl bg-white border border-red-200 flex items-center justify-center text-[#B91C35] shrink-0 shadow-xs">
            <ShieldCheck size={26} />
          </div>
          <div className="text-xs sm:text-sm leading-relaxed">
            <span className="font-bold text-slate-900 block sm:inline">
              Mandatory Hospital Clinical Oversight:
            </span>{' '}
            LifeLink functions solely as a communication coordination platform. Final donor health clearance, hemoglobin verification, blood screening for infectious pathogens, and blood type cross-matching are strictly executed by licensed medical staff at verified partner hospitals.
          </div>
        </motion.div>
      </div>
    </section>
  );
}
