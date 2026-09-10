# Pack qualité Phase 1 — Functional Chef

> **Statut du pack** : **Brouillon — signature humaine requise**
> **Date** : 2026-09-10
> **Périmètre** : système qualité minimal (ISO 13485 adapté logiciel) + maîtrise EBM + registre logiciel
> **Ne constitue pas** une certification, un marquage CE, ni une approbation CS / avocat / assureur / organisme notifié

Ce dossier rassemble les livrables **LIV-11 à LIV-17** et la matrice d’écart MDR autonome (LIV-02). Tous les documents sont des **brouillons contrôlés** destinés à une revue-signature humaine. Aucune case « approuvé » n’est pré-remplie.

## Index

| ID | Document | Fichier |
|----|----------|---------|
| LIV-11 | Manuel qualité v1.0 | [LIV-11_MANUEL_QUALITE.md](LIV-11_MANUEL_QUALITE.md) |
| LIV-12 | Procédure maîtrise des documents (GitHub) | [LIV-12_MAITRISE_DOCUMENTS.md](LIV-12_MAITRISE_DOCUMENTS.md) |
| LIV-13 | Non-conformités + CAPA | [LIV-13_NON_CONFORMITES_CAPA.md](LIV-13_NON_CONFORMITES_CAPA.md) |
| — | Template CAPA | [templates/CAPA.md](templates/CAPA.md) |
| LIV-14 | Procédure registre logiciel | [LIV-14_REGISTRE_LOGICIEL.md](LIV-14_REGISTRE_LOGICIEL.md) |
| — | Snapshot registre (généré) | [REGISTRE_RELEASES.md](REGISTRE_RELEASES.md) |
| LIV-15 | Ajout / modification levier culinaire | [LIV-15_PROCEDURE_LEVIER_CULINAIRE.md](LIV-15_PROCEDURE_LEVIER_CULINAIRE.md) |
| LIV-16 | Template fiche revue de levier | [LIV-16_FICHE_REVUE_LEVIER.md](LIV-16_FICHE_REVUE_LEVIER.md) |
| — | Fiches remplies (aucune à ce jour) | [reviews/](reviews/) |
| LIV-17 | Changelog EBM (généré depuis le seed) | [LIV-17_CHANGELOG_EBM.md](LIV-17_CHANGELOG_EBM.md) |
| LIV-02 | Matrice d’écart MDR (autonome) | [MDR_GAP_MATRIX.md](MDR_GAP_MATRIX.md) |

Go / No-Go Phase 2 : [`docs/PRODUCTION_READINESS.md`](../PRODUCTION_READINESS.md).

## Génération

```bash
npm run changelog:ebm        # LIV-17
npm run changelog:software   # LIV-14 snapshot
```

## Règle d’honnêteté

- Pas de PMID inventé, pas de signature fantôme, pas de « ✅ conforme » sans preuve dans le repo.
- Les tiers EBM du seed sont **auto-déclarés** jusqu’à revue CS (LIV-16 / LIV-21).
- Un document « v1.0 » ici signifie **version de brouillon**, pas « en vigueur ».
