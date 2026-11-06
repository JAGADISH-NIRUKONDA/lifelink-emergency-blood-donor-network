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
import BloodRequestPortal from './components/bloodRequests/BloodRequestPortal';
import NotificationCenterModal from './components/notifications/NotificationCenterModal';

const INITIAL_APP_NOTIFICATIONS = [
  {
    _id: 'notif_001',
    type: 'EMERGENCY_REQUEST',
    title: '🚨 CRITICAL: O- Donor Needed Urgently',
    message: 'Metro Trauma Center has requested 3 units of O- blood for emergency trauma surgery.',
    priority: 'CRITICAL',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    data: { requestId: 'BLR-2026-CR88', bloodGroup: 'O-', tab: 'invitations' }
  },
  {
    _id: 'notif_002',
    type: 'DONOR_INVITATION',
    title: 'Donation Invitation: A+ Required',
    message: 'St. Jude General Hospital invited you to donate for scheduled cardiac bypass.',
    priority: 'HIGH',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    data: { requestId: 'BLR-2026-AB14', bloodGroup: 'A+', tab: 'invitations' }
  },
  {
    _id: 'notif_003',
    type: 'DONATION_ACCEPTED',
    title: 'Donor Accepted: Alex D. (A+)',
    message: 'A matched voluntary donor has accepted your invitation. Cross-match scheduled.',
    priority: 'NORMAL',
    isRead: true,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    data: { requestId: 'BLR-2026-AB14', tab: 'hospital' }
  }
];

function App() {
  const [modalState, setModalState] = useState({
    isOpen: false,
    mode: 'request', // 'request' | 'donor' | 'hospital' | 'login' | 'privacy' | 'terms'
    defaultBloodGroup: ''
  });

  const [bloodPortalState, setBloodPortalState] = useState({
    isOpen: false,
    initialTab: 'create', // 'create' | 'history' | 'hospital' | 'invitations'
    defaultBloodGroup: 'O+'
  });

  const [notificationCenterOpen, setNotificationCenterOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_APP_NOTIFICATIONS);

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

  const openBloodPortal = (initialTab = 'create', defaultBloodGroup = 'O+') => {
    setBloodPortalState({
      isOpen: true,
      initialTab,
      defaultBloodGroup
    });
  };

  const closeBloodPortal = () => {
    setBloodPortalState((prev) => ({ ...prev, isOpen: false }));
  };

  const handleSelectBloodGroup = (bloodType, mode = 'request') => {
    if (mode === 'request') {
      openBloodPortal('create', bloodType);
    } else {
      openModal('donor', bloodType);
    }
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-red-100 selection:text-[#B91C35]">
      {/* 1. Sticky Navigation */}
      <Navbar
        onOpenAuthModal={(mode) => openModal(mode || 'login')}
        onOpenBloodPortal={(tab) => openBloodPortal(tab || 'hospital')}
        onOpenNotificationCenter={() => setNotificationCenterOpen(true)}
      />

      <main>
        {/* 2. Hero Section */}
        <Hero
          onRequestBlood={() => openBloodPortal('create')}
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
          onPartnerHospital={() => openBloodPortal('hospital')}
        />

        {/* 9. Interactive FAQ Accordion */}
        <FAQ />

        {/* 10. Final Call To Action */}
        <FinalCTA
          onRequestBlood={() => openBloodPortal('create')}
          onBecomeDonor={() => openModal('donor')}
        />
      </main>

      {/* 11. Footer with Disclaimer and Full Navigation */}
      <Footer
        onOpenLegalModal={(mode) => openModal(mode)}
        onOpenRequestModal={() => openBloodPortal('create')}
        onOpenDonorModal={() => openModal('donor')}
        onOpenHospitalModal={() => openBloodPortal('hospital')}
      />

      {/* Interactive Modal for Zero Dead Buttons */}
      <ActionModal
        key={`${modalState.isOpen ? 'open' : 'closed'}-${modalState.mode}-${modalState.defaultBloodGroup}`}
        isOpen={modalState.isOpen}
        onClose={closeModal}
        initialMode={modalState.mode}
        defaultBloodGroup={modalState.defaultBloodGroup}
      />

      {/* Phase 4 & 5: Emergency Blood Request, Matching & Invitations Portal */}
      <BloodRequestPortal
        key={`${bloodPortalState.isOpen ? 'open' : 'closed'}-${bloodPortalState.initialTab}-${bloodPortalState.defaultBloodGroup}`}
        isOpen={bloodPortalState.isOpen}
        onClose={closeBloodPortal}
        initialTab={bloodPortalState.initialTab}
        defaultBloodGroup={bloodPortalState.defaultBloodGroup}
      />

      {/* Phase 5: Notification Center Modal */}
      <NotificationCenterModal
        isOpen={notificationCenterOpen}
        onClose={() => setNotificationCenterOpen(false)}
        notifications={notifications}
        onMarkAsRead={(id) => {
          setNotifications((prev) =>
            prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
          );
        }}
        onMarkAllAsRead={() => {
          setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        }}
        onDeleteNotification={(id) => {
          setNotifications((prev) => prev.filter((n) => n._id !== id));
        }}
        onOpenPortal={(tab) => openBloodPortal(tab)}
      />
    </div>
  );
}

export default App;
