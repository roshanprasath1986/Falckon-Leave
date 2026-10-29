import React, { useState } from 'react';
import { X, Users, Trash2, UserPlus, AlertCircle, CheckCircle2, ArrowRight, ShieldCheck, UserX } from 'lucide-react';
import { Employee, getEmployeeSupervisors } from '../types/portal';

interface ManageSupervisorsModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  onUpdateEmployees: (updated: Employee[]) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ManageSupervisorsModal: React.FC<ManageSupervisorsModalProps> = ({
  isOpen,
  onClose,
  employees,
  onUpdateEmployees,
  onToast,
}) => {
  const [supervisorToDelete, setSupervisorToDelete] = useState<string | null>(null);
  const [reassignTarget, setReassignTarget] = useState<string>('NONE');
  const [newSupervisorInput, setNewSupervisorInput] = useState('');

  if (!isOpen) return null;

  // Compute map of supervisor -> list of employees
  const supervisorMap = new Map<string, Employee[]>();
  employees.forEach((emp) => {
    const sups = getEmployeeSupervisors(emp);
    sups.forEach((sup) => {
      const existing = supervisorMap.get(sup) || [];
      existing.push(emp);
      supervisorMap.set(sup, existing);
    });
  });

  const allSupervisors = Array.from(supervisorMap.keys()).sort();

  // Handle Deleting a Supervisor
  const handleConfirmDeleteSupervisor = () => {
    if (!supervisorToDelete) return;
    const targetSup = supervisorToDelete;

    const updatedEmployees = employees.map((emp) => {
      const currentSups = getEmployeeSupervisors(emp);
      if (!currentSups.includes(targetSup)) return emp;

      // Filter out target supervisor
      let newSups = currentSups.filter((s) => s !== targetSup);

      // If reassignTarget is chosen and not NONE, add that
      if (reassignTarget !== 'NONE' && reassignTarget !== targetSup && !newSups.includes(reassignTarget)) {
        newSups.push(reassignTarget);
      }

      return {
        ...emp,
        supervisor: newSups.join(', '),
        supervisors: newSups,
      };
    });

    onUpdateEmployees(updatedEmployees);
    onToast(
      'success',
      'Supervisor Deleted',
      `"${targetSup}" has been permanently removed as a supervisor.${
        reassignTarget !== 'NONE' ? ` Reports reassigned to ${reassignTarget}.` : ' Affected employees set to None.'
      }`
    );

    setSupervisorToDelete(null);
    setReassignTarget('NONE');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                Manage & Delete Supervisors
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Supervisors are optional. You can delete or unlink any supervisor from the roster.
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

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Note Banner */}
          <div className="p-3.5 rounded-xl bg-[#F0F9FF] dark:bg-[#0C4A6E]/30 border border-[#BAE6FD] dark:border-[#0284C7]/40 text-xs text-[#0369A1] dark:text-[#7DD3FC] flex items-start gap-2.5">
            <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5" />
            <div>
              <strong>Designated Hierarchy Flexibility:</strong> An employee does not need a supervisor.
              Deleting a supervisor removes them from all assigned employee records without deleting the employee profiles.
            </div>
          </div>

          {/* Supervisor List Table */}
          <div className="border border-[#CBD5E1] dark:border-[#1E293B] rounded-xl overflow-hidden">
            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] px-4 py-3 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Active Supervisors ({allSupervisors.length})
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Direct Reports Assigned
              </span>
            </div>

            {allSupervisors.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                No supervisors currently assigned in the workforce. All employees report directly to the board.
              </div>
            ) : (
              <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
                {allSupervisors.map((supName) => {
                  const reports = supervisorMap.get(supName) || [];
                  const isPendingDelete = supervisorToDelete === supName;

                  return (
                    <div
                      key={supName}
                      className={`p-4 transition-colors ${
                        isPendingDelete
                          ? 'bg-rose-50 dark:bg-rose-950/30'
                          : 'hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/50'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm text-[#0F172A] dark:text-[#F8FAFC]">
                              {supName}
                            </span>
                            <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8]">
                              {reports.length} {reports.length === 1 ? 'employee' : 'employees'}
                            </span>
                          </div>

                          <div className="text-xs text-[#64748B] dark:text-[#94A3B8] mt-1 truncate max-w-md">
                            Reports:{' '}
                            {reports.length > 0
                              ? reports.map((r) => r.name).join(', ')
                              : 'None'}
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="shrink-0 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setSupervisorToDelete(supName);
                              setReassignTarget('NONE');
                            }}
                            className="h-8 px-3 text-xs font-medium text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 rounded-lg flex items-center gap-1.5 transition-colors shadow-xs"
                            title={`Delete supervisor ${supName}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>Delete Supervisor</span>
                          </button>
                        </div>
                      </div>

                      {/* Deletion Confirmation Strip */}
                      {isPendingDelete && (
                        <div className="mt-4 p-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#111827] shadow-sm space-y-3">
                          <div className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-300">
                            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                            <div>
                              Are you sure you want to delete supervisor <strong>"{supName}"</strong>?
                              {reports.length > 0 && (
                                <span className="block mt-0.5">
                                  This supervisor will be unlinked from {reports.length} employee(s).
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Reassign Option */}
                          {reports.length > 0 && (
                            <div className="flex items-center gap-3 text-xs pt-1">
                              <span className="text-[#64748B] dark:text-[#94A3B8]">Reassign reports to:</span>
                              <select
                                value={reassignTarget}
                                onChange={(e) => setReassignTarget(e.target.value)}
                                className="h-8 px-2.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0A0D14] text-xs text-[#0F172A] dark:text-[#F8FAFC]"
                              >
                                <option value="NONE">None (Leave as Top Level / Direct to Board)</option>
                                {employees.length > 0 && (
                                  <optgroup label="📋 Employees from Roster">
                                    {employees
                                      .filter((e) => e.name !== supName && !e.isArchived)
                                      .map((e) => (
                                        <option key={e.id} value={e.name}>
                                          👤 [{e.id}] {e.name} — {e.department}
                                        </option>
                                      ))}
                                  </optgroup>
                                )}
                                {allSupervisors.filter((s) => s !== supName && !employees.some((e) => e.name === s)).length > 0 && (
                                  <optgroup label="👔 Other Supervisors">
                                    {allSupervisors
                                      .filter((s) => s !== supName && !employees.some((e) => e.name === s))
                                      .map((s) => (
                                        <option key={s} value={s}>
                                          🏢 {s}
                                        </option>
                                      ))}
                                  </optgroup>
                                )}
                              </select>
                            </div>
                          )}

                          <div className="flex items-center justify-end gap-2 pt-2 border-t border-rose-100 dark:border-rose-900/40">
                            <button
                              type="button"
                              onClick={() => setSupervisorToDelete(null)}
                              className="h-7 px-3 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={handleConfirmDeleteSupervisor}
                              className="h-7 px-3.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                            >
                              <Trash2 className="w-3 h-3" />
                              <span>Yes, Confirm Delete</span>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#334155] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
