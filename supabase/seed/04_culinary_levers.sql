-- =====================================================================
-- Seed 04 — Culinary levers (v0.1 baseline, ~25 levers)
-- All claims backed by primary references with PMIDs where available
-- =====================================================================

INSERT INTO culinary_levers (id, name_fr, name_en, description, category, expected_effect, ebm_tier, primary_reference, pubmed_ids, dose_or_protocol, cooking_constraint, contraindications, precautions, is_universal_star) VALUES

-- ─── UNIVERSAL STARS (transversal T1, ≥2 bottlenecks) ───────────────
(
  'L_EVOO_PRIMARY',
  'Huile d''olive extra vierge en première intention',
  'Extra virgin olive oil as primary fat',
  'Substitution des graisses saturées et huiles raffinées par EVOO comme principal lipide. Polyphénols (oléocanthal, hydroxytyrosol), MUFA, effet endothélial et anti-inflammatoire.',
  'ingredient',
  '↑ sensibilité insulinique ; ↓ marqueurs inflammation ; modulation favorable microbiote',
  'T1',
  'PREDIMED 2018 / Estruch 2013 NEJM',
  ARRAY['23432189', '29897866'],
  '≥40 ml/jour, dont une part à cru pour préserver polyphénols',
  'Privilégier à cru ; cuisson modérée tolérée (point de fumée ~190°C)',
  NULL,
  ARRAY['Apport calorique à intégrer'],
  true
),
(
  'L_LEGUMINOUSES_REGULAR',
  'Légumineuses 3-4 portions/semaine',
  'Pulses 3-4 servings/week',
  'Lentilles, pois chiches, haricots, fèves. Fibres fermentescibles, amidon résistant, protéines végétales, magnésium, polyphénols.',
  'ingredient',
  '↓ HbA1c -0.48% ; ↑ SCFA fécal ; ↓ inflammation intestinale',
  'T1',
  'Sievenpiper 2009 méta / Jenkins 2012 RCT',
  ARRAY['19465743', '23089999'],
  '3-4 portions de 100-150g cuites/semaine',
  'Trempage 12h + cuisson longue ; enzymes (laurier, kombu) pour tolérance',
  ARRAY['MICI_active_severe'],
  ARRAY['Introduire progressivement si dysbiose installée pour éviter symptômes FODMAP'],
  true
),
(
  'L_RESISTANT_STARCH',
  'Refroidissement amidon ≥24h (riz, pâtes, pomme de terre)',
  'Resistant starch via 24h cooling',
  'Cuisson puis refroidissement minimum 24h au réfrigérateur. Conversion partielle de l''amidon digestible en amidon résistant type 3 (rétrogradation). Fermentation colique → butyrate.',
  'preparation',
  '↓ AUC glucose postprandiale ; ↑ butyrate fécal',
  'T1',
  'Sonia 2015 / Robertson 2005 / Englyst classification',
  ARRAY['26693746', '16155268'],
  'Cuire normalement, refroidir ≥24h, consommer froid ou réchauffé doucement (réchauffage modéré préserve la rétrogradation)',
  'Réchauffage <70°C pour préserver l''amidon résistant',
  NULL,
  NULL,
  true
),
(
  'L_PLANT_DIVERSITY_30',
  'Diversité ≥30 plantes différentes/semaine',
  '30+ different plants per week',
  'Légumes, fruits, légumineuses, céréales complètes, herbes, épices, noix, graines comptés comme espèces distinctes.',
  'ingredient',
  '↑ alpha-diversité Shannon microbiote',
  'T1',
  'McDonald 2018 American Gut Project (n=11k)',
  ARRAY['29795809'],
  '≥30 espèces végétales différentes/semaine, herbes/épices comptées',
  NULL,
  NULL,
  ARRAY['Adapter rythme d''introduction si dysbiose sévère ou IBS'],
  true
),
(
  'L_FERMENTED_DAILY',
  'Aliments fermentés diversifiés ≥1 portion/jour',
  'Diversified fermented foods daily',
  'Kéfir, yaourt vivant, choucroute non pasteurisée, kimchi, miso, kombucha, légumes lactofermentés. Diversité plus importante que quantité.',
  'fermentation',
  '↑ diversité microbiote +10% ; ↓ 19 marqueurs inflammation',
  'T1',
  'Wastyk 2021 RCT Cell Host Microbe',
  ARRAY['34256014'],
  '≥1 portion/jour, tournante entre 4-6 sources différentes',
  'Privilégier fermentés non pasteurisés (raw)',
  ARRAY['immunosuppression_severe'],
  ARRAY['Histamine-sensitive : adapter sources fermentées'],
  true
),
(
  'L_FATTY_FISH_2X',
  'Poisson gras 2-3 portions/semaine',
  'Fatty fish 2-3 servings/week',
  'Saumon, sardine, maquereau, hareng, anchois. Apport EPA+DHA chaînes longues, vit D, sélénium, iode.',
  'ingredient',
  '↓ CRP-us ; ↓ IL-6 ; ↑ Omega-3 Index',
  'T1',
  'Calder 2018 / Wei 2024 méta CRP',
  ARRAY['29610056'],
  '2-3 portions de 100-150g/semaine ; privilégier petits poissons (sardine, maquereau, anchois) pour limiter Hg',
  'Cuisson douce vapeur ou papillote ; éviter friture',
  NULL,
  ARRAY['Grossesse/allaitement : éviter gros poissons (thon, espadon, requin)', 'Anticoagulants : surveillance'],
  true
),
(
  'L_CRUCIFEROUS_STEAM',
  'Crucifères vapeur courte (≤4 min)',
  'Cruciferous steamed ≤4 min',
  'Brocoli, chou-fleur, chou kale, choux de Bruxelles, roquette. Cuisson vapeur courte préserve myrosinase active → conversion glucoraphanine en sulforaphane.',
  'cooking',
  '↓ NF-κB ; ↑ Nrf2 ; soutien voies de détoxification phase II',
  'T1',
  'Vermeulen 2008 (cuisson) / Riedl 2009',
  ARRAY['18975959'],
  '4-5 portions/semaine de 100g, vapeur ≤4 min',
  'Vapeur ≤4 min impérative pour préserver myrosinase ; OU consommer cru avec moutarde fraîche pour réactiver myrosinase exogène',
  NULL,
  ARRAY['Hypothyroïdie sévère : modérer crucifères crues volumineuses'],
  true
),
(
  'L_ANTHOCYANIN_BERRIES',
  'Anthocyanes 200-400g/semaine (baies)',
  'Anthocyanin berries 200-400g/week',
  'Myrtilles, framboises, mûres, cerises, fraises, cassis. Anthocyanes, ellagitannins, polyphénols.',
  'ingredient',
  '↓ CRP ; ↓ IL-6 ; soutien cognition',
  'T1',
  'Joseph 2014 / Krikorian 2010',
  ARRAY['20047325'],
  '200-400g/semaine, frais ou décongelés (congélation préserve anthocyanes)',
  'Cru ou cuisson très douce ; anthocyanes thermolabiles >70°C',
  NULL,
  NULL,
  true
),

-- ─── IR-SPECIFIC LEVERS ────────────────────────────────────────────
(
  'L_VINEGAR_PRE_PRANDIAL',
  'Vinaigre pré-prandial 15-30 ml',
  'Pre-prandial vinegar 15-30 ml',
  'Vinaigre de cidre ou de vin rouge dilué dans 100-150 ml d''eau, 10 minutes avant le repas glucidique. Inhibition partielle alpha-amylase.',
  'timing',
  '-20% AUC glucose 2h ; ↑ satiété',
  'T1',
  'Méta-analyse Shishehbor 2017 / Liljeberg 1998',
  ARRAY['28292654', '9630389'],
  '15-30 ml dilués dans 100-150 ml d''eau, 10 min avant le repas',
  NULL,
  ARRAY['gastritis_active', 'reflux_severe'],
  ARRAY['Reflux : à modérer ; émail dentaire : rincer après'],
  false
),
(
  'L_FOOD_SEQUENCE',
  'Séquence alimentaire : légumes → protéines → glucides',
  'Food sequence: vegetables → proteins → carbs',
  'Consommer dans cet ordre avec ~10 min entre chaque phase si possible. Effet via ralentissement vidange gastrique + sécrétion GLP-1 anticipée.',
  'sequence',
  '-29% pic glucose postprandial',
  'T1',
  'Shukla 2015 / Imai 2014 RCT',
  ARRAY['26106234'],
  'Légumes 5 min, puis protéines 5 min, puis glucides',
  NULL,
  NULL,
  ARRAY['Adapter à contexte social ; effort réaliste : commencer par légumes en entrée'],
  false
),
(
  'L_WHEY_PRE_LOAD',
  'Whey 20g pré-prandial (15 min avant repas glucidique)',
  'Pre-load whey 20g 15 min before',
  'Whey isolate hydrolysat ou concentré, 20g dans eau, 15 min avant repas riche en glucides. Stimulation GLP-1.',
  'timing',
  '-28% pic glucose ; ↑ GLP-1',
  'T2',
  'Jakubowicz 2014 RCT / Hutchison 2015',
  ARRAY['25005331'],
  '20g whey + 200 ml eau, 15 min avant repas glucidique',
  NULL,
  ARRAY['allergy_milk_protein'],
  ARRAY['Insuffisance rénale sévère : modérer charge protéique'],
  false
),
(
  'L_LONG_FERMENTATION_BREAD',
  'Pain à fermentation longue 12-24h (levain)',
  'Long-fermentation sourdough 12-24h',
  'Pain au levain naturel, fermentation ≥12h. Hydrolyse partielle de l''amidon, acidification, pré-digestion FODMAP, acide phytique réduit.',
  'fermentation',
  '↓ IG du pain de 20-30% ; ↓ FODMAP ; ↑ tolérance digestive',
  'T2',
  'De Angelis 2007 / Scazzina 2009 / Laatikainen 2017',
  ARRAY['29113045'],
  'Levain naturel, fermentation ≥12h ; éviter pain industriel à levure rapide',
  NULL,
  ARRAY['celiac_disease'],
  NULL,
  false
),
(
  'L_POSTPRANDIAL_WALK',
  'Marche 10-15 min postprandiale',
  'Post-meal walk 10-15 min',
  'Marche d''intensité légère immédiatement après le repas. Captage musculaire glucose GLUT-4 indépendant insuline.',
  'timing',
  '-20% pic glucose postprandial',
  'T1',
  'Reynolds 2016 / Buffey 2022 méta',
  ARRAY['27747394'],
  '10-15 min minimum, dans les 15 min suivant la fin du repas',
  NULL,
  NULL,
  NULL,
  false
),
(
  'L_WHOLE_GRAINS',
  'Substitution farines raffinées → céréales complètes',
  'Whole grains over refined',
  'Riz complet, pâtes complètes, sarrasin, quinoa, avoine, millet à la place des versions raffinées.',
  'ingredient',
  '↓ pic glycémique ; ↓ HbA1c ; ↓ incidence T2D dose-dépendante',
  'T1',
  'Aune 2013 méta dose-response',
  ARRAY['24158434'],
  'Substitution progressive ; cible >50% des glucides en complets',
  NULL,
  ARRAY['celiac_disease', 'IBS_severe'],
  ARRAY['Phytates : tremper ou rincer si sensibilité'],
  false
),

-- ─── INFLAM-SPECIFIC LEVERS ────────────────────────────────────────
(
  'L_TURMERIC_PIPERINE_LIPID',
  'Curcuma + pipérine + lipide chaud',
  'Turmeric + piperine + warm lipid',
  'Curcumine biodisponibilité multipliée x2000 par pipérine (Shoba 1998, n=8). Solubilisation lipidique requise. Cuisson dans EVOO chaud avec poivre noir.',
  'preparation',
  '↓ CRP-us ; effet anti-inflammatoire systémique',
  'T2',
  'Shoba 1998 / Sahebkar 2016 méta',
  ARRAY['9619120', '27259976'],
  '0.5-1 g curcuma/jour + 1/4 c.c. poivre noir + cuisson dans EVOO ou ghee chaud',
  'Chauffage modéré dans matrice lipidique ; éviter ébullition prolongée',
  ARRAY['anticoagulants_high_dose', 'gallstones_active', 'pre_surgery_2_weeks'],
  ARRAY['AVK : INR surveillance ; AOD : prudence ; arrêt 14j avant chirurgie'],
  false
),
(
  'L_MED_DIET_FULL',
  'Régime méditerranéen complet (pattern)',
  'Full Mediterranean dietary pattern',
  'Pattern global : EVOO + légumes + légumineuses + céréales complètes + poisson + noix + vin rouge modéré (optionnel) + faible viande rouge/transformée.',
  'ingredient',
  '↓ CRP-us moyen 0.98 mg/L ; ↓ événements CV',
  'T1',
  'Schwingshackl 2014 méta / PREDIMED',
  ARRAY['24787907'],
  'Pattern global, pas un aliment isolé',
  NULL,
  NULL,
  NULL,
  false
),
(
  'L_REDUCE_RED_PROCESSED_MEAT',
  'Réduction viande rouge transformée <100g/semaine',
  'Reduce processed red meat <100g/week',
  'Charcuterie, viandes transformées (jambon, saucisse, bacon, saucisson). Pro-inflammatoire, AGE, nitrites, fer héminique en excès.',
  'avoidance',
  '↓ CRP ; ↓ mortalité toutes causes',
  'T1',
  'Rohrmann 2013 / Pan 2012 cohortes',
  ARRAY['23497300'],
  'Viande rouge fraîche : ≤350g/semaine. Viande transformée : <100g/semaine',
  NULL,
  NULL,
  NULL,
  false
),
(
  'L_GREEN_TEA_DAILY',
  'Thé vert 3-4 tasses/jour',
  'Green tea 3-4 cups/day',
  'Catéchines (EGCG), L-théanine. Effet anti-inflammatoire modeste mais reproductible.',
  'ingredient',
  '↓ CRP-us modeste',
  'T2',
  'Haghighatdoost 2019 méta',
  ARRAY['31309655'],
  '3-4 tasses/jour, infusion 2-3 min à 80°C',
  'Eau ≤80°C pour préserver catéchines',
  NULL,
  ARRAY['Anémie ferriprive : décaler des repas riches en fer non-héminique de ≥1h'],
  false
),
(
  'L_GENTLE_COOKING',
  'Cuisson douce ≤120°C (vapeur, papillote, basse T°)',
  'Gentle cooking ≤120°C',
  'Vapeur, papillote, basse température, mijoté. Limite formation AGE, préserve micronutriments thermolabiles.',
  'cooking',
  '↓ AGE alimentaires (translation clinique débattue)',
  'T2',
  'Uribarri 2010',
  ARRAY['20497781'],
  'Privilégier vapeur, papillote, basse T° ; limiter grillade/friture/barbecue à 1-2x/semaine',
  '≤120°C pour techniques douces ; tolérance jusqu''à 180°C en court',
  NULL,
  NULL,
  false
),

-- ─── DYSBIOSE-SPECIFIC LEVERS ──────────────────────────────────────
(
  'L_PREBIOTIC_TARGETED',
  'Prébiotiques ciblés (chicorée, ail, oignon, poireau, asperge, banane verte, topinambour)',
  'Targeted prebiotics',
  'Inuline, FOS, GOS naturels. Substrats fermentescibles spécifiques ciblant Bifidobactéries.',
  'ingredient',
  '↑ Bifidobactéries ; ↑ SCFA',
  'T1',
  'Holscher 2017 méta',
  ARRAY['28165863'],
  'Introduction progressive : 5g équivalent inuline → 15g/jour sur 4 sem',
  NULL,
  ARRAY['SIBO_active', 'IBS_FODMAP_intolerant'],
  ARRAY['Si SIBO : phase low-FODMAP gradué avant réintroduction'],
  false
),
(
  'L_REDUCE_ULTRA_PROCESSED',
  'Réduction aliments ultra-transformés (<20% calories)',
  'Reduce ultra-processed foods (<20% kcal)',
  'Aliments NOVA-4 : émulsifiants industriels (E407 carraghénane, E466 CMC, polysorbate 80), arômes artificiels, additifs cosmétiques.',
  'avoidance',
  '↓ émulsifiants pro-dysbiotiques ; ↑ diversité microbiote',
  'T2',
  'Chassaing 2015 souris / Whelan 2024 humain',
  ARRAY['25731162'],
  'Cible <20% des calories quotidiennes en aliments ultra-transformés',
  NULL,
  NULL,
  NULL,
  false
),
(
  'L_FIBER_30G',
  'Fibres totales 30-40 g/jour',
  'Total fiber 30-40 g/day',
  'Cible OMS révisée. Mix solubles/insolubles, fermentescibles/non-fermentescibles. Sources : légumineuses, céréales complètes, légumes, fruits, oléagineux.',
  'ingredient',
  '↓ mortalité toutes causes ; ↑ SCFA ; ↓ inflammation systémique',
  'T1',
  'Reynolds 2019 méta Lancet',
  ARRAY['30638909'],
  'Progression 25 → 30 → 40 g/jour sur 6-8 sem si terrain peu habitué',
  NULL,
  ARRAY['MICI_flare_active', 'occlusion_subocclusion'],
  ARRAY['IBS sévère : adapter type fibres (préférer solubles, éviter insolubles brutes)'],
  false
),
(
  'L_AVOID_ARTIFICIAL_SWEETENERS',
  'Éviter édulcorants artificiels (sucralose, saccharine)',
  'Avoid artificial sweeteners',
  'Suez 2014 et 2022 : signal défavorable sur tolérance glucidique et microbiote chez sous-population répondeuse. Préférer monk fruit, stévia, allulose si édulcorant nécessaire.',
  'avoidance',
  '↓ signal défavorable microbiote (sous-population répondeuse)',
  'T2',
  'Suez 2014 Nature / Suez 2022 Cell',
  ARRAY['25231862', '35987213'],
  'Éviter sucralose, saccharine, aspartame en consommation chronique',
  NULL,
  NULL,
  ARRAY['Substitution acceptable : monk fruit, stévia, allulose, tagatose'],
  false
),
(
  'L_BONE_BROTH',
  'Bouillon d''os (mijoté 12-24h)',
  'Bone broth 12-24h simmer',
  'Mijoté long os/cartilages. Apport collagène, glycine, glutamine. Soutien barrière intestinale (mécanistique).',
  'preparation',
  'Soutien barrière intestinale (translation humaine limitée)',
  'T3',
  'Données mécanistiques ; études cliniques humaines limitées',
  NULL,
  '300-500 ml/jour, 3-5 jours/semaine',
  'Mijoté 12-24h, vinaigre dans l''eau pour extraire minéraux',
  NULL,
  ARRAY['Histamine-sensitive : limiter durée de mijotage'],
  false
),
-- ─── IR hepatic MASLD phenotype (Truong 2025 enrichment) ───────────
(
  'L_FRUCTOSE_AVOIDANCE_50G',
  'Éviter excès fructose libre (>50 g/j)',
  'Avoid excessive free fructose (>50 g/day)',
  'Limiter sucrose, HFCS et boissons sucrées. Fructose active ChREBP et DNL hépatique indépendamment de l''insuline.',
  'avoidance',
  '↓ DNL hépatique ; ↓ stéatose (substrat fructose/ChREBP)',
  'T2',
  'Geidl-Flueck 2021 J Hepatol RCT / Stanhope 2009 J Clin Invest',
  ARRAY['33684506', '19381015'],
  'Maintenir <50 g/j fructose libre ; éviter SSB et jus industriels',
  NULL,
  NULL,
  ARRAY['Ne pas confondre avec interdiction totale des fruits entiers en contexte repas'],
  false
),
(
  'L_REDUCE_FREE_SUGAR_10PCT',
  'Limiter sucres libres ≤10% apport énergétique',
  'Limit free sugars to ≤10% of energy intake',
  'Réduction sucres ajoutés, miel, sirop, jus de fruits. Viser ≤5% si stéatose hépatique confirmée.',
  'avoidance',
  '↓ DNL hépatique via réduction substrat glucidique simple',
  'T3',
  'EASL-EASD-EASO 2024 guidelines (J Hepatol 2024). Lambert 2025 JCI e174233 — PMID à confirmer',
  NULL,
  '≤10% énergie en sucres libres ; ≤5% si MASLD avérée',
  NULL,
  NULL,
  NULL,
  false
),
(
  'L_SAT_FAT_REDUCTION',
  'Réduire AG saturés vs AGPI (MUFA/omega-3)',
  'Reduce saturated fat vs unsaturated fats',
  'Substitution graisses saturées par EVOO et poisson gras. AGPI ↓ SREBP1c vs régime saturé.',
  'ingredient',
  '↓ accumulation TG hépatique vs excès AG saturés',
  'T2',
  'Luukkonen 2018 Diabetes Care RCT',
  ARRAY['29844096'],
  'Privilégier EVOO, poisson gras ; limiter graisses saturées exogènes et fritures répétées',
  'Cuisson modérée, éviter fritures AG saturés',
  NULL,
  NULL,
  false
),
(
  'L_LOW_CARB_MODERATE',
  'Restriction glucidique modérée ciblée DNL',
  'Moderate carbohydrate restriction targeting DNL',
  'Low-carb modéré en T2DM avec stéatose : ↓ DNL et graisse hépatique. Adapter au profil et traitements.',
  'dose',
  '↓ DNL hépatique ; ↓ stéatose ; ↑ sensibilité insulinique',
  'T1',
  'Thomsen 2022 Diabetologia RCT',
  ARRAY['34993571'],
  'Restriction glucidique modérée sur protocole clinique — supervision si antidiabétiques',
  NULL,
  ARRAY['Grossesse', 'T1DM non supervisé'],
  ARRAY['Surveillance hypoglycémie si sulfamides/insuline'],
  false
);

-- =====================================================================
-- Seed 04b — 35 nouveaux leviers v0.2 (extension du référentiel à 63 leviers)
-- =====================================================================

INSERT INTO culinary_levers (id, name_fr, name_en, description, category, expected_effect, ebm_tier, primary_reference, pubmed_ids, dose_or_protocol, cooking_constraint, contraindications, precautions, is_universal_star) VALUES

-- ─── L01: CANNELLE ──────────────────────────────────────────────────────
(
  'L_CINNAMON_POLYPHENOLS',
  'Cannelle (Ceylan) 1-3 g/jour avec repas glucidique',
  'Ceylon cinnamon 1-3 g/day with carb meals',
  'Cannelle de Ceylan (Cinnamomum verum). Polyphénols et composés cinnamaldéhyde. ↑ sensibilité insulinique via IRS-1/PI3K.',
  'ingredient',
  '↓ glycémie à jeun -25 mg/dL ; ↓ HOMA-IR',
  'T1',
  'Allen 2013 méta / Davis 2017 méta',
  ARRAY['23818067', '28011956'],
  '1-3 g/j (½-1 c.c.) saupoudré sur glucides, compote, yaourt, café',
  'Ajouter après cuisson pour préserver composés volatils',
  ARRAY['grossesse_high_dose'],
  ARRAY['Préférer Ceylan (C. verum) — Cassia contient coumarines hépatotoxiques à dose quotidienne'],
  false
),

-- ─── L02: FENUGREC ─────────────────────────────────────────────────────
(
  'L_FENUGREEK_SEEDS',
  'Fenugrec (graines trempées ou germées)',
  'Fenugreek seeds soaked or sprouted',
  'Galactomannan (fibre solubre) + 4-hydroxyisoleucine. ↓ vidange gastrique + ↑ insuline glucose-dépendante.',
  'ingredient',
  '↓ glycémie postprandiale ; ↓ HbA1c -0.8% (méta)',
  'T1',
  'Neelakantan 2014 méta',
  ARRAY['25006949'],
  '2-5 g/j graines trempées 12h ou germées',
  'Trempage 12h pour neutraliser amertume partielle',
  ARRAY['T1DM_non_supervise', 'grossesse'],
  ARRAY['Goût amer caractéristique — masquer dans curry, dhal, soupe'],
  false
),

-- ─── L03: CHIA ─────────────────────────────────────────────────────────
(
  'L_CHIA_SEEDS',
  'Graines de chia 15-30 g/j',
  'Chia seeds 15-30 g/day',
  'Salvia hispanica. Fibre solubre mucilagineuse → gel visqueux. ALA ω-3, protéines, magnésium.',
  'ingredient',
  '↓ glycémie postprandiale ; ↓ triglycérides ; ↑ ALA',
  'T2',
  'Vuksan 2017 RCT / Toscano 2015 méta',
  ARRAY['28272120'],
  '15-30 g/j (2-3 c.s.), trempées ≥15 min dans eau/lait végétal',
  'Trempage obligatoire pour former gel ; consommer hydraté',
  ARRAY['dysphagie_severe'],
  ARRAY['Introduire progressivement pour tolérance digestive'],
  false
),

-- ─── L04: AVOCAT ───────────────────────────────────────────────────────
(
  'L_AVOCADO_DAILY',
  'Avocat ½-1/jour',
  'Avocado ½-1 daily',
  'Persea americana. MUFA, fibres solubles, polyphénols, glutathion, lutéine. Effet satiétogène et lipidique.',
  'ingredient',
  '↓ LDL ; ↑ satiété ; ↓ inflammation bas grade',
  'T2',
  'Petersen 2021 / Mahmassani 2018 méta',
  ARRAY['34617419', '29659968'],
  '½-1 avocat/j (70-150g), en salade, tartine, smoothie',
  'Consommer cru pour préserver polyphénols et graisses insaturées',
  NULL,
  ARRAY['Apport calorique à intégrer (½ avocat ≈ 120 kcal)'],
  false
),

-- ─── L05: OLÉAGINEUX ──────────────────────────────────────────────────
(
  'L_NUTS_MIX_30G',
  'Oléagineux mix 30 g/j (noix, amandes, noisettes)',
  'Mixed nuts 30 g/day (walnuts, almonds, hazelnuts)',
  'MUFA + ω-3 ALA + arginine + fibres + polyphénols. Effet métabolique et anti-inflammatoire validé PREDIMED.',
  'ingredient',
  '↓ LDL -0.15 mmol/L ; ↓ HbA1c ; ↓ CRP',
  'T1',
  'Afshin 2014 méta / Salas-Salvadó 2008 PREDIMED',
  ARRAY['25411245', '18784301'],
  '30 g/j (1 petite poignée). Mix : 3-4 noix + 8-10 amandes + 8-10 noisettes',
  'Préférer crus non salés ; torréfaction légère tolérée',
  ARRAY['allergy_nuts'],
  ARRAY['Préférer crus (non salés, non torréfiés à haute T°)'],
  true
),

-- ─── L06: CHOCOLAT NOIR ────────────────────────────────────────────────
(
  'L_DARK_CHOCOLATE_20G',
  'Chocolat noir ≥85% cacao 20 g/j',
  'Dark chocolate ≥85% cocoa 20 g/day',
  'Flavanols (épicatéchine) → ↑ NO ; theobromine ; polyphénols microbiote ; magnésium, fer, zinc.',
  'ingredient',
  '↓ PA -5 mmHg ; ↑ sensibilité insulinique ; ↑ HDL',
  'T2',
  'Grassi 2005 RCT / Hooper 2012 méta flavanols',
  ARRAY['15883455', '22869837'],
  '20 g/j (2 carrés), chocolat noir ≥85% cacao, faible sucre',
  'Ne pas chauffer excessivement (préserver flavanols)',
  ARRAY['lithiase_oxalique_moderer'],
  ARRAY['Choix qualité important (cacao fort, peu sucré). Pas de chocolat au lait.'],
  false
),

-- ─── L07: DISTRIBUTION PROTÉINES ───────────────────────────────────────
(
  'L_PROTEIN_DISTRIBUTION',
  'Distribution protéines 20-30 g/repas (3-4 repas)',
  'Protein distribution 20-30 g per meal (3-4 meals)',
  'Répartition équilibrée des protéines sur la journée. ↑ GLP-1, ↑ satiété, ↑ thermogenèse, maintien masse maigre.',
  'timing',
  '↑ synthèse protéique musculaire ; ↑ satiété ; ↓ grignotage',
  'T2',
  'Mamerow 2014 / Schoenfeld 2018 méta',
  ARRAY['24760976', '29863639'],
  '20-30g protéines à chaque repas. Combiner sources animales/végétales.',
  NULL,
  ARRAY['insuffisance_renale_severe'],
  ARRAY['Adapter si pathologie rénale. Végétaliens : combiner légumineuses + céréales.'],
  false
),

-- ─── L08: REPAS FAIBLE IG ──────────────────────────────────────────────
(
  'L_LOW_GI_MEAL_PATTERN',
  'Composition repas à faible IG (fibres + protéines + lipides à chaque repas glucidique)',
  'Low-GI meal pattern (fiber + protein + fat with every carb meal)',
  'Apport systématique de fibres + protéines + lipides avec glucides → ↓ IG composite + ↓ pic glucose.',
  'preparation',
  '↓ AUC glucose postprandiale ; ↓ sécrétion insuline',
  'T1',
  'Jenkins 1981 / Livesey 2019 méta',
  ARRAY['6117467', '30983560'],
  'Ne jamais consommer de glucides seuls. Associer fibres + protéines + lipides à chaque repas contenant des glucides.',
  NULL,
  NULL,
  ARRAY['Ne pas transformer en orthorexie ; viser pattern général'],
  false
),

-- ─── L09: GINGEMBRE FRAIS ──────────────────────────────────────────────
(
  'L_GINGER_FRESH',
  'Gingembre frais 5-10 g/j',
  'Fresh ginger 5-10 g/day',
  'Gingerols et shogaols → ↓ NF-κB, ↓ TNF-α, ↓ CRP. Antioxydant. Modulation microbiote oral/gut.',
  'ingredient',
  '↓ CRP ; ↓ douleurs musculaires post-exercice',
  'T2',
  'Mashhadi 2013 / Marx 2021 méta',
  ARRAY['23515042', '33848235'],
  '5-10 g/j gingembre frais râpé dans thé, sauté, soupe',
  'Cuisson douce modérée ; forte chaleur prolongée réduit gingérols',
  ARRAY['anticoagulants_high_dose'],
  ARRAY['Prudence pré-opératoire (effet antiplaquettaire modeste)'],
  false
),

-- ─── L10: AIL CRU ──────────────────────────────────────────────────────
(
  'L_GARLIC_RAW',
  'Ail cru écrasé 1-3 gousses/j',
  'Raw crushed garlic 1-3 cloves/day',
  'Allicine libérée par alliinase après écrasement. ↓ CRP, ↓ TNF-α, ↓ PA. Inuline-like prébiotique.',
  'ingredient',
  '↓ PA -8 mmHg ; ↓ CRP ; ↓ LDL',
  'T2',
  'Ried 2016 méta / Schwingshackl 2020',
  ARRAY['27015631'],
  '1-3 gousses/j. Écraser ou hacher, laisser reposer 10 min avant cuisson',
  'Laisser reposer 10 min après écrasement pour stabiliser allicine',
  ARRAY['anticoagulants_high_dose'],
  ARRAY['Pré-opératoire : modérer 14j avant. Ne pas faire bouillir immédiatement.'],
  false
),

-- ─── L11: GRENADE ──────────────────────────────────────────────────────
(
  'L_POMEGRANATE_JUICE_WEEKLY',
  'Grenade (fruit ou jus pur) 150 ml 3-4×/sem',
  'Pomegranate (fruit or pure juice) 150 ml 3-4×/week',
  'Ellagitannins → urolithines (métabolites microbiens). ↓ CRP, ↓ IL-6, ↓ oxLDL, ↑ NO.',
  'ingredient',
  '↓ CRP ; ↓ oxLDL ; ↓ PA systolique -5 mmHg',
  'T2',
  'Sahebkar 2016 méta / Banihani 2017',
  ARRAY['26412200'],
  '150 ml jus pur grenade sans sucre ajouté OU ½ fruit frais, 3-4×/sem',
  'Consommer frais ; jus du commerce souvent sucré',
  NULL,
  ARRAY['Vérifier étiquette jus (sans sucre ajouté). Interactions CYP modérées.'],
  false
),

-- ─── L12: CERISE ACIDULÉE ──────────────────────────────────────────────
(
  'L_TART_CHERRY',
  'Cerise acidulée (griotte) 200g fruits ou 200ml jus 3-4×/sem',
  'Tart cherry 200g fruit or 200ml juice 3-4×/week',
  'Anthocyanines + mélatonine naturelle. ↓ CRP, ↓ IL-6, ↓ uricémie (inhibition xanthine oxydase).',
  'ingredient',
  '↓ CRP ; ↓ uricémie ; ↑ durée sommeil',
  'T2',
  'Kelley 2018 méta / Howatson 2010 RCT',
  ARRAY['29685686', '19855314'],
  '200g fruits entiers ou 200ml jus pur, 3-4×/sem. Privilégier fruits entiers pour fibres.',
  NULL,
  NULL,
  ARRAY['Jus : ≈20g sucre/200ml — adapter si IR sévère. Fruits entiers préférables.'],
  false
),

-- ─── L13: CAFÉ FILTRE ──────────────────────────────────────────────────
(
  'L_COFFEE_FILTER',
  'Café filtre 2-3 tasses/j (non sucré)',
  'Filter coffee 2-3 cups/day (unsweetened)',
  'Acides chlorogéniques → ↓ pic glucose. Modulation microbiote (↑ Bifidobactéries). Café diterpènes filtrés.',
  'ingredient',
  '↓ risque T2D dose-dépendant ; ↓ CRP bas bruit ; ↓ stéatose',
  'T2',
  'Poole 2017 BMJ méta / Grosso 2016 méta',
  ARRAY['28649191', '27619280'],
  '2-3 tasses/j (240 ml), filtre papier, non sucré. Éviter après 14h.',
  'Filtre papier obligatoire (cafestol ↗ LDL sans filtre)',
  ARRAY['reflux_severe', 'anxiete_severe'],
  ARRAY['Grossesse : limiter <200mg caféine/j. Café non filtré ↑ LDL.'],
  true
),

-- ─── L14: VITAMINE D ALIMENTS ──────────────────────────────────────────
(
  'L_VITAMIN_D_FOODS',
  'Aliments riches en vitamine D (poisson gras, œuf, champignons UV)',
  'Vitamin D-rich foods (fatty fish, eggs, UV-exposed mushrooms)',
  'Le récepteur VDR exprimé sur cellules immunitaires. ↓ cytokines pro-inflammatoires. Soutien immunité muqueuse.',
  'ingredient',
  '↓ supplémentation vit D nécessaire ; modulation immunitaire',
  'T2',
  'Martineau 2017 méta / Autier 2014 méta',
  ARRAY['28202713'],
  '2-3×/sem : poisson gras (150g) + œuf ×2 + champignons exposés UV',
  'Champignons exposés au soleil/UV 15 min pour ↑ vit D2',
  ARRAY['sarcoidose'],
  ARRAY['L\'alimentation seule ne corrige pas une carence franche — supplémentation si 25-OH-D3 <30 ng/mL'],
  false
),

-- ─── L15: HERBES AROMATIQUES ───────────────────────────────────────────
(
  'L_ROSEMARY_HERBS',
  'Herbes aromatiques quotidiennes (romarin, origan, thym, menthe)',
  'Daily aromatic herbs (rosemary, oregano, thyme, mint)',
  'Acides rosmarinique, carnosol, carvacrol, thymol → ↑ Nrf2, ↓ NF-κB. Pouvoir antioxydant élevé.',
  'ingredient',
  '↓ stress oxydatif ; saveur sans sel ; chélation fer non-héminique',
  'T3',
  'Nieto 2018 / Pérez-Fons 2010',
  ARRAY['30154330'],
  'Incorporer ≥3 herbes différentes/j. Quantité libre. Fraîches ou séchées.',
  'Séchées = plus concentrées ; fraîches = plus volatiles — ajouter en fin de cuisson',
  NULL,
  ARRAY['Huiles essentielles concentrées ≠ herbes. H.E. CI grossesse, HTA sévère.'],
  false
),

-- ─── L16: PATRON SANS VIANDE ───────────────────────────────────────────
(
  'L_MEDITERRANEAN_WEEKLY_MEAL',
  'Pattern : 2×/sem poisson gras + 1-2 jours sans viande',
  'Pattern: 2×/week fatty fish + 1-2 meat-free days',
  'Réduction protéines terrestres → marines + végétales ↓ AGE, TMAO, fer héminique. ↑ EPA/DHA.',
  'timing',
  '↓ CRP ; ↓ TMAO ; ↓ charge pro-inflammatoire alimentaire',
  'T2',
  'Martinez-Gonzalez 2019 PREDIMED-Plus',
  ARRAY['30924793'],
  '2× poisson gras/sem + 1-2 jours sans viande (lundi vert, poisson vendredi)',
  'Petits poissons (sardine, maquereau) pour limiter Hg',
  ARRAY['allergy_fish'],
  ARRAY['Allergie poisson : algues Schizochytrium pour DHA. Végétaliens : adapter.'],
  false
),

-- ─── L17: FRUITS ENTIERS ───────────────────────────────────────────────
(
  'L_FRUIT_2_DAY',
  'Fruits entiers 2-3 portions/j (pas de jus)',
  'Whole fruits 2-3 servings/day (no juice)',
  'Polyphénols + fibres + vitamines + potassium. Relation inverse dose-dépendante mortalité CV et CRP.',
  'ingredient',
  '↓ mortalité CV ; ↓ CRP ; ↓ PA',
  'T1',
  'Aune 2017 BMJ méta / Muraki 2013',
  ARRAY['28244348', '23843730'],
  '2-3 portions/j (1 portion ≈ 150g), entiers, varier couleurs. Baies, kiwi, agrumes, pomme.',
  'Fruits entiers (pas jus). Peau lavée si bio possible.',
  NULL,
  ARRAY['Jus de fruit ≠ fruit (perte fibres, pic glycémique). Fruits secs : portion 30g.'],
  false
),

-- ─── L18: PSYLLIUM ─────────────────────────────────────────────────────
(
  'L_PSYLLIUM_FIBER',
  'Psyllium (ispaghula) 5-10 g/j',
  'Psyllium husk 5-10 g/day',
  'Fibre solubre visqueuse non-fermentescible. Régularisation transit. ↓ LDL. Précurseur butyrate fermentation lente.',
  'ingredient',
  '↓ LDL -8% ; ↑ Bristol 3-5 ; ↓ vidange gastrique',
  'T1',
  'McRorie 2015 / Lambeau 2017 méta',
  ARRAY['26231922', '28675898'],
  '5-10 g/j (1-2 c.s.), dilué dans >250 ml eau, à distance des médicaments ≥2h',
  'Mélanger dans eau, boire immédiatement. Hydratation obligatoire.',
  ARRAY['occlusion_intestinale', 'stenose_oesophagienne'],
  ARRAY['Hydratation abondante obligatoire. Espacer médicaments ≥2h.'],
  false
),

-- ─── L19: GRAINES DE LIN ────────────────────────────────────────────────
(
  'L_FLAX_SEEDS_GROUND',
  'Graines de lin moulues 10-20 g/j',
  'Ground flax seeds 10-20 g/day',
  'Lignanes → entérolactone (métabolite microbien). ALA ω-3. Fibres solubles + insolubles. Mucilage.',
  'ingredient',
  '↓ LDL -10% ; ↑ satiété ; modulation microbiote',
  'T2',
  'Pan 2009 méta / Goyal 2014',
  ARRAY['19061773'],
  '10-20 g/j (1-2 c.s.) moulues, à consommer rapidement après mouture',
  'Moudre au dernier moment (oxydation rapide ALA). Graines entières passent non digérées.',
  ARRAY['occlusion_intestinale_phase_aigue'],
  ARRAY['Moudre frais chaque jour ou conserver au congélateur. Graines entières inefficaces.'],
  false
),

-- ─── L20: AVOINE β-GLUCANE ─────────────────────────────────────────────
(
  'L_OATS_BETA_GLUCAN',
  'Avoine complète / β-glucane 40-60 g/j',
  'Whole oats / beta-glucan 40-60 g/day',
  'β-glucane → gel visqueux ↓ absorption cholestérol + glucose. Fermentation → ↑ butyrate. PréBiotique Bifidobactéries.',
  'ingredient',
  '↓ LDL (EFSA health claim) ; ↓ glycémie postprandiale',
  'T1',
  'Ho 2016 méta / EFSA 2011 health claim',
  ARRAY['27702431'],
  '40-60 g/j flocons avoine complète (≈3-4g β-glucane). Trempage overnight.',
  'Trempage 12h ↓ phytates, ↑ disponibilité minéraux',
  ARRAY['celiac_disease_avoine'],
  ARRAY['Choisir avoine complète (pas instantanée sucrée). Tous les cœliaques tolèrent l\'avoine sans gluten.'],
  false
),

-- ─── L21: FARINE BANANE VERTE ──────────────────────────────────────────
(
  'L_GREEN_BANANA_FLOUR',
  'Banane verte / plantain vert (farine 30-50 g/j)',
  'Green banana / plantain flour 30-50 g/day',
  'Amidon résistant type 2 encapsulé dans matrice cellulaire → butyrate colique. ↓ IG. PréBiotique.',
  'ingredient',
  '↑ butyrate fécal ; ↓ index glycémique repas',
  'T2',
  'Cassani 2020 / Langkilde 2002',
  ARRAY['33158077'],
  '30-50 g/j, substitution 20-30% farine de blé dans préparations',
  'Peut être utilisé en pâtisserie, pancakes, porridge',
  NULL,
  ARRAY['Texture différente — substituer partiellement. Se conserve comme farine classique.'],
  false
),

-- ─── L22: MISO ŔERMENTÉ ────────────────────────────────────────────────
(
  'L_MISO_FERMENTED',
  'Miso (pâte soja fermentée) 1 c.s./jour',
  'Miso (fermented soybean paste) 1 tbsp/day',
  'Fermentation longue → levure koji, Lactobacilles, peptides bioactifs, isoflavones aglycones, niacine.',
  'fermentation',
  '↑ microbiote diversité ; ↓ risque gastrique (sel modéré)',
  'T3',
  'Rios-Hoyo 2016 / Nakanishi 2010',
  ARRAY['27616673', '21044902'],
  '1 c.s. (15-20g) non pasteurisé, dilué en fin de cuisson (ne pas bouillir)',
  'Ne pas faire bouillir après incorporation (préserver ferments)',
  ARRAY['restriction_sodee_severe'],
  ARRAY['Rincer rapidement si restriction sodée. Bouillon bouilli ≠ miso vivant.'],
  false
),

-- ─── L23: CHOUCROUTE KIMCHI ────────────────────────────────────────────
(
  'L_KIMCHI_SAUERKRAUT',
  'Légumes lactofermentés (choucroute crue, kimchi) 50-100 g/j',
  'Lacto-fermented vegetables (raw sauerkraut, kimchi) 50-100 g/day',
  'Lactobacillus + Leuconostoc vivants + fibres prébiotiques + isothiocyanates. ↑ diversité, ↓ inflammation.',
  'fermentation',
  '↑ diversité microbiome ; ↓ marqueurs inflammation ; régulation transit',
  'T2',
  'Sun 2020 / Han 2020',
  ARRAY['32566240', '32108597'],
  '50-100 g/j, choucroute crue non pasteurisée (rayon frais). Rincer si sel excessif.',
  'Bocal non pasteurisé (rayon frais). Pasteurisé = perte ferments vivants.',
  ARRAY['histamine_intolerance_severe', 'restriction_sodee_severe'],
  ARRAY['Vérifier rayon frais — pasteurisé ≠ fermenté vivant. Histamino-sensible : adapter quantité.'],
  false
),

-- ─── L24: KÉFIR ────────────────────────────────────────────────────────
(
  'L_KEFIR_WATER_DAIRY',
  'Kéfir (lait ou eau) 150-200 ml/jour',
  'Kefir (milk or water) 150-200 ml/day',
  'Consortium levures + lactobacilles >30 souches. ↑ Lactobacillus spécifiques kéfir. ↓ TNF-α, ↑ lactase.',
  'fermentation',
  '↑ diversité ; ↓ TNF-α ; ↑ intolérance lactose',
  'T2',
  'Kim 2018 méta / Bourrie 2016',
  ARRAY['29721950', '26898463'],
  '150-200 ml/j. Varier lait (traditionnel) et eau (si intolérance lactose).',
  'Vérifier « ferments vivants » sur l\'emballage. Faire maison = optimal.',
  ARRAY['immunosuppression_severe'],
  ARRAY['Kéfir commerce souvent pasteurisé après fermentation = ferments morts.'],
  false
),

-- ─── L25: YAOURTS PROBIOTIQUES ─────────────────────────────────────────
(
  'L_COCONUT_YOGURT_PROBIOTIC',
  'Yaourts / laits fermentés probiotiques diversifiés',
  'Diversified probiotic yogurts/fermented milks',
  'Souches spécifiques (L. casei, L. rhamnosus, Bifidobacterium). Souche-dépendant : diversifier les marques.',
  'fermentation',
  '↑ Lactobacillus ; ↓ perméabilité intestinale',
  'T2',
  'Burton 2017 méta / Savaiano 2014',
  ARRAY['28360887'],
  '1 portion/j (150-200g), tourner 2-3 marques différentes pour diversité souches',
  'Conserver au frais ; consommer avant DLC',
  ARRAY['allergy_milk_dairy'],
  ARRAY['Souche-dépendant — tourner les sources. Attention sucres ajoutés dans versions fruitées.'],
  false
),

-- ─── L26: POMME ENTIÈRE ────────────────────────────────────────────────
(
  'L_APPLE_PECTIN',
  'Pomme entière + peau 1-2/j (pectine)',
  'Whole apple with peel 1-2/day (pectin)',
  'Pectine (fibre solubre fermentescible) → ↑ butyrate. Polyphénols peau (quercétine, catéchines). Flavonoïdes.',
  'ingredient',
  '↓ LDL -5% ; ↑ butyrate ; régulation transit',
  'T2',
  'Koutsos 2015 / Hyson 2011 méta',
  ARRAY['25750143'],
  '1-2 pommes/j, non pelées. Varier couleurs (Granny Smith = polyphénols élevés).',
  'Consommer crue avec peau. Compote sans sucre OK si pomme entière impossible.',
  NULL,
  ARRAY['Jus = pas de pectine. Peau = maximum polyphénols — bien laver.'],
  false
),

-- ─── L27: SALADE CRUE DIVERSIFIÉE ──────────────────────────────────────
(
  'L_DIVERSE_SALAD_RAW',
  'Salade crue diversifiée ≥5 espèces/jour',
  'Diverse raw salad ≥5 species/day',
  'Enzymes intactes + polyphénols non dénaturés + microbiote phytosphère. Signaux orosensoriels ↑ satiété.',
  'preparation',
  '↑ apport végétaux ; ↑ enzymes vivantes ; ↓ densité énergétique',
  'T2',
  'Ludwig 2021 BMJ / D\'Cunha 2024',
  ARRAY['34049938'],
  '1 salade/jour avec ≥5 espèces : légumes feuilles + légumes couleur + herbes + oléagineux + vinaigrette EVOO',
  'Vinaigrette EVOO + citron pour biodisponibilité polyphénols et caroténoïdes',
  ARRAY['MICI_flare_active'],
  ARRAY['Introduction progressive si FODMAP-sensible. Pas en phase aiguë MICI.'],
  false
),

-- ─── L28: FENÊTRE ALIMENTAIRE ──────────────────────────────────────────
(
  'L_MEAL_TIMING_12H',
  'Fenêtre alimentaire ≤12h/j (time-restricted eating)',
  'Eating window ≤12h/day (time-restricted eating)',
  'Alignement rythmes circadiens → ↓ insuline, ↑ sensibilité insulinique, ↓ NF-κB circadien, ↓ perméabilité nocturne.',
  'timing',
  '↓ insuline à jeun ; ↓ inflammation ; ↑ qualité sommeil',
  'T1',
  'Sutton 2018 CR / Wilkinson 2020 / Currenti 2021 méta',
  ARRAY['30075275', '31950749', '33996959'],
  'Toute l\'alimentation dans une fenêtre ≤12h (ex : 8h-20h). Pas de nourriture après le dîner.',
  NULL,
  ARRAY['grossesse', 'T1DM_non_supervise', 'tca', 'denutrition'],
  ARRAY['Ne pas sauter le petit-déjeuner ; décaler le dîner. Adapter si T2D sous insuline.'],
  true
),

-- ─── L29: ALIMENTATION CONSCIENTE ──────────────────────────────────────
(
  'L_SLOW_EATING',
  'Repas ≥20 min, mastication complète (≥20×/bouchée)',
  'Meal ≥20 min, thorough chewing (≥20×/bite)',
  '↑ signal orexigène précoce (GLP-1, PYY) via mastication prolongée. ↓ apport calorique 10-15%.',
  'timing',
  '↓ apport calorique -10% ; ↓ pic glucose ; ↑ satiété',
  'T2',
  'Ohkuma 2015 méta / Zhu 2018',
  ARRAY['26255023'],
  'Repas ≥20 min, mastiquer ≥20×/bouchée. Pas d\'écran pendant repas.',
  NULL,
  ARRAY['trouble_deglutition'],
  ARRAY['Difficile en pratique — viser progrès progressif. Commencer par 1 repas/j.'],
  false
),

-- ─── L30: HYDRATATION ──────────────────────────────────────────────────
(
  'L_HYDRATION_OPTIMAL',
  'Hydratation 30 ml/kg/j, eau prioritaire',
  'Hydration 30 ml/kg/day, mostly water',
  'Hydratation cellulaire → fonction endothéliale, tonus vagal, fonction digestive, concentration urinaire.',
  'dose',
  '↓ lithiase urinaire ; ↑ fonction cognitive ; régulation appétit',
  'T2',
  'Perrier 2013 / Armstrong 2012',
  ARRAY['24056810'],
  '30 ml/kg/j (≈2.1L pour 70 kg). ≥70% eau plate. Répartir sur la journée.',
  NULL,
  ARRAY['insuffisance_cardiaque_decompensee', 'insuffisance_renale_oligurique'],
  ARRAY['Adapter à activité, climat. Éviter >1L d\'un coup.'],
  false
),

-- ─── L31: CHAMPIGNONS ──────────────────────────────────────────────────
(
  'L_MUSHROOMS_WEEKLY',
  'Champignons variés 200-300 g/sem (shiitake, pleurote, Paris)',
  'Varied mushrooms 200-300 g/week (shiitake, oyster, button)',
  'β-glucanes (lentinan) → immunomodulation. Ergostérol → vit D2 (si expo UV). Ergothionéine antioxydant.',
  'ingredient',
  '↑ immunité cellulaire ; ↑ vit D alimentaire ; ↓ inflammation',
  'T3',
  'Jayachandran 2017 / Chandra 2021',
  ARRAY['28879373'],
  '200-300 g/sem, varier ≥3 espèces. Shiitake, pleurote, maitake, champignon de Paris.',
  'Cuisson nécessaire (chitine). Champignons sauvages : identification impérative.',
  ARRAY['goutte_aigue'],
  ARRAY['Goutte : modérer (purines modérées). Champignons sauvages = identification formelle.'],
  false
),

-- ─── L32: ALGUES ────────────────────────────────────────────────────────
(
  'L_SEAWEED_WEEKLY',
  'Alques marines 5-15 g/sem (wakame, kombu, nori)',
  'Seaweed 5-15 g/week (wakame, kombu, nori)',
  'Iode, fucoxanthine, fucoïdane → antioxydant, anti-inflammatoire. Polysaccharides sulfatés → prébiotique Bacteroides.',
  'ingredient',
  '↑ apport iode modéré ; modulation microbiote ; ↓ stress oxydatif',
  'T3',
  'Brown 2014 / Teas 2013',
  ARRAY['24724429'],
  '5-15 g/sem (1-2 feuilles nori, 1 bande kombu dans cuisson). Pas quotidien.',
  'Kombu dans cuisson légumineuses (↓ gaz) ; wakame réhydraté en salade',
  ARRAY['hyperthyroidie_non_controlee'],
  ARRAY['Teneur iode très variable selon espèce. Introduction progressive. Pas quotidien.'],
  false
),

-- ─── L33: AGRUMES ZESTE ────────────────────────────────────────────────
(
  'L_CITRUS_POLYPHENOLS',
  'Agrumes entiers (pamplemousse, orange, citron) — zeste + pulpe',
  'Whole citrus (grapefruit, orange, lemon) — zest + pulp',
  'Hespéridine, naringénine, acide ascorbique. ↓ CRP, ↓ LDL-ox, ↑ NO. ↑ fer non-héminique via vit C.',
  'ingredient',
  '↓ CRP ; ↓ LDL-ox ; ↑ absorption fer non-héminique',
  'T2',
  'Mulvihill 2016 / Tholstrup 2018',
  ARRAY['27431609'],
  '1 agrume/j varié : zeste râpé + quartiers. Jus frais pulpe si possible.',
  'Zeste bien lavé. Jus consommé immédiatement (vit C s\'oxyde).',
  ARRAY['pamplemousse_interaction_cyp3a4'],
  ARRAY['Pamplemousse + statines/IEC/anticoagulants : interaction CYP3A4. Préférer orange/citron si doute.'],
  false
),

-- ─── L34: SUBSTITUTION GRAISSES ─────────────────────────────────────────
(
  'L_SATURATED_FAT_SWAP',
  'Substitution graisses saturées → insaturées (cuisson, lait, viande)',
  'Swap saturated → unsaturated fats (cooking, dairy, meat)',
  'Remplacer beurre, graisse animale, huile palme par EVOO, colza, avocat. ↓ LDL, ↓ ratio ApoB/ApoA.',
  'avoidance',
  '↓ LDL -8% ; ↓ ratio ApoB/ApoA ; ↓ événements CV',
  'T1',
  'Wang 2016 méta / Guasch-Ferré 2015',
  ARRAY['27508875', '26041611'],
  'Cuisson : EVOO ou colza. Beurre → purée oléagineux. Viande rouge : gras retiré.',
  'Ne pas remplacer par huiles riches en ω-6 raffinées (tournesol, maïs)',
  NULL,
  ARRAY['Ne pas confondre substitution (↓ saturés + ↑ insaturés) avec restriction calorique.'],
  false
),

-- ─── L35: EVOO CRU FINITION ────────────────────────────────────────────
(
  'L_EVOO_CRU_FINITION',
  'Huile d\'olive extra vierge en finition crue',
  'Extra virgin olive oil raw finish',
  'Polyphénols EVOO (oléocanthal, hydroxytyrosol) thermosensibles. Finition préserve >90% vs <50% si cuisson 180°C.',
  'cooking',
  '↑ polyphénols dans assiette ; ↑ goût ; ↑ biodisponibilité caroténoïdes',
  'T2',
  'Cicerale 2010 / Lozano-Castellón 2020',
  ARRAY['20122463'],
  'Filet EVOO cru en finition sur plat chaud. Réserver 1/3 de l\'EVOO quotidien.',
  'Laisser plat refroidir 1 min avant filet EVOO. Cuisson modérée pour partie cuite.',
  NULL,
  ARRAY['Extension de L_EVOO_PRIMARY. Préserve polyphénols que la cuisson détruit.'],
  false
);

-- ═══════════════════════════════════════════════════
--  NOUVEAUX LEVIERS v0.2 — enrichissement → 80 leviers
-- ═══════════════════════════════════════════════════

-- Chrome — IR
('L_CHROMIUM_SUPP', 'Chrome (nutritionnel)', 'supplement', true, 'Coeur de betterave, brocoli, jaune d\'oeuf, noix du Brésil', 'T1', 'n/a', '↑ sensibilité insulinique, ↓ HOMA-IR',
 '↓ HOMA-IR -0.5, ↓ insuline à jeun',
 'IR', 'T1',
 'Suksomboon 2014 J Nutr — n=25 RCT',
 ARRAY['20549755'],
 'Aliments riches en chrome naturels : 1 jaune d\'oeuf + 50g brocoli + 30g noix du Brésil/j',
 NULL,
 NULL,
 ARRAY['Le chrome alimentaire n\'atteint pas les doses suppléments (200 µg). Levier complémentaire.'],
 false),

-- Psyllium — IR + DYSBIOSE
('L_PSYLLIUM_FIBER', 'Psyllium blond (fibres solubles mucilagineuses)', 'ingredient', false, 'Psyllium, graines de lin moulues', 'T1', 'n/a', '↑ viscosité bol alimentaire, ↓ pic glycémique, ↓ LDL, ↑ SCFA butyrate',
 '↓ LDL -12%, ↓ HbA1c -0.3%, ↑ satiété',
 'IR', 'T1',
 'Anderson 1991 Am J Clin Nutr — n=26 RCT',
 ARRAY['2046732'],
 '5-10g/j de psyllium dans eau ou yaourt. Augmenter progressivement.',
 'Boire ≥250 ml eau par 5g psyllium. Risque occlusion si déshydratation.',
 NULL,
 ARRAY['Fibre soluble viscosifiante. Complémentaire de L_FIBER_30G.'],
 false),

-- Inositol — IR / PCOS
('L_INOSITOL_FOOD', 'Inositol alimentaire (myo-inositol)', 'ingredient', false, 'Son de blé, son d\'avoine, légumineuses, agrumes, cantaloup', 'T1', 'n/a', 'Second messenger insuline. ↑ sensibilité insulinique, ↓ testostérone libre (SOPK)',
 '↓ HOMA-IR, ↓ testostérone libre',
 'IR', 'T1',
 'Unfer 2017 Gynecol Endocrinol — méta 17 RCT SOPK',
 ARRAY['28050912'],
 'Aliments riches en inositol quotidiens : 30g son d\'avoine + agrumes + légumineuses',
 NULL,
 NULL,
 ARRAY['Prioritaire si phénotype pcos_adipose.'],
 false),

-- Thé vert — INFLAM
('L_GREEN_TEA_MATCHA', 'Thé vert / Matcha (EGCG + L-théanine)', 'beverage', false, 'Thé vert japonais (sencha, gyokuro, matcha), thé vert chinois', 'T1', '2-4 tasses/j', '↑ dépense énergétique, ↑ oxydation lipidique, ↓ inflammation via EGCG (NF-κB)',
 '↓ CRP, ↓ LDL -5%, ↓ HOMA-IR',
 'INFLAM', 'T1',
 'Zheng 2011 Int J Obes — méta 25 RCT',
 ARRAY['21540875'],
 '2-4 tasses/j de thé vert (250-1000 mg polyphénols). Matcha : ½ c.c./j.',
 'Éviter à jeun si gastrite. Ne pas boire avec repas riche en fer (↓ absorption 70%).',
 NULL,
 ARRAY['EGCG = catéchine majoritaire. L-théanine module effet caféine.'],
 false),

-- Curcuma + poivre — INFLAM
('L_TURMERIC_BLACKPEPPER', 'Curcuma + poivre noir (pipérine)', 'ingredient', false, 'Curcuma frais râpé, poudre de curcuma, poivre noir concassé', 'T1', '1-3g curcumine/j (1 c.c. curcuma)', '↓ NF-κB, ↓ COX-2, ↑ Nrf2. Pipérine ↑ biodisponibilité curcumine ×2000%',
 '↓ CRP -22 mm/h (arthrose), ↓ IL-6, ↓ TNF-α',
 'INFLAM', 'T1',
 'Shehzad 2013 Mol Nutr Food Res — méta 8 RCT',
 ARRAY['23275145'],
 '1 c.c. curcuma + pincée poivre noir + matière grasse. Cuisson douce ≤100°C.',
 'Éviter si calculs biliaires symptomatiques. Interactions AVK (théoriques).',
 NULL,
 ARRAY['Curcumine pure = supplémentation. Curcuma culinaire = dose faible mais durable et sans risque hépatique.'],
 false),

-- Gingembre — INFLAM
('L_GINGER_ANTI_INFLAM', 'Gingembre frais (gingérols, shogaols)', 'ingredient', false, 'Gingembre frais cru, thé de gingembre, gingembre séché', 'T2', '2-4g gingembre frais/j (1 cm racine)', '↑ Nrf2, ↓ NF-κB, ↓ COX-2. Gingérols = agonistes TRPV1 >adaptogènes.',
 '↓ CRP, ↓ douleur musculaire post-exercice',
 'INFLAM', 'T2',
 'Mashhadi 2013 Int J Prev Med — RCT 72 sujets',
 ARRAY['23717708'],
 '1 cm gingembre frais râpé dans plats sautés, soupes, tisanes. Infusion 10 min.',
 'Prudence si lithiase biliaire. Interactions AVK (théoriques).',
 NULL,
 ARRAY['Gingérols frais plus puissants que gingembre séché.'],
 false),

-- Baies anthocyanes — INFLAM
('L_BERRIES_ANTHOCYANINS', 'Baies riches en anthocyanes (myrtilles, mûres, cassis)', 'ingredient', false, 'Myrtilles sauvages, mûres, cassis, airelles, framboises', 'T1', '100-200g/j baies fraîches ou surgelées', '↑ Nrf2, ↓ NF-κB, ↑ biodisponibilité NO, ↓ stress oxydatif postprandial',
 '↓ CRP, ↓ oxLDL, ↑ HDL, ↓ PA systolique -5 mmHg',
 'INFLAM', 'T1',
 'Zhu 2011 J Nutr — méta 22 RCT',
 ARRAY['21900449'],
 '100-200g/j baies. Fraîches ou surgelées (conservent polyphénols). Éviter jus (fibres perdues).',
 NULL,
 NULL,
 ARRAY['Myrtilles sauvages = 2× plus d\'anthocyanes que cultivées.'],
 false),

-- Bouillon d'os — DYSBIOSE
('L_BONE_BROTH_COLLAGEN', 'Bouillon d\'os / collagène alimentaire (barrière)', 'ingredient', false, 'Bouillon d\'os (poulet, boeuf, poisson), collagène hydrolysé', 'T3', '250 ml bouillon/j ou 10g collagène', '↑ glycine, proline, glutamine. Substrat pour réparation barrière intestinale.',
 '↓ perméabilité intestinale (en contexte lésionnel)',
 'DYSBIOSE', 'T3',
 'Al-Nakkash 2024 Nutrients — revue mécanistique',
 ARRAY['38398755'],
 '250 ml bouillon d\'os maison/j. Cuisson 12-24h avec vinaigre pour extraction collagène.',
 'Bouillon industriel = souvent pauvre en collagène. Privilégier fait maison.',
 NULL,
 ARRAY['T3 = mécanistique. Pas de RCT sur bouillon d\'os seul.'],
 false),

-- Légumes lactofermentés — DYSBIOSE
('L_FERMENTED_VEGGIES', 'Légumes lactofermentés diversifiés', 'ingredient', false, 'Choucroute crue, kimchi, pickles lactofermentés, légumes lacto variés', 'T1', '≥2 c.s./j (≈30g)', 'Apport de bactéries lactiques viables (LAB). ↑ diversité microbiome. ↑ SCFA.',
 '↑ diversité microbiome, ↑ IgA sécrétoire',
 'DYSBIOSE', 'T1',
 'Marco 2021 Nat Rev Gastroenterol — revue',
 ARRAY['34290377'],
 '≥2 c.s./j de légumes lactofermentés. Varier les sources.',
 'Introduire progressivement si SIBO. Éviter si histaminose avérée.',
 NULL,
 ARRAY['Vérifier "lactofermentation" et rayon frais. Pasteurisés = LAB morts.'],
 false),

-- Avocat — IR
('L_AVOCADO_MUFA', 'Avocat (MUFA + fibres + glutathion)', 'ingredient', false, 'Avocat frais (type Hass)', 'T1', '½-1 avocat/j', 'MUFA oléique + glutathion. ↑ absorption caroténoïdes. ↑ HDL. ↓ LDL oxydé.',
 '↓ LDL, ↑ HDL, ↓ PA, ↑ satiété',
 'IR', 'T1',
 'Mahmassani 2018 J Nutr — méta 10 RCT',
 ARRAY['30059170'],
 '½-1 avocat/j. Ajouté à assiette de légumes crus (↑ absorption caroténoïdes ×5-15).',
 'Avocat = 160 kcal/100g. Intégrer dans balance énergétique.',
 NULL,
 ARRAY['MUFA oléique = principal AG de l\'avocat. Synchro L_EVOO_PRIMARY.'],
 false),

-- Cannelle — IR
('L_CINNAMON_IR', 'Cannelle de Ceylan (MHCP mimétique insuline)', 'spice', false, 'Cannelle de Ceylan (Cinnamomum verum)', 'T1', '1-3g/j (½-1 c.c.)', 'MHCP = mimétique insuline. ↑ PI3-kinase, ↓ GLUT2 intestinal. ↓ glycémie.',
 '↓ HOMA-IR -0.5, ↓ glycémie à jeun -5%',
 'IR', 'T1',
 'Allen 2013 J Med Food — méta 10 RCT',
 ARRAY['24351163'],
 '½-1 c.c. cannelle Ceylan/j dans petit-déjeuner (porridge, yaourt, café).',
 'Cannelle Cassia contient coumarine → toxique >5g/j. Toujours Ceylan.',
 NULL,
 ARRAY['MHCP = seulement >1g/j. Cannelle en pâtisserie ne suffit pas.'],
 false),

-- Café filtre — IR (prévention diabète)
('L_COFFEE_CARDIO', 'Café filtre (polyphénols + GLP-1 + gut-brain)', 'beverage', false, 'Café filtre (méthode papier), café moulu frais', 'T2', '2-3 tasses/j (200-400 mg caféine)', '↑ GLP-1, ↑ PYY, ↓ gréline. Acide chlorogénique. ↓ risque DT2 et mortalité CV.',
 '↓ risque DT2 -30% (cohorte), ↓ mortalité CV',
 'IR', 'T2',
 'Poole 2017 BMJ — umbrella review 218 méta',
 ARRAY['29167102'],
 '2-3 tasses café filtre/j. Éviter 8h avant coucher. Dernier café avant 14h.',
 'Filtre papier ↓ cafestol/kahweol (↑ LDL si non filtré). Éviter si RGO actif.',
 'Palpitations (↓ caféine)',
 ARRAY['Acide chlorogénique = antioxydant majeur. Effet GLP-1 = T2.'],
 false);

