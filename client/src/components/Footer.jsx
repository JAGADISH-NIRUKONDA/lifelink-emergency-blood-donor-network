import React from 'react';
import { HeartPulse, Mail, Phone, MapPin, ShieldAlert, ArrowUp } from 'lucide-react';

export default function Footer({ onOpenLegalModal, onOpenRequestModal, onOpenDonorModal, onOpenHospitalModal }) {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavClick = (e, id) => {
    e.preventDefault();
    const el = document.getElementById(id);
    if (el) {
      const yOffset = -80;
      const y = el.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  return (
    <footer id="contact" className="bg-[#101827] text-white pt-16 pb-12 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-12 border-b border-slate-800">
          {/* Column 1: Brand & Tagline */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-red-950 border border-red-500/40 flex items-center justify-center text-red-500">
                <HeartPulse size={24} />
              </div>
              <div>
                <span className="text-2xl font-black tracking-tight text-white block">
                  Life<span className="text-[#B91C35]">Link</span>
                </span>
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">
                  Emergency Blood Donor Network
                </span>
              </div>
            </div>

            <p className="text-slate-400 text-sm leading-relaxed max-w-sm">
              <strong className="text-white">Every Drop Connects a Life.</strong> Connecting patients,
              certified hospitals, and voluntary blood donors through rapid, secure emergency coordination.
            </p>

            {/* Placeholder Contact Details */}
            <div className="space-y-2 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2.5">
                <Phone size={14} className="text-red-400 shrink-0" />
                <span>+1 (800) 555-0199 (Demo Emergency Hotline)</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Mail size={14} className="text-red-400 shrink-0" />
                <span>support@lifelink.demo</span>
              </div>
              <div className="flex items-center gap-2.5">
                <MapPin size={14} className="text-red-400 shrink-0" />
                <span>Health Corridor District, Suite 400 (Demo Facility)</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Quick Navigation
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <a
                  href="#home"
                  onClick={(e) => handleNavClick(e, 'home')}
                  className="hover:text-white transition"
                >
                  Home
                </a>
              </li>
              <li>
                <a
                  href="#about"
                  onClick={(e) => handleNavClick(e, 'about')}
                  className="hover:text-white transition"
                >
                  About Platform
                </a>
              </li>
              <li>
                <a
                  href="#how"
                  onClick={(e) => handleNavClick(e, 'how')}
                  className="hover:text-white transition"
                >
                  How It Works
                </a>
              </li>
              <li>
                <a
                  href="#blood-groups"
                  onClick={(e) => handleNavClick(e, 'blood-groups')}
                  className="hover:text-white transition"
                >
                  Blood Group Matrix
                </a>
              </li>
              <li>
                <a
                  href="#faq"
                  onClick={(e) => handleNavClick(e, 'faq')}
                  className="hover:text-white transition"
                >
                  Frequently Asked
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: For Donors */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              For Donors
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenDonorModal}
                  className="hover:text-white text-left transition"
                >
                  Register as Donor
                </button>
              </li>
              <li>
                <a
                  href="#donors"
                  onClick={(e) => handleNavClick(e, 'donors')}
                  className="hover:text-white transition"
                >
                  Eligibility Guidelines
                </a>
              </li>
              <li>
                <a
                  href="#blood-groups"
                  onClick={(e) => handleNavClick(e, 'blood-groups')}
                  className="hover:text-white transition"
                >
                  Compatibility Table
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('privacy')}
                  className="hover:text-white text-left transition"
                >
                  Donor Data Privacy
                </button>
              </li>
            </ul>
          </div>

          {/* Column 4: Healthcare Partners */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
              Hospitals & Clinics
            </h4>
            <ul className="space-y-2 text-sm text-slate-400">
              <li>
                <button
                  type="button"
                  onClick={onOpenHospitalModal}
                  className="hover:text-white text-left transition"
                >
                  Institutional Registration
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenRequestModal}
                  className="hover:text-white text-left transition"
                >
                  Dispatch Emergency Request
                </button>
              </li>
              <li>
                <a
                  href="#hospitals"
                  onClick={(e) => handleNavClick(e, 'hospitals')}
                  className="hover:text-white transition"
                >
                  Accreditation Protocol
                </a>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenLegalModal('terms')}
                  className="hover:text-white text-left transition"
                >
                  Clinical Operations Terms
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Medical Disclaimer Banner */}
        <div className="mt-8 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
          <div className="leading-relaxed">
            <strong className="text-slate-200">Formal Medical Disclaimer:</strong> LifeLink is an
            independent communication and digital coordination framework. LifeLink is not a blood bank,
            laboratory diagnostic clinic, or medical treatment facility. All blood typing, cross-matching,
            pathogen screening, and biological collections are carried out exclusively by qualified medical
            professionals at accredited partner healthcare institutions.
          </div>
        </div>

        {/* Bottom Bar: Copyright & Back to Top */}
        <div className="mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © 2026 LifeLink – Emergency Blood Donor Network. All rights reserved. (Demo Release)
          </div>

          <div className="flex items-center gap-6">
            <button
              onClick={() => onOpenLegalModal('privacy')}
              className="hover:text-slate-300 transition"
            >
              Privacy Policy
            </button>
            <button
              onClick={() => onOpenLegalModal('terms')}
              className="hover:text-slate-300 transition"
            >
              Terms of Service
            </button>
            <button
              onClick={scrollToTop}
              className="inline-flex items-center gap-1.5 text-slate-400 hover:text-white transition"
            >
              <span>Back to Top</span>
              <ArrowUp size={14} />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

