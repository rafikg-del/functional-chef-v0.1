# LIV-26 — Note FR : désaccords de concordance (investigation)

> **Statut** : note technique, non signée CS, hors claim de performance (LIV-24 §15.2).  
> **Run** : `npm run liv25:concordance` — classifier réel + seed `03_biomarker_thresholds.sql`.  
> **Freeze de référence** : `f8d0acc` (7/10). Cette note documente les 3 désaccords et ce qui a (ou n’a pas) été corrigé.

## Synthèse

| | Dominant exact | Cible C1 |
|---|---|---|
| **Avant** (freeze LIV-25 / PR #15) | **7/10 = 70 %** | 80 % — non atteinte |
| **Après** (corrections justifiées uniquement) | **7/10 = 70 %** | inchangé — volontaire |

Aucun seuil numérique (HbA1c, HOMA, CRP, …) n’a été déplacé pour gonfler C1.

| Cas | Clinicien | Moteur avant | Moteur après | Verdict |
|-----|-----------|--------------|--------------|---------|
| ZOI-VAL-02 | DYSBIOSE | none | none | **needs more data** |
| ZOI-VAL-03 | INFLAM | IR (co-dom. INFLAM) | IR (co-dom. INFLAM) | **accepted** |
| ZOI-VAL-10 | IR (co-dom. INFLAM) | INFLAM (co-dom. null) | INFLAM (co-dom. **IR**) | **fix partiel + accepted** |

---

## ZOI-VAL-02 — needs more data

**Lecture.** Phénotype d’extraction « hub digestif / suspicion SIBO ». Soft signal `flatulences_excessives`. `data_completeness.DYSBIOSE = false`. Socle moteur vide : pas de Bristol, pas de fréquence de ballonnements, pas de calprotectine, pas de test SIBO.

**Règle DYSBIOSE** (spec §3 / classifier) : ≥2 majeurs cliniques (Bristol hors 3–5, ballonnements fréquents, calprotectine) **et** ≥1 aggravant historique. Les soft signals ne déclenchent pas.

**Pourquoi on n’enrichit pas le JSON.** `EXTRACTION_NOTES.md` §2 et §6 : signaux digestifs versés **uniquement s’ils sont chiffrés** ; Bristol / calprotectine / SIBO **non faits → absents**. Imputer un Bristol ou un `SIBO_BREATH=positive` serait inventer un labo / une fréquence — interdit (PHI-safe, mais faux dataset).

**Ce qui n’est pas un bug moteur.** Ferritine 6 / TSAT 7,8 (codes clinicien) sont une carence martiale, pas des critères DYSBIOSE. `OMEGA3_INDEX` 9,68 est dans la cible (pas d’alerte INFLAM).

**Suite.** Deux dossiers réels à primauté intestinale avec socle §6.1, ou un complément de saisie **source** (Bristol habituel, ballonnements/sem, SIBO si réellement fait). Pas de fixture synthétique (LIV-24 §7.2).

---

## ZOI-VAL-03 — accepted (cascade spec)

**Lecture.** Clinicien : INFLAM (CRP-us 3,33, AA/EPA 13,88, oméga, ApoB, homocystéine). Moteur : IR dominant, INFLAM co-dominant.

**IR déclenché (3 majeurs)** : HOMA-IR 1,55 (>1,5) + HbA1c 5,6 (>5,4 seed) + TG/HDL 1,69 (>1,5). Modérés : glycémie 0,96 (seuil seed 0,95) + ApoB 1,48. Score **13**.

**INFLAM déclenché** : CRP + AA/EPA (+ `OMEGA3_INDEX` 5,63 maintenant lu via alias `OMEGA_INDEX`). Score **11** (8 avant alias).

**Règle de dominance à 2** (spec ÉTAPE 2) : score le plus haut = dominant. 13 > 11 → IR. Ce n’est **pas** la cascade triple IR>INFLAM>DYSBIOSE ; DYSBIOSE n’est pas déclenché (`PLANT_DIVERSITY=0` = 1 modéré seul).

**Pourquoi on ne touche pas HbA1c.** Le seed alerte à >5,4 % (note « zone grise 5,4–5,6 ») alors que le tableau spec écrit gris 5,4–5,6 / alerte >5,7. Passer le seed à 5,7 ferait tomber IR à 2 majeurs + 2 modérés → non déclenché → INFLAM seul → C1 8/10. C’est un **tweak de seuil pour le label clinicien**, interdit ici. L’écart seed vs tableau spec reste un sujet d’audit (`BOTTLENECK_EVALUATION.md`), pas un levier LIV-26.

---

## ZOI-VAL-10 — fix partiel (flag GLP-1) + accepted (score)

**Avant.** `GLP1_ACTIVE` / `POST_BARIATRIC` hors classifier. HOMA 0,63 / insuline 4,17 écrasés. Seulement 2 majeurs IR (TG/HDL, PDFF) → IR non déclenché. INFLAM franc (CRP-us 11,14 + AA/EPA). Dominant INFLAM, co-dominant null.

**Fix moteur justifié.** Flag documenté ignoré = trou d’interface, pas un seuil. `GLP1_ACTIVE=positive|positif` compte comme **majeur de substitution** (HOMA/insuline non interprétables sous GLP-1). Seul, il ne déclenche pas IR. Ici : TG/HDL + PDFF + GLP-1 = 3 majeurs → **IR déclenché** (score 9), phénotype `hepatic_masld`.

**Reste accepted.** À 2 déclenchés, le score gagne : INFLAM **15** (CRP + oméga maintenant lu + AA/EPA + NLR + TSAT + homocystéine) > IR **9**. Dominant moteur = INFLAM, co-dominant = IR (inversé vs clinicien). Forcer IR dominant exigerait une règle ad hoc « GLP-1 ⇒ cascade IR » ou un bonus de points — hors spec, donc non fait.

`POST_BARIATRIC` reste un flag de **sécurité** (S3, non scoré ici), pas un critère IR.

---

## Corrections d’interface (hors C1)

| Correctif | Nature | Effet sur C1 |
|-----------|--------|--------------|
| Alias `OMEGA3_INDEX` ↔ `OMEGA_INDEX` (et Bristol/ballonnements/SIBO/fibres apparentés) | Bug de clé pack/protocole vs seed | Aucun dominant basculé |
| Équivalence catégorielle `positive` / `positif` | Bug FR/EN | — |
| `GLP1_ACTIVE` dans le catalogue + seuil IR | Flag documenté ignoré | VAL-10 : IR se déclenche ; dominant inchangé |
| Seuils HbA1c / glycémie / HOMA | **non modifiés** | — |
| JSON VAL-02 (Bristol / SIBO imputés) | **non fait** | — |

Discordance HOMA saisi vs HOMA recalculé (insuline µU/mL × glucose g/L, ~15 %) : caveat d’unités déjà noté à l’extraction (`pmol/L ÷ 6` vs facteur 6,945). Les JSON **n’ont pas été réécrits** ; aucun des 3 désaccords ne bascule si on recalcule.

---

## Reproductibilité

```bash
npm run liv25:concordance
npx tsx scripts/run-liv25-concordance.ts --json
```

Les champs moteur ne sont pas écrits dans les JSON cas (lock dataset LIV-25).
