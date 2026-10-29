import React, { useState, useMemo } from 'react';
import {
  Inbox,
  Filter,
  Check,
  X,
  AlertTriangle,
  Calendar,
  Search,
  UserCheck,
  ArrowUpDown,
  FileCheck2,
  Plus
} from 'lucide-react';
import { Department, LeaveRequest, LeaveStatus, TeamMember } from '../types/leave';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatDateRange } from '../utils/dateUtils';

interface RequestsViewProps {
  requests: LeaveRequest[];
  currentUser: TeamMember;
  onSelectRequest: (req: LeaveRequest) => void;
  onApproveRequest: (id: string) => void;
  onRejectRequest: (id: string) => void;
  onOpenRequestModal: () => void;
  role: 'executive' | 'manager' | 'employee';
}

export const RequestsView: React.FC<RequestsViewProps> = ({
  requests,
  currentUser,
  onSelectRequest,
  onApproveRequest,
  onRejectRequest,
  onOpenRequestModal,
  role,
}) => {
  const [activeTab, setActiveTab] = useState<'pending' | 'mine' | 'all'>('pending');
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [localSearch, setLocalSearch] = useState('');

  // Tab counts
  const pendingCount = requests.filter((r) => r.status === 'Pending').length;
  const myCount = requests.filter((r) => r.employeeId === currentUser.id).length;

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
      // Tab filter
      if (activeTab === 'pending' && req.status !== 'Pending') return false;
      if (activeTab === 'mine' && req.employeeId !== currentUser.id) return false;

      // Dept filter
      if (selectedDept !== 'All' && req.department !== selectedDept) return false;

      // Status filter
      if (selectedStatus !== 'All' && req.status !== selectedStatus) return false;

      // Search
      if (localSearch.trim()) {
        const q = localSearch.toLowerCase();
        const matchName = req.employeeName.toLowerCase().includes(q);
        const matchType = req.leaveType.toLowerCase().includes(q);
        const matchReason = req.reason.toLowerCase().includes(q);
        const matchNumber = req.requestNumber.toLowerCase().includes(q);
        if (!matchName && !matchType && !matchReason && !matchNumber) return false;
      }

      return true;
    });
  }, [requests, activeTab, selectedDept, selectedStatus, localSearch, currentUser.id]);

  return (
    <div className="space-y-5">
      {/* Top Filter & Segmented Navigation Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Interactive segmented tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] dark:bg-[#1E293B] rounded-lg">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <span>Review Queue</span>
            {pendingCount > 0 && (
              <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-amber-500 text-white tabular-nums">
                {pendingCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('mine')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors flex items-center gap-1.5 ${
              activeTab === 'mine'
                ? 'bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <span>My Filings</span>
            <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
              ({myCount})
            </span>
          </button>

          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              activeTab === 'all'
                ? 'bg-white dark:bg-[#111827] text-[#0F172A] dark:text-[#F8FAFC] shadow-xs'
                : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
            }`}
          >
            <span>All Enterprise Records</span>
          </button>
        </div>

        {/* Secondary filters: Dept, Status, Search */}
        <div className="flex flex-wrap items-center gap-2.5">
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-8 px-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488]"
          >
            <option value="All">All Departments</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Engineering">Engineering</option>
            <option value="Legal & Compliance">Legal & Compliance</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Global Operations">Global Operations</option>
          </select>

          {activeTab !== 'pending' && (
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="h-8 px-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488]"
            >
              <option value="All">All Statuses</option>
              <option value="Approved">Approved</option>
              <option value="Pending">Pending</option>
              <option value="Rejected">Rejected</option>
            </select>
          )}

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter list..."
              className="h-8 pl-8 pr-2.5 text-xs bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#0D9488]"
            />
          </div>

          <button
            onClick={onOpenRequestModal}
            className="h-8 px-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-md text-xs font-medium flex items-center gap-1 transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New Request</span>
          </button>
        </div>
      </div>

      {/* Cards Stream */}
      <div className="space-y-3">
        {filteredRequests.length === 0 ? (
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-12 text-center">
            <FileCheck2 className="w-10 h-10 text-[#0D9488] mx-auto mb-3 opacity-60" />
            <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              No Leave Filings Found
            </h3>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 max-w-sm mx-auto">
              There are no matching leave requests for the selected department and status filters.
            </p>
          </div>
        ) : (
          filteredRequests.map((req) => (
            <div
              key={req.id}
              onClick={() => onSelectRequest(req)}
              className="group bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] hover:border-[#CBD5E1] dark:hover:border-[#475569] shadow-[0px_1px_3px_rgba(15,23,42,0.04)] p-5 transition-all duration-150 cursor-pointer"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Employee Info and Timing */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <img
                    src={req.avatar}
                    alt={req.employeeName}
                    className="w-11 h-11 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155] shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                        {req.employeeName}
                      </span>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        · {req.employeeRole}
                      </span>
                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                        · {req.department}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs">
                      <span className="font-semibold text-[#0B1C30] dark:text-[#EAF1FF]">
                        {req.leaveType}
                      </span>
                      <span className="text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {formatDateRange(req.startDate, req.endDate)}
                      </span>
                      <span className="font-semibold text-[#0D9488] dark:text-[#2DD4BF] tabular-nums">
                        {req.workingDays.toFixed(1)} Working Days
                      </span>
                      <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        (Submitted {formatDate(req.submittedAt.split('T')[0])})
                      </span>
                    </div>

                    {/* Reason Preview */}
                    <p className="text-xs text-[#45464D] dark:text-[#CBD5E1] mt-2 line-clamp-1 italic">
                      "{req.reason}"
                    </p>

                    {/* Coverage & Conflict */}
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                      <span className="flex items-center gap-1">
                        <UserCheck className="w-3.5 h-3.5 text-[#0D9488]" />
                        Coverage delegate: <strong>{req.coverageDelegate.name}</strong> ({req.coverageDelegate.status})
                      </span>
                      {req.conflictWarning && (
                        <span className="flex items-center gap-1 text-amber-700 dark:text-amber-400 font-medium">
                          <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                          {req.conflictWarning}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: Status Pill & Actions */}
                <div className="flex sm:flex-col md:flex-row items-center gap-3 shrink-0 self-end md:self-center" onClick={(e) => e.stopPropagation()}>
                  <StatusBadge status={req.status} />

                  {req.status === 'Pending' && role !== 'employee' && (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onRejectRequest(req.id)}
                        className="h-8 px-2.5 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 rounded-lg text-xs font-medium transition-colors"
                        title="Reject request"
                      >
                        Decline
                      </button>
                      <button
                        onClick={() => onApproveRequest(req.id)}
                        className="h-8 px-3 bg-[#0D9488] hover:bg-[#0F766E] text-white rounded-lg text-xs font-medium transition-colors flex items-center gap-1 shadow-xs"
                        title="Approve request"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
