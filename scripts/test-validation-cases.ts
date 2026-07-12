/**
 * Validation cases for bottleneck classifier (offline — no Supabase).
 * Run: npm run test:cases
 */

import { classifyBottlenecks } from '../src/lib/reasoning/bottleneck-classifier';
import type { Bottleneck, BiomarkerThreshold, PatientProfile } from '../src/lib/reasoning/types';

const BOTTLENECKS: Bottleneck[] = [
  { id: 'IR', name: 'insulin_resistance', display_name_fr: 'IR', priority_rank: 1 },
  { id: 'INFLAM', name: 'inflammaging', display_name_fr: 'INFLAM', priority_rank: 2 },
  { id: 'DYSBIOSE', name: 'dysbiosis', display_name_fr: 'DYSBIOSE', priority_rank: 3 },
];

const THRESHOLDS: BiomarkerThreshold[] = [
  { id: '1', bottleneck_id: 'IR', biomarker_id: 'HOMA_IR', functional_target_min: null, functional_target_max: 1.3, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '2', bottleneck_id: 'IR', biomarker_id: 'TG_HDL_RATIO', functional_target_min: null, functional_target_max: 1.0, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '3', bottleneck_id: 'IR', biomarker_id: 'ALT', functional_target_min: null, functional_target_max: 22, alert_threshold_low: null, alert_threshold_high: 25, alert_categorical_value: null, weight: 'moderate' },
  { id: '4', bottleneck_id: 'IR', biomarker_id: 'FASTING_INSULIN', functional_target_min: null, functional_target_max: 6, alert_threshold_low: null, alert_threshold_high: 8, alert_categorical_value: null, weight: 'major' },
  { id: '5', bottleneck_id: 'IR', biomarker_id: 'LIVER_FAT_PDFF', functional_target_min: null, functional_target_max: 5.0, alert_threshold_low: null, alert_threshold_high: 5.0, alert_categorical_value: null, weight: 'major' },
  { id: '7', bottleneck_id: 'IR', biomarker_id: 'FRUCTOSE_INTAKE', functional_target_min: null, functional_target_max: 25, alert_threshold_low: null, alert_threshold_high: 50, alert_categorical_value: null, weight: 'moderate' },
  { id: '8', bottleneck_id: 'IR', biomarker_id: 'FREE_SUGAR_PCT_ENERGY', functional_target_min: null, functional_target_max: 5, alert_threshold_low: null, alert_threshold_high: 10, alert_categorical_value: null, weight: 'moderate' },
  { id: '6', bottleneck_id: 'INFLAM', biomarker_id: 'CRP_US', functional_target_min: null, functional_target_max: 1, alert_threshold_low: null, alert_threshold_high: 1, alert_categorical_value: null, weight: 'major' },
];

interface TestCase {
  name: string;
  patient: PatientProfile;
  expectDominant: string | null;
  expectPhenotypes?: string[];
  mustNotHavePhenotypes?: string[];
  expectIrEvidenceBiomarkers?: string[];
}

const CASES: TestCase[] = [
  {
    name: 'Cas A — IR isolée (sans imagerie, sans hepatic_masld)',
    patient: {
      biomarker_values: { HOMA_IR: 2.1, TG_HDL_RATIO: 1.8, ALT: 28, FASTING_INSULIN: 9, CRP_US: 0.8 },
      clinical_signals: {},
      exclusions: {},
      context: {},
    },
    expectDominant: 'IR',
    mustNotHavePhenotypes: ['hepatic_masld'],
  },
  {
    name: 'Cas D — IR phénotype hepatic_masld',
    patient: {
      biomarker_values: {
        HOMA_IR: 2.0,
        TG_HDL_RATIO: 1.7,
        ALT: 32,
        LIVER_FAT_PDFF: 12.5,
        FASTING_INSULIN: 9,
      },
      clinical_signals: { FRUCTOSE_INTAKE: 65, FREE_SUGAR_PCT_ENERGY: 14 },
      exclusions: {},
      context: {},
    },
    expectDominant: 'IR',
    expectPhenotypes: ['hepatic_masld'],
    expectIrEvidenceBiomarkers: ['FRUCTOSE_INTAKE', 'FREE_SUGAR_PCT_ENERGY'],
  },
];

let passed = 0;
let failed = 0;

for (const c of CASES) {
  const result = classifyBottlenecks(c.patient, BOTTLENECKS, THRESHOLDS);
  const okDominant = result.dominant === c.expectDominant;
  const okPheno =
    c.expectPhenotypes === undefined ||
    JSON.stringify(result.phenotypes ?? []) === JSON.stringify(c.expectPhenotypes);
  const okNoPheno =
    c.mustNotHavePhenotypes === undefined ||
    c.mustNotHavePhenotypes.every((p) => !(result.phenotypes ?? []).includes(p as 'hepatic_masld'));

  let okEvidence = true;
  if (c.expectIrEvidenceBiomarkers?.length) {
    const irEvidence = result.scores.find((s) => s.bottleneck_id === 'IR')?.evidence ?? [];
    const ids = new Set(irEvidence.map((e) => e.biomarker_id));
    okEvidence = c.expectIrEvidenceBiomarkers.every((id) => ids.has(id));
  }

  if (okDominant && okPheno && okNoPheno && okEvidence) {
    console.log(`✓ ${c.name}`);
    passed++;
  } else {
    console.error(`✗ ${c.name}`);
    console.error(`  expected dominant=${c.expectDominant} phenotypes=${JSON.stringify(c.expectPhenotypes)} mustNot=${JSON.stringify(c.mustNotHavePhenotypes)} evidence=${JSON.stringify(c.expectIrEvidenceBiomarkers)}`);
    console.error(`  got dominant=${result.dominant} phenotypes=${JSON.stringify(result.phenotypes)}`);
    if (!okEvidence) {
      const irEvidence = result.scores.find((s) => s.bottleneck_id === 'IR')?.evidence.map((e) => e.biomarker_id);
      console.error(`  IR evidence biomarkers: ${JSON.stringify(irEvidence)}`);
    }
    failed++;
  }
}

if (failed > 0) process.exit(1);
console.log(`\n${passed}/${passed + failed} cases passed.`);
