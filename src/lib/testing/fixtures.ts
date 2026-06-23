/**
 * Fixtures partagées — cas-pivot v0.1 + référentiel seed (sans DB).
 * Source unique pour tests UI, scripts de validation et agent auto-correctif.
 */

import type {
  BiomarkerThreshold,
  Bottleneck,
  BottleneckId,
  CulinaryLever,
  LeverBottleneckMap,
  PatientProfile,
} from '../reasoning/types';

// ───────────────────────────────────────────────────────────
// Bottlenecks (seed 01)
// ───────────────────────────────────────────────────────────

export const BOTTLENECKS: Bottleneck[] = [
  {
    id: 'IR',
    name: 'insulin_resistance',
    display_name_fr: 'Insulinorésistance fonctionnelle',
    priority_rank: 1,
  },
  {
    id: 'INFLAM',
    name: 'inflammaging',
    display_name_fr: 'Inflammaging',
    priority_rank: 2,
  },
  {
    id: 'DYSBIOSE',
    name: 'dysbiosis',
    display_name_fr: 'Dysbiose intestinale',
    priority_rank: 3,
  },
];

// ───────────────────────────────────────────────────────────
// Biomarker thresholds (seed 03 — sous-ensemble utilisé par les cas-pivot)
// ───────────────────────────────────────────────────────────

export const BIOMARKER_THRESHOLDS: BiomarkerThreshold[] = [
  // IR
  { id: 't-ir-1', bottleneck_id: 'IR', biomarker_id: 'HOMA_IR', functional_target_min: null, functional_target_max: 1.3, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: 't-ir-2', bottleneck_id: 'IR', biomarker_id: 'TG_HDL_RATIO', functional_target_min: null, functional_target_max: 1.0, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: 't-ir-3', bottleneck_id: 'IR', biomarker_id: 'HBA1C', functional_target_min: null, functional_target_max: 5.4, alert_threshold_low: null, alert_threshold_high: 5.4, alert_categorical_value: null, weight: 'major' },
  { id: 't-ir-4', bottleneck_id: 'IR', biomarker_id: 'ALT', functional_target_min: null, functional_target_max: 22, alert_threshold_low: null, alert_threshold_high: 25, alert_categorical_value: null, weight: 'moderate' },
  { id: 't-ir-5', bottleneck_id: 'IR', biomarker_id: 'WAIST_HEIGHT_RATIO', functional_target_min: null, functional_target_max: 0.5, alert_threshold_low: null, alert_threshold_high: 0.55, alert_categorical_value: null, weight: 'moderate' },
  { id: 't-ir-6', bottleneck_id: 'IR', biomarker_id: 'FASTING_GLUCOSE', functional_target_min: null, functional_target_max: 0.95, alert_threshold_low: null, alert_threshold_high: 0.95, alert_categorical_value: null, weight: 'moderate' },
  { id: 't-ir-7', bottleneck_id: 'IR', biomarker_id: 'TRIGLYCERIDES', functional_target_min: null, functional_target_max: 0.8, alert_threshold_low: null, alert_threshold_high: 1.2, alert_categorical_value: null, weight: 'moderate' },
  // INFLAM
  { id: 't-in-1', bottleneck_id: 'INFLAM', biomarker_id: 'CRP_US', functional_target_min: null, functional_target_max: 1, alert_threshold_low: null, alert_threshold_high: 1, alert_categorical_value: null, weight: 'major' },
  { id: 't-in-2', bottleneck_id: 'INFLAM', biomarker_id: 'OMEGA_INDEX', functional_target_min: 8, functional_target_max: null, alert_threshold_low: 6, alert_threshold_high: null, alert_categorical_value: null, weight: 'major' },
  { id: 't-in-3', bottleneck_id: 'INFLAM', biomarker_id: 'AA_EPA_RATIO', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 7, alert_categorical_value: null, weight: 'major' },
  { id: 't-in-4', bottleneck_id: 'INFLAM', biomarker_id: 'NLR', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 2.5, alert_categorical_value: null, weight: 'moderate' },
  // DYSBIOSE
  { id: 't-dy-1', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BRISTOL_SCORE', functional_target_min: 3, functional_target_max: 5, alert_threshold_low: 3, alert_threshold_high: 5, alert_categorical_value: null, weight: 'major' },
  { id: 't-dy-2', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BLOATING_FREQ', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 7, alert_categorical_value: null, weight: 'major' },
  { id: 't-dy-3', bottleneck_id: 'DYSBIOSE', biomarker_id: 'ABX_LIFETIME', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'moderate' },
  { id: 't-dy-4', bottleneck_id: 'DYSBIOSE', biomarker_id: 'FIBER_INTAKE', functional_target_min: 25, functional_target_max: null, alert_threshold_low: 15, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
];

// ───────────────────────────────────────────────────────────
// Cas-pivot (README §7 + IntentForm PRESET_CASES)
// ───────────────────────────────────────────────────────────

export interface ValidationCase {
  id: string;
  label: string;
  expected_dominant: BottleneckId;
  patient: PatientProfile;
}

export const VALIDATION_CASES: ValidationCase[] = [
  {
    id: 'caseA',
    label: 'Cas A — IR isolée (F 48 ans)',
    expected_dominant: 'IR',
    patient: {
      age: 48,
      sex: 'F',
      biomarker_values: {
        HOMA_IR: 2.1,
        TG_HDL_RATIO: 1.8,
        ALT: 28,
        WAIST_HEIGHT_RATIO: 0.55,
        TRIGLYCERIDES: 1.3,
        CRP_US: 0.8,
      },
      clinical_signals: {},
      exclusions: {},
      context: { language: 'fr' },
    },
  },
  {
    id: 'caseB',
    label: 'Cas B — INFLAM isolé (H 62 ans)',
    expected_dominant: 'INFLAM',
    patient: {
      age: 62,
      sex: 'M',
      biomarker_values: {
        CRP_US: 2.4,
        OMEGA_INDEX: 4.5,
        AA_EPA_RATIO: 12,
        NLR: 2.8,
        HOMA_IR: 1.2,
      },
      clinical_signals: {},
      exclusions: {},
      context: { language: 'fr' },
    },
  },
  {
    id: 'caseC',
    label: 'Cas C — DYSBIOSE dominante (F 35 ans)',
    expected_dominant: 'DYSBIOSE',
    patient: {
      age: 35,
      sex: 'F',
      biomarker_values: { CRP_US: 1.1, HOMA_IR: 1.4 },
      clinical_signals: {
        BRISTOL_SCORE: 6,
        BLOATING_FREQ: 7,
        FIBER_INTAKE: 12,
        ABX_LIFETIME: 5,
      },
      exclusions: {},
      context: { language: 'fr' },
    },
  },
];

// ───────────────────────────────────────────────────────────
// Leviers minimaux pour tests sélecteur (4 étoiles + ciblés)
// ───────────────────────────────────────────────────────────

export const MINIMAL_LEVERS: CulinaryLever[] = [
  { id: 'L_EVOO_PRIMARY', name_fr: 'EVOO', description: 'd', category: 'ingredient', expected_effect: 'e', ebm_tier: 'T1', is_universal_star: true, active: true },
  { id: 'L_LEGUMINOUSES_REGULAR', name_fr: 'Légumineuses', description: 'd', category: 'ingredient', expected_effect: 'e', ebm_tier: 'T1', is_universal_star: true, active: true, contraindications: ['MICI_active_severe'] },
  { id: 'L_RESISTANT_STARCH', name_fr: 'Amidon résistant', description: 'd', category: 'preparation', expected_effect: 'e', ebm_tier: 'T1', is_universal_star: true, active: true },
  { id: 'L_PLANT_DIVERSITY_30', name_fr: 'Diversité végétale', description: 'd', category: 'ingredient', expected_effect: 'e', ebm_tier: 'T1', is_universal_star: true, active: true },
  { id: 'L_CINNAMON_POSTPRANDIAL', name_fr: 'Cannelle post-prandiale', description: 'd', category: 'ingredient', expected_effect: 'e', ebm_tier: 'T2', is_universal_star: false, active: true },
  { id: 'L_FERMENTED_FOODS', name_fr: 'Aliments fermentés', description: 'd', category: 'fermentation', expected_effect: 'e', ebm_tier: 'T2', is_universal_star: false, active: true },
  { id: 'L_BONE_BROTH', name_fr: 'Bouillon d\'os', description: 'd', category: 'ingredient', expected_effect: 'e', ebm_tier: 'T3', is_universal_star: false, active: true },
];

export const MINIMAL_LEVER_MAP: LeverBottleneckMap[] = [
  { lever_id: 'L_EVOO_PRIMARY', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 1 },
  { lever_id: 'L_EVOO_PRIMARY', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T1', priority: 1 },
  { lever_id: 'L_EVOO_PRIMARY', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T2', priority: 1 },
  { lever_id: 'L_LEGUMINOUSES_REGULAR', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 2 },
  { lever_id: 'L_LEGUMINOUSES_REGULAR', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T1', priority: 2 },
  { lever_id: 'L_RESISTANT_STARCH', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 3 },
  { lever_id: 'L_RESISTANT_STARCH', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T2', priority: 3 },
  { lever_id: 'L_PLANT_DIVERSITY_30', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 4 },
  { lever_id: 'L_PLANT_DIVERSITY_30', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T1', priority: 4 },
  { lever_id: 'L_CINNAMON_POSTPRANDIAL', bottleneck_id: 'IR', tier_for_bottleneck: 'T2', priority: 5 },
  { lever_id: 'L_FERMENTED_FOODS', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T2', priority: 5 },
  { lever_id: 'L_BONE_BROTH', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T3', priority: 6 },
  { lever_id: 'L_CINNAMON_POSTPRANDIAL', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T2', priority: 5 },
];
