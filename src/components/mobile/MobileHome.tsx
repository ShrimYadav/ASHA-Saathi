import React from 'react';
import {
  Mic,
  AlertTriangle,
  QrCode,
  Users,
  ChevronRight,
  Home,
  ClipboardList,
  GitPullRequest,
  MoreHorizontal,
  Clock,
  CheckCircle2,
} from 'lucide-react';
import { CURRENT_USER } from '../../data/mockData';

interface MobileHomeProps {
  onNavigate?: (screen: string) => void;
}

export const MobileHome: React.FC<MobileHomeProps> = ({ onNavigate }) => {
  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 text-slate-800 min-h-[580px]">
      <div className="p-4 space-y-4">
        {/* User Header */}
        <div className="flex items-center gap-3 pt-1">
          <img
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.name}
            className="w-11 h-11 rounded-full object-cover ring-2 ring-emerald-600/30 shrink-0"
          />
          <div className="min-w-0">
            <h2 className="text-xs font-bold text-slate-900 leading-tight">
              Good Morning,
            </h2>
            <p className="text-sm font-extrabold text-[#064e3b] leading-tight truncate">
              {CURRENT_USER.name}
            </p>
            <span className="text-[10px] text-slate-500 font-medium">
              {CURRENT_USER.role}
            </span>
          </div>
        </div>

        {/* Today's Overview Cards */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 mb-2.5">
            Today&apos;s Overview
          </h3>
          <div className="grid grid-cols-3 gap-2">
            {/* 12 Households */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200/70 shadow-2xs text-center flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-1">
                <Users className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-extrabold text-slate-900 leading-none">
                {CURRENT_USER.todayHouseholds}
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-1">
                Households
              </span>
            </div>

            {/* 3 Referrals */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200/70 shadow-2xs text-center flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mb-1">
                <Clock className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-extrabold text-slate-900 leading-none">
                {CURRENT_USER.pendingReferrals}
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-1">
                Referrals
              </span>
            </div>

            {/* 8 Completed */}
            <div className="bg-white p-2.5 rounded-2xl border border-slate-200/70 shadow-2xs text-center flex flex-col items-center">
              <div className="w-7 h-7 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <span className="text-base font-extrabold text-slate-900 leading-none">
                {CURRENT_USER.completedVisits}
              </span>
              <span className="text-[10px] text-slate-500 font-medium mt-1">
                Completed
              </span>
            </div>
          </div>
        </div>

        {/* Quick Actions Container (Solid forest green styled in mockup) */}
        <div>
          <h3 className="text-xs font-bold text-slate-900 mb-2.5">
            Quick Actions
          </h3>
          <div className="bg-[#0b533e] rounded-2xl p-2.5 space-y-2 shadow-sm text-white">
            {/* Action 1: Record Visit (Voice) */}
            <button
              onClick={() => onNavigate && onNavigate('voice-record')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Mic className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white">
                  Record Visit (Voice)
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200/60" />
            </button>

            {/* Action 2: View Priority Cases */}
            <button
              onClick={() => onNavigate && onNavigate('risk-alert')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-rose-500/20 text-rose-300 flex items-center justify-center">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white">
                  View Priority Cases
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200/60" />
            </button>

            {/* Action 3: Scan Referral QR */}
            <button
              onClick={() => onNavigate && onNavigate('qr-scan')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <QrCode className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white">
                  Scan Referral QR
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200/60" />
            </button>

            {/* Action 4: View Patient List */}
            <button
              onClick={() => onNavigate && onNavigate('patient-list')}
              className="w-full flex items-center justify-between p-2.5 rounded-xl bg-white/10 hover:bg-white/20 active:bg-white/25 transition-all text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <span className="text-xs font-semibold text-white">
                  View Patient List
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-emerald-200/60" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Navigation Bar */}
      <div className="shrink-0 bg-white border-t border-slate-200/80 px-4 py-2 flex items-center justify-between z-20">
        <button
          onClick={() => onNavigate && onNavigate('home')}
          className="flex flex-col items-center gap-0.5 text-[#064e3b] font-bold text-[10px]"
        >
          <Home className="w-4 h-4" />
          <span>Home</span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('patient-list')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-medium text-[10px]"
        >
          <ClipboardList className="w-4 h-4" />
          <span>Visits</span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('referral-passport')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-medium text-[10px]"
        >
          <GitPullRequest className="w-4 h-4" />
          <span>Referrals</span>
        </button>

        <button
          onClick={() => onNavigate && onNavigate('settings')}
          className="flex flex-col items-center gap-0.5 text-slate-400 hover:text-slate-600 font-medium text-[10px]"
        >
          <MoreHorizontal className="w-4 h-4" />
          <span>More</span>
        </button>
      </div>
    </div>
  );
};
