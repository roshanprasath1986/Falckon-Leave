import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Filter,
  Users,
  Flag,
  Info
} from 'lucide-react';
import { LeaveRequest, PublicHoliday, TeamMember } from '../types/leave';
import { US_PUBLIC_HOLIDAYS_2026, formatDate } from '../utils/dateUtils';

interface CalendarViewProps {
  requests: LeaveRequest[];
  onSelectRequest: (req: LeaveRequest) => void;
  teamMembers: TeamMember[];
}

export const CalendarView: React.FC<CalendarViewProps> = ({
  requests,
  onSelectRequest,
  teamMembers,
}) => {
  // Current view: default to November 2026 (matching our active mock data period)
  const [year, setYear] = useState(2026);
  const [month, setMonth] = useState(10); // 0-indexed: 10 is November
  const [departmentFilter, setDepartmentFilter] = useState<string>('All');

  // Month navigation
  const prevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  const jumpToNov2026 = () => {
    setYear(2026);
    setMonth(10);
  };

  // Generate calendar days
  const calendarData = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const totalDays = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay(); // 0 is Sunday

    const days: {
      dateStr: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isWeekend: boolean;
      holiday?: PublicHoliday;
      leaves: LeaveRequest[];
    }[] = [];

    // Preceding empty/previous month days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const prevMonthIdx = month === 0 ? 11 : month - 1;
      const prevYear = month === 0 ? year - 1 : year;
      const mStr = String(prevMonthIdx + 1).padStart(2, '0');
      const dStr = String(dayNum).padStart(2, '0');
      const dateStr = `${prevYear}-${mStr}-${dStr}`;

      const d = new Date(prevYear, prevMonthIdx, dayNum);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      days.push({
        dateStr,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isWeekend,
        holiday: US_PUBLIC_HOLIDAYS_2026.find((h) => h.date === dateStr),
        leaves: [],
      });
    }

    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      const mStr = String(month + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      const dateStr = `${year}-${mStr}-${dStr}`;

      const d = new Date(year, month, i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;
      const holiday = US_PUBLIC_HOLIDAYS_2026.find((h) => h.date === dateStr);

      // Filter leaves active on this day
      const activeLeaves = requests.filter((r) => {
        if (departmentFilter !== 'All' && r.department !== departmentFilter) return false;
        return dateStr >= r.startDate && dateStr <= r.endDate && r.status !== 'Rejected';
      });

      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: true,
        isWeekend,
        holiday,
        leaves: activeLeaves,
      });
    }

    // Trailing days to round out 35 or 42 grid cells
    const remainingCells = 42 - days.length;
    for (let i = 1; i <= remainingCells; i++) {
      const nextMonthIdx = month === 11 ? 0 : month + 1;
      const nextYear = month === 11 ? year + 1 : year;
      const mStr = String(nextMonthIdx + 1).padStart(2, '0');
      const dStr = String(i).padStart(2, '0');
      const dateStr = `${nextYear}-${mStr}-${dStr}`;

      const d = new Date(nextYear, nextMonthIdx, i);
      const isWeekend = d.getDay() === 0 || d.getDay() === 6;

      days.push({
        dateStr,
        dayNumber: i,
        isCurrentMonth: false,
        isWeekend,
        holiday: US_PUBLIC_HOLIDAYS_2026.find((h) => h.date === dateStr),
        leaves: [],
      });
    }

    return days;
  }, [year, month, requests, departmentFilter]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  return (
    <div className="space-y-4">
      {/* Calendar Controls & Filter Toolbar */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] p-4 shadow-xs flex flex-wrap items-center justify-between gap-4">
        {/* Month selector & Stepper */}
        <div className="flex items-center gap-3">
          <div className="flex items-center border border-[#CBD5E1] dark:border-[#475569] rounded-lg overflow-hidden bg-[#F8FAFC] dark:bg-[#1E293B]">
            <button
              onClick={prevMonth}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
              title="Previous Month"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="px-3.5 py-1 text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading min-w-[140px] text-center">
              {monthNames[month]} {year}
            </span>
            <button
              onClick={nextMonth}
              className="p-2 hover:bg-slate-200 dark:hover:bg-slate-700 text-[#0F172A] dark:text-[#F8FAFC] transition-colors"
              title="Next Month"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <button
            onClick={jumpToNov2026}
            className="h-8 px-2.5 text-xs font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#64748B] dark:text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white rounded-lg transition-colors"
          >
            Today (Nov 2026)
          </button>
        </div>

        {/* Department Filter & Legend */}
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={departmentFilter}
            onChange={(e) => setDepartmentFilter(e.target.value)}
            className="h-9 px-3 text-xs bg-[#F8FAFC] dark:bg-[#1E293B] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488]"
          >
            <option value="All">All Departments</option>
            <option value="Executive Suite">Executive Suite</option>
            <option value="Engineering">Engineering</option>
            <option value="Legal & Compliance">Legal & Compliance</option>
            <option value="Product & Design">Product & Design</option>
            <option value="Global Operations">Global Operations</option>
          </select>

          {/* Quick Legend */}
          <div className="hidden sm:flex items-center gap-3 text-xs text-[#64748B] dark:text-[#94A3B8]">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#0D9488]" />
              Approved
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
              Pending
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#2563EB]" />
              Holiday
            </span>
          </div>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs overflow-hidden">
        {/* Days of week header */}
        <div className="grid grid-cols-7 border-b border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#0F172A] text-center text-xs font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8] py-2.5">
          <div>Sun</div>
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
        </div>

        {/* Days Cells */}
        <div className="grid grid-cols-7 divide-x divide-y divide-[#E2E8F0] dark:divide-[#334155]">
          {calendarData.map((cell, idx) => {
            const hasHoliday = !!cell.holiday;
            return (
              <div
                key={cell.dateStr + idx}
                className={`min-h-[105px] p-1.5 transition-colors ${
                  !cell.isCurrentMonth
                    ? 'bg-[#F8FAFC]/50 dark:bg-[#0B0F19]/50 opacity-40'
                    : cell.isWeekend
                    ? 'bg-[#F8FAFC]/40 dark:bg-[#111827]'
                    : 'bg-white dark:bg-[#111827]'
                }`}
              >
                {/* Date Header inside cell */}
                <div className="flex items-center justify-between mb-1 px-1">
                  <span
                    className={`text-xs font-medium tabular-nums ${
                      cell.isCurrentMonth
                        ? 'text-[#0F172A] dark:text-[#F8FAFC]'
                        : 'text-[#94A3B8]'
                    }`}
                  >
                    {cell.dayNumber}
                  </span>

                  {hasHoliday && (
                    <span
                      title={cell.holiday?.name}
                      className="w-2 h-2 rounded-full bg-[#2563EB] shrink-0"
                    />
                  )}
                </div>

                {/* Holiday Badge if present */}
                {hasHoliday && (
                  <div
                    title={cell.holiday?.name}
                    className="mb-1 px-1.5 py-0.5 text-[10px] rounded bg-[#EFF6FF] dark:bg-[#1E3A8A]/40 text-[#1E40AF] dark:text-[#93C5FD] truncate border border-[#BFDBFE] dark:border-[#1E3A8A]"
                  >
                    {cell.holiday?.name}
                  </div>
                )}

                {/* Leaves on this day */}
                <div className="space-y-1">
                  {cell.leaves.map((leave) => {
                    const isPending = leave.status === 'Pending';
                    return (
                      <div
                        key={leave.id}
                        onClick={() => onSelectRequest(leave)}
                        title={`${leave.employeeName} (${leave.leaveType})`}
                        className={`group px-1.5 py-0.5 rounded text-[11px] flex items-center gap-1.5 truncate cursor-pointer transition-transform hover:scale-[1.02] ${
                          isPending
                            ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/60'
                            : 'bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#065F46] dark:text-[#6EE7B7] border border-[#A7F3D0] dark:border-[#065F46]/60'
                        }`}
                      >
                        <img
                          src={leave.avatar}
                          alt=""
                          className="w-3.5 h-3.5 rounded-full object-cover shrink-0"
                        />
                        <span className="truncate font-medium">{leave.employeeName.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
