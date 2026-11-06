import React, { useState, useEffect, useCallback } from 'react';
import {
  LayoutDashboard,
  Inbox,
  Package,
  UserCheck,
  Users,
  Building2,
  BarChart3,
  RefreshCw,
  ShieldCheck,
  ShieldAlert
} from 'lucide-react';
import HospitalOverviewView from '../hospital/HospitalOverviewView';
import HospitalInventoryView from '../hospital/HospitalInventoryView';
import HospitalRequestsView from '../hospital/HospitalRequestsView';
import HospitalDonorCoordinationView from '../hospital/HospitalDonorCoordinationView';
import HospitalStaffView from '../hospital/HospitalStaffView';
import HospitalProfileView from '../hospital/HospitalProfileView';
import HospitalAnalyticsView from '../hospital/HospitalAnalyticsView';

const INITIAL_DEMO_INVENTORY = [
  { bloodGroup: 'A+', unitsAvailable: 14, unitsReserved: 1, lowStockThreshold: 5, storageLocation: 'Bay 1A' },
  { bloodGroup: 'A-', unitsAvailable: 6, unitsReserved: 0, lowStockThreshold: 4, storageLocation: 'Bay 1B' },
  { bloodGroup: 'B+', unitsAvailable: 18, unitsReserved: 2, lowStockThreshold: 5, storageLocation: 'Bay 2A' },
  { bloodGroup: 'B-', unitsAvailable: 3, unitsReserved: 0, lowStockThreshold: 5, storageLocation: 'Bay 2B', isLowStock: true },
  { bloodGroup: 'AB+', unitsAvailable: 7, unitsReserved: 0, lowStockThreshold: 4, storageLocation: 'Bay 3A' },
  { bloodGroup: 'AB-', unitsAvailable: 2, unitsReserved: 0, lowStockThreshold: 3, storageLocation: 'Bay 3B', isLowStock: true },
  { bloodGroup: 'O+', unitsAvailable: 22, unitsReserved: 3, lowStockThreshold: 8, storageLocation: 'Bay 4A' },
  { bloodGroup: 'O-', unitsAvailable: 4, unitsReserved: 1, lowStockThreshold: 6, storageLocation: 'Emergency Bay O', isLowStock: true }
];

const INITIAL_DEMO_BATCHES = [
  { batchNumber: 'BAT-202611-X48A', bloodGroup: 'O+', units: 10, remainingUnits: 8, componentType: 'WHOLE_BLOOD', collectionDate: '2026-10-28', expiryDate: '2026-12-09', status: 'AVAILABLE', storageLocation: 'Bay 4A' },
  { batchNumber: 'BAT-202611-B99Q', bloodGroup: 'A+', units: 6, remainingUnits: 6, componentType: 'WHOLE_BLOOD', collectionDate: '2026-11-01', expiryDate: '2026-12-13', status: 'AVAILABLE', storageLocation: 'Bay 1A' },
  { batchNumber: 'BAT-202611-O12M', bloodGroup: 'O-', units: 4, remainingUnits: 4, componentType: 'WHOLE_BLOOD', collectionDate: '2026-11-04', expiryDate: '2026-12-16', status: 'AVAILABLE', storageLocation: 'Emergency Bay O' }
];

const INITIAL_DEMO_TRANSACTIONS = [
  { _id: 'tx_1', transactionType: 'STOCK_IN', bloodGroup: 'O+', units: 10, donorName: 'Community Blood Drive', performedBy: { name: 'Dr. Evelyn Reed' }, createdAt: new Date(Date.now() - 3600 * 1000 * 4).toISOString() },
  { _id: 'tx_2', transactionType: 'TRANSFUSION', bloodGroup: 'A+', units: 2, patientName: 'Arthur Dent', performedBy: { name: 'Nurse Clara Vance' }, reason: 'Emergency Surgery Ward 3', createdAt: new Date(Date.now() - 3600 * 1000 * 10).toISOString() },
  { _id: 'tx_3', transactionType: 'STOCK_IN', bloodGroup: 'O-', units: 4, donorName: 'Apex Mobile Donor Van', performedBy: { name: 'Dr. Michael Chen' }, createdAt: new Date(Date.now() - 3600 * 1000 * 24).toISOString() }
];

const INITIAL_DEMO_STAFF = [
  { _id: 's1', name: 'Dr. Evelyn Reed', email: 'e.reed@hospital.org', phone: '+1 555-8811', role: 'CHIEF_MEDICAL_OFFICER', department: 'Transfusion Medicine', shift: 'MORNING' },
  { _id: 's2', name: 'Dr. Michael Chen', email: 'm.chen@hospital.org', phone: '+1 555-8812', role: 'HEMATOLOGIST', department: 'Hematology & Oncology', shift: 'EVENING' },
  { _id: 's3', name: 'Nurse Clara Vance', email: 'c.vance@hospital.org', phone: '+1 555-8813', role: 'NURSE_COORDINATOR', department: 'Blood Bank Donor Intake', shift: 'ROTATING' }
];

export default function HospitalDashboard({
  requests: initialRequests = [],
  stats: initialStats = {},
  isLoading: _initialIsLoading = false,
  searchTerm: parentSearchTerm = '',
  onSearchChange: parentOnSearchChange,
  selectedBloodGroup: parentBloodGroup = 'ALL',
  onBloodGroupChange: parentOnBloodGroupChange,
  selectedStatus: parentStatus = 'ALL',
  onStatusChange: parentOnStatusChange,
  selectedPriority: parentPriority = 'ALL',
  onPriorityChange: parentOnPriorityChange,
  onApproveRequest: parentOnApprove,
  onRejectRequest: parentOnReject,
  onFulfillRequest: parentOnFulfill,
  onFindDonors: _parentOnFindDonors
}) {
  const [activeSubTab, setActiveSubTab] = useState('OVERVIEW');
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Filter States (fallback to internal if parent doesn't provide them)
  const [internalSearch, setInternalSearch] = useState('');
  const [internalBloodGroup, setInternalBloodGroup] = useState('ALL');
  const [internalStatus, setInternalStatus] = useState('ALL');
  const [internalPriority, setInternalPriority] = useState('ALL');

  const searchTerm = parentOnSearchChange ? parentSearchTerm : internalSearch;
  const onSearchChange = parentOnSearchChange || setInternalSearch;
  const selectedBloodGroup = parentOnBloodGroupChange ? parentBloodGroup : internalBloodGroup;
  const onBloodGroupChange = parentOnBloodGroupChange || setInternalBloodGroup;
  const selectedStatus = parentOnStatusChange ? parentStatus : internalStatus;
  const onStatusChange = parentOnStatusChange || setInternalStatus;
  const selectedPriority = parentOnPriorityChange ? parentPriority : internalPriority;
  const onPriorityChange = parentOnPriorityChange || setInternalPriority;

  // Live Hospital Data with Demo Fallbacks
  const [internalRequests, setInternalRequests] = useState([]);
  const hospitalRequests = internalRequests.length > 0 ? internalRequests : initialRequests;
  const setHospitalRequests = (updater) => {
    if (typeof updater === 'function') {
      setInternalRequests((prev) => updater(prev.length > 0 ? prev : initialRequests));
    } else {
      setInternalRequests(updater);
    }
  };
  const [inventory, setInventory] = useState(INITIAL_DEMO_INVENTORY);
  const [batches, setBatches] = useState(INITIAL_DEMO_BATCHES);
  const [transactions, setTransactions] = useState(INITIAL_DEMO_TRANSACTIONS);
  const [staff, setStaff] = useState(INITIAL_DEMO_STAFF);
  const [selectedCoordinationReq, setSelectedCoordinationReq] = useState(null);
  const [candidateDonors, setCandidateDonors] = useState([]);
  const [invitations, setInvitations] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(initialStats);
  const [hospitalProfile, setHospitalProfile] = useState({
    name: 'Metro Regional Apex Trauma Hospital',
    city: 'Metropolis',
    phone: '+1 555-019-4400',
    isVerified: true,
    verificationStatus: 'VERIFIED',
    hospitalDetails: {
      facilityName: 'Metro Regional Apex Trauma & Transfusion Hospital',
      department: 'Department of Transfusion Medicine',
      hospitalType: 'GOVERNMENT',
      licenseNumber: 'LIC-METRO-991',
      bloodBankLicense: 'BB-LIC-2026-X99',
      totalBeds: 450,
      emergencyHotline: '+1 (555) 911-0022',
      address: '100 Medical Plaza Blvd, Ward 4',
      isVerified: true,
      verificationStatus: 'VERIFIED'
    }
  });

  const isVerified = hospitalProfile.hospitalDetails?.isVerified ?? hospitalProfile.isVerified ?? false;
  const verificationStatus = hospitalProfile.hospitalDetails?.verificationStatus ?? hospitalProfile.verificationStatus ?? 'PENDING';

  // Synchronize with real backend endpoints if token is available
  const fetchHospitalBackendData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;

      // Profile
      const resProf = await fetch('/api/v1/hospitals/profile', { headers });
      if (resProf.ok) {
        const json = await resProf.json();
        if (json.data) {
          setHospitalProfile(json.data);
        }
      }

      // Inventory
      const resInv = await fetch('/api/v1/hospitals/inventory', { headers });
      if (resInv.ok) {
        const json = await resInv.json();
        if (json.data?.inventory) setInventory(json.data.inventory);
        if (json.data?.batches) setBatches(json.data.batches);
        if (json.data?.recentTransactions) setTransactions(json.data.recentTransactions);
      }

      // Hospital Requests
      const resReq = await fetch('/api/v1/hospitals/requests?limit=50', { headers });
      if (resReq.ok) {
        const json = await resReq.json();
        if (json.data?.requests && json.data.requests.length > 0) {
          setInternalRequests(json.data.requests);
        }
      }

      // Analytics
      const resAnalytics = await fetch('/api/v1/hospitals/analytics', { headers });
      if (resAnalytics.ok) {
        const json = await resAnalytics.json();
        if (json.data) setAnalyticsData(json.data);
      }

      // Staff
      const resStaff = await fetch('/api/v1/hospitals/staff', { headers });
      if (resStaff.ok) {
        const json = await resStaff.json();
        if (json.data?.staff) setStaff(json.data.staff);
      }
    } catch {
      // Graceful fallback to client demo state
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    const timer = setTimeout(() => {
      if (active) {
        fetchHospitalBackendData();
      }
    }, 0);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [fetchHospitalBackendData]);

  // Mutation Handlers with live API dispatch + local fallback
  const handleStockIn = async (formData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/hospitals/inventory/stock-in', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchHospitalBackendData();
        return;
      }
    } catch {
      // fallback
    }

    // Local state fallback
    const units = Number(formData.units) || 1;
    const newBatch = {
      batchNumber: `BAT-${new Date().getFullYear()}${String(new Date().getMonth() + 1).padStart(2, '0')}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      bloodGroup: formData.bloodGroup,
      units,
      remainingUnits: units,
      componentType: formData.componentType,
      collectionDate: formData.collectionDate,
      expiryDate: formData.expiryDate,
      status: 'AVAILABLE',
      storageLocation: formData.storageLocation
    };
    setBatches((prev) => [newBatch, ...prev]);
    setInventory((prev) =>
      prev.map((i) =>
        i.bloodGroup === formData.bloodGroup
          ? { ...i, unitsAvailable: i.unitsAvailable + units, isLowStock: (i.unitsAvailable + units) <= i.lowStockThreshold }
          : i
      )
    );
    setTransactions((prev) => [
      {
        _id: `tx_${Date.now()}`,
        transactionType: 'STOCK_IN',
        bloodGroup: formData.bloodGroup,
        units,
        donorName: formData.donorName || 'Hospital Unit',
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handleStockOut = async (formData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/hospitals/inventory/stock-out', {
        method: 'POST',
        headers,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        await fetchHospitalBackendData();
        return;
      }
    } catch {
      // fallback
    }

    const units = Number(formData.units) || 1;
    setInventory((prev) =>
      prev.map((i) =>
        i.bloodGroup === formData.bloodGroup
          ? {
              ...i,
              unitsAvailable: Math.max(0, i.unitsAvailable - units),
              isLowStock: Math.max(0, i.unitsAvailable - units) <= i.lowStockThreshold
            }
          : i
      )
    );
    setTransactions((prev) => [
      {
        _id: `tx_${Date.now()}`,
        transactionType: 'TRANSFUSION',
        bloodGroup: formData.bloodGroup,
        units,
        patientName: formData.patientName,
        reason: formData.reason,
        createdAt: new Date().toISOString()
      },
      ...prev
    ]);
  };

  const handleDiscardExpired = async () => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/hospitals/inventory/discard-expired', {
        method: 'POST',
        headers
      });
      if (res.ok) {
        await fetchHospitalBackendData();
        return;
      }
    } catch {
      // fallback
    }

    setBatches((prev) =>
      prev.map((b) => (new Date(b.expiryDate) < new Date() ? { ...b, status: 'DISCARDED', remainingUnits: 0 } : b))
    );
  };

  const handleUpdateThreshold = async ({ bloodGroup, threshold }) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/hospitals/inventory/threshold', {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ bloodGroup, lowStockThreshold: threshold })
      });
      if (res.ok) {
        await fetchHospitalBackendData();
        return;
      }
    } catch {
      // fallback
    }

    setInventory((prev) =>
      prev.map((i) =>
        i.bloodGroup === bloodGroup
          ? { ...i, lowStockThreshold: threshold, isLowStock: i.unitsAvailable <= threshold }
          : i
      )
    );
  };

  const handleApprove = async (requestId) => {
    if (parentOnApprove) {
      await parentOnApprove(requestId);
    }
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      await fetch(`/api/v1/hospitals/requests/${requestId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'APPROVED' })
      });
    } catch {
      // fallback
    }

    setHospitalRequests((prev) =>
      prev.map((r) => ((r._id || r.requestId) === requestId ? { ...r, status: 'APPROVED' } : r))
    );
  };

  const handleReject = async (requestId, reason) => {
    if (parentOnReject) {
      await parentOnReject(requestId, reason);
    }
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      await fetch(`/api/v1/hospitals/requests/${requestId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({ status: 'REJECTED', reason })
      });
    } catch {
      // fallback
    }

    setHospitalRequests((prev) =>
      prev.map((r) => ((r._id || r.requestId) === requestId ? { ...r, status: 'REJECTED', rejectionReason: reason } : r))
    );
  };

  const handleFulfill = async (requestId, payload = {}) => {
    if (parentOnFulfill) {
      await parentOnFulfill(requestId);
    }
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      await fetch(`/api/v1/hospitals/requests/${requestId}/status`, {
        method: 'PATCH',
        headers,
        body: JSON.stringify({
          status: 'FULFILLED',
          unitsFulfilled: payload.unitsFulfilled,
          notes: payload.notes
        })
      });
    } catch {
      // fallback
    }

    setHospitalRequests((prev) =>
      prev.map((r) =>
        (r._id || r.requestId) === requestId
          ? { ...r, status: 'FULFILLED', unitsFulfilled: payload.unitsFulfilled || r.unitsRequired }
          : r
      )
    );
  };

  const handleCoordinateDonors = async (req) => {
    setSelectedCoordinationReq(req);
    setActiveSubTab('COORDINATION');

    // Fetch candidate donors from API if possible
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/v1/hospitals/requests/${req._id || req.requestId}/donors`, { headers });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.candidateDonors) {
          setCandidateDonors(json.data.candidateDonors);
        }
      }
    } catch {
      // fallback
    }
  };

  const handleSendInvitations = async ({ requestId, donorIds, message }) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/v1/hospitals/requests/${requestId}/invite`, {
        method: 'POST',
        headers,
        body: JSON.stringify({ donorIds, message })
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.invitations) {
          setInvitations((prev) => [...json.data.invitations, ...prev]);
        }
      }
    } catch {
      // fallback
    }

    // Add local simulation if needed
    const newInvs = donorIds.map((id) => ({
      _id: `inv_${Date.now()}_${id}`,
      donorId: id,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    }));
    setInvitations((prev) => [...newInvs, ...prev]);
  };

  const handleUpdateProfile = async (formData) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/hospitals/profile', {
        method: 'PUT',
        headers,
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data) setHospitalProfile(json.data);
        return;
      }
    } catch {
      // fallback
    }

    setHospitalProfile((prev) => ({
      ...prev,
      name: formData.name,
      city: formData.city,
      phone: formData.phone,
      hospitalDetails: {
        ...prev.hospitalDetails,
        ...formData
      }
    }));
  };

  const handleAddStaff = async (newStaff) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch('/api/v1/hospitals/staff', {
        method: 'POST',
        headers,
        body: JSON.stringify(newStaff)
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.staff) setStaff(json.data.staff);
        return;
      }
    } catch {
      // fallback
    }

    setStaff((prev) => [{ ...newStaff, _id: `s_${Date.now()}` }, ...prev]);
  };

  const handleRemoveStaff = async (staffId) => {
    const token = localStorage.getItem('token') || localStorage.getItem('lifelink_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    try {
      const res = await fetch(`/api/v1/hospitals/staff/${staffId}`, {
        method: 'DELETE',
        headers
      });
      if (res.ok) {
        const json = await res.json();
        if (json.data?.staff) setStaff(json.data.staff);
        return;
      }
    } catch {
      // fallback
    }

    setStaff((prev) => prev.filter((s) => s._id !== staffId));
  };

  // Filter requests for requests view
  const filteredRequests = hospitalRequests.filter((r) => {
    if (selectedBloodGroup !== 'ALL' && r.bloodGroup !== selectedBloodGroup) return false;
    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) return false;
    if (selectedPriority !== 'ALL' && r.priority !== selectedPriority) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchId = r.requestId?.toLowerCase().includes(term);
      const matchPat = r.patientName?.toLowerCase().includes(term);
      const matchHosp = (r.hospital || r.facilityName || '').toLowerCase().includes(term);
      const matchCity = r.city?.toLowerCase().includes(term);
      if (!matchId && !matchPat && !matchHosp && !matchCity) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Hospital Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 bg-slate-900 rounded-3xl border border-slate-800 text-xs font-bold text-white shadow-md">
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={() => setActiveSubTab('OVERVIEW')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl transition cursor-pointer ${
              activeSubTab === 'OVERVIEW' ? 'bg-[#B91C35] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutDashboard size={14} />
            <span>Overview</span>
          </button>

          <button
            onClick={() => setActiveSubTab('INVENTORY')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl transition cursor-pointer ${
              activeSubTab === 'INVENTORY' ? 'bg-[#B91C35] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package size={14} />
            <span>Blood Inventory</span>
          </button>

          <button
            onClick={() => setActiveSubTab('REQUESTS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl transition cursor-pointer ${
              activeSubTab === 'REQUESTS' ? 'bg-[#B91C35] text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Inbox size={14} />
            <span>Requisitions ({hospitalRequests.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('COORDINATION')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl transition cursor-pointer ${
              activeSubTab === 'COORDINATION' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserCheck size={14} />
            <span>Donor Outreach</span>
          </button>

          <button
            onClick={() => setActiveSubTab('STAFF')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl transition cursor-pointer ${
              activeSubTab === 'STAFF' ? 'bg-indigo-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users size={14} />
            <span>Staff ({staff.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab('PROFILE')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl transition cursor-pointer ${
              activeSubTab === 'PROFILE' ? 'bg-slate-800 text-white shadow-xs border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            <Building2 size={14} />
            <span>Facility Profile</span>
          </button>

          <button
            onClick={() => setActiveSubTab('ANALYTICS')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-2xl transition cursor-pointer ${
              activeSubTab === 'ANALYTICS' ? 'bg-slate-800 text-white shadow-xs border border-slate-700' : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 size={14} />
            <span>Analytics & Reports</span>
          </button>
        </div>

        <div className="flex items-center gap-2 pr-2">
          {isVerified ? (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-xl">
              <ShieldCheck size={13} />
              <span>Verified</span>
            </span>
          ) : (
            <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-400 bg-amber-950/60 border border-amber-800 px-2.5 py-1 rounded-xl">
              <ShieldAlert size={13} />
              <span>{verificationStatus}</span>
            </span>
          )}

          <button
            onClick={fetchHospitalBackendData}
            title="Refresh Hospital Data"
            className="p-1.5 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <RefreshCw size={14} className={isRefreshing ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* MODULE 1: OVERVIEW */}
      {activeSubTab === 'OVERVIEW' && (
        <HospitalOverviewView
          hospital={hospitalProfile}
          requests={hospitalRequests}
          inventory={inventory}
          batches={batches}
          recentTransactions={transactions}
          onNavigateTab={setActiveSubTab}
        />
      )}

      {/* MODULE 2: BLOOD INVENTORY */}
      {activeSubTab === 'INVENTORY' && (
        <HospitalInventoryView
          inventory={inventory}
          batches={batches}
          recentTransactions={transactions}
          isVerified={isVerified}
          onStockIn={handleStockIn}
          onStockOut={handleStockOut}
          onDiscardExpired={handleDiscardExpired}
          onUpdateThreshold={handleUpdateThreshold}
        />
      )}

      {/* MODULE 3: EMERGENCY BLOOD REQUESTS */}
      {activeSubTab === 'REQUESTS' && (
        <HospitalRequestsView
          requests={filteredRequests}
          isVerified={isVerified}
          searchTerm={searchTerm}
          onSearchChange={onSearchChange}
          selectedBloodGroup={selectedBloodGroup}
          onBloodGroupChange={onBloodGroupChange}
          selectedStatus={selectedStatus}
          onStatusChange={onStatusChange}
          selectedPriority={selectedPriority}
          onPriorityChange={onPriorityChange}
          onApproveRequest={handleApprove}
          onRejectRequest={handleReject}
          onFulfillRequest={handleFulfill}
          onCoordinateDonors={handleCoordinateDonors}
        />
      )}

      {/* MODULE 4: DONOR COORDINATION */}
      {activeSubTab === 'COORDINATION' && (
        <HospitalDonorCoordinationView
          requests={hospitalRequests}
          selectedRequest={selectedCoordinationReq}
          onSelectRequest={setSelectedCoordinationReq}
          candidateDonors={candidateDonors.length > 0 ? candidateDonors : undefined}
          invitations={invitations}
          onSendInvitations={handleSendInvitations}
          isVerified={isVerified}
        />
      )}

      {/* MODULE: STAFF ROSTER */}
      {activeSubTab === 'STAFF' && (
        <HospitalStaffView
          staff={staff}
          isVerified={isVerified}
          onAddStaff={handleAddStaff}
          onRemoveStaff={handleRemoveStaff}
        />
      )}

      {/* MODULE 5: FACILITY PROFILE */}
      {activeSubTab === 'PROFILE' && (
        <HospitalProfileView
          hospital={hospitalProfile}
          onUpdateProfile={handleUpdateProfile}
        />
      )}

      {/* MODULE 6: REPORTS & ANALYTICS */}
      {activeSubTab === 'ANALYTICS' && (
        <HospitalAnalyticsView
          stats={analyticsData}
          analytics={analyticsData}
        />
      )}
    </div>
  );
}
