# LIV-25 — Notes d'extraction

> Date de ces notes : 2026-09-06  
> Protocole de référence : LIV-24 v0.1  
> Canal : honest broker → fiches JSON (LIV-24 §9.3)

## 1. Source

Le pack anonymisé officiel est un **tarball gzip** du dossier `liv25/` :

```
liv25/cases/ZOI-VAL-01.json … ZOI-VAL-10.json
liv25/manifest.json
liv25/EXTRACTION_NOTES.md
```

Le payload BASE64 fourni a été décodé (`8169` octets). Le flux gzip est **tronqué** (`unexpected end of file`). Seul le préambule de `EXTRACTION_NOTES.md` (mapping fileId + tableau de stratification) a pu être lu de façon fiable. Les 10 JSON du tarball n'étaient pas récupérables.

Reconstruction : mêmes 10 synthèses APEX listées dans le préambule officiel du tarball. La table cas ↔ fileId source reste **hors repo** (LIV-24 §9). Aucun nom dans ce fichier ni dans les JSON.

| case_id | Phénotype d'extraction (sans identité) |
|---|---|
| ZOI-VAL-01 | Périménopause / inflammaging |
| ZOI-VAL-02 | Hub digestif / suspicion SIBO |
| ZOI-VAL-03 | Athérome polyvasculaire + hs-CRP |
| ZOI-VAL-04 | CRP élevée + boucle muqueuse / EBV |
| ZOI-VAL-05 | Allostatique ; discordance élastographie |
| ZOI-VAL-06 | Bicéphale athérome + ostéopénie masculine |
| ZOI-VAL-07 | Goulot comportemental sommeil / alcool |
| ZOI-VAL-08 | Bascule viscérale / IFG IR précoce |
| ZOI-VAL-09 | HOMA-IR franc + sécurité VHB |
| ZOI-VAL-10 | Alternatif : phénotype IR post-bariatrique / GLP-1 + CRP↑↑ |

Deux dossiers de la liste primaire officielle n'ont pas été versés (fit d'axe insuffisant pour un 3ᵉ IR ; doublon de VAL-04).

## 2. Méthode d'anonymisation

- Labs numériques → clés `biomarker_values` (snake uppercase Functional Chef).
- Insuline : pmol/L ÷ 6 → `FASTING_INSULIN` en µU/mL. Glycémie / TG : mg/dL → g/L.
- Signaux digestifs / mode de vie → `clinical_signals` **uniquement** si chiffrés dans la source (pas d'imputation Bristol / fréquence).
- `clinician_dominant` / `clinician_co_dominant` repris du préambule officiel du tarball (IR \| INFLAM \| DYSBIOSE \| none).
- Interdit dans le repo : nom, initiale, DOB, adresse, n° membre ZOI, n° accession labo, date civile, récit libre.

## 3. Stratification vs cibles LIV-24 §7.2

| Cible | Résultat |
|---|---|
| ≥3 IR dominant | **ATTEINT (3)** : VAL-08, VAL-09, VAL-10 |
| ≥3 INFLAM dominant | **ATTEINT (3)** : VAL-01, VAL-03, VAL-04 |
| ≥3 DYSBIOSE dominant | **NON ATTEINT (1)** : seul VAL-02 dominant ; VAL-01 et VAL-04 portent DYSBIOSE en co-dominant seulement |
| ≥1 co-dominant | **ATTEINT** : VAL-01, VAL-04, VAL-09, VAL-10 |
| ≥1 épreuve de sécurité | **ATTEINT (6)** : VAL-03, 04, 05, 06, 09, 10 |

### Rationale d'assignation (codes, pas de prose identifiant)

- **IR** : HOMA ≥ 3 (VAL-09) ; IFG + bascule androïde à HOMA encore proche de la norme (VAL-08) ; phénotype obésité / IR avec HOMA écrasé par GLP-1 (VAL-10), signalé dans `clinical_signals`.
- **INFLAM** : inflammaging / hs-CRP / AA:EPA comme bottleneck ou amplificateur primaire (VAL-01, 03, 04).
- **DYSBIOSE** : seul VAL-02 a un hub digestif / SIBO explicite parmi les synthèses disponibles.
- **none** : goulot allostatique / comportemental (VAL-05, VAL-07) ou bicéphale CV / os sans primauté IR–INFLAM–DYSBIOSE (VAL-06).

## 4. Écart DYSBIOSE 1/3 (NON ATTEINT)

Cible LIV-24 §7.2 : **≥ 3 cas à dominant DYSBIOSE**.

**Constat** : **1 cas / 3 requis**.

1. LIV-25 reste **partiel**. Le livrable roadmap n'est pas clos.
2. On **n'ajoute pas** de profil synthétique (`patient-profiles.ts` C1–C5, cas-pivot C).
3. Suite : screener au moins **deux dossiers réels à primauté intestinale** (socle §6.1 : ≥2 signaux parmi Bristol, ballonnements, calprotectine, SIBO, ABX/IPP, fibres / diversité végétale), hors MICI en poussée (E11).
4. Si le vivier ZOI/CS reste insuffisant : consigner l'écart, le CS décide (n<10, élargir la source, ou assouplir la strate) — LIV-24 §7.2.

## 5. Checklist PHI (avant `git add`)

- [x] Aucun nom, initiale, email, téléphone
- [x] Aucun NIR / IPP / n° dossier ZOI
- [x] Aucune date civile
- [x] Aucune ville / code postal
- [x] Aucun texte libre narratif
- [x] `case_id` au format `ZOI-VAL-0x`
- [x] Scan noms propres sur le diff

## 6. Hors périmètre (pack)

- Pas de PDF par cas (critère roadmap « json + PDF » encore ouvert).
- Unités non imputées : Bristol, calprotectine, test SIBO non faits → absents.
- Investigation LIV-26 (concordance, alias oméga, flag GLP-1) : [`LIV26_NOTE.md`](LIV26_NOTE.md). VAL-02 n'a **pas** été enrichi par imputation.
