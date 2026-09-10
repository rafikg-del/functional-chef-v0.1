# LIV-15 — Procédure d’ajout ou de modification d’un levier culinaire

> **Identifiant** : FC-SOP-EBM / LIV-15
> **Version** : 1.0 (brouillon)
> **Statut** : **Brouillon — signature humaine requise**
> **Date** : 2026-09-10
> **Critère roadmap** : tout changement de tier passe par rédaction → revue **≥ 1 médecin CS** → validation → déploiement
> **Template** : [LIV-16](LIV-16_FICHE_REVUE_LEVIER.md)
> **Registre** : [LIV-17](LIV-17_CHANGELOG_EBM.md)
> **Méthode** : [`docs/EBM_TIERING.md`](../EBM_TIERING.md)

---

## 1. Contrôle documentaire

### 1.1 Signatures (vacantes)

| Rôle | Nom | Date | Décision | Signature |
|------|-----|------|----------|-----------|
| Rédacteur | | | Brouillon soumis | |
| Membre CS | | | Approuvé / sous réserve / refusé | |
| Fabricant | | | Mise en application | |

**Blocage** : le CS n’est pas constitué (LIV-18..20). Cette procédure **ne peut pas être exécutée** pour un T1/T2 nouveau ou modifié tant que LIV-20 n’est pas réel. Les 63 leviers chargeables restent **auto-déclarés**.

---

## 2. Objet

Maîtriser le référentiel `culinary_levers` + `lever_bottleneck_map` : tout levier influe sur une proposition thérapeutique culinaire. Un PMID faux ou un T1 inflaté est une NC S2 (LIV-13).

---

## 3. Périmètre

| Inclus | Exclu |
|--------|--------|
| INSERT/UPDATE seed `04` / `05` | Textes marketing sans impact seed |
| Changement `ebm_tier`, `pubmed_ids`, CI, dose, `active` | Refactor code lever-selector sans changer les données |
| Mapping bottleneck × tier | Fixtures de tests synthétiques |
| Désactivation d’un levier | Tuples SQL orphelins du seed 04 (hors INSERT) — **ne pas les activer** via cette SOP tant que le schéma CHECK catégorie n’est pas étendu |

Les identifiants orphelins listés en LIV-17 §8 (suppléments, lifestyle, etc.) **ne sont pas** dans le moteur. Les faire entrer exige : schéma, INSERT valide, **et** cette procédure (pas un collage de tuple).

---

## 4. Garde-fous (non négociables)

1. **Pas de T1 sans signature CS** sur une fiche LIV-16 — engagement [`EBM_TIERING.md`](../EBM_TIERING.md). **Aujourd’hui : 0/63.**
2. **Pas de PMID inventé.** Si la référence n’a pas de PMID vérifié : laisser `NULL` et le dire (ex. `L_REDUCE_FREE_SUGAR_10PCT`).
3. **Pas d’inflation** mécanistique → T1 (bouillon d’os reste T3 tant que la littérature humaine ne change pas).
4. Un levier **sans** `primary_reference` n’entre pas.
5. Les PMIDs encore flaggés par [`PMIDS_AUDIT.md`](../PMIDS_AUDIT.md) (`19465743` légumineuses, `27259976` curcuma) **ne sont pas « réparés »** dans cette SOP par substitution fantaisiste : ouvrir NC + recherche documentée.

---

## 5. Types de changement

| Type | Exemples | Reviewers | Tag logiciel |
|------|----------|-----------|--------------|
| **A — Éditorial** | Typo nom FR, clarification précaution sans changer le sens | 1 reviewer repo | Non |
| **B — Donnée clinique mineure** | Précision de dose, ajout précaution, PMID **additionnel vérifié** sans changer le tier | 1 CS **ou** reporté si CS absent (alors **interdire** le merge T1/T2) | Selon LIV-14 si seed en prod |
| **C — Tier ou mapping** | T2→T1, T1→T2, ajout bottleneck, star universelle | **≥ 1 médecin CS** (2 si T1 nouveau) | Oui `vX.Y.Z` |
| **D — Nouveau levier** | LIV-47 → INSERT | CS obligatoire avant `active=true` en usage réel | Oui |
| **E — Retrait / `active=false`** | Sécurité, PMID rétracté | Fabricant + CS si T1 | Oui (hotfix possible S1) |

En l’absence de CS : seuls les types **A** et **E-S1** (désactivation de sécurité) sont autorisés sur `main`.

---

## 6. Circuit (type C/D)

```
1. Issue GitHub `lever-change` (ID, hypothese de tier, PMIDs)
2. Copier LIV-16 → docs/quality/reviews/LIV-16-<ID>-<YYYYMMDD>.md
3. Vérifier chaque PMID (PubMed : titre = référence déclarée)
4. PR : seed 04/05 + fiche LIV-16 (signatures encore vides)
5. Review code (intégrité SQL, CHECK category, mapping)
6. Review CS : remplir LIV-16 (tier proposé vs validé)
7. Merge
8. npm run changelog:ebm  (journal §9 LIV-17)
9. Tag selon LIV-14 si usage praticien
```

Le générateur LIV-17 **écrase** le snapshot §6 : après merge, re-générer et relire les écarts audit.

---

## 7. Critères d’entrée d’un nouveau levier

Reprise LIV-47 / EBM_TIERING :

1. Mécanisme physiopathologique identifiable
2. Au moins une référence pivot (PMID si elle existe)
3. Applicable en contexte **culinaire** (un supplément isolé sort du CHECK actuel et du positionnement produit)
4. ≥ 1 bottleneck mappé
5. Contre-indications listées ou `NULL` justifié
6. Fiche LIV-16

---

## 8. Réévaluation

Cible : 100 % du référentiel chargeable **tous les 6 mois** (EBM_TIERING). Déclencher plus tôt si :

- rétractation / erratum majeur
- signalement praticien
- CAPA S1/S2
- nouvelle méta-analyse qui change le palier T1/T2/T3

---

## 9. Traçabilité consultations passées

Si un badge T1 est rétrogradé : noter dans CAPA si les consultations déjà validées doivent être notifiées (hors automation actuelle). **Aucun mécanisme de notification n’est implémenté.**

---

## 10. Disclaimer

Exécuter le circuit sans CS et merger un T1 « validé » serait une **falsification d’enregistrement**. L’état réel est dans LIV-17 : revue CS = **non** pour chaque levier.
