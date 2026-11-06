import React, { useState } from 'react';
import {
  Search,
  Filter,
  Shield,
  ShieldAlert,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  X,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

const ROLE_OPTIONS = ['ALL', 'ADMIN', 'HOSPITAL', 'DONOR', 'PATIENT', 'VOLUNTEER'];
const STATUS_OPTIONS = ['ALL', 'ACTIVE', 'INACTIVE'];

export default function AdminUserManagement({
  users = [],
  pagination = {},
  onSearch,
  onFilterRole,
  onFilterStatus,
  onUpdateStatus,
  onUpdateRole,
  onPageChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Modals state
  const [viewingUser, setViewingUser] = useState(null);
  const [statusDialogUser, setStatusDialogUser] = useState(null);
  const [statusReason, setStatusReason] = useState('');
  const [roleDialogUser, setRoleDialogUser] = useState(null);
  const [newRole, setNewRole] = useState('DONOR');
  const [roleReason, setRoleReason] = useState('');
  const [errorMessage, setErrorMessage] = useState(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    if (onFilterRole) onFilterRole(role);
  };

  const handleStatusSelect = (status) => {
    setSelectedStatus(status);
    if (onFilterStatus) onFilterStatus(status);
  };

  const handleStatusConfirm = async () => {
    if (!statusDialogUser) return;
    setErrorMessage(null);
    try {
      await onUpdateStatus(statusDialogUser._id, !statusDialogUser.isActive, statusReason);
      setStatusDialogUser(null);
      setStatusReason('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update user status.');
    }
  };

  const handleRoleConfirm = async () => {
    if (!roleDialogUser) return;
    setErrorMessage(null);
    try {
      await onUpdateRole(roleDialogUser._id, newRole, roleReason);
      setRoleDialogUser(null);
      setRoleReason('');
    } catch (err) {
      setErrorMessage(err.message || 'Failed to update user role.');
    }
  };

  return (
    <div className="space-y-5">
      {/* Search & Filter Header */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input
              type="text"
              placeholder="Search by name, email, phone, facility name..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            />
          </div>

          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-lg">
              {STATUS_OPTIONS.map((st) => (
                <button
                  key={st}
                  onClick={() => handleStatusSelect(st)}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-md transition cursor-pointer ${
                    selectedStatus === st
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Role Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Roles:
          </span>
          {ROLE_OPTIONS.map((role) => (
            <button
              key={role}
              onClick={() => handleRoleSelect(role)}
              className={`text-xs font-semibold px-3 py-1 rounded-full transition cursor-pointer ${
                selectedRole === role
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Directory Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">User</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Blood Group</th>
                <th className="py-3 px-4">City</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {users.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold flex items-center justify-center text-xs">
                          {u.name?.charAt(0) || 'U'}
                        </div>
                        <div>
                          <div className="font-bold text-slate-900 flex items-center gap-1.5">
                            <span>{u.name}</span>
                            {u.role === 'ADMIN' && (
                              <Shield size={12} className="text-[#B91C35]" title="Super Admin" />
                            )}
                          </div>
                          <div className="text-[11px] text-slate-500">{u.email}</div>
                          {u.hospitalDetails?.facilityName && (
                            <div className="text-[10px] text-indigo-600 font-medium">
                              {u.hospitalDetails.facilityName}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${
                          u.role === 'ADMIN'
                            ? 'bg-red-50 text-[#B91C35] border-red-200'
                            : u.role === 'HOSPITAL'
                              ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                              : u.role === 'DONOR'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : u.role === 'VOLUNTEER'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                  : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-700">
                      {u.bloodGroup ? (
                        <span className="px-2 py-0.5 rounded bg-red-50 text-[#B91C35] border border-red-100 font-bold">
                          {u.bloodGroup}
                        </span>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-slate-600">
                      {u.city || '—'}
                    </td>

                    <td className="py-3 px-4">
                      {u.isActive ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle size={13} className="text-emerald-500" />
                          <span>Active</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                          <XCircle size={13} className="text-rose-500" />
                          <span>Deactivated</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => setViewingUser(u)}
                          title="View Profile"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        >
                          <Eye size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setRoleDialogUser(u);
                            setNewRole(u.role);
                            setRoleReason('');
                            setErrorMessage(null);
                          }}
                          title="Change Role"
                          className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                        >
                          <Edit size={14} />
                        </button>
                        <button
                          onClick={() => {
                            setStatusDialogUser(u);
                            setStatusReason('');
                            setErrorMessage(null);
                          }}
                          title={u.isActive ? 'Deactivate User' : 'Activate User'}
                          className={`p-1.5 rounded-lg transition cursor-pointer ${
                            u.isActive
                              ? 'text-rose-600 hover:bg-rose-50'
                              : 'text-emerald-600 hover:bg-emerald-50'
                          }`}
                        >
                          {u.isActive ? <XCircle size={14} /> : <CheckCircle size={14} />}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        {pagination && pagination.pages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Showing Page {pagination.page} of {pagination.pages} ({pagination.total} users)
            </span>
            <div className="flex items-center gap-1.5">
              <button
                disabled={pagination.page <= 1}
                onClick={() => onPageChange && onPageChange(pagination.page - 1)}
                className="px-2.5 py-1 rounded bg-white border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                Previous
              </button>
              <button
                disabled={pagination.page >= pagination.pages}
                onClick={() => onPageChange && onPageChange(pagination.page + 1)}
                className="px-2.5 py-1 rounded bg-white border border-slate-200 disabled:opacity-40 cursor-pointer"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View User Profile Modal */}
      {viewingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setViewingUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-red-50 text-[#B91C35] font-black text-lg flex items-center justify-center">
                {viewingUser.name?.charAt(0)}
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">{viewingUser.name}</h3>
                <p className="text-xs text-slate-500">{viewingUser.email}</p>
              </div>
            </div>

            <div className="space-y-2.5 text-xs border-t border-slate-100 pt-3">
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Role:</span>
                <span className="font-bold text-slate-900">{viewingUser.role}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Account Status:</span>
                <span className={`font-bold ${viewingUser.isActive ? 'text-emerald-700' : 'text-rose-700'}`}>
                  {viewingUser.isActive ? 'Active' : 'Deactivated'}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Phone:</span>
                <span className="font-semibold text-slate-800">{viewingUser.phone || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">Blood Group:</span>
                <span className="font-bold text-[#B91C35]">{viewingUser.bloodGroup || '—'}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-50">
                <span className="text-slate-500">City / Location:</span>
                <span className="font-semibold text-slate-800">{viewingUser.city || '—'}</span>
              </div>
              {viewingUser.hospitalDetails?.facilityName && (
                <div className="flex justify-between py-1 border-b border-slate-50">
                  <span className="text-slate-500">Facility:</span>
                  <span className="font-semibold text-indigo-700">{viewingUser.hospitalDetails.facilityName}</span>
                </div>
              )}
            </div>

            <div className="mt-5 flex justify-end">
              <button
                onClick={() => setViewingUser(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Change User Role Modal */}
      {roleDialogUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setRoleDialogUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
                <UserCheck size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Modify Participant Role</h3>
                <p className="text-xs text-slate-500">{roleDialogUser.name}</p>
              </div>
            </div>

            {roleDialogUser.role === 'ADMIN' && (
              <div className="p-3 mb-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-[11px] flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>Caution: You are modifying a Super Admin. The platform requires at least one active Super Admin.</span>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">New Role *</label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                >
                  {ROLE_OPTIONS.filter((r) => r !== 'ALL').map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Audit Reason / Justification</label>
                <textarea
                  rows={2}
                  placeholder="Reason for role change (persisted to Audit Log)..."
                  value={roleReason}
                  onChange={(e) => setRoleReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRoleDialogUser(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleRoleConfirm}
                  className="px-4 py-1.5 rounded-lg bg-[#B91C35] hover:bg-[#9E152C] text-white text-xs font-semibold transition cursor-pointer"
                >
                  Update Role
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Toggle Status Confirmation Dialog */}
      {statusDialogUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setStatusDialogUser(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div
                className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                  statusDialogUser.isActive ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'
                }`}
              >
                {statusDialogUser.isActive ? <ShieldAlert size={18} /> : <CheckCircle size={18} />}
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  {statusDialogUser.isActive ? 'Deactivate Account' : 'Reactivate Account'}
                </h3>
                <p className="text-xs text-slate-500">{statusDialogUser.name} ({statusDialogUser.email})</p>
              </div>
            </div>

            {statusDialogUser.role === 'ADMIN' && statusDialogUser.isActive && (
              <div className="p-3 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-[11px] flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>
                  Safety Guard Active: Deactivating the last active Super Admin is blocked by the system core.
                </span>
              </div>
            )}

            {errorMessage && (
              <div className="p-2.5 mb-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold">
                {errorMessage}
              </div>
            )}

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Administrative Reason</label>
                <textarea
                  rows={2}
                  placeholder="Enter reason for audit record..."
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  className="w-full text-xs px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setStatusDialogUser(null)}
                  className="px-3.5 py-1.5 rounded-lg text-xs font-semibold text-slate-600 hover:bg-slate-100 transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleStatusConfirm}
                  className={`px-4 py-1.5 rounded-lg text-white text-xs font-semibold transition cursor-pointer ${
                    statusDialogUser.isActive
                      ? 'bg-rose-600 hover:bg-rose-700'
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {statusDialogUser.isActive ? 'Deactivate' : 'Reactivate'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

