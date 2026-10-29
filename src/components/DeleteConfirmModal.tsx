import React from 'react';
import { Trash2, AlertTriangle, X, ShieldAlert } from 'lucide-react';
import { Employee, getEmployeeSupervisors } from '../types/portal';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  employee: Employee | null;
  subordinateCount?: number;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  employee,
  subordinateCount = 0,
}) => {
  if (!isOpen || !employee) return null;

  const sups = getEmployeeSupervisors(employee);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#0A0D14] rounded-2xl border border-rose-200 dark:border-rose-900/60 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-rose-100 dark:border-rose-900/40 bg-rose-50/70 dark:bg-rose-950/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <Trash2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-rose-900 dark:text-rose-300 font-heading">
                Delete Employee Record
              </h3>
              <p className="text-[11px] text-rose-700/80 dark:text-rose-400/80">
                Permanent deletion confirmation
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-rose-400 hover:text-rose-700 dark:hover:text-rose-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          <div className="p-3.5 rounded-xl border border-[#CBD5E1] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A]/40 text-xs">
            <div className="flex justify-between mb-1.5">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Employee ID:</span>
              <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                {employee.id}
              </span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Full Name:</span>
              <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                {employee.name}
              </span>
            </div>
            <div className="flex justify-between mb-1.5">
              <span className="text-[#64748B] dark:text-[#94A3B8]">
                {sups.length > 1 ? 'Supervisors:' : 'Supervisor:'}
              </span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC] text-right font-medium max-w-[220px] truncate">
                {sups.length > 0 ? sups.join(', ') : 'None (Direct to Board)'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-[#64748B] dark:text-[#94A3B8]">Department:</span>
              <span className="text-[#0F172A] dark:text-[#F8FAFC]">{employee.department}</span>
            </div>
          </div>

          {subordinateCount > 0 && (
            <div className="flex items-start gap-2.5 text-xs text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 p-3 rounded-xl border border-amber-200 dark:border-amber-900/60">
              <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
              <div>
                <strong>Active Supervisor:</strong> {employee.name} is currently assigned as a supervisor for {subordinateCount} other employee(s).
                Deleting this record will cleanly unlink them from those employees without errors.
              </div>
            </div>
          )}

          <div className="flex items-start gap-2.5 text-xs text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 p-3 rounded-xl border border-rose-200 dark:border-rose-900/60">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
            <p className="leading-relaxed">
              Are you sure you want to permanently delete <strong>{employee.name}</strong>?
              All 12-month leave records, entitlement calculations, and ledger history will be permanently erased.
            </p>
          </div>

          {/* Action buttons */}
          <div className="pt-2 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => {
                onConfirm();
                onClose();
              }}
              className="h-9 px-4 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Yes, Delete Permanently</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
