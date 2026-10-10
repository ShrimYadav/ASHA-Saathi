export interface ProtocolRule {
  id: string;
  protocolCode: string;
  protocolName: string;
  category: 'TB_SCREENING' | 'MATERNAL_HEALTH' | 'CHILD_IMMUNIZATION' | 'NCD_HYPERTENSION';
  title: string;
  description: string;
  sourceGuideline: string;
  evaluate: (input: RuleEvaluationInput) => RuleEvaluationResult | null;
}

export interface RuleEvaluationInput {
  personName: string;
  age: number;
  gender: string;
  category: string;
  condition: string;
  symptoms: string[];
  vitals?: {
    bp?: string;
    hemoglobin?: number;
    weightKg?: number;
    tempF?: number;
    pulseBpm?: number;
  };
}

export interface RuleEvaluationResult {
  ruleId: string;
  protocolCode: string;
  protocolTitle: string;
  sourceGuideline: string;
  urgency: 'HIGH_PRIORITY' | 'FOLLOW_UP' | 'ROUTINE';
  title: string;
  explanation: string;
  matchedSymptoms: string[];
  recommendedAction: string;
  shouldRefer: boolean;
  recommendedFacility: string;
}

export const PROTOCOL_RULES: ProtocolRule[] = [
  // 1. Presumptive Pulmonary TB (NTEP Guidelines)
  {
    id: 'NTEP-TB-RULE-01',
    protocolCode: 'NTEP-TB-2024-v2',
    protocolName: 'National Tuberculosis Elimination Programme (NTEP)',
    category: 'TB_SCREENING',
    title: 'Presumptive Pulmonary TB Screening',
    description: 'Triggers when patient presents with persistent cough >= 2 weeks, unexplained weight loss, or night sweats.',
    sourceGuideline: 'Central TB Division, MoHFW, Govt of India — Active Case Finding Protocol',
    evaluate: (input) => {
      const lowerSymptoms = (input.symptoms || []).map((s) => s.toLowerCase());
      const hasCough = lowerSymptoms.some((s) => s.includes('cough') || s.includes('khansi') || s.includes('2 week') || s.includes('persistent'));
      const hasWeightLoss = lowerSymptoms.some((s) => s.includes('weight') || s.includes('vajan') || s.includes('loss'));
      const hasNightSweats = lowerSymptoms.some((s) => s.includes('sweat') || s.includes('pasina') || s.includes('night'));
      const hasHemoptysis = lowerSymptoms.some((s) => s.includes('blood') || s.includes('khoon') || s.includes('sputum'));
      const hasFever = lowerSymptoms.some((s) => s.includes('fever') || s.includes('bukhar'));

      const matched: string[] = [];
      if (hasCough) matched.push('Persistent cough (>2 weeks)');
      if (hasWeightLoss) matched.push('Unexplained weight loss');
      if (hasNightSweats) matched.push('Night sweats');
      if (hasHemoptysis) matched.push('Blood in sputum');
      if (hasFever) matched.push('Recurrent low-grade fever');

      if (matched.length >= 2 || hasHemoptysis || (hasCough && matched.length >= 1)) {
        return {
          ruleId: 'NTEP-TB-RULE-01',
          protocolCode: 'NTEP-TB-2024-v2',
          protocolTitle: 'National TB Elimination Programme (NTEP)',
          sourceGuideline: 'MoHFW NTEP Presumptive TB Diagnostic Algorithm',
          urgency: 'HIGH_PRIORITY',
          title: 'Possible TB Symptoms Detected',
          explanation: `Patient matches ${matched.length} cardinal symptom(s) for presumptive tuberculosis per national protocol.`,
          matchedSymptoms: matched,
          recommendedAction: 'Generate urgent referral passport for sputum microscopy & CBNAAT test at PHC/District Hospital. Provide mask and infection control guidance.',
          shouldRefer: true,
          recommendedFacility: 'District Hospital / PHC Chest Clinic',
        };
      }
      return null;
    },
  },

  // 2. High-Risk Pregnancy - Gestational Anemia (MoHFW ANC Guidelines)
  {
    id: 'MOHFW-ANC-ANEMIA-02',
    protocolCode: 'MOHFW-ANC-2023-A2',
    protocolName: 'Maternal Health Division ANC Protocol',
    category: 'MATERNAL_HEALTH',
    title: 'Antenatal Gestational Anemia Surveillance',
    description: 'Identifies moderate or severe anemia in pregnant beneficiaries via Hb levels or pallor.',
    sourceGuideline: 'Anemia Mukt Bharat Operational Guidelines, MoHFW',
    evaluate: (input) => {
      if (input.gender !== 'Female' && input.category !== 'Pregnant') return null;

      const lowerSymptoms = (input.symptoms || []).map((s) => s.toLowerCase());
      const hasFatigue = lowerSymptoms.some((s) => s.includes('fatigue') || s.includes('kamzori') || s.includes('tired'));
      const hasPallor = lowerSymptoms.some((s) => s.includes('pallor') || s.includes('peela') || s.includes('pale'));
      const hb = input.vitals?.hemoglobin;

      const matched: string[] = [];
      if (hb && hb < 11) matched.push(`Low hemoglobin (${hb} g/dL)`);
      if (hasPallor) matched.push('Visible pallor (conjunctiva/nails)');
      if (hasFatigue) matched.push('Excessive fatigue / breathlessness');

      if (hb && hb < 7) {
        return {
          ruleId: 'MOHFW-ANC-ANEMIA-02',
          protocolCode: 'MOHFW-ANC-2023-A2',
          protocolTitle: 'Anemia Mukt Bharat Severe Protocol',
          sourceGuideline: 'MoHFW High Risk Pregnancy Management Guide',
          urgency: 'HIGH_PRIORITY',
          title: 'Severe Anemia in Pregnancy (Hb < 7 g/dL)',
          explanation: 'Hemoglobin below 7 g/dL requires immediate injectable iron or blood transfusion assessment at First Referral Unit (FRU).',
          matchedSymptoms: matched,
          recommendedAction: 'Immediate referral to District Hospital / FRU for parenteral iron sucrose.',
          shouldRefer: true,
          recommendedFacility: 'District Hospital / FRU',
        };
      }

      if (matched.length >= 1 || (hb && hb < 11)) {
        return {
          ruleId: 'MOHFW-ANC-ANEMIA-02',
          protocolCode: 'MOHFW-ANC-2023-A2',
          protocolTitle: 'Anemia Mukt Bharat Operational Guide',
          sourceGuideline: 'MoHFW ANC Nutrition & Micronutrient Protocol',
          urgency: 'FOLLOW_UP',
          title: 'Mild/Moderate Gestational Anemia Risk',
          explanation: 'Beneficiary shows signs of nutritional anemia during antenatal visit according to protocol.',
          matchedSymptoms: matched.length ? matched : ['Reported fatigue & mild headache'],
          recommendedAction: 'Prescribe therapeutic double IFA daily dose (100mg elemental iron), counsel on iron-rich diet and vitamin C. Schedule follow-up check in 14 days.',
          shouldRefer: false,
          recommendedFacility: 'Pipra Sub-Centre / PHC',
        };
      }
      return null;
    },
  },

  // 3. Pre-Eclampsia / Hypertension
  {
    id: 'MOHFW-ANC-HTN-03',
    protocolCode: 'MOHFW-ANC-HTN-01',
    protocolName: 'Gestational Hypertension Protocol',
    category: 'MATERNAL_HEALTH',
    title: 'Pre-Eclampsia & Blood Pressure Surveillance',
    description: 'Screens for elevated systolic/diastolic blood pressure during antenatal visits.',
    sourceGuideline: 'Dakshata / Pradhan Mantri Surakshit Matritva Abhiyan (PMSMA)',
    evaluate: (input) => {
      const bp = input.vitals?.bp;
      if (!bp) return null;
      const parts = bp.split('/');
      const sys = parseInt(parts[0], 10);
      const dia = parseInt(parts[1], 10);

      if ((!isNaN(sys) && sys >= 140) || (!isNaN(dia) && dia >= 90)) {
        return {
          ruleId: 'MOHFW-ANC-HTN-03',
          protocolCode: 'MOHFW-ANC-HTN-01',
          protocolTitle: 'PMSMA High-Risk Pregnancy Protocol',
          sourceGuideline: 'National Health Mission Gestational Hypertension Guidelines',
          urgency: 'HIGH_PRIORITY',
          title: 'Elevated Blood Pressure (Stage 1/2 Pre-Eclampsia)',
          explanation: `Recorded BP ${bp} exceeds safe pregnancy cut-off (140/90 mmHg).`,
          matchedSymptoms: [`High Blood Pressure (${bp})`],
          recommendedAction: 'Immediate referral for physician review, urine albumin test, and antihypertensive initiation if indicated.',
          shouldRefer: true,
          recommendedFacility: 'Primary Health Centre Pipra',
        };
      }
      return null;
    },
  },

  // 4. Immunization Due / Missed
  {
    id: 'UIP-VAC-DELAY-04',
    protocolCode: 'UIP-IND-2024',
    protocolName: 'Universal Immunization Programme (UIP)',
    category: 'CHILD_IMMUNIZATION',
    title: 'Pediatric Vaccine Schedule Due',
    description: 'Tracks routine vaccination milestones according to national immunization schedule.',
    sourceGuideline: 'Immunization Division, MoHFW National Schedule',
    evaluate: (input) => {
      const lowerCond = (input.condition || '').toLowerCase();
      const lowerSymp = (input.symptoms || []).map((s) => s.toLowerCase());
      const isDue = lowerCond.includes('vaccin') || lowerCond.includes('due') || lowerSymp.some((s) => s.includes('due') || s.includes('tika'));

      if (isDue) {
        return {
          ruleId: 'UIP-VAC-DELAY-04',
          protocolCode: 'UIP-IND-2024',
          protocolTitle: 'National Immunization Schedule (NIS)',
          sourceGuideline: 'Mission Indradhanush Microplanning Guidelines',
          urgency: 'ROUTINE',
          title: 'Routine Childhood Vaccination Due',
          explanation: 'Beneficiary has pending scheduled dose according to MCP card schedule.',
          matchedSymptoms: ['Scheduled vaccine milestone pending'],
          recommendedAction: 'Mobilize caregiver for upcoming Wednesday VHSND session at Anganwadi Centre.',
          shouldRefer: false,
          recommendedFacility: 'Anganwadi Centre / Sub-Centre',
        };
      }
      return null;
    },
  },
];

export function evaluateClinicalRules(input: RuleEvaluationInput): RuleEvaluationResult[] {
  const results: RuleEvaluationResult[] = [];
  for (const rule of PROTOCOL_RULES) {
    const res = rule.evaluate(input);
    if (res) {
      results.push(res);
    }
  }

  // If no specific rule triggered, return standard routine clearance
  if (results.length === 0) {
    results.push({
      ruleId: 'GEN-ROUTINE-00',
      protocolCode: 'MOHFW-GEN-2024',
      protocolTitle: 'Routine Frontline Health Surveillance',
      sourceGuideline: 'MoHFW Frontline Worker Household Survey Guidelines',
      urgency: 'ROUTINE',
      title: 'Routine Visit - No Immediate Protocol Flags',
      explanation: 'No urgent or red-flag clinical conditions detected under configured protocol thresholds.',
      matchedSymptoms: input.symptoms.length ? input.symptoms : ['General health maintenance'],
      recommendedAction: 'Continue scheduled household visitation and preventative health education.',
      shouldRefer: false,
      recommendedFacility: 'Pipra Sub-Centre',
    });
  }

  return results;
}
