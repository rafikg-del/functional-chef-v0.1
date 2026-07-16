/**
 * Test de validation — 30 profils patients
 *
 * Vérifie que le moteur classifie correctement chaque cas clinique
 * selon les outputs attendus (bottleneck dominant, phénotypes, etc.)
 */

import { describe, it, expect } from 'vitest';
import { classifyBottlenecks } from '../bottleneck-classifier';
import { PATIENT_PROFILES } from './patient-profiles';
import type { Bottleneck, BiomarkerThreshold } from '../types';

const BOTTLENECKS: Bottleneck[] = [
  { id: 'IR', name: 'insulin_resistance', display_name_fr: 'IR', priority_rank: 1 },
  { id: 'INFLAM', name: 'inflammaging', display_name_fr: 'INFLAM', priority_rank: 2 },
  { id: 'DYSBIOSE', name: 'dysbiosis', display_name_fr: 'DYSBIOSE', priority_rank: 3 },
];

const THRESHOLDS: BiomarkerThreshold[] = [
  // IR thresholds
  { id: '1', bottleneck_id: 'IR', biomarker_id: 'HOMA_IR', functional_target_min: null, functional_target_max: 1.3, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '2', bottleneck_id: 'IR', biomarker_id: 'TG_HDL_RATIO', functional_target_min: null, functional_target_max: 1.0, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '3', bottleneck_id: 'IR', biomarker_id: 'ALT', functional_target_min: null, functional_target_max: 22, alert_threshold_low: null, alert_threshold_high: 25, alert_categorical_value: null, weight: 'moderate' },
  { id: '4', bottleneck_id: 'IR', biomarker_id: 'FASTING_INSULIN', functional_target_min: null, functional_target_max: 6, alert_threshold_low: null, alert_threshold_high: 8, alert_categorical_value: null, weight: 'major' },
  { id: '5', bottleneck_id: 'IR', biomarker_id: 'HBA1C', functional_target_min: null, functional_target_max: 5.4, alert_threshold_low: null, alert_threshold_high: 5.7, alert_categorical_value: null, weight: 'major' },
  { id: '6', bottleneck_id: 'IR', biomarker_id: 'GGT', functional_target_min: null, functional_target_max: 30, alert_threshold_low: null, alert_threshold_high: 40, alert_categorical_value: null, weight: 'moderate' },
  { id: '8', bottleneck_id: 'IR', biomarker_id: 'URIC_ACID', functional_target_min: null, functional_target_max: 5.5, alert_threshold_low: null, alert_threshold_high: 6, alert_categorical_value: null, weight: 'minor' },
  { id: '9', bottleneck_id: 'IR', biomarker_id: 'WAIST_HEIGHT_RATIO', functional_target_min: null, functional_target_max: 0.5, alert_threshold_low: null, alert_threshold_high: 0.55, alert_categorical_value: null, weight: 'moderate' },
  { id: '10', bottleneck_id: 'IR', biomarker_id: 'SHBG', functional_target_min: 50, functional_target_max: null, alert_threshold_low: 30, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
  { id: '11', bottleneck_id: 'IR', biomarker_id: 'LIVER_FAT_PDFF', functional_target_min: null, functional_target_max: 5, alert_threshold_low: null, alert_threshold_high: 5, alert_categorical_value: null, weight: 'major' },
  { id: '12', bottleneck_id: 'IR', biomarker_id: 'A_HYDROXYBUTYRATE', functional_target_min: null, functional_target_max: null, alert_threshold_low: null, alert_threshold_high: 12, alert_categorical_value: null, weight: 'discriminant' },
  // INFLAM thresholds
  { id: '20', bottleneck_id: 'INFLAM', biomarker_id: 'CRP_US', functional_target_min: null, functional_target_max: 1, alert_threshold_low: null, alert_threshold_high: 1, alert_categorical_value: null, weight: 'major' },
  { id: '21', bottleneck_id: 'INFLAM', biomarker_id: 'OMEGA3_INDEX', functional_target_min: 8, functional_target_max: null, alert_threshold_low: 6, alert_threshold_high: null, alert_categorical_value: null, weight: 'major' },
  { id: '22', bottleneck_id: 'INFLAM', biomarker_id: 'AA_EPA_RATIO', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 7, alert_categorical_value: null, weight: 'major' },
  { id: '24', bottleneck_id: 'INFLAM', biomarker_id: 'NLR', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 2.5, alert_categorical_value: null, weight: 'moderate' },
  { id: '26', bottleneck_id: 'INFLAM', biomarker_id: 'FIBRINOGEN', functional_target_min: null, functional_target_max: 3.5, alert_threshold_low: null, alert_threshold_high: 4, alert_categorical_value: null, weight: 'moderate' },
  { id: '27', bottleneck_id: 'INFLAM', biomarker_id: 'TSAT', functional_target_min: 20, functional_target_max: null, alert_threshold_low: 20, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
  // DYSBIOSE thresholds
  { id: '30', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BRISTOL_SCORE', functional_target_min: null, functional_target_max: null, alert_threshold_low: 3, alert_threshold_high: 5, alert_categorical_value: null, weight: 'major' },
  { id: '31', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BLOATING_FREQ', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'major' },
  { id: '32', bottleneck_id: 'DYSBIOSE', biomarker_id: 'CALPROTECTIN', functional_target_min: null, functional_target_max: 50, alert_threshold_low: null, alert_threshold_high: 50, alert_categorical_value: null, weight: 'major' },
  { id: '33', bottleneck_id: 'DYSBIOSE', biomarker_id: 'SIBO_BREATH_TEST', functional_target_min: null, functional_target_max: null, alert_threshold_low: null, alert_threshold_high: null, alert_categorical_value: 'positif', weight: 'major' },
  { id: '34', bottleneck_id: 'DYSBIOSE', biomarker_id: 'ABX_LIFETIME', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'moderate' },
  { id: '35', bottleneck_id: 'DYSBIOSE', biomarker_id: 'FIBER_INTAKE', functional_target_min: 25, functional_target_max: null, alert_threshold_low: 15, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
];

describe('Validation clinique — 30 profils patients', () => {
  for (const tc of PATIENT_PROFILES) {
    it(`${tc.id}: ${tc.label}`, () => {
      const result = classifyBottlenecks(tc.profile, BOTTLENECKS, THRESHOLDS);

      // 1. Dominant
      expect(result.dominant).toBe(tc.expected.dominant);

      // 2. Co-dominant
      if (tc.expected.co_dominant !== undefined) {
        expect(result.co_dominant).toBe(tc.expected.co_dominant);
      }

      // 3. Déclenchement par bottleneck
      const irHits = result.scores.find(s => s.bottleneck_id === 'IR');
      const inflamHits = result.scores.find(s => s.bottleneck_id === 'INFLAM');
      const dysbioseHits = result.scores.find(s => s.bottleneck_id === 'DYSBIOSE');

      if (tc.expected.ir_triggered !== undefined) {
        expect((irHits?.triggered ?? false)).toBe(tc.expected.ir_triggered);
      }
      if (tc.expected.inflam_triggered !== undefined) {
        expect((inflamHits?.triggered ?? false)).toBe(tc.expected.inflam_triggered);
      }
      if (tc.expected.dysbiose_triggered !== undefined) {
        expect((dysbioseHits?.triggered ?? false)).toBe(tc.expected.dysbiose_triggered);
      }

      // 4. Scores minimum
      if (tc.expected.min_score_ir !== undefined && irHits) {
        expect(irHits.score).toBeGreaterThanOrEqual(tc.expected.min_score_ir);
      }
      if (tc.expected.min_score_inflam !== undefined && inflamHits) {
        expect(inflamHits.score).toBeGreaterThanOrEqual(tc.expected.min_score_inflam);
      }
      if (tc.expected.min_score_dysbiose !== undefined && dysbioseHits) {
        expect(dysbioseHits.score).toBeGreaterThanOrEqual(tc.expected.min_score_dysbiose);
      }

      // 5. Phénotypes
      if (tc.expected.phenotypes !== undefined) {
        for (const p of tc.expected.phenotypes) {
          expect(result.phenotypes).toContain(p);
        }
      }
      if (tc.expected.inflam_phenotypes !== undefined) {
        for (const p of tc.expected.inflam_phenotypes) {
          expect(result.inflam_phenotypes).toContain(p);
        }
      }
    });
  }
});
