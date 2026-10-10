import React, { useState } from 'react';
import {
  ArrowLeft,
  Zap,
  ZapOff,
  QrCode,
  CheckCircle2,
  AlertTriangle,
  Building2,
  UserCheck,
  Stethoscope,
  Loader2,
  Calendar,
} from 'lucide-react';
import { api } from '../../services/api';

interface MobileQrScannerProps {
  onBack?: () => void;
  onScanSuccess?: (referral: any) => void;
}

export const MobileQrScanner: React.FC<MobileQrScannerProps> = ({
  onBack,
  onScanSuccess,
}) => {
  const [tokenInput, setTokenInput] = useState('tok_5b8f9e2a_c410_4f92_9876_tb_kamal');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verifiedReferral, setVerifiedReferral] = useState<any | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [recordedStatus, setRecordedStatus] = useState<string | null>(null);

  const handleValidateToken = async (tokenToTest: string) => {
    setIsVerifying(true);
    setScanError(null);
    try {
      const res = await api.validateReferralToken(tokenToTest);
      if (res.success && res.referral) {
        setVerifiedReferral(res.referral);
      } else {
        setScanError('Invalid token or no referral found.');
      }
    } catch (err: any) {
      setScanError(err.message || 'Token verification failed. Please check referral ID.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleRecordEvent = async (eventType: 'REACHED' | 'CONSULTED') => {
    if (!verifiedReferral) return;
    setIsVerifying(true);
    try {
      const res = await api.recordReferralEvent({
        referralId: verifiedReferral.id,
        eventType,
        facilityName: 'District Hospital Pipra',
        recordedBy: 'Dr. A. K. Verma (OPD Chest Clinic)',
        notes:
          eventType === 'REACHED'
            ? 'Patient arrived at Chest OPD reception desk.'
            : 'Clinical examination completed. Sputum smear microscopy and CBNAAT sample collected.',
      });
      setVerifiedReferral(res.referral);
      setRecordedStatus(eventType);
      if (onScanSuccess) {
        setTimeout(() => onScanSuccess(res.referral), 1000);
      }
    } catch (err: any) {
      setScanError(err.message || 'Failed to record event');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-950 text-white p-4 min-h-[580px] relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between z-10 pb-1">
        <button
          onClick={onBack}
          className="p-1 rounded-full text-white/80 hover:bg-white/10 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <h2 className="text-sm font-bold text-white">
          Facility Referral Scan
        </h2>
        <div className="w-6" />
      </div>

      {!verifiedReferral ? (
        <>
          {/* Camera Viewfinder */}
          <div className="my-auto flex flex-col items-center justify-center relative py-4 z-10">
            <div className="relative w-56 h-56 rounded-3xl overflow-hidden border border-white/20 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs">
              {/* Glowing viewfinder corner brackets */}
              <div className="absolute top-2 left-2 w-7 h-7 border-t-4 border-l-4 border-emerald-400 rounded-tl-xl" />
              <div className="absolute top-2 right-2 w-7 h-7 border-t-4 border-r-4 border-emerald-400 rounded-tr-xl" />
              <div className="absolute bottom-2 left-2 w-7 h-7 border-b-4 border-l-4 border-emerald-400 rounded-bl-xl" />
              <div className="absolute bottom-2 right-2 w-7 h-7 border-b-4 border-r-4 border-emerald-400 rounded-br-xl" />

              {/* Animated Laser Scanning Beam */}
              <div className="absolute inset-x-4 h-0.5 bg-emerald-400 shadow-[0_0_12px_#34d399] animate-bounce" />

              {/* Faint QR target inside */}
              <div className="opacity-40">
                <QrCode className="w-28 h-28 text-white" />
              </div>
            </div>

            <p className="text-[11px] font-medium text-white/80 mt-4 tracking-wide">
              Scanning... Keep QR within viewfinder
            </p>

            {scanError && (
              <p className="text-[11px] text-rose-400 bg-rose-950/70 border border-rose-800 px-3 py-1.5 rounded-lg mt-2 text-center max-w-[280px]">
                {scanError}
              </p>
            )}
          </div>

          {/* Token Input Fallback & Trigger Button */}
          <div className="space-y-2.5 z-10 pt-2">
            <div className="flex gap-2">
              <input
                type="text"
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Or paste referral token / code..."
                className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder:text-slate-500 font-mono focus:border-emerald-500 focus:outline-hidden"
              />
              <button
                onClick={() => handleValidateToken(tokenInput)}
                disabled={isVerifying}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold text-white flex items-center justify-center shrink-0 transition-colors"
              >
                {isVerifying ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Validate'}
              </button>
            </div>

            <button
              onClick={() => handleValidateToken('ASHA20261010-0042')}
              className="w-full text-center text-xs text-emerald-400 hover:underline font-semibold block py-1"
            >
              Simulate QR Scan: Kamal Singh (TB Presumptive)
            </button>
          </div>
        </>
      ) : (
        /* Verified Referral Details & Health Centre Actions */
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 my-auto space-y-3 z-10">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-xs">
              <CheckCircle2 className="w-4 h-4" />
              <span>Token Authenticated</span>
            </div>
            <span className="text-[10px] font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {verifiedReferral.referralCode}
            </span>
          </div>

          <div className="space-y-1.5 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Patient:</span>
              <span className="font-bold text-white">{verifiedReferral.personName} ({verifiedReferral.personAge} M)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Protocol:</span>
              <span className="font-semibold text-rose-400">{verifiedReferral.protocolCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Destination:</span>
              <span className="text-white">{verifiedReferral.referredToFacility}</span>
            </div>
            <div className="p-2 bg-slate-950 rounded-xl text-[11px] text-slate-400 mt-2">
              <span className="font-bold text-slate-300 block mb-0.5">Clinical Reason:</span>
              {verifiedReferral.reason}
            </div>
          </div>

          {recordedStatus && (
            <div className="p-2 rounded-xl bg-emerald-950/70 border border-emerald-700 text-emerald-300 text-xs text-center font-bold">
              ✓ Event Recorded: {recordedStatus}
            </div>
          )}

          {/* Action buttons */}
          <div className="pt-2 space-y-2">
            <button
              onClick={() => handleRecordEvent('REACHED')}
              disabled={isVerifying}
              className="w-full py-2.5 px-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <UserCheck className="w-4 h-4" />
              <span>Record Arrival at Health Centre</span>
            </button>

            <button
              onClick={() => handleRecordEvent('CONSULTED')}
              disabled={isVerifying}
              className="w-full py-2.5 px-3 bg-purple-600 hover:bg-purple-500 rounded-xl text-xs font-bold text-white flex items-center justify-center gap-1.5 transition-colors"
            >
              <Stethoscope className="w-4 h-4" />
              <span>Record Consultation &amp; Lab Order</span>
            </button>

            <button
              onClick={() => {
                setVerifiedReferral(null);
                setRecordedStatus(null);
              }}
              className="w-full py-2 text-center text-xs text-slate-400 hover:text-white"
            >
              Scan Another QR Code
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

