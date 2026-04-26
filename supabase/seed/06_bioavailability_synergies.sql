-- =====================================================================
-- Seed 06 — Bioavailability synergies (positive and anti-synergies)
-- =====================================================================

INSERT INTO bioavailability_synergies (molecule_a, molecule_b, matrix_required, effect_description, effect_magnitude, ebm_tier, reference, is_synergy, notes) VALUES

-- Positive synergies
(
  'curcumine',
  'pipérine',
  'lipid_warm',
  'Inhibition glucuronidation hépatique de la curcumine par la pipérine. Solubilisation lipidique requise.',
  '+2000% (Shoba 1998, n=8)',
  'T2',
  'Shoba 1998 PMID 9619120',
  true,
  'Petite étude unique, à présenter avec son n. Formulations lipidiques modernes obtiennent des résultats équivalents sans pipérine.'
),
(
  'fer_non_heminique',
  'vitamine_C',
  'acidic_medium',
  'Réduction Fe3+ → Fe2+ par acide ascorbique, augmente absorption duodénale du fer non-héminique.',
  '+200-300%',
  'T1',
  'Hallberg 1989 / méta-analyses cumulatives',
  true,
  'Effet maximal à 50-100 mg vit C consommée concomitamment au fer'
),
(
  'caroténoïdes',
  'lipide',
  'lipid_warm',
  'Lutéine, beta-carotène, lycopène : absorption augmentée par solubilisation lipidique. Effet majeur démontré tomate × huile olive.',
  '+50-200% selon caroténoïde',
  'T1',
  'Brown 2004 / Unlu 2005',
  true,
  'EVOO + tomate cuite = pattern méditerranéen optimal pour lycopène'
),
(
  'sulforaphane',
  'myrosinase_active',
  'raw_or_brief_steam',
  'Conversion glucoraphanine → sulforaphane nécessite myrosinase active. Détruite à >70°C de cuisson prolongée.',
  'Activation requise',
  'T2',
  'Vermeulen 2008 PMID 18975959',
  true,
  'Brocoli vapeur ≤4 min OU cru ; OU ajout moutarde fraîche (myrosinase exogène) si crucifère cuit'
),
(
  'oléocanthal',
  'EVOO_extra_virgin',
  'cold_or_low_heat',
  'Polyphénols EVOO sensibles à la chaleur prolongée. Préserver une partie à cru pour préserver l''oléocanthal (effet anti-inflammatoire COX-like).',
  'Préservation polyphénols >70%',
  'T2',
  'Cicerale 2010',
  true,
  'Ajouter EVOO cru en finition après cuisson ; cuisson modérée tolérée mais sans excès'
),
(
  'EPA_DHA',
  'lipide',
  'lipid_meal',
  'EPA et DHA absorbés dans matrice lipidique (chylomicrons). Consommés avec un repas, absorption ~3x supérieure vs jeûne.',
  '+200-300%',
  'T1',
  'Schuchardt 2013',
  true,
  'Conséquence : poisson gras ou suppléments ω-3 toujours avec un repas comprenant des graisses'
),
(
  'polyphenols_baies',
  'matrice_dairy_optional',
  'flexible',
  'Hypothèse historique d''interaction protéines lactées × polyphénols réduisant biodisponibilité. Données récentes : effet net nul ou positif sur absorption en in vivo humain.',
  'Neutre à modéré',
  'T3',
  'Schramm 2003 vs Serafini 2009',
  true,
  'Pas de contre-indication thé/baies + lait. Litige scientifique non-tranché.'
),

-- Anti-synergies (pairings to avoid for absorption)
(
  'fer_non_heminique',
  'tannins_thé_café',
  'concomitant',
  'Tannins (théaflavines, acides chlorogéniques) chélatent le fer non-héminique. Réduction absorption marquée si consommation concomitante.',
  '-60-70%',
  'T1',
  'Hurrell 1999',
  false,
  'Décaler thé/café d''au moins 1h des repas riches en fer non-héminique. Pertinent en carence martiale ou périménopause.'
),
(
  'fer_non_heminique',
  'calcium_high_dose',
  'concomitant',
  'Calcium ≥300 mg en concomitance réduit absorption du fer non-héminique et héminique.',
  '-30-50%',
  'T2',
  'Hallberg 1992',
  false,
  'Si supplémentation Fe : décaler des produits laitiers et compléments calciques de ≥2h'
),
(
  'fer_non_heminique',
  'phytates',
  'concomitant',
  'Phytates (céréales complètes non trempées, légumineuses non préparées) chélatent le fer.',
  '-50%',
  'T1',
  'Hurrell 2010',
  false,
  'Trempage/germination/fermentation longue réduit la charge phytate. Levain réduit phytates de 60-70%.'
),
(
  'zinc',
  'phytates',
  'concomitant',
  'Phytates chélatent le zinc.',
  '-30-50%',
  'T1',
  'Sandström 1980',
  false,
  'Même remède : trempage, germination, fermentation longue'
),
(
  'crucifères_crues_volumineuses',
  'fonction_thyroidienne_T4',
  'chronic_high_intake',
  'Goitrogènes (progoitrine, glucosinolates) inhibent uptake iodé thyroïdien à très haute consommation crue chronique.',
  'Effet clinique uniquement à doses massives crues prolongées',
  'T3',
  'Données mécanistiques + cas isolés',
  false,
  'Pertinence clinique : très limitée en alimentation normale. Cuisson désactive partiellement les goitrogènes. Modérer si hypothyroïdie sévère + apport iodé bas.'
);
