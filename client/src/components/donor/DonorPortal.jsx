import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  User,
  Clock,
  Flame,
  ShieldCheck,
  Stethoscope,
  BarChart3,
  X,
  RefreshCw,
  Menu
} from 'lucide-react';
import DonorOverviewView from './DonorOverviewView';
import DonorProfileView from './DonorProfileView';
import DonorAvailabilityView from './DonorAvailabilityView';
import DonorRequestsDiscoveryView from './DonorRequestsDiscoveryView';
import DonorDonationHistoryView from './DonorDonationHistoryView';
import DonorEligibilityView from './DonorEligibilityView';
import DonorAnalyticsView from './DonorAnalyticsView';

const INITIAL_DEMO_DONOR = {
  name: 'Elena Rostova',
  email: 'elena.rostova@lifelink.org',
  phone: '+1 555-0199',
  bloodGroup: 'O-',
  city: 'Metropolis',
  profileCompletion: 85,
  donorDetails: {
    isAvailable: true,
    availabilityStatus: 'AVAILABLE',
    availabilityUpdatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    availabilityNotes: 'Ready for emergency trauma ward response',
    dateOfBirth: '1995-04-12',
    age: 31,
    weight: 64,
    gender: 'FEMALE',
    address: '42 Maple Street, Apt 3B',
    state: 'Metro State',
    postalCode: '10001',
    emergencyContact: '+1 555-9111',
    emergencyContactName: 'Dr. Bruce Rostova',
    totalDonations: 8,
    lastDonationDate: new Date(Date.now() - 75 * 24 * 3600 * 1000).toISOString()
  }
};

const INITIAL_DEMO_DASHBOARD = {
  overview: {
    totalDonations: 8,
    livesSavedEstimate: 24,
    profileCompletion: 85,
    isAvailable: true,
    availabilityStatus: 'AVAILABLE',
    availabilityUpdatedAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
    bloodGroup: 'O-'
  },
  metrics: {
    totalDonations: 8,
    livesSavedEstimate: 24,
    daysSinceLastDonation: 75
  },
  eligibility: {
    isEligible: true,
    status: 'VERIFIED_ELIGIBLE',
    daysSinceLastDonation: 75,
    daysUntilEligible: 0,
    nextEligibleDate: new Date(Date.now() - 19 * 24 * 3600 * 1000).toISOString(),
    lastDonationDate: new Date(Date.now() - 75 * 24 * 3600 * 1000).toISOString()
  },
  recentNearbyRequests: [
    {
      _id: 'req_1',
      requestId: 'BLR-2026-X48A',
      patientName: 'David K. (Trauma Ward)',
      bloodGroup: 'A+',
      unitsRequired: 2,
      hospital: 'Metro Apex Regional Hospital',
      city: 'Metropolis',
      priority: 'CRITICAL',
      status: 'APPROVED',
      requiredDate: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      medicalNotes: 'Cardiac trauma emergency surgery'
    },
    {
      _id: 'req_2',
      requestId: 'BLR-2026-O19B',
      patientName: 'Sophia Lin',
      bloodGroup: 'O-',
      unitsRequired: 1,
      hospital: 'St. Jude General Hospital',
      city: 'Metropolis',
      priority: 'HIGH',
      status: 'MATCHED',
      requiredDate: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
      medicalNotes: 'Maternal transfusion delivery ward'
    }
  ],
  recentDonations: [
    {
      _id: 'd_1',
      hospitalName: 'Metro Apex Regional Hospital',
      bloodGroup: 'O-',
      units: 1,
      componentType: 'WHOLE_BLOOD',
      donationDate: new Date(Date.now() - 75 * 24 * 3600 * 1000).toISOString(),
      certificateNumber: 'CERT-2026-METRO-08',
      status: 'VERIFIED'
    },
    {
      _id: 'd_2',
      hospitalName: 'St. Jude General Hospital',
      bloodGroup: 'O-',
      units: 1,
      componentType: 'WHOLE_BLOOD',
      donationDate: new Date(Date.now() - 140 * 24 * 3600 * 1000).toISOString(),
      certificateNumber: 'CERT-2026-JUDE-07',
      status: 'VERIFIED'
    }
  ]
};

const INITIAL_DEMO_DONATIONS = [
  {
    _id: 'd_1',
    hospitalName: 'Metro Apex Regional Hospital',
    bloodGroup: 'O-',
    units: 1,
    componentType: 'WHOLE_BLOOD',
    donationDate: new Date(Date.now() - 75 * 24 * 3600 * 1000).toISOString(),
    certificateNumber: 'CERT-2026-METRO-08',
    status: 'VERIFIED'
  },
  {
    _id: 'd_2',
    hospitalName: 'St. Jude General Hospital',
    bloodGroup: 'O-',
    units: 1,
    componentType: 'WHOLE_BLOOD',
    donationDate: new Date(Date.now() - 140 * 24 * 3600 * 1000).toISOString(),
    certificateNumber: 'CERT-2026-JUDE-07',
    status: 'VERIFIED'
  },
  {
    _id: 'd_3',
    hospitalName: 'Metropolis Red Cross Mobile Center',
    bloodGroup: 'O-',
    units: 1,
    componentType: 'WHOLE_BLOOD',
    donationDate: new Date(Date.now() - 210 * 24 * 3600 * 1000).toISOString(),
    certificateNumber: 'CERT-2025-RC-06',
    status: 'VERIFIED'
  }
];

export default function DonorPortal({
  isOpen = false,
  onClose,
  initialTab = 'OVERVIEW'
}) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Live state with demo fallback
  const [donorProfile, setDonorProfile] = useState(INITIAL_DEMO_DONOR);
  const [dashboardData, setDashboardData] = useState(INITIAL_DEMO_DASHBOARD);
  const [nearbyRequests, setNearbyRequests] = useState(INITIAL_DEMO_DASHBOARD.recentNearbyRequests);
  const [donationHistory, setDonationHistory] = useState(INITIAL_DEMO_DONATIONS);
  const [eligibilityData, setEligibilityData] = useState({
    eligibility: INITIAL_DEMO_DASHBOARD.eligibility,
    lastDonationDate: INITIAL_DEMO_DONOR.donorDetails.lastDonationDate,
    nextAssessmentReminder: INITIAL_DEMO_DASHBOARD.eligibility.nextEligibleDate
  });
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalDonations: 8,
      livesSavedEstimate: 24,
      responseRate: 92
    },
    timeline: [
      { period: '2026-05', units: 1, donations: 1 },
      { period: '2026-07', units: 1, donations: 1 },
      { period: '2026-09', units: 1, donations: 1 },
      { period: '2026-11', units: 1, donations: 1 }
    ],
    responseDistribution: [
      { name: 'Accepted', value: 3, color: '#10B981' },
      { name: 'Declined', value: 1, color: '#EF4444' },
      { name: 'Pending', value: 2, color: '#F59E0B' }
    ]
  });

  const fetchDonorData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Dashboard
      const resDash = await fetch('/api/v1/donors/dashboard', { headers });
      if (resDash.ok) {
        const json = await resDash.json();
        if (json.data) setDashboardData(json.data);
      }

      // Profile
      const resProf = await fetch('/api/v1/donors/profile', { headers });
      if (resProf.ok) {
        const json = await resProf.json();
        if (json.data?.profile) setDonorProfile(json.data.profile);
      }

      // Nearby Requests
      const resReq = await fetch('/api/v1/donors/requests/nearby?limit=20', { headers });
      if (resReq.ok) {
        const json = await resReq.json();
        if (json.data?.requests) setNearbyRequests(json.data.requests);
      }

      // Donation History
      const resHist = await fetch('/api/v1/donors/donation-history', { headers });
      if (resHist.ok) {
        const json = await resHist.json();
        if (json.data?.donations) setDonationHistory(json.data.donations);
      }

      // Analytics
      const resAnalytics = await fetch('/api/v1/donors/analytics', { headers });
      if (resAnalytics.ok) {
        const json = await resAnalytics.json();
        if (json.data) setAnalyticsData(json.data);
      }

      // Eligibility Info
      const resElig = await fetch('/api/v1/donors/eligibility', { headers });
      if (resElig.ok) {
        const json = await resElig.json();
        if (json.data) setEligibilityData(json.data);
      }
    } catch {
      // Graceful fallback to client demo state
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        fetchDonorData();
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [isOpen, fetchDonorData]);

  if (!isOpen) return null;

  // Handlers for mutations
  const handleUpdateProfile = async (formData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/donors/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchDonorData();
        return;
      }
    } catch {
      // fallback
    }

    setDonorProfile((prev) => ({
      ...prev,
      ...formData,
      donorDetails: {
        ...prev.donorDetails,
        ...formData
      }
    }));
  };

  const handleUpdateAvailability = async (payload) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/donors/availability', {
        method: 'PATCH',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchDonorData();
        return;
      }
    } catch {
      // fallback
    }

    setDonorProfile((prev) => ({
      ...prev,
      donorDetails: {
        ...prev.donorDetails,
        isAvailable: payload.isAvailable,
        availabilityStatus: payload.availabilityStatus,
        availabilityNotes: payload.availabilityNotes,
        availabilityUpdatedAt: new Date().toISOString()
      }
    }));

    setDashboardData((prev) => ({
      ...prev,
      overview: {
        ...prev.overview,
        isAvailable: payload.isAvailable,
        availabilityStatus: payload.availabilityStatus
      }
    }));
  };

  const handleRespondToRequest = async (requestId, payload) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      await fetch(`/api/v1/donors/requests/${requestId}/respond`, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
    } catch {
      // fallback
    }

    setNearbyRequests((prev) =>
      prev.map((r) =>
        (r._id === requestId || r.requestId === requestId)
          ? { ...r, myResponse: { status: payload.response, respondedAt: new Date().toISOString(), notes: payload.notes } }
          : r
      )
    );
  };

  const handleRecordDonation = async (payload) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/donors/donation-history', {
        method: 'POST',
        headers,
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        await fetchDonorData();
        return;
      }
    } catch {
      // fallback
    }

    const newRecord = {
      _id: `d_${Date.now()}`,
      ...payload,
      status: 'VERIFIED',
      donationDate: payload.donationDate || new Date().toISOString()
    };
    setDonationHistory((prev) => [newRecord, ...prev]);
  };

  const isAvailable = donorProfile.donorDetails?.isAvailable ?? true;
  const bloodGroup = donorProfile.bloodGroup || 'O-';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/70 backdrop-blur-md">
      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.98 }}
        className="bg-slate-50 w-full max-w-7xl h-[92vh] max-h-[920px] rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col"
      >
        {/* Top Portal Navigation Header */}
        <header className="bg-slate-900 px-6 py-4 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-xl hover:bg-slate-800 text-slate-300"
            >
              <Menu size={20} />
            </button>
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#B91C35] to-red-700 flex items-center justify-center font-black text-sm text-white shadow-xs">
                {bloodGroup}
              </div>
              <div>
                <h1 className="text-base font-black tracking-tight leading-tight flex items-center gap-2">
                  <span>Donor Operations Center</span>
                  <span className="hidden sm:inline-block text-[10px] uppercase font-bold bg-red-950 text-red-300 border border-red-800 px-2 py-0.2 rounded-full">
                    LifeLink Network
                  </span>
                </h1>
                <span className="text-[11px] text-slate-400 block">
                  {donorProfile.name} • {donorProfile.city || 'Metro Area'}
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchDonorData}
              title="Refresh Data"
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <RefreshCw size={15} className={isRefreshing ? 'animate-spin' : ''} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Portal Body: Sidebar + Main Views */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar Drawer / Fixed Panel */}
          <aside
            className={`absolute lg:static top-0 bottom-0 left-0 z-30 w-64 bg-white border-r border-slate-200/90 flex flex-col justify-between p-4 transition-transform duration-300 shadow-lg lg:shadow-none ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="space-y-1.5">
              <span className="text-[10px] font-black uppercase text-slate-400 px-3 tracking-wider block mb-2">
                Donor Modules
              </span>

              <button
                onClick={() => { setActiveTab('OVERVIEW'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'OVERVIEW'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard size={16} />
                <span>Overview</span>
              </button>

              <button
                onClick={() => { setActiveTab('PROFILE'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'PROFILE'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <User size={16} />
                <span>Donor Profile</span>
              </button>

              <button
                onClick={() => { setActiveTab('AVAILABILITY'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'AVAILABILITY'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Clock size={16} />
                <span>Availability Status</span>
              </button>

              <button
                onClick={() => { setActiveTab('REQUESTS'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'REQUESTS'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Flame size={16} />
                <span>Blood Requests ({nearbyRequests.length})</span>
              </button>

              <button
                onClick={() => { setActiveTab('HISTORY'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'HISTORY'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <ShieldCheck size={16} />
                <span>Donation History</span>
              </button>

              <button
                onClick={() => { setActiveTab('ELIGIBILITY'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'ELIGIBILITY'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Stethoscope size={16} />
                <span>Eligibility Info</span>
              </button>

              <button
                onClick={() => { setActiveTab('ANALYTICS'); setSidebarOpen(false); }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition text-left cursor-pointer ${
                  activeTab === 'ANALYTICS'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BarChart3 size={16} />
                <span>Donor Analytics</span>
              </button>
            </div>

            {/* Availability Widget in Sidebar */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Quick Status
              </span>
              <div className="flex items-center justify-between">
                <span className={`font-black ${isAvailable ? 'text-emerald-600' : 'text-amber-600'}`}>
                  {isAvailable ? 'Available' : 'Paused'}
                </span>
                <button
                  onClick={() => handleUpdateAvailability({ isAvailable: !isAvailable })}
                  className="text-[11px] font-bold text-[#B91C35] hover:underline cursor-pointer"
                >
                  Toggle
                </button>
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
            {activeTab === 'OVERVIEW' && (
              <DonorOverviewView
                donor={donorProfile}
                dashboardData={dashboardData}
                onNavigateTab={setActiveTab}
                onQuickToggleAvailability={(avail) => handleUpdateAvailability({ isAvailable: avail })}
              />
            )}

            {activeTab === 'PROFILE' && (
              <DonorProfileView
                profile={donorProfile}
                onUpdateProfile={handleUpdateProfile}
              />
            )}

            {activeTab === 'AVAILABILITY' && (
              <DonorAvailabilityView
                donor={donorProfile}
                onUpdateAvailability={handleUpdateAvailability}
              />
            )}

            {activeTab === 'REQUESTS' && (
              <DonorRequestsDiscoveryView
                requests={nearbyRequests}
                donorBloodGroup={bloodGroup}
                onRespondToRequest={handleRespondToRequest}
              />
            )}

            {activeTab === 'HISTORY' && (
              <DonorDonationHistoryView
                donations={donationHistory}
                summary={{
                  totalVerifiedRecords: donationHistory.length,
                  totalUnitsDonated: donationHistory.reduce((acc, curr) => acc + (curr.units || 1), 0),
                  livesSavedEstimate: donationHistory.length * 3
                }}
                donorBloodGroup={bloodGroup}
                onRecordDonation={handleRecordDonation}
              />
            )}

            {activeTab === 'ELIGIBILITY' && (
              <DonorEligibilityView
                eligibilityData={eligibilityData}
              />
            )}

            {activeTab === 'ANALYTICS' && (
              <DonorAnalyticsView
                analytics={analyticsData}
              />
            )}
          </main>
        </div>
      </motion.div>
    </div>
  );
}
