import React from 'react';
import { AshaLogo } from '../brand/AshaLogo';
import { ASSETS } from '../../data/mockData';

interface MobileSplashProps {
  onGetStarted?: () => void;
  onLogin?: () => void;
}

export const MobileSplash: React.FC<MobileSplashProps> = ({
  onGetStarted,
  onLogin,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between text-white relative min-h-[580px] bg-linear-to-b from-[#064e3b] via-[#043424] to-[#022015] p-6">
      {/* Background image & gradient overlay */}
      <div className="absolute inset-0 overflow-hidden opacity-35 mix-blend-luminosity pointer-events-none">
        <img
          src={ASSETS.villageWorker}
          alt="ASHA worker village"
          className="w-full h-full object-cover object-center"
        />
        <div className="absolute inset-0 bg-linear-to-t from-[#022015] via-transparent to-[#064e3b]" />
      </div>

      {/* Top Brand Logo */}
      <div className="relative z-10 pt-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 flex items-center justify-center text-white mb-3 shadow-lg">
          <svg
            viewBox="0 0 48 48"
            fill="none"
            className="w-10 h-10"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24 40C24 40 9.5 30.5 9.5 18.5C9.5 13.2 13.5 9 18.5 9C21.6 9 23.4 10.8 24 11.5C24.6 10.8 26.4 9 29.5 9C34.5 9 38.5 13.2 38.5 18.5C38.5 30.5 24 40 24 40Z"
              stroke="white"
              strokeWidth="3.2"
              fill="white"
              fillOpacity="0.2"
            />
            <path
              d="M24 17V30"
              stroke="white"
              strokeWidth="2.8"
              strokeLinecap="round"
            />
            <path
              d="M24 21C21.5 18.5 17 19.5 17 23C17 26 21 28 24 29"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <path
              d="M24 23C26.5 20.5 31 21.5 31 25C31 28 27 29.5 24 30.5"
              stroke="white"
              strokeWidth="2.4"
              strokeLinecap="round"
            />
            <circle cx="24" cy="14" r="2.2" fill="white" />
          </svg>
        </div>

        <h1 className="text-2xl font-extrabold tracking-tight text-white drop-shadow-sm">
          ASHA-Saathi
        </h1>
        <p className="text-[11px] text-emerald-200/90 font-medium tracking-wide mt-0.5">
          Healthy Families • Stronger Communities
        </p>

        <p className="text-xs text-emerald-100/90 font-normal mt-4 max-w-[220px]">
          Your Health Companion in Every Home
        </p>
      </div>

      {/* Hero Visual Card in middle */}
      <div className="relative z-10 my-4 flex-1 flex items-center justify-center">
        <div className="w-52 h-56 rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 relative group">
          <img
            src={ASSETS.villageWorker}
            alt="ASHA Saathi"
            className="w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent" />
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="relative z-10 space-y-3 pb-2 text-center">
        <button
          onClick={onGetStarted}
          className="w-full py-3.5 px-6 rounded-2xl bg-white text-[#064e3b] font-bold text-sm shadow-xl hover:bg-emerald-50 active:scale-[0.98] transition-all"
        >
          Get Started
        </button>
        <button
          onClick={onLogin}
          className="text-xs font-semibold text-emerald-200 hover:text-white underline-offset-4 hover:underline transition-colors block w-full py-1"
        >
          I already have an account
        </button>
      </div>
    </div>
  );
};
