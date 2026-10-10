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
  status: 'GENERATED' | 'REACHED' | 'CONSULTED' | 'COMPLETED';
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
  },
];

const INITIAL_HOUSEHOLDS: Household[] = [
  {
    id: 'HH-01',
    code: 'HH-PIP-001',
    headName: 'Ramesh Sharma',
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
    headName: 'Santosh Bai',
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
    headName: 'Kamal Singh',
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
    headName: 'Manoj Verma',
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
    headName: 'Meena Patel',
    tola: 'Pipra Tola',
    village: 'Pipra',
    familyMembersCount: 2,
    assignedWorkerId: 'USR-01',
    rationCardType: 'APL',
    lastVisitDate: '2026-09-18',
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
    householdId: 'HH-02',
    name: 'Savitri Bai',
    age: 28,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'Children',
    condition: 'Child (1-2 years) • Vaccination due',
    phone: '+91 94520 89134',
    lastVisitDate: '2026-09-10',
    statusTag: 'Routine',
    symptoms: ['Pentavalent 3 Due', 'Healthy weight'],
    vitals: { weightKg: 9.8, tempF: 98.4 },
  },
  {
    id: 'P03',
    householdId: 'HH-03',
    name: 'Kamal Singh',
    age: 42,
    gender: 'Male',
    relationshipToHead: 'Self (Head)',
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
    id: 'P04',
    householdId: 'HH-04',
    name: 'Pooja Verma',
    age: 22,
    gender: 'Female',
    relationshipToHead: 'Wife',
    category: 'Pregnant',
    condition: 'Postnatal Care',
    phone: '+91 91612 33490',
    lastVisitDate: '2026-10-03',
    statusTag: 'Routine',
    symptoms: ['Postnatal Day 14', 'Infant latching well'],
    vitals: { bp: '118/78', hemoglobin: 11.4 },
  },
  {
    id: 'P05',
    householdId: 'HH-05',
    name: 'Meena Patel',
    age: 52,
    gender: 'Female',
    relationshipToHead: 'Self (Head)',
    category: 'High Risk',
    condition: 'Hypertension',
    phone: '+91 99182 45781',
    lastVisitDate: '2026-09-18',
    statusTag: 'Routine',
    symptoms: ['Regular amlodipine intake', 'No dizziness'],
    vitals: { bp: '142/90', pulseBpm: 76 },
  },
  {
    id: 'P06',
    householdId: 'HH-01',
    name: 'Savita Sharma',
    age: 26,
    gender: 'Female',
    relationshipToHead: 'Sister-in-law',
    category: 'Pregnant',
    condition: 'Pregnant (2nd Trimester)',
    phone: '+91 98391 24511',
    lastVisitDate: '2026-10-10',
    statusTag: 'Follow Up',
    symptoms: ['Mild headache', 'Fatigue', 'Pallor visible'],
    vitals: { bp: '110/72', hemoglobin: 9.6, weightKg: 52 },
  },
];

const INITIAL_REFERRALS: Referral[] = [
  {
    id: 'REF-01',
    referralCode: 'ASHA20261010-0042',
    secureToken: 'tok_5b8f9e2a_c410_4f92_9876_tb_kamal',
    personId: 'P03',
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
    personId: 'P03',
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
];

class DatabaseStore {
  private dataFile: string;
  public users: User[] = [];
  public households: Household[] = [];
  public people: Person[] = [];
  public visits: Visit[] = [];
  public referrals: Referral[] = [];
  public auditLogs: AuditLog[] = [];

  constructor() {
    this.dataFile = path.resolve(process.cwd(), 'data_store.json');
    this.load();
  }

  private load() {
    try {
      if (fs.existsSync(this.dataFile)) {
        const raw = fs.readFileSync(this.dataFile, 'utf-8');
        const parsed = JSON.parse(raw);
        this.users = parsed.users || INITIAL_USERS;
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
      fs.writeFileSync(this.dataFile, JSON.stringify(payload, null, 2), 'utf-8');
    } catch (e) {
      console.error('Failed to persist data store:', e);
    }
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
