import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  User,
  Globe,
  Database,
  Sliders,
  HelpCircle,
  LogOut,
  ChevronRight,
  RefreshCw,
  CheckCircle2,
} from 'lucide-react';
import { CURRENT_USER } from '../../data/mockData';
import { offlineStorage } from '../../services/indexedDB';
import { api } from '../../services/api';

interface MobileSettingsProps {
  onBack?: () => void;
  onOpenDialect?: () => void;
  onOpenOffline?: () => void;
  onLogout?: () => void;
}

export const MobileSettings: React.FC<MobileSettingsProps> = ({
  onBack,
  onOpenDialect,
  onOpenOffline,
  onLogout,
}) => {
  const [storageStats, setStorageStats] = useState({
    draftsCount: 0,
    queueCount: 0,
    sizeFormatted: '12 MB used',
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncResult, setSyncResult] = useState<string | null>(null);

  useEffect(() => {
    offlineStorage.getEstimatedStorage().then((s) => {
      setStorageStats({
        draftsCount: s.draftsCount,
        queueCount: s.queueCount,
        sizeFormatted: `${s.sizeFormatted} used`,
      });
    });
  }, []);

  const handleManualSync = async () => {
    setIsSyncing(true);
    setSyncResult(null);
    try {
      const drafts = await offlineStorage.getDraftVisits();
      const res = await api.syncOfflineBatch(drafts, []);
      setSyncResult(`Synced ${res.syncedVisits} draft(s) with cloud server.`);
      await offlineStorage.clearSyncQueue();
    } catch (e: any) {
      setSyncResult('Offline: Changes preserved safely in local storage.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-slate-50 text-slate-800 p-4 min-h-[580px]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="p-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <h2 className="text-sm font-bold text-slate-900">
            Settings / Profile
          </h2>
        </div>

        {/* User Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs flex items-center gap-3">
          <img
            src={CURRENT_USER.avatar}
            alt={CURRENT_USER.name}
            className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-600/30"
          />
          <div>
            <h3 className="text-sm font-bold text-slate-900 leading-tight">
              {CURRENT_USER.name}
            </h3>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {CURRENT_USER.role} • {CURRENT_USER.subCentre}
            </p>
          </div>
        </div>

        {/* Sync Trigger Card */}
        <div className="bg-emerald-50/90 rounded-2xl p-3 border border-emerald-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-emerald-900 block">
              Offline Sync Engine
            </span>
            <span className="text-[11px] text-emerald-800">
              {storageStats.queueCount} pending change(s) in queue
            </span>
          </div>
          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center gap-1.5 transition-colors"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync</span>
          </button>
        </div>

        {syncResult && (
          <p className="text-[11px] text-emerald-800 bg-emerald-100/70 p-2 rounded-xl text-center font-medium">
            {syncResult}
          </p>
        )}

        {/* Settings Navigation List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs divide-y divide-slate-100 overflow-hidden text-xs">
          <button className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <User className="w-4 h-4 text-slate-400" />
              <span>Personal Information</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button
            onClick={onOpenDialect}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <Globe className="w-4 h-4 text-slate-400" />
              <span>Language &amp; Dialect</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
              <span>Hindi (हिन्दी)</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <button
            onClick={onOpenOffline}
            className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left"
          >
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <Database className="w-4 h-4 text-slate-400" />
              <span>Offline Storage</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium text-[11px]">
              <span>{storageStats.sizeFormatted}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </div>
          </button>

          <button className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <Sliders className="w-4 h-4 text-slate-400" />
              <span>App Settings</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>

          <button className="w-full p-3.5 flex items-center justify-between hover:bg-slate-50 transition-colors text-left">
            <div className="flex items-center gap-3 text-slate-700 font-medium">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Help &amp; Support</span>
            </div>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </button>
        </div>
      </div>

      {/* Log Out button */}
      <div className="pt-4">
        <button
          onClick={onLogout}
          className="w-full py-3 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-bold text-xs text-slate-700 transition-colors flex items-center justify-center gap-2 shadow-2xs"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Log Out</span>
        </button>
      </div>
    </div>
  );
};

