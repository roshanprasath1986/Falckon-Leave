import React from 'react';
import {
  Calendar,
  Clock,
  ArrowUpRight,
  CheckCircle2,
  AlertTriangle,
  ChevronRight,
  Shield,
  Users,
  Building,
  Check,
  X
} from 'lucide-react';
import { LeaveBalance, LeaveRequest, TeamMember } from '../types/leave';
import { MetricCard } from './MetricCard';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatDateRange } from '../utils/dateUtils';

interface OverviewViewProps {
  balances: LeaveBalance[];
  requests: LeaveRequest[];
  currentUser: TeamMember;
  onOpenRequestModal: () => void;
  onSelectRequest: (request: LeaveRequest) => void;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onNavigateTab: (tab: any) => void;
  role: 'executive' | 'manager' | 'employee';
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  balances,
  requests,
  currentUser,
  onOpenRequestModal,
  onSelectRequest,
  onApproveRequest,
  onRejectRequest,
  onNavigateTab,
  role,
}) => {
  // Pending requests requiring review
  const pendingRequests = requests.filter((r) => r.status === 'Pending');

  // Upcoming approved leaves across team
  const upcomingApprovedLeaves = requests
    .filter((r) => r.status === 'Approved' && r.startDate >= '2026-10-01')
    .sort((a, b) => a.startDate.localeCompare(b.startDate));

  // Current user's requests
  const myRequests = requests.filter((r) => r.employeeId === currentUser.id);

  // Total available days across all categories
  const totalAvailableDays = balances.reduce(
    (sum, b) => sum + Math.max(0, b.accruedToDate - b.used - b.pending),
    0
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Executive Compliance KPI bar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-[#E2E8F0] dark:border-[#334155] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0D9488] dark:text-[#2DD4BF] bg-[#ECFDF5] dark:bg-[#064E3B]/30 px-2.5 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 rounded-full bg-[#0D9488]" />
              FY2026 Statutory Compliance: Verified
            </span>
            <span className="text-xs text-[#64748B] dark:text-[#94A3B8] hidden sm:inline">
              · Next rollover deadline: Dec 31, 2026
            </span>
          </div>
          <h2 className="text-lg font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading">
            Executive Availability & Balance Reserves
          </h2>
          <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            {currentUser.name} ({currentUser.role}) has{' '}
            <strong className="text-[#0F172A] dark:text-white font-semibold tabular-nums">
              {totalAvailableDays.toFixed(1)} days
            </strong>{' '}
            unreserved across executive vacation, floating, and restitution pools.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            onClick={() => onNavigateTab('policy')}
            className="h-9 px-3.5 text-xs font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#0F172A] dark:text-[#EAF1FF] bg-white dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <Shield className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Policy Guidelines</span>
          </button>
          <button
            onClick={onOpenRequestModal}
            className="h-9 px-4 text-xs font-medium bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
          >
            <span>Request Time Off</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Primary Leave Balance Metric Cards */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Personal Statutory Balances (FY2026)
          </h3>
          <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
            Accrual cycle: Semi-monthly on 15th & 30th
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {balances.slice(0, 4).map((balance) => (
            <MetricCard
              key={balance.id}
              balance={balance}
              onClick={() => onOpenRequestModal()}
            />
          ))}
        </div>
      </div>

      {/* Two Column Layout: Pending Approvals & Upcoming Team Schedule */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Approvals requiring action (8 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs overflow-hidden">
            <div className="px-5 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading flex items-center gap-2">
                  <span>Executive Review Queue</span>
                  {pendingRequests.length > 0 && (
                    <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 tabular-nums">
                      {pendingRequests.length} action required
                    </span>
                  )}
                </h3>
                <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                  Direct report and peer requests awaiting administrative authorization
                </p>
              </div>

              <button
                onClick={() => onNavigateTab('requests')}
                className="text-xs font-medium text-[#0D9488] dark:text-[#2DD4BF] hover:underline flex items-center gap-0.5"
              >
                View all ({requests.length})
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* List of pending requests */}
            <div className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
              {pendingRequests.length === 0 ? (
                <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                  <CheckCircle2 className="w-8 h-8 text-[#0D9488] mx-auto mb-2 opacity-80" />
                  All requests processed. Review queue is clear.
                </div>
              ) : (
                pendingRequests.map((req) => (
                  <div
                    key={req.id}
                    className="p-4 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                    onClick={() => onSelectRequest(req)}
                  >
                    <div className="flex items-start gap-3 min-w-0">
                      <img
                        src={req.avatar}
                        alt={req.employeeName}
                        className="w-10 h-10 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                            {req.employeeName}
                          </span>
                          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                            · {req.department}
                          </span>
                        </div>
                        <div className="text-xs text-[#45464D] dark:text-[#CBD5E1] truncate mt-0.5">
                          {req.leaveType} ({req.workingDays} working days)
                        </div>
                        <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-2 mt-1">
                          <span>{formatDateRange(req.startDate, req.endDate)}</span>
                          <span>·</span>
                          <span className="truncate">Delegate: {req.coverageDelegate.name}</span>
                        </div>
                        {req.conflictWarning && (
                          <div className="text-[11px] text-amber-700 dark:text-amber-400 flex items-center gap-1 mt-1">
                            <AlertTriangle className="w-3 h-3 shrink-0" />
                            <span className="truncate">{req.conflictWarning}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center" onClick={(e) => e.stopPropagation()}>
                      <button
                        onClick={() => onRejectRequest(req.id)}
                        className="p-2 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs transition-colors"
                        title="Decline request"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onApproveRequest(req.id)}
                        className="px-3 py-1.5 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                        title="Approve request"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* User's Own Recent Filings */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                My Recent Filings
              </h3>
              <button
                onClick={onOpenRequestModal}
                className="text-xs font-medium text-[#0D9488] dark:text-[#2DD4BF] hover:underline"
              >
                + File New Request
              </button>
            </div>
            <div className="space-y-2.5">
              {myRequests.map((req) => (
                <div
                  key={req.id}
                  onClick={() => onSelectRequest(req)}
                  className="p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] hover:border-[#CBD5E1] dark:hover:border-[#475569] flex items-center justify-between cursor-pointer transition-colors"
                >
                  <div className="min-w-0">
                    <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                      {req.leaveType}
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      {formatDateRange(req.startDate, req.endDate)} · {req.workingDays} working days
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <StatusBadge status={req.status} size="sm" />
                    <ChevronRight className="w-4 h-4 text-[#94A3B8]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Upcoming Absences & Department Availability Radar (5 cols on lg) */}
        <div className="lg:col-span-5 space-y-4">
          {/* Upcoming Team Absences */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                  Upcoming Scheduled Absences
                </h3>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Confirmed calendar roster for November 2026
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('calendar')}
                className="text-xs font-medium text-[#0D9488] dark:text-[#2DD4BF] hover:underline flex items-center gap-0.5"
              >
                Calendar
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-3">
              {upcomingApprovedLeaves.slice(0, 4).map((leave) => (
                <div
                  key={leave.id}
                  onClick={() => onSelectRequest(leave)}
                  className="flex items-start gap-3 p-2.5 rounded-lg border border-[#F1F5F9] dark:border-[#1E293B] hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors cursor-pointer"
                >
                  <img
                    src={leave.avatar}
                    alt={leave.employeeName}
                    className="w-8 h-8 rounded-full object-cover shrink-0"
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                        {leave.employeeName}
                      </span>
                      <span className="text-[11px] font-semibold text-[#0D9488] dark:text-[#2DD4BF] tabular-nums">
                        {leave.workingDays}d
                      </span>
                    </div>
                    <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                      {formatDateRange(leave.startDate, leave.endDate)}
                    </div>
                    <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] mt-0.5 flex items-center gap-1">
                      <span>Covered by: {leave.coverageDelegate.name}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Department Coverage Capacities */}
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Workforce Readiness Index
              </h3>
              <span className="text-[11px] font-medium text-[#0D9488]">Q4 Active</span>
            </div>

            <div className="space-y-3">
              {[
                { dept: 'Executive Suite', capacity: 85, color: 'bg-[#0D9488]', membersAway: '1 of 4 away' },
                { dept: 'Global Engineering', capacity: 92, color: 'bg-[#0D9488]', membersAway: '1 of 12 away' },
                { dept: 'Legal & Compliance', capacity: 100, color: 'bg-[#0D9488]', membersAway: 'Full availability' },
                { dept: 'Product & Design', capacity: 78, color: 'bg-amber-500', membersAway: '2 of 8 away' },
              ].map((item) => (
                <div key={item.dept} className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-[#0B1C30] dark:text-[#EAF1FF]">
                      {item.dept}
                    </span>
                    <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                      {item.membersAway} ({item.capacity}%)
                    </span>
                  </div>
                  <div className="h-1.5 w-full bg-[#F1F5F9] dark:bg-[#1E293B] rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.color} rounded-full`}
                      style={{ width: `${item.capacity}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
