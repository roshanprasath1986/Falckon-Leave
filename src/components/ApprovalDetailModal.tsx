import React, { useState } from 'react';
import { X, Check, AlertOctagon, User, Calendar, ShieldCheck, FileText, Clock, AlertTriangle } from 'lucide-react';
import { LeaveRequest } from '../types/leave';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatDateRange } from '../utils/dateUtils';

interface ApprovalDetailModalProps {
  request: LeaveRequest | null;
  onClose: () => void;
  onApprove: (id: string, note?: string) => void;
  onReject: (id: string, note?: string) => void;
  canApprove: boolean;
}

export const ApprovalDetailModal: React.FC<ApprovalDetailModalProps> = ({
  request,
  onClose,
  onApprove,
  onReject,
  canApprove,
}) => {
  if (!request) return null;

  const [decisionNote, setDecisionNote] = useState('');
  const [showRejectPrompt, setShowRejectPrompt] = useState(false);

  const handleApprove = () => {
    onApprove(request.id, decisionNote.trim() || undefined);
    onClose();
  };

  const handleReject = () => {
    onReject(request.id, decisionNote.trim() || 'Declined under executive capacity constraints.');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#111827] rounded-xl border border-[#CBD5E1] dark:border-[#334155] shadow-[0px_20px_25px_-5px_rgba(15,23,42,0.12),0px_8px_10px_-6px_rgba(15,23,42,0.08)] overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B]/60">
          <div className="flex items-center gap-3">
            <div className="text-xs font-mono font-medium text-[#64748B] dark:text-[#94A3B8]">
              {request.requestNumber}
            </div>
            <StatusBadge status={request.status} />
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-5">
          {/* Employee Info Card */}
          <div className="flex items-center gap-3.5 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155]">
            <img
              src={request.avatar}
              alt={request.employeeName}
              className="w-12 h-12 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155]"
            />
            <div className="min-w-0 flex-1">
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                {request.employeeName}
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {request.employeeRole}
              </p>
              <div className="flex items-center gap-2 mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                <span>{request.department}</span>
                <span>·</span>
                <span>Priority: {request.urgency}</span>
              </div>
            </div>
          </div>

          {/* Absence Timeline & Days */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827]">
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider mb-1">
                Requested Schedule
              </div>
              <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                {formatDateRange(request.startDate, request.endDate)}
              </div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                {request.leaveType}
              </div>
            </div>

            <div className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827]">
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider mb-1">
                Working Days Impact
              </div>
              <div className="text-sm font-semibold text-[#0D9488] dark:text-[#2DD4BF] tabular-nums">
                {request.workingDays.toFixed(1)} Working Days
              </div>
              <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-0.5">
                Excludes weekends & holidays
              </div>
            </div>
          </div>

          {/* Operational Delegate Briefing */}
          <div className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827]">
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider mb-2">
              Assigned Coverage Delegate
            </div>
            <div className="flex items-center gap-3">
              <img
                src={request.coverageDelegate.avatar}
                alt={request.coverageDelegate.name}
                className="w-8 h-8 rounded-full object-cover"
              />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  {request.coverageDelegate.name}
                </div>
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  {request.coverageDelegate.role}
                </div>
              </div>
              <span className="text-[11px] font-medium text-[#065F46] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-2 py-0.5 rounded-full">
                {request.coverageDelegate.status}
              </span>
            </div>
          </div>

          {/* Reason & Notes */}
          <div className="space-y-1.5">
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium uppercase tracking-wider">
              Executive Briefing / Reason
            </div>
            <p className="text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/30 border border-[#E2E8F0] dark:border-[#334155] leading-relaxed">
              {request.reason}
            </p>
          </div>

          {/* Conflict Warnings if applicable */}
          {request.conflictWarning && (
            <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-800 dark:text-amber-300 flex items-start gap-2.5">
              <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Coverage Conflict Alert</strong>
                <span>{request.conflictWarning}</span>
              </div>
            </div>
          )}

          {/* Decision note input when approving or rejecting */}
          {canApprove && request.status === 'Pending' && (
            <div>
              <label className="block text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1">
                Approver Notes (Optional for Payroll & Ledger)
              </label>
              <input
                type="text"
                value={decisionNote}
                onChange={(e) => setDecisionNote(e.target.value)}
                placeholder="e.g. Approved. Delegate confirmed for operational continuity."
                className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488]"
              />
            </div>
          )}

          {/* Submission and Review Audit Footer */}
          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex flex-wrap items-center justify-between gap-2">
            <span>Submitted: {formatDate(request.submittedAt.split('T')[0])}</span>
            {request.payrollSyncId && (
              <span className="font-mono text-[10px]">Ref: {request.payrollSyncId}</span>
            )}
            {request.reviewedBy && (
              <span>Reviewed by {request.reviewedBy}</span>
            )}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#0F172A] dark:text-[#EAF1FF] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>

          {canApprove && request.status === 'Pending' && (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleReject}
                className="h-9 px-3.5 text-xs font-medium text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900 rounded-lg transition-colors flex items-center gap-1.5"
              >
                <AlertOctagon className="w-3.5 h-3.5" />
                <span>Reject</span>
              </button>
              <button
                type="button"
                onClick={handleApprove}
                className="h-9 px-4 text-xs font-medium text-white bg-[#0D9488] hover:bg-[#0F766E] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Check className="w-4 h-4" />
                <span>Approve Request</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
