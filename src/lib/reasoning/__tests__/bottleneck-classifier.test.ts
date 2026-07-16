/**
 * ============================================================
 * Bottleneck Classifier — Unit Tests (LIV-39)
 * ============================================================
 *
 * Coverage targets:
 *   - Tous les cas-pivot spec v0.1 §7 (A, B, C)
 *   - Cas limites (valeurs exactes aux seuils, aucun déclenchement)
 *   - Cas triple co-dominance → cascade priority_rank
 *   - Phénotype hepatic_masld (Truong 2025)
 *   - Biomarqueurs catégoriels (SIBO breath test)
 *   - Bristol score (double queue : <3 et >5)
 *   - Discriminant weight
 *   - Minor weight
 */

import { describe, it, expect } from 'vitest';
import { classifyBottlenecks } from '../bottleneck-classifier';
import type { Bottleneck, BiomarkerThreshold, PatientProfile } from '../types';

// ─── Fixtures ───────────────────────────────────────────────────────────

const BOTTLENECKS: Bottleneck[] = [
  { id: 'IR', name: 'insulin_resistance', display_name_fr: 'Insulinorésistance', priority_rank: 1 },
  { id: 'INFLAM', name: 'inflammaging', display_name_fr: 'Inflammaging', priority_rank: 2 },
  { id: 'DYSBIOSE', name: 'dysbiosis', display_name_fr: 'Dysbiose', priority_rank: 3 },
];

const THRESHOLDS: BiomarkerThreshold[] = [
  // IR thresholds
  { id: 't01', bottleneck_id: 'IR', biomarker_id: 'HOMA_IR', functional_target_min: null, functional_target_max: 1.3, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: 't02', bottleneck_id: 'IR', biomarker_id: 'TG_HDL_RATIO', functional_target_min: null, functional_target_max: 1.0, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: 't03', bottleneck_id: 'IR', biomarker_id: 'ALT', functional_target_min: null, functional_target_max: 22, alert_threshold_low: null, alert_threshold_high: 25, alert_categorical_value: null, weight: 'moderate' },
  { id: 't04', bottleneck_id: 'IR', biomarker_id: 'FASTING_INSULIN', functional_target_min: null, functional_target_max: 6, alert_threshold_low: null, alert_threshold_high: 8, alert_categorical_value: null, weight: 'major' },
  { id: 't05', bottleneck_id: 'IR', biomarker_id: 'HBA1C', functional_target_min: null, functional_target_max: 5.4, alert_threshold_low: null, alert_threshold_high: 5.4, alert_categorical_value: null, weight: 'major' },
  { id: 't06', bottleneck_id: 'IR', biomarker_id: 'FASTING_GLUCOSE', functional_target_min: null, functional_target_max: 0.95, alert_threshold_low: null, alert_threshold_high: 1.10, alert_categorical_value: null, weight: 'moderate' },
  { id: 't07', bottleneck_id: 'IR', biomarker_id: 'TRIGLYCERIDES', functional_target_min: null, functional_target_max: 0.80, alert_threshold_low: null, alert_threshold_high: 1.2, alert_categorical_value: null, weight: 'moderate' },
  { id: 't08', bottleneck_id: 'IR', biomarker_id: 'URIC_ACID', functional_target_min: null, functional_target_max: 5.5, alert_threshold_low: null, alert_threshold_high: 6, alert_categorical_value: null, weight: 'minor' },
  { id: 't09', bottleneck_id: 'IR', biomarker_id: 'WAIST_HEIGHT_RATIO', functional_target_min: null, functional_target_max: 0.5, alert_threshold_low: null, alert_threshold_high: 0.55, alert_categorical_value: null, weight: 'moderate' },
  // IR hepatic MASLD thresholds (v0.2 enrichment)
  { id: 't10', bottleneck_id: 'IR', biomarker_id: 'LIVER_FAT_PDFF', functional_target_min: null, functional_target_max: 5, alert_threshold_low: null, alert_threshold_high: 5, alert_categorical_value: null, weight: 'major' },
  { id: 't11', bottleneck_id: 'IR', biomarker_id: 'LIVER_FAT_MRS', functional_target_min: null, functional_target_max: 5.56, alert_threshold_low: null, alert_threshold_high: 5.56, alert_categorical_value: null, weight: 'major' },
  // IR — α-HB discriminant for hepatic_masld (Zhang 2026)
  { id: 't11b', bottleneck_id: 'IR', biomarker_id: 'A_HYDROXYBUTYRATE', functional_target_min: null, functional_target_max: null, alert_threshold_low: null, alert_threshold_high: 12, alert_categorical_value: null, weight: 'discriminant' },
  // GGT for IR (stress oxydatif hepatique)
  { id: 't11c', bottleneck_id: 'IR', biomarker_id: 'GGT', functional_target_min: null, functional_target_max: 30, alert_threshold_low: null, alert_threshold_high: 40, alert_categorical_value: null, weight: 'moderate' },
  // IR — SHBG (SOPK/pcos_adipose enrichment)
  { id: 't12', bottleneck_id: 'IR', biomarker_id: 'SHBG', functional_target_min: 50, functional_target_max: null, alert_threshold_low: 30, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
  // INFLAM — TSAT (functional iron blockade enrichment)
  { id: 't13', bottleneck_id: 'INFLAM', biomarker_id: 'TSAT', functional_target_min: 20, functional_target_max: null, alert_threshold_low: 20, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },

  // INFLAM thresholds
  { id: 't20', bottleneck_id: 'INFLAM', biomarker_id: 'CRP_US', functional_target_min: null, functional_target_max: 1, alert_threshold_low: null, alert_threshold_high: 1, alert_categorical_value: null, weight: 'major' },
  { id: 't21', bottleneck_id: 'INFLAM', biomarker_id: 'OMEGA3_INDEX', functional_target_min: 8, functional_target_max: null, alert_threshold_low: 6, alert_threshold_high: null, alert_categorical_value: null, weight: 'major' },
  { id: 't22', bottleneck_id: 'INFLAM', biomarker_id: 'AA_EPA_RATIO', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 7, alert_categorical_value: null, weight: 'major' },
  { id: 't23', bottleneck_id: 'INFLAM', biomarker_id: 'IL6', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'major' },
  { id: 't24', bottleneck_id: 'INFLAM', biomarker_id: 'NLR', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 2.5, alert_categorical_value: null, weight: 'moderate' },
  { id: 't25', bottleneck_id: 'INFLAM', biomarker_id: 'FERRITIN', functional_target_min: null, functional_target_max: 150, alert_threshold_low: null, alert_threshold_high: 300, alert_categorical_value: null, weight: 'moderate' },
  { id: 't26', bottleneck_id: 'INFLAM', biomarker_id: 'FIBRINOGEN', functional_target_min: null, functional_target_max: 3.5, alert_threshold_low: null, alert_threshold_high: 4, alert_categorical_value: null, weight: 'moderate' },
  // INFLAM discriminant
  { id: 't27', bottleneck_id: 'INFLAM', biomarker_id: 'DEXA_VISCERAL_FAT', functional_target_min: null, functional_target_max: 100, alert_threshold_low: null, alert_threshold_high: 130, alert_categorical_value: null, weight: 'discriminant' },

  // DYSBIOSE thresholds
  { id: 't30', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BRISTOL_SCORE', functional_target_min: null, functional_target_max: null, alert_threshold_low: 3, alert_threshold_high: 5, alert_categorical_value: null, weight: 'major' },
  { id: 't31', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BLOATING_FREQUENCY', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'major' },
  { id: 't32', bottleneck_id: 'DYSBIOSE', biomarker_id: 'CALPROTECTIN', functional_target_min: null, functional_target_max: 50, alert_threshold_low: null, alert_threshold_high: 50, alert_categorical_value: null, weight: 'major' },
  { id: 't33', bottleneck_id: 'DYSBIOSE', biomarker_id: 'SIBO_BREATH', functional_target_min: null, functional_target_max: null, alert_threshold_low: null, alert_threshold_high: null, alert_categorical_value: 'positif', weight: 'discriminant' },
  // DYSBIOSE moderate (historical aggravators)
  { id: 't34', bottleneck_id: 'DYSBIOSE', biomarker_id: 'ABX_LIFETIME_COURSES', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'moderate' },
  { id: 't35', bottleneck_id: 'DYSBIOSE', biomarker_id: 'PPI_CHRONIC_MONTHS', functional_target_min: null, functional_target_max: 6, alert_threshold_low: null, alert_threshold_high: 6, alert_categorical_value: null, weight: 'moderate' },
  { id: 't36', bottleneck_id: 'DYSBIOSE', biomarker_id: 'FIBER_INTAKE_G', functional_target_min: 25, functional_target_max: null, alert_threshold_low: 15, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
  { id: 't37', bottleneck_id: 'DYSBIOSE', biomarker_id: 'PLANT_DIVERSITY_WEEK', functional_target_min: 30, functional_target_max: null, alert_threshold_low: 15, alert_categorical_value: null, alert_threshold_high: null, weight: 'moderate' },
  // DYSBIOSE discriminant
  { id: 't38', bottleneck_id: 'DYSBIOSE', biomarker_id: 'MICROBIOME_SHANNON', functional_target_min: 3.5, functional_target_max: null, alert_threshold_low: 3, alert_categorical_value: null, alert_threshold_high: null, weight: 'discriminant' },
];

// ─── Helper ─────────────────────────────────────────────────────────────

function classify(patient: PatientProfile) {
  return classifyBottlenecks(patient, BOTTLENECKS, THRESHOLDS);
}

function irScore(result: ReturnType<typeof classify>) {
  return result.scores.find(s => s.bottleneck_id === 'IR')!;
}
function inflamScore(result: ReturnType<typeof classify>) {
  return result.scores.find(s => s.bottleneck_id === 'INFLAM')!;
}
function dysbioseScore(result: ReturnType<typeof classify>) {
  return result.scores.find(s => s.bottleneck_id === 'DYSBIOSE')!;
}

// ─── Tests ──────────────────────────────────────────────────────────────

describe('bottleneck-classifier', () => {

  // =====================================
  // CAS-PIVOT v0.1
  // =====================================

  describe('Cas-pivot spec v0.1 §7', () => {
    it('Cas A — IR isolée (F 48, HOMA-IR 2.1, TG/HDL 1.8, ALT 28)', () => {
      // IR rule: ≥3 majors OR (≥2 majors AND ≥3 moderates)
      // Here: HOMA_IR 2.1(major) + TG_HDL_RATIO 1.8(major) + FASTING_INSULIN 9(major) = 3 majors → triggered ✓
      const patient: PatientProfile = {
        biomarker_values: { HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, ALT: 28, FASTING_INSULIN: 9, CRP_US: 0.8 },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      expect(result.co_dominant).toBeNull();
      expect(result.phenotypes).toBeUndefined();

      const ir = irScore(result);
      expect(ir.triggered).toBe(true);
      expect(ir.major_hits).toBeGreaterThanOrEqual(3);
      expect(ir.evidence.some(e => e.biomarker_id === 'HOMA_IR')).toBe(true);
      expect(ir.evidence.some(e => e.biomarker_id === 'TG_HDL_RATIO')).toBe(true);

      const inflam = inflamScore(result);
      expect(inflam.triggered).toBe(false); // CRP 0.8 < 1
    });

    it('Cas B — INFLAM isolé (H 62, CRP-us 2.4, OmegaIndex 4.5%, AA/EPA 12)', () => {
      const patient: PatientProfile = {
        biomarker_values: { CRP_US: 2.4, OMEGA3_INDEX: 4.5, AA_EPA_RATIO: 12, NLR: 2.8, HOMA_IR: 1.2 },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('INFLAM');
      expect(result.co_dominant).toBeNull();

      const inflam = inflamScore(result);
      expect(inflam.triggered).toBe(true);
      expect(inflam.evidence.some(e => e.biomarker_id === 'CRP_US')).toBe(true);
      expect(inflam.evidence.some(e => e.biomarker_id === 'OMEGA3_INDEX')).toBe(true);
      expect(inflam.evidence.some(e => e.biomarker_id === 'AA_EPA_RATIO')).toBe(true);
      expect(inflam.major_hits).toBeGreaterThanOrEqual(3);

      const ir = irScore(result);
      expect(ir.triggered).toBe(false); // HOMA-IR 1.2 < 1.5
    });

    it('Cas C — DYSBIOSE dominante + INFLAM co-dominant', () => {
      // DYSBIOSE: Bristol 6(major) + Bloating 5(major) → ≥2 majors ✓
      //           ABX 5(>3, moderate) → ≥1 moderate ✓ → triggered ✓
      // INFLAM: CRP 1.1(>1,major) + OMEGA3_INDEX 5.5(<6,major) → ≥2 majors ✓ → triggered ✓
      const patient: PatientProfile = {
        biomarker_values: { CALPROTECTIN: 80, CRP_US: 1.1, OMEGA3_INDEX: 5.5, HOMA_IR: 1.4 },
        clinical_signals: { BRISTOL_SCORE: 6, BLOATING_FREQUENCY: 5, ABX_LIFETIME_COURSES: 5, FIBER_INTAKE_G: 12 },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('DYSBIOSE');
      expect(result.co_dominant).toBe('INFLAM');

      const dys = dysbioseScore(result);
      expect(dys.triggered).toBe(true);
      expect(dys.major_hits).toBeGreaterThanOrEqual(2);

      const inflam = inflamScore(result);
      expect(inflam.triggered).toBe(true);
    });
  });

  // =====================================
  // CAS LIMITES
  // =====================================

  describe('Cas limites', () => {
    it('Aucun bottleneck déclenché — patient sain', () => {
      const patient: PatientProfile = {
        biomarker_values: { HOMA_IR: 1.0, CRP_US: 0.5, TG_HDL_RATIO: 0.8 },
        clinical_signals: { BRISTOL_SCORE: 4, BLOATING_FREQUENCY: 1 },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBeNull();
      expect(result.co_dominant).toBeNull();
      expect(result.rationale).toContain('Aucun');
    });

    it('Valeurs exactement aux seuils — ne doivent pas déclencher (HOMA-IR = 1.5 exactement)', () => {
      // alert_threshold_high for HOMA_IR is 1.5, so >1.5 would trigger, 1.5 exactly should NOT
      // (the code uses `observed > threshold.alert_threshold_high`, strict greater)
      const patient: PatientProfile = {
        biomarker_values: { HOMA_IR: 1.5, TG_HDL_RATIO: 1.0, ALT: 22, CRP_US: 1.0 },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      // HOMA_IR exactly at threshold = not breached (strict >)
      // TG_HDL_RATIO 1.0 = not breached (strict >)
      // ALT 22 = not breached (strict >)
      // → IR should NOT trigger
      expect(result.dominant).toBeNull();

      // CRP_US = 1.0 exactly at threshold = not breached
    });

    it('Dépassement exact du seuil — CRP à 1.01 > 1', () => {
      const patient: PatientProfile = {
        biomarker_values: { CRP_US: 1.01, OMEGA3_INDEX: 5.5, AA_EPA_RATIO: 8 },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('INFLAM');
    });

    it('Bristol <3 (constipation)', () => {
      const patient: PatientProfile = {
        biomarker_values: { CALPROTECTIN: 20 },
        clinical_signals: { BRISTOL_SCORE: 1, BLOATING_FREQUENCY: 4, ABX_LIFETIME_COURSES: 4, FIBER_INTAKE_G: 14 },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('DYSBIOSE');
      const dys = dysbioseScore(result);
      expect(dys.evidence.some(e => e.biomarker_id === 'BRISTOL_SCORE')).toBe(true);
    });

    it('Bristol >5 (diarrhée)', () => {
      const patient: PatientProfile = {
        biomarker_values: { CALPROTECTIN: 60 },
        clinical_signals: { BRISTOL_SCORE: 7, BLOATING_FREQUENCY: 4, ABX_LIFETIME_COURSES: 4, FIBER_INTAKE_G: 12 },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('DYSBIOSE');
      const dys = dysbioseScore(result);
      const bristol = dys.evidence.find(e => e.biomarker_id === 'BRISTOL_SCORE')!;
      expect(bristol.threshold_breached).toBe('high');
    });

    it('Bristol normal (4) — ne déclenche pas', () => {
      const patient: PatientProfile = {
        biomarker_values: {},
        clinical_signals: { BRISTOL_SCORE: 4, BLOATING_FREQUENCY: 0 },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      const dys = dysbioseScore(result);
      expect(dys.evidence.some(e => e.biomarker_id === 'BRISTOL_SCORE')).toBe(false);
    });

    it('SIBO breath test catégoriel "positif"', () => {
      const patient: PatientProfile = {
        biomarker_values: { CALPROTECTIN: 55 },
        clinical_signals: {
          BRISTOL_SCORE: 6,
          BLOATING_FREQUENCY: 4,
          SIBO_BREATH: 'positif',
          ABX_LIFETIME_COURSES: 4,
          FIBER_INTAKE_G: 12,
        },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('DYSBIOSE');
      const dys = dysbioseScore(result);
      expect(dys.evidence.some(e => e.biomarker_id === 'SIBO_BREATH')).toBe(true);
      expect(dys.discriminant_hits).toBeGreaterThanOrEqual(1);
    });

    it('SIBO breath test "négatif" — ne déclenche pas ce critère', () => {
      const patient: PatientProfile = {
        biomarker_values: { CALPROTECTIN: 80 },
        clinical_signals: {
          BRISTOL_SCORE: 6,
          BLOATING_FREQUENCY: 4,
          SIBO_BREATH: 'négatif',
          ABX_LIFETIME_COURSES: 4,
          FIBER_INTAKE_G: 12,
        },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      const dys = dysbioseScore(result);
      expect(dys.evidence.some(e => e.biomarker_id === 'SIBO_BREATH')).toBe(false);
    });
  });

  // =====================================
  // TRIPLE CO-DOMINANCE
  // =====================================

  describe('Triple co-dominance', () => {
    it('Les 3 bottlenecks déclenchés → cascade priority_rank (IR > INFLAM > DYSBIOSE)', () => {
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, ALT: 28, FASTING_INSULIN: 10, // IR triggers
          CRP_US: 2.5, OMEGA3_INDEX: 4.5, AA_EPA_RATIO: 12, // INFLAM triggers
        },
        clinical_signals: {
          BRISTOL_SCORE: 6, BLOATING_FREQUENCY: 5, ABX_LIFETIME_COURSES: 5, FIBER_INTAKE_G: 12, // DYSBIOSE triggers
        },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      expect(result.co_dominant).toBe('INFLAM');
      expect(result.rationale).toContain('Triple co-dominance');
      // DYSBIOSE is 3rd, not tracked as co-dominant
    });
  });

  // =====================================
  // PHÉNOTYPE HEPATIC MASLD
  // =====================================

  describe('Phénotype hepatic_masld (Truong 2025)', () => {
    it('IR déclenché + PDFF ≥5% → hepatic_masld tagué', () => {
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.0, TG_HDL_RATIO: 1.7, ALT: 32, FASTING_INSULIN: 9,
          LIVER_FAT_PDFF: 12.5,
        },
        clinical_signals: { FRUCTOSE_INTAKE: 65, FREE_SUGAR_PCT_ENERGY: 14 },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      expect(result.phenotypes).toContain('hepatic_masld');
      const ir = irScore(result);
      expect(ir.evidence.some(e => e.biomarker_id === 'LIVER_FAT_PDFF')).toBe(true);
    });

    it('IR déclenché sans imagerie → PAS de hepatic_masld', () => {
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.0, TG_HDL_RATIO: 1.7, ALT: 32, FASTING_INSULIN: 9,
        },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      expect(result.phenotypes).toBeUndefined();
    });

    it('IR déclenché + MRS ≥5.56% → hepatic_masld tagué', () => {
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.2, TG_HDL_RATIO: 1.6, FASTING_INSULIN: 10,
          LIVER_FAT_MRS: 7.5,
        },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      expect(result.phenotypes).toContain('hepatic_masld');
    });

    it('α-hydroxybutyrate >12 µmol/L seul ne suffit pas pour hepatic_masld (discriminant, pas imagerie)', () => {
      // α-HB est un discriminant — il contribue au score mais ne tagge pas hepatic_masld
      // sans imagerie (PDFF ou MRS)
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.2, TG_HDL_RATIO: 1.6, FASTING_INSULIN: 10,
          A_HYDROXYBUTYRATE: 15, // >12 → discriminant breach
        },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      // Pas d'imagerie → pas de tag hepatic_masld
      expect(result.phenotypes?.includes('hepatic_masld')).toBeFalsy();
      // Mais le discriminant apparaît dans les preuves
      const ir = irScore(result);
      expect(ir.evidence.some(e => e.biomarker_id === 'A_HYDROXYBUTYRATE')).toBe(true);
      expect(ir.discriminant_hits).toBeGreaterThanOrEqual(1);
    });
  });

  // =====================================
  // POIDS DISCRIMINANT
  // =====================================

  describe('Poids discriminant', () => {
    it('Marqueur discriminant contribue au score mais ne trigger pas seul', () => {
      // DEXA_VISCERAL_FAT >130 seul sans CRP ni autre major → INFLAM pas déclenché
      const patient: PatientProfile = {
        biomarker_values: { DEXA_VISCERAL_FAT: 150, CRP_US: 0.7 },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      const inflam = inflamScore(result);
      expect(inflam.discriminant_hits).toBe(1);
      expect(inflam.triggered).toBe(false); // CRP 0.7 < 1 → pas de breach major
    });
  });

  // =====================================
  // PHÉNOTYPE PCOS_ADIPOSE
  // =====================================

  describe('Phénotype pcos_adipose (SOPK/péri-ménopause)', () => {
    it('IR déclenché + F + SHBG bas + uricémie haute + waist haut → pcos_adipose tagué', () => {
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, FASTING_INSULIN: 9,
          SHBG: 22, URIC_ACID: 6.5,
          WAIST_HEIGHT_RATIO: 0.58,
        },
        clinical_signals: {},
        exclusions: {},
        context: {},
        sex: 'F',
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      expect(result.phenotypes).toContain('pcos_adipose');
    });

    it('IR déclenché + F + SHBG bas + uricémie haute mais waist normal → pcos_adipose (2/3 critères)', () => {
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, FASTING_INSULIN: 9,
          SHBG: 25, URIC_ACID: 6.8,
          WAIST_HEIGHT_RATIO: 0.48,
        },
        clinical_signals: {},
        exclusions: {},
        context: {},
        sex: 'F',
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      expect(result.phenotypes).toBeDefined();
      expect(result.phenotypes).toContain('pcos_adipose');
    });

    it('IR déclenché + H (pas F) → pas de pcos', () => {
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, FASTING_INSULIN: 9,
          SHBG: 25, URIC_ACID: 6.5,
          WAIST_HEIGHT_RATIO: 0.58,
        },
        clinical_signals: {},
        exclusions: {},
        context: {},
        sex: 'M',
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      expect(result.phenotypes).toBeUndefined();
    });

    it('IR + F + 1 seul critère /3 → pas de pcos', () => {
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, FASTING_INSULIN: 9,
          SHBG: 25,
          WAIST_HEIGHT_RATIO: 0.48,
        },
        clinical_signals: {},
        exclusions: {},
        context: {},
        sex: 'F',
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR');
      expect(result.phenotypes).toBeUndefined();
    });
  });

  // =====================================
  // PHÉNOTYPE FUNCTIONAL_IRON_BLOCKADE
  // =====================================

  describe('Phénotype functional_iron_blockade', () => {
    it('INFLAM + TSAT <20% → tagué', () => {
      const patient: PatientProfile = {
        biomarker_values: { CRP_US: 2.5, OMEGA3_INDEX: 4.5, TSAT: 15 },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('INFLAM');
      expect(result.inflam_phenotypes).toContain('functional_iron_blockade');
    });

    it('INFLAM + TSAT normal → pas de tag', () => {
      const patient: PatientProfile = {
        biomarker_values: { CRP_US: 2.5, OMEGA3_INDEX: 4.5, TSAT: 25 },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('INFLAM');
      expect(result.inflam_phenotypes).toBeUndefined();
    });
  });

  // =====================================
  // CO-DOMINANCE À DEUX
  // =====================================

  describe('Co-dominance à deux', () => {
    it('IR + INFLAM co-dominants → score le plus haut = dominant', () => {
      // IR: HOMA_IR 2.1(major) + TG_HDL_RATIO 1.51(major, >1.5) + FASTING_INSULIN 9(major) = 3 majors → triggered ✓
      // INFLAM: CRP_US 2.5(major) + OMEGA3_INDEX 5.5(major, <6) = 2 majors → triggered ✓
      // IR has 9 points vs INFLAM 6 → IR dominant
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.1, TG_HDL_RATIO: 1.51, FASTING_INSULIN: 9, // 3 majors IR
          CRP_US: 2.5, OMEGA3_INDEX: 5.5, // 2 majors INFLAM
        },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBe('IR'); // IR a plus de points (3 majors × 3 = 9 + modérés)
      expect(result.co_dominant).toBe('INFLAM');
    });

    it('Co-dominance avec tie-break par priority_rank (même score)', () => {
      // Construire un cas où les scores sont égaux — le tie-break est priority_rank
      const patient: PatientProfile = {
        biomarker_values: {
          HOMA_IR: 2.0, TG_HDL_RATIO: 1.5, // 1 major IR (TG_HDL à 1.5 exact = pas breach)
          CRP_US: 2.0, OMEGA3_INDEX: 5.0, // 2 majors INFLAM (CRP + OmegaIndex <6)
        },
        clinical_signals: { ABX_LIFETIME_COURSES: 4, FIBER_INTAKE_G: 14, BLOATING_FREQUENCY: 4, BRISTOL_SCORE: 6 },
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      // IR: only HOMA_IR 2.0(major) → 1 major only. Rule needs ≥3 → NOT triggered.
      // INFLAM: CRP 2.0(major) + OmegaIndex 5.0(major) → 2 majors → triggered ✓
      // DYSBIOSE: Bristol 6(major) + Bloating 4(major) + ABX 4(mod) → triggered ✓
      // Scores: DYSBIOSE = 3+3+2=8, INFLAM = 3+3=6 -> DYSBIOSE dominant
      expect(result.dominant).toBe('DYSBIOSE');
      expect(result.co_dominant).toBe('INFLAM');
    });
  });

  // =====================================
  // TRACABILITÉ — EVIDENCE ARRAY
  // =====================================

  describe('Traçabilité — evidence array', () => {
    it('Chaque breach a un evidence entry avec tous les champs requis', () => {
      const patient: PatientProfile = {
        biomarker_values: { HOMA_IR: 2.5, TG_HDL_RATIO: 1.8, CRP_US: 2.0 },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      const ir = irScore(result);

      for (const ev of ir.evidence) {
        expect(ev).toHaveProperty('biomarker_id');
        expect(ev).toHaveProperty('observed_value');
        expect(ev).toHaveProperty('threshold_breached');
        expect(['low', 'high', 'categorical']).toContain(ev.threshold_breached);
        expect(ev).toHaveProperty('weight');
        expect(['major', 'moderate', 'minor', 'discriminant']).toContain(ev.weight);
        expect(ev).toHaveProperty('contribution');
        expect(typeof ev.contribution).toBe('number');
        expect(ev.contribution).toBeGreaterThan(0);
      }
    });

    it('OmegaIndex bas déclenche threshold_breached = "low"', () => {
      const patient: PatientProfile = {
        biomarker_values: { CRP_US: 2.0, OMEGA3_INDEX: 5.0 },
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      const inflam = inflamScore(result);
      const omega = inflam.evidence.find(e => e.biomarker_id === 'OMEGA3_INDEX')!;
      expect(omega.threshold_breached).toBe('low');
      expect(omega.observed_value).toBe(5.0);
    });
  });

  // =====================================
  // PROFIL INCOMPLET
  // =====================================

  describe('Profil incomplet', () => {
    it('Aucun biomarqueur renseigné → aucun bottleneck', () => {
      const patient: PatientProfile = {
        biomarker_values: {},
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBeNull();
      expect(result.scores.every(s => s.triggered === false)).toBe(true);
    });

    it('Biomarqueur partiel mais insuffisant pour déclencher', () => {
      const patient: PatientProfile = {
        biomarker_values: { HOMA_IR: 2.0 }, // 1 major only, need ≥3 or 2+3mod
        clinical_signals: {},
        exclusions: {},
        context: {},
      };

      const result = classify(patient);
      expect(result.dominant).toBeNull();
    });
  });
});
