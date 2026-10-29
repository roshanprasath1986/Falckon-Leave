/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  KeyRound,
  UserPlus,
  Download,
  Search,
  Filter,
  Users,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  Archive,
  ArchiveRestore,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Sun,
  Moon,
  Zap,
  HelpCircle,
  FileSpreadsheet,
  ArrowRight,
  ShieldAlert,
  Mail,
  LogOut,
  User,
  ShieldCheck,
  Upload,
  Image as ImageIcon,
  Building,
  CheckCircle,
  Inbox
} from 'lucide-react';
import {
  Employee,
  EmployeeLeaveEntry,
  UserRole,
  getEmployeeSupervisors,
  LeaveRequest,
  DEFAULT_DEPARTMENTS
} from './types/portal';
import { INITIAL_PORTAL_EMPLOYEES } from './data/portalData';
import {
  calculateEmployeeBalances,
  exportEmployeesToCSV,
  MONTH_SHORT_NAMES,
} from './utils/leaveCalculations';
import { MonthlyBreakdownModal } from './components/MonthlyBreakdownModal';
import { AddEditEmployeeModal } from './components/AddEditEmployeeModal';
import { ChangePasswordModal } from './components/ChangePasswordModal';
import { ContactHRModal } from './components/ContactHRModal';
import { DeleteConfirmModal } from './components/DeleteConfirmModal';
import { UploadSyncModal } from './components/UploadSyncModal';
import { ExportOptionsModal } from './components/ExportOptionsModal';
import { LoginView, AuthSession } from './components/LoginView';
import { EmployeePortalView } from './components/EmployeePortalView';
import { NotificationToast, ToastMessage } from './components/NotificationToast';
import { CompanyLogo, LogoUploadModal } from './components/CompanyLogo';
import { ManageSupervisorsModal } from './components/ManageSupervisorsModal';
import { AdminResetPasswordModal } from './components/AdminResetPasswordModal';
import { ManageDepartmentsModal } from './components/ManageDepartmentsModal';
import { EmailNotificationsModal } from './components/EmailNotificationsModal';
import { LeaveApprovalsModal } from './components/LeaveApprovalsModal';
import {
  dispatchLeaveApplicationEmails,
  dispatchLeaveApprovedEmails,
  dispatchLeaveRejectedEmail,
} from './utils/emailDispatcher';

export default function App() {
  // Session Authentication State (Admin or Employee)
  const [authSession, setAuthSession] = useState<AuthSession | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leave_portal_session_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore error
        }
      }
    }
    // Default active session for instant experience: HR Administrator
    return {
      role: 'ADMIN',
      name: 'HR Administrator',
      email: 'hr-operations@company.com',
    };
  });

  // Administrator Password State (persisted in localStorage)
  const [adminPassword, setAdminPassword] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('leave_portal_admin_pass_v1') || 'admin123';
    }
    return 'admin123';
  });

  const handleUpdateAdminPassword = (newPass: string) => {
    setAdminPassword(newPass);
    localStorage.setItem('leave_portal_admin_pass_v1', newPass);
    addToast('success', 'Admin Password Updated', 'The HR Administrator login credentials have been changed.');
  };

  // State for all employees
  const [employees, setEmployees] = useState<Employee[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leave_portal_employees_v1');
      if (saved) {
        try {
          const loaded: Employee[] = JSON.parse(saved);
          const existingIds = new Set(loaded.map((e) => e.id));
          const missingInitials = INITIAL_PORTAL_EMPLOYEES.filter((e) => !existingIds.has(e.id));
          if (missingInitials.length > 0) {
            return [...missingInitials, ...loaded];
          }
          return loaded;
        } catch (e) {
          // ignore error
        }
      }
    }
    return INITIAL_PORTAL_EMPLOYEES;
  });

  // Save employees to localStorage
  useEffect(() => {
    localStorage.setItem('leave_portal_employees_v1', JSON.stringify(employees));
  }, [employees]);

  // Dynamic Departments State (persisted in localStorage)
  const [departments, setDepartments] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leave_portal_departments_v1');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        } catch (e) {
          // ignore
        }
      }
    }
    return DEFAULT_DEPARTMENTS;
  });

  useEffect(() => {
    localStorage.setItem('leave_portal_departments_v1', JSON.stringify(departments));
  }, [departments]);

  // Leave Requests state (persisted in localStorage)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('leave_portal_requests_v1');
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch (e) {
          // ignore
        }
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('leave_portal_requests_v1', JSON.stringify(leaveRequests));
  }, [leaveRequests]);

  // Save session to localStorage
  useEffect(() => {
    if (authSession) {
      localStorage.setItem('leave_portal_session_v1', JSON.stringify(authSession));
    } else {
      localStorage.removeItem('leave_portal_session_v1');
    }
  }, [authSession]);

  // View & Filter states (Admin View)
  const [showArchived, setShowArchived] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSupervisor, setSelectedSupervisor] = useState<string>('All');
  const [selectedDepartmentFilter, setSelectedDepartmentFilter] = useState<string>('All');

  // Modal states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [isAddEditOpen, setIsAddEditOpen] = useState(false);
  const [isUploadSyncOpen, setIsUploadSyncOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isManageSupervisorsOpen, setIsManageSupervisorsOpen] = useState(false);
  const [isManageDepartmentsOpen, setIsManageDepartmentsOpen] = useState(false);
  const [isEmailNotificationsOpen, setIsEmailNotificationsOpen] = useState(false);
  const [isLeaveApprovalsOpen, setIsLeaveApprovalsOpen] = useState(false);
  const [isLogoUploadOpen, setIsLogoUploadOpen] = useState(false);
  const [exportTargetEmployee, setExportTargetEmployee] = useState<Employee | null>(null);
  const [employeeToEdit, setEmployeeToEdit] = useState<Employee | null>(null);
  const [selectedBreakdownEmployee, setSelectedBreakdownEmployee] = useState<Employee | null>(null);
  const [isContactHROpen, setIsContactHROpen] = useState(false);
  const [isAdminResetPasswordOpen, setIsAdminResetPasswordOpen] = useState(false);
  const [employeeToResetPassword, setEmployeeToResetPassword] = useState<Employee | null>(null);

  // Delete confirmation modal state
  const [employeeToDelete, setEmployeeToDelete] = useState<Employee | null>(null);

  // Quick inline expanded rows (Set of employee IDs)
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set());

  // Dark mode
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('executive_theme');
      if (saved) return saved === 'dark';
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDarkMode) {
      root.classList.add('dark');
      localStorage.setItem('executive_theme', 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem('executive_theme', 'light');
    }
  }, [isDarkMode]);

  // Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (type: 'success' | 'error' | 'info', title: string, message?: string) => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Sign Out Handler
  const handleSignOut = () => {
    setAuthSession(null);
    addToast('info', 'Signed Out', 'You have been signed out of the Leave Balance Portal.');
  };

  // Login Handler
  const handleLogin = (session: AuthSession) => {
    setAuthSession(session);
    addToast(
      'success',
      'Signed In',
      `Welcome, ${session.name} (${session.role === 'ADMIN' ? 'HR Administrator' : session.employeeId}).`
    );
  };

  // Distinct supervisor list across all employees
  const supervisorList = useMemo(() => {
    const set = new Set<string>();
    employees.forEach((e) => {
      getEmployeeSupervisors(e).forEach((s) => set.add(s));
    });
    return Array.from(set).sort();
  }, [employees]);

  // Filtered employees list based on: showArchived, search, supervisor
  const filteredEmployees = useMemo(() => {
    return employees.filter((emp) => {
      if (!showArchived && emp.isArchived) return false;

      const empSups = getEmployeeSupervisors(emp);

      if (selectedSupervisor === '__NONE__') {
        if (empSups.length > 0) return false;
      } else if (selectedSupervisor !== 'All' && !empSups.includes(selectedSupervisor)) {
        return false;
      }

      if (selectedDepartmentFilter !== 'All' && emp.department !== selectedDepartmentFilter) {
        return false;
      }

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchId = emp.id.toLowerCase().includes(q);
        const matchName = emp.name.toLowerCase().includes(q);
        const matchSup = empSups.some((s) => s.toLowerCase().includes(q)) || (emp.supervisor || '').toLowerCase().includes(q);
        const matchDept = (emp.department || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchSup && !matchDept) return false;
      }

      return true;
    });
  }, [employees, showArchived, selectedSupervisor, selectedDepartmentFilter, searchQuery]);

  // Subordinate count for pending employee deletion
  const subordinateCountForDelete = useMemo(() => {
    if (!employeeToDelete) return 0;
    return employees.filter((e) => {
      if (e.id === employeeToDelete.id) return false;
      const sups = getEmployeeSupervisors(e);
      return sups.includes(employeeToDelete.name) || sups.includes(employeeToDelete.id);
    }).length;
  }, [employeeToDelete, employees]);

  // Aggregate stats across active employees
  const aggregateStats = useMemo(() => {
    const active = employees.filter((e) => !e.isArchived);
    let totalAnnualEntitled = 0;
    let totalAnnualRemaining = 0;
    let totalCasualEntitled = 0;
    let totalCasualRemaining = 0;
    let totalLeavesTaken = 0;
    let casualExhaustedCount = 0;

    active.forEach((emp) => {
      totalAnnualEntitled += emp.annualEntitled;
      totalCasualEntitled += emp.casualEntitled;

      const calc = calculateEmployeeBalances(
        emp.annualEntitled,
        emp.casualEntitled,
        emp.monthlyLeaves
      );

      totalAnnualRemaining += calc.annualRemaining;
      totalCasualRemaining += calc.casualRemaining;
      totalLeavesTaken += calc.totalTaken;

      if (calc.casualRemaining === 0 && calc.totalCasualTaken >= emp.casualEntitled) {
        casualExhaustedCount += 1;
      }
    });

    return {
      activeCount: active.length,
      archivedCount: employees.length - active.length,
      totalAnnualEntitled,
      totalAnnualRemaining,
      totalCasualEntitled,
      totalCasualRemaining,
      totalLeavesTaken,
      casualExhaustedCount,
    };
  }, [employees]);

  // Pending Leave Count across workforce
  const pendingLeaveCount = useMemo(
    () => leaveRequests.filter((r) => r.status === 'PENDING').length,
    [leaveRequests]
  );

  // Employee creation & editing
  const handleSaveEmployee = (
    empData: Omit<Employee, 'monthlyLeaves' | 'leaveEntries' | 'joinedDate'>
  ) => {
    if (employeeToEdit) {
      setEmployees((prev) =>
        prev.map((e) => (e.id === empData.id ? { ...e, ...empData } : e))
      );
      addToast('success', 'Employee Record Updated', `Saved profile for ${empData.name}.`);
    } else {
      const newEmployee: Employee = {
        ...empData,
        monthlyLeaves: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
        leaveEntries: [],
        joinedDate: new Date().toISOString().split('T')[0],
      };
      setEmployees((prev) => [newEmployee, ...prev]);
      addToast('success', 'New Employee Added', `Created ${newEmployee.id} (${newEmployee.name}).`);
    }
    setEmployeeToEdit(null);
  };

  const handleToggleArchive = (emp: Employee) => {
    const updatedStatus = !emp.isArchived;
    setEmployees((prev) =>
      prev.map((e) => (e.id === emp.id ? { ...e, isArchived: updatedStatus } : e))
    );
    addToast(
      'info',
      updatedStatus ? 'Employee Archived' : 'Employee Restored',
      `${emp.name} is now ${updatedStatus ? 'archived' : 'active'}.`
    );
  };

  // Safe delete handler - cleanly unlinks any supervisor references from remaining employees
  const handleConfirmDelete = () => {
    if (!employeeToDelete) return;
    const targetId = employeeToDelete.id;
    const targetName = employeeToDelete.name;

    setEmployees((prev) =>
      prev
        .filter((e) => e.id !== targetId)
        .map((e) => {
          const currentSups = getEmployeeSupervisors(e);
          if (currentSups.includes(targetName) || currentSups.includes(targetId)) {
            const updatedSups = currentSups.filter((s) => s !== targetName && s !== targetId);
            return {
              ...e,
              supervisor: updatedSups.join(', '),
              supervisors: updatedSups,
            };
          }
          return e;
        })
    );
    setEmployeeToDelete(null);
    addToast(
      'info',
      'Employee Deleted',
      `Permanently deleted ${targetName} (${targetId}). Any supervisor assignments safely unlinked.`
    );
  };

  const handleSaveMonthlyLeaves = (
    employeeId: string,
    updatedMonthlyLeaves: Record<number, number>,
    updatedEntries: EmployeeLeaveEntry[]
  ) => {
    setEmployees((prev) =>
      prev.map((e) =>
        e.id === employeeId
          ? { ...e, monthlyLeaves: updatedMonthlyLeaves, leaveEntries: updatedEntries }
          : e
      )
    );
    addToast('success', 'Monthly Balances Recalculated', 'Casual and Annual balances updated.');
  };

  const handleUpdatePassword = (employeeId: string, newPass: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, password: newPass } : e))
    );
    addToast('success', 'Password Changed', `Credentials for employee ${employeeId} updated.`);
  };

  const handleOpenResetPasswordForEmployee = (emp: Employee) => {
    setEmployeeToResetPassword(emp);
    setIsAdminResetPasswordOpen(true);
  };

  const handleAdminResetEmployeePassword = (employeeId: string, newPass: string) => {
    setEmployees((prev) =>
      prev.map((e) => (e.id === employeeId ? { ...e, password: newPass } : e))
    );
    addToast(
      'success',
      'Password Reset Complete',
      `Portal password for employee ${employeeId} has been successfully updated.`
    );
  };

  // Manage Departments Handler
  const handleUpdateDepartments = (newDepts: string[], updatedEmployees?: Employee[]) => {
    setDepartments(newDepts);
    if (updatedEmployees) {
      setEmployees(updatedEmployees);
    }
  };

  // Employee files a leave application (status: PENDING, emails dispatched)
  const handleApplyLeaveRequest = (
    requestData: Omit<LeaveRequest, 'id' | 'submittedAt' | 'status'>
  ) => {
    const now = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    const newReq: LeaveRequest = {
      ...requestData,
      id: `req-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      status: 'PENDING',
      submittedAt: now,
    };

    setLeaveRequests((prev) => [newReq, ...prev]);
    dispatchLeaveApplicationEmails(newReq, employees);
    addToast(
      'info',
      'Leave Request Filed',
      `Application for ${newReq.employeeName} (${newReq.days} days) submitted. Supervisor and HR notified via email.`
    );
  };

  // Supervisor or HR Admin approves leave request (status: APPROVED, allocation into monthlyLeaves, confirmation email)
  const handleApproveLeave = (
    request: LeaveRequest,
    reviewerName: string,
    reviewerRole: 'HR_ADMIN' | 'SUPERVISOR',
    notes?: string
  ) => {
    const now = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    // 1. Update request status
    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? {
              ...r,
              status: 'APPROVED',
              reviewedAt: now,
              reviewedBy: reviewerName,
              reviewerRole,
              reviewNotes: notes,
            }
          : r
      )
    );

    // 2. Allocate leave days into the employee's monthlyLeaves ledger
    const targetEmp = employees.find((e) => e.id === request.employeeId);
    if (targetEmp) {
      const m = request.month;
      const currentMonthTaken = targetEmp.monthlyLeaves[m] || 0;
      const updatedMonthly = {
        ...targetEmp.monthlyLeaves,
        [m]: currentMonthTaken + request.days,
      };
      const newEntry: EmployeeLeaveEntry = {
        id: `le-${Date.now()}`,
        date: request.date,
        month: m,
        days: request.days,
        reason: request.reason,
        type: 'Auto-Deducted',
        createdAt: new Date().toISOString(),
      };
      const updatedEntries = [newEntry, ...(targetEmp.leaveEntries || [])];
      setEmployees((prev) =>
        prev.map((e) =>
          e.id === targetEmp.id
            ? { ...e, monthlyLeaves: updatedMonthly, leaveEntries: updatedEntries }
            : e
        )
      );
    }

    // 3. Dispatch automated approval confirmation email to Employee and HR
    dispatchLeaveApprovedEmails(request, reviewerName, reviewerRole, notes);

    addToast(
      'success',
      'Leave Approved & Allocated',
      `Leave for ${request.employeeName} (${request.days} days) approved by ${reviewerName}. Statutory balance debited.`
    );
  };

  // Supervisor or HR Admin rejects leave request
  const handleRejectLeave = (
    request: LeaveRequest,
    reviewerName: string,
    reviewerRole: 'HR_ADMIN' | 'SUPERVISOR',
    notes?: string
  ) => {
    const now = new Date().toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });

    setLeaveRequests((prev) =>
      prev.map((r) =>
        r.id === request.id
          ? {
              ...r,
              status: 'REJECTED',
              reviewedAt: now,
              reviewedBy: reviewerName,
              reviewerRole,
              reviewNotes: notes,
            }
          : r
      )
    );

    dispatchLeaveRejectedEmail(request, reviewerName, reviewerRole, notes);

    addToast(
      'info',
      'Leave Request Not Approved',
      `Leave request for ${request.employeeName} was marked as rejected. Employee notified via email.`
    );
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const handleExportCSV = (targetEmp?: Employee | null) => {
    setExportTargetEmployee(targetEmp || null);
    setIsExportModalOpen(true);
  };

  // Synchronize workforce state after CSV upload
  const handleConfirmSync = (updatedEmployees: Employee[], countUpdated: number, countAdded: number) => {
    setEmployees(updatedEmployees);
    addToast(
      'success',
      'Workforce Synced',
      `Synchronized ${countUpdated} existing employee record(s) and registered ${countAdded} new profile(s).`
    );
  };

  // Find logged in employee object
  const loggedInEmployee = useMemo(() => {
    if (!authSession || authSession.role !== 'EMPLOYEE') return null;
    return employees.find((e) => e.id === authSession.employeeId) || null;
  }, [authSession, employees]);

  // If no session, show clean Login View
  if (!authSession) {
    return (
      <>
        <LoginView
          onLogin={handleLogin}
          employees={employees}
          currentAdminPassword={adminPassword}
          onOpenChangePassword={() => setIsChangePasswordOpen(true)}
        />
        {/* Modals available from login view */}
        <ChangePasswordModal
          isOpen={isChangePasswordOpen}
          onClose={() => setIsChangePasswordOpen(false)}
          employees={employees}
          currentUserId="ADMIN"
          adminPassword={adminPassword}
          isAdminUser={true}
          onUpdateAdminPassword={handleUpdateAdminPassword}
          onUpdatePassword={handleUpdatePassword}
        />
        <NotificationToast toasts={toasts} onDismiss={removeToast} />
      </>
    );
  }

  return (
    <div className="relative min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#F8FAFC] font-sans transition-colors duration-150 overflow-x-hidden">
      {/* Atmospheric Company Logo Watermark Backdrop */}
      <div className="fixed inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0 select-none">
        <div className="opacity-[0.035] dark:opacity-[0.05] transform -rotate-12 scale-150 transition-opacity">
          <CompanyLogo className="w-[650px] h-[650px] text-[#0F172A] dark:text-[#38BDF8]" watermark />
        </div>
      </div>

      {/* Top Application Bar */}
      <header className="relative z-30 sticky top-0 bg-white/95 dark:bg-[#0A0D14]/95 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#1E293B] px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-4">
        {/* Brand Title with Company Logo */}
        <div className="flex items-center gap-3">
          <CompanyLogo className="w-8 h-8 rounded-xl shadow-xs" />
          <div>
            <h1 className="text-base sm:text-lg font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading leading-tight">
              Leave Balance Portal
            </h1>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
              Statutory Annual & Casual Leave Management System (FY2026)
            </p>
          </div>
        </div>

        {/* Right Tools: User badge, Sign Out, CSV, Dark mode, Company Logo */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* User Session Badge */}
          <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#F1F5F9] dark:bg-[#0F172A] border border-[#CBD5E1] dark:border-[#1E293B]">
            {authSession.role === 'ADMIN' ? (
              <ShieldCheck className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            ) : (
              <User className="w-4 h-4 text-[#0284C7] dark:text-[#38BDF8]" />
            )}
            <div className="text-left text-xs">
              <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] block leading-none">
                {authSession.name}
              </span>
              <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8]">
                {authSession.role === 'ADMIN' ? 'HR Administrator' : authSession.employeeId}
              </span>
            </div>
          </div>

          {/* SIGN OUT BUTTON for Admin and Employees */}
          <button
            onClick={handleSignOut}
            className="h-9 px-3 text-xs font-semibold text-rose-700 dark:text-rose-400 hover:text-rose-800 bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-900/60 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Sign out of your account"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>

          {/* Leave Approvals Authorization Desk (Admin) */}
          {authSession.role === 'ADMIN' && (
            <button
              onClick={() => setIsLeaveApprovalsOpen(true)}
              className="h-9 px-2.5 sm:px-3 text-xs font-semibold border border-amber-300 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 hover:bg-amber-100 rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
              title="Review, approve, or reject employee leave requests"
            >
              <CheckCircle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              <span className="hidden sm:inline">Leave Approvals</span>
              {pendingLeaveCount > 0 && (
                <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-500 text-white font-bold animate-pulse">
                  {pendingLeaveCount}
                </span>
              )}
            </button>
          )}

          {/* Email Notifications Center */}
          <button
            onClick={() => setIsEmailNotificationsOpen(true)}
            className="h-9 px-2.5 sm:px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#0A0D14] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Inspect simulated email notifications dispatched to Supervisor, HR Admin, and Employees"
          >
            <Mail className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
            <span className="hidden md:inline">Email Logs</span>
          </button>

          {/* Company Logo Upload / Customization Button */}
          <button
            onClick={() => setIsLogoUploadOpen(true)}
            className="h-9 px-2.5 sm:px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#0A0D14] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
            title="Upload organization logo to appear behind the app and in header"
          >
            <ImageIcon className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
            <span className="hidden md:inline">Company Logo</span>
          </button>

          {/* Export & Upload Sync CSV (Visible in Admin mode) */}
          {authSession.role === 'ADMIN' && (
            <>
              <button
                onClick={() => setIsUploadSyncOpen(true)}
                className="h-9 px-2.5 sm:px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#0A0D14] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                title="Upload exported CSV to sync leave records and workforce updates"
              >
                <Upload className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                <span className="hidden lg:inline">Upload & Sync CSV</span>
              </button>
              <button
                onClick={() => handleExportCSV(null)}
                className="h-9 px-2.5 sm:px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#0A0D14] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                title="Export leave records to CSV (Simplified or Full format)"
              >
                <Download className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                <span className="hidden sm:inline">Export CSV</span>
              </button>
            </>
          )}

          {/* Theme Toggle */}
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="w-9 h-9 flex items-center justify-center rounded-xl border border-[#CBD5E1] dark:border-[#1E293B] bg-white dark:bg-[#0A0D14] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
            title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
        {/* If logged in as an Employee, render the dedicated Employee Portal View */}
        {authSession.role === 'EMPLOYEE' && loggedInEmployee ? (
          <EmployeePortalView
            employee={loggedInEmployee}
            allEmployees={employees}
            leaveRequests={leaveRequests}
            onApplyLeaveRequest={handleApplyLeaveRequest}
            onApproveLeave={handleApproveLeave}
            onRejectLeave={handleRejectLeave}
            onOpenEmailNotifications={() => setIsEmailNotificationsOpen(true)}
            onSelectEmployeeBreakdown={(emp) => setSelectedBreakdownEmployee(emp)}
            onUpdateMonthlyLeaves={handleSaveMonthlyLeaves}
            onOpenChangePassword={() => setIsChangePasswordOpen(true)}
            onOpenContactHR={() => setIsContactHROpen(true)}
            onOpenExport={handleExportCSV}
            onSignOut={handleSignOut}
            onSwitchToAdmin={() => {
              setAuthSession({
                role: 'ADMIN',
                name: `${loggedInEmployee.name} (Delegated Admin)`,
                email: loggedInEmployee.email,
              });
              addToast('success', 'Admin Privileges Activated', 'Switched to HR Administrator view with full access.');
            }}
          />
        ) : (
          /* HR Administrator View */
          <>
            {/* Top Action Bar (Change password, [ ] Show archived employees, + Add Employee) */}
            <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] p-4 shadow-sm flex flex-wrap items-center justify-between gap-4">
              {/* Left Actions: Change password & Show archived employees */}
              <div className="flex flex-wrap items-center gap-4 sm:gap-6">
                {/* Change Password Button */}
                <button
                  onClick={() => setIsChangePasswordOpen(true)}
                  className="h-9 px-3.5 text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl flex items-center gap-2 border border-[#CBD5E1] dark:border-[#334155] transition-colors"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                  <span>Change password</span>
                </button>

                {/* [ ] Show archived employees */}
                <label className="flex items-center gap-2.5 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={showArchived}
                    onChange={(e) => setShowArchived(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-[#0284C7] focus:ring-[#0284C7]"
                  />
                  <span>Show archived employees ({aggregateStats.archivedCount})</span>
                </label>
              </div>

              {/* Right Filters & Add Employee */}
              <div className="flex flex-wrap items-center gap-2.5">
                {/* Search Input */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search ID, name, supervisor..."
                    className="h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#0284C7] focus:ring-1 focus:ring-[#0284C7]"
                  />
                </div>

                {/* Supervisor Filter (Supervisor is optional, can filter by None) */}
                <select
                  value={selectedSupervisor}
                  onChange={(e) => setSelectedSupervisor(e.target.value)}
                  className="h-9 px-3 text-xs bg-[#F8FAFC] dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="All">All Supervisors</option>
                  <option value="__NONE__">None (No Supervisor Assigned)</option>
                  {supervisorList.map((sup) => (
                    <option key={sup} value={sup}>
                      {sup}
                    </option>
                  ))}
                </select>

                {/* Department Filter */}
                <select
                  value={selectedDepartmentFilter}
                  onChange={(e) => setSelectedDepartmentFilter(e.target.value)}
                  className="h-9 px-3 text-xs bg-[#F8FAFC] dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-xl text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                >
                  <option value="All">All Departments</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                </select>

                {/* Manage Departments Button */}
                <button
                  type="button"
                  onClick={() => setIsManageDepartmentsOpen(true)}
                  className="h-9 px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Add, rename, or delete organization departments with employee reassignment"
                >
                  <Building className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                  <span>Departments</span>
                </button>

                {/* Manage Supervisors Button (Delete & Manage) */}
                <button
                  type="button"
                  onClick={() => setIsManageSupervisorsOpen(true)}
                  className="h-9 px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Manage, view direct reports, and delete supervisors"
                >
                  <Users className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                  <span>Manage Supervisors</span>
                </button>

                {/* Reset Employee Password Button */}
                <button
                  type="button"
                  onClick={() => {
                    setEmployeeToResetPassword(null);
                    setIsAdminResetPasswordOpen(true);
                  }}
                  className="h-9 px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] hover:bg-slate-50 dark:hover:bg-[#1E293B] rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                  title="Reset or assign portal login password for any employee"
                >
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>Reset Employee Pass</span>
                </button>

                {/* + Add Employee */}
                <button
                  onClick={() => {
                    setEmployeeToEdit(null);
                    setIsAddEditOpen(true);
                  }}
                  className="h-9 px-3.5 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors"
                >
                  <UserPlus className="w-3.5 h-3.5 text-[#38BDF8]" />
                  <span>Add Employee</span>
                </button>
              </div>
            </div>

            {/* Informative Guidance Banner matching Claude's prompt:
                "Enter the total leaves taken in each month. Casual is used first; once Casual runs out, the rest is taken from Annual automatically." */}
            <div className="bg-[#EFF4FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-[#1E3A8A] rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#0F172A] text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
                  <Zap className="w-4 h-4 text-[#38BDF8]" />
                </div>
                <div>
                  <h2 className="text-xs sm:text-sm font-bold text-[#1E3A8A] dark:text-[#93C5FD]">
                    Automatic Deduction Rules & Sequence
                  </h2>
                  <p className="text-xs text-[#1E40AF] dark:text-[#BFDBFE] mt-0.5 leading-relaxed">
                    Enter the total leaves taken in each month. <strong>Casual is used first;</strong> once Casual runs out, the rest is taken from <strong>Annual automatically.</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] font-semibold text-[#1E40AF] dark:text-[#93C5FD] bg-white/80 dark:bg-[#111827]/80 px-3 py-1.5 rounded-xl border border-[#BFDBFE]/60 dark:border-[#1E3A8A]/60 shrink-0 self-start md:self-auto">
                <span>Casual (1st)</span>
                <ArrowRight className="w-3 h-3 text-[#0284C7]" />
                <span>Annual (2nd)</span>
                <ArrowRight className="w-3 h-3 text-[#0284C7]" />
                <span className="text-rose-600 dark:text-rose-400">Unpaid (Excess)</span>
              </div>
            </div>

            {/* Aggregate KPI Summary Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
              {/* Active Employees */}
              <div className="bg-white dark:bg-[#0A0D14] rounded-2xl p-4 border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Active Personnel
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-heading tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                    {aggregateStats.activeCount}
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    employees
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  {aggregateStats.archivedCount} archived accounts
                </div>
              </div>

              {/* Annual Leave Pool */}
              <div className="bg-white dark:bg-[#0A0D14] rounded-2xl p-4 border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Total Annual Available
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-heading tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                    {aggregateStats.totalAnnualRemaining.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    / {aggregateStats.totalAnnualEntitled} days
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[#0284C7] dark:text-[#38BDF8] font-semibold">
                  {(
                    (aggregateStats.totalAnnualRemaining /
                      Math.max(1, aggregateStats.totalAnnualEntitled)) *
                    100
                  ).toFixed(0)}
                  % pool remaining
                </div>
              </div>

              {/* Casual Leave Pool */}
              <div className="bg-white dark:bg-[#0A0D14] rounded-2xl p-4 border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Total Casual Available
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-heading tabular-nums text-[#0284C7] dark:text-[#38BDF8]">
                    {aggregateStats.totalCasualRemaining.toFixed(1)}
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    / {aggregateStats.totalCasualEntitled} days
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Priority pool (deducted 1st)
                </div>
              </div>

              {/* Casual Exhaustion Count */}
              <div className="bg-white dark:bg-[#0A0D14] rounded-2xl p-4 border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] block mb-1">
                  Casual Exhausted
                </span>
                <div className="flex items-baseline gap-1.5">
                  <span className="text-2xl font-bold font-heading tabular-nums text-amber-600 dark:text-amber-400">
                    {aggregateStats.casualExhaustedCount}
                  </span>
                  <span className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                    employees
                  </span>
                </div>
                <div className="mt-1 text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                  Currently consuming Annual
                </div>
              </div>
            </div>

            {/* Main Employee Ledger Table
                Matches exact layout requested:
                | ID | Name | Annual | Casual | Supervisor | Actions | */}
            <div className="bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-sm overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="h-11 bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#1E293B] text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] select-none">
                      <th className="py-2.5 px-4 w-28">ID</th>
                      <th className="py-2.5 px-4">Name</th>
                      <th className="py-2.5 px-4 w-44">Annual</th>
                      <th className="py-2.5 px-4 w-44">Casual</th>
                      <th className="py-2.5 px-4">Supervisor</th>
                      <th className="py-2.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B] text-xs">
                    {filteredEmployees.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-12 text-center text-[#64748B] dark:text-[#94A3B8]">
                          No employees match the current filters.
                        </td>
                      </tr>
                    ) : (
                      filteredEmployees.map((emp) => {
                        const calc = calculateEmployeeBalances(
                          emp.annualEntitled,
                          emp.casualEntitled,
                          emp.monthlyLeaves
                        );

                        const isExpanded = expandedRows.has(emp.id);
                        const annualUsedPercent = Math.min(
                          100,
                          Math.round((calc.totalAnnualTaken / Math.max(1, emp.annualEntitled)) * 100)
                        );
                        const casualUsedPercent = Math.min(
                          100,
                          Math.round((calc.totalCasualTaken / Math.max(1, emp.casualEntitled)) * 100)
                        );

                        const isCasualExhausted = calc.casualRemaining === 0 && emp.casualEntitled > 0;

                        return (
                          <React.Fragment key={emp.id}>
                            <tr
                              className={`hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/50 transition-colors ${
                                emp.isArchived ? 'opacity-60 bg-slate-50/50 dark:bg-slate-900/30' : ''
                              }`}
                            >
                              {/* ID Column */}
                              <td className="py-3 px-4 font-mono font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                                <div className="flex items-center gap-1.5">
                                  <span>{emp.id}</span>
                                  {emp.isArchived && (
                                    <span className="text-[10px] px-1 rounded bg-slate-200 dark:bg-slate-700 text-[#64748B]">
                                      Archived
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Name Column */}
                              <td className="py-3 px-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                                      {emp.name}
                                    </span>
                                    {emp.hasAdminRights && (
                                      <span
                                        className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.5 rounded-full border border-amber-300 dark:border-amber-800"
                                        title="Granted Administrator rights by HR"
                                      >
                                        <ShieldCheck className="w-2.5 h-2.5 text-amber-600 dark:text-amber-400" />
                                        Admin
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center gap-1.5 mt-0.5">
                                    <span>{emp.department || 'General'}</span>
                                    {emp.email && (
                                      <>
                                        <span>·</span>
                                        <span className="truncate max-w-[150px]">{emp.email}</span>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </td>

                              {/* Annual Column: Shows Remaining / Entitled with visual progress */}
                              <td className="py-3 px-4">
                                <div>
                                  <div className="flex items-baseline justify-between mb-1">
                                    <span className="text-xs font-bold tabular-nums text-[#0F172A] dark:text-[#F8FAFC]">
                                      {calc.annualRemaining.toFixed(1)}{' '}
                                      <span className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8]">
                                        / {emp.annualEntitled} left
                                      </span>
                                    </span>
                                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                                      {calc.totalAnnualTaken.toFixed(1)} used
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-[#F1F5F9] dark:bg-[#1E293B] rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-[#1E40AF] dark:bg-[#60A5FA] rounded-full transition-all duration-300"
                                      style={{ width: `${annualUsedPercent}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Casual Column: Shows Remaining / Entitled, plus Exhausted pill */}
                              <td className="py-3 px-4">
                                <div>
                                  <div className="flex items-baseline justify-between mb-1">
                                    <span className="text-xs font-bold tabular-nums text-[#0284C7] dark:text-[#38BDF8]">
                                      {calc.casualRemaining.toFixed(1)}{' '}
                                      <span className="text-[11px] font-normal text-[#64748B] dark:text-[#94A3B8]">
                                        / {emp.casualEntitled} left
                                      </span>
                                    </span>
                                    <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
                                      {calc.totalCasualTaken.toFixed(1)} used
                                    </span>
                                  </div>
                                  <div className="h-1.5 w-full bg-[#F1F5F9] dark:bg-[#1E293B] rounded-full overflow-hidden mb-1">
                                    <div
                                      className={`h-full rounded-full transition-all duration-300 ${
                                        isCasualExhausted ? 'bg-amber-500' : 'bg-[#0284C7]'
                                      }`}
                                      style={{ width: `${casualUsedPercent}%` }}
                                    />
                                  </div>
                                  {isCasualExhausted && (
                                    <span className="inline-flex items-center gap-0.5 text-[9px] font-semibold text-amber-800 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-1.5 py-0.2 rounded-full">
                                      Exhausted (Using Annual)
                                    </span>
                                  )}
                                </div>
                              </td>

                              {/* Supervisor Column: Supports multiple supervisors, optional empty */}
                              <td className="py-3 px-4 text-[#45464D] dark:text-[#CBD5E1]">
                                {(() => {
                                  const sups = getEmployeeSupervisors(emp);
                                  if (sups.length === 0) {
                                    return (
                                      <span className="text-xs text-[#64748B] dark:text-[#94A3B8] italic">
                                        None (Direct to Board)
                                      </span>
                                    );
                                  }
                                  if (sups.length === 1) {
                                    return (
                                      <div className="flex items-center gap-2">
                                        <span className="w-6 h-6 rounded-full bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center font-bold text-[10px] shrink-0">
                                          {sups[0].charAt(0)}
                                        </span>
                                        <span className="font-medium truncate max-w-[150px]">{sups[0]}</span>
                                      </div>
                                    );
                                  }
                                  return (
                                    <div className="space-y-0.5">
                                      <div className="flex items-center gap-1.5">
                                        <span className="w-6 h-6 rounded-full bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center font-bold text-[10px] shrink-0">
                                          {sups[0].charAt(0)}
                                        </span>
                                        <span className="font-medium truncate max-w-[125px]">{sups[0]}</span>
                                        <span
                                          className="text-[10px] font-semibold text-[#0284C7] bg-[#E0F2FE] dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8] px-1.5 py-0.2 rounded-full cursor-help shrink-0"
                                          title={`All supervisors: ${sups.join(', ')}`}
                                        >
                                          +{sups.length - 1} more
                                        </span>
                                      </div>
                                      <div className="text-[10px] text-[#64748B] dark:text-[#94A3B8] truncate max-w-[170px] pl-7">
                                        {sups.slice(1).join(', ')}
                                      </div>
                                    </div>
                                  );
                                })()}
                              </td>

                              {/* Actions Column: Monthly Breakdown, Expand, Edit, Archive, and DELETE */}
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {/* Open Monthly Breakdown Modal */}
                                  <button
                                    onClick={() => setSelectedBreakdownEmployee(emp)}
                                    className="h-8 px-2.5 bg-[#0284C7] hover:bg-[#0369A1] text-white text-xs font-semibold rounded-lg flex items-center gap-1 transition-colors shadow-xs"
                                    title="Open 12-month leave consumption ledger"
                                  >
                                    <Calendar className="w-3.5 h-3.5" />
                                    <span>Monthly Breakdown</span>
                                  </button>

                                  {/* Toggle quick inline 12-month view */}
                                  <button
                                    onClick={() => toggleRowExpansion(emp.id)}
                                    className="p-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                                    title={isExpanded ? 'Collapse 12-month row' : 'Quick preview 12-month row'}
                                  >
                                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                                  </button>

                                  {/* Edit Employee */}
                                  <button
                                    onClick={() => {
                                      setEmployeeToEdit(emp);
                                      setIsAddEditOpen(true);
                                    }}
                                    className="p-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                                    title="Edit employee profile"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Admin Reset Password */}
                                  <button
                                    onClick={() => handleOpenResetPasswordForEmployee(emp)}
                                    className="p-1.5 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50/50 dark:bg-amber-950/30 text-amber-600 hover:text-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/50 transition-colors"
                                    title={`Reset login password for ${emp.name} (${emp.id})`}
                                  >
                                    <KeyRound className="w-3.5 h-3.5" />
                                  </button>

                                  {/* Archive / Restore */}
                                  <button
                                    onClick={() => handleToggleArchive(emp)}
                                    className="p-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
                                    title={emp.isArchived ? 'Restore employee' : 'Archive employee'}
                                  >
                                    {emp.isArchived ? (
                                      <ArchiveRestore className="w-3.5 h-3.5 text-[#0284C7]" />
                                    ) : (
                                      <Archive className="w-3.5 h-3.5" />
                                    )}
                                  </button>

                                  {/* DELETE EMPLOYEE BUTTON (Safe with unlinking & confirmation) */}
                                  <button
                                    onClick={() => setEmployeeToDelete(emp)}
                                    className="p-1.5 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50/50 dark:bg-rose-950/30 text-rose-600 hover:text-rose-700 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors"
                                    title={`Delete ${emp.name} permanently`}
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>

                            {/* Inline Expanded 12-Month Quick Strip */}
                            {isExpanded && (
                              <tr className="bg-[#F8FAFC] dark:bg-[#0F172A]/70 border-b border-[#E2E8F0] dark:border-[#1E293B]">
                                <td colSpan={6} className="py-3 px-6">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="text-[11px] font-bold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                                      2026 Monthly Leaves Taken (Jan – Dec)
                                    </div>
                                    <button
                                      onClick={() => setSelectedBreakdownEmployee(emp)}
                                      className="text-xs font-semibold text-[#0284C7] dark:text-[#38BDF8] hover:underline self-start sm:self-auto"
                                    >
                                      Edit Monthly Breakdown Table →
                                    </button>
                                  </div>

                                  <div className="grid grid-cols-6 sm:grid-cols-12 gap-1.5 mt-2">
                                    {calc.monthlyBreakdown.map((row) => (
                                      <div
                                        key={row.month}
                                        className={`p-1.5 rounded-lg text-center border text-xs ${
                                          row.totalTaken > 0
                                            ? 'bg-white dark:bg-[#111827] border-[#0284C7] text-[#0F172A] dark:text-[#F8FAFC]'
                                            : 'bg-white/40 dark:bg-[#111827]/40 border-slate-200 dark:border-slate-800 text-slate-400'
                                        }`}
                                      >
                                        <div className="text-[10px] text-[#64748B] uppercase">
                                          {MONTH_SHORT_NAMES[row.month]}
                                        </div>
                                        <div className="font-bold tabular-nums">
                                          {row.totalTaken}d
                                        </div>
                                        <div className="text-[9px] text-[#0284C7] dark:text-[#38BDF8]">
                                          {row.totalRemainingAfter}d left
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </main>

      {/* ======================================================== */}
      {/* MODALS SECTION */}
      {/* ======================================================== */}

      {/* 1. Monthly Breakdown Modal */}
      <MonthlyBreakdownModal
        isOpen={!!selectedBreakdownEmployee}
        employee={selectedBreakdownEmployee}
        onClose={() => setSelectedBreakdownEmployee(null)}
        onSave={handleSaveMonthlyLeaves}
        onOpenExport={handleExportCSV}
      />

      {/* 2. Add / Edit Employee Modal with in-modal delete option */}
      <AddEditEmployeeModal
        isOpen={isAddEditOpen}
        onClose={() => setIsAddEditOpen(false)}
        onSave={handleSaveEmployee}
        onDelete={(empId) => {
          const emp = employees.find((e) => e.id === empId);
          if (emp) setEmployeeToDelete(emp);
        }}
        employeeToEdit={employeeToEdit}
        employees={employees}
        departments={departments}
        supervisors={supervisorList}
      />

      {/* Admin Reset Password for Employees Modal */}
      <AdminResetPasswordModal
        isOpen={isAdminResetPasswordOpen}
        onClose={() => {
          setIsAdminResetPasswordOpen(false);
          setEmployeeToResetPassword(null);
        }}
        employees={employees}
        initialEmployeeId={employeeToResetPassword?.id}
        onResetPassword={handleAdminResetEmployeePassword}
      />

      {/* 3. Change Password Modal (Supports Admin & Employees) */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
        employees={employees}
        currentUserId={authSession ? (authSession.role === 'ADMIN' ? 'ADMIN' : authSession.employeeId) : 'ADMIN'}
        adminPassword={adminPassword}
        isAdminUser={authSession?.role === 'ADMIN'}
        onUpdateAdminPassword={handleUpdateAdminPassword}
        onUpdatePassword={handleUpdatePassword}
      />

      {/* 4. Contact HR Modal */}
      <ContactHRModal
        isOpen={isContactHROpen}
        onClose={() => setIsContactHROpen(false)}
        employees={employees}
        currentUserId={authSession.employeeId}
      />

      {/* 5. Delete Confirmation Modal (In-app, no window.confirm) */}
      <DeleteConfirmModal
        isOpen={!!employeeToDelete}
        employee={employeeToDelete}
        subordinateCount={subordinateCountForDelete}
        onClose={() => setEmployeeToDelete(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* 6. Upload & Sync CSV Modal */}
      <UploadSyncModal
        isOpen={isUploadSyncOpen}
        onClose={() => setIsUploadSyncOpen(false)}
        currentEmployees={employees}
        onConfirmSync={handleConfirmSync}
      />

      {/* 7. Export Options Modal (Simplified or Full) */}
      <ExportOptionsModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        employees={filteredEmployees}
        selectedEmployee={exportTargetEmployee}
      />

      {/* 8. Manage & Delete Supervisors Modal */}
      <ManageSupervisorsModal
        isOpen={isManageSupervisorsOpen}
        onClose={() => setIsManageSupervisorsOpen(false)}
        employees={employees}
        onUpdateEmployees={(updated) => {
          setEmployees(updated);
        }}
        onToast={addToast}
      />

      {/* 9. Manage Departments Modal (Add/Delete/Rename) */}
      <ManageDepartmentsModal
        isOpen={isManageDepartmentsOpen}
        onClose={() => setIsManageDepartmentsOpen(false)}
        departments={departments}
        employees={employees}
        onUpdateDepartments={handleUpdateDepartments}
        onToast={addToast}
      />

      {/* 10. Email Notifications Center Modal */}
      <EmailNotificationsModal
        isOpen={isEmailNotificationsOpen}
        onClose={() => setIsEmailNotificationsOpen(false)}
        currentUserEmail={authSession.role === 'ADMIN' ? 'hr-operations@company.com' : authSession.email}
        isAdmin={authSession.role === 'ADMIN'}
      />

      {/* 11. Leave Approvals Desk Modal (Universal HR & Supervisor Authority) */}
      <LeaveApprovalsModal
        isOpen={isLeaveApprovalsOpen}
        onClose={() => setIsLeaveApprovalsOpen(false)}
        leaveRequests={leaveRequests}
        employees={employees}
        reviewerName={authSession.name}
        reviewerRole={authSession.role === 'ADMIN' ? 'HR_ADMIN' : 'SUPERVISOR'}
        supervisorEmployeeId={authSession.role === 'EMPLOYEE' ? authSession.employeeId : undefined}
        onApproveLeave={handleApproveLeave}
        onRejectLeave={handleRejectLeave}
      />

      {/* 12. Company Logo Customization & Upload Modal */}
      <LogoUploadModal
        isOpen={isLogoUploadOpen}
        onClose={() => setIsLogoUploadOpen(false)}
        onLogoUpdated={() => {
          addToast('success', 'Company Logo Updated', 'Organization logo applied across the backdrop watermark and header.');
        }}
      />

      {/* Notifications */}
      <NotificationToast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}
