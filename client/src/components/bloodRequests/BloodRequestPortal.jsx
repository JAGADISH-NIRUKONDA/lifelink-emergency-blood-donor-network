import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Droplet,
  PlusCircle,
  History,
  Hospital,
  X
} from 'lucide-react';
import BloodRequestForm from './BloodRequestForm';
import PatientRequestHistory from './PatientRequestHistory';
import HospitalDashboard from './HospitalDashboard';
import RequestDetailsModal from './RequestDetailsModal';
import MatchingDonorsModal from './MatchingDonorsModal';
import Toast from './Toast';

// High-fidelity initial demo records for zero-friction client preview
const INITIAL_DEMO_REQUESTS = [
  {
    _id: 'req_001',
    requestId: 'BLR-2026-CR88',
    patientName: 'Eleanor Vance',
    bloodGroup: 'O-',
    unitsRequired: 3,
    unitsFulfilled: 0,
    hospital: 'Metro Trauma Center',
    city: 'Metropolis',
    requiredDate: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(),
    priority: 'CRITICAL',
    status: 'PENDING',
    contactPhone: '+1 (555) 019-4432',
    medicalNotes: 'Acute surgical trauma following vehicular accident. Blood required urgently.',
    createdAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
    statusHistory: [
      { status: 'PENDING', changedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(), note: 'Submitted via emergency intake' }
    ]
  },
  {
    _id: 'req_002',
    requestId: 'BLR-2026-AB14',
    patientName: 'Marcus Bennett',
    bloodGroup: 'A+',
    unitsRequired: 2,
    unitsFulfilled: 1,
    hospital: 'St. Jude General Hospital',
    city: 'Metropolis',
    requiredDate: new Date(Date.now() + 12 * 60 * 60 * 1000).toISOString(),
    priority: 'HIGH',
    status: 'APPROVED',
    contactPhone: '+1 (555) 014-9821',
    medicalNotes: 'Scheduled cardiac bypass surgery in Ward 3B.',
    createdAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
    statusHistory: [
      { status: 'PENDING', changedAt: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(), note: 'Requisition submitted' },
      { status: 'APPROVED', changedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), note: 'Hospital cross-match approved' }
    ]
  },
  {
    _id: 'req_003',
    requestId: 'BLR-2026-B922',
    patientName: 'Clara Oswald',
    bloodGroup: 'B+',
    unitsRequired: 1,
    unitsFulfilled: 1,
    hospital: 'Memorial Children Clinic',
    city: 'West District',
    requiredDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    priority: 'NORMAL',
    status: 'FULFILLED',
    contactPhone: '+1 (555) 018-7711',
    medicalNotes: 'Thalassemia regular transfusion support.',
    createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
    statusHistory: [
      { status: 'PENDING', changedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(), note: 'Requisition submitted' },
      { status: 'APPROVED', changedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(), note: 'Approved by clinical staff' },
      { status: 'MATCHED', changedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), note: 'Donor matched' },
      { status: 'FULFILLED', changedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), note: 'Transfusion completed successfully' }
    ]
  }
];

export default function BloodRequestPortal({ isOpen, onClose, initialTab = 'create', defaultBloodGroup = 'O+' }) {
  const [activeTab, setActiveTab] = useState(initialTab); // 'create' | 'history' | 'hospital'
  const [requests, setRequests] = useState(INITIAL_DEMO_REQUESTS);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [matchingModalData, setMatchingModalData] = useState(null);
  const [toasts, setToasts] = useState([]);

  // Hospital Dashboard filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedBloodGroup, setSelectedBloodGroup] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');

  const addToast = (type, title, message) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // 1. Submit Request Handler
  const handleCreateRequest = async (formData) => {
    const newReq = {
      _id: `req_${Date.now()}`,
      requestId: `BLR-${new Date().getFullYear()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
      ...formData,
      status: 'PENDING',
      unitsFulfilled: 0,
      createdAt: new Date().toISOString(),
      statusHistory: [
        {
          status: 'PENDING',
          changedAt: new Date().toISOString(),
          note: 'Emergency blood requisition submitted'
        }
      ]
    };

    setRequests((prev) => [newReq, ...prev]);
    addToast(
      'success',
      'Requisition Broadcasted!',
      `Emergency request #${newReq.requestId} for ${newReq.unitsRequired} units of ${newReq.bloodGroup} blood was broadcasted.`
    );
    setActiveTab('history');
  };

  // 2. Cancel Request Handler
  const handleCancelRequest = async (reqId, reason) => {
    setRequests((prev) =>
      prev.map((r) => {
        if ((r._id || r.requestId) === reqId) {
          return {
            ...r,
            status: 'CANCELLED',
            cancellationReason: reason,
            statusHistory: [
              ...r.statusHistory,
              { status: 'CANCELLED', changedAt: new Date().toISOString(), note: reason }
            ]
          };
        }
        return r;
      })
    );
    addToast('info', 'Requisition Cancelled', 'The blood request status has been updated to CANCELLED.');
  };

  // 3. Hospital Approve Handler
  const handleApproveRequest = async (reqId) => {
    setRequests((prev) =>
      prev.map((r) => {
        if ((r._id || r.requestId) === reqId) {
          return {
            ...r,
            status: 'APPROVED',
            statusHistory: [
              ...r.statusHistory,
              { status: 'APPROVED', changedAt: new Date().toISOString(), note: 'Verified by hospital blood bank desk' }
            ]
          };
        }
        return r;
      })
    );
    addToast('success', 'Request Approved', 'The requisition has been approved and moved to active clinical matching.');
  };

  // 4. Hospital Reject Handler
  const handleRejectRequest = async (reqId, reason) => {
    setRequests((prev) =>
      prev.map((r) => {
        if ((r._id || r.requestId) === reqId) {
          return {
            ...r,
            status: 'REJECTED',
            rejectionReason: reason,
            statusHistory: [
              ...r.statusHistory,
              { status: 'REJECTED', changedAt: new Date().toISOString(), note: reason }
            ]
          };
        }
        return r;
      })
    );
    addToast('error', 'Request Rejected', 'The requisition has been marked as REJECTED with recorded justification.');
  };

  // 5. Hospital Fulfill Handler
  const handleFulfillRequest = async (reqId) => {
    setRequests((prev) =>
      prev.map((r) => {
        if ((r._id || r.requestId) === reqId) {
          return {
            ...r,
            status: 'FULFILLED',
            unitsFulfilled: r.unitsRequired,
            statusHistory: [
              ...r.statusHistory,
              { status: 'FULFILLED', changedAt: new Date().toISOString(), note: 'Transfusion completed successfully' }
            ]
          };
        }
        return r;
      })
    );
    addToast('success', 'Transfusion Fulfilled', 'All blood units have been recorded as clinically fulfilled.');
  };

  // 6. Donor Matching Trigger
  const handleFindDonors = (req) => {
    // Generate compatible donor candidates based on biological compatibility
    const compatibleGroups = req.bloodGroup === 'AB+'
      ? ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
      : req.bloodGroup === 'O-'
      ? ['O-']
      : req.bloodGroup === 'O+'
      ? ['O+', 'O-']
      : [req.bloodGroup, 'O-'];

    const mockCandidates = [
      {
        donor: {
          _id: 'd1',
          name: 'Sarah Jenkins',
          bloodGroup: req.bloodGroup,
          city: req.city,
          phone: '+1 (555) 234-8891',
          totalDonations: 6
        },
        matchDetails: {
          score: 190,
          isExactMatch: true,
          isSameCity: true,
          eligibility: { isEligible: true, summary: 'Rest period cleared (72 days since last donation)' }
        }
      },
      {
        donor: {
          _id: 'd2',
          name: 'Lucas Gray',
          bloodGroup: 'O-',
          city: req.city,
          phone: '+1 (555) 774-1234',
          totalDonations: 9
        },
        matchDetails: {
          score: 160,
          isExactMatch: req.bloodGroup === 'O-',
          isSameCity: true,
          eligibility: { isEligible: true, summary: 'Universal Red Cell Donor (Eligible)' }
        }
      },
      {
        donor: {
          _id: 'd3',
          name: 'Dr. Raymond Holt',
          bloodGroup: req.bloodGroup,
          city: 'Adjacent District (8 km)',
          phone: '+1 (555) 883-9900',
          totalDonations: 14
        },
        matchDetails: {
          score: 130,
          isExactMatch: true,
          isSameCity: false,
          eligibility: { isEligible: true, summary: 'Rest period cleared' }
        }
      }
    ];

    setMatchingModalData({
      request: req,
      matchingData: {
        totalMatchesFound: mockCandidates.length,
        compatibleBloodGroups: compatibleGroups,
        donors: mockCandidates
      }
    });
  };

  // Filter requests for Hospital Dashboard
  const filteredHospitalRequests = requests.filter((r) => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        r.requestId?.toLowerCase().includes(term) ||
        r.patientName?.toLowerCase().includes(term) ||
        r.hospital?.toLowerCase().includes(term) ||
        r.city?.toLowerCase().includes(term);
      if (!match) return false;
    }

    if (selectedBloodGroup !== 'ALL' && r.bloodGroup !== selectedBloodGroup) {
      return false;
    }

    if (selectedStatus !== 'ALL' && r.status !== selectedStatus) {
      return false;
    }

    if (selectedPriority !== 'ALL' && r.priority !== selectedPriority) {
      return false;
    }

    return true;
  });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-sm p-3 sm:p-6 flex items-center justify-center">
      {/* Portal Container */}
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.96 }}
        className="relative w-full max-w-6xl bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 overflow-hidden my-6 flex flex-col max-h-[92vh]"
      >
        {/* Top Portal Navigation Header */}
        <div className="bg-[#101827] text-white p-5 sm:px-8 sm:py-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#B91C35] text-white flex items-center justify-center shadow-md shadow-red-950/50">
              <Droplet className="w-6 h-6 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl sm:text-2xl font-black tracking-tight">
                  Life<span className="text-[#B91C35]">Link</span>
                </span>
                <span className="text-[10px] bg-red-950/90 text-red-300 font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-red-500/30">
                  Phase 4 Requisition Engine
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Emergency Blood Request Management & Clinical Dispatch Portal
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Switcher Pills */}
            <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 text-xs font-bold">
              <button
                onClick={() => setActiveTab('create')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
                  activeTab === 'create'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <PlusCircle size={14} />
                <span>New Requisition</span>
              </button>

              <button
                onClick={() => setActiveTab('history')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
                  activeTab === 'history'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <History size={14} />
                <span>My Requests ({requests.length})</span>
              </button>

              <button
                onClick={() => setActiveTab('hospital')}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg transition ${
                  activeTab === 'hospital'
                    ? 'bg-slate-800 text-white shadow-xs border border-slate-700'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Hospital size={14} />
                <span>Hospital Desk</span>
              </button>
            </div>

            <button
              onClick={onClose}
              className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition shrink-0"
              aria-label="Close portal"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Portal Body with independent scroll */}
        <div className="p-5 sm:p-8 overflow-y-auto flex-1">
          {activeTab === 'create' && (
            <div className="max-w-3xl mx-auto">
              <BloodRequestForm
                onSubmitRequest={handleCreateRequest}
                defaultBloodGroup={defaultBloodGroup}
              />
            </div>
          )}

          {activeTab === 'history' && (
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                    Submitted Blood Requisitions
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Live lifecycle tracking, hospital approvals, and dispatch notifications
                  </p>
                </div>
                <button
                  onClick={() => setActiveTab('create')}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#B91C35] text-white text-xs font-bold hover:bg-[#9E152C] transition shadow-xs"
                >
                  <PlusCircle size={14} />
                  <span>New Request</span>
                </button>
              </div>

              <PatientRequestHistory
                requests={requests}
                onViewDetails={(req) => setSelectedRequest(req)}
                onCancelRequest={handleCancelRequest}
                onCreateNew={() => setActiveTab('create')}
              />
            </div>
          )}

          {activeTab === 'hospital' && (
            <div>
              <div className="mb-6">
                <h3 className="text-xl font-bold text-slate-900 tracking-tight">
                  Hospital Emergency Requisition Command Center
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Verify emergency patient admissions, approve clinical requests, search nearby donors, and record fulfilled transfusions
                </p>
              </div>

              <HospitalDashboard
                requests={filteredHospitalRequests}
                stats={{
                  overview: {
                    criticalRequests: requests.filter((r) => r.priority === 'CRITICAL').length,
                    pendingRequests: requests.filter((r) => r.status === 'PENDING').length,
                    matchedRequests: requests.filter((r) => r.status === 'MATCHED').length,
                    fulfilledRequests: requests.filter((r) => r.status === 'FULFILLED').length
                  }
                }}
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                selectedBloodGroup={selectedBloodGroup}
                onBloodGroupChange={setSelectedBloodGroup}
                selectedStatus={selectedStatus}
                onStatusChange={setSelectedStatus}
                selectedPriority={selectedPriority}
                onPriorityChange={setSelectedPriority}
                onApproveRequest={handleApproveRequest}
                onRejectRequest={handleRejectRequest}
                onFulfillRequest={handleFulfillRequest}
                onFindDonors={handleFindDonors}
                onViewDetails={(req) => setSelectedRequest(req)}
              />
            </div>
          )}
        </div>

        {/* Modal: Request Details Sheet */}
        <RequestDetailsModal
          isOpen={Boolean(selectedRequest)}
          request={selectedRequest}
          compatibility={{
            bloodGroup: selectedRequest?.bloodGroup,
            receiveFrom: selectedRequest?.bloodGroup === 'AB+'
              ? ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+']
              : selectedRequest?.bloodGroup === 'O-'
              ? ['O-']
              : selectedRequest?.bloodGroup === 'O+'
              ? ['O+', 'O-']
              : [selectedRequest?.bloodGroup, 'O-']
          }}
          onClose={() => setSelectedRequest(null)}
        />

        {/* Modal: Compatible Donors Matching Sheet */}
        <MatchingDonorsModal
          isOpen={Boolean(matchingModalData)}
          request={matchingModalData?.request}
          matchingData={matchingModalData?.matchingData}
          onClose={() => setMatchingModalData(null)}
          onNotifyDonor={(donorId) => {
            addToast('success', 'Emergency Alert Dispatched', `Compatible donor ${donorId} notified via secure SMS/App routing.`);
          }}
        />

        {/* Floating Toasts */}
        <Toast toasts={toasts} onDismiss={dismissToast} />
      </motion.div>
    </div>
  );
}
