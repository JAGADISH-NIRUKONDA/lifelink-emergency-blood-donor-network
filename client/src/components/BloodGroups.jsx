import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Droplet,
  CheckCircle2,
  ArrowRight,
  HeartHandshake,
  ShieldCheck
} from 'lucide-react';

const bloodTypes = [
  {
    type: 'O-',
    rh: 'Negative',
    tag: 'Universal Donor',
    giveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['O-'],
    rarity: 'Rare (~7% of population)',
    description: 'Can be transfused to individuals of any blood group. In critical emergencies where blood type is unknown, O- is the first choice.'
  },
  {
    type: 'O+',
    rh: 'Positive',
    tag: 'Most Needed',
    giveTo: ['O+', 'A+', 'B+', 'AB+'],
    receiveFrom: ['O+', 'O-'],
    rarity: 'Very Common (~37% of population)',
    description: 'The most commonly transfused red blood cell type. Critical for trauma units and planned surgical operations.'
  },
  {
    type: 'A-',
    rh: 'Negative',
    tag: 'Selective Match',
    giveTo: ['A-', 'A+', 'AB-', 'AB+'],
    receiveFrom: ['A-', 'O-'],
    rarity: 'Uncommon (~6% of population)',
    description: 'A- individuals can supply red cells to both A and AB patients. Donors are in steady demand for specialized procedures.'
  },
  {
    type: 'A+',
    rh: 'Positive',
    tag: 'High Demand',
    giveTo: ['A+', 'AB+'],
    receiveFrom: ['A+', 'A-', 'O+', 'O-'],
    rarity: 'Common (~34% of population)',
    description: 'Second most common blood group. High continuous demand for cancer therapy, surgical oncology, and emergency centers.'
  },
  {
    type: 'B-',
    rh: 'Negative',
    tag: 'Rare Group',
    giveTo: ['B-', 'B+', 'AB-', 'AB+'],
    receiveFrom: ['B-', 'O-'],
    rarity: 'Rare (~2% of population)',
    description: 'Because B- donors are statistically rare, maintaining emergency registered volunteers is essential for regional preparedness.'
  },
  {
    type: 'B+',
    rh: 'Positive',
    tag: 'Regular Demand',
    giveTo: ['B+', 'AB+'],
    receiveFrom: ['B+', 'B-', 'O+', 'O-'],
    rarity: 'Frequent (~10% of population)',
    description: 'Vital for treating sickle cell disease, orthopedic reconstructions, and severe trauma.'
  },
  {
    type: 'AB-',
    rh: 'Negative',
    tag: 'Rarest Type',
    giveTo: ['AB-', 'AB+'],
    receiveFrom: ['AB-', 'A-', 'B-', 'O-'],
    rarity: 'Rarest (<1% of population)',
    description: 'The rarest blood type in the global population. AB- plasma is universally compatible and exceptionally valuable.'
  },
  {
    type: 'AB+',
    rh: 'Positive',
    tag: 'Universal Recipient',
    giveTo: ['AB+'],
    receiveFrom: ['All Blood Types'],
    rarity: 'Uncommon (~3% of population)',
    description: 'Known as the universal recipient for red blood cells. AB+ donors are also universal donors for plasma.'
  }
];

export default function BloodGroups({ onSelectBloodGroup }) {
  const [selectedType, setSelectedType] = useState('O-');
  const activeData = bloodTypes.find((b) => b.type === selectedType) || bloodTypes[0];

  return (
    <section id="blood-groups" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-2 bg-red-50 text-[#B91C35] px-3.5 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
            <Droplet className="w-3.5 h-3.5 fill-current" />
            Biological Compatibility Matrix
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
            Interactive Blood Group Directory
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3 leading-relaxed">
            Select a blood type to explore real medical compatibility, transfusion guidelines,
            and initiate targeted emergency assistance requests.
          </p>
        </div>

        {/* 8 Blood Group Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
          {bloodTypes.map((item) => {
            const isSelected = selectedType === item.type;
            return (
              <motion.button
                key={item.type}
                whileHover={{ y: -4, transition: { duration: 0.2 } }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setSelectedType(item.type)}
                className={`group relative p-4 rounded-2xl flex flex-col items-center justify-between text-center transition-all duration-200 border-2 cursor-pointer ${
                  isSelected
                    ? 'border-[#B91C35] bg-red-50/60 shadow-lg shadow-red-900/10 ring-2 ring-[#B91C35]/20'
                    : 'border-slate-200 bg-white hover:border-red-300 hover:bg-slate-50/70 shadow-xs'
                }`}
              >
                {/* Active check icon badge */}
                {isSelected && (
                  <span className="absolute top-2 right-2 text-[#B91C35]">
                    <CheckCircle2 size={16} />
                  </span>
                )}

                {/* Drop Icon */}
                <div
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors mb-3 ${
                    isSelected
                      ? 'bg-[#B91C35] text-white shadow-xs'
                      : 'bg-red-50 text-[#B91C35] group-hover:bg-red-100'
                  }`}
                >
                  <Droplet className="w-6 h-6 fill-current" />
                </div>

                {/* Blood Group Label */}
                <div className="space-y-0.5">
                  <span className="text-2xl font-black text-slate-900 tracking-tight block">
                    {item.type}
                  </span>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    {item.rh}
                  </span>
                </div>

                {/* Quick Characteristic Tag */}
                <span
                  className={`mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    isSelected
                      ? 'bg-red-200/80 text-[#B91C35]'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {item.tag}
                </span>
              </motion.button>
            );
          })}
        </div>

        {/* Selected Blood Group Action / Compatibility Panel */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeData.type}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="mt-8 bg-gradient-to-br from-slate-50 via-white to-red-50/30 rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-md"
          >
            <div className="grid lg:grid-cols-12 gap-8 items-center">
              {/* Left Info: Type details */}
              <div className="lg:col-span-8 space-y-4">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 bg-[#B91C35] text-white text-xs font-bold px-3 py-1 rounded-lg">
                    <Droplet className="w-3.5 h-3.5 fill-current" />
                    Selected: {activeData.type} ({activeData.rh})
                  </span>
                  <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-lg">
                    {activeData.tag}
                  </span>
                  <span className="text-xs text-slate-500 font-medium">
                    {activeData.rarity}
                  </span>
                </div>

                <p className="text-slate-700 text-sm sm:text-base leading-relaxed">
                  {activeData.description}
                </p>

                {/* Compatibility Badges */}
                <div className="grid sm:grid-cols-2 gap-4 pt-2">
                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Can Donate Red Cells To:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeData.giveTo.map((g) => (
                        <span
                          key={g}
                          className="bg-emerald-50 text-emerald-800 text-xs font-bold px-2.5 py-1 rounded-md border border-emerald-200/70"
                        >
                          {g}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                      Can Receive Red Cells From:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {activeData.receiveFrom.map((r) => (
                        <span
                          key={r}
                          className="bg-sky-50 text-sky-800 text-xs font-bold px-2.5 py-1 rounded-md border border-sky-200/70"
                        >
                          {r}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accuracy Disclaimer */}
                <div className="flex items-center gap-2 text-xs text-slate-500 pt-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    No fabricated donor availability numbers. Cross-matching and clinical compatibility are verified directly by hospital pathologists.
                  </span>
                </div>
              </div>

              {/* Right CTA Box */}
              <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-center space-y-4">
                <div>
                  <h4 className="font-bold text-slate-900 text-base">
                    Need or Have {activeData.type} Blood?
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">
                    Initiate an emergency broadcast or register as a standby donor for this blood type.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <button
                    onClick={() => onSelectBloodGroup(activeData.type, 'request')}
                    className="w-full bg-[#B91C35] hover:bg-[#9E152C] text-white text-sm font-semibold py-3 px-4 rounded-xl transition duration-150 shadow-md shadow-red-900/15 flex items-center justify-center gap-2 group active:scale-95"
                  >
                    <span>Request {activeData.type} Blood</span>
                    <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => onSelectBloodGroup(activeData.type, 'donor')}
                    className="w-full bg-slate-50 hover:bg-red-50 text-slate-800 hover:text-[#B91C35] border border-slate-200 hover:border-red-200 text-sm font-semibold py-3 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 active:scale-95"
                  >
                    <HeartHandshake size={16} className="text-[#B91C35]" />
                    <span>Register as {activeData.type} Donor</span>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
