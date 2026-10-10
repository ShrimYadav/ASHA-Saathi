import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Mic, MicOff, ChevronDown, Check, Volume2, Sparkles, AlertCircle } from 'lucide-react';
import { DialectOption } from '../../types';
import { SpeechHandler, isSpeechRecognitionSupported } from '../../services/speechRecognition';

interface MobileVoiceRecordProps {
  onBack?: () => void;
  onNext?: (transcript: string) => void;
  onOpenDialectModal?: () => void;
}

export const MobileVoiceRecord: React.FC<MobileVoiceRecordProps> = ({
  onBack,
  onNext,
  onOpenDialectModal,
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<DialectOption>('Hindi (हिन्दी)');
  const [transcript, setTranscript] = useState('');
  const [seconds, setSeconds] = useState(0);
  const [browserSupport, setBrowserSupport] = useState(true);
  const [speechError, setSpeechError] = useState<string | null>(null);

  const speechHandlerRef = useRef<SpeechHandler | null>(null);

  useEffect(() => {
    setBrowserSupport(isSpeechRecognitionSupported());
    speechHandlerRef.current = new SpeechHandler({
      language: selectedLanguage.includes('Hindi') ? 'hi-IN' : 'en-IN',
      onInterimResult: (interim) => {
        setTranscript((prev) => prev.split(' [')[0] + ' ' + interim);
      },
      onFinalResult: (final) => {
        setTranscript((prev) => (prev ? prev + ' ' : '') + final);
      },
      onError: (err) => {
        setSpeechError(err);
        setIsRecording(false);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    return () => {
      speechHandlerRef.current?.stop();
    };
  }, [selectedLanguage]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRecording) {
      timer = setInterval(() => {
        setSeconds((s) => s + 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  const toggleRecording = () => {
    setSpeechError(null);
    if (isRecording) {
      speechHandlerRef.current?.stop();
      setIsRecording(false);
    } else {
      speechHandlerRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleFinish = () => {
    const finalTx = transcript.trim() || 'सविता शर्मा का दूसरा ट्राइमेस्टर है। हल्का सिरदर्द और थकान है। बीपी सामान्य है।';
    if (onNext) onNext(finalTx);
  };

  const loadDemoVoice = (sample: 'savita' | 'kamal') => {
    if (sample === 'savita') {
      setTranscript('सविता शर्मा का दूसरा ट्राइमेस्टर है। सिरदर्द और बहुत कमजोरी लग रही है। खाना ठीक से नहीं खा पा रही हैं।');
    } else {
      setTranscript('कमल सिंह को पिछले तीन हफ्ते से लगातार खांसी और रात में पसीना आ रहा है। वजन भी बहुत कम हो गया है।');
    }
  };

  return (
    <div className="flex-1 flex flex-col justify-between bg-white text-slate-800 p-4 min-h-[580px]">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1 rounded-full text-slate-600 hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
            <h2 className="text-sm font-bold text-slate-900">
              Voice Visit Record
            </h2>
          </div>
          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
            {Math.floor(seconds / 60)}:{(seconds % 60).toString().padStart(2, '0')}
          </span>
        </div>

        {/* Stepper (1, 2, 3) */}
        <div className="flex items-center justify-center gap-3 py-3">
          <div className="flex items-center">
            <span className="w-6 h-6 rounded-full bg-[#064e3b] text-white text-xs font-bold flex items-center justify-center">
              1
            </span>
            <div className="w-8 h-[2px] bg-slate-200 mx-1.5" />
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs font-medium flex items-center justify-center border border-slate-200">
              2
            </span>
            <div className="w-8 h-[2px] bg-slate-200 mx-1.5" />
            <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-400 text-xs font-medium flex items-center justify-center border border-slate-200">
              3
            </span>
          </div>
        </div>

        {/* Title */}
        <div className="text-center pt-1">
          <h3 className="text-base font-bold text-slate-900">
            Speak the visit details
          </h3>
          <p className="text-xs text-slate-500 mt-0.5 max-w-[240px] mx-auto">
            Speak symptoms, vitals, nutrition & medicines in your language.
          </p>
        </div>
      </div>

      {/* Center: Audio Waveform & Big Mic Button */}
      <div className="flex flex-col items-center justify-center my-auto py-3">
        {/* Animated Waveform Bars */}
        <div className="flex items-center justify-center gap-1.5 h-10 w-full max-w-[220px] mb-6">
          {[24, 45, 18, 60, 32, 50, 75, 40, 20, 55, 30].map((h, i) => (
            <span
              key={i}
              className={`w-1 rounded-full transition-all duration-300 ${
                isRecording
                  ? 'bg-emerald-600 animate-pulse'
                  : 'bg-slate-300'
              }`}
              style={{
                height: isRecording ? `${h}%` : '15%',
                animationDelay: `${i * 90}ms`,
              }}
            />
          ))}
        </div>

        {/* Large pulsing Mic Button */}
        <div className="relative">
          {isRecording && (
            <div className="absolute inset-0 -m-3 rounded-full bg-emerald-500/20 animate-ping opacity-75 pointer-events-none" />
          )}

          <button
            onClick={toggleRecording}
            className={`relative w-20 h-20 rounded-full text-white flex items-center justify-center shadow-xl active:scale-95 transition-all ${
              isRecording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#0b533e] hover:bg-[#064e3b]'
            }`}
            aria-label="Toggle Microphone"
          >
            {isRecording ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>
        </div>

        {/* Status text */}
        <p className="text-xs font-semibold text-slate-700 mt-4">
          {isRecording ? 'Listening in real-time...' : 'Tap microphone to speak'}
        </p>

        {speechError && (
          <p className="text-[11px] text-rose-600 bg-rose-50 px-2 py-1 rounded-md mt-2 text-center max-w-[280px]">
            {speechError}
          </p>
        )}

        {/* Live Transcript / Manual Input Card */}
        <div className="w-full mt-4">
          <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
            <span>Captured Transcript:</span>
            <div className="flex gap-1.5">
              <button
                onClick={() => loadDemoVoice('savita')}
                className="text-[10px] text-emerald-700 font-semibold hover:underline"
              >
                Sample ANC
              </button>
              <span>•</span>
              <button
                onClick={() => loadDemoVoice('kamal')}
                className="text-[10px] text-rose-700 font-semibold hover:underline"
              >
                Sample TB
              </button>
            </div>
          </div>
          <textarea
            value={transcript}
            onChange={(e) => setTranscript(e.target.value)}
            placeholder="Type or speak visit observations (Hindi/English)..."
            rows={2}
            className="w-full text-xs p-2.5 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-600 font-medium text-slate-800"
          />
        </div>
      </div>

      {/* Language Selector & Continue Action */}
      <div className="space-y-2 pt-2">
        <button
          onClick={onOpenDialectModal}
          className="w-full py-2 px-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700 transition-colors"
        >
          <span className="truncate">{selectedLanguage}</span>
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </button>

        <button
          onClick={handleFinish}
          className="w-full py-3 px-4 rounded-xl bg-[#064e3b] hover:bg-[#043927] text-white font-bold text-xs shadow-md transition-all flex items-center justify-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
          <span>Process with AI Summary</span>
        </button>
      </div>
    </div>
  );
};

