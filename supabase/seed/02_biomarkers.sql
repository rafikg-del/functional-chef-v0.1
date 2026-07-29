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
('A_HYDROXYBUTYRATE', 'α-hydroxybutyrate', 'µmol/L', 'metabolic', 'Métabolite précoce de dysfonction glycogénique hépatique. Élevé dans T2DM avec MASLD. Discriminant pour le phénotype hepatic_masld. Source: Zhang 2026 Front Nutr.', false),
-- HOMOCYSTEINE — marqueur standard toxico-nutritionnel
('HOMOCYSTEINE', 'Homocystéine totale', 'µmol/L', 'nutritionnel', 'Acide aminé soufré. Élevé = déficit B6/B9/B12 ou stress oxydatif. Facteur de risque CV indépendant. Cible <15 µmol/L.', false),
-- GGT (gamma-glutamyl transférase, déjà présent? — ici comme marqueur explicite stress oxydatif)
('GGT', 'Gamma-GT', 'U/L', 'hepatique', 'Enzyme de conjugaison du glutathion. Élevé = stress oxydatif hépatique, surcharge métabolique, alcool. Cible <40 U/L chez H, <30 U/L chez F. Marqueur prédictif de diabète.', false),
-- Ferritine (haute — marqueur inflammatoire, déjà présent mais non listé explicitement)
('FERRITIN_HIGH', 'Ferritine haute (inflammatoire)', 'ng/mL', 'iron', 'Ferritine >200 ng/mL = marqueur inflammatoire si TSAT normal. Distinguer surcharge vraie (TSAT >45%) de blocage fonctionnel (TSAT <20%).', false),
-- MMA (methylmalonic acid) — discriminant statut B12 intracellulaire
('MMA', 'Acide méthylmalonique', 'µmol/L', 'nutritionnel', 'Marqueur précoce et sensible de déficit en B12 intracellulaire, plus fiable que B12 sérique. Élevé si B12 fonctionnelle insuffisante. Cible <0.4 µmol/L.', false),
-- RBC Magnesium — magnésium érythrocytaire (stock intracellulaire vs sérique)
('RBC_MAGNESIUM', 'Magnésium érythrocytaire', 'mg/dL', 'mineral', 'Reflet du stock intracellulaire en magnésium, plus fiable que magnésium sérique. Cofacteur COMT, MTHFR, CBS. Cible 5.0-6.5 mg/dL.', false),
-- Ratio Zinc/Calcium (calculé) — discriminant inflammation et statut zinc
('ZN_CU_RATIO', 'Ratio Zinc/Cuivre', '', 'calculated', 'Rapport zinc/cuivre sérique. <0.8 = inflammation, >1.2 = possible carence cuivre. Optimal 0.8-1.2.', false),
-- B2 (riboflavine) — cofacteur MTHFR
('B2_RIBOFLAVIN', 'Vitamine B2 (riboflavine)', 'µg/L', 'vitamin', 'Cofacteur MTHFR. Carence → ↓ conversion folate → ↑ homocystéine. Cible >200 µg/L.', false),
-- B6 (P5P) — cofacteur CBS, transsulfuration, neurotransmetteurs
('B6_P5P', 'Vitamine B6 active (P5P)', 'nmol/L', 'vitamin', 'Cofacteur CBS (transsulfuration homocystéine → glutathion), AADC (synthèse dopamine/sérotonine). Cible >30 nmol/L.', false),
-- CoQ10 — ubiquinone, transporteur mitochondrial
('COQ10', 'Coenzyme Q10 (ubiquinone)', 'µmol/L', 'mitochondrial', 'Transporteur d\'électrons mitochondrial. Statines ↓ CoQ10. Cible >0.5 µmol/L.', false),
-- Iode (iode urinaire) — fonction thyroïdienne
('IODINE', 'Iode urinaire', 'µg/L', 'thyroid', 'Oligoélément essentiel à la synthèse des hormones thyroïdiennes. Carence fréquente. Cible >100 µg/L.', false),
-- Vitamine D (25-OH) — immunité, inflammation, calcium
('VITAMIN_D', '25-hydroxy-vitamine D', 'ng/mL', 'vitamin', 'Immunomodulateur majeur. Carence associée à ↑ inflammation, ↑ IR. Cible 50-80 ng/mL.', false),
-- Vitamine A (rétinol) — immunité muqueuse, vision, antioxydant
('VITAMIN_A', 'Vitamine A (rétinol)', 'µg/L', 'vitamin', 'Intégrité épithéliale, immunité muqueuse, différenciation cellulaire. Cible 300-800 µg/L.', false),
-- Vitamine E (alpha-tocophérol) — antioxydant membranaire
('VITAMIN_E', 'Vitamine E (alpha-tocophérol)', 'mg/L', 'vitamin', 'Antioxydant liposoluble majeur. Protège membranes des AGEs. Cible >12 mg/L.', false),
-- Sodium sérique
('SODIUM', 'Sodium', 'mmol/L', 'electrolyte', 'Électrolyte principal extracellulaire. Marqueur d\'hydratation, fonction surrénale. Cible 135-145 mmol/L.', false),
-- Potassium sérique
('POTASSIUM', 'Potassium', 'mmol/L', 'electrolyte', 'Électrolyte intracellulaire. Cofacteur enzymatique. Cible 3.5-5.0 mmol/L.', false),
-- Cuivre sérique total
('COPPER', 'Cuivre sérique total', 'µmol/L', 'mineral', 'Cofacteur SOD, céruloplasmine, dopamine β-hydroxylase. À interpréter avec zinc. Cible 10-22 µmol/L.', false),
-- Céruloplasmine — transporteur cuivre, acute phase
('CERULOPLASMIN', 'Céruloplasmine', 'mg/dL', 'mineral', 'Transporteur du cuivre. Acute phase reactant. Cible 20-60 mg/dL.', false),
-- SAM/SAH ratio — ratio méthylation/déméthylation
('SAM_SAH_RATIO', 'Ratio SAM/SAH', '', 'methylation', 'Ratio S-adénosylméthionine/S-adénosylhomocystéine. Reflet de l\'efficacité de la méthylation. Cible >4.0.', false),
-- HVA (homovanillate) — catabolite dopamine (urinaire)
('HVA', 'Acide homovanillique (HVA)', 'µmol/gCr', 'methylation', 'Catabolite final de la dopamine via COMT. Bas si COMT ralenti. Marqueur neuro-métabolique.', false),
-- VMA (vanilmandélate) — catabolite adrénaline/noradrénaline
('VMA', 'Acide vanilmandélique (VMA)', 'µmol/gCr', 'methylation', 'Catabolite final des catécholamines via COMT+MAO. Cible <15 µmol/L.', false),
-- Métaux lourds — charge toxique
('LEAD_BLOOD', 'Plomb sanguin', 'µg/L', 'toxic', 'Métal lourd neurotoxique. Inhibe MTHFR, CBS, ALA-D. Cible <50 µg/L (CDC adulte).', false),
('MERCURY_BLOOD', 'Mercure sanguin', 'µg/L', 'toxic', 'Métal lourd neurotoxique. Se lie au sélénium, inhibe enzymes. Cible <5 µg/L.', false),
('CADMIUM_BLOOD', 'Cadmium sanguin', 'µg/L', 'toxic', 'Métal lourd néphrotoxique. Présent dans tabac, engrais. Cible <1 µg/L.', false),
('ARSENIC_URINE', 'Arsenic urinaire total', 'µg/gCr', 'toxic', 'Métalloïde toxique. Eau, riz, fruits de mer. Cible <50 µg/gCr.', false),
-- Perturbateurs endocriniens
('BPA_URINE', 'Bisphénol A urinaire', 'µg/L', 'toxic', 'Perturbateur endocrinien. Plastiques, canettes. Cible <2 µg/L.', false),
-- Mycotoxines
('OCHRATOXIN', 'Ochratoxine A sérique', 'µg/L', 'toxic', 'Mycotoxine néphrotoxique et immunotoxique. Moisissures alimentaires. Cible <0.5 µg/L.', false),
('HIPPURATE', 'Acide hippurique urinaire', 'µmol/L', 'toxic', 'Métabolite des solvants organiques (toluène). Marqueur d\'exposition. Cible <50 µmol/L.', false),
-- Vitamine C (ascorbate) — cofacteur D5D/D6D, antioxydant
('VITAMIN_C', 'Vitamine C (acide ascorbique)', 'mg/L', 'vitamin', 'Cofacteur des désaturases D5D/D6D (conversion PUFA). Antioxydant plasmatique majeur. Synergique avec vitamine E. Cible >8 mg/L.', false);
