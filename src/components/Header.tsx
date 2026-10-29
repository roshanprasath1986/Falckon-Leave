import React from 'react';
import { Menu, Plus, Sun, Moon, Calendar, Download, Search, CheckCircle2 } from 'lucide-react';
import { NavTab } from './Sidebar';

interface HeaderProps {
  activeTab: NavTab;
  onOpenRequestModal: () => void;
  onOpenMobileSidebar: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onExportLedger: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onOpenRequestModal,
  onOpenMobileSidebar,
  isDarkMode,
  onToggleDarkMode,
  onExportLedger,
  searchQuery,
  onSearchChange,
}) => {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview':
        return { title: 'Executive Command Center', subtitle: 'Workforce availability, balance ledgers, and operational oversight' };
      case 'requests':
        return { title: 'Approvals & Submissions', subtitle: 'Executive review workflow, conflict warnings, and delegation status' };
      case 'ledger':
        return { title: 'Enterprise Leave Ledger', subtitle: 'Comprehensive audit history and statutory compliance records' };
      case 'calendar':
        return { title: 'Team Coverage Matrix', subtitle: 'Cross-functional availability radar and statutory holiday roster' };
      case 'policy':
        return { title: 'Statutory Policies & Accrual', subtitle: 'Accrual formulas, maximum rollover limits, and compliance rules' };
    }
  };

  const { title, subtitle } = getTabTitle();

  return (
    <header className="sticky top-0 z-20 h-16 bg-[#FFFFFF]/90 dark:bg-[#111827]/90 backdrop-blur-md border-b border-[#E2E8F0] dark:border-[#334155] px-4 sm:px-6 flex items-center justify-between gap-4">
      {/* Left side: Hamburger (mobile) + Titles */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onOpenMobileSidebar}
          className="lg:hidden p-2 rounded-lg text-[#64748B] hover:text-[#0B1C30] hover:bg-[#F1F5F9] dark:hover:bg-[#1E293B]"
          aria-label="Open navigation menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="min-w-0">
          <h1 className="text-base sm:text-lg font-semibold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading truncate leading-snug">
            {title}
          </h1>
          <p className="hidden md:block text-xs text-[#64748B] dark:text-[#94A3B8] truncate">
            {subtitle}
          </p>
        </div>
      </div>

      {/* Right side: Search, Theme Toggle, Export, Request Time Off button */}
      <div className="flex items-center gap-2 sm:gap-3 shrink-0">
        {/* Search Input (condensed on smaller screens) */}
        <div className="relative hidden sm:block w-48 md:w-64">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search records, names..."
            className="w-full h-9 pl-9 pr-3 text-xs bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-[#0F172A] dark:text-[#F8FAFC] placeholder-[#94A3B8] focus:outline-none focus:border-[#0D9488] focus:ring-1 focus:ring-[#0D9488]"
          />
        </div>

        {/* Export CSV button */}
        <button
          onClick={onExportLedger}
          title="Export records to CSV"
          className="h-9 px-2.5 sm:px-3 text-xs font-medium border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-[#EAF1FF] hover:bg-[#F1F5F9] dark:hover:bg-[#334155] rounded-lg flex items-center gap-1.5 transition-colors"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Export</span>
        </button>

        {/* Dark/Light mode toggle */}
        <button
          onClick={onToggleDarkMode}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#1E293B] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle theme"
        >
          {isDarkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>

        {/* Primary Action Button: Emerald-Teal "Request Time Off" */}
        <button
          onClick={onOpenRequestModal}
          className="h-9 sm:h-10 px-3 sm:px-4 bg-[#0D9488] hover:bg-[#0F766E] text-white text-xs sm:text-sm font-medium rounded-lg flex items-center gap-1.5 sm:gap-2 shadow-xs transition-colors focus:outline-none focus:ring-2 focus:ring-[#0D9488]/30"
        >
          <Plus className="w-4 h-4" />
          <span>Request Leave</span>
        </button>
      </div>
    </header>
  );
};
