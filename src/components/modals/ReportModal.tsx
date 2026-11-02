import React, { useState } from 'react';
import { X, ShieldAlert, Check } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { submitReport } from '../../firebase/services';

interface ReportModalProps {
  targetId: string;
  targetType: 'post' | 'user' | 'comment' | 'reel';
  onClose: () => void;
}

const REPORT_REASONS = [
  'Spam, scam, or deceptive content',
  'Harassment or hate speech',
  'Inappropriate or explicit imagery',
  'Intellectual property infringement',
  'Misinformation or harmful conduct',
];

export const ReportModal: React.FC<ReportModalProps> = ({ targetId, targetType, onClose }) => {
  const { userProfile } = useAuth();
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userProfile || submitting) return;
    setSubmitting(true);

    try {
      await submitReport({
        reporterId: userProfile.uid,
        targetId,
        targetType,
        reason: selectedReason,
        details: details.trim() || '',
      });
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1800);
    } catch (err) {
      console.error(err);
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in select-none">
      <div className="relative w-full max-w-sm bg-[#120E22] border border-rose-500/25 rounded-3xl p-6 shadow-2xl flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-base font-bold text-white font-['Space_Grotesk']">
              Report Content
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/10 text-purple-300 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center gap-3">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center ring-2 ring-emerald-500/40">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="text-sm font-bold text-white">Thank You for Reporting</h4>
            <p className="text-xs text-purple-200/60 leading-relaxed">
              Our safety and moderation team will review this {targetType} promptly.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <p className="text-xs text-purple-200/70 leading-relaxed">
              Why are you reporting this {targetType}? Your report is strictly anonymous.
            </p>

            <div className="flex flex-col gap-1.5">
              {REPORT_REASONS.map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-2.5 p-2.5 rounded-xl border text-xs cursor-pointer transition-colors ${
                    selectedReason === reason
                      ? 'bg-rose-950/40 border-rose-500/50 text-white font-medium'
                      : 'bg-white/5 border-transparent text-purple-200/70 hover:bg-white/10'
                  }`}
                >
                  <input
                    type="radio"
                    name="reason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="accent-pink-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="text-[11px] font-semibold text-purple-200/70 mb-1 block">
                Additional Details (Optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                placeholder="Help us understand the issue..."
                className="w-full bg-purple-950/30 border border-purple-800/30 rounded-xl p-2.5 text-xs text-white placeholder-purple-300/40 focus:outline-none focus:border-rose-500 resize-none"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-rose-600 to-pink-600 hover:from-rose-500 hover:to-pink-500 text-white font-semibold text-xs shadow-lg shadow-rose-600/30 transition-all cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Submitting...' : 'Submit Report'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
