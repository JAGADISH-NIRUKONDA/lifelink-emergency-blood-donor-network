import React, { useState } from 'react';
import {
  Search,
  Filter,
  Eye,
  CheckCircle2,
  XCircle,
  X,
  FileCode
} from 'lucide-react';

const ACTION_OPTIONS = [
  'ALL',
  'USER_STATUS_CHANGE',
  'USER_ROLE_CHANGE',
  'HOSPITAL_VERIFIED',
  'HOSPITAL_REJECTED',
  'REQUEST_STATUS_OVERRIDE',
  'SYSTEM_ANNOUNCEMENT'
];

export default function AdminAuditLogsView({
  logs = [],
  pagination = {},
  onSearch,
  onFilterAction,
  onPageChange
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAction, setSelectedAction] = useState('ALL');
  const [inspectingLog, setInspectingLog] = useState(null);

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    if (onSearch) onSearch(val);
  };

  const handleActionSelect = (act) => {
    setSelectedAction(act);
    if (onFilterAction) onFilterAction(act === 'ALL' ? '' : act);
  };

  const getActionBadge = (action) => {
    switch (action) {
      case 'USER_STATUS_CHANGE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'USER_ROLE_CHANGE':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'HOSPITAL_VERIFIED':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'HOSPITAL_REJECTED':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'REQUEST_STATUS_OVERRIDE':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'SYSTEM_ANNOUNCEMENT':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
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
              placeholder="Search audit trail by actor name, email, target identifier..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="w-full text-xs sm:text-sm pl-9 pr-4 py-2.5 rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
            />
          </div>
        </div>

        {/* Action Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1 border-t border-slate-100">
          <span className="text-xs font-semibold text-slate-400 mr-1 flex items-center gap-1">
            <Filter size={12} /> Filter Action:
          </span>
          {ACTION_OPTIONS.map((act) => (
            <button
              key={act}
              onClick={() => handleActionSelect(act)}
              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition cursor-pointer ${
                selectedAction === act
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {act}
            </button>
          ))}
        </div>
      </div>

      {/* Audit Logs Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 uppercase tracking-wider font-semibold">
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Actor</th>
                <th className="py-3 px-4">Action</th>
                <th className="py-3 px-4">Target Resource</th>
                <th className="py-3 px-4">Identifier / Notes</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-sans">
              {logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No audit records matching query.
                  </td>
                </tr>
              ) : (
                logs.map((log) => (
                  <tr key={log._id} className="hover:bg-slate-50/70 transition">
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {new Date(log.createdAt).toLocaleString()}
                    </td>

                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900">{log.actorName || 'Super Admin'}</div>
                      <div className="text-[10px] text-slate-400 font-mono">{log.actorEmail}</div>
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-600">
                        {log.actorRole}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] border ${getActionBadge(log.action)}`}>
                        {log.action}
                      </span>
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      {log.targetResource}
                    </td>

                    <td className="py-3 px-4 text-slate-600 max-w-xs truncate">
                      <span className="font-medium text-slate-900 block truncate">
                        {log.targetIdentifier || log.targetId || 'System Core'}
                      </span>
                      {log.details?.reason && (
                        <span className="text-[10px] text-slate-400 block truncate italic">
                          "{log.details.reason}"
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {log.status === 'SUCCESS' ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle2 size={12} className="text-emerald-500" />
                          <span>Success</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-700">
                          <XCircle size={12} className="text-rose-500" />
                          <span>Failed</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => setInspectingLog(log)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition cursor-pointer"
                        title="Inspect JSON Metadata"
                      >
                        <Eye size={14} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.pages > 1 && (
          <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs text-slate-600">
            <span>
              Page {pagination.page} of {pagination.pages} ({pagination.total} audit records)
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

      {/* Inspect JSON Details Modal */}
      {inspectingLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setInspectingLog(null)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <FileCode size={18} />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Audit Log Forensic Record</h3>
                <p className="text-xs text-slate-500 font-mono">ID: {inspectingLog._id}</p>
              </div>
            </div>

            <div className="space-y-2 text-xs mb-4">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Action:</span>
                <span className="font-bold text-slate-900">{inspectingLog.action}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Actor:</span>
                <span className="font-semibold text-slate-800">
                  {inspectingLog.actorName} ({inspectingLog.actorRole})
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Target:</span>
                <span className="font-semibold text-slate-800">
                  {inspectingLog.targetResource} — {inspectingLog.targetIdentifier || inspectingLog.targetId}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Timestamp:</span>
                <span className="font-mono text-slate-700">
                  {new Date(inspectingLog.createdAt).toISOString()}
                </span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="text-slate-500">Client IP & Agent:</span>
                <span className="font-mono text-[10px] text-slate-600 truncate max-w-xs">
                  {inspectingLog.ipAddress || '127.0.0.1'} | {inspectingLog.userAgent || 'Antigravity Test Agent'}
                </span>
              </div>
            </div>

            <div>
              <span className="block text-xs font-bold text-slate-700 mb-1">Payload Details:</span>
              <pre className="bg-slate-900 text-slate-100 p-3.5 rounded-xl text-[11px] overflow-x-auto font-mono max-h-56 leading-relaxed">
                {JSON.stringify(inspectingLog.details, null, 2)}
              </pre>
            </div>

            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setInspectingLog(null)}
                className="px-4 py-2 rounded-lg bg-slate-900 text-white text-xs font-semibold cursor-pointer"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

