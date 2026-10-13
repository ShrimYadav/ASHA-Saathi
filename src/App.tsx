import React, { useState } from 'react';
import { LogoSplashScreen } from './components/auth/LogoSplashScreen';
import { PrototypeSignIn } from './components/auth/PrototypeSignIn';
import { DesktopDashboard } from './components/desktop/DesktopDashboard';
import { CURRENT_USER } from './data/mockData';

export default function App() {
  // Application startup stages: 'splash' (2-second logo flash) -> 'signin' (prototype auth) -> 'dashboard'
  const [appStage, setAppStage] = useState<'splash' | 'signin' | 'dashboard'>('splash');
  const [currentUser, setCurrentUser] = useState<any>(CURRENT_USER);

  return (
    <div
      className={`min-h-screen flex flex-col font-['Plus_Jakarta_Sans',sans-serif] ${
        appStage === 'signin' ? 'bg-white' : appStage === 'splash' ? 'bg-[#020617]' : 'bg-[#f4f7f6]'
      }`}
    >
      {/* Stage 1: 2-Second Logo Flash Screen */}
      {appStage === 'splash' && (
        <LogoSplashScreen
          durationMs={2000}
          onFinish={() => setAppStage('signin')}
        />
      )}

      {/* Stage 2: Prototype Sign-In Screen with Name & Password + Skip Option */}
      {appStage === 'signin' && (
        <PrototypeSignIn
          onSignInSuccess={(user) => {
            setCurrentUser(user);
            setAppStage('dashboard');
          }}
          onSkipSignIn={() => {
            // Instant skip directly into prototype
            setCurrentUser(CURRENT_USER);
            setAppStage('dashboard');
          }}
        />
      )}

      {/* Stage 3: Full Desktop Health Platform */}
      {appStage === 'dashboard' && (
        <div className="relative min-h-screen w-full bg-[#f4f7f6]">
          {/* Quick Header Banner to Re-trigger Splash or Switch Auth if desired */}
          <div className="bg-slate-900 text-slate-300 text-[11px] px-6 py-1.5 flex items-center justify-between border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="font-semibold text-white">ASHA-Saathi Interactive Prototype</span>
              <span className="text-slate-500">•</span>
              <span className="text-slate-400">Signed in as: <strong className="text-white">{currentUser?.name || 'Sunita Devi'}</strong> ({currentUser?.role || 'ASHA Worker'})</span>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setAppStage('splash')}
                className="hover:text-red-400 text-slate-400 underline transition-colors cursor-pointer"
                title="Re-play the 2-second red logo flash"
              >
                Replay 2s Logo Flash
              </button>
              <button
                onClick={() => setAppStage('signin')}
                className="hover:text-white text-slate-300 bg-slate-800 hover:bg-slate-700 px-2 py-0.5 rounded font-medium transition-colors cursor-pointer"
              >
                Switch Account / Sign In
              </button>
            </div>
          </div>

          <DesktopDashboard
            isCompact={false}
            currentUser={currentUser}
            onLogout={() => setAppStage('signin')}
            className="min-h-[calc(100vh-29px)] w-full rounded-none border-none shadow-none"
          />
        </div>
      )}
    </div>
  );
}
