import React, { useState, useEffect } from 'react';
import {
  X,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  User,
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { Employee } from '../types/portal';

interface AdminResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  initialEmployeeId?: string | null;
  onResetPassword: (employeeId: string, newPassword: string) => void;
}

export const AdminResetPasswordModal: React.FC<AdminResetPasswordModalProps> = ({
  isOpen,
  onClose,
  employees,
  initialEmployeeId,
  onResetPassword,
}) => {
  if (!isOpen) return null;

  const [selectedEmpId, setSelectedEmpId] = useState<string>(() => {
    return initialEmployeeId || employees[0]?.id || '';
  });

  const [newPassword, setNewPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{
    empId: string;
    empName: string;
    passwordSet: string;
  } | null>(null);

  useEffect(() => {
    if (initialEmployeeId) {
      setSelectedEmpId(initialEmployeeId);
    } else if (employees.length > 0 && !selectedEmpId) {
      setSelectedEmpId(employees[0].id);
    }
    setNewPassword('password123');
    setCopied(false);
    setSuccessInfo(null);
  }, [isOpen, initialEmployeeId]);

  const selectedEmployee = employees.find((e) => e.id === selectedEmpId);

  const generateRandomPassword = () => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%';
    let res = 'Falcon';
    for (let i = 0; i < 4; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    res += Math.floor(10 + Math.random() * 89);
    setNewPassword(res);
  };

  const handleResetToDefault = () => {
    if (!selectedEmployee) return;
    onResetPassword(selectedEmployee.id, 'password123');
    setSuccessInfo({
      empId: selectedEmployee.id,
      empName: selectedEmployee.name,
      passwordSet: 'password123',
    });
  };

  const handleSaveCustom = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee) return;
    const trimmed = newPassword.trim();
    if (!trimmed || trimmed.length < 4) {
      alert('Password must be at least 4 characters.');
      return;
    }
    onResetPassword(selectedEmployee.id, trimmed);
    setSuccessInfo({
      empId: selectedEmployee.id,
      empName: selectedEmployee.name,
      passwordSet: trimmed,
    });
  };

  const handleCopyCredentials = () => {
    if (!successInfo) return;
    const textToCopy = `Leave Balance Portal Credentials:\nEmployee ID: ${successInfo.empId}\nName: ${successInfo.empName}\nTemporary Password: ${successInfo.passwordSet}\nPortal Login URL: ${window.location.origin}`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-lg bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                Admin Employee Password Reset
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Reset or assign new portal login credentials for any employee
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
        <div className="p-6 space-y-5">
          {successInfo ? (
            /* Success confirmation & Credential Card */
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Password Reset Successfully!
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-400 mt-0.5">
                    The portal password for <strong>{successInfo.empName}</strong> ({successInfo.empId}) has been updated. Old passwords will no longer work.
                  </p>
                </div>
              </div>

              {/* Credential summary box */}
              <div className="p-4 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#1E293B] space-y-2.5">
                <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  New Employee Login Credentials
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155]">
                    <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px]">Employee ID</span>
                    <span className="font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC] text-sm">{successInfo.empId}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155]">
                    <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px]">Employee Name</span>
                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate block">{successInfo.empName}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-white dark:bg-[#111827] border border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
                  <div>
                    <span className="text-[#64748B] dark:text-[#94A3B8] block text-[10px]">New Active Password</span>
                    <span className="font-mono font-bold text-sm text-[#0284C7] dark:text-[#38BDF8] select-all">
                      {successInfo.passwordSet}
                    </span>
                  </div>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] font-semibold">
                    {successInfo.passwordSet === 'password123' ? 'Default' : 'Custom'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyCredentials}
                  className="w-full h-9 px-3 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>Credentials Copied to Clipboard!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-[#38BDF8]" />
                      <span>Copy Credentials to Send Employee</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSuccessInfo(null)}
                  className="h-9 px-4 text-xs font-medium text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                >
                  Reset Another Password
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            /* Reset Form */
            <form onSubmit={handleSaveCustom} className="space-y-4">
              {/* Employee Selector */}
              <div>
                <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Target Employee Profile
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                >
                  {employees.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.id} — {emp.name} ({emp.department})
                      {emp.password && emp.password !== 'password123' ? ' [Custom Pass]' : ' [Default Pass]'}
                    </option>
                  ))}
                </select>
              </div>

              {/* Current Employee Status Card */}
              {selectedEmployee && (
                <div className="p-3 rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A]/60 border border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center font-bold text-xs shrink-0">
                      {selectedEmployee.name.charAt(0)}
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                        {selectedEmployee.name} ({selectedEmployee.id})
                      </div>
                      <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                        {selectedEmployee.email}
                      </div>
                    </div>
                  </div>
                  <div>
                    {selectedEmployee.password && selectedEmployee.password !== 'password123' ? (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300">
                        Custom Password
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        Default: password123
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Option A: Fast 1-Click Reset to Default */}
              <div className="p-3.5 rounded-xl border border-dashed border-[#CBD5E1] dark:border-[#334155] bg-slate-50/70 dark:bg-[#111827]/50 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Fast Reset to Standard Default
                  </div>
                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                    Sets password to company default: <code className="font-mono text-[#0284C7] dark:text-[#38BDF8]">password123</code>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="h-8 px-3 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#1E293B] hover:bg-slate-100 dark:hover:bg-slate-800 border border-[#CBD5E1] dark:border-[#334155] rounded-lg transition-colors shrink-0 shadow-xs"
                >
                  Reset to Default
                </button>
              </div>

              {/* Option B: Custom / Random Password */}
              <div className="space-y-2 pt-1">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                    Or Assign Custom / Temporary Password
                  </label>
                  <button
                    type="button"
                    onClick={generateRandomPassword}
                    className="text-[11px] font-medium text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    <span>Generate Random</span>
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new employee password"
                    className="w-full h-10 px-3 pr-10 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-mono text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                <button
                  type="button"
                  onClick={onClose}
                  className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="h-9 px-5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
                >
                  <KeyRound className="w-3.5 h-3.5" />
                  <span>Save New Password</span>
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
