import React, { useState } from 'react';
import { X, AlertTriangle, CheckCircle } from 'lucide-react';
import { api } from '../lib/api.js';

interface ReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetType: 'actress' | 'image';
  targetId: string;
  targetName?: string;
}

export const ReportModal: React.FC<ReportModalProps> = ({
  isOpen,
  onClose,
  targetType,
  targetId,
  targetName,
}) => {
  const [reason, setReason] = useState('Inappropriate content');
  const [details, setDetails] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.submitReport({
        targetType,
        targetId,
        reason,
        details,
      });
      setSubmitted(true);
      setTimeout(() => {
        setSubmitted(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
      <div className="w-full max-w-md rounded-2xl bg-[#15151C] border border-[#262635] p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-[#A1A1B5] hover:text-[#F7F7FA] p-1 rounded-lg"
        >
          <X className="w-4 h-4" />
        </button>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center">
            <CheckCircle className="w-12 h-12 text-emerald-400 mb-3" />
            <h3 className="text-lg font-bold text-[#F7F7FA] font-display">Report Submitted</h3>
            <p className="text-xs text-[#A1A1B5] mt-1">
              Thank you. Our moderation team has received the report and will review it promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex items-center gap-2 text-rose-400">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <h3 className="text-base font-bold text-[#F7F7FA] font-display">
                Report {targetType === 'actress' ? 'Profile' : 'Image'}
              </h3>
            </div>

            {targetName && (
              <p className="text-xs text-[#A1A1B5]">
                Reporting target: <span className="text-[#F7F7FA] font-medium">{targetName}</span>
              </p>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A1A1B5] font-medium">Select Reason</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl bg-[#0B0B0F] border border-[#262635] px-3 py-2 text-xs text-[#F7F7FA] focus:outline-hidden focus:border-[#8B5CF6]"
              >
                <option value="Inappropriate content">Inappropriate or explicit content</option>
                <option value="Copyright infringement">Copyright infringement / Unauthorized photo</option>
                <option value="Misleading or inaccurate identity">Misleading identity or impersonation</option>
                <option value="Poor quality or duplicate">Low resolution, broken file, or duplicate</option>
                <option value="Harassment or abuse">Harassment or abusive submission</option>
                <option value="Other violation">Other community guideline violation</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-[#A1A1B5] font-medium">Additional Details (Optional)</label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={3}
                placeholder="Provide any context that helps moderators verify this report..."
                className="w-full rounded-xl bg-[#0B0B0F] border border-[#262635] p-3 text-xs text-[#F7F7FA] placeholder-[#55556E] focus:outline-hidden focus:border-[#8B5CF6] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-3 mt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#A1A1B5] hover:text-[#F7F7FA]"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-rose-600 hover:bg-rose-500 text-white transition-colors"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
