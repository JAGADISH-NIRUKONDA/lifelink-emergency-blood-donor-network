import React from 'react';
import { motion } from 'framer-motion';
import {
  Droplets,
  MapPin,
  ShieldCheck,
  Zap,
  Lock,
  Hospital
} from 'lucide-react';

const features = [
  {
    icon: Droplets,
    title: 'Emergency Requests',
    description: 'Submit and track urgent blood assistance requests with priority triage and direct hospital confirmation.'
  },
  {
    icon: MapPin,
    title: 'Nearby Donors',
    description: 'Discover and notify verified compatible donors based on real-time geographical proximity.'
  },
  {
    icon: ShieldCheck,
    title: 'Verified Network',
    description: 'Coordinate exclusively through accredited hospital blood banks and certified donor accounts.'
  },
  {
    icon: Zap,
    title: 'Rapid Triage Engine',
    description: 'Automated notification pipelines that compress emergency response times when minutes are critical.'
  },
  {
    icon: Lock,
    title: 'Confidential Routing',
    description: 'Full identity and medical data masking. Personal contacts are protected under clinical compliance standards.'
  },
  {
    icon: Hospital,
    title: 'Hospital Clinical Links',
    description: 'Seamless integration with institutional transfusion services for official cross-matching and collection.'
  }
];

export default function AboutPlatform() {
  return (
    <section id="about" className="py-24 px-4 sm:px-6 lg:px-8 bg-white">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto">
          <span className="text-[#B91C35] font-bold text-xs uppercase tracking-wider bg-red-50 px-3.5 py-1.5 rounded-full inline-block">
            Our Platform Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">
            How LifeLink Empowers the Community
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-4 leading-relaxed">
            Technology and healthcare professionals working in unison to transform emergency blood donor coordination.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mt-16">
          {features.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="p-8 rounded-3xl border border-slate-200/90 bg-slate-50/50 hover:bg-white shadow-xs hover:shadow-xl transition-all duration-300 group"
              >
                <div className="bg-red-50 text-[#B91C35] group-hover:bg-[#B91C35] group-hover:text-white w-14 h-14 rounded-2xl flex items-center justify-center transition-colors shadow-xs">
                  <Icon size={28} />
                </div>
                <h3 className="text-xl font-bold text-slate-900 mt-6 tracking-tight">
                  {item.title}
                </h3>
                <p className="text-slate-600 mt-3 text-sm leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

