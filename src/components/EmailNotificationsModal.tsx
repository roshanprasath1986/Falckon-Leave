import React, { useState, useEffect } from 'react';
import {
  X,
  Mail,
  Send,
  Inbox,
  Trash2,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Search,
  ExternalLink
} from 'lucide-react';
import { SimulatedEmail } from '../types/portal';
import { getSimulatedEmails, clearSimulatedEmails } from '../utils/emailDispatcher';

interface EmailNotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUserEmail?: string;
  isAdmin?: boolean;
}

export const EmailNotificationsModal: React.FC<EmailNotificationsModalProps> = ({
  isOpen,
  onClose,
  currentUserEmail,
  isAdmin = false,
}) => {
  const [emails, setEmails] = useState<SimulatedEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<SimulatedEmail | null>(null);
  const [filterType, setFilterType] = useState<'ALL' | 'MINE' | 'HR'>('ALL');
  const [search, setSearch] = useState('');

  const refreshEmails = () => {
    const list = getSimulatedEmails();
    setEmails(list);
    if (list.length > 0 && !selectedEmail) {
      setSelectedEmail(list[0]);
    }
  };

  useEffect(() => {
    if (isOpen) {
      refreshEmails();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleDispatched = () => {
      refreshEmails();
    };
    window.addEventListener('portal-email-dispatched', handleDispatched);
    return () => window.removeEventListener('portal-email-dispatched', handleDispatched);
  }, []);

  if (!isOpen) return null;

  const filteredEmails = emails.filter((em) => {
    if (filterType === 'MINE' && currentUserEmail) {
      if (em.to.toLowerCase() !== currentUserEmail.toLowerCase()) return false;
    }
    if (filterType === 'HR') {
      if (!em.to.includes('hr-operations') && !em.subject.includes('HR')) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        em.subject.toLowerCase().includes(q) ||
        em.to.toLowerCase().includes(q) ||
        em.toName.toLowerCase().includes(q) ||
        em.body.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const handleClear = () => {
    if (confirm('Clear all simulated email records?')) {
      clearSimulatedEmails();
      setEmails([]);
      setSelectedEmail(null);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-4xl bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-2xl overflow-hidden flex flex-col h-[85vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                  Simulated Email Notifications Center
                </h3>
                <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                  Live Dispatch
                </span>
              </div>
              <p className="text-xs text-[#64748B] dark:text-[#94A3B8]">
                Real-time email logs dispatched to Supervisors, HR Admin, and Employees upon leave requests & approvals
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {emails.length > 0 && (
              <button
                type="button"
                onClick={handleClear}
                className="p-1.5 rounded-lg border border-[#CBD5E1] dark:border-[#334155] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs transition-colors"
                title="Clear all email records"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Toolbar */}
        <div className="px-6 py-3 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-white dark:bg-[#0A0D14] flex flex-wrap items-center justify-between gap-3 shrink-0">
          {/* Tabs */}
          <div className="flex items-center gap-1.5 p-1 bg-[#F1F5F9] dark:bg-[#0F172A] rounded-xl border border-[#E2E8F0] dark:border-[#1E293B]">
            <button
              type="button"
              onClick={() => setFilterType('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'ALL'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              All Messages ({emails.length})
            </button>
            {currentUserEmail && (
              <button
                type="button"
                onClick={() => setFilterType('MINE')}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  filterType === 'MINE'
                    ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs'
                    : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
                }`}
              >
                Delivered to Me
              </button>
            )}
            <button
              type="button"
              onClick={() => setFilterType('HR')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                filterType === 'HR'
                  ? 'bg-white dark:bg-[#1E293B] text-[#0F172A] dark:text-white shadow-xs'
                  : 'text-[#64748B] hover:text-[#0F172A] dark:hover:text-white'
              }`}
            >
              HR Administration Copies
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search subject, recipient, body..."
              className="w-full h-8 pl-8 pr-3 rounded-lg border border-[#CBD5E1] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#111827] text-xs text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#0284C7]"
            />
          </div>
        </div>

        {/* Two-Pane Body: Email List on Left, Email Viewer on Right */}
        <div className="flex-1 flex overflow-hidden">
          {/* Left Email List */}
          <div className="w-full md:w-5/12 border-r border-[#E2E8F0] dark:border-[#1E293B] overflow-y-auto divide-y divide-[#E2E8F0] dark:divide-[#1E293B]">
            {filteredEmails.length === 0 ? (
              <div className="p-8 text-center text-xs text-[#64748B] dark:text-[#94A3B8] space-y-2">
                <Mail className="w-8 h-8 mx-auto text-[#94A3B8] opacity-50" />
                <p>No email notifications found in this view.</p>
                <p className="text-[11px]">
                  When an employee applies for leave or when leave is approved, notifications appear here instantly.
                </p>
              </div>
            ) : (
              filteredEmails.map((em) => {
                const isSelected = selectedEmail?.id === em.id;
                const isApproval = em.type === 'LEAVE_APPROVED_TO_EMPLOYEE';
                const isSupervisor = em.type === 'LEAVE_SUBMITTED_TO_SUPERVISOR';
                const isRejected = em.type === 'LEAVE_REJECTED_TO_EMPLOYEE';

                return (
                  <button
                    key={em.id}
                    type="button"
                    onClick={() => setSelectedEmail(em)}
                    className={`w-full text-left p-3.5 transition-colors flex flex-col gap-1 ${
                      isSelected
                        ? 'bg-[#E0F2FE]/60 dark:bg-[#1E3A8A]/30 border-l-4 border-l-[#0284C7]'
                        : 'hover:bg-[#F8FAFC] dark:hover:bg-[#0F172A]/40'
                    }`}
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-bold text-[#0F172A] dark:text-[#F8FAFC] truncate max-w-[160px]">
                        To: {em.toName}
                      </span>
                      <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] shrink-0">
                        {em.sentAt.split(',')[1] || em.sentAt}
                      </span>
                    </div>

                    <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC] truncate">
                      {em.subject}
                    </div>

                    <div className="flex items-center justify-between mt-1 text-[10px]">
                      <span className="text-[#64748B] dark:text-[#94A3B8] truncate max-w-[180px]">
                        {em.to}
                      </span>
                      {isApproval && (
                        <span className="px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold">
                          Approved
                        </span>
                      )}
                      {isSupervisor && (
                        <span className="px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300 font-bold">
                          Supervisor Action
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-1.5 py-0.2 rounded bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300 font-bold">
                          Rejected
                        </span>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Right Email Preview Pane */}
          <div className="hidden md:flex flex-1 flex-col bg-[#F8FAFC]/50 dark:bg-[#07090E] overflow-y-auto p-6">
            {selectedEmail ? (
              <div className="space-y-5 bg-white dark:bg-[#0A0D14] p-6 rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-xs">
                {/* Meta details */}
                <div className="border-b border-[#E2E8F0] dark:border-[#1E293B] pb-4 space-y-2">
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="text-base font-bold text-[#0F172A] dark:text-[#F8FAFC] leading-snug">
                      {selectedEmail.subject}
                    </h2>
                    <span className="text-xs text-[#64748B] dark:text-[#94A3B8] shrink-0 font-medium">
                      {selectedEmail.sentAt}
                    </span>
                  </div>

                  <div className="text-xs space-y-1 text-[#475569] dark:text-[#94A3B8]">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] w-12">From:</span>
                      <code className="text-[#0284C7] dark:text-[#38BDF8]">{selectedEmail.from}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] w-12">To:</span>
                      <span>
                        <strong>{selectedEmail.toName}</strong> &lt;{selectedEmail.to}&gt;
                      </span>
                    </div>
                  </div>
                </div>

                {/* Email Body */}
                <div className="text-xs text-[#1E293B] dark:text-[#E2E8F0] whitespace-pre-wrap leading-relaxed font-sans font-normal p-4 bg-[#F8FAFC] dark:bg-[#0F172A]/70 rounded-xl border border-[#E2E8F0] dark:border-[#1E293B]">
                  {selectedEmail.body}
                </div>

                {/* Footer simulation notice */}
                <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] flex items-center justify-between pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#0284C7] dark:text-[#38BDF8]" />
                    <span>Dispatched via Enterprise Notification Gateway (RFC 5322 Compliant)</span>
                  </span>
                  <a
                    href={`mailto:${selectedEmail.to}?subject=${encodeURIComponent(
                      selectedEmail.subject
                    )}`}
                    className="text-[#0284C7] dark:text-[#38BDF8] hover:underline flex items-center gap-1 font-semibold"
                  >
                    <span>Open in Mail Client</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-xs text-[#64748B] dark:text-[#94A3B8]">
                Select an email notification from the left column to view its full contents.
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex justify-end shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="h-8 px-4 text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-lg hover:bg-slate-50 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
