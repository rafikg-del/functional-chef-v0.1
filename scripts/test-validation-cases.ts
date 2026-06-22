import { classifyBottlenecks } from '../src/lib/reasoning/bottleneck-classifier';
import type {
  BiomarkerThreshold,
  Bottleneck,
  BottleneckId,
  PatientProfile,
} from '../src/lib/reasoning/types';

const bottlenecks: Bottleneck[] = [
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

function threshold(
  bottleneck_id: BottleneckId,
  biomarker_id: string,
  weight: BiomarkerThreshold['weight'],
  alert_threshold_low: number | null,
  alert_threshold_high: number | null,
  alert_categorical_value: string | null = null
): BiomarkerThreshold {
  return {
    id: `${bottleneck_id}_${biomarker_id}`,
    bottleneck_id,
    biomarker_id,
    functional_target_min: null,
    functional_target_max: null,
    alert_threshold_low,
    alert_threshold_high,
    alert_categorical_value,
    weight,
  };
}

const thresholds: BiomarkerThreshold[] = [
  threshold('IR', 'HOMA_IR', 'major', null, 1.5),
  threshold('IR', 'FASTING_INSULIN', 'major', null, 8),
  threshold('IR', 'HBA1C', 'major', null, 5.4),
  threshold('IR', 'TG_HDL_RATIO', 'major', null, 1.5),
  threshold('IR', 'FASTING_GLUCOSE', 'moderate', null, 0.95),
  threshold('IR', 'TRIGLYCERIDES', 'moderate', null, 1.2),
  threshold('IR', 'ALT', 'moderate', null, 25),
  threshold('IR', 'WAIST_HEIGHT_RATIO', 'moderate', null, 0.55),

  threshold('INFLAM', 'CRP_US', 'major', null, 1),
  threshold('INFLAM', 'OMEGA_INDEX', 'major', 6, null),
  threshold('INFLAM', 'AA_EPA_RATIO', 'major', null, 7),
  threshold('INFLAM', 'NLR', 'moderate', null, 2.5),

  threshold('DYSBIOSE', 'BRISTOL_SCORE', 'major', 3, 5),
  threshold('DYSBIOSE', 'BLOATING_FREQ', 'major', null, 7),
  threshold('DYSBIOSE', 'CALPROTECTIN', 'major', null, 50),
  threshold('DYSBIOSE', 'ABX_LIFETIME', 'moderate', null, 3),
  threshold('DYSBIOSE', 'FIBER_INTAKE', 'moderate', 15, null),
];

function patient(
  biomarker_values: Record<string, number>,
  clinical_signals: Record<string, number | string> = {}
): PatientProfile {
  return {
    biomarker_values,
    clinical_signals,
    exclusions: {},
    context: {},
  };
}

const cases: {
  name: string;
  profile: PatientProfile;
  expectedDominant: BottleneckId;
  expectedCoDominant?: BottleneckId | null;
}[] = [
  {
    name: 'Case A — IR isolée',
    profile: patient({
      HOMA_IR: 2.1,
      TG_HDL_RATIO: 1.8,
      FASTING_GLUCOSE: 1.0,
      TRIGLYCERIDES: 1.35,
      ALT: 28,
      CRP_US: 0.8,
    }),
    expectedDominant: 'IR',
    expectedCoDominant: null,
  },
  {
    name: 'Case B — INFLAM isolé',
    profile: patient({
      CRP_US: 2.4,
      OMEGA_INDEX: 4.5,
      AA_EPA_RATIO: 12,
      NLR: 2.8,
      HOMA_IR: 1.2,
    }),
    expectedDominant: 'INFLAM',
    expectedCoDominant: null,
  },
  {
    name: 'Case C — DYSBIOSE dominante',
    profile: patient(
      { CRP_US: 1.1, HOMA_IR: 1.4 },
      { BRISTOL_SCORE: 6, BLOATING_FREQ: 7.5, CALPROTECTIN: 80, ABX_LIFETIME: 5, FIBER_INTAKE: 12 }
    ),
    expectedDominant: 'DYSBIOSE',
    expectedCoDominant: null,
  },
  {
    name: 'Triple trigger — cascade IR > INFLAM > DYSBIOSE',
    profile: patient(
      {
        HOMA_IR: 2.3,
        TG_HDL_RATIO: 2.1,
        FASTING_GLUCOSE: 1.05,
        TRIGLYCERIDES: 1.5,
        ALT: 32,
        CRP_US: 2.8,
        OMEGA_INDEX: 4.2,
      },
      { BRISTOL_SCORE: 6, BLOATING_FREQ: 8, ABX_LIFETIME: 6 }
    ),
    expectedDominant: 'IR',
    expectedCoDominant: 'INFLAM',
  },
];

let failures = 0;

for (const testCase of cases) {
  const result = classifyBottlenecks(testCase.profile, bottlenecks, thresholds);
  const coDominantMatches =
    testCase.expectedCoDominant === undefined ||
    result.co_dominant === testCase.expectedCoDominant;

  if (result.dominant !== testCase.expectedDominant || !coDominantMatches) {
    failures++;
    console.error(`[FAIL] ${testCase.name}`);
    console.error(
      `  expected dominant=${testCase.expectedDominant}, co=${testCase.expectedCoDominant ?? 'any'}`
    );
    console.error(`  received dominant=${result.dominant}, co=${result.co_dominant}`);
    console.error(`  rationale=${result.rationale}`);
  } else {
    console.log(`[PASS] ${testCase.name}`);
  }
}

if (failures > 0) {
  process.exit(1);
}

console.log(`\n${cases.length} validation cases passed.`);
