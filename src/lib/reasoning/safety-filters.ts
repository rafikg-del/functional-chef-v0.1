/**
 * ============================================================
 * Safety Filters
 * ============================================================
 *
 * Spec v0.1 §5 — exclusions/precautions matrix.
 * Implementation choice : HARD FILTERS in v0.1 (spec §11 anti-pattern :
 * "ne pas indexer le LLM sur 100% de la génération"). Risk management
 * is rule-based and deterministic, not delegated to the LLM.
 *
 * A lever is excluded if any of its `contraindications` matches a
 * patient `exclusions.medical` entry, OR if a hard rule below applies.
 *
 * Returns:
 *   - filtered_levers : levers safe to consider downstream
 *   - excluded        : with reason for traceability
 *   - warnings        : human-readable advisories (e.g. precautions to surface in UI)
 */

import type {
  CulinaryLever,
  PatientProfile,
} from './types';

// Patient medical condition → array of contraindication keywords matched against levers
const HARD_RULES: Array<{
  patient_condition: string;
  blocks_levers_with_contraindication: string[];
  warning?: string;
}> = [
  {
    patient_condition: 'MICI_active',
    blocks_levers_with_contraindication: ['MICI_active', 'MICI_active_severe', 'MICI_flare_active'],
    warning: 'MICI active : exclusion fibres insolubles brutes, prébiotiques fermentescibles, légumineuses. Cuisson douce uniquement, formes molles privilégiées.',
  },
  {
    patient_condition: 'MICI_flare_active',
    blocks_levers_with_contraindication: ['MICI_active', 'MICI_active_severe', 'MICI_flare_active', 'occlusion_subocclusion'],
    warning: 'Flare MICI : exclusion fibres ; alimentation pauvre en résidus à privilégier en aigu.',
  },
  {
    patient_condition: 'anticoagulants_high_dose',
    blocks_levers_with_contraindication: ['anticoagulants_high_dose'],
    warning: 'Anticoagulants haute dose : prudence curcumine, ail concentré, ω-3 ≥3g/j. Surveillance INR si AVK.',
  },
  {
    patient_condition: 'AVK',
    blocks_levers_with_contraindication: ['anticoagulants_high_dose'],
    warning: 'AVK : surveillance INR si introduction curcumine, ω-3 forte dose, ail concentré.',
  },
  {
    patient_condition: 'gallstones_active',
    blocks_levers_with_contraindication: ['gallstones_active'],
    warning: 'Lithiase vésiculaire active : prudence cholérétiques (curcuma, artichaut).',
  },
  {
    patient_condition: 'pre_surgery_2_weeks',
    blocks_levers_with_contraindication: ['pre_surgery_2_weeks', 'anticoagulants_high_dose'],
    warning: 'Pré-opératoire : arrêt curcumine, ail concentré, ω-3 doses ↑ 14j avant chirurgie.',
  },
  {
    patient_condition: 'celiac_disease',
    blocks_levers_with_contraindication: ['celiac_disease'],
    warning: 'Maladie cœliaque : exclusion stricte gluten. Pain au levain conventionnel exclu, alternatives sans gluten.',
  },
  {
    patient_condition: 'SIBO_active',
    blocks_levers_with_contraindication: ['SIBO_active'],
    warning: 'SIBO actif : phase low-FODMAP préalable avant réintroduction prébiotiques. Fermentescibles à graduer.',
  },
  {
    patient_condition: 'IBS_severe',
    blocks_levers_with_contraindication: ['IBS_severe', 'IBS_FODMAP_intolerant', 'SIBO_active'],
    warning: 'IBS sévère : adapter type fibres (préférer solubles), éviter prébiotiques en doses pleines, FODMAP graduel.',
  },
  {
    patient_condition: 'hemochromatosis',
    blocks_levers_with_contraindication: [],
    warning: 'Hémochromatose : modérer viande rouge, éviter vit C avec repas riches en fer, ↑ thé/café avec repas (chélation fer).',
  },
  {
    patient_condition: 'pregnancy',
    blocks_levers_with_contraindication: ['pre_surgery_2_weeks'],
    warning: 'Grossesse : éviter gros poissons (Hg : thon, espadon, requin), foie (vit A), curcumine doses ↑, abats. Préférer petits poissons gras.',
  },
  {
    patient_condition: 'breastfeeding',
    blocks_levers_with_contraindication: [],
    warning: 'Allaitement : mêmes prudences que grossesse pour Hg, alcool, caféine ↑.',
  },
  {
    patient_condition: 'cancer_chemo_active',
    blocks_levers_with_contraindication: [],
    warning: 'Chimiothérapie active : discussion oncologue requise. Polyphénols antioxydants forts à modérer pendant cycle (interactions cytotoxiques possibles selon molécule).',
  },
  {
    patient_condition: 'severe_hypothyroidism',
    blocks_levers_with_contraindication: [],
    warning: 'Hypothyroïdie sévère : crucifères crues volumineuses à modérer. Cuisson désactive partiellement les goitrogènes.',
  },
  {
    patient_condition: 'oxalate_stones',
    blocks_levers_with_contraindication: [],
    warning: 'Calculs oxaliques : modérer épinards, betterave, rhubarbe ; hydratation ↑ ; calcium concomitant.',
  },
];

// Allergy keyword → ingredients to flag for downstream composer
const ALLERGY_INGREDIENTS_MAP: Record<string, string[]> = {
  nuts: ['amandes', 'noix', 'noisettes', 'pistaches', 'noix de cajou', 'noix de pécan'],
  peanuts: ['cacahuètes', 'arachides'],
  shellfish: ['crustacés', 'crevettes', 'langoustines', 'homard'],
  fish: ['poisson', 'saumon', 'sardine', 'maquereau', 'thon', 'cabillaud'],
  eggs: ['œuf', 'œufs'],
  milk: ['lait', 'fromage', 'yaourt', 'beurre', 'crème'],
  soy: ['soja', 'tofu', 'edamame', 'tempeh', 'miso', 'tamari'],
  gluten: ['blé', 'seigle', 'orge', 'épeautre', 'pain de blé', 'pâtes de blé'],
  sesame: ['sésame', 'tahin', 'tahini', 'graines de sésame'],
};

interface SafetyResult {
  filtered_levers: CulinaryLever[];
  excluded: { lever_id: string; reason: string }[];
  warnings: string[];
  /** Ingredients to forbid in composer output */
  forbidden_ingredients: string[];
}

export function applySafetyFilters(
  levers: CulinaryLever[],
  patient: PatientProfile
): SafetyResult {
  const medical = patient.exclusions?.medical ?? [];
  const allergies = patient.exclusions?.allergies ?? [];
  const dietary = patient.exclusions?.dietary_pattern ?? [];

  const excluded: { lever_id: string; reason: string }[] = [];
  const warnings: string[] = [];
  const blockedContraindicationKeys = new Set<string>();
  const forbidden_ingredients = new Set<string>();

  // Aggregate hard rules
  for (const rule of HARD_RULES) {
    if (medical.includes(rule.patient_condition)) {
      rule.blocks_levers_with_contraindication.forEach((k) =>
        blockedContraindicationKeys.add(k)
      );
      if (rule.warning) warnings.push(rule.warning);
    }
  }

  // Map allergies → ingredients
  for (const allergen of allergies) {
    const ingredients = ALLERGY_INGREDIENTS_MAP[allergen.toLowerCase()];
    if (ingredients) ingredients.forEach((i) => forbidden_ingredients.add(i));
    warnings.push(`Allergie ${allergen} : exclusion ingrédients dérivés.`);
  }

  // Dietary patterns (informational warnings — composer handles enforcement)
  if (dietary.includes('vegan')) {
    warnings.push('Vegan : substitution poisson par algues (Schizochytrium pour DHA), légumineuses, graines de lin/chanvre.');
    forbidden_ingredients.add('poisson');
    forbidden_ingredients.add('viande');
    forbidden_ingredients.add('œuf');
    forbidden_ingredients.add('lait');
    forbidden_ingredients.add('beurre');
    forbidden_ingredients.add('miel');
  }
  if (dietary.includes('vegetarian')) {
    forbidden_ingredients.add('poisson');
    forbidden_ingredients.add('viande');
  }
  if (dietary.includes('pescatarian')) {
    forbidden_ingredients.add('viande');
  }

  // Apply lever-level exclusions
  const filtered_levers: CulinaryLever[] = [];
  for (const lever of levers) {
    const ci = lever.contraindications ?? [];
    const blocked = ci.some((c) => blockedContraindicationKeys.has(c));
    if (blocked) {
      excluded.push({
        lever_id: lever.id,
        reason: `Contre-indication patient: ${ci.filter((c) => blockedContraindicationKeys.has(c)).join(', ')}`,
      });
      continue;
    }
    filtered_levers.push(lever);
  }

  return {
    filtered_levers,
    excluded,
    warnings,
    forbidden_ingredients: Array.from(forbidden_ingredients),
  };
}
