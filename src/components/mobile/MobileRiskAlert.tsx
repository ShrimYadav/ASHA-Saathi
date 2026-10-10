import React, { useState } from 'react';
import {
  ArrowLeft,
  AlertOctagon,
  ChevronRight,
  ShieldAlert,
  FileCheck2,
  X,
  Loader2,
} from 'lucide-react';
import { ASSETS } from '../../data/mockData';
import { api } from '../../services/api';

interface MobileRiskAlertProps {
  onBack?: () => void;
  onMarkReferred?: (referral: any) => void;
  onSaveContinue?: () => void;
}

export const MobileRiskAlert: React.FC<MobileRiskAlertProps> = ({
  onBack,
  onMarkReferred,
  onSaveContinue,
}) => {
  const [showProtocol, setShowProtocol] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleReferralCreation = async () => {
    setIsSubmitting(true);
    try {
      const res = await api.createReferral({
        personId: 'P03',
        personName: 'Kamal Singh',
        personAge: 42,
        personGender: 'Male',
        householdId: 'HH-03',
        referredToFacility: 'District Hospital',
        reason: 'Possible TB Symptoms Detected (Persistent cough > 2 weeks, night sweats)',
        protocolCode: 'NTEP-TB-RULE-01',
        urgency: 'HIGH_PRIORITY',
      });

      if (onMarkReferred) {
        onMarkReferred(res.referral);
      }
    } catch (e) {
      console.error('Referral creation error:', e);
      if (onMarkReferred) onMarkReferred(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 text-slate-800 p-4 min-h-[580px]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">
            Risk Alert
          </h2>
        </div>

        {/* High Priority Warning Card */}
        <div className="bg-rose-50/90 rounded-2xl p-4 border border-rose-200/80 shadow-2xs flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-xs">
            <AlertOctagon className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-rose-800">
              High Priority Case
            </h3>
            <p className="text-xs font-semibold text-rose-950 mt-0.5">
              Possible TB Symptoms Detected
            </p>
          </div>
        </div>

        {/* Patient Profile & Symptoms */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3.5">
          {/* Patient info */}
          <div className="flex items-center gap-3 pb-3 border-b border-slate-100">
            <img
              src={ASSETS.kamalSingh}
              alt="Kamal Singh"
              className="w-11 h-11 rounded-full object-cover ring-2 ring-rose-300"
            />
            <div>
              <h4 className="text-sm font-bold text-slate-900 leading-tight">
                Kamal Singh
              </h4>
              <p className="text-xs text-slate-500 font-medium mt-0.5">
                Age: 42 | Male
              </p>
            </div>
          </div>

          {/* Symptoms List */}
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-800">
              Symptoms detected:
            </p>
            <ul className="space-y-1.5 text-xs text-slate-700">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>Persistent cough (&gt;2 weeks)</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>Weight loss</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 shrink-0" />
                <span>Night sweats</span>
              </li>
            </ul>
          </div>

          {/* Protocol link */}
          <div className="pt-1">
            <button
              onClick={() => setShowProtocol(!showProtocol)}
              className="text-xs font-semibold text-emerald-800 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              <FileCheck2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>View Protocol Details</span>
            </button>
          </div>

          {showProtocol && (
            <div className="p-3 bg-slate-50 rounded-xl text-[11px] text-slate-600 space-y-1 border border-slate-200/60">
              <p className="font-bold text-slate-800">NTEP Protocol Guidelines (Rule: NTEP-TB-RULE-01):</p>
              <p>1. Fast-track sputum smear microscopy / CBNAAT test at PHC.</p>
              <p>2. Provide N-95 or surgical mask and educate household.</p>
              <p>3. Generate urgent digital referral passport to District Hospital.</p>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="pt-4 space-y-2.5 text-center">
        <button
          onClick={handleReferralCreation}
          disabled={isSubmitting}
          className="w-full py-3.5 px-4 rounded-xl bg-[#b91c1c] hover:bg-[#991b1b] active:scale-95 text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Generating Passport...</span>
            </>
          ) : (
            'Mark as Referred & Issue Passport'
          )}
        </button>

        <button
          onClick={onSaveContinue}
          className="text-xs font-semibold text-slate-600 hover:text-slate-800 block w-full py-1"
        >
          Save &amp; Continue
        </button>
      </div>
    </div>
  );
};

