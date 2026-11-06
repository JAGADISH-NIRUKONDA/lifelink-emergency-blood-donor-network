import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Flame,
  CheckCheck,
  Eye,
  MapPin,
  AlertCircle,
  Activity,
  Droplet,
  Package,
  UserCheck,
  Building2,
  BarChart3,
  Inbox
} from 'lucide-react';
import { StatusBadge, PriorityBadge } from './StatusBadge';
import HospitalInventoryView from '../hospital/HospitalInventoryView';
import HospitalStaffView from '../hospital/HospitalStaffView';
import HospitalProfileView from '../hospital/HospitalProfileView';
import HospitalAnalyticsView from '../hospital/HospitalAnalyticsView';

const BLOOD_GROUPS = ['ALL', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
const STATUSES = ['ALL', 'PENDING', 'APPROVED', 'MATCHED', 'FULFILLED', 'REJECTED', 'CANCELLED'];
const PRIORITIES = ['ALL', 'CRITICAL', 'HIGH', 'NORMAL'];

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

const INITIAL_DEMO_STAFF = [
  { _id: 's1', name: 'Dr. Evelyn Reed', email: 'e.reed@hospital.org', phone: '+1 555-8811', role: 'CHIEF_MEDICAL_OFFICER', department: 'Transfusion Medicine', shift: 'MORNING' },
  { _id: 's2', name: 'Dr. Michael Chen', email: 'm.chen@hospital.org', phone: '+1 555-8812', role: 'HEMATOLOGIST', department: 'Hematology & Oncology', shift: 'EVENING' },
  { _id: 's3', name: 'Nurse Clara Vance', email: 'c.vance@hospital.org', phone: '+1 555-8813', role: 'NURSE_COORDINATOR', department: 'Blood Bank Donor Intake', shift: 'ROTATING' }
];

export default function HospitalDashboard({
  requests = [],
  stats = {},
  isLoading = false,
  searchTerm = '',
  onSearchChange,
  selectedBloodGroup = 'ALL',
  onBloodGroupChange,
  selectedStatus = 'ALL',
  onStatusChange,
  selectedPriority = 'ALL',
  onPriorityChange,
  onApproveRequest,
  onRejectRequest,
  onFulfillRequest,
  onFindDonors,
  onViewDetails
}) {
  const [activeSubTab, setActiveSubTab] = useState('REQUESTS'); // 'REQUESTS' | 'INVENTORY' | 'STAFF' | 'PROFILE' | 'ANALYTICS'
  const [rejectingId, setRejectingId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Hospital Phase 6 Feature States
  const [inventory, setInventory] = useState(INITIAL_DEMO_INVENTORY);
  const [batches, setBatches] = useState(INITIAL_DEMO_BATCHES);
  const [staff, setStaff] = useState(INITIAL_DEMO_STAFF);
  const [hospitalProfile, setHospitalProfile] = useState({
    name: 'Metro Trauma Center',
    city: 'Metropolis',
    phone: '+1 555-019-4400',
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

  const handleStockIn = (formData) => {
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
  };

  const handleStockOut = (formData) => {
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
  };

  const handleDiscardExpired = () => {
    setBatches((prev) =>
      prev.map((b) => (new Date(b.expiryDate) < new Date() ? { ...b, status: 'DISCARDED', remainingUnits: 0 } : b))
    );
  };

  const handleUpdateThreshold = ({ bloodGroup, threshold }) => {
    setInventory((prev) =>
      prev.map((i) =>
        i.bloodGroup === bloodGroup
          ? { ...i, lowStockThreshold: threshold, isLowStock: i.unitsAvailable <= threshold }
          : i
      )
    );
  };

  const handleAddStaff = (newStaff) => {
    setStaff((prev) => [{ ...newStaff, _id: `s_${Date.now()}` }, ...prev]);
  };

  const handleRemoveStaff = (staffId) => {
    setStaff((prev) => prev.filter((s) => s._id !== staffId));
  };

  const handleConfirmReject = async () => {
    if (!rejectingId) return;
    setIsProcessing(true);
    try {
      await onRejectRequest(rejectingId, rejectionReason || 'Institutional review rejection');
      setRejectingId(null);
    } finally {
      setIsProcessing(false);
    }
  };

  const overview = stats?.overview || {};
  const totalStockAvailable = inventory.reduce((acc, curr) => acc + (curr.unitsAvailable || 0), 0);

  return (
    <div className="space-y-6">
      {/* Hospital Sub-Navigation Bar */}
      <div className="flex flex-wrap items-center gap-2 p-1.5 bg-slate-900/80 rounded-2xl border border-slate-800 text-xs font-bold text-white">
        <button
          onClick={() => setActiveSubTab('REQUESTS')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
            activeSubTab === 'REQUESTS' ? 'bg-[#B91C35] text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Inbox size={15} />
          <span>Incoming Requisitions ({requests.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('INVENTORY')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
            activeSubTab === 'INVENTORY' ? 'bg-[#B91C35] text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Package size={15} />
          <span>Blood Inventory ({totalStockAvailable} Units)</span>
        </button>

        <button
          onClick={() => setActiveSubTab('STAFF')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
            activeSubTab === 'STAFF' ? 'bg-purple-600 text-white shadow-xs' : 'text-slate-400 hover:text-white'
          }`}
        >
          <UserCheck size={15} />
          <span>Staff Roster ({staff.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('PROFILE')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
            activeSubTab === 'PROFILE' ? 'bg-slate-800 text-white shadow-xs border border-slate-700' : 'text-slate-400 hover:text-white'
          }`}
        >
          <Building2 size={15} />
          <span>Facility Profile</span>
        </button>

        <button
          onClick={() => setActiveSubTab('ANALYTICS')}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-xl transition cursor-pointer ${
            activeSubTab === 'ANALYTICS' ? 'bg-slate-800 text-white shadow-xs border border-slate-700' : 'text-slate-400 hover:text-white'
          }`}
        >
          <BarChart3 size={15} />
          <span>Analytics & Reports</span>
        </button>
      </div>

      {/* Top Analytics Cards (Rendered across tabs for quick context) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-red-100 text-red-700 flex items-center justify-center font-bold shrink-0">
            <Flame className="w-6 h-6 text-red-600 animate-pulse" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {overview.criticalRequests ?? requests.filter((r) => r.priority === 'CRITICAL').length}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Critical Urgency
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
            <Activity className="w-6 h-6 text-amber-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {overview.pendingRequests ?? requests.filter((r) => r.status === 'PENDING').length}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Pending Triage
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold shrink-0">
            <Droplet className="w-6 h-6 text-purple-600 fill-current" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {totalStockAvailable}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Units in Inventory
            </span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
            <CheckCheck className="w-6 h-6 text-emerald-600" />
          </div>
          <div>
            <span className="text-2xl font-black text-slate-900 block leading-none">
              {overview.fulfilledRequests ?? requests.filter((r) => r.status === 'FULFILLED').length}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mt-1">
              Transfusions Fulfilled
            </span>
          </div>
        </div>
      </div>

      {/* SUB-VIEW 1: INVENTORY */}
      {activeSubTab === 'INVENTORY' && (
        <HospitalInventoryView
          inventory={inventory}
          batches={batches}
          onStockIn={handleStockIn}
          onStockOut={handleStockOut}
          onDiscardExpired={handleDiscardExpired}
          onUpdateThreshold={handleUpdateThreshold}
        />
      )}

      {/* SUB-VIEW 2: STAFF */}
      {activeSubTab === 'STAFF' && (
        <HospitalStaffView
          staff={staff}
          onAddStaff={handleAddStaff}
          onRemoveStaff={handleRemoveStaff}
        />
      )}

      {/* SUB-VIEW 3: PROFILE */}
      {activeSubTab === 'PROFILE' && (
        <HospitalProfileView
          hospital={hospitalProfile}
          onUpdateProfile={(data) => {
            setHospitalProfile((prev) => ({
              ...prev,
              name: data.name,
              city: data.city,
              phone: data.phone,
              hospitalDetails: {
                ...prev.hospitalDetails,
                ...data
              }
            }));
          }}
        />
      )}

      {/* SUB-VIEW 4: ANALYTICS */}
      {activeSubTab === 'ANALYTICS' && (
        <HospitalAnalyticsView
          stats={stats}
        />
      )}

      {/* SUB-VIEW 5: INCOMING REQUESTS (Existing Triage Management) */}
      {activeSubTab === 'REQUESTS' && (
        <>
          {/* Filter and Search Bar */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col md:flex-row gap-3">
              {/* Search box */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search by Request ID, Patient Name, Hospital, or City..."
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                />
              </div>

              {/* Blood group select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  Group:
                </span>
                <select
                  value={selectedBloodGroup}
                  onChange={(e) => onBloodGroupChange(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-[#B91C35] bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                >
                  {BLOOD_GROUPS.map((g) => (
                    <option key={g} value={g}>
                      {g === 'ALL' ? 'All Blood Types' : g}
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  Priority:
                </span>
                <select
                  value={selectedPriority}
                  onChange={(e) => onPriorityChange(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                >
                  {PRIORITIES.map((p) => (
                    <option key={p} value={p}>
                      {p === 'ALL' ? 'All Priorities' : p}
                    </option>
                  ))}
                </select>
              </div>

              {/* Status select */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider hidden sm:inline">
                  Status:
                </span>
                <select
                  value={selectedStatus}
                  onChange={(e) => onStatusChange(e.target.value)}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 bg-white focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                >
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s === 'ALL' ? 'All Statuses' : s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Requests Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 text-xs uppercase tracking-wider">
                  <tr>
                    <th className="p-4">Requisition</th>
                    <th className="p-4">Patient & Hospital</th>
                    <th className="p-4">Blood Group</th>
                    <th className="p-4">Units Needed</th>
                    <th className="p-4">Priority</th>
                    <th className="p-4">Status</th>
                    <th className="p-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {isLoading ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        Loading requests...
                      </td>
                    </tr>
                  ) : requests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-slate-400">
                        No blood requests matching the selected filters.
                      </td>
                    </tr>
                  ) : (
                    requests.map((r) => {
                      const isPending = r.status === 'PENDING';
                      const isApproved = r.status === 'APPROVED';
                      const isMatched = r.status === 'MATCHED';
                      const isFulfilled = r.status === 'FULFILLED';
                      const isTerminal = ['FULFILLED', 'REJECTED', 'CANCELLED'].includes(r.status);

                      return (
                        <tr key={r._id || r.requestId} className="hover:bg-slate-50/70 transition">
                          <td className="p-4 font-mono font-bold text-slate-900 text-xs">
                            {r.requestId || 'BLR-N/A'}
                          </td>
                          <td className="p-4">
                            <div className="font-bold text-slate-900">{r.patientName}</div>
                            <div className="text-xs text-slate-500 flex items-center gap-1">
                              <MapPin size={11} /> {r.hospital} ({r.city})
                            </div>
                          </td>
                          <td className="p-4">
                            <span className="font-black text-base text-[#B91C35] bg-red-50 border border-red-200 px-2.5 py-1 rounded-lg">
                              {r.bloodGroup}
                            </span>
                          </td>
                          <td className="p-4 font-bold text-slate-700">
                            {r.unitsRequired} {r.unitsRequired > 1 ? 'Units' : 'Unit'}
                            {r.unitsFulfilled > 0 && (
                              <span className="text-xs text-emerald-600 block">
                                ({r.unitsFulfilled} fulfilled)
                              </span>
                            )}
                          </td>
                          <td className="p-4">
                            <PriorityBadge priority={r.priority} />
                          </td>
                          <td className="p-4">
                            <StatusBadge status={r.status} />
                          </td>
                          <td className="p-4 text-right space-x-1.5 whitespace-nowrap">
                            <button
                              onClick={() => onViewDetails(r)}
                              title="View Requisition Details"
                              className="p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition"
                            >
                              <Eye size={16} />
                            </button>

                            {isPending && (
                              <>
                                <button
                                  onClick={() => onApproveRequest(r._id || r.requestId)}
                                  className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold transition shadow-xs"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => setRejectingId(r._id || r.requestId)}
                                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold border border-rose-200 transition"
                                >
                                  Reject
                                </button>
                              </>
                            )}

                            {(isApproved || isMatched) && (
                              <>
                                <button
                                  onClick={() => onFindDonors(r)}
                                  className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold transition shadow-xs"
                                >
                                  Find Donors
                                </button>
                                <button
                                  onClick={() => onFulfillRequest(r._id || r.requestId)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
                                >
                                  Fulfill
                                </button>
                              </>
                            )}

                            {isTerminal && (
                              <span className="text-xs text-slate-400 font-medium italic">
                                {isFulfilled ? 'Completed' : 'Closed'}
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* Reject Modal Dialog */}
      <AnimatePresence>
        {rejectingId && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200 space-y-4"
            >
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <AlertCircle className="text-rose-600" size={18} />
                Reject Emergency Blood Requisition
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Please state the clinical or institutional reason for rejection (e.g. duplicate patient file, hospital inventory available, or invalid admitting ward details).
              </p>
              <textarea
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection justification..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRejectingId(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isProcessing}
                  onClick={handleConfirmReject}
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white transition shadow-sm"
                >
                  {isProcessing ? 'Rejecting...' : 'Confirm Rejection'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
