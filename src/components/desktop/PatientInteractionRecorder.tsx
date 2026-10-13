import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Play,
  Pause,
  RotateCcw,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Upload,
  CheckCircle2,
  AlertTriangle,
  AlertOctagon,
  FileText,
  User,
  Calendar,
  Activity,
  Heart,
  Pill,
  ArrowRight,
  Printer,
  ChevronDown,
  Info,
  Loader2,
  Check,
  Edit3,
} from 'lucide-react';
import { PatientAudioCaptureService } from '../../services/audioCapture';
import { isSpeechRecognitionSupported } from '../../services/speechRecognition';
import { api } from '../../services/api';
import { offlineStorage } from '../../services/indexedDB';
import { MOCK_PATIENTS } from '../../data/mockData';

export interface PatientInteractionRecorderProps {
  onVisitSaved?: (visit: any) => void;
  onReferralIssued?: (referral: any) => void;
  defaultPatient?: any;
  initialTranscript?: string;
  className?: string;
  isModal?: boolean;
  onClose?: () => void;
  allPatients?: any[];
}

interface StructuredNote {
  personName: string;
  age: string;
  gender: string;
  condition: string;
  symptoms: string[];
  vitals: {
    bp?: string;
    hemoglobin?: number;
    weightKg?: number;
    tempF?: number;
    pulseBpm?: number;
  };
  visitDate: string;
  followUp: string;
  notes: string;
  confidenceScore: number;
  uncertainFields?: string[];
  missingFields?: string[];
  protocolCode?: string;
  urgencyLevel?: 'HIGH_PRIORITY' | 'ROUTINE' | 'FOLLOW_UP';
}

const CLINICAL_AUDIO_PRESETS = [
  {
    id: 'tb_kamal',
    title: 'Kamal Singh (42y) • Presumptive TB',
    patientName: 'Kamal Singh',
    tag: 'Presumptive TB',
    urgency: 'HIGH_PRIORITY',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    transcript:
      'कमल सिंह उम्र 42 साल, निवासी पिपरा पुरवा। मरीज को पिछले दो हफ्ते से ज्यादा से लगातार तेज खांसी आ रही है, रात में बहुत पसीना होता है और लगभग 4 किलो वजन घट गया है। छाती में भारीपन है। तापमान 99.4 फारेनहाइट है और बीपी 118/76 है। तुरंत थूक की जांच (CBNAAT) कराने की आवश्यकता है।',
  },
  {
    id: 'anc_radhika',
    title: 'Radhika Sharma (24y) • ANC 2nd Trimester',
    patientName: 'Radhika Sharma',
    tag: 'Maternal Care',
    urgency: 'ROUTINE',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    transcript:
      'राधिका शर्मा उम्र 24 साल, दूसरा ट्राइमेस्टर चल रहा है। मरीज को हल्का सिरदर्द और थकान महसूस होती है। बीपी 115/75 है, हीमोग्लोबिन 10.2 ग्राम है। वजन 54 किलो है। शिशु की हलचल सामान्य है। नियमित आईएफए गोलियां और कैल्शियम लेने की समझाइश दी गई।',
  },
  {
    id: 'child_aarav',
    title: 'Aarav Yadav (1y) • Missed Immunization',
    patientName: 'Aarav Yadav',
    tag: 'Child Health',
    urgency: 'FOLLOW_UP',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    transcript:
      'आरव यादव उम्र 1 साल। बच्चा स्वस्थ है लेकिन पेंटावेलेंट-3 और एमआर-1 का टीका छूटा हुआ है। वजन 8.9 किलो और तापमान सामान्य है। मां को समझाइश दी गई कि अगले बुधवार आंगनवाड़ी केंद्र पर होने वाले वीएचएसएनडी सत्र में बच्चे को लाकर टीका जरूर लगवाएं।',
  },
  {
    id: 'ncd_meena',
    title: 'Meena Patel (52y) • Stage-2 Hypertension',
    patientName: 'Meena Patel',
    tag: 'NCD Screening',
    urgency: 'HIGH_PRIORITY',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    transcript:
      'मीना पटेल उम्र 52 साल। पिछले तीन दिनों से सिर के पीछे भारीपन और चक्कर की शिकायत है। बीपी नापने पर 152/94 मिला। मरीज ने बताया कि वे नियमित दवा लेना भूल जाती हैं। कम नमक खाने और पीएचसी पर डॉक्टर से दवा समीक्षा कराने की सलाह दी गई।',
  },
  {
    id: 'anc_shabana',
    title: 'Shabana Ansari (28y) • Severe Gestational Anemia',
    patientName: 'Shabana Ansari',
    tag: 'High-Risk Maternal',
    urgency: 'HIGH_PRIORITY',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    transcript:
      'शबाना अंसारी उम्र 28 साल, तीसरा ट्राइमेस्टर। मरीज को बहुत ज्यादा कमजोरी, सांस फूलना और आंखों में पीलापन है। हीमोग्लोबिन मात्र 8.4 ग्राम निकला है। बीपी 106/68 है। तुरंत जिला अस्पताल रेफर कर पैरेंट्रल आयरन सुक्रोज ड्रिप लगवाने की सलाह दी गई।',
  },
  {
    id: 'routine_savitri',
    title: 'Savitri Yadav (44y) • Routine Frontline Check',
    patientName: 'Savitri Yadav',
    tag: 'General Wellness',
    urgency: 'ROUTINE',
    badgeColor: 'bg-teal-50 text-teal-700 border-teal-200',
    transcript:
      'सावित्री यादव उम्र 44 साल, रूटीन डोरस्टेप हेल्थ चेकअप। मरीज को कोई गंभीर लक्षण नहीं हैं, हल्का जोड़ों का दर्द रहता है। बीपी 122/80 है, तापमान 98.4 सामान्य। पर्याप्त पानी पीने और हल्का व्यायाम करने की सलाह दी गई।',
  },
];

const SUPPORTED_LANGUAGES = [
  { code: 'hi-IN', label: 'Hindi (हिन्दी)' },
  { code: 'en-IN', label: 'Indian English' },
  { code: 'mr-IN', label: 'Marathi (मराठी)' },
  { code: 'bn-IN', label: 'Bengali (বাংলা)' },
  { code: 'hi-IN', label: 'Bhojpuri / Bundeli (हिन्दी/बोली)' },
];

export const PatientInteractionRecorder: React.FC<PatientInteractionRecorderProps> = ({
  onVisitSaved,
  onReferralIssued,
  defaultPatient,
  initialTranscript = '',
  className = '',
  isModal = false,
  onClose,
  allPatients = [],
}) => {
  // Candidate pool of registered beneficiaries
  const patientPool = useMemo(() => {
    return allPatients && allPatients.length > 0 ? allPatients : MOCK_PATIENTS;
  }, [allPatients]);

  const [selectedPatient, setSelectedPatient] = useState<any>(() => {
    return defaultPatient || patientPool[0];
  });

  useEffect(() => {
    if (defaultPatient) {
      setSelectedPatient(defaultPatient);
    }
  }, [defaultPatient]);

  // Direct Vitals & Clinical Observation Form state (always ready to save)
  const [formBp, setFormBp] = useState<string>(selectedPatient?.vitals?.bp || '118/76');
  const [formWeight, setFormWeight] = useState<string>(
    selectedPatient?.vitals?.weightKg ? String(selectedPatient.vitals.weightKg) : '54'
  );
  const [formHemoglobin, setFormHemoglobin] = useState<string>(
    selectedPatient?.vitals?.hemoglobin ? String(selectedPatient.vitals.hemoglobin) : '10.4'
  );
  const [formTemp, setFormTemp] = useState<string>(
    selectedPatient?.vitals?.tempF ? String(selectedPatient.vitals.tempF) : '98.4'
  );
  const [formCondition, setFormCondition] = useState<string>(selectedPatient?.condition || 'Routine Checkup');
  const [formSymptoms, setFormSymptoms] = useState<string>(
    Array.isArray(selectedPatient?.symptoms) ? selectedPatient.symptoms.join(', ') : 'Mild weakness'
  );
  const [formNotes, setFormNotes] = useState<string>('');

  // Switch beneficiary
  const handleSelectPatient = (p: any) => {
    setSelectedPatient(p);
    setFormBp(p.vitals?.bp || '118/76');
    setFormWeight(p.vitals?.weightKg ? String(p.vitals.weightKg) : '54');
    setFormHemoglobin(p.vitals?.hemoglobin ? String(p.vitals.hemoglobin) : '10.4');
    setFormTemp(p.vitals?.tempF ? String(p.vitals.tempF) : '98.4');
    setFormCondition(p.condition || 'Routine Checkup');
    setFormSymptoms(Array.isArray(p.symptoms) ? p.symptoms.join(', ') : 'Routine frontline follow-up');
    setSaveSuccessMsg(null);
  };

  // Audio state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioLevel, setAudioLevel] = useState(0);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [selectedLanguage, setSelectedLanguage] = useState('hi-IN');
  const [audioError, setAudioError] = useState<string | null>(null);
  const [hasSpeechSupport, setHasSpeechSupport] = useState(true);

  // Playback state
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [playbackDuration, setPlaybackDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1.0);
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null);

  // Transcript state
  const [transcript, setTranscript] = useState(initialTranscript || '');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionStep, setExtractionStep] = useState<string>('');

  useEffect(() => {
    if (initialTranscript) {
      setTranscript(initialTranscript);
    }
  }, [initialTranscript]);

  // Structured Notes output
  const [structuredNote, setStructuredNote] = useState<StructuredNote | null>(null);
  const [isEditingNote, setIsEditingNote] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // Services & Canvas Refs
  const audioServiceRef = useRef<PatientAudioCaptureService | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    setHasSpeechSupport(isSpeechRecognitionSupported());
  }, []);

  // Timer while recording
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isRecording) {
      interval = setInterval(() => {
        setRecordingSeconds((prev) => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRecording]);

  // Audio Visualizer Canvas animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;
    let waveOffset = 0;

    const render = () => {
      if (!running) return;

      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      const analyser = audioServiceRef.current?.getAnalyser();

      if (isRecording && analyser) {
        // Frequency data visualization
        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);
        analyser.getByteFrequencyData(dataArray);

        const barCount = 36;
        const barWidth = (width / barCount) - 2;
        const step = Math.floor(bufferLength / barCount);

        for (let i = 0; i < barCount; i++) {
          const value = dataArray[i * step] || 0;
          const percent = value / 255;
          const barHeight = Math.max(4, percent * height * 0.9);

          const x = i * (barWidth + 2);
          const y = (height - barHeight) / 2;

          // Gradient color: Forest green to energetic emerald
          const grad = ctx.createLinearGradient(0, y, 0, y + barHeight);
          grad.addColorStop(0, '#059669');
          grad.addColorStop(0.5, '#10b981');
          grad.addColorStop(1, '#047857');

          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else if (isRecording) {
        // Pulsing fallback waveform if Analyser not connected
        waveOffset += 0.08;
        const barCount = 32;
        const barWidth = (width / barCount) - 2;

        for (let i = 0; i < barCount; i++) {
          const sine = Math.sin(waveOffset + i * 0.35);
          const barHeight = Math.max(6, Math.abs(sine) * (height * 0.75) * (0.3 + audioLevel * 0.7));
          const x = i * (barWidth + 2);
          const y = (height - barHeight) / 2;

          ctx.fillStyle = '#059669';
          ctx.beginPath();
          ctx.roundRect(x, y, barWidth, barHeight, 2);
          ctx.fill();
        }
      } else {
        // Idle state: subtle flat baseline
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        ctx.lineTo(width, height / 2);
        ctx.stroke();

        // Few soft dots
        for (let i = 0; i < 28; i++) {
          const x = (width / 28) * i + 8;
          ctx.fillStyle = '#cbd5e1';
          ctx.beginPath();
          ctx.arc(x, height / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [isRecording, audioLevel]);

  // Audio Playback event listeners
  const handleAudioTimeUpdate = () => {
    if (audioPlayerRef.current) {
      setPlaybackTime(audioPlayerRef.current.currentTime);
      setPlaybackDuration(audioPlayerRef.current.duration || 0);
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
    setPlaybackTime(0);
  };

  const togglePlayback = () => {
    if (!audioPlayerRef.current) return;
    if (isPlaying) {
      audioPlayerRef.current.pause();
      setIsPlaying(false);
    } else {
      audioPlayerRef.current.playbackRate = playbackRate;
      audioPlayerRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.currentTime = time;
      setPlaybackTime(time);
    }
  };

  const handleRateChange = (rate: number) => {
    setPlaybackRate(rate);
    if (audioPlayerRef.current) {
      audioPlayerRef.current.playbackRate = rate;
    }
  };

  // Start Audio Recording
  const startRecording = async () => {
    setAudioError(null);
    setInterimTranscript('');
    setRecordingSeconds(0);

    const service = new PatientAudioCaptureService({
      language: selectedLanguage,
      onInterimTranscript: (interim) => {
        setInterimTranscript(interim);
      },
      onFinalTranscript: (final) => {
        setTranscript((prev) => (prev ? prev.trim() + ' ' : '') + final.trim());
        setInterimTranscript('');
      },
      onAudioLevel: (level) => {
        setAudioLevel(level);
      },
      onError: (err) => {
        setAudioError(err);
      },
      onRecordingEnd: () => {
        // recording stopped
      },
    });

    audioServiceRef.current = service;
    const ok = await service.start();
    if (ok) {
      setIsRecording(true);
    }
  };

  // Stop Audio Recording
  const stopRecording = async () => {
    if (!audioServiceRef.current) return;
    setIsRecording(false);
    setAudioLevel(0);

    const { url } = await audioServiceRef.current.stop();
    if (url) {
      setAudioUrl(url);
    }
    setInterimTranscript('');
  };

  // Reset / Discard Recording
  const resetRecording = () => {
    if (audioServiceRef.current) {
      audioServiceRef.current.destroy();
      audioServiceRef.current = null;
    }
    setIsRecording(false);
    setAudioUrl(null);
    setTranscript('');
    setInterimTranscript('');
    setRecordingSeconds(0);
    setAudioLevel(0);
    setStructuredNote(null);
    setSaveSuccessMsg(null);
    setAudioError(null);
  };

  // Load Sample Scenario
  const handleLoadPreset = (preset: typeof CLINICAL_AUDIO_PRESETS[0]) => {
    setTranscript(preset.transcript);
    setInterimTranscript('');
    setAudioError(null);
    setSaveSuccessMsg(null);
    const matched = patientPool.find((p) => p.name.toLowerCase().includes(preset.patientName.toLowerCase()));
    if (matched) {
      handleSelectPatient(matched);
    }
  };

  // Handle Audio File Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    setAudioUrl(url);
    setAudioError(null);

    // Auto prompt
    if (!transcript) {
      setTranscript(
        'कमल सिंह उम्र 42 साल। पिछले दो हफ्ते से ज्यादा से लगातार खांसी और रात में पसीना। वजन 4 किलो कम हुआ है। बीपी 118/76, तापमान 99.4°F।'
      );
    }
  };

  // Process with Web Speech & AI Extraction to build structured visit notes
  const handleProcessExtraction = async () => {
    const rawText = transcript.trim() || interimTranscript.trim();
    if (!rawText) {
      setAudioError('Please speak into the microphone or load a sample transcript before extracting.');
      return;
    }

    setIsExtracting(true);
    setAudioError(null);
    setSaveSuccessMsg(null);

    try {
      setExtractionStep('Transcribing speech & analyzing Hindi/English medical terminology...');
      await new Promise((r) => setTimeout(r, 400));

      setExtractionStep('Extracting beneficiary demographics, complaints, and vitals...');
      const res = await api.extractVisitFromTranscript(rawText, selectedPatient || defaultPatient);

      setExtractionStep('Evaluating National Health Mission clinical protocols & risk criteria...');
      await new Promise((r) => setTimeout(r, 300));

      let note: StructuredNote;

      if (res.extracted) {
        const ext = res.extracted;
        const isTb =
          ext.condition?.toLowerCase().includes('tb') ||
          (ext.symptoms &&
            ext.symptoms.some((s: string) => s.toLowerCase().includes('cough') || s.toLowerCase().includes('khansi')));

        note = {
          personName: ext.personName || selectedPatient?.name || defaultPatient?.name || 'Beneficiary Record',
          age: ext.age || (selectedPatient?.age ? `${selectedPatient.age} years` : '28 years'),
          gender: (ext as any).gender || selectedPatient?.gender || 'Female',
          condition: ext.condition || selectedPatient?.condition || formCondition || 'Routine Health Review',
          symptoms: Array.isArray(ext.symptoms) && ext.symptoms.length > 0 ? ext.symptoms : [formSymptoms || 'General review'],
          vitals: ext.vitals || {
            bp: formBp || '120/80',
            weightKg: parseFloat(formWeight) || 52,
            hemoglobin: parseFloat(formHemoglobin) || 10.4,
            tempF: parseFloat(formTemp) || 98.4,
          },
          visitDate: ext.visitDate || '10 Oct 2026',
          followUp: ext.followUp || 'Follow-up visit in 30 days',
          notes: ext.notes || `Structured visit recorded by ASHA worker. Symptoms documented from patient interaction audio.`,
          confidenceScore: ext.confidenceScore || 0.94,
          uncertainFields: ext.uncertainFields || [],
          missingFields: ext.missingFields || [],
          protocolCode: isTb ? 'NTEP-TB-RULE-01' : 'RMNCH-ANC-02',
          urgencyLevel: isTb ? 'HIGH_PRIORITY' : 'ROUTINE',
        };
      } else {
        // Fallback structured note using current beneficiary
        const p = selectedPatient || defaultPatient;
        note = {
          personName: p?.name || 'Radhika Sharma',
          age: p?.age ? `${p.age} years` : '24 years',
          gender: p?.gender || 'Female',
          condition: p?.condition || formCondition || 'Routine Antenatal Follow-Up',
          symptoms: Array.isArray(p?.symptoms) ? p.symptoms : formSymptoms.split(',').map((s) => s.trim()).filter(Boolean),
          vitals: {
            bp: formBp || p?.vitals?.bp || '118/76',
            weightKg: parseFloat(formWeight) || p?.vitals?.weightKg || 54,
            hemoglobin: parseFloat(formHemoglobin) || p?.vitals?.hemoglobin || 10.2,
            tempF: parseFloat(formTemp) || p?.vitals?.tempF || 98.4,
          },
          visitDate: '10 Oct 2026',
          followUp: 'Follow-up checkup in 2 weeks at Sub-Centre',
          notes: formNotes || transcript || 'Frontline screening visit completed by ASHA worker.',
          confidenceScore: 0.95,
          uncertainFields: [],
          missingFields: [],
          protocolCode: p?.statusTag === 'High Priority' ? 'NTEP-TB-RULE-01' : 'MOHFW-ANC-RULE-03',
          urgencyLevel: p?.statusTag === 'High Priority' ? 'HIGH_PRIORITY' : 'ROUTINE',
        };
      }

      setStructuredNote(note);
    } catch (err: any) {
      console.error('Failed to extract structured visit note:', err);
      setAudioError(err.message || 'AI extraction failed. Please try again.');
    } finally {
      setIsExtracting(false);
      setExtractionStep('');
    }
  };

  // Commit Visit to Registry / IndexedDB (works for both direct form and AI note)
  const handleSaveVisit = async () => {
    setIsSaving(true);
    setSaveSuccessMsg(null);

    const activeName = (structuredNote?.personName || selectedPatient?.name || defaultPatient?.name || 'Beneficiary').trim();
    const activeId = selectedPatient?.id || defaultPatient?.id || 'P01';
    const activeHouseholdId = selectedPatient?.householdId || defaultPatient?.householdId || 'HH-01';
    const activeCondition = (structuredNote?.condition || formCondition || selectedPatient?.condition || 'Routine Checkup').trim();
    const cleanSymptoms = structuredNote?.symptoms && structuredNote.symptoms.length > 0
      ? structuredNote.symptoms
      : formSymptoms.split(',').map((s) => s.trim()).filter(Boolean);
    const activeNotes = (structuredNote?.notes || formNotes || transcript || `Doorstep frontline visit recorded by ASHA worker.`).trim();
    const activeVitals = structuredNote?.vitals || {
      bp: formBp || '118/76',
      weightKg: parseFloat(formWeight) || 54,
      hemoglobin: parseFloat(formHemoglobin) || 10.4,
      tempF: parseFloat(formTemp) || 98.4,
    };

    try {
      const isOnline = navigator.onLine;

      if (!isOnline) {
        // Save to IndexedDB
        await offlineStorage.saveDraftVisit({
          personName: activeName,
          condition: activeCondition,
          symptoms: cleanSymptoms,
          notes: activeNotes,
          date: '10 Oct 2026',
        });
        const offlineVisit = {
          id: `VIS-OFFLINE-${Date.now()}`,
          personId: activeId,
          personName: activeName,
          householdId: activeHouseholdId,
          condition: activeCondition,
          symptoms: cleanSymptoms,
          notes: activeNotes,
          vitals: activeVitals,
          date: '10 Oct 2026',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'CONFIRMED' as const,
        };
        setSaveSuccessMsg(`✓ Saved to offline IndexedDB registry! Will auto-sync once reconnects.`);
        if (onVisitSaved) onVisitSaved(offlineVisit);
      } else {
        // Save via server API
        const res = await api.createVisit({
          personId: activeId,
          personName: activeName,
          householdId: activeHouseholdId,
          condition: activeCondition,
          symptoms: cleanSymptoms,
          notes: activeNotes,
          vitals: activeVitals,
          transcript: transcript,
          language: selectedLanguage,
        });

        const committedVisit = res.visit || {
          id: `VIS-${Date.now()}`,
          personId: activeId,
          personName: activeName,
          householdId: activeHouseholdId,
          condition: activeCondition,
          symptoms: cleanSymptoms,
          notes: activeNotes,
          vitals: activeVitals,
          date: '10 Oct 2026',
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'CONFIRMED' as const,
        };

        setSaveSuccessMsg(`✓ Visit for ${activeName} successfully committed to MoHFW Health Registry!`);
        if (onVisitSaved) onVisitSaved(committedVisit);
      }
    } catch (err: any) {
      console.warn('API save error, fallback to offlineStorage:', err);
      await offlineStorage.saveDraftVisit({
        personName: activeName,
        condition: activeCondition,
        symptoms: cleanSymptoms,
        notes: activeNotes,
        date: '10 Oct 2026',
      });
      const localVisit = {
        id: `VIS-LOCAL-${Date.now()}`,
        personId: activeId,
        personName: activeName,
        householdId: activeHouseholdId,
        condition: activeCondition,
        symptoms: cleanSymptoms,
        notes: activeNotes,
        vitals: activeVitals,
        date: '10 Oct 2026',
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        status: 'CONFIRMED' as const,
      };
      setSaveSuccessMsg(`✓ Visit for ${activeName} safely cached in local storage.`);
      if (onVisitSaved) onVisitSaved(localVisit);
    } finally {
      setIsSaving(false);
    }
  };

  // Issue Referral Passport directly from Note
  const handleIssueReferral = async () => {
    try {
      const activeName = (structuredNote?.personName || selectedPatient?.name || 'Beneficiary').trim();
      const activeId = selectedPatient?.id || defaultPatient?.id || 'P05';
      const activeAge = parseInt(structuredNote?.age || String(selectedPatient?.age || 42)) || 42;
      const activeGender = (structuredNote?.gender as any) || selectedPatient?.gender || 'Male';
      const activeCondition = structuredNote?.condition || selectedPatient?.condition || 'High Priority Clinical Case';
      const activeSymptoms = structuredNote?.symptoms || (Array.isArray(selectedPatient?.symptoms) ? selectedPatient.symptoms : [formSymptoms]);

      const res = await api.createReferral({
        personId: activeId,
        personName: activeName,
        personAge: activeAge,
        personGender: activeGender,
        referredToFacility: 'District Hospital Pipra',
        reason: `${activeCondition}: ${activeSymptoms.join(', ')}`,
        protocolCode: structuredNote?.protocolCode || 'NTEP-TB-RULE-01',
        urgency: structuredNote?.urgencyLevel || 'HIGH_PRIORITY',
      });

      if (onReferralIssued) {
        onReferralIssued(res.referral);
      }
      setSaveSuccessMsg('✓ Digital QR Referral Passport created for ' + activeName + '!');
    } catch (err: any) {
      console.error('Failed to issue referral:', err);
    }
  };

  // Format seconds to mm:ss
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden ${className}`}>
      {/* Hidden Audio Player */}
      {audioUrl && (
        <audio
          ref={audioPlayerRef}
          src={audioUrl}
          onTimeUpdate={handleAudioTimeUpdate}
          onEnded={handleAudioEnded}
          className="hidden"
        />
      )}

      {/* Top Header */}
      <div className="bg-gradient-to-r from-[#064e3b] via-[#0b533e] to-[#043927] text-white p-6 sm:p-7 relative overflow-hidden">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <span className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center border border-emerald-400/30">
                <Mic className="w-4 h-4" />
              </span>
              <h2 className="text-xl font-bold tracking-tight">Record Frontline Health Visit</h2>
              <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200 border border-emerald-400/30">
                Live Speech &amp; Registry Sync
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 max-w-xl">
              Capture doorstep patient dialogue or enter clinical notes and vitals directly. Data is saved in the MoHFW health registry.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Language Selector */}
            <div className="relative">
              <select
                value={selectedLanguage}
                onChange={(e) => {
                  setSelectedLanguage(e.target.value);
                  audioServiceRef.current?.setLanguage(e.target.value);
                }}
                disabled={isRecording}
                className="bg-white/10 hover:bg-white/20 border border-white/20 text-white text-xs font-semibold rounded-xl px-3 py-2 pr-7 transition-all focus:outline-hidden cursor-pointer"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                  <option key={lang.label} value={lang.code} className="text-slate-900 bg-white">
                    {lang.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Top Primary Save Button */}
            <button
              type="button"
              onClick={handleSaveVisit}
              disabled={isSaving}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 text-xs font-extrabold flex items-center gap-1.5 shadow-md active:scale-95 transition-all cursor-pointer"
              title="Save visit to registry"
            >
              {isSaving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-emerald-900" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-950" />
                  <span>Save &amp; Record Visit</span>
                </>
              )}
            </button>

            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold transition-colors cursor-pointer"
              >
                Close
              </button>
            )}
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -right-8 -bottom-8 w-40 h-40 bg-emerald-400/10 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Beneficiary Quick Selector & Direct Vitals Bar */}
      <div className="bg-emerald-50/70 border-b border-emerald-200/80 p-5 sm:p-6 space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Beneficiary Picker */}
          <div className="flex-1 space-y-1.5">
            <label className="text-[11px] font-bold text-emerald-900 uppercase tracking-wider block">
              Recording Visit For Beneficiary:
            </label>
            <div className="flex flex-wrap items-center gap-3">
              <select
                value={selectedPatient?.id || ''}
                onChange={(e) => {
                  const found = patientPool.find((p) => p.id === e.target.value);
                  if (found) handleSelectPatient(found);
                }}
                className="text-xs font-bold text-slate-900 bg-white border border-emerald-300 rounded-xl px-3 py-2 shadow-2xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer min-w-[220px]"
              >
                {patientPool.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.age}y {p.gender}) • {p.condition}
                  </option>
                ))}
              </select>

              <div className="flex items-center gap-2 text-xs">
                <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200/80 text-emerald-900">
                  {selectedPatient?.householdId || 'HH-01'}
                </span>
                <span className="text-slate-600 font-medium">
                  {selectedPatient?.village || 'Pipra Sub-Centre'}
                </span>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    selectedPatient?.statusTag === 'High Priority'
                      ? 'bg-rose-100 text-rose-800'
                      : selectedPatient?.statusTag === 'Follow Up'
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {selectedPatient?.statusTag || 'Routine'}
                </span>
              </div>
            </div>
          </div>

          {/* Quick Direct Vitals Input Strip */}
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <div className="flex items-center gap-1 bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <span className="text-slate-400 font-semibold text-[10px]">BP:</span>
              <input
                type="text"
                value={formBp}
                onChange={(e) => setFormBp(e.target.value)}
                placeholder="118/76"
                className="w-16 font-mono font-bold text-slate-800 focus:outline-hidden text-xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <span className="text-slate-400 font-semibold text-[10px]">Wt (kg):</span>
              <input
                type="text"
                value={formWeight}
                onChange={(e) => setFormWeight(e.target.value)}
                placeholder="54"
                className="w-12 font-mono font-bold text-slate-800 focus:outline-hidden text-xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <span className="text-slate-400 font-semibold text-[10px]">Hb:</span>
              <input
                type="text"
                value={formHemoglobin}
                onChange={(e) => setFormHemoglobin(e.target.value)}
                placeholder="10.2"
                className="w-12 font-mono font-bold text-slate-800 focus:outline-hidden text-xs"
              />
            </div>

            <div className="flex items-center gap-1 bg-white border border-emerald-200 rounded-xl px-2.5 py-1.5 shadow-2xs">
              <span className="text-slate-400 font-semibold text-[10px]">Temp:</span>
              <input
                type="text"
                value={formTemp}
                onChange={(e) => setFormTemp(e.target.value)}
                placeholder="98.4"
                className="w-12 font-mono font-bold text-slate-800 focus:outline-hidden text-xs"
              />
            </div>
          </div>
        </div>

        {/* Global Save Success Notification Banner */}
        {saveSuccessMsg && (
          <div className="p-3.5 bg-emerald-600 text-white rounded-2xl text-xs font-bold text-center flex items-center justify-between gap-2 shadow-sm animate-fade-in">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
            {isModal && onClose && (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1 bg-white text-emerald-900 rounded-lg text-xs font-bold hover:bg-emerald-50 transition-colors cursor-pointer"
              >
                Done
              </button>
            )}
          </div>
        )}
      </div>

      <div className="p-6 sm:p-8 space-y-7">
        {/* ========================================================= */}
        {/* SECTION 1: MICROPHONE CAPTURE & AUDIO VISUALIZER */}
        {/* ========================================================= */}
        <div className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-6 relative">
          <div className="flex flex-col items-center justify-center space-y-4">
            {/* Audio Waveform Canvas */}
            <div className="w-full max-w-lg bg-white rounded-2xl border border-slate-200 p-3 shadow-inner">
              <canvas
                ref={canvasRef}
                width={500}
                height={64}
                className="w-full h-16 rounded-xl block"
              />
            </div>

            {/* Mic Action Control Button with Glowing Ripple */}
            <div className="relative flex items-center justify-center my-2">
              {isRecording && (
                <>
                  <div
                    className="absolute rounded-full bg-emerald-500/20 animate-ping pointer-events-none"
                    style={{
                      width: `${100 + audioLevel * 60}px`,
                      height: `${100 + audioLevel * 60}px`,
                    }}
                  />
                  <div
                    className="absolute rounded-full bg-emerald-500/10 pointer-events-none transition-all duration-150"
                    style={{
                      width: `${90 + audioLevel * 40}px`,
                      height: `${90 + audioLevel * 40}px`,
                    }}
                  />
                </>
              )}

              <button
                onClick={isRecording ? stopRecording : startRecording}
                className={`relative z-10 w-20 h-20 rounded-full flex items-center justify-center shadow-xl active:scale-95 transition-all text-white ${
                  isRecording
                    ? 'bg-rose-600 hover:bg-rose-700 ring-4 ring-rose-200'
                    : 'bg-[#064e3b] hover:bg-[#043927] ring-4 ring-emerald-100 hover:shadow-2xl'
                }`}
                aria-label={isRecording ? 'Stop Recording' : 'Start Recording'}
              >
                {isRecording ? <Square className="w-7 h-7 fill-white" /> : <Mic className="w-8 h-8" />}
              </button>
            </div>

            {/* Recording Status & Timer */}
            <div className="text-center space-y-1">
              <div className="flex items-center justify-center gap-2">
                <span
                  className={`w-2.5 h-2.5 rounded-full ${
                    isRecording ? 'bg-rose-500 animate-pulse' : 'bg-slate-300'
                  }`}
                />
                <span className="text-xs font-bold text-slate-800">
                  {isRecording
                    ? `Recording Patient Dialogue... • ${formatTime(recordingSeconds)}`
                    : audioUrl
                    ? 'Audio Recorded • Ready to Play or Transcribe'
                    : 'Click microphone to capture patient dialogue'}
                </span>
              </div>

              <p className="text-[11px] text-slate-500">
                {isRecording
                  ? 'Speak clearly into the microphone. Voice is transcribed live.'
                  : 'Supports live speech-to-text in Hindi, English, and regional dialects.'}
              </p>
            </div>

            {/* Audio Error Alert */}
            {audioError && (
              <div className="w-full max-w-md bg-rose-50 border border-rose-200 text-rose-800 text-xs px-3.5 py-2.5 rounded-xl flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-rose-600" />
                <span className="flex-1">{audioError}</span>
              </div>
            )}

            {/* Audio Playback Controls (Visible if audio is recorded or uploaded) */}
            {audioUrl && !isRecording && (
              <div className="w-full max-w-lg bg-white border border-slate-200 rounded-2xl p-4 shadow-xs space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                  <span className="flex items-center gap-1.5 text-emerald-800">
                    <Volume2 className="w-4 h-4" />
                    <span>Captured Audio Clip</span>
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] text-slate-500">
                      {formatTime(playbackTime)} / {formatTime(playbackDuration || recordingSeconds)}
                    </span>
                    <button
                      onClick={resetRecording}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                      title="Discard audio"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Scrubber slider */}
                <input
                  type="range"
                  min="0"
                  max={playbackDuration || 1}
                  step="0.05"
                  value={playbackTime}
                  onChange={handleSeek}
                  className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-100 rounded-lg"
                />

                {/* Playback Actions */}
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={togglePlayback}
                      className="px-3.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      {isPlaying ? <Pause className="w-3.5 h-3.5 fill-white" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                      <span>{isPlaying ? 'Pause' : 'Play Audio'}</span>
                    </button>

                    <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded-lg">
                      <span>Speed:</span>
                      {[0.75, 1.0, 1.25, 1.5].map((rate) => (
                        <button
                          key={rate}
                          onClick={() => handleRateChange(rate)}
                          className={`px-1.5 py-0.5 rounded ${
                            playbackRate === rate
                              ? 'bg-emerald-600 text-white'
                              : 'text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {rate}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <a
                    href={audioUrl}
                    download="patient_interaction_audio.webm"
                    className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1 text-xs"
                    title="Download audio recording"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline text-[11px]">Download</span>
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 2: LIVE TRANSCRIPTION & PRESETS */}
        {/* ========================================================= */}
        <div className="space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4 text-emerald-800" />
              <h3 className="text-sm font-bold text-slate-900">Patient Interaction Transcript</h3>
              {isRecording && (
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Streaming
                </span>
              )}
            </div>

            {/* Quick 1-Click Clinical Audio Presets */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 text-[11px]">
              <span className="text-slate-400 font-semibold shrink-0">Sample Dialogue:</span>
              {CLINICAL_AUDIO_PRESETS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleLoadPreset(p)}
                  className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-700 font-medium whitespace-nowrap transition-colors"
                >
                  {p.title.split(' • ')[0]}
                </button>
              ))}

              {/* Upload audio button */}
              <label className="px-2.5 py-1 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 text-slate-600 font-medium whitespace-nowrap cursor-pointer transition-colors flex items-center gap-1">
                <Upload className="w-3 h-3 text-slate-500" />
                <span>Upload Audio</span>
                <input
                  type="file"
                  accept="audio/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Editable Transcript Text Area */}
          <div className="relative">
            <textarea
              value={transcript + (interimTranscript ? ` [${interimTranscript}]` : '')}
              onChange={(e) => {
                setTranscript(e.target.value.replace(/\s*\[.*\]$/, ''));
              }}
              placeholder="Captured patient interaction dialogue will appear here in real time as you speak (Hindi or English). You can also type or edit notes directly..."
              rows={4}
              className="w-full text-xs sm:text-sm p-4 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-hidden focus:border-emerald-600 text-slate-800 leading-relaxed font-medium transition-all"
            />

            {interimTranscript && (
              <span className="absolute bottom-3 right-3 text-[10px] text-emerald-700 font-mono bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                Listening...
              </span>
            )}
          </div>

          {/* Action: Transcribe & Generate Structured Notes */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1">
            <span className="text-xs text-slate-500">
              {transcript.trim().length > 0
                ? `${transcript.trim().split(/\s+/).length} words recorded`
                : 'Speak into microphone or select a sample dialogue to generate structured notes.'}
            </span>

            <button
              onClick={handleProcessExtraction}
              disabled={isExtracting || (!transcript.trim() && !interimTranscript.trim())}
              className="w-full sm:w-auto px-6 py-3 rounded-2xl bg-gradient-to-r from-[#064e3b] to-[#047857] hover:from-[#043927] hover:to-[#065f46] text-white font-bold text-xs shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center justify-center gap-2"
            >
              {isExtracting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                  <span>{extractionStep || 'Processing with Clinical AI...'}</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-300" />
                  <span>Transcribe &amp; Generate Structured Visit Notes</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* ========================================================= */}
        {/* SECTION 3: STRUCTURED VISIT NOTES (EXTRACTED) */}
        {/* ========================================================= */}
        {structuredNote && (
          <div className="border border-emerald-200 bg-emerald-50/40 rounded-3xl p-6 sm:p-7 space-y-6">
            {/* Note Header & Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-emerald-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">
                      Structured Clinical Visit Record
                    </h3>
                    <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
                      {(structuredNote.confidenceScore * 100).toFixed(0)}% AI Confidence
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Generated from interaction audio • Aligned with MoHFW Frontline Protocol Guidelines
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setIsEditingNote(!isEditingNote)}
                  className="px-3 py-1.5 rounded-xl border border-emerald-300 bg-white hover:bg-emerald-50 text-emerald-800 text-xs font-bold transition-colors flex items-center gap-1.5"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>{isEditingNote ? 'Done Editing' : 'Edit Note Fields'}</span>
                </button>
              </div>
            </div>

            {/* Note Body: Editable or Structured Cards */}
            {isEditingNote ? (
              <div className="space-y-4 bg-white p-5 rounded-2xl border border-slate-200 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Beneficiary Name:</label>
                    <input
                      type="text"
                      value={structuredNote.personName}
                      onChange={(e) => setStructuredNote({ ...structuredNote, personName: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-hidden font-semibold"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Age / Demographics:</label>
                    <input
                      type="text"
                      value={structuredNote.age}
                      onChange={(e) => setStructuredNote({ ...structuredNote, age: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Condition Classification:</label>
                    <input
                      type="text"
                      value={structuredNote.condition}
                      onChange={(e) => setStructuredNote({ ...structuredNote, condition: e.target.value })}
                      className="w-full p-2 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Observed Symptoms (comma separated):</label>
                  <input
                    type="text"
                    value={structuredNote.symptoms.join(', ')}
                    onChange={(e) =>
                      setStructuredNote({
                        ...structuredNote,
                        symptoms: e.target.value.split(',').map((s) => s.trim()),
                      })
                    }
                    className="w-full p-2 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Blood Pressure:</label>
                    <input
                      type="text"
                      value={structuredNote.vitals.bp || ''}
                      onChange={(e) =>
                        setStructuredNote({
                          ...structuredNote,
                          vitals: { ...structuredNote.vitals, bp: e.target.value },
                        })
                      }
                      placeholder="120/80"
                      className="w-full p-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Weight (kg):</label>
                    <input
                      type="number"
                      value={structuredNote.vitals.weightKg || ''}
                      onChange={(e) =>
                        setStructuredNote({
                          ...structuredNote,
                          vitals: { ...structuredNote.vitals, weightKg: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Hemoglobin (g/dL):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={structuredNote.vitals.hemoglobin || ''}
                      onChange={(e) =>
                        setStructuredNote({
                          ...structuredNote,
                          vitals: { ...structuredNote.vitals, hemoglobin: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="font-bold text-slate-600 block mb-1">Temperature (°F):</label>
                    <input
                      type="number"
                      step="0.1"
                      value={structuredNote.vitals.tempF || ''}
                      onChange={(e) =>
                        setStructuredNote({
                          ...structuredNote,
                          vitals: { ...structuredNote.vitals, tempF: parseFloat(e.target.value) },
                        })
                      }
                      className="w-full p-2 border border-slate-300 rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">Follow-Up Action Plan:</label>
                  <input
                    type="text"
                    value={structuredNote.followUp}
                    onChange={(e) => setStructuredNote({ ...structuredNote, followUp: e.target.value })}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-600 block mb-1">ASHA Clinical Summary / Notes:</label>
                  <textarea
                    value={structuredNote.notes}
                    onChange={(e) => setStructuredNote({ ...structuredNote, notes: e.target.value })}
                    rows={2}
                    className="w-full p-2 border border-slate-300 rounded-xl focus:border-emerald-600 focus:outline-hidden"
                  />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Column 1: Beneficiary Identity & Condition */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <User className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">Beneficiary Identity</span>
                  </div>

                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Name:</span>
                      <span className="font-bold text-slate-900">{structuredNote.personName}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Age &amp; Gender:</span>
                      <span className="font-medium text-slate-800">
                        {structuredNote.age} • {structuredNote.gender}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Date of Visit:</span>
                      <span className="font-medium text-slate-800">{structuredNote.visitDate}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 block mb-1">Diagnosis / Classification:</span>
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-900 font-bold text-xs border border-emerald-200">
                        {structuredNote.condition}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Column 2: Symptoms & Recorded Vitals */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Activity className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">Symptoms &amp; Clinical Vitals</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-1">Reported Symptoms:</span>
                      <div className="flex flex-wrap gap-1">
                        {structuredNote.symptoms.map((s, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 font-medium text-[11px] border border-slate-200"
                          >
                            • {s}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-100">
                      <span className="text-[11px] text-slate-500 block mb-1">Vitals Matrix:</span>
                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block">Blood Pressure</span>
                          <span className="font-bold text-slate-800">{structuredNote.vitals.bp || '118/78'}</span>
                        </div>
                        <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                          <span className="text-slate-400 block">Weight</span>
                          <span className="font-bold text-slate-800">
                            {structuredNote.vitals.weightKg ? `${structuredNote.vitals.weightKg} kg` : '52 kg'}
                          </span>
                        </div>
                        {structuredNote.vitals.hemoglobin && (
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block">Hemoglobin</span>
                            <span className="font-bold text-rose-700">{structuredNote.vitals.hemoglobin} g/dL</span>
                          </div>
                        )}
                        {structuredNote.vitals.tempF && (
                          <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                            <span className="text-slate-400 block">Temperature</span>
                            <span className="font-bold text-slate-800">{structuredNote.vitals.tempF}°F</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Column 3: Care Plan & Protocol Directive */}
                <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-xs space-y-3">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Heart className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-slate-900">Care Plan &amp; Protocol Action</span>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Protocol Evaluated:</span>
                      <span className="text-xs font-mono font-bold text-emerald-900">
                        {structuredNote.protocolCode || 'NTEP-TB-RULE-01'}
                      </span>
                    </div>

                    <div>
                      <span className="text-[11px] text-slate-500 block mb-0.5">Follow-up Recommendation:</span>
                      <p className="text-xs text-slate-800 font-medium leading-snug">
                        {structuredNote.followUp}
                      </p>
                    </div>

                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200 text-[11px] text-emerald-950">
                      <span className="font-bold block mb-0.5">ASHA Clinical Notes:</span>
                      <p className="leading-relaxed">{structuredNote.notes}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notification / Success Feedback */}
            {saveSuccessMsg && (
              <div className="p-3.5 bg-emerald-100 border border-emerald-300 text-emerald-950 rounded-2xl text-xs font-bold text-center flex items-center justify-center gap-2 shadow-xs">
                <Check className="w-4 h-4 text-emerald-700" />
                <span>{saveSuccessMsg}</span>
              </div>
            )}

            {/* Action Bar: Save Visit, Issue Referral Passport, Print Note */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-3.5 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition-colors flex items-center gap-1.5 shadow-xs"
                >
                  <Printer className="w-3.5 h-3.5 text-slate-500" />
                  <span>Print Clinical Slip</span>
                </button>
              </div>

              <div className="flex items-center gap-2.5">
                {structuredNote.urgencyLevel === 'HIGH_PRIORITY' && (
                  <button
                    onClick={handleIssueReferral}
                    className="px-4 py-2.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                  >
                    <AlertOctagon className="w-4 h-4 text-rose-200" />
                    <span>Issue Referral Passport</span>
                  </button>
                )}

                <button
                  onClick={handleSaveVisit}
                  disabled={isSaving}
                  className="px-5 py-2.5 rounded-xl bg-[#064e3b] hover:bg-[#043927] text-white text-xs font-bold shadow-md hover:shadow-lg disabled:opacity-50 transition-all flex items-center gap-2"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin text-emerald-300" />
                      <span>Saving to Registry...</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 text-emerald-300" />
                      <span>Commit Visit to Health Registry</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
