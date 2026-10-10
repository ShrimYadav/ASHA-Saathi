import React, { useState } from 'react';
import { DesktopDashboard } from '../desktop/DesktopDashboard';
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
import { AshaLogo } from '../brand/AshaLogo';
import { MobileScreenId } from '../../types';
import { Maximize2, X, Sparkles, ExternalLink } from 'lucide-react';

interface MockupGalleryBoardProps {
  onSelectScreen?: (screen: MobileScreenId) => void;
}

export const MockupGalleryBoard: React.FC<MockupGalleryBoardProps> = ({
  onSelectScreen,
}) => {
  const [activeModalScreen, setActiveModalScreen] = useState<MobileScreenId | null>(null);

  const openScreen = (screen: MobileScreenId) => {
    setActiveModalScreen(screen);
    if (onSelectScreen) onSelectScreen(screen);
  };

  return (
    <div className="w-full bg-[#f1f5f4] text-slate-800 pb-12 select-none">
      {/* POSTER CANVAS CONTAINER */}
      <div className="max-w-[1780px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* ROW 1: Desktop Portal (left ~60%) + Mobile Splash & Login (right ~40%) */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
          {/* Top-Left: Desktop Dashboard Mockup */}
          <div className="xl:col-span-8 bg-white p-3 rounded-3xl shadow-md border border-slate-200/80">
            <DesktopDashboard
              isCompact={true}
              onOpenMobileScreen={(scr) => openScreen(scr as MobileScreenId)}
            />
          </div>

          {/* Top-Right: 2 Mobile Phones (Splash & Login) */}
          <div className="xl:col-span-4 flex flex-row items-center justify-center gap-5 sm:gap-6">
            {/* Phone 1: Splash / Onboarding */}
            <div
              onClick={() => openScreen('splash')}
              className="cursor-pointer group relative transition-transform hover:-translate-y-1"
            >
              <IPhoneFrame
                className="w-[240px] h-[520px] sm:w-[260px] sm:h-[550px]"
                theme="light"
              >
                <MobileSplash
                  onGetStarted={() => openScreen('home')}
                  onLogin={() => openScreen('login')}
                />
              </IPhoneFrame>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Phone 2: Login Screen */}
            <div
              onClick={() => openScreen('login')}
              className="cursor-pointer group relative transition-transform hover:-translate-y-1"
            >
              <IPhoneFrame
                className="w-[240px] h-[520px] sm:w-[260px] sm:h-[550px]"
                theme="dark"
              >
                <MobileLogin
                  onLoginSuccess={() => openScreen('home')}
                  onSignUp={() => openScreen('home')}
                />
              </IPhoneFrame>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* ROW 2: 6 Mobile Phones Row */}
        <section className="space-y-3">
          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 justify-items-center">
            {/* Screen 3: Mobile Home */}
            <div
              onClick={() => openScreen('home')}
              className="w-full max-w-[270px] cursor-pointer group relative transition-transform hover:-translate-y-1"
            >
              <IPhoneFrame className="w-full h-[540px]" theme="dark">
                <MobileHome onNavigate={(scr) => openScreen(scr as MobileScreenId)} />
              </IPhoneFrame>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Screen 4: Voice Visit Record */}
            <div
              onClick={() => openScreen('voice-record')}
              className="w-full max-w-[270px] cursor-pointer group relative transition-transform hover:-translate-y-1"
            >
              <IPhoneFrame className="w-full h-[540px]" theme="dark">
                <MobileVoiceRecord
                  onBack={() => openScreen('home')}
                  onNext={() => openScreen('visit-summary')}
                  onOpenDialectModal={() => openScreen('dialect-sheet')}
                />
              </IPhoneFrame>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Screen 5: Visit Summary */}
            <div
              onClick={() => openScreen('visit-summary')}
              className="w-full max-w-[270px] cursor-pointer group relative transition-transform hover:-translate-y-1"
            >
              <IPhoneFrame className="w-full h-[540px]" theme="dark">
                <MobileVisitSummary
                  onBack={() => openScreen('voice-record')}
                  onSave={() => openScreen('home')}
                  onViewRiskDetails={() => openScreen('risk-alert')}
                />
              </IPhoneFrame>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Screen 6: Risk Alert */}
            <div
              onClick={() => openScreen('risk-alert')}
              className="w-full max-w-[270px] cursor-pointer group relative transition-transform hover:-translate-y-1"
            >
              <IPhoneFrame className="w-full h-[540px]" theme="dark">
                <MobileRiskAlert
                  onBack={() => openScreen('home')}
                  onMarkReferred={() => openScreen('referral-passport')}
                  onSaveContinue={() => openScreen('home')}
                />
              </IPhoneFrame>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Screen 7: Referral Passport */}
            <div
              onClick={() => openScreen('referral-passport')}
              className="w-full max-w-[270px] cursor-pointer group relative transition-transform hover:-translate-y-1"
            >
              <IPhoneFrame className="w-full h-[540px]" theme="dark">
                <MobileReferralPassport
                  onBack={() => openScreen('risk-alert')}
                  onDone={() => openScreen('referral-tracking')}
                  onTrack={() => openScreen('referral-tracking')}
                />
              </IPhoneFrame>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Screen 8: Referral Tracking */}
            <div
              onClick={() => openScreen('referral-tracking')}
              className="w-full max-w-[270px] cursor-pointer group relative transition-transform hover:-translate-y-1"
            >
              <IPhoneFrame className="w-full h-[540px]" theme="dark">
                <MobileReferralTracking
                  onBack={() => openScreen('home')}
                  onViewDetails={() => openScreen('risk-alert')}
                />
              </IPhoneFrame>
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
                <Maximize2 className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* ROW 3: Bottom Mockups & Cards (Patient List, Scan, Settings, Offline Mode, Dialect Support, Trust Mode) */}
        <section className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 sm:gap-5 justify-items-center items-stretch">
          {/* Screen 9: Patient List */}
          <div
            onClick={() => openScreen('patient-list')}
            className="w-full max-w-[270px] cursor-pointer group relative transition-transform hover:-translate-y-1"
          >
            <IPhoneFrame className="w-full h-[540px]" theme="dark">
              <MobilePatientList
                onBack={() => openScreen('home')}
                onSelectPatient={(p) => {
                  if (p.id === 'P03') openScreen('risk-alert');
                  else openScreen('visit-summary');
                }}
              />
            </IPhoneFrame>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Screen 10: Health Centre Scan (Viewfinder) */}
          <div
            onClick={() => openScreen('qr-scan')}
            className="w-full max-w-[270px] cursor-pointer group relative transition-transform hover:-translate-y-1"
          >
            <IPhoneFrame className="w-full h-[540px]" theme="light">
              <MobileQrScanner
                onBack={() => openScreen('home')}
                onScanSuccess={() => openScreen('referral-tracking')}
              />
            </IPhoneFrame>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Screen 11: Settings / Profile */}
          <div
            onClick={() => openScreen('settings')}
            className="w-full max-w-[270px] cursor-pointer group relative transition-transform hover:-translate-y-1"
          >
            <IPhoneFrame className="w-full h-[540px]" theme="dark">
              <MobileSettings
                onBack={() => openScreen('home')}
                onOpenDialect={() => openScreen('dialect-sheet')}
                onOpenOffline={() => openScreen('offline-sheet')}
                onLogout={() => openScreen('login')}
              />
            </IPhoneFrame>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white p-1.5 rounded-full z-40 backdrop-blur-xs">
              <Maximize2 className="w-3.5 h-3.5" />
            </div>
          </div>

          {/* Card 12: Offline Mode Sheet */}
          <div
            onClick={() => openScreen('offline-sheet')}
            className="w-full max-w-[270px] bg-white rounded-3xl p-3 border border-slate-200/80 shadow-md flex flex-col justify-between cursor-pointer group hover:border-emerald-300 transition-all hover:-translate-y-1"
          >
            <div className="h-full rounded-2xl overflow-hidden flex flex-col">
              <MobileOfflineModal onContinue={() => openScreen('settings')} />
            </div>
          </div>

          {/* Card 13: Local Dialect Support */}
          <div
            onClick={() => openScreen('dialect-sheet')}
            className="w-full max-w-[270px] bg-white rounded-3xl p-3 border border-slate-200/80 shadow-md flex flex-col justify-between cursor-pointer group hover:border-emerald-300 transition-all hover:-translate-y-1"
          >
            <div className="h-full rounded-2xl overflow-hidden flex flex-col">
              <MobileDialectModal
                onClose={() => openScreen('voice-record')}
                onSelectDialect={() => openScreen('voice-record')}
              />
            </div>
          </div>

          {/* Card 14: Trust Mode */}
          <div
            onClick={() => openScreen('trust-sheet')}
            className="w-full max-w-[270px] bg-white rounded-3xl p-3 border border-slate-200/80 shadow-md flex flex-col justify-between cursor-pointer group hover:border-emerald-300 transition-all hover:-translate-y-1"
          >
            <div className="h-full rounded-2xl overflow-hidden flex flex-col">
              <MobileTrustModal onLearnMore={() => openScreen('settings')} />
            </div>
          </div>
        </section>

        {/* BOTTOM BRAND BANNER (Deep Forest Green Strip) */}
        <footer className="mt-8 bg-[#043927] text-white rounded-3xl px-8 py-5 flex flex-col md:flex-row items-center justify-between gap-4 shadow-xl border border-white/10">
          {/* Logo on Left */}
          <div className="shrink-0">
            <AshaLogo variant="light" size="md" />
          </div>

          {/* Center Mission statement */}
          <div className="text-center font-medium text-xs sm:text-sm text-emerald-100/90 tracking-wide">
            Empowering ASHA workers with AI{' '}
            <span className="opacity-40 mx-2">|</span> Better visits{' '}
            <span className="opacity-60">•</span> Safer referrals{' '}
            <span className="opacity-60">•</span> Healthier communities
          </div>

          {/* Right Tagline */}
          <div className="shrink-0 flex items-center gap-1.5 text-xs font-semibold text-emerald-200">
            <span>🌱</span>
            <span>Small actions. Big impact.</span>
          </div>
        </footer>
      </div>

      {/* Interactive Modal when clicking any screen */}
      {activeModalScreen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative">
            <button
              onClick={() => setActiveModalScreen(null)}
              className="absolute -top-12 right-0 bg-white/20 hover:bg-white/30 text-white rounded-full p-2 transition-colors flex items-center gap-1 text-xs font-bold"
            >
              <X className="w-4 h-4" />
              <span>Close View</span>
            </button>

            <IPhoneFrame
              className="w-[340px] h-[700px] sm:w-[360px] sm:h-[720px]"
              theme={
                activeModalScreen === 'splash' || activeModalScreen === 'qr-scan'
                  ? 'light'
                  : 'dark'
              }
            >
              {activeModalScreen === 'splash' && (
                <MobileSplash
                  onGetStarted={() => setActiveModalScreen('home')}
                  onLogin={() => setActiveModalScreen('login')}
                />
              )}
              {activeModalScreen === 'login' && (
                <MobileLogin
                  onLoginSuccess={() => setActiveModalScreen('home')}
                  onSignUp={() => setActiveModalScreen('home')}
                />
              )}
              {activeModalScreen === 'home' && (
                <MobileHome
                  onNavigate={(s) => setActiveModalScreen(s as MobileScreenId)}
                />
              )}
              {activeModalScreen === 'voice-record' && (
                <MobileVoiceRecord
                  onBack={() => setActiveModalScreen('home')}
                  onNext={() => setActiveModalScreen('visit-summary')}
                  onOpenDialectModal={() => setActiveModalScreen('dialect-sheet')}
                />
              )}
              {activeModalScreen === 'visit-summary' && (
                <MobileVisitSummary
                  onBack={() => setActiveModalScreen('voice-record')}
                  onSave={() => setActiveModalScreen('home')}
                  onViewRiskDetails={() => setActiveModalScreen('risk-alert')}
                />
              )}
              {activeModalScreen === 'risk-alert' && (
                <MobileRiskAlert
                  onBack={() => setActiveModalScreen('home')}
                  onMarkReferred={() => setActiveModalScreen('referral-passport')}
                  onSaveContinue={() => setActiveModalScreen('home')}
                />
              )}
              {activeModalScreen === 'referral-passport' && (
                <MobileReferralPassport
                  onBack={() => setActiveModalScreen('risk-alert')}
                  onDone={() => setActiveModalScreen('referral-tracking')}
                  onTrack={() => setActiveModalScreen('referral-tracking')}
                />
              )}
              {activeModalScreen === 'referral-tracking' && (
                <MobileReferralTracking
                  onBack={() => setActiveModalScreen('home')}
                  onViewDetails={() => setActiveModalScreen('risk-alert')}
                />
              )}
              {activeModalScreen === 'patient-list' && (
                <MobilePatientList
                  onBack={() => setActiveModalScreen('home')}
                  onSelectPatient={(p) => {
                    if (p.id === 'P03') setActiveModalScreen('risk-alert');
                    else setActiveModalScreen('visit-summary');
                  }}
                />
              )}
              {activeModalScreen === 'qr-scan' && (
                <MobileQrScanner
                  onBack={() => setActiveModalScreen('home')}
                  onScanSuccess={() => setActiveModalScreen('referral-tracking')}
                />
              )}
              {activeModalScreen === 'settings' && (
                <MobileSettings
                  onBack={() => setActiveModalScreen('home')}
                  onOpenDialect={() => setActiveModalScreen('dialect-sheet')}
                  onOpenOffline={() => setActiveModalScreen('offline-sheet')}
                  onLogout={() => setActiveModalScreen('login')}
                />
              )}
              {activeModalScreen === 'offline-sheet' && (
                <MobileOfflineModal
                  onContinue={() => setActiveModalScreen('settings')}
                />
              )}
              {activeModalScreen === 'dialect-sheet' && (
                <MobileDialectModal
                  onClose={() => setActiveModalScreen('voice-record')}
                  onSelectDialect={() => setActiveModalScreen('voice-record')}
                />
              )}
              {activeModalScreen === 'trust-sheet' && (
                <MobileTrustModal
                  onLearnMore={() => setActiveModalScreen('settings')}
                />
              )}
            </IPhoneFrame>
          </div>
        </div>
      )}
    </div>
  );
};
