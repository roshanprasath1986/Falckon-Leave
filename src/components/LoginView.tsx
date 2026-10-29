import React, { useState } from 'react';
import {
  ShieldCheck,
  User,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
  Zap,
  Building2,
  CheckCircle2,
  KeyRound
} from 'lucide-react';
import { Employee } from '../types/portal';
import { CompanyLogo } from './CompanyLogo';

export interface AuthSession {
  role: 'ADMIN' | 'EMPLOYEE';
  employeeId?: string;
  name: string;
  email?: string;
}

interface LoginViewProps {
  onLogin: (session: AuthSession) => void;
  employees: Employee[];
  currentAdminPassword?: string;
  onOpenChangePassword?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLogin,
  employees,
  currentAdminPassword = 'admin123',
  onOpenChangePassword,
}) => {
  const [loginMode, setLoginMode] = useState<'ADMIN' | 'EMPLOYEE'>('ADMIN');

  // Admin credentials state
  const [adminPasswordInput, setAdminPasswordInput] = useState('');

  // Employee credentials state
  const [selectedEmpId, setSelectedEmpId] = useState<string>(employees[0]?.id || '0012');
  const [empPassword, setEmpPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const selectedEmployeeObj = employees.find((x) => x.id === selectedEmpId);

  const handleAdminSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const activeAdminPassword = currentAdminPassword && currentAdminPassword.trim() !== '' ? currentAdminPassword : 'admin123';

    if (adminPasswordInput !== activeAdminPassword) {
      setError('Invalid Administrator password.');
      return;
    }

    onLogin({
      role: 'ADMIN',
      name: 'HR Administrator',
      email: 'hr-operations@company.com',
    });
  };

  const handleEmployeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const emp = employees.find((x) => x.id === selectedEmpId);
    if (!emp) {
      setError('Employee not found.');
      return;
    }

    // Active password is the custom password if set, otherwise fallback to password123
    const activeEmpPassword = emp.password && emp.password.trim() !== '' ? emp.password : 'password123';

    if (empPassword !== activeEmpPassword) {
      setError('Incorrect password for this employee account.');
      return;
    }

    onLogin({
      role: 'EMPLOYEE',
      employeeId: emp.id,
      name: emp.name,
      email: emp.email,
    });
  };

  const quickLoginAs = (emp: Employee) => {
    onLogin({
      role: 'EMPLOYEE',
      employeeId: emp.id,
      name: emp.name,
      email: emp.email,
    });
  };

  const quickLoginAdmin = () => {
    onLogin({
      role: 'ADMIN',
      name: 'HR Administrator',
      email: 'hr-operations@company.com',
    });
  };

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background Company Logo Watermark */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none">
        <div className="opacity-[0.03] dark:opacity-[0.05] transform -rotate-12 scale-150 transition-opacity">
          <CompanyLogo className="w-[600px] h-[600px] text-[#0F172A] dark:text-[#38BDF8]" watermark />
        </div>
      </div>

      <div className="relative z-10 sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="inline-flex items-center justify-center mb-3">
          <CompanyLogo className="w-12 h-12 shadow-md" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading">
          Leave Balance Portal
        </h1>
        <p className="mt-1 text-xs text-[#64748B] dark:text-[#94A3B8]">
          Sign in to access statutory leave ledgers, monthly consumption, and balances
        </p>
      </div>

      <div className="relative z-10 mt-6 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-[#0A0D14] py-6 px-6 sm:px-8 shadow-2xl border border-[#CBD5E1] dark:border-[#1E293B] rounded-2xl space-y-5">
          {/* Role selector tabs */}
          <div className="flex rounded-xl p-1 bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B]">
            <button
              type="button"
              onClick={() => {
                setLoginMode('ADMIN');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'ADMIN'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
              <span>HR Administrator</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setLoginMode('EMPLOYEE');
                setError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                loginMode === 'EMPLOYEE'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs'
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
              <span>Employee Portal</span>
            </button>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* HR Administrator Login Form */}
          {loginMode === 'ADMIN' ? (
            <form onSubmit={handleAdminSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Administrator Username
                </label>
                <input
                  type="text"
                  disabled
                  value="hr-operations@company.com"
                  className="w-full h-10 px-3 bg-slate-100 dark:bg-[#0F172A]/70 border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#64748B] dark:text-[#94A3B8] cursor-not-allowed select-none"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Admin Password
                  </label>
                  {onOpenChangePassword && (
                    <button
                      type="button"
                      onClick={onOpenChangePassword}
                      className="text-[11px] font-medium text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Change Password</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={adminPasswordInput}
                    onChange={(e) => setAdminPasswordInput(e.target.value)}
                    placeholder={currentAdminPassword && currentAdminPassword !== 'admin123' ? 'Enter your custom admin password' : 'Enter admin password (default: admin123)'}
                    className="w-full h-10 px-3 pr-10 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {currentAdminPassword && currentAdminPassword !== 'admin123' && (
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                    * Admin password was changed. Default "admin123" will not work.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Sign In as HR Administrator</span>
                <ArrowRight className="w-4 h-4 text-[#38BDF8]" />
              </button>

              <button
                type="button"
                onClick={quickLoginAdmin}
                className="w-full py-2 px-3 text-xs font-medium text-[#0284C7] dark:text-[#38BDF8] bg-[#E0F2FE]/50 dark:bg-[#1E3A8A]/30 hover:bg-[#BAE6FD]/40 rounded-xl transition-colors flex items-center justify-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5 text-[#0284C7]" />
                <span>One-Click Instant Admin Sign In</span>
              </button>
            </form>
          ) : (
            /* Employee Login Form */
            <form onSubmit={handleEmployeeSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] mb-1">
                  Select Employee Account
                </label>
                <select
                  value={selectedEmpId}
                  onChange={(e) => setSelectedEmpId(e.target.value)}
                  className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                >
                  {employees
                    .filter((e) => !e.isArchived)
                    .map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {emp.id} - {emp.name} ({emp.department})
                        {emp.hasAdminRights ? ' [HR Admin Access]' : ''}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Portal Password
                  </label>
                  {onOpenChangePassword && (
                    <button
                      type="button"
                      onClick={onOpenChangePassword}
                      className="text-[11px] font-medium text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
                    >
                      <KeyRound className="w-3 h-3" />
                      <span>Change Password</span>
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={empPassword}
                    onChange={(e) => setEmpPassword(e.target.value)}
                    placeholder={selectedEmployeeObj?.password && selectedEmployeeObj.password !== 'password123' ? 'Enter custom employee password' : 'Enter password (default: password123)'}
                    className="w-full h-10 px-3 pr-10 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {selectedEmployeeObj?.password && selectedEmployeeObj.password !== 'password123' && (
                  <p className="mt-1 text-[11px] text-amber-600 dark:text-amber-400">
                    * Password for this employee was changed. Default "password123" is disabled.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="w-full h-10 bg-[#0F172A] hover:bg-[#1E293B] text-white font-semibold text-xs rounded-xl transition-colors flex items-center justify-center gap-2 shadow-sm"
              >
                <span>Sign In to Employee Portal</span>
                <ArrowRight className="w-4 h-4 text-[#38BDF8]" />
              </button>
            </form>
          )}

          {/* Quick Roster Switcher */}
          <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-2 text-center">
              Quick Roster Access
            </span>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {employees.slice(0, 5).map((e) => (
                <button
                  key={e.id}
                  type="button"
                  onClick={() => quickLoginAs(e)}
                  className="px-2 py-1 text-[11px] rounded-lg border border-[#CBD5E1] dark:border-[#1E293B] bg-slate-50 dark:bg-[#0F172A] hover:bg-slate-100 dark:hover:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
                >
                  {e.name.split(' ')[0]} ({e.id})
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-[#64748B] dark:text-[#94A3B8]">
          Leave Balance Portal · Statutory compliance & entitlement tracking
        </p>
      </div>
    </div>
  );
};
