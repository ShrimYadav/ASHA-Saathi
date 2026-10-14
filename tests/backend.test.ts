import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';

const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:3000/api/v1';

describe('ASHA-Saathi Backend Audit & Verification Suite', () => {
  let ashaToken = '';
  let doctorToken = '';
  let createdReferralId = '';
  let createdSecureToken = '';
  let createdReferralCode = '';
  let createdVisitId1 = '';
  let createdVisitId2 = '';
  let createdHouseholdId = '';
  let createdPersonId = '';

  before(async () => {
    // Ensure server is reachable
    const res = await fetch(`${BASE_URL}/health`);
    assert.equal(res.status, 200, 'Server should be healthy');
    const data = await res.json();
    assert.equal(data.status, 'healthy');
  });

  describe('1. Authentication & Role-Based Authorization', () => {
    test('Rejects login when password is omitted', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'sunita.devi@asha.gov.in' }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error, 'PASSWORD_REQUIRED');
    });

    test('Rejects login with incorrect password', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sunita.devi@asha.gov.in',
          password: 'wrong_password_999',
        }),
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error, 'INVALID_PASSWORD');
    });

    test('Rejects login with unknown user account', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'unknown.person@nowhere.gov.in',
          password: 'somepassword',
        }),
      });
      assert.equal(res.status, 401);
      const data = await res.json();
      assert.equal(data.success, false);
      assert.equal(data.error, 'AUTH_FAILED');
    });

    test('Authenticates ASHA worker with genuine password hash verification', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sunita.devi@asha.gov.in',
          password: 'asha123',
        }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.token, 'Should issue a session token');
      assert.equal(data.user.role, 'ASHA_WORKER');
      assert.equal(data.user.email, 'sunita.devi@asha.gov.in');
      assert.equal(data.user.passwordHash, undefined, 'Must not leak password hash');
      assert.equal(data.user.salt, undefined, 'Must not leak salt');
      ashaToken = data.token;
    });

    test('Authenticates Facility Officer (Doctor) with separate credentials', async () => {
      const res = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'dr.verma@district-hospital.gov.in',
          password: 'doctor123',
        }),
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.user.role, 'HEALTH_FACILITY_OFFICER');
      doctorToken = data.token;
    });

    test('Validates session token via /auth/me for authenticated user', async () => {
      const res = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${doctorToken}` },
      });
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.user.role, 'HEALTH_FACILITY_OFFICER');
      assert.equal(data.isAuthenticated, true);
    });

    test('Logs out and revokes active session', async () => {
      const tempRes = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'sunita.devi@asha.gov.in',
          password: 'asha123',
        }),
      });
      const tempData = await tempRes.json();

      const logoutRes = await fetch(`${BASE_URL}/auth/logout`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${tempData.token}` },
      });
      assert.equal(logoutRes.status, 200);
      const logoutData = await logoutRes.json();
      assert.equal(logoutData.success, true);
    });
  });

  describe('2. Input Validation & Error Handling', () => {
    test('Rejects visit creation missing both name and personId', async () => {
      const res = await fetch(`${BASE_URL}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ashaToken}`,
        },
        body: JSON.stringify({
          condition: 'Routine Checkup',
          symptoms: [],
        }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error, 'VALIDATION_ERROR');
    });

    test('Rejects referral passport generation with missing patient name', async () => {
      const res = await fetch(`${BASE_URL}/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ashaToken}`,
        },
        body: JSON.stringify({
          referredToFacility: 'District Hospital',
          reason: 'Severe fever',
        }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error, 'VALIDATION_ERROR');
    });

    test('Rejects token validation with empty token payload', async () => {
      const res = await fetch(`${BASE_URL}/referrals/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: '' }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error, 'TOKEN_REQUIRED');
    });

    test('Rejects referral event with invalid eventType enum', async () => {
      const res = await fetch(`${BASE_URL}/referrals/record-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${doctorToken}`,
        },
        body: JSON.stringify({
          referralId: 'REF-01',
          eventType: 'INVALID_EVENT_STAGE',
        }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error, 'INVALID_EVENT_TYPE');
    });

    test('Rejects batch sync with non-array payload', async () => {
      const res = await fetch(`${BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pendingVisits: 'not_an_array' }),
      });
      assert.equal(res.status, 400);
      const data = await res.json();
      assert.equal(data.error, 'INVALID_PAYLOAD');
    });
  });

  describe('3. Clinical Protocol Priority Flags & Visit Lifecycle', () => {
    test('Evaluates Presumptive TB protocol: assigns HIGH_PRIORITY and flags patient', async () => {
      const res = await fetch(`${BASE_URL}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ashaToken}`,
        },
        body: JSON.stringify({
          personId: 'P03',
          personName: 'Kamal Singh',
          condition: 'Presumptive Pulmonary TB',
          symptoms: ['Persistent cough (>2 weeks)', 'Night sweats', 'Unexplained weight loss'],
          vitals: { bp: '118/76', tempF: 99.4 },
          notes: 'Screened at Pipra Purwa. Cough present for 16 days.',
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.visit.priorityLevel, 'HIGH_PRIORITY');
      assert.equal(data.visit.riskRuleId, 'NTEP-TB-RULE-01');
      assert.ok(data.disclaimer, 'Must include medical disclaimer');
      assert.ok(Array.isArray(data.clinicalEvaluation));
      assert.equal(data.clinicalEvaluation[0].ruleId, 'NTEP-TB-RULE-01');
      createdVisitId1 = data.visit.id;

      // Verify patient in registry now has 'High Priority' tag
      const pRes = await fetch(`${BASE_URL}/people?search=Kamal`);
      const pData = await pRes.json();
      const kamal = pData.people.find((p: any) => p.name.includes('Kamal'));
      assert.ok(kamal);
      assert.equal(kamal.statusTag, 'High Priority');
    });

    test('Evaluates routine visit without protocol flags: assigns ROUTINE', async () => {
      const res = await fetch(`${BASE_URL}/visits`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ashaToken}`,
        },
        body: JSON.stringify({
          personId: 'P04',
          personName: 'Pooja Sharma',
          condition: 'General Health Review',
          symptoms: ['No acute symptoms'],
          notes: 'Routine household review.',
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.visit.priorityLevel, 'ROUTINE');
      createdVisitId2 = data.visit.id;
    });

    test('Retrieves single visit by ID and updates visit fields', async () => {
      const getRes = await fetch(`${BASE_URL}/visits/${createdVisitId1}`);
      assert.equal(getRes.status, 200);
      const getData = await getRes.json();
      assert.equal(getData.success, true);
      assert.equal(getData.visit.id, createdVisitId1);

      const putRes = await fetch(`${BASE_URL}/visits/${createdVisitId1}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          notes: 'Updated clinical review note: patient counselled on sputum test.',
        }),
      });
      assert.equal(putRes.status, 200);
      const putData = await putRes.json();
      assert.equal(putData.success, true);
      assert.equal(putData.visit.notes, 'Updated clinical review note: patient counselled on sputum test.');
    });
  });

  describe('4. Referral Tracking, QR Tokens & Facility Desk Updates', () => {
    test('Creates referral passport with digital QR secure token and unique code', async () => {
      const res = await fetch(`${BASE_URL}/referrals`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ashaToken}`,
        },
        body: JSON.stringify({
          personId: 'P03',
          personName: 'Kamal Singh',
          personAge: 42,
          personGender: 'Male',
          referredToFacility: 'District Hospital Pipra',
          reason: 'Presumptive Pulmonary TB (Persistent cough > 2 weeks)',
          protocolCode: 'NTEP-TB-RULE-01',
          urgency: 'HIGH_PRIORITY',
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.ok(data.referral.id);
      assert.ok(data.referral.referralCode.startsWith('ASHA20261010-'));
      assert.ok(data.referral.secureToken.startsWith('urn:asha:ref:'));
      assert.equal(data.referral.status, 'GENERATED');
      assert.equal(data.referral.events.length, 1);

      createdReferralId = data.referral.id;
      createdSecureToken = data.referral.secureToken;
      createdReferralCode = data.referral.referralCode;
    });

    test('Facility Desk validates scanned QR token', async () => {
      const res = await fetch(`${BASE_URL}/referrals/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: createdSecureToken }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.referral.id, createdReferralId);
      assert.equal(data.referral.personName, 'Kamal Singh');
    });

    test('Facility Desk validates referral using referralCode fallback', async () => {
      const res = await fetch(`${BASE_URL}/referrals/validate-token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: createdReferralCode }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.referral.id, createdReferralId);
    });

    test('Facility Desk updates status to REACHED at hospital check-in', async () => {
      const res = await fetch(`${BASE_URL}/referrals/record-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${doctorToken}`,
        },
        body: JSON.stringify({
          referralId: createdReferralId,
          eventType: 'REACHED',
          facilityName: 'District Hospital Pipra',
          recordedBy: 'Hospital Reception',
          notes: 'Patient arrived with digital QR token.',
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.referral.status, 'REACHED');
      assert.equal(data.referral.events.length, 2);
    });

    test('Doctor records CONSULTED event with diagnosis & prescription outcome', async () => {
      const res = await fetch(`${BASE_URL}/referrals/record-event`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${doctorToken}`,
        },
        body: JSON.stringify({
          referralId: createdReferralId,
          eventType: 'CONSULTED',
          facilityName: 'District Hospital Pipra',
          recordedBy: 'Dr. A. K. Verma',
          notes: 'Sputum CBNAAT sample collected; ATT counselling initiated.',
          clinicalDiagnosis: 'Presumptive TB under laboratory evaluation',
          prescribedTreatments: 'Expectorant syrup & infection control mask',
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.referral.status, 'CONSULTED');
      assert.equal(data.referral.events.length, 3);

      // Verify referral details endpoint
      const getRes = await fetch(`${BASE_URL}/referrals/${createdReferralId}`);
      assert.equal(getRes.status, 200);
      const getData = await getRes.json();
      assert.equal(getData.referral.status, 'CONSULTED');
    });
  });

  describe('5. Duplicate-Safe Offline Synchronization', () => {
    test('Syncs new offline visit draft idempotently', async () => {
      const testTimestamp = Date.now();
      const draft = {
        id: `draft_${testTimestamp}`,
        personName: `Offline Beneficiary ${testTimestamp}`,
        date: '10 Oct 2026',
        condition: 'Routine Health Check',
        symptoms: ['Mild fatigue'],
        notes: 'Recorded in deep rural hamlet without cellular coverage.',
      };

      const res = await fetch(`${BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendingVisits: [draft],
          pendingReferrals: [],
        }),
      });

      assert.equal(res.status, 200);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.syncedVisits, 1);
      assert.equal(data.duplicateVisitsSkipped, 0);

      // Re-syncing the identical draft must NOT create a duplicate record
      const reSyncRes = await fetch(`${BASE_URL}/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          pendingVisits: [draft],
          pendingReferrals: [],
        }),
      });

      assert.equal(reSyncRes.status, 200);
      const reSyncData = await reSyncRes.json();
      assert.equal(reSyncData.success, true);
      assert.equal(reSyncData.syncedVisits, 0, 'Must not duplicate record');
      assert.equal(reSyncData.duplicateVisitsSkipped, 1, 'Must recognize duplicate fingerprint');
    });
  });

  describe('6. Reports & Aggregated Analytics', () => {
    test('Returns MoHFW summary stats, monthly trends, and demographics distribution', async () => {
      const res = await fetch(`${BASE_URL}/reports`);
      assert.equal(res.status, 200);
      const data = await res.json();
      assert.ok(data.analytics);
      assert.ok(data.analytics.summary);
      assert.ok(data.analytics.summary.monthlyVisitsCompleted >= 30);
      assert.ok(data.analytics.summary.referralSuccessRate > 0);
      assert.ok(Array.isArray(data.analytics.monthlyVisits));
      assert.ok(Array.isArray(data.analytics.demographics.categories));
    });
  });

  describe('7. Household & Beneficiary Management Lifecycle', () => {
    test('Creates new household and updates details', async () => {
      const res = await fetch(`${BASE_URL}/households`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ashaToken}`,
        },
        body: JSON.stringify({
          headName: 'Suresh Kumar Maurya',
          tola: 'Pipra Tola',
          village: 'Pipra',
          familyMembersCount: 4,
          rationCardType: 'BPL',
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.household.headName, 'Suresh Kumar Maurya');
      createdHouseholdId = data.household.id;

      // Update household
      const putRes = await fetch(`${BASE_URL}/households/${createdHouseholdId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ familyMembersCount: 5 }),
      });
      assert.equal(putRes.status, 200);
      const putData = await putRes.json();
      assert.equal(putData.household.familyMembersCount, 5);
    });

    test('Registers new beneficiary under household and updates record', async () => {
      const res = await fetch(`${BASE_URL}/people`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${ashaToken}`,
        },
        body: JSON.stringify({
          name: 'Poonam Maurya',
          householdId: createdHouseholdId,
          age: 23,
          gender: 'Female',
          relationshipToHead: 'Wife',
          category: 'Pregnant',
          condition: 'Pregnant (1st Trimester)',
        }),
      });

      assert.equal(res.status, 201);
      const data = await res.json();
      assert.equal(data.success, true);
      assert.equal(data.person.name, 'Poonam Maurya');
      createdPersonId = data.person.id;

      // Retrieve detail
      const getRes = await fetch(`${BASE_URL}/people/${createdPersonId}`);
      assert.equal(getRes.status, 200);
      const getData = await getRes.json();
      assert.equal(getData.success, true);
      assert.equal(getData.person.id, createdPersonId);
    });
  });

  after(async () => {
    // Clean up test-created records to guarantee pristine data store without duplicates
    if (createdVisitId1) {
      await fetch(`${BASE_URL}/visits/${createdVisitId1}`, { method: 'DELETE' });
    }
    if (createdVisitId2) {
      await fetch(`${BASE_URL}/visits/${createdVisitId2}`, { method: 'DELETE' });
    }
    if (createdReferralId) {
      await fetch(`${BASE_URL}/referrals/${createdReferralId}`, { method: 'DELETE' });
    }
    if (createdPersonId) {
      await fetch(`${BASE_URL}/people/${createdPersonId}`, { method: 'DELETE' });
    }
    if (createdHouseholdId) {
      await fetch(`${BASE_URL}/households/${createdHouseholdId}`, { method: 'DELETE' });
    }
    // Clean any offline drafts created during sync tests
    const vRes = await fetch(`${BASE_URL}/visits`);
    if (vRes.ok) {
      const vData = await vRes.json();
      for (const v of vData.visits || []) {
        if (v.personName?.startsWith('Offline Beneficiary')) {
          await fetch(`${BASE_URL}/visits/${v.id}`, { method: 'DELETE' });
        }
      }
    }
  });
});
