# Cartographie NIBLETS — Functional Chef v0.2

> **N**utrient deficiencies · **I**nflammation/Immunity · **B**iochemical individuality
> **L**ifestyle · **E**nergy · **T**oxic load · **S**tress and Sleep
> Source : Ch9 — IFMNT NIBLETS Assessment (Noland 2020)

---

## 1. N — Nutrient Deficiencies / Insufficiencies

### Couverture FC : ✅ 47 biomarqueurs

| Sous-catégorie | Biomarqueurs FC | Nb |
|----------------|----------------|-----|
| **Glucides / IR** | HOMA_IR, FASTING_INSULIN, HbA1c, TG_HDL_RATIO, A_HYDROXYBUTYRATE | 5 |
| **Lipides** | OMEGA3_INDEX, AA_EPA_RATIO, OMEGA6_OMEGA3_RATIO, LDL, HDL, TRIGLYCERIDES, TOTAL_CHOLESTEROL, sdLDL, ApoB | 9 |
| **Vitamines B** | HOMOCYSTEINE, MMA, B2_RIBOFLAVIN, B6_P5P, FOLATE, B12 | 6 |
| **Vitamines liposolubles** | VITAMIN_D, VITAMIN_A, VITAMIN_E | 3 |
| **Minéraux** | RBC_MAGNESIUM, ZINC, SELENIUM, IRON, ZN_CU_RATIO, COPPER, CERULOPLASMIN, IODINE, CALCIUM | 9 |
| **Électrolytes** | SODIUM, POTASSIUM, CHLORIDE | 3 |
| **Acides aminés** | HOMOCYSTEINE, METHIONINE, GLYCINE | 3 |
| **Mitochondrie** | COQ10, A_HYDROXYBUTYRATE, LACTATE | 3 |
| **Fonction rénale** | CREATININE, GFR, URIC_ACID, BUN | 4 |
| **Fonction hépatique** | ALT, AST, GGT, ALBUMIN | 4 |

**Total : 47 biomarqueurs couverts**

### Lacunes identifiées

| Marqueur | Pourquoi |
|----------|----------|
| Vitamine K2 (Menaquinone) | Rare, pas de routine |
| B1 (Thiamine) | Spécialisé, lié à alcoolisme |
| B3 (Niacine) | Spécialisé |
| B5 (Pantothénate) | Très rare |
| Choline | Spécialisé |
| Inositol | Très rare |
| Taurine | Spécialisé |
| Carnitine | Spécialisé |
| Manganèse | Rare |
| Molybdène | Très rare |
| Bore | Très rare |
| Fluor | Routinier mais non pertinent |

---

## 2. I — Inflammation / Immunity

### Couverture FC : ✅ 14 biomarqueurs

| Marqueur | Poids | Rôle |
|----------|-------|------|
| CRP_US | Major | Marqueur central inflammation bas grade |
| OMEGA3_INDEX | Major | Statut anti-inflammatoire structural |
| AA_EPA_RATIO | Major | Équilibre pro/anti-inflammatoire |
| NLR | Moderate | Ratio immunitaire neutrophiles/lymphocytes |
| FIBRINOGEN | Moderate | Acute phase reactant |
| FERRITIN_HIGH | Moderate | Ferritine haute = acute phase |
| TSAT | Moderate | Blocage fer fonctionnel |
| IL6 | Major | Cytokine pro-inflammatoire (optionnel) |
| GGT | Moderate | Stress oxydatif systémique |
| I_FABP | Discriminant | Lésion entérocytaire → inflammation |
| LBP | Discriminant | Translocation LPS → inflammation |
| DEXA_VISCERAL_FAT | Discriminant | Inflammation métabolique |
| VITAMIN_D | Moderate | Immunomodulateur |
| ZN_CU_RATIO | Discriminant | Inflammation chronique |

**Sous-catégories :**
- 🔥 **Inflammation systémique** : CRP, IL6, FIBRINOGEN
- 🛡️ **Immunité muqueuse** : IgA, I_FABP, LBP
- 🧬 **Inflammation métabolique** : GGT, FERRITIN, VISCERAL_FAT
- 🐟 **Statut structural anti-inflammatoire** : Omega-3, AA/EPA
- ⚔️ **Inflammation nutritionnelle** : Zn/Cu, Vit D, homocystéine

---

## 3. B — Biochemical Individuality / Genetics

### Couverture FC : 🟡 27 soft signals

| Type | Signaux FC |
|------|-----------|
| **SNPs (informationnels)** | MTHFR, COMT, CBS (notes cliniques seulement — pas de test génétique) |
| **Soft signals IR** | fatigue_postprandiale, fringales_glucidiques, ATCD familiaux DT2, prise_poids, SOPK, ovulation_irreguliere, lipodystrophie |
| **Soft signals INFLAM** | douleurs_articulaires, fatigue_chronique, infections_recurrentes, peau_inflammee, intolérance_alcool, sueurs_nocturnes, gingivite |
| **Soft signals DYSBIOSE** | alternance_constipation_diarrhee, flatulences, RGO, nausées, selles_molles_matin, intolérance_histamine, FODMAP_sensibilité |
| **Médications** | statines, IPP, metformine, contraceptifs, diurétiques |

### Lacunes

| Élément non couvert | Piste |
|--------------------|-------|
| **Génétique** (vraie nutrigénétique) | Pas de tests ADN dans FC — volontaire |
| **Histamine** (DAO, HNMT) | Déjà partiellement via soft signal |
| **Oxalates** | Pas encore |
| **Sulfation / SUOX** | Molybdène non couvert |

---

## 4. L — Lifestyle Factors

### Couverture FC : ✅ 86 leviers

| Domaine | Leviers FC | Exemples |
|---------|-----------|----------|
| **Alimentation** | 84 leviers | Vinaigre, séquence, EVOO, légumineuses, fibres, fermentés, etc. |
| **Sommeil** | 1 levier | L_SLEEP_HYGIENE (T1 INFLAM, T1 IR, T2 DYSBIOSE) |
| **Exercice** | 1 levier | L_POSTPRANDIAL_WALK |
| **Stress** | 1 levier | L_ASHWAGANDHA |
| **Hydratation** | 1 levier | L_WATER_HYDRATION |

### Lacunes

| Domaine manquant | Pourquoi |
|-----------------|----------|
| **Tabac / sevrage** | Pas de levier nutritionnel direct |
| **Alcool** | Safety filter partiel, pas de levier dédié |
| **Relations sociales** | Hors scope FC |
| **Exposition plein air / lumière** | Potentiel levier (vit D, circadien) |

---

## 5. E — Energy (Mitochondrial)

### Couverture FC : 🟡 3 biomarqueurs

| Marqueur | Rôle |
|----------|------|
| COQ10 | Transporteur chaîne respiratoire (↓ par statines) |
| A_HYDROXYBUTYRATE | Dysfonction glycogénique hépatique |
| B2_RIBOFLAVIN | Cofacteur FAD → cycle de Krebs |
| B6_P5P | Cofacteur transsulfuration |
| RBC_MAGNESIUM | Cofacteur ATP |

### Lacunes

| Marqueur | Piste |
|----------|-------|
| Lactate | Dysfonction mitochondriale |
| Pyruvate | Ratio L/P |
| Carnitine | Transport AG vers mitochondrie |
| Créatinine kinase | Intégrité musculaire |

---

## 6. T — Toxic Load

### Couverture FC : ✅ 8 biomarqueurs (ajoutés)

| Type | Biomarqueurs | Poids |
|------|-------------|-------|
| **Métaux lourds** | Plomb, Mercure, Cadmium, Arsenic | Discriminant |
| **Perturbateurs endocriniens** | BPA | Discriminant |
| **Mycotoxines** | Ochratoxine A | Discriminant |
| **Solvants** | Acide hippurique | Discriminant |

### Lacunes

| Toxine | Pourquoi pas |
|--------|-------------|
| Aluminium | Très rare en routine |
| Thallium | Très rare |
| Organophosphorés | Spécialisé |
| Glyphosate | Très spécialisé |
| Phtalates | Spécialisé |

---

## 7. S — Stress and Sleep

### Couverture FC : ✅

| Domaine | Couverture |
|---------|-----------|
| **Sommeil** | L_SLEEP_HYGIENE (T1), recommandations coucher/horaire |
| **Stress psychologique** | Soft signals + L_ASHWAGANDHA (T1 cortisol) |
| **Axe HPA** | Suspecté via soft signals, pas de marqueur direct |
| **Tonus vagal** | Pas encore de mesure HRV directe |

### Lacunes

| Marqueur | Piste |
|----------|-------|
| Cortisol salivaire (profil diurne) | Non standard en France (spécialisé) |
| DHEA-S | Marqueur surrénalien |
| HRV (VFC) | Capteur, pas un marqueur labo |
| Melatonine | Spécialisé |

---

## Synthèse — Couverture FC du NIBLETS

| Axe | Statut | Biomarqueurs | Leviers | Score |
|-----|--------|-------------|---------|-------|
| **N** — Nutrients | 🟢 Complet | 47 | 84 | 95% |
| **I** — Inflammation | 🟢 Complet | 14 | — | 90% |
| **B** — Biochemical | 🟡 Partiel | 0 (27 soft) | — | 60% |
| **L** — Lifestyle | 🟢 Bon | — | 86 | 80% |
| **E** — Energy | 🟡 Partiel | 5 | — | 50% |
| **T** — Toxic | 🟢 Ajouté | 8 | — | 70% |
| **S** — Stress/Sleep | 🟢 Bon | — | 2 | 75% |

**Total : 70 biomarqueurs · 86 leviers · 7/7 axes couverts**
