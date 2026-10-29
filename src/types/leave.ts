export type LeaveType = 
  | 'Annual Vacation'
  | 'Executive Floating Holiday'
  | 'Medical & Health'
  | 'Executive Sabbatical'
  | 'Comp Time & Restitution'
  | 'Parental Leave'
  | 'Bereavement';

export type LeaveStatus = 'Approved' | 'Pending' | 'Rejected' | 'Cancelled';

export type Department = 
  | 'Executive Suite'
  | 'Engineering'
  | 'Product & Design'
  | 'Legal & Compliance'
  | 'Finance & Strategy'
  | 'Global Operations';

export interface LeaveBalance {
  id: string;
  type: LeaveType;
  totalAllocated: number;
  accruedToDate: number;
  used: number;
  pending: number;
  carryOver: number;
  expiresOn?: string;
  icon: string;
  color: string;
}

export interface LeaveRequest {
  id: string;
  requestNumber: string;
  employeeId: string;
  employeeName: string;
  employeeRole: string;
  department: Department;
  avatar: string;
  leaveType: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  workingDays: number;
  coverageDelegate: {
    name: string;
    role: string;
    avatar: string;
    status: 'Confirmed' | 'Pending Confirmation' | 'Declined' | 'Rejected';
  };
  reason: string;
  notes?: string;
  status: LeaveStatus;
  submittedAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
  conflictWarning?: string;
  urgency: 'Standard' | 'Expedited' | 'Executive Privilege';
  documentsAttached?: string[];
  payrollSyncId?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: string;
  department: Department;
  avatar: string;
  email: string;
  isCurrentUser?: boolean;
}

export interface PublicHoliday {
  date: string;
  name: string;
  jurisdiction: string;
}
