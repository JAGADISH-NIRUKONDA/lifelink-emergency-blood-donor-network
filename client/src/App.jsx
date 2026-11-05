import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import AboutPlatform from './components/AboutPlatform';
import ImpactStats from './components/ImpactStats';
import HowItWorks from './components/HowItWorks';
import BloodGroups from './components/BloodGroups';
import BecomeDonor from './components/BecomeDonor';
import HospitalPartnership from './components/HospitalPartnership';
import FAQ from './components/FAQ';
import FinalCTA from './components/FinalCTA';
import Footer from './components/Footer';
import ActionModal from './components/ActionModal';

function App() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'request', // 'request' | 'donor' | 'hospital' | 'login' | 'privacy' | 'terms'
    defaultBloodGroup: ''
  });

  const openModal = (mode = 'request', defaultBloodGroup = '') => {
    setModalState({
      isOpen: true,
      mode,
      defaultBloodGroup
    });
  };

  const closeModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSelectBloodGroup = (bloodType, mode = 'request') => {
    openModal(mode, bloodType);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-red-100 selection:text-[#B91C35]">
      {/* 1. Sticky Navigation */}
      <Navbar
        onOpenAuthModal={(mode) => openModal(mode || 'login')}
      />

      <main>
        {/* 2. Hero Section */}
        <Hero
          onRequestBlood={() => openModal('request')}
          onBecomeDonor={() => openModal('donor')}
        />

        {/* 3. Impact Statistics Counter Section */}
        <ImpactStats />

        {/* 4. About Platform Features Section */}
        <AboutPlatform />

        {/* 5. How It Works - 3 Step Clinical Flow */}
        <HowItWorks />

        {/* 6. Interactive 8 Blood Groups & Compatibility */}
        <BloodGroups
          onSelectBloodGroup={handleSelectBloodGroup}
        />

        {/* 7. Become a Donor Recruitment Section */}
        <BecomeDonor
          onBecomeDonor={() => openModal('donor')}
        />

        {/* 8. Hospital Partnership Onboarding Section */}
        <HospitalPartnership
          onPartnerHospital={() => openModal('hospital')}
        />

        {/* 9. Interactive FAQ Accordion */}
        <FAQ />

        {/* 10. Final Call To Action */}
        <FinalCTA
          onRequestBlood={() => openModal('request')}
          onBecomeDonor={() => openModal('donor')}
        />
      </main>

      {/* 11. Footer with Disclaimer and Full Navigation */}
      <Footer
        onOpenLegalModal={(mode) => openModal(mode)}
        onOpenRequestModal={() => openModal('request')}
        onOpenDonorModal={() => openModal('donor')}
        onOpenHospitalModal={() => openModal('hospital')}
      />

      {/* Interactive Modal for Zero Dead Buttons */}
      <ActionModal
        key={`${modalState.isOpen ? 'open' : 'closed'}-${modalState.mode}-${modalState.defaultBloodGroup}`}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        initialMode={modalState.mode}
        defaultBloodGroup={modalState.defaultBloodGroup}
      />
    </div>
  );
}

export default App;
