/**
 * ============================================================
 * Bottleneck Classifier
 * ============================================================
 *
 * Implements spec v0.1 §6 algorithm — ÉTAPE 1 & 2 of the engine.
 *
 * Input  : PatientProfile (biomarker_values + clinical_signals)
 *          + BiomarkerThresholds (from DB)
 *          + Bottlenecks (from DB)
 *
 * Output : ClassificationResult { scores, dominant, co_dominant, rationale }
 *
 * Logic  :
 *   1. For each (bottleneck × biomarker) threshold, check if patient breaches it
 *   2. Aggregate weighted hits (major / moderate / minor / discriminant)
 *   3. Apply per-bottleneck classification rule:
 *        - IR       : ≥3 majors OR (≥2 majors AND ≥3 moderates)
 *        - INFLAM   : CRP_US breach + ≥1 other major
 *        - DYSBIOSE : ≥2 major clinical breaches AND ≥1 historical aggravator
 *   4. Determine dominance:
 *        - 1 triggered  → dominant
 *        - 2 triggered  → co-dominance (highest score = dominant)
 *        - 3 triggered  → priority cascade IR > INFLAM > DYSBIOSE
 *
 * NOT a black box. Every classification decision is fully traceable
 * via the `evidence` array in BottleneckScore.
 */

import type {
  BottleneckId,
  BottleneckEvidence,
  BottleneckScore,
  Bottleneck,
  BiomarkerThreshold,
  ClassificationResult,
  PatientProfile,
  ThresholdWeight,
  IRPhenotype,
} from './types';

// Weight → numeric points contribution
const WEIGHT_POINTS: Record<ThresholdWeight, number> = {
  major: 3,
  moderate: 2,
  minor: 1,
  discriminant: 2,
};

// ───────────────────────────────────────────────────────────
// Per-bottleneck classification rules
// ───────────────────────────────────────────────────────────

interface RuleInput {
  major_hits: number;
  moderate_hits: number;
  evidence: BottleneckEvidence[];
}

const CLASSIFICATION_RULES: Record<BottleneckId, (i: RuleInput) => boolean> = {
  /**
   * IR rule (spec §1.2): ≥3 critères majeurs OR ≥2 majeurs + ≥3 modérés
   */
  IR: ({ major_hits, moderate_hits }) =>
    major_hits >= 3 || (major_hits >= 2 && moderate_hits >= 3),

  /**
   * INFLAM rule (spec §2.2): CRP-us breached + ≥1 other major secondary
   * Implementation: requires breach on CRP_US specifically AND ≥2 majors total
   * (CRP itself counts as major, so we need ≥1 more major beyond it).
   */
  INFLAM: ({ major_hits, evidence }) => {
    const crp_breached = evidence.some(
      (e) => e.biomarker_id === 'CRP_US' && e.weight === 'major'
    );
    return crp_breached && major_hits >= 2;
  },

  /**
   * DYSBIOSE rule (spec §3.2): ≥2 critères cliniques majeurs persistants
   *                            + ≥1 facteur historique aggravant
   * Major clinical signals : Bristol abnormal, Bloating frequent, Calprotectin elevated
   * Historical aggravators (moderate weight) : ABX_LIFETIME>3, PPI chronic, fiber<15g
   */
  DYSBIOSE: ({ major_hits, moderate_hits }) =>
    major_hits >= 2 && moderate_hits >= 1,
};

// ───────────────────────────────────────────────────────────
// Threshold breach detection
// ───────────────────────────────────────────────────────────

/**
 * Returns evidence object if the patient value breaches the threshold.
 * Returns null otherwise.
 *
 * Special handling:
 *   - Bristol score: alert if value <3 OR >5 (both tails) — the SQL
 *     stores low=3 high=5 (target band), so breach = value outside [3,5]
 *   - Categorical signals: match against alert_categorical_value
 *   - For "lower-is-worse" biomarkers (e.g. OmegaIndex, Albumin),
 *     we expect alert_threshold_low to be set; breach if value < that
 *   - For "higher-is-worse" (CRP, HOMA-IR), alert_threshold_high; breach if value > that
 */
function evaluateThreshold(
  threshold: BiomarkerThreshold,
  patient: PatientProfile
): BottleneckEvidence | null {
  const biomarkerId = threshold.biomarker_id;
  const numericValue = patient.biomarker_values[biomarkerId];
  const clinicalValue = patient.clinical_signals[biomarkerId];
  const observed = numericValue !== undefined ? numericValue : clinicalValue;

  if (observed === undefined || observed === null) return null;

  // Categorical signal (e.g. SIBO breath test = 'positive')
  if (threshold.alert_categorical_value && typeof observed === 'string') {
    if (observed.toLowerCase() === threshold.alert_categorical_value.toLowerCase()) {
      return {
        biomarker_id: biomarkerId,
        observed_value: observed,
        threshold_breached: 'categorical',
        weight: threshold.weight,
        contribution: WEIGHT_POINTS[threshold.weight],
      };
    }
    return null;
  }

  if (typeof observed !== 'number') return null;

  // Special case: Bristol (target band = 3-5, alert outside)
  if (biomarkerId === 'BRISTOL_SCORE') {
    if (observed < 3 || observed > 5) {
      return {
        biomarker_id: biomarkerId,
        observed_value: observed,
        threshold_breached: observed < 3 ? 'low' : 'high',
        weight: threshold.weight,
        contribution: WEIGHT_POINTS[threshold.weight],
      };
    }
    return null;
  }

  // High-side breach
  if (
    threshold.alert_threshold_high !== null &&
    observed > threshold.alert_threshold_high
  ) {
    return {
      biomarker_id: biomarkerId,
      observed_value: observed,
      threshold_breached: 'high',
      weight: threshold.weight,
      contribution: WEIGHT_POINTS[threshold.weight],
    };
  }

  // Low-side breach
  if (
    threshold.alert_threshold_low !== null &&
    observed < threshold.alert_threshold_low
  ) {
    return {
      biomarker_id: biomarkerId,
      observed_value: observed,
      threshold_breached: 'low',
      weight: threshold.weight,
      contribution: WEIGHT_POINTS[threshold.weight],
    };
  }

  return null;
}

// ───────────────────────────────────────────────────────────
// Per-bottleneck scoring
// ───────────────────────────────────────────────────────────

function scoreBottleneck(
  bottleneck: Bottleneck,
  thresholds: BiomarkerThreshold[],
  patient: PatientProfile
): BottleneckScore {
  const relevantThresholds = thresholds.filter(
    (t) => t.bottleneck_id === bottleneck.id
  );

  const evidence: BottleneckEvidence[] = [];
  let major_hits = 0;
  let moderate_hits = 0;
  let minor_hits = 0;
  let discriminant_hits = 0;
  let score = 0;

  for (const threshold of relevantThresholds) {
    const ev = evaluateThreshold(threshold, patient);
    if (ev) {
      evidence.push(ev);
      score += ev.contribution;
      switch (ev.weight) {
        case 'major':
          major_hits++;
          break;
        case 'moderate':
          moderate_hits++;
          break;
        case 'minor':
          minor_hits++;
          break;
        case 'discriminant':
          discriminant_hits++;
          break;
      }
    }
  }

  const triggered = CLASSIFICATION_RULES[bottleneck.id]({
    major_hits,
    moderate_hits,
    evidence,
  });

  return {
    bottleneck_id: bottleneck.id,
    score,
    major_hits,
    moderate_hits,
    minor_hits,
    discriminant_hits,
    triggered,
    is_dominant: false, // assigned in next step
    is_co_dominant: false,
    evidence,
  };
}

// ───────────────────────────────────────────────────────────
// Dominance assignment
// ───────────────────────────────────────────────────────────

/**
 * Spec §6 ÉTAPE 2:
 *   - 1 triggered → dominant
 *   - 2 triggered → co-dominance (higher score = dominant; ties broken by priority_rank)
 *   - 3 triggered → priority cascade IR > INFLAM > DYSBIOSE (causal upstream first)
 */
function assignDominance(
  scores: BottleneckScore[],
  bottlenecks: Bottleneck[]
): { dominant: BottleneckId | null; co_dominant: BottleneckId | null; rationale: string } {
  const triggered = scores.filter((s) => s.triggered);
  const priorityMap = new Map(bottlenecks.map((b) => [b.id, b.priority_rank]));

  if (triggered.length === 0) {
    return {
      dominant: null,
      co_dominant: null,
      rationale:
        "Aucun bottleneck déclenché. Soit le terrain est physiologique, soit les biomarqueurs renseignés sont insuffisants pour conclure. Sortie générique non personnalisée non recommandée — préciser l'intent ou enrichir le profil.",
    };
  }

  if (triggered.length === 1) {
    triggered[0].is_dominant = true;
    return {
      dominant: triggered[0].bottleneck_id,
      co_dominant: null,
      rationale: `Bottleneck dominant unique: ${triggered[0].bottleneck_id} (score ${triggered[0].score}, ${triggered[0].major_hits} majeurs).`,
    };
  }

  if (triggered.length === 2) {
    // Sort by score desc, tie-break by priority_rank asc (lower = upstream)
    triggered.sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score;
      return (priorityMap.get(a.bottleneck_id) ?? 99) - (priorityMap.get(b.bottleneck_id) ?? 99);
    });
    triggered[0].is_dominant = true;
    triggered[1].is_co_dominant = true;
    return {
      dominant: triggered[0].bottleneck_id,
      co_dominant: triggered[1].bottleneck_id,
      rationale: `Co-dominance: ${triggered[0].bottleneck_id} (dominant, score ${triggered[0].score}) + ${triggered[1].bottleneck_id} (co-dominant, score ${triggered[1].score}). Convergence via leviers étoile + 1 levier ciblé chaque.`,
    };
  }

  // 3 triggered → cascade IR > INFLAM > DYSBIOSE (priority_rank ascending)
  triggered.sort(
    (a, b) =>
      (priorityMap.get(a.bottleneck_id) ?? 99) -
      (priorityMap.get(b.bottleneck_id) ?? 99)
  );
  triggered[0].is_dominant = true;
  triggered[1].is_co_dominant = true;
  return {
    dominant: triggered[0].bottleneck_id,
    co_dominant: triggered[1].bottleneck_id,
    rationale: `Triple co-dominance: cascade causale appliquée (${triggered[0].bottleneck_id} > ${triggered[1].bottleneck_id} > ${triggered[2].bottleneck_id}). On adresse d'abord la cause amont. Le 3e bottleneck (${triggered[2].bottleneck_id}) sera réévalué en consultation suivante après stabilisation amont.`,
  };
}

// ───────────────────────────────────────────────────────────
// IR hepatic MASLD phenotype (v0.2 enrichment — Truong 2025)
// ───────────────────────────────────────────────────────────

/**
 * Tag hepatic_masld only when IR is triggered AND hepatic steatosis is
 * confirmed by imaging (PDFF or MRS). No ALT/TG-HDL proxy — those reflect
 * systemic IR and would over-label MASLD without imaging proof.
 */
function detectHepaticMasldPhenotype(scores: BottleneckScore[]): IRPhenotype[] {
  const ir = scores.find((s) => s.bottleneck_id === 'IR');
  if (!ir?.triggered) return [];

  const hit = new Set(ir.evidence.map((e) => e.biomarker_id));
  const hasImaging = hit.has('LIVER_FAT_PDFF') || hit.has('LIVER_FAT_MRS');

  return hasImaging ? ['hepatic_masld'] : [];
}

// ───────────────────────────────────────────────────────────
// Public API
// ───────────────────────────────────────────────────────────

export function classifyBottlenecks(
  patient: PatientProfile,
  bottlenecks: Bottleneck[],
  thresholds: BiomarkerThreshold[]
): ClassificationResult {
  const scores = bottlenecks.map((b) => scoreBottleneck(b, thresholds, patient));
  const { dominant, co_dominant, rationale } = assignDominance(scores, bottlenecks);
  const phenotypes = detectHepaticMasldPhenotype(scores);

  let finalRationale = rationale;
  if (phenotypes.includes('hepatic_masld')) {
    finalRationale += ' Phénotype hepatic_masld (stéatose confirmée par imagerie hépatique) : leviers anti-DNL et anti-fructose priorisés.';
  }

  return { scores, dominant, co_dominant, phenotypes: phenotypes.length ? phenotypes : undefined, rationale: finalRationale };
}
