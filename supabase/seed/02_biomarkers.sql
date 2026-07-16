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

-- Hepatic / MASLD phenotype (IR enrichment v0.2 — Truong 2025)
('LIVER_FAT_PDFF', 'Fraction graisseuse hépatique (MRI-PDFF)', '%', 'hepatic', 'Proton density fat fraction. Seuil SLD/MASLD ≥5%', false),
('LIVER_FAT_MRS', 'Contenu lipidique hépatique (¹H-MRS)', '%', 'hepatic', 'Spectroscopie RM. Seuil SLD >5.56%', false),

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
('FRUCTOSE_INTAKE', 'Apport fructose libre estimé', 'g/day', 'clinical', 'Sucrose, HFCS, SSB. Seuil alerte populationnel >50 g/j', true),
('FREE_SUGAR_PCT_ENERGY', 'Sucres libres (% apport énergétique)', '%', 'clinical', 'Cible UK ≤5%, alerte >10% (EASL/US guidelines)', true),
-- New v0.2 enrichment biomarkers — SOPK, iron blockade, leaky gut
('SHBG', 'SHBG (Sex Hormone Binding Globulin)', 'nmol/L', 'hormonal', 'Transporteur des hormones sexuelles. Basse dans l\'hyperinsulinémie, SOPK, péri-ménopause. Cible >50 nmol/L.', false),
('TSAT', 'Coefficient de saturation de la transferrine', '%', 'iron', 'Rapport fer sérique / capacité totale de fixation. Cible 20-40%. Bas = carence fonctionnelle ou absolue.', false),
('I_FABP', 'I-FABP (Intestinal Fatty Acid Binding Protein)', 'pg/mL', 'microbiome', 'Marqueur de lésion entérocytaire. Élevé si souffrance de la barrière intestinale. Cible <2000 pg/mL.', false),
('LBP', 'LBP (Lipopolysaccharide Binding Protein)', 'µg/mL', 'microbiome', 'Marqueur indirect de translocation endotoxinique (LPS). Élevé si voie leak active. Cible <10 µg/mL.', false),
-- α-HB (alpha-hydroxybutyrate) — nouveau marqueur IR/MASLD (PMID 42440805, 2026)
('A_HYDROXYBUTYRATE', 'α-hydroxybutyrate', 'µmol/L', 'metabolic', 'Métabolite précoce de dysfonction glycogénique hépatique. Élevé dans T2DM avec MASLD. Discriminant pour le phénotype hepatic_masld. Source: Zhang 2026 Front Nutr.', false);
