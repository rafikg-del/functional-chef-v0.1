/**
 * ============================================================
 * Local reference data for dev/demo mode
 * ============================================================
 *
 * Used when Supabase is not configured. This keeps the deterministic
 * classifier and composer testable from the UI without a remote database.
 * The canonical production source remains Supabase seeds.
 */

import type {
  BiomarkerThreshold,
  Bottleneck,
  BottleneckId,
  CulinaryLever,
  LeverBottleneckMap,
} from './types';

export const LOCAL_BOTTLENECKS: Bottleneck[] = [
  {
    id: 'ALLOSTATIC_LOAD',
    name: 'allostatic_load',
    display_name_fr: 'Charge allostatique',
    description: 'Surcharge adaptative neuro-endocrine et autonomique.',
    priority_rank: 0,
    classifier_rule: '≥2 critères majeurs OU ≥1 majeur + ≥3 modérés',
  },
  {
    id: 'IR',
    name: 'insulin_resistance',
    display_name_fr: 'Insulinorésistance fonctionnelle',
    priority_rank: 1,
    classifier_rule: '≥3 critères majeurs OU ≥2 majeurs + ≥3 modérés',
  },
  {
    id: 'INFLAM',
    name: 'inflammaging',
    display_name_fr: 'Inflammaging',
    priority_rank: 2,
    classifier_rule: 'CRP-us >1 mg/L persistante + ≥1 critère majeur secondaire',
  },
  {
    id: 'DYSBIOSE',
    name: 'dysbiosis',
    display_name_fr: 'Dysbiose intestinale',
    priority_rank: 3,
    classifier_rule: '≥2 critères cliniques majeurs persistants + ≥1 facteur historique aggravant',
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

export const LOCAL_THRESHOLDS: BiomarkerThreshold[] = [
  threshold('ALLOSTATIC_LOAD', 'HRV_RMSSD', 'major', 25, null),
  threshold('ALLOSTATIC_LOAD', 'PSQI_SCORE', 'major', null, 8),
  threshold('ALLOSTATIC_LOAD', 'CORTISOL_PM', 'major', null, 5),
  threshold('ALLOSTATIC_LOAD', 'CORTISOL_AM', 'moderate', 5, 20),
  threshold('ALLOSTATIC_LOAD', 'DHEA_S', 'moderate', 80, null),
  threshold('ALLOSTATIC_LOAD', 'SLEEP_EFFICIENCY', 'moderate', 85, null),
  threshold('ALLOSTATIC_LOAD', 'WASO_MIN', 'moderate', null, 45),
  threshold('ALLOSTATIC_LOAD', 'RESTING_HR', 'moderate', null, 75),
  threshold('ALLOSTATIC_LOAD', 'FASTING_GLUCOSE', 'minor', null, 0.95),
  threshold('ALLOSTATIC_LOAD', 'CAFFEINE_AFTER_14', 'moderate', null, null, 'positive'),

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

function lever(input: CulinaryLever): CulinaryLever {
  return input;
}

export const LOCAL_LEVERS: CulinaryLever[] = [
  lever({
    id: 'L_EVOO_PRIMARY',
    name_fr: "Huile d'olive extra vierge en première intention",
    description: 'EVOO comme lipide principal, polyphénols et MUFA.',
    category: 'ingredient',
    expected_effect: 'Stabilité énergétique, support anti-inflammatoire et polyphénolique',
    ebm_tier: 'T1',
    primary_reference: 'PREDIMED',
    pubmed_ids: ['23432189'],
    dose_or_protocol: '≥40 ml/jour, une part à cru',
    is_universal_star: true,
    active: true,
  }),
  lever({
    id: 'L_PLANT_DIVERSITY_30',
    name_fr: 'Diversité ≥30 plantes différentes/semaine',
    description: 'Diversité végétale hebdomadaire incluant herbes et épices.',
    category: 'ingredient',
    expected_effect: '↑ diversité microbiote et charge polyphénolique',
    ebm_tier: 'T1',
    primary_reference: 'McDonald 2018 American Gut Project',
    pubmed_ids: ['29795809'],
    dose_or_protocol: '≥30 espèces végétales/semaine',
    is_universal_star: true,
    active: true,
  }),
  lever({
    id: 'L_FERMENTED_DAILY',
    name_fr: 'Aliments fermentés diversifiés ≥1 portion/jour',
    description: 'Kéfir, yaourt vivant, choucroute, kimchi, miso.',
    category: 'fermentation',
    expected_effect: '↑ diversité microbiote ; ↓ marqueurs inflammatoires',
    ebm_tier: 'T1',
    primary_reference: 'Wastyk 2021',
    pubmed_ids: ['34256014'],
    dose_or_protocol: '≥1 portion/jour, sources tournantes',
    contraindications: ['immunosuppression_severe'],
    is_universal_star: true,
    active: true,
  }),
  lever({
    id: 'L_FATTY_FISH_2X',
    name_fr: 'Poisson gras 2-3 portions/semaine',
    description: 'Sardine, maquereau, hareng, anchois pour EPA/DHA.',
    category: 'ingredient',
    expected_effect: '↑ Omega-3 Index ; ↓ tonus inflammatoire',
    ebm_tier: 'T1',
    primary_reference: 'Calder 2018',
    pubmed_ids: ['29610056'],
    dose_or_protocol: '2-3 portions de 100-150g/semaine',
    is_universal_star: true,
    active: true,
  }),
  lever({
    id: 'L_CAFFEINE_CUTOFF_8H',
    name_fr: 'Arrêt caféine ≥8h avant coucher',
    description: 'Éviter caféine en seconde partie de journée.',
    category: 'avoidance',
    expected_effect: '↓ fragmentation sommeil ; ↑ durée totale sommeil',
    ebm_tier: 'T1',
    primary_reference: 'Drake 2013 J Clin Sleep Med',
    pubmed_ids: ['24235903'],
    dose_or_protocol: 'Dernière prise caféine ≥8h avant coucher',
    is_universal_star: false,
    active: true,
  }),
  lever({
    id: 'L_GLYCINE_PRE_BED',
    name_fr: 'Glycine 3g avant coucher',
    description: 'Glycine 30-60 min avant coucher.',
    category: 'timing',
    expected_effect: '↑ qualité subjective du sommeil ; ↓ fatigue',
    ebm_tier: 'T2',
    primary_reference: 'Bannai 2012',
    pubmed_ids: ['22293292', '22529837'],
    dose_or_protocol: '3g 30-60 min avant coucher',
    is_universal_star: false,
    active: true,
  }),
  lever({
    id: 'L_MAGNESIUM_FOOD',
    name_fr: 'Apport magnésium alimentaire ≥350mg/j',
    description: 'Graines, noix, cacao, épinards, légumineuses.',
    category: 'ingredient',
    expected_effect: 'Support neuromusculaire et sommeil',
    ebm_tier: 'T2',
    primary_reference: 'Arab 2022 systematic review',
    pubmed_ids: ['35184264'],
    dose_or_protocol: '300-400mg/j via aliments',
    contraindications: ['renal_failure_advanced'],
    is_universal_star: false,
    active: true,
  }),
  lever({
    id: 'L_KIWI_PRE_BED',
    name_fr: 'Deux kiwis 1h avant coucher',
    description: 'Collation pré-coucher à base de kiwifruit.',
    category: 'timing',
    expected_effect: "↓ latence d'endormissement ; ↑ efficacité sommeil",
    ebm_tier: 'T2',
    primary_reference: 'Lin 2011',
    pubmed_ids: ['21669584'],
    dose_or_protocol: '2 kiwis 1h avant coucher pendant 4 semaines',
    contraindications: ['kiwi_allergy'],
    is_universal_star: false,
    active: true,
  }),
  lever({
    id: 'L_PROTEIN_BREAKFAST_STABLE_ENERGY',
    name_fr: 'Petit-déjeuner protéiné 25-35g',
    description: 'Premier repas riche en protéines, fibres et lipides stables.',
    category: 'timing',
    expected_effect: '↑ satiété ; ↓ cravings ; stabilité énergétique',
    ebm_tier: 'T2',
    primary_reference: 'Leidy 2015',
    dose_or_protocol: '25-35g protéines au premier repas',
    contraindications: ['renal_failure_advanced'],
    is_universal_star: false,
    active: true,
  }),
];

function map(
  lever_id: string,
  bottleneck_id: BottleneckId,
  tier_for_bottleneck: LeverBottleneckMap['tier_for_bottleneck'],
  priority: number,
  bottleneck_specific_note?: string
): LeverBottleneckMap {
  return {
    lever_id,
    bottleneck_id,
    tier_for_bottleneck,
    priority,
    bottleneck_specific_note,
  };
}

export const LOCAL_LEVER_MAP: LeverBottleneckMap[] = [
  map('L_EVOO_PRIMARY', 'ALLOSTATIC_LOAD', 'T2', 30),
  map('L_EVOO_PRIMARY', 'IR', 'T1', 5),
  map('L_EVOO_PRIMARY', 'INFLAM', 'T1', 5),
  map('L_EVOO_PRIMARY', 'DYSBIOSE', 'T2', 30),
  map('L_PLANT_DIVERSITY_30', 'ALLOSTATIC_LOAD', 'T2', 35),
  map('L_PLANT_DIVERSITY_30', 'IR', 'T2', 35),
  map('L_PLANT_DIVERSITY_30', 'INFLAM', 'T2', 30),
  map('L_PLANT_DIVERSITY_30', 'DYSBIOSE', 'T1', 1),
  map('L_FERMENTED_DAILY', 'ALLOSTATIC_LOAD', 'T2', 38),
  map('L_FERMENTED_DAILY', 'IR', 'T2', 40),
  map('L_FERMENTED_DAILY', 'INFLAM', 'T2', 20),
  map('L_FERMENTED_DAILY', 'DYSBIOSE', 'T1', 5),
  map('L_FATTY_FISH_2X', 'ALLOSTATIC_LOAD', 'T2', 20),
  map('L_FATTY_FISH_2X', 'IR', 'T2', 25),
  map('L_FATTY_FISH_2X', 'INFLAM', 'T1', 1),
  map('L_CAFFEINE_CUTOFF_8H', 'ALLOSTATIC_LOAD', 'T1', 1),
  map('L_GLYCINE_PRE_BED', 'ALLOSTATIC_LOAD', 'T2', 5),
  map('L_MAGNESIUM_FOOD', 'ALLOSTATIC_LOAD', 'T2', 8),
  map('L_KIWI_PRE_BED', 'ALLOSTATIC_LOAD', 'T2', 15),
  map('L_PROTEIN_BREAKFAST_STABLE_ENERGY', 'ALLOSTATIC_LOAD', 'T2', 18),
];

