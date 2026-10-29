import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, CheckCircle2, Zap, Users, User } from 'lucide-react';
import { Employee } from '../types/portal';
import { exportEmployeesToCSV, ExportFormatType } from '../utils/leaveCalculations';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  selectedEmployee?: Employee | null;
}

export const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({
  isOpen,
  onClose,
  employees,
  selectedEmployee,
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormatType>('simplified_rows');
  const [exportScope, setExportScope] = useState<'all' | 'single'>(selectedEmployee ? 'single' : 'all');

  if (!isOpen) return null;

  const targetEmployees =
    exportScope === 'single' && selectedEmployee
      ? [selectedEmployee]
      : employees.filter((e) => !e.isArchived);

  const handleExport = () => {
    exportEmployeesToCSV(targetEmployees, 2026, selectedFormat);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                Export Leave Records to CSV
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Select your preferred export layout and column configuration
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {/* Scope Selector if opened with specific employee available */}
          {selectedEmployee && (
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
                Export Scope
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setExportScope('all')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                    exportScope === 'all'
                      ? 'border-[#0284C7] bg-[#E0F2FE]/40 dark:bg-[#1E3A8A]/30 text-[#0F172A] dark:text-[#F8FAFC] font-semibold'
                      : 'border-[#CBD5E1] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <span>All Active Employees ({employees.filter((e) => !e.isArchived).length})</span>
                  {exportScope === 'all' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />}
                </button>
                <button
                  type="button"
                  onClick={() => setExportScope('single')}
                  className={`p-2.5 rounded-xl border text-left text-xs transition-colors flex items-center justify-between ${
                    exportScope === 'single'
                      ? 'border-[#0284C7] bg-[#E0F2FE]/40 dark:bg-[#1E3A8A]/30 text-[#0F172A] dark:text-[#F8FAFC] font-semibold'
                      : 'border-[#CBD5E1] dark:border-[#1E293B] text-[#64748B] dark:text-[#94A3B8]'
                  }`}
                >
                  <span className="truncate">{selectedEmployee.name}</span>
                  {exportScope === 'single' && <CheckCircle2 className="w-3.5 h-3.5 text-[#0284C7]" />}
                </button>
              </div>
            </div>
          )}

          {/* Format Options */}
          <div>
            <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-2">
              Select CSV Format
            </label>
            <div className="space-y-2.5">
              {/* Option 1: Simplified Monthly Rows (Requested by User) */}
              <label
                onClick={() => setSelectedFormat('simplified_rows')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  selectedFormat === 'simplified_rows'
                    ? 'border-[#0284C7] bg-[#E0F2FE]/40 dark:bg-[#1E3A8A]/30 text-[#0F172A] dark:text-[#F8FAFC]'
                    : 'border-[#CBD5E1] dark:border-[#1E293B] bg-white dark:bg-[#0A0D14] text-[#64748B] dark:text-[#94A3B8] hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value="simplified_rows"
                  checked={selectedFormat === 'simplified_rows'}
                  onChange={() => setSelectedFormat('simplified_rows')}
                  className="mt-0.5 text-[#0284C7] focus:ring-[#0284C7]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Month & Remaining Balances (Simplified)
                    </span>
                    <span className="text-[10px] font-semibold px-2 py-0.2 rounded-full bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8]">
                      Recommended
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    Includes <strong>only Month, Leaves Taken, and Remaining</strong> without type of leave column. Clean row-by-month log for streamlined review.
                  </p>
                  <div className="text-[10px] font-mono text-[#0284C7] dark:text-[#38BDF8] bg-white dark:bg-[#111827] px-2 py-1 rounded border border-[#CBD5E1]/60 dark:border-[#334155]/60 inline-block mt-1">
                    Columns: Employee ID, Name, Month, Leaves Taken, Total Remaining Leaves
                  </div>
                </div>
              </label>

              {/* Option 2: Simplified Monthly Grid */}
              <label
                onClick={() => setSelectedFormat('simplified_grid')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  selectedFormat === 'simplified_grid'
                    ? 'border-[#0284C7] bg-[#E0F2FE]/40 dark:bg-[#1E3A8A]/30 text-[#0F172A] dark:text-[#F8FAFC]'
                    : 'border-[#CBD5E1] dark:border-[#1E293B] bg-white dark:bg-[#0A0D14] text-[#64748B] dark:text-[#94A3B8] hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value="simplified_grid"
                  checked={selectedFormat === 'simplified_grid'}
                  onChange={() => setSelectedFormat('simplified_grid')}
                  className="mt-0.5 text-[#0284C7] focus:ring-[#0284C7]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      12-Month Grid Summary (Taken & Remaining)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    One row per employee with Jan–Dec columns for leaves taken and remaining balance for each month.
                  </p>
                  <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#111827] px-2 py-1 rounded border border-[#CBD5E1]/60 dark:border-[#334155]/60 inline-block mt-1">
                    Columns: ID, Name, Jan Taken, Jan Remaining, ... Total Taken, Total Remaining
                  </div>
                </div>
              </label>

              {/* Option 3: Full Statutory Ledger */}
              <label
                onClick={() => setSelectedFormat('full')}
                className={`p-3.5 rounded-xl border flex items-start gap-3 cursor-pointer transition-colors ${
                  selectedFormat === 'full'
                    ? 'border-[#0284C7] bg-[#E0F2FE]/40 dark:bg-[#1E3A8A]/30 text-[#0F172A] dark:text-[#F8FAFC]'
                    : 'border-[#CBD5E1] dark:border-[#1E293B] bg-white dark:bg-[#0A0D14] text-[#64748B] dark:text-[#94A3B8] hover:border-slate-300'
                }`}
              >
                <input
                  type="radio"
                  name="exportFormat"
                  value="full"
                  checked={selectedFormat === 'full'}
                  onChange={() => setSelectedFormat('full')}
                  className="mt-0.5 text-[#0284C7] focus:ring-[#0284C7]"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                      Full Statutory Ledger (Complete Metadata)
                    </span>
                  </div>
                  <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-relaxed">
                    Complete workforce file including all employee profiles, emails, departments, supervisors, entitlement pools, admin rights, and statuses.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Sync Compatibility Note */}
          <div className="p-3 rounded-xl bg-[#EFF4FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-[#1E3A8A] text-xs text-[#1E40AF] dark:text-[#93C5FD] flex items-center gap-2">
            <Zap className="w-4 h-4 text-[#0284C7] shrink-0" />
            <span>
              Both the simplified format and full ledger can be uploaded and synced anytime. Leaves are automatically allocated in the sequence: <strong>Casual (1st) ➔ Annual (2nd) ➔ Unpaid</strong>.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleExport}
            className="h-9 px-5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Download className="w-3.5 h-3.5 text-[#38BDF8]" />
            <span>Download CSV ({targetEmployees.length} {targetEmployees.length === 1 ? 'employee' : 'employees'})</span>
          </button>
        </div>
      </div>
    </div>
  );
};
