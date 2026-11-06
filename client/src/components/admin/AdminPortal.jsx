import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  BarChart3,
  Users,
  Building2,
  Droplet,
  Shield,
  X,
  RefreshCw,
  Menu,
  ShieldCheck
} from 'lucide-react';
import AdminOverviewKPIs from './AdminOverviewKPIs';
import AdminAnalyticsCharts from './AdminAnalyticsCharts';
import AdminUserManagement from './AdminUserManagement';
import AdminHospitalVerification from './AdminHospitalVerification';
import AdminInventoryOversight from './AdminInventoryOversight';
import AdminAuditLogsView from './AdminAuditLogsView';

// Initial fallback mock datasets for zero-friction client preview
const INITIAL_DEMO_KPIS = {
  totalUsers: 24,
  totalDonors: 14,
  totalPatients: 6,
  totalHospitals: 3,
  totalVolunteers: 2,
  verifiedHospitals: 2,
  pendingHospitals: 1,
  totalBloodRequests: 18,
  pendingBloodRequests: 4,
  fulfilledBloodRequests: 11,
  activeDonors: 12,
  criticalBloodRequests: 2,
  totalAvailableUnits: 68,
  lowStockAlerts: 1
};

const INITIAL_DEMO_USERS = [
  {
    _id: 'usr_001',
    name: 'Super Admin Alpha',
    email: 'admin.alpha@lifelink.org',
    role: 'ADMIN',
    bloodGroup: 'O+',
    city: 'Metropolis',
    isActive: true,
    createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: 'usr_002',
    name: 'Metro Regional Apex Trauma Hospital',
    email: 'admin@metrotrauma.org',
    role: 'HOSPITAL',
    bloodGroup: '',
    city: 'Metropolis',
    isActive: true,
    hospitalDetails: {
      facilityName: 'Metro Regional Apex Trauma Hospital',
      licenseNumber: 'LIC-METRO-991',
      hospitalType: 'GOVERNMENT',
      isVerified: true,
      verificationStatus: 'VERIFIED'
    },
    createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: 'usr_003',
    name: 'St. Jude General Hospital',
    email: 'contact@stjudehospital.org',
    role: 'HOSPITAL',
    bloodGroup: '',
    city: 'Metropolis',
    isActive: true,
    hospitalDetails: {
      facilityName: 'St. Jude General Hospital',
      licenseNumber: 'LIC-JUDE-441',
      hospitalType: 'PRIVATE',
      isVerified: true,
      verificationStatus: 'VERIFIED'
    },
    createdAt: new Date(Date.now() - 20 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: 'usr_004',
    name: 'Hope Specialized Care Clinic',
    email: 'info@hopeclinic.org',
    role: 'HOSPITAL',
    bloodGroup: '',
    city: 'Gotham',
    isActive: true,
    hospitalDetails: {
      facilityName: 'Hope Specialized Care Clinic',
      licenseNumber: 'LIC-HOPE-999',
      hospitalType: 'PRIVATE',
      isVerified: false,
      verificationStatus: 'PENDING'
    },
    createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: 'usr_005',
    name: 'David Vance',
    email: 'david.vance@lifelink.org',
    role: 'DONOR',
    bloodGroup: 'O-',
    city: 'Metropolis',
    isActive: true,
    donorDetails: { isAvailable: true, totalDonations: 4 },
    createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString()
  },
  {
    _id: 'usr_006',
    name: 'Elena Rostova',
    email: 'elena.rostova@lifelink.org',
    role: 'PATIENT',
    bloodGroup: 'A+',
    city: 'Metropolis',
    isActive: true,
    createdAt: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString()
  }
];

const INITIAL_DEMO_LOGS = [
  {
    _id: 'log_001',
    actorName: 'Super Admin Alpha',
    actorEmail: 'admin.alpha@lifelink.org',
    actorRole: 'ADMIN',
    action: 'HOSPITAL_VERIFIED',
    targetResource: 'Hospital',
    targetIdentifier: 'Metro Regional Apex Trauma Hospital',
    details: { notes: 'All state blood bank licenses authenticated.' },
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
  },
  {
    _id: 'log_002',
    actorName: 'Super Admin Alpha',
    actorEmail: 'admin.alpha@lifelink.org',
    actorRole: 'ADMIN',
    action: 'USER_ROLE_CHANGE',
    targetResource: 'User',
    targetIdentifier: 'david.vance@lifelink.org',
    details: { previousRole: 'DONOR', newRole: 'VOLUNTEER', reason: 'Assigned as field donor coordinator' },
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString()
  },
  {
    _id: 'log_003',
    actorName: 'Super Admin Alpha',
    actorEmail: 'admin.alpha@lifelink.org',
    actorRole: 'ADMIN',
    action: 'SYSTEM_ANNOUNCEMENT',
    targetResource: 'System',
    targetIdentifier: 'Emergency O- Blood Drive Notice',
    details: { recipientCount: 18, isEmergency: true },
    status: 'SUCCESS',
    createdAt: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
  }
];

const INITIAL_DEMO_INVENTORY = {
  summary: {
    totalUnitsAvailable: 68,
    totalUnitsReserved: 16,
    lowStockCount: 1,
    byBloodGroup: { 'O+': 22, 'O-': 6, 'A+': 15, 'B+': 18, 'AB+': 7 }
  },
  inventories: [
    {
      _id: 'inv_1',
      hospital: { name: 'Metro Regional Apex Trauma Hospital', city: 'Metropolis' },
      bloodGroup: 'O+',
      unitsAvailable: 22,
      unitsReserved: 4,
      lowStockThreshold: 10
    },
    {
      _id: 'inv_2',
      hospital: { name: 'Metro Regional Apex Trauma Hospital', city: 'Metropolis' },
      bloodGroup: 'O-',
      unitsAvailable: 3,
      unitsReserved: 2,
      lowStockThreshold: 8
    },
    {
      _id: 'inv_3',
      hospital: { name: 'St. Jude General Hospital', city: 'Metropolis' },
      bloodGroup: 'A+',
      unitsAvailable: 15,
      unitsReserved: 5,
      lowStockThreshold: 5
    },
    {
      _id: 'inv_4',
      hospital: { name: 'St. Jude General Hospital', city: 'Metropolis' },
      bloodGroup: 'B+',
      unitsAvailable: 18,
      unitsReserved: 3,
      lowStockThreshold: 6
    }
  ],
  expiringBatches: [
    {
      _id: 'bat_1',
      batchNumber: 'BATCH-2026-A101',
      hospital: { name: 'Metro Regional Apex Trauma Hospital' },
      bloodGroup: 'O-',
      componentType: 'WHOLE_BLOOD',
      remainingUnits: 3,
      expiryDate: new Date(Date.now() + 4 * 24 * 3600 * 1000).toISOString()
    }
  ],
  recentTransactions: [
    {
      _id: 'tx_1',
      transactionType: 'STOCK_IN',
      hospital: { name: 'Metro Regional Apex Trauma Hospital' },
      bloodGroup: 'O+',
      units: 10,
      performedBy: { name: 'Dr. Sarah Lin (Hematologist)' },
      createdAt: new Date(Date.now() - 3 * 3600 * 1000).toISOString()
    },
    {
      _id: 'tx_2',
      transactionType: 'TRANSFUSION',
      hospital: { name: 'St. Jude General Hospital' },
      bloodGroup: 'A+',
      units: 2,
      performedBy: { name: 'Nurse Coordinator James' },
      createdAt: new Date(Date.now() - 7 * 3600 * 1000).toISOString()
    }
  ]
};

export default function AdminPortal({ isOpen, onClose, initialTab = 'overview' }) {
  const [activeTab, setActiveTab] = useState(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Live state with demo fallback
  const [kpis, setKpis] = useState(INITIAL_DEMO_KPIS);
  const [users, setUsers] = useState(INITIAL_DEMO_USERS);
  const [hospitals, setHospitals] = useState(
    INITIAL_DEMO_USERS.filter((u) => u.role === 'HOSPITAL')
  );
  const [pendingHospitals, setPendingHospitals] = useState(
    INITIAL_DEMO_USERS.filter(
      (u) => u.role === 'HOSPITAL' && u.hospitalDetails?.verificationStatus === 'PENDING'
    )
  );
  const [auditLogs, setAuditLogs] = useState(INITIAL_DEMO_LOGS);
  const [inventoryData, setInventoryData] = useState(INITIAL_DEMO_INVENTORY);
  const [analyticsOverview, setAnalyticsOverview] = useState({
    newUsersCount: 16,
    requestsInWindow: 32,
    fulfillmentRate: 91,
    unitsTransfused: 28
  });

  // Fetch real data on mount or refresh
  const refreshAdminData = useCallback(async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      const resKpis = await fetch('/api/v1/admin/kpis', { headers });
      if (resKpis.ok) {
        const json = await resKpis.json();
        if (json.data) setKpis(json.data);
      }

      const resUsers = await fetch('/api/v1/admin/users?limit=30', { headers });
      if (resUsers.ok) {
        const json = await resUsers.json();
        if (json.data?.users) setUsers(json.data.users);
      }

      const resPending = await fetch('/api/v1/admin/hospitals/pending', { headers });
      if (resPending.ok) {
        const json = await resPending.json();
        if (json.data?.hospitals) setPendingHospitals(json.data.hospitals);
      }

      const resHosp = await fetch('/api/v1/admin/hospitals', { headers });
      if (resHosp.ok) {
        const json = await resHosp.json();
        if (json.data?.hospitals) setHospitals(json.data.hospitals);
      }

      const resLogs = await fetch('/api/v1/admin/audit-logs?limit=30', { headers });
      if (resLogs.ok) {
        const json = await resLogs.json();
        if (json.data?.logs) setAuditLogs(json.data.logs);
      }

      const resInv = await fetch('/api/v1/admin/inventory', { headers });
      if (resInv.ok) {
        const json = await resInv.json();
        if (json.data) setInventoryData(json.data);
      }

      const resOverview = await fetch('/api/v1/admin/analytics/overview?range=30d', { headers });
      if (resOverview.ok) {
        const json = await resOverview.json();
        if (json.data) setAnalyticsOverview(json.data);
      }
    } catch {
      // In standalone client demo mode, graceful fallback ensures UI never crashes
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      refreshAdminData();
    }, 0);
    return () => clearTimeout(timer);
  }, [isOpen, refreshAdminData]);

  if (!isOpen) return null;

  // Handlers for User Management
  const handleUpdateUserStatus = async (userId, isActive, reason) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/v1/admin/users/${userId}/status`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ isActive, reason })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update user status.');
    }

    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, isActive } : u))
    );
    // Refresh audit logs
    refreshAdminData();
  };

  const handleUpdateUserRole = async (userId, role, reason) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/v1/admin/users/${userId}/role`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ role, reason })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to update user role.');
    }

    setUsers((prev) =>
      prev.map((u) => (u._id === userId ? { ...u, role } : u))
    );
    refreshAdminData();
  };

  // Handlers for Hospital Verification
  const handleVerifyHospital = async (hospitalId, verificationNotes) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/v1/admin/hospitals/${hospitalId}/verify`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ verificationNotes })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to verify hospital.');
    }

    setPendingHospitals((prev) => prev.filter((h) => h._id !== hospitalId));
    setHospitals((prev) =>
      prev.map((h) =>
        h._id === hospitalId
          ? {
              ...h,
              hospitalDetails: {
                ...h.hospitalDetails,
                verificationStatus: 'VERIFIED',
                isVerified: true
              }
            }
          : h
      )
    );
    refreshAdminData();
  };

  const handleRejectHospital = async (hospitalId, verificationNotes) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`/api/v1/admin/hospitals/${hospitalId}/reject`, {
      method: 'PATCH',
      headers,
      body: JSON.stringify({ verificationNotes })
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.message || 'Failed to reject hospital application.');
    }

    setPendingHospitals((prev) => prev.filter((h) => h._id !== hospitalId));
    refreshAdminData();
  };

  // Broadcast announcement handler
  const handleSendBroadcast = async (formData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    await fetch('/api/v1/admin/broadcast', {
      method: 'POST',
      headers,
      body: JSON.stringify(formData)
    }).catch(() => {});

    refreshAdminData();
  };

  const navMenuItems = [
    { id: 'overview', label: 'Platform Overview', icon: LayoutDashboard },
    { id: 'analytics', label: 'Analytics & Recharts', icon: BarChart3 },
    { id: 'users', label: 'User Directory', icon: Users, badge: users.length },
    {
      id: 'hospitals',
      label: 'Hospital Accreditation',
      icon: Building2,
      badge: pendingHospitals.length > 0 ? pendingHospitals.length : null,
      badgeColor: 'bg-amber-500 text-white'
    },
    { id: 'inventory', label: 'Cross-Network Inventory', icon: Droplet },
    { id: 'audit-logs', label: 'Forensic Audit Trail', icon: Shield }
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-md flex items-center justify-center p-2 sm:p-4">
      <div className="relative w-full max-w-7xl h-[92vh] bg-slate-50 rounded-2xl shadow-2xl border border-slate-700/50 flex flex-col overflow-hidden">
        {/* Top Operational Header Bar */}
        <header className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-3.5 flex items-center justify-between text-white shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <Menu size={20} />
            </button>

            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#B91C35] to-rose-600 flex items-center justify-center text-white shadow-sm">
                <ShieldCheck size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-base sm:text-lg font-black tracking-tight text-white leading-none">
                    Life<span className="text-[#B91C35]">Link</span>
                  </h1>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-400 border border-red-500/30">
                    Super Admin Console
                  </span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">
                  Platform Analytics, User Governance & Clinical Oversight
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={refreshAdminData}
              disabled={isLoading}
              title="Refresh MongoDB Metrics"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs text-slate-200 transition cursor-pointer disabled:opacity-50"
            >
              <RefreshCw size={13} className={isLoading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Sync Data</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              title="Close Portal"
            >
              <X size={20} />
            </button>
          </div>
        </header>

        {/* Console Body: Collapsible Sidebar + Main Content View */}
        <div className="flex-1 flex overflow-hidden relative">
          {/* Sidebar Navigation */}
          <aside
            className={`absolute lg:relative z-20 inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
            }`}
          >
            <div className="p-3.5 space-y-1">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 block mb-2">
                Navigation Modules
              </span>
              {navMenuItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setSidebarOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                      isActive
                        ? 'bg-[#B91C35] text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-950 hover:bg-slate-100'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon size={16} className={isActive ? 'text-white' : 'text-slate-500'} />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge !== null && (
                      <span
                        className={`text-[10px] px-2 py-0.2 rounded-full font-bold ${
                          isActive
                            ? 'bg-white/20 text-white'
                            : item.badgeColor || 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Bottom Platform Engine Status Box */}
            <div className="p-4 border-t border-slate-100 bg-slate-50/70">
              <div className="flex items-center gap-2 mb-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-bold text-slate-800">Cluster Status: Healthy</span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Role-Based Access Control & Immutable Audit Logging Active.
              </p>
            </div>
          </aside>

          {/* Main Working View Panel */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-slate-50">
            {activeTab === 'overview' && (
              <AdminOverviewKPIs
                kpis={kpis}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onSendBroadcast={handleSendBroadcast}
              />
            )}

            {activeTab === 'analytics' && (
              <AdminAnalyticsCharts
                overview={analyticsOverview}
                hospitals={hospitals}
                onRangeChange={(range) => {
                  fetch(`/api/v1/admin/analytics/overview?range=${range}`)
                    .then((r) => r.json())
                    .then((j) => j.data && setAnalyticsOverview(j.data))
                    .catch(() => {});
                }}
              />
            )}

            {activeTab === 'users' && (
              <AdminUserManagement
                users={users}
                pagination={{ page: 1, pages: 1, total: users.length }}
                onFilterRole={(role) => {
                  const filtered =
                    role === 'ALL'
                      ? INITIAL_DEMO_USERS
                      : INITIAL_DEMO_USERS.filter((u) => u.role === role);
                  setUsers(filtered);
                }}
                onSearch={(term) => {
                  const filtered = INITIAL_DEMO_USERS.filter(
                    (u) =>
                      u.name.toLowerCase().includes(term.toLowerCase()) ||
                      u.email.toLowerCase().includes(term.toLowerCase())
                  );
                  setUsers(filtered);
                }}
                onUpdateStatus={handleUpdateUserStatus}
                onUpdateRole={handleUpdateUserRole}
              />
            )}

            {activeTab === 'hospitals' && (
              <AdminHospitalVerification
                hospitals={hospitals}
                pendingHospitals={pendingHospitals}
                onVerifyHospital={handleVerifyHospital}
                onRejectHospital={handleRejectHospital}
                onSearch={(term) => {
                  const filtered = hospitals.filter(
                    (h) =>
                      (h.hospitalDetails?.facilityName || h.name)
                        .toLowerCase()
                        .includes(term.toLowerCase()) ||
                      (h.hospitalDetails?.licenseNumber || '')
                        .toLowerCase()
                        .includes(term.toLowerCase())
                  );
                  setHospitals(filtered);
                }}
              />
            )}

            {activeTab === 'inventory' && (
              <AdminInventoryOversight inventoryData={inventoryData} />
            )}

            {activeTab === 'audit-logs' && (
              <AdminAuditLogsView
                logs={auditLogs}
                pagination={{ page: 1, pages: 1, total: auditLogs.length }}
                onFilterAction={(act) => {
                  const filtered = act
                    ? INITIAL_DEMO_LOGS.filter((l) => l.action === act)
                    : INITIAL_DEMO_LOGS;
                  setAuditLogs(filtered);
                }}
                onSearch={(term) => {
                  const filtered = INITIAL_DEMO_LOGS.filter(
                    (l) =>
                      l.actorName.toLowerCase().includes(term.toLowerCase()) ||
                      l.action.toLowerCase().includes(term.toLowerCase()) ||
                      l.targetIdentifier.toLowerCase().includes(term.toLowerCase())
                  );
                  setAuditLogs(filtered);
                }}
              />
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
