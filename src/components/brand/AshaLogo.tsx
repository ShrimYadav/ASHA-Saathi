import React from 'react';

interface AshaLogoProps {
  variant?: 'light' | 'dark' | 'green';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showSubtitle?: boolean;
  className?: string;
}

export const AshaLogo: React.FC<AshaLogoProps> = ({
  variant = 'light',
  size = 'md',
  showSubtitle = true,
  className = '',
}) => {
  const isLight = variant === 'light';
  const isGreen = variant === 'green';

  const iconSizes = {
    sm: 'w-7 h-7',
    md: 'w-9 h-9',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16',
  };

  const titleSizes = {
    sm: 'text-base',
    md: 'text-xl',
    lg: 'text-2xl',
    xl: 'text-3xl',
  };

  const subtitleSizes = {
    sm: 'text-[9px]',
    md: 'text-[11px]',
    lg: 'text-xs',
    xl: 'text-sm',
  };

  return (
    <div className={`flex items-center gap-2.5 ${className}`}>
      {/* Emblem */}
      <div
        className={`relative ${iconSizes[size]} rounded-2xl flex items-center justify-center shrink-0 transition-transform ${
          isLight
            ? 'bg-white/10 text-white'
            : isGreen
            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-700/20'
            : 'bg-emerald-800 text-emerald-100'
        }`}
      >
        <svg
          viewBox="0 0 48 48"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full p-1"
        >
          {/* Heart contour */}
          <path
            d="M24 41.5C24 41.5 8 31.2 8 18.5C8 12.7 12.5 8 18 8C21.4 8 23.4 9.8 24 10.6C24.6 9.8 26.6 8 30 8C35.5 8 40 12.7 40 18.5C40 31.2 24 41.5 24 41.5Z"
            fill="currentColor"
            fillOpacity={isLight ? '0.2' : '0.15'}
          />
          <path
            d="M24 40C24 40 9.5 30.5 9.5 18.5C9.5 13.2 13.5 9 18.5 9C21.6 9 23.4 10.8 24 11.5C24.6 10.8 26.4 9 29.5 9C34.5 9 38.5 13.2 38.5 18.5C38.5 30.5 24 40 24 40Z"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Caring hands & seedling sprout inside */}
          <path
            d="M24 16V29"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M24 20C21.5 17.5 17 18.5 17 22C17 25 21 27 24 28"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <path
            d="M24 22C26.5 19.5 31 20.5 31 24C31 27 27 28.5 24 29.5"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
          />
          <circle cx="24" cy="14" r="2.2" fill="currentColor" />
        </svg>
      </div>

      {/* Brand Name & Tagline */}
      <div className="flex flex-col text-left">
        <span
          className={`font-bold tracking-tight font-['Plus_Jakarta_Sans',sans-serif] leading-tight ${titleSizes[size]} ${
            isLight ? 'text-white' : 'text-slate-900'
          }`}
        >
          ASHA-Saathi
        </span>
        {showSubtitle && (
          <span
            className={`font-medium tracking-wide leading-tight ${subtitleSizes[size]} ${
              isLight ? 'text-emerald-200/90' : 'text-slate-500'
            }`}
          >
            Healthy Families <span className="opacity-70">•</span> Stronger Communities
          </span>
        )}
      </div>
    </div>
  );
};
