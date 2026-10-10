import React, { useState } from 'react';
import { MessageSquareText } from 'lucide-react';
import { DialectOption } from '../../types';

interface MobileDialectModalProps {
  onSelectDialect?: (d: DialectOption) => void;
  onClose?: () => void;
}

export const MobileDialectModal: React.FC<MobileDialectModalProps> = ({
  onSelectDialect,
  onClose,
}) => {
  const [selected, setSelected] = useState<DialectOption>('Bhojpuri');

  const dialects: DialectOption[] = [
    'Bhojpuri',
    'Bundeli',
    'Marathi',
    'Rajasthani',
  ];

  const handleApply = () => {
    if (onSelectDialect) onSelectDialect(selected);
    if (onClose) onClose();
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-slate-800 p-6 min-h-[580px] text-center">
      <div className="my-auto space-y-4 max-w-[270px] mx-auto">
        {/* Icon in emerald circle */}
        <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto shadow-xs border border-emerald-100">
          <MessageSquareText className="w-8 h-8" />
        </div>

        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
          Local Dialect Support
        </h3>

        <p className="text-xs text-slate-500 leading-relaxed font-normal">
          We understand local dialects and medical terms.
        </p>

        {/* Dialect Pill Grid */}
        <div className="grid grid-cols-2 gap-2.5 pt-2">
          {dialects.map((d) => (
            <button
              key={d}
              onClick={() => setSelected(d)}
              className={`py-2 px-3 rounded-full text-xs font-semibold border transition-all ${
                selected === d
                  ? 'bg-emerald-100/70 border-emerald-500 text-emerald-900 shadow-2xs font-bold'
                  : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
      </div>

      <div className="pt-4">
        <button
          onClick={handleApply}
          className="w-full py-3.5 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-xs shadow-2xs transition-colors"
        >
          Change Dialect
        </button>
      </div>
    </div>
  );
};
