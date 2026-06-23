-- =====================================================================
-- Seed 02 — Biomarkers reference catalog
-- =====================================================================

INSERT INTO biomarkers (id, name, unit, category, description, is_clinical) VALUES
-- Metabolic / IR
('HOMA_IR', 'HOMA-IR', 'index', 'metabolic', 'Homeostasis Model Assessment of Insulin Resistance. Calc: (insulin × glucose)/22.5', false),
('FASTING_INSULIN', 'Insulinémie à jeun', 'µU/mL', 'metabolic', 'Fasting insulin', false),
('HBA1C', 'HbA1c', '%', 'metabolic', 'Glycated hemoglobin, integrative 3-month glycemia', false),
('TG_HDL_RATIO', 'Ratio TG/HDL', 'ratio', 'lipid', 'Triglycérides / HDL — proxy IR + atherogenicity', false),
('FASTING_GLUCOSE', 'Glycémie à jeun', 'g/L', 'metabolic', 'Fasting plasma glucose', false),
('TRIGLYCERIDES', 'Triglycérides', 'g/L', 'lipid', 'Plasma triglycerides', false),
('ALT', 'ALT (TGP)', 'U/L', 'hepatic', 'Alanine aminotransferase — NAFLD silencieuse au-dessus de 25', false),
('URIC_ACID', 'Acide urique', 'mg/dL', 'metabolic', 'Uric acid — proxy fructose intake / IR', false),
('WAIST_HEIGHT_RATIO', 'Ratio tour-taille / taille', 'ratio', 'composition', 'Waist-to-height ratio — better predictor than BMI', false),
('APO_B', 'Apo B', 'g/L', 'lipid', 'Apolipoprotein B — atherogenic particle count', false),
('CGM_SD', 'Variabilité glycémique CGM', 'mg/dL', 'metabolic', 'Standard deviation of CGM glucose values', false),

-- Inflammatory
('CRP_US', 'CRP ultra-sensible', 'mg/L', 'inflammatory', 'High-sensitivity C-reactive protein', false),
('OMEGA_INDEX', 'Omega-3 Index', '%', 'inflammatory', 'Erythrocyte EPA+DHA as % of total fatty acids', false),
('AA_EPA_RATIO', 'Ratio AA/EPA', 'ratio', 'inflammatory', 'Arachidonic acid / EPA ratio — pro-inflammatory tone', false),
('NLR', 'Ratio Neutrophiles/Lymphocytes', 'ratio', 'inflammatory', 'Neutrophil-to-lymphocyte ratio', false),
('IL6', 'Interleukine-6', 'pg/mL', 'inflammatory', 'Pro-inflammatory cytokine, optional advanced', false),
('FERRITIN', 'Ferritine', 'µg/L', 'inflammatory', 'Acute phase reactant; iron status. Interpret with TSAT.', false),
('ALBUMIN', 'Albumine', 'g/L', 'inflammatory', 'Negative acute phase reactant; nutritional status', false),
('FIBRINOGEN', 'Fibrinogène', 'g/L', 'inflammatory', 'Acute phase reactant', false),
('HDL', 'HDL cholestérol', 'mmol/L', 'lipid', 'High-density lipoprotein', false),
('VISCERAL_FAT_DEXA', 'Graisse viscérale (DEXA)', 'cm²', 'composition', 'Visceral adipose tissue area', false),

-- Microbiome / digestive
('CALPROTECTIN', 'Calprotectine fécale', 'µg/g', 'microbiome', 'Marker of intestinal inflammation', false),
('ZONULIN', 'Zonuline sérique', 'ng/mL', 'microbiome', 'Marker of intestinal permeability — biomarker validity contested', false),
('SHANNON_DIVERSITY', 'Diversité Shannon (microbiote)', 'index', 'microbiome', 'Alpha-diversity from 16S/shotgun analysis', false),

-- Clinical signals
('BRISTOL_SCORE', 'Bristol Stool Scale', 'score', 'clinical', '1-7 stool form scale', true),
('BLOATING_FREQ', 'Fréquence ballonnements', 'per_week', 'clinical', 'Subjective frequency of bloating episodes per week', true),
('SIBO_BREATH', 'Test respiratoire SIBO H2/CH4', 'qualitative', 'clinical', 'Hydrogen/methane breath test result', true),
('ABX_LIFETIME', 'Cures abx lifetime', 'count', 'clinical', 'Total antibiotic courses in patient history', true),
('PPI_CHRONIC', 'IPP chronique >6 mois', 'qualitative', 'clinical', 'Chronic proton pump inhibitor use', true),
('FIBER_INTAKE', 'Apport fibres estimé', 'g/day', 'clinical', 'Estimated daily fiber intake', true),
('PLANT_DIVERSITY', 'Diversité plantes/sem', 'count', 'clinical', 'Number of distinct plant species consumed weekly', true),

-- Allostatic load / neuro-endocrine recovery
('CORTISOL_AM', 'Cortisol salivaire matin', 'nmol/L', 'endocrine', 'Morning salivary cortisol. Interpret with sampling time and acute stress context.', false),
('CORTISOL_PM', 'Cortisol salivaire soir', 'nmol/L', 'endocrine', 'Evening salivary cortisol; high values suggest impaired HPA downshift.', false),
('DHEA_S', 'DHEA-S', 'µg/dL', 'endocrine', 'DHEA sulfate; low values can reflect reduced anabolic reserve in chronic stress context.', false),
('HRV_RMSSD', 'HRV RMSSD nocturne', 'ms', 'autonomic', 'Root mean square of successive differences; parasympathetic recovery marker.', false),
('RESTING_HR', 'Fréquence cardiaque repos', 'bpm', 'autonomic', 'Resting heart rate; autonomic strain proxy when persistently elevated.', false),
('PSQI_SCORE', 'Pittsburgh Sleep Quality Index', 'score', 'sleep', 'Subjective sleep quality index; higher is worse.', true),
('SLEEP_EFFICIENCY', 'Efficacité du sommeil', '%', 'sleep', 'Sleep efficiency from wearable, diary or polysomnography.', true),
('WASO_MIN', 'Wake after sleep onset', 'min', 'sleep', 'Minutes awake after sleep onset.', true),
('CAFFEINE_AFTER_14', 'Caféine après 14h', 'qualitative', 'clinical', 'Regular caffeine exposure after 14:00 or within 8h of bedtime.', true);
