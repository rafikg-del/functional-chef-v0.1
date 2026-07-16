-- =====================================================================
-- Seed 03 — Biomarker thresholds × bottlenecks (full matrix)
-- =====================================================================

-- ---------------------------------------------------------------------
-- IR (Insulin resistance) thresholds
-- ---------------------------------------------------------------------
INSERT INTO biomarker_thresholds (bottleneck_id, biomarker_id, functional_target_min, functional_target_max, alert_threshold_low, alert_threshold_high, weight, notes) VALUES
('IR', 'HOMA_IR',           NULL,  1.3,  NULL,  1.5,   'major',    'Zone fonctionnelle <1.3 ; alerte >1.5 ; au-delà de 2.5 = pharmacothérapie'),
('IR', 'FASTING_INSULIN',   NULL,  6,    NULL,  8,     'major',    'Insulinémie à jeun'),
('IR', 'HBA1C',             NULL,  5.4,  NULL,  5.4,   'major',    'Zone grise 5.4-5.6%'),
('IR', 'TG_HDL_RATIO',      NULL,  1.0,  NULL,  1.5,   'major',    'Atherogenic dyslipidemia of IR'),
('IR', 'FASTING_GLUCOSE',   NULL,  0.95, NULL,  0.95,  'moderate', 'Zone grise 0.95-1.05 g/L'),
('IR', 'TRIGLYCERIDES',     NULL,  0.80, NULL,  1.2,   'moderate', NULL),
('IR', 'ALT',               NULL,  22,   NULL,  25,    'moderate', 'Au-delà de 25 = NAFLD silencieuse probable'),
('IR', 'URIC_ACID',         NULL,  5.5,  NULL,  6.0,   'minor',    'Cible H<5.5 / F<4.5. Proxy fructose/IR'),
('IR', 'WAIST_HEIGHT_RATIO', NULL, 0.5,  NULL,  0.55,  'moderate', NULL),
('IR', 'APO_B',             NULL,  0.90, NULL,  1.0,   'moderate', NULL),
('IR', 'CGM_SD',            NULL,  15,   NULL,  20,    'discriminant', 'SD glucose CGM si dispo'),
-- IR hepatic MASLD phenotype (Truong & Lee 2025 DMJ — enrichment, not separate bottleneck)
('IR', 'LIVER_FAT_PDFF',    NULL,  5.0,  NULL,  5.0,   'major',    'MASLD si ≥5% PDFF. Tag phénotype hepatic_masld'),
('IR', 'LIVER_FAT_MRS',     NULL,  5.56, NULL,  5.56,  'major',    'MASLD si >5.56% MRS'),
('IR', 'FRUCTOSE_INTAKE',   NULL,  25,   NULL,  50,    'moderate', 'Excès fructose >50 g/j — activation ChREBP/DNL'),
('IR', 'FREE_SUGAR_PCT_ENERGY', NULL, 5, NULL, 10,    'moderate', 'Sucres libres >10% énergie — cible ≤5% si MASLD'),
-- α-hydroxybutyrate — discriminant pour hepatic_masld (Zhang 2026 Front Nutr PMID 42440805)
('IR', 'A_HYDROXYBUTYRATE',  NULL,  NULL, NULL, 12,    'discriminant', 'α-HB >12 µmol/L = dysfonction glycogénique hépatique. Discriminant pour phénotype hepatic_masld.');

-- ---------------------------------------------------------------------
-- INFLAM (Inflammaging) thresholds
-- ---------------------------------------------------------------------
INSERT INTO biomarker_thresholds (bottleneck_id, biomarker_id, functional_target_min, functional_target_max, alert_threshold_low, alert_threshold_high, weight, notes) VALUES
('INFLAM', 'CRP_US',        NULL,  1,    NULL,  1,     'major',    'Zone grise 1-3 mg/L. Persistance ≥2 dosages à 4 sem.'),
('INFLAM', 'OMEGA_INDEX',   8,     NULL, 6,     NULL,  'major',    'Cible >8%. Alerte <6%. Sévère <4%'),
('INFLAM', 'AA_EPA_RATIO',  NULL,  3,    NULL,  7,     'major',    'Cible <3. Alerte >7-10'),
('INFLAM', 'NLR',           NULL,  2,    NULL,  2.5,   'moderate', 'Neutrophil-to-lymphocyte ratio'),
('INFLAM', 'IL6',           NULL,  2,    NULL,  3,     'major',    'Optionnel avancé'),
('INFLAM', 'FERRITIN',      NULL,  300,  NULL,  300,   'moderate', 'Hors carence martiale. Acute phase si élevée'),
('INFLAM', 'ALBUMIN',       42,    NULL, 40,    NULL,  'moderate', 'Negative acute phase reactant'),
('INFLAM', 'FIBRINOGEN',    NULL,  3.5,  NULL,  4,     'moderate', NULL),
('INFLAM', 'HBA1C',         NULL,  5.6,  NULL,  5.6,   'moderate', 'Aggravant inflammaging si >5.6%'),
('INFLAM', 'HDL',           1.0,   NULL, NULL,  NULL,  'moderate', 'H>1.0 / F>1.2 mmol/L. Bas + TG haut = pattern'),
('INFLAM', 'VISCERAL_FAT_DEXA', NULL, 100, NULL, 130,  'discriminant', 'DEXA si dispo');

-- ---------------------------------------------------------------------
-- DYSBIOSE thresholds
-- ---------------------------------------------------------------------
-- For Bristol: alert if score 1-2 OR 6-7 (either tail). Encoded as alert_threshold_high=5
-- (interpret: score outside 3-5 range = alert). Classifier handles the tail logic.
INSERT INTO biomarker_thresholds (bottleneck_id, biomarker_id, functional_target_min, functional_target_max, alert_threshold_low, alert_threshold_high, alert_categorical_value, weight, notes) VALUES
('DYSBIOSE', 'BRISTOL_SCORE',     3,     5,    3,     5,     NULL,       'major',    'Cible 3-5. Alerte si chronique <3 ou >5'),
('DYSBIOSE', 'BLOATING_FREQ',     NULL,  2,    NULL,  7,     NULL,       'major',    'Cible <2/sem. Alerte quotidien'),
('DYSBIOSE', 'CALPROTECTIN',      NULL,  50,   NULL,  50,    NULL,       'major',    'Inflammation intestinale au-dessus de 50'),
('DYSBIOSE', 'SIBO_BREATH',       NULL,  NULL, NULL,  NULL,  'positive', 'discriminant', 'Si test fait'),
('DYSBIOSE', 'ZONULIN',           NULL,  NULL, NULL,  NULL,  NULL,       'moderate', 'Biomarqueur contesté, à interpréter avec prudence'),
('DYSBIOSE', 'SHANNON_DIVERSITY', 3.5,   NULL, 3.0,   NULL,  NULL,       'discriminant', 'Si analyse 16S/shotgun dispo'),
('DYSBIOSE', 'ABX_LIFETIME',      NULL,  3,    NULL,  3,     NULL,       'moderate', 'Aggravant si >3 cures lifetime'),
('DYSBIOSE', 'PPI_CHRONIC',       NULL,  NULL, NULL,  NULL,  'positive', 'moderate', 'IPP >6 mois sans indication forte'),
('DYSBIOSE', 'FIBER_INTAKE',      25,    NULL, 15,    NULL,  NULL,       'moderate', 'Cible >25g/j. Alerte <15g/j'),
('DYSBIOSE', 'PLANT_DIVERSITY',   30,    NULL, 15,    NULL,  NULL,       'moderate', 'Cible ≥30/sem. Alerte <15/sem'),
-- Enrichissement SOPK/péri-ménopause pour IR
('IR', 'SHBG',              50,    NULL, 30,    NULL,  NULL,       'moderate', 'SHBG basse <30 nmol/L = marqueur d\'hyperinsulinémie. Surtout chez F. Active la priorisation SOPK.'),
-- Enrichissement blocage fonctionnel du fer pour INFLAM
('INFLAM', 'TSAT',            20,    NULL, 20,    NULL,  NULL,       'moderate',   'TSAT <20% = carence fonctionnelle ou absolue. [Hauck 2025]'),
-- Nouveaux marqueurs v0.2 enrichment (HOMOCYSTEINE, GGT, FERRITIN_HIGH)
('INFLAM', 'HOMOCYSTEINE',    NULL,  15,   NULL,  15,    'moderate',   'Homocystéine >15 = stress oxydatif/déficit B6/B9/B12. Levier: B6, B9, B12, bétaïne, choline (oeufs).'),
('IR',     'GGT',             NULL,  30,   NULL,  40,    'moderate',   'GGT >40 = stress oxydatif hépatique. Prédicteur diabète (Lee 2006 Diab Care).'),
('INFLAM', 'GGT',             NULL,  30,   NULL,  40,    'moderate',   'GGT >40 = stress oxydatif systémique. Consommation glutathion.'),
('INFLAM', 'FERRITIN_HIGH',   NULL,  200,  NULL,  200,   'moderate',   'Ferritine >200 = marqueur inflammatoire si TSAT normal. Distinguer blocage fer (TSAT<20) vs surcharge (TSAT>45).'),
-- Enrichissement voie leak pour DYSBIOSE (discriminants avancés)
('DYSBIOSE', 'I_FABP',        NULL,  2000,  NULL,  2000,  NULL,       'discriminant', 'Souffrance entérocytaire >2000 pg/mL'),
('DYSBIOSE', 'LBP',           NULL,  10,    NULL,  10,    NULL,       'discriminant', 'Translocation LPS >10 µg/mL');
