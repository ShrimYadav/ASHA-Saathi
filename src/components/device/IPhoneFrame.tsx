import React from 'react';
import { Wifi, Battery } from 'lucide-react';

interface IPhoneFrameProps {
  children: React.ReactNode;
  title?: string;
  className?: string;
  screenClassName?: string;
  time?: string;
  theme?: 'dark' | 'light';
}

export const IPhoneFrame: React.FC<IPhoneFrameProps> = ({
  children,
  className = '',
  screenClassName = '',
  time = '9:41',
  theme = 'dark',
}) => {
  const isLight = theme === 'light';

  return (
    <div
      className={`relative rounded-[38px] p-2.5 bg-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.25)] border-[3px] border-slate-700/80 transition-all select-none ${className}`}
      style={{
        boxShadow:
          '0 25px 50px -12px rgba(15, 23, 42, 0.35), 0 0 0 1px rgba(255, 255, 255, 0.1)',
      }}
    >
      {/* Screen container */}
      <div
        className={`relative w-full h-full rounded-[30px] overflow-hidden flex flex-col font-['Plus_Jakarta_Sans',sans-serif] bg-white ${screenClassName}`}
      >
        {/* iOS Status Bar */}
        <div
          className={`shrink-0 h-10 px-6 flex items-center justify-between text-xs font-semibold z-30 ${
            isLight ? 'text-white' : 'text-slate-800'
          }`}
        >
          <span className="tracking-tight text-[13px]">{time}</span>

          {/* Speaker / Notch area */}
          <div className="absolute left-1/2 -translate-x-1/2 top-2 w-20 h-4 bg-black/20 backdrop-blur-md rounded-full flex items-center justify-center pointer-events-none">
            <div className="w-10 h-1 bg-black/40 rounded-full" />
          </div>

          <div className="flex items-center gap-1.5 opacity-90">
            {/* Cellular Signal bars */}
            <div className="flex items-end gap-[2px] h-3 mr-0.5">
              <span className="w-[3px] h-1.5 bg-current rounded-xs" />
              <span className="w-[3px] h-2 bg-current rounded-xs" />
              <span className="w-[3px] h-2.5 bg-current rounded-xs" />
              <span className="w-[3px] h-3 bg-current rounded-xs" />
            </div>
            <Wifi className="w-3.5 h-3.5" />
            <Battery className="w-4 h-4" />
          </div>
        </div>

        {/* Screen Content */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden relative flex flex-col scrollbar-thin">
          {children}
        </div>

        {/* Bottom Home Indicator */}
        <div className="shrink-0 h-5 w-full flex items-center justify-center pointer-events-none z-30">
          <div
            className={`w-32 h-1 rounded-full ${
              isLight ? 'bg-white/40' : 'bg-slate-300'
            }`}
          />
        </div>
      </div>
    </div>
  );
};
