import React, { useEffect, useState } from 'react';
import { AshaRedLogo } from '../brand/AshaRedLogo';
import { Sparkles, ArrowRight } from 'lucide-react';

interface LogoSplashScreenProps {
  onFinish: () => void;
  durationMs?: number;
}

export const LogoSplashScreen: React.FC<LogoSplashScreenProps> = ({
  onFinish,
  durationMs = 2000,
}) => {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const pct = Math.min(100, (elapsed / durationMs) * 100);
      setProgress(pct);

      if (elapsed >= durationMs) {
        clearInterval(interval);
        onFinish();
      }
    }, 25);

    return () => clearInterval(interval);
  }, [durationMs, onFinish]);

  return (
    <div
      onClick={onFinish}
      className="fixed inset-0 z-50 flex flex-col items-center justify-between p-6 sm:p-10 bg-gradient-to-b from-[#020617] via-[#09152e] to-[#010409] text-white select-none cursor-pointer overflow-hidden animate-fade-in"
    >
      {/* Ambient background glows: Deep Midnight Blue & Crimson Red */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Deep blue radial background */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-blue-600/15 blur-[120px]" />
        {/* Vivid Red radial core behind logo */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] h-[340px] rounded-full bg-red-600/25 blur-[90px] animate-pulse" />
        {/* Subtle grid pattern overlay */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)',
            backgroundSize: '32px 32px',
          }}
        />
      </div>

      {/* Top Tag */}
      <div className="relative z-10 w-full flex items-center justify-between text-xs text-slate-400">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-950/60 border border-red-500/30 text-red-300 font-medium text-[11px] backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          <span>Frontline Digital Health Platform</span>
        </span>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onFinish();
          }}
          className="text-xs text-slate-400 hover:text-white flex items-center gap-1 py-1 px-2.5 rounded-lg hover:bg-white/10 transition-colors"
        >
          <span>Skip</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Centerpiece: Red Logo on Blue/Black Canvas */}
      <div className="relative z-10 flex flex-col items-center justify-center my-auto transform transition-all duration-700 scale-100 sm:scale-110">
        <AshaRedLogo size="2xl" orientation="vertical" showSubtitle={true} glowing={true} />

        {/* Feature Highlights Banner */}
        <div className="mt-8 flex items-center gap-2 text-xs text-slate-300 font-medium bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-full border border-slate-700/60 shadow-xl">
          <Sparkles className="w-3.5 h-3.5 text-red-400" />
          <span>Voice Visit Capture • Protocol Risk Triage • QR Referral Passports</span>
        </div>
      </div>

      {/* Bottom Progress Bar (2 Seconds Flash Indicator) */}
      <div className="relative z-10 w-full max-w-xs flex flex-col items-center gap-2 pb-2">
        <div className="w-full h-1.5 bg-slate-800/80 rounded-full overflow-hidden p-0.5 border border-slate-700/50">
          <div
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-red-400 rounded-full transition-all duration-75 shadow-sm shadow-red-500/50"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex items-center justify-between w-full text-[11px] text-slate-400 px-1 font-mono">
          <span>Loading prototype...</span>
          <span className="text-red-400 font-bold">{Math.round((2 * (100 - progress)) / 100 * 10) / 10}s</span>
        </div>
      </div>
    </div>
  );
};
