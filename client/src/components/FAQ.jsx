import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, MessageCircleQuestion } from 'lucide-react';

const faqs = [
  {
    id: 'faq-1',
    category: 'General',
    question: 'What is LifeLink?',
    answer:
      'LifeLink is an emergency blood donor coordination network designed to rapidly connect patients in urgent medical need with nearby verified voluntary blood donors and accredited partner hospitals. LifeLink acts as a communication and triage routing bridge, ensuring every donation is coordinated under licensed clinical supervision.'
  },
  {
    id: 'faq-2',
    category: 'Donors',
    question: 'How can I become a blood donor?',
    answer:
      'Any individual between 18 and 65 years old weighing at least 50 kg (110 lbs) who is in good general health can register via the "Become a Donor" button on our platform. Once registered, you will be notified only when a compatible patient or hospital in your geographic area requires your specific blood type. Final clinical suitability is confirmed at the hospital blood bank prior to collection.'
  },
  {
    id: 'faq-3',
    category: 'Requests',
    question: 'How do I create an emergency blood request?',
    answer:
      'Click the "Request Blood" button on our website or mobile portal. You will provide the patient\'s name, required blood group (A+, O-, etc.), units needed, urgency timeline, treating hospital name, and contact details. Our system generates a secure routing ticket and coordinates with partner hospitals and matching registered local donors.'
  },
  {
    id: 'faq-4',
    category: 'Hospitals',
    question: 'Can hospitals register on LifeLink?',
    answer:
      'Yes. Licensed healthcare institutions, trauma centers, and certified blood banks can register through our "Partner Your Hospital" onboarding flow. Each hospital is validated against national healthcare regulatory databases to maintain institutional credibility and patient safety.'
  },
  {
    id: 'faq-5',
    category: 'Technology',
    question: 'How are potential donors identified?',
    answer:
      'Potential donors are matched algorithmically based on biological ABO and Rh blood group compatibility and proximity to the treating medical facility. LifeLink prioritizes active voluntary donors in the closest radius to ensure minimal travel time in critical scenarios.'
  },
  {
    id: 'faq-6',
    category: 'Privacy',
    question: 'Is donor information publicly visible?',
    answer:
      'No. Donor confidentiality is strictly preserved. Personal contact details, home addresses, and private medical profiles are never displayed on public pages or directories. Communication is facilitated through encrypted notifications and hospital clinical desks.'
  },
  {
    id: 'faq-7',
    category: 'Medical',
    question: 'Who verifies medical compatibility?',
    answer:
      'Qualified laboratory physicians and transfusion specialists at the treating hospital perform all required clinical checks. This includes hemoglobin measurement, preliminary health questionnaires, pathogen screenings, and direct serological cross-matching between patient and donor blood samples before transfusion takes place.'
  },
  {
    id: 'faq-8',
    category: 'Contact',
    question: 'How can I contact LifeLink?',
    answer:
      'You can reach our team via the Contact section below, by emailing support@lifelink.demo for technical support or clinical@lifelink.demo for institutional hospital partnerships. In actual emergency operations, our partner hotline operates 24/7.'
  }
];

export default function FAQ() {
  // Allow multiple or single open items
  const [openItems, setOpenItems] = useState(['faq-1', 'faq-3']);
  const [selectedCategory, setSelectedCategory] = useState('All');

  const categories = ['All', 'General', 'Donors', 'Requests', 'Hospitals', 'Privacy', 'Medical'];

  const toggleItem = (id) => {
    setOpenItems((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const filteredFaqs =
    selectedCategory === 'All'
      ? faqs
      : faqs.filter((f) => f.category.toLowerCase() === selectedCategory.toLowerCase());

  return (
    <section id="faq" className="py-24 px-4 sm:px-6 lg:px-8 bg-white border-t border-slate-100">
      <div className="max-w-4xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-12">
          <span className="inline-flex items-center gap-1.5 bg-red-50 text-[#B91C35] px-3.5 py-1.5 rounded-full text-xs font-bold uppercase tracking-wide">
            <MessageCircleQuestion className="w-3.5 h-3.5" />
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-4">
            Everything You Need to Know
          </h2>
          <p className="text-slate-600 text-base sm:text-lg mt-3">
            Clear, transparent answers about our emergency blood coordination process, donor safety, and hospital partnership.
          </p>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-10">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                selectedCategory === cat
                  ? 'bg-[#B91C35] text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Accordion List */}
        <div className="space-y-3.5">
          {filteredFaqs.map((faq) => {
            const isOpen = openItems.includes(faq.id);
            return (
              <div
                key={faq.id}
                className={`rounded-2xl border transition-all duration-200 overflow-hidden ${
                  isOpen
                    ? 'border-red-200/90 bg-red-50/20 shadow-sm'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <button
                  type="button"
                  id={`header-${faq.id}`}
                  aria-expanded={isOpen}
                  aria-controls={`panel-${faq.id}`}
                  onClick={() => toggleItem(faq.id)}
                  className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B91C35]"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-100 text-slate-600">
                      {faq.category}
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-slate-900">
                      {faq.question}
                    </h3>
                  </div>

                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                      isOpen ? 'bg-[#B91C35] text-white' : 'bg-slate-100 text-slate-500'
                    }`}
                  >
                    <ChevronDown size={18} />
                  </motion.div>
                </button>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      id={`panel-${faq.id}`}
                      role="region"
                      aria-labelledby={`header-${faq.id}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: 'easeInOut' }}
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 text-sm text-slate-600 leading-relaxed border-t border-red-100/60 pt-3">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
