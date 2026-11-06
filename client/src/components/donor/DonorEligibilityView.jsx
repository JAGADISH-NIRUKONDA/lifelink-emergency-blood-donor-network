import React from 'react';
import {
  Calendar,
  Clock,
  CheckCircle2,
  ShieldAlert,
  Info,
  Stethoscope,
  Heart,
  Droplet
} from 'lucide-react';

export default function DonorEligibilityView({
  eligibilityData = {}
}) {
  const eligibility = eligibilityData.eligibility || {};
  const lastDonationDate = eligibilityData.lastDonationDate || eligibility.lastDonationDate;
  const nextAssessment = eligibilityData.nextAssessmentReminder || eligibility.nextEligibleDate;
  const daysUntilEligible = eligibility.daysUntilEligible || 0;
  const daysSince = eligibility.daysSinceLastDonation;

  const isResting = daysUntilEligible > 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* 1. MANDATORY CLINICAL SAFETY NOTICE */}
      <div className="p-5 sm:p-6 rounded-3xl bg-amber-500/10 border-2 border-amber-400/90 shadow-xs flex items-start gap-4">
        <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
          <ShieldAlert size={22} />
        </div>
        <div className="space-y-1 text-xs text-amber-950">
          <div className="flex items-center gap-2">
            <h4 className="text-sm font-black uppercase tracking-wider text-amber-950">
              Mandatory Clinical Assessment Protocol
            </h4>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-200 text-amber-900">
              Informational Only
            </span>
          </div>
          <p className="leading-relaxed font-medium">
            <strong>Never independently declare a donor medically eligible or recommend donation based only on software calculations.</strong> The countdowns and interval estimations displayed here serve exclusively as general scheduling reminders. Full clinical qualification, hemoglobin level tests, blood pressure checks, and transfusion suitability must be independently conducted by licensed physicians and phlebotomists at the transfusion facility.
          </p>
        </div>
      </div>

      {/* 2. Assessment Countdown & Rest Period Status */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Standard 56-Day Whole Blood Cycle
            </span>
            <h3 className="text-xl font-black text-slate-900 mt-1">
              {isResting ? (
                <span className="text-amber-600 flex items-center gap-2">
                  <Clock size={20} />
                  <span>Clinical Rest Interval Active ({daysUntilEligible} Days Remaining)</span>
                </span>
              ) : (
                <span className="text-emerald-600 flex items-center gap-2">
                  <CheckCircle2 size={20} />
                  <span>Rest Interval Complete – Ready for In-Person Medical Assessment</span>
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Minimum 8-week physiological rest period standard across international blood transfusion guidelines
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 text-xs text-right self-start sm:self-center">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Estimated Next Screening</span>
            <span className="font-bold text-slate-800 text-sm mt-0.5 block">
              {nextAssessment ? new Date(nextAssessment).toLocaleDateString() : 'Eligible for Assessment Now'}
            </span>
          </div>
        </div>

        {/* Timeline details */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Last Recorded Donation</span>
            <span className="font-bold text-slate-900 text-sm mt-1 block">
              {lastDonationDate ? new Date(lastDonationDate).toLocaleDateString() : 'No prior donations'}
            </span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">
              {daysSince !== null ? `${daysSince} days ago` : 'First-time voluntary donor'}
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">Physiological Interval</span>
            <span className="font-bold text-slate-900 text-sm mt-1 block">56 Days</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Red blood cell regeneration</span>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80">
            <span className="text-slate-400 text-[10px] uppercase font-bold block">On-Site Hemoglobin Minimum</span>
            <span className="font-bold text-slate-900 text-sm mt-1 block">&gt;= 12.5 g/dL</span>
            <span className="text-[11px] text-slate-500 mt-0.5 block">Verified by hospital fingerstick</span>
          </div>
        </div>
      </div>

      {/* 3. Clinical Guidelines & Informational Reminders */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/90 shadow-xs space-y-4 text-xs">
        <h4 className="font-bold text-sm text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
          <Stethoscope size={16} className="text-[#B91C35]" />
          <span>General Informational Reminders for Prospective Donors</span>
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Droplet size={14} className="text-[#B91C35]" />
              <span>Rest Interval & Frequency</span>
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              A minimum rest interval of 56 days is required between whole blood collections to ensure complete iron stores recovery.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Heart size={14} className="text-emerald-600" />
              <span>Age & Weight Thresholds</span>
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Donors must be between 18 and 65 years of age, weigh at least 50 kg (110 lbs), and be in good overall health at the time of screening.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Calendar size={14} className="text-purple-600" />
              <span>Hydration & Meals</span>
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Drink plenty of water (at least 500ml) and consume a wholesome, iron-rich meal 2 to 3 hours prior to arriving at the blood donation center.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
            <span className="font-bold text-slate-800 flex items-center gap-1.5">
              <Info size={14} className="text-sky-600" />
              <span>In-Person Medical Assessment</span>
            </span>
            <p className="text-slate-600 leading-relaxed text-[11px]">
              Always consult qualified healthcare specialists or certified blood bank officers if you have recent medication, travel, or medical questions.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
