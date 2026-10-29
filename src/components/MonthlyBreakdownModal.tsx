import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Save,
  RotateCcw,
  Zap,
  CheckCircle,
  AlertTriangle,
  User,
  Plus,
  Trash2,
  Clock,
  Download
} from 'lucide-react';
import { Employee, EmployeeLeaveEntry, getEmployeeSupervisors } from '../types/portal';
import { calculateEmployeeBalances, MONTH_NAMES } from '../utils/leaveCalculations';

interface MonthlyBreakdownModalProps {
  employee: Employee | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (employeeId: string, updatedMonthlyLeaves: Record<number, number>, updatedEntries: EmployeeLeaveEntry[]) => void;
  onOpenExport?: (emp: Employee) => void;
}

export const MonthlyBreakdownModal: React.FC<MonthlyBreakdownModalProps> = ({
  employee,
  isOpen,
  onClose,
  onSave,
  onOpenExport,
}) => {
  if (!isOpen || !employee) return null;

  // Local state for editing the 12 months
  const [monthlyLeaves, setMonthlyLeaves] = useState<Record<number, number>>({
    ...employee.monthlyLeaves,
  });
  const [entries, setEntries] = useState<EmployeeLeaveEntry[]>([
    ...(employee.leaveEntries || []),
  ]);

  // Sync state when employee changes
  useEffect(() => {
    if (employee) {
      setMonthlyLeaves({ ...employee.monthlyLeaves });
      setEntries([...(employee.leaveEntries || [])]);
    }
  }, [employee]);

  // Live calculation of balances based on currently edited inputs
  const calc = calculateEmployeeBalances(
    employee.annualEntitled,
    employee.casualEntitled,
    monthlyLeaves
  );

  const handleMonthChange = (month: number, value: string) => {
    const num = Math.max(0, parseFloat(value) || 0);
    setMonthlyLeaves((prev) => ({
      ...prev,
      [month]: num,
    }));
  };

  const handleReset = () => {
    setMonthlyLeaves({ ...employee.monthlyLeaves });
    setEntries([...(employee.leaveEntries || [])]);
  };

  const handleSave = () => {
    onSave(employee.id, monthlyLeaves, entries);
    onClose();
  };

  // Add quick dated entry
  const [newEntryDate, setNewEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [newEntryDays, setNewEntryDays] = useState(1);
  const [newEntryReason, setNewEntryReason] = useState('');
  const [showAddEntry, setShowAddEntry] = useState(false);

  const handleAddEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEntryDate || newEntryDays <= 0) return;

    const monthNum = parseInt(newEntryDate.split('-')[1], 10);
    const newEntry: EmployeeLeaveEntry = {
      id: `le-${Date.now()}`,
      date: newEntryDate,
      month: monthNum,
      days: newEntryDays,
      reason: newEntryReason.trim() || 'Leave taken',
      type: 'Auto-Deducted',
      createdAt: new Date().toISOString(),
    };

    setEntries((prev) => [newEntry, ...prev]);

    // Also update monthly leaves count for that month
    setMonthlyLeaves((prev) => ({
      ...prev,
      [monthNum]: (prev[monthNum] || 0) + newEntryDays,
    }));

    setNewEntryReason('');
    setShowAddEntry(false);
  };

  const handleDeleteEntry = (entryId: string, month: number, days: number) => {
    setEntries((prev) => prev.filter((e) => e.id !== entryId));
    setMonthlyLeaves((prev) => ({
      ...prev,
      [month]: Math.max(0, (prev[month] || 0) - days),
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-4xl bg-white dark:bg-[#111827] rounded-xl border border-[#CBD5E1] dark:border-[#334155] shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B]/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#0F172A] text-white dark:bg-[#F8FAFC] dark:text-[#0F172A] flex items-center justify-center font-bold text-sm">
              {employee.id.replace('EMP', '')}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                  {employee.name}
                </h2>
                <span className="text-xs font-mono px-2 py-0.5 rounded bg-slate-200 dark:bg-slate-700 text-[#45464D] dark:text-[#CBD5E1]">
                  {employee.id}
                </span>
                {employee.isArchived && (
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full">
                    Archived
                  </span>
                )}
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                {getEmployeeSupervisors(employee).length > 1
                  ? 'Supervisors: '
                  : getEmployeeSupervisors(employee).length === 1
                  ? 'Supervisor: '
                  : 'Hierarchy: '}
                <strong>
                  {getEmployeeSupervisors(employee).length > 0
                    ? getEmployeeSupervisors(employee).join(', ')
                    : 'None (Direct to Board)'}
                </strong>{' '}
                · {employee.department}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onOpenExport && (
              <button
                type="button"
                onClick={() => onOpenExport(employee)}
                className="h-8 px-2.5 text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg hover:bg-slate-50 flex items-center gap-1.5 shadow-xs transition-colors"
                title="Export this employee's monthwise leave ledger (Simplified or Full)"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Export CSV</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Deductions Rule Banner */}
        <div className="px-6 py-3 bg-[#EFF4FF] dark:bg-[#1E293B] border-b border-[#BFDBFE] dark:border-[#1E3A8A] text-xs text-[#1E40AF] dark:text-[#93C5FD] flex items-start gap-2">
          <Zap className="w-4 h-4 shrink-0 mt-0.5 text-[#2563EB]" />
          <div>
            <strong>Casual-First Automatic Deduction:</strong> Enter total leaves taken in each month.
            Casual is used first; once Casual runs out, the rest is taken from Annual automatically.
          </div>
        </div>

        {/* Live Balance Summary Cards */}
        <div className="p-6 pb-4 grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Annual Balance Card */}
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/40">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
              Annual Leave
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                {calc.annualRemaining.toFixed(1)}
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                / {employee.annualEntitled} left
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
              Used: <strong className="text-[#0B1C30] dark:text-white">{calc.totalAnnualTaken.toFixed(1)}</strong> days
            </div>
          </div>

          {/* Casual Balance Card */}
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/40">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
              Casual Leave
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-[#0284C7] dark:text-[#38BDF8]">
                {calc.casualRemaining.toFixed(1)}
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                / {employee.casualEntitled} left
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
              Used: <strong className="text-[#0B1C30] dark:text-white">{calc.totalCasualTaken.toFixed(1)}</strong> days
            </div>
          </div>

          {/* Total Taken Card */}
          <div className="p-3.5 rounded-xl border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/40">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
              Total Leaves Taken
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                {calc.totalTaken.toFixed(1)}
              </span>
              <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                days total
              </span>
            </div>
            <div className="mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
              Entitlement: {employee.annualEntitled + employee.casualEntitled} days
            </div>
          </div>

          {/* Unpaid / Excess Card */}
          <div
            className={`p-3.5 rounded-xl border ${
              calc.totalUnpaid > 0
                ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-200 dark:border-rose-900 text-rose-800 dark:text-rose-300'
                : 'bg-[#F8FAFC] dark:bg-[#1E293B]/40 border-[#E2E8F0] dark:border-[#334155]'
            }`}
          >
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
              Unpaid / Excess
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-bold tabular-nums">
                {calc.totalUnpaid.toFixed(1)}
              </span>
              <span className="text-xs">days</span>
            </div>
            <div className="mt-2 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              {calc.totalUnpaid > 0 ? 'Exceeds entitled pools' : 'Within entitlement'}
            </div>
          </div>
        </div>

        {/* 12-Month Table */}
        <div className="px-6 py-2">
          <div className="border border-[#E2E8F0] dark:border-[#334155] rounded-xl overflow-hidden shadow-xs">
            <div className="max-h-[380px] overflow-y-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead className="sticky top-0 z-10 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155]">
                  <tr className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                    <th className="py-2.5 px-3">Month</th>
                    <th className="py-2.5 px-3 w-28">Leaves Taken</th>
                    <th className="py-2.5 px-3">Type of Leave</th>
                    <th className="py-2.5 px-3 text-center">Total Taken (YTD)</th>
                    <th className="py-2.5 px-3 text-center">Total Remaining</th>
                    <th className="py-2.5 px-3">Casual / Annual Deducted</th>
                    <th className="py-2.5 px-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                  {calc.monthlyBreakdown.map((row) => {
                    const isExhaustionMonth =
                      row.fromCasual > 0 &&
                      row.fromAnnual > 0 &&
                      row.casualRemainingAfter === 0;

                    const isExhaustedPost =
                      row.fromCasual === 0 &&
                      row.totalTaken > 0 &&
                      row.fromAnnual > 0;

                    return (
                      <tr
                        key={row.month}
                        className={`hover:bg-[#F8FAFC] dark:hover:bg-[#1E293B]/50 transition-colors ${
                          row.totalTaken > 0 ? 'bg-white dark:bg-[#111827]' : 'bg-[#FAFCFF]/50 dark:bg-[#0F172A]/20'
                        }`}
                      >
                        {/* Month Name */}
                        <td className="py-2 px-3 font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                          {row.monthName}
                        </td>

                        {/* Leaves Taken input */}
                        <td className="py-2 px-3">
                          <input
                            type="number"
                            min="0"
                            max="31"
                            step="0.5"
                            value={monthlyLeaves[row.month] ?? 0}
                            onChange={(e) => handleMonthChange(row.month, e.target.value)}
                            className="w-20 h-7 px-2 text-xs font-semibold tabular-nums text-center bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                          />
                        </td>

                        {/* Type of Leave */}
                        <td className="py-2 px-3">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-[11px] font-medium ${
                              row.leaveType === 'Casual Leave'
                                ? 'bg-[#E0F2FE] dark:bg-[#1E3A8A]/40 text-[#0284C7] dark:text-[#38BDF8] border border-[#BAE6FD] dark:border-[#0284C7]/40'
                                : row.leaveType === 'Annual Leave'
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200/60 dark:border-blue-800/60'
                                : row.leaveType === 'Casual + Annual'
                                ? 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/60'
                                : row.leaveType === 'Unpaid Leave'
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200/60 dark:border-rose-800/60'
                                : 'text-slate-400 dark:text-slate-500'
                            }`}
                          >
                            {row.leaveType}
                          </span>
                        </td>

                        {/* Total Leaves Taken (Cumulative YTD) */}
                        <td className="py-2 px-3 text-center tabular-nums font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                          {row.cumulativeTaken.toFixed(1)}d
                        </td>

                        {/* Total Remaining Leaves (Casual + Annual Left) */}
                        <td className="py-2 px-3 text-center tabular-nums font-semibold text-[#0284C7] dark:text-[#38BDF8]">
                          {row.totalRemainingAfter.toFixed(1)}d
                          <span className="block text-[10px] font-normal text-[#64748B] dark:text-[#94A3B8]">
                            (C: {row.casualRemainingAfter.toFixed(1)} / A: {row.annualRemainingAfter.toFixed(1)})
                          </span>
                        </td>

                        {/* Deductions Breakdown */}
                        <td className="py-2 px-3 tabular-nums text-[11px] text-[#45464D] dark:text-[#CBD5E1]">
                          <div className="flex items-center gap-1.5">
                            {row.fromCasual > 0 && (
                              <span className="text-[#0284C7] dark:text-[#38BDF8] font-medium">
                                -{row.fromCasual.toFixed(1)} Cas
                              </span>
                            )}
                            {row.fromAnnual > 0 && (
                              <span className="text-[#1E40AF] dark:text-[#93C5FD] font-medium">
                                -{row.fromAnnual.toFixed(1)} Ann
                              </span>
                            )}
                            {row.unpaid > 0 && (
                              <span className="text-rose-600 dark:text-rose-400 font-medium">
                                +{row.unpaid.toFixed(1)} Unpaid
                              </span>
                            )}
                            {row.totalTaken === 0 && (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        </td>

                        {/* Status / Transition indicator */}
                        <td className="py-2 px-3">
                          {isExhaustionMonth && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-full">
                              <Zap className="w-2.5 h-2.5" />
                              Casual Exhausted → Annual
                            </span>
                          )}
                          {!isExhaustionMonth && isExhaustedPost && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#1E40AF] bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 dark:text-[#93C5FD] px-2 py-0.5 rounded-full">
                              Annual Used
                            </span>
                          )}
                          {!isExhaustionMonth && !isExhaustedPost && row.fromCasual > 0 && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium text-[#0284C7] bg-[#E0F2FE] dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8] px-2 py-0.5 rounded-full">
                              Casual Used
                            </span>
                          )}
                          {row.totalTaken === 0 && (
                            <span className="text-[11px] text-[#94A3B8]">0 days</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Leave Entries / Reason Log Section */}
        <div className="px-6 py-3">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Detailed Absence Log & Remarks
            </span>
            <button
              type="button"
              onClick={() => setShowAddEntry(!showAddEntry)}
              className="text-xs font-medium text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
            >
              <Plus className="w-3 h-3" />
              <span>{showAddEntry ? 'Cancel' : 'Add Dated Reason'}</span>
            </button>
          </div>

          {showAddEntry && (
            <form onSubmit={handleAddEntry} className="mb-3 p-3 rounded-lg border border-[#CBD5E1] dark:border-[#475569] bg-[#F8FAFC] dark:bg-[#1E293B]/70 flex flex-wrap items-center gap-2">
              <input
                type="date"
                value={newEntryDate}
                onChange={(e) => setNewEntryDate(e.target.value)}
                className="h-8 px-2 text-xs bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F8FAFC]"
                required
              />
              <input
                type="number"
                min="0.5"
                max="30"
                step="0.5"
                value={newEntryDays}
                onChange={(e) => setNewEntryDays(parseFloat(e.target.value) || 1)}
                placeholder="Days"
                className="h-8 w-20 px-2 text-xs bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F8FAFC]"
                required
              />
              <input
                type="text"
                value={newEntryReason}
                onChange={(e) => setNewEntryReason(e.target.value)}
                placeholder="Reason / Note (e.g. Medical checkup)"
                className="h-8 flex-1 min-w-[150px] px-2 text-xs bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-md text-[#0F172A] dark:text-[#F8FAFC]"
                required
              />
              <button
                type="submit"
                className="h-8 px-3 bg-[#0F172A] hover:bg-[#1E293B] text-white rounded-md text-xs font-medium transition-colors"
              >
                Log Entry
              </button>
            </form>
          )}

          {entries.length > 0 ? (
            <div className="space-y-1.5 max-h-24 overflow-y-auto">
              {entries.map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-center justify-between p-2 rounded-md bg-[#F8FAFC] dark:bg-[#1E293B]/40 border border-[#E2E8F0] dark:border-[#334155] text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                      {entry.date}
                    </span>
                    <span className="text-[#64748B] dark:text-[#94A3B8]">·</span>
                    <span className="font-medium text-[#0284C7] dark:text-[#38BDF8] tabular-nums">
                      {entry.days} day(s)
                    </span>
                    <span className="text-[#64748B] dark:text-[#94A3B8]">·</span>
                    <span className="italic text-[#45464D] dark:text-[#CBD5E1]">
                      "{entry.reason}"
                    </span>
                  </div>
                  <button
                    onClick={() => handleDeleteEntry(entry.id, entry.month, entry.days)}
                    className="text-rose-500 hover:text-rose-700 p-1"
                    title="Remove entry"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-[11px] text-[#94A3B8] italic">
              No individual dated reasons logged yet. Monthly totals above are active.
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="h-9 px-3.5 text-xs font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white bg-white dark:bg-[#111827] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Unsaved</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#0F172A] dark:text-[#EAF1FF] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-5 text-xs font-medium text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Save & Update Balances</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
