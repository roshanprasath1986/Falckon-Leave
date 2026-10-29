import React, { useState } from 'react';
import {
  X,
  Building,
  Plus,
  Trash2,
  Edit2,
  Check,
  AlertCircle,
  Users,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { Employee } from '../types/portal';

interface ManageDepartmentsModalProps {
  isOpen: boolean;
  onClose: () => void;
  departments: string[];
  employees: Employee[];
  onUpdateDepartments: (departments: string[], updatedEmployees?: Employee[]) => void;
  onToast: (type: 'success' | 'error' | 'info', title: string, message?: string) => void;
}

export const ManageDepartmentsModal: React.FC<ManageDepartmentsModalProps> = ({
  isOpen,
  onClose,
  departments,
  employees,
  onUpdateDepartments,
  onToast,
}) => {
  const [newDeptInput, setNewDeptInput] = useState('');
  const [editingDept, setEditingDept] = useState<string | null>(null);
  const [editingDeptName, setEditingDeptName] = useState('');

  // Deletion with reassignment state
  const [deptToDelete, setDeptToDelete] = useState<string | null>(null);
  const [reassignTargetDept, setReassignTargetDept] = useState<string>('');

  if (!isOpen) return null;

  // Compute employee count per department
  const deptCounts = departments.reduce<Record<string, number>>((acc, dept) => {
    acc[dept] = employees.filter((e) => e.department === dept && !e.isArchived).length;
    return acc;
  }, {});

  const handleAddDepartment = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newDeptInput.trim();
    if (!trimmed) return;

    if (departments.some((d) => d.toLowerCase() === trimmed.toLowerCase())) {
      onToast('error', 'Duplicate Department', `Department "${trimmed}" already exists.`);
      return;
    }

    const updated = [...departments, trimmed];
    onUpdateDepartments(updated);
    setNewDeptInput('');
    onToast('success', 'Department Added', `Created new department "${trimmed}".`);
  };

  const handleStartEdit = (dept: string) => {
    setEditingDept(dept);
    setEditingDeptName(dept);
  };

  const handleSaveEdit = (dept: string) => {
    const trimmed = editingDeptName.trim();
    if (!trimmed || trimmed === dept) {
      setEditingDept(null);
      return;
    }

    if (
      departments.some(
        (d) => d.toLowerCase() === trimmed.toLowerCase() && d.toLowerCase() !== dept.toLowerCase()
      )
    ) {
      onToast('error', 'Duplicate Name', `Department "${trimmed}" already exists.`);
      return;
    }

    const updatedDepartments = departments.map((d) => (d === dept ? trimmed : d));
    // Also update any employees who belonged to this department
    const updatedEmployees = employees.map((e) =>
      e.department === dept ? { ...e, department: trimmed } : e
    );

    onUpdateDepartments(updatedDepartments, updatedEmployees);
    setEditingDept(null);
    onToast('success', 'Department Renamed', `Renamed "${dept}" to "${trimmed}".`);
  };

  const handleStartDelete = (dept: string) => {
    const count = deptCounts[dept] || 0;
    const remainingDepts = departments.filter((d) => d !== dept);

    if (departments.length <= 1) {
      onToast('error', 'Cannot Delete', 'You must maintain at least one department.');
      return;
    }

    if (count === 0) {
      // Safe instant delete
      const updated = departments.filter((d) => d !== dept);
      onUpdateDepartments(updated);
      onToast('success', 'Department Deleted', `Removed empty department "${dept}".`);
    } else {
      // Needs reassignment
      setDeptToDelete(dept);
      setReassignTargetDept(remainingDepts[0] || '');
    }
  };

  const handleConfirmReassignAndDelete = () => {
    if (!deptToDelete || !reassignTargetDept) return;

    const updatedDepartments = departments.filter((d) => d !== deptToDelete);
    const updatedEmployees = employees.map((e) =>
      e.department === deptToDelete ? { ...e, department: reassignTargetDept } : e
    );

    onUpdateDepartments(updatedDepartments, updatedEmployees);
    onToast(
      'success',
      'Department Deleted',
      `Deleted "${deptToDelete}". Reassigned ${deptCounts[deptToDelete]} employee(s) to "${reassignTargetDept}".`
    );

    setDeptToDelete(null);
    setReassignTargetDept('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-xl bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-2xl overflow-hidden flex flex-col max-h-[88vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <Building className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                Manage Departments
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Add, rename, or delete organization departments with employee reassignment
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
          {/* Add Department Input */}
          <form onSubmit={handleAddDepartment} className="flex gap-2">
            <div className="relative flex-1">
              <input
                type="text"
                required
                value={newDeptInput}
                onChange={(e) => setNewDeptInput(e.target.value)}
                placeholder="Enter new department name (e.g. Research & Development)..."
                className="w-full h-10 px-3.5 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
              />
            </div>
            <button
              type="submit"
              className="h-10 px-4 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
            >
              <Plus className="w-4 h-4 text-[#38BDF8]" />
              <span>Add Department</span>
            </button>
          </form>

          {/* Department List */}
          <div className="border border-[#CBD5E1] dark:border-[#1E293B] rounded-xl overflow-hidden">
            <div className="bg-[#F8FAFC] dark:bg-[#0F172A] px-4 py-3 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                Organization Departments ({departments.length})
              </span>
              <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Active Staff
              </span>
            </div>

            <div className="divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
              {departments.map((dept) => {
                const isEditing = editingDept === dept;
                const count = deptCounts[dept] || 0;
                const isPendingDelete = deptToDelete === dept;

                return (
                  <div
                    key={dept}
                    className={`p-3.5 transition-colors ${
                      isPendingDelete
                        ? 'bg-rose-50 dark:bg-rose-950/30'
                        : 'hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      {isEditing ? (
                        <div className="flex items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={editingDeptName}
                            onChange={(e) => setEditingDeptName(e.target.value)}
                            className="flex-1 h-8 px-2.5 bg-white dark:bg-[#111827] border border-[#0284C7] rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none"
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveEdit(dept);
                              if (e.key === 'Escape') setEditingDept(null);
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => handleSaveEdit(dept)}
                            className="h-8 px-2.5 bg-[#0284C7] text-white rounded-lg text-xs font-semibold hover:bg-[#0369A1] transition-colors"
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingDept(null)}
                            className="h-8 px-2 text-xs text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="font-semibold text-xs text-[#0F172A] dark:text-[#F8FAFC] truncate">
                            {dept}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] shrink-0">
                            {count} {count === 1 ? 'employee' : 'employees'}
                          </span>
                        </div>
                      )}

                      {!isEditing && (
                        <div className="flex items-center gap-1.5 shrink-0">
                          {/* Rename */}
                          <button
                            type="button"
                            onClick={() => handleStartEdit(dept)}
                            className="p-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white transition-colors"
                            title={`Rename ${dept}`}
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            type="button"
                            onClick={() => handleStartDelete(dept)}
                            className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 text-rose-600 hover:text-white hover:bg-rose-600 dark:hover:bg-rose-600 transition-colors"
                            title={`Delete ${dept}`}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>

                    {/* Deletion Warning & Reassignment Prompt */}
                    {isPendingDelete && (
                      <div className="mt-3 p-3.5 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-white dark:bg-[#111827] shadow-sm space-y-2.5">
                        <div className="flex items-start gap-2 text-xs text-rose-700 dark:text-rose-400">
                          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                          <div>
                            <strong>"{dept}"</strong> currently has {count} active employee(s).
                            To delete this department, please select which department they should be reassigned to:
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1">
                          <span className="text-xs text-[#64748B] dark:text-[#94A3B8] shrink-0">
                            Reassign to:
                          </span>
                          <select
                            value={reassignTargetDept}
                            onChange={(e) => setReassignTargetDept(e.target.value)}
                            className="flex-1 h-8 px-2.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-white dark:bg-[#0A0D14] text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]"
                          >
                            {departments
                              .filter((d) => d !== dept)
                              .map((d) => (
                                <option key={d} value={d}>
                                  {d} ({deptCounts[d] || 0} employees)
                                </option>
                              ))}
                          </select>
                        </div>

                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-rose-100 dark:border-rose-900/40">
                          <button
                            type="button"
                            onClick={() => setDeptToDelete(null)}
                            className="h-7 px-3 text-xs text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            onClick={handleConfirmReassignAndDelete}
                            className="h-7 px-3.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-colors flex items-center gap-1 shadow-xs"
                          >
                            <Trash2 className="w-3 h-3" />
                            <span>Reassign & Delete</span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-9 px-4 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
