import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db } from './src/server/db.js';
import { evaluateClinicalRules } from './src/server/rulesEngine.js';
import { extractStructuredVisitFromTranscript } from './src/server/aiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

  app.use(express.json());

  // ==========================================
  // API V1 ROUTES
  // ==========================================

  // Health check
  app.get('/api/v1/health', (req, res) => {
    res.json({
      status: 'healthy',
      app: 'ASHA-Saathi',
      version: '1.0.0-hackathon',
      timestamp: new Date().toISOString(),
    });
  });

  // Auth: Login / Role Switch
  app.post('/api/v1/auth/login', (req, res) => {
    const { role = 'ASHA_WORKER', email, phone } = req.body;
    let user = db.users.find((u) => u.role === role);
    if (!user) {
      user = db.users[0];
    }
    db.logAudit('USER_LOGIN', 'USER', user.id, user.id, `User logged in with role ${user.role}`);
    res.json({
      success: true,
      token: `jwt_session_${user.id}_${Date.now()}`,
      user,
    });
  });

  // Auth: Get current user
  app.get('/api/v1/auth/me', (req, res) => {
    const user = db.users[0];
    res.json({ user });
  });

  // Dashboard Summary Endpoint
  app.get('/api/v1/dashboard', (req, res) => {
    const pendingReferrals = db.referrals.filter((r) => r.status !== 'COMPLETED').length;
    const completedVisits = db.visits.filter((v) => v.date.includes('10 Oct')).length;
    const highPriorityCases = db.people.filter((p) => p.statusTag === 'High Priority').length;
    const totalHouseholds = db.households.length;

    const todayVisitList = db.people.slice(0, 4).map((person) => ({
      id: person.id,
      name: person.name,
      age: person.age,
      gender: person.gender,
      condition: person.condition,
      lastVisit: person.lastVisitDate,
      statusTag: person.statusTag,
      village: person.householdId === 'HH-01' ? 'Pipra Tola' : 'Pipra Purwa',
      symptoms: person.symptoms,
    }));

    const recentActivity = [
      {
        id: 'ACT-01',
        type: 'visit',
        title: 'Visit record added',
        subtitle: 'Radhika Sharma • 10:24 AM',
        timestamp: '10:24 AM',
      },
      {
        id: 'ACT-02',
        type: 'referral',
        title: 'Referral generated',
        subtitle: 'Kamal Singh • 09:12 AM',
        timestamp: '09:12 AM',
      },
      {
        id: 'ACT-03',
        type: 'followup',
        title: 'Follow-up completed',
        subtitle: 'Savitri Bai • Yesterday',
        timestamp: 'Yesterday',
      },
      {
        id: 'ACT-04',
        type: 'message',
        title: 'New message from PHC',
        subtitle: 'Health Centre • Yesterday',
        timestamp: 'Yesterday',
      },
    ];

    res.json({
      householdsToday: 12,
      pendingReferrals,
      completedVisits: completedVisits || 8,
      highPriorityCases: highPriorityCases || 2,
      totalHouseholds: 148,
      todayVisitList,
      recentActivity,
      user: db.users[0],
    });
  });

  // Households: List & Search
  app.get('/api/v1/households', (req, res) => {
    const { search = '', village = '' } = req.query;
    let list = db.households;

    if (search) {
      const q = String(search).toLowerCase();
      list = list.filter(
        (h) =>
          h.headName.toLowerCase().includes(q) ||
          h.code.toLowerCase().includes(q) ||
          h.tola.toLowerCase().includes(q)
      );
    }
    if (village) {
      list = list.filter((h) => h.village.toLowerCase() === String(village).toLowerCase());
    }

    res.json({ households: list, total: list.length });
  });

  // Households: Detail with linked people
  app.get('/api/v1/households/:id', (req, res) => {
    const hh = db.households.find((h) => h.id === req.params.id);
    if (!hh) {
      return res.status(404).json({ error: 'Household not found' });
    }
    const members = db.people.filter((p) => p.householdId === hh.id);
    const visits = db.visits.filter((v) => v.householdId === hh.id);
    res.json({ household: hh, members, visits });
  });

  // People: List & Filter
  app.get('/api/v1/people', (req, res) => {
    const { category, search } = req.query;
    let people = db.people;

    if (category && category !== 'All') {
      people = people.filter((p) => p.category === category);
    }
    if (search) {
      const q = String(search).toLowerCase();
      people = people.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.condition.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q)
      );
    }

    res.json({ people, total: people.length });
  });

  // Visits: Create Visit
  app.post('/api/v1/visits', (req, res) => {
    const {
      personId,
      personName,
      householdId = 'HH-01',
      transcript,
      language = 'Hindi (हिन्दी)',
      symptoms = [],
      condition = 'Routine Checkup',
      notes = '',
      vitals = {},
    } = req.body;

    // Run deterministic rules engine
    const person = db.people.find((p) => p.id === personId);
    const ruleResults = evaluateClinicalRules({
      personName: personName || person?.name || 'Beneficiary',
      age: person?.age || 26,
      gender: person?.gender || 'Female',
      category: person?.category || 'General',
      condition,
      symptoms,
      vitals,
    });

    const highestRule = ruleResults[0];
    const priorityLevel = highestRule.urgency;

    const newVisit = {
      id: `VIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      personId: personId || 'P01',
      personName: personName || person?.name || 'Beneficiary',
      householdId,
      workerId: db.users[0].id,
      date: '10 Oct 2026',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      transcript,
      language,
      symptoms,
      condition,
      vitals,
      notes,
      status: 'CONFIRMED' as const,
      priorityLevel,
      riskRuleId: highestRule.ruleId,
      followUpDate: highestRule.urgency === 'HIGH_PRIORITY' ? '12 Oct 2026' : '24 Oct 2026',
      createdAt: new Date().toISOString(),
    };

    db.visits.unshift(newVisit);

    // Update person status if present
    if (person) {
      person.lastVisitDate = '10 Oct 2026';
      person.symptoms = symptoms;
      if (highestRule.urgency === 'HIGH_PRIORITY') {
        person.statusTag = 'High Priority';
      } else if (highestRule.urgency === 'FOLLOW_UP') {
        person.statusTag = 'Follow Up';
      }
    }

    db.logAudit('CREATE_VISIT', 'VISIT', newVisit.id, db.users[0].id, `Visit recorded for ${newVisit.personName}`);
    db.persist();

    res.json({
      success: true,
      visit: newVisit,
      clinicalEvaluation: ruleResults,
    });
  });

  // Visits: List
  app.get('/api/v1/visits', (req, res) => {
    res.json({ visits: db.visits, total: db.visits.length });
  });

  // AI Extraction Service
  app.post('/api/v1/ai/extract', async (req, res) => {
    const { transcript = '', personContext } = req.body;
    try {
      const extracted = await extractStructuredVisitFromTranscript(transcript, personContext);
      res.json({
        success: true,
        extracted,
      });
    } catch (err: any) {
      res.status(500).json({
        error: 'Extraction failed',
        message: err.message,
      });
    }
  });

  // Clinical Protocol Rules Evaluation
  app.post('/api/v1/rules/evaluate', (req, res) => {
    const {
      personName = 'Beneficiary',
      age = 26,
      gender = 'Female',
      category = 'General',
      condition = 'Routine Checkup',
      symptoms = [],
      vitals = {},
    } = req.body;

    const evaluation = evaluateClinicalRules({
      personName,
      age,
      gender,
      category,
      condition,
      symptoms,
      vitals,
    });

    res.json({
      success: true,
      evaluation,
    });
  });

  // Referrals: List
  app.get('/api/v1/referrals', (req, res) => {
    res.json({ referrals: db.referrals, total: db.referrals.length });
  });

  // Referrals: Create Referral Passport
  app.post('/api/v1/referrals', (req, res) => {
    const {
      personId,
      personName,
      personAge = 42,
      personGender = 'Male',
      householdId = 'HH-03',
      referredToFacility = 'District Hospital',
      reason = 'Presumptive TB Symptoms Detected',
      protocolCode = 'NTEP-TB-RULE-01',
      urgency = 'HIGH_PRIORITY',
    } = req.body;

    const referralCode = `ASHA20261010-${String(Math.floor(1000 + Math.random() * 9000))}`;
    // Secure, unpredictable UUID token encoded into QR (zero PII)
    const secureToken = `urn:asha:ref:${crypto.randomUUID()}`;

    const newReferral = {
      id: `REF-${Date.now()}`,
      referralCode,
      secureToken,
      personId: personId || 'P03',
      personName: personName || 'Kamal Singh',
      personAge,
      personGender,
      householdId,
      workerId: db.users[0].id,
      referredToFacility,
      reason,
      protocolCode,
      urgency: urgency as any,
      status: 'GENERATED' as const,
      date: '10 Oct 2026',
      createdAt: new Date().toISOString(),
      events: [
        {
          id: `EVT-${Date.now()}-1`,
          referralId: '',
          eventType: 'GENERATED' as const,
          title: 'Referral Generated',
          timestamp: '10 Oct 2026, 09:12 AM',
          facilityName: 'Pipra Sub-Centre',
          recordedBy: 'Sunita Devi (ASHA)',
          notes: 'Referral passport generated with digital QR token.',
        },
      ],
    };
    newReferral.events[0].referralId = newReferral.id;

    db.referrals.unshift(newReferral);
    db.logAudit('CREATE_REFERRAL', 'REFERRAL', newReferral.id, db.users[0].id, `Referral passport issued: ${referralCode}`);
    db.persist();

    res.json({
      success: true,
      referral: newReferral,
    });
  });

  // Referrals: Validate Token (Health Centre Desk Scan)
  app.post('/api/v1/referrals/validate-token', (req, res) => {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ error: 'Token is required' });
    }

    const trimmed = String(token).trim();
    // Look up by secureToken or fallback to referralCode
    const referral = db.referrals.find(
      (r) => r.secureToken === trimmed || r.referralCode === trimmed || trimmed.includes(r.referralCode)
    );

    if (!referral) {
      return res.status(404).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'No active referral passport found matching this token.',
      });
    }

    // Return safe verification payload
    res.json({
      success: true,
      referral: {
        id: referral.id,
        referralCode: referral.referralCode,
        personName: referral.personName,
        personAge: referral.personAge,
        personGender: referral.personGender,
        referredToFacility: referral.referredToFacility,
        reason: referral.reason,
        protocolCode: referral.protocolCode,
        urgency: referral.urgency,
        status: referral.status,
        date: referral.date,
        events: referral.events,
      },
    });
  });

  // Referrals: Record Health Centre Event
  app.post('/api/v1/referrals/record-event', (req, res) => {
    const { referralId, eventType, facilityName = 'District Hospital Pipra', recordedBy = 'Hospital Desk', notes = '' } = req.body;

    const referral = db.referrals.find((r) => r.id === referralId);
    if (!referral) {
      return res.status(404).json({ error: 'Referral not found' });
    }

    const titleMap: Record<string, string> = {
      REACHED: 'Reached Health Centre',
      CONSULTED: 'Consultation Completed',
      FOLLOWUP_SCHEDULED: 'Follow Up Scheduled',
      COMPLETED: 'Treatment Initiated / Completed',
    };

    const newEvent = {
      id: `EVT-${Date.now()}-${Math.floor(Math.random() * 100)}`,
      referralId: referral.id,
      eventType,
      title: titleMap[eventType] || eventType,
      timestamp: new Date().toLocaleString([], {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      }),
      facilityName,
      recordedBy,
      notes,
    };

    referral.events.push(newEvent);
    if (eventType === 'REACHED') referral.status = 'REACHED';
    if (eventType === 'CONSULTED') referral.status = 'CONSULTED';
    if (eventType === 'COMPLETED') referral.status = 'COMPLETED';

    db.logAudit('RECORD_REFERRAL_EVENT', 'REFERRAL', referral.id, db.users[1].id, `Event ${eventType} recorded`);
    db.persist();

    res.json({
      success: true,
      referral,
      event: newEvent,
    });
  });

  // Reports & Analytics
  app.get('/api/v1/reports', (req, res) => {
    const totalReferrals = db.referrals.length;
    const consulted = db.referrals.filter((r) => r.status === 'CONSULTED' || r.status === 'COMPLETED').length;
    const reached = db.referrals.filter((r) => r.status === 'REACHED').length;
    const pending = db.referrals.filter((r) => r.status === 'GENERATED').length;

    res.json({
      analytics: {
        totalBeneficiaries: db.people.length,
        totalHouseholdsCovered: db.households.length,
        referralFunnel: {
          totalReferrals,
          reachedFacility: reached + consulted,
          consultedCompleted: consulted,
          pendingArrival: pending,
          conversionRatePercent: totalReferrals ? Math.round(((reached + consulted) / totalReferrals) * 100) : 100,
        },
        categoryBreakdown: {
          pregnant: db.people.filter((p) => p.category === 'Pregnant').length,
          children: db.people.filter((p) => p.category === 'Children').length,
          highRisk: db.people.filter((p) => p.category === 'High Risk').length,
          general: db.people.filter((p) => p.category === 'General').length,
        },
        protocolAdherencePercent: 98.4,
      },
    });
  });

  // Offline Batch Synchronization
  app.post('/api/v1/sync', (req, res) => {
    const { pendingVisits = [], pendingReferrals = [] } = req.body;
    let syncedVisits = 0;
    let syncedReferrals = 0;

    // Process pending visit drafts idempotently
    for (const v of pendingVisits) {
      const exists = db.visits.some((existing) => existing.id === v.id);
      if (!exists) {
        db.visits.unshift({
          ...v,
          status: 'CONFIRMED',
          createdAt: v.createdAt || new Date().toISOString(),
        });
        syncedVisits++;
      }
    }

    // Process pending referrals idempotently
    for (const r of pendingReferrals) {
      const exists = db.referrals.some((existing) => existing.id === r.id);
      if (!exists) {
        db.referrals.unshift(r);
        syncedReferrals++;
      }
    }

    if (syncedVisits > 0 || syncedReferrals > 0) {
      db.persist();
      db.logAudit('OFFLINE_SYNC', 'SYSTEM', 'BATCH_SYNC', db.users[0].id, `Synced ${syncedVisits} visits, ${syncedReferrals} referrals`);
    }

    res.json({
      success: true,
      syncedVisits,
      syncedReferrals,
      serverTimestamp: new Date().toISOString(),
      currentCounts: {
        visits: db.visits.length,
        referrals: db.referrals.length,
      },
    });
  });

  // ==========================================
  // VITE DEV MIDDLEWARE / STATIC ASSETS
  // ==========================================
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`ASHA-Saathi Full-Stack Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('Fatal error starting ASHA-Saathi server:', err);
  process.exit(1);
});
