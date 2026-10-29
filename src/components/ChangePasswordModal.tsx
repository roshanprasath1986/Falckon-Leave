import React, { useState, useEffect } from 'react';
import { X, Lock, CheckCircle2, AlertCircle, Eye, EyeOff, ShieldCheck, User } from 'lucide-react';
import { Employee } from '../types/portal';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentUserId?: string; // If 'ADMIN', or employeeId
  adminPassword?: string;
  isAdminUser?: boolean;
  onUpdateAdminPassword?: (newPass: string) => void;
  onUpdatePassword: (employeeId: string, newPass: string) => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentUserId,
  adminPassword = 'admin123',
  isAdminUser = true,
  onUpdateAdminPassword,
  onUpdatePassword,
}) => {
  if (!isOpen) return null;

  // Selected account: '__ADMIN__' for Administrator, or an employee ID
  const [selectedAccountId, setSelectedAccountId] = useState<string>(() => {
    if (currentUserId === 'ADMIN' || isAdminUser) return '__ADMIN__';
    return currentUserId || employees[0]?.id || '__ADMIN__';
  });

  const [currentPasswordInput, setCurrentPasswordInput] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Reset fields when opening modal
  useEffect(() => {
    if (currentUserId === 'ADMIN' || (isAdminUser && !currentUserId)) {
      setSelectedAccountId('__ADMIN__');
    } else if (currentUserId) {
      setSelectedAccountId(currentUserId);
    }
    setCurrentPasswordInput('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  }, [isOpen, currentUserId, isAdminUser]);

  const isChangingAdmin = selectedAccountId === '__ADMIN__';
  const targetEmp = !isChangingAdmin ? employees.find((e) => e.id === selectedAccountId) : null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Check current password
    if (isChangingAdmin) {
      const activeAdminPassword = adminPassword && adminPassword.trim() !== '' ? adminPassword : 'admin123';
      if (currentPasswordInput !== activeAdminPassword) {
        setError('Current Administrator password does not match.');
        return;
      }
    } else {
      if (!targetEmp) {
        setError('Selected employee not found.');
        return;
      }
      const activeEmpPassword = targetEmp.password && targetEmp.password.trim() !== '' ? targetEmp.password : 'password123';
      if (currentPasswordInput !== activeEmpPassword) {
        setError('Current employee password does not match.');
        return;
      }
    }

    // Check new password length
    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long.');
      return;
    }

    // Check confirmation
    if (newPassword !== confirmPassword) {
      setError('New password and confirmation do not match.');
      return;
    }

    if (isChangingAdmin) {
      if (onUpdateAdminPassword) {
        onUpdateAdminPassword(newPassword);
      }
      setSuccessMessage('Administrator password updated successfully!');
    } else if (targetEmp) {
      onUpdatePassword(targetEmp.id, newPassword);
      setSuccessMessage(`Password for ${targetEmp.name} (${targetEmp.id}) updated successfully!`);
    }

    setTimeout(() => {
      setSuccessMessage('');
      onClose();
    }, 1600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#0F172A]">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              isChangingAdmin
                ? 'bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8]'
                : 'bg-[#EFF4FF] dark:bg-[#1E293B] text-[#2563EB]'
            }`}>
              {isChangingAdmin ? <ShieldCheck className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                {isChangingAdmin ? 'Change Admin Login Password' : 'Change Employee Password'}
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Update authentication credentials for portal access
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

        {/* Success confirmation */}
        {successMessage ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#0284C7] dark:text-[#38BDF8] mx-auto animate-bounce" />
            <h4 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC]">
              Password Updated
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              {successMessage}
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Account Selector */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                Select Account to Update
              </label>
              <select
                value={selectedAccountId}
                onChange={(e) => {
                  setSelectedAccountId(e.target.value);
                  setError('');
                }}
                disabled={!isAdminUser && !!currentUserId}
                className="w-full h-10 px-3 bg-white dark:bg-[#111827] disabled:bg-slate-100 dark:disabled:bg-slate-800 border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
              >
                {isAdminUser && (
                  <option value="__ADMIN__">
                    🛡️ HR Administrator (Admin Login Account)
                  </option>
                )}
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    👤 {emp.id} — {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            {/* Current Password */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                Current {isChangingAdmin ? 'Admin' : 'Employee'} Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={currentPasswordInput}
                  onChange={(e) => setCurrentPasswordInput(e.target.value)}
                  placeholder={isChangingAdmin ? 'Enter current admin password' : 'Enter current employee password'}
                  className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                  required
                />
              </div>
            </div>

            {/* New Password */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Minimum 6 characters"
                  className="w-full h-10 px-3 pr-10 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                  required
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

            {/* Confirm New Password */}
            <div>
              <label className="block text-xs font-bold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                Confirm New Password
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                required
              />
            </div>

            {/* Buttons */}
            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#1E293B] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors shadow-sm"
              >
                {isChangingAdmin ? 'Update Admin Password' : 'Save Employee Password'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
