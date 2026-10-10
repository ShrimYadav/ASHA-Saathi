import React, { useState } from 'react';
import { ArrowLeft, Search, ChevronRight, Filter } from 'lucide-react';
import { MOCK_PATIENTS } from '../../data/mockData';
import { Patient } from '../../types';

interface MobilePatientListProps {
  onBack?: () => void;
  onSelectPatient?: (patient: Patient) => void;
}

export const MobilePatientList: React.FC<MobilePatientListProps> = ({
  onBack,
  onSelectPatient,
}) => {
  const [filter, setFilter] = useState<'All' | 'Pregnant' | 'Children' | 'High Risk'>('All');
  const [search, setSearch] = useState('');

  const filtered = MOCK_PATIENTS.filter((p) => {
    const matchesFilter =
      filter === 'All' ||
      (filter === 'Pregnant' && p.category === 'Pregnant') ||
      (filter === 'Children' && p.category === 'Children') ||
      (filter === 'High Risk' && p.category === 'High Risk');

    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.condition.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 text-slate-800 p-4 min-h-[580px]">
      <div className="space-y-3.5">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">
            Patient List
          </h2>
        </div>

        {/* Search Input */}
        <div className="relative rounded-xl border border-slate-200 bg-white focus-within:ring-2 focus-within:ring-emerald-600/10 focus-within:border-emerald-600 shadow-2xs">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or ID..."
            className="w-full pl-9 pr-3 py-2.5 text-xs text-slate-900 placeholder:text-slate-400 bg-transparent rounded-xl focus:outline-hidden font-medium"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {(['All', 'Pregnant', 'Children', 'High Risk'] as const).map((cat) => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-3 py-1 rounded-full text-[11px] font-semibold whitespace-nowrap transition-all ${
                filter === cat
                  ? 'bg-[#064e3b] text-white shadow-2xs'
                  : 'bg-white text-slate-600 border border-slate-200/80 hover:bg-slate-100'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Patient Cards */}
        <div className="space-y-2">
          {filtered.map((patient) => {
            const isHigh = patient.statusTag === 'High Priority';
            const isFollow = patient.statusTag === 'Follow Up';

            return (
              <div
                key={patient.id}
                onClick={() => onSelectPatient && onSelectPatient(patient)}
                className="bg-white p-3 rounded-2xl border border-slate-200/70 shadow-2xs flex items-center justify-between hover:border-emerald-300 transition-all cursor-pointer group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={patient.avatarUrl}
                    alt={patient.name}
                    className="w-9 h-9 rounded-full object-cover shrink-0 ring-1 ring-slate-100"
                  />
                  <div className="min-w-0">
                    <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                      {patient.name}
                    </h3>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">
                      {patient.condition}
                      <span className="mx-1">•</span>
                      {patient.lastVisit}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      isHigh
                        ? 'bg-rose-50 text-rose-600 border border-rose-200'
                        : isFollow
                        ? 'bg-amber-50 text-amber-700 border border-amber-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {patient.statusTag}
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
