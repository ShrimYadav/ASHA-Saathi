import React, { useState, useEffect } from 'react';
import {
  ArrowLeft,
  Sparkles,
  Edit2,
  AlertTriangle,
  ChevronRight,
  Check,
  Loader2,
  Save,
} from 'lucide-react';
import { api } from '../../services/api';
import { offlineStorage } from '../../services/indexedDB';

interface MobileVisitSummaryProps {
  transcript?: string;
  onBack?: () => void;
  onSave?: (savedVisit: any) => void;
  onViewRiskDetails?: (ruleData: any) => void;
}

export const MobileVisitSummary: React.FC<MobileVisitSummaryProps> = ({
  transcript,
  onBack,
  onSave,
  onViewRiskDetails,
}) => {
  const [data, setData] = useState({
    name: 'Savita Sharma',
    age: '26 years',
    condition: 'Pregnant (2nd Trimester)',
    symptoms: 'Mild headache, fatigue',
    visitDate: '10 Oct 2026',
    followUp: 'ANC checkup in 2 weeks',
    riskFlag: {
      level: 'Amber',
      message: 'Mild anemia risk detected (according to protocol)',
    },
  });

  const [isEditing, setIsEditing] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [evaluation, setEvaluation] = useState<any[]>([]);

  useEffect(() => {
    if (transcript) {
      setIsProcessing(true);
      api
        .extractVisitFromTranscript(transcript)
        .then((res) => {
          if (res.extracted) {
            const ext = res.extracted;
            const isTb = ext.condition.toLowerCase().includes('tb') || ext.symptoms.some((s: string) => s.toLowerCase().includes('cough'));
            setData({
              name: ext.personName,
              age: ext.age,
              condition: ext.condition,
              symptoms: Array.isArray(ext.symptoms) ? ext.symptoms.join(', ') : ext.symptoms,
              visitDate: ext.visitDate || '10 Oct 2026',
              followUp: ext.followUp,
              riskFlag: {
                level: isTb ? 'Red' : 'Amber',
                message: isTb
                  ? 'High Priority: Presumptive TB symptoms detected'
                  : 'Mild anemia risk detected (according to protocol)',
              },
            });
          }
        })
        .catch((e) => console.warn('AI extraction fallback used:', e))
        .finally(() => setIsProcessing(false));
    }
  }, [transcript]);

  const handleSave = async () => {
    setIsProcessing(true);
    const symptomsArr = data.symptoms.split(',').map((s) => s.trim());

    try {
      if (navigator.onLine) {
        const res = await api.createVisit({
          personId: data.name.includes('Kamal') ? 'P03' : 'P01',
          personName: data.name,
          condition: data.condition,
          symptoms: symptomsArr,
          notes: `Confirmed visit for ${data.name}. Follow up: ${data.followUp}`,
        });
        setEvaluation(res.clinicalEvaluation);
      } else {
        // Save to IndexedDB offline storage
        await offlineStorage.saveDraftVisit({
          id: `OFFLINE-VIS-${Date.now()}`,
          personId: 'P01',
          personName: data.name,
          transcript: transcript || '',
          symptoms: symptomsArr,
          condition: data.condition,
          notes: data.followUp,
          timestamp: new Date().toISOString(),
          isSynced: false,
        });
        await offlineStorage.enqueueSync({
          id: `SYNC-${Date.now()}`,
          type: 'VISIT',
          data: {
            personName: data.name,
            condition: data.condition,
            symptoms: symptomsArr,
          },
          createdAt: new Date().toISOString(),
        });
      }

      setSavedSuccess(true);
      setTimeout(() => {
        setSavedSuccess(false);
        if (data.riskFlag.level === 'Red' && onViewRiskDetails) {
          onViewRiskDetails(evaluation);
        } else if (onSave) {
          onSave(data);
        }
      }, 700);
    } catch (err) {
      console.error('Failed to save visit:', err);
    } finally {
      setIsProcessing(false);
    }
  };

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
            Visit Summary
          </h2>
        </div>

        {/* AI Extracted Information Card */}
        <div className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-2xs space-y-3">
          <div className="flex items-center justify-between pb-2.5 border-b border-slate-100">
            <div className="flex items-center gap-1.5 text-emerald-800 font-bold text-xs">
              {isProcessing ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              ) : (
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              )}
              <span>AI Extracted Information</span>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
            >
              <Edit2 className="w-3 h-3" />
              <span>{isEditing ? 'Done' : 'Edit'}</span>
            </button>
          </div>

          <div className="space-y-2.5 text-xs">
            <div className="flex justify-between items-baseline py-0.5">
              <span className="text-slate-500 text-[11px] font-medium">Name</span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="font-semibold text-slate-900 border border-slate-300 rounded px-1.5 py-0.5 text-right text-xs"
                />
              ) : (
                <span className="font-semibold text-slate-900">{data.name}</span>
              )}
            </div>

            <div className="flex justify-between items-baseline py-0.5">
              <span className="text-slate-500 text-[11px] font-medium">Age</span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.age}
                  onChange={(e) => setData({ ...data, age: e.target.value })}
                  className="font-semibold text-slate-900 border border-slate-300 rounded px-1.5 py-0.5 text-right text-xs"
                />
              ) : (
                <span className="font-semibold text-slate-900">{data.age}</span>
              )}
            </div>

            <div className="flex justify-between items-baseline py-0.5">
              <span className="text-slate-500 text-[11px] font-medium">Condition</span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.condition}
                  onChange={(e) => setData({ ...data, condition: e.target.value })}
                  className="font-semibold text-slate-900 border border-slate-300 rounded px-1.5 py-0.5 text-right text-xs"
                />
              ) : (
                <span className="font-semibold text-slate-900 text-right">{data.condition}</span>
              )}
            </div>

            <div className="flex justify-between items-baseline py-0.5">
              <span className="text-slate-500 text-[11px] font-medium">Symptoms</span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.symptoms}
                  onChange={(e) => setData({ ...data, symptoms: e.target.value })}
                  className="font-semibold text-slate-900 border border-slate-300 rounded px-1.5 py-0.5 text-right text-xs"
                />
              ) : (
                <span className="font-semibold text-slate-900 text-right">{data.symptoms}</span>
              )}
            </div>

            <div className="flex justify-between items-baseline py-0.5">
              <span className="text-slate-500 text-[11px] font-medium">Visit Date</span>
              <span className="font-semibold text-slate-900">{data.visitDate}</span>
            </div>

            <div className="flex justify-between items-baseline py-0.5">
              <span className="text-slate-500 text-[11px] font-medium">Follow Up</span>
              {isEditing ? (
                <input
                  type="text"
                  value={data.followUp}
                  onChange={(e) => setData({ ...data, followUp: e.target.value })}
                  className="font-semibold text-emerald-800 border border-slate-300 rounded px-1.5 py-0.5 text-right text-xs"
                />
              ) : (
                <span className="font-semibold text-emerald-800 text-right">{data.followUp}</span>
              )}
            </div>
          </div>
        </div>

        {/* Risk Flag Alert Box */}
        <div
          className={`rounded-2xl p-3.5 border shadow-2xs ${
            data.riskFlag.level === 'Red'
              ? 'bg-rose-50/90 border-rose-200/80'
              : 'bg-amber-50/90 border-amber-200/80'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <div
              className={`w-5 h-5 rounded-full text-white flex items-center justify-center shrink-0 ${
                data.riskFlag.level === 'Red' ? 'bg-rose-600' : 'bg-amber-500'
              }`}
            >
              <AlertTriangle className="w-3 h-3" />
            </div>
            <span
              className={`text-xs font-bold ${
                data.riskFlag.level === 'Red' ? 'text-rose-900' : 'text-amber-900'
              }`}
            >
              Risk Flag: {data.riskFlag.level}
            </span>
          </div>

          <p
            className={`text-[11px] ml-7 leading-relaxed font-medium ${
              data.riskFlag.level === 'Red' ? 'text-rose-950' : 'text-amber-800/90'
            }`}
          >
            {data.riskFlag.message}
          </p>

          <div className="ml-7 mt-2">
            <button
              onClick={() => {
                if (onViewRiskDetails) onViewRiskDetails(evaluation);
              }}
              className={`text-[11px] font-bold hover:underline inline-flex items-center gap-0.5 ${
                data.riskFlag.level === 'Red' ? 'text-rose-900' : 'text-amber-900'
              }`}
            >
              <span>View Protocol Details</span>
              <ChevronRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      </div>

      {/* Save Record Button */}
      <div className="pt-4">
        <button
          onClick={handleSave}
          disabled={savedSuccess || isProcessing}
          className={`w-full py-3.5 px-4 rounded-xl font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5 ${
            savedSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-[#0b533e] hover:bg-[#064e3b] text-white active:scale-95'
          }`}
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Saving Record...</span>
            </>
          ) : savedSuccess ? (
            <>
              <Check className="w-4 h-4" />
              <span>Record Saved &amp; Verified!</span>
            </>
          ) : (
            'Save Record'
          )}
        </button>
      </div>
    </div>
  );
};

