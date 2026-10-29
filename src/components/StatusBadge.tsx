import React from 'react';
import { LeaveStatus } from '../types/leave';

interface StatusBadgeProps {
  status: LeaveStatus;
  size?: 'sm' | 'md';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const getStyles = () => {
    switch (status) {
      case 'Approved':
        return 'bg-[#ECFDF5] text-[#065F46] dark:bg-[#064E3B]/40 dark:text-[#6EE7B7] border border-[#A7F3D0]/60 dark:border-[#065F46]/60';
      case 'Pending':
        return 'bg-[#FFFBEB] text-[#92400E] dark:bg-[#78350F]/40 dark:text-[#FCD34D] border border-[#FDE68A]/60 dark:border-[#92400E]/60';
      case 'Rejected':
        return 'bg-[#FEF2F2] text-[#991B1B] dark:bg-[#7F1D1D]/40 dark:text-[#FCA5A5] border border-[#FECACA]/60 dark:border-[#991B1B]/60';
      case 'Cancelled':
      default:
        return 'bg-[#F1F5F9] text-[#64748B] dark:bg-[#1E293B] dark:text-[#94A3B8] border border-[#E2E8F0] dark:border-[#334155]';
    }
  };

  const getDot = () => {
    switch (status) {
      case 'Approved':
        return 'bg-[#0D9488] dark:bg-[#34D399]';
      case 'Pending':
        return 'bg-[#D97706] dark:bg-[#FBBF24]';
      case 'Rejected':
        return 'bg-[#DC2626] dark:bg-[#F87171]';
      case 'Cancelled':
      default:
        return 'bg-[#94A3B8]';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium rounded-full ${
        size === 'sm' ? 'h-5 px-2 text-[11px]' : 'h-6 px-2.5 text-xs'
      } ${getStyles()} transition-colors`}
      style={{ letterSpacing: '0.02em' }}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${getDot()} shrink-0`} />
      {status}
    </span>
  );
};
