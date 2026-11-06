import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Bell,
  Check,
  CheckCheck,
  AlertTriangle,
  Mail,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  Trash2
} from 'lucide-react';

const INITIAL_DEMO_NOTIFICATIONS = [
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

function formatTime(isoString) {
  const diffMs = Date.now() - new Date(isoString).getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  if (diffMins < 60) return `${diffMins}m ago`;
  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${Math.floor(diffHours / 24)}d ago`;
}

export default function NotificationBell({ onOpenPortal, onOpenNotificationCenter }) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState(INITIAL_DEMO_NOTIFICATIONS);
  const [filter, setFilter] = useState('ALL'); // 'ALL' | 'UNREAD'
  const dropdownRef = useRef(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const handleMarkAsRead = (id, e) => {
    e?.stopPropagation();
    setNotifications((prev) =>
      prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
  };

  const handleDelete = (id, e) => {
    e?.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n._id !== id));
  };

  const handleNotificationClick = (notif) => {
    handleMarkAsRead(notif._id);
    setIsOpen(false);
    if (onOpenPortal && notif.data?.tab) {
      onOpenPortal(notif.data.tab);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (filter === 'UNREAD') return !n.isRead;
    return true;
  });

  const getIcon = (type, priority) => {
    if (priority === 'CRITICAL' || type === 'EMERGENCY_REQUEST') {
      return <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />;
    }
    if (type === 'DONOR_INVITATION') {
      return <Mail className="w-4 h-4 text-purple-600 shrink-0" />;
    }
    if (type === 'DONATION_ACCEPTED' || type === 'REQUEST_APPROVED') {
      return <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />;
    }
    if (type === 'DONATION_REJECTED' || type === 'REQUEST_REJECTED') {
      return <XCircle className="w-4 h-4 text-slate-500 shrink-0" />;
    }
    return <Bell className="w-4 h-4 text-blue-600 shrink-0" />;
  };



  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications"
        className="relative p-2.5 rounded-full text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#B91C35] cursor-pointer"
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 flex h-4 min-w-4 px-1 items-center justify-center rounded-full bg-[#B91C35] text-[10px] font-bold text-white shadow-xs animate-pulse">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ duration: 0.2 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-100 overflow-hidden z-50"
          >
            {/* Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell size={18} className="text-red-400" />
                <h4 className="font-bold text-sm">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="bg-red-500/30 text-red-200 text-xs px-2 py-0.5 rounded-full font-bold">
                    {unreadCount} new
                  </span>
                )}
              </div>
              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllAsRead}
                  className="text-xs text-slate-300 hover:text-white flex items-center gap-1 font-medium transition cursor-pointer"
                >
                  <CheckCheck size={14} />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* Filter Pills */}
            <div className="px-4 py-2 bg-slate-50 border-b border-slate-100 flex items-center gap-2 text-xs">
              <button
                onClick={() => setFilter('ALL')}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  filter === 'ALL'
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('UNREAD')}
                className={`px-3 py-1 rounded-full font-medium transition cursor-pointer ${
                  filter === 'UNREAD'
                    ? 'bg-[#B91C35] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification Items List */}
            <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
              {filteredNotifications.length === 0 ? (
                <div className="p-8 text-center text-slate-400">
                  <Bell className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-xs font-medium">No notifications in this view</p>
                </div>
              ) : (
                filteredNotifications.map((n) => (
                  <div
                    key={n._id}
                    onClick={() => handleNotificationClick(n)}
                    className={`p-3.5 flex items-start gap-3 hover:bg-slate-50 transition cursor-pointer relative group ${
                      !n.isRead ? 'bg-red-50/40' : 'bg-white'
                    }`}
                  >
                    <div className="mt-0.5 p-2 rounded-xl bg-slate-100/80">
                      {getIcon(n.type, n.priority)}
                    </div>

                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-1">
                        <p className={`text-xs truncate ${!n.isRead ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                          {n.title}
                        </p>
                      </div>
                      <p className="text-xs text-slate-500 line-clamp-2 mt-0.5 leading-relaxed">
                        {n.message}
                      </p>
                      <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                        <Clock size={11} />
                        <span>{formatTime(n.createdAt)}</span>
                        {n.priority === 'CRITICAL' && (
                          <span className="text-rose-600 font-bold bg-rose-50 px-1.5 py-0.2 rounded">CRITICAL</span>
                        )}
                      </div>
                    </div>

                    {/* Actions on hover */}
                    <div className="absolute right-2 top-3 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
                      {!n.isRead && (
                        <button
                          onClick={(e) => handleMarkAsRead(n._id, e)}
                          title="Mark as read"
                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200"
                        >
                          <Check size={14} />
                        </button>
                      )}
                      <button
                        onClick={(e) => handleDelete(n._id, e)}
                        title="Delete"
                        className="p-1 rounded text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#B91C35] shrink-0 mt-1.5 group-hover:opacity-0 transition" />
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Footer View Center Trigger */}
            <div className="p-3 bg-slate-50 border-t border-slate-100 text-center">
              <button
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenNotificationCenter) onOpenNotificationCenter();
                  else if (onOpenPortal) onOpenPortal('invitations');
                }}
                className="text-xs font-bold text-[#B91C35] hover:text-[#9E152C] flex items-center justify-center gap-1 mx-auto transition cursor-pointer"
              >
                <span>Open Donor Invitations & Center</span>
                <ExternalLink size={13} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

