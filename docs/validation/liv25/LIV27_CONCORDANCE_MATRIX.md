# LIV-27 — Matrice de concordance descriptive (dominant exact)

> **Livrable** : LIV-27 — sensibilité / spécificité / VPP / VPN par bottleneck dominant  
> **Protocole** : [`docs/CLINICAL_VALIDATION_PROTOCOL.md`](../../CLINICAL_VALIDATION_PROTOCOL.md) §7.1, §13.2, §15.2 (LIV-24 v0.1)  
> **Pack** : LIV-25 — [`docs/validation/liv25/`](./) (n=10 JSON anonymisés)  
> **Investigation cas** : [`LIV26_NOTE.md`](LIV26_NOTE.md)  
> **Statut** : **brouillon descriptif, non signé CS**. Hors claim de performance.  
> **Cible C1 (80 %)** : **non poursuivie** à ce stade — le CS a accepté **~70 %** en attendant des dossiers DYSBIOSE supplémentaires.

---

## Disclaimer (LIV-24 §15.2)

> Functional Chef est un logiciel d'**aide à la décision** à usage professionnel. La présente évaluation mesure l'accord entre une sortie algorithmique et un jugement clinicien sur un échantillon de convenance de 10 dossiers anonymisés. Elle **ne constitue pas** une démonstration d'efficacité thérapeutique, d'exactitude diagnostique, ni une étude clinique de dispositif médical destinée à un marquage CE. Aucun résultat ne doit être présenté comme une validation médicale définitive. Le praticien reste seul responsable des décisions transmises au patient.

---

## 1. Périmètre et limites

| Point | Lecture |
|-------|---------|
| n | **10** cas analysables (`ZOI-VAL-01` … `ZOI-VAL-10`). Effectif de **faisabilité**, non dimensionné (LIV-24 §7.1). |
| Référence | Jugement clinicien verrouillé dans le pack (`clinician_dominant`). Pas une vérité physiopathologique indépendante. |
| Endpoint | Concordance **exacte du dominant** : `engine.dominant == clinician.dominant` ∈ {IR, INFLAM, DYSBIOSE, none}. |
| Indicateurs | Sensibilité, spécificité, VPP, VPN **descriptifs** (binarisation one-vs-rest par classe). Cellule **non définie** si le dénominateur vaut 0. |
| IC | Wilson 95 % **uniquement** sur la concordance globale 7/10 — intervalle **large**, indicatif. Pas d'IC par classe. |
| Pack | **LIV-25 partiel** : stratum DYSBIOSE dominant **1/3 (NON ATTEINT)**. On n'invente **pas** de cas. |
| Protocole | LIV-24 **brouillon**, en attente d'approbation CS. |
| Hors-périmètre | Étude de performance CE / MDR Art. 62 ; fixtures synthétiques (`patient-profiles.ts`) ; ajustement de seuils pour gonfler C1. |
| PHI | Aucune (identifiants `ZOI-VAL-xx` uniquement). |

Les fixtures synthétiques sont **exclues** du numérateur et du dénominateur (LIV-24 §4).

---

## 2. Run gelé

```bash
npm run liv25:concordance
npx tsx scripts/run-liv25-concordance.ts --json
```

| Champ | Valeur |
|-------|--------|
| SHA moteur (main après PR #16) | `7cf9734` |
| Classifier | `src/lib/reasoning/bottleneck-classifier.ts` |
| Seuils | `supabase/seed/03_biomarker_thresholds.sql` (72 lignes parsées) |
| Script | `scripts/run-liv25-concordance.ts` |
| Dataset | JSON LIV-25 **non réécrits** (lock pack) |

Les champs moteur ne sont pas stockés dans les JSON cas.

---

## 3. Labels cas par cas (clinicien vs moteur)

| case_id | Clinicien dominant | Moteur dominant | Match | Clinicien co-dom. | Moteur co-dom. | Verdict LIV-26 |
|---------|--------------------|-----------------|-------|-------------------|----------------|----------------|
| ZOI-VAL-01 | INFLAM | INFLAM | oui | DYSBIOSE | null | — |
| ZOI-VAL-02 | DYSBIOSE | none | non | null | null | **needs more data** (`DISC-MISSING`) |
| ZOI-VAL-03 | INFLAM | IR | non | null | INFLAM | **accepted** cascade (`DISC-CASCADE`) |
| ZOI-VAL-04 | INFLAM | INFLAM | oui | DYSBIOSE | null | — |
| ZOI-VAL-05 | none | none | oui | null | null | — |
| ZOI-VAL-06 | none | none | oui | null | null | — |
| ZOI-VAL-07 | none | none | oui | null | null | — |
| ZOI-VAL-08 | IR | IR | oui | null | null | — |
| ZOI-VAL-09 | IR | IR | oui | INFLAM | null | — |
| ZOI-VAL-10 | IR | INFLAM | non | INFLAM | IR | **fix partiel GLP-1 + accepted** (`DISC-CASCADE`) |

**Concordance dominante exacte : 7/10 = 70 %.**  
**Concordance co-dominant** (présence + identité, `null` = none) : **5/10** (secondaire, hors matrice ci-dessous).

---

## 4. Matrice de confusion 4 × 4 (dominant)

Lignes = clinicien (référence). Colonnes = moteur.

| Clinicien \ Moteur | IR | INFLAM | DYSBIOSE | none | Total ligne |
|--------------------|----|--------|----------|------|-------------|
| IR | **2** | 1 | 0 | 0 | 3 |
| INFLAM | 1 | **2** | 0 | 0 | 3 |
| DYSBIOSE | 0 | 0 | **0** | 1 | 1 |
| none | 0 | 0 | 0 | **3** | 3 |
| **Total colonne** | **3** | **3** | **0** | **4** | **10** |

Hors-diagonale (3/10) :

| Cas | Clinicien → moteur | Lecture (LIV-26, sans jeu de seuil) |
|-----|--------------------|-------------------------------------|
| ZOI-VAL-02 | DYSBIOSE → none | Socle digestif absent (Bristol / ballonnements / calprotectine / SIBO). Soft signal insuffisant. |
| ZOI-VAL-03 | INFLAM → IR | Double déclenchement ; score IR 13 > INFLAM 11. Cascade spec à 2 bottlenecks. |
| ZOI-VAL-10 | IR → INFLAM | GLP-1 : IR se déclenche désormais (co-dom.) ; score INFLAM 15 > IR 9. |

Le moteur **ne predit jamais** DYSBIOSE dominant sur ce pack (colonne DYSBIOSE = 0).

---

## 5. Indicateurs par classe (dominant = *b* vs autre)

Binarisation LIV-24 §13.2. Clinicien = référence.

| Classe | TP | FN | FP | TN | Sensibilité | Spécificité | VPP | VPN |
|--------|----|----|----|----|-------------|-------------|-----|-----|
| IR | 2 | 1 | 1 | 6 | 2/3 (66,7 %) | 6/7 (85,7 %) | 2/3 (66,7 %) | 6/7 (85,7 %) |
| INFLAM | 2 | 1 | 1 | 6 | 2/3 (66,7 %) | 6/7 (85,7 %) | 2/3 (66,7 %) | 6/7 (85,7 %) |
| DYSBIOSE | 0 | 1 | 0 | 9 | 0/1 (0 %) | 9/9 (100 %) | **non défini** (dénominateur 0) | 9/10 (90,0 %) |
| none | 3 | 0 | 1 | 6 | 3/3 (100 %) | 6/7 (85,7 %) | 3/4 (75,0 %) | 6/6 (100 %) |

**VPP DYSBIOSE non définie** : aucun cas n'est prédit DYSBIOSE par le moteur (TP + FP = 0). Ce n'est pas un 0 % — la formule n'a pas de dénominateur.

Ces pourcentages **ne sont pas** une validation diagnostique de population.

---

## 6. Concordance globale et IC Wilson (optionnel)

| Indicateur | Valeur |
|------------|--------|
| Accords exacts | **7 / 10** |
| Proportion | **70,0 %** |
| Cible C1 (LIV-24 §14.2) | ≥ 80 % (8/10) — **non atteinte**, **non poursuivie** ici |
| IC Wilson 95 % | **39,7 % – 89,2 %** |

L'intervalle contient à la fois des valeurs inférieures à 50 % et la cible 80 %. Il illustre le **manque de puissance** de n=10, pas une fourchette opérationnelle.

Kappa de Cohen : non calculé (optionnel §13.2 ; peu informatif à n=10 avec strate DYSBIOSE incomplète).

---

## 7. Interprétation courte

1. **IR et INFLAM** se comportent de façon symétrique sur ce set : 2 vrais positifs chacun, un échange croisé (VAL-03 / VAL-10) lié à la **règle de score** quand deux bottlenecks sont déclenchés — pas à un bug d'interface restant.
2. **DYSBIOSE** n'est pas évaluable comme classe positive moteur. Un seul gold-standard (VAL-02), sans socle §6.1 saisi → FN + VPP indéfinie. La spécificité 100 % est tautologique (le moteur ne dit jamais DYSBIOSE).
3. **none** est bien reconnu (3/3) ; le seul FP est VAL-02 (clinicien DYSBIOSE, moteur none).
4. Le **70 %** est le taux attendu après LIV-26 (freeze `f8d0acc` puis correctifs d'interface PR #16). Aucun seuil HbA1c / HOMA / CRP n'a été déplacé pour ce livrable.
5. Ce document **ne clôture pas** le checkpoint « évidence clinique » : signatures CS (R7) et strate DYSBIOSE (R3 / §7.2) restent ouvertes.

---

## 8. Points ouverts

| Item | Action | Hors-scope LIV-27 |
|------|--------|-------------------|
| **2 dossiers DYSBIOSE** à primauté intestinale (socle Bristol / ballonnements / calprotectine / SIBO / ABX-IPP / fibres) | Compléter LIV-25 ; re-run LIV-26/27 | Ne pas imputer VAL-02 ; pas de fixture synthétique |
| **Revue / signature CS** (LIV-24 + LIV-26 + LIV-27) | Décision R / C, acceptation éventuelle de l'écart de strate | — |
| Cible C1 80 % | Revisitée **après** les 2 cas digestifs, pas par tweak de seuil | Interdit : déplacer HbA1c 5,4 → 5,7 pour VAL-03 |
| S2 (pertinence leviers) / S3 (sécurité) | Hors cette matrice | — |
| PDF par cas (critère roadmap json + PDF) | Encore ouvert (EXTRACTION_NOTES §6) | — |

---

## 9. Reproductibilité

Les totaux de ce fichier sont ceux de `npm run liv25:concordance` sur le SHA ci-dessus. Toute évolution du classifier ou des seeds doit **re-générer** la matrice ; on ne recopie pas des chiffres à la main sans re-run.
