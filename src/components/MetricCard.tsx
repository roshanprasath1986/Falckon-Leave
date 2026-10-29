import React from 'react';
import { LeaveBalance } from '../types/leave';
import { Palmtree, Sun, HeartPulse, Clock, BookOpen, AlertCircle } from 'lucide-react';

interface MetricCardProps {
  balance: LeaveBalance;
  onClick?: () => void;
  isSelected?: boolean;
}

export const MetricCard: React.FC<MetricCardProps> = ({ balance, onClick, isSelected }) => {
  const available = Math.max(0, balance.accruedToDate - balance.used - balance.pending);
  const usedPercent = Math.min(100, Math.round((balance.used / balance.totalAllocated) * 100));
  const pendingPercent = Math.min(100 - usedPercent, Math.round((balance.pending / balance.totalAllocated) * 100));

  const renderIcon = () => {
    const props = { className: "w-4 h-4 text-[#0D9488] dark:text-[#2DD4BF]" };
    switch (balance.icon) {
      case 'Palmtree':
        return <Palmtree {...props} />;
      case 'Sun':
        return <Sun {...props} />;
      case 'HeartPulse':
        return <HeartPulse {...props} />;
      case 'Clock':
        return <Clock {...props} />;
      case 'BookOpen':
      default:
        return <BookOpen {...props} />;
    }
  };

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white dark:bg-[#111827] rounded-xl p-5 border transition-all duration-200 cursor-pointer ${
        isSelected
          ? 'border-[#0D9488] dark:border-[#0D9488] ring-2 ring-[#0D9488]/20 shadow-md'
          : 'border-[#E2E8F0] dark:border-[#334155] hover:border-[#CBD5E1] dark:hover:border-[#475569] shadow-[0px_1px_3px_rgba(15,23,42,0.04),0px_4px_12px_rgba(15,23,42,0.02)]'
      }`}
    >
      {/* Top Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#EFF4FF] dark:bg-[#1E293B] flex items-center justify-center shrink-0">
            {renderIcon()}
          </div>
          <span className="text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
            {balance.type}
          </span>
        </div>
        {balance.expiresOn && (
          <span className="text-[11px] text-[#64748B] dark:text-[#94A3B8] font-medium flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
            Exp: {balance.expiresOn}
          </span>
        )}
      </div>

      {/* Numerical Counter */}
      <div className="flex items-baseline justify-between mb-3">
        <div className="flex items-baseline gap-1.5">
          <span className="stat-counter text-[#0F172A] dark:text-[#F8FAFC]">
            {available.toFixed(1)}
          </span>
          <span className="text-xs font-medium text-[#64748B] dark:text-[#94A3B8]">
            / {balance.totalAllocated.toFixed(1)} days left
          </span>
        </div>

        {balance.pending > 0 && (
          <span className="text-xs font-medium text-amber-600 dark:text-amber-400 tabular-nums">
            {balance.pending.toFixed(1)}d pending
          </span>
        )}
      </div>

      {/* Progress Track */}
      <div className="space-y-1.5">
        <div className="h-2 w-full bg-[#F1F5F9] dark:bg-[#1E293B] rounded-full overflow-hidden flex">
          {/* Used Bar */}
          <div
            className="h-full bg-[#0D9488] transition-all duration-300"
            style={{ width: `${usedPercent}%` }}
            title={`Used: ${balance.used} days`}
          />
          {/* Pending Bar */}
          <div
            className="h-full bg-amber-400 dark:bg-amber-500 transition-all duration-300"
            style={{ width: `${pendingPercent}%` }}
            title={`Pending: ${balance.pending} days`}
          />
        </div>

        {/* Breakdown Text */}
        <div className="flex items-center justify-between text-[11px] text-[#64748B] dark:text-[#94A3B8] tabular-nums">
          <div className="flex items-center gap-3">
            <span>
              <strong className="font-semibold text-[#0B1C30] dark:text-[#EAF1FF]">{balance.used.toFixed(1)}</strong> used
            </span>
            <span>
              <strong className="font-semibold text-[#0B1C30] dark:text-[#EAF1FF]">{balance.accruedToDate.toFixed(1)}</strong> accrued
            </span>
          </div>
          {balance.carryOver > 0 && (
            <span>+{balance.carryOver.toFixed(1)} carry-over</span>
          )}
        </div>
      </div>
    </div>
  );
};
