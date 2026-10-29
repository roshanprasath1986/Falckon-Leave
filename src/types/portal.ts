export interface MonthlyBreakdownItem {
  month: number; // 1 - 12
  monthName: string;
  totalTaken: number;
  leaveType: string; // e.g. 'Casual', 'Annual', 'Casual → Annual', 'Unpaid', 'None'
  fromCasual: number;
  fromAnnual: number;
  unpaid: number;
  cumulativeTaken: number; // Total cumulative leaves taken up to this month
  casualRemainingAfter: number;
  annualRemainingAfter: number;
  totalRemainingAfter: number; // Total combined remaining leaves (Casual + Annual)
}

export interface LeaveCalculationResult {
  totalTaken: number;
  totalCasualTaken: number;
  totalAnnualTaken: number;
  totalUnpaid: number;
  casualRemaining: number;
  annualRemaining: number;
  totalRemaining: number;
  monthlyBreakdown: MonthlyBreakdownItem[];
}

export interface EmployeeLeaveEntry {
  id: string;
  date: string;
  month: number;
  days: number;
  reason: string;
  type: 'Auto-Deducted' | 'Casual' | 'Annual' | 'Unpaid';
  createdAt: string;
}

export type LeaveApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeEmail: string;
  department: string;
  date: string;
  endDate?: string;
  month: number;
  days: number;
  reason: string;
  status: LeaveApprovalStatus;
  supervisors: string[];
  submittedAt: string;
  reviewedAt?: string;
  reviewedBy?: string;
  reviewerRole?: 'SUPERVISOR' | 'HR_ADMIN';
  reviewNotes?: string;
}

export interface SimulatedEmail {
  id: string;
  to: string;
  toName: string;
  from: string;
  subject: string;
  body: string;
  sentAt: string;
  type:
    | 'LEAVE_SUBMITTED_TO_SUPERVISOR'
    | 'LEAVE_SUBMITTED_TO_HR'
    | 'LEAVE_APPROVED_TO_EMPLOYEE'
    | 'LEAVE_REJECTED_TO_EMPLOYEE'
    | 'LEAVE_APPROVED_TO_HR';
  read?: boolean;
  relatedRequestId?: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  password?: string;
  supervisor?: string;
  supervisors?: string[];
  department: string;
  annualEntitled: number;
  casualEntitled: number;
  monthlyLeaves: Record<number, number>; // month 1..12 -> days taken
  leaveEntries: EmployeeLeaveEntry[];
  isArchived: boolean;
  joinedDate: string;
  hasAdminRights?: boolean; // Admin can grant or revoke admin rights to any employee
}

export const DEFAULT_DEPARTMENTS: string[] = [
  'Executive Suite',
  'Engineering',
  'Product & Design',
  'Operations',
  'Finance & Accounts',
  'Quality Assurance',
  'Customer Success',
  'Marketing & Comms',
  'Legal & Compliance',
];

export function getEmployeeSupervisors(emp: { supervisor?: string; supervisors?: string[] }): string[] {
  if (emp.supervisors && emp.supervisors.length > 0) {
    return emp.supervisors;
  }
  if (emp.supervisor) {
    return emp.supervisor.split(',').map((s) => s.trim()).filter(Boolean);
  }
  return [];
}

export type UserRole = 'HR_ADMIN' | 'SUPERVISOR' | 'EMPLOYEE';
