import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  Home,
  Users,
  ClipboardList,
  GitPullRequest,
  BarChart3,
  Mail,
  Settings,
  Bell,
  ChevronRight,
  Wifi,
  WifiOff,
  Search,
  Plus,
  AlertTriangle,
  Clock,
  CheckCircle2,
  FileText,
  MessageSquare,
  ShieldAlert,
  X,
  Sparkles,
  ArrowRight,
  UserCheck,
  RefreshCw,
  QrCode,
  Download,
  Mic,
  MicOff,
  AlertOctagon,
  FileCheck2,
  Stethoscope,
  Building2,
  Edit2,
  Check,
  Loader2,
  Share2,
  Globe,
  Database,
  Send,
  Lock,
  LogIn,
  LogOut,
  KeyRound,
  Heart,
  Baby,
  Activity,
  Phone,
  MapPin,
  Eye,
  Calendar,
  Filter,
} from 'lucide-react';
import { AshaLogo } from '../brand/AshaLogo';
import {
  CURRENT_USER,
  MOCK_PATIENTS,
  MOCK_HOUSEHOLDS,
  MOCK_ACTIVITIES,
  ASSETS,
} from '../../data/mockData';
import { Patient, DialectOption } from '../../types';
import { api } from '../../services/api';
import { offlineStorage } from '../../services/indexedDB';
import { SpeechHandler } from '../../services/speechRecognition';
import { AnalyticsDashboard } from './AnalyticsDashboard';
import { PatientInteractionRecorder } from './PatientInteractionRecorder';
import { PatientDirectory } from './PatientDirectory';

export const ALL_DIALECTS: { id: DialectOption; label: string; region: string }[] = [
  { id: 'Hindi (हिन्दी)', label: 'Hindi (हिन्दी)', region: 'Standard Frontline' },
  { id: 'Bundeli (बुंदेली)', label: 'Bundeli (बुंदेली)', region: 'Madhya Pradesh (Bundelkhand)' },
  { id: 'Bagheli (बघेली)', label: 'Bagheli (बघेली)', region: 'Madhya Pradesh (Rewa / Satna)' },
  { id: 'Malvi (मालवी)', label: 'Malvi (मालवी)', region: 'Madhya Pradesh (Malwa / Ujjain)' },
  { id: 'Nimadi (निमाड़ी)', label: 'Nimadi (निमाड़ी)', region: 'Madhya Pradesh (Nimar / Khargone)' },
  { id: 'Bhojpuri (भोजपुरी)', label: 'Bhojpuri (भोजपुरी)', region: 'Eastern UP & Bihar' },
  { id: 'Urdu (اردو)', label: 'Urdu (اردو)', region: 'Regional Community Clusters' },
  { id: 'Marathi (मराठी)', label: 'Marathi (मराठी)', region: 'Southern MP / MH Border' },
  { id: 'English', label: 'English', region: 'Reporting & Integration' },
];

interface DesktopDashboardProps {
  className?: string;
  isCompact?: boolean;
  onOpenMobileScreen?: (screenId: string) => void;
  currentUser?: any;
  onLogout?: () => void;
}

export const DesktopDashboard: React.FC<DesktopDashboardProps> = ({
  className = '',
  isCompact = false,
  onOpenMobileScreen,
  currentUser: externalUser,
  onLogout,
}) => {
  // Navigation: Always default to Home so user lands on greeting & dashboard
  const [activeNav, setActiveNav] = useState('Home');
  const [offlineMode, setOfflineMode] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [notificationsRead, setNotificationsRead] = useState(false);
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [householdCategoryFilter, setHouseholdCategoryFilter] = useState<string>('All');

  // Searchable Patient & Household Directory State on Home Dashboard
  const [homeDirectoryQuery, setHomeDirectoryQuery] = useState('');
  const [homeCategoryFilter, setHomeCategoryFilter] = useState<'All' | 'Pregnant' | 'Children' | 'High Risk' | 'Households'>('All');
  const [selectedInspectPatient, setSelectedInspectPatient] = useState<any | null>(null);
  const [selectedInspectHousehold, setSelectedInspectHousehold] = useState<any | null>(null);
  const [recordVisitPatient, setRecordVisitPatient] = useState<any | null>(null);

  // Time & Dynamic Live Clock State (Permanent Auto Clock)
  const [currentTime, setCurrentTime] = useState<Date>(new Date());

  useEffect(() => {
    // Live auto clock ticker
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Live Backend State (pre-populated with rich frontline seeds)
  const [dashboardData, setDashboardData] = useState<any>({
    householdsToday: 12,
    pendingReferrals: 4,
    completedVisits: 8,
    highPriorityCases: 3,
    totalHouseholds: 148,
    todayVisitList: MOCK_PATIENTS.slice(0, 4),
    recentActivity: MOCK_ACTIVITIES,
  });

  const [householdsList, setHouseholdsList] = useState<any[]>(MOCK_HOUSEHOLDS);
  const [patientsList, setPatientsList] = useState<any[]>(MOCK_PATIENTS);
  const [referralsList, setReferralsList] = useState<any[]>([]);
  const [reportsData, setReportsData] = useState<any | null>(null);
  const [visitsList, setVisitsList] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Modals inside project window
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [selectedPatientForVisit, setSelectedPatientForVisit] = useState<any | null>(null);
  const [visitSuccessToast, setVisitSuccessToast] = useState<string | null>(null);
  const [showRiskModal, setShowRiskModal] = useState(false);
  const [selectedRiskPatient, setSelectedRiskPatient] = useState<any | null>(null);
  const [showPassportModal, setShowPassportModal] = useState(false);
  const [activePassport, setActivePassport] = useState<any | null>(null);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [showPatientDetailModal, setShowPatientDetailModal] = useState<Patient | null>(null);

  // Voice Visit Recording State
  const [isRecording, setIsRecording] = useState(false);
  const [voiceSeconds, setVoiceSeconds] = useState(0);
  const [transcript, setTranscript] = useState('');
  const [speechLanguage, setSpeechLanguage] = useState<DialectOption>('Hindi (हिन्दी)');
  const speechHandlerRef = useRef<SpeechHandler | null>(null);

  // AI Extraction State
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<any | null>(null);
  const [isEditingExtracted, setIsEditingExtracted] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState<string | null>(null);

  // Health Centre Desk State
  const [scanInputToken, setScanInputToken] = useState('ASHA20261010-0042');
  const [verifiedDeskReferral, setVerifiedDeskReferral] = useState<any | null>(null);
  const [deskActionMsg, setDeskActionMsg] = useState<string | null>(null);
  const [isDeskLoading, setIsDeskLoading] = useState(false);

  // Authentication State
  const [currentUser, setCurrentUser] = useState<any>(externalUser || CURRENT_USER);

  useEffect(() => {
    if (externalUser) {
      setCurrentUser(externalUser);
      setActiveNav('Home');
    }
  }, [externalUser]);

  // Greeting resolution function permanently driven by live system auto clock
  const getGreetingData = () => {
    const hour = currentTime.getHours();
    let timeGreeting = 'Good morning';
    let icon = '🌅';
    let periodName = 'Morning';
    let timeColor = 'from-amber-500/10 to-orange-500/5 text-amber-800 border-amber-200';
    let periodBadge = 'Morning Session (05:00 - 12:00)';

    if (hour >= 5 && hour < 12) {
      timeGreeting = 'Good morning';
      icon = '🌅';
      periodName = 'Morning';
      timeColor = 'from-amber-500/10 to-orange-500/5 text-amber-800 border-amber-200';
      periodBadge = 'Morning Session (05:00 - 12:00)';
    } else if (hour >= 12 && hour < 17) {
      timeGreeting = 'Good afternoon';
      icon = '☀️';
      periodName = 'Afternoon';
      timeColor = 'from-yellow-500/10 to-amber-500/5 text-yellow-800 border-yellow-200';
      periodBadge = 'Afternoon Session (12:00 - 17:00)';
    } else if (hour >= 17 && hour < 21) {
      timeGreeting = 'Good evening';
      icon = '🌆';
      periodName = 'Evening';
      timeColor = 'from-indigo-500/10 to-purple-500/5 text-indigo-800 border-indigo-200';
      periodBadge = 'Evening Session (17:00 - 21:00)';
    } else {
      timeGreeting = 'Good evening';
      icon = '🌙';
      periodName = 'Night';
      timeColor = 'from-slate-700/10 to-indigo-900/10 text-slate-800 border-slate-300';
      periodBadge = 'Night Emergency Desk (21:00 - 05:00)';
    }

    const userName = (currentUser?.name || 'Sunita Devi').trim();
    const isDoctor =
      userName.toLowerCase().includes('verma') ||
      userName.toLowerCase().includes('dr') ||
      userName.toLowerCase().includes('doctor') ||
      currentUser?.role === 'Facility Officer' ||
      currentUser?.role === 'HEALTH_FACILITY_OFFICER';

    // Format clean doctor's name
    let doctorName = userName;
    if (isDoctor && !doctorName.toLowerCase().startsWith('dr')) {
      doctorName = `Dr. ${doctorName}`;
    }

    // Strictly format per user specification:
    // "when Dr.A.K. Verma sign in the home page should show good morning to Dr.A.K Verma and the greetings should change from good moring to respactive time like good evening for evening and etc ."
    const headline = isDoctor
      ? `${timeGreeting} to ${doctorName}`
      : `${timeGreeting}, ${userName}`;

    return {
      greeting: timeGreeting,
      headline,
      icon,
      periodName,
      periodBadge,
      timeColor,
      isDoctor,
      doctorName,
      hour,
    };
  };

  const greetingData = getGreetingData();

  // Searchable Patient & Household Directory filtering engine
  const homeDirectoryData = useMemo(() => {
    const q = homeDirectoryQuery.trim().toLowerCase();

    // Index households by ID
    const hhMap = new Map<string, any>();
    householdsList.forEach((h) => hhMap.set(h.id, h));

    // Filter patients
    const matchedPatients = patientsList.filter((p) => {
      const linkedHh = hhMap.get(p.householdId);
      const hhCode = linkedHh?.code?.toLowerCase() || '';
      const hhHead = linkedHh?.headName?.toLowerCase() || '';
      const hhTola = linkedHh?.tola?.toLowerCase() || '';
      const hhId = (p.householdId || '').toLowerCase();

      if (q) {
        const nameMatch = p.name?.toLowerCase().includes(q);
        const hhIdMatch = hhId.includes(q);
        const hhCodeMatch = hhCode.includes(q);
        const hhHeadMatch = hhHead.includes(q);
        const tolaMatch = hhTola.includes(q);
        const conditionMatch = p.condition?.toLowerCase().includes(q);
        const phoneMatch = p.phone?.toLowerCase().includes(q);
        const idMatch = p.id?.toLowerCase().includes(q);

        if (!nameMatch && !hhIdMatch && !hhCodeMatch && !hhHeadMatch && !tolaMatch && !conditionMatch && !phoneMatch && !idMatch) {
          return false;
        }
      }

      if (homeCategoryFilter === 'Pregnant' && p.category !== 'Pregnant') return false;
      if (homeCategoryFilter === 'Children' && p.category !== 'Children') return false;
      if (homeCategoryFilter === 'High Risk' && p.statusTag !== 'High Priority' && p.category !== 'High Risk') return false;

      return true;
    });

    // Filter households
    const matchedHouseholds = householdsList.filter((h) => {
      if (homeCategoryFilter === 'Pregnant' || homeCategoryFilter === 'Children' || homeCategoryFilter === 'High Risk') {
        return matchedPatients.some((p) => p.householdId === h.id);
      }
      if (!q) return true;
      const idMatch = h.id.toLowerCase().includes(q);
      const codeMatch = h.code.toLowerCase().includes(q);
      const headMatch = h.headName.toLowerCase().includes(q);
      const tolaMatch = h.tola.toLowerCase().includes(q);
      return idMatch || codeMatch || headMatch || tolaMatch;
    });

    return {
      patients: matchedPatients,
      households: matchedHouseholds,
      hhMap,
    };
  }, [homeDirectoryQuery, homeCategoryFilter, patientsList, householdsList]);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loginEmail, setLoginEmail] = useState('sunita.devi@asha.gov.in');
  const [loginPassword, setLoginPassword] = useState('asha123');
  const [loginRole, setLoginRole] = useState<'ASHA_WORKER' | 'HEALTH_FACILITY_OFFICER'>('ASHA_WORKER');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // Settings / Offline State
  const [storageStats, setStorageStats] = useState({
    draftsCount: 0,
    queueCount: 0,
    sizeFormatted: '12.0 MB used',
  });
  const [selectedDialect, setSelectedDialect] = useState<string>('Hindi (हिन्दी)');
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Load backend data
  const loadData = async () => {
    setIsLoading(true);
    try {
      const d = await api.getDashboard();
      setDashboardData(d);
      const hh = await api.getHouseholds();
      setHouseholdsList(hh.households);
      const ppl = await api.getPeople();
      setPatientsList(ppl.people);
      const ref = await api.getReferrals();
      setReferralsList(ref.referrals);
      if (ref.referrals && ref.referrals.length > 0) {
        setActivePassport(ref.referrals[0]);
      }
      const vis = await api.getVisits();
      setVisitsList(vis.visits);
      const rep = await api.getReports();
      setReportsData(rep.analytics);
    } catch (err) {
      console.warn('Dashboard api query fallback to seeds:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    offlineStorage.getEstimatedStorage().then((s) => {
      setStorageStats({
        draftsCount: s.draftsCount,
        queueCount: s.queueCount,
        sizeFormatted: `${s.sizeFormatted} used`,
      });
    });
  }, []);

  // Voice Speech Recognition Setup
  useEffect(() => {
    speechHandlerRef.current = new SpeechHandler({
      language: speechLanguage.includes('Hindi') ? 'hi-IN' : 'en-IN',
      onInterimResult: (interim) => {
        setTranscript((prev) => prev.split(' [')[0] + ' ' + interim);
      },
      onFinalResult: (final) => {
        setTranscript((prev) => (prev ? prev + ' ' : '') + final);
      },
      onEnd: () => setIsRecording(false),
    });

    return () => {
      speechHandlerRef.current?.stop();
    };
  }, [speechLanguage]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    if (isRecording) {
      t = setInterval(() => setVoiceSeconds((s) => s + 1), 1000);
    }
    return () => clearInterval(t);
  }, [isRecording]);

  const toggleRecording = () => {
    if (isRecording) {
      speechHandlerRef.current?.stop();
      setIsRecording(false);
    } else {
      speechHandlerRef.current?.start();
      setIsRecording(true);
    }
  };

  const handleProcessAI = async () => {
    const text = transcript.trim() || 'कमल सिंह को दो हफ्ते से ज्यादा से खांसी और रात में पसीना आ रहा है। वजन घटा है।';
    setIsExtracting(true);
    try {
      const res = await api.extractVisitFromTranscript(text);
      if (res.extracted) {
        setExtractedData(res.extracted);
      } else {
        // High fidelity fallback extraction
        const isKamal = text.includes('कमल') || text.includes('खांसी') || text.includes('cough') || text.includes('TB');
        const isSavita = text.includes('सविता') || text.includes('गर्भावस्था') || text.includes('ट्राइमेस्टर') || text.includes('एनीमिया');
        if (isKamal) {
          setExtractedData({
            personName: 'Kamal Singh',
            age: '42 years',
            gender: 'Male',
            condition: 'Presumptive Pulmonary TB',
            symptoms: ['Persistent cough > 2 weeks', 'Night sweats', 'Unexplained weight loss', 'Mild chest discomfort'],
            vitals: { bp: '118/76', weightKg: 52, tempF: 99.2 },
            visitDate: '10 Oct 2026',
            followUp: 'Urgent referral to District Hospital / PHC Chest Clinic for Sputum CBNAAT test',
            notes: 'Screened at Pipra Purwa. Cough present for 16 days. Household infection prevention mask distributed.',
          });
        } else if (isSavita) {
          setExtractedData({
            personName: 'Savita Sharma',
            age: '26 years',
            gender: 'Female',
            condition: 'Pregnant (2nd Trimester) - Gestational Anemia',
            symptoms: ['Persistent headache', 'Severe fatigue', 'Dizziness', 'Conjunctival pallor'],
            vitals: { bp: '104/68', hemoglobin: 9.8, weightKg: 54 },
            visitDate: '10 Oct 2026',
            followUp: 'ANC checkup in 2 weeks at Sub-Centre & double IFA tablets dispensed',
            notes: 'Advised nutritional counseling, leafy green vegetables, and strict daily IFA adherence.',
          });
        } else {
          setExtractedData({
            personName: 'Aarav Kumar',
            age: '14 months',
            gender: 'Male',
            condition: 'Missed Immunization Dropout',
            symptoms: ['No acute symptoms; missed routine immunizations'],
            vitals: { weightKg: 8.9, tempF: 98.4 },
            visitDate: '10 Oct 2026',
            followUp: 'Mobilize to upcoming Wednesday VHSND session for Pentavalent-3 and MR-1',
            notes: 'Mother counselled on importance of MCP immunization card and completing full schedule.',
          });
        }
      }
    } catch (err) {
      console.warn('AI extraction fallback:', err);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleConfirmSaveVisit = async () => {
    if (!extractedData) return;
    setIsExtracting(true);
    try {
      const isTb =
        extractedData.condition?.toLowerCase().includes('tb') ||
        (extractedData.symptoms &&
          extractedData.symptoms.some(
            (s: string) =>
              s.toLowerCase().includes('cough') ||
              s.toLowerCase().includes('khansi')
          ));

      if (offlineMode) {
        // Real Offline Storage in IndexedDB
        await offlineStorage.saveDraftVisit({
          personName: extractedData.personName,
          condition: extractedData.condition,
          symptoms: Array.isArray(extractedData.symptoms) ? extractedData.symptoms : [extractedData.symptoms],
          notes: extractedData.notes || `Frontline visit recorded. Follow-up: ${extractedData.followUp}`,
          date: '10 Oct 2026',
        });
        const est = await offlineStorage.getEstimatedStorage();
        setStorageStats({
          draftsCount: est.draftsCount,
          queueCount: est.queueCount,
          sizeFormatted: `${est.sizeFormatted} used`,
        });
        setSaveSuccessMsg('✓ Saved to offline IndexedDB storage! Will sync when connection is restored.');
        setTimeout(() => {
          setSaveSuccessMsg(null);
          setShowVoiceModal(false);
          setExtractedData(null);
          setTranscript('');
        }, 1200);
        return;
      }

      const res = await api.createVisit({
        personId: isTb ? 'P03' : 'P01',
        personName: extractedData.personName,
        condition: extractedData.condition,
        symptoms: Array.isArray(extractedData.symptoms) ? extractedData.symptoms : [extractedData.symptoms],
        notes: extractedData.notes || `Frontline visit recorded. Follow-up: ${extractedData.followUp}`,
      });

      setSaveSuccessMsg('Visit record successfully committed to health registry!');
      await loadData();

      setTimeout(() => {
        setSaveSuccessMsg(null);
        setShowVoiceModal(false);
        setExtractedData(null);
        setTranscript('');

        // If TB suspect was identified, prompt the risk alert & protocol
        if (isTb) {
          setSelectedRiskPatient({
            name: extractedData.personName,
            condition: 'TB Suspect',
            symptoms: extractedData.symptoms,
          });
          setShowRiskModal(true);
        }
      }, 1000);
    } catch (e: any) {
      console.error('Failed to commit visit:', e);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleIssueReferral = async () => {
    try {
      const p = selectedRiskPatient || patientsList.find((x) => x.name.includes('Kamal')) || patientsList[0];
      const existingRef = referralsList.find(
        (r) => r.personName?.toLowerCase() === p?.name?.toLowerCase() && r.status !== 'COMPLETED'
      );
      if (existingRef) {
        setActivePassport(existingRef);
        setShowRiskModal(false);
        setShowPassportModal(true);
        return;
      }
      const res = await api.createReferral({
        personId: p.id || 'P05',
        personName: p.name || 'Kamal Singh',
        personAge: p.age || 42,
        personGender: p.gender || 'Male',
        householdId: p.householdId || 'HH-03',
        referredToFacility: 'District Hospital Pipra',
        reason: p.condition || 'Presumptive Pulmonary TB (Persistent cough > 2 weeks, night sweats)',
        protocolCode: p.riskRuleId || 'NTEP-TB-RULE-01',
        urgency: 'HIGH_PRIORITY',
      });
      setActivePassport(res.referral);
      setShowRiskModal(false);
      setShowPassportModal(true);
      await loadData();
    } catch (e) {
      console.error('Failed to issue referral:', e);
    }
  };

  const handleDeskValidation = async (code: string) => {
    setIsDeskLoading(true);
    setDeskActionMsg(null);
    try {
      const res = await api.validateReferralToken(code);
      if (res.success && res.referral) {
        setVerifiedDeskReferral(res.referral);
      }
    } catch (e: any) {
      setDeskActionMsg(e.message || 'Token not found');
    } finally {
      setIsDeskLoading(false);
    }
  };

  const handleDeskRecordEvent = async (type: 'REACHED' | 'CONSULTED', referralId?: string) => {
    const targetRefId = referralId || verifiedDeskReferral?.id;
    if (!targetRefId) return;
    setIsDeskLoading(true);
    try {
      const res = await api.recordReferralEvent({
        referralId: targetRefId,
        eventType: type,
        facilityName: 'District Hospital Pipra',
        recordedBy: 'Dr. A. K. Verma (Chest Clinic)',
        notes:
          type === 'REACHED'
            ? 'Patient checked into reception desk at District Hospital Pipra'
            : 'Clinical examination completed; Sputum CBNAAT sample collected; initial ATT counselling provided.',
      });
      if (verifiedDeskReferral && verifiedDeskReferral.id === targetRefId) {
        setVerifiedDeskReferral(res.referral);
      }
      setDeskActionMsg(`✓ Event recorded: ${type}`);
      await loadData();
    } catch (e: any) {
      setDeskActionMsg(e.message || 'Could not record event');
    } finally {
      setIsDeskLoading(false);
    }
  };

  const handleManualSync = async () => {
    setIsLoading(true);
    try {
      const drafts = await offlineStorage.getDraftVisits();
      const res = await api.syncOfflineBatch(drafts, []);
      // Remove synchronized drafts from IndexedDB so they aren't synced repeatedly
      await offlineStorage.clearDraftVisits();
      await offlineStorage.clearSyncQueue();
      const est = await offlineStorage.getEstimatedStorage();
      setStorageStats({
        draftsCount: est.draftsCount,
        queueCount: est.queueCount,
        sizeFormatted: `${est.sizeFormatted} used`,
      });
      setSyncFeedback(
        drafts.length > 0
          ? `✓ Successfully synchronized ${res.syncedVisits} offline record(s) with cloud registry! No duplicates.`
          : '✓ Cloud sync up-to-date. No pending offline drafts.'
      );
      await loadData();
    } catch (e: any) {
      setSyncFeedback('Device offline: All drafts preserved safely in local IndexedDB storage.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePerformLogin = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      const res = await api.login({
        email: loginEmail,
        password: loginPassword,
        role: loginRole,
      });
      if (res.success && res.user) {
        setCurrentUser({
          ...CURRENT_USER,
          ...res.user,
          role: res.user.role === 'ASHA_WORKER' ? 'ASHA Worker' : 'Facility Officer',
          avatar:
            res.user.role === 'ASHA_WORKER'
              ? CURRENT_USER.avatar
              : 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&q=80',
        });
        setShowLoginModal(false);
        // If logged in as Health Facility Officer, switch view to Facility Desk
        if (res.user.role === 'HEALTH_FACILITY_OFFICER') {
          setActiveNav('Facility Desk');
        }
      }
    } catch (err: any) {
      setLoginError(err.message || 'Authentication failed. Please verify credentials.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    try {
      await api.logout();
    } catch {
      // ignore
    }
    setShowLoginModal(true);
  };

  const navItems = [
    { name: 'Home', icon: Home },
    { name: 'Voice Visit', icon: Mic },
    { name: 'Patient Directory', icon: UserCheck, count: `${patientsList.length || 6}` },
    { name: 'Households', icon: Users, count: `${dashboardData.totalHouseholds || 148}` },
    { name: 'Visit Records', icon: ClipboardList, count: `${visitsList.length || 8}` },
    { name: 'Priority Cases', icon: AlertTriangle, count: `${dashboardData.highPriorityCases || 2}` },
    { name: 'Referrals', icon: GitPullRequest, count: `${referralsList.length || 3}` },
    { name: 'Facility Desk', icon: Building2 },
    { name: 'Analytics', icon: BarChart3 },
    { name: 'Messages', icon: Mail, count: '2' },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div
      className={`bg-slate-50 text-slate-800 flex overflow-hidden ${
        isCompact ? 'h-[760px] rounded-3xl border border-slate-200/90 shadow-2xl' : 'min-h-screen w-full'
      } ${className}`}
    >
      {/* ========================================== */}
      {/* LEFT SIDEBAR (Dark Forest Green) */}
      {/* ========================================== */}
      <aside className="w-64 shrink-0 bg-[#064e3b] text-white flex flex-col justify-between p-5 select-none relative z-10">
        <div>
          {/* Brand Logo */}
          <div className="pb-6 pt-1 border-b border-white/10">
            <AshaLogo variant="light" size="md" />
          </div>

          {/* Navigation Links */}
          <nav className="mt-6 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.name;
              return (
                <button
                  key={item.name}
                  onClick={() => setActiveNav(item.name)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-[#0f5c43] text-white shadow-sm ring-1 ring-white/10'
                      : 'text-emerald-100/80 hover:bg-white/5 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon
                      className={`w-4 h-4 ${
                        isActive ? 'text-emerald-300' : 'text-emerald-300/70'
                      }`}
                    />
                    <span>{item.name}</span>
                  </div>
                  {item.count && (
                    <span
                      className={`text-[11px] px-2 py-0.5 rounded-full font-semibold ${
                        isActive
                          ? 'bg-emerald-400/20 text-emerald-200'
                          : 'bg-white/10 text-emerald-100'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* User Profile Card at Bottom */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => setActiveNav('Settings')}
            className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-white/5 transition-colors group text-left"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative shrink-0">
                <img
                  src={currentUser.avatar || CURRENT_USER.avatar}
                  alt={currentUser.name}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-emerald-400/40"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#064e3b] rounded-full" />
              </div>
              <div className="truncate">
                <p className="text-sm font-semibold text-white leading-tight truncate">
                  {currentUser.name}
                </p>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="text-[11px] text-emerald-300/80 leading-none">
                    {currentUser.role}
                  </span>
                  <span className="inline-flex items-center text-[10px] text-emerald-300 font-medium">
                    <span className="w-1 h-1 rounded-full bg-emerald-400 mr-1" />
                    Online
                  </span>
                </div>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-emerald-300/50 group-hover:text-white transition-colors shrink-0" />
          </button>

          <button
            onClick={() => {
              if (onLogout) {
                onLogout();
              } else {
                setShowLoginModal(true);
              }
            }}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 px-3 rounded-lg bg-white/10 hover:bg-white/20 text-emerald-100 text-[11px] font-semibold transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5 text-emerald-300" />
            <span>Switch Account / Sign In</span>
          </button>
        </div>
      </aside>

      {/* ========================================== */}
      {/* MAIN PROJECT WINDOW CONTENT AREA */}
      {/* ========================================== */}
      <main className="flex-1 flex flex-col bg-[#f4f7f6] overflow-y-auto overflow-x-hidden relative">
        {/* Top Header Bar */}
        <header className="px-8 py-5 bg-white/90 backdrop-blur-md sticky top-0 z-20 border-b border-slate-200/80 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                {greetingData.headline}
              </h1>
              <span className="text-xl">{greetingData.icon}</span>
            </div>
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {greetingData.isDoctor
                ? 'District Hospital OPD & Chest Clinic • Frontline Health Facility Desk'
                : 'Pipra Sub-Centre • Gorakhpur • Frontline Health Companion'}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Action: Quick Voice Visit / Audio Recorder Button */}
            <button
              onClick={() => setActiveNav('Voice Visit')}
              className={`px-3.5 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-xs transition-colors ${
                activeNav === 'Voice Visit'
                  ? 'bg-emerald-950 text-white ring-2 ring-emerald-400'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white'
              }`}
            >
              <Mic className="w-3.5 h-3.5 text-emerald-300" />
              <span>Record Voice Visit</span>
            </button>

            {/* Action: Patient Directory Quick Access */}
            <button
              onClick={() => setActiveNav('Patient Directory')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeNav === 'Patient Directory'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Patient Directory</span>
            </button>

            {/* Action: Analytics Dashboard Quick Access */}
            <button
              onClick={() => setActiveNav('Analytics')}
              className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors ${
                activeNav === 'Analytics' || activeNav === 'Reports'
                  ? 'bg-emerald-900 text-white shadow-xs'
                  : 'bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-xs'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Analytics</span>
            </button>

            {/* Regional Language / Dialect Switcher */}
            <div className="relative">
              <button
                onClick={() => setShowLanguageMenu(!showLanguageMenu)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-700 hover:border-emerald-300 hover:bg-slate-50 transition-all shadow-xs"
              >
                <Globe className="w-3.5 h-3.5 text-emerald-700" />
                <span className="max-w-[110px] truncate">{selectedDialect}</span>
                <ChevronRight
                  className={`w-3 h-3 text-slate-400 transition-transform ${
                    showLanguageMenu ? 'rotate-90' : ''
                  }`}
                />
              </button>

              {showLanguageMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50">
                  <div className="px-3 py-1.5 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Select Dialect &amp; Language
                  </div>
                  <div className="space-y-0.5 mt-1 max-h-60 overflow-y-auto">
                    {ALL_DIALECTS.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => {
                          setSelectedDialect(d.id);
                          setSpeechLanguage(d.id);
                          setShowLanguageMenu(false);
                        }}
                        className={`w-full text-left px-3 py-2 rounded-xl text-xs flex items-center justify-between transition-colors ${
                          selectedDialect === d.id
                            ? 'bg-emerald-50 text-emerald-900 font-bold'
                            : 'text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <div>
                          <p className="font-medium">{d.label}</p>
                          <p className="text-[10px] text-slate-400">{d.region}</p>
                        </div>
                        {selectedDialect === d.id && (
                          <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Offline Mode Switch */}
            <button
              onClick={() => setOfflineMode(!offlineMode)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                offlineMode
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300 ring-2 ring-emerald-400/20'
                  : 'bg-white text-slate-700 border-slate-200 hover:border-emerald-300 hover:bg-slate-50'
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  offlineMode ? 'bg-emerald-600 animate-pulse' : 'bg-emerald-500'
                }`}
              />
              <span>Offline Mode</span>
              {offlineMode ? (
                <WifiOff className="w-3.5 h-3.5 text-emerald-700 ml-0.5" />
              ) : (
                <Wifi className="w-3.5 h-3.5 text-slate-400 ml-0.5" />
              )}
            </button>

            {/* Refresh */}
            <button
              onClick={loadData}
              className="p-2 rounded-full text-slate-500 hover:text-emerald-700 hover:bg-slate-100 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            {/* Notification Bell */}
            <div className="relative">
              <button
                onClick={() => {
                  setShowNotifications(!showNotifications);
                  setNotificationsRead(true);
                }}
                className="w-9 h-9 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-600 hover:text-emerald-700 hover:border-emerald-300 transition-colors shadow-xs relative"
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {!notificationsRead && (
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-rose-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Popover */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 p-4 z-50">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                    <span className="text-xs font-bold text-slate-900">
                      Notifications (2 New)
                    </span>
                    <button
                      onClick={() => setShowNotifications(false)}
                      className="text-slate-400 hover:text-slate-600 text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="space-y-2.5 mt-3 text-xs">
                    <div className="p-2.5 rounded-xl bg-amber-50/70 border border-amber-200/60 text-slate-800">
                      <p className="font-semibold text-amber-900">
                        TB Protocol Alert (NTEP-TB-01)
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        Kamal Singh presumptive TB active. Direct referral recommended.
                      </p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-200/60 text-slate-800">
                      <p className="font-semibold text-emerald-900">
                        ANC Follow-Up (MOHFW-ANC-02)
                      </p>
                      <p className="text-slate-600 mt-0.5">
                        Radhika Sharma scheduled for trimester routine checkup.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Offline storage banner if offlineMode */}
        {offlineMode && (
          <div className="bg-emerald-700 text-white px-8 py-2.5 text-xs flex items-center justify-between">
            <div className="flex items-center gap-2">
              <WifiOff className="w-4 h-4" />
              <span>
                <strong>Offline-First Mode Active:</strong> All changes &amp; voice summaries are safely preserved in browser IndexedDB and automatically synchronized when connectivity returns.
              </span>
            </div>
            <button
              onClick={() => setActiveNav('Settings')}
              className="underline text-[11px] font-semibold hover:text-emerald-100"
            >
              Inspect Queue
            </button>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: HOME DASHBOARD */}
        {/* ============================================================== */}
        {activeNav === 'Home' && (
          <div className="p-8 space-y-7">
            {/* HERO WELCOME GREETING BANNER */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden bg-gradient-to-r from-white via-white to-emerald-50/50">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="space-y-2 max-w-2xl">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300/60 inline-flex items-center gap-1.5 shadow-2xs">
                      {greetingData.isDoctor ? '🩺 Chief Medical Officer Desk' : '🌱 ASHA Frontline Health Companion'}
                    </span>
                    <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 font-semibold border border-slate-200/70">
                      {greetingData.periodBadge}
                    </span>
                  </div>

                  <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight leading-snug">
                    <span>{greetingData.headline}</span>
                    <span className="ml-2 inline-block text-2xl sm:text-3xl">
                      {greetingData.icon}
                    </span>
                  </h2>

                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {greetingData.isDoctor
                      ? 'District Hospital OPD & Chest Clinic referral outcome desk. Review incoming community cases from Gorakhpur village clusters and close the care loop.'
                      : 'Gorakhpur Health District • Pipra Sub-Centre frontline registry. Welcome to your daily doorstep screening session.'}
                  </p>
                </div>

                {/* Permanent Live System Auto Clock */}
                <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 sm:p-5 flex flex-col justify-between space-y-3 shrink-0 lg:w-72 shadow-2xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                    <div className="flex items-center gap-2 text-xs font-bold text-slate-800">
                      <Clock className="w-4 h-4 text-emerald-600" />
                      <span className="font-mono text-sm tracking-tight font-extrabold text-slate-900">
                        {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {currentTime.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                    </span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-500 font-medium">Auto Clock:</span>
                      <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200 flex items-center gap-1.5 shadow-2xs">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                        <span>Live System Clock</span>
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400 font-medium text-right">
                      Greeting auto-syncs with real time
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Visit Success Toast Banner if triggered */}
            {visitSuccessToast && (
              <div className="p-4 bg-emerald-600 text-white rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-md animate-fade-in">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-5 h-5 text-emerald-200 shrink-0" />
                  <span>{visitSuccessToast}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setVisitSuccessToast(null)}
                  className="px-2 py-0.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-[11px] font-bold cursor-pointer"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* 4 STAT CARDS ROW */}
            <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* 1. Households Today */}
              <div
                onClick={() => setActiveNav('Households')}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                  <Users className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {dashboardData.householdsToday}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    Households Today
                  </p>
                </div>
              </div>

              {/* 2. Referrals Pending */}
              <div
                onClick={() => setActiveNav('Referrals')}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {dashboardData.pendingReferrals}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    Referrals Pending
                  </p>
                </div>
              </div>

              {/* 3. Completed Visits */}
              <div
                onClick={() => setActiveNav('Visit Records')}
                className="bg-white rounded-2xl p-5 border border-slate-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-slate-900 tracking-tight leading-none">
                    {dashboardData.completedVisits}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    Completed Visits
                  </p>
                </div>
              </div>

              {/* 4. High Priority Cases */}
              <div
                onClick={() => setActiveNav('Priority Cases')}
                className="bg-white rounded-2xl p-5 border border-rose-100 shadow-xs flex items-center gap-4 hover:shadow-md transition-shadow bg-linear-to-br from-white to-rose-50/30 cursor-pointer"
              >
                <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
                  <AlertTriangle className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-2xl font-extrabold text-rose-600 tracking-tight leading-none">
                    {dashboardData.highPriorityCases}
                  </p>
                  <p className="text-xs font-medium text-slate-500 mt-1">
                    High Priority Cases
                  </p>
                </div>
              </div>
            </section>

            {/* SEARCHABLE PATIENT & HOUSEHOLD DIRECTORY ON HOME DASHBOARD */}
            <section className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
                      <UserCheck className="w-5 h-5 text-emerald-800" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                        Searchable Patient &amp; Household Directory
                      </h3>
                      <p className="text-xs text-slate-500">
                        Quickly locate past records, clinical vitals, or families by individual name or household ID.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200">
                    {homeDirectoryData.patients.length} Beneficiaries • {homeDirectoryData.households.length} Households
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveNav('Patient Directory')}
                    className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <span>Full Directory</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Instant Search Bar */}
              <div className="space-y-3">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="text"
                    value={homeDirectoryQuery}
                    onChange={(e) => setHomeDirectoryQuery(e.target.value)}
                    placeholder="Search by Beneficiary Name or Household ID (e.g. 'Kamal', 'Savita', 'Radhika', 'HH-01', 'HH-03', 'HH-PIP-001')..."
                    className="w-full pl-10 pr-10 py-3 text-xs sm:text-sm bg-slate-50 hover:bg-slate-50/80 focus:bg-white border border-slate-200 rounded-2xl focus:outline-hidden focus:border-emerald-600 font-medium text-slate-800 transition-all placeholder:text-slate-400 shadow-2xs"
                  />
                  {homeDirectoryQuery && (
                    <button
                      type="button"
                      onClick={() => setHomeDirectoryQuery('')}
                      className="absolute right-3.5 top-3 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                      title="Clear search"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Household ID Quick Jump Pills */}
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mr-1">
                    Quick Household IDs:
                  </span>
                  {householdsList.slice(0, 5).map((h) => ({
                    id: h.id,
                    label: `${h.id}: ${h.headName.split(' ')[0]} (${h.tola})`,
                    head: h.headName,
                  })).map((hh) => (
                    <button
                      key={hh.id}
                      type="button"
                      onClick={() => setHomeDirectoryQuery(homeDirectoryQuery === hh.id ? '' : hh.id)}
                      className={`text-xs px-2.5 py-1 rounded-xl font-semibold border transition-all cursor-pointer ${
                        homeDirectoryQuery === hh.id
                          ? 'bg-emerald-700 text-white border-emerald-800 shadow-2xs'
                          : 'bg-slate-100 hover:bg-slate-200/80 text-slate-700 border-slate-200'
                      }`}
                    >
                      {hh.label}
                    </button>
                  ))}
                  {homeDirectoryQuery && (
                    <button
                      type="button"
                      onClick={() => setHomeDirectoryQuery('')}
                      className="text-xs text-rose-600 hover:underline font-semibold ml-1 cursor-pointer"
                    >
                      Reset Filter
                    </button>
                  )}
                </div>

                {/* Filter Category Pills */}
                <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
                  <span className="text-[11px] text-slate-400 font-semibold mr-1">Filter View:</span>
                  {[
                    { id: 'All', label: 'All Records' },
                    { id: 'Pregnant', label: 'Pregnant (ANC)' },
                    { id: 'Children', label: 'Children (<2y)' },
                    { id: 'High Risk', label: 'High Priority (TB / Risk)' },
                    { id: 'Households', label: 'Households Only' },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => setHomeCategoryFilter(cat.id as any)}
                      className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        homeCategoryFilter === cat.id
                          ? 'bg-emerald-800 text-white shadow-2xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Matched Households Preview */}
              {(homeCategoryFilter === 'Households' || (homeDirectoryQuery && homeDirectoryData.households.length > 0)) && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Matching Registered Households ({homeDirectoryData.households.length})</span>
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                    {homeDirectoryData.households.map((hh) => {
                      const familyMembers = patientsList.filter((p) => p.householdId === hh.id);
                      return (
                        <div
                          key={hh.id}
                          className="bg-slate-50/70 border border-slate-200/90 rounded-2xl p-4 hover:border-emerald-400 hover:bg-white transition-all space-y-2.5 shadow-2xs"
                        >
                          <div className="flex items-center justify-between pb-2 border-b border-slate-200/70">
                            <div>
                              <h4 className="text-xs font-bold text-slate-900">{hh.headName}</h4>
                              <p className="text-[10px] text-slate-500">{hh.tola} • {hh.village}</p>
                            </div>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-mono text-[10px] font-bold">
                              {hh.id}
                            </span>
                          </div>

                          <div className="text-[11px] text-slate-600 space-y-1">
                            <div className="flex justify-between">
                              <span className="text-slate-400">Ration Scheme:</span>
                              <span className="font-semibold text-slate-800">{hh.rationCardType}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Total Members:</span>
                              <span className="font-semibold text-slate-800">{hh.familyMembersCount}</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-400">Last Visited:</span>
                              <span className="text-slate-700">{hh.lastVisitDate}</span>
                            </div>
                          </div>

                          {/* Family Members Pills */}
                          {familyMembers.length > 0 && (
                            <div className="pt-1 border-t border-slate-200/70">
                              <span className="text-[10px] font-bold text-slate-500 block mb-1">
                                Registered Family Members:
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {familyMembers.map((fm) => (
                                  <button
                                    key={fm.id}
                                    type="button"
                                    onClick={() => setSelectedInspectPatient(fm)}
                                    className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 text-[10px] font-semibold text-slate-800 hover:border-emerald-500 hover:text-emerald-800 transition-colors cursor-pointer"
                                  >
                                    {fm.name} ({fm.relationshipToHead || 'Member'})
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Matched Individual Patients Results Grid */}
              {homeCategoryFilter !== 'Households' && (
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                      <UserCheck className="w-3.5 h-3.5 text-emerald-700" />
                      <span>
                        Matching Individuals ({homeDirectoryData.patients.length})
                        {homeDirectoryQuery && ` for query "${homeDirectoryQuery}"`}
                      </span>
                    </span>
                  </div>

                  {homeDirectoryData.patients.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      {homeDirectoryData.patients.map((person) => {
                        const linkedHh = homeDirectoryData.hhMap.get(person.householdId);
                        const isHighRisk = person.statusTag === 'High Priority';
                        return (
                          <div
                            key={person.id}
                            className={`bg-white rounded-2xl border p-4.5 space-y-3 transition-all hover:shadow-md ${
                              isHighRisk
                                ? 'border-rose-200 hover:border-rose-400 ring-1 ring-rose-500/10'
                                : 'border-slate-200/90 hover:border-emerald-400'
                            }`}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex items-center gap-3 min-w-0">
                                <img
                                  src={person.avatarUrl || (person.name.includes('Kamal') ? ASSETS.kamalSingh : ASSETS.radhikaSharma)}
                                  alt={person.name}
                                  className={`w-11 h-11 rounded-full object-cover shrink-0 ring-2 ${
                                    isHighRisk ? 'ring-rose-400' : 'ring-emerald-400/40'
                                  }`}
                                />
                                <div className="min-w-0">
                                  <h4 className="text-sm font-bold text-slate-900 truncate">
                                    {person.name}
                                  </h4>
                                  <p className="text-[11px] text-slate-500 font-medium">
                                    {person.age} yrs • {person.gender} • {person.relationshipToHead || 'Beneficiary'}
                                  </p>
                                </div>
                              </div>

                              <span
                                className={`text-[10px] px-2 py-0.5 rounded-full font-bold shrink-0 ${
                                  isHighRisk
                                    ? 'bg-rose-100 text-rose-800 border border-rose-200'
                                    : person.statusTag === 'Follow Up'
                                    ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                    : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                                }`}
                              >
                                {person.statusTag}
                              </span>
                            </div>

                            {/* Household ID Badge & Location */}
                            <div className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-slate-50 border border-slate-100">
                              <div className="flex items-center gap-1.5 min-w-0">
                                <span className="font-mono text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                                  {person.householdId || 'HH-01'}
                                </span>
                                <span className="text-[11px] text-slate-600 truncate">
                                  {linkedHh?.headName ? `Head: ${linkedHh.headName}` : 'Pipra Sub-Centre'}
                                </span>
                              </div>
                              <span className="text-[10px] text-slate-400 shrink-0">
                                {person.village || linkedHh?.tola || 'Pipra Tola'}
                              </span>
                            </div>

                            {/* Condition & Symptoms */}
                            <div className="text-xs space-y-1">
                              <div className="flex items-center gap-1.5 text-slate-800 font-semibold">
                                <Activity className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                <span className="truncate">{person.condition}</span>
                              </div>
                              {person.vitals && (
                                <p className="text-[11px] text-slate-500 font-mono pl-5">
                                  {person.vitals.bp ? `BP: ${person.vitals.bp} • ` : ''}
                                  {person.vitals.weightKg ? `Wt: ${person.vitals.weightKg}kg • ` : ''}
                                  {person.vitals.hemoglobin ? `Hb: ${person.vitals.hemoglobin}g/dL` : ''}
                                </p>
                              )}
                            </div>

                            {/* Action Buttons */}
                            <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => setSelectedInspectPatient(person)}
                                className="flex-1 py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-semibold flex items-center justify-center gap-1 transition-colors cursor-pointer"
                                title="View clinical notes & past history"
                              >
                                <Eye className="w-3.5 h-3.5 text-slate-500" />
                                <span>Past Records</span>
                              </button>

                              <button
                                type="button"
                                onClick={() => {
                                  setRecordVisitPatient(person);
                                  setTranscript(`विजिट: ${person.name} (${person.condition}) की स्वास्थ्य जांच।`);
                                  setShowVoiceModal(true);
                                }}
                                className="py-1.5 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer"
                                title="Start Voice Visit"
                              >
                                <Mic className="w-3.5 h-3.5" />
                                <span>Visit</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="p-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-2">
                      <p className="text-sm font-semibold text-slate-700">
                        No beneficiaries found matching &ldquo;{homeDirectoryQuery}&rdquo;
                      </p>
                      <p className="text-xs text-slate-400">
                        Try searching by household code (e.g. HH-01, HH-03), full name, or click one of the quick household pills above.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          setHomeDirectoryQuery('');
                          setHomeCategoryFilter('All');
                        }}
                        className="mt-2 text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
                      >
                        Reset Search Filters
                      </button>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* 4-STEP FRONTLINE WORKFLOW ARCHITECTURE BANNER */}
            <div className="bg-white rounded-2xl p-6 border border-emerald-200/80 shadow-xs relative overflow-hidden">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
                    4-Step
                  </div>
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                      Frontline Healthcare Workflow Companion
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                        Zero Black-Box AI
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">
                      From village doorstep voice capture to closed-loop health centre referral outcome
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-500 font-medium">Quick Step Walkthrough:</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4">
                {/* Step 1 */}
                <div
                  onClick={() => {
                    setExtractedData(null);
                    setTranscript('');
                    setShowVoiceModal(true);
                  }}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-emerald-500 hover:bg-emerald-50/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                      STEP 1
                    </span>
                    <Mic className="w-3.5 h-3.5 text-emerald-700" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    Voice Visit Capture
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Speak in Hindi/dialects, AI extracts structured fields, worker reviews before saving.
                  </p>
                  <span className="text-[10px] font-bold text-emerald-700 mt-2 inline-flex items-center gap-1 group-hover:underline">
                    Record Visit &rarr;
                  </span>
                </div>

                {/* Step 2 */}
                <div
                  onClick={() => setActiveNav('Priority Cases')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-rose-400 hover:bg-rose-50/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-rose-100 text-rose-800">
                      STEP 2
                    </span>
                    <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-rose-800 transition-colors">
                    Explainable Risk Rules
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Deterministic national protocol evaluation (NTEP-TB, ANC Anemia, UIP Vaccines).
                  </p>
                  <span className="text-[10px] font-bold text-rose-700 mt-2 inline-flex items-center gap-1 group-hover:underline">
                    View Protocol Rules &rarr;
                  </span>
                </div>

                {/* Step 3 */}
                <div
                  onClick={() => {
                    setActiveNav('Referrals');
                    if (referralsList && referralsList.length > 0) {
                      setActivePassport(referralsList[0]);
                      setShowPassportModal(true);
                    }
                  }}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-purple-400 hover:bg-purple-50/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-purple-100 text-purple-800">
                      STEP 3
                    </span>
                    <QrCode className="w-3.5 h-3.5 text-purple-700" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-purple-800 transition-colors">
                    QR Referral Passport
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Cryptographic token for facility check-in with Zero PII exposed in QR.
                  </p>
                  <span className="text-[10px] font-bold text-purple-700 mt-2 inline-flex items-center gap-1 group-hover:underline">
                    Inspect Safe QR Passport &rarr;
                  </span>
                </div>

                {/* Step 4 */}
                <div
                  onClick={() => setActiveNav('Facility Desk')}
                  className="p-3.5 rounded-xl border border-slate-200/80 hover:border-blue-400 hover:bg-blue-50/40 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-blue-100 text-blue-800">
                      STEP 4
                    </span>
                    <Building2 className="w-3.5 h-3.5 text-blue-700" />
                  </div>
                  <h3 className="text-xs font-bold text-slate-900 group-hover:text-blue-800 transition-colors">
                    Track Facility &amp; Outcome
                  </h3>
                  <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">
                    Health centre records arrival &amp; doctor consultation to close the loop.
                  </p>
                  <span className="text-[10px] font-bold text-blue-700 mt-2 inline-flex items-center gap-1 group-hover:underline">
                    Open Facility Desk &rarr;
                  </span>
                </div>
              </div>
            </div>

            {/* LOWER SECTION: Two Columns */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-7">
              {/* LEFT COLUMN: Today's Visit List (7 cols) */}
              <div className="lg:col-span-7 bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between pb-4 border-b border-slate-100">
                    <h2 className="text-base font-bold text-slate-900 tracking-tight">
                      Today&apos;s Visit List
                    </h2>
                    <button
                      onClick={() => setActiveNav('Patient Directory')}
                      className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition-colors"
                    >
                      View All
                    </button>
                  </div>

                  <div className="divide-y divide-slate-100 mt-2">
                    {dashboardData.todayVisitList.map((patient: any) => {
                      const isHigh = patient.statusTag === 'High Priority';
                      const isFollow = patient.statusTag === 'Follow Up';
                      return (
                        <div
                          key={patient.id}
                          onClick={() => {
                            if (patient.statusTag === 'High Priority' || patient.name?.includes('Kamal') || patient.condition?.includes('TB')) {
                              setSelectedRiskPatient(patient);
                              setShowRiskModal(true);
                            } else {
                              setShowPatientDetailModal(patient);
                            }
                          }}
                          className="py-3.5 px-2 flex items-center justify-between rounded-xl hover:bg-slate-50/90 transition-colors cursor-pointer group"
                        >
                          <div className="flex items-center gap-3.5 min-w-0">
                            <img
                              src={
                                patient.name.includes('Kamal')
                                  ? ASSETS.kamalSingh
                                  : ASSETS.radhikaSharma
                              }
                              alt={patient.name}
                              className="w-10 h-10 rounded-full object-cover shrink-0 ring-1 ring-slate-200"
                            />
                            <div className="min-w-0">
                              <h3 className="text-sm font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors truncate">
                                {patient.name}
                              </h3>
                              <p className="text-xs text-slate-500 truncate mt-0.5">
                                {patient.condition}
                                <span className="mx-1 text-slate-300">•</span>
                                {patient.lastVisit || '2 months ago'}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <span
                              className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                                isHigh
                                  ? 'bg-rose-50 text-rose-600 border border-rose-200/60'
                                  : isFollow
                                  ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                              }`}
                            >
                              {patient.statusTag}
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 transition-colors" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Action bar at bottom of list */}
                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Showing {dashboardData.todayVisitList.length} of 12 scheduled visits</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setExtractedData(null);
                        setTranscript('');
                        setShowVoiceModal(true);
                      }}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold transition-colors flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                      Record Voice Visit
                    </button>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Recent Activity + Banner Card (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Recent Activity Card */}
                <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
                  <h2 className="text-base font-bold text-slate-900 tracking-tight pb-3 border-b border-slate-100">
                    Recent Activity
                  </h2>
                  <div className="mt-3.5 space-y-4">
                    {dashboardData.recentActivity.map((act: any) => (
                      <div
                        key={act.id}
                        onClick={() => {
                          if (act.type === 'referral') {
                            setActiveNav('Referrals');
                          } else {
                            setActiveNav('Visit Records');
                          }
                        }}
                        className="flex items-start gap-3 cursor-pointer group"
                      >
                        <div
                          className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                            act.type === 'visit'
                              ? 'bg-emerald-50 text-emerald-600'
                              : act.type === 'referral'
                              ? 'bg-purple-50 text-purple-600'
                              : act.type === 'followup'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-blue-50 text-blue-600'
                          }`}
                        >
                          {act.type === 'visit' && <FileText className="w-4 h-4" />}
                          {act.type === 'referral' && <GitPullRequest className="w-4 h-4" />}
                          {act.type === 'followup' && <CheckCircle2 className="w-4 h-4" />}
                          {act.type === 'message' && <MessageSquare className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-700 transition-colors">
                            {act.title}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {act.subtitle}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Photo Card: "Better care starts with you 🌱" */}
                <div className="relative rounded-2xl overflow-hidden min-h-[170px] flex-1 group shadow-xs border border-slate-200">
                  <img
                    src={ASSETS.villageWorker}
                    alt="Rural healthcare worker"
                    className="w-full h-full object-cover object-center absolute inset-0 transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/30 to-black/40" />

                  <div className="relative z-10 p-5 h-full flex flex-col justify-between text-white">
                    <div>
                      <h3 className="text-lg font-bold tracking-tight drop-shadow-sm flex items-center gap-1.5">
                        Better care starts with you 🌱
                      </h3>
                      <p className="text-xs text-white/90 mt-1 max-w-[240px] drop-shadow-xs font-medium">
                        AI assistance in your voice, your language, right in every home.
                      </p>
                    </div>

                    <div className="pt-2">
                      <button
                        onClick={() => {
                          setExtractedData(null);
                          setTranscript('');
                          setShowVoiceModal(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 px-3.5 py-2 rounded-lg shadow-sm transition-all"
                      >
                        <span>Start Visit</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: VOICE VISIT & PATIENT INTERACTION AUDIO RECORDER */}
        {/* ============================================================== */}
        {activeNav === 'Voice Visit' && (
          <div className="p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Frontline Patient Interaction Audio Recorder
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Capture patient dialogue with microphone &amp; Web Speech API, and transcribe into structured clinical visit notes
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>Microphone Ready</span>
                </span>
              </div>
            </div>

            <PatientInteractionRecorder
              allPatients={patientsList}
              defaultPatient={recordVisitPatient}
              initialTranscript={transcript}
              onVisitSaved={async (saved) => {
                await loadData();
                if (saved?.personName) {
                  setVisitSuccessToast(`Visit recorded successfully for ${saved.personName}.`);
                }
              }}
              onReferralIssued={async (ref) => {
                setActivePassport(ref);
                setShowPassportModal(true);
                await loadData();
              }}
            />
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW: PATIENT DIRECTORY & PAST HEALTH RECORDS */}
        {/* ============================================================== */}
        {activeNav === 'Patient Directory' && (
          <PatientDirectory
            people={patientsList.length > 0 ? patientsList : (dashboardData.todayVisitList || [])}
            households={householdsList}
            visits={visitsList}
            referrals={referralsList}
            onStartVisit={(person) => {
              setRecordVisitPatient(person);
              setTranscript(`विजिट: ${person.name} (${person.condition}) की स्वास्थ्य जांच।`);
              setActiveNav('Voice Visit');
            }}
            onIssueReferral={(person) => {
              setActivePassport({
                id: `REF-${Date.now()}`,
                referralCode: `ASHA${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
                patientName: person.name,
                patientAge: person.age,
                patientGender: person.gender,
                referredTo: 'District Hospital',
                date: '10 Oct 2026',
                condition: person.condition,
                symptoms: person.symptoms || [],
                currentStep: 1,
                steps: [
                  { title: 'Referral Generated', date: '10 Oct 2026', completed: true },
                  { title: 'Reached Health Centre', date: 'Pending', completed: false },
                  { title: 'Consultation Completed', date: 'Pending', completed: false },
                  { title: 'Follow Up Scheduled', date: 'Pending', completed: false },
                ],
              });
              setShowPassportModal(true);
            }}
            onSelectHousehold={(householdId) => {
              setActiveNav('Households');
              const hh = householdsList.find((h) => h.id === householdId);
              if (hh) {
                setSearchQuery(hh.code || hh.headName);
              }
            }}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW 2: HOUSEHOLDS DIRECTORY */}
        {/* ============================================================== */}
        {activeNav === 'Households' && (
          <div className="p-8 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Household Directory &amp; Beneficiaries
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Village Pipra • 5 Sections • 148 Registered Families
                </p>
              </div>

              <div className="w-72 relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search head name or code..."
                  className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:border-emerald-600"
                />
              </div>
            </div>

            {/* Category Filter Pills */}
            <div className="flex flex-wrap gap-2">
              {[
                { id: 'All', label: 'All Families (148)' },
                { id: 'Pregnant', label: 'Pregnant Women (ANC)' },
                { id: 'Children', label: 'Children (<2 yrs)' },
                { id: 'Presumptive TB', label: 'TB Screening' },
                { id: 'High Priority', label: 'High Priority Flags' },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setHouseholdCategoryFilter(pill.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                    householdCategoryFilter === pill.id
                      ? 'bg-emerald-700 text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {pill.label}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {householdsList
                .filter((h) => {
                  const matchQuery =
                    !searchQuery ||
                    h.headName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    h.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    h.tola.toLowerCase().includes(searchQuery.toLowerCase());
                  if (!matchQuery) return false;

                  if (householdCategoryFilter === 'Pregnant') {
                    return patientsList.some((p) => p.householdId === h.id && p.category === 'Pregnant');
                  }
                  if (householdCategoryFilter === 'Children') {
                    return patientsList.some((p) => p.householdId === h.id && p.category === 'Children');
                  }
                  if (householdCategoryFilter === 'Presumptive TB') {
                    return patientsList.some((p) => p.householdId === h.id && (p.condition?.toLowerCase().includes('tb') || p.symptoms?.some((s: string) => String(s).toLowerCase().includes('cough'))));
                  }
                  if (householdCategoryFilter === 'High Priority') {
                    return patientsList.some((p) => p.householdId === h.id && (p.statusTag === 'High Priority' || p.category === 'High Risk'));
                  }
                  return true;
                })
                .map((hh) => (
                  <div
                    key={hh.id}
                    className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
                  >
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <span className="text-sm font-bold text-slate-900 group-hover:text-emerald-700">
                        {hh.headName}
                      </span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 font-bold">
                        {hh.code}
                      </span>
                    </div>

                    <div className="space-y-1.5 py-3 text-xs text-slate-600">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Tola Section:</span>
                        <span className="font-medium text-slate-800">{hh.tola}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Family Members:</span>
                        <span className="font-medium text-slate-800">{hh.familyMembersCount} Members</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Ration Scheme:</span>
                        <span className="font-semibold text-emerald-800">{hh.rationCardType}</span>
                      </div>
                    </div>

                    <div className="pt-2 flex justify-between items-center text-xs">
                      <span className="text-[11px] text-slate-400">
                        Last visited: {hh.lastVisitDate}
                      </span>
                      <button
                        onClick={() => {
                          setTranscript(`विजिट: ${hh.headName} के घर की जाँच।`);
                          setShowVoiceModal(true);
                        }}
                        className="text-xs font-bold text-emerald-700 group-hover:underline flex items-center gap-1"
                      >
                        <span>Record Visit</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: VISIT RECORDS */}
        {/* ============================================================== */}
        {activeNav === 'Visit Records' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Recorded Health Visits &amp; Clinical Notes
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Voice-to-structured records verified and confirmed by ASHA worker
                </p>
              </div>

              <button
                onClick={() => {
                  setExtractedData(null);
                  setTranscript('');
                  setShowVoiceModal(true);
                }}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>New Voice Visit</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200/80 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-4">Beneficiary</th>
                    <th className="py-3 px-4">Date &amp; Time</th>
                    <th className="py-3 px-4">Condition / Diagnosis</th>
                    <th className="py-3 px-4">Symptoms / Observations</th>
                    <th className="py-3 px-4">Status &amp; Protocol</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {visitsList.map((vis) => (
                    <tr key={vis.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {vis.personName}
                      </td>
                      <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">
                        {vis.date} • {vis.time}
                      </td>
                      <td className="py-3.5 px-4 font-medium">
                        {vis.condition}
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 max-w-xs truncate">
                        {Array.isArray(vis.symptoms) ? vis.symptoms.join(', ') : vis.symptoms}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                            vis.priorityLevel === 'HIGH_PRIORITY'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {vis.priorityLevel || 'ROUTINE'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          onClick={() => {
                            if (vis.personName.includes('Kamal')) {
                              setSelectedRiskPatient(vis);
                              setShowRiskModal(true);
                            }
                          }}
                          className="text-emerald-700 hover:underline font-semibold"
                        >
                          View Protocol
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: PRIORITY CASES & PROTOCOL RULES */}
        {/* ============================================================== */}
        {activeNav === 'Priority Cases' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Active Priority Flags &amp; Clinical Protocols
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Deterministic rules evaluation — transparent clinical guidelines without unvetted AI decisions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Card 1: TB Suspect Kamal Singh */}
              <div className="bg-white rounded-2xl p-6 border border-rose-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                      <AlertOctagon className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-rose-950">
                        High Priority Flag: Presumptive TB
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-rose-700">
                        Rule: NTEP-TB-RULE-01
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-800">
                    URGENT
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Beneficiary:</span>
                    <span className="font-bold text-slate-900">Kamal Singh (Age 42 | Male)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source Guideline:</span>
                    <span className="text-right">MoHFW National TB Elimination Programme</span>
                  </div>
                  <div className="p-3 bg-rose-50/60 rounded-xl space-y-1 text-[11px] text-rose-900">
                    <span className="font-bold block">Matched Symptoms:</span>
                    <p>• Persistent cough (&gt;2 weeks)</p>
                    <p>• Unexplained weight loss</p>
                    <p>• Night sweats</p>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setSelectedRiskPatient({ name: 'Kamal Singh', condition: 'TB Suspect' });
                      setShowRiskModal(true);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold transition-colors"
                  >
                    View Protocol &amp; Issue Referral
                  </button>
                </div>
              </div>

              {/* Card 2: Gestational Anemia */}
              <div className="bg-white rounded-2xl p-6 border border-amber-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-amber-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-amber-500 text-white flex items-center justify-center shrink-0">
                      <AlertTriangle className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-amber-950">
                        Attention Flag: Gestational Anemia
                      </h3>
                      <span className="text-[10px] font-mono font-bold text-amber-700">
                        Rule: MOHFW-ANC-ANEMIA-02
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                    FOLLOW-UP
                  </span>
                </div>

                <div className="space-y-2 text-xs text-slate-700">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Beneficiary:</span>
                    <span className="font-bold text-slate-900">Savita Sharma (Age 26 | Pregnant)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Source Guideline:</span>
                    <span className="text-right">Anemia Mukt Bharat Operational Guide</span>
                  </div>
                  <div className="p-3 bg-amber-50/60 rounded-xl space-y-1 text-[11px] text-amber-900">
                    <span className="font-bold block">Matched Symptoms:</span>
                    <p>• Mild headache, fatigue &amp; pallor</p>
                    <p>• Borderline Hemoglobin (9.8 g/dL)</p>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => {
                      setExtractedData({
                        personName: 'Savita Sharma',
                        age: '26 years',
                        condition: 'Pregnant (2nd Trimester)',
                        symptoms: ['Mild headache', 'Fatigue', 'Pallor'],
                        visitDate: '10 Oct 2026',
                        followUp: 'ANC checkup in 2 weeks & double IFA supply',
                      });
                      setShowVoiceModal(true);
                    }}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold transition-colors"
                  >
                    ANC Follow-Up &amp; IFA Prescribe
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: REFERRAL PASSPORTS & TRACKING */}
        {/* ============================================================== */}
        {activeNav === 'Referrals' && (
          <div className="p-8 space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  Referral Passports &amp; Facility Coordination
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Secure cryptographic QR tokens • District Hospital Pipra &amp; PHC OPDs
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setShowScannerModal(true)}
                  className="px-4 py-2 rounded-xl bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                >
                  <QrCode className="w-4 h-4" />
                  <span>Open Facility Desk Scanner</span>
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {referralsList.map((ref) => {
                const isReached = ref.status === 'REACHED' || ref.status === 'CONSULTED' || ref.status === 'COMPLETED';
                const isConsulted = ref.status === 'CONSULTED' || ref.status === 'COMPLETED';
                const isCompleted = ref.status === 'COMPLETED';

                return (
                  <div
                    key={ref.id}
                    className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs flex flex-col gap-4"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div className="flex items-start gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
                          <QrCode className="w-8 h-8" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-base font-bold text-slate-900">
                              {ref.personName}
                            </h3>
                            <span className="text-[11px] font-mono font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                              {ref.referralCode}
                            </span>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                              {ref.urgency}
                            </span>
                          </div>
                          <p className="text-xs text-slate-600 mt-1">
                            <strong>Reason:</strong> {ref.reason}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            Destination: {ref.referredToFacility} • Protocol: {ref.protocolCode} • Issued: {ref.date}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <span className="text-xs font-bold text-emerald-700 block">
                            Status: {ref.status}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {ref.events?.length || 1} Event(s) logged
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            setActivePassport(ref);
                            setShowPassportModal(true);
                          }}
                          className="px-4 py-2 rounded-xl bg-[#064e3b] hover:bg-[#043927] text-white text-xs font-bold transition-colors"
                        >
                          View QR Passport
                        </button>
                      </div>
                    </div>

                    {/* Interactive 4-Stage Referral Life-cycle Tracker */}
                    <div className="pt-3 border-t border-slate-100">
                      <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-2">
                        <span>Referral Resolution Progress</span>
                        <div className="flex gap-2">
                          {ref.status === 'ISSUED' && (
                            <button
                              onClick={() => handleDeskRecordEvent('REACHED', ref.id)}
                              className="text-xs text-blue-700 hover:underline font-bold"
                            >
                              + Test Reception Arrival
                            </button>
                          )}
                          {ref.status === 'REACHED' && (
                            <button
                              onClick={() => handleDeskRecordEvent('CONSULTED', ref.id)}
                              className="text-xs text-purple-700 hover:underline font-bold"
                            >
                              + Test Doctor Consultation
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-center text-[10px]">
                        <div className="p-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold">
                          ✓ 1. Passport Issued
                        </div>
                        <div
                          className={`p-2 rounded-xl border font-bold ${
                            isReached
                              ? 'bg-blue-50 border-blue-200 text-blue-900'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          {isReached ? '✓ 2. Reached Facility' : '2. In Transit'}
                        </div>
                        <div
                          className={`p-2 rounded-xl border font-bold ${
                            isConsulted
                              ? 'bg-purple-50 border-purple-200 text-purple-900'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          {isConsulted ? '✓ 3. Doctor Examined' : '3. Awaiting OPD'}
                        </div>
                        <div
                          className={`p-2 rounded-xl border font-bold ${
                            isCompleted
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                              : 'bg-slate-50 border-slate-200 text-slate-400'
                          }`}
                        >
                          {isCompleted ? '✓ 4. Care Documented' : '4. Outcome Resolution'}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 6: FACILITY HEALTH CENTRE DESK */}
        {/* ============================================================== */}
        {activeNav === 'Facility Desk' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Health Centre Reception &amp; OPD Desk
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Authorized desk interface to authenticate QR tokens and record arrival &amp; clinical consultations
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs max-w-2xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-slate-900">
                  Validate Patient Referral Token
                </h3>
                <span className="text-[11px] font-mono text-slate-500">
                  Port: OPD Desk 4 • Reception
                </span>
              </div>

              {/* Quick Test Tokens */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] text-slate-500 font-medium">Quick Test:</span>
                {(referralsList.length > 0
                  ? referralsList.slice(0, 3).map((r) => ({
                      label: `${r.personName} (${r.referralCode.slice(-4)})`,
                      code: r.referralCode,
                    }))
                  : [
                      { label: 'Kamal Singh (TB)', code: 'ASHA20261010-0042' },
                      { label: 'Shabana Ansari (ANC)', code: 'ASHA20261010-0089' },
                      { label: 'Meena Patel', code: 'ASHA20261010-0114' },
                    ]
                ).map((item) => (
                  <button
                    key={item.code}
                    onClick={() => {
                      setScanInputToken(item.code);
                      handleDeskValidation(item.code);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-[11px] font-mono font-bold text-slate-700 transition-colors"
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={scanInputToken}
                  onChange={(e) => setScanInputToken(e.target.value)}
                  placeholder="Enter or scan referral token / code..."
                  className="flex-1 bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2.5 text-xs text-slate-900 font-mono focus:outline-hidden focus:border-emerald-600 font-medium"
                />
                <button
                  onClick={() => handleDeskValidation(scanInputToken)}
                  disabled={isDeskLoading}
                  className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition-colors"
                >
                  {isDeskLoading ? 'Checking...' : 'Validate Token'}
                </button>
              </div>

              {deskActionMsg && (
                <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
                  {deskActionMsg}
                </p>
              )}

              {verifiedDeskReferral && (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3 mt-4 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                    <span className="font-bold text-slate-900 text-sm">
                      {verifiedDeskReferral.personName} ({verifiedDeskReferral.personAge || 42} Yrs • {verifiedDeskReferral.personGender || 'Male'})
                    </span>
                    <span className="font-mono text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded font-bold">
                      {verifiedDeskReferral.referralCode}
                    </span>
                  </div>

                  <div className="space-y-1.5 text-slate-600">
                    <p><strong>Clinical Indication:</strong> {verifiedDeskReferral.reason}</p>
                    <p><strong>Protocol Reference:</strong> <span className="font-mono text-[11px] font-bold text-slate-800">{verifiedDeskReferral.protocolCode}</span></p>
                    <p><strong>Destination:</strong> {verifiedDeskReferral.referredToFacility || 'District Hospital Pipra'}</p>
                    <p><strong>Current Status:</strong> <span className="text-emerald-700 font-bold uppercase">{verifiedDeskReferral.status}</span></p>
                  </div>

                  {/* Clinical Action Form */}
                  <div className="p-3 bg-white rounded-xl border border-slate-200 space-y-2 mt-2">
                    <span className="text-[11px] font-bold text-slate-800 block">
                      Hospital Clinical Documentation:
                    </span>
                    <div className="space-y-1 text-[11px] text-slate-600">
                      <p>• Attending Doctor: Dr. A. K. Verma, MD (Pulmonology)</p>
                      <p>• Specimen Collected: Sputum CBNAAT GeneXpert #TX-9042</p>
                      <p>• Medication Issued: Initial Fixed Dose Combination (FDC) counseling</p>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleDeskRecordEvent('REACHED')}
                      className="flex-1 py-2.5 px-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Record Reception Arrival</span>
                    </button>

                    <button
                      onClick={() => handleDeskRecordEvent('CONSULTED')}
                      className="flex-1 py-2.5 px-3 bg-purple-600 hover:bg-purple-700 text-white font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                    >
                      <Stethoscope className="w-4 h-4" />
                      <span>Record Doctor Consultation</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 7: ANALYTICS & SUMMARY REPORTS DASHBOARD (RECHARTS) */}
        {/* ============================================================== */}
        {(activeNav === 'Reports' || activeNav === 'Analytics') && (
          <AnalyticsDashboard
            reportsData={reportsData}
            visitsList={visitsList}
            referralsList={referralsList}
            householdsList={householdsList}
            currentUser={currentUser}
            onRefresh={loadData}
            onNavigateToVisits={() => setActiveNav('Visit Records')}
            onNavigateToReferrals={() => setActiveNav('Referrals')}
          />
        )}

        {/* ============================================================== */}
        {/* VIEW 8: MESSAGES FROM PHC */}
        {/* ============================================================== */}
        {activeNav === 'Messages' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Primary Health Centre (PHC) Communications
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Official announcements, diagnostic feedback, and clinical schedules
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs space-y-4 max-w-2xl">
              <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-emerald-950">Dr. A. K. Verma (District Hospital)</span>
                  <span className="text-slate-500 text-[11px]">Today, 04:15 PM</span>
                </div>
                <p className="text-xs text-emerald-900">
                  Referral token <strong>ASHA20261010-0042 (Kamal Singh)</strong> has been processed at the Chest Clinic. Sputum CBNAAT sample collected. Report scheduled for 24 Oct follow-up. Thank you for the fast triage.
                </p>
              </div>

              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-900">Pipra Sub-Centre Incharge</span>
                  <span className="text-slate-500 text-[11px]">Yesterday, 09:30 AM</span>
                </div>
                <p className="text-xs text-slate-700">
                  Reminder: Village Health Sanitation and Nutrition Day (VHSND) session is scheduled for Wednesday at Pipra Tola Anganwadi Centre. Ensure Pentavalent 3 and MR-1 dropouts are mobilized.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 9: SETTINGS & OFFLINE STORAGE */}
        {/* ============================================================== */}
        {activeNav === 'Settings' && (
          <div className="p-8 space-y-6">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Application Settings &amp; Offline Storage
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Manage IndexedDB offline drafts, local dialect preferences, and security
              </p>
            </div>

            <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs max-w-2xl space-y-5">
              <div className="flex items-center gap-4 pb-4 border-b border-slate-100">
                <img
                  src={CURRENT_USER.avatar}
                  alt={CURRENT_USER.name}
                  className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-600/30"
                />
                <div>
                  <h3 className="text-base font-bold text-slate-900">
                    {CURRENT_USER.name}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {CURRENT_USER.role} • ID: {CURRENT_USER.id}
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold mt-0.5">
                    {CURRENT_USER.subCentre} • {CURRENT_USER.district}
                  </p>
                </div>
              </div>

              {/* Offline sync */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-900 block">
                    Offline Local Storage (IndexedDB)
                  </span>
                  <span className="text-xs text-slate-500">
                    {storageStats.sizeFormatted} • {storageStats.queueCount} pending sync items
                  </span>
                </div>

                <button
                  onClick={handleManualSync}
                  className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-colors"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Sync Now</span>
                </button>
              </div>

              {syncFeedback && (
                <p className="text-xs text-emerald-800 bg-emerald-50 border border-emerald-200 p-2.5 rounded-xl font-medium">
                  {syncFeedback}
                </p>
              )}

              {/* Regional Dialects */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 block">
                    Local Speech &amp; Regional Dialect Support
                  </label>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    Active: {selectedDialect}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {ALL_DIALECTS.map((d) => (
                    <button
                      key={d.id}
                      onClick={() => {
                        setSelectedDialect(d.id);
                        setSpeechLanguage(d.id);
                      }}
                      className={`p-3 rounded-xl text-left border transition-all ${
                        selectedDialect === d.id
                          ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600/30 text-emerald-950 font-bold'
                          : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <p className="text-xs font-semibold leading-tight">{d.label}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">{d.region}</p>
                    </button>
                  ))}
                </div>

                {/* Dialect Screening Phrasebook */}
                <div className="p-4 bg-emerald-50/60 rounded-2xl border border-emerald-200/80 mt-3 space-y-2.5">
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-emerald-700" />
                    <span className="text-xs font-bold text-emerald-950">
                      Frontline Screening Phrase in {selectedDialect}
                    </span>
                  </div>

                  <div className="p-3 bg-white rounded-xl border border-emerald-200 text-xs text-slate-800 space-y-1">
                    <p className="text-[11px] text-slate-500 font-medium">TB Screening Query:</p>
                    <p className="font-semibold text-emerald-900">
                      {selectedDialect.includes('Bundeli')
                        ? '“का तुमें दो हफ्ता से जादा खाँसी, छाती में जकड़न या रात को पसीना आ रओ है?”'
                        : selectedDialect.includes('Bagheli')
                        ? '“का तूहैं दुई हफ्ता से जादे खाँसी अउर रात मा पसीना आवत बा?”'
                        : selectedDialect.includes('Malvi')
                        ? '“कां तमने दो हफ्ता सूं जादा खाँसी या रात में पसीनो आवे छे?”'
                        : selectedDialect.includes('Nimadi')
                        ? '“का तुमनें दो हफ्ता से ज्यादा खोखली या रात में पसीना आवे छे?”'
                        : selectedDialect.includes('Marathi')
                        ? '“तुम्हाला दोन आठवड्यांपेक्षा जास्त खोकला किंवा रात्री घाम येतो का?”'
                        : selectedDialect.includes('Urdu')
                        ? '“کیا آپ کو دو ہفتوں سے زیادہ کھانसी یا رات میں پسینہ آ رہا ہے؟”'
                        : selectedDialect.includes('English')
                        ? '“Have you experienced a cough lasting more than 2 weeks or night sweats?”'
                        : '“क्या आपको दो हफ्ते से ज्यादा से खांसी, बलगम या रात में पसीना आ रहा है?”'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 1: VOICE VISIT RECORDING & AI SUMMARY DIALOG */}
        {/* ============================================================== */}
        {showVoiceModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
            <div className="max-w-4xl w-full my-8">
              <PatientInteractionRecorder
                isModal={true}
                allPatients={patientsList}
                defaultPatient={recordVisitPatient}
                initialTranscript={transcript}
                onClose={() => {
                  setShowVoiceModal(false);
                  setRecordVisitPatient(null);
                }}
                onVisitSaved={async (savedVisit) => {
                  await loadData();
                  if (savedVisit?.personName) {
                    setVisitSuccessToast(`Visit recorded successfully for ${savedVisit.personName}.`);
                  }
                  setTimeout(() => {
                    setShowVoiceModal(false);
                    setRecordVisitPatient(null);
                  }, 1200);
                }}
                onReferralIssued={async (ref) => {
                  setActivePassport(ref);
                  setShowVoiceModal(false);
                  setRecordVisitPatient(null);
                  setShowPassportModal(true);
                  await loadData();
                }}
              />
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 2: RISK ALERT & PROTOCOL EXPLANATION */}
        {/* ============================================================== */}
        {showRiskModal && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-rose-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center shrink-0">
                    <AlertOctagon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-rose-950">
                      High Priority Case Detected
                    </h3>
                    <p className="text-[11px] text-rose-700 font-semibold">
                      Presumptive TB Screening Protocol
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowRiskModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3 text-xs text-slate-700">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl">
                  <img
                    src={
                      selectedRiskPatient?.avatarUrl ||
                      (selectedRiskPatient?.name?.includes('Kamal') ? ASSETS.kamalSingh : ASSETS.radhikaSharma)
                    }
                    alt={selectedRiskPatient?.name || 'Beneficiary'}
                    className="w-10 h-10 rounded-full object-cover ring-2 ring-rose-300"
                  />
                  <div>
                    <h4 className="font-bold text-slate-900">{selectedRiskPatient?.name || 'Kamal Singh'}</h4>
                    <p className="text-[11px] text-slate-500">
                      Age: {selectedRiskPatient?.age || 42} | {selectedRiskPatient?.gender || 'Male'} • {selectedRiskPatient?.village || 'Pipra Purwa'}
                    </p>
                  </div>
                </div>

                <div className="p-3 bg-rose-50/70 border border-rose-200 rounded-xl space-y-1.5 text-rose-900">
                  <span className="font-bold block">NTEP Protocol Guidelines (Rule: NTEP-TB-RULE-01):</span>
                  <p>1. Fast-track sputum smear microscopy / CBNAAT test at PHC.</p>
                  <p>2. Provide N-95 or surgical mask and educate household.</p>
                  <p>3. Generate urgent digital referral passport to District Hospital.</p>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={handleIssueReferral}
                  className="flex-1 py-3 bg-[#b91c1c] hover:bg-[#991b1b] text-white font-bold text-xs rounded-xl shadow-md transition-colors"
                >
                  Issue Digital Referral Passport
                </button>
                <button
                  onClick={() => setShowRiskModal(false)}
                  className="px-4 py-3 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
                >
                  Dismiss
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 3: REFERRAL PASSPORT WITH SAFE QR CODE */}
        {/* ============================================================== */}
        {showPassportModal && activePassport && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-slate-200 space-y-4 text-center">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 text-left">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Digital Referral Passport
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Safe lookup token • Zero PII exposed in QR
                  </p>
                </div>
                <button
                  onClick={() => setShowPassportModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* QR Code graphic */}
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col items-center">
                <div className="p-2 bg-white rounded-xl shadow-xs border border-slate-100">
                  <svg
                    viewBox="0 0 160 160"
                    className="w-36 h-36"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect width="160" height="160" fill="white" />
                    <rect x="12" y="12" width="40" height="40" rx="6" stroke="#064e3b" strokeWidth="6" fill="white" />
                    <rect x="22" y="22" width="20" height="20" rx="3" fill="#064e3b" />
                    <rect x="108" y="12" width="40" height="40" rx="6" stroke="#064e3b" strokeWidth="6" fill="white" />
                    <rect x="118" y="22" width="20" height="20" rx="3" fill="#064e3b" />
                    <rect x="12" y="108" width="40" height="40" rx="6" stroke="#064e3b" strokeWidth="6" fill="white" />
                    <rect x="22" y="118" width="20" height="20" rx="3" fill="#064e3b" />
                    <g fill="#0b533e">
                      <rect x="62" y="16" width="8" height="8" rx="1.5" />
                      <rect x="80" y="16" width="8" height="8" rx="1.5" />
                      <rect x="71" y="28" width="8" height="8" rx="1.5" />
                      <rect x="89" y="28" width="8" height="8" rx="1.5" />
                      <rect x="62" y="62" width="8" height="8" rx="1.5" />
                      <rect x="74" y="62" width="8" height="8" rx="1.5" />
                      <rect x="86" y="74" width="8" height="8" rx="1.5" />
                      <rect x="112" y="62" width="8" height="8" rx="1.5" />
                      <rect x="62" y="112" width="8" height="8" rx="1.5" />
                      <rect x="74" y="124" width="8" height="8" rx="1.5" />
                      <rect x="112" y="112" width="8" height="8" rx="1.5" />
                    </g>
                    <circle cx="80" cy="80" r="14" fill="white" stroke="#064e3b" strokeWidth="2.5" />
                    <path
                      d="M80 87C80 87 73 82.5 73 78C73 75.8 74.8 74 77 74C78.4 74 79.5 74.8 80 75.5C80.5 74.8 81.6 74 83 74C85.2 74 87 75.8 87 78C87 82.5 80 87 80 87Z"
                      fill="#059669"
                    />
                  </svg>
                </div>
                <span className="font-mono text-xs font-bold text-slate-800 mt-2">
                  {activePassport.referralCode}
                </span>
              </div>

              <div className="space-y-1.5 text-xs text-left text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-400">Beneficiary:</span>
                  <span className="font-bold text-slate-900">{activePassport.personName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Destination:</span>
                  <span className="font-medium text-emerald-800">{activePassport.referredToFacility}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Protocol Code:</span>
                  <span className="font-mono font-bold text-slate-800">{activePassport.protocolCode || 'NTEP-TB-RULE-01'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Clinical Reason:</span>
                  <span className="text-right max-w-[200px] font-medium text-slate-800 truncate">{activePassport.reason}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Issue Date:</span>
                  <span>{activePassport.date}</span>
                </div>
              </div>

              {/* Zero PII Privacy Notice */}
              <div className="p-2.5 bg-emerald-50/70 border border-emerald-200/60 rounded-xl text-[11px] text-emerald-950 text-left">
                <strong>Privacy Assurance:</strong> Zero PII (Personally Identifiable Information) is encoded inside the QR image. Only authorized health centre personnel can retrieve the medical record.
              </div>

              <div className="pt-1 flex gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText(activePassport.referralCode);
                    alert(`✓ Referral token ${activePassport.referralCode} copied to clipboard! Slip ready to issue.`);
                  }}
                  className="px-3 py-2.5 border border-slate-200 text-slate-700 font-bold text-xs rounded-xl hover:bg-slate-50 transition-colors flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Copy Slip</span>
                </button>

                <button
                  onClick={() => {
                    setShowPassportModal(false);
                    setActiveNav('Facility Desk');
                    setScanInputToken(activePassport.referralCode);
                    handleDeskValidation(activePassport.referralCode);
                  }}
                  className="flex-1 py-2.5 bg-purple-700 hover:bg-purple-800 text-white font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Test Facility Desk Check-In</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 4: FACILITY SCANNER MODAL */}
        {/* ============================================================== */}
        {showScannerModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-slate-950 text-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-800 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-white">
                    Facility Desk QR Scanner
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    District Hospital Pipra • Reception &amp; OPD
                  </p>
                </div>
                <button
                  onClick={() => setShowScannerModal(false)}
                  className="text-slate-400 hover:text-white p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={scanInputToken}
                  onChange={(e) => setScanInputToken(e.target.value)}
                  placeholder="Referral Code or UUID token..."
                  className="flex-1 bg-slate-900 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:border-emerald-500 focus:outline-hidden"
                />
                <button
                  onClick={() => handleDeskValidation(scanInputToken)}
                  disabled={isDeskLoading}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl text-xs font-bold transition-colors"
                >
                  {isDeskLoading ? 'Checking...' : 'Verify'}
                </button>
              </div>

              {deskActionMsg && (
                <p className="text-xs text-emerald-400 bg-emerald-950/70 border border-emerald-800 p-2.5 rounded-xl text-center font-bold">
                  {deskActionMsg}
                </p>
              )}

              {verifiedDeskReferral && (
                <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 space-y-3 text-xs">
                  <div className="flex justify-between items-center text-emerald-400 font-bold">
                    <span>✓ Token Authenticated</span>
                    <span className="font-mono text-[11px]">{verifiedDeskReferral.referralCode}</span>
                  </div>
                  <p><strong>Patient:</strong> {verifiedDeskReferral.personName}</p>
                  <p><strong>Reason:</strong> {verifiedDeskReferral.reason}</p>

                  <div className="pt-2 flex gap-2">
                    <button
                      onClick={() => handleDeskRecordEvent('REACHED')}
                      className="flex-1 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-white text-xs"
                    >
                      Record Arrival
                    </button>
                    <button
                      onClick={() => handleDeskRecordEvent('CONSULTED')}
                      className="flex-1 py-2 bg-purple-600 hover:bg-purple-500 rounded-xl font-bold text-white text-xs"
                    >
                      Record Consultation
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 5: PATIENT DETAIL MODAL */}
        {/* ============================================================== */}
        {showPatientDetailModal && (
          <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={showPatientDetailModal.avatarUrl || ASSETS.radhikaSharma}
                    alt={showPatientDetailModal.name}
                    className="w-12 h-12 rounded-full object-cover ring-2 ring-emerald-600/30"
                  />
                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {showPatientDetailModal.name}
                    </h4>
                    <p className="text-xs text-slate-500">
                      {showPatientDetailModal.age} yrs • {showPatientDetailModal.gender}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowPatientDetailModal(null)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <span className="font-semibold text-slate-700 block">Condition:</span>
                  <span className="text-slate-900 text-sm font-medium">
                    {showPatientDetailModal.condition}
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Village</span>
                    <span className="font-semibold text-slate-800">
                      {showPatientDetailModal.village || 'Pipra Tola'}
                    </span>
                  </div>
                  <div className="flex-1 p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-slate-500 block">Status</span>
                    <span className="font-semibold text-emerald-700">
                      {showPatientDetailModal.statusTag}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex gap-2">
                <button
                  onClick={() => {
                    const p = showPatientDetailModal;
                    setShowPatientDetailModal(null);
                    setRecordVisitPatient(p);
                    setTranscript(`विजिट: ${p.name} की स्वास्थ्य जांच।`);
                    setShowVoiceModal(true);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-xs transition-colors"
                >
                  Start Voice Visit
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* MODAL 5B: BENEFICIARY PAST RECORDS & CLINICAL HISTORY MODAL */}
        {/* ============================================================== */}
        {selectedInspectPatient && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedInspectPatient.avatarUrl || (selectedInspectPatient.name.includes('Kamal') ? ASSETS.kamalSingh : ASSETS.radhikaSharma)}
                    alt={selectedInspectPatient.name}
                    className={`w-13 h-13 rounded-full object-cover ring-2 ${
                      selectedInspectPatient.statusTag === 'High Priority' ? 'ring-rose-400' : 'ring-emerald-500/30'
                    }`}
                  />
                  <div>
                    <h3 className="text-base font-bold text-slate-900">
                      {selectedInspectPatient.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-medium">
                      {selectedInspectPatient.age} yrs • {selectedInspectPatient.gender} • {selectedInspectPatient.relationshipToHead || 'Beneficiary'}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedInspectPatient(null)}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Household & Village Affiliation */}
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Household Unit</span>
                  <span className="font-semibold text-slate-800 font-mono">
                    {selectedInspectPatient.householdId || 'HH-01'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Village Section</span>
                  <span className="font-semibold text-slate-800">
                    {selectedInspectPatient.village || 'Pipra Tola'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Registry Status</span>
                  <span className={`font-bold px-2 py-0.5 rounded-full text-[10px] ${
                    selectedInspectPatient.statusTag === 'High Priority'
                      ? 'bg-rose-100 text-rose-800'
                      : 'bg-emerald-100 text-emerald-800'
                  }`}>
                    {selectedInspectPatient.statusTag}
                  </span>
                </div>
              </div>

              {/* Vitals Summary Card */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Clinical Vitals &amp; Bio-Markers:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block">Blood Pressure</span>
                    <span className="text-xs font-bold text-slate-800">
                      {selectedInspectPatient.vitals?.bp || '118/76'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block">Weight</span>
                    <span className="text-xs font-bold text-slate-800">
                      {selectedInspectPatient.vitals?.weightKg ? `${selectedInspectPatient.vitals.weightKg} kg` : '54 kg'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block">Temperature</span>
                    <span className="text-xs font-bold text-slate-800">
                      {selectedInspectPatient.vitals?.tempF ? `${selectedInspectPatient.vitals.tempF}°F` : '98.6°F'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-center">
                    <span className="text-[10px] text-slate-400 block">Hemoglobin</span>
                    <span className="text-xs font-bold text-emerald-700">
                      {selectedInspectPatient.vitals?.hemoglobin ? `${selectedInspectPatient.vitals.hemoglobin} g/dL` : '10.8 g/dL'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Clinical Condition & Past Symptoms */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Primary Condition &amp; Reported Symptoms:
                </span>
                <div className="p-3 bg-emerald-50/50 border border-emerald-200/60 rounded-2xl text-xs space-y-1.5">
                  <div className="flex items-center gap-1.5 text-emerald-950 font-bold">
                    <Activity className="w-4 h-4 text-emerald-600" />
                    <span>{selectedInspectPatient.condition}</span>
                  </div>
                  {selectedInspectPatient.symptoms && selectedInspectPatient.symptoms.length > 0 && (
                    <div className="pt-1 flex flex-wrap gap-1">
                      {selectedInspectPatient.symptoms.map((s: string, idx: number) => (
                        <span
                          key={idx}
                          className="px-2 py-0.5 rounded-md bg-white border border-emerald-200 text-[11px] text-slate-700 font-medium"
                        >
                          • {s}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Past Visits Timeline */}
              <div className="space-y-2">
                <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider block">
                  Past Visit History &amp; Actions:
                </span>
                <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs space-y-2">
                  <div className="flex justify-between items-center text-slate-500 text-[11px]">
                    <span>Last Visit Recorded:</span>
                    <span className="font-semibold text-slate-800">
                      {selectedInspectPatient.lastVisit || '10 Oct 2026'}
                    </span>
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Doorstep screening conducted by ASHA Sunita Devi. Vitals logged in frontline register. Follow-up scheduled under community health surveillance guidelines.
                  </p>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="pt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const p = selectedInspectPatient;
                    setSelectedInspectPatient(null);
                    setRecordVisitPatient(p);
                    setTranscript(`विजिट: ${p.name} (${p.condition}) की स्वास्थ्य जांच।`);
                    setShowVoiceModal(true);
                  }}
                  className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                >
                  <Mic className="w-4 h-4" />
                  <span>Start Voice Visit</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    const p = selectedInspectPatient;
                    setSelectedInspectPatient(null);
                    setActivePassport({
                      id: `REF-${Date.now()}`,
                      referralCode: `ASHA${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 1000)}`,
                      patientName: p.name,
                      patientAge: p.age,
                      patientGender: p.gender,
                      referredTo: 'District Hospital',
                      date: '10 Oct 2026',
                      condition: p.condition,
                      symptoms: p.symptoms || [],
                      currentStep: 1,
                      steps: [
                        { title: 'Referral Generated', date: '10 Oct 2026', completed: true },
                        { title: 'Reached Health Centre', date: 'Pending', completed: false },
                        { title: 'Consultation Completed', date: 'Pending', completed: false },
                        { title: 'Follow Up Scheduled', date: 'Pending', completed: false },
                      ],
                    });
                    setShowPassportModal(true);
                  }}
                  className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <GitPullRequest className="w-4 h-4" />
                  <span>Referral</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSelectedInspectPatient(null)}
                  className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
        {/* ============================================================== */}
        {/* MODAL 6: AUTHENTICATION & CREDENTIAL VERIFICATION DIALOG */}
        {/* ============================================================== */}
        {showLoginModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                    <ShieldAlert className="w-5 h-5 text-emerald-800" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Sign In &amp; Verify Credentials
                    </h3>
                    <p className="text-[11px] text-slate-500">
                      Secure Role-Based Access for Frontline Health Registry
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLoginModal(false)}
                  className="text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Demo Accounts Quick-Select */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-600 block">
                  Select Demo Credentials:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('sunita.devi@asha.gov.in');
                      setLoginPassword('asha123');
                      setLoginRole('ASHA_WORKER');
                      setLoginError(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      loginRole === 'ASHA_WORKER'
                        ? 'bg-emerald-50 border-emerald-600 ring-1 ring-emerald-600/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">Sunita Devi</p>
                    <p className="text-[10px] text-slate-500">ASHA Worker</p>
                    <p className="text-[9px] font-mono text-emerald-700 mt-1">pw: asha123</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLoginEmail('dr.verma@district-hospital.gov.in');
                      setLoginPassword('doctor123');
                      setLoginRole('HEALTH_FACILITY_OFFICER');
                      setLoginError(null);
                    }}
                    className={`p-2.5 rounded-xl border text-left transition-all ${
                      loginRole === 'HEALTH_FACILITY_OFFICER'
                        ? 'bg-purple-50 border-purple-600 ring-1 ring-purple-600/30'
                        : 'bg-slate-50 border-slate-200 hover:bg-white'
                    }`}
                  >
                    <p className="text-xs font-bold text-slate-900">Dr. A. K. Verma</p>
                    <p className="text-[10px] text-slate-500">Facility Officer</p>
                    <p className="text-[9px] font-mono text-purple-700 mt-1">pw: doctor123</p>
                  </button>
                </div>
              </div>

              <form onSubmit={handlePerformLogin} className="space-y-3 pt-1">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Official Email / User ID:
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="e.g. sunita.devi@asha.gov.in"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">
                    Password (Genuinely Verified via PBKDF2/SHA-512):
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="Enter password..."
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3.5 py-2 text-xs text-slate-900 focus:bg-white focus:outline-hidden focus:border-emerald-600 font-medium"
                      required
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 font-medium flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="pt-2 flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="flex-1 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs rounded-xl shadow-xs transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoggingIn ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin text-white" />
                        <span>Verifying credentials...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-3.5 h-3.5" />
                        <span>Verify &amp; Sign In</span>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => setShowLoginModal(false)}
                    className="px-4 py-2.5 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                </div>
              </form>

              <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-xl text-[10px] text-slate-500 text-center">
                Security: Passwords are salt-hashed and checked by the backend authentication engine.
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
