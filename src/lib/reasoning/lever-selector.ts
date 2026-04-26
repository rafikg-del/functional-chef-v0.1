/**
 * ============================================================
 * Lever Selector
 * ============================================================
 *
 * Spec v0.1 §6 — ÉTAPE 3 of engine.
 *
 * Logic:
 *   1. Always include ≥4 universal stars (transversal T1 levers, the
 *      socle universel covering ~70% of therapeutic value per spec §4)
 *   2. Add targeted levers for the dominant bottleneck (max 4)
 *   3. If co-dominance, add 1-2 targeted levers for the co-dominant
 *   4. Sort by per-bottleneck tier (T1 > T2 > T3) then priority
 *   5. Cap total at 8-10 levers (avoid output overload)
 *
 * Each selected lever carries a `role` attribute:
 *   - 'universal_star'  → transversal T1, socle universel
 *   - 'targeted'        → specific to dominant/co-dominant bottleneck
 *   - 'modulator'       → bioavailability/pairing optimization (later)
 */

import type {
  BottleneckId,
  CulinaryLever,
  LeverBottleneckMap,
  LeverSelectionResult,
  ClassificationResult,
  SelectedLever,
} from './types';

const TIER_RANK: Record<string, number> = { T1: 1, T2: 2, T3: 3 };
const MAX_LEVERS_TOTAL = 10;
const MIN_UNIVERSAL_STARS = 4;
const MAX_TARGETED_DOMINANT = 4;
const MAX_TARGETED_CO_DOMINANT = 2;

interface SelectorInput {
  classification: ClassificationResult;
  available_levers: CulinaryLever[];           // already safety-filtered
  lever_bottleneck_map: LeverBottleneckMap[];
}

export function selectLevers({
  classification,
  available_levers,
  lever_bottleneck_map,
}: SelectorInput): LeverSelectionResult {
  const warnings: string[] = [];
  const dominant = classification.dominant;

  if (!dominant) {
    return {
      selected: [],
      excluded: [],
      warnings: [
        'Aucun bottleneck dominant détecté. Sélection de leviers impossible sans cible physiopathologique. Préciser l''intent ou enrichir le profil patient.',
      ],
    };
  }

  // Index lever_bottleneck_map by lever_id for fast lookup
  const mapByLever = new Map<string, LeverBottleneckMap[]>();
  for (const m of lever_bottleneck_map) {
    if (!mapByLever.has(m.lever_id)) mapByLever.set(m.lever_id, []);
    mapByLever.get(m.lever_id)!.push(m);
  }

  // Helper: get the per-bottleneck tier and priority for a given lever × bottleneck
  function getMappingFor(lever_id: string, bottleneck_id: BottleneckId) {
    const mappings = mapByLever.get(lever_id) ?? [];
    return mappings.find((m) => m.bottleneck_id === bottleneck_id);
  }

  // ───────────────────────────────────────────────────────
  // Step 1: Universal stars — sort by their tier for the dominant bottleneck
  // ───────────────────────────────────────────────────────
  const universal_pool = available_levers
    .filter((l) => l.is_universal_star)
    .map((l) => {
      const mapping = getMappingFor(l.id, dominant);
      return { lever: l, mapping };
    })
    .filter((x) => x.mapping !== undefined)
    .sort((a, b) => {
      const ta = TIER_RANK[a.mapping!.tier_for_bottleneck] ?? 4;
      const tb = TIER_RANK[b.mapping!.tier_for_bottleneck] ?? 4;
      if (ta !== tb) return ta - tb;
      return a.mapping!.priority - b.mapping!.priority;
    });

  const selected: SelectedLever[] = [];
  const universal_picks = universal_pool.slice(0, MIN_UNIVERSAL_STARS);

  for (const { lever, mapping } of universal_picks) {
    selected.push({
      lever_id: lever.id,
      name_fr: lever.name_fr,
      ebm_tier: lever.ebm_tier,
      tier_for_active_bottleneck: mapping!.tier_for_bottleneck,
      expected_effect: lever.expected_effect,
      dose_or_protocol: lever.dose_or_protocol,
      primary_reference: lever.primary_reference,
      pubmed_ids: lever.pubmed_ids,
      role: 'universal_star',
      rationale: `Levier étoile transversal (${mapping!.tier_for_bottleneck} pour ${dominant}). ${mapping!.bottleneck_specific_note ?? ''}`.trim(),
    });
  }

  if (universal_picks.length < MIN_UNIVERSAL_STARS) {
    warnings.push(
      `Seuls ${universal_picks.length} leviers étoile disponibles après filtres sécurité (cible ≥${MIN_UNIVERSAL_STARS}). Vérifier exclusions patient.`
    );
  }

  // ───────────────────────────────────────────────────────
  // Step 2: Targeted levers for dominant bottleneck (excluding stars already picked)
  // ───────────────────────────────────────────────────────
  const already_picked = new Set(selected.map((s) => s.lever_id));

  const targeted_dominant_pool = available_levers
    .filter((l) => !already_picked.has(l.id) && !l.is_universal_star)
    .map((l) => ({ lever: l, mapping: getMappingFor(l.id, dominant) }))
    .filter((x) => x.mapping !== undefined)
    .sort((a, b) => {
      const ta = TIER_RANK[a.mapping!.tier_for_bottleneck] ?? 4;
      const tb = TIER_RANK[b.mapping!.tier_for_bottleneck] ?? 4;
      if (ta !== tb) return ta - tb;
      return a.mapping!.priority - b.mapping!.priority;
    });

  for (const { lever, mapping } of targeted_dominant_pool.slice(0, MAX_TARGETED_DOMINANT)) {
    if (selected.length >= MAX_LEVERS_TOTAL) break;
    selected.push({
      lever_id: lever.id,
      name_fr: lever.name_fr,
      ebm_tier: lever.ebm_tier,
      tier_for_active_bottleneck: mapping!.tier_for_bottleneck,
      expected_effect: lever.expected_effect,
      dose_or_protocol: lever.dose_or_protocol,
      primary_reference: lever.primary_reference,
      pubmed_ids: lever.pubmed_ids,
      role: 'targeted',
      rationale: `Levier ciblé ${dominant} (${mapping!.tier_for_bottleneck}). ${mapping!.bottleneck_specific_note ?? ''}`.trim(),
    });
    already_picked.add(lever.id);
  }

  // ───────────────────────────────────────────────────────
  // Step 3: Co-dominant targeted levers (if any)
  // ───────────────────────────────────────────────────────
  if (classification.co_dominant) {
    const co = classification.co_dominant;
    const co_pool = available_levers
      .filter((l) => !already_picked.has(l.id) && !l.is_universal_star)
      .map((l) => ({ lever: l, mapping: getMappingFor(l.id, co) }))
      .filter((x) => x.mapping !== undefined)
      .sort((a, b) => {
        const ta = TIER_RANK[a.mapping!.tier_for_bottleneck] ?? 4;
        const tb = TIER_RANK[b.mapping!.tier_for_bottleneck] ?? 4;
        if (ta !== tb) return ta - tb;
        return a.mapping!.priority - b.mapping!.priority;
      });

    for (const { lever, mapping } of co_pool.slice(0, MAX_TARGETED_CO_DOMINANT)) {
      if (selected.length >= MAX_LEVERS_TOTAL) break;
      selected.push({
        lever_id: lever.id,
        name_fr: lever.name_fr,
        ebm_tier: lever.ebm_tier,
        tier_for_active_bottleneck: mapping!.tier_for_bottleneck,
        expected_effect: lever.expected_effect,
        dose_or_protocol: lever.dose_or_protocol,
        primary_reference: lever.primary_reference,
        pubmed_ids: lever.pubmed_ids,
        role: 'targeted',
        rationale: `Levier co-dominant ${co} (${mapping!.tier_for_bottleneck}). ${mapping!.bottleneck_specific_note ?? ''}`.trim(),
      });
    }
  }

  return {
    selected,
    excluded: [],
    warnings,
  };
}
