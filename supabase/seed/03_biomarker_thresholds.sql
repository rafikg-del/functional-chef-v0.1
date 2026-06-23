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
('IR', 'CGM_SD',            NULL,  15,   NULL,  20,    'discriminant', 'SD glucose CGM si dispo');

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
('DYSBIOSE', 'PLANT_DIVERSITY',   30,    NULL, 15,    NULL,  NULL,       'moderate', 'Cible ≥30/sem. Alerte <15/sem');

-- ---------------------------------------------------------------------
-- ALLOSTATIC_LOAD thresholds
-- ---------------------------------------------------------------------
-- These thresholds are screening-oriented and require convergent signals.
-- Cortisol and DHEA-S must be interpreted with sampling time, age, sex,
-- medication, shift work and acute stress context.
INSERT INTO biomarker_thresholds (bottleneck_id, biomarker_id, functional_target_min, functional_target_max, alert_threshold_low, alert_threshold_high, alert_categorical_value, weight, notes) VALUES
('ALLOSTATIC_LOAD', 'HRV_RMSSD',        35,    NULL, 25,    NULL,  NULL,       'major',    'Low nocturnal RMSSD suggests insufficient parasympathetic recovery; compare to individual baseline when available'),
('ALLOSTATIC_LOAD', 'PSQI_SCORE',       NULL,  5,    NULL,  8,     NULL,       'major',    'Poor sleep quality; PSQI >5 abnormal, >8 strong functional signal'),
('ALLOSTATIC_LOAD', 'CORTISOL_PM',      NULL,  3,    NULL,  5,     NULL,       'major',    'Evening cortisol should be low; high value suggests impaired HPA downshift'),
('ALLOSTATIC_LOAD', 'CORTISOL_AM',      8,     18,   5,     20,    NULL,       'moderate', 'Morning cortisol outside expected band; interpret with sampling time'),
('ALLOSTATIC_LOAD', 'DHEA_S',           100,   NULL, 80,    NULL,  NULL,       'moderate', 'Low DHEA-S as reduced anabolic reserve proxy; age/sex adjusted interpretation preferred'),
('ALLOSTATIC_LOAD', 'SLEEP_EFFICIENCY', 90,    NULL, 85,    NULL,  NULL,       'moderate', 'Wearable or diary proxy; <85% suggests fragmented sleep'),
('ALLOSTATIC_LOAD', 'WASO_MIN',         NULL,  30,   NULL,  45,    NULL,       'moderate', 'Wake after sleep onset; persistent fragmentation marker'),
('ALLOSTATIC_LOAD', 'RESTING_HR',       NULL,  65,   NULL,  75,    NULL,       'moderate', 'Persistently elevated resting HR suggests autonomic strain'),
('ALLOSTATIC_LOAD', 'FASTING_GLUCOSE',  NULL,  0.95, NULL,  0.95,  NULL,       'minor',    'Overlap IR; late-day cravings and stress physiology can amplify glycemic instability'),
('ALLOSTATIC_LOAD', 'CAFFEINE_AFTER_14',NULL,  NULL, NULL,  NULL,  'positive', 'moderate', 'Caffeine after 14:00 or within 8h of bedtime can maintain sympathetic tone and impair sleep');
