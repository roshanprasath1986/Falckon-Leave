import { PublicHoliday } from '../types/leave';

export const US_PUBLIC_HOLIDAYS_2026: PublicHoliday[] = [
  { date: '2026-01-01', name: "New Year's Day", jurisdiction: 'Federal' },
  { date: '2026-01-19', name: 'Martin Luther King Jr. Day', jurisdiction: 'Federal' },
  { date: '2026-02-16', name: "Presidents' Day", jurisdiction: 'Federal' },
  { date: '2026-05-25', name: 'Memorial Day', jurisdiction: 'Federal' },
  { date: '2026-06-19', name: 'Juneteenth National Independence Day', jurisdiction: 'Federal' },
  { date: '2026-07-03', name: 'Independence Day (Observed)', jurisdiction: 'Federal' },
  { date: '2026-09-07', name: 'Labor Day', jurisdiction: 'Federal' },
  { date: '2026-10-12', name: 'Indigenous Peoples / Columbus Day', jurisdiction: 'Federal' },
  { date: '2026-11-11', name: 'Veterans Day', jurisdiction: 'Federal' },
  { date: '2026-11-26', name: 'Thanksgiving Day', jurisdiction: 'Federal' },
  { date: '2026-11-27', name: 'Day After Thanksgiving (Executive Holiday)', jurisdiction: 'Corporate' },
  { date: '2026-12-24', name: 'Christmas Eve (Half Day)', jurisdiction: 'Corporate' },
  { date: '2026-12-25', name: 'Christmas Day', jurisdiction: 'Federal' },
  { date: '2026-12-31', name: "New Year's Eve (Corporate)", jurisdiction: 'Corporate' },
];

/**
 * Calculates working days between start and end date inclusive,
 * skipping weekends (Saturday & Sunday) and defined holidays.
 */
export function calculateWorkingDays(
  startDateStr: string,
  endDateStr: string,
  holidays: PublicHoliday[] = US_PUBLIC_HOLIDAYS_2026
): number {
  if (!startDateStr || !endDateStr) return 0;

  const start = new Date(startDateStr + 'T00:00:00');
  const end = new Date(endDateStr + 'T00:00:00');

  if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
    return 0;
  }

  const holidayDateSet = new Set(holidays.map(h => h.date));
  let count = 0;
  const cur = new Date(start);

  while (cur <= end) {
    const dayOfWeek = cur.getDay(); // 0 is Sunday, 6 is Saturday
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isoString = cur.toISOString().split('T')[0];
    const isHoliday = holidayDateSet.has(isoString);

    if (!isWeekend && !isHoliday) {
      count += 1;
    }
    cur.setDate(cur.getDate() + 1);
  }

  return count;
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return '';
  const [year, month, day] = dateStr.split('-');
  if (!year || !month || !day) return dateStr;
  const d = new Date(Number(year), Number(month) - 1, Number(day));
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

export function formatDateRange(startDate: string, endDate: string): string {
  if (startDate === endDate) {
    return formatDate(startDate);
  }
  const [sY, sM, sD] = startDate.split('-');
  const [eY, eM, eD] = endDate.split('-');
  const start = new Date(Number(sY), Number(sM) - 1, Number(sD));
  const end = new Date(Number(eY), Number(eM) - 1, Number(eD));

  if (sY === eY && sM === eM) {
    return `${start.toLocaleDateString('en-US', { month: 'short' })} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
  }

  if (sY === eY) {
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}, ${start.getFullYear()}`;
  }

  return `${formatDate(startDate)} – ${formatDate(endDate)}`;
}

export function isDateWithin(dateStr: string, startDateStr: string, endDateStr: string): boolean {
  return dateStr >= startDateStr && dateStr <= endDateStr;
}

/**
 * Generates and downloads a CSV export file from leave ledger requests
 */
export function exportRequestsToCSV(requests: any[], filename = 'executive_leave_ledger.csv') {
  const headers = [
    'Request ID',
    'Employee Name',
    'Role',
    'Department',
    'Leave Type',
    'Start Date',
    'End Date',
    'Working Days',
    'Coverage Delegate',
    'Delegate Status',
    'Status',
    'Submitted Date',
    'Reason',
    'Payroll Sync Ref',
  ];

  const rows = requests.map(r => [
    `"${r.requestNumber || r.id}"`,
    `"${r.employeeName}"`,
    `"${r.employeeRole}"`,
    `"${r.department}"`,
    `"${r.leaveType}"`,
    `"${r.startDate}"`,
    `"${r.endDate}"`,
    r.workingDays,
    `"${r.coverageDelegate?.name || ''}"`,
    `"${r.coverageDelegate?.status || ''}"`,
    `"${r.status}"`,
    `"${r.submittedAt?.split('T')[0] || ''}"`,
    `"${(r.reason || '').replace(/"/g, '""')}"`,
    `"${r.payrollSyncId || ''}"`,
  ]);

  const csvContent = [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
