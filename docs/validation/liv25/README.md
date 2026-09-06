# LIV-25 — Pack de validation clinique anonymisé (n=10)

> **Livrable** : LIV-25 — 10 cas ZOI / CS, format JSON structuré  
> **Protocole** : [`docs/CLINICAL_VALIDATION_PROTOCOL.md`](../../CLINICAL_VALIDATION_PROTOCOL.md) (LIV-24)  
> **Roadmap** : [`docs/PHASE1_ROADMAP.md`](../../PHASE1_ROADMAP.md) § J63-J92  
> **Statut** : **Pack partiel** — stratum DYSBIOSE dominant **NON ATTEINT (1/3)**

## Qu'est-ce que LIV-25 ?

LIV-25 est le **set clinique réel** du protocole LIV-24 : dix dossiers issus du réseau ZOI Analyse Patient et/ou de la patientèle du comité scientifique, **anonymisés**, destinés à mesurer la concordance entre le classifier Functional Chef et le jugement clinicien (LIV-26 / LIV-27).

Ce n'est **pas** le corpus synthétique (`patient-profiles.ts`, cas-pivot A/B/C, `test-validation-cases.ts`). Les deux jeux ne se mélangent jamais.

Identifiants : `ZOI-VAL-01` … `ZOI-VAL-10`.

## Règles PHI

Rien dans ce dossier (JSON, manifeste, notes) ne doit contenir de **PHI** :

- pas de nom, initiale, contact, NIR, IPP, n° dossier ZOI ;
- pas de date civile (utiliser `age_band` / `t0_offset_days`) ;
- pas de ville, code postal, récit en texte libre, photo ;
- pas de quasi-identifiant de maladie rare.

Les valeurs biologiques nécessaires à la classification sont autorisées **uniquement** dans les fiches JSON contrôlées. La table de correspondance cas ↔ dossier source reste hors repo. Voir LIV-24 §9.

## Stratification (cible LIV-24 §7.2)

| Strate (jugement clinicien) | Cible | Statut de ce pack |
|-----------------------------|-------|-------------------|
| Dominant IR | ≥ 3 | À confirmer à la livraison des JSON |
| Dominant INFLAM | ≥ 3 | À confirmer à la livraison des JSON |
| **Dominant DYSBIOSE** | **≥ 3** | **NON ATTEINT — 1/3** |
| Co-dominance | ≥ 1 | À confirmer |
| Épreuve de sécurité | ≥ 1 | À confirmer |

**Écart connu** : un seul cas à dominant digestif (DYSBIOSE 1/3). Le pack est un **LIV-25 partiel** en attendant au moins deux dossiers supplémentaires à primauté intestinale. On ne complète **pas** avec un fixture synthétique.

Détail : [`EXTRACTION_NOTES.md`](EXTRACTION_NOTES.md) · inventaire : [`manifest.json`](manifest.json).

## Contenu attendu

```
docs/validation/liv25/
  README.md
  EXTRACTION_NOTES.md
  manifest.json
  cases/ZOI-VAL-01.json … ZOI-VAL-10.json
```

Les fiches `cases/*.json` ne sont versées que depuis le tarball anonymisé officiel (ou la liste fichier équivalente). **Aucun cas n'est inventé.**
