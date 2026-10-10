import React from 'react';
import { WifiOff, Database } from 'lucide-react';

interface MobileOfflineModalProps {
  onContinue?: () => void;
}

export const MobileOfflineModal: React.FC<MobileOfflineModalProps> = ({
  onContinue,
}) => {
  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-slate-800 p-6 min-h-[580px] text-center">
      <div className="my-auto space-y-4 max-w-[260px] mx-auto">
        {/* Icon in emerald circle */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
          <Database className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Offline Mode
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          Your data is safely stored on this device. It will sync automatically when you get internet connection.
        </p>
      </div>

      <div className="pt-4">
        <button
          onClick={onContinue}
          className="w-full py-3.5 px-4 rounded-xl bg-[#0b533e] hover:bg-[#064e3b] text-white font-bold text-xs shadow-md active:scale-95 transition-all"
        >
          Continue
        </button>
      </div>
    </div>
  );
};
