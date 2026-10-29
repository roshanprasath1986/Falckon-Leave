import React, { useState, useEffect, useRef } from 'react';
import { Building2, Upload, Trash2, Check, Image as ImageIcon, Sparkles, X } from 'lucide-react';

interface CompanyLogoProps {
  className?: string;
  watermark?: boolean;
}

export const DEFAULT_COMPANY_LOGO = '/assets/aistudio/New_logo-without_background.jpg_205f3496.png';
const STORAGE_KEY = 'executive_company_logo_v1';

export const CompanyLogo: React.FC<CompanyLogoProps> = ({ className = 'w-9 h-9', watermark = false }) => {
  const [logoUrl, setLogoUrl] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) return saved;
    }
    return DEFAULT_COMPANY_LOGO;
  });

  useEffect(() => {
    const handleStorage = () => {
      const saved = localStorage.getItem(STORAGE_KEY);
      setLogoUrl(saved || DEFAULT_COMPANY_LOGO);
    };
    window.addEventListener('company-logo-updated', handleStorage);
    window.addEventListener('storage', handleStorage);
    return () => {
      window.removeEventListener('company-logo-updated', handleStorage);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt="Falckon Health Logo"
        className={`${className} object-contain select-none transition-all duration-200`}
      />
    );
  }

  // Authoritative Executive Geometric Company Insignia (Predominant Dark Blue, Light Blue, White, Black)
  if (watermark) {
    return (
      <svg
        viewBox="0 0 240 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={className}
      >
        <circle cx="120" cy="120" r="110" stroke="currentColor" strokeWidth="4" strokeDasharray="6 6" />
        <circle cx="120" cy="120" r="92" stroke="currentColor" strokeWidth="8" />
        {/* Hexagonal Shield Foundation */}
        <path
          d="M120 30L190 70V150L120 190L50 150V70L120 30Z"
          stroke="currentColor"
          strokeWidth="6"
          strokeLinejoin="round"
        />
        {/* Diamond Core & Rest Accents */}
        <path
          d="M120 60L160 110L120 160L80 110L120 60Z"
          fill="currentColor"
          fillOpacity="0.2"
          stroke="currentColor"
          strokeWidth="6"
        />
        {/* Geometric Balance Pillars */}
        <line x1="120" y1="60" x2="120" y2="160" stroke="currentColor" strokeWidth="6" />
        <line x1="80" y1="110" x2="160" y2="110" stroke="currentColor" strokeWidth="6" />
        <circle cx="120" cy="110" r="14" fill="currentColor" />
        <circle cx="120" cy="110" r="6" fill="#FFFFFF" />
      </svg>
    );
  }

  return (
    <div className={`relative flex items-center justify-center shrink-0 rounded-xl bg-gradient-to-br from-[#0F172A] via-[#1E293B] to-[#0284C7] p-2 shadow-sm border border-[#334155] ${className}`}>
      <svg
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full"
      >
        <path
          d="M16 3L27 9.5V20.5L16 27L5 20.5V9.5L16 3Z"
          stroke="#38BDF8"
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M16 8L22 15L16 22L10 15L16 8Z"
          fill="#38BDF8"
          fillOpacity="0.3"
          stroke="#FFFFFF"
          strokeWidth="1.5"
        />
        <circle cx="16" cy="15" r="2.5" fill="#FFFFFF" />
      </svg>
    </div>
  );
};

interface LogoUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogoUpdated: () => void;
}

export const LogoUploadModal: React.FC<LogoUploadModalProps> = ({ isOpen, onClose, onLogoUpdated }) => {
  const [currentLogo, setCurrentLogo] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem(STORAGE_KEY) || DEFAULT_COMPANY_LOGO;
    }
    return DEFAULT_COMPANY_LOGO;
  });
  const [preview, setPreview] = useState<string | null>(currentLogo);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      const saved = localStorage.getItem(STORAGE_KEY) || DEFAULT_COMPANY_LOGO;
      setCurrentLogo(saved);
      setPreview(saved);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 3 * 1024 * 1024) {
      alert('File size exceeds 3MB limit. Please select a smaller logo image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setPreview(result);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    if (preview && preview !== DEFAULT_COMPANY_LOGO) {
      localStorage.setItem(STORAGE_KEY, preview);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    window.dispatchEvent(new Event('company-logo-updated'));
    onLogoUpdated();
    onClose();
  };

  const handleRemove = () => {
    setPreview(DEFAULT_COMPANY_LOGO);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#020617]/70 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md bg-white dark:bg-[#0A0D14] rounded-2xl border border-[#CBD5E1] dark:border-[#1E293B] shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#E2E8F0] dark:border-[#1E293B] bg-[#F8FAFC] dark:bg-[#0F172A] flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E0F2FE] dark:bg-[#1E3A8A]/50 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center shrink-0">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                Company Brand & Logo
              </h3>
              <p className="text-[11px] text-[#64748B] dark:text-[#94A3B8]">
                Display logo behind the app as watermark & in header
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md text-[#94A3B8] hover:text-[#0F172A] dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Preview Box */}
          <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#CBD5E1] dark:border-[#334155] rounded-xl bg-[#F8FAFC] dark:bg-[#0F172A]/40 min-h-[160px] text-center">
            {preview ? (
              <div className="relative group">
                <img
                  src={preview}
                  alt="Company Logo Preview"
                  className="max-h-28 max-w-full object-contain mx-auto rounded-lg shadow-xs"
                />
                <button
                  type="button"
                  onClick={handleRemove}
                  className="absolute -top-2 -right-2 p-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full shadow-md transition-transform hover:scale-110"
                  title="Remove custom logo"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="space-y-2 text-[#64748B] dark:text-[#94A3B8]">
                <div className="w-12 h-12 rounded-xl bg-[#E0F2FE] dark:bg-[#1E3A8A]/40 text-[#0284C7] dark:text-[#38BDF8] flex items-center justify-center mx-auto">
                  <Building2 className="w-6 h-6" />
                </div>
                <div className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                  Default Executive Monogram Active
                </div>
                <div className="text-[11px]">
                  Upload your organization's PNG, JPG, or SVG company logo
                </div>
              </div>
            )}
          </div>

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png,image/jpeg,image/svg+xml,image/webp"
            onChange={handleFileChange}
            className="hidden"
          />

          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="flex-1 h-9 px-3 bg-[#0F172A] hover:bg-[#1E293B] text-white text-xs font-medium rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-xs"
            >
              <Upload className="w-3.5 h-3.5 text-[#38BDF8]" />
              <span>{preview ? 'Choose Different Logo File' : 'Upload Company Logo Image'}</span>
            </button>
            {preview && (
              <button
                type="button"
                onClick={handleRemove}
                className="h-9 px-3 border border-[#CBD5E1] dark:border-[#334155] text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-xs font-medium rounded-lg transition-colors"
                title="Reset to default company emblem"
              >
                Reset Default
              </button>
            )}
          </div>

          <div className="text-[11px] text-[#64748B] dark:text-[#94A3B8] bg-[#F1F5F9] dark:bg-[#1E293B]/50 p-3 rounded-lg border border-[#E2E8F0] dark:border-[#334155] space-y-1">
            <div className="font-semibold text-[#0F172A] dark:text-[#F8FAFC]">Where this appears:</div>
            <ul className="list-disc pl-4 space-y-0.5">
              <li>Header navigation badge and company portal title</li>
              <li>Atmospheric background watermark behind all screens and tables</li>
              <li>Employee portal and login authentication cards</li>
            </ul>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-[#E2E8F0] dark:border-[#1E293B]">
            <button
              type="button"
              onClick={onClose}
              className="h-9 px-4 text-xs font-medium border border-[#CBD5E1] dark:border-[#334155] text-[#0F172A] dark:text-[#F8FAFC] bg-white dark:bg-[#111827] rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-5 text-xs font-semibold text-white bg-[#0284C7] hover:bg-[#0369A1] rounded-lg transition-colors flex items-center gap-1.5 shadow-sm"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Save & Apply Logo</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
