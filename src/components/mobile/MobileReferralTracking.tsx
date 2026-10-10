import React, { useEffect, useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Building2,
  Check,
  Stethoscope,
  ChevronRight,
  RefreshCw,
} from 'lucide-react';
import { api } from '../../services/api';

interface MobileReferralTrackingProps {
  referralId?: string;
  onBack?: () => void;
  onViewDetails?: () => void;
}

export const MobileReferralTracking: React.FC<MobileReferralTrackingProps> = ({
  referralId,
  onBack,
  onViewDetails,
}) => {
  const [referral, setReferral] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchTracking = async () => {
    setLoading(true);
    try {
      const res = await api.getReferrals();
      if (res.referrals && res.referrals.length > 0) {
        const found = referralId
          ? res.referrals.find((r: any) => r.id === referralId) || res.referrals[0]
          : res.referrals[0];
        setReferral(found);
      }
    } catch (e) {
      console.warn('Could not fetch tracking:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTracking();
  }, [referralId]);

  const hasEvent = (type: string) => {
    return referral?.events?.some((e: any) => e.eventType === type);
  };

  const getEventTime = (type: string) => {
    const ev = referral?.events?.find((e: any) => e.eventType === type);
    return ev?.timestamp;
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 text-slate-800 p-4 min-h-[580px]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-slate-900">
              Referral Tracking
            </h2>
          </div>
          <button
            onClick={fetchTracking}
            className="p-1 text-slate-400 hover:text-emerald-700"
            title="Refresh Timeline"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Stepper Timeline Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs">
          <div className="space-y-5 relative">
            {/* Step 1: Generated */}
            <div className="flex items-start gap-3 relative">
              <div className="relative z-10 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Referral Generated
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {getEventTime('GENERATED') || '10 Oct 2026, 09:12 AM'}
                </p>
              </div>
              {/* Connecting line */}
              <div className={`absolute left-3 top-6 w-[2px] h-6 -translate-x-1/2 ${hasEvent('REACHED') ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            </div>

            {/* Step 2: Reached Facility */}
            <div className="flex items-start gap-3 relative">
              <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${hasEvent('REACHED') ? 'bg-blue-600 text-white' : 'bg-slate-100 border border-slate-300 text-slate-400'}`}>
                {hasEvent('REACHED') ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3 h-3" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Reached Health Centre
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {getEventTime('REACHED') || 'Pending patient arrival'}
                </p>
              </div>
              {/* Connecting line */}
              <div className={`absolute left-3 top-6 w-[2px] h-6 -translate-x-1/2 ${hasEvent('CONSULTED') ? 'bg-purple-500' : 'bg-slate-200'}`} />
            </div>

            {/* Step 3: Consultation */}
            <div className="flex items-start gap-3 relative">
              <div className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${hasEvent('CONSULTED') ? 'bg-purple-600 text-white' : 'bg-slate-100 border border-slate-300 text-slate-400'}`}>
                {hasEvent('CONSULTED') ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Clock className="w-3 h-3" />}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 leading-tight">
                  Consultation Completed
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  {getEventTime('CONSULTED') || 'Pending doctor evaluation'}
                </p>
              </div>
              {/* Connecting line */}
              <div className="absolute left-3 top-6 w-[2px] h-6 bg-slate-200 -translate-x-1/2" />
            </div>

            {/* Step 4: Follow Up */}
            <div className="flex items-start gap-3 relative">
              <div className="relative z-10 w-6 h-6 rounded-full bg-slate-100 border border-slate-300 text-slate-400 flex items-center justify-center shrink-0">
                <Clock className="w-3 h-3" />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-600 leading-tight">
                  Follow Up Scheduled
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  24 Oct 2026 (Sputum Test Review)
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Highlight Card */}
        <div className="bg-emerald-50/90 rounded-2xl p-3.5 border border-emerald-200/80 shadow-2xs flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
            <Stethoscope className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-emerald-900 leading-snug">
            {hasEvent('CONSULTED')
              ? 'Patient reached the health centre and received consultation.'
              : hasEvent('REACHED')
              ? 'Patient arrived at health facility. Registered in OPD queue.'
              : 'Referral passport active. Awaiting patient arrival at health centre.'}
          </p>
        </div>
      </div>

      {/* Button */}
      <div className="pt-4">
        <button
          onClick={onViewDetails}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors shadow-2xs"
        >
          View Clinical Details
        </button>
      </div>
    </div>
  );
};

