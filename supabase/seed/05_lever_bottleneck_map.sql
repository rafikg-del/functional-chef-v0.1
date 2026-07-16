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

-- IR hepatic MASLD phenotype levers (priorité haute si tag hepatic_masld)
('L_FRUCTOSE_AVOIDANCE_50G', 'IR', 'T2', 4, 'Spécifique phénotype MASLD — ↓ ChREBP/DNL [Truong 2025]'),
('L_LOW_CARB_MODERATE',      'IR', 'T1', 6, 'RCT T2DM + stéatose — ↓ DNL hépatique'),
('L_SAT_FAT_REDUCTION',      'IR', 'T2', 7, 'Luukkonen 2018 — saturés pire que sucres pour TG hépatique'),
('L_REDUCE_FREE_SUGAR_10PCT','IR', 'T3', 9, '↓ substrat DNL — cible ≤5% si stéatose confirmée. Lambert 2025 PMID à confirmer'),

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

-- =====================================================================
-- Seed 05b — Lever × Bottleneck mapping for the 35 new levers (v0.2)
-- =====================================================================

-- L01: CANNELLE
('L_CINNAMON_POLYPHENOLS',     'IR',       'T1', 5,  'Allen 2013 méta : ↓ glycémie -25 mg/dL, ↓ HOMA-IR'),
-- L02: FENUGREC
('L_FENUGREEK_SEEDS',          'IR',       'T1', 6,  'Galactomannan + 4-hydroxyisoleucine : ↓ HbA1c -0.8%'),
-- L03: CHIA
('L_CHIA_SEEDS',               'IR',       'T1', 20, 'Fibre mucilagineuse ↓ vidange gastrique + ALA ω-3'),
('L_CHIA_SEEDS',               'INFLAM',   'T2', 30, 'ALA ω-3 → modulation inflammation bas grade'),
-- L04: AVOCAT
('L_AVOCADO_DAILY',            'IR',       'T1', 22, '↑ MUFA + fibres solubles → ↓ LDL, ↑ sensibilité insulinique'),
('L_AVOCADO_DAILY',            'INFLAM',   'T2', 25, 'Polyphénols, glutathion, lutéine → ↓ inflammation bas grade'),
-- L05: OLÉAGINEUX — universal star
('L_NUTS_MIX_30G',             'IR',       'T1', 12, 'Afshin 2014 méta : ↓ HbA1c, ↓ LDL'),
('L_NUTS_MIX_30G',             'INFLAM',   'T1', 15, 'PREDIMED : ↓ CRP, ↓ événements CV'),
('L_NUTS_MIX_30G',             'DYSBIOSE', 'T2', 25, 'Fibres + polyphénols → modulation microbiote'),
-- L06: CHOCOLAT NOIR
('L_DARK_CHOCOLATE_20G',       'IR',       'T2', 30, 'Flavanols → ↑ NO → ↑ sensibilité insulinique'),
('L_DARK_CHOCOLATE_20G',       'INFLAM',   'T2', 25, 'Polyphénols → ↓ inflammation, ↑ HDL'),
('L_DARK_CHOCOLATE_20G',       'DYSBIOSE', 'T2', 30, 'Polyphénols microbiome → urolithines et métabolites'),
-- L07: DISTRIBUTION PROTÉINES
('L_PROTEIN_DISTRIBUTION',     'IR',       'T2', 3,  'Distribution 20-30g/repas → ↑ GLP-1, ↑ satiété'),
('L_PROTEIN_DISTRIBUTION',     'INFLAM',   'T2', 35, 'Maintien masse maigre → ↓ inflammation bas grade'),
-- L08: REPAS FAIBLE IG
('L_LOW_GI_MEAL_PATTERN',      'IR',       'T1', 4,  'Jenkins 1981 / Livesey 2019 : ↓ AUC glucose'),
-- L09: GINGEMBRE
('L_GINGER_FRESH',             'INFLAM',   'T2', 15, 'Gingerols → ↓ NF-κB, ↓ CRP'),
('L_GINGER_FRESH',             'DYSBIOSE', 'T3', 40, 'Modulation microbiote oral/gut, données émergentes'),
-- L10: AIL CRU
('L_GARLIC_RAW',               'INFLAM',   'T2', 20, 'Allicine → ↓ CRP, ↓ TNF-α, ↓ PA'),
('L_GARLIC_RAW',               'DYSBIOSE', 'T2', 25, 'Inuline-like prébiotique. Modulation microbiote'),
('L_GARLIC_RAW',               'IR',       'T3', 45, 'Effet métabolique indirect via inflammation'),
-- L11: GRENADE
('L_POMEGRANATE_JUICE_WEEKLY', 'INFLAM',   'T2', 18, 'Ellagitannins → urolithines → ↓ CRP, ↓ IL-6'),
('L_POMEGRANATE_JUICE_WEEKLY', 'IR',       'T3', 50, 'Données indirectes'),
('L_POMEGRANATE_JUICE_WEEKLY', 'DYSBIOSE', 'T3', 40, 'Urolithines = métabolites microbiens, activité prébiotique'),
-- L12: CERISE ACIDULÉE
('L_TART_CHERRY',              'INFLAM',   'T2', 20, 'Anthocyanines → ↓ CRP, ↓ IL-6, ↓ uricémie'),
('L_TART_CHERRY',              'IR',       'T2', 35, '↓ uricémie et inflammation bas grade bénéfique IR'),
-- L13: CAFÉ FILTRE — universal star
('L_COFFEE_FILTER',            'IR',       'T2', 15, 'Acides chlorogéniques → ↓ pic glucose, ↓ stéatose'),
('L_COFFEE_FILTER',            'INFLAM',   'T2', 20, '↓ CRP bas bruit de fond (épidémiologie solide)'),
('L_COFFEE_FILTER',            'DYSBIOSE', 'T2', 20, '↑ Bifidobactéries, modulation microbiote'),
-- L14: VITAMINE D ALIMENTS
('L_VITAMIN_D_FOODS',          'INFLAM',   'T2', 22, 'VDR sur cellules immunitaires → ↓ cytokines'),
('L_VITAMIN_D_FOODS',          'IR',       'T2', 40, 'Carence vit D associée IR — effet modeste'),
('L_VITAMIN_D_FOODS',          'DYSBIOSE', 'T3', 45, 'Immunité muqueuse intestinale, données émergentes'),
-- L15: HERBES AROMATIQUES
('L_ROSEMARY_HERBS',           'INFLAM',   'T2', 25, 'Acide rosmarinique, carnosol → ↑ Nrf2, ↓ NF-κB'),
('L_ROSEMARY_HERBS',           'DYSBIOSE', 'T3', 35, 'Polyphénols antimicrobiens sélectifs, données préliminaires'),
-- L16: PATRON SANS VIANDE
('L_MEDITERRANEAN_WEEKLY_MEAL','INFLAM',   'T1', 8,  '↓ AGE, TMAO, fer héminique — substitution protéines terrestres'),
('L_MEDITERRANEAN_WEEKLY_MEAL','IR',       'T2', 22, 'Pattern global protecteur IR'),
-- L17: FRUITS ENTIERS
('L_FRUIT_2_DAY',              'INFLAM',   'T1', 12, 'Aune 2017 BMJ : ↓ mortalité CV, ↓ CRP dose-dépendant'),
('L_FRUIT_2_DAY',              'IR',       'T2', 25, 'Polyphénols + fibres → ↓ charge glycémique repas'),
('L_FRUIT_2_DAY',              'DYSBIOSE', 'T2', 25, 'Fibres + polyphénols fermentés par microbiote'),
-- L18: PSYLLIUM
('L_PSYLLIUM_FIBER',           'DYSBIOSE', 'T1', 2,  'Fibre solubre non-fermentescible → régulation transit Bristol 3-5'),
('L_PSYLLIUM_FIBER',           'IR',       'T2', 18, '↓ vidange gastrique → ↓ pic glucose postprandial'),
-- L19: GRAINES DE LIN
('L_FLAX_SEEDS_GROUND',        'DYSBIOSE', 'T2', 12, 'Lignanes → entérolactone. Fibres S+I. Mucilage'),
('L_FLAX_SEEDS_GROUND',        'INFLAM',   'T2', 28, 'ALA ω-3 → ↓ inflammation bas grade'),
('L_FLAX_SEEDS_GROUND',        'IR',       'T2', 30, 'Fibres mucilagineuses → ↓ absorption glucose'),
-- L20: AVOINE β-GLUCANE
('L_OATS_BETA_GLUCAN',         'DYSBIOSE', 'T1', 4,  'β-glucane → ↑ butyrate, ↑ Bifidobactéries'),
('L_OATS_BETA_GLUCAN',         'IR',       'T1', 10, 'β-glucane → ↓ absorption glucose + EFSA health claim LDL'),
-- L21: FARINE BANANE VERTE
('L_GREEN_BANANA_FLOUR',       'DYSBIOSE', 'T2', 10, 'Amidon résistant type 2 → ↑ butyrate colique'),
('L_GREEN_BANANA_FLOUR',       'IR',       'T1', 16, '↓ IG des préparations via substitution farine'),
-- L22: MISO
('L_MISO_FERMENTED',           'DYSBIOSE', 'T2', 15, 'Fermentation longue → Lactobacilles, peptides bioactifs'),
('L_MISO_FERMENTED',           'INFLAM',   'T3', 35, 'Isoflavones aglycones, données épidémiologiques'),
-- L23: CHOUCROUTE KIMCHI
('L_KIMCHI_SAUERKRAUT',        'DYSBIOSE', 'T2', 8,  'Lactobacillus + Leuconostoc vivants + isothiocyanates'),
('L_KIMCHI_SAUERKRAUT',        'INFLAM',   'T3', 30, '↓ marqueurs inflammation, données coréennes'),
-- L24: KÉFIR
('L_KEFIR_WATER_DAIRY',        'DYSBIOSE', 'T1', 6,  'Consortium >30 souches : ↑ Lactobacillus spécifiques'),
('L_KEFIR_WATER_DAIRY',        'INFLAM',   'T2', 25, '↓ TNF-α, modulation immunitaire kéfir-spécifique'),
-- L25: YAOURTS PROBIOTIQUES
('L_COCONUT_YOGURT_PROBIOTIC', 'DYSBIOSE', 'T2', 10, 'Souches spécifiques (L. casei, L. rhamnosus, Bifidobacterium)'),
('L_COCONUT_YOGURT_PROBIOTIC', 'INFLAM',   'T3', 30, 'Immunomodulation souche-dépendante, modest evidence'),
-- L26: POMME ENTIÈRE
('L_APPLE_PECTIN',             'DYSBIOSE', 'T2', 15, 'Pectine fermentescible → ↑ butyrate. Quercétine peau'),
('L_APPLE_PECTIN',             'IR',       'T2', 30, 'Polyphénols + fibres → ↓ LDL, ↓ charge glycémique'),
-- L27: SALADE CRUE
('L_DIVERSE_SALAD_RAW',        'DYSBIOSE', 'T2', 16, 'Microbiote phytosphère + enzymes intactes + fibres'),
('L_DIVERSE_SALAD_RAW',        'INFLAM',   'T2', 20, 'Polyphénols non dénaturés + EVOO + diversification'),
('L_DIVERSE_SALAD_RAW',        'IR',       'T2', 25, '↓ densité énergétique, ↑ fibres et polyphénols'),
-- L28: FENÊTRE ALIMENTAIRE — universal star
('L_MEAL_TIMING_12H',          'IR',       'T1', 2,  'Sutton 2018 CR : ↓ insuline, ↑ sensibilité insulinique circadienne'),
('L_MEAL_TIMING_12H',          'INFLAM',   'T2', 10, '↓ NF-κB circadien, ↓ perméabilité intestinale nocturne'),
('L_MEAL_TIMING_12H',          'DYSBIOSE', 'T2', 15, 'Repos digestif nocturne → régénération barrière intestinale'),
-- L29: ALIMENTATION CONSCIENTE
('L_SLOW_EATING',              'IR',       'T2', 5,  'Ohkuma 2015 : mastication → ↑ GLP-1, ↓ apport -10%'),
('L_SLOW_EATING',              'INFLAM',   'T3', 50, '↓ stress alimentaire, effet anti-inflammatoire hypothétique'),
('L_SLOW_EATING',              'DYSBIOSE', 'T2', 20, 'Mastication → ↑ diversité microbiote via ↑ temps oral'),
-- L30: HYDRATATION
('L_HYDRATION_OPTIMAL',        'IR',       'T2', 22, 'Hydratation → fonction endothéliale, tonus vagal'),
('L_HYDRATION_OPTIMAL',        'DYSBIOSE', 'T2', 22, 'Fonction digestive, concentration urinaire, prévention lithiase'),
('L_HYDRATION_OPTIMAL',        'INFLAM',   'T3', 40, 'Effet anti-inflammatoire indirect via fonction rénale'),
-- L31: CHAMPIGNONS
('L_MUSHROOMS_WEEKLY',         'INFLAM',   'T2', 25, 'β-glucanes → immunomodulation. Ergothionéine antioxydant'),
('L_MUSHROOMS_WEEKLY',         'DYSBIOSE', 'T3', 30, 'β-glucanes fermentés par microbiote, données émergentes'),
('L_MUSHROOMS_WEEKLY',         'IR',       'T3', 50, 'Effet indirect sur IR via inflammation et vitamine D'),
-- L32: ALGUES
('L_SEAWEED_WEEKLY',           'DYSBIOSE', 'T2', 22, 'Polysaccharides sulfatés → prébiotique Bacteroides'),
('L_SEAWEED_WEEKLY',           'INFLAM',   'T3', 35, 'Fucoxanthine, fucoïdane → antioxydant, anti-inflammatoire'),
-- L33: AGRUMES
('L_CITRUS_POLYPHENOLS',       'INFLAM',   'T2', 20, 'Hespéridine, naringénine → ↓ CRP, ↓ LDL-ox, ↑ NO'),
('L_CITRUS_POLYPHENOLS',       'IR',       'T2', 30, '↓ LDL-ox, ↑ absorption fer. Polyphénols modulateurs'),
('L_CITRUS_POLYPHENOLS',       'DYSBIOSE', 'T3', 35, 'Polyphénols agrumes → métabolites microbiens'),
-- L34: SUBSTITUTION GRAISSES
('L_SATURATED_FAT_SWAP',       'IR',       'T1', 14, 'Wang 2016 méta : ↓ LDL -8%, ↓ ApoB/ApoA'),
('L_SATURATED_FAT_SWAP',       'INFLAM',   'T1', 16, 'Substitution saturés → insaturés ↓ inflammation bas grade'),
-- L35: EVOO CRU FINITION
('L_EVOO_CRU_FINITION',        'IR',       'T1', 8,  'Préserve polyphénols EVOO thermosensibles >90%'),
('L_EVOO_CRU_FINITION',        'INFLAM',   'T1', 8,  'Oléocanthal préservé → effet anti-inflammatoire COX-like'),

-- Nouveaux leviers v0.2 (enrichissement)
-- Chrome nutritionnel
('L_CHROMIUM_SUPP',            'IR',       'T1', 25, 'Suksomboon 2014 : ↑ sensibilité insulinique. Alimentaire : coeur betterave, brocoli, jaune oeuf'),
-- Psyllium fibres solubles
('L_PSYLLIUM_FIBER',           'IR',       'T1', 20, 'Anderson 1991 : ↓ HbA1c -0.3%, ↓ LDL -12% via viscosité'),
('L_PSYLLIUM_FIBER',           'DYSBIOSE', 'T1', 25, '↑ SCFA butyrate via fermentation colique. Complémente L_FIBER_30G'),
-- Inositol alimentaire
('L_INOSITOL_FOOD',            'IR',       'T1', 22, 'Unfer 2017 méta SOPK : ↓ HOMA-IR, ↓ testostérone libre. Prioritaire si pcos_adipose'),
('L_INOSITOL_FOOD',            'INFLAM',   'T2', 30, 'Effet anti-inflammatoire indirect via ↓ hyperinsulinémie'),
-- Thé vert EGCG
('L_GREEN_TEA_MATCHA',         'INFLAM',   'T1', 15, 'Zheng 2011 méta 25 RCT : ↓ CRP. EGCG inhibe NF-κB'),
('L_GREEN_TEA_MATCHA',         'IR',       'T2', 25, 'EGCG ↑ dépense énergétique, ↓ HOMA-IR (effet plus modeste que sur inflammation)'),
-- Curcuma + poivre
('L_TURMERIC_BLACKPEPPER',     'INFLAM',   'T1', 18, 'Shehzad 2013 méta 8 RCT : ↓ NF-κB, ↓ CRP. Pipérine ↑ biodisponibilité'),
('L_TURMERIC_BLACKPEPPER',     'IR',       'T2', 30, 'Curcumine ↓ TNF-α et IL-6 → amélioration secondaire sensibilité insulinique'),
-- Gingembre
('L_GINGER_ANTI_INFLAM',       'INFLAM',   'T2', 22, 'Mashhadi 2013 RCT : ↓ CRP. Gingérols = agonistes TRPV1 > inhibiteurs NF-κB'),
-- Baies anthocyanes
('L_BERRIES_ANTHOCYANINS',     'INFLAM',   'T1', 16, 'Zhu 2011 méta 22 RCT : ↓ CRP, ↓ oxLDL. Anthocyanes = Nrf2 + NF-κB'),
('L_BERRIES_ANTHOCYANINS',     'IR',       'T2', 28, '↓ stress oxydatif postprandial → protection secondaire du signal insulinique'),
-- Bouillon d'os / collagène
('L_BONE_BROTH_COLLAGEN',      'DYSBIOSE', 'T3', 35, 'Al-Nakkash 2024 revue : substrat glycine/glutamine barrière. T3 mécanistique'),
-- Légumes lactofermentés
('L_FERMENTED_VEGGIES',        'DYSBIOSE', 'T1', 15, 'Marco 2021 : ↑ diversité microbiome via LAB viables. ≥2 c.s./j'),
('L_FERMENTED_VEGGIES',        'INFLAM',   'T2', 30, '↓ pathobiontes → ↓ translocation LPS → ↓ inflammation bas grade'),
-- Avocat MUFA
('L_AVOCADO_MUFA',             'IR',       'T1', 20, 'Mahmassani 2018 méta 10 RCT : ↓ LDL, ↑ HDL, ↑ absorption caroténoïdes ×5-15'),
('L_AVOCADO_MUFA',             'INFLAM',   'T2', 28, 'Glutathion avocat + MUFA oléique → effet anti-inflammatoire modéré'),
-- Cannelle Ceylan
('L_CINNAMON_IR',              'IR',       'T1', 18, 'Allen 2013 méta 10 RCT : ↓ HOMA-IR -0.5, ↓ glycémie à jeun -5%. MHCP mimétique insuline'),
-- Café filtre
('L_COFFEE_CARDIO',            'IR',       'T2', 25, 'Poole 2017 BMJ umbrella : ↓ risque DT2 -30%. Acide chlorogénique + GLP-1'),
('L_COFFEE_CARDIO',            'INFLAM',   'T2', 30, 'Polyphénols café → ↓ stress oxydatif, ↓ mortalité CV toutes causes'),
-- Marche postprandiale
('L_POSTPRANDIAL_WALK',        'IR',       'T1', 5,  'Diana 2024 Sports Med méta 11 RCT : ↓ AUC glucose 2h -22%. GLUT-4 indépendant insuline'),
('L_POSTPRANDIAL_WALK',        'INFLAM',   'T2', 25, '↓ TG postprandiaux, ↓ stress oxydatif post-repas');
