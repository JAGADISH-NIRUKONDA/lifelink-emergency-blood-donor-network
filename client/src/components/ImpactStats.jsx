import React, { useState, useEffect, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Users, Building2, Activity, HeartHandshake, Info } from 'lucide-react';

function Counter({ targetValue, suffix = '', duration = 1500 }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, amount: 0.3 });

  useEffect(() => {
    if (!isInView) return;

    let startTimestamp = null;
    let animationFrameId;

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      // Ease out cubic
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(easeProgress * targetValue));

      if (progress < 1) {
        animationFrameId = window.requestAnimationFrame(step);
      } else {
        setCount(targetValue);
      }
    };

    animationFrameId = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(animationFrameId);
  }, [isInView, targetValue, duration]);

  return (
    <span ref={ref} className="font-extrabold text-slate-900 tracking-tight text-3xl sm:text-4xl lg:text-5xl">
      {count.toLocaleString()}{suffix}
    </span>
  );
}

export default function ImpactStats({ statsData }) {
  // Configurable data structure ready for backend API response
  const metrics = statsData || [
    {
      id: 'donors',
      label: 'Registered Donors',
      target: 12450,
      suffix: '+',
      subtitle: 'Verified volunteer community',
      icon: Users,
      trend: 'Sample Active Metric'
    },
    {
      id: 'hospitals',
      label: 'Partner Hospitals',
      target: 180,
      suffix: '+',
      subtitle: 'Accredited transfusion centers',
      icon: Building2,
      trend: 'Sample Active Metric'
    },
    {
      id: 'requests',
      label: 'Blood Requests',
      target: 8920,
      suffix: '+',
      subtitle: 'Emergency calls coordinated',
      icon: Activity,
      trend: 'Sample Active Metric'
    },
    {
      id: 'donations',
      label: 'Completed Donations',
      target: 8410,
      suffix: '+',
      subtitle: 'Life-saving units transferred',
      icon: HeartHandshake,
      trend: 'Sample Active Metric'
    }
  ];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-slate-50 border-y border-slate-200/70">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div>
            <span className="text-xs font-bold text-[#B91C35] uppercase tracking-wider block">
              Network Velocity
            </span>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
              Measurable Healthcare Impact
            </h2>
          </div>

          {/* Metric Disclosure Disclaimer Notice */}
          <div className="inline-flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-slate-200 text-xs text-slate-500 shadow-xs">
            <Info size={14} className="text-slate-400 shrink-0" />
            <span>Sample platform metrics for demonstration • Live backend database syncing in development</span>
          </div>
        </div>

        {/* 4 Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {metrics.map((item, index) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="bg-white p-6 sm:p-7 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group"
              >
                {/* Subtle decorative top bar */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-500 to-rose-400 opacity-80" />

                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-red-50 text-[#B91C35] flex items-center justify-center group-hover:scale-105 transition-transform">
                    <Icon size={24} />
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                    {item.trend}
                  </span>
                </div>

                <div className="space-y-1">
                  <Counter targetValue={item.target} suffix={item.suffix} />
                  <h3 className="text-base font-bold text-slate-900 pt-1">
                    {item.label}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {item.subtitle}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

