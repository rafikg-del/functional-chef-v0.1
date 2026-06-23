/**
 * ============================================================
 * Functional Chef — research agent types
 * ============================================================
 *
 * The research agent produces a curation draft from a health or
 * daily-life problem. It does not classify a patient and does not
 * bypass the deterministic prescription engine.
 */

import type { EBMTier, MealType, ThresholdWeight } from '../reasoning/types';

export type EvidenceConfidence = 'high' | 'moderate' | 'low' | 'insufficient';

export interface LiteratureEvidenceInput {
  title: string;
  authors?: string[];
  journal?: string;
  year?: number;
  pmid?: string;
  doi?: string;
  url?: string;
  abstract?: string;
  key_findings?: string[];
}

export interface ResearchAgentContext {
  population?: string;
  daily_context?: string;
  preferred_cuisine?: string;
  meal_type?: MealType;
  exclusions?: string[];
  language?: 'fr' | 'en';
}

export interface ResearchAgentInput {
  problem: string;
  context?: ResearchAgentContext;
  literature?: LiteratureEvidenceInput[];
  target_bottleneck_name?: string;
  literature_search?: {
    enabled?: boolean;
    query?: string;
    max_results?: number;
  };
}

export interface BiomarkerEntryCriterion {
  biomarker: string;
  target: string;
  alert_threshold: string;
  weight: ThresholdWeight;
  rationale: string;
  overlap_with?: string[];
}

export interface BiologicalImpactPoint {
  pathway: string;
  biological_target: string;
  desired_direction: string;
  timeframe: 'postprandial_2_4h' | 'short_term_4_weeks' | 'long_term_12_weeks';
  ebm_tier: EBMTier;
  reference_pivot: string;
}

export interface ResearchLever {
  lever_id: string;
  name_fr: string;
  ebm_tier: EBMTier;
  reference_pivot: string;
  dose_or_protocol: string;
  mechanism: string;
  ingredient_candidates: string[];
  safety_notes?: string[];
}

export interface ResearchRecipe {
  title: string;
  meal_type: MealType;
  servings: number;
  total_time_min: number;
  architecture_notes: string;
  ingredients: { name: string; quantity: string; functional_role: string }[];
  steps: { order: number; instruction: string; lever_id?: string }[];
  levers_activated: string[];
  safety_notes: string[];
}

export interface EvidenceMapItem {
  claim: string;
  ebm_tier: EBMTier;
  references: string[];
  uncertainty: string;
}

export interface ResearchAgentOutput {
  bottleneck: {
    id: string;
    name_fr: string;
    functional_definition: string;
    priority_in_cascade: string;
    confidence: EvidenceConfidence;
    rationale: string;
  };
  entry_criteria: BiomarkerEntryCriterion[];
  classification_rule: string;
  biological_impact_points: BiologicalImpactPoint[];
  plate_architecture: {
    vegetables_50_pct: string;
    protein_20_30_pct: string;
    lipids_20_pct: string;
    required_modulators: string[];
  };
  anti_patterns: string[];
  levers: ResearchLever[];
  recipes: ResearchRecipe[];
  evidence_map: EvidenceMapItem[];
  research_gaps: string[];
  warnings: string[];
}

export function validateResearchAgentOutput(obj: unknown): obj is ResearchAgentOutput {
  if (!obj || typeof obj !== 'object') return false;
  const o = obj as Record<string, unknown>;
  const bottleneck = o.bottleneck as Record<string, unknown> | undefined;
  const plate = o.plate_architecture as Record<string, unknown> | undefined;

  return (
    !!bottleneck &&
    typeof bottleneck.id === 'string' &&
    typeof bottleneck.name_fr === 'string' &&
    typeof bottleneck.functional_definition === 'string' &&
    typeof bottleneck.priority_in_cascade === 'string' &&
    typeof o.classification_rule === 'string' &&
    Array.isArray(o.entry_criteria) &&
    Array.isArray(o.biological_impact_points) &&
    !!plate &&
    Array.isArray(plate.required_modulators) &&
    Array.isArray(o.anti_patterns) &&
    Array.isArray(o.levers) &&
    Array.isArray(o.recipes) &&
    Array.isArray(o.evidence_map) &&
    Array.isArray(o.research_gaps) &&
    Array.isArray(o.warnings)
  );
}
