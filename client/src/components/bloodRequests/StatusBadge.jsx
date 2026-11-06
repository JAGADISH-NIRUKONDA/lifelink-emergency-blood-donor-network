import React from 'react';
import {
  Clock,
  CheckCircle2,
  Users,
  CheckCheck,
  XCircle,
  Ban,
  AlertTriangle,
  Flame,
  Minus
} from 'lucide-react';

export function StatusBadge({ status }) {
  switch (status) {
    case 'PENDING':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
          <Clock size={12} className="animate-spin text-amber-600" />
          Pending Review
        </span>
      );
    case 'APPROVED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-sky-50 text-sky-800 border border-sky-200">
          <CheckCircle2 size={12} className="text-sky-600" />
          Approved
        </span>
      );
    case 'MATCHED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-50 text-purple-800 border border-purple-200">
          <Users size={12} className="text-purple-600" />
          Donors Matched
        </span>
      );
    case 'FULFILLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
          <CheckCheck size={12} className="text-emerald-600" />
          Fulfilled
        </span>
      );
    case 'REJECTED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-800 border border-rose-200">
          <XCircle size={12} className="text-rose-600" />
          Rejected
        </span>
      );
    case 'CANCELLED':
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200">
          <Ban size={12} className="text-slate-500" />
          Cancelled
        </span>
      );
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
          {status}
        </span>
      );
  }
}

export function PriorityBadge({ priority }) {
  switch (priority) {
    case 'CRITICAL':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-black uppercase tracking-wider bg-red-100 text-red-800 border border-red-300 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-red-600 animate-ping" />
          <Flame size={12} className="text-red-600" />
          Critical
        </span>
      );
    case 'HIGH':
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 border border-amber-300">
          <AlertTriangle size={12} className="text-amber-600" />
          High
        </span>
      );
    case 'NORMAL':
    default:
      return (
        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md text-[11px] font-medium uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
          <Minus size={12} className="text-slate-400" />
          Normal
        </span>
      );
  }
}

