# LIV-14 — Procédure registre des modifications logicielles

> **Identifiant** : FC-SOP-SW / LIV-14
> **Version** : 1.0 (brouillon)
> **Statut** : **Brouillon — signature humaine requise**
> **Date** : 2026-09-10
> **Nice-to-have Phase 1** (roadmap) — implémentation **légère** : script + workflow tag, pas un outil ALM
> **Snapshot généré** : [REGISTRE_RELEASES.md](REGISTRE_RELEASES.md)
> **Script** : `scripts/generate-software-changelog.ts` (`npm run changelog:software`)
> **CI** : `.github/workflows/release-register.yml`

---

## 1. Contrôle documentaire

### 1.1 Signatures (vacantes)

| Rôle | Nom | Date | Décision | Signature |
|------|-----|------|----------|-----------|
| Rédacteur | | | Brouillon soumis | |
| Responsable technique | | | Approuvé / sous réserve | |
| Fabricant | | | Mise en application | |

---

## 2. Objet

Relier **chaque version logicielle mise à disposition** à :

- un tag git annoté
- un SHA
- une description d’impact (clinique / sécurité / EBM / doc)
- la preuve de tests (CI du commit tagué)

Ce n’est **pas** un historique marketing. Le journal git brut n’est pas un registre 13485.

---

## 3. Convention de tags

| Tag | Usage |
|-----|--------|
| `vX.Y.Z` | Release logicielle (moteur, UI, migrations) |
| `liv-NN-vX.Y` | Gel d’un livrable documentaire (ex. protocole LIV-24) |

État actuel : **aucun tag** — `package.json` indique `0.1.0` **sans** `v0.1.0`. Voir le snapshot.

---

## 4. Quand taguer une release logicielle

Obligatoire si au moins un des changements suivants part sur un environnement où un praticien pourrait l’utiliser :

- classifier / safety-filters / lever-selector
- seeds `culinary_levers` ou `biomarker_thresholds`
- RLS, auth, audit
- prompts LLM de composition
- information utilisateur (FAQ, notice, privacy)

Simple doc typo : pas de tag `v*`.

---

## 5. Checklist avant `git tag -a vX.Y.Z`

1. PR mergée sur `main` après review humaine
2. CI verte sur le SHA (`Test` workflow, LIV-43)
3. Si levier / tier : LIV-15 respectée
4. Si NC ouverte S1/S2 : containment documenté (LIV-13)
5. Message de tag : impact en français, 5–15 lignes, **sans** claim de performance clinique
6. `git push origin vX.Y.Z`
7. `npm run changelog:software` puis PR mettant à jour `REGISTRE_RELEASES.md` (LIV-12)

Le workflow `release-register.yml` **régénère le fichier dans le job CI ; il ne le committe pas et ne signe pas**.

---

## 6. Contenu du registre (généré)

Le script liste :

1. Tags `vX.Y.Z`
2. Tags `liv-NN-vX.Y`
3. Autres tags (hors convention)
4. Merges récents comme **pré-registre non contrôlé**

Interdit : ajouter des lignes « Release 0.2 approuvée par … » à la main dans le snapshot. Les signatures vivent dans **cette** procédure et dans le message du tag annoté.

---

## 7. Notes CI (LIV-14 soft)

| Fichier | Rôle |
|---------|------|
| `.github/workflows/test.yml` | Vérification à chaque PR/push `main` — **pas** un registre |
| `.github/workflows/release-register.yml` | Rappel + génération sur **push de tag** |

Limites assumées (honnêtes) :

- pas de publication automatique GitHub Release
- pas d’attache des artefacts de tests au tag
- pas de SBOM / signature cosign
- `fetch-depth: 0` requis pour lister l’historique des tags

---

## 8. Lien git log → registre

```bash
git tag -a v0.2.0 -m "…"
git push origin v0.2.0
npm run changelog:software
```

Le SHA du tag est la clé d’audit. `engine_version` en base (colonne consultations) **devrait** reprendre ce tag ; ce n’est **pas** branché à ce jour (écart LIV-36 / LIV-05).

---

## 9. Disclaimer

En l’absence de tags, **il n’existe pas de version logicielle contrôlée**. Utiliser `main` mobile pour une beta clinique violerait cette procédure une fois en vigueur.
