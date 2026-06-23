/**
 * ============================================================
 * Functional Chef — canonical types
 * ============================================================
 * Single source of truth. All engine modules import from here.
 */

// ───────────────────────────────────────────────────────────
// Domain entities (mirror Supabase schema)
// ───────────────────────────────────────────────────────────

export type BottleneckId = 'ALLOSTATIC_LOAD' | 'IR' | 'INFLAM' | 'DYSBIOSE';
export type EBMTier = 'T1' | 'T2' | 'T3';
export type Sex = 'F' | 'M' | 'O';
export type ThresholdWeight = 'major' | 'moderate' | 'minor' | 'discriminant';
export type LeverCategory =
  | 'preparation'
  | 'ingredient'
  | 'timing'
  | 'sequence'
  | 'cooking'
  | 'fermentation'
  | 'dose'
  | 'avoidance';
export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'full_day';

export interface Bottleneck {
  id: BottleneckId;
  name: string;
  display_name_fr: string;
  display_name_en?: string;
  description?: string;
  priority_rank: number;
  classifier_rule?: string;
}

export interface Biomarker {
  id: string;
  name: string;
  unit?: string;
  category: string;
  description?: string;
  is_clinical: boolean;
}

export interface BiomarkerThreshold {
  id: string;
  bottleneck_id: BottleneckId;
  biomarker_id: string;
  functional_target_min: number | null;
  functional_target_max: number | null;
  alert_threshold_low: number | null;
  alert_threshold_high: number | null;
  alert_categorical_value: string | null;
  weight: ThresholdWeight;
  notes?: string;
}

export interface CulinaryLever {
  id: string;
  name_fr: string;
  name_en?: string;
  description: string;
  category: LeverCategory;
  expected_effect: string;
  ebm_tier: EBMTier;
  primary_reference?: string;
  pubmed_ids?: string[];
  dose_or_protocol?: string;
  cooking_constraint?: string;
  contraindications?: string[];
  precautions?: string[];
  is_universal_star: boolean;
  active: boolean;
}

export interface LeverBottleneckMap {
  lever_id: string;
  bottleneck_id: BottleneckId;
  tier_for_bottleneck: EBMTier;
  priority: number;
  bottleneck_specific_note?: string;
}

export interface BioavailabilitySynergy {
  id: string;
  molecule_a: string;
  molecule_b: string;
  matrix_required?: string;
  effect_description: string;
  effect_magnitude?: string;
  ebm_tier: EBMTier;
  reference?: string;
  is_synergy: boolean;
  notes?: string;
}

// ───────────────────────────────────────────────────────────
// Patient input
// ───────────────────────────────────────────────────────────

export interface PatientContext {
  cuisine_pref?: 'mediterranean' | 'french' | 'maghrebi' | 'asian' | 'flexible';
  time_per_meal?: number;          // minutes
  budget?: 'low' | 'medium' | 'high';
  equipment?: string[];             // ['oven', 'steam', 'blender', 'pressure_cooker']
  servings?: number;
  language?: 'fr' | 'en';
}

export interface PatientExclusions {
  allergies?: string[];             // ['nuts', 'gluten', 'shellfish']
  intolerances?: string[];          // ['lactose', 'fodmap']
  medical?: string[];               // ['MICI_active', 'anticoagulants_high_dose', 'pregnancy', 'hemochromatosis']
  dietary_pattern?: string[];       // ['vegetarian', 'vegan', 'pescatarian', 'halal', 'kosher']
  dislikes?: string[];
}

export interface PatientProfile {
  id?: string;
  external_id?: string;
  age?: number;
  sex?: Sex;
  /** Numeric biomarker values, keyed by biomarker.id (e.g. {"HOMA_IR": 2.1}) */
  biomarker_values: Record<string, number>;
  /** Clinical signals — numeric (Bristol score, frequency) or categorical ('positive') */
  clinical_signals: Record<string, number | string>;
  exclusions: PatientExclusions;
  context: PatientContext;
}

// ───────────────────────────────────────────────────────────
// Engine outputs
// ───────────────────────────────────────────────────────────

export interface BottleneckScore {
  bottleneck_id: BottleneckId;
  score: number;                          // weighted sum
  major_hits: number;
  moderate_hits: number;
  minor_hits: number;
  discriminant_hits: number;
  triggered: boolean;                      // passed classification rule
  is_dominant: boolean;
  is_co_dominant: boolean;
  evidence: BottleneckEvidence[];
}

export interface BottleneckEvidence {
  biomarker_id: string;
  observed_value: number | string;
  threshold_breached: 'low' | 'high' | 'categorical';
  weight: ThresholdWeight;
  contribution: number;                    // points added to score
}

export interface ClassificationResult {
  scores: BottleneckScore[];
  dominant: BottleneckId | null;
  co_dominant: BottleneckId | null;
  rationale: string;
}

export interface SelectedLever {
  lever_id: string;
  name_fr: string;
  ebm_tier: EBMTier;
  tier_for_active_bottleneck: EBMTier;
  expected_effect: string;
  dose_or_protocol?: string;
  primary_reference?: string;
  pubmed_ids?: string[];
  role: 'universal_star' | 'targeted' | 'modulator';
  rationale: string;
}

export interface LeverSelectionResult {
  selected: SelectedLever[];
  excluded: { lever_id: string; reason: string }[];
  warnings: string[];
}

// ───────────────────────────────────────────────────────────
// Composed dish (the LLM output, structured)
// ───────────────────────────────────────────────────────────

export interface DishIngredient {
  name: string;
  quantity: string;                  // "150g", "1 c.s.", "200 ml"
  notes?: string;                    // "EVOO à cru en finition"
  lever_activated?: string;          // back-reference to lever_id
}

export interface DishStep {
  order: number;
  instruction: string;
  duration_min?: number;
  temperature_max_c?: number;
  lever_activated?: string;
}

export interface ComposedDish {
  title: string;
  meal_type: MealType;
  servings: number;
  total_time_min: number;
  description: string;

  // Architecture (from spec §1.5, §2.5, §3.5)
  architecture: {
    vegetables_pct: number;          // ~50
    protein_pct: number;             // ~20-30
    lipid_pct: number;               // ~20
    notes?: string;
  };

  ingredients: DishIngredient[];
  steps: DishStep[];

  // Functional layer
  levers_activated: {
    lever_id: string;
    name_fr: string;
    tier: EBMTier;
    rationale_one_line: string;
  }[];

  ebm_summary: {
    T1_count: number;
    T2_count: number;
    T3_count: number;
  };

  expected_effects: {
    postprandial_2_4h: string;
    short_term_4_weeks: string;
    long_term_12_weeks: string;
  };

  shopping_list: { item: string; quantity: string }[];

  warnings: string[];
}

// ───────────────────────────────────────────────────────────
// Composer input
// ───────────────────────────────────────────────────────────

export interface ComposerInput {
  intent: string;
  meal_type: MealType;
  patient: PatientProfile;
  classification: ClassificationResult;
  selected_levers: SelectedLever[];
  excluded_levers?: { lever_id: string; reason: string }[];
}

// ───────────────────────────────────────────────────────────
// Full consultation result
// ───────────────────────────────────────────────────────────

export interface ConsultationResult {
  consultation_id?: string;
  intent: string;
  meal_type: MealType;
  classification: ClassificationResult;
  lever_selection: LeverSelectionResult;
  dish: ComposedDish;
  warnings: string[];
  llm_meta?: {
    provider?: string;
    model: string;
    input_tokens?: number;
    output_tokens?: number;
    latency_ms?: number;
  };
}
