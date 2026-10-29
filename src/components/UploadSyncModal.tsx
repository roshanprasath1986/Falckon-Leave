import React, { useState, useRef } from 'react';
import {
  X,
  Upload,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  RefreshCw,
  Download,
  ShieldCheck
} from 'lucide-react';
import { Employee } from '../types/portal';
import { parseCSVAndSync, SyncResult, generateTemplateCSV } from '../utils/leaveCalculations';

interface UploadSyncModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentEmployees: Employee[];
  onConfirmSync: (syncedEmployees: Employee[], countUpdated: number, countAdded: number) => void;
}

export const UploadSyncModal: React.FC<UploadSyncModalProps> = ({
  isOpen,
  onClose,
  currentEmployees,
  onConfirmSync,
}) => {
  if (!isOpen) return null;

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState('');
  const [fileContent, setFileContent] = useState('');
  const [syncResult, setSyncResult] = useState<SyncResult | null>(null);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setError('');
    setIsProcessing(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      setFileContent(text);
      try {
        const result = parseCSVAndSync(text, currentEmployees);
        if (result.errors.length > 0) {
          setError(result.errors.join(' '));
          setSyncResult(null);
        } else {
          setSyncResult(result);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to parse file.');
        setSyncResult(null);
      } finally {
        setIsProcessing(false);
      }
    };

    reader.onerror = () => {
      setError('Error reading file from device.');
      setIsProcessing(false);
    };

    reader.readAsText(file);
  };

  const handleConfirm = () => {
    if (!syncResult) return;
    onConfirmSync(syncResult.updatedEmployees, syncResult.countUpdated, syncResult.countAdded);
    onClose();
  };

  const handleReset = () => {
    setFileName('');
    setFileContent('');
    setSyncResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[#0F172A]/50 backdrop-blur-sm overflow-y-auto">
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#111827] rounded-xl border border-[#CBD5E1] dark:border-[#334155] shadow-2xl overflow-hidden my-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#334155] flex items-center justify-between bg-[#F8FAFC] dark:bg-[#1E293B]/70">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#EFF4FF] dark:bg-[#1E293B] text-[#2563EB] flex items-center justify-center">
              <Upload className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                Upload & Sync Leave Records
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Upload an exported CSV ledger to synchronize monthly leaves and employee entitlements
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

        {/* Modal Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-xs text-rose-700 dark:text-rose-400 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Template Download Section */}
          <div className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-lg bg-[#F8FAFC] dark:bg-[#1E293B]/50 border border-[#E2E8F0] dark:border-[#334155] text-xs">
            <span className="text-[#64748B] dark:text-[#94A3B8] font-medium">
              Need a sample CSV to start?
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const content = generateTemplateCSV('simplified_rows', currentEmployees);
                  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'simplified_monthly_leaves_template.csv';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-2.5 py-1 text-[11px] font-semibold text-[#0284C7] dark:text-[#38BDF8] bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-md hover:bg-slate-50 flex items-center gap-1 shadow-xs"
              >
                <Download className="w-3 h-3" />
                <span>Simplified Template (Month & Leaves only)</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  const content = generateTemplateCSV('full', currentEmployees);
                  const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = 'full_statutory_ledger_template.csv';
                  document.body.appendChild(a);
                  a.click();
                  document.body.removeChild(a);
                }}
                className="px-2.5 py-1 text-[11px] font-medium text-[#64748B] dark:text-[#94A3B8] bg-white dark:bg-[#111827] border border-[#CBD5E1] dark:border-[#334155] rounded-md hover:bg-slate-50 flex items-center gap-1 shadow-xs"
              >
                <Download className="w-3 h-3" />
                <span>Full Ledger Template</span>
              </button>
            </div>
          </div>

          {/* File Upload Zone */}
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-[#CBD5E1] dark:border-[#334155] hover:border-[#0284C7] dark:hover:border-[#38BDF8] rounded-xl p-6 text-center cursor-pointer transition-colors bg-[#F8FAFC] dark:bg-[#0F172A]/40"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv,text/plain"
              onChange={handleFileChange}
              className="hidden"
            />
            <FileSpreadsheet className="w-10 h-10 text-[#0284C7] dark:text-[#38BDF8] mx-auto mb-2 opacity-80" />
            <div className="text-xs font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
              {fileName ? fileName : 'Click to select CSV file to upload & sync'}
            </div>
            <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8] mt-1">
              Supports Simplified Monthly format (Month + Leaves Taken + Remaining), 12-Month Grid, or Full Ledger
            </p>
          </div>

          {/* Sync Analysis Preview */}
          {syncResult && (
            <div className="space-y-3">
              {/* Automatic Sequence Banner */}
              <div className="p-3 rounded-lg bg-[#EFF4FF] dark:bg-[#1E293B] border border-[#BFDBFE] dark:border-[#1E3A8A] text-xs flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#2563EB] shrink-0" />
                  <div>
                    <span className="font-semibold text-[#1E3A8A] dark:text-[#93C5FD]">
                      Automatic Deduction Sequence Allocated:
                    </span>{' '}
                    <span className="text-[#1E40AF] dark:text-[#BFDBFE]">
                      Casual is used 1st; remaining is deducted from Annual automatically.
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 shrink-0">
                  {syncResult.detectedFormat === 'simplified_rows'
                    ? 'Simplified Monthly'
                    : syncResult.detectedFormat === 'simplified_grid'
                    ? '12-Month Grid'
                    : 'Full Ledger'}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                <div className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827]">
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                    Updated Records
                  </span>
                  <span className="text-lg font-bold text-[#0284C7] dark:text-[#38BDF8] tabular-nums">
                    {syncResult.countUpdated} employees
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827]">
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                    New Employees Added
                  </span>
                  <span className="text-lg font-bold text-[#1E40AF] dark:text-[#93C5FD] tabular-nums">
                    {syncResult.countAdded} employees
                  </span>
                </div>

                <div className="p-2.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] bg-white dark:bg-[#111827] col-span-2 sm:col-span-1">
                  <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] uppercase tracking-wider block">
                    Total Processed
                  </span>
                  <span className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tabular-nums">
                    {syncResult.previewRows.length} entries
                  </span>
                </div>
              </div>

              {/* Preview Rows List with Detailed Allocation Sequence */}
              <div className="border border-[#E2E8F0] dark:border-[#334155] rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead className="bg-[#F8FAFC] dark:bg-[#0F172A] border-b border-[#E2E8F0] dark:border-[#334155] text-[10px] font-semibold uppercase text-[#64748B] dark:text-[#94A3B8] sticky top-0">
                    <tr>
                      <th className="py-2 px-3">ID & Name</th>
                      <th className="py-2 px-3">Action</th>
                      <th className="py-2 px-3 text-right">Leaves Taken</th>
                      <th className="py-2 px-3">Casual Deducted (1st)</th>
                      <th className="py-2 px-3">Annual Deducted (2nd)</th>
                      <th className="py-2 px-3 text-right">Total Remaining</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#F1F5F9] dark:divide-[#1E293B]">
                    {syncResult.previewRows.map((row) => (
                      <tr key={row.id} className="hover:bg-slate-50 dark:hover:bg-[#1E293B]/40">
                        <td className="py-2 px-3">
                          <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">
                            {row.name}
                          </div>
                          <div className="text-[10px] font-mono text-[#64748B] dark:text-[#94A3B8]">
                            {row.id}
                          </div>
                        </td>
                        <td className="py-2 px-3">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[10px] font-semibold ${
                              row.action === 'Updated'
                                ? 'bg-[#E0F2FE] text-[#0284C7] dark:bg-[#1E3A8A]/40 dark:text-[#38BDF8]'
                                : 'bg-[#EFF4FF] text-[#1E40AF] dark:bg-[#1E3A8A]/40 dark:text-[#93C5FD]'
                            }`}
                          >
                            {row.action}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          {row.totalTaken.toFixed(1)}d
                        </td>
                        <td className="py-2 px-3 tabular-nums">
                          <span className="font-semibold text-[#0284C7] dark:text-[#38BDF8]">
                            {row.casualAllocated.toFixed(1)}d
                          </span>
                          <span className="text-[10px] text-[#64748B] block">
                            {row.casualRemaining.toFixed(1)}d left
                          </span>
                        </td>
                        <td className="py-2 px-3 tabular-nums">
                          <span className="font-semibold text-[#1E40AF] dark:text-[#93C5FD]">
                            {row.annualAllocated.toFixed(1)}d
                          </span>
                          <span className="text-[10px] text-[#64748B] block">
                            {row.annualRemaining.toFixed(1)}d left
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right tabular-nums font-bold text-[#0F172A] dark:text-[#F8FAFC]">
                          {row.totalRemaining.toFixed(1)}d
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-[#E2E8F0] dark:border-[#334155] bg-[#F8FAFC] dark:bg-[#1E293B]/60 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleReset}
            className="h-9 px-3 text-xs font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#64748B] hover:text-[#0F172A] dark:hover:text-white bg-white dark:bg-[#111827] rounded-lg transition-colors flex items-center gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset</span>
          </button>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#475569] text-[#0F172A] dark:text-[#EAF1FF] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              disabled={!syncResult || syncResult.previewRows.length === 0}
              className="h-9 px-5 text-xs font-semibold text-white bg-[#0F172A] hover:bg-[#1E293B] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-1.5 shadow-xs"
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>Confirm & Sync Records</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
