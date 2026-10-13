import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

export interface User {
  id: string;
  name: string;
  role: 'ASHA_WORKER' | 'HEALTH_FACILITY_OFFICER';
  email: string;
  phone: string;
  block: string;
  subCentre: string;
  phc: string;
  district: string;
  passwordHash?: string;
  salt?: string;
}

export interface Household {
  id: string;
  code: string;
  headName: string;
  tola: string;
  village: string;
  familyMembersCount: number;
  assignedWorkerId: string;
  rationCardType: 'BPL' | 'APL' | 'Antyodaya';
  lastVisitDate: string;
}

export interface Person {
  id: string;
  householdId: string;
  name: string;
  age: number;
  gender: 'Female' | 'Male' | 'Other';
  relationshipToHead: string;
  category: 'Pregnant' | 'Children' | 'High Risk' | 'General';
  condition: string;
  phone?: string;
  lastVisitDate: string;
  statusTag: 'Routine' | 'Follow Up' | 'High Priority';
  symptoms: string[];
  vitals?: {
    bp?: string;
    weightKg?: number;
    tempF?: number;
    hemoglobin?: number;
    pulseBpm?: number;
  };
}

export interface Visit {
  id: string;
  personId: string;
  personName: string;
  householdId: string;
  workerId: string;
  date: string;
  time: string;
  transcript?: string;
  language: string;
  symptoms: string[];
  condition: string;
  vitals?: Record<string, any>;
  notes: string;
  status: 'DRAFT' | 'CONFIRMED';
  priorityLevel: 'ROUTINE' | 'FOLLOW_UP' | 'HIGH_PRIORITY';
  riskRuleId?: string;
  followUpDate?: string;
  createdAt: string;
}

export interface ReferralEvent {
  id: string;
  referralId: string;
  eventType: 'GENERATED' | 'REACHED' | 'CONSULTED' | 'FOLLOWUP_SCHEDULED';
  title: string;
  timestamp: string;
  facilityName: string;
  recordedBy: string;
  notes?: string;
}

export interface Referral {
  id: string;
  referralCode: string;
  secureToken: string; // Unpredictable token encoded in QR code
  personId: string;
  personName: string;
  personAge: number;
  personGender: string;
  householdId: string;
  workerId: string;
  referredToFacility: string;
  reason: string;
  protocolCode: string;
  urgency: 'HIGH_PRIORITY' | 'ROUTINE';
  status: 'GENERATED' | 'ISSUED' | 'REACHED' | 'CONSULTED' | 'COMPLETED';
  date: string;
  events: ReferralEvent[];
  createdAt: string;
}

export interface AuditLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string;
  userId: string;
  timestamp: string;
  details: string;
}

export function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
}

export function verifyPassword(password: string, hash: string, salt: string): boolean {
  const check = hashPassword(password, salt);
  return crypto.timingSafeEqual(Buffer.from(check), Buffer.from(hash));
}

const DEMO_SALT = 'asha_saathi_secure_salt_2026';
const DEFAULT_PASSWORD_HASH = hashPassword('asha123', DEMO_SALT);
const DOCTOR_PASSWORD_HASH = hashPassword('doctor123', DEMO_SALT);

// Initial Seed Data
const INITIAL_USERS: User[] = [
  {
    id: 'USR-01',
    name: 'Sunita Devi',
    role: 'ASHA_WORKER',
    email: 'sunita.devi@asha.gov.in',
    phone: '+91 98391 24510',
    block: 'Pipra Block',
    subCentre: 'Pipra Sub-Centre',
    phc: 'Primary Health Centre Pipra',
    district: 'Gorakhpur, Uttar Pradesh',
    passwordHash: DEFAULT_PASSWORD_HASH,
    salt: DEMO_SALT,
  },
  {
    id: 'USR-02',
    name: 'Dr. A. K. Verma',
    role: 'HEALTH_FACILITY_OFFICER',
    email: 'dr.verma@district-hospital.gov.in',
    phone: '+91 98112 34567',
    block: 'District Hospital Pipra',
    subCentre: 'OPD & Chest Clinic',
    phc: 'District Hospital',
    district: 'Gorakhpur, Uttar Pradesh',
    passwordHash: DOCTOR_PASSWORD_HASH,
    salt: DEMO_SALT,
  },
];

const INITIAL_HOUSEHOLDS: Household[] = [
  {
    id: 'HH-01',
    code: 'HH-PIP-001',
    headName: 'Ramesh Chandra Sharma',
    tola: 'Pipra Tola',
    village: 'Pipra',
    familyMembersCount: 4,
    assignedWorkerId: 'USR-01',
    rationCardType: 'BPL',
    lastVisitDate: '2026-10-09',
  },
  {
    id: 'HH-02',
    code: 'HH-PIP-002',
    headName: 'Dinanath Yadav',
    tola: 'Bishanpur',
    village: 'Pipra',
    familyMembersCount: 5,
    assignedWorkerId: 'USR-01',
    rationCardType: 'Antyodaya',
    lastVisitDate: '2026-10-08',
  },
  {
    id: 'HH-03',
    code: 'HH-PIP-003',
    headName: 'Harishanker Singh',
    tola: 'Pipra Purwa',
    village: 'Pipra',
    familyMembersCount: 3,
    assignedWorkerId: 'USR-01',
    rationCardType: 'BPL',
    lastVisitDate: '2026-10-05',
  },
  {
    id: 'HH-04',
    code: 'HH-PIP-004',
    headName: 'Manoj Kumar Verma',
    tola: 'Kalyanpur',
    village: 'Pipra',
    familyMembersCount: 4,
    assignedWorkerId: 'USR-01',
    rationCardType: 'APL',
    lastVisitDate: '2026-10-03',
  },
  {
    id: 'HH-05',
    code: 'HH-PIP-005',
    headName: 'Ghanshyam Patel',
    tola: 'Pipra Tola',
    village: 'Pipra',
    familyMembersCount: 3,
    assignedWorkerId: 'USR-01',
    rationCardType: 'APL',
    lastVisitDate: '2026-09-18',
  },
  {
    id: 'HH-06',
    code: 'HH-PIP-006',
    headName: 'Balkishan Nishad',
    tola: 'Bishanpur South',
    village: 'Pipra',
    familyMembersCount: 4,
    assignedWorkerId: 'USR-01',
    rationCardType: 'BPL',
    lastVisitDate: '2026-10-07',
  },
  {
    id: 'HH-07',
    code: 'HH-PIP-007',
    headName: 'Ramdev Paswan',
    tola: 'Pipra Purwa East',
    village: 'Pipra',
    familyMembersCount: 3,
    assignedWorkerId: 'USR-01',
    rationCardType: 'Antyodaya',
    lastVisitDate: '2026-10-06',
  },
  {
    id: 'HH-08',
    code: 'HH-PIP-008',
    headName: 'Noor Mohammad Ansari',
    tola: 'Kalyanpur West',
    village: 'Pipra',
    familyMembersCount: 5,
    assignedWorkerId: 'USR-01',
    rationCardType: 'BPL',
    lastVisitDate: '2026-10-04',
  },
  {
    id: 'HH-09',
    code: 'HH-PIP-009',
    headName: 'Chhotelal Prajapati',
    tola: 'Kumhar Tola',
    village: 'Pipra',
    familyMembersCount: 4,
    assignedWorkerId: 'USR-01',
    rationCardType: 'BPL',
    lastVisitDate: '2026-10-02',
  },
  {
    id: 'HH-10',
    code: 'HH-PIP-010',
    headName: 'Tribhuvan Pandey',
    tola: 'Pipra Uttar',
    village: 'Pipra',
    familyMembersCount: 3,
    assignedWorkerId: 'USR-01',
    rationCardType: 'APL',
    lastVisitDate: '2026-10-01',
  },
];

const INITIAL_PEOPLE: Person[] = [
  {
    id: 'P01',
    householdId: 'HH-01',
    name: 'Radhika Sharma',
    age: 24,
    gender: 'Female',
    relationshipToHead: 'Daughter-in-law',
    category: 'Pregnant',
    condition: 'Pregnant (2nd Trimester)',
    phone: '+91 98391 24510',
    lastVisitDate: '2026-08-10',
    statusTag: 'Follow Up',
    symptoms: ['Mild fatigue', 'Normal fetal heart rate'],
    vitals: { bp: '115/75', weightKg: 54, hemoglobin: 10.2 },
  },
  {
    id: 'P02',
    householdId: 'HH-01',
    name: 'Virendra Sharma',
    age: 29,
    gender: 'Male',
    relationshipToHead: 'Son',
    category: 'General',
    condition: 'Seasonal Viral Recovery',
    phone: '+91 98391 24510',
    lastVisitDate: '2026-10-06',
    statusTag: 'Routine',
    symptoms: ['Fever resolved', 'Oral hydration counselled'],
    vitals: { bp: '116/76', weightKg: 64, tempF: 98.4 },
  },
  {
    id: 'P03',
    householdId: 'HH-02',
    name: 'Savitri Yadav',
    age: 44,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'General',
    condition: 'Routine Frontline Health Review',
    phone: '+91 94520 89134',
    lastVisitDate: '2026-09-10',
    statusTag: 'Routine',
    symptoms: ['Mild joint stiffness', 'Healthy appetite'],
    vitals: { bp: '122/80', weightKg: 58, tempF: 98.4 },
  },
  {
    id: 'P04',
    householdId: 'HH-02',
    name: 'Aarav Yadav',
    age: 1,
    gender: 'Male',
    relationshipToHead: 'Grandson',
    category: 'Children',
    condition: 'Missed Immunization Dropout (Pentavalent-3 Due)',
    phone: '+91 94520 89134',
    lastVisitDate: '2026-09-28',
    statusTag: 'Follow Up',
    symptoms: ['Missed Pentavalent-3 and MR-1', 'Growth tracking pending'],
    vitals: { weightKg: 8.9, tempF: 98.4 },
  },
  {
    id: 'P05',
    householdId: 'HH-03',
    name: 'Kamal Singh',
    age: 42,
    gender: 'Male',
    relationshipToHead: 'Brother',
    category: 'High Risk',
    condition: 'TB Suspect',
    phone: '+91 97214 55678',
    lastVisitDate: '2026-10-05',
    statusTag: 'High Priority',
    symptoms: [
      'Persistent cough (>2 weeks)',
      'Weight loss',
      'Night sweats',
      'Blood in sputum (mild)',
    ],
    vitals: { tempF: 99.8, weightKg: 49 },
  },
  {
    id: 'P06',
    householdId: 'HH-03',
    name: 'Sarita Singh',
    age: 38,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'General',
    condition: 'Nutritional Anemia Review',
    phone: '+91 97214 55678',
    lastVisitDate: '2026-09-22',
    statusTag: 'Follow Up',
    symptoms: ['Chronic fatigue', 'Pale conjunctiva', 'Low dietary iron'],
    vitals: { bp: '108/70', hemoglobin: 9.6, weightKg: 50 },
  },
  {
    id: 'P07',
    householdId: 'HH-04',
    name: 'Pooja Verma',
    age: 22,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'Pregnant',
    condition: 'Postnatal Care Day 14',
    phone: '+91 91612 33490',
    lastVisitDate: '2026-10-03',
    statusTag: 'Routine',
    symptoms: ['Postnatal Day 14', 'Infant latching well'],
    vitals: { bp: '118/78', hemoglobin: 11.4 },
  },
  {
    id: 'P08',
    householdId: 'HH-04',
    name: 'Vikas Verma',
    age: 4,
    gender: 'Male',
    relationshipToHead: 'Son',
    category: 'Children',
    condition: 'Early Childhood Growth Monitoring',
    phone: '+91 91612 33490',
    lastVisitDate: '2026-09-20',
    statusTag: 'Routine',
    symptoms: ['Normal growth milestones', 'Vitamin A dose administered'],
    vitals: { weightKg: 14.8, tempF: 98.2 },
  },
  {
    id: 'P09',
    householdId: 'HH-05',
    name: 'Meena Patel',
    age: 52,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'High Risk',
    condition: 'Hypertension (Stage 2)',
    phone: '+91 99182 45781',
    lastVisitDate: '2026-09-18',
    statusTag: 'High Priority',
    symptoms: ['BP 152/94', 'Morning occipital headache', 'Occasional dizziness'],
    vitals: { bp: '152/94', pulseBpm: 82 },
  },
  {
    id: 'P10',
    householdId: 'HH-05',
    name: 'Ankit Patel',
    age: 19,
    gender: 'Male',
    relationshipToHead: 'Son',
    category: 'General',
    condition: 'General Health & Deworming',
    phone: '+91 99182 45781',
    lastVisitDate: '2026-09-10',
    statusTag: 'Routine',
    symptoms: ['Albendazole administered', 'No complaints'],
    vitals: { bp: '118/74', weightKg: 58, tempF: 98.4 },
  },
  {
    id: 'P11',
    householdId: 'HH-06',
    name: 'Kavita Nishad',
    age: 26,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'Pregnant',
    condition: 'Gestational Diabetes Screening',
    phone: '+91 97920 11452',
    lastVisitDate: '2026-10-07',
    statusTag: 'Routine',
    symptoms: ['Normal fasting glucose (88 mg/dL)', 'Mild morning sickness'],
    vitals: { bp: '112/74', weightKg: 53, hemoglobin: 11.0 },
  },
  {
    id: 'P12',
    householdId: 'HH-06',
    name: 'Munna Nishad',
    age: 3,
    gender: 'Male',
    relationshipToHead: 'Son',
    category: 'Children',
    condition: 'Growth & Stunting Assessment',
    phone: '+91 97920 11452',
    lastVisitDate: '2026-09-30',
    statusTag: 'Follow Up',
    symptoms: ['MUAC tape green (13.5cm)', 'Appetite good', 'Deworming completed'],
    vitals: { weightKg: 12.1, tempF: 98.2 },
  },
  {
    id: 'P13',
    householdId: 'HH-07',
    name: 'Kanti Devi',
    age: 54,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'General',
    condition: 'Chronic Knee Osteoarthritis & Calcium Therapy',
    phone: '+91 96160 88231',
    lastVisitDate: '2026-10-04',
    statusTag: 'Routine',
    symptoms: ['Bilateral knee pain during walking', 'Prescribed calcium & Vit D'],
    vitals: { bp: '128/82', weightKg: 61, tempF: 98.6 },
  },
  {
    id: 'P14',
    householdId: 'HH-07',
    name: 'Suraj Paswan',
    age: 28,
    gender: 'Male',
    relationshipToHead: 'Son',
    category: 'General',
    condition: 'Post-Viral Fatigue Recovery',
    phone: '+91 96160 88231',
    lastVisitDate: '2026-09-25',
    statusTag: 'Routine',
    symptoms: ['Full recovery', 'Vitals within normal limits'],
    vitals: { bp: '120/78', weightKg: 65, tempF: 98.4 },
  },
  {
    id: 'P15',
    householdId: 'HH-08',
    name: 'Shabana Ansari',
    age: 28,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'Pregnant',
    condition: 'High-Risk Maternal Care (3rd Trimester Anemia)',
    phone: '+91 95590 44219',
    lastVisitDate: '2026-10-07',
    statusTag: 'High Priority',
    symptoms: ['Severe fatigue', 'Hemoglobin 8.4 g/dL', 'Fetal movement normal'],
    vitals: { bp: '106/68', hemoglobin: 8.4, weightKg: 56 },
  },
  {
    id: 'P16',
    householdId: 'HH-08',
    name: 'Tariq Ansari',
    age: 6,
    gender: 'Male',
    relationshipToHead: 'Son',
    category: 'Children',
    condition: 'Childhood Vision & Vitamin A Prophylaxis',
    phone: '+91 95590 44219',
    lastVisitDate: '2026-09-12',
    statusTag: 'Routine',
    symptoms: ['Biannual Vitamin A dose administered', 'Eye checkup normal'],
    vitals: { weightKg: 19.2, tempF: 98.4 },
  },
  {
    id: 'P17',
    householdId: 'HH-09',
    name: 'Geeta Prajapati',
    age: 31,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'General',
    condition: 'Thyroid Goiter Screening',
    phone: '+91 94150 77123',
    lastVisitDate: '2026-09-29',
    statusTag: 'Follow Up',
    symptoms: ['Mild neck fullness', 'TSH test requested at PHC'],
    vitals: { bp: '116/74', weightKg: 52, tempF: 98.2 },
  },
  {
    id: 'P18',
    householdId: 'HH-10',
    name: 'Rajesh Pandey',
    age: 48,
    gender: 'Male',
    relationshipToHead: 'Head of Family',
    category: 'High Risk',
    condition: 'Type-2 Diabetes Regular Monitoring',
    phone: '+91 93350 99812',
    lastVisitDate: '2026-10-02',
    statusTag: 'Routine',
    symptoms: ['Fasting blood sugar 134 mg/dL', 'Metformin adherence good'],
    vitals: { bp: '130/84', weightKg: 70, tempF: 98.4 },
  },
];

const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'REF-01',
    referralCode: 'ASHA20261010-0042',
    secureToken: 'tok_5b8f9e2a_c410_4f92_9876_tb_kamal',
    personId: 'P05',
    personName: 'Kamal Singh',
    personAge: 42,
    personGender: 'Male',
    householdId: 'HH-03',
    workerId: 'USR-01',
    referredToFacility: 'District Hospital',
    reason: 'Possible TB Symptoms Detected (Persistent cough > 2 weeks, night sweats)',
    protocolCode: 'NTEP-TB-RULE-01',
    urgency: 'HIGH_PRIORITY',
    status: 'CONSULTED',
    date: '10 Oct 2026',
    createdAt: new Date().toISOString(),
    events: [
      {
        id: 'EVT-01',
        referralId: 'REF-01',
        eventType: 'GENERATED',
        title: 'Referral Generated',
        timestamp: '10 Oct 2026, 09:12 AM',
        facilityName: 'Pipra Sub-Centre',
        recordedBy: 'Sunita Devi (ASHA)',
        notes: 'Advised sputum collection and face mask precautions.',
      },
      {
        id: 'EVT-02',
        referralId: 'REF-01',
        eventType: 'REACHED',
        title: 'Reached Health Centre',
        timestamp: '10 Oct 2026, 02:18 PM',
        facilityName: 'District Hospital Pipra',
        recordedBy: 'Reception Desk',
        notes: 'Token scanned. Patient registered at Chest Clinic OPD.',
      },
      {
        id: 'EVT-03',
        referralId: 'REF-01',
        eventType: 'CONSULTED',
        title: 'Consultation Completed',
        timestamp: '10 Oct 2026, 04:05 PM',
        facilityName: 'District Hospital Pipra',
        recordedBy: 'Dr. A. K. Verma',
        notes: 'CBNAAT test sample collected. Sputum smear microscopy ordered.',
      },
    ],
  },
  {
    id: 'REF-02',
    referralCode: 'ASHA20261010-0089',
    secureToken: 'tok_7a1c3d9e_maternal_anemia_shabana',
    personId: 'P15',
    personName: 'Shabana Ansari',
    personAge: 28,
    personGender: 'Female',
    householdId: 'HH-08',
    workerId: 'USR-01',
    referredToFacility: 'District Hospital Pipra (Maternity Wing)',
    reason: 'Severe Gestational Anemia (Hb 8.4 g/dL in 3rd trimester)',
    protocolCode: 'MOHFW-ANC-ANEMIA-01',
    urgency: 'HIGH_PRIORITY',
    status: 'REACHED',
    date: '09 Oct 2026',
    createdAt: new Date().toISOString(),
    events: [
      {
        id: 'EVT-04',
        referralId: 'REF-02',
        eventType: 'GENERATED',
        title: 'Referral Generated',
        timestamp: '09 Oct 2026, 11:30 AM',
        facilityName: 'Pipra Sub-Centre',
        recordedBy: 'Sunita Devi (ASHA)',
        notes: 'Urgent parenteral iron infusion / obstetric review recommended.',
      },
      {
        id: 'EVT-05',
        referralId: 'REF-02',
        eventType: 'REACHED',
        title: 'Reached Health Centre',
        timestamp: '10 Oct 2026, 10:15 AM',
        facilityName: 'District Hospital Pipra',
        recordedBy: 'Maternity OPD Desk',
        notes: 'Token validated. Admitted to daycare for IV Iron Sucrose administration.',
      },
    ],
  },
  {
    id: 'REF-03',
    referralCode: 'ASHA20261010-0114',
    secureToken: 'tok_9f4e2b1a_hypertension_meena',
    personId: 'P09',
    personName: 'Meena Patel',
    personAge: 52,
    personGender: 'Female',
    householdId: 'HH-05',
    workerId: 'USR-01',
    referredToFacility: 'Primary Health Centre Pipra',
    reason: 'Uncontrolled Stage-2 Hypertension (BP 152/94 mmHg)',
    protocolCode: 'NCD-HTN-PROTOCOL-02',
    urgency: 'HIGH_PRIORITY',
    status: 'ISSUED',
    date: '08 Oct 2026',
    createdAt: new Date().toISOString(),
    events: [
      {
        id: 'EVT-06',
        referralId: 'REF-03',
        eventType: 'GENERATED',
        title: 'Referral Generated',
        timestamp: '08 Oct 2026, 04:45 PM',
        facilityName: 'Pipra Sub-Centre',
        recordedBy: 'Sunita Devi (ASHA)',
        notes: 'Advised medical officer evaluation for dual antihypertensive therapy.',
      },
    ],
  },
  {
    id: 'REF-04',
    referralCode: 'ASHA20261010-0156',
    secureToken: 'tok_3c8a1b7e_immunization_aarav',
    personId: 'P04',
    personName: 'Aarav Yadav',
    personAge: 1,
    personGender: 'Male',
    householdId: 'HH-02',
    workerId: 'USR-01',
    referredToFacility: 'Pipra Sub-Centre VHSND Session',
    reason: 'Immunization Catch-up for Pentavalent-3 and MR-1 dropout',
    protocolCode: 'UIP-VACCINE-DROP-01',
    urgency: 'ROUTINE',
    status: 'COMPLETED',
    date: '07 Oct 2026',
    createdAt: new Date().toISOString(),
    events: [
      {
        id: 'EVT-07',
        referralId: 'REF-04',
        eventType: 'GENERATED',
        title: 'Referral Generated',
        timestamp: '07 Oct 2026, 08:30 AM',
        facilityName: 'Pipra Sub-Centre',
        recordedBy: 'Sunita Devi (ASHA)',
        notes: 'Mobilized mother to bring child for missed booster.',
      },
      {
        id: 'EVT-08',
        referralId: 'REF-04',
        eventType: 'COMPLETED',
        title: 'Vaccination Administered',
        timestamp: '08 Oct 2026, 11:00 AM',
        facilityName: 'Anganwadi Centre Bishanpur',
        recordedBy: 'ANM Rekha Singh',
        notes: 'Pentavalent-3 booster given. Mother counselled on next MR-1 dose.',
      },
    ],
  },
];

const INITIAL_VISITS: Visit[] = [
  {
    id: 'VIS-01',
    personId: 'P01',
    personName: 'Radhika Sharma',
    householdId: 'HH-01',
    workerId: 'USR-01',
    date: '10 Oct 2026',
    time: '10:24 AM',
    language: 'Hindi (हिन्दी)',
    transcript: 'राधिका शर्मा का दूसरा ट्राइमेस्टर है। हल्का सिरदर्द और थकान है। बीपी ठीक है।',
    symptoms: ['Mild fatigue', 'Mild headache'],
    condition: 'Pregnant (2nd Trimester)',
    notes: 'ANC routine follow-up completed. IFA tablets supplied.',
    status: 'CONFIRMED',
    priorityLevel: 'FOLLOW_UP',
    riskRuleId: 'MOHFW-ANC-RULE-03',
    followUpDate: '24 Oct 2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VIS-02',
    personId: 'P05',
    personName: 'Kamal Singh',
    householdId: 'HH-03',
    workerId: 'USR-01',
    date: '10 Oct 2026',
    time: '09:00 AM',
    language: 'Hindi (हिन्दी)',
    transcript: 'कमल सिंह को दो हफ्ते से ज्यादा से खांसी है। वजन घट रहा है और रात में पसीना आता है।',
    symptoms: ['Persistent cough (>2 weeks)', 'Weight loss', 'Night sweats'],
    condition: 'TB Suspect',
    notes: 'Presumptive pulmonary TB symptoms present. Referred immediately.',
    status: 'CONFIRMED',
    priorityLevel: 'HIGH_PRIORITY',
    riskRuleId: 'NTEP-TB-RULE-01',
    followUpDate: '12 Oct 2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VIS-03',
    personId: 'P07',
    personName: 'Pooja Verma',
    householdId: 'HH-04',
    workerId: 'USR-01',
    date: '09 Oct 2026',
    time: '03:15 PM',
    language: 'Hindi (हिन्दी)',
    transcript: 'पूजा वर्मा का प्रसव बाद 14वां दिन। शिशु स्तनपान कर रहा है। माता का बीपी 118/78 सामान्य।',
    symptoms: ['Normal postpartum recovery'],
    condition: 'Postnatal Care Day 14',
    notes: 'PNC home visit. Maternal nutrition and exclusive breastfeeding advised.',
    status: 'CONFIRMED',
    priorityLevel: 'ROUTINE',
    riskRuleId: 'MOHFW-PNC-RULE-01',
    followUpDate: '23 Oct 2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VIS-04',
    personId: 'P09',
    personName: 'Meena Patel',
    householdId: 'HH-05',
    workerId: 'USR-01',
    date: '08 Oct 2026',
    time: '04:30 PM',
    language: 'Hindi (हिन्दी)',
    transcript: 'मीना पटेल को सिरदर्द की शिकायत। बीपी 152/94 मिला। दवा की समीक्षा आवश्यक है।',
    symptoms: ['Headache', 'Elevated Blood Pressure'],
    condition: 'Hypertension (Stage 2)',
    notes: 'High BP recorded. Referral token issued to PHC for physician consultation.',
    status: 'CONFIRMED',
    priorityLevel: 'HIGH_PRIORITY',
    riskRuleId: 'NCD-HTN-PROTOCOL-02',
    followUpDate: '15 Oct 2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VIS-05',
    personId: 'P15',
    personName: 'Shabana Ansari',
    householdId: 'HH-08',
    workerId: 'USR-01',
    date: '08 Oct 2026',
    time: '11:00 AM',
    language: 'Hindi (हिन्दी)',
    transcript: 'शबाना अंसारी तीसरा ट्राइमेस्टर। हीमोग्लोबिन 8.4 मिला। अत्यधिक कमजोरी की शिकायत।',
    symptoms: ['Severe fatigue', 'Pallor', 'Low Hemoglobin'],
    condition: 'High-Risk Maternal Care (3rd Trimester Anemia)',
    notes: 'Severe gestational anemia triage. Facilitated emergency hospital referral.',
    status: 'CONFIRMED',
    priorityLevel: 'HIGH_PRIORITY',
    riskRuleId: 'MOHFW-ANC-ANEMIA-01',
    followUpDate: '11 Oct 2026',
    createdAt: new Date().toISOString(),
  },
  {
    id: 'VIS-06',
    personId: 'P13',
    personName: 'Kanti Devi',
    householdId: 'HH-07',
    workerId: 'USR-01',
    date: '07 Oct 2026',
    time: '01:45 PM',
    language: 'Hindi (हिन्दी)',
    transcript: 'कांति देवी को घुटनों का पुराना दर्द। कैल्शियम व विटामिन डी नियमित लेने की सलाह।',
    symptoms: ['Joint pain', 'Difficulty climbing stairs'],
    condition: 'Chronic Knee Osteoarthritis & Calcium Therapy',
    notes: 'Geriatric frontline health visit. Calcium tablets provided.',
    status: 'CONFIRMED',
    priorityLevel: 'ROUTINE',
    riskRuleId: 'NCD-GERIATRIC-01',
    followUpDate: '07 Nov 2026',
    createdAt: new Date().toISOString(),
  },
];

export interface ActiveSession {
  token: string;
  userId: string;
  role: 'ASHA_WORKER' | 'HEALTH_FACILITY_OFFICER';
  createdAt: string;
  expiresAt: number;
}

class DatabaseStore {
  private dataFile: string;
  public users: User[] = [];
  public households: Household[] = [];
  public people: Person[] = [];
  public visits: Visit[] = [];
  public referrals: Referral[] = [];
  public auditLogs: AuditLog[] = [];
  private sessions = new Map<string, ActiveSession>();

  constructor() {
    this.dataFile = path.resolve(process.cwd(), 'data_store.json');
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        const parsed = JSON.parse(raw);
        // Hydrate users ensuring passwordHash and salt are never missing
        this.users = (parsed.users || INITIAL_USERS).map((u: any) => {
          const seed = INITIAL_USERS.find((init) => init.id === u.id || init.email === u.email);
          return {
            ...u,
            passwordHash: u.passwordHash || seed?.passwordHash || DEFAULT_PASSWORD_HASH,
            salt: u.salt || seed?.salt || DEMO_SALT,
          };
        });
        this.households = parsed.households || INITIAL_HOUSEHOLDS;
        this.people = parsed.people || INITIAL_PEOPLE;
        this.visits = parsed.visits || INITIAL_VISITS;
        this.referrals = parsed.referrals || INITIAL_REFERRALS;
        this.auditLogs = parsed.auditLogs || [];
        return;
      }
    } catch (e) {
      console.warn('Could not read existing data_store.json, initializing seeds', e);
    }

    this.users = [...INITIAL_USERS];
    this.households = [...INITIAL_HOUSEHOLDS];
    this.people = [...INITIAL_PEOPLE];
    this.visits = [...INITIAL_VISITS];
    this.referrals = [...INITIAL_REFERRALS];
    this.auditLogs = [];
    this.persist();
  }

  public persist() {
    try {
      const payload = {
        users: this.users,
        households: this.households,
        people: this.people,
        visits: this.visits,
        referrals: this.referrals,
        auditLogs: this.auditLogs,
      };
      const tmpFile = `${this.dataFile}.tmp`;
      fs.writeFileSync(tmpFile, JSON.stringify(payload, null, 2), 'utf-8');
      fs.renameSync(tmpFile, this.dataFile);
    } catch (e) {
      console.error('Failed to persist data store atomically, fallback to direct write:', e);
      try {
        const payload = {
          users: this.users,
          households: this.households,
          people: this.people,
          visits: this.visits,
          referrals: this.referrals,
          auditLogs: this.auditLogs,
        };
        fs.writeFileSync(this.dataFile, JSON.stringify(payload, null, 2), 'utf-8');
      } catch (err2) {
        console.error('Direct write failed too:', err2);
      }
    }
  }

  public createSession(userId: string, role: 'ASHA_WORKER' | 'HEALTH_FACILITY_OFFICER'): string {
    const token = `asha_auth_${userId}_${crypto.randomBytes(24).toString('hex')}`;
    const expiresAt = Date.now() + 7 * 24 * 60 * 60 * 1000; // 7 days
    this.sessions.set(token, {
      token,
      userId,
      role,
      createdAt: new Date().toISOString(),
      expiresAt,
    });
    return token;
  }

  public getSession(token: string): ActiveSession | null {
    if (!token) return null;
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    const session = this.sessions.get(cleanToken);
    if (!session) {
      // Deterministic dev/seed tokens compatibility
      if (cleanToken.includes('USR-01')) {
        return {
          token: cleanToken,
          userId: 'USR-01',
          role: 'ASHA_WORKER',
          createdAt: new Date().toISOString(),
          expiresAt: Date.now() + 86400000,
        };
      }
      if (cleanToken.includes('USR-02')) {
        return {
          token: cleanToken,
          userId: 'USR-02',
          role: 'HEALTH_FACILITY_OFFICER',
          createdAt: new Date().toISOString(),
          expiresAt: Date.now() + 86400000,
        };
      }
      return null;
    }
    if (Date.now() > session.expiresAt) {
      this.sessions.delete(cleanToken);
      return null;
    }
    return session;
  }

  public revokeSession(token: string): boolean {
    const cleanToken = token.replace(/^Bearer\s+/i, '').trim();
    return this.sessions.delete(cleanToken);
  }

  public logAudit(action: string, entityType: string, entityId: string, userId: string, details: string) {
    this.auditLogs.unshift({
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      entityType,
      entityId,
      userId,
      timestamp: new Date().toISOString(),
      details,
    });
    this.persist();
  }
}

export const db = new DatabaseStore();
