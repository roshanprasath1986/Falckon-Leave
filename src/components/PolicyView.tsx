import React, { useState } from 'react';
import {
  ShieldCheck,
  Calculator,
  HelpCircle,
  FileText,
  Clock,
  Calendar,
  AlertCircle,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { LeaveBalance } from '../types/leave';

interface PolicyViewProps {
  balances: LeaveBalance[];
}

export const PolicyView: React.FC<PolicyViewProps> = ({ balances }) => {
  // Forecaster state
  const [tenureYears, setTenureYears] = useState(3);
  const [monthsCompletedInYear, setMonthsCompletedInYear] = useState(10);
  const [plannedDaysOff, setPlannedDaysOff] = useState(5);

  // Accrual math:
  // Base 25 days / 12 = 2.083 days per month.
  // Tenure bonus: +1 day per 2 years of tenure beyond 2 years, capped at +5 days.
  const tenureBonus = Math.min(5, Math.floor(Math.max(0, tenureYears - 2) / 2));
  const annualBaseAllocation = 25 + tenureBonus;
  const monthlyAccrualRate = annualBaseAllocation / 12;
  const totalAccruedBySelectedMonth = Math.round(monthlyAccrualRate * monthsCompletedInYear * 10) / 10;
  const estimatedYearEndBalance = Math.round(annualBaseAllocation * 10) / 10;
  const projectedBalance = Math.max(0, Math.round((totalAccruedBySelectedMonth - plannedDaysOff) * 10) / 10);
  const maxRolloverAllowed = 5.0;
  const forfeitedIfUnused = Math.max(0, Math.round((estimatedYearEndBalance - plannedDaysOff - maxRolloverAllowed) * 10) / 10);

  return (
    <div className="space-y-6">
      {/* Policy Header Banner */}
      <div className="bg-white dark:bg-[#111827] rounded-xl p-5 border border-[#E2E8F0] dark:border-[#334155] shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <ShieldCheck className="w-5 h-5 text-[#0D9488]" />
          <span className="text-xs font-semibold text-[#0D9488] uppercase tracking-wider">
            Enterprise Governance & Policy Framework
          </span>
        </div>
        <h2 className="text-lg font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
          Executive Leave Operations Charter (FY2026)
        </h2>
        <p className="text-xs text-[#64748B] dark:text-[#94A3B8] max-w-3xl leading-relaxed mt-1">
          Governed under Enterprise Executive Bylaws & Statutory Labor Standard Compliance.
          All leave entitlements calculate semi-monthly and sync automatically to executive payroll ledgers.
        </p>
      </div>

      {/* Two Column Layout: Interactive Forecaster & Core Statutory Rules */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Interactive Accrual Simulator */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs p-5">
            <div className="flex items-center gap-2 mb-3">
              <Calculator className="w-4 h-4 text-[#0D9488]" />
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                Interactive Accrual Forecaster
              </h3>
            </div>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8] mb-4">
              Simulate statutory accrual projections, rollover allowances, and expiration caps.
            </p>

            <div className="space-y-4">
              {/* Executive Tenure Slider */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                    Executive Tenure
                  </span>
                  <span className="font-semibold text-[#0D9488] tabular-nums">
                    {tenureYears} Years (+{tenureBonus}d longevity bonus)
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="10"
                  step="1"
                  value={tenureYears}
                  onChange={(e) => setTenureYears(Number(e.target.value))}
                  className="w-full accent-[#0D9488]"
                />
              </div>

              {/* Months in Fiscal Year */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                    Completed Months in Fiscal Year
                  </span>
                  <span className="font-semibold text-[#0D9488] tabular-nums">
                    {monthsCompletedInYear} Months
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="12"
                  step="1"
                  value={monthsCompletedInYear}
                  onChange={(e) => setMonthsCompletedInYear(Number(e.target.value))}
                  className="w-full accent-[#0D9488]"
                />
              </div>

              {/* Planned Days Off */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                    Total Days Utilized / Planned
                  </span>
                  <span className="font-semibold text-[#0D9488] tabular-nums">
                    {plannedDaysOff} Days
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="0.5"
                  value={plannedDaysOff}
                  onChange={(e) => setPlannedDaysOff(Number(e.target.value))}
                  className="w-full accent-[#0D9488]"
                />
              </div>

              {/* Simulation Result Ledger */}
              <div className="mt-5 p-4 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/60 border border-[#E2E8F0] dark:border-[#334155] space-y-2.5">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-[#64748B] dark:text-[#94A3B8]">
                  Forecasted Projection
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Annual Full Allotment</span>
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                    {annualBaseAllocation.toFixed(1)} days
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Monthly Accrual Velocity</span>
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                    +{monthlyAccrualRate.toFixed(2)} days/mo
                  </span>
                </div>

                <div className="flex justify-between text-xs">
                  <span className="text-[#64748B] dark:text-[#94A3B8]">Accrued by Month {monthsCompletedInYear}</span>
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                    {totalAccruedBySelectedMonth.toFixed(1)} days
                  </span>
                </div>

                <div className="pt-2 border-t border-[#E2E8F0] dark:border-[#334155] flex justify-between text-xs">
                  <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                    Net Available Balance
                  </span>
                  <span className="text-sm font-bold text-[#0D9488] dark:text-[#2DD4BF] tabular-nums">
                    {projectedBalance.toFixed(1)} days
                  </span>
                </div>

                {forfeitedIfUnused > 0 && (
                  <div className="mt-2 text-[11px] text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 p-2 rounded border border-amber-200 dark:border-amber-900/60">
                    Warning: Up to <strong>{forfeitedIfUnused.toFixed(1)} days</strong> exceed the 5-day rollover threshold and must be taken before Dec 31 to prevent forfeiture.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Statutory Policy Guidelines (7 cols on lg) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white dark:bg-[#111827] rounded-xl border border-[#E2E8F0] dark:border-[#334155] shadow-xs p-6 space-y-6">
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading mb-1">
                Executive Statutory Provisions
              </h3>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Key governance rules applicable to corporate executives and senior management
              </p>
            </div>

            {/* Rule 1: Annual Leave & Rollover */}
            <div className="space-y-1.5 border-b border-[#F1F5F9] dark:border-[#1E293B] pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                <h4 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  1. Annual Vacation Accrual & Rollover Threshold
                </h4>
              </div>
              <p className="text-xs text-[#45464D] dark:text-[#CBD5E1] leading-relaxed pl-6">
                Executives accrue 2.083 working days per completed calendar month (25.0 days annually).
                A maximum of <strong>5.0 unutilized days</strong> may roll over into the subsequent fiscal year.
                Rollover days must be consumed by <strong>March 31</strong> of the rollover year.
              </p>
            </div>

            {/* Rule 2: Floating Holidays */}
            <div className="space-y-1.5 border-b border-[#F1F5F9] dark:border-[#1E293B] pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                <h4 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  2. Executive Floating Holidays
                </h4>
              </div>
              <p className="text-xs text-[#45464D] dark:text-[#CBD5E1] leading-relaxed pl-6">
                Four (4.0) executive floating holidays are granted on January 1st annually for cultural, religious,
                or personal observance. Floating holidays do not roll over and do not cash out upon separation.
              </p>
            </div>

            {/* Rule 3: Coverage Delegation Mandate */}
            <div className="space-y-1.5 border-b border-[#F1F5F9] dark:border-[#1E293B] pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                <h4 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  3. Executive Coverage Delegation Requirement
                </h4>
              </div>
              <p className="text-xs text-[#45464D] dark:text-[#CBD5E1] leading-relaxed pl-6">
                Any absence exceeding two (2.0) consecutive working days requires explicit designation
                of an executive peer delegate with sign-off authority. Delegation notices are automatically dispatched
                to enterprise operational systems.
              </p>
            </div>

            {/* Rule 4: International Restitution */}
            <div className="space-y-1.5 border-b border-[#F1F5F9] dark:border-[#1E293B] pb-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                <h4 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  4. Comp Time & Cross-Timezone Restitution
                </h4>
              </div>
              <p className="text-xs text-[#45464D] dark:text-[#CBD5E1] leading-relaxed pl-6">
                Executives completing international travel with $\ge 6$ hours timezone variance are entitled to
                one (1.0) working day of restitution comp time to restore cognitive focus before board-level presentations.
              </p>
            </div>

            {/* Rule 5: Executive Sabbatical */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-[#0D9488] shrink-0" />
                <h4 className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                  5. Quinquennial Executive Sabbatical
                </h4>
              </div>
              <p className="text-xs text-[#45464D] dark:text-[#CBD5E1] leading-relaxed pl-6">
                Upon completion of 3 continuous years of executive tenure, officers become eligible for
                a 15-day research or wellness sabbatical, reviewed by the Board Compensation Committee.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
