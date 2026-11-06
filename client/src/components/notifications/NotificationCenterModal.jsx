import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Bell,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Trash2,
  Clock,
  CheckCheck,
  Search,
  ExternalLink
} from 'lucide-react';

export default function NotificationCenterModal({
  isOpen,
  onClose,
  notifications = [],
  onMarkAsRead,
  onMarkAllAsRead,
  onDeleteNotification,
  onOpenPortal
}) {
  const [activeTab, setActiveTab] = useState('ALL'); // 'ALL' | 'INVITATIONS' | 'EMERGENCIES' | 'UNREAD'
  const [searchTerm, setSearchTerm] = useState('');

  if (!isOpen) return null;

  const filtered = notifications.filter((n) => {
    // Search match
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const match =
        n.title.toLowerCase().includes(term) ||
        n.message.toLowerCase().includes(term);
      if (!match) return false;
    }

    if (activeTab === 'UNREAD') return !n.isRead;
    if (activeTab === 'INVITATIONS') return n.type === 'DONOR_INVITATION' || n.type === 'DONATION_ACCEPTED';
    if (activeTab === 'EMERGENCIES') return n.priority === 'CRITICAL' || n.type === 'EMERGENCY_REQUEST';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const formatDateTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleString([], {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 my-8 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="bg-slate-900 text-white p-6 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 border border-red-500/30 flex items-center justify-center">
                <Bell size={24} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Notification Center</span>
                  {unreadCount > 0 && (
                    <span className="text-xs bg-red-600 text-white px-2.5 py-0.5 rounded-full font-bold">
                      {unreadCount} Unread
                    </span>
                  )}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Real-time alerts, clinical dispatch requests, and donation activity
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={onMarkAllAsRead}
                  className="hidden sm:inline-flex items-center gap-1.5 text-xs bg-white/10 hover:bg-white/20 text-slate-200 px-3 py-1.5 rounded-full font-medium transition cursor-pointer"
                >
                  <CheckCheck size={14} />
                  <span>Mark All Read</span>
                </button>
              )}
              <button
                onClick={onClose}
                className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-slate-300 hover:text-white transition"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* Subheader Toolbar & Tabs */}
          <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text"
                placeholder="Search alerts by title or content..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-white rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-[#B91C35]"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              {[
                { id: 'ALL', label: `All (${notifications.length})` },
                { id: 'UNREAD', label: `Unread (${unreadCount})` },
                { id: 'INVITATIONS', label: 'Invitations' },
                { id: 'EMERGENCIES', label: '🚨 Emergencies' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3.5 py-1.5 rounded-full font-bold transition cursor-pointer ${
                    activeTab === tab.id
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'bg-white text-slate-600 hover:bg-slate-200 border border-slate-200'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Notification List */}
          <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-4">
            {filtered.length === 0 ? (
              <div className="p-12 text-center text-slate-400">
                <Bell className="w-12 h-12 mx-auto mb-3 opacity-30 text-slate-500" />
                <h4 className="text-sm font-bold text-slate-700">No Notifications Found</h4>
                <p className="text-xs text-slate-400 mt-1">
                  You are all caught up! Matching notifications and dispatch requests will appear here.
                </p>
              </div>
            ) : (
              filtered.map((item) => (
                <div
                  key={item._id}
                  className={`p-4 rounded-2xl transition mb-2 flex items-start gap-4 border ${
                    !item.isRead
                      ? 'bg-red-50/40 border-red-100 shadow-2xs'
                      : 'bg-white border-slate-100 hover:border-slate-200'
                  }`}
                >
                  <div className={`p-2.5 rounded-xl shrink-0 ${
                    item.priority === 'CRITICAL' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-700'
                  }`}>
                    {item.priority === 'CRITICAL' ? (
                      <AlertTriangle size={18} />
                    ) : item.type === 'DONOR_INVITATION' ? (
                      <Mail size={18} className="text-purple-600" />
                    ) : (
                      <CheckCircle2 size={18} className="text-emerald-600" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <h4 className={`text-sm ${!item.isRead ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'}`}>
                        {item.title}
                      </h4>
                      <span className="text-[11px] text-slate-400 shrink-0 flex items-center gap-1">
                        <Clock size={11} />
                        {formatDateTime(item.createdAt)}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {item.message}
                    </p>

                    <div className="mt-3 flex items-center gap-2">
                      {item.data?.tab && (
                        <button
                          onClick={() => {
                            if (onMarkAsRead) onMarkAsRead(item._id);
                            onClose();
                            if (onOpenPortal) onOpenPortal(item.data.tab);
                          }}
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#B91C35] hover:text-[#9E152C] bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition cursor-pointer"
                        >
                          <span>Review in Portal</span>
                          <ExternalLink size={12} />
                        </button>
                      )}

                      {!item.isRead && onMarkAsRead && (
                        <button
                          onClick={() => onMarkAsRead(item._id)}
                          className="text-xs text-slate-500 hover:text-slate-800 px-2.5 py-1 rounded-full hover:bg-slate-100 transition cursor-pointer"
                        >
                          Mark Read
                        </button>
                      )}

                      {onDeleteNotification && (
                        <button
                          onClick={() => onDeleteNotification(item._id)}
                          title="Delete notification"
                          className="text-xs text-slate-400 hover:text-rose-600 p-1 rounded hover:bg-rose-50 transition ml-auto cursor-pointer"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Powered by LifeLink Socket.IO Real-Time Dispatch</span>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 rounded-xl font-bold transition cursor-pointer"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

