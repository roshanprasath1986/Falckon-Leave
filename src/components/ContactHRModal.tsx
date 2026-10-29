import React, { useState } from 'react';
import { X, Mail, Send, CheckCircle2, HelpCircle } from 'lucide-react';
import { Employee } from '../types/portal';

interface ContactHRModalProps {
  isOpen: boolean;
  onClose: () => void;
  employees: Employee[];
  currentUserId?: string;
}

export const ContactHRModal: React.FC<ContactHRModalProps> = ({
  isOpen,
  onClose,
  employees,
  currentUserId,
}) => {
  if (!isOpen) return null;

  const [selectedEmpId, setSelectedEmpId] = useState(currentUserId || employees[0]?.id || '');
  const [subject, setSubject] = useState('Question about Annual / Casual Leave Balance');
  const [message, setMessage] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const targetEmp = employees.find((e) => e.id === selectedEmpId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      setMessage('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0F172A]/50 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#111827] rounded-xl border border-[#CBD5E1] dark:border-[#334155] shadow-xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B]/60">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#ECFDF5] dark:bg-[#064E3B]/40 text-[#0D9488] flex items-center justify-center">
              <Mail className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                Contact HR Operations
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Submit inquiries regarding your statutory leave balance or audit record
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#64748B] hover:text-[#0F172A] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-[#0D9488] mx-auto animate-bounce" />
            <h4 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              Inquiry Dispatched to HR
            </h4>
            <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
              Your message regarding balance reconciliation has been sent to hr-operations@company.com.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                Employee Inquiring
              </label>
              <select
                value={selectedEmpId}
                onChange={(e) => setSelectedEmpId(e.target.value)}
                className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0D9488]"
              >
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.id} — {emp.name} ({emp.department})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                Subject
              </label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full h-10 px-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider mb-1">
                Question / Discrepancy Details
              </label>
              <textarea
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Explain any questions regarding your Annual or Casual leave usage, carry-over, or deduction sequence..."
                className="w-full p-3 bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#475569] rounded-lg text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
                required
              />
            </div>

            <div className="p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155] text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-start gap-2">
              <HelpCircle className="w-4 h-4 shrink-0 mt-0.5 text-[#0284C7]" />
              <span>
                Standard response time for HR balance audits is 1 business day.{' '}
                {targetEmp?.supervisor
                  ? `Supervisor (${targetEmp.supervisor}) will be CC'd.`
                  : 'Your request will be routed directly to HR Leadership.'}
              </span>
            </div>

            <div className="pt-3 border-t border-[#E2E8F0] dark:border-[#334155] flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={onClose}
                className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#0F172A] dark:text-[#EAF1FF] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="h-9 px-4 text-xs font-medium text-white bg-[#0F172A] hover:bg-[#1E293B] rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
              >
                <Send className="w-3.5 h-3.5 text-[#38BDF8]" />
                <span>Submit to HR</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
