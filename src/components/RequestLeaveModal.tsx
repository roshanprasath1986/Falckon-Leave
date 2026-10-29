import React, { useState, useMemo } from 'react';
import { X, Calendar, UserCheck, AlertTriangle, CheckCircle, ShieldAlert, FileText } from 'lucide-react';
import { LeaveBalance, LeaveRequest, LeaveType, TeamMember } from '../types/leave';
import { calculateWorkingDays, formatDate, US_PUBLIC_HOLIDAYS_2026 } from '../utils/dateUtils';

interface RequestLeaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (request: Omit<LeaveRequest, 'id' | 'requestNumber' | 'submittedAt' | 'payrollSyncId'>) => void;
  balances: LeaveBalance[];
  teamMembers: TeamMember[];
  currentUser: TeamMember;
}

export const RequestLeaveModal: React.FC<RequestLeaveModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  balances,
  teamMembers,
  currentUser,
}) => {
  if (!isOpen) return null;

  // Form states
  const [leaveType, setLeaveType] = useState<LeaveType>('Annual Vacation');
  // Default dates: Next Monday to Friday
  const today = new Date();
  const nextMonday = new Date(today);
  nextMonday.setDate(today.getDate() + ((1 + 7 - today.getDay()) % 7 || 7));
  const nextFriday = new Date(nextMonday);
  nextFriday.setDate(nextMonday.getDate() + 4);

  const defaultStart = nextMonday.toISOString().split('T')[0];
  const defaultEnd = nextFriday.toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(defaultStart);
  const [endDate, setEndDate] = useState(defaultEnd);
  const [delegateId, setDelegateId] = useState<string>(
    teamMembers.find((m) => m.id !== currentUser.id)?.id || ''
  );
  const [reason, setReason] = useState('');
  const [urgency, setUrgency] = useState<'Standard' | 'Expedited' | 'Executive Privilege'>('Standard');
  const [hasEmergencyContact, setHasEmergencyContact] = useState(true);

  // Calculate working days excluding weekends & public holidays
  const workingDays = useMemo(() => {
    return calculateWorkingDays(startDate, endDate, US_PUBLIC_HOLIDAYS_2026);
  }, [startDate, endDate]);

  // Find relevant balance
  const currentBalance = balances.find((b) => b.type === leaveType);
  const availableDays = currentBalance
    ? Math.max(0, currentBalance.accruedToDate - currentBalance.used - currentBalance.pending)
    : 0;

  const remainingAfter = availableDays - workingDays;
  const isOverAllocated = remainingAfter < 0;

  const selectedDelegate = teamMembers.find((m) => m.id === delegateId);

  // Check holiday overlap in range
  const overlappingHolidays = useMemo(() => {
    if (!startDate || !endDate) return [];
    return US_PUBLIC_HOLIDAYS_2026.filter((h) => h.date >= startDate && h.date <= endDate);
  }, [startDate, endDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || workingDays <= 0) return;

    const newRequest: Omit<LeaveRequest, 'id' | 'requestNumber' | 'submittedAt' | 'payrollSyncId'> = {
      employeeId: currentUser.id,
      employeeName: currentUser.name,
      employeeRole: currentUser.role,
      department: currentUser.department,
      avatar: currentUser.avatar,
      leaveType,
      startDate,
      endDate,
      workingDays,
      coverageDelegate: {
        name: selectedDelegate?.name || 'Delegated Team Member',
        role: selectedDelegate?.role || 'Executive Officer',
        avatar: selectedDelegate?.avatar || currentUser.avatar,
        status: 'Confirmed',
      },
      reason: reason.trim() || `${leaveType} Filing for ${currentUser.name}`,
      status: 'Pending',
      urgency,
      conflictWarning:
        workingDays > 5
          ? 'Executive notice: Extended leave duration exceeds standard 5-day cycle.'
          : undefined,
    };

    onSubmit(newRequest);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#111827] rounded-xl border border-[#CBD5E1] dark:border-[#334155] shadow-[0px_20px_25px_-5px_rgba(15,23,42,0.12),0px_8px_10px_-6px_rgba(15,23,42,0.08)] overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B]/50">
          <div>
            <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
              Submit Leave Request
            </h2>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Automated statutory payroll recalculation & delegate coverage dispatch
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Leave Category Selector */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              Leave Classification
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as LeaveType)}
              className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
            >
              <option value="Annual Vacation">Annual Vacation (Statutory Accrual)</option>
              <option value="Executive Floating Holiday">Executive Floating Holiday</option>
              <option value="Medical & Health">Medical & Health / Wellness</option>
              <option value="Executive Sabbatical">Executive Sabbatical / Study</option>
              <option value="Comp Time & Restitution">Comp Time & Travel Restitution</option>
              <option value="Parental Leave">Parental Leave</option>
              <option value="Bereavement">Bereavement & Compassionate</option>
            </select>
          </div>

          {/* Date Range Picker */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              Leave Period (Inclusive)
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1">
                  Start Date
                </span>
                <div className="relative">
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                    required
                  />
                </div>
              </div>

              <div>
                <span className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1">
                  End Date
                </span>
                <div className="relative">
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Overlapping statutory holiday notice if any */}
            {overlappingHolidays.length > 0 && (
              <div className="mt-2 p-2 rounded-md bg-[#EFF4FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-[#1E3A8A] text-[11px] text-[#1E40AF] dark:text-[#93C5FD] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 shrink-0" />
                <span>
                  Includes public holiday: <strong>{overlappingHolidays.map((h) => h.name).join(', ')}</strong> (excluded from deducted balance).
                </span>
              </div>
            )}
          </div>

          {/* Balance Impact Ledger Simulator */}
          <div className="p-3.5 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155]">
            <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-2">
              Balance Impact Calculation
            </div>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2 rounded bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Current Available</div>
                <div className="text-sm font-semibold tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                  {availableDays.toFixed(1)} days
                </div>
              </div>
              <div className="p-2 rounded bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155]">
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Working Days</div>
                <div className="text-sm font-semibold tabular-nums text-[#0D9488] dark:text-[#2DD4BF]">
                  -{workingDays.toFixed(1)} days
                </div>
              </div>
              <div
                className={`p-2 rounded border ${
                  isOverAllocated
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 text-rose-700 dark:text-rose-400'
                    : 'bg-white dark:bg-[#111827] border-[#E2E8F0] dark:border-[#334155]'
                }`}
              >
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">Projected Balance</div>
                <div className="text-sm font-semibold tabular-nums">
                  {remainingAfter.toFixed(1)} days
                </div>
              </div>
            </div>

            {isOverAllocated && (
              <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Notice: Requested working days exceed available balance. Request requires Executive Board exception approval.
                </span>
              </div>
            )}
          </div>

          {/* Coverage Delegate Selection */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              Designated Coverage Delegate
            </label>
            <div className="space-y-2">
              <select
                value={delegateId}
                onChange={(e) => setDelegateId(e.target.value)}
                className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
                required
              >
                {teamMembers
                  .filter((m) => m.id !== currentUser.id)
                  .map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} — {m.role} ({m.department})
                    </option>
                  ))}
              </select>

              {selectedDelegate && (
                <div className="flex items-center gap-3 p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827]">
                  <img
                    src={selectedDelegate.avatar}
                    alt={selectedDelegate.name}
                    className="w-8 h-8 rounded-full object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {selectedDelegate.name}
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {selectedDelegate.role}
                    </div>
                  </div>
                  <span className="text-[11px] font-medium text-[#0D9488] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-2 py-0.5 rounded-full">
                    Delegate Ready
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Reason / Briefing */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              Reason / Executive Operational Briefing
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="e.g. Annual executive recess following Q4 board review; all escalations routed to delegate."
              className="w-full p-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-xs sm:text-sm text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#0D9488] focus:ring-2 focus:ring-[#0D9488]/20"
            />
          </div>

          {/* Urgency Classification */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] mb-1.5">
              Review Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(['Standard', 'Expedited', 'Executive Privilege'] as const).map((tier) => (
                <button
                  type="button"
                  key={tier}
                  onClick={() => setUrgency(tier)}
                  className={`py-2 px-3 text-xs font-medium rounded-lg border transition-colors ${
                    urgency === tier
                      ? 'bg-[#0F172A] text-white border-[#0F172A] dark:bg-[#F8FAFC] dark:text-[#0F172A]'
                      : 'bg-white dark:bg-[#111827] border-[#CBD5E1] dark:border-[#475569] text-[#64748B] dark:text-[#94A3B8] hover:bg-slate-50'
                  }`}
                >
                  {tier}
                </button>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 text-xs sm:text-sm font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#0F172A] dark:text-[#EAF1FF] bg-white dark:bg-[#111827] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={workingDays <= 0}
              className="h-10 px-5 text-xs sm:text-sm font-medium bg-[#0D9488] hover:bg-[#0F766E] disabled:opacity-50 text-white rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <CheckCircle className="w-4 h-4" />
              <span>Confirm & Submit Request ({workingDays}d)</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
