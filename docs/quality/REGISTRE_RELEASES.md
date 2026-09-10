# Registre des releases logicielles (LIV-14)

> **Identifiant** : FC-REG-SW / LIV-14
> **Statut** : **Brouillon — signature humaine requise**
> **Généré le** : 2026-09-10
> **SHA** : `018a354`
> **Commande** : `npm run changelog:software`
> **Procédure** : [`LIV-14_REGISTRE_LOGICIEL.md`](LIV-14_REGISTRE_LOGICIEL.md)

Ce fichier est **écrasé** à chaque génération. Ne pas y coller de signatures : elles appartiennent à la procédure LIV-14 et aux tags annotés.

---

## 1. Releases logicielles (`vX.Y.Z`)

**Aucune.** Aucun tag `vX.Y.Z` n’existe sur ce dépôt à la date du snapshot. Il n’y a donc **pas** de version logicielle contrôlée au sens LIV-12 (gel + revue). Le `package.json` déclare `0.1.0` sans tag correspondant.

## 2. Gels documentaires (`liv-NN-vX.Y`)

**Aucun** tag de gel documentaire. Les livrables (LIV-24, pack LIV-25, etc.) existent sur `main` mais ne sont pas gelés par tag.

## 4. Pré-registre — merges récents (non contrôlés)

Historique git informatif. **Ce n’est pas** un registre de changements 13485 : pas de revue formelle, pas de tag, pas d’évaluation d’impact.

| Date | SHA | Sujet |
|------|-----|-------|
| 2026-09-10 | `018a354` | Merge pull request #17 from rafikg-del/cursor/liv27-concordance-matrix-2c0b |
| 2026-09-10 | `7cf9734` | Merge pull request #16 from rafikg-del/cursor/liv26-disagreement-fixes-dd6e |
| 2026-09-07 | `f8d0acc` | Merge pull request #14 from rafikg-del/cursor/liv25-anonymized-validation-pack-b61d |
| 2026-09-06 | `89102c5` | Merge pull request #13 from rafikg-del/cursor/clinical-validation-protocol-liv24-6ee0 |
| 2026-09-06 | `f0c6031` | Merge pull request #12 from rafikg-del/cursor/fix-ci-type-check-2998 |
| 2026-05-11 | `9219bfd` | Merge pull request #1 from rafikg-del/fix/classifier-apostrophe-syntax |

---

## 5. Comment enregistrer une release

```bash
# après revue PR + checklist LIV-14
git tag -a v0.2.0 -m "Functional Chef v0.2.0 — description de l’impact"
git push origin v0.2.0
npm run changelog:software
# committer REGISTRE_RELEASES.md sur une PR de registre
```

Le workflow GitHub `release-register.yml` (LIV-14) rappelle cette étape sur push de tag ; il **n’approuve pas** la release.
