# LIV-26 — Rapport de concordance moteur vs clinicien

> **Statut : BROUILLON** — non signé, non opposable, hors claim de performance.
> **Livrable** : LIV-26 (draft) — confrontation cas par cas du classifier Functional Chef et des labels clinicien du pack LIV-25
> **Date du run** : 2026-09-07 (UTC)
> **Protocole** : LIV-24 v0.1 — [`docs/CLINICAL_VALIDATION_PROTOCOL.md`](../../CLINICAL_VALIDATION_PROTOCOL.md)
> **Pack d'entrée** : [`docs/validation/liv25/`](./) (LIV-25 **partiel**)
> **Classification** : Interne. Aucune PHI.

---

## Encadré — lire avant tout chiffre

**Ceci est un brouillon.** Il ne clôture pas LIV-26. Il ne constitue pas une validation clinique. Le Comité scientifique (CS) n'a pas approuvé LIV-24 (R1 ouvert) et n'a pas signé ce rapport (R7 ouvert).

Les fixtures synthétiques (`patient-profiles.ts`, cas-pivot A/B/C, `scripts/test-validation-cases.ts`) sont **exclus** du numérateur et du dénominateur (LIV-24 §4). Seuls les 10 JSON `ZOI-VAL-01` … `ZOI-VAL-10` sont analysés.

Disclaimer LIV-24 §15.2 :

> Functional Chef est un logiciel d'**aide à la décision** à usage professionnel. La présente évaluation mesure l'accord entre une sortie algorithmique et un jugement clinicien sur un échantillon de convenance de 10 dossiers anonymisés. Elle **ne constitue pas** une démonstration d'efficacité thérapeutique, d'exactitude diagnostique, ni une étude clinique de dispositif médical destinée à un marquage CE. Aucun résultat ne doit être présenté comme une validation médicale définitive. Le praticien reste seul responsable des décisions transmises au patient.

**Interdit** tant que ce brouillon n'est pas signé CS : communication chiffrée du type « 70 % de concordance » ou « validé cliniquement » (LIV-24 §15.5).

---

## 1. Méthode

### 1.1 Gel moteur (freeze)

| Élément | Valeur enregistrée |
|---------|-------------------|
| Commit de référence (pack LIV-25 + classifier + seeds, `origin/main`) | `f8d0acc03ae69eb61758c5de6dd86dbd9d478eea` (merge PR #14, 2026-09-07) |
| Classifier | `src/lib/reasoning/bottleneck-classifier.ts` — **aucun seuil ni règle modifié pour ce run** |
| Matrice de seuils | `supabase/seed/03_biomarker_thresholds.sql` — 71 lignes parsées (hors ligne, sans Supabase) |
| Catalogue leviers / HARD_RULES | Non scorés dans ce brouillon (S2 / S3 hors périmètre du run) |
| Environnement | Node ≥20, `tsx`, date/heure UTC du run ci-dessus |
| Commande reproductible | `npm run liv25:concordance` (`scripts/run-liv25-concordance.ts`) |

Le run injecte chaque JSON dans `classifyBottlenecks` (même fonction que `/api/classify` et la CI). Pas de recopie manuelle des scores. Pas de mock.

### 1.2 Labels clinicien

Les labels **ne sont pas inventés**. Ils sont lus tels quels dans les JSON du pack :

- `clinician_dominant` / `clinician_co_dominant` (et, en repli, `clinician_judgment.dominant` / `co_dominant`)
- Valeurs ∈ {`IR`, `INFLAM`, `DYSBIOSE`, `none`} ; `null` côté co-dominant = absence

Origine pack : préambule officiel du tarball LIV-25, repris dans `manifest.json` → `clinician_dominant_by_case`.

### 1.3 Critère principal (LIV-24 §10.1)

Accord **exact** sur le bottleneck dominant :

`engine.dominant == clinician.dominant`

avec `null` moteur normalisé en `none`.

Dénominateur : 10 cas analysables (jugement présent + run sans erreur). Aucune exclusion post-hoc pour désaccord.

### 1.4 Critère secondaire S1 (descriptif)

Accord sur le co-dominant : présence/absence **et** identité. `null` traité comme `none`.

S2 (leviers) et S3 (filtres sécurité) **non évalués** ici : pas de run `lever-selector` / `safety-filters`, pas de scoring clinicien après révélation.

### 1.5 Alias de clés (non appliqué au run principal)

Le pack et LIV-24 §8.2 utilisent `OMEGA3_INDEX`. Le seed production utilise `OMEGA_INDEX`. Le run principal **n'alias pas** : l'index oméga du pack n'est pas évalué. Une analyse de sensibilité `--alias-omega` ne change **aucun** dominant sur ces 10 cas (C1 inchangé à 7/10).

---

## 2. Résultats cas par cas

Légende match : **Y** = dominant identique ; **N** = désaccord. Codes de désaccord : LIV-24 §13.3.

| case_id | Clinicien dominant | Moteur dominant | Match | Notes |
|---------|--------------------|-----------------|-------|-------|
| ZOI-VAL-01 | INFLAM | INFLAM | **Y** | Co-dom. clinicien DYSBIOSE vs moteur `null` (socle digestif absent : pas de Bristol / ballonnements / calprotectine / SIBO). INFLAM déclenché (CRP-us 1,29 + AA/EPA). Phénotype moteur `functional_iron_blockade` (TSAT 14 %). Flag unités : HOMA saisi 0,55 vs ~0,64 depuis insuline×glucose. |
| ZOI-VAL-02 | DYSBIOSE | none | **N** | `DISC-MISSING` + `DISC-SUBJECTIVE`. Pack : `data_completeness.DYSBIOSE=false` ; aucun signal digestif chiffré. Soft signals (flatulences) n'entrent pas dans la règle DYSBIOSE. `OMEGA3_INDEX` non mappé vers `OMEGA_INDEX`. |
| ZOI-VAL-03 | INFLAM | IR | **N** | `DISC-CASCADE` + `DISC-THRESHOLD`. Double déclenchement IR+INFLAM ; scores 13 vs 8 → dominant IR, co-dominant INFLAM. IR via HOMA 1,55 + HbA1c 5,6 (seuil seed >5,4 %) + TG/HDL. Clinicien : INFLAM seul. `OMEGA3_INDEX` 5,63 non évalué. Socle DYSBIOSE incomplet (seulement `PLANT_DIVERSITY=0`). Épreuve sécurité attendue : `documented_atherosclerosis` (S3 non scoré). |
| ZOI-VAL-04 | INFLAM | INFLAM | **Y** | Co-dom. clinicien DYSBIOSE vs moteur `null` (socle digestif absent). CRP-us 9,41 + AA/EPA. Flag unités HOMA 0,34 vs ~0,40. `OMEGA3_INDEX` non mappé. Épreuve sécurité : `unexplained_crp_marked` (S3 non scoré). |
| ZOI-VAL-05 | none | none | **Y** | Conservateur : HOMA 1,59 + HbA1c 5,6 = 2 majeurs IR seulement (règle ≥3 majeurs ou 2+3 modérés non atteinte). CRP-us 2,31 sans 2ᵉ majeur INFLAM. Épreuve : `liver_elastography_discordance` (S3 non scoré). |
| ZOI-VAL-06 | none | none | **Y** | AA/EPA élevé sans CRP-us franchi → INFLAM non déclenché. `OMEGA3_INDEX` non mappé. Épreuve : `documented_atherosclerosis` (S3 non scoré). |
| ZOI-VAL-07 | none | none | **Y** | Un majeur IR (TG/HDL). Flag unités HOMA 1,28 vs ~1,50. |
| ZOI-VAL-08 | IR | IR | **Y** | 3 majeurs IR (HOMA, HbA1c, TG/HDL) + 4 modérés. Flag unités HOMA 1,74 vs ~2,04. `OMEGA3_INDEX` non mappé (CRP-us bas : INFLAM non en jeu). |
| ZOI-VAL-09 | IR | IR | **Y** | Phénotype `hepatic_masld` (PDFF 10,56 %). Co-dom. clinicien INFLAM vs moteur `null` : **pas de CRP-us** dans le JSON (`DISC-MISSING`). Flag unités HOMA 3,21 vs ~3,75. Épreuve : `chronic_HBV_untreated` (S3 non scoré). |
| ZOI-VAL-10 | IR | INFLAM | **N** | `DISC-MISSING` (signaux `GLP1_ACTIVE` / `POST_BARIATRIC` hors classifier). HOMA 0,63 / insuline 4,17 sous GLP-1 : seulement 2 majeurs IR (TG/HDL, PDFF) → IR non déclenché. INFLAM déclenché (CRP-us 11,14 + AA/EPA). Clinicien : IR dominant, INFLAM co-dominant. Flag unités HOMA 0,63 vs ~0,74. Épreuve : post-bariatrique / GLP-1 / CRP marquée (S3 non scoré). |

### Co-dominant (S1, descriptif)

| case_id | Clinicien co-dominant | Moteur co-dominant | Accord S1 |
|---------|----------------------|--------------------|-----------|
| ZOI-VAL-01 | DYSBIOSE | null | N |
| ZOI-VAL-02 | null | null | Y |
| ZOI-VAL-03 | null | INFLAM | N |
| ZOI-VAL-04 | DYSBIOSE | null | N |
| ZOI-VAL-05 | null | null | Y |
| ZOI-VAL-06 | null | null | Y |
| ZOI-VAL-07 | null | null | Y |
| ZOI-VAL-08 | null | null | Y |
| ZOI-VAL-09 | INFLAM | null | N |
| ZOI-VAL-10 | INFLAM | null | N |

S2 / S3 : **non renseignés** (leviers et filtres non runés ; pas de notes clinicien post-révélation). Commentaire CS : *à renseigner*.

---

## 3. Synthèse transversale

### 3.1 Critère principal

**Concordance du dominant (exacte) : 7 / 10 = 70 %.**

Cible directionnelle C1 (LIV-24 §14.2) : ≥ 80 % (soit ≥ 8/10). **Non atteinte** sur ce brouillon.

Intervalle de Wilson 95 % (indicatif, n=10, **très large**) : environ 40 % – 89 %. Ne pas interpréter comme une accuracy de population.

### 3.2 Matrice 4 × 4 (lignes = clinicien, colonnes = moteur)

| Clinicien \\ Moteur | IR | INFLAM | DYSBIOSE | none |
|---------------------|----|--------|----------|------|
| IR | 2 | 1 | 0 | 0 |
| INFLAM | 1 | 2 | 0 | 0 |
| DYSBIOSE | 0 | 0 | 0 | 1 |
| none | 0 | 0 | 0 | 3 |

S1 co-dominant : **5 / 10**.

### 3.3 Désaccords du dominant

| Cas | Code(s) | Lecture courte |
|-----|---------|----------------|
| ZOI-VAL-02 | `DISC-MISSING`, `DISC-SUBJECTIVE` | Dominant digestif clinicien sans biomarqueurs/signaux DYSBIOSE saisissables par le moteur |
| ZOI-VAL-03 | `DISC-CASCADE`, `DISC-THRESHOLD` | IR et INFLAM déclenchés ; cascade/score IR > INFLAM. HbA1c seed >5,4 % (audit `BOTTLENECK_EVALUATION.md`) |
| ZOI-VAL-10 | `DISC-MISSING` | IR clinique sous GLP-1 / post-bariatrique : HOMA écrasé, flags hors moteur ; INFLAM biologique franc |

Les seuils **n'ont pas été ajustés** pour améliorer C1.

---

## 4. Limites et caveats (brouillon)

1. **Pack LIV-25 partiel** — stratum DYSBIOSE dominant **1/3 NON ATTEINT** (seul ZOI-VAL-02). LIV-24 §7.2 : ne pas compléter avec des fixtures synthétiques. R3 (stratification) non satisfait tant que le CS n'accepte pas l'écart.
2. **LIV-24 non approuvé CS** — R1 ouvert. Le protocole lui-même interdit l'extraction/run clinique avant signature ; ce brouillon est un run technique sur un pack déjà versé, pas une clôture d'étude.
3. **Pas de signature CS** — R7 ouvert. Aucun feu vert « validation clinique réussie ».
4. **Unités insuline / HOMA** — notes d'extraction : pmol/L ÷ 6 → `FASTING_INSULIN` en µU/mL. Sur 6 cas avec insuline+glucose+HOMA, le HOMA saisi est ~15 % plus bas que HOMA recalculé (insuline µU/mL × glucose g/L). Compatible avec un HOMA labo en facteur 6,945 vs conversion pack ÷6. **Les valeurs JSON n'ont pas été corrigées.** Le classifier les consomme telles quelles.
5. **Clé oméga** — `OMEGA3_INDEX` (pack / LIV-24) vs `OMEGA_INDEX` (seed). Run principal : non évalué. Sensibilité `--alias-omega` : C1 inchangé.
6. **Seed SQL** — certains tuples du 3ᵉ `INSERT` (9 colonnes) omettent `alert_categorical_value` (8 valeurs). Le script réeligne ; **le fichier seed n'a pas été modifié**.
7. **Socle DYSBIOSE** — Bristol / calprotectine / SIBO souvent absents (pas d'imputation, LIV-25 EXTRACTION_NOTES). Soft signals ≠ règle de déclenchement.
8. **Pas de CS signature sur les labels** — labels issus du mapping tarball ; tarball gzip tronqué à l'ingestion (reconstruction honest broker).
9. **S2/S3 absents** — R6 (aucun faux négatif sécurité) **non démontré** par ce brouillon.
10. **n=10, pas de suivi, gold standard unique** — limitations LIV-24 §13.4. n n'est pas dimensionné pour une puissance fréquentielle.

---

## 5. Recevabilité LIV-24 §14 (auto-évaluation brouillon)

| ID | Critère | Constat brouillon |
|----|---------|-------------------|
| R1 | Protocole approuvé CS avant extraction | **Non** |
| R2 | n analysable = 10 ou écart CS | 10 JSON runés ; pack déclaré partiel |
| R3 | Stratification obligatoire ou écart CS | **DYSBIOSE 1/3 NON ATTEINT** |
| R4 | Aucune PHI dans LIV-25/26 | Contrôle pack inchangé ; ce rapport sans identifiant |
| R5 | Aveugle et locks documentés | Run technique après versement des labels dans le JSON (aveugle historique non rejoué) |
| R6 | Aucun FN sécurité S3 | **Non évalué** |
| R7 | LIV-26/27 signés CS | **Non** — présent document = brouillon |
| C1 | Concordance dominant ≥ 80 % | **70 % (7/10) — cible non atteinte** |
| C2 | Leviers pertinents ≥ 70 % | Non évalué |
| C3 / R6 | S3-FN = 0 | Non évalué |

**Décision CS :** *non rendue — document non soumis à signature.*

---

## 6. Reproductibilité

```bash
npm run liv25:concordance
# JSON machine-lisible :
npx tsx scripts/run-liv25-concordance.ts --json
# Sensibilité clé oméga (n'entre pas dans C1 ci-dessus) :
npx tsx scripts/run-liv25-concordance.ts --alias-omega
```

Les champs moteur ne sont **pas** écrits dans les JSON cas (lock dataset LIV-25). Un résumé est dans `manifest.json` → `liv26_draft`.

---

## 7. Suite proposée (hors ce brouillon)

- Compléter LIV-25 : ≥2 cas réels à dominant DYSBIOSE (socle §6.1), sans fixture.
- Trancher `OMEGA3_INDEX` vs `OMEGA_INDEX` (contrat d'interface, pas un changement de seuil « pour C1 »).
- Documenter la convention insuline (÷6 vs 6,945) et la cohérence HOMA.
- Run S2/S3 après lock, sans modifier les dominants.
- LIV-27 (sensibilité / spécificité / VPP / VPN descriptifs) **après** signature de méthode CS — pas dans ce fichier.
- Ne pas toucher aux seuils avant clôture du set n=10 (LIV-24 §13.5 / §3.3).

---

*Fin du brouillon LIV-26. Aucune PHI. Aucune signature CS.*
