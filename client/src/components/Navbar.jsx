import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HeartPulse, Menu, X, ArrowUpRight, ShieldCheck, Mail } from 'lucide-react';
import NotificationBell from './notifications/NotificationBell';

const navItems = [
  { id: 'home', label: 'Home', href: '#home' },
  { id: 'about', label: 'About', href: '#about' },
  { id: 'how', label: 'How It Works', href: '#how' },
  { id: 'blood-groups', label: 'Blood Groups', href: '#blood-groups' },
  { id: 'hospitals', label: 'Hospitals', href: '#hospitals' },
  { id: 'faq', label: 'FAQ', href: '#faq' },
  { id: 'contact', label: 'Contact', href: '#contact' },
];

export default function Navbar({ onOpenAuthModal, onOpenBloodPortal, onOpenNotificationCenter, onOpenAdminPortal }) {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Monitor scroll for sticky style & active section
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 24) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }

      // Check current section
      const sections = ['home', 'about', 'how', 'blood-groups', 'hospitals', 'faq', 'contact'];
      const scrollPosition = window.scrollY + 140;

      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el) {
          const top = el.offsetTop;
          if (scrollPosition >= top) {
            setActiveSection(sections[i]);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleNavClick = (e, href) => {
    e.preventDefault();
    const targetId = href.replace('#', '');
    const element = document.getElementById(targetId);
    if (element) {
      const yOffset = -80; // offset for fixed header
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
    setActiveSection(targetId);
    setMobileMenuOpen(false);
  };

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-slate-100 py-3.5'
          : 'bg-white/80 backdrop-blur-xs border-b border-transparent py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
        {/* Brand Logo */}
        <a
          href="#home"
          onClick={(e) => handleNavClick(e, '#home')}
          className="flex items-center gap-2.5 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B91C35] rounded-lg p-1"
        >
          <div className="w-10 h-10 rounded-xl bg-red-50 group-hover:bg-red-100 border border-red-200/60 flex items-center justify-center transition-colors shadow-xs">
            <HeartPulse className="text-[#B91C35] group-hover:scale-105 transition-transform" size={24} />
          </div>
          <div>
            <span className="text-2xl font-black tracking-tight text-slate-900 leading-none block">
              Life<span className="text-[#B91C35]">Link</span>
            </span>
            <span className="text-[10px] tracking-wider text-slate-400 uppercase font-semibold block mt-0.5">
              Blood Donor Network
            </span>
          </div>
        </a>

        {/* Desktop Navigation Links */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          {navItems.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <a
                key={item.id}
                href={item.href}
                onClick={(e) => handleNavClick(e, item.href)}
                className={`relative px-3.5 py-2 text-sm font-medium rounded-full transition-all duration-200 ${
                  isActive
                    ? 'text-[#B91C35] font-semibold bg-red-50/70'
                    : 'text-slate-600 hover:text-slate-950 hover:bg-slate-50'
                }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="navbar-indicator"
                    className="absolute bottom-1 left-3.5 right-3.5 h-0.5 bg-[#B91C35] rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Action Button & Mobile Menu Toggle */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <NotificationBell
            onOpenPortal={(tab) => onOpenBloodPortal && onOpenBloodPortal(tab)}
            onOpenNotificationCenter={onOpenNotificationCenter}
          />

          <button
            onClick={() => onOpenBloodPortal && onOpenBloodPortal('hospital')}
            className="hidden md:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#B91C35] px-3.5 py-2 rounded-full border border-slate-200 hover:border-red-200 bg-white hover:bg-red-50/50 transition shadow-2xs cursor-pointer"
          >
            <span>Hospital Desk</span>
          </button>

          <button
            onClick={() => onOpenAdminPortal && onOpenAdminPortal()}
            className="hidden xl:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-[#B91C35] px-3.5 py-2 rounded-full border border-slate-200 hover:border-red-200 bg-white hover:bg-red-50/50 transition shadow-2xs cursor-pointer"
          >
            <ShieldCheck size={14} className="text-[#B91C35]" />
            <span>Admin Console</span>
          </button>

          <button
            onClick={() => onOpenAuthModal('login')}
            className="hidden sm:inline-flex items-center gap-2 bg-[#B91C35] hover:bg-[#9E152C] text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-all shadow-sm hover:shadow-md hover:shadow-red-900/15 active:scale-95 cursor-pointer"
          >
            <span>Login / Register</span>
            <ArrowUpRight size={16} />
          </button>

          {/* Hamburger Button for Mobile */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none"
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="lg:hidden bg-white border-b border-slate-200/80 px-6 py-5 shadow-xl overflow-hidden"
          >
            <div className="flex flex-col gap-2">
              {navItems.map((item) => (
                <a
                  key={item.id}
                  href={item.href}
                  onClick={(e) => handleNavClick(e, item.href)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${
                    activeSection === item.id
                      ? 'bg-red-50 text-[#B91C35] font-semibold'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {item.label}
                </a>
              ))}
              <div className="pt-3 border-t border-slate-100 mt-2 flex flex-col gap-2">
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenBloodPortal) onOpenBloodPortal('invitations');
                  }}
                  className="w-full bg-purple-700 hover:bg-purple-800 text-white text-sm font-semibold py-2.5 rounded-xl transition text-center shadow-xs flex items-center justify-center gap-2"
                >
                  <Mail size={16} />
                  <span>Donor Invitations & Alerts</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenBloodPortal) onOpenBloodPortal('hospital');
                  }}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold py-2.5 rounded-xl transition text-center shadow-xs"
                >
                  Hospital Command Desk
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    if (onOpenAdminPortal) onOpenAdminPortal();
                  }}
                  className="w-full bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold py-2.5 rounded-xl transition text-center shadow-xs flex items-center justify-center gap-2"
                >
                  <ShieldCheck size={16} className="text-red-400" />
                  <span>Super Admin Console</span>
                </button>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenAuthModal('login');
                  }}
                  className="w-full bg-[#B91C35] hover:bg-[#9E152C] text-white text-sm font-semibold py-3 rounded-xl transition text-center shadow-sm"
                >
                  Login / Register
                </button>
                <div className="flex items-center justify-center gap-2 text-xs text-slate-500 pt-1">
                  <ShieldCheck size={14} className="text-emerald-600" />
                  <span>Hospital-Verified Clinical Coordination</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

