import React from 'react';
import {
  LayoutDashboard,
  Inbox,
  FileSpreadsheet,
  CalendarDays,
  ShieldCheck,
  Building2,
  ChevronRight,
  LogOut,
  SlidersHorizontal,
  X
} from 'lucide-react';
import { TeamMember } from '../types/leave';

export type NavTab = 'overview' | 'requests' | 'ledger' | 'calendar' | 'policy';

interface SidebarProps {
  activeTab: NavTab;
  onTabChange: (tab: NavTab) => void;
  pendingCount: number;
  currentUser: TeamMember;
  isMobileOpen: boolean;
  onMobileClose: () => void;
  role: 'executive' | 'manager' | 'employee';
  onRoleChange: (role: 'executive' | 'manager' | 'employee') => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  currentUser,
  isMobileOpen,
  onMobileClose,
  role,
  onRoleChange,
}) => {
  const navItems: { id: NavTab; label: string; icon: React.ReactNode; badge?: number }[] = [
    {
      id: 'overview',
      label: 'Executive Command',
      icon: <LayoutDashboard className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'requests',
      label: 'Approvals & Requests',
      icon: <Inbox className="w-4 h-4 shrink-0" />,
      badge: pendingCount,
    },
    {
      id: 'ledger',
      label: 'Enterprise Ledger',
      icon: <FileSpreadsheet className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'calendar',
      label: 'Team Coverage Map',
      icon: <CalendarDays className="w-4 h-4 shrink-0" />,
    },
    {
      id: 'policy',
      label: 'Statutory Policies',
      icon: <ShieldCheck className="w-4 h-4 shrink-0" />,
    },
  ];

  const sidebarContent = (
    <div className="flex flex-col h-full bg-[#FFFFFF] dark:bg-[#111827] border-r border-[#E2E8F0] dark:border-[#334155] text-[#0B1C30] dark:text-[#EAF1FF] select-none">
      {/* Brand Header */}
      <div className="h-16 px-5 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-[#0F172A] dark:bg-[#F8FAFC] text-white dark:text-[#0F172A] flex items-center justify-center font-bold tracking-tight shadow-sm">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-sm font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading leading-tight">
              Executive Leave
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium tracking-wide">
              Workforce Operations
            </div>
          </div>
        </div>

        {/* Mobile close button */}
        <button
          onClick={onMobileClose}
          className="lg:hidden p-1.5 rounded-md text-[#64748B] hover:text-[#0B1C30] dark:hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Role / Context Switcher */}
      <div className="p-3.5 mx-3 mt-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/70 border border-[#E2E8F0] dark:border-[#334155]">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            Operating Role
          </span>
          <span className="text-[10px] text-[#0D9488] dark:text-[#2DD4BF] font-medium">
            Active
          </span>
        </div>
        <select
          value={role}
          onChange={(e) => onRoleChange(e.target.value as any)}
          aria-label="Operating Role"
          className="w-full text-xs font-medium bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-md px-2.5 py-1.5 text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:ring-1 focus:ring-[#0D9488]"
        >
          <option value="executive">Executive VP (Sign-off & Self)</option>
          <option value="manager">People Manager (Team Approver)</option>
          <option value="employee">Staff Officer (Self View)</option>
        </select>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
          Operations Portal
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onTabChange(item.id);
                onMobileClose();
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-[#0F172A] text-white dark:bg-[#F8FAFC] dark:text-[#0F172A] shadow-sm'
                  : 'text-[#45464D] dark:text-[#CBD5E1] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B] hover:text-[#0B1C30] dark:hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                {item.icon}
                <span className="truncate">{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full tabular-nums ${
                    isActive
                      ? 'bg-[#0D9488] text-white'
                      : 'bg-[#FFFBEB] text-[#92400E] border border-[#FDE68A] dark:bg-[#78350F]/60 dark:text-[#FCD34D] dark:border-[#92400E]'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Calendar sync indicator banner */}
      <div className="mx-3 mb-3 p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/40">
        <div className="flex items-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
          <span className="text-[11px] font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
            Enterprise Calendar Sync
          </span>
        </div>
        <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] leading-tight">
          Approved absences mirror directly to Google Calendar & Microsoft 365.
        </p>
      </div>

      {/* User Footer Profile */}
      <div className="p-3 border-t border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827]">
        <div className="flex items-center gap-3">
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="w-9 h-9 rounded-full object-cover border border-[#E2E8F0] dark:border-[#334155]"
          />
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
              {currentUser.name}
            </div>
            <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] truncate">
              {currentUser.role}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block fixed inset-y-0 left-0 w-64 z-30">
        {sidebarContent}
      </aside>

      {/* Mobile Drawer Backdrop */}
      {isMobileOpen && (
        <div
          onClick={onMobileClose}
          className="fixed inset-0 bg-[#0F172A]/40 backdrop-blur-xs z-40 lg:hidden"
        />
      )}

      {/* Mobile Off-canvas Drawer */}
      <aside
        className={`fixed inset-y-0 left-0 w-72 z-50 transform transition-transform duration-300 ease-in-out lg:hidden ${
          isMobileOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
};
