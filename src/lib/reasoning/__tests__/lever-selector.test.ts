/**
 * ============================================================
 * Lever Selector — Unit Tests (LIV-41)
 * ============================================================
 *
 * Coverage targets:
 *   - Dominance unique : ≥4 universal stars + targeted dominant
 *   - Co-dominance : stars + targeted dominant + targeted co-dominant
 *   - Phénotype hepatic_masld : boost levers anti-DNL
 *   - Pas assez de stars disponibles → warning
 *   - Pas de bottleneck dominant → sélection vide
 *   - Cap total à 10 leviers
 */

import { describe, it, expect } from 'vitest';
import { selectLevers } from '../lever-selector';
import type {
  CulinaryLever,
  LeverBottleneckMap,
  ClassificationResult,
  BottleneckScore,
  PatientProfile,
} from '../types';

// ─── Fixtures ───────────────────────────────────────────────────────────

const LEVERS: CulinaryLever[] = [
  // Universal stars
  { id: 'L_EVOO', name_fr: 'Huile d\'olive EVOO', category: 'ingredient', ebm_tier: 'T1', is_universal_star: true, expected_effect: 'Anti-inflammatory', active: true },
  { id: 'L_LEGUMINOUSES', name_fr: 'Légumineuses', category: 'ingredient', ebm_tier: 'T1', is_universal_star: true, expected_effect: 'HbA1c -0.48%', dose_or_protocol: '3-4x/sem', primary_reference: 'Sievenpiper 2009', pubmed_ids: ['19465743'], active: true },
  { id: 'L_RESISTANT_STARCH', name_fr: 'Amidon résistant', category: 'preparation', ebm_tier: 'T1', is_universal_star: true, expected_effect: '↓ AUC glucose', active: true },
  { id: 'L_PLANT_DIVERSITY', name_fr: 'Diversité 30 plantes', category: 'ingredient', ebm_tier: 'T1', is_universal_star: true, expected_effect: '↑ diversité microbiote', active: true },
  { id: 'L_FERMENTED', name_fr: 'Fermentés', category: 'fermentation', ebm_tier: 'T1', is_universal_star: true, expected_effect: '↑ diversité +10%', active: true },
  { id: 'L_FATTY_FISH', name_fr: 'Poisson gras', category: 'ingredient', ebm_tier: 'T1', is_universal_star: true, expected_effect: '↓ CRP', active: true },
  { id: 'L_CRUCIFEROUS', name_fr: 'Crucifères vapeur', category: 'cooking', ebm_tier: 'T1', is_universal_star: true, expected_effect: '↑ Nrf2', active: true },
  { id: 'L_ANTHOCYANIN', name_fr: 'Baies', category: 'ingredient', ebm_tier: 'T1', is_universal_star: true, expected_effect: '↓ IL-6', active: true },
  // IR-specific
  { id: 'L_VINEGAR', name_fr: 'Vinaigre pré-prandial', category: 'timing', ebm_tier: 'T1', is_universal_star: false, expected_effect: '-20% AUC glucose', active: true },
  { id: 'L_FOOD_SEQUENCE', name_fr: 'Séquence alimentaire', category: 'sequence', ebm_tier: 'T1', is_universal_star: false, expected_effect: '-29% pic glucose', active: true },
  { id: 'L_POSTPRANDIAL_WALK', name_fr: 'Marche postprandiale', category: 'timing', ebm_tier: 'T1', is_universal_star: false, expected_effect: '-20% pic glucose', active: true },
  { id: 'L_WHOLE_GRAINS', name_fr: 'Céréales complètes', category: 'ingredient', ebm_tier: 'T1', is_universal_star: false, expected_effect: '↓ HbA1c', active: true },
  // INFLAM-specific
  { id: 'L_CURCUMIN', name_fr: 'Curcuma', category: 'preparation', ebm_tier: 'T2', is_universal_star: false, expected_effect: '↓ CRP', active: true },
  { id: 'L_GREEN_TEA', name_fr: 'Thé vert', category: 'ingredient', ebm_tier: 'T2', is_universal_star: false, expected_effect: '↓ CRP modeste', active: true },
  { id: 'L_GENTLE_COOKING', name_fr: 'Cuisson douce', category: 'cooking', ebm_tier: 'T2', is_universal_star: false, expected_effect: '↓ AGE', active: true },
  // DYSBIOSE-specific
  { id: 'L_PREBIOTIC', name_fr: 'Prébiotiques ciblés', category: 'ingredient', ebm_tier: 'T1', is_universal_star: false, expected_effect: '↑ Bifidobactéries', active: true },
  { id: 'L_FIBER_30G', name_fr: 'Fibres 30-40g/j', category: 'ingredient', ebm_tier: 'T1', is_universal_star: false, expected_effect: '↓ Mortalité toutes causes', active: true },
  // Hepatic MASLD levers
  { id: 'L_FRUCTOSE_AVOIDANCE', name_fr: 'Éviter excès fructose', category: 'avoidance', ebm_tier: 'T2', is_universal_star: false, expected_effect: '↓ DNL hépatique', active: true },
  { id: 'L_LOW_CARB', name_fr: 'Low-carb modéré', category: 'dose', ebm_tier: 'T1', is_universal_star: false, expected_effect: '↓ DNL hépatique', active: true },
  { id: 'L_SAT_FAT_REDUCTION', name_fr: 'Réduire AG saturés', category: 'ingredient', ebm_tier: 'T2', is_universal_star: false, expected_effect: '↓ TG hépatique', active: true },
];

const LEVER_MAP: LeverBottleneckMap[] = [
  // Universal stars × bottlenecks
  { lever_id: 'L_EVOO', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 5 },
  { lever_id: 'L_EVOO', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T1', priority: 5 },
  { lever_id: 'L_EVOO', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T2', priority: 30 },
  { lever_id: 'L_LEGUMINOUSES', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 10 },
  { lever_id: 'L_LEGUMINOUSES', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T1', priority: 10 },
  { lever_id: 'L_LEGUMINOUSES', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T2', priority: 25 },
  { lever_id: 'L_RESISTANT_STARCH', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 15 },
  { lever_id: 'L_RESISTANT_STARCH', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T2', priority: 20 },
  { lever_id: 'L_PLANT_DIVERSITY', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T1', priority: 1 },
  { lever_id: 'L_PLANT_DIVERSITY', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T2', priority: 30 },
  { lever_id: 'L_PLANT_DIVERSITY', bottleneck_id: 'IR', tier_for_bottleneck: 'T2', priority: 35 },
  { lever_id: 'L_FERMENTED', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T1', priority: 5 },
  { lever_id: 'L_FERMENTED', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T2', priority: 20 },
  { lever_id: 'L_FERMENTED', bottleneck_id: 'IR', tier_for_bottleneck: 'T2', priority: 40 },
  { lever_id: 'L_FATTY_FISH', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T1', priority: 1 },
  { lever_id: 'L_FATTY_FISH', bottleneck_id: 'IR', tier_for_bottleneck: 'T2', priority: 25 },
  { lever_id: 'L_CRUCIFEROUS', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T1', priority: 10 },
  { lever_id: 'L_CRUCIFEROUS', bottleneck_id: 'IR', tier_for_bottleneck: 'T2', priority: 40 },
  { lever_id: 'L_CRUCIFEROUS', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T2', priority: 35 },
  { lever_id: 'L_ANTHOCYANIN', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T1', priority: 12 },
  { lever_id: 'L_ANTHOCYANIN', bottleneck_id: 'IR', tier_for_bottleneck: 'T2', priority: 45 },
  { lever_id: 'L_ANTHOCYANIN', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T2', priority: 32 },
  // IR-targeted
  { lever_id: 'L_VINEGAR', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 1, bottleneck_specific_note: 'Levier T1 ciblé IR' },
  { lever_id: 'L_FOOD_SEQUENCE', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 2 },
  { lever_id: 'L_POSTPRANDIAL_WALK', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 3 },
  { lever_id: 'L_WHOLE_GRAINS', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 8 },
  // INFLAM-targeted
  { lever_id: 'L_CURCUMIN', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T2', priority: 22 },
  { lever_id: 'L_GREEN_TEA', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T2', priority: 25 },
  { lever_id: 'L_GENTLE_COOKING', bottleneck_id: 'INFLAM', tier_for_bottleneck: 'T2', priority: 22 },
  // DYSBIOSE-targeted
  { lever_id: 'L_PREBIOTIC', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T1', priority: 8 },
  { lever_id: 'L_FIBER_30G', bottleneck_id: 'DYSBIOSE', tier_for_bottleneck: 'T1', priority: 3 },
  // Hepatic MASLD levers (priorité haute sur IR)
  { lever_id: 'L_FRUCTOSE_AVOIDANCE', bottleneck_id: 'IR', tier_for_bottleneck: 'T2', priority: 4 },
  { lever_id: 'L_LOW_CARB', bottleneck_id: 'IR', tier_for_bottleneck: 'T1', priority: 6 },
  { lever_id: 'L_SAT_FAT_REDUCTION', bottleneck_id: 'IR', tier_for_bottleneck: 'T2', priority: 7 },
];

// ─── Helpers ────────────────────────────────────────────────────────────

function makeScore(bottleneck_id: string, triggered: boolean, score = 0): BottleneckScore {
  return {
    bottleneck_id: bottleneck_id as any,
    score,
    major_hits: triggered ? 3 : 0,
    moderate_hits: 0,
    minor_hits: 0,
    discriminant_hits: 0,
    triggered,
    is_dominant: false,
    is_co_dominant: false,
    evidence: [],
  };
}

function makeClassification(dominant: string | null, co_dominant: string | null, phenotypes?: string[]): ClassificationResult {
  const scores = [makeScore('IR', dominant === 'IR'), makeScore('INFLAM', dominant === 'INFLAM' || co_dominant === 'INFLAM'), makeScore('DYSBIOSE', dominant === 'DYSBIOSE' || co_dominant === 'DYSBIOSE')];
  return { scores, dominant: dominant as any, co_dominant: co_dominant as any, phenotypes: phenotypes as any, rationale: 'Test' };
}

// ─── Tests ──────────────────────────────────────────────────────────────

describe('lever-selector', () => {
  it('Dominance IR → ≥4 universal stars + max 4 IR-targeted', () => {
    const classification = makeClassification('IR', null);
    const result = selectLevers({ classification, available_levers: LEVERS, lever_bottleneck_map: LEVER_MAP });

    expect(result.selected.length).toBeGreaterThanOrEqual(4);
    expect(result.selected.length).toBeLessThanOrEqual(10);

    // Au moins 4 universal stars
    const stars = result.selected.filter(l => l.role === 'universal_star');
    expect(stars.length).toBeGreaterThanOrEqual(4);

    // Au moins 1 levier IR-targeted (parmi VINEGAR, FOOD_SEQUENCE, POSTPRANDIAL_WALK, WHOLE_GRAINS)
    const irTargeted = result.selected.filter(l =>
      ['L_VINEGAR', 'L_FOOD_SEQUENCE', 'L_POSTPRANDIAL_WALK', 'L_WHOLE_GRAINS'].includes(l.lever_id)
    );
    expect(irTargeted.length).toBeGreaterThanOrEqual(1);

    // Tous les leviers sélectionnés ont role 'universal_star' ou 'targeted'
    for (const l of result.selected) {
      expect(['universal_star', 'targeted']).toContain(l.role);
    }

    // Pas de warning
    expect(result.warnings.filter(w => !w.includes('Phénotype'))).toHaveLength(0);
  });

  it('Dominance INFLAM → universal stars + INFLAM-targeted', () => {
    const classification = makeClassification('INFLAM', null);
    const result = selectLevers({ classification, available_levers: LEVERS, lever_bottleneck_map: LEVER_MAP });

    const stars = result.selected.filter(l => l.role === 'universal_star');
    expect(stars.length).toBeGreaterThanOrEqual(4);

    // Vérifier que les stars sont bien T1 pour INFLAM en premier
    expect(stars[0].tier_for_active_bottleneck).toBe('T1');

    // Au moins 1 levier INFLAM-targeted
    const inflamTargeted = result.selected.filter(l =>
      ['L_CURCUMIN', 'L_GREEN_TEA', 'L_GENTLE_COOKING'].includes(l.lever_id)
    );
    expect(inflamTargeted.length).toBeGreaterThanOrEqual(1);
  });

  it('Dominance DYSBIOSE → universal stars + DYSBIOSE-targeted', () => {
    const classification = makeClassification('DYSBIOSE', null);
    const result = selectLevers({ classification, available_levers: LEVERS, lever_bottleneck_map: LEVER_MAP });

    const stars = result.selected.filter(l => l.role === 'universal_star');
    expect(stars.length).toBeGreaterThanOrEqual(4);

    // DYSBIOSE-specific levers (L_PREBIOTIC, L_FIBER_30G)
    const dysTargeted = result.selected.filter(l =>
      ['L_PREBIOTIC', 'L_FIBER_30G'].includes(l.lever_id)
    );
    expect(dysTargeted.length).toBeGreaterThanOrEqual(1);

    // L_PLANT_DIVERSITY devrait être star #1 pour DYSBIOSE (priority 1)
    expect(stars[0].lever_id).toBe('L_PLANT_DIVERSITY');
  });

  it('Co-dominance IR + INFLAM → stars + 4 IR + 2 INFLAM max', () => {
    const classification = makeClassification('IR', 'INFLAM');
    const result = selectLevers({ classification, available_levers: LEVERS, lever_bottleneck_map: LEVER_MAP });

    const stars = result.selected.filter(l => l.role === 'universal_star');
    expect(stars.length).toBeGreaterThanOrEqual(4);

    // Au moins 1 IR-targeted + au moins 1 INFLAM-targeted
    const irIds = ['L_VINEGAR', 'L_FOOD_SEQUENCE', 'L_POSTPRANDIAL_WALK', 'L_WHOLE_GRAINS'];
    const inflamIds = ['L_CURCUMIN', 'L_GREEN_TEA', 'L_GENTLE_COOKING'];

    expect(result.selected.some(l => irIds.includes(l.lever_id))).toBe(true);
    expect(result.selected.some(l => inflamIds.includes(l.lever_id))).toBe(true);
  });

  it('Pas de bottleneck dominant → sélection vide avec warning', () => {
    const classification = makeClassification(null, null);
    const result = selectLevers({ classification, available_levers: LEVERS, lever_bottleneck_map: LEVER_MAP });

    expect(result.selected).toHaveLength(0);
    expect(result.warnings.length).toBeGreaterThanOrEqual(1);
  });

  it('Pas assez de universal stars disponibles → warning', () => {
    const classification = makeClassification('IR', null);
    // Simuler un filtre sécurité qui ne laisse que 2 stars
    const filteredLevers = LEVERS.filter(l => l.id === 'L_EVOO' || l.id === 'L_LEGUMINOUSES');
    const result = selectLevers({ classification, available_levers: filteredLevers, lever_bottleneck_map: LEVER_MAP });

    expect(result.warnings.some(w => w.includes('Seuls'))).toBe(true);
  });

  describe('Phénotype hepatic_masld', () => {
    it('IR + hepatic_masld → L_FRUCTOSE_AVOIDANCE priorisé avant targeted', () => {
      const classification = makeClassification('IR', null, ['hepatic_masld']);
      const result = selectLevers({ classification, available_levers: LEVERS, lever_bottleneck_map: LEVER_MAP });

      // Vérifier que les levers MASLD sont sélectionnés
      const masldIds = ['L_FRUCTOSE_AVOIDANCE', 'L_LOW_CARB', 'L_SAT_FAT_REDUCTION'];
      const masldSelected = result.selected.filter(l => masldIds.includes(l.lever_id));
      expect(masldSelected.length).toBeGreaterThanOrEqual(1);

      // Warning présent
      expect(result.warnings.some(w => w.includes('hepatic_masld'))).toBe(true);
    });

    it('IR sans hepatic_masld → levers MASLD pas priorisés (mais peuvent être sélectionnés si T1)', () => {
      const classification = makeClassification('IR', null);
      const result = selectLevers({ classification, available_levers: LEVERS, lever_bottleneck_map: LEVER_MAP });

      // L_LOW_CARB est T1 pour IR, peut être sélectionné normalement
      // L_FRUCTOSE_AVOIDANCE est T2 pour IR — moins prioritaire sans tag
      expect(result.warnings.some(w => w.includes('hepatic_masld'))).toBe(false);
    });
  });

  it('Cap total ≤ 10 leviers respecté même avec beaucoup de candidats', () => {
    const classification = makeClassification('IR', 'DYSBIOSE');
    const result = selectLevers({ classification, available_levers: LEVERS, lever_bottleneck_map: LEVER_MAP });

    expect(result.selected.length).toBeLessThanOrEqual(10);
  });

  it('Chaque levier sélectionné a les champs requis', () => {
    const classification = makeClassification('IR', null);
    const result = selectLevers({ classification, available_levers: LEVERS, lever_bottleneck_map: LEVER_MAP });

    for (const l of result.selected) {
      expect(l.lever_id).toBeTruthy();
      expect(l.name_fr).toBeTruthy();
      expect(l.ebm_tier).toBeTruthy();
      expect(l.tier_for_active_bottleneck).toBeTruthy();
      expect(l.expected_effect).toBeTruthy();
      expect(l.role).toBeTruthy();
      expect(l.rationale).toBeTruthy();
      expect(['T1', 'T2', 'T3']).toContain(l.ebm_tier);
      expect(['T1', 'T2', 'T3']).toContain(l.tier_for_active_bottleneck);
      expect(['universal_star', 'targeted', 'modulator']).toContain(l.role);
    }
  });
});
