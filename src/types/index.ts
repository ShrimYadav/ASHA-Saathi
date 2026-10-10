export type PatientPriority = 'Routine' | 'Follow Up' | 'High Priority';

export interface Patient {
  id: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  condition: string;
  lastVisit: string;
  statusTag: PatientPriority;
  category: 'Pregnant' | 'Children' | 'High Risk' | 'General';
  symptoms?: string[];
  phone?: string;
  village?: string;
  notes?: string;
  avatarUrl?: string;
}

export interface ActivityItem {
  id: string;
  type: 'visit' | 'referral' | 'followup' | 'message';
  title: string;
  subtitle: string;
  timestamp: string;
  patientName?: string;
}

export interface ReferralData {
  id: string;
  patientName: string;
  patientAge: number;
  patientGender: string;
  referralId: string;
  referredTo: string;
  date: string;
  condition: string;
  symptoms: string[];
  currentStep: number; // 1 to 4
  steps: {
    title: string;
    date: string;
    completed: boolean;
  }[];
}

export type DialectOption = 'Hindi (हिन्दी)' | 'Bhojpuri' | 'Bundeli' | 'Marathi' | 'Rajasthani';

export type MobileScreenId =
  | 'splash'
  | 'login'
  | 'home'
  | 'voice-record'
  | 'visit-summary'
  | 'risk-alert'
  | 'referral-passport'
  | 'referral-tracking'
  | 'patient-list'
  | 'qr-scan'
  | 'settings'
  | 'offline-sheet'
  | 'dialect-sheet'
  | 'trust-sheet';

export type AppViewMode = 'poster' | 'desktop' | 'mobile-sim';
