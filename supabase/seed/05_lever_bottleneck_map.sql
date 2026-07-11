-- =====================================================================
-- Seed 05 — Lever × Bottleneck mapping with per-bottleneck tier
-- Reflects the convergence matrix from spec v0.1 §4
-- =====================================================================

INSERT INTO lever_bottleneck_map (lever_id, bottleneck_id, tier_for_bottleneck, priority, bottleneck_specific_note) VALUES

-- L_EVOO_PRIMARY — universal star
('L_EVOO_PRIMARY', 'IR',       'T1', 5,  'PREDIMED secondary analysis : ↑ sensibilité insulinique vs SFA'),
('L_EVOO_PRIMARY', 'INFLAM',   'T1', 5,  'Oléocanthal, hydroxytyrosol, effet anti-inflammatoire EVOO'),
('L_EVOO_PRIMARY', 'DYSBIOSE', 'T2', 30, 'Modulation microbiote favorable, données émergentes'),

-- L_LEGUMINOUSES_REGULAR — universal star
('L_LEGUMINOUSES_REGULAR', 'IR',       'T1', 10, 'Sievenpiper méta : ↓ HbA1c -0.48%'),
('L_LEGUMINOUSES_REGULAR', 'INFLAM',   'T2', 25, 'Effet indirect via composition corporelle et SCFA'),
('L_LEGUMINOUSES_REGULAR', 'DYSBIOSE', 'T1', 10, 'Substrat fermentescible privilégié, ↑ SCFA'),

-- L_RESISTANT_STARCH — universal star
('L_RESISTANT_STARCH', 'IR',       'T1', 15, 'Refroidissement amidon ↓ AUC postprandiale'),
('L_RESISTANT_STARCH', 'DYSBIOSE', 'T2', 20, '↑ butyrate fécal, fermentation colique'),

-- L_PLANT_DIVERSITY_30 — universal star
('L_PLANT_DIVERSITY_30', 'DYSBIOSE', 'T1', 1, 'Levier #1 dysbiose : American Gut Project'),
('L_PLANT_DIVERSITY_30', 'INFLAM',   'T2', 30, 'Charge polyphénolique cumulative'),
('L_PLANT_DIVERSITY_30', 'IR',       'T2', 35, 'Indirect via charge polyphénolique et fibres'),

-- L_FERMENTED_DAILY — universal star
('L_FERMENTED_DAILY', 'DYSBIOSE', 'T1', 5,  'Wastyk 2021 RCT : ↑ diversité +10%, ↓ 19 marqueurs inflam'),
('L_FERMENTED_DAILY', 'INFLAM',   'T2', 20, 'Effet anti-inflammatoire via axe gut-immune'),
('L_FERMENTED_DAILY', 'IR',       'T2', 40, 'Effet modeste via SCFA et axe métabolique'),

-- L_FATTY_FISH_2X — universal star (IR/INFLAM)
('L_FATTY_FISH_2X', 'INFLAM', 'T1', 1,  'Levier #1 inflammaging : EPA+DHA ↓ CRP/IL-6'),
('L_FATTY_FISH_2X', 'IR',     'T2', 25, 'Effet indirect sur inflammation hépatique et NAFLD'),

-- L_CRUCIFEROUS_STEAM — universal star
('L_CRUCIFEROUS_STEAM', 'INFLAM',   'T1', 10, 'Sulforaphane : ↑ Nrf2, ↓ NF-κB'),
('L_CRUCIFEROUS_STEAM', 'IR',       'T2', 40, 'Effet indirect via détox phase II'),
('L_CRUCIFEROUS_STEAM', 'DYSBIOSE', 'T2', 35, 'Charge polyphénolique et glucosinolates'),

-- L_ANTHOCYANIN_BERRIES — universal star
('L_ANTHOCYANIN_BERRIES', 'INFLAM',   'T1', 12, 'Anthocyanes : ↓ CRP, ↓ IL-6'),
('L_ANTHOCYANIN_BERRIES', 'IR',       'T2', 45, 'Effet glycémique modeste'),
('L_ANTHOCYANIN_BERRIES', 'DYSBIOSE', 'T2', 32, 'Polyphénols : urolithines, métabolisme microbien favorable'),

-- IR-specific
('L_VINEGAR_PRE_PRANDIAL', 'IR', 'T1', 1, 'Levier T1 ciblé IR : ↓20% AUC glucose 2h'),
('L_FOOD_SEQUENCE',         'IR', 'T1', 2, 'Levier T1 ciblé IR : -29% pic glucose'),
('L_WHEY_PRE_LOAD',         'IR', 'T2', 30, 'Pre-load protéique 15 min avant repas glucidique'),
('L_LONG_FERMENTATION_BREAD','IR','T2', 28, 'Pain levain : ↓ IG 20-30%'),
('L_LONG_FERMENTATION_BREAD','DYSBIOSE','T2', 28, '↓ FODMAP, ↑ tolérance digestive (Laatikainen 2017)'),
('L_POSTPRANDIAL_WALK',     'IR', 'T1', 3, 'Captage musculaire glucose GLUT-4 indépendant insuline'),
('L_WHOLE_GRAINS',          'IR', 'T1', 8, 'Substitution farines raffinées'),

-- INFLAM-specific
('L_TURMERIC_PIPERINE_LIPID', 'INFLAM',   'T2', 22, 'Curcuma + pipérine + lipide chaud'),
('L_TURMERIC_PIPERINE_LIPID', 'IR',       'T3', 50, 'Données indirectes IR'),
('L_TURMERIC_PIPERINE_LIPID', 'DYSBIOSE', 'T2', 38, 'Modulation microbiote'),
('L_MED_DIET_FULL',           'INFLAM',   'T1', 15, 'Pattern global méditerranéen'),
('L_MED_DIET_FULL',           'IR',       'T1', 18, 'Pattern protecteur IR validé PREDIMED'),
('L_REDUCE_RED_PROCESSED_MEAT','INFLAM',  'T1', 18, 'Charcuterie : ↓ CRP, ↓ mortalité'),
('L_GREEN_TEA_DAILY',         'INFLAM',   'T2', 25, 'Catéchines : ↓ CRP modeste'),
('L_GENTLE_COOKING',          'INFLAM',   'T2', 22, '↓ AGE alimentaires'),
('L_GENTLE_COOKING',          'DYSBIOSE', 'T2', 40, 'Préservation matrice fibreuse'),

-- DYSBIOSE-specific
('L_PREBIOTIC_TARGETED',     'DYSBIOSE', 'T1', 8,  'Inuline, FOS, GOS naturels'),
('L_REDUCE_ULTRA_PROCESSED', 'DYSBIOSE', 'T2', 15, '↓ émulsifiants industriels'),
('L_REDUCE_ULTRA_PROCESSED', 'INFLAM',   'T2', 28, 'Pattern alimentaire pro-inflammatoire global'),
('L_REDUCE_ULTRA_PROCESSED', 'IR',       'T2', 30, 'Densité énergétique et signal métabolique'),
('L_FIBER_30G',              'DYSBIOSE', 'T1', 3,  'Cible OMS, fondation pro-microbiote'),
('L_FIBER_30G',              'IR',       'T1', 12, 'Reynolds 2019 : ↓ HbA1c, ↑ satiété'),
('L_FIBER_30G',              'INFLAM',   'T1', 14, 'Effet anti-inflammatoire systémique'),
('L_AVOID_ARTIFICIAL_SWEETENERS','DYSBIOSE','T2', 25, 'Suez 2014/2022 : signal défavorable sous-population'),
('L_BONE_BROTH',             'DYSBIOSE', 'T3', 45, 'Mécanistique, soutien barrière');

-- ALLOSTATIC_LOAD mappings
INSERT INTO lever_bottleneck_map (lever_id, bottleneck_id, tier_for_bottleneck, priority, bottleneck_specific_note) VALUES
-- universal stars remapped for recovery / resilience
('L_EVOO_PRIMARY',          'ALLOSTATIC_LOAD', 'T2', 30, 'Socle méditerranéen : stabilité énergétique et charge polyphénolique anti-stress indirecte'),
('L_PLANT_DIVERSITY_30',    'ALLOSTATIC_LOAD', 'T2', 35, 'Diversité micronutritionnelle et polyphénolique, soutien axe gut-brain indirect'),
('L_FERMENTED_DAILY',       'ALLOSTATIC_LOAD', 'T2', 38, 'Axe gut-brain et immunité bas grade ; données sommeil/stress indirectes'),
('L_FATTY_FISH_2X',         'ALLOSTATIC_LOAD', 'T2', 20, 'EPA/DHA : modulation inflammation/résilience neurobiologique indirecte'),
('L_ANTHOCYANIN_BERRIES',   'ALLOSTATIC_LOAD', 'T2', 28, 'Polyphénols et cognition/fatigue ; signal récupération indirect'),
('L_CRUCIFEROUS_STEAM',     'ALLOSTATIC_LOAD', 'T3', 45, 'Nrf2 / stress oxydatif : plausibilité mécanistique'),
('L_FIBER_30G',             'ALLOSTATIC_LOAD', 'T2', 32, 'Fibres/SCFA et axe gut-brain ; indirect mais utile comme socle'),

-- targeted allostatic load levers
('L_CAFFEINE_CUTOFF_8H',            'ALLOSTATIC_LOAD', 'T1', 1,  'Levier prioritaire si sommeil fragmenté ou HRV basse : retirer un frein sympathique nocturne'),
('L_GLYCINE_PRE_BED',               'ALLOSTATIC_LOAD', 'T2', 5,  'Signal pré-coucher simple, utile pour qualité subjective du sommeil et fatigue'),
('L_MAGNESIUM_FOOD',                'ALLOSTATIC_LOAD', 'T2', 8,  'Apport alimentaire Mg comme socle de récupération neuromusculaire'),
('L_KIWI_PRE_BED',                  'ALLOSTATIC_LOAD', 'T2', 15, 'Collation pré-coucher alimentaire, données humaines initiales'),
('L_PROTEIN_BREAKFAST_STABLE_ENERGY','ALLOSTATIC_LOAD','T2', 18, 'Stabilisation énergie diurne et cravings de fin de journée'),
('L_POSTPRANDIAL_WALK',             'ALLOSTATIC_LOAD', 'T2', 22, 'Downshift postprandial et stabilité glycémique via activité légère');
