/**
 * Public demo cases A/B/C + custom template.
 * Same profiles as the interactive /demo page — kept here so tests and UI share one source.
 */

import type { BiomarkerThreshold, Bottleneck, PatientProfile } from '@/lib/reasoning/types';

export type DemoCaseKey = 'A' | 'B' | 'C' | 'custom';

export const DEMO_BOTTLENECKS: Bottleneck[] = [
  { id: 'IR', name: 'insulin_resistance', display_name_fr: 'Insulinorésistance', priority_rank: 1 },
  { id: 'INFLAM', name: 'inflammaging', display_name_fr: 'Inflammaging', priority_rank: 2 },
  { id: 'DYSBIOSE', name: 'dysbiosis', display_name_fr: 'Dysbiose', priority_rank: 3 },
];

/** Subset of seed thresholds — enough to classify the three public cases. */
export const DEMO_THRESHOLDS: BiomarkerThreshold[] = [
  { id: '1', bottleneck_id: 'IR', biomarker_id: 'HOMA_IR', functional_target_min: null, functional_target_max: 1.3, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '2', bottleneck_id: 'IR', biomarker_id: 'TG_HDL_RATIO', functional_target_min: null, functional_target_max: 1.0, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '3', bottleneck_id: 'IR', biomarker_id: 'ALT', functional_target_min: null, functional_target_max: 22, alert_threshold_low: null, alert_threshold_high: 25, alert_categorical_value: null, weight: 'moderate' },
  { id: '4', bottleneck_id: 'IR', biomarker_id: 'FASTING_INSULIN', functional_target_min: null, functional_target_max: 6, alert_threshold_low: null, alert_threshold_high: 8, alert_categorical_value: null, weight: 'major' },
  { id: '5', bottleneck_id: 'INFLAM', biomarker_id: 'CRP_US', functional_target_min: null, functional_target_max: 1, alert_threshold_low: null, alert_threshold_high: 1, alert_categorical_value: null, weight: 'major' },
  { id: '6', bottleneck_id: 'INFLAM', biomarker_id: 'OMEGA3_INDEX', functional_target_min: 8, functional_target_max: null, alert_threshold_low: 6, alert_threshold_high: null, alert_categorical_value: null, weight: 'major' },
  { id: '7', bottleneck_id: 'INFLAM', biomarker_id: 'AA_EPA_RATIO', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 7, alert_categorical_value: null, weight: 'major' },
  { id: '8', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BRISTOL_SCORE', functional_target_min: null, functional_target_max: null, alert_threshold_low: 3, alert_threshold_high: 5, alert_categorical_value: null, weight: 'major' },
  { id: '9', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BLOATING_FREQ', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'major' },
  { id: '10', bottleneck_id: 'DYSBIOSE', biomarker_id: 'CALPROTECTIN', functional_target_min: null, functional_target_max: 50, alert_threshold_low: null, alert_threshold_high: 50, alert_categorical_value: null, weight: 'major' },
  { id: '11', bottleneck_id: 'DYSBIOSE', biomarker_id: 'ABX_LIFETIME', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'moderate' },
  { id: '12', bottleneck_id: 'DYSBIOSE', biomarker_id: 'FIBER_INTAKE', functional_target_min: 25, functional_target_max: null, alert_threshold_low: 15, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
  { id: '13', bottleneck_id: 'DYSBIOSE', biomarker_id: 'PLANT_DIVERSITY', functional_target_min: 30, functional_target_max: null, alert_threshold_low: 15, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
];

export const CUSTOM_TEMPLATE: PatientProfile = {
  biomarker_values: {
    HOMA_IR: 1.2,
    TG_HDL_RATIO: 1.0,
    CRP_US: 0.6,
    OMEGA3_INDEX: 8,
  },
  clinical_signals: {
    BRISTOL_SCORE: 4,
    FIBER_INTAKE: 25,
  },
  exclusions: {},
  context: {},
};

export interface DemoCaseDef {
  key: Exclude<DemoCaseKey, 'custom'>;
  name: string;
  expected_dominant: 'IR' | 'INFLAM' | 'DYSBIOSE';
  patient: PatientProfile;
}

export const DEMO_CASES: Record<Exclude<DemoCaseKey, 'custom'>, DemoCaseDef> = {
  A: {
    key: 'A',
    name: 'Cas A — IR isolée (F 48 ans, HOMA-IR 2.1)',
    expected_dominant: 'IR',
    patient: {
      biomarker_values: { HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, ALT: 28, FASTING_INSULIN: 9, CRP_US: 0.8 },
      clinical_signals: {},
      exclusions: {},
      context: {},
    },
  },
  B: {
    key: 'B',
    name: 'Cas B — Inflammaging (H 62 ans, CRP-us 2.4)',
    expected_dominant: 'INFLAM',
    patient: {
      biomarker_values: { CRP_US: 2.4, OMEGA3_INDEX: 4.5, AA_EPA_RATIO: 12, HOMA_IR: 1.2 },
      clinical_signals: {},
      exclusions: {},
      context: {},
    },
  },
  C: {
    key: 'C',
    name: 'Cas C — Dysbiose + INFLAM (F 35 ans, Bristol 6)',
    expected_dominant: 'DYSBIOSE',
    patient: {
      biomarker_values: { CALPROTECTIN: 80, CRP_US: 1.1, OMEGA3_INDEX: 5.5, HOMA_IR: 1.4 },
      clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQ: 5, ABX_LIFETIME: 5, FIBER_INTAKE: 12 },
      exclusions: {},
      context: {},
    },
  },
};

export const BIOMARKER_LABELS: Record<string, string> = {
  HOMA_IR: 'HOMA-IR',
  TG_HDL_RATIO: 'TG/HDL',
  ALT: 'ALT (TGP)',
  FASTING_INSULIN: 'Insuline à jeun',
  CRP_US: 'CRP-us (mg/L)',
  OMEGA3_INDEX: 'Omega-3 Index (%)',
  AA_EPA_RATIO: 'AA/EPA',
  CALPROTECTIN: 'Calprotectine (µg/g)',
  BRISTOL_SCORE: 'Bristol Stool',
  BLOATING_FREQ: 'Ballonnements (/sem)',
  ABX_LIFETIME: 'Antibio. lifetime (n)',
  FIBER_INTAKE: 'Fibres (g/j)',
  PLANT_DIVERSITY: 'Plantes/semaine',
};

export function loadDemoPatient(key: DemoCaseKey): PatientProfile {
  if (key === 'custom') {
    return {
      biomarker_values: { ...CUSTOM_TEMPLATE.biomarker_values },
      clinical_signals: { ...CUSTOM_TEMPLATE.clinical_signals },
      exclusions: {},
      context: {},
    };
  }
  const c = DEMO_CASES[key];
  return {
    biomarker_values: { ...c.patient.biomarker_values },
    clinical_signals: { ...c.patient.clinical_signals },
    exclusions: {},
    context: {},
  };
}
