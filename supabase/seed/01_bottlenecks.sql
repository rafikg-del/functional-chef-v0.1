-- =====================================================================
-- Seed 01 — Bottlenecks (3 pilots from spec v0.1)
-- =====================================================================

INSERT INTO bottlenecks (id, name, display_name_fr, display_name_en, description, priority_rank, classifier_rule) VALUES
(
  'ALLOSTATIC_LOAD',
  'allostatic_load',
  'Charge allostatique',
  'Allostatic load',
  'Surcharge adaptative neuro-endocrine et autonomique : activation HPA/sympathique persistante, récupération parasympathique insuffisante, sommeil non restaurateur et instabilité énergétique. Positionnée en amont car elle amplifie IR, inflammaging et dysbiose.',
  0,
  '≥2 critères majeurs OU ≥1 majeur + ≥3 modérés'
),
(
  'IR',
  'insulin_resistance',
  'Insulinorésistance fonctionnelle',
  'Functional insulin resistance',
  'Perte précoce du signal insulinique avant tout critère diabétique. Zone d''intérêt = HOMA-IR 1.5-2.5. C''est là que la cuisine fonctionnelle a son rendement maximal — au-delà, c''est de la pharmacothérapie.',
  1,
  '≥3 critères majeurs OU ≥2 majeurs + ≥3 modérés'
),
(
  'INFLAM',
  'inflammaging',
  'Inflammaging',
  'Inflammaging',
  'Inflammation chronique de bas grade liée à l''âge, au-dessous du seuil clinique aigu. Marqueur central = CRP-us en zone 1-3 mg/L sans inflammation aiguë.',
  2,
  'CRP-us >1 mg/L persistante (2 dosages à 4 semaines) + ≥1 critère majeur secondaire'
),
(
  'DYSBIOSE',
  'dysbiosis',
  'Dysbiose intestinale',
  'Gut dysbiosis',
  'Altération composition microbiote intestinal : ↓ diversité, ↓ butyrate-producteurs, ↑ Proteobacteria, perte intégrité barrière.',
  3,
  '≥2 critères cliniques majeurs persistants ≥3 mois + ≥1 facteur historique aggravant'
);
