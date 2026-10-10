import { ActivityItem, Patient, ReferralData } from '../types';

import ashaWorkerVillageImg from '../assets/images/asha_worker_village_1791618945368.jpg';
import kamalSinghImg from '../assets/images/kamal_singh_avatar_1791619004845.jpg';
import radhikaSharmaImg from '../assets/images/radhika_sharma_avatar_1791619032460.jpg';
import sunitaDeviImg from '../assets/images/sunita_devi_portrait_1791618961775.jpg';

export const ASSETS = {
  villageWorker: ashaWorkerVillageImg,
  sunitaDevi: sunitaDeviImg,
  kamalSingh: kamalSinghImg,
  radhikaSharma: radhikaSharmaImg,
};

export const CURRENT_USER = {
  name: 'Sunita Devi',
  role: 'ASHA Worker',
  id: 'ASHA-UP-2041',
  block: 'Pipra Block',
  subCentre: 'Pipra Sub-Centre',
  phc: 'Primary Health Centre Pipra',
  district: 'Gorakhpur, Uttar Pradesh',
  avatar: sunitaDeviImg,
  status: 'Online',
  offlineStorageUsed: '12 MB',
  totalHouseholds: 148,
  todayHouseholds: 12,
  pendingReferrals: 3,
  completedVisits: 8,
  highPriorityCases: 2,
};

export const MOCK_PATIENTS: Patient[] = [
  {
    id: 'P01',
    name: 'Radhika Sharma',
    age: 24,
    gender: 'Female',
    condition: 'Pregnant (2nd Trimester)',
    lastVisit: '2 months ago',
    statusTag: 'Follow Up',
    category: 'Pregnant',
    symptoms: ['Mild fatigue', 'Normal blood pressure (115/75)'],
    village: 'Pipra Tola',
    phone: '+91 98391 24510',
    avatarUrl: radhikaSharmaImg,
  },
  {
    id: 'P02',
    name: 'Savitri Bai',
    age: 28,
    gender: 'Female',
    condition: 'Child (1-2 years) • Vaccination due',
    lastVisit: '1 month ago',
    statusTag: 'Routine',
    category: 'Children',
    symptoms: ['Pentavalent 3 Due', 'Weight: 9.8 kg'],
    village: 'Bishanpur',
    phone: '+91 94520 89134',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'P03',
    name: 'Kamal Singh',
    age: 42,
    gender: 'Male',
    condition: 'TB Suspect',
    lastVisit: '5 days ago',
    statusTag: 'High Priority',
    category: 'High Risk',
    symptoms: ['Persistent cough (>2 weeks)', 'Weight loss', 'Night sweats'],
    village: 'Pipra Purwa',
    phone: '+91 97214 55678',
    avatarUrl: kamalSinghImg,
  },
  {
    id: 'P04',
    name: 'Pooja Verma',
    age: 22,
    gender: 'Female',
    condition: 'Postnatal Care',
    lastVisit: '1 week ago',
    statusTag: 'Routine',
    category: 'Pregnant',
    symptoms: ['Postpartum Day 14 checkup', 'Infant breastfeeding well'],
    village: 'Kalyanpur',
    phone: '+91 91612 33490',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80',
  },
  {
    id: 'P05',
    name: 'Meena Patel',
    age: 52,
    gender: 'Female',
    condition: 'Hypertension',
    lastVisit: '3 weeks ago',
    statusTag: 'Routine',
    category: 'High Risk',
    symptoms: ['BP 142/90', 'Regular amlodipine 5mg intake'],
    village: 'Pipra Tola',
    phone: '+91 99182 45781',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&q=80',
  },
];

export const MOCK_ACTIVITIES: ActivityItem[] = [
  {
    id: 'A01',
    type: 'visit',
    title: 'Visit record added',
    subtitle: 'Radhika Sharma • 10:24 AM',
    timestamp: '10:24 AM',
    patientName: 'Radhika Sharma',
  },
  {
    id: 'A02',
    type: 'referral',
    title: 'Referral generated',
    subtitle: 'Kamal Singh • 09:12 AM',
    timestamp: '09:12 AM',
    patientName: 'Kamal Singh',
  },
  {
    id: 'A03',
    type: 'followup',
    title: 'Follow-up completed',
    subtitle: 'Savitri Bai • Yesterday',
    timestamp: 'Yesterday',
    patientName: 'Savitri Bai',
  },
  {
    id: 'A04',
    type: 'message',
    title: 'New message from PHC',
    subtitle: 'Health Centre • Yesterday',
    timestamp: 'Yesterday',
  },
];

export const MOCK_SAVITA_SUMMARY = {
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
};

export const MOCK_KAMAL_REFERRAL: ReferralData = {
  id: 'REF-20261010-0042',
  referralId: 'ASHA20261010-0042',
  patientName: 'Kamal Singh',
  patientAge: 42,
  patientGender: 'Male',
  referredTo: 'District Hospital',
  date: '10 Oct 2026',
  condition: 'TB Suspect',
  symptoms: [
    'Persistent cough (>2 weeks)',
    'Weight loss',
    'Night sweats',
  ],
  currentStep: 3,
  steps: [
    {
      title: 'Referral Generated',
      date: '10 Oct 2026, 09:12 AM',
      completed: true,
    },
    {
      title: 'Reached Health Centre',
      date: '10 Oct 2026, 02:18 PM',
      completed: true,
    },
    {
      title: 'Consultation Completed',
      date: '10 Oct 2026, 04:05 PM',
      completed: true,
    },
    {
      title: 'Follow Up Scheduled',
      date: '24 Oct 2026',
      completed: false,
    },
  ],
};
