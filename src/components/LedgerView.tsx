import React, { useState, useMemo } from 'react';
import {
  Download,
  Search,
  Filter,
  ArrowUpDown,
  FileSpreadsheet,
  CheckCircle,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { Department, LeaveRequest, LeaveStatus, LeaveType } from '../types/leave';
import { StatusBadge } from './StatusBadge';
import { formatDate, formatDateRange, exportRequestsToCSV } from '../utils/dateUtils';

interface LedgerViewProps {
  requests: LeaveRequest[];
  onSelectRequest: (req: LeaveRequest) => void;
  searchQuery: string;
}

export const LedgerView: React.FC<LedgerViewProps> = ({
  requests,
  onSelectRequest,
  searchQuery: globalSearch,
}) => {
  const [selectedDept, setSelectedDept] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortField, setSortField] = useState<'date' | 'days' | 'name'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [tableSearch, setTableSearch] = useState('');

  // Combined search term
  const activeSearch = (globalSearch || tableSearch).toLowerCase();

  const filtered = useMemo(() => {
    return requests
      .filter((r) => {
        if (selectedDept !== 'All' && r.department !== selectedDept) return false;
        if (selectedType !== 'All' && r.leaveType !== selectedType) return false;
        if (selectedStatus !== 'All' && r.status !== selectedStatus) return false;
        if (activeSearch) {
          const matchName = r.employeeName.toLowerCase().includes(activeSearch);
          const matchNum = r.requestNumber.toLowerCase().includes(activeSearch);
          const matchDept = r.department.toLowerCase().includes(activeSearch);
          const matchType = r.leaveType.toLowerCase().includes(activeSearch);
          if (!matchName && !matchNum && !matchDept && !matchType) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortField === 'date') {
          return sortOrder === 'desc'
            ? b.startDate.localeCompare(a.startDate)
            : a.startDate.localeCompare(b.startDate);
        }
        if (sortField === 'days') {
          return sortOrder === 'desc' ? b.workingDays - a.workingDays : a.workingDays - b.workingDays;
        }
        if (sortField === 'name') {
          return sortOrder === 'desc'
            ? b.employeeName.localeCompare(a.employeeName)
            : a.employeeName.localeCompare(b.employeeName);
        }
        return 0;
      });
  }, [requests, selectedDept, selectedType, selectedStatus, activeSearch, sortField, sortOrder]);

  const toggleSort = (field: 'date' | 'days' | 'name') => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
  };

  const handleExport = () => {
    exportRequestsToCSV(filtered, `executive_leave_ledger_${new Date().toISOString().split('T')[0]}.csv`);
  };

  // Ledger summary aggregates
  const totalDays = filtered.reduce((acc, r) => acc + r.workingDays, 0);
  const approvedDays = filtered.filter((r) => r.status === 'Approved').reduce((acc, r) => acc + r.workingDays, 0);
  const pendingDays = filtered.filter((r) => r.status === 'Pending').reduce((acc, r) => acc + r.workingDays, 0);

  return (
    <div className="space-y-4">
      {/* Top Filter and Action Bar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 shadow-xs flex flex-wrap items-center justify-between gap-3">
        {/* Left side filters */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={tableSearch}
              onChange={(e) => setTableSearch(e.target.value)}
              placeholder="Search ledger entries..."
              className="h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#0D9488]"
            />
          </div>

          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="h-9 px-2.5 text-xs bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488]"
          >
            <option value="All">All Departments</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Engineering">Engineering</option>
            <option value="Legal & Compliance">Legal & Compliance</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Global Operations">Global Operations</option>
          </select>

          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-9 px-2.5 text-xs bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488]"
          >
            <option value="All">All Leave Types</option>
            <option value="Annual Vacation">Annual Vacation</option>
            <option value="Executive Floating Holiday">Floating Holiday</option>
            <option value="Medical & Health">Medical & Health</option>
            <option value="Executive Sabbatical">Executive Sabbatical</option>
            <option value="Comp Time & Restitution">Comp Time</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="h-9 px-2.5 text-xs bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488]"
          >
            <option value="All">All Statuses</option>
            <option value="Approved">Approved</option>
            <option value="Pending">Pending</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        {/* Right side metrics and CSV export */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-4 text-xs tabular-nums text-[#64748B] dark:text-[#94A3B8]">
            <span>
              Total: <strong className="text-[#0F172A] dark:text-white">{totalDays.toFixed(1)}d</strong>
            </span>
            <span>
              Approved: <strong className="text-[#0D9488] dark:text-[#2DD4BF]">{approvedDays.toFixed(1)}d</strong>
            </span>
            <span>
              Pending: <strong className="text-amber-600 dark:text-amber-400">{pendingDays.toFixed(1)}d</strong>
            </span>
          </div>

          <button
            onClick={handleExport}
            className="h-9 px-3.5 text-xs font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#0F172A] dark:text-[#EAF1FF] bg-white dark:bg-[#1E293B] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] rounded-lg flex items-center gap-1.5 transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#0D9488]" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Enterprise Tabular Ledger Container */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-[0px_1px_3px_rgba(15,23,42,0.04),0px_4px_12px_rgba(15,23,42,0.02)] overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="h-11 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155] text-[11px] font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider select-none">
                <th className="py-2.5 px-4">
                  <button
                    onClick={() => toggleSort('name')}
                    className="flex items-center gap-1 hover:text-[#0F172A] dark:hover:text-white"
                  >
                    <span>Personnel / Role</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-4">Department</th>
                <th className="py-2.5 px-4">Classification</th>
                <th className="py-2.5 px-4">
                  <button
                    onClick={() => toggleSort('date')}
                    className="flex items-center gap-1 hover:text-[#0F172A] dark:hover:text-white"
                  >
                    <span>Absence Span</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-4 text-right">
                  <button
                    onClick={() => toggleSort('days')}
                    className="inline-flex items-center gap-1 hover:text-[#0F172A] dark:hover:text-white justify-end"
                  >
                    <span>Days</span>
                    <ArrowUpDown className="w-3 h-3" />
                  </button>
                </th>
                <th className="py-2.5 px-4">Delegate</th>
                <th className="py-2.5 px-4">Audit Status</th>
                <th className="py-2.5 px-4 text-center">Ref</th>
                <th className="py-2.5 px-4 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B] text-xs">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                    No ledger entries match the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((req, idx) => (
                  <tr
                    key={req.id}
                    onClick={() => onSelectRequest(req)}
                    className="h-13 hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/60 transition-colors cursor-pointer group"
                  >
                    {/* Personnel */}
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <img
                          src={req.avatar}
                          alt={req.employeeName}
                          className="w-7 h-7 rounded-full object-cover shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                            {req.employeeName}
                          </div>
                          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
                            {req.employeeRole}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Department */}
                    <td className="py-2.5 px-4 text-[#45464D] dark:text-[#CBD5E1]">
                      {req.department}
                    </td>

                    {/* Classification */}
                    <td className="py-2.5 px-4">
                      <span className="font-medium text-[#0B1C30] dark:text-[#EAF1FF]">
                        {req.leaveType}
                      </span>
                    </td>

                    {/* Absence Span */}
                    <td className="py-2.5 px-4 font-medium text-[#45464D] dark:text-[#CBD5E1] whitespace-nowrap">
                      {formatDateRange(req.startDate, req.endDate)}
                    </td>

                    {/* Days (Right Aligned + Tabular) */}
                    <td className="py-2.5 px-4 text-right tabular-nums font-semibold text-[#0B1C30] dark:text-[#EAF1FF]">
                      {req.workingDays.toFixed(1)}
                    </td>

                    {/* Coverage Delegate */}
                    <td className="py-2.5 px-4 text-[#45464D] dark:text-[#CBD5E1]">
                      <div className="truncate max-w-[130px]">
                        {req.coverageDelegate.name}
                      </div>
                    </td>

                    {/* Status Capsule */}
                    <td className="py-2.5 px-4">
                      <StatusBadge status={req.status} size="sm" />
                    </td>

                    {/* Payroll Ref */}
                    <td className="py-2.5 px-4 text-center font-mono text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                      {req.payrollSyncId ? req.payrollSyncId.replace('PR-PAY-', '#') : '—'}
                    </td>

                    {/* Inspect Icon */}
                    <td className="py-2.5 px-4 text-right">
                      <span className="text-[#0D9488] opacity-0 group-hover:opacity-100 transition-opacity text-xs font-medium inline-flex items-center gap-1">
                        Dossier
                        <ExternalLink className="w-3 h-3" />
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Ledger Pagination / Ledger Record Counter */}
        <div className="px-5 py-3 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/40 flex items-center justify-between text-xs text-[#64748B] dark:text-[#94A3B8]">
          <span className="tabular-nums">
            Showing <strong>{filtered.length}</strong> of <strong>{requests.length}</strong> entries in ledger
          </span>
          <span className="text-[11px]">
            Strict Audit Compliance ISO 27001 / SOC 2 Certified
          </span>
        </div>
      </div>
    </div>
  );
};
