import { LeaveRequest, SimulatedEmail, Employee } from '../types/portal';

const STORAGE_KEY = 'leave_portal_emails_v1';
const HR_EMAIL = 'hr-operations@company.com';
const HR_NAME = 'HR Operations Admin';

export function getSimulatedEmails(): SimulatedEmail[] {
  if (typeof window === 'undefined') return [];
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) return [];
  try {
    return JSON.parse(saved);
  } catch (e) {
    return [];
  }
}

export function saveSimulatedEmail(email: SimulatedEmail): void {
  if (typeof window === 'undefined') return;
  const current = getSimulatedEmails();
  const updated = [email, ...current];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  window.dispatchEvent(new CustomEvent('portal-email-dispatched', { detail: email }));
}

export function clearSimulatedEmails(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new CustomEvent('portal-email-dispatched'));
}

/**
 * Dispatch emails when an employee files a new leave request:
 * 1. Email to Supervisor(s)
 * 2. Email to HR Admin
 */
export function dispatchLeaveApplicationEmails(
  request: LeaveRequest,
  allEmployees: Employee[]
): SimulatedEmail[] {
  const sentEmails: SimulatedEmail[] = [];
  const now = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const sups = request.supervisors;

  // 1. Send email to each designated supervisor
  if (sups.length > 0) {
    sups.forEach((supName) => {
      // Find supervisor employee object for email address
      const supEmp = allEmployees.find(
        (e) => e.name.toLowerCase() === supName.toLowerCase() || e.id.toLowerCase() === supName.toLowerCase()
      );
      const supEmail = supEmp?.email || `${supName.toLowerCase().replace(/\s+/g, '.')}@company.com`;

      const supervisorEmail: SimulatedEmail = {
        id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        to: supEmail,
        toName: supName,
        from: 'leave-portal-notifications@company.com',
        subject: `ACTION REQUIRED: Leave Request for ${request.employeeName} (${request.days} day${request.days > 1 ? 's' : ''})`,
        body: `Dear ${supName},

A new statutory leave application has been submitted by your team member and requires your review and approval:

• Employee: ${request.employeeName} (ID: ${request.employeeId})
• Department: ${request.department}
• Leave Date: ${request.date}${request.endDate ? ` to ${request.endDate}` : ''}
• Duration: ${request.days} day(s)
• Reason for Absence: "${request.reason}"
• Current Status: PENDING SUPERVISOR APPROVAL

Note: In accordance with statutory compliance, leave days will NOT be deducted or allocated from the employee's entitlement ledger until approved by either yourself or HR Administration.

Please log in to the Leave Balance Portal to review, approve, or reject this request.

Regards,
Leave Portal Automation System`,
        sentAt: now,
        type: 'LEAVE_SUBMITTED_TO_SUPERVISOR',
        relatedRequestId: request.id,
      };

      saveSimulatedEmail(supervisorEmail);
      sentEmails.push(supervisorEmail);
    });
  }

  // 2. Send notification email to HR Admin
  const hrEmail: SimulatedEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    to: HR_EMAIL,
    toName: HR_NAME,
    from: 'leave-portal-notifications@company.com',
    subject: `HR COPY: New Leave Application - ${request.employeeName} (${request.days} day${request.days > 1 ? 's' : ''})`,
    body: `HR Operations Team,

A leave request has been submitted in the Leave Balance Portal:

• Employee: ${request.employeeName} (${request.employeeId}) - ${request.department}
• Leave Date: ${request.date}
• Duration: ${request.days} day(s)
• Reason: "${request.reason}"
• Designated Supervisor(s): ${sups.length > 0 ? sups.join(', ') : 'None (Direct to Board)'}
• Status: PENDING APPROVAL

As an HR Administrator, you hold universal authorization to review and approve this leave at any time or await supervisor confirmation.

Regards,
Leave Balance Portal`,
    sentAt: now,
    type: 'LEAVE_SUBMITTED_TO_HR',
    relatedRequestId: request.id,
  };

  saveSimulatedEmail(hrEmail);
  sentEmails.push(hrEmail);

  return sentEmails;
}

/**
 * Dispatch confirmation email when leave is APPROVED:
 * 1. Email to Employee (confirmation that leave is approved and balance deducted)
 * 2. Email to HR Admin (if approved by supervisor)
 */
export function dispatchLeaveApprovedEmails(
  request: LeaveRequest,
  reviewerName: string,
  reviewerRole: 'SUPERVISOR' | 'HR_ADMIN',
  notes?: string
): SimulatedEmail[] {
  const sentEmails: SimulatedEmail[] = [];
  const now = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  // 1. Email to Employee
  const employeeEmail: SimulatedEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    to: request.employeeEmail,
    toName: request.employeeName,
    from: 'leave-portal-notifications@company.com',
    subject: `APPROVED: Your Leave Request for ${request.date} (${request.days} day${request.days > 1 ? 's' : ''})`,
    body: `Dear ${request.employeeName},

Good news! Your statutory leave request has been officially APPROVED.

• Dates: ${request.date}${request.endDate ? ` to ${request.endDate}` : ''}
• Duration: ${request.days} day(s)
• Approved By: ${reviewerName} (${reviewerRole === 'HR_ADMIN' ? 'HR Administrator' : 'Supervisor'})
${notes ? `• Reviewer Remarks: "${notes}"\n` : ''}
• Entitlement Update: Your monthly statutory leave ledger has now been updated and allocated according to deduction sequence (Casual leave first, followed by Annual leave).

You can log in to your employee portal at any time to inspect your live remaining balance and monthly breakdown.

Warm regards,
Leave Balance Administration`,
    sentAt: now,
    type: 'LEAVE_APPROVED_TO_EMPLOYEE',
    relatedRequestId: request.id,
  };

  saveSimulatedEmail(employeeEmail);
  sentEmails.push(employeeEmail);

  // 2. Email to HR if approved by supervisor
  if (reviewerRole === 'SUPERVISOR') {
    const hrApprovalEmail: SimulatedEmail = {
      id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      to: HR_EMAIL,
      toName: HR_NAME,
      from: 'leave-portal-notifications@company.com',
      subject: `HR RECORD: Leave Approved for ${request.employeeName} by Supervisor ${reviewerName}`,
      body: `HR Operations Team,

Supervisor ${reviewerName} has approved the leave request for ${request.employeeName} (${request.employeeId}):

• Duration: ${request.days} day(s) for ${request.date}
• Reason: ${request.reason}
• Allocation: Leave ledger has been automatically debited and statutory balances recalculated.

Regards,
Leave Balance Portal`,
      sentAt: now,
      type: 'LEAVE_APPROVED_TO_HR',
      relatedRequestId: request.id,
    };

    saveSimulatedEmail(hrApprovalEmail);
    sentEmails.push(hrApprovalEmail);
  }

  return sentEmails;
}

/**
 * Dispatch notification email when leave is REJECTED
 */
export function dispatchLeaveRejectedEmail(
  request: LeaveRequest,
  reviewerName: string,
  reviewerRole: 'SUPERVISOR' | 'HR_ADMIN',
  reasonNotes?: string
): SimulatedEmail {
  const now = new Date().toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

  const email: SimulatedEmail = {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    to: request.employeeEmail,
    toName: request.employeeName,
    from: 'leave-portal-notifications@company.com',
    subject: `UPDATE: Leave Request for ${request.date} Not Approved`,
    body: `Dear ${request.employeeName},

Your leave request for ${request.date} (${request.days} day(s)) has been reviewed and was NOT approved at this time.

• Reviewed By: ${reviewerName} (${reviewerRole === 'HR_ADMIN' ? 'HR Administrator' : 'Supervisor'})
• Reason / Notes: ${reasonNotes || 'No specific notes provided.'}

No leave days have been deducted from your statutory entitlements ledger.

If you have questions or require further details, please reach out directly to your supervisor or HR Operations.

Regards,
Leave Balance Administration`,
    sentAt: now,
    type: 'LEAVE_REJECTED_TO_EMPLOYEE',
    relatedRequestId: request.id,
  };

  saveSimulatedEmail(email);
  return email;
}
