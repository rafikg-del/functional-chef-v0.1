# LIV-25 — Notes d'extraction

> Date de ces notes : 2026-09-06  
> Protocole de référence : LIV-24 v0.1  
> Canal : honest broker → fiches JSON (LIV-24 §9.3)

## 1. Source prévue

Le pack anonymisé officiel est un **tarball gzip** du dossier `liv25/` :

```
liv25/cases/ZOI-VAL-01.json … ZOI-VAL-10.json
liv25/manifest.json
liv25/EXTRACTION_NOTES.md
```

Décodage attendu :

```bash
echo '<BASE64>' | base64 -d > /tmp/liv25.tgz && tar xzf /tmp/liv25.tgz -C /tmp
cp -r /tmp/liv25/* docs/validation/liv25/
```

## 2. État de la livraison dans ce commit

| Artefact | Statut |
|----------|--------|
| Tarball / payload BASE64 dans le message d'agent | **Absent** (marqueurs `BASE64_START` / `BASE64_END` vides ; pas de section JSON de secours) |
| File list + JSON individuels (approche de repli) | **Non reçus** |
| `cases/ZOI-VAL-01.json` … `ZOI-VAL-10.json` | **Non versés** — interdiction d'inventer des cas ou de la PHI |
| `manifest.json` / ce fichier / `README.md` | Présents — cadre + écarts |

Aucune fiche n'a été reconstruite à partir de dossiers nominatifs (Drive, decks ZOI, synthèses APEX). Extraire depuis ces sources vers un dépôt public reconstituerait de la PHI.

Dès que le tarball ou la liste fichier officielle est fournie, les 10 JSON se copient tels quels dans `cases/` sans réécriture clinique.

## 3. Écart de stratification — DYSBIOSE 1/3 (NON ATTEINT)

Cible LIV-24 §7.2 : **≥ 3 cas à dominant DYSBIOSE** (jugement clinicien).

**Constat du brief d'extraction** : **1 cas / 3 requis**.

Conséquences :

1. LIV-25 est **partiel**. Il ne clôture pas le livrable roadmap tant que le stratum digestif n'est pas rempli.
2. On **n'ajoute pas** de profil synthétique (cas-pivot C, `C1`–`C5` de `patient-profiles.ts`) pour « faire le compte ».
3. Suite : screener au moins **deux dossiers supplémentaires à primauté intestinale** (socle LIV-24 §6.1 : ≥2 signaux parmi Bristol, ballonnements, calprotectine, SIBO, ABX/IPP, fibres / diversité végétale), hors MICI en poussée (E11).
4. Si le vivier ZOI/CS reste insuffisant après screening exhaustif : consigner l'écart, le CS décide (clôturer à n<10, élargir la source, ou assouplir la strate) — LIV-24 §7.2.

Les autres strates obligatoires (IR ≥3, INFLAM ≥3, co-dominance ≥1, épreuve de sécurité ≥1) seront cochées **uniquement** après dépôt des JSON officiels. Elles ne sont pas inventées ici.

## 4. Checklist PHI (avant tout `git add` des JSON)

- [ ] Aucun nom, initiale, email, téléphone
- [ ] Aucun NIR / IPP / n° dossier ZOI
- [ ] Aucune date civile
- [ ] Aucune ville / code postal
- [ ] Aucun texte libre narratif
- [ ] `case_id` au format `ZOI-VAL-0x`
- [ ] Scan noms propres sur le diff

## 5. Hors périmètre

- Pas de modification du runtime (`bottleneck-classifier.ts`, seeds, UI).
- Pas de run moteur (LIV-26) tant que le set n'est pas locké et que LIV-24 n'est pas approuvé CS.
- Pas de PDF par cas dans ce commit (le critère roadmap « json + PDF » reste ouvert).
