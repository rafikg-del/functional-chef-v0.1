/**
 * Culinary preview for the public demo.
 * Cases A/B/C use high-quality fixtures aligned with the selector catalog.
 * Other profiles get a deterministic dish built from selected levers (no LLM).
 */

import type { BottleneckId, ComposedDish, SelectedLever } from '@/lib/reasoning/types';
import { bottleneckLabel } from './labels';

const DISCLAIMER_EFFECTS = {
  postprandial_2_4h:
    'Effets décrits pour les leviers T1 mobilisés (littérature du levier). Ce n’est pas une mesure sur ce plat, ni une promesse clinique.',
  short_term_4_weeks:
    'Les leviers retenus sont associés, en essais, à des évolutions de biomarqueurs sur plusieurs semaines — à valider par le praticien.',
  long_term_12_weeks:
    'Aucun plat unique ne « traite » un bottleneck. L’hypothèse d’usage est un pattern répété, sous responsabilité clinique.',
};

function countTiers(levers: { tier: 'T1' | 'T2' | 'T3' }[]) {
  return {
    T1_count: levers.filter((l) => l.tier === 'T1').length,
    T2_count: levers.filter((l) => l.tier === 'T2').length,
    T3_count: levers.filter((l) => l.tier === 'T3').length,
  };
}

export const FIXTURE_DISHES: Record<'A' | 'B' | 'C', ComposedDish> = {
  A: {
    title: 'Bol méditerranéen lentilles-sardines, vinaigre et séquence',
    meal_type: 'lunch',
    servings: 2,
    total_time_min: 35,
    description:
      'Architecture 50 / 25 / 25 pour une IR isolée : légumineuses + sardines + EVOO, amidon refroidi, vinaigre 10 min avant, légumes d’abord. Aperçu déterministe (catalogue), pas une composition Claude.',
    architecture: {
      vegetables_pct: 50,
      protein_pct: 25,
      lipid_pct: 25,
      notes: 'Légumes en entrée, puis protéines, amidon en dernier.',
    },
    ingredients: [
      { name: 'Vinaigre de cidre dilué', quantity: '15 ml', notes: '10 min avant le repas', lever_activated: 'L_VINEGAR_PRE_PRANDIAL' },
      { name: 'Roquette + concombre + tomates', quantity: '200 g', notes: 'Entrée, avant le reste', lever_activated: 'L_FOOD_SEQUENCE' },
      { name: 'Lentilles vertes cuites', quantity: '140 g', lever_activated: 'L_LEGUMINOUSES_REGULAR' },
      { name: 'Sardines à l’huile d’olive', quantity: '120 g', lever_activated: 'L_FATTY_FISH_2X' },
      { name: 'Riz complet refroidi 24 h', quantity: '80 g cuit', lever_activated: 'L_RESISTANT_STARCH' },
      { name: 'Huile d’olive extra vierge à cru', quantity: '2 c.s.', lever_activated: 'L_EVOO_PRIMARY' },
      { name: 'Citron + persil plat', quantity: '1 + 1 c.s.' },
    ],
    steps: [
      { order: 1, instruction: 'Boire le vinaigre dilué 10 minutes avant de s’asseoir.', duration_min: 1, lever_activated: 'L_VINEGAR_PRE_PRANDIAL' },
      { order: 2, instruction: 'Servir la salade verte en premier. Attendre quelques minutes avant le bol.', duration_min: 5, lever_activated: 'L_FOOD_SEQUENCE' },
      { order: 3, instruction: 'Assembler lentilles, sardines, riz froid. Finir à cru avec EVOO et citron.', duration_min: 10, lever_activated: 'L_EVOO_PRIMARY' },
      { order: 4, instruction: 'Marcher 10–15 min après le repas (intensité légère).', duration_min: 12, lever_activated: 'L_POSTPRANDIAL_WALK' },
    ],
    levers_activated: [
      { lever_id: 'L_EVOO_PRIMARY', name_fr: "Huile d'olive extra vierge en première intention", tier: 'T1', rationale_one_line: 'Lipide principal PREDIMED — socle transversal.' },
      { lever_id: 'L_LEGUMINOUSES_REGULAR', name_fr: 'Légumineuses 3-4 portions/semaine', tier: 'T1', rationale_one_line: 'Fibres + amidon résistant, levier T1 IR.' },
      { lever_id: 'L_RESISTANT_STARCH', name_fr: 'Refroidissement amidon ≥24h', tier: 'T1', rationale_one_line: 'Riz cuit la veille, consommé froid ou tiède.' },
      { lever_id: 'L_FATTY_FISH_2X', name_fr: 'Poisson gras 2-3 portions/semaine', tier: 'T1', rationale_one_line: 'Sardines : EPA/DHA, petit poisson.' },
      { lever_id: 'L_VINEGAR_PRE_PRANDIAL', name_fr: 'Vinaigre pré-prandial 15-30 ml', tier: 'T1', rationale_one_line: 'Levier ciblé IR, 10 min avant.' },
      { lever_id: 'L_FOOD_SEQUENCE', name_fr: 'Séquence alimentaire', tier: 'T1', rationale_one_line: 'Légumes → protéines → glucides.' },
      { lever_id: 'L_POSTPRANDIAL_WALK', name_fr: 'Marche 10-15 min postprandiale', tier: 'T1', rationale_one_line: 'Captage musculaire GLUT-4.' },
      { lever_id: 'L_WHOLE_GRAINS', name_fr: 'Céréales complètes', tier: 'T1', rationale_one_line: 'Riz complet à la place du raffiné.' },
    ],
    ebm_summary: { T1_count: 8, T2_count: 0, T3_count: 0 },
    expected_effects: DISCLAIMER_EFFECTS,
    shopping_list: [
      { item: 'Lentilles vertes sèches', quantity: '200 g' },
      { item: 'Sardines (petites boîtes)', quantity: '2' },
      { item: 'Riz complet', quantity: '250 g' },
      { item: 'EVOO', quantity: '1 bouteille' },
      { item: 'Vinaigre de cidre', quantity: '1 bouteille' },
      { item: 'Roquette / tomates / citron', quantity: 'selon saison' },
    ],
    warnings: [
      'Aperçu pédagogique. À valider par un praticien avant tout usage patient.',
      'Vinaigre : prudence si gastrite ou reflux sévère.',
    ],
  },
  B: {
    title: 'Papillote de maquereau, brocoli vapeur, curcuma et baies',
    meal_type: 'dinner',
    servings: 2,
    total_time_min: 30,
    description:
      'Cible inflammaging : poisson gras, crucifères vapeur courte, EVOO, anthocyanes, curcuma + poivre en matrice lipidique, cuisson douce. Aperçu déterministe (catalogue).',
    architecture: {
      vegetables_pct: 50,
      protein_pct: 25,
      lipid_pct: 25,
      notes: 'Cuisson ≤120°C (papillote / vapeur). Pas de grillade.',
    },
    ingredients: [
      { name: 'Filets de maquereau', quantity: '250 g', lever_activated: 'L_FATTY_FISH_2X' },
      { name: 'Brocoli', quantity: '300 g', notes: 'Vapeur ≤4 min', lever_activated: 'L_CRUCIFEROUS_STEAM' },
      { name: 'Huile d’olive extra vierge', quantity: '2 c.s.', lever_activated: 'L_EVOO_PRIMARY' },
      { name: 'Curcuma + poivre noir', quantity: '1 c.c. + 1 pincée', lever_activated: 'L_TURMERIC_PIPERINE_LIPID' },
      { name: 'Myrtilles (fraîches ou décongelées)', quantity: '80 g', lever_activated: 'L_ANTHOCYANIN_BERRIES' },
      { name: 'Thé vert (après le repas, à 80°C)', quantity: '1 tasse', lever_activated: 'L_GREEN_TEA_DAILY' },
      { name: 'Citron + aneth', quantity: '1 + 1 c.s.' },
    ],
    steps: [
      { order: 1, instruction: 'Papillote maquereau + EVOO + curcuma + poivre. Four doux, pas de grill.', duration_min: 18, temperature_max_c: 120, lever_activated: 'L_GENTLE_COOKING' },
      { order: 2, instruction: 'Brocoli vapeur 3–4 min pour préserver la myrosinase.', duration_min: 4, lever_activated: 'L_CRUCIFEROUS_STEAM' },
      { order: 3, instruction: 'Servir avec un filet d’EVOO à cru. Baies en fin de repas, sans cuisson.', duration_min: 3, lever_activated: 'L_ANTHOCYANIN_BERRIES' },
      { order: 4, instruction: 'Thé vert 1 h après si le repas est riche en fer non-héminique.', duration_min: 3, lever_activated: 'L_GREEN_TEA_DAILY' },
    ],
    levers_activated: [
      { lever_id: 'L_FATTY_FISH_2X', name_fr: 'Poisson gras 2-3 portions/semaine', tier: 'T1', rationale_one_line: 'Levier #1 inflammaging — EPA+DHA.' },
      { lever_id: 'L_EVOO_PRIMARY', name_fr: "Huile d'olive extra vierge en première intention", tier: 'T1', rationale_one_line: 'Oléocanthal / hydroxytyrosol.' },
      { lever_id: 'L_CRUCIFEROUS_STEAM', name_fr: 'Crucifères vapeur courte (≤4 min)', tier: 'T1', rationale_one_line: 'Sulforaphane si vapeur courte.' },
      { lever_id: 'L_ANTHOCYANIN_BERRIES', name_fr: 'Anthocyanes 200-400 g/semaine (baies)', tier: 'T1', rationale_one_line: 'Baies crues, thermolabiles.' },
      { lever_id: 'L_TURMERIC_PIPERINE_LIPID', name_fr: 'Curcuma + pipérine + lipide chaud', tier: 'T2', rationale_one_line: 'Formulation-dépendante (T2).' },
      { lever_id: 'L_GENTLE_COOKING', name_fr: 'Cuisson douce ≤120°C', tier: 'T2', rationale_one_line: 'Papillote plutôt que grillade.' },
      { lever_id: 'L_GREEN_TEA_DAILY', name_fr: 'Thé vert 3-4 tasses/jour', tier: 'T2', rationale_one_line: 'EGCG — décaler du fer non-héminique.' },
    ],
    ebm_summary: { T1_count: 4, T2_count: 3, T3_count: 0 },
    expected_effects: DISCLAIMER_EFFECTS,
    shopping_list: [
      { item: 'Maquereau (filets)', quantity: '250 g' },
      { item: 'Brocoli', quantity: '1 tête' },
      { item: 'Myrtilles', quantity: '125 g' },
      { item: 'Curcuma + poivre noir', quantity: '1 pot chacun' },
      { item: 'Thé vert', quantity: '1 boîte' },
      { item: 'EVOO', quantity: '1 bouteille' },
    ],
    warnings: [
      'Aperçu pédagogique. À valider par un praticien.',
      'Curcuma : prudence anticoagulants haute dose / avant chirurgie.',
      'Thé vert : décaler ≥1 h des repas riches en fer non-héminique si anémie.',
    ],
  },
  C: {
    title: 'Bowl fibreux : pois chiches, kimchi, 30 plantes et bouillon',
    meal_type: 'lunch',
    servings: 2,
    total_time_min: 40,
    description:
      'Cible dysbiose (+ inflammaging co-dominant) : diversité végétale, fermenté vivant, légumineuses, prébiotiques progressifs, fibres, un T3 mécanique (bouillon). Introduction douce — pas un choc FODMAP.',
    architecture: {
      vegetables_pct: 55,
      protein_pct: 20,
      lipid_pct: 25,
      notes: 'Progression fibres. Si SIBO / FODMAP sévère : ce bol n’est pas un protocole de crise.',
    },
    ingredients: [
      { name: 'Pois chiches trempés 12 h, cuits', quantity: '120 g', lever_activated: 'L_LEGUMINOUSES_REGULAR' },
      { name: 'Kimchi non pasteurisé', quantity: '60 g', lever_activated: 'L_FERMENTED_DAILY' },
      { name: 'Poireau + asperge + persil + cumin + coriandre', quantity: '150 g + herbes', notes: 'Compter les espèces', lever_activated: 'L_PLANT_DIVERSITY_30' },
      { name: 'Topinambour (petite portion)', quantity: '40 g', lever_activated: 'L_PREBIOTIC_TARGETED' },
      { name: 'Riz complet refroidi 24 h', quantity: '70 g cuit', lever_activated: 'L_RESISTANT_STARCH' },
      { name: "Bouillon d'os (option T3)", quantity: '250 ml', lever_activated: 'L_BONE_BROTH' },
      { name: 'EVOO à cru', quantity: '1 c.s.', lever_activated: 'L_EVOO_PRIMARY' },
    ],
    steps: [
      { order: 1, instruction: 'Réchauffer doucement le bouillon. Ne pas faire bouillir le kimchi.', duration_min: 8, temperature_max_c: 80, lever_activated: 'L_BONE_BROTH' },
      { order: 2, instruction: 'Assembler pois chiches, riz froid, légumes. Kimchi à cru en finition.', duration_min: 10, lever_activated: 'L_FERMENTED_DAILY' },
      { order: 3, instruction: 'Garder le topinambour en petite portion si le terrain est peu habitué aux FODMAP.', duration_min: 5, lever_activated: 'L_PREBIOTIC_TARGETED' },
      { order: 4, instruction: 'Compter les espèces de la semaine (herbes et épices incluses).', duration_min: 2, lever_activated: 'L_PLANT_DIVERSITY_30' },
    ],
    levers_activated: [
      { lever_id: 'L_PLANT_DIVERSITY_30', name_fr: 'Diversité ≥30 plantes/semaine', tier: 'T1', rationale_one_line: 'Levier #1 dysbiose (American Gut).' },
      { lever_id: 'L_FERMENTED_DAILY', name_fr: 'Aliments fermentés ≥1 portion/jour', tier: 'T1', rationale_one_line: 'Kimchi vivant, non pasteurisé.' },
      { lever_id: 'L_LEGUMINOUSES_REGULAR', name_fr: 'Légumineuses 3-4 portions/semaine', tier: 'T1', rationale_one_line: 'Substrat fermentescible — introduction douce.' },
      { lever_id: 'L_FIBER_30G', name_fr: 'Fibres totales 30-40 g/jour', tier: 'T1', rationale_one_line: 'Cible de pattern, pas un bol unique.' },
      { lever_id: 'L_PREBIOTIC_TARGETED', name_fr: 'Prébiotiques ciblés', tier: 'T1', rationale_one_line: 'Petite dose, progression 4 semaines.' },
      { lever_id: 'L_RESISTANT_STARCH', name_fr: 'Refroidissement amidon ≥24h', tier: 'T2', rationale_one_line: 'Riz de la veille.' },
      { lever_id: 'L_REDUCE_ULTRA_PROCESSED', name_fr: 'Réduction ultra-transformés', tier: 'T2', rationale_one_line: 'Aucun additif / émulsifiant industriel ici.' },
      { lever_id: 'L_BONE_BROTH', name_fr: "Bouillon d'os", tier: 'T3', rationale_one_line: 'Mécanistique seulement — pas un RCT.' },
    ],
    ebm_summary: { T1_count: 5, T2_count: 2, T3_count: 1 },
    expected_effects: DISCLAIMER_EFFECTS,
    shopping_list: [
      { item: 'Pois chiches secs', quantity: '250 g' },
      { item: 'Kimchi cru', quantity: '1 pot' },
      { item: 'Poireau / asperge / herbes', quantity: '1 botte chacun' },
      { item: 'Topinambour', quantity: '2 pièces' },
      { item: 'Riz complet', quantity: '250 g' },
      { item: "Os à bouillon (option)", quantity: '500 g' },
    ],
    warnings: [
      'Aperçu pédagogique. À valider par un praticien.',
      'Prébiotiques / FODMAP : introduction progressive. Contre-indiqué en SIBO actif non stabilisé.',
      'Bouillon d’os : levier T3 (mécanistique), pas une preuve d’efficacité clinique.',
    ],
  },
};

export function buildDeterministicDish(
  dominant: BottleneckId,
  selected: SelectedLever[]
): ComposedDish {
  const activated = selected.map((l) => ({
    lever_id: l.lever_id,
    name_fr: l.name_fr,
    tier: l.tier_for_active_bottleneck,
    rationale_one_line: l.rationale,
  }));

  return {
    title: `Proposition culinaire — ${bottleneckLabel(dominant)}`,
    meal_type: 'lunch',
    servings: 2,
    total_time_min: 35,
    description: `Aperçu déterministe construit à partir des ${selected.length} leviers retenus par le sélecteur (sans LLM). Architecture 50 / 25 / 25. À valider par un praticien.`,
    architecture: {
      vegetables_pct: 50,
      protein_pct: 25,
      lipid_pct: 25,
      notes: 'Socle universel + leviers ciblés du bottleneck dominant.',
    },
    ingredients: selected.slice(0, 8).map((l) => ({
      name: l.name_fr,
      quantity: l.dose_or_protocol ?? 'selon protocole du levier',
      notes: `${l.tier_for_active_bottleneck} · ${l.role === 'universal_star' ? 'étoile' : 'ciblé'}`,
      lever_activated: l.lever_id,
    })),
    steps: [
      { order: 1, instruction: 'Commencer par les leviers de timing / séquence s’ils sont retenus (vinaigre, ordre du repas).', duration_min: 10 },
      { order: 2, instruction: 'Cuisson douce. Finir les lipides (EVOO) à cru quand le levier est sélectionné.', duration_min: 20, temperature_max_c: 120 },
      { order: 3, instruction: 'Ajouter fermentés / baies / herbes sans les pasteuriser.', duration_min: 5 },
    ],
    levers_activated: activated,
    ebm_summary: countTiers(activated),
    expected_effects: DISCLAIMER_EFFECTS,
    shopping_list: selected.slice(0, 6).map((l) => ({
      item: l.name_fr,
      quantity: 'voir dose du levier',
    })),
    warnings: [
      'Aperçu déterministe — pas une recette Claude. Chaque sortie reste à valider.',
    ],
  };
}
