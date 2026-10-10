import React, { useState } from 'react';
import { IPhoneFrame } from '../device/IPhoneFrame';
import { MobileSplash } from '../mobile/MobileSplash';
import { MobileLogin } from '../mobile/MobileLogin';
import { MobileHome } from '../mobile/MobileHome';
import { MobileVoiceRecord } from '../mobile/MobileVoiceRecord';
import { MobileVisitSummary } from '../mobile/MobileVisitSummary';
import { MobileRiskAlert } from '../mobile/MobileRiskAlert';
import { MobileReferralPassport } from '../mobile/MobileReferralPassport';
import { MobileReferralTracking } from '../mobile/MobileReferralTracking';
import { MobilePatientList } from '../mobile/MobilePatientList';
import { MobileQrScanner } from '../mobile/MobileQrScanner';
import { MobileSettings } from '../mobile/MobileSettings';
import { MobileOfflineModal } from '../mobile/MobileOfflineModal';
import { MobileDialectModal } from '../mobile/MobileDialectModal';
import { MobileTrustModal } from '../mobile/MobileTrustModal';
import { MobileScreenId, Patient } from '../../types';
import { ChevronRight, Smartphone, RefreshCw, Layers } from 'lucide-react';

interface MobileSimulatorProps {
  initialScreen?: MobileScreenId;
  onScreenChange?: (screen: MobileScreenId) => void;
  className?: string;
}

export const MobileSimulator: React.FC<MobileSimulatorProps> = ({
  initialScreen = 'home',
  onScreenChange,
  className = '',
}) => {
  const [currentScreen, setCurrentScreen] = useState<MobileScreenId>(initialScreen);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [activeTranscript, setActiveTranscript] = useState<string>('');
  const [activeReferral, setActiveReferral] = useState<any | null>(null);

  const navigateTo = (screen: MobileScreenId) => {
    setCurrentScreen(screen);
    if (onScreenChange) onScreenChange(screen);
  };

  const screenLabels: { id: MobileScreenId; label: string; group: string }[] = [
    { id: 'splash', label: '1. Onboarding / Splash', group: 'Auth' },
    { id: 'login', label: '2. Login Screen', group: 'Auth' },
    { id: 'home', label: '3. Mobile Home / Overview', group: 'Core' },
    { id: 'voice-record', label: '4. Voice Visit Record', group: 'Visits' },
    { id: 'visit-summary', label: '5. AI Visit Summary', group: 'Visits' },
    { id: 'risk-alert', label: '6. Risk Alert (TB Protocol)', group: 'Clinical' },
    { id: 'referral-passport', label: '7. Referral Passport QR', group: 'Clinical' },
    { id: 'referral-tracking', label: '8. Referral Tracking Timeline', group: 'Clinical' },
    { id: 'patient-list', label: '9. Patient Directory', group: 'Core' },
    { id: 'qr-scan', label: '10. Health Centre QR Scanner', group: 'Tools' },
    { id: 'settings', label: '11. Settings & Profile', group: 'System' },
    { id: 'offline-sheet', label: '12. Offline Mode Dialog', group: 'System' },
    { id: 'dialect-sheet', label: '13. Local Dialect Support', group: 'System' },
    { id: 'trust-sheet', label: '14. Trust Mode & Privacy', group: 'System' },
  ];

  return (
    <div className={`flex flex-col lg:flex-row items-center lg:items-start justify-center gap-8 ${className}`}>
      {/* Quick Screen Switcher Panel */}
      <div className="w-full lg:w-72 bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs shrink-0 order-2 lg:order-1">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-700" />
            <h3 className="text-xs font-bold text-slate-900">
              Interactive Screen Tour
            </h3>
          </div>
          <button
            onClick={() => navigateTo('home')}
            className="p-1 text-slate-400 hover:text-emerald-700 transition-colors"
            title="Reset to Home"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

        <p className="text-[11px] text-slate-500 my-2.5">
          Select any of the 14 application screens designed in the mockup to preview or interact live:
        </p>

        <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin">
          {screenLabels.map((s) => {
            const isActive = currentScreen === s.id;
            return (
              <button
                key={s.id}
                onClick={() => navigateTo(s.id)}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-medium transition-all flex items-center justify-between ${
                  isActive
                    ? 'bg-[#064e3b] text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className="truncate">{s.label}</span>
                {isActive && <ChevronRight className="w-3.5 h-3.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Realistic Mobile Device Container */}
      <div className="order-1 lg:order-2 flex flex-col items-center">
        <IPhoneFrame
          className="w-[340px] h-[700px] sm:w-[360px] sm:h-[720px]"
          theme={
            currentScreen === 'splash' || currentScreen === 'qr-scan'
              ? 'light'
              : 'dark'
          }
        >
          {currentScreen === 'splash' && (
            <MobileSplash
              onGetStarted={() => navigateTo('home')}
              onLogin={() => navigateTo('login')}
            />
          )}

          {currentScreen === 'login' && (
            <MobileLogin
              onLoginSuccess={() => navigateTo('home')}
              onSignUp={() => navigateTo('home')}
            />
          )}

          {currentScreen === 'home' && (
            <MobileHome
              onNavigate={(screen) => navigateTo(screen as MobileScreenId)}
            />
          )}

          {currentScreen === 'voice-record' && (
            <MobileVoiceRecord
              onBack={() => navigateTo('home')}
              onNext={(tx) => {
                setActiveTranscript(tx);
                navigateTo('visit-summary');
              }}
              onOpenDialectModal={() => navigateTo('dialect-sheet')}
            />
          )}

          {currentScreen === 'visit-summary' && (
            <MobileVisitSummary
              transcript={activeTranscript}
              onBack={() => navigateTo('voice-record')}
              onSave={() => navigateTo('home')}
              onViewRiskDetails={() => navigateTo('risk-alert')}
            />
          )}

          {currentScreen === 'risk-alert' && (
            <MobileRiskAlert
              onBack={() => navigateTo('home')}
              onMarkReferred={(ref) => {
                if (ref) setActiveReferral(ref);
                navigateTo('referral-passport');
              }}
              onSaveContinue={() => navigateTo('home')}
            />
          )}

          {currentScreen === 'referral-passport' && (
            <MobileReferralPassport
              onBack={() => navigateTo('risk-alert')}
              onDone={() => navigateTo('referral-tracking')}
              onTrack={() => navigateTo('referral-tracking')}
            />
          )}

          {currentScreen === 'referral-tracking' && (
            <MobileReferralTracking
              referralId={activeReferral?.id}
              onBack={() => navigateTo('home')}
              onViewDetails={() => navigateTo('risk-alert')}
            />
          )}

          {currentScreen === 'patient-list' && (
            <MobilePatientList
              onBack={() => navigateTo('home')}
              onSelectPatient={(p) => {
                setSelectedPatient(p);
                if (p.id === 'P03') navigateTo('risk-alert');
                else navigateTo('visit-summary');
              }}
            />
          )}

          {currentScreen === 'qr-scan' && (
            <MobileQrScanner
              onBack={() => navigateTo('home')}
              onScanSuccess={(ref) => {
                if (ref) setActiveReferral(ref);
                navigateTo('referral-tracking');
              }}
            />
          )}

          {currentScreen === 'settings' && (
            <MobileSettings
              onBack={() => navigateTo('home')}
              onOpenDialect={() => navigateTo('dialect-sheet')}
              onOpenOffline={() => navigateTo('offline-sheet')}
              onLogout={() => navigateTo('login')}
            />
          )}

          {currentScreen === 'offline-sheet' && (
            <MobileOfflineModal onContinue={() => navigateTo('settings')} />
          )}

          {currentScreen === 'dialect-sheet' && (
            <MobileDialectModal
              onClose={() => navigateTo('voice-record')}
              onSelectDialect={() => navigateTo('voice-record')}
            />
          )}

          {currentScreen === 'trust-sheet' && (
            <MobileTrustModal onLearnMore={() => navigateTo('settings')} />
          )}
        </IPhoneFrame>
      </div>
    </div>
  );
};

