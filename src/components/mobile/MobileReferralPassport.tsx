import React, { useState } from 'react';
import {
  ArrowLeft,
  Share2,
  Download,
  Check,
  Building2,
  Calendar,
  User,
  Hash,
} from 'lucide-react';
import { MOCK_KAMAL_REFERRAL } from '../../data/mockData';

interface MobileReferralPassportProps {
  onBack?: () => void;
  onDone?: () => void;
  onTrack?: () => void;
}

export const MobileReferralPassport: React.FC<MobileReferralPassportProps> = ({
  onBack,
  onDone,
  onTrack,
}) => {
  const [copied, setCopied] = useState(false);

  const handleShare = () => {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 text-slate-800 p-4 min-h-[580px]">
      <div>
        {/* Header */}
        <div className="flex items-center gap-2 pb-1">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">
            Referral Passport
          </h2>
        </div>

        {/* Subtitle */}
        <p className="text-xs text-slate-500 pl-6 mb-3">
          Scan this QR code at the health centre
        </p>

        {/* Passport Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-4">
          {/* QR Code Graphic with corner markers */}
          <div className="flex flex-col items-center justify-center p-3 bg-slate-50/80 rounded-xl border border-slate-200/60">
            <div className="relative p-2 bg-white rounded-xl shadow-xs border border-slate-100">
              {/* Crisp SVG QR Code */}
              <svg
                viewBox="0 0 160 160"
                className="w-36 h-36"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {/* Background */}
                <rect width="160" height="160" fill="white" />
                
                {/* Top-Left Finder */}
                <rect x="12" y="12" width="40" height="40" rx="6" stroke="#064e3b" strokeWidth="6" fill="white" />
                <rect x="22" y="22" width="20" height="20" rx="3" fill="#064e3b" />

                {/* Top-Right Finder */}
                <rect x="108" y="12" width="40" height="40" rx="6" stroke="#064e3b" strokeWidth="6" fill="white" />
                <rect x="118" y="22" width="20" height="20" rx="3" fill="#064e3b" />

                {/* Bottom-Left Finder */}
                <rect x="12" y="108" width="40" height="40" rx="6" stroke="#064e3b" strokeWidth="6" fill="white" />
                <rect x="22" y="118" width="20" height="20" rx="3" fill="#064e3b" />

                {/* Data Matrix Modules */}
                <g fill="#0b533e">
                  <rect x="62" y="16" width="8" height="8" rx="1.5" />
                  <rect x="80" y="16" width="8" height="8" rx="1.5" />
                  <rect x="71" y="28" width="8" height="8" rx="1.5" />
                  <rect x="89" y="28" width="8" height="8" rx="1.5" />
                  <rect x="62" y="40" width="8" height="8" rx="1.5" />

                  <rect x="16" y="62" width="8" height="8" rx="1.5" />
                  <rect x="28" y="71" width="8" height="8" rx="1.5" />
                  <rect x="40" y="62" width="8" height="8" rx="1.5" />
                  <rect x="16" y="80" width="8" height="8" rx="1.5" />
                  <rect x="34" y="89" width="8" height="8" rx="1.5" />

                  <rect x="62" y="62" width="8" height="8" rx="1.5" />
                  <rect x="74" y="62" width="8" height="8" rx="1.5" />
                  <rect x="86" y="74" width="8" height="8" rx="1.5" />
                  <rect x="62" y="86" width="8" height="8" rx="1.5" />
                  <rect x="77" y="89" width="8" height="8" rx="1.5" />
                  <rect x="92" y="62" width="8" height="8" rx="1.5" />

                  <rect x="112" y="62" width="8" height="8" rx="1.5" />
                  <rect x="128" y="74" width="8" height="8" rx="1.5" />
                  <rect x="140" y="62" width="8" height="8" rx="1.5" />
                  <rect x="118" y="86" width="8" height="8" rx="1.5" />
                  <rect x="134" y="89" width="8" height="8" rx="1.5" />

                  <rect x="62" y="112" width="8" height="8" rx="1.5" />
                  <rect x="74" y="124" width="8" height="8" rx="1.5" />
                  <rect x="86" y="112" width="8" height="8" rx="1.5" />
                  <rect x="68" y="136" width="8" height="8" rx="1.5" />
                  <rect x="86" y="136" width="8" height="8" rx="1.5" />

                  <rect x="112" y="112" width="8" height="8" rx="1.5" />
                  <rect x="124" y="124" width="8" height="8" rx="1.5" />
                  <rect x="136" y="112" width="8" height="8" rx="1.5" />
                  <rect x="112" y="136" width="8" height="8" rx="1.5" />
                  <rect x="128" y="136" width="8" height="8" rx="1.5" />
                </g>

                {/* Center Badge: Heart / Health */}
                <circle cx="80" cy="80" r="14" fill="white" stroke="#064e3b" strokeWidth="2.5" />
                <path
                  d="M80 87C80 87 73 82.5 73 78C73 75.8 74.8 74 77 74C78.4 74 79.5 74.8 80 75.5C80.5 74.8 81.6 74 83 74C85.2 74 87 75.8 87 78C87 82.5 80 87 80 87Z"
                  fill="#059669"
                />
              </svg>
            </div>
            <span className="text-[10px] font-mono font-bold text-slate-500 mt-2">
              {MOCK_KAMAL_REFERRAL.referralId}
            </span>
          </div>

          {/* Details list */}
          <div className="space-y-2 text-xs divide-y divide-slate-100">
            <div className="flex justify-between py-1">
              <span className="text-slate-500 text-[11px]">Referral ID</span>
              <span className="font-mono font-bold text-slate-800 text-[11px]">
                {MOCK_KAMAL_REFERRAL.referralId}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500 text-[11px]">Patient</span>
              <span className="font-bold text-slate-800">
                {MOCK_KAMAL_REFERRAL.patientName}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500 text-[11px]">Referred To</span>
              <span className="font-semibold text-emerald-800">
                {MOCK_KAMAL_REFERRAL.referredTo}
              </span>
            </div>

            <div className="flex justify-between py-1">
              <span className="text-slate-500 text-[11px]">Date</span>
              <span className="font-semibold text-slate-800">
                {MOCK_KAMAL_REFERRAL.date}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Buttons */}
      <div className="pt-3 flex gap-2">
        <button
          onClick={handleShare}
          className="flex-1 py-3 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors flex items-center justify-center gap-1.5 shadow-2xs"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-600" />
              <span>Saved!</span>
            </>
          ) : (
            <>
              <Share2 className="w-3.5 h-3.5" />
              <span>Share / Save</span>
            </>
          )}
        </button>

        <button
          onClick={onDone || onTrack}
          className="flex-1 py-3 px-3 rounded-xl bg-[#0b533e] hover:bg-[#064e3b] text-white font-bold text-xs shadow-md active:scale-95 transition-all text-center"
        >
          Done
        </button>
      </div>
    </div>
  );
};
