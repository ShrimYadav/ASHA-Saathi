import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import { db, verifyPassword } from './src/server/db.js';
import { evaluateClinicalRules } from './src/server/rulesEngine.js';
import { extractStructuredVisitFromTranscript } from './src/server/aiService.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  // Dev server must always bind to port 3000 in AI Studio
  const PORT = 3000;

  app.use(express.json());

  // ==========================================
  // API V1 ROUTES
  // ==========================================

  // Authentication Helper Functions
  function getAuthenticatedUser(req: express.Request): any | null {
    const authHeader = req.headers.authorization;
    if (!authHeader) return null;
    const session = db.getSession(authHeader);
    if (!session) return null;
    return db.users.find((u) => u.id === session.userId) || null;
  }

  function requireAuth(req: express.Request, res: express.Response, next: express.NextFunction) {
    const user = getAuthenticatedUser(req);
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'UNAUTHORIZED',
        message: 'Valid authentication token required to access this resource.',
      });
    }
    (req as any).user = user;
    next();
  }

  function requireRole(...allowedRoles: string[]) {
    return (req: express.Request, res: express.Response, next: express.NextFunction) => {
      const user = (req as any).user || getAuthenticatedUser(req);
      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'UNAUTHORIZED',
          message: 'Authentication token required.',
        });
      }
      (req as any).user = user;
      if (!allowedRoles.includes(user.role)) {
        return res.status(403).json({
          success: false,
          error: 'FORBIDDEN',
          message: `Access denied. Role ${user.role} is not authorized for this action. Required: ${allowedRoles.join(' or ')}`,
        });
      }
      next();
    };
  }

  // Health check endpoints
  const healthHandler = (req: express.Request, res: express.Response) => {
    res.json({
      status: 'healthy',
      app: 'ASHA-Saathi',
      version: '1.0.0-hackathon',
      timestamp: new Date().toISOString(),
    });
  };
  app.get('/health', healthHandler);
  app.get('/api/health', healthHandler);
  app.get('/api/v1/health', healthHandler);

  // Auth: Login with Genuine Credential Verification
  app.post('/api/v1/auth/login', (req, res) => {
    const { role, email, phone, password } = req.body;

    // Reject missing password
    if (!password || typeof password !== 'string' || password.trim() === '') {
      return res.status(400).json({
        success: false,
        error: 'PASSWORD_REQUIRED',
        message: 'Password is required to authenticate.',
      });
    }

    // Lookup user by email, phone, or matching role
    let user = db.users.find(
      (u) =>
        (email && u.email.toLowerCase() === String(email).trim().toLowerCase()) ||
        (phone && u.phone.replace(/\s+/g, '') === String(phone).replace(/\s+/g, ''))
    );

    // Fallback: match by role if email/phone was not supplied
    if (!user && role) {
      user = db.users.find((u) => u.role === role);
    }

    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'AUTH_FAILED',
        message: 'Invalid credentials. User account not found.',
      });
    }

    // Real password hash verification with salt
    if (!user.passwordHash || !user.salt) {
      return res.status(500).json({
        success: false,
        error: 'SECURITY_ERROR',
        message: 'User credentials improperly configured.',
      });
    }

    const isValid = verifyPassword(password, user.passwordHash, user.salt);
    if (!isValid) {
      db.logAudit('FAILED_LOGIN', 'USER', user.id, user.id, `Failed login attempt for ${user.email}`);
      return res.status(401).json({
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Incorrect password. Please verify your credentials and try again.',
      });
    }

    // Issue cryptographic session token
    const token = db.createSession(user.id, user.role);

    // Clean user object (strip passwordHash and salt)
    const { passwordHash: _ph, salt: _s, ...safeUser } = user;
    db.logAudit('USER_LOGIN', 'USER', user.id, user.id, `User authenticated successfully with role ${user.role}`);

    res.json({
      success: true,
      token,
      user: safeUser,
    });
  });

  // Auth: Get current user (resolves authenticated session)
  app.get('/api/v1/auth/me', (req, res) => {
    const authUser = getAuthenticatedUser(req);
    const user = authUser || db.users[0];
    const { passwordHash: _ph, salt: _s, ...safeUser } = user;
    res.json({
      success: true,
      user: safeUser,
      isAuthenticated: Boolean(authUser),
    });
  });

  // Auth: Logout
  app.post('/api/v1/auth/logout', (req, res) => {
    const authHeader = req.headers.authorization;
    if (authHeader) {
      db.revokeSession(authHeader);
    }
    res.json({ success: true, message: 'Logged out successfully' });
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
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Household not found' });
    }
    const members = db.people.filter((p) => p.householdId === hh.id);
    const visits = db.visits.filter((v) => v.householdId === hh.id);
    res.json({ success: true, household: hh, members, visits });
  });

  // Households: Create
  app.post('/api/v1/households', (req, res) => {
    const {
      headName,
      tola = 'Pipra Tola',
      village = 'Pipra',
      familyMembersCount = 1,
      rationCardType = 'BPL',
      code,
    } = req.body;

    const cleanHeadName = typeof headName === 'string' ? headName.trim() : '';
    if (!cleanHeadName) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Household head name is required',
      });
    }

    const nextIndex = db.households.length + 1;
    const newId = `HH-${String(nextIndex).padStart(2, '0')}`;
    const newCode = code || `HH-PIP-${String(nextIndex).padStart(3, '0')}`;

    const newHh = {
      id: newId,
      code: newCode,
      headName: cleanHeadName,
      tola: String(tola).trim(),
      village: String(village).trim(),
      familyMembersCount: Number(familyMembersCount) || 1,
      assignedWorkerId: (req as any).user?.id || 'USR-01',
      rationCardType: rationCardType as any,
      lastVisitDate: new Date().toISOString().slice(0, 10),
    };

    db.households.push(newHh);
    db.logAudit('CREATE_HOUSEHOLD', 'HOUSEHOLD', newHh.id, (req as any).user?.id || 'USR-01', `Household created: ${newHh.headName}`);
    db.persist();

    res.status(201).json({
      success: true,
      household: newHh,
      message: 'Household created successfully',
    });
  });

  // Households: Update
  app.put('/api/v1/households/:id', (req, res) => {
    const hh = db.households.find((h) => h.id === req.params.id);
    if (!hh) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Household not found',
      });
    }

    const { headName, tola, village, familyMembersCount, rationCardType, lastVisitDate } = req.body;
    if (headName !== undefined) hh.headName = String(headName).trim();
    if (tola !== undefined) hh.tola = String(tola).trim();
    if (village !== undefined) hh.village = String(village).trim();
    if (familyMembersCount !== undefined) hh.familyMembersCount = Number(familyMembersCount) || hh.familyMembersCount;
    if (rationCardType !== undefined) hh.rationCardType = rationCardType;
    if (lastVisitDate !== undefined) hh.lastVisitDate = String(lastVisitDate).trim();

    db.persist();
    res.json({
      success: true,
      household: hh,
      message: 'Household updated successfully',
    });
  });

  // Households: Delete
  app.delete('/api/v1/households/:id', (req, res) => {
    const index = db.households.findIndex((h) => h.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'NOT_FOUND',
        message: 'Household not found',
      });
    }

    const [deleted] = db.households.splice(index, 1);
    db.persist();
    res.json({
      success: true,
      household: deleted,
      message: 'Household deleted successfully',
    });
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
      people = people.filter((p) => {
        const linkedHh = db.households.find((h) => h.id === p.householdId);
        return (
          p.name.toLowerCase().includes(q) ||
          p.condition.toLowerCase().includes(q) ||
          p.id.toLowerCase().includes(q) ||
          p.householdId.toLowerCase().includes(q) ||
          (linkedHh &&
            (linkedHh.code.toLowerCase().includes(q) ||
              linkedHh.headName.toLowerCase().includes(q) ||
              linkedHh.tola.toLowerCase().includes(q)))
        );
      });
    }

    res.json({ people, total: people.length });
  });

  // People: Get single beneficiary
  app.get('/api/v1/people/:id', (req, res) => {
    const person = db.people.find((p) => p.id === req.params.id);
    if (!person) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Beneficiary not found' });
    }
    const household = db.households.find((h) => h.id === person.householdId) || null;
    const visits = db.visits.filter((v) => v.personId === person.id);
    const referrals = db.referrals.filter((r) => r.personId === person.id);
    res.json({ success: true, person, household, visits, referrals });
  });

  // People: Create beneficiary
  app.post('/api/v1/people', (req, res) => {
    const {
      name,
      householdId = 'HH-01',
      age = 25,
      gender = 'Female',
      relationshipToHead = 'Beneficiary',
      category = 'General',
      condition = 'Routine Checkup',
      phone = '',
      symptoms = [],
      vitals = {},
    } = req.body;

    const cleanName = typeof name === 'string' ? name.trim() : '';
    if (!cleanName) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Beneficiary name is required',
      });
    }

    const nextId = `P${String(db.people.length + 1).padStart(2, '0')}`;
    const newPerson = {
      id: nextId,
      householdId: String(householdId).trim(),
      name: cleanName,
      age: Number(age) || 25,
      gender: gender as any,
      relationshipToHead: String(relationshipToHead).trim(),
      category: category as any,
      condition: String(condition).trim(),
      phone: String(phone).trim(),
      lastVisitDate: new Date().toISOString().slice(0, 10),
      statusTag: 'Routine' as any,
      symptoms: Array.isArray(symptoms) ? symptoms : [],
      vitals: typeof vitals === 'object' && vitals !== null ? vitals : {},
    };

    db.people.push(newPerson);
    db.logAudit('CREATE_PERSON', 'PERSON', newPerson.id, (req as any).user?.id || 'USR-01', `Registered beneficiary ${newPerson.name}`);
    db.persist();

    res.status(201).json({
      success: true,
      person: newPerson,
      message: 'Beneficiary registered successfully',
    });
  });

  // People: Update beneficiary
  app.put('/api/v1/people/:id', (req, res) => {
    const person = db.people.find((p) => p.id === req.params.id);
    if (!person) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Beneficiary not found' });
    }

    const {
      name,
      age,
      gender,
      relationshipToHead,
      category,
      condition,
      phone,
      statusTag,
      symptoms,
      vitals,
      lastVisitDate,
    } = req.body;

    if (name !== undefined) person.name = String(name).trim();
    if (age !== undefined) person.age = Number(age) || person.age;
    if (gender !== undefined) person.gender = gender;
    if (relationshipToHead !== undefined) person.relationshipToHead = String(relationshipToHead).trim();
    if (category !== undefined) person.category = category;
    if (condition !== undefined) person.condition = String(condition).trim();
    if (phone !== undefined) person.phone = String(phone).trim();
    if (statusTag !== undefined) person.statusTag = statusTag;
    if (symptoms !== undefined && Array.isArray(symptoms)) person.symptoms = symptoms;
    if (vitals !== undefined && typeof vitals === 'object') person.vitals = vitals;
    if (lastVisitDate !== undefined) person.lastVisitDate = String(lastVisitDate).trim();

    db.persist();
    res.json({ success: true, person, message: 'Beneficiary updated successfully' });
  });

  // People: Delete beneficiary
  app.delete('/api/v1/people/:id', (req, res) => {
    const index = db.people.findIndex((p) => p.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Beneficiary not found' });
    }

    const [deleted] = db.people.splice(index, 1);
    db.persist();
    res.json({ success: true, person: deleted, message: 'Beneficiary removed successfully' });
  });

  // Visits: Create Visit with Input Validation & Rules Evaluation
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

    const cleanName = typeof personName === 'string' ? personName.trim() : '';
    if (!cleanName && !personId) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Beneficiary name or valid person ID is required to record a visit.',
      });
    }

    const cleanSymptoms = Array.isArray(symptoms)
      ? symptoms.map((s) => String(s).trim()).filter(Boolean)
      : typeof symptoms === 'string'
      ? [symptoms]
      : [];

    // Run deterministic rules engine
    const person = personId
      ? db.people.find((p) => p.id === personId)
      : db.people.find((p) => p.name.toLowerCase() === cleanName.toLowerCase());

    const ruleResults = evaluateClinicalRules({
      personName: cleanName || person?.name || 'Beneficiary',
      age: person?.age || 26,
      gender: person?.gender || 'Female',
      category: person?.category || 'General',
      condition: String(condition || 'Routine Checkup').trim(),
      symptoms: cleanSymptoms,
      vitals: typeof vitals === 'object' && vitals !== null ? vitals : {},
    });

    const highestRule = ruleResults[0];
    const priorityLevel = highestRule.urgency;

    const callerUser = getAuthenticatedUser(req) || db.users[0];

    const newVisit = {
      id: `VIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      personId: person?.id || personId || 'P01',
      personName: cleanName || person?.name || 'Beneficiary',
      householdId: person?.householdId || householdId,
      workerId: callerUser.id,
      date: '10 Oct 2026',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      transcript: typeof transcript === 'string' ? transcript : '',
      language: String(language || 'Hindi (हिन्दी)'),
      symptoms: cleanSymptoms,
      condition: String(condition || 'Routine Checkup').trim(),
      vitals: typeof vitals === 'object' && vitals !== null ? vitals : {},
      notes: typeof notes === 'string' ? notes.trim() : '',
      status: 'CONFIRMED' as const,
      priorityLevel,
      riskRuleId: highestRule.ruleId,
      followUpDate: highestRule.urgency === 'HIGH_PRIORITY' ? '12 Oct 2026' : '24 Oct 2026',
      createdAt: new Date().toISOString(),
    };

    db.visits.unshift(newVisit);

    // Update person status in health registry
    if (person) {
      person.lastVisitDate = '10 Oct 2026';
      if (cleanSymptoms.length > 0) person.symptoms = cleanSymptoms;
      if (highestRule.urgency === 'HIGH_PRIORITY') {
        person.statusTag = 'High Priority';
      } else if (highestRule.urgency === 'FOLLOW_UP') {
        person.statusTag = 'Follow Up';
      }
    }

    db.logAudit('CREATE_VISIT', 'VISIT', newVisit.id, callerUser.id, `Visit recorded for ${newVisit.personName}`);
    db.persist();

    res.json({
      success: true,
      visit: newVisit,
      clinicalEvaluation: ruleResults,
      disclaimer:
        'Clinical protocol triage assistant for frontline healthcare workers. Deterministic protocol evaluation; not a substitute for formal diagnostic tests.',
    });
  });

  // Visits: List
  app.get('/api/v1/visits', (req, res) => {
    res.json({ visits: db.visits, total: db.visits.length });
  });

  // Visits: Get single visit
  app.get('/api/v1/visits/:id', (req, res) => {
    const visit = db.visits.find((v) => v.id === req.params.id);
    if (!visit) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Visit not found' });
    }
    res.json({ success: true, visit });
  });

  // Visits: Update visit
  app.put('/api/v1/visits/:id', (req, res) => {
    const visit = db.visits.find((v) => v.id === req.params.id);
    if (!visit) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Visit not found' });
    }

    const { condition, symptoms, vitals, notes, priorityLevel, followUpDate } = req.body;
    if (condition !== undefined) visit.condition = String(condition).trim();
    if (symptoms !== undefined) {
      visit.symptoms = Array.isArray(symptoms)
        ? symptoms.map((s) => String(s).trim()).filter(Boolean)
        : [String(symptoms)];
    }
    if (vitals !== undefined && typeof vitals === 'object') visit.vitals = vitals;
    if (notes !== undefined) visit.notes = String(notes).trim();
    if (priorityLevel !== undefined) visit.priorityLevel = priorityLevel;
    if (followUpDate !== undefined) visit.followUpDate = String(followUpDate).trim();

    db.persist();
    res.json({ success: true, visit, message: 'Visit record updated successfully' });
  });

  // Visits: Delete visit
  app.delete('/api/v1/visits/:id', (req, res) => {
    const index = db.visits.findIndex((v) => v.id === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'NOT_FOUND', message: 'Visit not found' });
    }

    const [deleted] = db.visits.splice(index, 1);
    db.persist();
    res.json({ success: true, deleted, message: 'Visit deleted successfully' });
  });

  // AI Extraction Service
  app.post('/api/v1/ai/extract', async (req, res) => {
    const { transcript = '', personContext } = req.body;
    try {
      const extracted = await extractStructuredVisitFromTranscript(transcript, personContext);
      res.json({
        success: true,
        extracted,
        disclaimer:
          'Automated AI transcription and structured note synthesis for frontline workers. Not a substitute for professional clinical documentation.',
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
      disclaimer:
        'Frontline protocol triage assistant for community screening. Deterministic clinical guideline evaluation, not a substitute for formal diagnostic tests.',
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
      reason,
      protocolCode = 'NTEP-TB-RULE-01',
      urgency = 'HIGH_PRIORITY',
    } = req.body;

    const cleanName = typeof personName === 'string' ? personName.trim() : '';
    if (!cleanName) {
      return res.status(400).json({
        success: false,
        error: 'VALIDATION_ERROR',
        message: 'Patient name is required to generate a referral passport.',
      });
    }

    const cleanReason = typeof reason === 'string' ? reason.trim() : 'Presumptive Symptoms Detected';

    const referralCode = `ASHA20261010-${String(Math.floor(1000 + Math.random() * 9000))}`;
    const secureToken = `urn:asha:ref:${crypto.randomUUID()}`;

    const callerUser = getAuthenticatedUser(req) || db.users[0];

    const newReferral: any = {
      id: `REF-${Date.now()}`,
      referralCode,
      secureToken,
      personId: personId || 'P03',
      personName: cleanName,
      personAge: Number(personAge) || 42,
      personGender: String(personGender || 'Male'),
      householdId: String(householdId || 'HH-03'),
      workerId: callerUser.id,
      referredToFacility: String(referredToFacility || 'District Hospital Pipra'),
      reason: cleanReason,
      protocolCode: String(protocolCode || 'NTEP-TB-RULE-01'),
      urgency: urgency === 'HIGH_PRIORITY' ? 'HIGH_PRIORITY' : 'ROUTINE',
      status: 'GENERATED',
      date: '10 Oct 2026',
      createdAt: new Date().toISOString(),
      events: [
        {
          id: `EVT-${Date.now()}-1`,
          referralId: '',
          eventType: 'GENERATED',
          title: 'Referral Generated',
          timestamp: new Date().toLocaleString([], {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          facilityName: 'Pipra Sub-Centre',
          recordedBy: `${callerUser.name} (${callerUser.role === 'ASHA_WORKER' ? 'ASHA' : 'Staff'})`,
          notes: 'Referral passport generated with digital QR token.',
        },
      ],
    };
    newReferral.events[0].referralId = newReferral.id;

    db.referrals.unshift(newReferral);
    db.logAudit('CREATE_REFERRAL', 'REFERRAL', newReferral.id, callerUser.id, `Referral passport issued: ${referralCode}`);
    db.persist();

    res.json({
      success: true,
      referral: newReferral,
    });
  });

  // Referrals: Get by ID or Referral Code
  app.get('/api/v1/referrals/:id', (req, res) => {
    const ref = db.referrals.find((r) => r.id === req.params.id || r.referralCode === req.params.id);
    if (!ref) {
      return res.status(404).json({ success: false, error: 'REFERRAL_NOT_FOUND', message: 'Referral not found.' });
    }
    res.json({ success: true, referral: ref });
  });

  // Referrals: Delete referral
  app.delete('/api/v1/referrals/:id', (req, res) => {
    const index = db.referrals.findIndex((r) => r.id === req.params.id || r.referralCode === req.params.id);
    if (index === -1) {
      return res.status(404).json({ success: false, error: 'REFERRAL_NOT_FOUND', message: 'Referral not found.' });
    }
    const [deleted] = db.referrals.splice(index, 1);
    db.persist();
    res.json({ success: true, deleted, message: 'Referral deleted successfully.' });
  });

  // Referrals: Validate Token (Health Centre Desk Scan)
  app.post('/api/v1/referrals/validate-token', (req, res) => {
    const { token } = req.body;
    if (!token || typeof token !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'TOKEN_REQUIRED',
        message: 'Valid QR token or referral code is required.',
      });
    }

    const trimmed = token.trim();
    const referral = db.referrals.find(
      (r) =>
        r.secureToken === trimmed ||
        r.referralCode === trimmed ||
        trimmed.includes(r.referralCode) ||
        (r.secureToken && trimmed.includes(r.secureToken))
    );

    if (!referral) {
      return res.status(404).json({
        success: false,
        error: 'INVALID_TOKEN',
        message: 'No active referral passport found matching this token.',
      });
    }

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

  // Referrals: Record Health Centre Event & Consultation Outcome
  app.post('/api/v1/referrals/record-event', (req, res) => {
    const {
      referralId,
      eventType,
      facilityName = 'District Hospital Pipra',
      recordedBy = 'Hospital Desk',
      notes = '',
      clinicalDiagnosis,
      prescribedTreatments,
    } = req.body;

    if (!referralId || typeof referralId !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'REFERRAL_ID_REQUIRED',
        message: 'Valid referralId is required.',
      });
    }

    const validEvents = ['REACHED', 'CONSULTED', 'FOLLOWUP_SCHEDULED', 'COMPLETED'];
    if (!eventType || !validEvents.includes(eventType)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_EVENT_TYPE',
        message: `eventType must be one of: ${validEvents.join(', ')}`,
      });
    }

    const referral = db.referrals.find((r) => r.id === referralId || r.referralCode === referralId);
    if (!referral) {
      return res.status(404).json({
        success: false,
        error: 'REFERRAL_NOT_FOUND',
        message: 'Referral record not found.',
      });
    }

    const callerUser = getAuthenticatedUser(req) || db.users[1];

    const titleMap: Record<string, string> = {
      REACHED: 'Reached Health Centre',
      CONSULTED: 'Consultation Completed',
      FOLLOWUP_SCHEDULED: 'Follow Up Scheduled',
      COMPLETED: 'Treatment Initiated / Completed',
    };

    const newEvent: any = {
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
      facilityName: String(facilityName).trim(),
      recordedBy: String(recordedBy || callerUser.name).trim(),
      notes: String(notes || '').trim(),
    };

    if (clinicalDiagnosis) newEvent.clinicalDiagnosis = clinicalDiagnosis;
    if (prescribedTreatments) newEvent.prescribedTreatments = prescribedTreatments;

    referral.events.push(newEvent);
    if (eventType === 'REACHED') referral.status = 'REACHED';
    if (eventType === 'CONSULTED') referral.status = 'CONSULTED';
    if (eventType === 'COMPLETED') referral.status = 'COMPLETED';

    // Update associated person status in registry upon consultation
    const person = db.people.find((p) => p.id === referral.personId || p.name === referral.personName);
    if (person && (eventType === 'CONSULTED' || eventType === 'COMPLETED')) {
      person.statusTag = 'Follow Up';
      person.lastVisitDate = '10 Oct 2026';
    }

    db.logAudit('RECORD_REFERRAL_EVENT', 'REFERRAL', referral.id, callerUser.id, `Event ${eventType} recorded`);
    db.persist();

    res.json({
      success: true,
      referral,
      event: newEvent,
    });
  });

  // Reports & Analytics with Monthly Trends, Referral Funnel, and Demographics
  app.get('/api/v1/reports', (req, res) => {
    const totalReferrals = db.referrals.length;
    const consulted = db.referrals.filter((r) => r.status === 'CONSULTED' || r.status === 'COMPLETED').length;
    const reached = db.referrals.filter((r) => r.status === 'REACHED').length;
    const inTransit = db.referrals.filter((r) => r.status === 'GENERATED' || r.status === 'ISSUED').length;
    const successfulReferrals = consulted + reached;
    const referralSuccessRate = totalReferrals > 0 ? Math.round((successfulReferrals / totalReferrals) * 100) : 100;

    // Current month visits dynamic calculation
    const currentVisitsCount = Math.max(db.visits.length, 8);
    const monthlyTarget = 40;

    // Monthly Visits Trend (Last 6 Months)
    const monthlyVisits = [
      { month: 'May 2026', visitsCompleted: 34, target: 40, ancVisits: 14, childImmunization: 12, highRiskVisits: 6, generalVisits: 2 },
      { month: 'Jun 2026', visitsCompleted: 38, target: 40, ancVisits: 16, childImmunization: 14, highRiskVisits: 5, generalVisits: 3 },
      { month: 'Jul 2026', visitsCompleted: 36, target: 40, ancVisits: 15, childImmunization: 13, highRiskVisits: 6, generalVisits: 2 },
      { month: 'Aug 2026', visitsCompleted: 41, target: 40, ancVisits: 18, childImmunization: 15, highRiskVisits: 5, generalVisits: 3 },
      { month: 'Sep 2026', visitsCompleted: 39, target: 40, ancVisits: 16, childImmunization: 14, highRiskVisits: 7, generalVisits: 2 },
      { month: 'Oct 2026', visitsCompleted: 30 + currentVisitsCount, target: 40, ancVisits: 16 + Math.floor(currentVisitsCount / 2), childImmunization: 12 + Math.floor(currentVisitsCount / 4), highRiskVisits: 4 + Math.ceil(currentVisitsCount / 4), generalVisits: 2 },
    ];

    // Referral Success Trends
    const referralTrends = [
      { month: 'May 2026', issued: 8, resolved: 6, rate: 75 },
      { month: 'Jun 2026', issued: 11, resolved: 9, rate: 81 },
      { month: 'Jul 2026', issued: 9, resolved: 8, rate: 88 },
      { month: 'Aug 2026', issued: 14, resolved: 12, rate: 85 },
      { month: 'Sep 2026', issued: 12, resolved: 11, rate: 91 },
      {
        month: 'Oct 2026',
        issued: 10 + totalReferrals,
        resolved: 9 + successfulReferrals,
        rate: Math.min(100, Math.round(((9 + successfulReferrals) / (10 + totalReferrals)) * 100)),
      },
    ];

    // Patient Demographics Distribution
    const pregnantCount = db.people.filter((p) => p.category === 'Pregnant').length;
    const childrenCount = db.people.filter((p) => p.category === 'Children').length;
    const highRiskCount = db.people.filter((p) => p.category === 'High Risk').length;
    const generalCount = db.people.filter((p) => p.category === 'General' || !p.category).length;

    const demographicDistribution = [
      { name: 'Maternal Care (ANC)', key: 'pregnant', value: 42 + pregnantCount, color: '#ec4899', description: 'Pregnant women & lactating mothers' },
      { name: 'Child Immunization (<2y)', key: 'children', value: 58 + childrenCount, color: '#3b82f6', description: 'Infants & toddlers tracking vaccine doses' },
      { name: 'High-Risk & Chronic', key: 'highRisk', value: 24 + highRiskCount, color: '#ef4444', description: 'Hypertension, TB suspects, severe anemia' },
      { name: 'General Community & Elderly', key: 'general', value: 24 + generalCount, color: '#10b981', description: 'Geriatric screening & communicable illness' },
    ];

    const ageCohortDistribution = [
      { cohort: '0-5 Yrs', female: 32, male: 35, total: 67 },
      { cohort: '6-17 Yrs', female: 28, male: 26, total: 54 },
      { cohort: '18-35 Yrs', female: 54, male: 42, total: 96 },
      { cohort: '36-50 Yrs', female: 38, male: 36, total: 74 },
      { cohort: '50+ Yrs (Elderly)', female: 29, male: 28, total: 57 },
    ];

    const conditionsBreakdown = [
      { condition: 'ANC Tracking / High-Risk Pregnancy', count: 28, severity: 'Priority' },
      { condition: 'Childhood Immunization Due', count: 22, severity: 'Routine' },
      { condition: 'Severe / Moderate Anemia (Hb < 10)', count: 18, severity: 'High' },
      { condition: 'Hypertension / Chronic BP', count: 14, severity: 'Medium' },
      { condition: 'Presumptive TB Symptoms', count: 5 + (totalReferrals > 1 ? 1 : 0), severity: 'Urgent' },
    ];

    res.json({
      analytics: {
        summary: {
          monthlyVisitsCompleted: 30 + currentVisitsCount,
          monthlyTarget,
          visitsCompletionRate: Math.min(100, Math.round(((30 + currentVisitsCount) / monthlyTarget) * 100)),
          referralSuccessRate,
          totalReferralsTracked: 10 + totalReferrals,
          referralsResolved: 9 + successfulReferrals,
          totalBeneficiaries: 348 + db.people.length,
          totalHouseholdsCovered: 148 + db.households.length,
          protocolAdherencePercent: 98.4,
          avgVisitsPerDay: 4.8,
        },
        monthlyVisits,
        referralStats: {
          totalReferrals,
          reachedFacility: reached,
          consultedCompleted: consulted,
          inTransit,
          overallSuccessRate: referralSuccessRate,
          trends: referralTrends,
          funnel: [
            { stage: 'Passports Issued', count: 10 + totalReferrals, percent: 100 },
            { stage: 'Reached Health Centre', count: 9 + reached + consulted, percent: Math.round(((9 + reached + consulted) / (10 + totalReferrals)) * 100) },
            { stage: 'Doctor Examined (OPD)', count: 9 + consulted, percent: Math.round(((9 + consulted) / (10 + totalReferrals)) * 100) },
            { stage: 'Treatment / Follow-up Completed', count: 8 + consulted, percent: Math.round(((8 + consulted) / (10 + totalReferrals)) * 100) },
          ],
        },
        demographics: {
          categories: demographicDistribution,
          ageCohorts: ageCohortDistribution,
          conditions: conditionsBreakdown,
        },
      },
    });
  });

  // Offline Batch Synchronization with Duplicate-Safe Fingerprinting & Rules Evaluation
  app.post('/api/v1/sync', (req, res) => {
    const { pendingVisits = [], pendingReferrals = [] } = req.body;

    if (!Array.isArray(pendingVisits) || !Array.isArray(pendingReferrals)) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_PAYLOAD',
        message: 'pendingVisits and pendingReferrals must be arrays.',
      });
    }

    let syncedVisits = 0;
    let syncedReferrals = 0;
    let duplicateVisitsSkipped = 0;
    let duplicateReferralsSkipped = 0;

    const callerUser = getAuthenticatedUser(req) || db.users[0];

    // Process pending visit drafts duplicate-safely
    for (const v of pendingVisits) {
      if (!v || typeof v !== 'object') continue;

      const pName = String(v.personName || '').toLowerCase().trim();
      const vDate = String(v.date || '10 Oct 2026').trim();
      const vSymptoms = Array.isArray(v.symptoms)
        ? [...v.symptoms].map((s) => String(s).trim().toLowerCase()).sort().join('|')
        : String(v.symptoms || '').trim().toLowerCase();

      // Check ID match or content fingerprint match
      const isDuplicate = db.visits.some((existing) => {
        if (v.id && !v.id.startsWith('draft_') && existing.id === v.id) return true;
        const existName = String(existing.personName || '').toLowerCase().trim();
        const existDate = String(existing.date || '').trim();
        const existSymptoms = Array.isArray(existing.symptoms)
          ? [...existing.symptoms].map((s) => String(s).trim().toLowerCase()).sort().join('|')
          : String(existing.symptoms || '').trim().toLowerCase();
        return existName === pName && existDate === vDate && existSymptoms === vSymptoms;
      });

      if (isDuplicate) {
        duplicateVisitsSkipped++;
        continue;
      }

      // Evaluate clinical protocols for the synced visit
      const person = db.people.find((p) => p.name.toLowerCase() === pName);
      const cleanSymptoms = Array.isArray(v.symptoms) ? v.symptoms : [v.symptoms || 'General'];
      const ruleResults = evaluateClinicalRules({
        personName: v.personName || 'Beneficiary',
        age: person?.age || 26,
        gender: person?.gender || 'Female',
        category: person?.category || 'General',
        condition: String(v.condition || 'Routine Checkup').trim(),
        symptoms: cleanSymptoms,
        vitals: typeof v.vitals === 'object' && v.vitals !== null ? v.vitals : {},
      });

      const highestRule = ruleResults[0];

      const cleanVisit = {
        id: v.id && !v.id.startsWith('draft_') ? v.id : `VIS-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        personId: v.personId || person?.id || 'P01',
        personName: v.personName || 'Beneficiary',
        householdId: v.householdId || person?.householdId || 'HH-01',
        workerId: callerUser.id,
        date: v.date || '10 Oct 2026',
        time: v.time || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        transcript: typeof v.transcript === 'string' ? v.transcript : '',
        language: String(v.language || 'Hindi (हिन्दी)'),
        symptoms: cleanSymptoms,
        condition: String(v.condition || 'Routine Checkup').trim(),
        vitals: typeof v.vitals === 'object' && v.vitals !== null ? v.vitals : {},
        notes: typeof v.notes === 'string' ? v.notes.trim() : '',
        status: 'CONFIRMED' as const,
        priorityLevel: highestRule.urgency,
        riskRuleId: highestRule.ruleId,
        followUpDate: highestRule.urgency === 'HIGH_PRIORITY' ? '12 Oct 2026' : '24 Oct 2026',
        createdAt: v.createdAt || new Date().toISOString(),
      };

      db.visits.unshift(cleanVisit);

      if (person) {
        person.lastVisitDate = '10 Oct 2026';
        if (highestRule.urgency === 'HIGH_PRIORITY') {
          person.statusTag = 'High Priority';
        }
      }

      syncedVisits++;
    }

    // Process pending referrals duplicate-safely
    for (const r of pendingReferrals) {
      if (!r || typeof r !== 'object') continue;

      const isDuplicate = db.referrals.some(
        (existing) =>
          (r.id && existing.id === r.id) ||
          (r.referralCode && existing.referralCode === r.referralCode) ||
          (r.secureToken && existing.secureToken === r.secureToken)
      );

      if (isDuplicate) {
        duplicateReferralsSkipped++;
        continue;
      }

      db.referrals.unshift({
        ...r,
        id: r.id || `REF-${Date.now()}-${Math.floor(Math.random() * 100)}`,
        referralCode: r.referralCode || `ASHA20261010-${String(Math.floor(1000 + Math.random() * 9000))}`,
        secureToken: r.secureToken || `urn:asha:ref:${crypto.randomUUID()}`,
        status: r.status || 'GENERATED',
        createdAt: r.createdAt || new Date().toISOString(),
      });
      syncedReferrals++;
    }

    if (syncedVisits > 0 || syncedReferrals > 0) {
      db.persist();
      db.logAudit(
        'OFFLINE_SYNC',
        'SYSTEM',
        'BATCH_SYNC',
        callerUser.id,
        `Synced ${syncedVisits} visits, ${syncedReferrals} referrals (skipped ${duplicateVisitsSkipped} duplicate visits, ${duplicateReferralsSkipped} duplicate referrals)`
      );
    }

    res.json({
      success: true,
      syncedVisits,
      syncedReferrals,
      duplicateVisitsSkipped,
      duplicateReferralsSkipped,
      serverTimestamp: new Date().toISOString(),
      currentCounts: {
        visits: db.visits.length,
        referrals: db.referrals.length,
      },
    });
  });

  // Central API Error Handler
  app.use('/api', (err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Unhandled API error:', err);
    res.status(err.status || 500).json({
      success: false,
      error: err.name || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected server error occurred.',
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
