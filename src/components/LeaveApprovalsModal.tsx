import React, { useState } from 'react';
import {
  X,
  CheckCircle2,
  XCircle,
  Clock,
  User,
  Calendar,
  AlertCircle,
  ShieldCheck,
  Check,
  MessageSquare,
  Building,
  Zap,
  Users
} from 'lucide-react';
import { LeaveRequest, Employee } from '../types/portal';

interface LeaveApprovalsModalProps {
  isOpen: boolean;
  onClose: () => void;
  leaveRequests: LeaveRequest[];
  employees: Employee[];
  reviewerName: string;
  reviewerRole: 'HR_ADMIN' | 'SUPERVISOR';
  supervisorEmployeeId?: string;
  onApproveLeave: (
    request: LeaveRequest,
    reviewerName: string,
    reviewerRole: 'HR_ADMIN' | 'SUPERVISOR',
    notes?: string
  ) => void;
  onRejectLeave: (
    request: LeaveRequest,
    reviewerName: string,
    reviewerRole: 'HR_ADMIN' | 'SUPERVISOR',
    notes?: string
  ) => void;
}

export const LeaveApprovalsModal: React.FC<LeaveApprovalsModalProps> = ({
  isOpen,
  onClose,
  leaveRequests,
  employees,
  reviewerName,
  reviewerRole,
  supervisorEmployeeId,
  onApproveLeave,
  onRejectLeave,
}) => {
  const [activeTab, setActiveTab] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');
  const [reviewNotesMap, setReviewNotesMap] = useState<Record<string, string>>({});
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter requests based on role:
  // HR Admin can see ALL requests.
  // Supervisor only sees requests where they are listed as supervisor.
  const authorizedRequests = leaveRequests.filter((req) => {
    if (reviewerRole === 'HR_ADMIN') return true;
    if (supervisorEmployeeId) {
      const supEmp = employees.find((e) => e.id === supervisorEmployeeId);
      if (!supEmp) return false;
      return req.supervisors.some(
        (s) =>
          s.toLowerCase() === supEmp.name.toLowerCase() ||
          s.toLowerCase() === supEmp.id.toLowerCase()
      );
    }
    return req.supervisors.some(
      (s) => s.toLowerCase() === reviewerName.toLowerCase()
    );
  });

  const tabRequests = authorizedRequests.filter((r) => r.status === activeTab);
  const pendingCount = authorizedRequests.filter((r) => r.status === 'PENDING').length;

  const handleApprove = (req: LeaveRequest) => {
    const notes = reviewNotesMap[req.id] || '';
    onApproveLeave(req, reviewerName, reviewerRole, notes);
  };

  const handleReject = (req: LeaveRequest) => {
    const notes = reviewNotesMap[req.id] || '';
    onRejectLeave(req, reviewerName, reviewerRole, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-3xl bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                  Leave Authorization & Approval Desk
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8]">
                  {reviewerRole === 'HR_ADMIN' ? 'Universal HR Authority' : 'Supervisor Authority'}
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {reviewerRole === 'HR_ADMIN'
                  ? 'Review, approve, or reject leave requests across the company. Approving automatically debits statutory balances.'
                  : `Review and approve leave applications submitted by your direct reporting staff.`}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="px-6 py-3 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0A0D14] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 p-1 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B]">
            <button
              type="button"
              onClick={() => setActiveTab('PENDING')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'PENDING'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              <span>Pending Approvals</span>
              {pendingCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('APPROVED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'APPROVED'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Approved History</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('REJECTED')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                activeTab === 'REJECTED'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <XCircle className="w-3.5 h-3.5 text-rose-500" />
              <span>Rejected</span>
            </button>
          </div>

          <div className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {tabRequests.length} record(s) in this view
          </div>
        </div>

        {/* Requests List */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {tabRequests.length === 0 ? (
            <div className="p-12 text-center text-xs text-[#64748B] dark:text-[#94A3B8] space-y-2 border-2 border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-2xl">
              <Clock className="w-8 h-8 mx-auto text-[#94A3B8] opacity-40" />
              <div className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                No {activeTab.toLowerCase()} leave requests found
              </div>
              <p className="text-[11px] max-w-sm mx-auto">
                {activeTab === 'PENDING'
                  ? 'All statutory leave applications have been reviewed. When an employee applies for leave, their request will appear here for authorization.'
                  : `No records in the ${activeTab.toLowerCase()} ledger.`}
              </p>
            </div>
          ) : (
            tabRequests.map((req) => {
              const emp = employees.find((e) => e.id === req.employeeId);
              const isPending = req.status === 'PENDING';
              const isApproved = req.status === 'APPROVED';
              const isRejected = req.status === 'REJECTED';

              return (
                <div
                  key={req.id}
                  className={`p-4 rounded-2xl border transition-all ${
                    isPending
                      ? 'bg-white dark:bg-[#0A0D14] border-amber-200 dark:border-amber-900/60 shadow-xs'
                      : isApproved
                      ? 'bg-white dark:bg-[#0A0D14] border-emerald-200 dark:border-emerald-900/50'
                      : 'bg-white dark:bg-[#0A0D14] border-rose-200 dark:border-rose-900/50'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 pb-3 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                          {req.employeeName}
                        </span>
                        <span className="font-mono text-xs px-2 py-0.5 rounded-md bg-[#F1F5F9] dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8]">
                          {req.employeeId}
                        </span>
                        <span className="text-xs text-[#0284C7] dark:text-[#38BDF8] font-medium">
                          {req.department}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-[#0284C7]" />
                          <strong className="text-[#0F172A] dark:text-[#F8FAFC]">Date:</strong> {req.date}
                        </span>
                        <span className="flex items-center gap-1 font-semibold text-[#0284C7] dark:text-[#38BDF8]">
                          Duration: {req.days} day{req.days > 1 ? 's' : ''} (Month {req.month})
                        </span>
                        <span>
                          Applied: {req.submittedAt}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="shrink-0">
                      {isPending && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                          <Clock className="w-3 h-3" />
                          <span>Awaiting Approval</span>
                        </span>
                      )}
                      {isApproved && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>Approved & Allocated</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
                          <XCircle className="w-3 h-3" />
                          <span>Rejected</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Body: Reason, Hierarchy, and Notes */}
                  <div className="py-3 text-xs space-y-2">
                    <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A]/70 border border-[#E2E8F0] dark:border-[#1E293B]">
                      <span className="font-semibold text-[#64748B] dark:text-[#94A3B8] block text-[10px] uppercase tracking-wider mb-0.5">
                        Reason for Leave:
                      </span>
                      <p className="text-[#0F172A] dark:text-[#F8FAFC] italic">
                        "{req.reason}"
                      </p>
                    </div>

                    <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] px-1">
                      <span>
                        <strong>Designated Supervisors:</strong>{' '}
                        {req.supervisors.length > 0 ? req.supervisors.join(', ') : 'None (Direct to Board)'}
                      </span>
                      {isPending && (
                        <span className="text-[#0284C7] dark:text-[#38BDF8] flex items-center gap-1">
                          <Zap className="w-3 h-3" />
                          <span>Auto-deducts Casual first, then Annual once approved</span>
                        </span>
                      )}
                    </div>

                    {/* Reviewer notes if already reviewed */}
                    {req.reviewedBy && (
                      <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] text-xs text-[#475569] dark:text-[#94A3B8]">
                        <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          Reviewed by {req.reviewedBy} ({req.reviewerRole === 'HR_ADMIN' ? 'HR Admin' : 'Supervisor'}) on {req.reviewedAt}:
                        </span>{' '}
                        {req.reviewNotes || 'Approved without additional notes.'}
                      </div>
                    )}
                  </div>

                  {/* Actions Bar for Pending requests */}
                  {isPending && (
                    <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          value={reviewNotesMap[req.id] || ''}
                          onChange={(e) =>
                            setReviewNotesMap({
                              ...reviewNotesMap,
                              [req.id]: e.target.value,
                            })
                          }
                          placeholder="Optional reviewer notes / remarks..."
                          className="w-full h-8 px-3 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                        />
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleReject(req)}
                          className="h-8 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors flex items-center gap-1"
                        >
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Reject</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleApprove(req)}
                          className="h-8 px-4 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Approve & Allocate Leave</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
