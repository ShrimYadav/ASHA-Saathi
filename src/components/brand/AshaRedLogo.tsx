import React from 'react';

interface AshaRedLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  showSubtitle?: boolean;
  orientation?: 'horizontal' | 'vertical';
  className?: string;
  glowing?: boolean;
  theme?: 'dark' | 'light';
}

export const AshaRedLogo: React.FC<AshaRedLogoProps> = ({
  size = 'md',
  showSubtitle = true,
  orientation = 'horizontal',
  className = '',
  glowing = true,
  theme = 'dark',
}) => {
  const isVertical = orientation === 'vertical';

  const iconSizes = {
    sm: 'w-8 h-8',
    md: 'w-11 h-11',
    lg: 'w-16 h-16',
    xl: 'w-24 h-24',
    '2xl': 'w-32 h-32',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl sm:text-3xl',
    xl: 'text-3xl sm:text-4xl',
    '2xl': 'text-4xl sm:text-5xl',
  };

  const subtitleSizes = {
    sm: 'text-[10px]',
    md: 'text-xs',
    lg: 'text-xs sm:text-sm',
    xl: 'text-sm sm:text-base',
    '2xl': 'text-base',
  };

  return (
    <div
      className={`flex ${
        isVertical ? 'flex-col items-center text-center' : 'items-center text-left'
      } gap-3 sm:gap-4 select-none ${className}`}
    >
      {/* Emblem with Red color on dark background */}
      <div className="relative shrink-0 flex items-center justify-center">
        {/* Ambient neon red glow aura for dark blue/black backdrop */}
        {glowing && (
          <div
            className={`absolute inset-0 rounded-3xl bg-red-600/35 blur-xl pointer-events-none scale-125 animate-pulse`}
            style={{ animationDuration: '3s' }}
          />
        )}

        <div
          className={`relative ${iconSizes[size]} rounded-2xl sm:rounded-3xl bg-gradient-to-br from-red-600 via-red-600 to-rose-700 p-2 sm:p-2.5 flex items-center justify-center shadow-2xl shadow-red-600/40 border border-red-400/40 ring-2 ring-red-500/20 transition-transform`}
        >
          <svg
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-full h-full text-white drop-shadow-md"
          >
            <defs>
              <linearGradient id="redCrossGrad" x1="0" y1="0" x2="64" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" />
                <stop offset="1" stopColor="#ffe4e6" />
              </linearGradient>
              <linearGradient id="redGlowGrad" x1="0" y1="0" x2="0" y2="64" gradientUnits="userSpaceOnUse">
                <stop stopColor="#ffffff" stopOpacity="0.9" />
                <stop offset="1" stopColor="#fecdd3" stopOpacity="0.8" />
              </linearGradient>
            </defs>

            {/* Heart contour outer shield */}
            <path
              d="M32 55.5C32 55.5 10 41.5 10 24.5C10 16.8 16 10.5 23.5 10.5C28 10.5 30.8 13 32 14.5C33.2 13 36 10.5 40.5 10.5C48 10.5 54 16.8 54 24.5C54 41.5 32 55.5 32 55.5Z"
              fill="white"
              fillOpacity="0.18"
              stroke="url(#redCrossGrad)"
              strokeWidth="3.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Central Healthcare Cross with Lifeline Pulse */}
            {/* Vertical stem */}
            <rect x="29" y="18" width="6" height="24" rx="2.5" fill="white" />
            {/* Horizontal bar */}
            <rect x="20" y="27" width="24" height="6" rx="2.5" fill="white" />

            {/* Caring Hands curve wrapping around */}
            <path
              d="M17 38C20 44 26 47 32 47C38 47 44 44 47 38"
              stroke="white"
              strokeWidth="3"
              strokeLinecap="round"
            />

            {/* Medical Lifeline / Heartbeat Wave in Red Heart */}
            <path
              d="M19 30L26 30L29 23L32 37L35 27L38 30L45 30"
              stroke="#b91c1c"
              strokeWidth="2.2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Health vitality star / spark in top right */}
            <circle cx="44" cy="18" r="2.5" fill="#fef08a" />
          </svg>
        </div>
      </div>

      {/* Brand Typography */}
      <div className={`flex flex-col ${isVertical ? 'items-center' : 'items-start'}`}>
        <div className="flex items-center gap-1.5">
          <span
            className={`font-extrabold tracking-tight font-['Plus_Jakarta_Sans',sans-serif] ${
              theme === 'light' ? 'text-slate-900' : 'text-white'
            } ${titleSizes[size]} leading-none`}
          >
            ASHA<span className="text-red-600 font-black">-</span>
            <span
              className={
                theme === 'light'
                  ? 'text-red-600 font-extrabold'
                  : 'bg-gradient-to-r from-red-400 via-red-500 to-rose-400 bg-clip-text text-transparent'
              }
            >
              Saathi
            </span>
          </span>
          <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse shrink-0" />
        </div>

        {showSubtitle && (
          <div className="mt-1 flex flex-col">
            <span
              className={`font-semibold tracking-wide ${
                theme === 'light' ? 'text-slate-600' : 'text-slate-300/90'
              } ${subtitleSizes[size]} leading-tight`}
            >
              Frontline Healthcare Companion
            </span>
            <span
              className={`text-[10px] sm:text-xs font-semibold ${
                theme === 'light' ? 'text-red-700' : 'text-red-300/80'
              } mt-0.5 tracking-wider`}
            >
              आशा-साथी • स्वस्थ परिवार, समर्थ समाज
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
