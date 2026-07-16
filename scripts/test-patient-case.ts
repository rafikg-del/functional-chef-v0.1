/**
 * Test interactif — Exemple patient
 * 
 * Run: npx tsx scripts/test-patient-case.ts
 */

import { classifyBottlenecks } from '../src/lib/reasoning/bottleneck-classifier';
import type { Bottleneck, BiomarkerThreshold, PatientProfile } from '../src/lib/reasoning/types';

const BOTTLENECKS: Bottleneck[] = [
  { id: 'IR', name: 'insulin_resistance', display_name_fr: 'IR', priority_rank: 1 },
  { id: 'INFLAM', name: 'inflammaging', display_name_fr: 'INFLAM', priority_rank: 2 },
  { id: 'DYSBIOSE', name: 'dysbiosis', display_name_fr: 'DYSBIOSE', priority_rank: 3 },
];

const THRESHOLDS: BiomarkerThreshold[] = [
  // IR
  { id: '1', bottleneck_id: 'IR', biomarker_id: 'HOMA_IR', functional_target_min: null, functional_target_max: 1.3, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '2', bottleneck_id: 'IR', biomarker_id: 'TG_HDL_RATIO', functional_target_min: null, functional_target_max: 1.0, alert_threshold_low: null, alert_threshold_high: 1.5, alert_categorical_value: null, weight: 'major' },
  { id: '3', bottleneck_id: 'IR', biomarker_id: 'ALT', functional_target_min: null, functional_target_max: 22, alert_threshold_low: null, alert_threshold_high: 25, alert_categorical_value: null, weight: 'moderate' },
  { id: '4', bottleneck_id: 'IR', biomarker_id: 'FASTING_INSULIN', functional_target_min: null, functional_target_max: 6, alert_threshold_low: null, alert_threshold_high: 8, alert_categorical_value: null, weight: 'major' },
  { id: '5', bottleneck_id: 'IR', biomarker_id: 'HBA1C', functional_target_min: null, functional_target_max: 5.4, alert_threshold_low: null, alert_threshold_high: 5.7, alert_categorical_value: null, weight: 'major' },
  { id: '8', bottleneck_id: 'IR', biomarker_id: 'URIC_ACID', functional_target_min: null, functional_target_max: 5.5, alert_threshold_low: null, alert_threshold_high: 6, alert_categorical_value: null, weight: 'minor' },
  { id: '9', bottleneck_id: 'IR', biomarker_id: 'WAIST_HEIGHT_RATIO', functional_target_min: null, functional_target_max: 0.5, alert_threshold_low: null, alert_threshold_high: 0.55, alert_categorical_value: null, weight: 'moderate' },
  { id: '10', bottleneck_id: 'IR', biomarker_id: 'SHBG', functional_target_min: 50, functional_target_max: null, alert_threshold_low: 30, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
  // INFLAM
  { id: '20', bottleneck_id: 'INFLAM', biomarker_id: 'CRP_US', functional_target_min: null, functional_target_max: 1, alert_threshold_low: null, alert_threshold_high: 1, alert_categorical_value: null, weight: 'major' },
  { id: '21', bottleneck_id: 'INFLAM', biomarker_id: 'OMEGA3_INDEX', functional_target_min: 8, functional_target_max: null, alert_threshold_low: 6, alert_threshold_high: null, alert_categorical_value: null, weight: 'major' },
  { id: '22', bottleneck_id: 'INFLAM', biomarker_id: 'AA_EPA_RATIO', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 7, alert_categorical_value: null, weight: 'major' },
  { id: '24', bottleneck_id: 'INFLAM', biomarker_id: 'NLR', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 2.5, alert_categorical_value: null, weight: 'moderate' },
  { id: '26', bottleneck_id: 'INFLAM', biomarker_id: 'FIBRINOGEN', functional_target_min: null, functional_target_max: 3.5, alert_threshold_low: null, alert_threshold_high: 4, alert_categorical_value: null, weight: 'moderate' },
  { id: '27', bottleneck_id: 'INFLAM', biomarker_id: 'TSAT', functional_target_min: 20, functional_target_max: null, alert_threshold_low: 20, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
  // DYSBIOSE
  { id: '30', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BRISTOL_SCORE', functional_target_min: null, functional_target_max: null, alert_threshold_low: 3, alert_threshold_high: 5, alert_categorical_value: null, weight: 'major' },
  { id: '31', bottleneck_id: 'DYSBIOSE', biomarker_id: 'BLOATING_FREQ', functional_target_min: null, functional_target_max: 2, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'major' },
  { id: '32', bottleneck_id: 'DYSBIOSE', biomarker_id: 'CALPROTECTIN', functional_target_min: null, functional_target_max: 50, alert_threshold_low: null, alert_threshold_high: 50, alert_categorical_value: null, weight: 'major' },
  { id: '34', bottleneck_id: 'DYSBIOSE', biomarker_id: 'ABX_LIFETIME', functional_target_min: null, functional_target_max: 3, alert_threshold_low: null, alert_threshold_high: 3, alert_categorical_value: null, weight: 'moderate' },
  { id: '36', bottleneck_id: 'DYSBIOSE', biomarker_id: 'FIBER_INTAKE', functional_target_min: 25, functional_target_max: null, alert_threshold_low: 15, alert_threshold_high: null, alert_categorical_value: null, weight: 'moderate' },
];

// ─── CAS CLINIQUE — Femme 34 ans, fatigue + prise de poids ───────────

const patient: PatientProfile = {
  biomarker_values: {
    HOMA_IR: 2.3,        // >1.5 → major
    TG_HDL_RATIO: 1.9,   // >1.5 → major
    FASTING_INSULIN: 10,  // >8 → major
    CRP_US: 1.8,          // >1 → major
    OMEGA3_INDEX: 5.2,    // <6 → major
    URIC_ACID: 5.8,       // <6 → pas de breach
    SHBG: 24,             // <30 → moderate
    CALPROTECTIN: 55,     // >50 → major
    FIBRINOGEN: 3.8,      // <4 → pas de breach
  },
  clinical_signals: {
    BRISTOL_SCORE: 6,     // >5 → major
    BLOATING_FREQ: 4,     // >3 → major
    ABX_LIFETIME: 4,      // >3 → moderate
    FIBER_INTAKE: 14,     // <15 → moderate
  },
  exclusions: {},
  context: {},
  sex: 'F',
};

const result = classifyBottlenecks(patient, BOTTLENECKS, THRESHOLDS);

// ─── AFFICHAGE ───────────────────────────────────────────────────

const BOTTLENECK_LABELS: Record<string, string> = {
  IR: 'Insulinorésistance',
  INFLAM: 'Inflammaging',
  DYSBIOSE: 'Dysbiose',
};

console.log('═'.repeat(70));
console.log('🧑‍⚕️  PATIENT : Femme, 34 ans — fatigue, prise de poids, ballonnements');
console.log('═'.repeat(70));

console.log('\n📊 BIOMARQUEURS SAISIS :');
console.log(`   HOMA-IR: 2.3   | TG/HDL: 1.9   | Insuline: 10  | CRP-us: 1.8`);
console.log(`   Omega3: 5.2%   | SHBG: 24      | Calpro: 55    | Bristol: 6`);
console.log(`   Ballonnements: 4/sem | ABX: 4 cures | Fibres: 14g/j`);

console.log('\n══════════════════════════════════════════════════════════════');
console.log('🔬 CLASSIFICATION');
console.log('══════════════════════════════════════════════════════════════\n');

for (const s of result.scores) {
  const meta = BOTTLENECK_LABELS[s.bottleneck_id];
  const status = s.triggered ? '✓ DÉCLENCHÉ' : '— pas déclenché';
  const dom = s.is_dominant ? ' ⬅ DOMINANT' : s.is_co_dominant ? ' ⬅ CO-DOMINANT' : '';
  console.log(`  ${meta} (${s.bottleneck_id})`);
  console.log(`  Score: ${s.score} pts  |  ${status}${dom}`);
  console.log(`  Majeurs: ${s.major_hits} · Modérés: ${s.moderate_hits} · Mineurs: ${s.minor_hits}` + (s.discriminant_hits > 0 ? ` · Discriminants: ${s.discriminant_hits}` : ''));
  if (s.evidence.length > 0) {
    console.log(`  Preuves:`);
    for (const e of s.evidence) {
      console.log(`    • ${e.biomarker_id} = ${e.observed_value} (${e.weight}, +${e.contribution} pts)`);
    }
  }
  console.log('');
}

console.log('══════════════════════════════════════════════════════════════');
console.log(`🏆 RÉSULTAT`);
console.log('══════════════════════════════════════════════════════════════\n');
console.log(`  Bottleneck dominant : ${result.dominant ? BOTTLENECK_LABELS[result.dominant] + ' (' + result.dominant + ')' : 'Aucun'}`);
console.log(`  Co-dominant        : ${result.co_dominant ? BOTTLENECK_LABELS[result.co_dominant] + ' (' + result.co_dominant + ')' : 'Aucun'}`);
if (result.phenotypes && result.phenotypes.length > 0) {
  console.log(`  Phénotypes         : ${result.phenotypes.join(', ')}`);
}
if (result.inflam_phenotypes && result.inflam_phenotypes.length > 0) {
  console.log(`  Phénotypes INFLAM   : ${result.inflam_phenotypes.join(', ')}`);
}
console.log(`\n  Rationale : ${result.rationale}`);
