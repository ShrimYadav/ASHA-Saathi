import React from 'react';
import { ShieldCheck, Check } from 'lucide-react';

interface MobileTrustModalProps {
  onLearnMore?: () => void;
}

export const MobileTrustModal: React.FC<MobileTrustModalProps> = ({
  onLearnMore,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-slate-800 p-6 min-h-[580px] text-center">
      <div className="my-auto space-y-4 max-w-[270px] mx-auto">
        {/* Shield Icon */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
          <ShieldCheck className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Trust Mode
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          Your data is secure and only accessible to you and authorized health officials.
        </p>

        {/* Security Checklist */}
        <div className="pt-2 text-left space-y-2.5 text-xs text-slate-700 font-medium">
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
            <span>End-to-end encryption</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
            <span>Your data, your control</span>
          </div>
          <div className="flex items-center gap-2.5">
            <Check className="w-4 h-4 text-emerald-600 shrink-0 stroke-[2.5]" />
            <span>No unwanted sharing</span>
          </div>
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={onLearnMore}
          className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-colors"
        >
          Learn More
        </button>
      </div>
    </div>
  );
};
