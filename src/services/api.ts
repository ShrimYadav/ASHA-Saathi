// Central API Client for ASHA-Saathi

const BASE_URL = '/api/v1';

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => ({}));
      throw new Error(errorBody.message || errorBody.error || `HTTP error ${res.status}`);
    }

    return await res.json();
  } catch (err: any) {
    console.error(`API request failed: ${endpoint}`, err);
    throw err;
  }
}

export const api = {
  // Health
  checkHealth: () => request<{ status: string; timestamp: string }>('/health'),

  // Auth
  login: (role: 'ASHA_WORKER' | 'HEALTH_FACILITY_OFFICER' = 'ASHA_WORKER', email?: string) =>
    request<{ success: boolean; token: string; user: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ role, email }),
    }),
  getMe: () => request<{ user: any }>('/auth/me'),

  // Dashboard
  getDashboard: () =>
    request<{
      householdsToday: number;
      pendingReferrals: number;
      completedVisits: number;
      highPriorityCases: number;
      totalHouseholds: number;
      todayVisitList: any[];
      recentActivity: any[];
      user: any;
    }>('/dashboard'),

  // Households
  getHouseholds: (search = '', village = '') =>
    request<{ households: any[]; total: number }>(
      `/households?search=${encodeURIComponent(search)}&village=${encodeURIComponent(village)}`
    ),
  getHouseholdDetail: (id: string) =>
    request<{ household: any; members: any[]; visits: any[] }>(`/households/${id}`),

  // People
  getPeople: (category = 'All', search = '') =>
    request<{ people: any[]; total: number }>(
      `/people?category=${encodeURIComponent(category)}&search=${encodeURIComponent(search)}`
    ),

  // Visits
  createVisit: (payload: {
    personId: string;
    personName?: string;
    householdId?: string;
    transcript?: string;
    language?: string;
    symptoms?: string[];
    condition?: string;
    notes?: string;
    vitals?: Record<string, any>;
  }) =>
    request<{ success: boolean; visit: any; clinicalEvaluation: any[] }>('/visits', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  getVisits: () => request<{ visits: any[]; total: number }>('/visits'),

  // AI Extraction
  extractVisitFromTranscript: (transcript: string, personContext?: any) =>
    request<{ success: boolean; extracted: any }>('/ai/extract', {
      method: 'POST',
      body: JSON.stringify({ transcript, personContext }),
    }),

  // Rules Engine
  evaluateClinicalRules: (payload: {
    personName: string;
    age: number;
    gender: string;
    category?: string;
    condition: string;
    symptoms: string[];
    vitals?: Record<string, any>;
  }) =>
    request<{ success: boolean; evaluation: any[] }>('/rules/evaluate', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Referrals
  getReferrals: () => request<{ referrals: any[]; total: number }>('/referrals'),
  createReferral: (payload: {
    personId: string;
    personName: string;
    personAge?: number;
    personGender?: string;
    householdId?: string;
    referredToFacility?: string;
    reason?: string;
    protocolCode?: string;
    urgency?: string;
  }) =>
    request<{ success: boolean; referral: any }>('/referrals', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Health Centre Desk QR Token Validation
  validateReferralToken: (token: string) =>
    request<{ success: boolean; referral: any }>('/referrals/validate-token', {
      method: 'POST',
      body: JSON.stringify({ token }),
    }),

  // Health Centre Desk Event Recording
  recordReferralEvent: (payload: {
    referralId: string;
    eventType: 'REACHED' | 'CONSULTED' | 'FOLLOWUP_SCHEDULED' | 'COMPLETED';
    facilityName?: string;
    recordedBy?: string;
    notes?: string;
  }) =>
    request<{ success: boolean; referral: any; event: any }>('/referrals/record-event', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  // Reports
  getReports: () =>
    request<{
      analytics: {
        totalBeneficiaries: number;
        totalHouseholdsCovered: number;
        referralFunnel: any;
        categoryBreakdown: any;
        protocolAdherencePercent: number;
      };
    }>('/reports'),

  // Offline Synchronization
  syncOfflineBatch: (pendingVisits: any[], pendingReferrals: any[]) =>
    request<{
      success: boolean;
      syncedVisits: number;
      syncedReferrals: number;
      serverTimestamp: string;
      currentCounts: any;
    }>('/sync', {
      method: 'POST',
      body: JSON.stringify({ pendingVisits, pendingReferrals }),
    }),
};
