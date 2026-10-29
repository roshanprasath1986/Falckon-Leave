import React, { useState, useEffect } from 'react';
import {
  X,
  UserPlus,
  UserCheck,
  Shield,
  Plus,
  Check,
  Trash2,
  Users,
  Search,
  ChevronDown
} from 'lucide-react';
import { Employee, getEmployeeSupervisors, DEFAULT_DEPARTMENTS } from '../types/portal';

interface AddEditEmployeeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (employee: Omit<Employee, 'monthlyLeaves' | 'leaveEntries' | 'joinedDate'>) => void;
  onDelete?: (employeeId: string) => void;
  employeeToEdit?: Employee | null;
  employees: Employee[];
  departments?: string[];
  supervisors?: string[];
}

export const AddEditEmployeeModal: React.FC<AddEditEmployeeModalProps> = ({
  isOpen,
  onClose,
  onSave,
  onDelete,
  employeeToEdit,
  employees,
  departments = DEFAULT_DEPARTMENTS,
  supervisors: existingRosterSupervisors = [],
}) => {
  if (!isOpen) return null;

  const departmentsList = departments.length > 0 ? departments : DEFAULT_DEPARTMENTS;

  const [id, setId] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password123');
  const [department, setDepartment] = useState(departmentsList[0] || 'Engineering');
  const [annualEntitled, setAnnualEntitled] = useState(14);
  const [casualEntitled, setCasualEntitled] = useState(7);
  const [isArchived, setIsArchived] = useState(false);
  const [hasAdminRights, setHasAdminRights] = useState(false);

  // Multiple supervisors state (Optional - can be empty)
  const [assignedSupervisors, setAssignedSupervisors] = useState<string[]>([]);
  const [selectedToAdd, setSelectedToAdd] = useState('');
  const [customSupervisorInput, setCustomSupervisorInput] = useState('');
  const [isAddingCustom, setIsAddingCustom] = useState(false);

  useEffect(() => {
    if (employeeToEdit) {
      setId(employeeToEdit.id);
      setName(employeeToEdit.name);
      setEmail(employeeToEdit.email || '');
      setPassword(employeeToEdit.password || 'password123');
      const sups = getEmployeeSupervisors(employeeToEdit);
      setAssignedSupervisors(sups);
      setDepartment(employeeToEdit.department || 'Engineering');
      setAnnualEntitled(employeeToEdit.annualEntitled);
      setCasualEntitled(employeeToEdit.casualEntitled);
      setIsArchived(employeeToEdit.isArchived);
      setHasAdminRights(employeeToEdit.hasAdminRights ?? false);
    } else {
      setId(`EMP00${Math.floor(10 + Math.random() * 89)}`);
      setName('');
      setEmail('');
      setPassword('password123');
      setAssignedSupervisors([]);
      setDepartment('Engineering');
      setAnnualEntitled(14);
      setCasualEntitled(7);
      setIsArchived(false);
      setHasAdminRights(false);
    }
    setSelectedToAdd('');
    setCustomSupervisorInput('');
    setIsAddingCustom(false);
  }, [employeeToEdit]);

  // Candidate employees from the roster excluding the current employee being added/edited
  const rosterCandidates = employees.filter(
    (e) => e.id !== id && !e.isArchived
  );

  // Add supervisor from dropdown selection
  const handleAddSupervisor = (supValue: string) => {
    if (!supValue) return;
    if (supValue === '__custom__') {
      setIsAddingCustom(true);
      return;
    }
    if (!assignedSupervisors.includes(supValue)) {
      setAssignedSupervisors([...assignedSupervisors, supValue]);
    }
    setSelectedToAdd('');
  };

  // Add custom external supervisor
  const handleAddCustomSupervisor = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customSupervisorInput.trim();
    if (trimmed && !assignedSupervisors.includes(trimmed)) {
      setAssignedSupervisors([...assignedSupervisors, trimmed]);
      setCustomSupervisorInput('');
      setIsAddingCustom(false);
      setSelectedToAdd('');
    }
  };

  // Remove supervisor
  const handleRemoveSupervisor = (supName: string) => {
    setAssignedSupervisors((prev) => prev.filter((s) => s !== supName));
  };

  // Clear all supervisors
  const handleClearAllSupervisors = () => {
    setAssignedSupervisors([]);
  };

  // Set as primary supervisor (moves to position 0)
  const handleSetPrimarySupervisor = (supName: string) => {
    const remaining = assignedSupervisors.filter((s) => s !== supName);
    setAssignedSupervisors([supName, ...remaining]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !name) return;

    const sups = assignedSupervisors;

    onSave({
      id: id.trim().toUpperCase(),
      name: name.trim(),
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@company.com`,
      password: password.trim() || 'password123',
      supervisor: sups.join(', '),
      supervisors: sups,
      department,
      annualEntitled: Math.max(0, Number(annualEntitled) || 0),
      casualEntitled: Math.max(0, Number(casualEntitled) || 0),
      isArchived,
      hasAdminRights,
    });
    onClose();
  };

  // Unassigned roster employees
  const availableRosterEmployees = rosterCandidates.filter(
    (e) => !assignedSupervisors.includes(e.name) && !assignedSupervisors.includes(e.id)
  );

  // Unassigned external/other supervisors
  const availableExternalSupervisors = existingRosterSupervisors.filter(
    (s) =>
      !assignedSupervisors.includes(s) &&
      !rosterCandidates.some((e) => e.name === s || e.id === s)
  );

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
              {employeeToEdit ? <UserCheck className="w-4 h-4" /> : <UserPlus className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                {employeeToEdit ? 'Edit Employee Record' : 'Add New Employee'}
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                ID, password credentials, supervisors from employee roster, and entitlements
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Employee ID *
              </label>
              <input
                type="text"
                required
                value={id}
                onChange={(e) => setId(e.target.value)}
                placeholder="e.g. 0012 or EMP009"
                className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Full Name *
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Employee full legal name"
                className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Employee Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="employee@company.com"
                className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                Portal Password
              </label>
              <input
                type="text"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password123"
                className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
              Department
            </label>
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
            >
              {departmentsList.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Multiple Supervisors Section with Employee List Dropdown */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#1E293B] space-y-2.5">
            <div className="flex items-center justify-between">
              <div>
                <label className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Users className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                  <span>Pick Supervisor(s) from Employee List</span>
                </label>
                <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Select one or multiple colleagues from the workforce roster as supervisors. (Optional)
                </p>
              </div>
              {assignedSupervisors.length > 0 && (
                <button
                  type="button"
                  onClick={handleClearAllSupervisors}
                  className="text-[11px] text-rose-600 dark:text-rose-400 hover:underline flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
            </div>

            {/* List of assigned supervisor pills */}
            <div className="flex flex-wrap gap-1.5 min-h-[36px] p-2 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg items-center">
              {assignedSupervisors.length === 0 ? (
                <span className="text-xs text-[#64748B] dark:text-[#94A3B8] italic px-1">
                  None assigned (Top-level staff / reports direct to Board)
                </span>
              ) : (
                assignedSupervisors.map((sup, idx) => (
                  <span
                    key={sup}
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium border ${
                      idx === 0
                        ? 'bg-[#E0F2FE] dark:bg-[#1E3A8A]/40 text-[#0284C7] dark:text-[#7DD3FC] border-[#BAE6FD] dark:border-[#0284C7]/50'
                        : 'bg-slate-100 dark:bg-slate-800 text-[#0F172A] dark:text-[#F8FAFC] border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    <span className="truncate max-w-[150px]">{sup}</span>
                    {idx === 0 && (
                      <span className="text-[9px] uppercase px-1 py-0.2 rounded bg-[#0284C7] text-white font-bold">
                        Primary
                      </span>
                    )}
                    {idx !== 0 && (
                      <button
                        type="button"
                        onClick={() => handleSetPrimarySupervisor(sup)}
                        className="text-[10px] text-[#0284C7] dark:text-[#38BDF8] hover:underline"
                        title="Set as primary supervisor"
                      >
                        Make Primary
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveSupervisor(sup)}
                      className="text-slate-400 hover:text-rose-600 p-0.5 ml-0.5"
                      title={`Remove ${sup}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))
              )}
            </div>

            {/* Controls to pick supervisor from employee roster dropdown */}
            {!isAddingCustom ? (
              <div className="space-y-1.5">
                <div className="relative">
                  <select
                    value={selectedToAdd}
                    onChange={(e) => handleAddSupervisor(e.target.value)}
                    className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                  >
                    <option value="">+ Select Supervisor from Employee Roster...</option>
                    
                    {/* Active Employees from Roster */}
                    {availableRosterEmployees.length > 0 && (
                      <optgroup label="📋 Employees from Roster">
                        {availableRosterEmployees.map((emp) => (
                          <option key={emp.id} value={emp.name}>
                            👤 [{emp.id}] {emp.name} — {emp.department}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    {/* External/Custom Existing Supervisors */}
                    {availableExternalSupervisors.length > 0 && (
                      <optgroup label="👔 Existing External Supervisors">
                        {availableExternalSupervisors.map((s) => (
                          <option key={s} value={s}>
                            🏢 {s}
                          </option>
                        ))}
                      </optgroup>
                    )}

                    <optgroup label="✨ Other">
                      <option value="__custom__">+ Enter Custom Supervisor Name...</option>
                    </optgroup>
                  </select>
                </div>
                <p className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                  Tip: You can select multiple supervisors from the dropdown one by one.
                </p>
              </div>
            ) : (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  value={customSupervisorInput}
                  onChange={(e) => setCustomSupervisorInput(e.target.value)}
                  placeholder="Enter custom supervisor full name..."
                  className="flex-1 h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                  autoFocus
                />
                <button
                  type="button"
                  onClick={handleAddCustomSupervisor}
                  className="h-9 px-3 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors"
                >
                  Add
                </button>
                <button
                  type="button"
                  onClick={() => setIsAddingCustom(false)}
                  className="h-9 px-2.5 text-xs text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Entitlements */}
          <div className="p-3.5 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A]/50 border border-[#E2E8F0] dark:border-[#1E293B] space-y-3">
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block">
              Annual & Casual Statutory Entitlements
            </span>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium">
                  Annual – entitled (days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={annualEntitled}
                  onChange={(e) => setAnnualEntitled(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                />
              </div>
              <div>
                <label className="block text-[11px] text-[#64748B] dark:text-[#94A3B8] mb-1 font-medium">
                  Casual – entitled (days)
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  value={casualEntitled}
                  onChange={(e) => setCasualEntitled(Number(e.target.value))}
                  className="w-full h-9 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                />
              </div>
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] italic">
              * Sequence: Casual leaves are consumed first; once depleted, leave automatically deducts from Annual entitlement.
            </p>
          </div>

          {/* Admin Rights & Archive Checkboxes */}
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#1E293B] space-y-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={hasAdminRights}
                onChange={(e) => setHasAdminRights(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#0284C7] focus:ring-[#0284C7] mt-0.5"
              />
              <div>
                <span className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-[#0284C7]" />
                  Grant Full HR Administrator Rights
                </span>
                <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] block">
                  Enables employee to manage workforce records, modify passwords, and sync leave CSVs.
                </span>
              </div>
            </label>

            {employeeToEdit && (
              <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                <input
                  type="checkbox"
                  checked={isArchived}
                  onChange={(e) => setIsArchived(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#0F172A] focus:ring-[#0F172A]"
                />
                <span className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  Archive this employee (hidden from main active roster)
                </span>
              </label>
            )}
          </div>

          {/* Form Actions */}
          <div className="pt-2 flex items-center justify-between border-t border-[#E2E8F0] dark:border-[#1E293B]">
            {employeeToEdit && onDelete ? (
              <button
                type="button"
                onClick={() => {
                  onDelete(employeeToEdit.id);
                  onClose();
                }}
                className="h-9 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 rounded-lg flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Record</span>
              </button>
            ) : <div />}

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
              >
                <Check className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>{employeeToEdit ? 'Save Changes' : 'Create Employee'}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
