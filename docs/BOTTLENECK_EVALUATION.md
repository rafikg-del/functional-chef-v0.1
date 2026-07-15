# Évaluation des 3 bottlenecks — Functional Chef v0.2

> **Document** : Audit scientifique des bottlenecks pilotes
> **Date** : 14 juillet 2026
> **Version** : 1.0

---

## Table des matières
1. [IR — Insulinorésistance fonctionnelle](#1-ir--insulinorésistance-fonctionnelle)
2. [INFLAM — Inflammaging](#2-inflam--inflammaging)
3. [DYSBIOSE — Dysbiose intestinale](#3-dysbiose--dysbiose-intestinale)
4. [Architecture de classification](#4-architecture-de-classification)
5. [Problèmes transversaux](#5-problèmes-transversaux)
6. [Gaps et recommandations](#6-gaps-et-recommandations)

---

## 1. IR — Insulinorésistance fonctionnelle

### Note : 8.5/10 — Bien étayé, quelques ajustements

| Dimension | Évaluation |
|-----------|-----------|
| **Pertinence clinique** | ✅ IR fonctionnelle (HOMA-IR 1.5-2.5) est la zone aveugle de la médecine conventionnelle — créneau parfait |
| **Seuils** | ✅ Basés sur des valeurs cliniques reconnues |
| **Règle de classification** | ✅ ≥3 majors OU ≥2 majors + ≥3 modérés — adéquate |
| **Biomarqueurs** | ✅ 11 biomarqueurs, couverture large |
| **Phénotype MASLD** | ✅ Enrichissement Truong 2025 bien intégré |

### Points forts
- La zone HOMA-IR 1.5-2.5 cible la population à risque maximal d'évolution vers le DT2 sans être encore diabétique — c'est là que la nutrition a son rendement maximal
- Le phénotype hépatique (MASLD) est correctement subordonné à IR (pas un bottleneck séparé), avec imagerie requise (PDFF ≥5% ou MRS >5.56%)
- ALT >25 comme alerte NAFLD silencieuse est cliniquement pertinent (les labos français mettent souvent la normale à 40, mais les données récentes disent >25)

### Faiblesses
| Problème | Gravité | Suggestion |
|----------|---------|------------|
| **HBA1C seuil** : `alert_threshold_high: 5.4` déclenché à `>5.4`. Un patient à 5.5% n'est pas IR mais prédiabétique. HBA1C ≥5.7% = prédiabète ADA. Le seuil 5.4 est trop bas — il capte trop de monde sans IR réelle. | 🟡 Modéré | Mettre le seuil à 5.7% pour HBA1C en alerte IR, garder 5.4-5.6 comme « zone grise » en commentaire |
| **ACIDE_URIQUE** : Seuil d'alerte à 6 mg/dL pour H/F. Mais les normes diffèrent par sexe : H <7.0, F <5.7 mg/dL. Un seuil unique à 6 est trop bas pour les hommes. | 🟢 Léger | Mettre 6.5 pour H, 5.5 pour F (via deux entrées seuils différentes) |
| **APO_B** : Présent dans la spec mais pas dans le classifier en test. ApoB >1.0 g/L = athérogène. C'est un bon marqueur qui manque dans les cas de test. | 🟢 Léger | Ajouter aux fixtures de test |
| **CGM_SD** (discriminant) : Marqueur utile mais rarement disponible en pratique clinique courante (coût des CGM). Peu de patients auront cette donnée. | 🟢 Léger | C'est un discriminant, son absence ne bloque pas — correct |
| **OMEGA3_INDEX** : N'est pas dans les biomarqueurs IR alors que l'IR est associée à une ↓ de Δ5/Δ6 désaturases (↓ conversion ALA→EPA). Pourrait être un marqueur modéré. | 🟢 Léger | Optionnel — peut être ajouté en v0.3 |

### Seuils spécifiques à revoir

| Biomarqueur | Seuil actuel | Seuil recommandé | Justification |
|-------------|-------------|-------------------|---------------|
| HBA1C | >5.4% | **>5.7%** | 5.7% = seuil ADA prédiabète. 5.4% n'est pas cliniquement standard |
| FASTING_GLUCOSE | >0.95 g/L | **>1.00 g/L** | 0.95-0.99 = normal physiologique. 1.00-1.10 = zone grise |
| ACIDE_URIQUE | >6.0 mg/dL | **H>6.5 / F>5.5 mg/dL** | Normes différenciées par sexe |

---

## 2. INFLAM — Inflammaging

### Note : 7.5/10 — Bon, mais règle de classification trop stricte

| Dimension | Évaluation |
|-----------|-----------|
| **Pertinence clinique** | ✅ Concept validé (Franceschi 2000). CRP-us 1-3 mg/L = zone parfaite |
| **Seuils** | ✅ CRP ≥1 mg/L persistant (2 dosages à 4 sem) — bonne pratique |
| **Règle de classification** | ⚠️ CRP breach + ≥2 majors total — **trop stricte** |
| **Biomarqueurs** | ✅ 11 biomarqueurs, bonne couverture |
| **Marqueurs avancés** | ✅ IL-6 et DEXA comme optionnels (discriminant) |

### Problème critique : la règle INFLAM est trop stricte

La règle actuelle : `CRP_US breach AND major_hits >= 2`

Cela signifie : CRP >1 **ET** au moins 2 marqueurs majeurs (CRP compte pour 1).

**Problème** : Un patient avec CRP à 2.5 mg/L + OmegaIndex à 5.5% = exactement 2 majors → déclenché ✅.

Mais un patient avec CRP à 2.0 mg/L + AA/EPA à 15 + OmegaIndex à 7.5% (juste <8) + ferritine à 350 = CRP(1 major) + AA/EPA(1 major) = 2 majors → déclenché ✅.

Mais un patient avec CRP à 3.0 mg/L + NLR à 3.0 + fibrinogène à 4.5 + HDL bas = CRP 1 major + 3 moderates → **NON déclenché** ❌ (besoin de ≥2 majors).

Pourtant, ce patient a clairement un profil inflammatoire. La règle devrait inclure une alternative.

| Règle actuelle | Règle proposée |
|---------------|----------------|
| CRP breach + ≥2 majors | CRP breach + (≥2 majors **OU** ≥3 moderates **OU** ≥1 major + ≥2 moderates) |

### Seuils à revoir

| Biomarqueur | Seuil actuel | Problème | Suggestion |
|-------------|-------------|----------|------------|
| **FERRITIN** | >300 µg/L (moderate) | Seuil unique H/F correct pour l'inflammation, mais attention : ferritine élevée peut être carence martiale masquée (syndrome inflammatoire). Sans TSAT, difficile. | Ajouter note : « Interpréter avec TSAT. Si TSAT <20%, ferritine est un réactant de phase aiguë, pas un marqueur de fer » |
| **OMEGA_INDEX** | <6% (major) | Correct. Cible >8%, alerte <6% — aligné sur Harris 2017 | ✅ |
| **AA_EPA_RATIO** | >7 (major) | Correct. Cible <3. Alerte >7-10 | ✅ |
| **ALBUMIN** | <40 g/L (moderate) | Correct. Cible >42. Baisse = inflammation chronique ou dénutrition | ✅ |

### Points forts
- IL-6 comme major optionnel : bonne prévoyance pour les bilans avancés
- DEXA visceral fat comme discriminant : pertinent (tissu adipeux viscéral = source IL-6, TNF-α)
- Le concept de CRP persistante (2 dosages à 4 sem) est médicalement responsable

---

## 3. DYSBIOSE — Dysbiose intestinale

### Note : 7/10 — Correct mais le plus fragile des 3

| Dimension | Évaluation |
|-----------|-----------|
| **Pertinence clinique** | ✅ Concept validé, leviers culinaires directs |
| **Seuils** | ⚠️ Plus subjectifs que les autres bottlenecks (symptômes) |
| **Règle de classification** | ✅ ≥2 majors cliniques + ≥1 moderate historique |
| **Biomarqueurs** | ⚠️ 9 entrées, mais 3 sont des signaux cliniques subjectifs |
| **Marqueurs objectifs** | 🔶 Calprotectine et Shannon diversity OK, mais rares en pratique |

### Problème #1 : Subjectivité des critères cliniques

Les 3 critères majeurs de la dysbiose sont cliniques (subjectifs) :
- **Bristol** : auto-déclaré par le patient
- **Ballonnements** : subjectif (« quotidien » = alerte)
- **Calprotectine** : objectif, mais coût ≈ 40 €, pas fait systématiquement

Problème : un patient anxieux avec syndrome de l'intestin irritable peut déclarer Bristol 6 et ballonnements quotidiens sans vraie dysbiose (test SIBO négatif, calprotectine normale). Le classifier le marquerait DYSBIOSE déclenché.

| Solution proposée | Impact |
|------------------|--------|
| Si BRISTOL et BLOATING sont les seuls 2 majors, vérifier qu'au moins 1 critère objectif est présent (CALPROTECTIN ou SIBO ou SHANNON) | ↓ faux positifs |

### Problème #2 : Seuil Bristol trop strict

Le Bristol score a `alert_threshold_low: 3, alert_threshold_high: 5`. Le classifier lit : `if value <3 OR value >5 → breach`.

- Bristol 1-2 = constipation → breach ✅
- Bristol 6-7 = diarrhée → breach ✅
- Bristol 3-5 = normal → pas de breach ✅

Cependant, un Bristol 5 ponctuel n'est pas pathologique. La spec dit « chronique ≥3 mois » mais le classifier ne peut pas vérifier la chronicité (pas de champ « durée »).

### Problème #3 : Calprotectine seuil

Seuil d'alerte à 50 µg/g. C'est le seuil standard (normale <50). Mais :
- En pratique, beaucoup de laboratoires mettent la normale à <50 pour le test ELISA
- Une calprotectine à 55 peut être une fluctuation sans inflammation réelle
- La spécificité est modérée (faux positifs avec AINS, IPP)

| Suggestion | Justification |
|------------|---------------|
| Monter le seuil à **100 µg/g** pour le poids « major » | Meilleure spécificité. Entre 50-100 = zone grise à pondérer en modéré |

### Problème #4 : ABX_LIFETIME comme modéré

Le nombre de cures d'antibiotiques dans la vie est un proxy pertinent (↑ dysbiose si >3 cures). Cependant :
- La mémoire du patient est souvent imprécise (« combien de fois dans votre vie ? »)
- 3 cures en 50 ans n'est pas la même chose que 3 cures en 2 ans

| Suggestion | Justification |
|------------|---------------|
| Ajouter un champ `ABX_INTENSITY` : nombre de cures dans les 5 dernières années | Plus prédictif de l'état actuel |

### Forces de DYSBIOSE
- Intègre le test SIBO (catégoriel) — rare dans les outils concurrents
- Le Shannon diversity comme discriminant — visionnaire même si rarement disponible
- Les facteurs historiques (IPP, ABX) sont pertinents

---

## 4. Architecture de classification

### Note : 8/10 — Bonne architecture, 3 problèmes identifiés

### Problème #1 : La cascade causale IR > INFLAM > DYSBIOSE n'est pas une règle clinique validée

La spec affirme : en cas de triple co-dominance, on priorise IR > INFLAM > DYSBIOSE parce que l'IR est la cause « amont ».

**Réalité clinique** :
- IR → inflammation : vrai (via AGE/RAGE, stress du RE, lipotoxicité)
- Inflammation → dysbiose : vrai (via ↑ perméabilité, ↑ cytokines)
- MAIS : dysbiose → inflammation (via LPS, flagelline) et dysbiose → IR (via SCFA, bile acids)

La relation est **bidirectionnelle**, pas linéaire. Prioriser IR en premier est un choix de design défendable, mais ce n'est pas une vérité clinique.

| Impact | Suggestion |
|--------|------------|
| 🟡 Modéré | Documenter dans la spec : « La cascade prioritaire est un postulat de design, pas une règle clinique validée. En pratique, les 3 bottlenecks sont interconnectés ; l'ordre reflète une hypothèse causale amont→aval. » |

### Problème #2 : Pas de pondération de sévérité

Le classifier ne pondère pas l'intensité du dépassement :
- HOMA-IR à 1.6 et HOMA-IR à 3.5 contribuent tous deux 1 major (3 points)
- CRP à 1.1 et CRP à 8.0 contribuent tous deux 3 points

| Impact | Suggestion |
|--------|------------|
| 🔴 Élevé (faux négatifs pour cas sévères) | Ajouter un multiplicateur de sévérité : `(valeur / seuil) × points`. Ex : HOMA-IR 3.5 / 1.5 × 3 = 7 points. HOMA-IR 1.6 / 1.5 × 3 = 3.2 points. À implémenter en v0.3. |

### Problème #3 : Pas de gestion des données manquantes

Le classifier ignore les biomarqueurs non renseignés (c'est correct). Mais :
- Un profil avec 1 seul biomarqueur (HOMA-IR à 2.5) ne déclenche aucun bottleneck (règle IR : ≥3 majors)
- Un médecin pourrait conclure « pas d'IR » à tort

| Impact | Suggestion |
|--------|------------|
| 🟢 Léger | Ajouter dans le message de sortie « baseline » : « Profil incomplet — X biomarqueurs renseignés sur Y requis pour IR, Z pour INFLAM. » |

---

## 5. Problèmes transversaux

### 5.1 — Chevauchement des biomarqueurs entre bottlenecks

| Biomarqueur | IR | INFLAM | DYSBIOSE | Problème |
|-------------|-----|--------|----------|----------|
| HBA1C | Major | Moderate | — | Correct : HBA1C >5.6% aggrave l'inflammaging |
| CRP_US | — | Major | — | Spécifique INFLAM — ✅ |
| HOMA_IR | Major | — | — | Spécifique IR — ✅ |
| BRISTOL | — | — | Major | Spécifique DYSBIOSE — ✅ |
| **FRUCTOSE_INTAKE** | Moderate (IR MASLD) | — | — | Devrait aussi être dans DYSBIOSE (excès fructose → dysbiose) |
| **PLANT_DIVERSITY** | — | — | Moderate | Devrait aussi être dans INFLAM (diversité ↑ polyphénols) — déjà fait via L_PLANT_DIVERSITY comme levier |

### 5.2 — Pas de bottleneck combinatoire

Les syndromes complexes impliquent souvent 2+ bottlenecks simultanément. Le moteur gère la co-dominance (1 dominant + 1 co-dominant), mais :
- Un patient avec IR + INFLAM reçoit des leviers IR dominants + INFLAM co-dominants
- Il n'y a pas de règle d'interaction (ex : IR + INFLAM → certains leviers sont prioritaires car ils servent les deux)

| Impact | Suggestion |
|--------|------------|
| 🟡 Modéré | Le lever-selector choisit déjà des leviers étoile qui servent ≥2 bottlenecks — c'est une mitigation partielle. Pour v0.3, ajouter des règles d'interaction |

### 5.3 — Pas de versionning des règles

Si on modifie les seuils (ex : HBA1C de 5.4 → 5.7), les consultations passées ne sont pas recalculées. La colonne `consultations.engine_version` existe mais n'est pas utilisée.

| Impact | Suggestion |
|--------|------------|
| 🟡 Modéré | Tagguer chaque consultation avec la version du moteur. Ajouter un champ `classifier_version` + `thresholds_hash` |

---

## 6. Gaps et recommandations

### 🔴 À corriger en priorité

| # | Problème | Correctif | Effort |
|---|----------|-----------|--------|
| 1 | **Règle INFLAM trop stricte** | Ajouter alternative : ≥2 majors OU ≥3 moderates OU ≥1 major + ≥2 moderates | ⚡ 15 min (code) |
| 2 | **Seuil HBA1C à 5.4% trop bas** | Passer à 5.7% (aligné ADA) | ⚡ 5 min (seed) |
| 3 | **Pas de pondération sévérité** | Multiplicateur (valeur/seuil) × points | 🕐 2-3h (code + tests) |
| 4 | **Cascade causale non documentée comme postulat** | Ajouter note dans la spec | ⚡ 5 min (doc) |

### 🟡 À corriger en v0.3

| # | Problème | Correctif | Effort |
|---|----------|-----------|--------|
| 5 | **Seuil acide urique non sexe-spécifique** | H>6.5, F>5.5 | ⚡ 15 min (seed) |
| 6 | **Calprotectine seuil à 50 µg/g trop bas** | Monter à 100 µg/g pour major, 50-100 = modéré | ⚡ 10 min (seed + code) |
| 7 | **Dysbiose : pas de garde-fou subjectivité** | Si seuls Bristol + Bloating = majors, requérir ≥1 objectif | 🕐 1h (code + tests) |
| 8 | **Fructose intake devrait être dans DYSBIOSE** | Ajouter threshold DYSBIOSE ↔ FRUCTOSE_INTAKE | ⚡ 10 min (seed) |
| 9 | **FRUCTOSE_INTAKE et FREE_SUGAR aussi dans INFLAM** | Sucres → glycation → inflammation | ⚡ 10 min (seed) |

### 🟢 Nice-to-have

| # | Suggestion | Justification |
|---|-----------|---------------|
| 10 | Ajouter biomarqueur « CRP:IL-6 ratio » si les deux sont renseignés | Discriminant pour origine inflammation vs infection |
| 11 | Ajouter « AGE score » (scoring alimentaire AGEs) pour INFLAM | Proxy inflammatoire alimentaire |
| 12 | Ajouter « TMAO » comme discriminant INFLAM | Marqueur risque CV + inflammation intestinale |
| 13 | Permettre le poids « overriding » : si CRP >10, déclencher INFLAM même sans autre major | Sévérité aiguë |

---

## Verdict

| Bottleneck | Note | Forces | Faiblesses |
|-----------|------|--------|------------|
| **IR** | 8.5/10 | Seuils cliniques, zone grise, phénotype MASLD | HBA1C trop bas, acide urique non sexe-spécifique |
| **INFLAM** | 7.5/10 | CRP persistante, IL-6, DEXA | Règle trop stricte (≥2 majors obligatoire) |
| **DYSBIOSE** | 7.0/10 | SIBO catégoriel, Shannon diversity | Subjectif, calprotectine seuil bas, pas de garde-fou |
| **Architecture** | 8.0/10 | Code propre, tests, traçabilité | Pas de pondération sévérité, cascade causale non documentée |
| **Globale** | **7.7/10** | | |

### Recommandation immédiate

Les 3 correctifs rapides (15 min total) à faire avant tout :

1. **Seuil HBA1C** : 5.4 → **5.7** ✅
2. **Règle INFLAM** : ajouter alternative modérés ✅
3. **Documenter cascade causale** comme postulat ✅

Tu veux que je les applique ?
