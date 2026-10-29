import { Employee, EmployeeLeaveEntry, LeaveCalculationResult, MonthlyBreakdownItem, getEmployeeSupervisors } from '../types/portal';

export const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

export const MONTH_SHORT_NAMES = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

/**
 * Calculates leave balance progression across all 12 months.
 * Rule: Casual is used first; once Casual runs out, the rest is taken from Annual automatically.
 */
export function calculateEmployeeBalances(
  annualEntitled: number,
  casualEntitled: number,
  monthlyLeaves: Record<number, number> = {}
): LeaveCalculationResult {
  let runningCasual = Math.max(0, casualEntitled);
  let runningAnnual = Math.max(0, annualEntitled);

  let totalTaken = 0;
  let totalCasualTaken = 0;
  let totalAnnualTaken = 0;
  let totalUnpaid = 0;

  const monthlyBreakdown: MonthlyBreakdownItem[] = [];

  for (let m = 1; m <= 12; m++) {
    const rawTaken = Number(monthlyLeaves[m]) || 0;
    const taken = Math.max(0, rawTaken);

    totalTaken += taken;

    // 1. Casual is used first
    const fromCasual = Math.min(runningCasual, taken);
    runningCasual -= fromCasual;
    totalCasualTaken += fromCasual;

    // 2. Remainder is taken from Annual automatically
    const remainingAfterCasual = taken - fromCasual;
    const fromAnnual = Math.min(runningAnnual, remainingAfterCasual);
    runningAnnual -= fromAnnual;
    totalAnnualTaken += fromAnnual;

    // 3. Any excess beyond both entitlements is Unpaid leave
    const unpaid = remainingAfterCasual - fromAnnual;
    totalUnpaid += unpaid;

    // Determine type of leave representation for this month
    let leaveType = 'None';
    if (taken > 0) {
      if (unpaid > 0 && fromAnnual > 0 && fromCasual > 0) {
        leaveType = 'Casual + Annual + Unpaid';
      } else if (unpaid > 0 && fromAnnual > 0) {
        leaveType = 'Annual + Unpaid';
      } else if (unpaid > 0) {
        leaveType = 'Unpaid Leave';
      } else if (fromCasual > 0 && fromAnnual > 0) {
        leaveType = 'Casual + Annual';
      } else if (fromCasual > 0) {
        leaveType = 'Casual Leave';
      } else if (fromAnnual > 0) {
        leaveType = 'Annual Leave';
      }
    }

    monthlyBreakdown.push({
      month: m,
      monthName: MONTH_NAMES[m - 1],
      totalTaken: taken,
      leaveType,
      fromCasual,
      fromAnnual,
      unpaid,
      cumulativeTaken: totalTaken,
      casualRemainingAfter: runningCasual,
      annualRemainingAfter: runningAnnual,
      totalRemainingAfter: runningCasual + runningAnnual,
    });
  }

  return {
    totalTaken,
    totalCasualTaken,
    totalAnnualTaken,
    totalUnpaid,
    casualRemaining: runningCasual,
    annualRemaining: runningAnnual,
    totalRemaining: runningCasual + runningAnnual,
    monthlyBreakdown,
  };
}

/**
 * Helper to export the employee list and monthly breakdown to CSV
 * Engineered for clean re-import and sync.
 */
export type ExportFormatType = 'simplified_rows' | 'simplified_grid' | 'full';

/**
 * Parses month string (e.g. 'January', 'Jan', '1', '01') into 1..12
 */
export function parseMonthIdentifier(val: string): number | null {
  if (!val) return null;
  const clean = val.trim().toLowerCase().replace(/[^a-z0-9]/g, '');
  const num = parseInt(clean, 10);
  if (!isNaN(num) && num >= 1 && num <= 12) return num;

  const monthMap: Record<string, number> = {
    jan: 1, january: 1,
    feb: 2, february: 2,
    mar: 3, march: 3,
    apr: 4, april: 4,
    may: 5,
    jun: 6, june: 6,
    jul: 7, july: 7,
    aug: 8, august: 8,
    sep: 9, sept: 9, september: 9,
    oct: 10, october: 10,
    nov: 11, november: 11,
    dec: 12, december: 12,
  };

  for (const [key, m] of Object.entries(monthMap)) {
    if (clean === key || clean.startsWith(key)) return m;
  }
  return null;
}

/**
 * Helper to export employee leave records to CSV.
 * Supports:
 * 1) 'simplified_rows': Only Month, Leaves Taken, and Remaining Leaves (without type of leave)
 * 2) 'simplified_grid': Monthwise columns with Taken & Remaining per month
 * 3) 'full': Complete workforce statutory ledger
 */
export function exportEmployeesToCSV(
  employees: Employee[],
  year: number = 2026,
  format: ExportFormatType = 'simplified_rows'
) {
  let csvContent = '';
  let filename = '';

  if (format === 'simplified_rows') {
    // Only month, leaves taken, and remaining without type of leave (Row-per-month format)
    const headers = [
      'Employee ID',
      'Name',
      'Month',
      'Leaves Taken',
      'Total Remaining Leaves',
    ];

    const rows: string[] = [];
    employees.forEach((emp) => {
      const calc = calculateEmployeeBalances(
        emp.annualEntitled,
        emp.casualEntitled,
        emp.monthlyLeaves
      );

      calc.monthlyBreakdown.forEach((mItem) => {
        rows.push(
          [
            `"${emp.id}"`,
            `"${emp.name}"`,
            `"${mItem.monthName}"`,
            mItem.totalTaken,
            mItem.totalRemainingAfter,
          ].join(',')
        );
      });
    });

    csvContent = [headers.join(','), ...rows].join('\n');
    filename = `leave_records_monthly_simplified_${year}.csv`;
  } else if (format === 'simplified_grid') {
    // Month-by-month columns: Month Taken and Month Remaining for all 12 months (without type of leave)
    const monthHeaders: string[] = [];
    MONTH_SHORT_NAMES.forEach((m) => {
      monthHeaders.push(`${m} Taken`, `${m} Remaining`);
    });

    const headers = [
      'Employee ID',
      'Name',
      ...monthHeaders,
      'Total Leaves Taken',
      'Total Remaining Leaves',
    ];

    const rows = employees.map((emp) => {
      const calc = calculateEmployeeBalances(
        emp.annualEntitled,
        emp.casualEntitled,
        emp.monthlyLeaves
      );

      const monthCols: number[] = [];
      calc.monthlyBreakdown.forEach((mb) => {
        monthCols.push(mb.totalTaken, mb.totalRemainingAfter);
      });

      return [
        `"${emp.id}"`,
        `"${emp.name}"`,
        ...monthCols,
        calc.totalTaken,
        calc.totalRemaining,
      ].join(',');
    });

    csvContent = [headers.join(','), ...rows].join('\n');
    filename = `leave_records_monthly_grid_${year}.csv`;
  } else {
    // 'full' statutory ledger
    const headers = [
      'Employee ID',
      'Name',
      'Email',
      'Supervisors',
      'Department',
      'Annual Entitled',
      'Annual Used',
      'Annual Remaining',
      'Casual Entitled',
      'Casual Used',
      'Casual Remaining',
      'Total Remaining Leaves',
      'Total Leaves Taken',
      'Unpaid / Excess',
      'Admin Rights',
      ...MONTH_SHORT_NAMES.map((m) => `${m} Taken`),
      'Status',
    ];

    const rows = employees.map((emp) => {
      const calc = calculateEmployeeBalances(
        emp.annualEntitled,
        emp.casualEntitled,
        emp.monthlyLeaves
      );

      const monthlyCols = Array.from({ length: 12 }, (_, i) => emp.monthlyLeaves[i + 1] ?? 0);
      const sups = getEmployeeSupervisors(emp).join('; ');

      return [
        `"${emp.id}"`,
        `"${emp.name}"`,
        `"${emp.email || ''}"`,
        `"${sups}"`,
        `"${emp.department || 'General'}"`,
        emp.annualEntitled,
        calc.totalAnnualTaken,
        calc.annualRemaining,
        emp.casualEntitled,
        calc.totalCasualTaken,
        calc.casualRemaining,
        calc.totalRemaining,
        calc.totalTaken,
        calc.totalUnpaid,
        emp.hasAdminRights ? '"Yes"' : '"No"',
        ...monthlyCols,
        emp.isArchived ? '"Archived"' : '"Active"',
      ].join(',');
    });

    csvContent = [headers.join(','), ...rows].join('\n');
    filename = `leave_balance_portal_full_${year}.csv`;
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

/**
 * Generates sample CSV template text for download/testing
 */
export function generateTemplateCSV(format: ExportFormatType, sampleEmployees: Employee[]): string {
  if (format === 'simplified_rows') {
    const headers = ['Employee ID', 'Name', 'Month', 'Leaves Taken', 'Total Remaining Leaves'];
    const rows: string[] = [];
    sampleEmployees.slice(0, 3).forEach((emp) => {
      const calc = calculateEmployeeBalances(emp.annualEntitled, emp.casualEntitled, emp.monthlyLeaves);
      calc.monthlyBreakdown.forEach((mb) => {
        rows.push(`"${emp.id}","${emp.name}","${mb.monthName}",${mb.totalTaken},${mb.totalRemainingAfter}`);
      });
    });
    return [headers.join(','), ...rows].join('\n');
  } else if (format === 'simplified_grid') {
    const monthHeaders: string[] = [];
    MONTH_SHORT_NAMES.forEach((m) => {
      monthHeaders.push(`${m} Taken`, `${m} Remaining`);
    });
    const headers = ['Employee ID', 'Name', ...monthHeaders, 'Total Leaves Taken', 'Total Remaining Leaves'];
    const rows = sampleEmployees.slice(0, 3).map((emp) => {
      const calc = calculateEmployeeBalances(emp.annualEntitled, emp.casualEntitled, emp.monthlyLeaves);
      const cols: number[] = [];
      calc.monthlyBreakdown.forEach((mb) => {
        cols.push(mb.totalTaken, mb.totalRemainingAfter);
      });
      return [`"${emp.id}"`, `"${emp.name}"`, ...cols, calc.totalTaken, calc.totalRemaining].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  } else {
    const headers = [
      'Employee ID', 'Name', 'Email', 'Supervisors', 'Department',
      'Annual Entitled', 'Annual Used', 'Annual Remaining',
      'Casual Entitled', 'Casual Used', 'Casual Remaining',
      'Total Remaining Leaves', 'Total Leaves Taken', 'Unpaid / Excess', 'Admin Rights',
      ...MONTH_SHORT_NAMES.map((m) => `${m} Taken`),
      'Status'
    ];
    const rows = sampleEmployees.slice(0, 3).map((emp) => {
      const calc = calculateEmployeeBalances(emp.annualEntitled, emp.casualEntitled, emp.monthlyLeaves);
      const monthlyCols = Array.from({ length: 12 }, (_, i) => emp.monthlyLeaves[i + 1] ?? 0);
      const sups = getEmployeeSupervisors(emp).join('; ');
      return [
        `"${emp.id}"`, `"${emp.name}"`, `"${emp.email || ''}"`, `"${sups}"`, `"${emp.department || 'General'}"`,
        emp.annualEntitled, calc.totalAnnualTaken, calc.annualRemaining,
        emp.casualEntitled, calc.totalCasualTaken, calc.casualRemaining,
        calc.totalRemaining, calc.totalTaken, calc.totalUnpaid,
        emp.hasAdminRights ? '"Yes"' : '"No"',
        ...monthlyCols,
        emp.isArchived ? '"Archived"' : '"Active"'
      ].join(',');
    });
    return [headers.join(','), ...rows].join('\n');
  }
}

/**
 * Parses CSV text lines, handling quotes properly.
 */
function parseCSVLine(line: string): string[] {
  const values: string[] = [];
  let currentValue = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        currentValue += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(currentValue.trim());
      currentValue = '';
    } else {
      currentValue += char;
    }
  }
  values.push(currentValue.trim());
  return values;
}

export interface SyncResult {
  updatedEmployees: Employee[];
  countUpdated: number;
  countAdded: number;
  detectedFormat: 'simplified_rows' | 'simplified_grid' | 'full';
  previewRows: Array<{
    id: string;
    name: string;
    action: 'Updated' | 'Added';
    totalTaken: number;
    casualAllocated: number;
    annualAllocated: number;
    unpaidAllocated: number;
    totalRemaining: number;
    casualRemaining: number;
    annualRemaining: number;
    supervisors: string;
    hasAdminRights: boolean;
  }>;
  errors: string[];
}

/**
 * Parses uploaded CSV text and syncs with employee list.
 * Automatically allocates leaves according to the statutory sequence:
 * 1. Casual leave is allocated first until exhausted
 * 2. Remainder is automatically taken from Annual leave
 * 3. Any excess is Unpaid leave
 */
export function parseCSVAndSync(csvText: string, currentEmployees: Employee[]): SyncResult {
  const lines = csvText.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length < 2) {
    return {
      updatedEmployees: currentEmployees,
      countUpdated: 0,
      countAdded: 0,
      detectedFormat: 'full',
      previewRows: [],
      errors: ['The uploaded CSV file is empty or does not contain header and data rows.'],
    };
  }

  const rawHeaders = parseCSVLine(lines[0]).map((h) => h.replace(/^"|"$/g, '').toLowerCase().trim());

  // Detect format:
  // Is this 'simplified_rows' format (has 'month' and 'leaves taken' / 'taken' columns)?
  const monthColIdx = rawHeaders.findIndex((h) => h === 'month' || h.includes('month name') || h === 'period');
  const leavesTakenColIdx = rawHeaders.findIndex(
    (h) => h === 'leaves taken' || h === 'taken' || h === 'days taken' || h === 'days' || h === 'leave taken'
  );

  const isSimplifiedRowsFormat = monthColIdx !== -1 && leavesTakenColIdx !== -1;

  const employeeMap = new Map<string, Employee>();
  currentEmployees.forEach((emp) => {
    employeeMap.set(emp.id.toUpperCase(), { ...emp });
  });

  const errors: string[] = [];
  let detectedFormat: SyncResult['detectedFormat'] = isSimplifiedRowsFormat ? 'simplified_rows' : 'full';

  if (isSimplifiedRowsFormat) {
    // -------------------------------------------------------------
    // FORMAT 1: Simplified Row-per-Month Format
    // Columns: Employee ID, Name, Month, Leaves Taken, Total Remaining Leaves
    // Leaves are automatically allocated using Casual -> Annual sequence
    // -------------------------------------------------------------
    const idIdx = rawHeaders.findIndex((h) => h.includes('employee id') || h === 'id' || h === 'emp id');
    const nameIdx = rawHeaders.findIndex((h) => h === 'name' || h.includes('employee name'));

    // Temporary storage by employee ID: { name, monthlyLeaves: Record<number, number> }
    const empDataByEmployee = new Map<string, {
      name: string;
      monthlyLeaves: Record<number, number>;
    }>();

    for (let i = 1; i < lines.length; i++) {
      const values = parseCSVLine(lines[i]).map((v) => v.replace(/^"|"$/g, '').trim());
      if (values.length < 2) continue;

      const rawId = idIdx !== -1 && values[idIdx] ? values[idIdx].trim().toUpperCase() : '';
      const rawName = nameIdx !== -1 && values[nameIdx] ? values[nameIdx].trim() : '';

      // Fallback matching if only name is provided
      let matchedEmpId = rawId;
      if (!matchedEmpId && rawName) {
        const found = currentEmployees.find((e) => e.name.toLowerCase() === rawName.toLowerCase());
        if (found) matchedEmpId = found.id.toUpperCase();
      }

      if (!matchedEmpId && !rawName) continue;
      const key = matchedEmpId || `EMP_NAME_${rawName.toUpperCase()}`;

      const monthRaw = values[monthColIdx];
      const monthNum = parseMonthIdentifier(monthRaw);

      const takenRaw = values[leavesTakenColIdx];
      const taken = Math.max(0, parseFloat(takenRaw) || 0);

      if (!empDataByEmployee.has(key)) {
        empDataByEmployee.set(key, {
          name: rawName,
          monthlyLeaves: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0, 7: 0, 8: 0, 9: 0, 10: 0, 11: 0, 12: 0 },
        });
      }

      const rec = empDataByEmployee.get(key)!;
      if (rawName && !rec.name) rec.name = rawName;
      if (monthNum && monthNum >= 1 && monthNum <= 12) {
        rec.monthlyLeaves[monthNum] = taken;
      }
    }

    if (empDataByEmployee.size === 0) {
      return {
        updatedEmployees: currentEmployees,
        countUpdated: 0,
        countAdded: 0,
        detectedFormat: 'simplified_rows',
        previewRows: [],
        errors: ['No valid employee monthly records could be parsed from the file.'],
      };
    }

    let countUpdated = 0;
    let countAdded = 0;
    const previewRows: SyncResult['previewRows'] = [];

    empDataByEmployee.forEach((data, key) => {
      const existing = employeeMap.get(key) ||
        Array.from(employeeMap.values()).find((e) => e.name.toLowerCase() === data.name.toLowerCase());

      const annualEntitled = existing?.annualEntitled ?? 14;
      const casualEntitled = existing?.casualEntitled ?? 7;

      // Automatically allocate sequence: Casual (1st) -> Annual (2nd) -> Unpaid (excess)
      const calc = calculateEmployeeBalances(annualEntitled, casualEntitled, data.monthlyLeaves);

      // Generate dated leave entries trail for non-zero months
      const autoEntries: EmployeeLeaveEntry[] = [];
      calc.monthlyBreakdown.forEach((mb) => {
        if (mb.totalTaken > 0) {
          const monthPad = mb.month.toString().padStart(2, '0');
          autoEntries.push({
            id: `le-sync-${key}-${mb.month}-${Date.now()}`,
            date: `2026-${monthPad}-15`,
            month: mb.month,
            days: mb.totalTaken,
            reason: `Synced leave allocation (${mb.leaveType})`,
            type: mb.unpaid > 0 ? 'Unpaid' : mb.fromAnnual > 0 && mb.fromCasual === 0 ? 'Annual' : mb.fromCasual > 0 && mb.fromAnnual === 0 ? 'Casual' : 'Auto-Deducted',
            createdAt: new Date().toISOString(),
          });
        }
      });

      const updatedEmp: Employee = {
        id: existing?.id || (key.startsWith('EMP_NAME_') ? `EMP${Math.floor(100 + Math.random() * 900)}` : key),
        name: data.name || existing?.name || `Employee ${key}`,
        email: existing?.email || '',
        password: existing?.password || 'password123',
        supervisor: existing?.supervisor || '',
        supervisors: existing?.supervisors || (existing?.supervisor ? [existing.supervisor] : []),
        department: existing?.department || 'Operations',
        annualEntitled,
        casualEntitled,
        monthlyLeaves: data.monthlyLeaves,
        leaveEntries: autoEntries.length > 0 ? autoEntries : existing?.leaveEntries || [],
        isArchived: existing?.isArchived ?? false,
        joinedDate: existing?.joinedDate || new Date().toISOString().split('T')[0],
        hasAdminRights: existing?.hasAdminRights ?? false,
      };

      const action = existing ? 'Updated' : 'Added';
      if (existing) {
        countUpdated++;
      } else {
        countAdded++;
      }

      employeeMap.set(updatedEmp.id.toUpperCase(), updatedEmp);

      previewRows.push({
        id: updatedEmp.id,
        name: updatedEmp.name,
        action,
        totalTaken: calc.totalTaken,
        casualAllocated: calc.totalCasualTaken,
        annualAllocated: calc.totalAnnualTaken,
        unpaidAllocated: calc.totalUnpaid,
        totalRemaining: calc.totalRemaining,
        casualRemaining: calc.casualRemaining,
        annualRemaining: calc.annualRemaining,
        supervisors: getEmployeeSupervisors(updatedEmp).join(', '),
        hasAdminRights: !!updatedEmp.hasAdminRights,
      });
    });

    return {
      updatedEmployees: Array.from(employeeMap.values()),
      countUpdated,
      countAdded,
      detectedFormat: 'simplified_rows',
      previewRows,
      errors,
    };
  }

  // -------------------------------------------------------------
  // FORMAT 2: Wide / Grid or Full Workforce Format
  // -------------------------------------------------------------
  const idIdx = rawHeaders.findIndex((h) => h.includes('employee id') || h === 'id' || h === 'emp id');
  const nameIdx = rawHeaders.findIndex((h) => h === 'name' || h.includes('employee name'));
  const emailIdx = rawHeaders.findIndex((h) => h === 'email');
  const supsIdx = rawHeaders.findIndex((h) => h.includes('supervisor'));
  const deptIdx = rawHeaders.findIndex((h) => h.includes('department'));
  const annualEntitledIdx = rawHeaders.findIndex((h) => h.includes('annual entitled') || h === 'annual');
  const casualEntitledIdx = rawHeaders.findIndex((h) => h.includes('casual entitled') || h === 'casual');
  const adminRightsIdx = rawHeaders.findIndex((h) => h.includes('admin') || h.includes('rights'));
  const statusIdx = rawHeaders.findIndex((h) => h === 'status' || h.includes('archived'));

  // Month columns (Jan through Dec)
  const monthIndices: Record<number, number> = {};
  let foundMonthColumns = 0;
  MONTH_SHORT_NAMES.forEach((mShort, idx) => {
    const colIdx = rawHeaders.findIndex((h) => h.includes(`${mShort.toLowerCase()} taken`) || h === mShort.toLowerCase());
    if (colIdx !== -1) {
      monthIndices[idx + 1] = colIdx;
      foundMonthColumns++;
    }
  });

  if (foundMonthColumns >= 6 && (annualEntitledIdx === -1 || deptIdx === -1)) {
    detectedFormat = 'simplified_grid';
  }

  if (idIdx === -1 && nameIdx === -1) {
    return {
      updatedEmployees: currentEmployees,
      countUpdated: 0,
      countAdded: 0,
      detectedFormat,
      previewRows: [],
      errors: ['Could not find "Employee ID" or "Name" header column in uploaded CSV.'],
    };
  }

  let countUpdated = 0;
  let countAdded = 0;
  const previewRows: SyncResult['previewRows'] = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]).map((v) => v.replace(/^"|"$/g, '').trim());
    if (values.length < 2) continue;

    const id = (idIdx !== -1 ? values[idIdx] : `EMP00${i}`).trim().toUpperCase();
    const name = (nameIdx !== -1 ? values[nameIdx] : `Employee ${id}`).trim();

    if (!id && !name) continue;

    const existing = employeeMap.get(id);

    // Parse monthly values
    const newMonthlyLeaves: Record<number, number> = existing ? { ...existing.monthlyLeaves } : {};
    for (let m = 1; m <= 12; m++) {
      const colIdx = monthIndices[m];
      if (colIdx !== undefined && colIdx !== -1 && colIdx < values.length) {
        const val = parseFloat(values[colIdx]);
        if (!isNaN(val)) {
          newMonthlyLeaves[m] = Math.max(0, val);
        }
      } else if (!existing) {
        newMonthlyLeaves[m] = 0;
      }
    }

    // Parse supervisors (optional)
    let parsedSupervisors: string[] = existing?.supervisors || (existing?.supervisor ? [existing.supervisor] : []);
    if (supsIdx !== -1 && values[supsIdx] !== undefined) {
      parsedSupervisors = values[supsIdx]
        .split(/[;,]/)
        .map((s) => s.trim())
        .filter(Boolean);
    }

    // Parse Admin rights
    let hasAdmin = existing?.hasAdminRights ?? false;
    if (adminRightsIdx !== -1 && values[adminRightsIdx]) {
      const val = values[adminRightsIdx].toLowerCase();
      hasAdmin = val === 'yes' || val === 'true' || val === 'admin';
    }

    const annualEntitled = annualEntitledIdx !== -1 && !isNaN(parseFloat(values[annualEntitledIdx]))
      ? parseFloat(values[annualEntitledIdx])
      : existing?.annualEntitled ?? 14;

    const casualEntitled = casualEntitledIdx !== -1 && !isNaN(parseFloat(values[casualEntitledIdx]))
      ? parseFloat(values[casualEntitledIdx])
      : existing?.casualEntitled ?? 7;

    const department = deptIdx !== -1 && values[deptIdx] ? values[deptIdx] : existing?.department ?? 'General';
    const email = emailIdx !== -1 && values[emailIdx] ? values[emailIdx] : existing?.email ?? '';
    const isArchived = statusIdx !== -1 ? values[statusIdx].toLowerCase().includes('archive') : existing?.isArchived ?? false;

    // Automatically allocate according to the sequence
    const calc = calculateEmployeeBalances(annualEntitled, casualEntitled, newMonthlyLeaves);

    const updatedEmp: Employee = {
      id: id || existing?.id || `EMP00${i}`,
      name: name || existing?.name || `Employee ${id}`,
      email: email || existing?.email || '',
      password: existing?.password || 'password123',
      supervisor: parsedSupervisors.join(', '),
      supervisors: parsedSupervisors,
      department,
      annualEntitled,
      casualEntitled,
      monthlyLeaves: newMonthlyLeaves,
      leaveEntries: existing?.leaveEntries || [],
      isArchived,
      joinedDate: existing?.joinedDate || new Date().toISOString().split('T')[0],
      hasAdminRights: hasAdmin,
    };

    const action = existing ? 'Updated' : 'Added';
    if (existing) {
      countUpdated++;
    } else {
      countAdded++;
    }

    employeeMap.set(updatedEmp.id.toUpperCase(), updatedEmp);

    previewRows.push({
      id: updatedEmp.id,
      name: updatedEmp.name,
      action,
      totalTaken: calc.totalTaken,
      casualAllocated: calc.totalCasualTaken,
      annualAllocated: calc.totalAnnualTaken,
      unpaidAllocated: calc.totalUnpaid,
      totalRemaining: calc.totalRemaining,
      casualRemaining: calc.casualRemaining,
      annualRemaining: calc.annualRemaining,
      supervisors: parsedSupervisors.join(', '),
      hasAdminRights: !!updatedEmp.hasAdminRights,
    });
  }

  return {
    updatedEmployees: Array.from(employeeMap.values()),
    countUpdated,
    countAdded,
    detectedFormat,
    previewRows,
    errors,
  };
}
