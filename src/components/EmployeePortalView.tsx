import React, { useState } from 'react';
import {
  Calendar,
  KeyRound,
  Mail,
  Zap,
  Clock,
  Plus,
  CheckCircle2,
  AlertTriangle,
  User,
  LogOut,
  Download,
  ShieldCheck,
  ArrowRight,
  Users,
  ChevronDown,
  ChevronUp,
  XCircle,
  Check,
  Send,
  MessageSquare
} from 'lucide-react';
import { Employee, EmployeeLeaveEntry, LeaveRequest, getEmployeeSupervisors } from '../types/portal';
import { calculateEmployeeBalances, MONTH_NAMES, MONTH_SHORT_NAMES } from '../utils/leaveCalculations';

interface EmployeePortalViewProps {
  employee: Employee;
  allEmployees?: Employee[];
  leaveRequests?: LeaveRequest[];
  onApplyLeaveRequest: (request: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>) => void;
  onApproveLeave?: (
    request: LeaveRequest,
    reviewerName: string,
    reviewerRole: 'HR_ADMIN' | 'SUPERVISOR',
    notes?: string
  ) => void;
  onRejectLeave?: (
    request: LeaveRequest,
    reviewerName: string,
    reviewerRole: 'HR_ADMIN' | 'SUPERVISOR',
    notes?: string
  ) => void;
  onUpdateMonthlyLeaves: (
    employeeId: string,
    updatedMonthlyLeaves: Record<number, number>,
    updatedEntries: EmployeeLeaveEntry[]
  ) => void;
  onOpenChangePassword: () => void;
  onOpenContactHR: () => void;
  onOpenEmailNotifications?: () => void;
  onSignOut: () => void;
  onSwitchToAdmin?: () => void;
  onSelectEmployeeBreakdown?: (emp: Employee) => void;
  onOpenExport?: (emp: Employee) => void;
}

export const EmployeePortalView: React.FC<EmployeePortalViewProps> = ({
  employee,
  allEmployees = [],
  leaveRequests = [],
  onApplyLeaveRequest,
  onApproveLeave,
  onRejectLeave,
  onUpdateMonthlyLeaves,
  onOpenChangePassword,
  onOpenContactHR,
  onOpenEmailNotifications,
  onSignOut,
  onSwitchToAdmin,
  onSelectEmployeeBreakdown,
  onOpenExport,
}) => {
  // Quick dated leave filing form state
  const [showApplyForm, setShowApplyForm] = useState(false);
  const [applyDate, setApplyDate] = useState(new Date().toISOString().split('T')[0]);
  const [applyEndDate, setApplyEndDate] = useState('');
  const [applyDays, setApplyDays] = useState(1);
  const [applyReason, setApplyReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionFeedback, setSubmissionFeedback] = useState<string | null>(null);

  // Review notes state for supervisor approvals
  const [supervisorNotesMap, setSupervisorNotesMap] = useState<Record<string, string>>({});

  const calc = calculateEmployeeBalances(
    employee.annualEntitled,
    employee.casualEntitled,
    employee.monthlyLeaves
  );

  const sups = getEmployeeSupervisors(employee);

  // Filter requests submitted by this employee
  const myRequests = leaveRequests.filter((r) => r.employeeId === employee.id);

  // Filter pending requests for this employee as a supervisor
  const pendingForMeAsSupervisor = leaveRequests.filter((r) => {
    if (r.status !== 'PENDING') return false;
    return r.supervisors.some(
      (s) =>
        s.toLowerCase() === employee.name.toLowerCase() ||
        s.toLowerCase() === employee.id.toLowerCase()
    );
  });

  const handleApplySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!applyDate || applyDays <= 0) return;

    setIsSubmitting(true);
    const monthNum = parseInt(applyDate.split('-')[1], 10);

    onApplyLeaveRequest({
      employeeId: employee.id,
      employeeName: employee.name,
      employeeEmail: employee.email,
      department: employee.department,
      date: applyDate,
      endDate: applyEndDate || undefined,
      month: monthNum,
      days: applyDays,
      reason: applyReason.trim() || 'Personal absence',
      supervisors: sups,
    });

    setIsSubmitting(false);
    setSubmissionFeedback(
      `Leave application for ${applyDays} day(s) submitted! Email notifications have been dispatched to ${
        sups.length > 0 ? sups.join(' & ') : 'HR Operations'
      } and HR Admin. Entitlements will be allocated once approved.`
    );
    setApplyReason('');
    setApplyEndDate('');
    setShowApplyForm(false);
  };

  return (
    <div className="space-y-6">
      {/* Welcome Employee Banner */}
      <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#6EE7B7]">
              Employee Self-Service Portal
            </span>
            <span className="text-xs font-mono text-[#64748B] dark:text-[#94A3B8]">
              {employee.id}
            </span>
            {employee.hasAdminRights && (
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                <ShieldCheck className="w-3 h-3 text-amber-600" />
                Admin Privileges Granted
              </span>
            )}
          </div>
          <h2 className="text-xl font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
            Welcome, {employee.name}
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-0.5">
            {sups.length > 0 ? (
              <>
                {sups.length > 1 ? 'Supervisors: ' : 'Supervisor: '}
                <strong className="text-[#0F172A] dark:text-[#F8FAFC]">{sups.join(', ')}</strong> · Department:{' '}
                <span className="text-[#0284C7] dark:text-[#38BDF8] font-medium">{employee.department}</span>
              </>
            ) : (
              <>Hierarchy: <strong className="text-[#0F172A] dark:text-[#F8FAFC]">None (Direct to Board)</strong> · Department: <span className="text-[#0284C7] dark:text-[#38BDF8] font-medium">{employee.department}</span></>
            )}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Email Notifications Center */}
          {onOpenEmailNotifications && (
            <button
              onClick={onOpenEmailNotifications}
              className="h-9 px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              title="View sent & received simulated email notifications"
            >
              <Mail className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
              <span>Email Logs</span>
            </button>
          )}

          {/* If employee has admin rights, allow switching to Admin Command */}
          {employee.hasAdminRights && onSwitchToAdmin && (
            <button
              onClick={onSwitchToAdmin}
              className="h-9 px-3 bg-[#0F172A] hover:bg-[#1E293B] text-white dark:bg-[#F8FAFC] dark:text-[#0F172A] text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
              <span>Switch to Admin Mode</span>
            </button>
          )}

          <button
            onClick={() => setShowApplyForm(!showApplyForm)}
            className="h-9 px-3.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>{showApplyForm ? 'Cancel Request' : 'Apply for Leave'}</span>
          </button>

          <button
            onClick={onOpenChangePassword}
            className="h-9 px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-xl flex items-center gap-1.5 transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
            <span>Change Password</span>
          </button>
        </div>
      </div>

      {/* Submission Feedback Banner */}
      {submissionFeedback && (
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-xs text-emerald-800 dark:text-emerald-300 flex items-start justify-between gap-3 animate-in fade-in">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold">Leave Application Dispatched</div>
              <p className="mt-0.5 leading-relaxed">{submissionFeedback}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setSubmissionFeedback(null)}
            className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-800"
          >
            <XCircle className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Leave Application Form */}
      {showApplyForm && (
        <form
          onSubmit={handleApplySubmit}
          className="bg-white dark:bg-[#0A0D14] rounded-2xl border-2 border-[#0284C7] p-5 shadow-xl space-y-4 animate-in fade-in duration-150"
        >
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                Submit Formal Statutory Leave Application
              </h3>
            </div>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Automated Email Notification to Supervisor & HR
            </span>
          </div>

          <div className="p-3 rounded-xl bg-[#F0F9FF] dark:bg-[#0C4A6E]/30 border border-[#BAE6FD] dark:border-[#0284C7]/40 text-xs text-[#0369A1] dark:text-[#7DD3FC] flex items-start gap-2">
            <Send className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Two-Step Approval Sequence:</strong> Submitting will instantly dispatch an email notification to your designated Supervisor(s) ({sups.length > 0 ? sups.join(', ') : 'Direct to Board'}) and HR Operations.
              Your statutory leave balance will <strong>only be debited once approved</strong> by your supervisor or HR administrator.
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Start Date *
              </label>
              <input
                type="date"
                required
                value={applyDate}
                onChange={(e) => setApplyDate(e.target.value)}
                className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                End Date (Optional)
              </label>
              <input
                type="date"
                value={applyEndDate}
                min={applyDate}
                onChange={(e) => setApplyEndDate(e.target.value)}
                className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Total Days Required *
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                max="30"
                required
                value={applyDays}
                onChange={(e) => setApplyDays(parseFloat(e.target.value) || 1)}
                className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
              Reason / Justification *
            </label>
            <input
              type="text"
              required
              value={applyReason}
              onChange={(e) => setApplyReason(e.target.value)}
              placeholder="e.g. Family commitment, medical rest, personal travel..."
              className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
            />
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <button
              type="button"
              onClick={() => setShowApplyForm(false)}
              className="h-8 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="h-8 px-5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Submit & Dispatch Email Notification</span>
            </button>
          </div>
        </form>
      )}

      {/* SUPERVISOR PENDING APPROVALS DESK (Visible if this employee is a designated supervisor) */}
      {pendingForMeAsSupervisor.length > 0 && onApproveLeave && onRejectLeave && (
        <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border-2 border-amber-300 dark:border-amber-700/60 p-5 shadow-md space-y-4">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 flex items-center justify-center font-bold">
                {pendingForMeAsSupervisor.length}
              </div>
              <div>
                <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                  Pending Leave Approvals for Your Direct Reports
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  You have been designated as supervisor for these requests. Approving will officially deduct the leave days.
                </p>
              </div>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-bold text-amber-800 dark:text-amber-300 bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 rounded-full">
              Action Required
            </span>
          </div>

          <div className="space-y-3">
            {pendingForMeAsSupervisor.map((req) => (
              <div
                key={req.id}
                className="p-3.5 rounded-xl border border-amber-200 dark:border-amber-900/50 bg-[#FFFDF5] dark:bg-[#1E293B]/40 space-y-2.5"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="font-bold text-xs text-[#0F172A] dark:text-[#F8FAFC]">
                      {req.employeeName} ({req.employeeId})
                    </span>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] ml-2">
                      · {req.department}
                    </span>
                    <div className="text-xs text-[#0284C7] dark:text-[#38BDF8] font-semibold mt-0.5">
                      Requested: {req.days} day(s) on {req.date} (Reason: "{req.reason}")
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        onRejectLeave(
                          req,
                          employee.name,
                          'SUPERVISOR',
                          supervisorNotesMap[req.id]
                        )
                      }
                      className="h-7 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3 h-3" />
                      <span>Reject</span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onApproveLeave(
                          req,
                          employee.name,
                          'SUPERVISOR',
                          supervisorNotesMap[req.id]
                        )
                      }
                      className="h-7 px-3.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                    >
                      <Check className="w-3 h-3" />
                      <span>Approve & Allocate</span>
                    </button>
                  </div>
                </div>

                <input
                  type="text"
                  value={supervisorNotesMap[req.id] || ''}
                  onChange={(e) =>
                    setSupervisorNotesMap({
                      ...supervisorNotesMap,
                      [req.id]: e.target.value,
                    })
                  }
                  placeholder="Optional remarks to include in approval email..."
                  className="w-full h-7 px-2.5 text-xs rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Deduction Sequence Banner */}
      <div className="bg-[#EFF4FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-[#1E3A8A] rounded-2xl p-4 flex items-start gap-3">
        <Zap className="w-4 h-4 text-[#2563EB] shrink-0 mt-0.5" />
        <div className="text-xs text-[#1E40AF] dark:text-[#93C5FD]">
          <strong>Statutory Deduction Hierarchy:</strong> Casual leaves are consumed first.
          Once your casual pool reaches 0, additional days taken are deducted from your Annual leave balance automatically.
          Leave applications are only deducted upon supervisor or HR authorization.
        </div>
      </div>

      {/* My Submitted Leave Requests Tracking */}
      {myRequests.length > 0 && (
        <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] p-5 shadow-xs space-y-3">
          <div className="flex items-center justify-between border-b border-[#E2E8F0] dark:border-[#1E293B] pb-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
              <span>My Leave Applications & Approval Track ({myRequests.length})</span>
            </h3>
            <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Automated ledger debit on approval
            </span>
          </div>

          <div className="space-y-2">
            {myRequests.map((req) => (
              <div
                key={req.id}
                className="p-3 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#111827] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
              >
                <div className="space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      {req.date} {req.endDate ? `to ${req.endDate}` : ''}
                    </span>
                    <span className="font-semibold text-[#0284C7] dark:text-[#38BDF8]">
                      ({req.days} day{req.days > 1 ? 's' : ''})
                    </span>
                    <span className="text-[#64748B] dark:text-[#94A3B8]">
                      "{req.reason}"
                    </span>
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Submitted on {req.submittedAt} · Supervisors notified:{' '}
                    {req.supervisors.length > 0 ? req.supervisors.join(', ') : 'HR Operations'}
                  </div>
                  {req.reviewedBy && (
                    <div className="text-[11px] font-medium text-[#1E40AF] dark:text-[#93C5FD]">
                      Reviewed by {req.reviewedBy} on {req.reviewedAt}:{' '}
                      {req.reviewNotes || 'Approved'}
                    </div>
                  )}
                </div>

                <div className="shrink-0">
                  {req.status === 'PENDING' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950/60 dark:text-amber-300">
                      <Clock className="w-3 h-3" />
                      <span>Pending Approval</span>
                    </span>
                  )}
                  {req.status === 'APPROVED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-100 text-emerald-900 dark:bg-emerald-950/60 dark:text-emerald-300">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Approved & Allocated</span>
                    </span>
                  )}
                  {req.status === 'REJECTED' && (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-100 text-rose-900 dark:bg-rose-950/60 dark:text-rose-300">
                      <XCircle className="w-3 h-3" />
                      <span>Not Approved</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Cards: Live Allocated Entitlements */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white dark:bg-[#0A0D14] rounded-2xl p-4 border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
            Total Entitlement
          </span>
          <div className="text-2xl font-bold font-heading text-[#0F172A] dark:text-[#F8FAFC]">
            {employee.annualEntitled + employee.casualEntitled}
            <span className="text-xs font-normal text-[#64748B] ml-1">days</span>
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            {employee.casualEntitled} Casual + {employee.annualEntitled} Annual
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0D14] rounded-2xl p-4 border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
            Approved Leaves Taken
          </span>
          <div className="text-2xl font-bold font-heading text-[#0F172A] dark:text-[#F8FAFC]">
            {calc.totalTaken.toFixed(1)}
            <span className="text-xs font-normal text-[#64748B] ml-1">days</span>
          </div>
          <div className="text-[11px] text-[#0284C7] dark:text-[#38BDF8] mt-1">
            {calc.totalCasualTaken} Casual · {calc.totalAnnualTaken} Annual
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0D14] rounded-2xl p-4 border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
            Casual Remaining
          </span>
          <div className="text-2xl font-bold font-heading text-[#0284C7] dark:text-[#38BDF8]">
            {calc.casualRemaining.toFixed(1)}
            <span className="text-xs font-normal text-[#64748B] ml-1">left</span>
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            of {employee.casualEntitled} entitled days
          </div>
        </div>

        <div className="bg-white dark:bg-[#0A0D14] rounded-2xl p-4 border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
            Annual Remaining
          </span>
          <div className="text-2xl font-bold font-heading text-[#1E40AF] dark:text-[#93C5FD]">
            {calc.annualRemaining.toFixed(1)}
            <span className="text-xs font-normal text-[#64748B] ml-1">left</span>
          </div>
          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
            of {employee.annualEntitled} entitled days
          </div>
        </div>
      </div>

      {/* 12-Month Ledger Table */}
      <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#0F172A] dark:text-[#F8FAFC] font-heading">
              12-Month Statutory Entitlement & Consumption Ledger
            </h3>
          </div>
          {onOpenExport && (
            <button
              onClick={() => onOpenExport(employee)}
              className="h-8 px-2.5 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1"
            >
              <Download className="w-3.5 h-3.5 text-[#0284C7]" />
              <span>Export CSV</span>
            </button>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
              <tr>
                <th className="py-2.5 px-4">Month</th>
                <th className="py-2.5 px-4 text-center">Approved Days Taken</th>
                <th className="py-2.5 px-4">Deduction Type</th>
                <th className="py-2.5 px-4">Cumulative Taken</th>
                <th className="py-2.5 px-4 text-right">Total Remaining</th>
                <th className="py-2.5 px-4">Remaining Balance Split</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
              {calc.monthlyBreakdown.map((row) => (
                <tr
                  key={row.month}
                  className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors"
                >
                  <td className="py-2.5 px-4 font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    {row.monthName}
                  </td>
                  <td className="py-2.5 px-4 text-center tabular-nums font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    {row.totalTaken > 0 ? `${row.totalTaken.toFixed(1)}d` : '—'}
                  </td>
                  <td className="py-2.5 px-4">
                    {row.leaveType === 'Casual Leave' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#0284C7] bg-[#E0F2FE] dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8] px-2 py-0.5 rounded-full">
                        Casual Leave
                      </span>
                    )}
                    {row.leaveType === 'Annual Leave' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#1E40AF] bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 dark:text-[#93C5FD] px-2 py-0.5 rounded-full">
                        Annual Leave
                      </span>
                    )}
                    {row.leaveType === 'Casual + Annual' && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full">
                        <Zap className="w-2.5 h-2.5" />
                        Casual + Annual
                      </span>
                    )}
                    {row.leaveType.includes('Unpaid') && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-800 bg-rose-100 dark:bg-rose-950/60 dark:text-rose-300 px-2 py-0.5 rounded-full">
                        {row.leaveType}
                      </span>
                    )}
                    {row.leaveType === 'None' && (
                      <span className="text-[11px] text-[#94A3B8]">—</span>
                    )}
                  </td>
                  <td className="py-2.5 px-4 tabular-nums font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    {row.cumulativeTaken.toFixed(1)} days
                  </td>
                  <td className="py-2.5 px-4 text-right tabular-nums">
                    <span className="text-sm font-bold text-[#0284C7] dark:text-[#38BDF8]">
                      {row.totalRemainingAfter.toFixed(1)} days
                    </span>
                  </td>
                  <td className="py-2.5 px-4 text-[#64748B] dark:text-[#94A3B8] text-[11px] tabular-nums">
                    <span>{row.casualRemainingAfter.toFixed(1)} Casual</span>
                    <span className="mx-1">·</span>
                    <span>{row.annualRemainingAfter.toFixed(1)} Annual</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Direct Reports Section for Supervisors */}
      {(() => {
        const directReports = allEmployees.filter((e) => {
          if (e.id === employee.id) return false;
          const supervisors = getEmployeeSupervisors(e);
          return supervisors.some(
            (s) =>
              s.toLowerCase() === employee.name.toLowerCase() ||
              s.toLowerCase() === employee.id.toLowerCase()
          );
        });

        if (directReports.length === 0) return null;

        return (
          <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] p-5 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#E2E8F0] dark:border-[#1E293B] pb-3">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
                  <span>My Direct Reports & Supervised Team ({directReports.length})</span>
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  As supervisor, you have access to review monthwise leave records, leaves taken, and remaining balances for your team.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-[#0284C7] bg-[#E0F2FE]/50 dark:bg-[#1E3A8A]/40 px-2.5 py-1 rounded-full self-start sm:self-auto">
                Supervisor Access Active
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  <tr>
                    <th className="py-2.5 px-3">Direct Report</th>
                    <th className="py-2.5 px-3">Department</th>
                    <th className="py-2.5 px-3 text-center">Total Taken (YTD)</th>
                    <th className="py-2.5 px-3 text-center">Total Remaining</th>
                    <th className="py-2.5 px-3">Casual Left</th>
                    <th className="py-2.5 px-3">Annual Left</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                  {directReports.map((report) => {
                    const repCalc = calculateEmployeeBalances(
                      report.annualEntitled,
                      report.casualEntitled,
                      report.monthlyLeaves
                    );

                    return (
                      <tr
                        key={report.id}
                        className="hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/40 transition-colors"
                      >
                        <td className="py-2.5 px-3">
                          <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {report.name}
                          </div>
                          <div className="text-[11px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                            {report.id}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-[#64748B] dark:text-[#94A3B8]">
                          {report.department}
                        </td>
                        <td className="py-2.5 px-3 text-center tabular-nums font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {repCalc.totalTaken.toFixed(1)}d
                        </td>
                        <td className="py-2.5 px-3 text-center tabular-nums">
                          <span className="font-bold text-[#0284C7] dark:text-[#38BDF8]">
                            {repCalc.totalRemaining.toFixed(1)}d
                          </span>
                        </td>
                        <td className="py-2.5 px-3 tabular-nums font-medium text-[#0284C7] dark:text-[#38BDF8]">
                          {repCalc.casualRemaining.toFixed(1)} / {report.casualEntitled}d
                        </td>
                        <td className="py-2.5 px-3 tabular-nums font-medium text-[#1E40AF] dark:text-[#93C5FD]">
                          {repCalc.annualRemaining.toFixed(1)} / {report.annualEntitled}d
                        </td>
                        <td className="py-2.5 px-3 text-right">
                          {onSelectEmployeeBreakdown && (
                            <button
                              onClick={() => onSelectEmployeeBreakdown(report)}
                              className="h-7 px-2.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-[11px] font-medium rounded-md inline-flex items-center gap-1 transition-colors shadow-xs"
                              title="Inspect direct report's monthwise leave consumption"
                            >
                              <Calendar className="w-3 h-3 text-[#38BDF8]" />
                              <span>Monthwise Breakdown</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
